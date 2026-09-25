import { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  MoveLeftIcon,
  Layers,
  Trophy,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import Flashcard from '../components/Flashcard'
import Buttons from '../components/Buttons'
import SignupIncentiveBanner from '../components/SignupIncentiveBanner'

export default function SharedFlashcards() {
  const location = useLocation()
  const navigate = useNavigate()
  const { shareToken } = useParams()

  const { flashcards: initialFlashcards = [], courseTitle } = location.state || {}

  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0
  })

  // Initialize flashcards
  useEffect(() => {
    if (!initialFlashcards || initialFlashcards.length === 0) {
      navigate(`/shared/${shareToken}`)
      return
    }
    setFlashcards(initialFlashcards)
  }, [initialFlashcards, navigate, shareToken])

  // Current card
  const currentCard = flashcards[currentIndex]
  const totalCards = flashcards.length
  const isComplete = currentIndex >= totalCards

  // Handle rating (no API call for shared mode)
  const handleRate = (quality) => {
    if (!currentCard) return

    // Update session stats locally only
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect
    }))

    // Move to next card
    setCurrentIndex(prev => prev + 1)
  }

  // Restart session
  const handleRestart = () => {
    setCurrentIndex(0)
    setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 })
  }

  // No flashcards
  if (flashcards.length === 0) {
    return (
      <div className="min-h-dvh bg-dark flex flex-col items-center justify-center p-5 gap-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[120px] animate-float" />
        </div>

        <div className="relative z-10 max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-info/20 border-4 border-info flex items-center justify-center">
            <Layers className="h-12 w-12 text-info" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Pas de flashcards
            </h1>
            <p className="text-text-secondary">
              Ce cours ne contient pas de flashcards.
            </p>
          </div>

          <Buttons
            onClick={() => navigate(`/shared/${shareToken}`)}
            primary
            title="Retour au cours"
            className="w-full max-w-xs mx-auto shadow-neon-accent"
          />
        </div>
      </div>
    )
  }

  // Session complete
  if (isComplete) {
    const successRate = sessionStats.reviewed > 0
      ? Math.round((sessionStats.correct / sessionStats.reviewed) * 100)
      : 0
    const isPerfect = successRate === 100
    const isGood = successRate >= 70

    return (
      <div className="min-h-dvh bg-dark flex items-center justify-center p-5">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] animate-float ${
              isPerfect ? 'bg-success/20' : 'bg-accent/10'
            }`}
          />
          <div
            className={`absolute bottom-0 left-0 w-96 h-96 rounded-full blur-[120px] animate-float-gentle ${
              isPerfect ? 'bg-accent/20' : 'bg-info/10'
            }`}
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="relative z-10 max-w-lg w-full space-y-6 animate-scale-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-premium animate-pulse-glow ${
                isPerfect
                  ? 'bg-success/20 border-success'
                  : isGood
                  ? 'bg-accent/20 border-accent'
                  : 'bg-info/20 border-info'
              }`}
            >
              {isPerfect ? (
                <Trophy className="h-12 w-12 text-success" />
              ) : isGood ? (
                <Flame className="h-12 w-12 text-accent" />
              ) : (
                <Sparkles className="h-12 w-12 text-info" />
              )}
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-text-primary">
              {isPerfect ? 'Parfait !' : isGood ? 'Bien joue !' : 'Continue !'}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              {isPerfect
                ? 'Tu maitrises parfaitement ces concepts !'
                : isGood
                ? 'Tres bonne session de revision !'
                : 'Continue a reviser pour progresser.'
              }
            </p>
          </div>

          {/* Stats Card */}
          <div className="glass-effect-strong rounded-2xl p-6 border border-white/20 shadow-glass space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-text-primary">{sessionStats.reviewed}</p>
                <p className="text-text-tertiary text-xs mt-1">Revisees</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-success">{sessionStats.correct}</p>
                <p className="text-text-tertiary text-xs mt-1">Correctes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-error">{sessionStats.incorrect}</p>
                <p className="text-text-tertiary text-xs mt-1">A revoir</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>Taux de reussite</span>
                <span className="font-bold text-accent">{successRate}%</span>
              </div>
              <div className="h-3 bg-surface-raised rounded-full overflow-hidden border border-white/20/30">
                <div
                  className={`h-full rounded-full transition-all duration-1000 shadow-glow-md ${
                    isPerfect
                      ? 'bg-gradient-to-r from-success to-success/80'
                      : isGood
                      ? 'bg-gradient-to-r from-accent to-accent/80'
                      : 'bg-gradient-to-r from-info to-info/80'
                  }`}
                  style={{ width: `${successRate}%` }}
                />
              </div>
            </div>

            {/* Shared mode notice */}
            <div className="glass-accent rounded-xl p-3 border border-accent/20">
              <p className="text-accent text-xs text-center">
                Cree ton compte pour ajouter tes propres cours et generer des flashcards !
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Buttons
              onClick={handleRestart}
              primary
              title="Nouvelle session"
              className="w-full shadow-neon-accent hover:shadow-glow-lg flex items-center justify-center gap-2 group"
            >
              <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Nouvelle session</span>
            </Buttons>

            <Buttons
              onClick={() => navigate(`/shared/${shareToken}`)}
              secondary
              title="Retour au cours"
              className="w-full hover:border-accent/30"
            />

            <button
              onClick={() => navigate('/signup')}
              className="w-full px-4 py-3 glass-accent border border-accent/30 rounded-xl text-accent font-bold text-sm hover:bg-accent/10 transition-all"
            >
              Creer mes propres cours et flashcards
            </button>
          </div>
        </div>

        {/* Signup banner */}
        <SignupIncentiveBanner variant="flashcard" delay={0} />
      </div>
    )
  }

  // Active review session
  return (
    <div className="min-h-dvh bg-dark flex flex-col w-screen lg:w-[80%] mx-auto">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-20 p-4 rounded-b-2xl border-b border-white/20/50 backdrop-blur-xl shadow-glass">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Shared badge */}
          <div className='flex items-center gap-2 text-accent text-xs'>
            <ExternalLink className='h-3 w-3' />
            <span>Cours partage</span>
            {courseTitle && <span className='text-text-quaternary'>• {courseTitle}</span>}
          </div>

          {/* Navigation and counter */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/shared/${shareToken}`)}
              className="p-2 rounded-xl glass-effect border border-white/20 hover:border-accent/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
            >
              <MoveLeftIcon className="h-6 w-6 text-text-primary group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="text-center">
              <h1 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                Flashcards
              </h1>
            </div>

            <div className="glass-accent px-4 py-2 rounded-full border border-accent/20 shadow-glow-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-accent" />
              <span className="text-accent font-bold text-sm">
                {currentIndex + 1} / {totalCards}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden border border-white/20/30">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-600 ease-out shadow-neon-accent"
                style={{ width: `${((currentIndex) / totalCards) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg animate-fade-in">
          <Flashcard
            question={currentCard.question}
            answer={currentCard.answer}
            onRate={handleRate}
            isLoading={false}
            showRating={true}
          />
        </div>
      </div>

      {/* Session Stats Footer */}
      <div className="glass-effect border-t border-white/20/50 p-4">
        <div className="max-w-2xl mx-auto flex justify-center gap-6 text-center">
          <div>
            <p className="text-lg font-bold text-success">{sessionStats.correct}</p>
            <p className="text-text-quaternary text-xs">Correctes</p>
          </div>
          <div className="w-px bg-border/50" />
          <div>
            <p className="text-lg font-bold text-error">{sessionStats.incorrect}</p>
            <p className="text-text-quaternary text-xs">A revoir</p>
          </div>
        </div>
      </div>

      {/* Signup Incentive Banner */}
      <SignupIncentiveBanner variant="flashcard" delay={60000} />
    </div>
  )
}
