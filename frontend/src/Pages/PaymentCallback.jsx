import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { verifyMonerooPayment } from '../api/monerooApi'
import { useData } from '../Contexts/DataContext'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Crown,
  Home,
  Sparkles
} from 'lucide-react'

const PaymentCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { refreshAllData } = useData()

  const [status, setStatus] = useState('verifying') // verifying, success, failed
  const [paymentData, setPaymentData] = useState(null)
  const [error, setError] = useState('')

  // Moneroo retourne paymentId et paymentStatus dans l'URL
  const paymentId = searchParams.get('paymentId')
  const paymentStatus = searchParams.get('paymentStatus')

  useEffect(() => {
    const verify = async () => {
      if (!paymentId) {
        setStatus('failed')
        setError('Reference de paiement manquante')
        return
      }

      // Si Moneroo indique deja un echec dans l'URL
      if (paymentStatus === 'failed' || paymentStatus === 'cancelled') {
        setStatus('failed')
        setError('Le paiement a ete annule ou a echoue')
        return
      }

      try {
        const result = await verifyMonerooPayment(paymentId)

        if (result.success && result.premium) {
          setStatus('success')
          setPaymentData(result)
          // Rafraichir les donnees utilisateur pour mettre a jour le statut premium
          if (refreshAllData) {
            await refreshAllData()
          }
        } else {
          setStatus('failed')
          setError(result.message || 'Le paiement n\'a pas abouti')
        }
      } catch (err) {
        setStatus('failed')
        setError('Erreur lors de la verification du paiement')
      }
    }

    verify()
  }, [paymentId, paymentStatus, refreshAllData])

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-dvh bg-dark flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-orb glow-orb-1 opacity-30" />
        <div className="glow-orb glow-orb-2 opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Verifying State */}
        {status === 'verifying' && (
          <div className="glass-effect-strong rounded-3xl p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Verification en cours
            </h1>
            <p className="text-text-secondary">
              Nous verifions votre paiement...
            </p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="glass-effect-strong rounded-3xl p-8 text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-success" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
              <Crown className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-accent">Premium active</span>
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Paiement reussi !
            </h1>
            <p className="text-text-secondary mb-6">
              Votre abonnement Premium est maintenant actif
            </p>

            {/* Payment Details */}
            <div className="glass-effect rounded-2xl p-4 mb-6 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Montant</span>
                  <span className="text-text-primary font-semibold">
                    {paymentData?.amount || 2000} FCFA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Valide jusqu'au</span>
                  <span className="text-accent font-semibold">
                    {formatDate(paymentData?.premiumExpiry)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-tertiary text-sm">Reference</span>
                  <span className="text-text-secondary text-xs font-mono">
                    {paymentId?.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits reminder */}
            <div className="glass-effect rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-text-primary font-semibold text-sm">Vos avantages</span>
              </div>
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2 text-text-secondary text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  20 cours par mois
                </li>
                <li className="flex items-center gap-2 text-text-secondary text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  100 messages IA par jour
                </li>
                <li className="flex items-center gap-2 text-text-secondary text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  Quiz avances avec corrections
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/home')}
                className="w-full py-4 bg-accent hover:bg-accent-600 text-dark font-bold rounded-2xl transition-all hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Commencer a reviser
              </button>
            </div>
          </div>
        )}

        {/* Failed State */}
        {status === 'failed' && (
          <div className="glass-effect-strong rounded-3xl p-8 text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error/20 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-error" />
            </div>

            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Paiement echoue
            </h1>
            <p className="text-text-secondary mb-6">
              {error || 'Une erreur est survenue lors du paiement'}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => navigate('/subscription')}
                className="w-full py-4 bg-accent hover:bg-accent-600 text-dark font-bold rounded-2xl transition-all hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98]"
              >
                Reessayer
              </button>
              <button
                onClick={() => navigate('/home')}
                className="w-full py-3 bg-surface-raised hover:bg-surface-overlay text-text-primary font-medium rounded-2xl transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Retour a l'accueil
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
