import React, { useState, useEffect } from 'react'
import { Crown, X, Clock, Sparkles, MessageCircle, Gift, Zap, CreditCard, Lock, Loader2 } from 'lucide-react'
import { useData } from '../Contexts/DataContext'
import useWelcomeOffer from '../hooks/useWelcomeOffer'
import { initializeMonerooPayment } from '../api/monerooApi'

const OFFER_STORAGE_KEY = 'misterall_first_offer'

const FirstTimeOfferPopup = () => {
  const { user } = useData()
  const [showPopup, setShowPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hook pour l'offre de bienvenue
  const { isOfferActive, formattedTime, price, originalPrice, discount } = useWelcomeOffer()

  useEffect(() => {
    if (!user || user.premium || !isOfferActive) return

    // Verifier si le popup a deja ete ferme
    const offerData = localStorage.getItem(OFFER_STORAGE_KEY)

    if (offerData) {
      const { dismissed } = JSON.parse(offerData)
      if (dismissed) return
    }

    // Montrer le popup si pas encore affiche dans cette session
    const sessionShown = sessionStorage.getItem('offer_shown_session')
    if (!sessionShown) {
      setShowPopup(true)
      sessionStorage.setItem('offer_shown_session', 'true')
    }
  }, [user, isOfferActive])

  // Handler pour initialiser le paiement Moneroo
  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await initializeMonerooPayment(price)

      if (result.success && result.checkout_url) {
        // Redirection vers la page de paiement Moneroo
        window.location.href = result.checkout_url
      } else {
        setError(result.message || 'Erreur lors de l\'initialisation du paiement')
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez reessayer.')
    } finally {
      setLoading(false)
    }
  }

  const handleDismiss = () => {
    // Sauvegarder que le popup a ete ferme
    const offerData = JSON.parse(localStorage.getItem(OFFER_STORAGE_KEY) || '{}')
    localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify({
      ...offerData,
      dismissed: true
    }))
    setShowPopup(false)
  }

  if (!showPopup || !user || user.premium || !isOfferActive) return null

  return (
    <div className="fixed inset-0 bg-dark/95 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div
        className="bg-surface border-2 border-accent/50 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl shadow-accent/20 animate-scale-in"
        style={{ maxHeight: '80vh' }}
      >
        {/* Header compact */}
        <div className="relative bg-gradient-to-br from-accent/20 via-accent/10 to-transparent p-4">
          {/* Bouton fermer */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-text-tertiary" />
          </button>

          {/* Badge offre */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-dark font-bold text-xs mb-2">
            <Gift className="w-3 h-3" />
            OFFRE DE BIENVENUE
          </div>

          <h2 className="text-xl font-black text-text-primary">
            -{discount}% sur ton <span className="text-accent">Premier mois!</span>
          </h2>
        </div>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 100px)' }}>
          {/* Compte a rebours compact */}
          <div className="px-4 py-3">
            <div className="bg-dark/50 border border-accent/30 rounded-xl p-3">
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span className="text-text-tertiary text-xs">L'offre expire dans</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <div className="bg-accent/10 rounded-lg px-2 py-1">
                    <span className="text-xl font-black text-accent">{formattedTime.hours}</span>
                  </div>
                  <span className="text-text-quaternary text-[10px]">h</span>
                </div>
                <span className="text-accent text-lg font-bold">:</span>
                <div className="text-center">
                  <div className="bg-accent/10 rounded-lg px-2 py-1">
                    <span className="text-xl font-black text-accent">{formattedTime.minutes}</span>
                  </div>
                  <span className="text-text-quaternary text-[10px]">min</span>
                </div>
                <span className="text-accent text-lg font-bold">:</span>
                <div className="text-center">
                  <div className="bg-accent/10 rounded-lg px-2 py-1">
                    <span className="text-xl font-black text-accent">{formattedTime.seconds}</span>
                  </div>
                  <span className="text-text-quaternary text-[10px]">sec</span>
                </div>
              </div>
            </div>
          </div>

          {/* Prix compact */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-text-tertiary line-through text-sm">{originalPrice.toLocaleString()} FCFA</span>
              <span className="text-3xl font-black text-accent">{price.toLocaleString()}</span>
              <span className="text-text-secondary text-sm">FCFA/mois</span>
            </div>
          </div>

          {/* Avantages compacts */}
          <div className="px-4 py-2">
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5 text-text-secondary text-xs bg-white/5 rounded-lg p-2">
                <Sparkles className="w-3 h-3 text-accent flex-shrink-0" />
                20 cours/mois
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary text-xs bg-white/5 rounded-lg p-2">
                <MessageCircle className="w-3 h-3 text-accent flex-shrink-0" />
                Chat IA
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary text-xs bg-white/5 rounded-lg p-2">
                <Crown className="w-3 h-3 text-accent flex-shrink-0" />
                Quiz avances
              </div>
              <div className="flex items-center gap-1.5 text-text-secondary text-xs bg-white/5 rounded-lg p-2">
                <Zap className="w-3 h-3 text-accent flex-shrink-0" />
                Support prioritaire
              </div>
            </div>
          </div>

          {/* Bouton paiement */}
          <div className="px-4 py-3">
            {/* Error message */}
            {error && (
              <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg">
                <p className="text-error text-xs text-center">{error}</p>
              </div>
            )}

            <button
              onClick={handlePayment}
              disabled={loading}
              className="
                w-full py-3 px-4 bg-accent hover:bg-accent-600
                text-dark font-bold text-sm rounded-xl
                transition-all hover:scale-[1.02] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {loading ? 'Redirection...' : `Payer ${price.toLocaleString()} FCFA`}
            </button>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-1.5 text-text-quaternary text-xs mt-2">
              <Lock className="w-3 h-3" />
              <span>Paiement securise par Moneroo</span>
            </div>

            {/* Payment methods */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
              <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 text-[10px] font-medium rounded">MTN</span>
              <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[10px] font-medium rounded">Orange</span>
              <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 text-[10px] font-medium rounded">Wave</span>
              <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-medium rounded">Moov</span>
              <span className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-medium rounded">Carte</span>
            </div>

            <button
              onClick={handleDismiss}
              className="w-full mt-3 py-2 text-text-tertiary text-xs hover:text-text-secondary transition-colors"
            >
              Non merci, je reste en gratuit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirstTimeOfferPopup
