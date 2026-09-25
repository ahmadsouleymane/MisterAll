import courseAssetsModel from "../models/courseAssetsModel.js";
import CourseModel from "../models/courseModel.js";
import { updateStreak } from "../utils/streakManager.js";
import { checkAndUnlockAchievements } from "./achievementController.js";
import { logActivity } from "./activityController.js";
import { generateFlashcardsPDF } from "../utils/pdfGenerator.js";

/**
 * Algorithme SM-2 pour la répétition espacée
 * quality: 0-5 (0-2 = échec, 3-5 = succès)
 * - 0: Réponse complètement incorrecte
 * - 1: Réponse incorrecte, se souvient à peine
 * - 2: Réponse incorrecte, mais proche
 * - 3: Réponse correcte avec difficulté
 * - 4: Réponse correcte après hésitation
 * - 5: Réponse parfaite
 */
function calculateSM2(flashcard, quality) {
  let { interval, easeFactor, repetitions } = flashcard;

  // Si qualité < 3, on réinitialise (échec)
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    // Succès: augmenter l'intervalle
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Ajuster le facteur de facilité
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Le facteur de facilité ne doit pas descendre en dessous de 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculer la prochaine date de révision
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
    nextReviewDate,
    lastReviewedAt: new Date()
  };
}

/**
 * Récupérer toutes les flashcards dues pour un utilisateur (tous cours confondus)
 */
export const getDueFlashcards = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Récupérer tous les courseAssets de l'utilisateur qui ont des flashcards
    // On inclut tous les status car les flashcards peuvent exister même si la génération
    // des autres assets a échoué
    const allAssets = await courseAssetsModel.find({
      user_id: userId,
      flashcards: { $exists: true, $ne: [] }
    }).lean();

    // Collecter toutes les flashcards dues
    const dueFlashcards = [];

    for (const assets of allAssets) {
      if (!assets.flashcards || assets.flashcards.length === 0) continue;

      const dueCards = assets.flashcards.filter(card => {
        const reviewDate = new Date(card.nextReviewDate);
        return reviewDate <= now;
      });

      // Ajouter le courseId et assetsId pour chaque carte
      dueCards.forEach(card => {
        dueFlashcards.push({
          ...card,
          courseId: assets.course_id,
          assetsId: assets._id
        });
      });
    }

    // Trier par date de révision (les plus anciennes d'abord)
    dueFlashcards.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));

    res.status(200).json({
      success: true,
      count: dueFlashcards.length,
      flashcards: dueFlashcards
    });

  } catch (error) {
    console.error("Erreur getDueFlashcards:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des flashcards"
    });
  }
};

/**
 * Récupérer les flashcards d'un cours spécifique
 */
export const getCourseFlashcards = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    const assets = await courseAssetsModel.findOne({
      course_id: courseId,
      user_id: userId
    }).lean();

    if (!assets) {
      return res.status(404).json({
        success: false,
        message: "Assets non trouvés pour ce cours"
      });
    }

    const flashcards = assets.flashcards || [];
    const now = new Date();

    // Séparer les cartes dues et à venir
    const dueCards = flashcards.filter(card => new Date(card.nextReviewDate) <= now);
    const upcomingCards = flashcards.filter(card => new Date(card.nextReviewDate) > now);

    res.status(200).json({
      success: true,
      total: flashcards.length,
      dueCount: dueCards.length,
      flashcards: flashcards,
      dueFlashcards: dueCards
    });

  } catch (error) {
    console.error("Erreur getCourseFlashcards:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des flashcards"
    });
  }
};

/**
 * Mettre à jour une flashcard après révision (algorithme SM-2)
 */
export const reviewFlashcard = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId, flashcardId, quality } = req.body;

    // Valider la qualité (0-5)
    if (quality < 0 || quality > 5) {
      return res.status(400).json({
        success: false,
        message: "La qualité doit être entre 0 et 5"
      });
    }

    // Trouver les assets du cours
    const assets = await courseAssetsModel.findOne({
      course_id: courseId,
      user_id: userId
    });

    if (!assets) {
      return res.status(404).json({
        success: false,
        message: "Assets non trouvés"
      });
    }

    // Trouver la flashcard
    const flashcardIndex = assets.flashcards.findIndex(
      card => card._id.toString() === flashcardId
    );

    if (flashcardIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Flashcard non trouvée"
      });
    }

    // Appliquer l'algorithme SM-2
    const currentCard = assets.flashcards[flashcardIndex];
    const updatedValues = calculateSM2(currentCard, quality);

    // Mettre à jour la flashcard
    assets.flashcards[flashcardIndex].interval = updatedValues.interval;
    assets.flashcards[flashcardIndex].easeFactor = updatedValues.easeFactor;
    assets.flashcards[flashcardIndex].repetitions = updatedValues.repetitions;
    assets.flashcards[flashcardIndex].nextReviewDate = updatedValues.nextReviewDate;
    assets.flashcards[flashcardIndex].lastReviewedAt = updatedValues.lastReviewedAt;

    await assets.save();

    // Mettre à jour le streak (activité d'étude)
    const streakResult = await updateStreak(userId);

    // Logger l'activité pour la heatmap
    await logActivity(userId, 'flashcard_review', { quality });

    // Vérifier les achievements
    const newAchievements = await checkAndUnlockAchievements(userId, {
      streak: streakResult?.current || 0
    });

    res.status(200).json({
      success: true,
      message: "Flashcard mise à jour",
      flashcard: {
        _id: flashcardId,
        ...updatedValues,
        question: currentCard.question
      },
      streak: streakResult,
      newAchievements: newAchievements.length > 0 ? newAchievements : undefined
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la flashcard"
    });
  }
};

/**
 * Obtenir les statistiques de révision pour un utilisateur
 */
export const getFlashcardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    // Récupérer tous les assets qui ont des flashcards (pas de filtre sur status)
    const allAssets = await courseAssetsModel.find({
      user_id: userId,
      flashcards: { $exists: true, $ne: [] }
    }).lean();

    let totalCards = 0;
    let dueToday = 0;
    let mastered = 0; // interval >= 21 jours
    let learning = 0; // interval < 21 jours

    for (const assets of allAssets) {
      if (!assets.flashcards) continue;

      totalCards += assets.flashcards.length;

      assets.flashcards.forEach(card => {
        const reviewDate = new Date(card.nextReviewDate);
        if (reviewDate <= now) {
          dueToday++;
        }
        if (card.interval >= 21) {
          mastered++;
        } else {
          learning++;
        }
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        totalCards,
        dueToday,
        mastered,
        learning,
        masteryPercentage: totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0
      }
    });

  } catch (error) {
    console.error("Erreur getFlashcardStats:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques"
    });
  }
};

/**
 * Exporter les flashcards d'un cours en PDF
 */
export const exportFlashcardsPDF = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    // Récupérer le cours
    const course = await CourseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Cours non trouvé"
      });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (course.user_id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Non autorisé"
      });
    }

    // Récupérer les assets
    const assets = await courseAssetsModel.findOne({
      course_id: courseId,
      user_id: userId
    }).lean();

    if (!assets || !assets.flashcards || assets.flashcards.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucune flashcard trouvée pour ce cours"
      });
    }

    // Générer le PDF
    const doc = generateFlashcardsPDF(assets.flashcards, course.title);

    // Définir les headers de réponse
    const filename = `flashcards_${course.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe le PDF directement dans la réponse
    doc.pipe(res);
    doc.end();

  } catch (error) {
    console.error("Erreur exportFlashcardsPDF:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la génération du PDF"
    });
  }
};
