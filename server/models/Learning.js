const mongoose = require("mongoose");

const learningSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    category: {
      type: String,
      enum: ["pricing", "customer-service", "product", "general", "operations"],
      required: true,
      index: true
    },
    // Core tags that define this learning
    tags: {
      type: [String],
      required: true,
      index: true
    },
    // Conversations that helped form this learning
    conversationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
      }
    ],
    // Aggregated knowledge from conversations
    summary: String,
    
    // Pattern insights
    patterns: {
      frequency: Number, // How many times this pattern appeared
      successRate: Number, // Average success score
      averageOutcome: Number
    },
    
    // Track when this learning was updated
    lastUpdated: {
      type: Date,
      default: Date.now
    },
    
    // Confidence score (0-1) based on data
    confidence: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1
    }
  },
  { timestamps: true }
);

// Index for finding learnings by userId and tags
learningSchema.index({ userId: 1, tags: 1 });
learningSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Learning", learningSchema);