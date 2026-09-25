import React, { useMemo, useCallback } from 'react'
import { User, Loader2, AlertCircle, Sparkles, Clock, Layers, PlayCircle } from 'lucide-react'
import FixedNavBar from '../components/FixedNavBar'
import { useNavigate } from 'react-router-dom'
import { useData } from '../Contexts/DataContext'
import { useAuth } from '../Contexts/AuthContext'
import SearchBar from '../components/SearchBar'
import useMeta from '../utils/useMeta'
import { SkeletonPage } from '../components/SkeletonLoader'
import { usePolling } from '../hooks/usePolling'
import EmailVerificationBanner from '../components/EmailVerificationBanner'
import ForceEmailModal from '../components/ForceEmailModal'

function HomePage() {
  const navigate = useNavigate()
  const { user, courses, isDataLoading, courseAssets, getAssetsForCourse, refreshCourseAssets } = useData()
  const { requiresEmailVerification } = useAuth()

  useMeta({
    title: "MisterAll - Accueil",
    canonical: "https://misterall.tech/",
    url: "https://misterall.tech/",
    noIndex: true
  })

  // Déterminer les cours en processing
  const processingCourseIds = useMemo(() => {
    if (!courseAssets || Object.keys(courseAssets).length === 0) return []
    return Object.entries(courseAssets)
      .filter(([_, assets]) => assets?.status === 'processing')
      .map(([courseId]) => courseId)
  }, [courseAssets])

  // Callback de polling pour rafraîchir les cours en processing
  const pollProcessingCourses = useCallback(async () => {
    if (processingCourseIds.length === 0) return null

    await Promise.all(
      processingCourseIds.map(courseId => refreshCourseAssets(courseId))
    )

    // Retourner les IDs pour la détection de changement
    return processingCourseIds
  }, [processingCourseIds, refreshCourseAssets])

  // Polling intelligent avec exponential backoff
  usePolling(pollProcessingCourses, {
    enabled: processingCourseIds.length > 0,
    initialInterval: 10000,   // 10 secondes
    maxInterval: 120000,      // 2 minutes max
    maxDuration: 600000,      // Stop après 10 minutes
    backoffMultiplier: 2,     // Double l'intervalle si pas de changement
  })

  // Obtenir le statut réel d'un cours
  const getCourseStatus = (courseId) => {
    const assets = getAssetsForCourse(courseId)

    if (!assets) return 'failed'

    // Vérifier si "processing" est RÉCENT
    if (assets.status === 'processing') {
      const updatedAt = assets.updatedAt ? new Date(assets.updatedAt) : null
      const now = new Date()
      const diffMinutes = updatedAt ? (now - updatedAt) / (1000 * 60) : 999

      if (diffMinutes < 5) return 'processing'
    }

    // Vérifier la qualité du contenu
    const resumeText = assets.resume ? assets.resume.trim() : ''
    const hasValidResume = resumeText.length > 500 &&
      !resumeText.includes("Résumé non généré") &&
      !resumeText.includes("erreur technique") &&
      !resumeText.includes("⚠️")

    const hasValidSheets = assets.sheets?.length > 0 && assets.sheets.some(sheet =>
      sheet.content?.trim().length > 100 && sheet.quizs?.length > 0
    )

    const hasValidQuizs = assets.allQuizs?.length >= 5 && assets.allQuizs.some(q =>
      q.quiz?.trim().length > 10 && q.answers?.length >= 2
    )

    if (hasValidSheets || hasValidQuizs) return 'completed'
    return 'failed'
  }

  // Calculer le nombre total de flashcards dues
  const totalDueFlashcards = useMemo(() => {
    if (!courseAssets || Object.keys(courseAssets).length === 0) return 0

    const now = new Date()
    let dueCount = 0

    Object.values(courseAssets).forEach(assets => {
      if (assets?.flashcards && Array.isArray(assets.flashcards)) {
        dueCount += assets.flashcards.filter(card =>
          new Date(card.nextReviewDate) <= now
        ).length
      }
    })

    return dueCount
  }, [courseAssets])

  if (isDataLoading || !courses || !user) {
    return <SkeletonPage />
  }

  return (
    <div className='min-h-screen bg-dark pb-24 page-transition'>
      {/* Background animé subtil */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-30' />
        <div className='absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float' />
        <div className='absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-[100px] animate-float-gentle' />
      </div>

      {/* Container principal */}
      <div className='relative max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-5 sm:space-y-6'>

        {/* Email Verification Banner */}
        {requiresEmailVerification && <EmailVerificationBanner />}

        {/* Header - Clean et mobile-first */}
        <div className='flex items-center justify-between'>
          {/* Logo simple */}
          <img
            src="logo.svg"
            alt="MisterAll"
            className='h-10 sm:h-12 cursor-pointer hover:opacity-80 transition-opacity duration-300'
            onClick={() => navigate('/home')}
          />

          {/* User section */}
          <div className='flex items-center gap-3'>
            {/* Avatar */}
            <button
            onClick={() => navigate("/profile", { state: { user } })}
            className='
              flex items-center gap-2 sm:gap-3
              hover:opacity-80
              transition-all duration-300
              group
            '
          >
            <div className='text-right hidden sm:block'>
              <p className='text-text-primary text-base font-bold group-hover:text-accent transition-colors'>
                {user.firstname}
              </p>
            </div>

            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className='
                  w-9 h-9 sm:w-10 sm:h-10 rounded-full
                  ring-2 ring-accent/30
                  group-hover:ring-accent/60
                  transition-all duration-300
                '
              />
            ) : (
              <div className='
                w-9 h-9 sm:w-10 sm:h-10 rounded-full
                bg-accent/15
                ring-2 ring-accent/30
                group-hover:ring-accent/60
                flex items-center justify-center
                transition-all duration-300
              '>
                <User className='h-5 w-5 text-accent' />
              </div>
            )}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <SearchBar />

        {/* Daily Review Card - Flashcards */}
        {totalDueFlashcards > 0 && (
          <button
            onClick={() => navigate('/flashcards')}
            className='
              relative w-full
              glass-effect rounded-xl p-5
              flex items-center justify-between
              border border-accent/20
              hover:border-accent/40
              hover:shadow-glass-accent
              transition-all duration-300
              group
              overflow-hidden
            '
          >
            {/* Background glow */}
            <div className='
              absolute inset-0
              bg-gradient-to-r from-accent/5 via-transparent to-accent/5
              opacity-0 group-hover:opacity-100
              transition-opacity duration-500
            ' />

            <div className='relative flex items-center gap-4'>
              <div className='
                w-12 h-12 rounded-xl
                bg-accent/10 border border-accent/20
                flex items-center justify-center
                group-hover:scale-110 group-hover:bg-accent/20
                transition-all duration-300
              '>
                <Layers className='h-6 w-6 text-accent' />
              </div>
              <div className='text-left'>
                <p className='text-text-primary font-bold text-base sm:text-lg'>
                  Révision du jour
                </p>
                <p className='text-text-tertiary text-sm'>
                  {totalDueFlashcards} flashcard{totalDueFlashcards > 1 ? 's' : ''} à réviser
                </p>
              </div>
            </div>

            <div className='
              relative flex items-center gap-2
              bg-accent text-dark
              px-4 py-2.5 rounded-xl
              font-bold text-sm
              group-hover:shadow-glow-md
              transition-all duration-300
            '>
              <PlayCircle className='h-5 w-5' />
              <span className='hidden sm:inline'>Commencer</span>
            </div>

            {/* Shine effect */}
            <div className='
              absolute inset-0
              bg-gradient-to-r from-transparent via-white/5 to-transparent
              -translate-x-full group-hover:translate-x-full
              transition-transform duration-1000
            ' />
          </button>
        )}

        {/* Cours récents - Mobile-first */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-text-primary text-xl sm:text-2xl font-bold'>
                Mes cours
              </h2>
              <p className='text-text-tertiary text-sm sm:text-base mt-1 flex items-center gap-1.5'>
                <Clock className='h-4 w-4 text-accent' />
                {courses.length} {courses.length > 1 ? 'cours' : 'cours'}
              </p>
            </div>
            <button
              onClick={() => navigate('/all-courses')}
              className='
                text-accent
                text-sm sm:text-base font-bold
                hover:bg-accent/10
                px-3 sm:px-4 py-2
                rounded-lg
                transition-all duration-300
              '
            >
              Tout voir
            </button>
          </div>

          {courses.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {courses.slice(0, 6).map((course, index) => {
                const courseId = course._id || course.id
                const status = getCourseStatus(courseId)
                const isProcessing = status === 'processing'
                const isFailed = status === 'failed'

                return (
                  <button
                    key={courseId}
                    onClick={() => navigate(`/course`, { state: { course } })}
                    className={`
                      group relative
                      glass-effect
                      rounded-xl p-5 h-40
                      flex flex-col justify-between
                      text-left
                      transition-all duration-500 ease-out-expo
                      hover:-translate-y-1
                      active:scale-[0.98]
                      focus-accent
                      ${isFailed
                        ? 'border-error/30 hover:border-error/50 shadow-depth-1'
                        : isProcessing
                          ? 'border-accent/20 animate-pulse-slow shadow-glow-xs'
                          : 'hover:shadow-glass-accent'
                      }
                    `}
                    style={{
                      animationDelay: `${index * 50}ms`
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`
                      absolute inset-0 rounded-xl
                      bg-gradient-to-br from-accent/5 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-500
                      pointer-events-none
                      ${isFailed ? 'hidden' : ''}
                    `} />

                    {/* Status badges - Version moderne */}
                    {isProcessing && (
                      <div className='
                        absolute top-3 right-3
                        flex items-center gap-1.5
                        glass-accent
                        px-2.5 py-1.5 rounded-full
                        text-xs font-bold
                        shadow-glow-xs
                        z-10
                      '>
                        <Loader2 className='w-3.5 h-3.5 animate-spin' />
                        <span className='text-accent'>IA en cours...</span>
                      </div>
                    )}

                    {isFailed && (
                      <div className='
                        absolute top-3 right-3
                        flex items-center gap-1.5
                        bg-error/10 backdrop-blur-sm
                        border border-error/30
                        px-2.5 py-1.5 rounded-full
                        text-xs font-bold
                        z-10
                      '>
                        <AlertCircle className='w-3.5 h-3.5 text-error' />
                        <span className='text-error'>Échec</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className='relative space-y-2 z-10'>
                      <p className={`
                        text-accent text-[10px] font-bold
                        uppercase tracking-widest
                        ${isProcessing ? 'opacity-50' : ''}
                      `}>
                        {course.subject}
                      </p>
                      <h3 className={`
                        text-text-primary text-base font-bold
                        leading-tight line-clamp-2
                        group-hover:text-accent
                        transition-colors duration-300
                        ${isProcessing ? 'opacity-60' : ''}
                      `}>
                        {course.title}
                      </h3>
                    </div>

                    {/* Bottom indicator */}
                    <div className='relative z-10 flex items-center justify-between'>
                      <div className='
                        h-1 w-12 rounded-full
                        bg-accent/20
                        group-hover:bg-accent/40
                        group-hover:w-16
                        transition-all duration-300
                      ' />
                    </div>

                    {/* Corner accent */}
                    <div className='
                      absolute bottom-0 right-0
                      w-16 h-16
                      bg-gradient-to-tl from-accent/5 to-transparent
                      rounded-xl
                      opacity-0 group-hover:opacity-100
                      transition-opacity duration-500
                      pointer-events-none
                    ' />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className='
              relative
              glass-effect
              rounded-xl p-12
              text-center
              overflow-hidden
            '>
              {/* Background pattern */}
              <div className='absolute inset-0 pattern-dots opacity-30' />

              <div className='relative z-10'>
                <div className='
                  w-16 h-16 mx-auto mb-4
                  rounded-full
                  bg-accent/10
                  border-2 border-accent/20
                  flex items-center justify-center
                '>
                  <Sparkles className='w-8 h-8 text-accent' />
                </div>
                <p className='text-text-primary text-lg font-bold mb-2'>
                  Aucun cours pour le moment
                </p>
                <p className='text-text-tertiary text-sm mb-6'>
                  Commencez votre apprentissage intelligent
                </p>
                <button
                  onClick={() => navigate('/add')}
                  className='
                    bg-accent text-dark
                    px-6 py-2.5 rounded-xl
                    font-bold text-sm
                    shadow-neon-accent
                    hover:shadow-glow-lg hover:scale-105
                    active:scale-95
                    transition-all duration-300
                    focus-accent
                  '
                >
                  Créer votre premier cours
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <p className='text-text-quaternary text-xs text-center py-4'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>

      <FixedNavBar />

      {/* Force Email Modal for legacy users */}
      <ForceEmailModal />
    </div>
  )
}

export default HomePage
