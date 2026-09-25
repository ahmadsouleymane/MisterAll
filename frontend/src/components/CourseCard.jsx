import React, { memo, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../Contexts/DataContext'
import { Loader2, AlertCircle, ChevronRight } from 'lucide-react'

// Format de la date relatif (hors du composant pour éviter re-création)
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return `Il y a ${diffDays}j`
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const CourseCard = memo(function CourseCard(props) {
  const navigate = useNavigate()
  const { courses } = useData()

  const {
    id,
    title,
    subject,
    progress = 0,
    sheetsCount = 0,
    updatedAt,
    status = 'completed',
  } = props

  // Memoize la date formatée
  const formattedDate = useMemo(() => formatDate(updatedAt), [updatedAt])

  // Memoize le handler
  const handleCardClick = useCallback(() => {
    const course = courses.find(course => course._id === id)
    navigate(`/course`, { state: { course } })
  }, [courses, id, navigate])

  // Status indicator
  const isProcessing = status === 'processing'
  const isFailed = status === 'failed'

  return (
    <button
      onClick={handleCardClick}
      disabled={isProcessing}
      className={`
        w-full text-left
        bg-surface/50 hover:bg-surface
        border border-white/20 hover:border-white/20-light
        rounded-xl p-4
        transition-all duration-200
        border-white/20
        group
        ${isProcessing ? 'opacity-70 cursor-wait' : ''}
        ${isFailed ? 'border-error/30 hover:border-error/50' : ''}
      `}
    >
      {/* Header: Subject + Status */}
      <div className='flex items-center justify-between mb-2'>
        <span className='text-[11px] font-medium text-accent uppercase tracking-wide'>
          {subject}
        </span>

        {isProcessing && (
          <div className='flex items-center gap-1.5 text-accent'>
            <Loader2 className='h-3 w-3 animate-spin' />
            <span className='text-[10px] font-medium'>IA...</span>
          </div>
        )}

        {isFailed && (
          <div className='flex items-center gap-1 text-error'>
            <AlertCircle className='h-3 w-3' />
            <span className='text-[10px] font-medium'>Échec</span>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className='
        text-text-primary text-[15px] font-medium
        leading-snug line-clamp-2 mb-3
        group-hover:text-accent transition-colors duration-200
      '>
        {title}
      </h3>

      {/* Footer: Meta + Progress */}
      <div className='flex items-center justify-between'>
        {/* Meta info */}
        <div className='flex items-center gap-2 text-xs text-text-tertiary'>
          {sheetsCount > 0 && (
            <span>{sheetsCount} fiche{sheetsCount > 1 ? 's' : ''}</span>
          )}
          {sheetsCount > 0 && updatedAt && (
            <span className='w-0.5 h-0.5 rounded-full bg-text-tertiary/50' />
          )}
          {updatedAt && <span>{formattedDate}</span>}
        </div>

        {/* Progress indicator */}
        <div className='flex items-center gap-2'>
          {progress > 0 && (
            <div className='flex items-center gap-1.5'>
              <div className='w-12 h-1 bg-border rounded-full overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    progress === 100 ? 'bg-success' : 'bg-accent'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className={`text-[11px] font-medium ${
                progress === 100 ? 'text-success' : 'text-text-secondary'
              }`}>
                {progress}%
              </span>
            </div>
          )}

          <ChevronRight className='
            h-4 w-4 text-text-tertiary
            group-hover:text-accent group-hover:translate-x-0.5
            transition-all duration-200
          ' />
        </div>
      </div>
    </button>
  )
})

export default CourseCard
