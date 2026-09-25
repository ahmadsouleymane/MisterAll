import cron from "node-cron";
import UserModel from "../models/userModel.js";

// Tâche planifiée pour retirer le premium expiré
// S'exécute chaque jour à 00:00 (minuit)
export const startPremiumExpirationScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();

      // Trouver tous les utilisateurs avec premium expiré
      const expiredUsers = await UserModel.find({
        premium: true,
        premiumExpiry: { $lt: now }
      });

      if (expiredUsers.length > 0) {
        // Retirer le premium de ces utilisateurs
        const result = await UserModel.updateMany(
          {
            premium: true,
            premiumExpiry: { $lt: now }
          },
          {
            $set: {
              premium: false,
              premiumExpiry: null
            }
          }
        );

      }
    } catch (error) {
      console.error("[CRON] Erreur lors de la vérification des abonnements expirés:", error);
    }
  });
};

// Tâche planifiée pour expirer les trials
// S'exécute chaque jour à 00:05 (après l'expiration premium)
export const startTrialExpirationScheduler = () => {
  cron.schedule("5 0 * * *", async () => {
    try {
      const now = new Date();

      // Trouver tous les utilisateurs avec trial expiré
      const expiredTrials = await UserModel.find({
        trialActive: true,
        trialEndDate: { $lt: now }
      });

      if (expiredTrials.length > 0) {
        console.log(`[CRON] ${expiredTrials.length} trial(s) expiré(s) trouvé(s)`);

        // Désactiver le trial et le premium pour ces utilisateurs
        const result = await UserModel.updateMany(
          {
            trialActive: true,
            trialEndDate: { $lt: now }
          },
          {
            $set: {
              trialActive: false,
              premium: false,
              premiumExpiry: null
            }
          }
        );

        console.log(`[CRON] ${result.modifiedCount} trial(s) expiré(s)`);
      }
    } catch (error) {
      console.error("[CRON] Erreur lors de la vérification des trials expirés:", error);
    }
  });
};

// Tâche planifiée pour réinitialiser le compteur de cours mensuels
// S'exécute le 1er jour de chaque mois à 00:00
export const startMonthlyCourseLimitScheduler = () => {
  cron.schedule("0 0 1 * *", async () => {
    try {
      // Réinitialiser le compteur de cours pour tous les utilisateurs
      await UserModel.updateMany(
        {},
        { $set: { addedCourses: 0 } }
      );
    } catch (error) {
      console.error("[CRON] Erreur lors de la réinitialisation des compteurs:", error);
    }
  });
};
