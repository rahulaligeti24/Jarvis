const express = require("express");
const router = express.Router();
const Conversation = require("../models/Conversation");
const generateEmbedding = require("../services/embeddingService");
const { retrieveContext, cosineSimilarity } = require("../services/ragService");

router.get("/seed", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Generate embeddings for seed data
    const seedData = [
      {
        userMessage: "Should I give discount?",
        aiResponse: "Consider competitor pricing and profit margins.",
        category: "pricing"
      },
      {
        userMessage: "Client asking for refund",
        aiResponse: "Check return policy first.",
        category: "customer-service"
      },
      {
        userMessage: "How to handle urgent orders?",
        aiResponse: "Prioritize based on payment status and delivery timeline.",
        category: "product"
      }
    ];

    const conversationsWithEmbeddings = await Promise.all(
      seedData.map(async (data) => {
        const embedding = await generateEmbedding(data.userMessage);
        console.log(`Embedding dimension for "${data.userMessage}": ${embedding.length}`);
        
        return {
          userId,
          userMessage: data.userMessage,
          aiResponse: data.aiResponse,
          category: data.category,
          embedding: embedding,
          outcome: { successScore: 0.8 }
        };
      })
    );

    await Conversation.insertMany(conversationsWithEmbeddings);

    res.json({ 
      message: "Seeding completed", 
      count: conversationsWithEmbeddings.length,
      embeddingDim: conversationsWithEmbeddings[0].embedding.length
    });
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).json({ error: "Seeding failed", details: err.message });
  }
});

router.get("/rag-test", async (req, res) => {
  try {
    const { userId, message } = req.query;

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    const result = await retrieveContext(userId, message, null, 3);

    res.json(result);
  } catch (err) {
    console.error("RAG test error:", err);
    res.status(500).json({ error: "RAG test failed", details: err.message });
  }
});

router.get("/rag-context", async (req, res) => {
  try {
    const { userId, message, category } = req.query;

    if (!userId || !message) {
      return res.status(400).json({ error: "userId and message are required" });
    }

    const result = await retrieveContext(userId, message, category, 5);

    res.json(result);
  } catch (err) {
    console.error("RAG context error:", err);
    res.status(500).json({ error: "Failed to get context", details: err.message });
  }
});

module.exports = router;