import React, { useState, useRef, useEffect } from 'react'
import { MoveLeftIcon, Mail, CheckCircle2, KeyRound, Loader, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BigTitle from '../components/BigTitle'
import Inputs from '../components/Inputs'
import Buttons from '../components/Buttons'
import Modal from '../components/Modal'
import { ForgotPasswordAPI, ResetPasswordAPI } from '../api/userApi'
import useMeta from '../utils/useMeta'

export default function ForgotPassword() {
  useMeta({
    title: "MisterAll - Mot de passe oublie",
    canonical: "https://misterall.tech/forgot-password",
    url: "https://misterall.tech/forgot-password",
    noIndex: true
  })

  const navigate = useNavigate()

  // Step: 'email' | 'code' | 'password' | 'success'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef([])

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus first code input when entering code step
  useEffect(() => {
    if (step === 'code' && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [step])

  const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/
    return emailRegex.test(email)
  }

  // Step 1: Submit email
  const handleEmailSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setErrorMessage("L'adresse email est requise")
      setShowError(true)
      return
    }

    if (!validateEmail(email)) {
      setErrorMessage("Format d'email invalide")
      setShowError(true)
      return
    }

    setIsLoading(true)

    try {
      const result = await ForgotPasswordAPI(email)

      if (result.success) {
        setStep('code')
        setResendCooldown(60)
      } else {
        setErrorMessage(result.message || "Erreur lors de l'envoi")
        setShowError(true)
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur")
      setShowError(true)
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

    // Auto-proceed when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('')
      if (fullCode.length === 6) {
        setStep('password')
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
      setStep('password')
    }
  }

  // Resend code
  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsLoading(true)
    try {
      const result = await ForgotPasswordAPI(email)
      if (result.success) {
        setResendCooldown(60)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      } else {
        setErrorMessage(result.message || "Erreur lors de l'envoi")
        setShowError(true)
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur")
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Submit new password
  const handlePasswordSubmit = async (e) => {
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
      const fullCode = code.join('')
      const result = await ResetPasswordAPI(fullCode, newPassword)

      if (result.success) {
        setStep('success')
      } else {
        if (result.expired) {
          setErrorMessage("Le code a expire. Demande un nouveau code.")
          setStep('email')
          setCode(['', '', '', '', '', ''])
        } else {
          setErrorMessage(result.message || "Code invalide")
        }
        setShowError(true)
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion au serveur")
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className='min-h-dvh bg-dark pattern-dark flex items-center justify-center p-5'>
        <div className='w-full max-w-md text-center'>
          <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg'>
            <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in'>
              <CheckCircle2 className='w-8 h-8 text-success' />
            </div>
            <h1 className='text-text-primary text-xl font-bold mb-2'>
              Mot de passe mis a jour !
            </h1>
            <p className='text-text-secondary text-sm mb-6'>
              Tu peux maintenant te connecter avec ton nouveau mot de passe.
            </p>
            <Buttons onClick={() => navigate('/login')} primary title="Se connecter" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-dvh bg-dark pattern-dark'>
      {showError && <Modal message={errorMessage} type="error" onClose={() => setShowError(false)} />}

      <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
        {/* Header */}
        <div className='mb-8 lg:mb-12'>
          <button
            onClick={() => {
              if (step === 'code') setStep('email')
              else if (step === 'password') setStep('code')
              else navigate(-1)
            }}
            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
          >
            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
            <span className='text-sm font-medium'>Retour</span>
          </button>
        </div>

        {/* Container central */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 lg:p-10 shadow-dark-lg'>

              {/* Step 1: Email input */}
              {step === 'email' && (
                <>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center'>
                      <KeyRound className='w-8 h-8 text-accent' />
                    </div>
                  </div>

                  <BigTitle title="Mot de passe oublie ?" primary />
                  <p className='text-text-secondary text-sm mt-2 mb-8 text-center'>
                    Entre ton adresse email pour recevoir un code de reinitialisation
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

                    <div className='mt-4'>
                      <Buttons
                        type="submit"
                        primary
                        title={isLoading ? "Envoi en cours..." : "Envoyer le code"}
                        disabled={isLoading}
                      />
                    </div>
                  </form>
                </>
              )}

              {/* Step 2: Code input */}
              {step === 'code' && (
                <>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center'>
                      <Mail className='w-8 h-8 text-accent' />
                    </div>
                  </div>

                  <BigTitle title="Verifie ton email" primary />
                  <p className='text-text-secondary text-sm mt-2 mb-2 text-center'>
                    Entre le code a 6 chiffres envoye a
                  </p>
                  <p className='text-accent font-medium text-sm mb-8 text-center'>
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

                  <p className='text-text-tertiary text-xs mb-4 text-center'>
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
                          setStep('password')
                        } else {
                          setErrorMessage("Entre le code complet")
                          setShowError(true)
                        }
                      }}
                      primary
                      title="Continuer"
                      disabled={code.join('').length !== 6}
                    />
                  </div>
                </>
              )}

              {/* Step 3: New password */}
              {step === 'password' && (
                <>
                  <div className='flex justify-center mb-6'>
                    <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center'>
                      <KeyRound className='w-8 h-8 text-accent' />
                    </div>
                  </div>

                  <BigTitle title="Nouveau mot de passe" primary />
                  <p className='text-text-secondary text-sm mt-2 mb-8 text-center'>
                    Choisis un mot de passe securise
                  </p>

                  <form onSubmit={handlePasswordSubmit} className='flex flex-col gap-4'>
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
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors'
                      >
                        {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>

                    <div className='relative'>
                      <Inputs
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmer le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors'
                      >
                        {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                      </button>
                    </div>

                    <p className='text-text-tertiary text-xs'>
                      Minimum 6 caracteres
                    </p>

                    <div className='mt-4'>
                      <Buttons
                        type="submit"
                        primary
                        title={isLoading ? "Mise a jour..." : "Mettre a jour"}
                        disabled={isLoading}
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Back to login */}
            <p className='text-text-tertiary text-center text-sm mt-6'>
              Tu te souviens de ton mot de passe ?{' '}
              <button
                onClick={() => navigate('/login')}
                className='text-accent hover:text-accent-600 font-semibold transition-colors'
              >
                Connecte-toi
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
