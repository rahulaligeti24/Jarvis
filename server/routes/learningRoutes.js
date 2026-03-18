const express = require("express");
const router = express.Router();
const Learning = require("../models/Learning");
const authMiddleware = require("../middleware/auth");

// Get all learnings for user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category, tags } = req.query;

    const filter = { userId };
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(",") };

    const learnings = await Learning.find(filter)
      .populate("conversationIds", "userMessage aiResponse createdAt tags")
      .sort({ confidence: -1 });

    res.json({
      success: true,
      count: learnings.length,
      learnings
    });
  } catch (err) {
    console.error("Error fetching learnings:", err);
    res.status(500).json({ error: "Failed to fetch learnings", details: err.message });
  }
});

// Get learning by ID with all related conversations
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const learning = await Learning.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate("conversationIds");

    if (!learning) {
      return res.status(404).json({ error: "Learning not found" });
    }

    res.json({
      success: true,
      learning,
      totalConversations: learning.conversationIds.length
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch learning", details: err.message });
  }
});

module.exports = router;