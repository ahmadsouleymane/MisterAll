import mongoose from "mongoose";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({
  lastname: { type: String, required: true, minlength: 2 },
  firstname: { type: String, required: true, minlength: 2 },

  // Email authentication (new primary method)
  // Index is defined at schema level with sparse: true
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalide']
  },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationExpiry: { type: Date, default: null },

  // Account status
  accountStatus: {
    type: String,
    enum: ['pending', 'active', 'suspended'],
    default: 'pending'
  },

  // Auth provider tracking
  authProvider: {
    type: String,
    enum: ['local', 'google', 'phone'],
    default: 'local'
  },

  // Google OAuth
  // Index is defined at schema level with sparse: true
  googleId: {
    type: String
  },

  // Migration flag for existing phone users
  mustAddEmail: { type: Boolean, default: false },

  // Phone number (now optional, for legacy users)
  // NOTE: No default value - field should not exist for email/Google users
  // Index is defined at schema level with sparse: true
  phone_number: {
    type: String,
    required: false,
    minlength: 10,
    maxlength: 15
  },

  // Type d'education: universitaire ou secondaire
  educationType: {
    type: String,
    required: true,
    enum: ['university', 'secondary'],
    default: 'university'  // Compatibilite avec utilisateurs existants
  },

  // Pour les universitaires uniquement
  program: {
    type: String,
    default: null
  },

  // Niveau: L1-M2 pour universitaires, 6eme-Tle pour secondaire
  level: { type: String, default: null },

  // Cycle du secondaire: college (6eme-3eme) ou lycee (2nde-Tle)
  secondaryCycle: {
    type: String,
    enum: ['college', 'lycee', null],
    default: null
  },

  // Serie du baccalaureat pour 1ere et Terminale
  series: {
    type: String,
    default: null  // A1, A2, B, C, D, E, F1-F7, G1, G2, H1-H3
  },

  // Orientation pour les eleves de 2nde (tronc commun)
  seriesOrientation: {
    type: String,
    enum: ['litteraire', 'scientifique', 'technique', null],
    default: null
  },
  password: { type: String, required: false, minlength: 6 }, // Optional for Google OAuth users
  registration: { type: Date, default: Date.now },
  role: { type: String, default: "student" },
  avatar: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
  lastActivity: { type: Date, default: null },
  premium: { type: Boolean, default: false },
  premiumExpiry: { type: Date, default: null },

  // Trial system
  trialOffered: { type: Boolean, default: false },
  trialActive: { type: Boolean, default: false },
  trialStartDate: { type: Date, default: null },
  trialEndDate: { type: Date, default: null },
  trialDeclined: { type: Boolean, default: false },

  // Moneroo payment data
  moneroo: {
    lastPaymentId: { type: String, default: null },
    lastPaymentDate: { type: Date, default: null }
  },
  authTokens: [{
    authToken: {
      type: String,
      required: true,
    }
  }],
  addedCourses: {type: Number, default: 0},

  // Reset password
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpiry: { type: Date, default: null },

  // Streak tracking
  streak: {
    current: { type: Number, default: 0 },
    longest: { type: Number, default: 0 },
    lastStudyDate: { type: Date, default: null },
    freezesRemaining: { type: Number, default: 0 }, // Premium feature
    freezeUsedToday: { type: Boolean, default: false }
  },

  // Study time tracking (in minutes)
  studyTime: {
    total: { type: Number, default: 0 },
    today: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    weeklyGoal: { type: Number, default: 30 },
    lastResetDate: { type: Date, default: null }
  },

  // Achievements
  achievements: [{
    id: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now },
    seen: { type: Boolean, default: false }
  }],

  // Gamification
  gamification: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  }
});

userSchema.methods.genereteAuthTokenAndSaveUser = async function () {
  // Token sans expiration - l'utilisateur reste connecté pour toujours
  const authToken = jwt.sign(
    { _id: this._id.toString() },
    process.env.KEY
    // Pas de expiresIn = token permanent
  );

  // Limiter à 3 tokens maximum (3 appareils)
  this.authTokens.push({ authToken });
  if (this.authTokens.length > 3) {
    this.authTokens.shift(); // Supprime le plus ancien
  }

  await this.save();
  return authToken;
}

// Méthode pour supprimer un token spécifique (déconnexion)
userSchema.methods.removeAuthToken = async function (token) {
  this.authTokens = this.authTokens.filter(t => t.authToken !== token);
  await this.save();
}

// Méthode pour supprimer tous les tokens (déconnexion de tous les appareils)
userSchema.methods.removeAllAuthTokens = async function () {
  this.authTokens = [];
  await this.save();
}

// Indexes pour les requêtes fréquentes
userSchema.index({ phone_number: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ premiumExpiry: 1 }); // Pour getExpiringPremiums
userSchema.index({ trialEndDate: 1 }); // Pour l'expiration des trials
userSchema.index({ lastActivity: -1 }); // Pour les stats d'activité
userSchema.index({ 'gamification.xp': -1 }); // Pour le classement

export default mongoose.model("User", userSchema);

