import React, { useState } from 'react'
import { Mail, Loader, CheckCircle2, AlertTriangle } from 'lucide-react'
import { AddEmailAPI } from '../api/userApi'
import { useAuth } from '../Contexts/AuthContext'
import Inputs from './Inputs'
import Buttons from './Buttons'

export default function ForceEmailModal() {
  const { user, requiresEmailMigration, markEmailAdded } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Don't render if not required
  if (!requiresEmailMigration || !user) {
    return null
  }

  const validateEmail = (email) => {
    const emailRegex = /^\S+@\S+\.\S+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('L\'email est requis')
      return
    }

    if (!validateEmail(email)) {
      setError('Format d\'email invalide')
      return
    }

    setIsLoading(true)

    try {
      const result = await AddEmailAPI(email)

      if (result.success) {
        setSuccess(true)
        markEmailAdded(result.email)
      } else {
        setError(result.message || 'Erreur lors de l\'ajout de l\'email')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='
      fixed inset-0 z-[100]
      bg-dark/98 backdrop-blur-sm
      flex items-center justify-center
      p-5
    '>
      <div className='
        w-full max-w-md
        bg-surface-raised
        border border-white/20
        rounded-2xl
        p-8
        shadow-dark-lg
      '>
        {success ? (
          // Success state
          <div className='text-center'>
            <div className='
              w-16 h-16 mx-auto mb-6
              rounded-full
              bg-success/20
              flex items-center justify-center
            '>
              <CheckCircle2 className='w-8 h-8 text-success' />
            </div>

            <h2 className='text-text-primary text-xl font-bold mb-2'>
              Email ajoute !
            </h2>
            <p className='text-text-secondary text-sm mb-6'>
              Un email de verification a ete envoye a <strong className='text-text-primary'>{email}</strong>.
              Verifie ta boite mail pour confirmer.
            </p>

            <p className='text-text-tertiary text-xs'>
              Tu peux continuer a utiliser l'app en attendant.
            </p>
          </div>
        ) : (
          // Form state
          <>
            {/* Header */}
            <div className='flex items-center gap-3 mb-6'>
              <div className='
                w-12 h-12 rounded-full
                bg-accent/20
                flex items-center justify-center
              '>
                <Mail className='w-6 h-6 text-accent' />
              </div>
              <div>
                <h2 className='text-text-primary font-bold text-lg'>
                  Ajoute ton email
                </h2>
                <p className='text-text-tertiary text-xs'>
                  Pour securiser ton compte
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className='
              bg-amber-500/10
              border border-amber-500/20
              rounded-xl
              p-4 mb-6
              flex gap-3
            '>
              <AlertTriangle className='w-5 h-5 text-amber-500 shrink-0 mt-0.5' />
              <div>
                <p className='text-text-primary text-sm font-medium'>
                  Mise a jour importante
                </p>
                <p className='text-text-secondary text-xs mt-1'>
                  Pour continuer a utiliser MisterAll, ajoute une adresse email a ton compte.
                  Cela te permettra de recuperer ton compte en cas d'oubli de mot de passe.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <Inputs
                  type="email"
                  placeholder="ton.email@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <p className='text-error text-xs'>{error}</p>
              )}

              <Buttons
                type="submit"
                primary
                title={isLoading ? "Ajout en cours..." : "Ajouter mon email"}
                disabled={isLoading}
              />
            </form>

            {/* Privacy note */}
            <p className='text-text-tertiary text-xs text-center mt-4'>
              Ton email sera utilise uniquement pour la securite de ton compte.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
