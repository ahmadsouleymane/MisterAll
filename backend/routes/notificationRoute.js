import express from 'express'
import {
  getVapidPublicKey,
  subscribe,
  unsubscribe,
  getSubscriptionStatus,
  sendTestNotification
} from '../controllers/notificationController.js'
import { authMiddleware } from '../middlewares/auth.js'

const router = express.Router()

// Route publique - récupérer la clé VAPID
router.get('/vapid-public-key', getVapidPublicKey)

// Routes protégées
router.post('/subscribe', authMiddleware, subscribe)
router.post('/unsubscribe', authMiddleware, unsubscribe)
router.get('/status', authMiddleware, getSubscriptionStatus)
router.post('/test', authMiddleware, sendTestNotification)

export default router
