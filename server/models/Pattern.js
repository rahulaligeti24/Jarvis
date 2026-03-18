const mongoose = require("mongoose");

const patternSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: String,
    tags: [String],
    category: String,
    
    // Pattern metrics
    count: {
      type: Number,
      default: 1
    },
    
    successScore: {
      type: Number,
      default: 0.5
    },
    
    // Related conversations
    conversationIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation"
      }
    ],
    
    // Related learnings
    learningIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Learning"
      }
    ],
    
    lastOccurred: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

patternSchema.index({ userId: 1, tags: 1 });
patternSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("Pattern", patternSchema);