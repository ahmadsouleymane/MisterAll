const API = import.meta.env.VITE_API_URL + '/user';

// =====================================================
// NEW EMAIL-BASED AUTH FUNCTIONS
// =====================================================

/**
 * Signup with email (new primary method)
 */
export const SignupWithEmail = async (userData) => {
    try {
        const response = await fetch(API + '/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(userData)
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Erreur lors de l\'inscription' }
        }

        return {
            success: true,
            user: data.user,
            requiresVerification: data.requiresVerification
        }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Login with email (new primary method)
 */
export const LoginWithEmail = async (email, password) => {
    try {
        const response = await fetch(API + '/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ email, password })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Identifiants incorrects' }
        }

        return {
            success: true,
            user: data.user,
            requiresVerification: data.requiresVerification
        }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Google OAuth authentication (for login - existing users)
 */
export const GoogleAuthAPI = async (idToken) => {
    try {
        const response = await fetch(API + '/google-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ idToken })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Erreur d\'authentification Google' }
        }

        return {
            success: true,
            user: data.user,
            needsProfile: data.needsProfile,
            isNewUser: data.isNewUser
        }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Google OAuth signup (for signup - new users with profile data)
 */
export const GoogleSignupAPI = async (idToken, profileData) => {
    try {
        const response = await fetch(API + '/google-signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ idToken, ...profileData })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Erreur lors de l\'inscription Google' }
        }

        return {
            success: true,
            user: data.user
        }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Verify email with 6-digit code
 */
export const VerifyEmailAPI = async (code) => {
    try {
        const response = await fetch(`${API}/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ code })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message, expired: data.expired }
        }

        return { success: true, message: data.message }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Resend verification email
 */
export const ResendVerificationAPI = async () => {
    try {
        const response = await fetch(`${API}/resend-verification`, {
            method: 'POST',
            credentials: "include"
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message }
        }

        return { success: true, message: data.message }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Request password reset via email
 */
export const ForgotPasswordAPI = async (email) => {
    try {
        const response = await fetch(`${API}/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ email })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message }
        }

        return { success: true, message: data.message }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Reset password with 6-digit code
 */
export const ResetPasswordAPI = async (code, newPassword) => {
    try {
        const response = await fetch(`${API}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ code, newPassword })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message, expired: data.expired }
        }

        return { success: true, user: data.user }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Add email to phone-based account (for migration)
 */
export const AddEmailAPI = async (email) => {
    try {
        const response = await fetch(`${API}/add-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ email })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message }
        }

        return { success: true, email: data.email }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Complete profile for Google users
 */
export const CompleteProfileAPI = async (profileData) => {
    try {
        const response = await fetch(`${API}/complete-profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify(profileData)
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message }
        }

        return { success: true, user: data.user }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

// =====================================================
// LEGACY PHONE AUTH FUNCTIONS (kept for migration)
// =====================================================

export const Signup = async (user) => {
    try {
        const response = await fetch(API + '/signup-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include", // Envoie et reçoit les cookies
            body: JSON.stringify({
                lastname: user.lastname,
                firstname: user.firstname,
                phone_number: user.phone_number,
                educationType: user.educationType,
                program: user.program,
                level: user.level,
                secondaryCycle: user.secondaryCycle,
                series: user.series,
                seriesOrientation: user.seriesOrientation,
                password: user.password,
            })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Erreur lors de l\'inscription' }
        }

        return { success: true, user: data.user }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

export const CheckPhoneNumber = async (phone_number) => {
    try {
        const response = await fetch(API + '/check-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                phone_number: phone_number
            })
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion' }
    }
}

export const LoginUser = async (phoneNumber, password) => {
    try {
        const response = await fetch(API + '/login-phone', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include", // Le cookie sera automatiquement stocké
            body: JSON.stringify({
                phone_number: phoneNumber,
                password: password
            })
        })
        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Identifiants incorrects' }
        }

        return { success: true, user: data.user }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

export const getUserProfile = async () => {
    try {
        const response = await fetch(API + '/infos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include"
        })

        if (!response.ok) {
            return { error: true, message: 'Session expirée' }
        }

        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion' }
    }
}

export const logoutUser = async () => {
    try {
        const response = await fetch(API + '/logout', {
            method: 'POST',
            credentials: "include",
        })
        return await response.json()
    } catch (error) {
        return { error: true, message: 'Erreur lors de la déconnexion' }
    }
}

export const getUserStats = async () => {
    try {
        const response = await fetch(API + '/stats', {
            method: 'GET',
            credentials: "include",
        })

        if (!response.ok) {
            return { error: true, message: 'Erreur lors de la récupération des stats' }
        }

        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

export const uploadAvatar = async (file) => {
    try {
        const formData = new FormData()
        formData.append('avatar', file)

        const response = await fetch(API + '/avatar', {
            method: 'POST',
            credentials: "include",
            body: formData
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Erreur lors de l\'upload' }
        }

        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

export const deleteAvatar = async () => {
    try {
        const response = await fetch(API + '/avatar', {
            method: 'DELETE',
            credentials: "include"
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Erreur lors de la suppression' }
        }

        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

// =====================================================
// TRIAL SYSTEM FUNCTIONS
// =====================================================

/**
 * Check if user is eligible for trial
 */
export const checkTrialEligibility = async () => {
    try {
        const response = await fetch(`${API}/trial/check`, {
            method: 'GET',
            credentials: "include"
        })

        if (!response.ok) {
            return { error: true, message: 'Erreur lors de la vérification' }
        }

        return await response.json()
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Activate 7-day free trial
 */
export const activateTrial = async () => {
    try {
        const response = await fetch(`${API}/trial/activate`, {
            method: 'POST',
            credentials: "include"
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message, reason: data.reason }
        }

        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Decline trial offer
 */
export const declineTrial = async () => {
    try {
        const response = await fetch(`${API}/trial/decline`, {
            method: 'POST',
            credentials: "include"
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message }
        }

        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Vérifie l'identité de l'utilisateur pour la réinitialisation du mot de passe
 * @param {string} phone_number - Numéro de téléphone complet avec indicatif
 * @param {string} lastname - Nom de famille
 */
export const verifyUserIdentity = async (phone_number, lastname) => {
    try {
        const response = await fetch(`${API}/verify-identity`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ phone_number, lastname })
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Vérification échouée' }
        }

        return {
            success: true,
            resetToken: data.resetToken,
            firstname: data.firstname
        }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

/**
 * Réinitialise le mot de passe avec le token de vérification
 * @param {string} phone_number - Numéro de téléphone complet avec indicatif
 * @param {string} resetToken - Token de réinitialisation reçu après vérification
 * @param {string} newPassword - Nouveau mot de passe
 */
export const resetPassword = async (phone_number, resetToken, newPassword) => {
    try {
        const response = await fetch(`${API}/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ phone_number, resetToken, newPassword })
        })

        const data = await response.json()

        if (!response.ok) {
            return { error: true, message: data.message || 'Réinitialisation échouée' }
        }

        return { success: true, user: data.user }
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}
