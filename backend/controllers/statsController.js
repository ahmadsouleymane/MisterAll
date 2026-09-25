import courseAssetsModel from "../models/courseAssetsModel.js";
import CourseModel from "../models/courseModel.js";

/**
 * GET /api/user/stats
 * Retourne toutes les statistiques d'apprentissage de l'utilisateur
 * Optimisé avec agrégation MongoDB pour éviter les N+1 queries
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Agrégation MongoDB pour calculer toutes les stats en une requête
    const [statsResult] = await courseAssetsModel.aggregate([
      // 1. Filtrer par utilisateur et status completed
      { $match: { user_id: userId, status: "completed" } },

      // 2. Déplier les sheets pour les analyser
      {
        $facet: {
          // Stats globales des cours
          courseStats: [
            {
              $group: {
                _id: null,
                totalCourses: { $sum: 1 },
                totalSheets: { $sum: { $size: "$sheets" } },
                totalQuizzes: {
                  $sum: {
                    $reduce: {
                      input: "$sheets",
                      initialValue: 0,
                      in: { $add: ["$$value", { $size: { $ifNull: ["$$this.quizs", []] } }] }
                    }
                  }
                },
                totalScore: { $sum: "$TotalScore" },
                totalFlashcards: { $sum: { $size: { $ifNull: ["$flashcards", []] } } }
              }
            }
          ],

          // Stats des fiches par status
          sheetsByStatus: [
            { $unwind: "$sheets" },
            {
              $group: {
                _id: "$sheets.status",
                count: { $sum: 1 }
              }
            }
          ],

          // Cours avec 100% de progression
          completedCourses: [
            {
              $project: {
                course_id: 1,
                sheets: 1,
                allCompleted: {
                  $eq: [
                    { $size: { $filter: { input: "$sheets", cond: { $eq: ["$$this.status", "Terminé"] } } } },
                    { $size: "$sheets" }
                  ]
                }
              }
            },
            { $match: { allCompleted: true, "sheets.0": { $exists: true } } },
            { $count: "count" }
          ],

          // Score moyen par fiche
          avgScorePerSheet: [
            { $unwind: "$sheets" },
            {
              $group: {
                _id: null,
                totalScore: { $sum: "$sheets.score" },
                totalQuizzes: { $sum: { $size: { $ifNull: ["$sheets.quizs", []] } } }
              }
            }
          ]
        }
      }
    ]);

    // Extraire les résultats
    const courseStats = statsResult?.courseStats?.[0] || {
      totalCourses: 0,
      totalSheets: 0,
      totalQuizzes: 0,
      totalScore: 0,
      totalFlashcards: 0
    };

    const sheetsByStatus = statsResult?.sheetsByStatus || [];
    const completedCoursesCount = statsResult?.completedCourses?.[0]?.count || 0;
    const avgScoreData = statsResult?.avgScorePerSheet?.[0] || { totalScore: 0, totalQuizzes: 0 };

    // Calculer les métriques dérivées
    const sheetsTermines = sheetsByStatus.find(s => s._id === "Terminé")?.count || 0;
    const sheetsEnCours = sheetsByStatus.find(s => s._id === "En cours")?.count || 0;
    const sheetsAReviser = sheetsByStatus.find(s => s._id === "A réviser")?.count || 0;

    // Progression globale = fiches terminées / total fiches
    const globalProgress = courseStats.totalSheets > 0
      ? Math.round((sheetsTermines / courseStats.totalSheets) * 100)
      : 0;

    // Score moyen = bonnes réponses / total questions
    const avgScore = avgScoreData.totalQuizzes > 0
      ? Math.round((avgScoreData.totalScore / avgScoreData.totalQuizzes) * 100)
      : 0;

    res.json({
      success: true,
      stats: {
        // Compteurs
        totalCourses: courseStats.totalCourses,
        totalSheets: courseStats.totalSheets,
        totalQuizzes: courseStats.totalQuizzes,
        totalFlashcards: courseStats.totalFlashcards,

        // Progression
        completedCourses: completedCoursesCount,
        sheetsTermines,
        sheetsEnCours,
        sheetsAReviser,
        globalProgress,

        // Performance
        totalScore: courseStats.totalScore,
        avgScore
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/course/get - Version optimisée
 * Retourne courses + assets en une seule requête
 */
export const getCoursesWithAssets = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Récupérer cours et assets en parallèle
    const [courses, allAssets] = await Promise.all([
      CourseModel.find({ user_id: userId }).sort({ createdAt: -1 }).lean(),
      courseAssetsModel.find({ user_id: userId }).lean()
    ]);

    // Créer un map des assets par course_id pour lookup O(1)
    const assetsMap = {};
    allAssets.forEach(asset => {
      assetsMap[asset.course_id] = asset;
    });

    // Calculer les stats pour chaque cours
    const coursesWithStats = courses.map(course => {
      const assets = assetsMap[course._id.toString()];

      if (!assets || !assets.sheets) {
        return {
          ...course,
          assets: null,
          stats: { progress: 0, score: 0, sheetsCount: 0, status: assets?.status || 'processing' }
        };
      }

      const totalSheets = assets.sheets.length;
      const completedSheets = assets.sheets.filter(s => s.status === "Terminé").length;
      const totalQuizzes = assets.sheets.reduce((sum, s) => sum + (s.quizs?.length || 0), 0);
      const totalCorrect = assets.sheets.reduce((sum, s) => sum + (s.score || 0), 0);

      return {
        ...course,
        assets,
        stats: {
          progress: totalSheets > 0 ? Math.round((completedSheets / totalSheets) * 100) : 0,
          score: totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0,
          sheetsCount: totalSheets,
          completedSheets,
          totalQuizzes,
          totalCorrect,
          status: assets.status
        }
      };
    });

    res.json({
      success: true,
      courses: coursesWithStats
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
