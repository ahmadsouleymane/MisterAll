import rateLimit from "express-rate-limit";

// Rate Limiting - Protection contre DDoS et brute force
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre
  message: { error: "Trop de requêtes, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de login/signup
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 générations AI par heure
  message: { error: "Limite de génération AI atteinte. Réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter pour les uploads de fichiers
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 uploads par heure
  message: { error: "Limite d'upload atteinte. Réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter pour les opérations CRUD sensibles
export const crudLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 opérations par fenêtre
  message: { error: "Trop d'opérations, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter pour les contenus publics partagés
export const publicContentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par fenêtre par IP
  message: { error: "Trop de requêtes, réessayez plus tard." },
  standardHeaders: true,
  legacyHeaders: false,
});
