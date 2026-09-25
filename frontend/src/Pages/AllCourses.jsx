import React, { useMemo, useState } from 'react'
import FixedNavBar from '../components/FixedNavBar'
import { ArrowLeft, BookOpen, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CourseCard from '../components/CourseCard'
import SortDropdown from '../components/SortDropdown'
import { useData } from '../Contexts/DataContext'
import useMeta from '../utils/useMeta'

function AllCourses() {
  useMeta({
    title: "MisterAll - Tous tes cours",
    canonical: "https://misterall.tech/all-courses",
    url: "https://misterall.tech/all-courses",
    noIndex: true
  })

  const navigate = useNavigate()
  const { courses, userStats, getAssetsForCourse } = useData()
  const [sortBy, setSortBy] = useState('progress-desc')
  const [searchQuery, setSearchQuery] = useState('')

  // Utiliser les stats pré-calculées du cours ou fallback sur calcul local
  const getCourseProgress = (course) => {
    if (course.stats?.progress !== undefined) return course.stats.progress

    const assets = getAssetsForCourse(course._id)
    if (!assets?.sheets?.length) return 0
    const completed = assets.sheets.filter(s => s.status === 'Terminé').length
    return Math.round((completed / assets.sheets.length) * 100)
  }

  const getCourseScore = (course) => {
    if (course.stats?.score !== undefined) return course.stats.score

    const assets = getAssetsForCourse(course._id)
    if (!assets?.sheets?.length) return 0
    const totalQuizzes = assets.sheets.reduce((sum, s) => sum + (s.quizs?.length || 0), 0)
    const totalCorrect = assets.sheets.reduce((sum, s) => sum + (s.score || 0), 0)
    return totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0
  }

  const getSheetsCount = (course) => {
    return course.stats?.sheetsCount ?? getAssetsForCourse(course._id)?.sheets?.length ?? 0
  }

  const getStatus = (course) => {
    return course.stats?.status ?? getAssetsForCourse(course._id)?.status ?? 'completed'
  }

  const getNextSheet = (course) => {
    const assets = course.assets || getAssetsForCourse(course._id)
    if (!assets?.sheets) return null
    const next = assets.sheets.find(s => s.status !== 'Terminé')
    return next?._id || null
  }

  // Stats globales depuis le backend ou calcul local
  const globalStats = useMemo(() => {
    if (userStats) {
      return {
        totalCourses: userStats.totalCourses,
        completedCourses: userStats.completedCourses,
        avgProgress: userStats.globalProgress
      }
    }

    // Fallback calcul local
    const total = courses.length
    if (total === 0) return { totalCourses: 0, completedCourses: 0, avgProgress: 0 }

    const progressValues = courses.map(c => getCourseProgress(c))
    const completed = progressValues.filter(p => p === 100).length
    const avg = Math.round(progressValues.reduce((a, b) => a + b, 0) / total)

    return { totalCourses: total, completedCourses: completed, avgProgress: avg }
  }, [courses, userStats])

  // Trier et filtrer
  const sortedAndFilteredCourses = useMemo(() => {
    let result = [...courses]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.subject.toLowerCase().includes(query)
      )
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'progress-desc':
          return getCourseProgress(b) - getCourseProgress(a)
        case 'progress-asc':
          return getCourseProgress(a) - getCourseProgress(b)
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'name-asc':
          return a.title.localeCompare(b.title)
        case 'name-desc':
          return b.title.localeCompare(a.title)
        case 'score-desc':
          return getCourseScore(b) - getCourseScore(a)
        default:
          return 0
      }
    })

    return result
  }, [courses, sortBy, searchQuery])

  return (
    <div className='min-h-screen bg-dark pb-24 page-transition overflow-hidden'>
      {/* Background */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[150px]' />
        <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/2 rounded-full blur-[120px]' />
      </div>

      <div className='relative max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate(-1)}
              className='p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface/80 transition-all duration-200'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <h1 className='text-text-primary text-xl sm:text-2xl font-semibold'>
              Bibliothèque
            </h1>
          </div>
          {courses.length > 0 && (
            <div className='flex flex-wrap items-center gap-2 text-xs sm:text-sm text-text-tertiary'>
              <span className='bg-white/7 hover:bg-white/10 py-1 px-3 rounded-full transition-colors'>{globalStats.totalCourses} cours</span>
              <span className='bg-white/7 hover:bg-white/10 py-1 px-3 rounded-full transition-colors'>{globalStats.completedCourses} terminé{globalStats.completedCourses > 1 ? 's' : ''}</span>
              <span className='bg-white/7 hover:bg-white/10 py-1 px-3 rounded-full transition-colors'>{globalStats.avgProgress}% global</span>
            </div>
          )}
        </div>

        {/* Search + Sort */}
        {courses.length > 0 && (
          <div className='flex items-center gap-3'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary' />
              <input
                type='text'
                placeholder='Rechercher un cours...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='
                  w-full pl-10 pr-4 py-2.5
                  bg-surface/60 border border-white/20 rounded-xl
                  text-sm text-text-primary placeholder:text-text-tertiary
                  focus:outline-none focus:border-accent/50 focus:bg-surface
                  transition-all duration-200
                  border-white/20
                '
              />
            </div>
            <SortDropdown sortBy={sortBy} setSortBy={setSortBy} />
          </div>
        )}

        {/* Courses Grid */}
        {sortedAndFilteredCourses.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {sortedAndFilteredCourses.map((course) => (
              <CourseCard
                key={course._id}
                id={course._id}
                title={course.title}
                subject={course.subject}
                progress={getCourseProgress(course)}
                score={getCourseScore(course)}
                sheetsCount={getSheetsCount(course)}
                updatedAt={course.updatedAt}
                nextSheetId={getNextSheet(course)}
                status={getStatus(course)}
              />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <div className='w-14 h-14 mb-5 rounded-xl bg-surface border border-white/20 flex items-center justify-center'>
              <BookOpen className='w-6 h-6 text-text-tertiary' />
            </div>
            <h2 className='text-text-primary text-lg font-medium mb-2'>Aucun cours</h2>
            <p className='text-text-tertiary text-sm mb-6 max-w-xs'>
              Créez votre premier cours pour commencer à apprendre avec l'IA
            </p>
            <button
              onClick={() => navigate('/add')}
              className='bg-accent text-dark px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-200'
            >
              Créer un cours
            </button>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <Search className='w-10 h-10 mb-4 text-text-tertiary/50' />
            <p className='text-text-primary text-base font-medium mb-1'>Aucun résultat</p>
            <p className='text-text-tertiary text-sm'>Essayez une autre recherche</p>
          </div>
        )}
      </div>

      <p className='text-text-quaternary text-xs text-center py-4'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>

      <FixedNavBar />
    </div>
  )
}

export default AllCourses
