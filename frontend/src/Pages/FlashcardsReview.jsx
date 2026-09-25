import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MoveLeftIcon,
  Layers,
  Trophy,
  Flame,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Loader2
} from 'lucide-react'
import Flashcard from '../components/Flashcard'
import Buttons from '../components/Buttons'
import { getDueFlashcards, getCourseFlashcards, reviewFlashcard } from '../api/courseApi'
import useMeta from '../utils/useMeta'

export default function FlashcardsReview() {
  useMeta({
    title: "MisterAll - Flashcards",
    canonical: "https://misterall.tech/flashcards",
    url: "https://misterall.tech/flashcards",
    noIndex: true
  })

  const location = useLocation()
  const navigate = useNavigate()

  // Mode: 'all' (toutes les flashcards dues) ou 'course' (flashcards d'un cours)
  const courseId = location.state?.courseId || null
  const courseTitle = location.state?.courseTitle || null

  const [flashcards, setFlashcards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    reviewed: 0,
    correct: 0,
    incorrect: 0
  })

  // Charger les flashcards
  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true)
      try {
        let response
        if (courseId) {
          response = await getCourseFlashcards(courseId)
          setFlashcards(response.dueFlashcards || [])
        } else {
          response = await getDueFlashcards()
          setFlashcards(response.flashcards || [])
        }
      } catch (error) {
        console.error('Erreur chargement flashcards:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFlashcards()
  }, [courseId])

  // Flashcard actuelle
  const currentCard = flashcards[currentIndex]
  const totalCards = flashcards.length
  const isComplete = currentIndex >= totalCards

  // Gérer la notation d'une flashcard
  const handleRate = async (quality) => {
    if (!currentCard || isReviewing) return

    setIsReviewing(true)

    try {
      const cardCourseId = currentCard.courseId || courseId
      await reviewFlashcard(cardCourseId, currentCard._id, quality)

      // Mettre à jour les stats de session
      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect
      }))

      // Passer à la carte suivante
      setCurrentIndex(prev => prev + 1)
    } catch (error) {
      console.error('Erreur lors de la révision:', error)
    } finally {
      setIsReviewing(false)
    }
  }

  // Recommencer la session
  const handleRestart = async () => {
    setIsLoading(true)
    setCurrentIndex(0)
    setSessionStats({ reviewed: 0, correct: 0, incorrect: 0 })

    try {
      let response
      if (courseId) {
        response = await getCourseFlashcards(courseId)
        setFlashcards(response.dueFlashcards || [])
      } else {
        response = await getDueFlashcards()
        setFlashcards(response.flashcards || [])
      }
    } catch (error) {
      console.error('Erreur rechargement:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-dvh bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-accent animate-spin mx-auto" />
          <p className="text-text-secondary">Chargement des flashcards...</p>
        </div>
      </div>
    )
  }

  // No flashcards due
  if (!isLoading && flashcards.length === 0) {
    return (
      <div className="min-h-dvh bg-dark flex flex-col items-center justify-center p-5 gap-6">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-success/10 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-float-gentle" />
        </div>

        <div className="relative z-10 max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-success/20 border-4 border-success flex items-center justify-center animate-pulse-glow">
            <CheckCircle2 className="h-12 w-12 text-success" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-text-primary">
              Aucune carte à réviser
            </h1>
            <p className="text-text-secondary">
              {courseId
                ? "Tu as révisé toutes les flashcards de ce cours ! Reviens plus tard."
                : "Tu es à jour ! Reviens plus tard pour de nouvelles révisions."
              }
            </p>
          </div>

          <Buttons
            onClick={() => navigate(-1)}
            primary
            title="Retour"
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
              {isPerfect ? '🎉 Parfait !' : isGood ? '👏 Bien joué !' : '💪 Continue !'}
            </h1>
            <p className="text-text-secondary text-sm sm:text-base">
              {isPerfect
                ? 'Tu maîtrises parfaitement ces concepts !'
                : isGood
                ? 'Très bonne session de révision !'
                : 'Continue à réviser pour progresser.'
              }
            </p>
          </div>

          {/* Stats Card */}
          <div className="glass-effect-strong rounded-2xl p-6 border border-white/20 shadow-glass space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-text-primary">{sessionStats.reviewed}</p>
                <p className="text-text-tertiary text-xs mt-1">Révisées</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-success">{sessionStats.correct}</p>
                <p className="text-text-tertiary text-xs mt-1">Correctes</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-error">{sessionStats.incorrect}</p>
                <p className="text-text-tertiary text-xs mt-1">À revoir</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>Taux de réussite</span>
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
              onClick={() => navigate(-1)}
              secondary
              title="Retour"
              className="w-full hover:border-accent/30"
            />
          </div>
        </div>
      </div>
    )
  }

  // Active review session
  return (
    <div className="min-h-dvh bg-dark flex flex-col w-screen lg:w-[80%] mx-auto">
      {/* Header */}
      <div className="glass-effect sticky top-0 z-20 p-4 rounded-b-2xl border-b border-white/20/50 backdrop-blur-xl shadow-glass">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Navigation et compteur */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl glass-effect border border-white/20 hover:border-accent/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
            >
              <MoveLeftIcon className="h-6 w-6 text-text-primary group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="text-center">
              <h1 className="text-sm font-bold text-text-primary uppercase tracking-wide">
                {courseTitle || 'Révision quotidienne'}
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
            isLoading={isReviewing}
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
            <p className="text-text-quaternary text-xs">À revoir</p>
          </div>
        </div>
        <p className='text-text-quaternary text-xs text-center mt-2'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>
      </div>
    </div>
  )
}
