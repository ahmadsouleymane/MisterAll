import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, AlertTriangle, Users, TrendingUp, Wifi, Clock, RefreshCw, Monitor } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import useMeta from '../utils/useMeta'

const VITE_API_URL = import.meta.env.VITE_API_URL

// Fonction pour formater la date de dernière activité
const formatLastActivity = (date) => {
  if (!date) return 'Jamais'

  const now = new Date()
  const lastDate = new Date(date)
  const diffMs = now - lastDate
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'En ligne'
  if (diffMins < 60) return `Il y a ${diffMins} min`
  if (diffHours < 24) return `Il y a ${diffHours}h`
  if (diffDays < 7) return `Il y a ${diffDays}j`
  return lastDate.toLocaleDateString('fr-FR')
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isLoading: authLoading } = useAuth()

  const [loading, setLoading] = useState(false)
  const [allUsers, setAllUsers] = useState([])
  const [expiringUsers, setExpiringUsers] = useState([])
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [userIdToPremium, setUserIdToPremium] = useState('')
  const [messageModal, setMessageModal] = useState({ show: false, text: '', type: 'success' })
  const [isAccessDenied, setIsAccessDenied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useMeta({
    title: "MisterAll - Admin Dashboard",
    canonical: "https://misterall.tech/admin",
    url: "https://misterall.tech/admin",
    noIndex: true
  })

  // Vérifier si l'utilisateur est admin et charger les données
  useEffect(() => {
    if (!authLoading) {
      const isAdmin = user && user.isAdmin === true

      if (isAdmin) {
        setIsAccessDenied(false)
        // Charger les données seulement si admin
        loadAllUsers()
        loadExpiringPremiums()
      } else {
        setIsAccessDenied(true)
      }
    }
  }, [user, authLoading])

  const loadAllUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${VITE_API_URL}/user/admin/users/all`, {
        credentials: "include",
      })
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          showMessage('Vous n\'avez pas les droits admin', 'error')
          setIsAccessDenied(true)
        } else {
          showMessage(data.message || 'Erreur lors du chargement des utilisateurs', 'error')
        }
        return
      }

      if (data.users) {
        setAllUsers(data.users)
      }
    } catch (error) {
      showMessage('Erreur lors du chargement des utilisateurs', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadExpiringPremiums = async () => {
    try {
      const response = await fetch(`${VITE_API_URL}/user/admin/premium/expiring`, {
        credentials: "include",
      })
      const data = await response.json()
      if (data.users) {
        setExpiringUsers(data.users)
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const addPremium = async () => {
    if (!userIdToPremium.trim()) {
      showMessage('Veuillez entrer un email ou un ID utilisateur', 'error')
      return
    }

    try {
      setLoading(true)

      // Le backend accepte maintenant userId (qui peut être un ID, email ou téléphone)
      const response = await fetch(`${VITE_API_URL}/user/admin/premium/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ userId: userIdToPremium.trim() })
      })

      const data = await response.json()
      if (response.ok) {
        showMessage(`Premium ajouté à ${data.user.firstname} ${data.user.lastname}`, 'success')
        setUserIdToPremium('')
        loadAllUsers()
        loadExpiringPremiums()
      } else {
        showMessage(data.message || 'Erreur lors de l\'ajout du premium', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showMessage('Erreur lors de l\'ajout du premium', 'error')
    } finally {
      setLoading(false)
    }
  }

  const removePremium = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer le premium ?')) return

    try {
      setLoading(true)
      const response = await fetch(`${VITE_API_URL}/user/admin/premium/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: "include",
        body: JSON.stringify({ userId })
      })

      const data = await response.json()
      if (response.ok) {
        showMessage(`Premium retiré à ${data.user.firstname} ${data.user.lastname}`, 'success')
        loadAllUsers()
        loadExpiringPremiums()
      } else {
        showMessage(data.message || 'Erreur lors du retrait du premium', 'error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      showMessage('Erreur lors du retrait du premium', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessageModal({ show: true, text, type })
    setTimeout(() => setMessageModal({ show: false, text: '', type: 'success' }), 3000)
  }

  const refreshData = async () => {
    setRefreshing(true)
    await Promise.all([loadAllUsers(), loadExpiringPremiums()])
    setRefreshing(false)
  }

  const filteredUsers = allUsers.filter(u =>
    u.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.phone_number && u.phone_number.includes(searchTerm))
  )

  const premiumUsers = allUsers.filter(u => u.premium)
  const onlineUsers = allUsers.filter(u => u.isOnline)

  // Afficher un loader pendant le chargement de l'authentification
  if (authLoading) {
    return (
      <div className='min-h-screen bg-dark flex items-center justify-center'>
        <div className='text-center'>
          <img src="logo.svg" alt="logo" className='w-32 mx-auto mb-4 animate-pulse' />
          <p className='text-text-tertiary'>Vérification des accès...</p>
        </div>
      </div>
    )
  }

  // Afficher un écran 404 pour l'accès refusé (sans révéler qu'il existe une page admin)
  if (isAccessDenied) {
    return (
      <div className='min-h-screen bg-dark pb-24 page-transition flex items-center justify-center'>
        {/* Background animé */}
        <div className='fixed inset-0 pointer-events-none overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-40' />
          <div className='absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float' />
          <div className='absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-[100px] animate-float-gentle' />
        </div>

        <div className='relative max-w-md mx-auto px-4 text-center space-y-6'>
          <div>
            <p className='text-6xl font-bold text-accent mb-4'>404</p>
            <h1 className='text-text-primary text-2xl font-bold mb-2'>Page non trouvée</h1>
            <p className='text-text-tertiary'>La page que vous cherchez n'existe pas ou est inaccessible.</p>
          </div>

          <button
            onClick={() => navigate('/home')}
            className='bg-accent text-dark px-6 py-3 rounded-xl font-bold hover:shadow-glow-sm transition-all'
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-dark pb-24 page-transition'>
      {/* Background animé */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-mesh animate-mesh-move opacity-40' />
        <div className='absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] animate-float' />
        <div className='absolute bottom-0 left-0 w-80 h-80 bg-accent/3 rounded-full blur-[100px] animate-float-gentle' />
      </div>

      {/* Container */}
      <div className='relative max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-6 space-y-6'>

        {/* Header */}
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='p-2.5 rounded-xl bg-surface/50 border border-white/20 text-text-secondary hover:text-accent hover:bg-accent/5 transition-all group'
          >
            <ArrowLeft className='h-6 w-6 group-hover:-translate-x-1 transition-transform' />
          </button>

          <div className='flex-1'>
            <h1 className='text-text-primary text-2xl sm:text-3xl font-bold'>
              Dashboard Admin
            </h1>
            <p className='text-text-tertiary text-sm mt-1'>
              Gestion des utilisateurs
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          <div className='glass-effect rounded-xl p-5 border border-white/20 shadow-glass'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-text-tertiary text-xs sm:text-sm font-medium'>Utilisateurs</p>
                <p className='text-text-primary text-2xl sm:text-3xl font-bold mt-1'>{allUsers.length}</p>
              </div>
              <Users className='w-6 h-6 sm:w-8 sm:h-8 text-accent opacity-50' />
            </div>
          </div>

          <div className='glass-effect rounded-xl p-5 border border-green-500/20 shadow-glass'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-text-tertiary text-xs sm:text-sm font-medium'>En ligne</p>
                <p className='text-green-400 text-2xl sm:text-3xl font-bold mt-1'>{onlineUsers.length}</p>
              </div>
              <Wifi className='w-6 h-6 sm:w-8 sm:h-8 text-green-400 opacity-50' />
            </div>
          </div>

          <div className='glass-effect rounded-xl p-5 border border-white/20 shadow-glass'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-text-tertiary text-xs sm:text-sm font-medium'>Premium</p>
                <p className='text-accent text-2xl sm:text-3xl font-bold mt-1'>{premiumUsers.length}</p>
              </div>
              <TrendingUp className='w-6 h-6 sm:w-8 sm:h-8 text-accent opacity-50' />
            </div>
          </div>

          <div className='glass-effect rounded-xl p-5 border border-orange-500/20 shadow-glass'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-text-tertiary text-xs sm:text-sm font-medium'>Expirant</p>
                <p className='text-orange-400 text-2xl sm:text-3xl font-bold mt-1'>{expiringUsers.length}</p>
              </div>
              <AlertTriangle className='w-6 h-6 sm:w-8 sm:h-8 text-orange-400 opacity-50' />
            </div>
          </div>
        </div>

        {/* Add Premium Section */}
        <div className='glass-effect rounded-2xl p-6 sm:p-8 border border-white/20 shadow-glass'>
          <div className='flex items-center gap-2 mb-6'>
            <Plus className='w-5 h-5 text-accent' />
            <h2 className='text-text-primary text-xl font-bold'>Ajouter le premium</h2>
          </div>

          <div className='flex flex-col sm:flex-row gap-3'>
            <input
              type='text'
              placeholder='Email utilisateur ou ID'
              value={userIdToPremium}
              onChange={(e) => setUserIdToPremium(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPremium()}
              className='flex-1 bg-surface/50 border border-white/20 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors'
            />
            <button
              onClick={addPremium}
              disabled={loading}
              className='bg-accent text-dark px-6 py-3 rounded-xl font-bold hover:shadow-glow-sm transition-all disabled:opacity-50'
            >
              {loading ? 'Chargement...' : 'Ajouter'}
            </button>
          </div>
        </div>

        {/* Expiring Premiums */}
        {expiringUsers.length > 0 && (
          <div className='glass-effect rounded-2xl p-6 sm:p-8 border border-orange-500/20 shadow-glass'>
            <div className='flex items-center gap-2 mb-6'>
              <AlertTriangle className='w-5 h-5 text-orange-400' />
              <h2 className='text-text-primary text-xl font-bold'>Abonnements expirant bientôt</h2>
              <span className='ml-auto text-orange-400 text-sm font-bold'>{expiringUsers.length}</span>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-white/20'>
                    <th className='text-left py-3 px-4 text-text-tertiary font-semibold'>Nom</th>
                    <th className='text-left py-3 px-4 text-text-tertiary font-semibold'>Email</th>
                    <th className='text-left py-3 px-4 text-text-tertiary font-semibold'>Expire le</th>
                    <th className='text-left py-3 px-4 text-text-tertiary font-semibold'>Jours restants</th>
                    <th className='text-left py-3 px-4 text-text-tertiary font-semibold'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringUsers.map((u) => {
                    const daysLeft = Math.ceil((new Date(u.premiumExpiry) - new Date()) / (1000 * 60 * 60 * 24))
                    return (
                      <tr key={u._id} className='border-b border-white/20/50 hover:bg-surface/20 transition-colors'>
                        <td className='py-3 px-4 text-text-primary font-medium'>{u.firstname} {u.lastname}</td>
                        <td className='py-3 px-4 text-text-tertiary text-xs'>{u.email || u.phone_number || '-'}</td>
                        <td className='py-3 px-4 text-text-tertiary text-sm'>
                          {new Date(u.premiumExpiry).toLocaleDateString('fr-FR')}
                        </td>
                        <td className='py-3 px-4'>
                          <span className={`text-sm font-bold ${daysLeft <= 2 ? 'text-red-400' : 'text-orange-400'}`}>
                            {daysLeft} j
                          </span>
                        </td>
                        <td className='py-3 px-4'>
                          <button
                            onClick={() => removePremium(u._id)}
                            className='p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300'
                          >
                            <Trash2 className='w-4 h-4' />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users List */}
        <div className='glass-effect rounded-2xl p-6 sm:p-8 border border-white/20 shadow-glass'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
            <div className='flex items-center gap-3'>
              <h2 className='text-text-primary text-xl font-bold'>Utilisateurs</h2>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className='p-2 rounded-lg bg-surface/50 hover:bg-surface text-text-tertiary hover:text-accent transition-all disabled:opacity-50'
                title='Rafraîchir'
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => setSelectedTab('all')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedTab === 'all'
                    ? 'bg-accent text-dark font-bold'
                    : 'bg-surface/50 text-text-tertiary hover:bg-surface'
                }`}
              >
                Tous ({allUsers.length})
              </button>
              <button
                onClick={() => setSelectedTab('online')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedTab === 'online'
                    ? 'bg-green-500 text-dark font-bold'
                    : 'bg-surface/50 text-text-tertiary hover:bg-surface'
                }`}
              >
                En ligne ({onlineUsers.length})
              </button>
              <button
                onClick={() => setSelectedTab('premium')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  selectedTab === 'premium'
                    ? 'bg-accent text-dark font-bold'
                    : 'bg-surface/50 text-text-tertiary hover:bg-surface'
                }`}
              >
                Premium ({premiumUsers.length})
              </button>
            </div>
          </div>

          <input
            type='text'
            placeholder='Rechercher par nom ou email...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='w-full bg-surface/50 border border-white/20 rounded-xl px-4 py-3 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent transition-colors mb-6'
          />

          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-white/20'>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold'>Statut</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold'>Nom</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold hidden sm:table-cell'>Email</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold'>Dernière activité</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold hidden md:table-cell'>Sessions</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold hidden lg:table-cell'>Premium</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold hidden lg:table-cell'>Cours</th>
                  <th className='text-left py-3 px-2 sm:px-4 text-text-tertiary font-semibold'>Action</th>
                </tr>
              </thead>
              <tbody>
                {(selectedTab === 'premium' ? premiumUsers : selectedTab === 'online' ? onlineUsers : filteredUsers).map((u) => (
                  <tr key={u.id} className='border-b border-white/20/50 hover:bg-surface/20 transition-colors'>
                    <td className='py-3 px-2 sm:px-4'>
                      <div className='flex items-center gap-2'>
                        <span className={`w-2.5 h-2.5 rounded-full ${u.isOnline ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
                        <span className={`text-xs font-medium hidden sm:inline ${u.isOnline ? 'text-green-400' : 'text-text-tertiary'}`}>
                          {u.isOnline ? 'En ligne' : 'Hors ligne'}
                        </span>
                      </div>
                    </td>
                    <td className='py-3 px-2 sm:px-4'>
                      <div>
                        <p className='text-text-primary font-medium'>{u.firstname} {u.lastname}</p>
                        <p className='text-text-tertiary text-xs sm:hidden'>{u.email || u.phone_number || '-'}</p>
                      </div>
                    </td>
                    <td className='py-3 px-2 sm:px-4 text-text-tertiary text-xs hidden sm:table-cell'>
                      {u.email ? (
                        <span className={u.emailVerified ? 'text-green-400' : 'text-orange-400'}>
                          {u.email}
                          {!u.emailVerified && ' (non vérifié)'}
                        </span>
                      ) : (
                        <span className='text-red-400'>{u.phone_number || 'Pas d\'email'}</span>
                      )}
                    </td>
                    <td className='py-3 px-2 sm:px-4'>
                      <div className='flex items-center gap-1.5'>
                        <Clock className='w-3.5 h-3.5 text-text-tertiary' />
                        <span className={`text-xs ${u.isOnline ? 'text-green-400' : 'text-text-tertiary'}`}>
                          {formatLastActivity(u.lastActivity)}
                        </span>
                      </div>
                    </td>
                    <td className='py-3 px-2 sm:px-4 hidden md:table-cell'>
                      <div className='flex items-center gap-1.5'>
                        <Monitor className='w-3.5 h-3.5 text-text-tertiary' />
                        <span className='text-text-tertiary text-xs'>{u.activeSessions || 0}</span>
                      </div>
                    </td>
                    <td className='py-3 px-2 sm:px-4 hidden lg:table-cell'>
                      {u.premium ? (
                        <span className='bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs font-bold'>
                          Actif
                        </span>
                      ) : (
                        <span className='bg-surface text-text-tertiary px-2 py-0.5 rounded-full text-xs'>
                          Gratuit
                        </span>
                      )}
                    </td>
                    <td className='py-3 px-2 sm:px-4 text-text-tertiary text-xs hidden lg:table-cell'>{u.addedCourses}</td>
                    <td className='py-3 px-2 sm:px-4'>
                      {u.premium && (
                        <button
                          onClick={() => removePremium(u.id)}
                          className='p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300'
                          title='Retirer premium'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && selectedTab === 'all' && (
            <div className='text-center py-8 text-text-tertiary'>
              Aucun utilisateur trouvé
            </div>
          )}

          {onlineUsers.length === 0 && selectedTab === 'online' && (
            <div className='text-center py-8 text-text-tertiary'>
              Aucun utilisateur en ligne
            </div>
          )}

          {premiumUsers.length === 0 && selectedTab === 'premium' && (
            <div className='text-center py-8 text-text-tertiary'>
              Aucun utilisateur premium pour le moment
            </div>
          )}
        </div>
      </div>

      {/* Message Modal */}
      {messageModal.show && (
        <div className='fixed bottom-6 right-6 z-50'>
          <div className={`${
            messageModal.type === 'success'
              ? 'bg-green-500/20 border border-green-500 text-green-400'
              : 'bg-red-500/20 border border-red-500 text-red-400'
          } px-6 py-4 rounded-xl font-medium max-w-sm`}>
            {messageModal.text}
          </div>
        </div>
      )}
    </div>
  )
}
