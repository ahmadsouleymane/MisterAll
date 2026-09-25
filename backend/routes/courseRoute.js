import express from "express";
import crypto from "crypto";
import {
  getUserCourses,
  updateCourse,
  deleteCourse,
  addCourse,
  getCourse,
  getCourseAssets,
  regenerateCourseAssets,
  downloadCourseAssets,
} from "../controllers/courseController.js";
import {
  getDueFlashcards,
  getCourseFlashcards,
  reviewFlashcard,
  getFlashcardStats,
  exportFlashcardsPDF,
} from "../controllers/flashcardController.js";
import { getCoursesWithAssets } from "../controllers/statsController.js";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middlewares/auth.js";
import { aiLimiter, uploadLimiter, crudLimiter } from "../middlewares/rateLimiter.js";
import { updateQuizScore } from "../controllers/courseAssetsController.js";

const router = express.Router();

// config multer avec sécurité renforcée
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Utiliser UUID pour éviter les attaques path traversal
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = ['.pdf', '.docx', '.doc'];
    const safeExt = allowedExtensions.includes(ext) ? ext : '.pdf';
    const uniqueName = crypto.randomUUID() + safeExt;
    cb(null, uniqueName);
  },
});

// Validation stricte des fichiers
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls les PDF et DOCX sont acceptés.'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

// Upload + ajout cours (avec rate limiting upload + AI)
router.post("/add", upload.single("attachment"), authMiddleware, uploadLimiter, aiLimiter, addCourse);

// Route optimisée - retourne cours + assets + stats en une requête
router.get("/all", authMiddleware, getCoursesWithAssets);

// Routes CRUD avec rate limiting
router.get("/get", authMiddleware, getUserCourses);
router.patch("/update/:id", authMiddleware, crudLimiter, updateCourse);
router.delete("/delete/:id", authMiddleware, crudLimiter, deleteCourse);
router.get("/get/:id", authMiddleware, getCourse);
router.get("/assets/:id", authMiddleware, getCourseAssets);
router.get("/assets/:id/download/:type", authMiddleware, downloadCourseAssets);
router.post("/regenerate/:id", authMiddleware, aiLimiter, regenerateCourseAssets);
router.patch("/assets/sheet/score-update", authMiddleware, crudLimiter, updateQuizScore);

// Flashcards routes
router.get("/flashcards/due", authMiddleware, getDueFlashcards);
router.get("/flashcards/stats", authMiddleware, getFlashcardStats);
router.get("/flashcards/:courseId", authMiddleware, getCourseFlashcards);
router.get("/flashcards/:courseId/pdf", authMiddleware, exportFlashcardsPDF);
router.patch("/flashcards/review", authMiddleware, reviewFlashcard);

export default router;
