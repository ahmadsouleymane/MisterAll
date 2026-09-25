import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './Contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineIndicator from './components/OfflineIndicator'
import SkipLink from './components/SkipLink'
import PWAInstallPrompt from './components/PWAInstallPrompt'

// Lazy load des pages pour optimiser le bundle
const Landing = lazy(() => import('./Pages/Landing'))
const HomePage = lazy(() => import('./Pages/HomePage'))
const AddCourse = lazy(() => import('./Pages/AddCourse'))
const Course = lazy(() => import('./Pages/Course'))
const Profile = lazy(() => import('./Pages/Profile'))
const AllCourses = lazy(() => import('./Pages/AllCourses'))
const FichePage = lazy(() => import('./Pages/FichePage'))
const Quiz = lazy(() => import('./Pages/Quiz'))
const FlashcardsReview = lazy(() => import('./Pages/FlashcardsReview'))
const Chat = lazy(() => import('./Pages/Chat'))
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard'))
const SignUp = lazy(() => import('./Pages/SignUp'))
const Login = lazy(() => import('./Pages/Login'))
const ForgotPassword = lazy(() => import('./Pages/ForgotPassword'))
const VerifyEmail = lazy(() => import('./Pages/VerifyEmail'))
const ResetPassword = lazy(() => import('./Pages/ResetPassword'))
const AddEmail = lazy(() => import('./Pages/AddEmail'))
const SharedCourse = lazy(() => import('./Pages/SharedCourse'))
const SharedFiche = lazy(() => import('./Pages/SharedFiche'))
const SharedQuiz = lazy(() => import('./Pages/SharedQuiz'))
const SharedFlashcards = lazy(() => import('./Pages/SharedFlashcards'))

// Composant de chargement pour Suspense
const PageLoader = () => (
  <div className='bg-dark justify-center h-dvh p-5 flex flex-col items-center'>
    <img src="logo.svg" alt="logo" className='w-42 animate-pulse' />
  </div>
)

export default function App() {
  const { isAuthenticated, isLoading, user, requiresEmailMigration } = useAuth()
  const location = useLocation()

  // Afficher un loader pendant la vérification d'auth
  if (isLoading) {
    return <PageLoader />
  }

  // Forcer l'ajout d'email UNIQUEMENT pour les anciens utilisateurs avec numéro de téléphone
  // La vérification d'email est optionnelle et se fait via le profil
  const needsEmailMigration = isAuthenticated && (requiresEmailMigration || (user?.mustAddEmail && !user?.email))

  // Routes autorisées pendant la migration email
  const emailMigrationAllowedPaths = ['/add-email', '/verify-email', '/logout']
  const isOnAllowedPath = emailMigrationAllowedPaths.some(path => location.pathname.startsWith(path))

  return (
    <ErrorBoundary>
      <SkipLink />
      <div className="h-dvh">
        <OfflineIndicator />
        {/* PWA Install Prompt - Affiche seulement pour les utilisateurs connectés */}
        {isAuthenticated && !needsEmailMigration && <PWAInstallPrompt />}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes - accessible to everyone */}
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Shared course routes - public access */}
            <Route path="/shared/:shareToken" element={<SharedCourse />} />
            <Route path="/shared/:shareToken/fiche" element={<SharedFiche />} />
            <Route path="/shared/:shareToken/quiz" element={<SharedQuiz />} />
            <Route path="/shared/:shareToken/flashcards" element={<SharedFlashcards />} />

            {isAuthenticated ? (
              <>
                {/* Route pour ajouter/migrer l'email */}
                <Route path="/add-email" element={<AddEmail />} />

                {/* Forcer migration email UNIQUEMENT pour anciens users avec téléphone */}
                {needsEmailMigration && !isOnAllowedPath ? (
                  <Route path="*" element={<Navigate to="/add-email" replace />} />
                ) : (
                  <>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/add" element={<AddCourse />} />
                    <Route path="/course" element={<Course />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/all-courses" element={<AllCourses />} />
                    <Route path="/fiche" element={<FichePage />} />
                    <Route path="/quiz" element={<Quiz />} />
                    <Route path="/flashcards" element={<FlashcardsReview />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </>
                )}
              </>
            ) : (
              <>
                <Route path="/" element={<Landing />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </Suspense>
      </div>
    </ErrorBoundary>
  )
}
