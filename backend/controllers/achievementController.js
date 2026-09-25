import UserModel from "../models/userModel.js";

// Définition des achievements disponibles
const ACHIEVEMENTS = {
  // Streaks
  streak_3: { id: 'streak_3', name: '3 jours de suite', description: 'Étudie 3 jours consécutifs', icon: '🔥', condition: (data) => data.streak >= 3 },
  streak_7: { id: 'streak_7', name: 'Une semaine!', description: 'Étudie 7 jours consécutifs', icon: '🔥', condition: (data) => data.streak >= 7 },
  streak_30: { id: 'streak_30', name: 'Un mois!', description: 'Étudie 30 jours consécutifs', icon: '🏆', condition: (data) => data.streak >= 30 },

  // Flashcards
  flashcards_10: { id: 'flashcards_10', name: 'Débutant', description: 'Révise 10 flashcards', icon: '📚', condition: (data) => data.flashcardsReviewed >= 10 },
  flashcards_100: { id: 'flashcards_100', name: 'Assidu', description: 'Révise 100 flashcards', icon: '📖', condition: (data) => data.flashcardsReviewed >= 100 },
  flashcards_500: { id: 'flashcards_500', name: 'Expert', description: 'Révise 500 flashcards', icon: '🎓', condition: (data) => data.flashcardsReviewed >= 500 },

  // Cours
  courses_1: { id: 'courses_1', name: 'Premier cours', description: 'Ajoute ton premier cours', icon: '📝', condition: (data) => data.coursesAdded >= 1 },
  courses_5: { id: 'courses_5', name: 'Étudiant motivé', description: 'Ajoute 5 cours', icon: '📚', condition: (data) => data.coursesAdded >= 5 },
  courses_10: { id: 'courses_10', name: 'Bibliothèque', description: 'Ajoute 10 cours', icon: '🏛️', condition: (data) => data.coursesAdded >= 10 },

  // Quiz
  quiz_perfect: { id: 'quiz_perfect', name: 'Parfait!', description: 'Obtiens 100% à un quiz', icon: '⭐', condition: (data) => data.perfectQuiz === true },
  quiz_master: { id: 'quiz_master', name: 'Maître des quiz', description: 'Réussis 50 quiz', icon: '🏅', condition: (data) => data.quizCompleted >= 50 },
};

/**
 * Vérifie et débloque les achievements pour un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @param {Object} data - Données pour vérifier les conditions
 * @returns {Array} - Liste des nouveaux achievements débloqués
 */
export const checkAndUnlockAchievements = async (userId, data = {}) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return [];

    // Initialiser achievements si nécessaire
    if (!user.achievements) {
      user.achievements = [];
    }

    const unlockedIds = user.achievements.map(a => a.id);
    const newAchievements = [];

    // Vérifier chaque achievement
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip si déjà débloqué
      if (unlockedIds.includes(achievement.id)) continue;

      // Vérifier la condition
      if (achievement.condition(data)) {
        user.achievements.push({
          id: achievement.id,
          unlockedAt: new Date(),
          seen: false
        });
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date()
        });
      }
    }

    if (newAchievements.length > 0) {
      await user.save();
    }

    return newAchievements;
  } catch (error) {
    console.error("Erreur checkAndUnlockAchievements:", error);
    return [];
  }
};

/**
 * Récupère tous les achievements d'un utilisateur
 */
export const getUserAchievements = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await UserModel.findById(userId).select('achievements').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    const unlockedIds = (user.achievements || []).map(a => a.id);

    // Construire la liste complète avec statut
    const allAchievements = Object.values(ACHIEVEMENTS).map(achievement => {
      const unlocked = user.achievements?.find(a => a.id === achievement.id);
      return {
        ...achievement,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
        seen: unlocked?.seen || false
      };
    });

    res.json({
      success: true,
      achievements: allAchievements,
      unlockedCount: unlockedIds.length,
      totalCount: Object.keys(ACHIEVEMENTS).length
    });
  } catch (error) {
    console.error("Erreur getUserAchievements:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des achievements"
    });
  }
};

/**
 * Marque les achievements comme vus
 */
export const markAchievementsSeen = async (req, res) => {
  try {
    const userId = req.user._id;
    const { achievementIds } = req.body;

    await UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'achievements.$[elem].seen': true
        }
      },
      {
        arrayFilters: [{ 'elem.id': { $in: achievementIds } }]
      }
    );

    res.json({
      success: true,
      message: "Achievements marqués comme vus"
    });
  } catch (error) {
    console.error("Erreur markAchievementsSeen:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour"
    });
  }
};
