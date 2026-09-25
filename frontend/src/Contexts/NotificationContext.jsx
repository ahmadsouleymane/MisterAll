import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const NotificationContext = createContext(null)

// Types de notifications avec leurs styles
const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    bgClass: 'bg-success/10 border-success/30',
    iconClass: 'text-success',
    progressClass: 'bg-success'
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-error/10 border-error/30',
    iconClass: 'text-error',
    progressClass: 'bg-error'
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-warning/10 border-warning/30',
    iconClass: 'text-warning',
    progressClass: 'bg-warning'
  },
  info: {
    icon: Info,
    bgClass: 'bg-info/10 border-info/30',
    iconClass: 'text-info',
    progressClass: 'bg-info'
  }
}

/**
 * Composant Toast individuel
 */
function Toast({ notification, onClose }) {
  const { type = 'info', title, message, duration = 5000 } = notification
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info
  const Icon = config.icon

  // Auto-dismiss
  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(notification.id), duration)
      return () => clearTimeout(timer)
    }
  }, [duration, notification.id, onClose])

  return (
    <div
      className={`
        relative overflow-hidden
        flex items-start gap-3 p-4
        rounded-xl border backdrop-blur-xl
        shadow-lg animate-slide-up
        ${config.bgClass}
      `}
      role="alert"
    >
      {/* Icon */}
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconClass}`} />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-bold text-text-primary text-sm">{title}</p>
        )}
        {message && (
          <p className="text-text-secondary text-sm mt-0.5">{message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(notification.id)}
        className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4 text-text-tertiary" />
      </button>

      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
          <div
            className={`h-full ${config.progressClass}`}
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

/**
 * Provider pour le système de notifications in-app
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  // Générer un ID unique
  const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const id = generateId()
    const newNotification = { id, ...notification }

    setNotifications(prev => [...prev, newNotification])

    return id
  }, [])

  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  // Supprimer toutes les notifications
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  /**
   * Fonction simple pour envoyer une notification
   * @param {string} message - Message à afficher
   * @param {object} options - Options (type, title, duration)
   *
   * @example
   * notify('Cours ajouté avec succès !', { type: 'success' })
   * notify('Erreur de connexion', { type: 'error', title: 'Oups !' })
   */
  const notify = useCallback((message, options = {}) => {
    return addNotification({
      message,
      type: options.type || 'info',
      title: options.title,
      duration: options.duration ?? 5000
    })
  }, [addNotification])

  // Helpers raccourcis
  const success = useCallback((message, options = {}) => {
    return notify(message, { ...options, type: 'success' })
  }, [notify])

  const error = useCallback((message, options = {}) => {
    return notify(message, { ...options, type: 'error' })
  }, [notify])

  const warning = useCallback((message, options = {}) => {
    return notify(message, { ...options, type: 'warning' })
  }, [notify])

  const info = useCallback((message, options = {}) => {
    return notify(message, { ...options, type: 'info' })
  }, [notify])

  const value = {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    remove: removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Container des toasts */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast
              notification={notification}
              onClose={removeNotification}
            />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

/**
 * Hook pour utiliser les notifications
 * @returns {object} - Fonctions pour envoyer des notifications
 *
 * @example
 * const { notify, success, error } = useNotification()
 *
 * // Notification simple
 * notify('Hello world!')
 *
 * // Avec type
 * success('Cours créé !')
 * error('Échec de la connexion')
 *
 * // Avec options
 * notify('Message', { type: 'warning', title: 'Attention', duration: 10000 })
 */
export function useNotification() {
  const context = useContext(NotificationContext)

  if (!context) {
    throw new Error('useNotification doit être utilisé dans NotificationProvider')
  }

  return context
}

export default NotificationContext
