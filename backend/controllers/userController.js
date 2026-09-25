// controllers/UserController.js
import UserModel from "../models/userModel.js";
import CourseModel from "../models/courseModel.js";
import CourseAssetsModel from "../models/courseAssetsModel.js";
import ConversationModel from "../models/conversationModel.js";
import ActivityModel from "../models/activityModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail, sendWelcomeWithOfferEmail, generateVerificationCode } from "../services/emailService.js";
import { verifyFirebaseToken, isFirebaseConfigured } from "../services/firebaseAdmin.js";

// Configuration des cookies sécurisés
const isProduction = process.env.NODE_ENV === "production";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',  // 'none' requis pour cookies cross-origin
  maxAge: 10 * 365 * 24 * 60 * 60 * 1000, // 10 ans (permanent)
  path: '/',
  // Ne pas specifier domain pour permettre les cookies cross-origin entre misterall.tech et misterall.onrender.com
};

// Champs autorisés pour la mise à jour utilisateur (whitelist)
// Note: educationType n'est PAS modifiable apres l'inscription
const ALLOWED_UPDATE_FIELDS = ['firstname', 'lastname', 'program', 'level', 'password', 'avatar', 'secondaryCycle', 'series', 'seriesOrientation'];

export const signupUser = async (req, res) => {
  try {
    const {
      lastname,
      firstname,
      phone_number,
      educationType,
      program,
      password,
      registration,
      role,
      avatar,
      level,
      secondaryCycle,
      series,
      seriesOrientation,
    } = req.body;

    // Validation des champs communs
    if (!lastname || !firstname || !phone_number || !level || !password) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // Normaliser le numero de telephone (doit commencer par +)
    let normalizedPhone = String(phone_number).replace(/[\s\-\(\)\.]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      // Si le numero ne commence pas par +, ajouter +225 (Cote d'Ivoire par defaut)
      if (normalizedPhone.startsWith('00')) {
        normalizedPhone = '+' + normalizedPhone.slice(2);
      } else if (normalizedPhone.length === 10 && normalizedPhone.startsWith('0')) {
        normalizedPhone = '+225' + normalizedPhone;
      } else {
        normalizedPhone = '+225' + normalizedPhone;
      }
    }

    // Vérifier si l'utilisateur existe déjà (message générique pour éviter l'énumération)
    const existing = await UserModel.findOne({ phone_number: normalizedPhone });
    if (existing) {
      // Délai aléatoire pour éviter les timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return res.status(400).json({
        message: "Impossible de créer le compte. Vérifiez vos informations."
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new UserModel({
      lastname,
      firstname,
      phone_number: normalizedPhone,
      educationType,
      program,
      level,
      secondaryCycle,
      series,
      seriesOrientation,
      password: hashedPassword,
      registration,
      role,
      avatar,
    });

    const token = await newUser.genereteAuthTokenAndSaveUser();

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: newUser._id,
      lastname: newUser.lastname,
      firstname: newUser.firstname,
      phone_number: newUser.phone_number,
      educationType: newUser.educationType,
      program: newUser.program,
      level: newUser.level,
      secondaryCycle: newUser.secondaryCycle,
      series: newUser.series,
      seriesOrientation: newUser.seriesOrientation,
      role: newUser.role,
      avatar: newUser.avatar
    };

    // Définir le cookie HttpOnly sécurisé
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: "Compte ajouté avec succès",
      user: userData,
    });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }

};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user._id;

  try {
    // Vérifier que l'utilisateur ne modifie que son propre compte
    if (id !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas le droit de modifier ce compte" });
    }

    // Filtrer les champs autorisés uniquement (whitelist)
    const updateData = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Si on met à jour le mot de passe, on le hash
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Vérifier qu'il y a des champs à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Aucun champ valide à modifier" });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-password -authTokens');

    if (!user) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    res.json({ message: "Compte modifié avec succès", user });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

export const getUserInfos = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    const userInfos = {
      id: user._id,
      lastname: user.lastname,
      firstname: user.firstname,
      email: user.email,
      emailVerified: user.emailVerified || false,
      phone_number: user.phone_number,
      educationType: user.educationType || 'university',
      program: user.program,
      level: user.level,
      secondaryCycle: user.secondaryCycle,
      series: user.series,
      seriesOrientation: user.seriesOrientation,
      registration: user.registration,
      role: user.role,
      avatar: user.avatar,
      isAdmin: user.isAdmin || false,
      premium: user.premium || false,
      premiumExpiry: user.premiumExpiry,
      addedCourses: user.addedCourses || 0,
      accountStatus: user.accountStatus || 'active',
      authProvider: user.authProvider || 'local',
      mustAddEmail: user.mustAddEmail || false,
      // Trial info
      trialOffered: user.trialOffered || false,
      trialActive: user.trialActive || false,
      trialEndDate: user.trialEndDate,
      trialDeclined: user.trialDeclined || false,
    };

    res.json({ userInfos });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la récupération du profil" });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const userId = req.user && req.user._id;

  try {
    // Vérifier que l'utilisateur ne supprime que son propre compte
    if (id !== userId.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas le droit de supprimer ce compte" });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Compte introuvable" });
    }

    // CASCADE DELETE: Supprimer toutes les données associées à l'utilisateur
    const deleteResults = await Promise.allSettled([
      // Supprimer tous les cours de l'utilisateur
      CourseModel.deleteMany({ user_id: id }),
      // Supprimer tous les assets de cours
      CourseAssetsModel.deleteMany({ user_id: id }),
      // Supprimer toutes les conversations
      ConversationModel.deleteMany({ user_id: id }),
      // Supprimer toutes les activités
      ActivityModel.deleteMany({ user_id: id }),
    ]);

    // Logger les erreurs de suppression (mais ne pas bloquer)
    deleteResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Erreur cascade delete (index ${index}):`, result.reason);
      }
    });

    // Supprimer l'utilisateur
    await UserModel.findByIdAndDelete(id);

    res.json({ message: "Compte et toutes les données associées supprimés" });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

export const userLogin = async (req, res) => {
  const { phone_number, password } = req.body;

  try {
    // Normaliser le numero de telephone
    let normalizedPhone = String(phone_number).replace(/[\s\-\(\)\.]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.startsWith('00')) {
        normalizedPhone = '+' + normalizedPhone.slice(2);
      } else if (normalizedPhone.length === 10 && normalizedPhone.startsWith('0')) {
        normalizedPhone = '+225' + normalizedPhone;
      } else {
        normalizedPhone = '+225' + normalizedPhone;
      }
    }

    const user = await UserModel.findOne({ phone_number: normalizedPhone });

    // Message générique pour éviter l'énumération des utilisateurs
    const genericError = { message: "Identifiants incorrects" };

    if (!user) {
      // Délai pour éviter les timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return res.status(401).json(genericError);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(genericError);
    }

    const token = await user.genereteAuthTokenAndSaveUser();

    // Mettre à jour lastLogin et lastActivity
    user.lastLogin = new Date();
    user.lastActivity = new Date();

    // MIGRATION: Marquer les anciens utilisateurs sans email pour qu'ils ajoutent leur email
    if (!user.email && user.phone_number) {
      user.mustAddEmail = true;
      user.authProvider = 'phone'; // S'assurer que le provider est bien marqué
    }

    await user.save();

    // Retourner les données utilisateur (sans le mot de passe)
    const userData = {
      id: user._id,
      lastname: user.lastname,
      firstname: user.firstname,
      phone_number: user.phone_number,
      email: user.email,
      emailVerified: user.emailVerified || false,
      mustAddEmail: user.mustAddEmail || false,
      educationType: user.educationType || 'university',
      program: user.program,
      level: user.level,
      secondaryCycle: user.secondaryCycle,
      series: user.series,
      seriesOrientation: user.seriesOrientation,
      role: user.role,
      avatar: user.avatar
    };

    // Définir le cookie HttpOnly sécurisé
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: "Connexion réussie",
      user: userData,
      requiresEmail: user.mustAddEmail || false,
    });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

export const userForgotPassword = async (req, res) => {
  const { phone_number, newPassword, otp } = req.body;

  try {
    // ⚠️ SÉCURITÉ : Cette route est temporairement désactivée
    // TODO: Implémenter un système OTP/SMS avant de réactiver
    // Pour l'instant, retourner une erreur
    return res.status(501).json({
      message: "Fonctionnalité temporairement désactivée pour des raisons de sécurité. Contactez l'administrateur."
    });

    /* CODE À RÉACTIVER APRÈS IMPLÉMENTATION OTP
    // 1. Vérifier que l'OTP est valide
    const isValidOTP = await verifyOTP(phone_number, otp);
    if (!isValidOTP) {
      return res.status(400).json({ message: "Code OTP invalide ou expiré" });
    }

    const user = await UserModel.findOne({ phone_number });
    if (!user) {
      return res.status(404).json({ message: "Pas de compte pour ce numéro de téléphone" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Révoquer tous les tokens lors du changement de mot de passe
    await user.removeAllAuthTokens();

    await UserModel.updateOne({ phone_number }, { $set: { password: hashedPassword } });
    const token = await user.genereteAuthTokenAndSaveUser();
    res.json({ message: "Mot de passe modifié avec succès", token });
    */
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

// Vérifier l'identité de l'utilisateur (étape 1 de la réinitialisation)
export const verifyUserIdentity = async (req, res) => {
  const { phone_number, lastname } = req.body;

  try {
    if (!phone_number || !lastname) {
      return res.status(400).json({
        message: "Numéro de téléphone et nom requis"
      });
    }

    // Délai aléatoire pour éviter les timing attacks
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    // Échapper les caractères spéciaux regex dans le nom
    const escapedLastname = lastname.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Chercher l'utilisateur avec numéro ET nom (insensible à la casse)
    const user = await UserModel.findOne({
      phone_number,
      lastname: { $regex: new RegExp(`^${escapedLastname}$`, 'i') }
    });

    if (!user) {
      // Message générique pour ne pas révéler si le compte existe
      return res.status(400).json({
        message: "Les informations fournies ne correspondent à aucun compte"
      });
    }

    // Générer un token temporaire de réinitialisation (valide 10 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    res.json({
      success: true,
      message: "Identité vérifiée",
      resetToken,
      firstname: user.firstname // Pour personnaliser l'UI
    });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la vérification" });
  }
};

// Réinitialiser le mot de passe (étape 2)
export const resetPassword = async (req, res) => {
  const { phone_number, resetToken, newPassword } = req.body;

  try {
    if (!phone_number || !resetToken || !newPassword) {
      return res.status(400).json({
        message: "Informations manquantes"
      });
    }

    // Validation du mot de passe
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 6 caractères"
      });
    }

    // Chercher l'utilisateur avec le token valide
    const user = await UserModel.findOne({
      phone_number,
      resetPasswordToken: resetToken,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Lien de réinitialisation invalide ou expiré. Veuillez recommencer."
      });
    }

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Révoquer tous les tokens de connexion existants
    await user.removeAllAuthTokens();

    // Mettre à jour le mot de passe et supprimer le token de réinitialisation
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    // Générer un nouveau token de connexion
    const token = await user.genereteAuthTokenAndSaveUser();

    // Retourner les données utilisateur
    const userData = {
      id: user._id,
      lastname: user.lastname,
      firstname: user.firstname,
      phone_number: user.phone_number,
      educationType: user.educationType || 'university',
      program: user.program,
      level: user.level,
      secondaryCycle: user.secondaryCycle,
      series: user.series,
      seriesOrientation: user.seriesOrientation,
      role: user.role,
      avatar: user.avatar
    };

    // Définir le cookie HttpOnly sécurisé
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: "Mot de passe modifié avec succès",
      user: userData
    });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la réinitialisation" });
  }
};

export const userLogout = async (req, res) => {
  try {
    const token = req.token; // Token récupéré par authMiddleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer le token spécifique
    await user.removeAuthToken(token);

    // Supprimer le cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: isProduction ? '.misterall.tech' : undefined,
    });

    res.json({ message: "Déconnexion réussie" });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};

export const userLogoutAll = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Supprimer tous les tokens
    await user.removeAllAuthTokens();

    // Supprimer le cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      path: '/',
      domain: isProduction ? '.misterall.tech' : undefined,
    });

    res.json({ message: "Déconnexion de tous les appareils réussie" });
  } catch (e) {
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
};

// Vérifier si un numéro de téléphone existe déjà
// NOTE: Cette fonction retourne toujours "disponible" pour éviter l'énumération
// La vraie vérification se fait au moment de l'inscription
export const checkPhoneExists = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({
        message: "Numéro de téléphone requis"
      });
    }

    // Pour des raisons de sécurité, on ne révèle jamais si un numéro existe
    // On retourne toujours la même réponse avec un délai aléatoire
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));

    res.json({
      message: "Vérification effectuée"
    });

  } catch (e) {
    res.status(500).json({
      message: "Erreur lors de la vérification"
    });
  }
};

// Upload de photo de profil
export const uploadAvatar = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucune image fournie" });
    }

    // Construire l'URL de l'avatar
    const avatarUrl = `/avatars/${req.file.filename}`;

    // Mettre à jour l'avatar de l'utilisateur
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: "Photo de profil mise à jour",
      avatar: avatarUrl
    });
  } catch (e) {
    console.error("Erreur upload avatar:", e);
    res.status(500).json({ message: e.message || e });
  }
};

// Supprimer la photo de profil
export const deleteAvatar = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    user.avatar = "";
    await user.save();

    res.json({
      success: true,
      message: "Photo de profil supprimée"
    });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

// ADMIN ENDPOINTS - Gestion des abonnements premium

// Ajouter le premium à un utilisateur (+ 1 mois)
// Accepte: userId (MongoDB ID), email, ou phone_number
export const addPremiumToUser = async (req, res) => {
  try {
    const { userId, email, phone_number } = req.body;

    if (!userId && !email && !phone_number) {
      return res.status(400).json({ message: "ID utilisateur, email ou numéro de téléphone requis" });
    }

    let user;

    // Chercher par ID MongoDB si c'est un format valide
    if (userId && /^[0-9a-fA-F]{24}$/.test(userId)) {
      user = await UserModel.findById(userId);
    }

    // Sinon chercher par email
    if (!user && email) {
      user = await UserModel.findOne({ email: email.toLowerCase() });
    }

    // Ou par téléphone (legacy)
    if (!user && phone_number) {
      user = await UserModel.findOne({ phone_number });
    }

    // Si userId n'est pas un ID MongoDB, essayer de le traiter comme email ou téléphone
    if (!user && userId) {
      if (userId.includes('@')) {
        user = await UserModel.findOne({ email: userId.toLowerCase() });
      } else {
        user = await UserModel.findOne({ phone_number: userId });
      }
    }

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Calculer la date d'expiration (1 mois à partir de maintenant ou de l'expiration existante)
    const now = new Date();
    let premiumExpiry;

    if (user.premiumExpiry && user.premiumExpiry > now) {
      // Si le premium est déjà actif, ajouter 1 mois à la date existante
      premiumExpiry = new Date(user.premiumExpiry);
      premiumExpiry.setMonth(premiumExpiry.getMonth() + 1);
    } else {
      // Sinon, commencer à partir d'aujourd'hui
      premiumExpiry = new Date(now);
      premiumExpiry.setMonth(premiumExpiry.getMonth() + 1);
    }

    user.premium = true;
    user.premiumExpiry = premiumExpiry;
    user.addedCourses = 0; // Réinitialiser le compteur de cours
    await user.save();

    res.json({
      message: "Premium ajouté avec succès",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone_number: user.phone_number,
        premium: user.premium,
        premiumExpiry: user.premiumExpiry
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

// Retirer le premium d'un utilisateur
export const removePremiumFromUser = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "ID utilisateur requis" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    user.premium = false;
    user.premiumExpiry = null;
    await user.save();

    res.json({
      message: "Premium supprimé avec succès",
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        phone_number: user.phone_number,
        premium: user.premium,
        premiumExpiry: user.premiumExpiry
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

// Lister les abonnements qui expirent bientôt (dans les 7 prochains jours)
export const getExpiringPremiums = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Trouver les utilisateurs avec premium qui expirent dans 7 jours
    const expiringUsers = await UserModel.find({
      premium: true,
      premiumExpiry: {
        $gte: now,
        $lte: sevenDaysFromNow
      }
    }).select("_id firstname lastname phone_number premium premiumExpiry addedCourses").sort({ premiumExpiry: 1 });

    res.json({
      message: `${expiringUsers.length} abonnement(s) expire(nt) dans les 7 prochains jours`,
      count: expiringUsers.length,
      users: expiringUsers
    });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

// Lister tous les utilisateurs avec leurs informations premium
export const getAllUsersWithPremium = async (req, res) => {
  try {
    // SÉCURITÉ: Ne jamais exposer authTokens - on compte juste le nombre de sessions
    const users = await UserModel.find()
      .select("_id firstname lastname email phone_number emailVerified authProvider premium premiumExpiry addedCourses registration lastLogin lastActivity authTokens mustAddEmail")
      .sort({ registration: -1 })
      .lean(); // Utiliser lean() pour meilleures performances

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const usersData = users.map(user => {
      const lastActivityDate = user.lastActivity ? new Date(user.lastActivity) : null;
      const isOnline = lastActivityDate && lastActivityDate.getTime() > fiveMinutesAgo.getTime();

      return {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email || null,
        phone_number: user.phone_number || null,
        emailVerified: user.emailVerified || false,
        authProvider: user.authProvider || 'phone',
        mustAddEmail: user.mustAddEmail || false,
        premium: user.premium,
        premiumExpiry: user.premiumExpiry,
        addedCourses: user.addedCourses,
        registration: user.registration,
        lastLogin: user.lastLogin,
        lastActivity: user.lastActivity,
        isOnline,
        activeSessions: user.authTokens ? user.authTokens.length : 0,
        daysUntilExpiry: user.premiumExpiry ? Math.ceil((new Date(user.premiumExpiry) - now) / (1000 * 60 * 60 * 24)) : null
      };
    });

    // Compter les utilisateurs en ligne
    const onlineUsers = usersData.filter(u => u.isOnline).length;

    res.json({
      totalUsers: users.length,
      premiumUsers: users.filter(u => u.premium).length,
      onlineUsers,
      users: usersData
    });
  } catch (e) {
    res.status(500).json({ message: e.message || e });
  }
};

// =====================================================
// NEW EMAIL-BASED AUTHENTICATION FUNCTIONS
// =====================================================

/**
 * Generate a secure verification token
 */
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Signup with email (new primary method)
 */
export const signupWithEmail = async (req, res) => {
  try {
    const {
      email,
      password,
      lastname,
      firstname,
      educationType,
      program,
      level,
      secondaryCycle,
      series,
      seriesOrientation,
    } = req.body;

    // Validation
    if (!email || !password || !lastname || !firstname || !level) {
      return res.status(400).json({ message: "Champs obligatoires manquants" });
    }

    // Check email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    // Check if email already exists
    const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      // Delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return res.status(400).json({
        message: "Impossible de creer le compte. Verifiez vos informations."
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user - NO verification code at signup
    // User can use the app immediately, verification is optional (triggered manually)
    const newUser = new UserModel({
      email: email.toLowerCase(),
      password: hashedPassword,
      lastname,
      firstname,
      educationType,
      program: educationType === 'university' ? program : null,
      level,
      secondaryCycle: educationType === 'secondary' ? secondaryCycle : null,
      series: educationType === 'secondary' ? series : null,
      seriesOrientation: educationType === 'secondary' ? seriesOrientation : null,
      emailVerified: false,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
      accountStatus: 'active', // User can use the app immediately
      authProvider: 'local',
    });

    const token = await newUser.genereteAuthTokenAndSaveUser();

    // Send welcome email with 50% offer (NOT verification code)
    const emailResult = await sendWelcomeWithOfferEmail(email, firstname);
    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
    }

    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.status(201).json({
      success: true,
      message: "Compte cree avec succes !",
      user: {
        id: newUser._id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        emailVerified: newUser.emailVerified,
        accountStatus: newUser.accountStatus,
      },
      requiresVerification: false, // No immediate verification required
    });
  } catch (e) {
    console.error('Signup error:', e);
    res.status(500).json({ message: e.message || "Erreur lors de l'inscription" });
  }
};

/**
 * Login with email
 */
export const loginWithEmail = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis" });
    }

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    // Generic error to prevent user enumeration
    const genericError = { message: "Identifiants incorrects" };

    if (!user) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return res.status(401).json(genericError);
    }

    // Check if user is using different auth method
    if (user.authProvider === 'google') {
      return res.status(400).json({
        message: "Ce compte utilise Google pour se connecter. Utilise le bouton 'Continuer avec Google'."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(genericError);
    }

    // Check account status
    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ message: "Compte suspendu. Contacte l'administrateur." });
    }

    const token = await user.genereteAuthTokenAndSaveUser();

    // Update login timestamps
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    await user.save();

    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: "Connexion reussie",
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        emailVerified: user.emailVerified,
        accountStatus: user.accountStatus,
        educationType: user.educationType,
        program: user.program,
        level: user.level,
      },
      requiresVerification: !user.emailVerified,
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ message: "Erreur lors de la connexion" });
  }
};

/**
 * Google OAuth authentication
 */
export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ message: "Token Google requis" });
    }

    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: "L'authentification Google n'est pas disponible" });
    }

    // Verify the Firebase token
    const tokenResult = await verifyFirebaseToken(idToken);
    if (!tokenResult.success) {
      return res.status(401).json({ message: tokenResult.error });
    }

    const { uid, email, emailVerified, name, picture } = tokenResult;

    if (!email) {
      return res.status(400).json({ message: "Email non fourni par Google" });
    }

    // Check if user exists with this Google ID
    let user = await UserModel.findOne({ googleId: uid });
    let isNewUser = false;

    if (!user) {
      // Check if user exists with this email
      user = await UserModel.findOne({ email: email.toLowerCase() });

      if (user) {
        // Link Google account to existing user
        user.googleId = uid;
        if (emailVerified) {
          user.emailVerified = true;
          user.accountStatus = 'active';
        }
        if (picture && !user.avatar) {
          user.avatar = picture;
        }
        await user.save();
      } else {
        // Create new user with Google account
        isNewUser = true;

        // Split name into firstname and lastname
        const nameParts = (name || 'Utilisateur').split(' ');
        const firstname = nameParts[0];
        const lastname = nameParts.slice(1).join(' ') || firstname;

        user = new UserModel({
          email: email.toLowerCase(),
          googleId: uid,
          firstname,
          lastname,
          emailVerified: true, // Google verified the email
          accountStatus: 'active', // Immediate access
          authProvider: 'google',
          avatar: picture || '',
          // No default education - user must complete profile
        });
        await user.save();

        // Send welcome email in background (don't wait)
        sendWelcomeEmail(email, firstname).catch(err => {
          console.error('Failed to send welcome email:', err);
        });
      }
    }

    // Generate token and login
    const token = await user.genereteAuthTokenAndSaveUser();

    // Update login timestamps
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    await user.save();

    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    // Check if user needs to complete profile
    const needsProfile = !user.educationType || !user.level;

    res.json({
      success: true,
      message: "Connexion Google reussie",
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        emailVerified: user.emailVerified,
        accountStatus: user.accountStatus,
        educationType: user.educationType,
        program: user.program,
        level: user.level,
        avatar: user.avatar,
      },
      needsProfile,
      isNewUser,
    });
  } catch (e) {
    console.error('Google auth error:', e);
    res.status(500).json({ message: "Erreur lors de l'authentification Google" });
  }
};

/**
 * Google OAuth signup with profile data (for new users from signup flow)
 */
export const googleSignup = async (req, res) => {
  const {
    idToken,
    firstname,
    lastname,
    educationType,
    program,
    level,
    secondaryCycle,
    series,
    seriesOrientation
  } = req.body;

  // Debug log
  console.log('Google signup request:', {
    hasIdToken: !!idToken,
    firstname,
    lastname,
    educationType,
    program,
    level,
    secondaryCycle,
    series,
    seriesOrientation
  });

  try {
    // Validate required fields
    if (!idToken) {
      return res.status(400).json({ message: "Token Google requis" });
    }

    if (!firstname || !lastname) {
      return res.status(400).json({ message: "Nom et prenom requis" });
    }

    if (!educationType || !level) {
      return res.status(400).json({ message: "Informations educatives requises" });
    }

    if (!isFirebaseConfigured()) {
      return res.status(503).json({ message: "L'authentification Google n'est pas disponible" });
    }

    // Verify the Firebase token
    const tokenResult = await verifyFirebaseToken(idToken);
    if (!tokenResult.success) {
      return res.status(401).json({ message: tokenResult.error });
    }

    const { uid, email, emailVerified, picture } = tokenResult;

    if (!email) {
      return res.status(400).json({ message: "Email non fourni par Google" });
    }

    // Check if user already exists with this Google ID or email
    let existingUser = await UserModel.findOne({
      $or: [{ googleId: uid }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      // User exists - just log them in
      const token = await existingUser.genereteAuthTokenAndSaveUser();

      existingUser.lastLogin = new Date();
      existingUser.lastActivity = new Date();
      await existingUser.save();

      res.cookie('token', token, COOKIE_OPTIONS);

      return res.json({
        success: true,
        message: "Connexion reussie",
        user: {
          id: existingUser._id,
          email: existingUser.email,
          firstname: existingUser.firstname,
          lastname: existingUser.lastname,
          emailVerified: existingUser.emailVerified,
          accountStatus: existingUser.accountStatus,
          educationType: existingUser.educationType,
          program: existingUser.program,
          level: existingUser.level,
        }
      });
    }

    // Create new user with all profile data
    const newUser = new UserModel({
      email: email.toLowerCase(),
      googleId: uid,
      firstname,
      lastname,
      emailVerified: true, // Google verified the email
      accountStatus: 'active', // Immediate access
      authProvider: 'google',
      avatar: picture || '',
      educationType,
      program: educationType === 'university' ? program : null,
      level,
      secondaryCycle: educationType === 'secondary' ? secondaryCycle : null,
      series: educationType === 'secondary' ? series : null,
      seriesOrientation: educationType === 'secondary' ? seriesOrientation : null,
    });

    await newUser.save();

    // Generate token
    const token = await newUser.genereteAuthTokenAndSaveUser();

    // Update login timestamps
    newUser.lastLogin = new Date();
    newUser.lastActivity = new Date();
    await newUser.save();

    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    // Send welcome email in background
    sendWelcomeEmail(email, firstname).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.status(201).json({
      success: true,
      message: "Compte cree avec succes",
      user: {
        id: newUser._id,
        email: newUser.email,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        emailVerified: newUser.emailVerified,
        accountStatus: newUser.accountStatus,
        educationType: newUser.educationType,
        program: newUser.program,
        level: newUser.level,
      }
    });
  } catch (e) {
    console.error('Google signup error:', e.message);
    console.error('Stack:', e.stack);

    // Check for specific MongoDB validation errors
    if (e.name === 'ValidationError') {
      const messages = Object.values(e.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }

    // Check for duplicate key error
    if (e.code === 11000) {
      return res.status(400).json({ message: "Un compte existe deja avec cet email" });
    }

    res.status(500).json({ message: e.message || "Erreur lors de l'inscription Google" });
  }
};

/**
 * Verify email with token
 */
export const verifyEmail = async (req, res) => {
  // Accept code from body (POST) or params (legacy GET)
  const code = req.body.code || req.params.token;

  try {
    if (!code) {
      return res.status(400).json({ message: "Code de verification manquant" });
    }

    const user = await UserModel.findOne({
      emailVerificationToken: code,
      emailVerificationExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Code invalide ou expire. Demande un nouveau code.",
        expired: true
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.accountStatus = 'active';
    user.emailVerificationToken = null;
    user.emailVerificationExpiry = null;
    await user.save();

    // Send welcome email
    await sendWelcomeEmail(user.email, user.firstname);

    res.json({
      success: true,
      message: "Email verifie avec succes ! Ton compte est maintenant actif."
    });
  } catch (e) {
    console.error('Email verification error:', e);
    res.status(500).json({ message: "Erreur lors de la verification" });
  }
};

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: "Email deja verifie" });
    }

    // Generate new 6-digit code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.emailVerificationToken = verificationCode;
    user.emailVerificationExpiry = verificationExpiry;
    await user.save();

    // Send email with code
    const emailResult = await sendVerificationEmail(user.email, verificationCode, user.firstname);
    if (!emailResult.success) {
      return res.status(500).json({ message: "Erreur lors de l'envoi de l'email" });
    }

    res.json({
      success: true,
      message: "Code de verification envoye"
    });
  } catch (e) {
    console.error('Resend verification error:', e);
    res.status(500).json({ message: "Erreur lors de l'envoi" });
  }
};

/**
 * Request password reset via email
 */
export const forgotPasswordEmail = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    // Always return success to prevent user enumeration
    const genericSuccess = {
      success: true,
      message: "Si un compte existe avec cet email, tu recevras un code de reinitialisation."
    };

    const user = await UserModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
      return res.json(genericSuccess);
    }

    // Check auth provider
    if (user.authProvider === 'google') {
      // Don't reveal this, just return generic success
      return res.json(genericSuccess);
    }

    // Generate 6-digit reset code
    const resetCode = generateVerificationCode();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetPasswordToken = resetCode;
    user.resetPasswordExpiry = resetExpiry;
    await user.save();

    // Send reset email with code
    await sendPasswordResetEmail(user.email, resetCode, user.firstname);

    res.json(genericSuccess);
  } catch (e) {
    console.error('Forgot password error:', e);
    res.status(500).json({ message: "Erreur lors de la demande" });
  }
};

/**
 * Reset password with email code
 */
export const resetPasswordEmail = async (req, res) => {
  const { code, newPassword } = req.body;

  try {
    if (!code || !newPassword) {
      return res.status(400).json({ message: "Code et nouveau mot de passe requis" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caracteres" });
    }

    const user = await UserModel.findOne({
      resetPasswordToken: code,
      resetPasswordExpiry: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Code invalide ou expire. Demande un nouveau code.",
        expired: true
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Revoke all existing sessions
    await user.removeAllAuthTokens();

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;

    // Generate new token
    const authToken = await user.genereteAuthTokenAndSaveUser();

    // Set cookie
    res.cookie('token', authToken, COOKIE_OPTIONS);

    res.json({
      success: true,
      message: "Mot de passe modifie avec succes",
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      }
    });
  } catch (e) {
    console.error('Reset password error:', e);
    res.status(500).json({ message: "Erreur lors de la reinitialisation" });
  }
};

/**
 * Add email to existing phone-based account (for migration)
 */
export const addEmailToAccount = async (req, res) => {
  const { email } = req.body;

  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    if (user.email && user.emailVerified) {
      return res.status(400).json({ message: "Ce compte a deja un email verifie" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Format d'email invalide" });
    }

    // Check if email already exists (excluding current user)
    const existingUser = await UserModel.findOne({
      email: email.toLowerCase(),
      _id: { $ne: user._id }
    });
    if (existingUser) {
      return res.status(400).json({ message: "Cet email est deja utilise" });
    }

    // Generate 6-digit verification code
    const verificationCode = generateVerificationCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user
    user.email = email.toLowerCase();
    user.emailVerified = false;
    user.emailVerificationToken = verificationCode;
    user.emailVerificationExpiry = verificationExpiry;
    user.mustAddEmail = false;
    await user.save();

    // Send verification email with 6-digit code
    const emailResult = await sendVerificationEmail(email, verificationCode, user.firstname);
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }

    res.json({
      success: true,
      message: "Email ajoute. Verifie ta boite mail pour confirmer.",
      email: user.email
    });
  } catch (e) {
    console.error('Add email error:', e);
    res.status(500).json({ message: "Erreur lors de l'ajout de l'email" });
  }
};

// =====================================================
// TRIAL SYSTEM FUNCTIONS
// =====================================================

/**
 * Check if user is eligible for trial (J+1 after registration)
 */
export const checkTrialEligibility = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Already premium - no trial needed
    if (user.premium) {
      return res.json({
        eligible: false,
        reason: "already_premium",
        message: "Tu es déjà Premium !"
      });
    }

    // Trial already used or declined
    if (user.trialActive || user.trialOffered || user.trialDeclined) {
      return res.json({
        eligible: false,
        reason: user.trialDeclined ? "declined" : "already_used",
        message: user.trialDeclined
          ? "Tu as décliné l'offre d'essai"
          : "Tu as déjà utilisé ton essai gratuit"
      });
    }

    // Check if J+1 after registration (24 hours)
    const now = new Date();
    const registrationDate = new Date(user.registration);
    const hoursSinceRegistration = (now - registrationDate) / (1000 * 60 * 60);

    // Eligible if at least 24 hours since registration
    if (hoursSinceRegistration >= 24) {
      return res.json({
        eligible: true,
        message: "Tu peux activer ton essai gratuit de 7 jours !",
        hoursSinceRegistration: Math.floor(hoursSinceRegistration)
      });
    }

    // Not yet eligible - need to wait
    const hoursRemaining = Math.ceil(24 - hoursSinceRegistration);
    return res.json({
      eligible: false,
      reason: "too_early",
      message: `L'essai gratuit sera disponible dans ${hoursRemaining}h`,
      hoursRemaining
    });

  } catch (e) {
    console.error('Check trial eligibility error:', e);
    res.status(500).json({ message: "Erreur lors de la vérification" });
  }
};

/**
 * Activate 7-day free trial
 */
export const activateTrial = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Check if already premium
    if (user.premium) {
      return res.status(400).json({
        message: "Tu es déjà Premium !",
        reason: "already_premium"
      });
    }

    // Check if trial already used
    if (user.trialActive || user.trialOffered) {
      return res.status(400).json({
        message: "Tu as déjà utilisé ton essai gratuit",
        reason: "already_used"
      });
    }

    // Check if declined
    if (user.trialDeclined) {
      return res.status(400).json({
        message: "Tu as décliné l'offre d'essai",
        reason: "declined"
      });
    }

    // Check eligibility (J+1)
    const now = new Date();
    const registrationDate = new Date(user.registration);
    const hoursSinceRegistration = (now - registrationDate) / (1000 * 60 * 60);

    if (hoursSinceRegistration < 24) {
      return res.status(400).json({
        message: "L'essai gratuit n'est pas encore disponible",
        reason: "too_early",
        hoursRemaining: Math.ceil(24 - hoursSinceRegistration)
      });
    }

    // Activate trial
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 days

    user.trialOffered = true;
    user.trialActive = true;
    user.trialStartDate = now;
    user.trialEndDate = trialEndDate;
    user.premium = true;
    user.premiumExpiry = trialEndDate;
    user.addedCourses = 0; // Reset course counter

    await user.save();

    res.json({
      success: true,
      message: "Essai gratuit de 7 jours activé ! Profite de toutes les fonctionnalités Premium.",
      trialEndDate,
      daysRemaining: 7
    });

  } catch (e) {
    console.error('Activate trial error:', e);
    res.status(500).json({ message: "Erreur lors de l'activation" });
  }
};

/**
 * Decline trial offer
 */
export const declineTrial = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Already premium or trial used
    if (user.premium || user.trialActive || user.trialOffered) {
      return res.status(400).json({
        message: "Cette action n'est pas disponible",
        reason: user.premium ? "already_premium" : "already_used"
      });
    }

    user.trialDeclined = true;
    user.trialOffered = true; // Mark as offered so we don't show again

    await user.save();

    res.json({
      success: true,
      message: "Pas de problème ! Tu pourras toujours passer à Premium plus tard."
    });

  } catch (e) {
    console.error('Decline trial error:', e);
    res.status(500).json({ message: "Erreur lors du refus" });
  }
};

/**
 * Update user profile for Google users who need to complete their profile
 */
export const updateGoogleUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const { educationType, program, level, secondaryCycle, series, seriesOrientation } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    // Update profile fields
    if (educationType) user.educationType = educationType;
    if (program !== undefined) user.program = program;
    if (level) user.level = level;
    if (secondaryCycle !== undefined) user.secondaryCycle = secondaryCycle;
    if (series !== undefined) user.series = series;
    if (seriesOrientation !== undefined) user.seriesOrientation = seriesOrientation;

    await user.save();

    res.json({
      success: true,
      message: "Profil mis a jour",
      user: {
        id: user._id,
        educationType: user.educationType,
        program: user.program,
        level: user.level,
        secondaryCycle: user.secondaryCycle,
        series: user.series,
        seriesOrientation: user.seriesOrientation,
      }
    });
  } catch (e) {
    console.error('Update profile error:', e);
    res.status(500).json({ message: "Erreur lors de la mise a jour" });
  }
};