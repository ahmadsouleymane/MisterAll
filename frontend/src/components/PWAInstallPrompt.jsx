import React, { useState, useEffect } from 'react'
import { X, Download, Share, Plus, MoreVertical, Smartphone, Monitor, CheckCircle } from 'lucide-react'
import useDeviceDetect from '../hooks/useDeviceDetect'

/**
 * Composant pour suggérer l'installation de la PWA
 * Affiche un tutoriel adapté selon l'OS (iOS, Android, Desktop)
 */
function PWAInstallPrompt() {
  const {
    os,
    browser,
    isMobile,
    isStandalone,
    isPWAInstalled,
    canInstall,
    installPrompt,
    promptInstall
  } = useDeviceDetect()

  const [isVisible, setIsVisible] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Vérifier si on doit afficher le prompt
  useEffect(() => {
    // Ne pas afficher si déjà installé ou fermé récemment
    if (isStandalone || isPWAInstalled) {
      setIsVisible(false)
      return
    }

    // Vérifier si l'utilisateur a déjà fermé le prompt récemment
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissed < 7) {
        setDismissed(true)
        return
      }
    }

    // Afficher après un délai de 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [isStandalone, isPWAInstalled])

  // Fermer et ne plus afficher pendant 7 jours
  const handleDismiss = () => {
    setIsVisible(false)
    setDismissed(true)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // Installer via le prompt natif (Chrome/Edge)
  const handleInstall = async () => {
    if (installPrompt) {
      const installed = await promptInstall()
      if (installed) {
        setIsVisible(false)
      }
    } else {
      // Si pas de prompt natif, afficher le tutoriel
      setShowTutorial(true)
    }
  }

  // Ne rien afficher si pas visible ou déjà fermé
  if (!isVisible || dismissed || isStandalone || isPWAInstalled) {
    return null
  }

  return (
    <>
      {/* Banner d'installation */}
      {!showTutorial && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
          <div className="glass-effect-strong rounded-2xl p-4 border border-accent/30 shadow-glow max-w-md mx-auto">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                {isMobile ? (
                  <Smartphone className="w-6 h-6 text-accent" />
                ) : (
                  <Monitor className="w-6 h-6 text-accent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-primary text-sm">
                  Installer MisterAll
                </h3>
                <p className="text-text-secondary text-xs mt-1">
                  Accède à tes cours hors ligne et reçois des notifications
                </p>

                {/* Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-dark font-bold text-xs rounded-xl hover:shadow-glow transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Installer
                  </button>
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="px-4 py-2 glass-effect border border-white/20 text-text-secondary text-xs rounded-xl hover:border-accent/30 transition-all"
                  >
                    Comment ?
                  </button>
                </div>
              </div>

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tutoriel */}
      {showTutorial && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-dark/80 backdrop-blur-sm"
            onClick={() => setShowTutorial(false)}
          />

          {/* Modal */}
          <div className="relative glass-effect-strong rounded-2xl p-6 border border-white/20 shadow-premium max-w-sm w-full animate-scale-in max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-text-primary text-lg">
                Installer MisterAll
              </h2>
              <button
                onClick={() => setShowTutorial(false)}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>

            {/* Tutoriel selon l'OS */}
            {os === 'iOS' ? (
              <IOSTutorial browser={browser} />
            ) : os === 'Android' ? (
              <AndroidTutorial browser={browser} onInstall={handleInstall} canInstall={canInstall} />
            ) : (
              <DesktopTutorial browser={browser} onInstall={handleInstall} canInstall={canInstall} />
            )}

            {/* Footer */}
            <button
              onClick={() => {
                setShowTutorial(false)
                handleDismiss()
              }}
              className="w-full mt-6 py-3 glass-effect border border-white/20 text-text-secondary text-sm rounded-xl hover:border-accent/30 transition-all"
            >
              Plus tard
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Tutoriel pour iOS (Safari obligatoire)
 */
function IOSTutorial({ browser }) {
  const steps = [
    {
      icon: <Share className="w-5 h-5" />,
      text: browser === 'Safari'
        ? "Appuie sur le bouton Partager en bas"
        : "Ouvre cette page dans Safari"
    },
    {
      icon: <Plus className="w-5 h-5" />,
      text: "Fais défiler et appuie sur \"Sur l'écran d'accueil\""
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Appuie sur \"Ajouter\" en haut à droite"
    }
  ]

  return (
    <div className="space-y-4">
      {browser !== 'Safari' && (
        <div className="p-3 rounded-xl bg-warning/10 border border-warning/30">
          <p className="text-warning text-xs font-medium">
            Sur iPhone, tu dois utiliser Safari pour installer l'app
          </p>
        </div>
      )}

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-xl glass-effect border border-white/10">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-accent">{step.icon}</span>
              <p className="text-text-secondary text-sm">{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Image illustration */}
      <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 text-text-tertiary">
          <Share className="w-6 h-6" />
          <span className="text-2xl">→</span>
          <div className="flex flex-col items-center">
            <Plus className="w-6 h-6" />
            <span className="text-[10px] mt-1">Écran d'accueil</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Tutoriel pour Android
 */
function AndroidTutorial({ browser, onInstall, canInstall }) {
  // Chrome/Edge peuvent utiliser le prompt natif
  if (canInstall && (browser === 'Chrome' || browser === 'Edge' || browser === 'Samsung')) {
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm text-center">
          Clique sur le bouton ci-dessous pour installer l'application
        </p>

        <button
          onClick={onInstall}
          className="w-full flex items-center justify-center gap-2 py-4 bg-accent text-dark font-bold rounded-xl hover:shadow-glow-lg transition-all"
        >
          <Download className="w-5 h-5" />
          Installer maintenant
        </button>

        <p className="text-text-quaternary text-xs text-center">
          L'app sera ajoutée à ton écran d'accueil
        </p>
      </div>
    )
  }

  // Sinon, afficher les étapes manuelles
  const steps = [
    {
      icon: <MoreVertical className="w-5 h-5" />,
      text: "Appuie sur le menu ⋮ en haut à droite"
    },
    {
      icon: <Download className="w-5 h-5" />,
      text: "Sélectionne \"Installer l'application\" ou \"Ajouter à l'écran d'accueil\""
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      text: "Confirme l'installation"
    }
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-xl glass-effect border border-white/10">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-accent">{step.icon}</span>
              <p className="text-text-secondary text-sm">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Tutoriel pour Desktop
 */
function DesktopTutorial({ browser, onInstall, canInstall }) {
  // Chrome/Edge peuvent utiliser le prompt natif
  if (canInstall) {
    return (
      <div className="space-y-4">
        <p className="text-text-secondary text-sm text-center">
          Installe MisterAll sur ton ordinateur pour un accès rapide
        </p>

        <button
          onClick={onInstall}
          className="w-full flex items-center justify-center gap-2 py-4 bg-accent text-dark font-bold rounded-xl hover:shadow-glow-lg transition-all"
        >
          <Download className="w-5 h-5" />
          Installer maintenant
        </button>

        <p className="text-text-quaternary text-xs text-center">
          L'app s'ouvrira dans sa propre fenêtre
        </p>
      </div>
    )
  }

  // Instructions manuelles selon le navigateur
  const getInstructions = () => {
    switch (browser) {
      case 'Chrome':
        return "Clique sur l'icône d'installation dans la barre d'adresse (à droite)"
      case 'Edge':
        return "Clique sur le menu ••• puis \"Applications\" → \"Installer ce site\""
      case 'Firefox':
        return "Firefox ne supporte pas l'installation PWA. Utilise Chrome ou Edge."
      case 'Safari':
        return "Safari desktop ne supporte pas l'installation PWA. Utilise Chrome ou Edge."
      default:
        return "Cherche l'option \"Installer\" ou \"Ajouter à l'écran d'accueil\" dans le menu de ton navigateur"
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl glass-effect border border-white/10">
        <p className="text-text-secondary text-sm">
          {getInstructions()}
        </p>
      </div>

      {(browser === 'Firefox' || browser === 'Safari') && (
        <div className="p-3 rounded-xl bg-info/10 border border-info/30">
          <p className="text-info text-xs font-medium">
            Pour la meilleure expérience, utilise Chrome ou Edge
          </p>
        </div>
      )}
    </div>
  )
}

export default PWAInstallPrompt
