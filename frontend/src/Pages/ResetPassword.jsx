import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { KeyRound, CheckCircle2, EyeIcon, EyeOffIcon, Loader, AlertTriangle } from 'lucide-react'
import { ResetPasswordAPI } from '../api/userApi'
import { useAuth } from '../Contexts/AuthContext'
import BigTitle from '../components/BigTitle'
import Inputs from '../components/Inputs'
import Buttons from '../components/Buttons'
import Modal from '../components/Modal'
import useMeta from '../utils/useMeta'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { checkAuth } = useAuth()

  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenExpired, setTokenExpired] = useState(false)

  useMeta({
    title: "MisterAll - Reinitialiser mot de passe",
    noIndex: true
  })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      setTokenExpired(true)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newPassword) {
      setErrorMessage("Le nouveau mot de passe est requis")
      setShowError(true)
      return
    }

    if (newPassword.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caracteres")
      setShowError(true)
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas")
      setShowError(true)
      return
    }

    setIsLoading(true)

    try {
      const result = await ResetPasswordAPI(token, newPassword)

      if (result.success) {
        setSuccess(true)
        // User is automatically logged in, refresh auth state
        await checkAuth()
      } else {
        if (result.expired) {
          setTokenExpired(true)
        } else {
          setErrorMessage(result.message)
          setShowError(true)
        }
      }
    } catch (error) {
      setErrorMessage("Erreur lors de la reinitialisation")
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Token expired or missing
  if (tokenExpired) {
    return (
      <div className='min-h-dvh bg-dark pattern-dark flex items-center justify-center p-5'>
        <div className='w-full max-w-md'>
          <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg text-center'>
            <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center'>
              <AlertTriangle className='w-8 h-8 text-amber-500' />
            </div>
            <h1 className='text-text-primary text-xl font-bold mb-2'>
              Lien expire
            </h1>
            <p className='text-text-secondary text-sm mb-6'>
              Ce lien de reinitialisation a expire ou n'est plus valide.
              Demande un nouveau lien.
            </p>
            <Buttons
              onClick={() => navigate('/forgot-password')}
              primary
              title="Demander un nouveau lien"
            />
          </div>

          <p className='text-text-tertiary text-center text-sm mt-6'>
            <button
              onClick={() => navigate('/login')}
              className='text-accent hover:text-accent-600 font-semibold transition-colors'
            >
              Retour a la connexion
            </button>
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className='min-h-dvh bg-dark pattern-dark flex items-center justify-center p-5'>
        <div className='w-full max-w-md text-center'>
          <div className='w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in'>
            <CheckCircle2 className='w-10 h-10 text-success' />
          </div>
          <h1 className='text-2xl font-bold text-text-primary mb-2'>
            Mot de passe modifie !
          </h1>
          <p className='text-text-secondary mb-8'>
            Tu es maintenant connecte avec ton nouveau mot de passe.
          </p>
          <Buttons
            onClick={() => navigate('/home')}
            primary
            title="Aller a l'accueil"
          />
        </div>
      </div>
    )
  }

  // Reset form
  return (
    <div className='min-h-dvh bg-dark pattern-dark flex items-center justify-center p-5'>
      {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}

      <div className='w-full max-w-md'>
        <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg'>
          {/* Icon */}
          <div className='flex justify-center mb-6'>
            <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center'>
              <KeyRound className='w-8 h-8 text-accent' />
            </div>
          </div>

          <BigTitle title="Nouveau mot de passe" primary />
          <p className='text-text-secondary text-sm mt-2 mb-8 text-center'>
            Choisis un mot de passe securise (min. 6 caracteres)
          </p>

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            {/* New password */}
            <div className='relative'>
              <Inputs
                type={showPassword ? "text" : "password"}
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1'
              >
                {showPassword ? <EyeOffIcon className='w-5 h-5' /> : <EyeIcon className='w-5 h-5' />}
              </button>
            </div>

            {/* Confirm password */}
            <Inputs
              type={showPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={isLoading}
            />

            <div className='mt-4'>
              <Buttons
                type="submit"
                primary
                title={isLoading ? "Modification..." : "Changer mon mot de passe"}
                disabled={isLoading}
              />
            </div>
          </form>
        </div>

        <p className='text-text-tertiary text-center text-sm mt-6'>
          <button
            onClick={() => navigate('/login')}
            className='text-accent hover:text-accent-600 font-semibold transition-colors'
          >
            Retour a la connexion
          </button>
        </p>
      </div>
    </div>
  )
}
