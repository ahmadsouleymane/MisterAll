import React, { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  MoveLeftIcon,
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ArrowRight,
  Crown,
  Medal,
  RotateCcw,
  ExternalLink
} from 'lucide-react'
import Buttons from '../components/Buttons'
import RichText from '../components/RichText'
import SignupIncentiveBanner from '../components/SignupIncentiveBanner'

const SharedQuiz = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { shareToken } = useParams()

  const { quizs: initialQuizs = [], sheetTitle, courseTitle } = location.state || {}

  // Shuffle utility
  const shuffleArray = useCallback((array) =>
    [...array]
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  , [])

  // States
  const [quizList, setQuizList] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [confirm, setConfirm] = useState(false)
  const [score, setScore] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize quiz
  useEffect(() => {
    if (isInitialized) return

    if (!initialQuizs || initialQuizs.length === 0) {
      navigate(`/shared/${shareToken}`)
      return
    }

    const shuffled = shuffleArray(
      initialQuizs.map(q => ({
        ...q,
        isDone: false,
        answers: shuffleArray(q.answers || []),
      }))
    )
    setQuizList(shuffled)
    setIsInitialized(true)
  }, [initialQuizs, navigate, shuffleArray, isInitialized, shareToken])

  // Remaining questions
  const remainingQuestions = quizList.filter(q => !q.isDone)
  const allDone = remainingQuestions.length === 0
  const question = remainingQuestions[0]

  const totalQuestions = quizList.length
  const questionNumber = totalQuestions - remainingQuestions.length + 1

  // Validate answer (no API call for shared mode)
  const handleConfirm = () => {
    if (!selectedAnswer) return

    const correct = selectedAnswer === question.goodAnswer
    setConfirm(true)

    if (correct) {
      setScore(prev => prev + 1)
    }
    // No API call - score is not saved for shared courses
  }

  // Next question
  const handleContinue = () => {
    setQuizList(prev =>
      prev.map(q =>
        q._id === question._id ? { ...q, isDone: true } : q
      )
    )

    setSelectedAnswer(null)
    setConfirm(false)
  }

  // Restart
  const handleRestart = () => {
    const reset = shuffleArray(
      initialQuizs.map(q => ({
        ...q,
        isDone: false,
        answers: shuffleArray(q.answers),
      }))
    )
    setQuizList(reset)
    setScore(0)
    setSelectedAnswer(null)
    setConfirm(false)
  }

  // Quiz complete
  if (allDone) {
    const percentage = (score / totalQuestions) * 100
    const isPerfect = percentage === 100
    const isGood = percentage >= 70
    const isAverage = percentage >= 50

    return (
      <div className="min-h-dvh bg-dark flex items-center justify-center p-5 w-screen lg:w-[80%] mx-auto overflow-hidden">
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
          {/* Trophy icon */}
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
                <Crown className="h-12 w-12 text-success" />
              ) : isGood ? (
                <Medal className="h-12 w-12 text-accent" />
              ) : (
                <Target className="h-12 w-12 text-info" />
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
                ? 'Score impeccable ! Tu maitrises parfaitement le sujet.'
                : isGood
                ? 'Tres bon resultat ! Encore un petit effort pour la perfection.'
                : isAverage
                ? 'Pas mal ! Revise encore pour progresser.'
                : 'Continue a t\'entrainer, tu vas y arriver !'}
            </p>
          </div>

          {/* Score card */}
          <div className="glass-effect-strong rounded-2xl p-6 border border-white/20 shadow-glass space-y-4">
            <div className="text-center">
              <div className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
                {score} / {totalQuestions}
              </div>
              <p className="text-text-tertiary text-sm mt-1">Questions reussies</p>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>Taux de reussite</span>
                <span className="font-bold text-accent">{percentage.toFixed(0)}%</span>
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
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Shared mode notice */}
            <div className="glass-accent rounded-xl p-3 border border-accent/20">
              <p className="text-accent text-xs text-center">
                Cree ton compte pour ajouter tes propres cours et generer des quiz !
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Buttons
              onClick={handleRestart}
              primary
              title="Recommencer le quiz"
              className="w-full shadow-neon-accent hover:shadow-glow-lg flex items-center justify-center gap-2 group"
            >
              <RotateCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Recommencer le quiz</span>
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
              Creer mes propres cours et quiz
            </button>
          </div>
        </div>

        {/* Signup banner */}
        <SignupIncentiveBanner variant="quiz" delay={0} />
      </div>
    )
  }

  if (!question) return null

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

          {/* Navigation and score */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(`/shared/${shareToken}`)}
              className="p-2 rounded-xl glass-effect border border-white/20 hover:border-accent/30 hover:scale-110 active:scale-95 transition-all duration-300 group"
            >
              <MoveLeftIcon className="h-6 w-6 text-text-primary group-hover:-translate-x-1 transition-transform" />
            </button>

            <div className="glass-accent px-4 py-2 rounded-full border border-accent/20 shadow-glow-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-accent" />
              <span className="text-accent font-bold text-sm">
                {score} / {totalQuestions}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-tertiary">Progression</span>
              <span className="text-accent font-bold">
                {questionNumber} / {totalQuestions}
              </span>
            </div>
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-600 ease-out shadow-neon-accent"
                style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-2xl w-full space-y-5 animate-fade-in">
          {/* Difficulty badge */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-glow-xs flex items-center gap-1.5 ${
                question.difficulty === 'facile'
                  ? 'bg-success/20 text-success border border-success/30'
                  : question.difficulty === 'moyen'
                  ? 'bg-warning/20 text-warning border border-warning/30'
                  : 'bg-error/20 text-error border border-error/30'
              }`}
            >
              <Target className="h-3 w-3" />
              <span>{question.difficulty}</span>
            </div>
          </div>

          {/* Question */}
          <div className="glass-effect rounded-2xl p-6 sm:p-8 border border-white/20 shadow-glass text-center">
            <div className="text-text-primary text-lg sm:text-xl font-medium leading-relaxed">
              <RichText mode="inline">{question.quiz}</RichText>
            </div>
          </div>

          {/* Answers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {question.answers.map((answer, index) => {
              const isSelected = selectedAnswer === answer
              const isCorrect = answer === question.goodAnswer
              const isSelectedCorrect = confirm && isSelected && isCorrect
              const isSelectedWrong = confirm && isSelected && !isCorrect

              return (
                <button
                  key={index}
                  onClick={() => !confirm && setSelectedAnswer(answer)}
                  disabled={confirm}
                  className={`
                    group relative p-4 rounded-xl font-medium text-left
                    transition-all duration-300 overflow-hidden
                    border-white/20
                    ${
                      !confirm && !isSelected
                        ? 'bg-surface-raised border-2 border-white/20 text-text-secondary hover:border-accent/40 hover:scale-[1.02] active:scale-[0.98] hover:shadow-glass'
                        : ''
                    }
                    ${
                      !confirm && isSelected
                        ? 'bg-accent/10 border-2 border-accent text-text-primary shadow-neon-accent scale-[1.02]'
                        : ''
                    }
                    ${
                      isSelectedCorrect
                        ? 'bg-green-500 border-[3px] border-success text-success-light shadow-neon-success'
                        : ''
                    }
                    ${
                      isSelectedWrong
                        ? 'bg-red-500 border-[3px] border-error text-error-light shadow-neon-error shake-animation'
                        : ''
                    }
                    ${
                      confirm && !isSelected
                        ? 'bg-surface-raised border-2 border-white/20 text-text-secondary opacity-60'
                        : ''
                    }
                  `}
                >
                  {/* Color bar */}
                  {confirm && isSelected && (
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCorrect ? 'bg-success' : 'bg-error'}`} />
                  )}

                  {/* Status icon */}
                  {confirm && isSelected && (
                    <div className="absolute -top-3 -right-3 z-10 animate-scale-in">
                      {isCorrect ? (
                        <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center shadow-success-lg border-2 border-success-light">
                          <CheckCircle2 className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-error rounded-full flex items-center justify-center shadow-error-lg border-2 border-error-light">
                          <XCircle className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selection indicator */}
                  {!confirm && isSelected && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center shadow-glow-sm border-2 border-accent-600">
                      <CheckCircle2 className="h-4 w-4 text-dark" strokeWidth={3} />
                    </div>
                  )}

                  <span className={`block ${isSelectedCorrect ? 'text-success-light font-bold' : ''} ${isSelectedWrong ? 'text-error-light font-bold' : ''}`}>
                    <RichText mode="inline">{answer}</RichText>
                  </span>

                  {/* Hover gradient */}
                  {!confirm && (
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {confirm && (
            <div className="glass-effect-strong rounded-2xl p-5 sm:p-6 border-l-4 border-accent shadow-glass-accent space-y-2 animate-slide-up">
              <div className="flex items-center gap-2 text-accent">
                <Lightbulb className="h-5 w-5" />
                <span className="font-bold text-sm uppercase tracking-wider">
                  Explication
                </span>
              </div>
              <div className="text-text-secondary leading-relaxed">
                <RichText>{question.explanation}</RichText>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            {!confirm && selectedAnswer && (
              <Buttons
                onClick={handleConfirm}
                primary
                title="Valider ma reponse"
                className="w-full shadow-neon-accent hover:shadow-glow-lg"
              />
            )}

            {confirm && (
              <Buttons
                onClick={handleContinue}
                primary
                title="Question suivante"
                className="w-full shadow-neon-accent hover:shadow-glow-lg flex items-center justify-center gap-2 group"
              >
                <span>Question suivante</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Buttons>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedQuiz
