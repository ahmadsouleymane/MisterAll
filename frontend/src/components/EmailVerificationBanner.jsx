import React, { useState } from 'react'
import { Mail, X, Loader, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'

export default function EmailVerificationBanner() {
  const { user, requiresEmailVerification, resendVerificationEmail } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  // Don't show if user is verified or banner is dismissed
  if (!requiresEmailVerification || isDismissed || !user?.email) {
    return null
  }

  const handleResend = async () => {
    if (isResending) return

    setIsResending(true)
    try {
      const result = await resendVerificationEmail()
      if (result.success) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Error resending verification:', error)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className='
      relative
      bg-amber-500/10
      border border-amber-500/30
      rounded-xl
      p-4
      flex items-center gap-3
    '>
      {/* Icon */}
      <div className='
        shrink-0
        w-10 h-10 rounded-full
        bg-amber-500/20
        flex items-center justify-center
      '>
        <Mail className='w-5 h-5 text-amber-500' />
      </div>

      {/* Content */}
      <div className='flex-1 min-w-0'>
        <p className='text-text-primary font-medium text-sm'>
          Verifie ton adresse email
        </p>
        <p className='text-text-tertiary text-xs mt-0.5 truncate'>
          {user.email}
        </p>
      </div>

      {/* Action */}
      <div className='shrink-0 flex items-center gap-2'>
        {showSuccess ? (
          <span className='flex items-center gap-1 text-success text-xs font-medium'>
            <CheckCircle2 className='w-4 h-4' />
            Envoye
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isResending}
            className='
              text-amber-500 hover:text-amber-400
              text-xs font-medium
              transition-colors
              disabled:opacity-50
            '
          >
            {isResending ? (
              <Loader className='w-4 h-4 animate-spin' />
            ) : (
              'Renvoyer'
            )}
          </button>
        )}

        <button
          onClick={() => setIsDismissed(true)}
          className='
            p-1 rounded-lg
            text-text-tertiary hover:text-text-primary
            hover:bg-white/5
            transition-colors
          '
          aria-label="Fermer"
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  )
}
