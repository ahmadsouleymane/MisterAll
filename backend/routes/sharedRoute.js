import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import { crudLimiter } from "../middlewares/rateLimiter.js";
import {
  enableSharing,
  disableSharing,
  getSharingStatus,
  getSharedCourse,
  getSharedCourseAssets,
} from "../controllers/sharedCourseController.js";

const router = express.Router();

// ==================== Authenticated Routes ====================

// Enable sharing for a course
router.post("/enable/:id", authMiddleware, crudLimiter, enableSharing);

// Disable sharing for a course
router.post("/disable/:id", authMiddleware, crudLimiter, disableSharing);

// Get sharing status for a course
router.get("/status/:id", authMiddleware, getSharingStatus);

// ==================== Public Routes ====================

// Get shared course info (public)
router.get("/course/:token", getSharedCourse);

// Get shared course assets (public)
router.get("/assets/:token", getSharedCourseAssets);

export default router;
