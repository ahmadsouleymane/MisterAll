import { body, param, validationResult } from "express-validator";
import mongoSanitize from "mongo-sanitize";

// Middleware pour gérer les erreurs de validation
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Données invalides",
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

// Validation pour l'inscription
export const signupValidation = [
  body("lastname")
    .trim()
    .notEmpty()
    .withMessage("Le nom est requis")
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage("Le nom ne peut contenir que des lettres"),

  body("firstname")
    .trim()
    .notEmpty()
    .withMessage("Le prénom est requis")
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage("Le prénom ne peut contenir que des lettres"),

  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Le numéro de téléphone est requis")
    .matches(/^[0-9+\s-]{8,15}$/)
    .withMessage("Format de numéro de téléphone invalide"),

  body("password")
    .notEmpty()
    .withMessage("Le mot de passe est requis")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
    
  body("program")
    .trim()
    .optional()
    .isLength({ max: 100 })
    .withMessage("Le programme ne peut pas dépasser 100 caractères"),

  body("level")
    .trim()
    .optional()
    .isLength({ max: 50 })
    .withMessage("Le niveau ne peut pas dépasser 50 caractères"),

  handleValidationErrors,
];

// Validation pour la connexion
export const loginValidation = [
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Le numéro de téléphone est requis"),

  body("password").notEmpty().withMessage("Le mot de passe est requis"),

  handleValidationErrors,
];

// Validation pour la mise à jour utilisateur
export const updateUserValidation = [
  param("id").isMongoId().withMessage("ID utilisateur invalide"),

  body("lastname")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le nom doit contenir entre 2 et 50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage("Le nom ne peut contenir que des lettres"),

  body("firstname")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Le prénom doit contenir entre 2 et 50 caractères")
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage("Le prénom ne peut contenir que des lettres"),

  body("password")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),

  handleValidationErrors,
];

// Validation pour ID MongoDB
export const mongoIdValidation = [
  param("id").isMongoId().withMessage("ID invalide"),
  handleValidationErrors,
];

// Validation pour vérification numéro de téléphone
export const checkPhoneValidation = [
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Le numéro de téléphone est requis"),
  handleValidationErrors,
];

// Sanitizer anti-injection NoSQL (utilise mongo-sanitize)
export const sanitizeInput = (req, res, next) => {
  // Sanitize les données entrantes pour prévenir les injections NoSQL
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize(req.query);
  }
  if (req.params) {
    req.params = mongoSanitize(req.params);
  }

  next();
};
