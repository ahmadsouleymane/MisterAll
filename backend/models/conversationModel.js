import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 10000
  },
  contextUsed: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    assetType: { type: String, enum: ["resume", "sheet", "quiz", "flashcard", "content"] }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const conversationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      default: "Nouvelle conversation",
      maxLength: 100
    },
    messages: [messageSchema],
    relatedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
    isArchived: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Index pour requêtes efficaces
conversationSchema.index({ user_id: 1, updatedAt: -1 });
conversationSchema.index({ user_id: 1, isArchived: 1 });

export default mongoose.model("Conversation", conversationSchema);
