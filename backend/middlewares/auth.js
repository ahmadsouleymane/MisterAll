import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const authMiddleware = async (req, res, next) => {
  try {
    // Priorité: Cookie HttpOnly > Header Authorization
    let authToken = req.cookies?.token;

    // Fallback sur le header Authorization si pas de cookie
    if (!authToken) {
      const authHeader = req.header("Authorization");
      if (authHeader) {
        const match = authHeader.match(/^Bearer\s+(.+)$/i);
        if (match) {
          authToken = match[1];
        }
      }
    }

    if (!authToken) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const decodedToken = jwt.verify(authToken, process.env.KEY);

    // Vérifie que le token existe dans l'utilisateur
    const user = await UserModel.findOne({
      _id: decodedToken._id,
      "authTokens.authToken": authToken,
    });

    if (!user) {
      return res.status(401).json({ message: "Session invalide" });
    }

    // Check if account is suspended
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ message: "Compte suspendu" });
    }

    // Ajoute l'utilisateur à la requête pour les controllers suivants
    req.user = user;
    req.token = authToken;

    // Mettre à jour lastActivity de manière fiable (non-bloquant mais persisté)
    // Throttle: ne mettre à jour que si la dernière activité date de plus de 30 secondes
    const now = new Date();
    const lastActivity = user.lastActivity ? new Date(user.lastActivity) : null;
    const shouldUpdate = !lastActivity || (now - lastActivity) > 30000; // 30 secondes

    if (shouldUpdate) {
      // Mise à jour non-bloquante mais fiable
      UserModel.updateOne(
        { _id: user._id },
        { $set: { lastActivity: now } }
      ).catch(err => {
        console.error('Erreur mise à jour lastActivity:', err.message);
      });
    }

    next();
  } catch (e) {
    // Ne pas exposer les détails de l'erreur JWT
    res.status(401).json({ message: "Session expirée ou invalide" });
  }
};

/**
 * Middleware to require email verification
 * Use for routes that need verified accounts
 */
export const requireEmailVerified = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Skip for Google users (they're verified by Google)
    if (user.authProvider === 'google' && user.emailVerified) {
      return next();
    }

    // Skip for legacy phone users who haven't added email yet
    if (user.authProvider === 'phone' && !user.email) {
      return next();
    }

    // Require email verification for local auth
    if (!user.emailVerified) {
      return res.status(403).json({
        message: "Email non verifie",
        requiresVerification: true
      });
    }

    next();
  } catch (e) {
    res.status(500).json({ message: "Erreur de verification" });
  }
};

/**
 * Middleware to force email migration for phone users
 * Use for routes where email is mandatory
 */
export const requireEmail = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    if (!user.email) {
      return res.status(403).json({
        message: "Email requis",
        requiresEmail: true,
        mustAddEmail: true
      });
    }

    next();
  } catch (e) {
    res.status(500).json({ message: "Erreur de verification" });
  }
};

export const adminMiddleware = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ message: "Accès refusé: droits admin requis" });
    }

    next();
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};
