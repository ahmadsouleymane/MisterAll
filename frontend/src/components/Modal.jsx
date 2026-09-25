import { useEffect, useRef, useCallback, useState } from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

function Modal({ type, message, title: customTitle, buttons, autoClose = true, onClose }) {
  const modalRef = useRef(null)
  const firstButtonRef = useRef(null)
  const previousActiveElement = useRef(null)
  const [progress, setProgress] = useState(100)
  const [isExiting, setIsExiting] = useState(false)

  const AUTO_CLOSE_DURATION = 4000

  // Sauvegarder l'élément actif et focus le modal à l'ouverture
  useEffect(() => {
    previousActiveElement.current = document.activeElement

    if (buttons && firstButtonRef.current) {
      firstButtonRef.current.focus()
    } else if (modalRef.current) {
      modalRef.current.focus()
    }

    return () => {
      if (previousActiveElement.current) {
        previousActiveElement.current.focus()
      }
    }
  }, [buttons])

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  // Focus trap pour les modals avec boutons
  const handleKeyDown = useCallback((e) => {
    if (e.key !== "Tab" || !buttons) return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }, [buttons])

  // Animation de fermeture
  const handleClose = useCallback(() => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 200)
  }, [onClose])

  // Auto-close avec progress bar
  useEffect(() => {
    if (autoClose && !buttons) {
      const startTime = Date.now()
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 100 - (elapsed / AUTO_CLOSE_DURATION) * 100)
        setProgress(remaining)

        if (remaining === 0) {
          clearInterval(interval)
          handleClose()
        }
      }, 16)

      return () => clearInterval(interval)
    }
  }, [autoClose, buttons, handleClose])

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bg: 'bg-success/10',
      border: 'border-success/30',
      iconColor: 'text-success',
      progressBg: 'bg-success',
      shadow: 'shadow-success-sm',
      title: 'Succès'
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-error/10',
      border: 'border-error/30',
      iconColor: 'text-error',
      progressBg: 'bg-error',
      shadow: 'shadow-error-sm',
      title: 'Erreur'
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      iconColor: 'text-warning',
      progressBg: 'bg-warning',
      shadow: 'shadow-warning-sm',
      title: 'Attention'
    },
    info: {
      icon: Info,
      bg: 'bg-info/10',
      border: 'border-info/30',
      iconColor: 'text-info',
      progressBg: 'bg-info',
      shadow: 'shadow-info-sm',
      title: 'Information'
    }
  }

  const config = typeConfig[type] || typeConfig.info
  const Icon = config.icon
  const title = customTitle || config.title

  const handleButtonClick = (button) => {
    button.action?.()
    handleClose()
  }

  // Toast moderne (notification flottante)
  if (!buttons) {
    return (
      <div
        className={`
          fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-[100]
          ${isExiting ? 'animate-toast-exit' : 'animate-toast-enter'}
        `}
      >
        <div
          ref={modalRef}
          role="alert"
          aria-live="polite"
          tabIndex={-1}
          className={`
            relative overflow-hidden
            bg-surface border ${config.border}
            rounded-xl ${config.shadow}
            backdrop-blur-xl
          `}
        >
          {/* Contenu principal */}
          <div className="flex items-start gap-3 p-4">
            {/* Icône avec cercle de fond */}
            <div className={`
              flex-shrink-0 w-10 h-10 rounded-full
              ${config.bg} flex items-center justify-center
            `}>
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            </div>

            {/* Texte */}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className={`text-sm font-bold ${config.iconColor} mb-0.5`}>
                {title}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {message}
              </p>
            </div>

            {/* Bouton fermer */}
            <button
              onClick={handleClose}
              aria-label="Fermer la notification"
              className="
                flex-shrink-0 p-1.5 rounded-lg
                text-text-tertiary hover:text-text-primary
                hover:bg-white/5 transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-accent/50
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Barre de progression */}
          {autoClose && (
            <div className="h-1 bg-white/5">
              <div
                className={`h-full ${config.progressBg} transition-all duration-100 ease-linear`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  // Modal de confirmation moderne
  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4
        ${isExiting ? 'animate-fade-out' : 'animate-fade-in'}
      `}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-message"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`
          relative w-full max-w-md
          bg-surface border border-white/10
          rounded-2xl shadow-premium
          ${isExiting ? 'animate-modal-exit' : 'animate-modal-enter'}
          focus:outline-none overflow-hidden
        `}
      >
        {/* Header avec icône */}
        <div className="p-6 pb-4 text-center">
          {/* Icône animée */}
          <div className={`
            w-16 h-16 mx-auto mb-4 rounded-full
            ${config.bg} border-2 ${config.border}
            flex items-center justify-center
            animate-bounce-subtle
          `}>
            <Icon className={`h-8 w-8 ${config.iconColor}`} />
          </div>

          {/* Titre */}
          <h2
            id="modal-title"
            className={`text-xl font-bold ${config.iconColor} mb-2`}
          >
            {title}
          </h2>

          {/* Message */}
          <p
            id="modal-message"
            className="text-text-secondary text-sm leading-relaxed"
          >
            {message}
          </p>
        </div>

        {/* Footer avec boutons */}
        <div className="px-6 pb-6">
          <div className="flex gap-3" role="group" aria-label="Actions">
            {buttons.map((button, index) => (
              <button
                key={index}
                ref={index === 0 ? firstButtonRef : null}
                onClick={() => handleButtonClick(button)}
                className={`
                  flex-1 py-3 px-4 rounded-xl font-bold text-sm
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface
                  ${button.style === 'confirm'
                    ? `
                      bg-accent text-dark
                      hover:bg-accent/90 hover:scale-[1.02]
                      active:scale-95
                      shadow-neon-accent
                      focus:ring-accent
                    `
                    : `
                      bg-surface/50 border border-white/10
                      text-text-secondary
                      hover:border-accent/30 hover:text-text-primary hover:bg-surface
                      active:scale-95
                      focus:ring-white/20
                    `
                  }
                `}
              >
                {button.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
