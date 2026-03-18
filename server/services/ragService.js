const Conversation = require("../models/Conversation");
const generateEmbedding = require("./embeddingService");
const mongoose = require("mongoose");

// Cosine similarity with normalized vectors
function cosineSimilarity(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length === 0 || vec2.length === 0) return 0;
  if (vec1.length !== vec2.length) return 0;
  
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  return dotProduct;
}

// Weighted ranking: semantic similarity + success outcome
function rankConversations(conversations, queryEmbedding, similarityWeight = 0.7) {
  return conversations
    .map(conv => ({
      ...conv,
      similarity: cosineSimilarity(queryEmbedding, conv.embedding || []),
      successScore: conv.outcome?.successScore || 0.5,
      combinedScore: 
        (cosineSimilarity(queryEmbedding, conv.embedding || []) * similarityWeight) +
        ((conv.outcome?.successScore || 0.5) * (1 - similarityWeight))
    }))
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

// Retrieve relevant conversations for RAG
const retrieveContext = async (userId, query, category = null, topK = 3) => {
  try {
    if (!userId) throw new Error("userId is required");

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return {
        success: false,
        context: "",
        relevantCount: 0,
        topScore: 0,
        error: "Invalid userId format"
      };
    }

    // Convert to ObjectId
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Build filter
    const filter = { userId: userObjectId, embedding: { $exists: true, $ne: null } };
    if (category) {
      filter.category = category;
    }

    // Retrieve conversations
    const conversations = await Conversation.find(filter).lean();

    if (conversations.length === 0) {
      return {
        success: true,
        context: "",
        relevantCount: 0,
        topScore: 0
      };
    }

    // Rank conversations
    const ranked = rankConversations(conversations, queryEmbedding);
    const topResults = ranked.slice(0, topK);

    // Build context string
    const context = topResults
      .map((conv, idx) => 
        `[${idx + 1}] Category: ${conv.category || "N/A"}\n` +
        `Q: ${conv.userMessage}\n` +
        `A: ${conv.aiResponse}\n` +
        `Relevance: ${(conv.similarity * 100).toFixed(1)}%`
      )
      .join("\n---\n");

    return {
      success: true,
      context,
      relevantCount: topResults.length,
      topScore: topResults[0]?.similarity || 0,
      allResults: topResults
    };
  } catch (err) {
    console.error("Context retrieval failed:", err);
    return {
      success: false,
      context: "",
      relevantCount: 0,
      topScore: 0,
      error: err.message
    };
  }
};

module.exports = { retrieveContext, cosineSimilarity };