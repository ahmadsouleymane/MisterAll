import express from "express";
import multer from "multer";
import path from "path";
import { authMiddleware, adminMiddleware } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiter.js";
import {
  signupValidation,
  loginValidation,
  updateUserValidation,
  mongoIdValidation,
  checkPhoneValidation,
  sanitizeInput,
} from "../middlewares/validation.js";
import {
  signupUser,
  updateUser,
  deleteUser,
  getUserInfos,
  userLogin,
  userForgotPassword,
  verifyUserIdentity,
  resetPassword,
  userLogout,
  userLogoutAll,
  checkPhoneExists,
  addPremiumToUser,
  removePremiumFromUser,
  getExpiringPremiums,
  getAllUsersWithPremium,
  uploadAvatar,
  deleteAvatar,
  // New email-based auth functions
  signupWithEmail,
  loginWithEmail,
  googleAuth,
  googleSignup,
  verifyEmail,
  resendVerificationEmail,
  forgotPasswordEmail,
  resetPasswordEmail,
  addEmailToAccount,
  updateGoogleUserProfile,
  // Trial system functions
  checkTrialEligibility,
  activateTrial,
  declineTrial,
} from "../controllers/userController.js";
import { getUserStats } from "../controllers/statsController.js";

// Configuration multer pour les avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "avatars/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const avatarFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Seuls JPEG, PNG, GIF et WebP sont acceptés.'), false);
  }
};

const uploadAvatarMulter = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
});

const router = express.Router();

// Appliquer le sanitizer anti-injection sur toutes les routes
router.use(sanitizeInput);

// =====================================================
// NEW EMAIL-BASED AUTH ROUTES (Primary method)
// =====================================================
router.post("/signup", authLimiter, signupWithEmail);  // New email signup
router.post("/login", authLimiter, loginWithEmail);    // New email login
router.post("/google-auth", authLimiter, googleAuth);  // Google OAuth (login existing)
router.post("/google-signup", authLimiter, googleSignup);  // Google OAuth (signup with profile)
router.post("/verify-email", authLimiter, verifyEmail);    // Email verification with code (POST)
router.get("/verify-email/:token", verifyEmail);           // Email verification (legacy GET)
router.post("/forgot-password", authLimiter, forgotPasswordEmail);  // Request password reset
router.post("/reset-password", authLimiter, resetPasswordEmail);    // Reset with code

// =====================================================
// LEGACY PHONE AUTH ROUTES (For migration)
// =====================================================
router.post("/login-phone", authLimiter, loginValidation, userLogin);       // Legacy phone login
router.post("/signup-phone", authLimiter, signupValidation, signupUser);    // Legacy phone signup
router.post("/verify-identity", authLimiter, verifyUserIdentity);           // Legacy identity verification
router.post("/reset-password-phone", authLimiter, resetPassword);           // Legacy phone reset
router.post("/check-phone", authLimiter, checkPhoneValidation, checkPhoneExists);

// =====================================================
// AUTHENTICATED ROUTES
// =====================================================
router.patch("/update/:id", authMiddleware, updateUserValidation, updateUser);
router.delete("/delete/:id", authMiddleware, mongoIdValidation, deleteUser);
router.get("/infos/", authMiddleware, getUserInfos);

// Email management (authenticated)
router.post("/resend-verification", authMiddleware, resendVerificationEmail);
router.post("/add-email", authMiddleware, addEmailToAccount);
router.patch("/complete-profile", authMiddleware, updateGoogleUserProfile);
router.get("/stats", authMiddleware, getUserStats);
router.post("/logout", authMiddleware, userLogout);
router.post("/logout-all", authMiddleware, userLogoutAll);

// Trial system routes
router.get("/trial/check", authMiddleware, checkTrialEligibility);
router.post("/trial/activate", authMiddleware, activateTrial);
router.post("/trial/decline", authMiddleware, declineTrial);

// Routes avatar (photo de profil)
router.post("/avatar", authMiddleware, uploadAvatarMulter.single("avatar"), uploadAvatar);
router.delete("/avatar", authMiddleware, deleteAvatar);

// Routes ADMIN - Gestion des abonnements premium
router.post("/admin/premium/add", authMiddleware, adminMiddleware, addPremiumToUser);
router.post("/admin/premium/remove", authMiddleware, adminMiddleware, removePremiumFromUser);
router.get("/admin/premium/expiring", authMiddleware, adminMiddleware, getExpiringPremiums);
router.get("/admin/users/all", authMiddleware, adminMiddleware, getAllUsersWithPremium);

export default router;
