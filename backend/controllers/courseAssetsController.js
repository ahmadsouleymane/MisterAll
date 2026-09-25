import courseAssetsModel from "../models/courseAssetsModel.js";
import { updateStreak } from "../utils/streakManager.js";
import { checkAndUnlockAchievements } from "./achievementController.js";
import { logActivity } from "./activityController.js";

export const updateQuizScore = async (req, res) => {
    try {
        const { isCorrect, courseId, sheetId, quizId } = req.body;

        if (!courseId || !sheetId || isCorrect === undefined || !quizId) {
            return res.status(400).json({
                message: "Course ID, Sheet ID, quizId or isCorrect missing",
                success: false
            });
        }

        const course = await courseAssetsModel.findOne({ course_id: courseId });
        if (!course) {
            return res.status(200).json({
                message: "Course not found",
                success: false
            });
        }

        const sheet = course.sheets.id(sheetId);
        if (!sheet) {
            return res.status(200).json({
                message: "Sheet not found",
                success: false
            });
        }

        const question = sheet.quizs.id(quizId);
        if (!question) {
            return res.status(200).json({
                message: "Question not found",
                success: false
            });
        }

        // ➤ Ajouter 1 point si la réponse est correcte ET que la question n'a pas déjà été validée
        if (isCorrect && !question.isDone) {
            sheet.score += 1;
            question.isDone = true;
        }

        // ➤ Mettre à jour le statut
        if (sheet.score === sheet.quizs.length) {
            sheet.status = "Terminé";
        } else {
            sheet.status = "En cours";
        }

        // ✨ Recalculer TotalScore automatiquement
        course.TotalScore = course.sheets.reduce((sum, s) => sum + (s.score || 0), 0);

        // ➤ Sauvegarder
        await course.save();

        // Mettre à jour le streak (activité d'étude)
        let streakResult = null;
        let newAchievements = [];
        if (req.user && req.user._id) {
            streakResult = await updateStreak(req.user._id);

            // Logger l'activité pour la heatmap
            await logActivity(req.user._id, 'quiz_answer', { isCorrect });

            // Si la fiche est terminée, logger aussi
            if (sheet.status === "Terminé") {
                await logActivity(req.user._id, 'sheet_complete');
            }

            // Vérifier les achievements
            newAchievements = await checkAndUnlockAchievements(req.user._id, {
                streak: streakResult?.current || 0,
                perfect_quiz: isCorrect && sheet.score === sheet.quizs.length ? 1 : 0
            });
        }

        return res.status(200).json({
            message: "Score updated",
            success: true,
            course,
            streak: streakResult,
            newAchievements: newAchievements.length > 0 ? newAchievements : undefined
        });

    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message
        });
    }
};
