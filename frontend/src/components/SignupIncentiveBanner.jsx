import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, Brain, Upload, GraduationCap } from 'lucide-react'

const DISMISS_KEY = 'signup_banner_dismissed_at'
const DISMISS_DURATION = 24 * 60 * 60 * 1000 // 24 hours

const variants = {
  default: {
    icon: Upload,
    title: "Envie de creer tes propres cours ?",
    description: "Inscris-toi gratuitement pour ajouter tes documents et generer des fiches et quiz automatiquement.",
    cta: "Creer mon compte"
  },
  quiz: {
    icon: Brain,
    title: "Tu veux creer tes propres quiz ?",
    description: "Ajoute tes cours et l'IA generera automatiquement des quiz personnalises pour toi.",
    cta: "S'inscrire gratuitement"
  },
  flashcard: {
    icon: GraduationCap,
    title: "Cree tes propres flashcards !",
    description: "Inscris-toi pour ajouter tes cours et generer des flashcards avec repetition espacee.",
    cta: "Commencer maintenant"
  }
}

export default function SignupIncentiveBanner({ variant = 'default', delay = 30000 }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if already dismissed within 24 hours
    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < DISMISS_DURATION) {
        setIsDismissed(true)
        return
      }
    }

    // Show banner after delay
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString())
    setIsDismissed(true)
    setIsVisible(false)
  }

  const handleSignup = () => {
    navigate('/signup')
  }

  if (isDismissed || !isVisible) {
    return null
  }

  const config = variants[variant] || variants.default
  const Icon = config.icon

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div className="mx-4 mb-4 sm:mx-auto sm:max-w-lg">
        <div className="glass-effect-strong rounded-2xl p-4 sm:p-5 border border-accent/30 shadow-neon-accent">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-4 w-4 text-text-tertiary" />
          </button>

          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
              <Icon className="h-6 w-6 text-accent" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <h3 className="text-text-primary font-bold text-sm sm:text-base mb-1">
                {config.title}
              </h3>
              <p className="text-text-tertiary text-xs sm:text-sm mb-3">
                {config.description}
              </p>

              {/* CTA Button */}
              <button
                onClick={handleSignup}
                className="
                  w-full sm:w-auto px-5 py-2.5
                  bg-accent text-dark font-bold text-sm
                  rounded-xl shadow-glow-sm
                  hover:shadow-glow-lg hover:scale-[1.02]
                  active:scale-[0.98]
                  transition-all duration-300
                "
              >
                {config.cta}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
