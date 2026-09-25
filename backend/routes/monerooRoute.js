import express from 'express';
import { authMiddleware } from '../middlewares/auth.js';
import {
  initializePayment,
  verifyPayment,
  handleWebhook
} from '../controllers/monerooController.js';

const router = express.Router();

// Routes protegees (authentification requise)
router.post('/initialize', authMiddleware, initializePayment);
router.get('/verify/:paymentId', authMiddleware, verifyPayment);

// Webhook Moneroo (pas d'auth, mais verifie par signature)
router.post('/webhook', handleWebhook);

export default router;
