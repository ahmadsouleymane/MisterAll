import React, { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Clock, CheckCircle, ArrowRight } from 'lucide-react'

export default function SheetCard({
  courseId,
  sheetId,
  title,
  content,
  quizs,
  score = 0,
  status = 'A réviser',
  index = 0,
}) {
  const navigate = useNavigate()

  // Déterminer la difficulté
  const getDifficulty = () => {
    if (!quizs || quizs.length === 0) return 'Moyen'
    const firstQuiz = quizs[0]
    return firstQuiz.difficulty || 'Moyen'
  }

  // Calculer le taux de réussite
  const getSuccessRate = () => {
    if (!quizs || quizs.length === 0) return 0
    const done = quizs.filter(q => q.isDone).length
    return Math.round((done / quizs.length) * 100)
  }

  // Calculer le score en pourcentage (pas le count brut)
  const getScorePercentage = () => {
    if (!quizs || quizs.length === 0) return 0
    return Math.round((score / quizs.length) * 100)
  }

  // Déterminer le texte du bouton
  const getButtonText = () => {
    if (score === 100) return 'Revoir'
    if (status === 'En cours') return 'Continuer'
    return 'Réviser'
  }

  // Déterminer la couleur du score
  const getScoreColor = () => {
    const percentage = getScorePercentage()
    if (percentage <= 30) return 'bg-error'
    if (percentage <= 70) return 'bg-warning'
    if (percentage <= 99) return 'bg-info'
    return 'bg-success'
  }

  // Déterminer la couleur de la difficulté
  const getDifficultyColor = () => {
    const difficulty = getDifficulty()
    if (difficulty === 'Facile') return 'text-success'
    if (difficulty === 'Difficile') return 'text-error'
    return 'text-warning'
  }

  // Config du status badge
  const statusConfig = {
    'A réviser': {
      icon: AlertCircle,
      color: 'error',
      className: 'bg-error/10 border border-error/30 text-error',
    },
    'En cours': {
      icon: Clock,
      color: 'warning',
      className: 'bg-warning/10 border border-warning/30 text-warning',
    },
    'Terminé': {
      icon: CheckCircle,
      color: 'success',
      className: 'bg-success/10 border border-success/30 text-success',
    },
  }

  const currentStatusConfig = statusConfig[status] || statusConfig['A réviser']
  const StatusIcon = currentStatusConfig.icon

  const difficulty = getDifficulty()
  const successRate = getSuccessRate()
  const buttonText = getButtonText()

  const handleNavigate = () => {
    navigate('/fiche', {
      state: {
        courseId,
        sheetId,
      },
    })
  }

  return (
    <button
      onClick={handleNavigate}
      className='
        w-full group
        glass-effect rounded-xl p-5 sm:p-6
        hover:shadow-glass-accent hover:-translate-y-1
        transition-all duration-500
        text-left relative
        animate-slide-up
        border border-white/20
        hover:border-accent/30
        active:scale-[0.98]
        overflow-hidden
      '
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className='
        absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-500
        pointer-events-none
      ' />

      {/* Status badge */}
      <div className={`
        absolute top-4 sm:top-5 right-4 sm:right-5
        flex items-center gap-1.5
        ${currentStatusConfig.className}
        px-2.5 sm:px-3 py-1.5 sm:py-2
        rounded-full
        text-xs sm:text-sm font-semibold
        z-10
      `}>
        <StatusIcon className='h-3.5 w-3.5 flex-shrink-0' />
        <span className='hidden sm:inline'>{status}</span>
      </div>

      {/* Title */}
      <h3 className='
        text-text-primary font-bold text-base sm:text-lg
        mb-2 pr-24 line-clamp-1
        group-hover:text-accent transition-colors duration-300
        relative z-10
      '>
        {title}
      </h3>

      {/* Content preview */}
      <p className='
        text-text-tertiary text-sm
        mb-4 line-clamp-2 relative z-10
      '>
        {content ? content.substring(0, 200) : 'Aucun contenu'}
        {content && content.length > 200 && '...'}
      </p>

      {/* Action button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          handleNavigate()
        }}
        className='
          w-full relative z-10
          flex items-center justify-center gap-2
          bg-gradient-to-r from-accent to-accent/80
          hover:from-accent hover:to-accent
          text-dark
          px-4 py-2.5 sm:py-3 rounded-lg
          font-bold text-sm sm:text-base
          transition-all duration-300
          group/btn
          shadow-neon-accent
          hover:shadow-glow-lg
          active:scale-95
        '
      >
        <span>{buttonText}</span>
        <ArrowRight className='h-4 w-4 group-hover/btn:translate-x-1 transition-transform' />
      </button>

      {/* Corner accent */}
      <div className='
        absolute bottom-0 right-0
        w-16 h-16 sm:w-20 sm:h-20
        bg-gradient-to-tl from-accent/5 to-transparent
        rounded-xl
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
        pointer-events-none
      ' />
    </button>
  )
}
