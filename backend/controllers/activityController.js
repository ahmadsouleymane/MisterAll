import ActivityModel from "../models/activityModel.js";

/**
 * Log une activité utilisateur (pour heatmap et statistiques)
 * @param {string} userId - ID de l'utilisateur
 * @param {string} type - Type d'activité
 * @param {Object} metadata - Données supplémentaires
 */
export const logActivity = async (userId, type, metadata = {}) => {
  try {
    const activity = new ActivityModel({
      user_id: userId,
      type,
      date: new Date(),
      metadata
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error("Erreur logActivity:", error);
    return null;
  }
};

/**
 * Récupère les activités d'un utilisateur pour la heatmap
 * @param {string} userId - ID de l'utilisateur
 * @param {number} days - Nombre de jours à récupérer (défaut: 365)
 */
export const getActivityHeatmap = async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 365;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const activities = await ActivityModel.aggregate([
      {
        $match: {
          user_id: userId,
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          count: { $sum: 1 },
          types: { $addToSet: "$type" }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Convertir en format heatmap
    const heatmapData = {};
    activities.forEach(day => {
      heatmapData[day._id] = {
        count: day.count,
        level: day.count >= 10 ? 4 : day.count >= 5 ? 3 : day.count >= 2 ? 2 : 1
      };
    });

    res.json({
      success: true,
      heatmap: heatmapData,
      totalDays: activities.length,
      totalActivities: activities.reduce((sum, day) => sum + day.count, 0)
    });
  } catch (error) {
    console.error("Erreur getActivityHeatmap:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des activités"
    });
  }
};

/**
 * Récupère les statistiques d'activité récentes
 */
export const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    const activities = await ActivityModel.find({ user_id: userId })
      .sort({ date: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error("Erreur getRecentActivity:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des activités"
    });
  }
};
