const Conversation = require("../models/Conversation");
const generateEmbedding = require("../services/embeddingService");
const { retrieveContext } = require("../services/ragService");
const { generateResponse } = require("../services/llmService");
const mongoose = require("mongoose");

// Extract tags from AI response
function extractTags(aiResponse, userMessage, category) {
  const tags = [];

  // Add category as tag
  if (category) {
    tags.push(category);
  }

  // Extract hashtags from response
  const hashtagMatches = aiResponse.match(/#\w+/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(tag => tag.slice(1).toLowerCase()));
  }

  // Extract keywords from context (common business terms)
  const keywords = ['discount', 'refund', 'pricing', 'customer', 'urgent', 'priority', 'policy', 'risk', 'profit', 'margin'];
  keywords.forEach(keyword => {
    if (aiResponse.toLowerCase().includes(keyword) || userMessage.toLowerCase().includes(keyword)) {
      tags.push(keyword);
    }
  });

  // Remove duplicates and limit to 10 tags
  return [...new Set(tags)].slice(0, 10);
}

const chat = async (req, res) => {
  try {
    const { userId, message, category } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Step 1: Generate embedding for user message
    const embedding = await generateEmbedding(message);

    // Step 2: Retrieve relevant context
    const ragResult = await retrieveContext(userId, message, category, 3);

    // Step 3: Generate response using Gemini
    const llmResult = await generateResponse(ragResult.context, message);

    if (!llmResult.success) {
      return res.status(500).json({ error: llmResult.error });
    }

    // Step 4: Extract tags from AI response
    const tags = extractTags(llmResult.response, message, category);

    // Step 5: Save conversation to database with tags
    const conversation = await Conversation.create({
      userId: userObjectId,
      userMessage: message,
      aiResponse: llmResult.response,
      category: category || "general",
      tags,
      embedding,
      outcome: {
        successScore: 0.5
      }
    });

    res.json({
      success: true,
      conversationId: conversation._id,
      userMessage: message,
      aiResponse: llmResult.response,
      tags: tags,
      relevantContext: ragResult.relevantCount,
      topRelevance: (ragResult.topScore * 100).toFixed(1) + "%",
      fallback: llmResult.fallback || false
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed", details: err.message });
  }
};

module.exports = { chat };