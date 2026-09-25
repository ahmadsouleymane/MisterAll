import webpush from 'web-push'
import PushSubscription from '../models/pushSubscriptionModel.js'

// Configuration VAPID
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY
}

// Initialiser web-push si les clés sont présentes
if (vapidKeys.publicKey && vapidKeys.privateKey) {
  webpush.setVapidDetails(
    process.env.VAPID_EMAIL || 'mailto:contact@misterall.tech',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

/**
 * Fonction simple pour envoyer une notification push
 * @param {string} userId - ID de l'utilisateur
 * @param {string} title - Titre de la notification
 * @param {string} body - Corps du message
 * @param {object} options - Options supplémentaires (icon, url, data)
 * @returns {Promise<{success: number, failed: number}>}
 *
 * @example
 * // Envoyer une notification simple
 * await sendPushToUser(userId, 'Cours prêt !', 'Ton cours de Maths est prêt à réviser')
 *
 * // Avec options
 * await sendPushToUser(userId, 'Quiz terminé', 'Score: 8/10', {
 *   icon: '/icons/quiz.png',
 *   url: '/course/123',
 *   data: { courseId: '123' }
 * })
 */
export async function sendPushToUser(userId, title, body, options = {}) {
  try {
    // Récupérer toutes les subscriptions actives de l'utilisateur
    const subscriptions = await PushSubscription.find({
      user_id: userId,
      isActive: true
    })

    if (subscriptions.length === 0) {
      return { success: 0, failed: 0, message: 'Aucune subscription active' }
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      url: options.url || '/',
      data: options.data || {},
      timestamp: Date.now()
    })

    let success = 0
    let failed = 0

    // Envoyer à toutes les subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload)
          return { success: true }
        } catch (error) {
          // Si subscription expirée ou invalide, la désactiver
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.findByIdAndUpdate(sub._id, { isActive: false })
          }
          throw error
        }
      })
    )

    results.forEach(result => {
      if (result.status === 'fulfilled') success++
      else failed++
    })

    return { success, failed }
  } catch (error) {
    console.error('Erreur envoi push:', error)
    throw error
  }
}

/**
 * Envoyer une notification à plusieurs utilisateurs
 * @param {string[]} userIds - Liste des IDs utilisateurs
 * @param {string} title - Titre
 * @param {string} body - Message
 * @param {object} options - Options
 */
export async function sendPushToUsers(userIds, title, body, options = {}) {
  const results = await Promise.allSettled(
    userIds.map(userId => sendPushToUser(userId, title, body, options))
  )

  let totalSuccess = 0
  let totalFailed = 0

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      totalSuccess += result.value.success
      totalFailed += result.value.failed
    }
  })

  return { success: totalSuccess, failed: totalFailed }
}

/**
 * Envoyer une notification à tous les utilisateurs
 * @param {string} title - Titre
 * @param {string} body - Message
 * @param {object} options - Options
 */
export async function sendPushToAll(title, body, options = {}) {
  try {
    const subscriptions = await PushSubscription.find({ isActive: true })

    const payload = JSON.stringify({
      title,
      body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      url: options.url || '/',
      data: options.data || {},
      timestamp: Date.now()
    })

    let success = 0
    let failed = 0

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification({
            endpoint: sub.endpoint,
            keys: sub.keys
          }, payload)
          return { success: true }
        } catch (error) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            await PushSubscription.findByIdAndUpdate(sub._id, { isActive: false })
          }
          throw error
        }
      })
    )

    results.forEach(result => {
      if (result.status === 'fulfilled') success++
      else failed++
    })

    return { success, failed }
  } catch (error) {
    console.error('Erreur envoi push global:', error)
    throw error
  }
}

// ============ CONTROLLERS API ============

/**
 * Récupérer la clé publique VAPID
 */
export const getVapidPublicKey = (req, res) => {
  if (!vapidKeys.publicKey) {
    return res.status(500).json({ message: 'VAPID non configuré' })
  }
  res.json({ publicKey: vapidKeys.publicKey })
}

/**
 * Souscrire aux notifications push
 */
export const subscribe = async (req, res) => {
  try {
    const { subscription, device } = req.body
    const userId = req.user._id

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: 'Subscription invalide' })
    }

    // Vérifier si cette subscription existe déjà
    const existing = await PushSubscription.findOne({ endpoint: subscription.endpoint })

    if (existing) {
      // Mettre à jour si nécessaire
      existing.user_id = userId
      existing.keys = subscription.keys
      existing.device = device || existing.device
      existing.isActive = true
      await existing.save()
      return res.json({ message: 'Subscription mise à jour', id: existing._id })
    }

    // Créer nouvelle subscription
    const newSub = await PushSubscription.create({
      user_id: userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      device: device || 'unknown'
    })

    res.status(201).json({ message: 'Subscription créée', id: newSub._id })
  } catch (error) {
    console.error('Erreur subscription:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Se désabonner des notifications
 */
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body
    const userId = req.user._id

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint requis' })
    }

    const result = await PushSubscription.findOneAndUpdate(
      { endpoint, user_id: userId },
      { isActive: false }
    )

    if (!result) {
      return res.status(404).json({ message: 'Subscription non trouvée' })
    }

    res.json({ message: 'Désabonné avec succès' })
  } catch (error) {
    console.error('Erreur unsubscribe:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Vérifier le statut de subscription de l'utilisateur
 */
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id

    const subscriptions = await PushSubscription.find({
      user_id: userId,
      isActive: true
    }).select('device createdAt')

    res.json({
      isSubscribed: subscriptions.length > 0,
      devices: subscriptions.map(s => ({
        device: s.device,
        subscribedAt: s.createdAt
      }))
    })
  } catch (error) {
    console.error('Erreur status:', error)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}

/**
 * Envoyer une notification test (pour debug)
 */
export const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user._id

    const result = await sendPushToUser(
      userId,
      'Test Notification',
      'Si tu vois ceci, les notifications fonctionnent !',
      { url: '/profile' }
    )

    res.json({
      message: 'Notification envoyée',
      ...result
    })
  } catch (error) {
    console.error('Erreur test notification:', error)
    res.status(500).json({ message: 'Erreur envoi notification' })
  }
}
