import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Loader, Mail, RefreshCw, MoveLeftIcon } from 'lucide-react'
import { VerifyEmailAPI, ResendVerificationAPI } from '../api/userApi'
import { useAuth } from '../Contexts/AuthContext'
import Buttons from '../components/Buttons'
import useMeta from '../utils/useMeta'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const { isAuthenticated, user, markEmailVerified, checkAuth } = useAuth()

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [status, setStatus] = useState('input') // input, loading, success, error
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const inputRefs = useRef([])

  useMeta({
    title: "MisterAll - Verification Email",
    noIndex: true
  })

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  // Auto-focus first input
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleCodeChange = (index, value) => {
    // Only allow numbers
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
    // Handle backspace
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
    setStatus('loading')
    try {
      const result = await VerifyEmailAPI(fullCode)

      if (result.success) {
        setStatus('success')
        setMessage(result.message)
        markEmailVerified()
        await checkAuth()
      } else {
        setStatus('error')
        setMessage(result.message || 'Code invalide')
        // Reset code after error
        setTimeout(() => {
          setCode(['', '', '', '', '', ''])
          setStatus('input')
          inputRefs.current[0]?.focus()
        }, 2000)
      }
    } catch (error) {
      setStatus('error')
      setMessage('Erreur lors de la verification')
      setTimeout(() => {
        setCode(['', '', '', '', '', ''])
        setStatus('input')
        inputRefs.current[0]?.focus()
      }, 2000)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    try {
      const result = await ResendVerificationAPI()
      if (result.success) {
        setResendCooldown(60) // 60 second cooldown
        setMessage('Nouveau code envoye !')
        setTimeout(() => setMessage(''), 3000)
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      setMessage('Erreur lors de l\'envoi')
    } finally {
      setIsResending(false)
    }
  }

  const handleContinue = () => {
    navigate('/home')
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='min-h-dvh bg-dark pattern-dark flex items-center justify-center p-5'>
        <div className='w-full max-w-md text-center'>
          <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg'>
            <Mail className='w-12 h-12 text-accent mx-auto mb-4' />
            <h1 className='text-text-primary text-xl font-bold mb-2'>Connexion requise</h1>
            <p className='text-text-secondary text-sm mb-6'>
              Connecte-toi pour verifier ton email
            </p>
            <Buttons onClick={() => navigate('/login')} primary title="Se connecter" />
          </div>
        </div>
      </div>
    )
  }

  // If email already verified
  if (user?.emailVerified) {
    return (
      <div className='min-h-dvh bg-dark pattern-dark flex items-center justify-center p-5'>
        <div className='w-full max-w-md text-center'>
          <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg'>
            <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center'>
              <CheckCircle2 className='w-8 h-8 text-success' />
            </div>
            <h1 className='text-text-primary text-xl font-bold mb-2'>Email deja verifie</h1>
            <p className='text-text-secondary text-sm mb-6'>
              Ton compte est actif et securise.
            </p>
            <Buttons onClick={handleContinue} primary title="Continuer" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-dvh bg-dark pattern-dark'>
      <div className='flex flex-col min-h-dvh p-5 lg:p-10'>
        {/* Header */}
        <div className='mb-8'>
          <button
            onClick={() => navigate(-1)}
            className='group flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors'
          >
            <MoveLeftIcon className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
            <span className='text-sm font-medium'>Retour</span>
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-full max-w-md'>
            <div className='bg-surface-raised border border-white/20 rounded-2xl p-8 shadow-dark-lg text-center'>

              {/* Input State */}
              {(status === 'input' || status === 'loading') && (
                <>
                  <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center'>
                    <Mail className='w-8 h-8 text-accent' />
                  </div>

                  <h1 className='text-text-primary text-xl font-bold mb-2'>
                    Verifie ton email
                  </h1>
                  <p className='text-text-secondary text-sm mb-2'>
                    Entre le code a 6 chiffres envoye a
                  </p>
                  <p className='text-accent font-medium text-sm mb-8'>
                    {user?.email}
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
                        disabled={status === 'loading'}
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

                  {status === 'loading' && (
                    <div className='flex items-center justify-center gap-2 text-accent mb-4'>
                      <Loader className='w-5 h-5 animate-spin' />
                      <span className='text-sm font-medium'>Verification...</span>
                    </div>
                  )}

                  {message && status === 'input' && (
                    <p className='text-success text-sm mb-4'>{message}</p>
                  )}

                  <p className='text-text-tertiary text-xs mb-4'>
                    Le code expire dans 15 minutes
                  </p>

                  {/* Resend button */}
                  <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className='
                      flex items-center justify-center gap-2 mx-auto
                      text-text-secondary hover:text-accent
                      text-sm font-medium
                      transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed
                    '
                  >
                    {isResending ? (
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
                </>
              )}

              {/* Success State */}
              {status === 'success' && (
                <>
                  <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center animate-scale-in'>
                    <CheckCircle2 className='w-8 h-8 text-success' />
                  </div>
                  <h1 className='text-text-primary text-xl font-bold mb-2'>
                    Email verifie !
                  </h1>
                  <p className='text-text-secondary text-sm mb-6'>
                    Ton compte est maintenant actif et securise.
                  </p>
                  <Buttons onClick={handleContinue} primary title="Continuer vers l'app" />
                </>
              )}

              {/* Error State */}
              {status === 'error' && (
                <>
                  <div className='w-16 h-16 mx-auto mb-6 rounded-full bg-error/20 flex items-center justify-center animate-shake'>
                    <XCircle className='w-8 h-8 text-error' />
                  </div>
                  <h1 className='text-text-primary text-xl font-bold mb-2'>
                    Code invalide
                  </h1>
                  <p className='text-text-secondary text-sm'>
                    {message}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
