import { useState, useEffect, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL

/**
 * Hook pour gérer les notifications push
 * @returns {object} - État et fonctions pour les notifications push
 */
export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState('default')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Vérifier le support au montage
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator &&
                       'PushManager' in window &&
                       'Notification' in window

      setIsSupported(supported)

      if (supported) {
        setPermission(Notification.permission)
        checkSubscription()
      }
    }

    checkSupport()
  }, [])

  // Vérifier si l'utilisateur est déjà abonné
  const checkSubscription = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
      return !!subscription
    } catch (err) {
      console.error('Erreur vérification subscription:', err)
      return false
    }
  }, [])

  // Récupérer la clé publique VAPID
  const getVapidPublicKey = async () => {
    const response = await fetch(`${API_URL}/notifications/vapid-public-key`)
    if (!response.ok) throw new Error('Impossible de récupérer la clé VAPID')
    const data = await response.json()
    return data.publicKey
  }

  // Convertir la clé VAPID en Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // Détecter le type d'appareil
  const getDeviceType = () => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS'
    if (/Android/.test(ua)) return 'Android'
    if (/Windows/.test(ua)) return 'Windows'
    if (/Mac/.test(ua)) return 'Mac'
    if (/Linux/.test(ua)) return 'Linux'
    return 'unknown'
  }

  // S'abonner aux notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Les notifications push ne sont pas supportées')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Demander la permission
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        setError('Permission refusée pour les notifications')
        setLoading(false)
        return false
      }

      // Récupérer la clé VAPID
      const vapidPublicKey = await getVapidPublicKey()
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey)

      // S'abonner via le Service Worker
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey
      })

      // Envoyer la subscription au backend
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          device: getDeviceType()
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement')
      }

      setIsSubscribed(true)
      setLoading(false)
      return true
    } catch (err) {
      console.error('Erreur subscription:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }, [isSupported])

  // Se désabonner
  const unsubscribe = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Désabonner côté Push Manager
        await subscription.unsubscribe()

        // Informer le backend
        const token = localStorage.getItem('token')
        await fetch(`${API_URL}/notifications/unsubscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint
          })
        })
      }

      setIsSubscribed(false)
      setLoading(false)
      return true
    } catch (err) {
      console.error('Erreur unsubscribe:', err)
      setError(err.message)
      setLoading(false)
      return false
    }
  }, [])

  // Envoyer une notification test
  const sendTest = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Erreur envoi test')
      }

      return true
    } catch (err) {
      console.error('Erreur test notification:', err)
      setError(err.message)
      return false
    }
  }, [])

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTest,
    checkSubscription
  }
}

export default usePushNotifications
