import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
    {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        interval: { type: Number, default: 1 },           // jours avant prochaine révision
        easeFactor: { type: Number, default: 2.5 },       // facteur de facilité SM-2
        repetitions: { type: Number, default: 0 },        // nombre de révisions réussies consécutives
        nextReviewDate: { type: Date, default: Date.now },
        lastReviewedAt: { type: Date, default: null },
        isPremiumOnly: { type: Boolean, default: false }  // Premium gating
    }
)

const quizSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["qcm", "vraiFaux", "completion", "ordre"],
            default: "qcm"
        },
        quiz: { type: String },
        answers: { type: Array },
        goodAnswer: { type: String },
        isDone: { type: Boolean, default: false },
        explanation: { type: String },
        difficulty: {
            type: String,
            enum: ["facile", "moyen", "difficile"],
            default: "moyen"
        },
        isPremiumOnly: { type: Boolean, default: false }  // Premium gating
    }
)

const sheetSchema = new mongoose.Schema(
    {
        title: { type: String },
        content: { type: String },
        quizs: [quizSchema, {required: true}],
        score: { type: Number, default: 0},
        status: { type: String, default: "A réviser"},
        isPremiumOnly: { type: Boolean, default: false }  // Premium gating
    }
)

const courseAssetsSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true, index: true },
        course_id: { type: String, required: true },
        resume: {type: String, default: ""},
        sheets: [sheetSchema],
        allQuizs: [quizSchema],
        flashcards: [flashcardSchema],
        TotalScore: { type: Number, default: 0},
        status: {
            type: String,
            enum: ["processing", "completed", "failed"],
            default: "processing"
        },
        currentStage: {
            type: String,
            enum: ["extracting", "generating_summary", "generating_sheets", "generating_quizzes", "generating_flashcards", "validating", "completed"],
            default: "extracting"
        },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        error: { type: String, default: null },
        generationTime: { type: String, default: null },
        qualityMetrics: {
            summaryScore: { type: Number, default: 0 },
            sheetsScore: { type: Number, default: 0 },
            quizzesScore: { type: Number, default: 0 },
            overall: { type: Number, default: 0 }
        },
        modelUsed: { type: String, default: "llama-3.3-70b-versatile" },
    },
    { timestamps: true }
);

// Index composé pour les requêtes fréquentes
courseAssetsSchema.index({ user_id: 1, status: 1 });
courseAssetsSchema.index({ course_id: 1 }, { unique: true });

export default mongoose.model("CourseAssets", courseAssetsSchema);
