import Course from "../models/courseModel.js";
import CourseAssets from "../models/courseAssetsModel.js";
import { generateShareToken } from "../utils/tokenGenerator.js";

/**
 * Enable sharing for a course (authenticated)
 * POST /api/shared/enable/:id
 */
export const enableSharing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await Course.findOne({ _id: id, user_id: userId });

    if (!course) {
      return res.status(404).json({ error: "Cours non trouvé" });
    }

    // If already shared, return existing token
    if (course.isShared && course.shareToken) {
      return res.json({
        success: true,
        shareToken: course.shareToken,
        shareUrl: `${process.env.FRONTEND_URL || "https://misterall.tech"}/shared/${course.shareToken}`,
        isShared: true,
      });
    }

    // Generate new share token
    const shareToken = generateShareToken();

    course.isShared = true;
    course.shareToken = shareToken;
    course.shareCreatedAt = new Date();
    course.shareViewCount = 0;

    await course.save();

    res.json({
      success: true,
      shareToken,
      shareUrl: `${process.env.FRONTEND_URL || "https://misterall.tech"}/shared/${shareToken}`,
      isShared: true,
    });
  } catch (error) {
    console.error("Enable sharing error:", error);
    res.status(500).json({ error: "Erreur lors de l'activation du partage" });
  }
};

/**
 * Disable sharing for a course (authenticated)
 * POST /api/shared/disable/:id
 */
export const disableSharing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await Course.findOne({ _id: id, user_id: userId });

    if (!course) {
      return res.status(404).json({ error: "Cours non trouvé" });
    }

    course.isShared = false;
    course.shareToken = undefined;
    course.shareCreatedAt = undefined;

    await course.save();

    res.json({
      success: true,
      isShared: false,
    });
  } catch (error) {
    console.error("Disable sharing error:", error);
    res.status(500).json({ error: "Erreur lors de la désactivation du partage" });
  }
};

/**
 * Get sharing status for a course (authenticated)
 * GET /api/shared/status/:id
 */
export const getSharingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const course = await Course.findOne({ _id: id, user_id: userId });

    if (!course) {
      return res.status(404).json({ error: "Cours non trouvé" });
    }

    res.json({
      isShared: course.isShared || false,
      shareToken: course.shareToken || null,
      shareUrl: course.shareToken
        ? `${process.env.FRONTEND_URL || "https://misterall.tech"}/shared/${course.shareToken}`
        : null,
      shareViewCount: course.shareViewCount || 0,
      shareCreatedAt: course.shareCreatedAt || null,
    });
  } catch (error) {
    console.error("Get sharing status error:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du statut" });
  }
};

/**
 * Get shared course info (public)
 * GET /api/shared/course/:token
 */
export const getSharedCourse = async (req, res) => {
  try {
    const { token } = req.params;

    const course = await Course.findOne({
      shareToken: token,
      isShared: true,
    });

    if (!course) {
      return res.status(404).json({ error: "Cours non trouvé ou partage désactivé" });
    }

    // Increment view count
    course.shareViewCount = (course.shareViewCount || 0) + 1;
    await course.save();

    // Return only public info (no user_id)
    res.json({
      title: course.title,
      subject: course.subject,
      createdAt: course.createdAt,
      shareViewCount: course.shareViewCount,
    });
  } catch (error) {
    console.error("Get shared course error:", error);
    res.status(500).json({ error: "Erreur lors de la récupération du cours" });
  }
};

/**
 * Get shared course assets (public)
 * GET /api/shared/assets/:token
 */
export const getSharedCourseAssets = async (req, res) => {
  try {
    const { token } = req.params;

    const course = await Course.findOne({
      shareToken: token,
      isShared: true,
    });

    if (!course) {
      return res.status(404).json({ error: "Cours non trouvé ou partage désactivé" });
    }

    const assets = await CourseAssets.findOne({ course_id: course._id });

    if (!assets) {
      return res.status(404).json({ error: "Assets non trouvés" });
    }

    // Sanitize assets - remove user-specific and premium data
    const sanitizedAssets = {
      resume: assets.resume || "",
      status: assets.status,
      // Sanitize sheets - remove scores and status, include all content
      sheets: (assets.sheets || []).map((sheet) => ({
        _id: sheet._id,
        title: sheet.title,
        content: sheet.content,
        // Sanitize quizzes - include questions and answers but not isDone
        quizs: (sheet.quizs || []).map((quiz) => ({
          _id: quiz._id,
          type: quiz.type,
          quiz: quiz.quiz,
          answers: quiz.answers,
          goodAnswer: quiz.goodAnswer,
          explanation: quiz.explanation,
          difficulty: quiz.difficulty,
        })),
      })),
      // Sanitize allQuizs
      allQuizs: (assets.allQuizs || []).map((quiz) => ({
        _id: quiz._id,
        type: quiz.type,
        quiz: quiz.quiz,
        answers: quiz.answers,
        goodAnswer: quiz.goodAnswer,
        explanation: quiz.explanation,
        difficulty: quiz.difficulty,
      })),
      // Sanitize flashcards - only question and answer
      flashcards: (assets.flashcards || []).map((card) => ({
        _id: card._id,
        question: card.question,
        answer: card.answer,
      })),
    };

    res.json(sanitizedAssets);
  } catch (error) {
    console.error("Get shared course assets error:", error);
    res.status(500).json({ error: "Erreur lors de la récupération des assets" });
  }
};
