import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['flashcard_review', 'quiz_completed', 'sheet_read', 'course_added', 'login']
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, { timestamps: true });

// Index composé pour les requêtes de heatmap
activitySchema.index({ user_id: 1, date: -1 });
activitySchema.index({ user_id: 1, type: 1, date: -1 });

export default mongoose.model("Activity", activitySchema);
