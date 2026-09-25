import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, LogOut, BookOpen, Target, TrendingUp, CheckCircle, Camera, Loader2, Trash2, School, GraduationCap, Bell, BellOff, Mail, AlertCircle } from 'lucide-react'
import usePushNotifications from '../hooks/usePushNotifications'
import { useNotification } from '../Contexts/NotificationContext'
import { ResendVerificationAPI, uploadAvatar, deleteAvatar } from '../api/userApi'
import { useAuth } from '../Contexts/AuthContext'
import useMeta from '../utils/useMeta'
import { useData } from '../Contexts/DataContext'
import { getSeriesLabel, getOrientationLabel } from '../constants/educationData'

// Construire l'URL de base pour les fichiers statiques (avatars, etc.)
const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL
  if (!apiUrl) return ''
  // Retirer '/api' de la fin de l'URL
  return apiUrl.replace(/\/api\/?$/, '')
}
const API_BASE = getApiBaseUrl()

export default function Profile() {
  const navigate = useNavigate()
  const { logout, user, isLoading: authLoading } = useAuth()
  const { courses, userStats, refreshUserData } = useData()
  const { isSupported: pushSupported, isSubscribed: pushSubscribed, loading: pushLoading, subscribe: subscribePush, unsubscribe: unsubscribePush, sendTest: sendTestPush } = usePushNotifications()
  const { success, error: notifyError } = useNotification()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [sendingVerification, setSendingVerification] = useState(false)
  const fileInputRef = useRef(null)

  useMeta({
    title: "MisterAll - Profil",
    canonical: "https://misterall.tech/profile",
    url: "https://misterall.tech/profile",
    noIndex: true
  })

  // Initialiser l'avatar URL
  React.useEffect(() => {
    if (user?.avatar && user.avatar.length > 0) {
      if (user.avatar.startsWith('http')) {
        setAvatarUrl(user.avatar)
      } else {
        // Construire l'URL complete avec l'API base
        const fullUrl = API_BASE ? `${API_BASE}${user.avatar}` : user.avatar
        setAvatarUrl(fullUrl)
      }
    } else {
      setAvatarUrl(null)
    }
  }, [user?.avatar])

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      notifyError('Image trop volumineuse (max 5MB)')
      return
    }

    setIsUploading(true)
    setShowAvatarMenu(false)

    try {
      const result = await uploadAvatar(file)
      if (result.error) {
        notifyError(result.message || 'Erreur lors de l\'upload')
        return
      }
      // Construire l'URL complete pour l'avatar
      const newAvatarUrl = result.avatar.startsWith('http')
        ? result.avatar
        : (API_BASE ? `${API_BASE}${result.avatar}` : result.avatar)
      setAvatarUrl(newAvatarUrl)
      success('Photo de profil mise à jour')
      if (refreshUserData) refreshUserData()
    } catch (error) {
      notifyError('Erreur lors de l\'upload')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteAvatar = async () => {
    setIsUploading(true)
    setShowAvatarMenu(false)

    try {
      const result = await deleteAvatar()
      if (result.error) {
        notifyError(result.message || 'Erreur lors de la suppression')
        return
      }
      setAvatarUrl(null)
      success('Photo de profil supprimée')
      if (refreshUserData) refreshUserData()
    } catch (error) {
      notifyError('Erreur lors de la suppression')
    } finally {
      setIsUploading(false)
    }
  }

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading) {
    return (
      <div className='min-h-screen bg-dark flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-8 h-8 text-accent animate-spin mx-auto mb-4' />
          <p className='text-text-tertiary'>Chargement...</p>
        </div>
      </div>
    )
  }

  // Rediriger si pas authentifié (dans un effet pour respecter Rules of Hooks)
  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true })
    }
  }, [authLoading, user, navigate])

  if (!user) {
    return null
  }

  // Stats d'apprentissage réelles depuis le backend
  const learningStats = userStats ? [
    {
      label: 'Cours',
      value: userStats.totalCourses,
      icon: BookOpen,
      color: 'accent'
    },
    {
      label: 'Progression',
      value: `${userStats.globalProgress}%`,
      icon: TrendingUp,
      color: 'info'
    },
    {
      label: 'Score moyen',
      value: `${userStats.avgScore}%`,
      icon: Target,
      color: 'success'
    },
    {
      label: 'Fiches lues',
      value: userStats.sheetsTermines,
      icon: CheckCircle,
      color: 'warning'
    }
  ] : [
    { label: 'Cours', value: courses?.length || 0, icon: BookOpen, color: 'accent' },
    { label: 'Progression', value: '0%', icon: TrendingUp, color: 'info' }
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const colorClasses = {
    accent: 'text-accent bg-accent/10',
    success: 'text-success bg-success/10',
    info: 'text-info bg-info/10',
    warning: 'text-warning bg-warning/10',
    premium: 'text-premium bg-premium/10'
  }

  return (
    <div className='min-h-screen bg-dark pb-24 page-transition'>
      {/* Background */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[150px]' />
        <div className='absolute bottom-0 left-0 w-[300px] h-[300px] bg-accent/2 rounded-full blur-[120px]' />
      </div>

      <div className='relative max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface/80 transition-all'
          >
            <ArrowLeft className='h-5 w-5' />
          </button>
          <h1 className='text-text-primary text-xl font-semibold'>Profil</h1>
        </div>

        {/* Profile Card */}
        <div className='bg-surface/50 border border-white/20 rounded-2xl p-6 text-center space-y-5'>
          {/* Avatar avec upload */}
          <div className='relative inline-block'>
            {/* Input fichier caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className='hidden'
            />

            {/* Avatar cliquable */}
            <button
              onClick={() => setShowAvatarMenu(true)}
              className='relative group'
              disabled={isUploading}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className='w-20 h-20 rounded-full ring-2 ring-border object-cover'
                />
              ) : (
                <div className='w-20 h-20 rounded-full bg-surface border border-white/20 flex items-center justify-center'>
                  <User className='w-10 h-10 text-text-tertiary' />
                </div>
              )}

              {/* Overlay au hover */}
              <div className='absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                {isUploading ? (
                  <Loader2 className='w-6 h-6 text-white animate-spin' />
                ) : (
                  <Camera className='w-6 h-6 text-white' />
                )}
              </div>
            </button>

          </div>

          {/* Menu avatar */}
          {showAvatarMenu && (
            <div className='fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4' onClick={() => setShowAvatarMenu(false)}>
              <div className='bg-surface border border-white/20 rounded-2xl w-full max-w-sm overflow-hidden' onClick={e => e.stopPropagation()}>
                <div className='p-4 border-b border-white/20'>
                  <h3 className='text-text-primary font-semibold text-center'>Photo de profil</h3>
                </div>
                <div className='p-2'>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className='w-full flex items-center gap-3 px-4 py-3 text-text-primary hover:bg-surface-raised rounded-lg transition-colors'
                  >
                    <Camera className='w-5 h-5 text-accent' />
                    <span>{avatarUrl ? 'Changer la photo' : 'Ajouter une photo'}</span>
                  </button>
                  {avatarUrl && (
                    <button
                      onClick={handleDeleteAvatar}
                      className='w-full flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 rounded-lg transition-colors'
                    >
                      <Trash2 className='w-5 h-5' />
                      <span>Supprimer la photo</span>
                    </button>
                  )}
                </div>
                <div className='p-2 border-t border-white/20'>
                  <button
                    onClick={() => setShowAvatarMenu(false)}
                    className='w-full px-4 py-3 text-text-tertiary hover:bg-surface-raised rounded-lg transition-colors'
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Name */}
          <div>
            <h2 className='text-text-primary text-xl font-semibold'>
              {user.firstname} {user.lastname}
            </h2>
          </div>

        </div>

        {/* Learning Stats */}
        <div>
          <h3 className='text-text-secondary text-xs font-medium uppercase tracking-wide mb-3'>
            Statistiques d'apprentissage
          </h3>
          <div className='grid grid-cols-2 gap-3'>
            {learningStats.map((stat, index) => (
              <div
                key={index}
                className='bg-surface/50 border border-white/20 rounded-xl p-4 space-y-2'
              >
                <div className={`w-8 h-8 rounded-lg ${colorClasses[stat.color]} flex items-center justify-center`}>
                  <stat.icon className='w-4 h-4' />
                </div>
                <p className='text-text-primary text-xl font-semibold'>{stat.value}</p>
                <p className='text-text-tertiary text-xs'>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className='bg-surface/50 border border-white/20 rounded-xl p-4 space-y-3'>
          <h3 className='text-text-secondary text-xs font-medium uppercase tracking-wide'>
            Compte
          </h3>
          <div className='space-y-2'>
            {/* Type d'education */}
            <div className='flex items-center justify-between py-2 border-b border-white/20'>
              <span className='text-text-tertiary text-sm'>Type</span>
              <div className='flex items-center gap-2'>
                {(user.educationType === 'secondary' || user.secondaryCycle) ? (
                  <>
                    <School className='w-4 h-4 text-accent' />
                    <span className='text-text-primary font-medium'>Secondaire</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className='w-4 h-4 text-accent' />
                    <span className='text-text-primary font-medium'>Universitaire</span>
                  </>
                )}
              </div>
            </div>

            {/* Affichage conditionnel selon le type */}
            {(user.educationType === 'secondary' || user.secondaryCycle) ? (
              <>
                {/* Cycle pour secondaire */}
                <div className='flex items-center justify-between py-2 border-b border-white/20'>
                  <span className='text-text-tertiary text-sm'>Cycle</span>
                  <span className='text-text-primary font-medium'>
                    {user.secondaryCycle === 'college' ? 'College' : user.secondaryCycle === 'lycee' ? 'Lycee' : 'Non renseigne'}
                  </span>
                </div>
                {/* Classe */}
                <div className='flex items-center justify-between py-2 border-b border-white/20'>
                  <span className='text-text-tertiary text-sm'>Classe</span>
                  <span className='text-text-primary font-medium'>{user.level || 'Non renseigne'}</span>
                </div>
                {/* Serie (si 1ere ou Terminale) */}
                {user.series && (
                  <div className='flex items-center justify-between py-2 border-b border-white/20'>
                    <span className='text-text-tertiary text-sm'>Serie</span>
                    <span className='text-text-primary font-medium'>{getSeriesLabel(user.series)}</span>
                  </div>
                )}
                {/* Orientation (si 2nde) */}
                {user.seriesOrientation && (
                  <div className='flex items-center justify-between py-2 border-b border-white/20'>
                    <span className='text-text-tertiary text-sm'>Orientation</span>
                    <span className='text-text-primary font-medium'>{getOrientationLabel(user.seriesOrientation)}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Filiere pour universitaire */}
                <div className='flex items-center justify-between py-2 border-b border-white/20'>
                  <span className='text-text-tertiary text-sm'>Filiere</span>
                  <span className='text-text-primary text-sm leading-5 text-end font-medium'>{user.program || 'Non renseigne'}</span>
                </div>
                {/* Niveau */}
                <div className='flex items-center justify-between py-2 border-b border-white/20'>
                  <span className='text-text-tertiary text-sm'>Niveau</span>
                  <span className='text-text-primary font-medium'>{user.level || 'Non renseigne'}</span>
                </div>
              </>
            )}

            {/* Nombre de cours */}
            <div className='flex items-center justify-between py-2'>
              <span className='text-text-tertiary text-sm'>Cours ajoutés</span>
              <span className='text-text-primary font-medium'>
                {user.addedCourses || 0} (illimité)
              </span>
            </div>
          </div>
        </div>

        {/* Email Verification Section */}
        {user.email && !user.emailVerified && (
          <div className='glass-effect rounded-2xl p-5 border border-orange-500/30 bg-orange-500/5'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-orange-400' />
              </div>
              <div className='flex-1'>
                <h3 className='text-text-primary font-semibold text-sm mb-1'>
                  Email non verifie
                </h3>
                <p className='text-text-tertiary text-xs mb-3'>
                  Verifie ton email pour securiser ton compte et recevoir les notifications importantes.
                </p>
                <button
                  onClick={async () => {
                    setSendingVerification(true)
                    try {
                      const result = await ResendVerificationAPI()
                      if (result.success) {
                        success('Code envoye a ' + user.email)
                        navigate('/verify-email')
                      } else {
                        notifyError(result.message || 'Erreur lors de l\'envoi')
                      }
                    } catch (err) {
                      notifyError('Erreur de connexion')
                    } finally {
                      setSendingVerification(false)
                    }
                  }}
                  disabled={sendingVerification}
                  className='
                    flex items-center gap-2
                    bg-orange-500 hover:bg-orange-600
                    text-white px-4 py-2 rounded-lg
                    text-sm font-medium
                    transition-colors
                    disabled:opacity-50
                  '
                >
                  {sendingVerification ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' />
                      <span>Envoi...</span>
                    </>
                  ) : (
                    <>
                      <Mail className='w-4 h-4' />
                      <span>Verifier mon email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Verified Badge */}
        {user.email && user.emailVerified && (
          <div className='flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3'>
            <CheckCircle className='w-5 h-5 text-green-400' />
            <span className='text-green-400 text-sm font-medium'>Email verifie</span>
            <span className='text-text-tertiary text-xs ml-auto'>{user.email}</span>
          </div>
        )}

        {/* Push Notifications Toggle */}
        {pushSupported && (
          <button
            onClick={async () => {
              if (pushSubscribed) {
                const result = await unsubscribePush()
                if (result) {
                  success('Notifications désactivées')
                }
              } else {
                const result = await subscribePush()
                if (result) {
                  success('Notifications activées !')
                  // Envoyer une notif test
                  setTimeout(() => sendTestPush(), 1000)
                } else {
                  notifyError('Impossible d\'activer les notifications')
                }
              }
            }}
            disabled={pushLoading}
            className='
              w-full flex items-center justify-between
              bg-surface/50 border border-white/20
              text-text-primary rounded-xl px-4 py-3
              font-medium text-sm
              hover:bg-surface-raised hover:border-white/30
              transition-all duration-200
              disabled:opacity-50
            '
          >
            <span className='flex items-center gap-2'>
              {pushSubscribed ? <Bell className='w-4 h-4 text-accent' /> : <BellOff className='w-4 h-4' />}
              Notifications push
            </span>
            {pushLoading ? (
              <Loader2 className='w-5 h-5 animate-spin text-accent' />
            ) : (
              <div className={`
                w-10 h-6 rounded-full p-1 transition-colors duration-200
                ${pushSubscribed ? 'bg-accent' : 'bg-text-tertiary'}
              `}>
                <div className={`
                  w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200
                  ${pushSubscribed ? 'translate-x-4' : 'translate-x-0'}
                `} />
              </div>
            )}
          </button>
        )}

        <p className='text-text-quaternary text-xs text-center py-2'>Fait par <a href="https://justmaley.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-accent font-bold">JustMaley</a></p>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className='
            w-full flex items-center justify-center gap-2
            bg-surface/50 border border-white/20
            text-error rounded-xl px-4 py-3
            font-medium text-sm
            hover:bg-error/10 hover:border-error/50
            transition-all duration-200
          '
        >
          <LogOut className='w-4 h-4' />
          Se déconnecter
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className='fixed inset-0 bg-dark/90 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-fade-in'>
          <div className='bg-surface border border-white/20 rounded-2xl p-6 max-w-sm w-full space-y-5 animate-scale-in'>
            <div className='text-center space-y-2'>
              <div className='w-12 h-12 mx-auto rounded-full bg-error/10 flex items-center justify-center'>
                <LogOut className='w-6 h-6 text-error' />
              </div>
              <h3 className='text-text-primary text-lg font-semibold'>Déconnexion</h3>
              <p className='text-text-tertiary text-sm'>
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>
            </div>

            <div className='flex gap-3'>
              <button
                onClick={() => setShowLogoutModal(false)}
                className='flex-1 bg-surface border border-white/20 text-text-primary px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-surface-raised transition-all'
              >
                Annuler
              </button>
              <button
                onClick={handleLogout}
                className='flex-1 bg-error text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 active:scale-[0.98] transition-all'
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
