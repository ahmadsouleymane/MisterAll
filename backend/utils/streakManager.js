import UserModel from "../models/userModel.js";

/**
 * Met à jour le streak d'étude d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} - Informations sur le streak
 */
export const updateStreak = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Initialiser streak si nécessaire
    if (!user.streak) {
      user.streak = {
        current: 0,
        longest: 0,
        lastStudyDate: null,
        freezesRemaining: 0,
        freezeUsedToday: false
      };
    }

    const lastStudyDate = user.streak.lastStudyDate
      ? new Date(user.streak.lastStudyDate)
      : null;

    if (lastStudyDate) {
      const lastStudyDay = new Date(
        lastStudyDate.getFullYear(),
        lastStudyDate.getMonth(),
        lastStudyDate.getDate()
      );

      const diffDays = Math.floor((today - lastStudyDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Même jour - ne pas incrémenter le streak
        return {
          current: user.streak.current,
          longest: user.streak.longest,
          updated: false
        };
      } else if (diffDays === 1) {
        // Jour consécutif - incrémenter le streak
        user.streak.current += 1;
      } else {
        // Plus d'un jour - réinitialiser le streak
        user.streak.current = 1;
      }
    } else {
      // Premier jour d'étude
      user.streak.current = 1;
    }

    // Mettre à jour le record si nécessaire
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }

    user.streak.lastStudyDate = now;
    user.streak.freezeUsedToday = false;

    await user.save();

    return {
      current: user.streak.current,
      longest: user.streak.longest,
      updated: true
    };
  } catch (error) {
    console.error("Erreur updateStreak:", error);
    return null;
  }
};

/**
 * Récupère les informations de streak d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} - Informations sur le streak
 */
export const getStreak = async (userId) => {
  try {
    const user = await UserModel.findById(userId).select('streak').lean();
    if (!user) return null;

    return user.streak || {
      current: 0,
      longest: 0,
      lastStudyDate: null,
      freezesRemaining: 0
    };
  } catch (error) {
    console.error("Erreur getStreak:", error);
    return null;
  }
};
