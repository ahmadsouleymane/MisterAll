import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  sendMessage,
  sendMessageStream,
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
  updateConversation,
  getMessageLimits
} from "../controllers/chatController.js";

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// Envoyer un message et recevoir la réponse IA
router.post("/send", sendMessage);

// Envoyer un message avec streaming SSE
router.post("/stream", sendMessageStream);

// Récupérer les limites de messages de l'utilisateur
router.get("/limits", getMessageLimits);

// Liste des conversations
router.get("/conversations", getConversations);

// Détails d'une conversation
router.get("/conversation/:id", getConversation);

// Créer une nouvelle conversation
router.post("/conversation", createConversation);

// Supprimer une conversation
router.delete("/conversation/:id", deleteConversation);

// Modifier le titre d'une conversation
router.patch("/conversation/:id", updateConversation);

export default router;
