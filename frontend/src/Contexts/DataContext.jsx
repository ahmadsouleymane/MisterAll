import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { getUserProfile, getUserStats } from '../api/userApi'
import { getCoursesWithAssets, getCourseAssets } from '../api/courseApi'
import { useAuth } from './AuthContext'

const DataContext = createContext()

export function DataProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [user, setUser] = useState(null)
  const [courses, setCourses] = useState([])
  const [courseAssets, setCourseAssets] = useState({})
  const [userStats, setUserStats] = useState(null)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [dataError, setDataError] = useState(null)

  // Charger toutes les données en une fois (optimisé)
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated) {
      setUser(null)
      setCourses([])
      setCourseAssets({})
      setUserStats(null)
      return
    }

    setIsDataLoading(true)
    setDataError(null)

    try {
      // 3 requêtes en parallèle au lieu de N+1
      const [profileResponse, coursesResponse, statsResponse] = await Promise.all([
        getUserProfile(),
        getCoursesWithAssets(),
        getUserStats().catch(() => null) // Stats optionnelles, ne bloque pas le chargement
      ])

      // User - vérifier si c'est une erreur
      if (profileResponse?.error) {
        console.warn('⚠️ Erreur profil:', profileResponse.message)
      } else {
        const userInfos = profileResponse?.userInfos || profileResponse?.user || profileResponse || null
        setUser(userInfos)
      }

      // Courses avec assets pré-chargés - vérifier si c'est une erreur
      if (coursesResponse?.error) {
        console.warn('⚠️ Erreur cours:', coursesResponse.message)
        setDataError(new Error(coursesResponse.message))
      } else if (coursesResponse?.success && coursesResponse?.courses) {
        const loadedCourses = coursesResponse.courses

        // Extraire les assets dans un map pour accès rapide
        const assetsMap = {}
        loadedCourses.forEach(course => {
          if (course.assets) {
            assetsMap[course._id] = course.assets
          }
        })

        setCourses(loadedCourses)
        setCourseAssets(assetsMap)
      }

      // Stats utilisateur
      if (statsResponse?.success && statsResponse?.stats) {
        setUserStats(statsResponse.stats)
      }

    } catch (error) {
      console.error('❌ DataContext loadAllData error:', error)
      setDataError(error)
    } finally {
      setIsDataLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadAllData()
  }, [loadAllData])

  // Rafraîchir les assets d'un cours spécifique
  const refreshCourseAssets = useCallback(async (courseId) => {
    if (!courseId) return

    try {
      const response = await getCourseAssets(courseId)

      // Vérifier si c'est une erreur
      if (response?.error) {
        console.warn('⚠️ Erreur refresh assets:', response.message)
        return
      }

      const assets = response?.courseAssets?.[0] || response

      setCourseAssets(prev => ({
        ...prev,
        [courseId]: assets
      }))

      // Mettre à jour aussi le cours avec les nouvelles stats
      setCourses(prev => prev.map(course => {
        if (course._id === courseId && assets?.sheets) {
          const totalSheets = assets.sheets.length
          const completedSheets = assets.sheets.filter(s => s.status === "Terminé").length
          const totalQuizzes = assets.sheets.reduce((sum, s) => sum + (s.quizs?.length || 0), 0)
          const totalCorrect = assets.sheets.reduce((sum, s) => sum + (s.score || 0), 0)

          return {
            ...course,
            assets,
            stats: {
              progress: totalSheets > 0 ? Math.round((completedSheets / totalSheets) * 100) : 0,
              score: totalQuizzes > 0 ? Math.round((totalCorrect / totalQuizzes) * 100) : 0,
              sheetsCount: totalSheets,
              completedSheets,
              status: assets.status
            }
          }
        }
        return course
      }))

    } catch (error) {
      console.error('❌ refreshCourseAssets error:', error)
    }
  }, [])

  // Rafraîchir les stats utilisateur
  const refreshUserStats = useCallback(async () => {
    try {
      const response = await getUserStats()
      if (response?.success && response?.stats) {
        setUserStats(response.stats)
      }
    } catch (error) {
      console.error('❌ refreshUserStats error:', error)
    }
  }, [])

  // Helper pour obtenir les assets d'un cours
  const getAssetsForCourse = useCallback((courseId) => {
    return courseAssets[courseId] || null
  }, [courseAssets])

  // Helper pour obtenir les stats pré-calculées d'un cours
  const getCourseStats = useCallback((courseId) => {
    const course = courses.find(c => c._id === courseId)
    return course?.stats || null
  }, [courses])

  const value = {
    // Data
    user,
    courses,
    courseAssets,
    userStats,

    // Loading states
    isDataLoading,
    dataError,

    // Helpers
    getAssetsForCourse,
    getCourseStats,

    // Actions
    refreshCourseAssets,
    refreshUserStats,
    refreshAllData: loadAllData
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
