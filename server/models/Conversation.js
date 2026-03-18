const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: true,
      index: true
    },
    userMessage: {
      type: String,
      required: true
    },
    aiResponse: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["pricing", "customer-service", "product", "general", "operations"],
      default: "general",
      index: true
    },
    decisionType: String,
    tags: {
      type: [String],
      index: true
    },
    embedding: {
      type: [Number],
      default: null
    },
    // Link to Learning object if added to a learning
    learningId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Learning",
      default: null
    },
    outcome: {
      successScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5
      },
      feedback: String,
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  { timestamps: true }
);

// Compound indexes for efficient retrieval
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, category: 1 });
conversationSchema.index({ userId: 1, tags: 1 });
conversationSchema.index({ userId: 1, learningId: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);