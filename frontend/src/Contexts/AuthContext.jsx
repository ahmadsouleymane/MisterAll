import React, { createContext, useContext, useState, useEffect } from 'react'
import { LoginWithEmail, LoginUser, GoogleAuthAPI, getUserProfile, logoutUser, ResendVerificationAPI } from '../api/userApi'
import { signInWithGoogle, signOutFromGoogle, isGoogleAuthAvailable } from '../config/firebase'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [requiresEmailMigration, setRequiresEmailMigration] = useState(false)
  const [requiresEmailVerification, setRequiresEmailVerification] = useState(false)

  // Verifier l'authentification au chargement
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Appeler getUserProfile - le cookie sera envoye automatiquement
      const userInfo = await getUserProfile()

      if (userInfo && userInfo.userInfos) {
        setUser(userInfo.userInfos)
        setIsAuthenticated(true)

        // Check if user needs to add email (legacy phone users)
        if (userInfo.userInfos.mustAddEmail) {
          setRequiresEmailMigration(true)
        }

        // Check if email verification is pending
        if (userInfo.userInfos.email && !userInfo.userInfos.emailVerified) {
          setRequiresEmailVerification(true)
        }
      } else {
        // Pas de session valide
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Login with email (new primary method)
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true)
      const result = await LoginWithEmail(email, password)

      if (result.success) {
        // Le cookie est automatiquement stocke par le navigateur
        // Charger les infos utilisateur
        const userInfo = await getUserProfile()
        if (userInfo && userInfo.userInfos) {
          setUser(userInfo.userInfos)
          setIsAuthenticated(true)

          // Check verification status
          if (result.requiresVerification) {
            setRequiresEmailVerification(true)
          }

          return { success: true }
        }
      }

      return { success: false, error: result.message || 'Identifiants incorrects' }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Login with phone number (legacy method for existing users)
   */
  const loginWithPhone = async (phoneNumber, password) => {
    try {
      setIsLoading(true)
      const result = await LoginUser(phoneNumber, password)

      if (result.success) {
        // Le cookie est automatiquement stocke par le navigateur
        // Charger les infos utilisateur
        const userInfo = await getUserProfile()
        if (userInfo && userInfo.userInfos) {
          setUser(userInfo.userInfos)
          setIsAuthenticated(true)

          // Check if user needs to add email (migration)
          if (userInfo.userInfos.mustAddEmail) {
            setRequiresEmailMigration(true)
          }

          return { success: true }
        }
      }

      return { success: false, error: result.message || 'Identifiants incorrects' }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true)

      // Check if Google auth is available
      if (!isGoogleAuthAvailable()) {
        return { success: false, error: 'La connexion Google n\'est pas disponible' }
      }

      // Get Firebase token
      const googleResult = await signInWithGoogle()
      if (!googleResult.success) {
        return { success: false, error: googleResult.error }
      }

      // Send token to backend
      const apiResult = await GoogleAuthAPI(googleResult.idToken)

      if (!apiResult.success) {
        // Backend auth failed
        await signOutFromGoogle()
        return { success: false, error: apiResult.message || 'Erreur d\'authentification Google' }
      }

      // Load user info
      const userInfo = await getUserProfile()
      if (!userInfo || !userInfo.userInfos) {
        // Failed to get user profile - this shouldn't happen after successful auth
        console.error('Google auth succeeded but getUserProfile failed:', userInfo)
        await signOutFromGoogle()
        return { success: false, error: 'Erreur lors de la recuperation du profil' }
      }

      setUser(userInfo.userInfos)
      setIsAuthenticated(true)

      return {
        success: true,
        needsProfile: apiResult.needsProfile,
        isNewUser: apiResult.isNewUser,
        user: userInfo.userInfos
      }
    } catch (error) {
      console.error('Google login error:', error)
      await signOutFromGoogle()
      return { success: false, error: 'Erreur de connexion avec Google' }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Resend verification email
   */
  const resendVerificationEmail = async () => {
    try {
      const result = await ResendVerificationAPI()
      return result
    } catch (error) {
      return { error: true, message: 'Erreur lors de l\'envoi' }
    }
  }

  /**
   * Mark email as verified (called after successful verification)
   */
  const markEmailVerified = () => {
    if (user) {
      setUser({ ...user, emailVerified: true })
      setRequiresEmailVerification(false)
    }
  }

  /**
   * Mark email as added (called after migration)
   */
  const markEmailAdded = (email) => {
    if (user) {
      setUser({ ...user, email, mustAddEmail: false })
      setRequiresEmailMigration(false)
      setRequiresEmailVerification(true) // Now needs verification
    }
  }

  /**
   * Refresh user data from server (useful after trial activation, premium purchase, etc.)
   */
  const refreshUser = async () => {
    try {
      const userInfo = await getUserProfile()
      if (userInfo && userInfo.userInfos) {
        setUser(userInfo.userInfos)
        return { success: true, user: userInfo.userInfos }
      }
      return { success: false }
    } catch (error) {
      return { success: false, error: 'Erreur lors du rafraîchissement' }
    }
  }

  const logout = async () => {
    try {
      // Appeler le backend pour supprimer le cookie et invalider le token
      await logoutUser()
      // Sign out from Firebase if user was using Google
      await signOutFromGoogle()
    } catch (error) {
      // Continuer meme si l'appel echoue
    }
    setUser(null)
    setIsAuthenticated(false)
    setRequiresEmailMigration(false)
    setRequiresEmailVerification(false)
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithPhone,
    loginWithGoogle,
    logout,
    checkAuth,
    refreshUser,
    resendVerificationEmail,
    markEmailVerified,
    markEmailAdded,
    requiresEmailMigration,
    requiresEmailVerification,
    isGoogleAuthAvailable: isGoogleAuthAvailable(),
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit etre utilise dans un AuthProvider')
  }
  return context
}
