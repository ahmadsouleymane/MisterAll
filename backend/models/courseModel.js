import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    attachment: { type: String, required: true},
    user_id: { type: String, required: true, index: true },
    courseAssets_id: { type: String },
    content: { type: String }, // Contenu extrait du fichier (PDF/DOCX)
    // Sharing fields
    isShared: { type: Boolean, default: false, index: true },
    shareToken: { type: String, unique: true, sparse: true, index: true },
    shareCreatedAt: { type: Date },
    shareViewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index composé pour les requêtes fréquentes
courseSchema.index({ user_id: 1, createdAt: -1 });

export default mongoose.model("Course", courseSchema);
