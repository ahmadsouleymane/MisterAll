import fs from "fs/promises";
import path from "path";
import CourseModel from "../models/courseModel.js";
import UserModel from "../models/userModel.js";
import courseAssetsModel from "../models/courseAssetsModel.js";
import { generateAllAssets } from "./aiController.langchain.js";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

// Constantes de validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// Fonction pour extraire le texte d'un PDF
const extractTextFromPDF = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      const pages = pdfData?.Pages || [];
      let text = "";

      pages.forEach((page) => {
        if (page.Texts) {
          page.Texts.forEach((item) => {
            if (item.R && item.R[0] && item.R[0].T) {
              try {
                // Essayer de décoder, sinon fallback sur le texte brut
                text += decodeURIComponent(item.R[0].T) + " ";
              } catch (e) {
                text += item.R[0].T + " ";
              }
            }
          });
        }
      });

      // Nettoyer le texte : supprimer les lignes vides et trim
      text = text
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l)
        .join("\n");

      resolve(text);
    });

    pdfParser.loadPDF(filePath);
  });
};

// Helper pour nettoyer le fichier uploadé
const cleanupFile = async (filePath) => {
  if (filePath) {
    await fs.unlink(filePath).catch(err => console.error("Erreur suppression fichier:", err));
  }
};

// ADD COURSE
export const addCourse = async (req, res) => {
  const filePath = req.file?.path;

  try {
    const { title, subject, creation } = req.body;

    const userId = req.user && req.user._id;
    if (!userId) {
      await cleanupFile(filePath);
      return res.status(400).json({ message: "Utilisateur non authentifié" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      await cleanupFile(filePath);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let content = "";

    if (req.file) {
      // Validation de la taille du fichier
      if (req.file.size > MAX_FILE_SIZE) {
        await cleanupFile(filePath);
        return res.status(400).json({ message: "Le fichier est trop volumineux (max 10 MB)" });
      }

      // Validation de l'extension du fichier
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
        await cleanupFile(filePath);
        return res.status(400).json({ message: "Extension de fichier non autorisée. Seuls PDF et DOCX sont acceptés." });
      }

      // Validation du MIME type
      if (!ALLOWED_MIMETYPES.includes(req.file.mimetype)) {
        await cleanupFile(filePath);
        return res.status(400).json({ message: "Type de fichier non autorisé. Seuls PDF et DOCX sont acceptés." });
      }

      const fileBuffer = await fs.readFile(filePath);

      if (req.file.mimetype === 'application/pdf') {
        try {
          content = await extractTextFromPDF(filePath);
        } catch (error) {
          console.error('Erreur extraction PDF:', error);
          await cleanupFile(filePath);
          return res.status(500).json({ message: "Impossible d'extraire le contenu du PDF" });
        }
      } else if (req.file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          content = result.value;
        } catch (error) {
          console.error('Erreur extraction DOCX:', error);
          await cleanupFile(filePath);
          return res.status(500).json({ message: "Impossible d'extraire le contenu du DOCX" });
        }
      } else {
        await cleanupFile(filePath);
        return res.status(400).json({ message: "Format de fichier non supporté" });
      }
    }

    const attachment = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
      : null;

    const newCourse = new CourseModel({
      title,
      subject,
      user_id: userId,
      creation,
      attachment,
      content,
    });

    const saveCourse = await newCourse.save();

    // Incrémenter le compteur de cours ajoutés
    await UserModel.findByIdAndUpdate(userId, { $inc: { addedCourses: 1 } });

    // Lancer la génération des assets en arrière-plan (non bloquant)
    generateAllAssets(userId, saveCourse._id, content)
      .catch(error => {
        console.error("Erreur génération assets:", error);
      });

    // Supprimer le fichier uploadé après traitement réussi
    await cleanupFile(filePath);

    // Retourner immédiatement la réponse avec le cours et statut "processing"
    res.json({
      message: "Cours ajouté avec succès, génération en cours...",
      course: saveCourse,
      status: "processing"
    });

  } catch (e) {
    // Cleanup en cas d'erreur inattendue
    await cleanupFile(filePath);
    res.status(500).json({ message: e.message });
  }
};

// GET USER COURSES
export const getUserCourses = async (req, res) => {
  const userId = req.user && req.user._id;
  try {
    const courses = await CourseModel.find({ user_id: userId });
    
    if (courses) {
      const assets = await courseAssetsModel.find({ course_id: { $in: courses.map(course => course._id) } });
      res.json({
        courses: courses,
        assets: assets,
      });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user._id;

  try {
    // Vérifier que le cours existe et appartient à l'utilisateur
    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé dans la base de donnée" });
    }

    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas le droit de modifier ce cours" });
    }

    // Empêcher la modification de certains champs sensibles
    delete req.body.user_id;
    delete req.body.attachment; // Ne pas permettre de changer le fichier après création
    delete req.body.courseAssets_id;

    const updatedCourse = await CourseModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    res.json({ message: "Cours modifié avec succès", course: updatedCourse, success: true });
  } catch (e) {
    res.status(500).json({ message: e.message, succes: false });
  }
};

// DELETE COURSE
export const deleteCourse = async (req, res) => {
  const { id } = req.params; // id du cours
  const userId = req.user && req.user._id;
  try {
    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé dans la base de donnée" });
    }

    // Vérification du propriétaire
    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas le droit de supprimer ce cours" });
    }

    // Suppression du cours
    await CourseModel.findByIdAndDelete(id);

    // Suppression de l'asset associé
    await courseAssetsModel.findOneAndDelete({ course_id: id });

    res.json({ message: "Cours et asset associé supprimés", success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};


// UPLOAD FILE
export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: "Aucun fichier reçu" });
    }
    res.json({ message: "Fichier téléchargé avec succès", file });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET COURSE
export const getCourse = async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user._id;

  try {
    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé dans la base de donnée" });
    }

    // Vérification du propriétaire
    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce cours" });
    }

    res.json({ course });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// GET COURSE ASSETS
export const getCourseAssets = async (req, res) => {
  const {id} = req.params;
  const userId = req.user && req.user._id;

  try {
    // D'abord vérifier que le cours appartient à l'utilisateur
    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ces assets" });
    }

    const courseAssets = await courseAssetsModel.find({ course_id: id });
    if (!courseAssets || courseAssets.length === 0) {
      return res.status(404).json({ message: "Assets non trouvés" });
    }
    res.json({ courseAssets });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// REGENERATE COURSE ASSETS
export const regenerateCourseAssets = async (req, res) => {
  const { id } = req.params; // ID du cours
  const userId = req.user && req.user._id;

  try {
    // Récupérer le cours
    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Non autorisé" });
    }

    // Récupérer le contenu depuis le cours
    if (!course.content || course.content.trim().length === 0) {
      return res.status(400).json({
        message: "Contenu du cours non disponible. Le fichier source a été supprimé."
      });
    }

    const content = course.content;

    // Trouver ou créer les assets
    let assets = await courseAssetsModel.findOne({ course_id: id });

    if (!assets) {
      // Si les assets n'existent pas, les créer
      assets = new courseAssetsModel({
        user_id: userId,
        course_id: id,
        resume: "",
        sheets: [],
        allQuizs: [],
        TotalScore: 0,
        status: "processing",
        error: null,
      });
      await assets.save();
    } else {
      // Mettre à jour le statut à "processing"
      assets.status = "processing";
      assets.error = null;
      await assets.save();
    }

    // Lancer la régénération en arrière-plan
    const { regenerateAssets } = await import("./aiController.langchain.js");

    regenerateAssets(assets._id, content)
      .catch(error => {
        console.error("Erreur régénération:", error);
      });

    res.json({
      message: "Régénération lancée",
      status: "processing"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DOWNLOAD COURSE ASSETS
export const downloadCourseAssets = async (req, res) => {
  const { id, type } = req.params;
  const userId = req.user && req.user._id;

  try {
    // Vérifier que le cours appartient à l'utilisateur
    const course = await CourseModel.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ces assets" });
    }

    // Récupérer les assets
    const assets = await courseAssetsModel.findOne({ course_id: id });
    if (!assets) {
      return res.status(404).json({ message: "Assets non trouvés" });
    }

    const filename = `${course.title.replace(/[^a-zA-Z0-9]/g, '_')}_${type}`;
    let content = '';
    let contentType = 'application/json';
    let extension = 'json';

    switch (type) {
      case 'resume':
        content = assets.resume || '';
        contentType = 'text/markdown';
        extension = 'md';
        break;

      case 'sheets':
        content = JSON.stringify(assets.sheets || [], null, 2);
        break;

      case 'quizs':
        content = JSON.stringify(assets.allQuizs || [], null, 2);
        break;

      case 'flashcards':
        content = JSON.stringify(assets.flashcards || [], null, 2);
        break;

      case 'all':
        content = JSON.stringify({
          courseName: course.title,
          resume: assets.resume,
          sheets: assets.sheets,
          quizs: assets.allQuizs,
          flashcards: assets.flashcards,
          generatedAt: assets.updatedAt
        }, null, 2);
        break;

      default:
        return res.status(400).json({ message: "Type d'asset invalide. Utilisez: resume, sheets, quizs, flashcards, all" });
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.${extension}"`);
    res.send(content);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

