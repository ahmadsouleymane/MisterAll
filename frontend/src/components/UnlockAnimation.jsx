import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'

/**
 * Modal d'animation pour les achievements débloqués
 */
export default function UnlockAnimation({
  achievements = [],
  onClose,
  onMarkSeen
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (achievements.length > 0) {
      setTimeout(() => setIsVisible(true), 100)
    }
  }, [achievements])

  if (achievements.length === 0) return null

  const current = achievements[currentIndex]
  const isLast = currentIndex === achievements.length - 1

  const handleNext = () => {
    if (isLast) {
      handleClose()
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onMarkSeen) {
        onMarkSeen(achievements.map(a => a.id))
      }
      if (onClose) {
        onClose()
      }
    }, 300)
  }

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-5
        transition-all duration-300
        ${isVisible ? 'bg-dark/90 backdrop-blur-md' : 'bg-transparent'}
      `}
      onClick={handleClose}
    >
      <div
        className={`
          relative max-w-sm w-full
          transition-all duration-500
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className='absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full bg-surface border border-white/20 flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors'
        >
          <X className='w-4 h-4' />
        </button>

        {/* Card */}
        <div className='bg-surface border border-accent/30 rounded-2xl overflow-hidden'>
          {/* Header avec particules */}
          <div className='relative h-32 bg-gradient-to-br from-accent/30 via-accent/20 to-transparent flex items-center justify-center overflow-hidden'>
            {/* Particules animées */}
            <div className='absolute inset-0'>
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className='absolute w-1 h-1 bg-accent rounded-full animate-float-particle'
                  style={{
                    left: `${10 + (i * 7)}%`,
                    top: `${20 + (i % 3) * 20}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: `${2 + (i % 3)}s`
                  }}
                />
              ))}
            </div>

            {/* Badge icon */}
            <div className='relative z-10 w-20 h-20 rounded-2xl bg-surface/80 backdrop-blur border border-accent/50 flex items-center justify-center text-5xl animate-bounce-in shadow-lg shadow-accent/30'>
              {current.icon}
            </div>

            {/* Sparkles */}
            <Sparkles className='absolute top-4 right-4 w-6 h-6 text-accent animate-pulse' />
            <Sparkles className='absolute bottom-4 left-4 w-4 h-4 text-accent/70 animate-pulse' style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Content */}
          <div className='p-6 text-center space-y-4'>
            <div>
              <p className='text-accent text-sm font-medium uppercase tracking-wider mb-1'>
                Badge débloqué!
              </p>
              <h2 className='text-text-primary text-2xl font-bold'>
                {current.name}
              </h2>
            </div>

            <p className='text-text-secondary text-sm'>
              {current.description}
            </p>

            {/* XP reward */}
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20'>
              <span className='text-accent font-bold'>+{current.xp} XP</span>
            </div>

            {/* Counter if multiple */}
            {achievements.length > 1 && (
              <p className='text-text-quaternary text-xs'>
                {currentIndex + 1} / {achievements.length}
              </p>
            )}
          </div>

          {/* Action button */}
          <div className='p-4 pt-0'>
            <button
              onClick={handleNext}
              className='w-full py-3 rounded-xl bg-accent text-dark font-semibold hover:bg-accent/90 active:scale-[0.98] transition-all'
            >
              {isLast ? 'Super!' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-20px) scale(1.5);
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-float-particle {
          animation: float-particle 3s ease-in-out infinite;
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
