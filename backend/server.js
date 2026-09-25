import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import multer from "multer";
import connectDB from "./config/db.js";
import fs from "fs";

import { generalLimiter } from "./middlewares/rateLimiter.js";
import courseRoute from "./routes/courseRoute.js";
import userRoute from "./routes/userRoute.js";
import chatRoute from "./routes/chatRoute.js";
import notificationRoute from "./routes/notificationRoute.js";
import monerooRoute from "./routes/monerooRoute.js";
import sharedRoute from "./routes/sharedRoute.js";
import { startPremiumExpirationScheduler, startMonthlyCourseLimitScheduler, startTrialExpirationScheduler } from "./services/premiumScheduler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7070;
const isProduction = process.env.NODE_ENV === "production";

// ⚡ Trust proxy pour Render/Vercel (utile pour rate-limit)
app.set('trust proxy', 1);

/* ---------- CORS - DOIT ETRE EN PREMIER ---------- */

// Allowed origins
const allowedOrigins = [
    "https://misterall.tech",
    "https://www.misterall.tech",
    "https://api.misterall.tech",
    "http://localhost:5173",
    "http://localhost:3000"
];

// Middleware CORS manuel pour garantir les headers
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Autoriser les origines dans la liste
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Repondre immediatement aux requetes preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

/* ---------- Security Middlewares ---------- */

// Cookie Parser
app.use(cookieParser());

// Helmet - Security headers (APRES CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // Pour Google Auth popup
  contentSecurityPolicy: false, // Desactive CSP pour eviter les conflits
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  } : false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
}));

// HTTPS redirect en production
if (isProduction) {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

// Compression
app.use(compression());

// Rate Limiter général
app.use(generalLimiter);

/* ---------- Create directories ---------- */
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("avatars")) fs.mkdirSync("avatars");

/* ---------- Body Parsers ---------- */
// Webhook Moneroo necessite le raw body pour la verification de signature
app.use("/api/moneroo/webhook", express.json({
  limit: "1mb",
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

/* ---------- Health Check ---------- */
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

/* ---------- Routes API ---------- */
app.use("/api/course", courseRoute);
app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/notifications", notificationRoute);
app.use("/api/moneroo", monerooRoute);
app.use("/api/shared", sharedRoute);
// Servir les fichiers uploadés avec headers de sécurité
app.use("/uploads", (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
}, express.static("uploads"));
app.use("/avatars", express.static("avatars"));

/* ---------- Error Handling Middleware ---------- */
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Fichier trop volumineux (max 10 MB)" });
    }
    return res.status(400).json({ error: "Erreur lors de l'upload du fichier" });
  }

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "Origine non autorisée" });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Données invalides" });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ error: "ID invalide" });
  }

  const statusCode = err.statusCode || 500;
  const message = isProduction ? "Une erreur est survenue" : err.message;

  res.status(statusCode).json({ error: message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route non trouvée" });
});

/* ---------- Graceful Shutdown ---------- */
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));

/* ---------- Start server AFTER DB ---------- */
const startServer = async () => {
  try {
    await connectDB();

    // Démarrer les tâches planifiées
    startPremiumExpirationScheduler();
    startTrialExpirationScheduler();
    startMonthlyCourseLimitScheduler();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Échec du démarrage du serveur:", error.message);
    process.exit(1);
  }
};

startServer();