import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, CheckCircle2, Loader, RefreshCw, AlertTriangle } from 'lucide-react'
import { AddEmailAPI, VerifyEmailAPI, ResendVerificationAPI } from '../api/userApi'
import { useAuth } from '../Contexts/AuthContext'
import Buttons from '../components/Buttons'
import Inputs from '../components/Inputs'
import useMeta from '../utils/useMeta'

export default function AddEmail() {
  const navigate = useNavigate()
  const { user, isAuthenticated, markEmailAdded, markEmailVerified, checkAuth, logout } = useAuth()

  // step: 'email' | 'verify' | 'success'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef([])

  useMeta({
    title: "MisterAll - Ajouter ton email",
    noIndex: true
  })

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus first code input when entering verify step
  useEffect(() => {
    if (step === 'verify' && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [step])

  // Redirect if not authenticated OR already has verified email
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    } else if (user?.email && user?.emailVerified) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, user?.email, user?.emailVerified, navigate])

  // If user has email but not verified, go to verify step
  useEffect(() => {
    if (user?.email && !user?.emailVerified) {
      setEmail(user.email)
      setStep('verify')
    }
  }, [user])

  if (!isAuthenticated || (user?.email && user?.emailVerified)) {
    return null
  }

  const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/
    return emailRegex.test(email)
  }

  // Step 1: Submit email
  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError("L'adresse email est requise")
      return
    }

    if (!validateEmail(email)) {
      setError("Format d'email invalide")
      return
    }

    setIsLoading(true)

    try {
      const result = await AddEmailAPI(email)

      if (result.success) {
        markEmailAdded(email)
        setStep('verify')
        setResendCooldown(60)
      } else {
        setError(result.message || "Erreur lors de l'ajout de l'email")
      }
    } catch (err) {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Handle code input
  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        verifyEmail(fullCode)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      verifyEmail(pastedData)
    }
  }

  const verifyEmail = async (fullCode) => {
    setIsLoading(true)
    setError('')

    try {
      const result = await VerifyEmailAPI(fullCode)

      if (result.success) {
        markEmailVerified()
        await checkAuth()
        setStep('success')
      } else {
        setError(result.message || 'Code invalide')
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      }
    } catch (err) {
      setError('Erreur lors de la verification')
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    setError('')

    try {
      const result = await ResendVerificationAPI()
      if (result.success) {
        setResendCooldown(60)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setError(result.message || "Erreur lors de l'envoi")
      }
    } catch (err) {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    navigate('/home')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className='min-h-dvh bg-dark pattern-dark'>
      <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
        {/* Content */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg'>

              {/* Step 1: Email input */}
              {step === 'email' && (
                <>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center'>
                      <AlertTriangle className='w-8 h-8 text-accent' />
                    </div>
                  </div>

                  <h1 className='text-text-primary text-xl font-bold text-center mb-2'>
                    Ajoute ton email
                  </h1>
                  <p className='text-text-secondary text-sm text-center mb-8'>
                    Pour continuer a utiliser MisterAll, tu dois ajouter et verifier une adresse email.
                    Cela nous permettra de securiser ton compte et de te contacter en cas de besoin.
                  </p>

                  <form onSubmit={handleEmailSubmit} className='flex flex-col gap-4'>
                    <Inputs
                      type="email"
                      placeholder="ton.email@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={isLoading}
                    />

                    {error && (
                      <p className='text-error text-sm text-center'>{error}</p>
                    )}

                    <div className='mt-4'>
                      <Buttons
                        type="submit"
                        primary
                        title={isLoading ? "Envoi en cours..." : "Continuer"}
                        disabled={isLoading}
                      />
                    </div>
                  </form>

                  {/* Logout option */}
                  <button
                    onClick={handleLogout}
                    className='w-full mt-4 text-text-tertiary text-sm hover:text-text-secondary transition-colors'
                  >
                    Se deconnecter
                  </button>
                </>
              )}

              {/* Step 2: Code verification */}
              {step === 'verify' && (
                <>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center'>
                      <Mail className='w-8 h-8 text-accent' />
                    </div>
                  </div>

                  <h1 className='text-text-primary text-xl font-bold text-center mb-2'>
                    Verifie ton email
                  </h1>
                  <p className='text-text-secondary text-sm text-center mb-2'>
                    Entre le code a 6 chiffres envoye a
                  </p>
                  <p className='text-accent font-medium text-sm text-center mb-8'>
                    {email}
                  </p>

                  {/* Code Input */}
                  <div className='flex justify-center gap-2 mb-6'>
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        disabled={isLoading}
                        className={`
                          w-12 h-14
                          bg-surface border-2
                          ${digit ? 'border-accent' : 'border-white/20'}
                          rounded-xl
                          text-center text-xl font-bold text-text-primary
                          focus:border-accent focus:outline-none
                          transition-all
                          disabled:opacity-50
                        `}
                      />
                    ))}
                  </div>

                  {isLoading && (
                    <div className='flex items-center justify-center gap-2 text-accent mb-4'>
                      <Loader className='w-5 h-5 animate-spin' />
                      <span className='text-sm font-medium'>Verification...</span>
                    </div>
                  )}

                  {error && (
                    <p className='text-error text-sm text-center mb-4'>{error}</p>
                  )}

                  <p className='text-text-tertiary text-xs text-center mb-4'>
                    Le code expire dans 15 minutes
                  </p>

                  {/* Resend button */}
                  <button
                    onClick={handleResend}
                    disabled={isLoading || resendCooldown > 0}
                    className='
                      flex items-center justify-center gap-2 mx-auto
                      text-text-secondary hover:text-accent
                      text-sm font-medium
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    '
                  >
                    {isLoading ? (
                      <Loader className='w-4 h-4 animate-spin' />
                    ) : (
                      <RefreshCw className='w-4 h-4' />
                    )}
                    <span>
                      {resendCooldown > 0
                        ? `Renvoyer dans ${resendCooldown}s`
                        : 'Renvoyer le code'}
                    </span>
                  </button>

                  {/* Manual continue button */}
                  <div className='mt-6'>
                    <Buttons
                      onClick={() => {
                        if (code.join('').length === 6) {
                          verifyEmail(code.join(''))
                        }
                      }}
                      primary
                      title="Verifier"
                      disabled={code.join('').length !== 6 || isLoading}
                    />
                  </div>

                  {/* Change email */}
                  <button
                    onClick={() => {
                      setStep('email')
                      setCode(['', '', '', '', '', ''])
                      setError('')
                    }}
                    className='w-full mt-4 text-text-tertiary text-sm hover:text-text-secondary transition-colors'
                  >
                    Changer d'email
                  </button>
                </>
              )}

              {/* Step 3: Success */}
              {step === 'success' && (
                <>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 bg-success/20 rounded-full flex items-center justify-center animate-scale-in'>
                      <CheckCircle2 className='w-8 h-8 text-success' />
                    </div>
                  </div>

                  <h1 className='text-text-primary text-xl font-bold text-center mb-2'>
                    Email verifie !
                  </h1>
                  <p className='text-text-secondary text-sm text-center mb-8'>
                    Ton compte est maintenant securise. Tu peux continuer a utiliser MisterAll.
                  </p>

                  <Buttons onClick={handleContinue} primary title="Continuer" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
