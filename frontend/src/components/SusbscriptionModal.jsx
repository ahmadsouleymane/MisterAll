import React, { useState } from 'react'
import { useData } from '../Contexts/DataContext'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Crown,
  Check,
  X,
  Sparkles,
  BookOpen,
  Brain,
  MessageCircle,
  Zap,
  Shield,
  ChevronDown,
  Clock,
  TrendingUp,
  Award,
  CreditCard,
  Lock,
  Loader2
} from 'lucide-react'
import useWelcomeOffer from '../hooks/useWelcomeOffer'
import { initializeMonerooPayment } from '../api/monerooApi'

const SusbscriptionModal = () => {
  const { user } = useData()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Hook pour l'offre de bienvenue
  const { isOfferActive, formattedTime, price, originalPrice, discount } = useWelcomeOffer()

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

  // Features comparees
  const features = [
    {
      name: "Cours par mois",
      free: "1 cours",
      premium: "20 cours",
      icon: BookOpen
    },
    {
      name: "Fiches de revision IA",
      free: true,
      premium: true,
      icon: Brain
    },
    {
      name: "Quiz personnalises",
      free: "Basique",
      premium: "Avance + corrections",
      icon: Sparkles
    },
    {
      name: "Chat IA",
      free: false,
      premium: "100 messages/jour",
      icon: MessageCircle
    },
    {
      name: "Flashcards intelligentes",
      free: true,
      premium: true,
      icon: Zap
    },
    {
      name: "Support prioritaire",
      free: false,
      premium: true,
      icon: Shield
    }
  ]

  // Avantages cles pour desktop
  const keyBenefits = [
    {
      icon: TrendingUp,
      title: "20x plus de cours",
      description: "Passe de 1 a 20 cours par mois"
    },
    {
      icon: Clock,
      title: "Activation instantanee",
      description: "Ton compte est active automatiquement"
    },
    {
      icon: Award,
      title: "Reussis tes examens",
      description: "Quiz avances avec corrections"
    }
  ]

  // FAQs
  const faqs = [
    {
      question: "Comment fonctionne le paiement ?",
      answer: "Cliquez sur 'Payer maintenant', vous serez redirige vers notre partenaire Moneroo. Choisissez votre methode de paiement (MTN, Orange, Moov, Wave ou Carte) et completez le paiement. Votre compte Premium sera active automatiquement."
    },
    {
      question: "Puis-je annuler a tout moment ?",
      answer: "Oui, vous pouvez annuler votre abonnement a tout moment. Votre premium reste actif jusqu'a la fin de la periode payee."
    },
    {
      question: "Quels moyens de paiement sont acceptes ?",
      answer: "Nous acceptons MTN Money, Orange Money, Moov Money, Wave et les cartes bancaires (Visa, Mastercard) via notre partenaire Moneroo."
    }
  ]

  if (!user) return null

  return (
    <div className="min-h-dvh bg-dark overflow-y-auto">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="glow-orb glow-orb-1 opacity-30" />
        <div className="glow-orb glow-orb-2 opacity-20" />
        <div className="hidden lg:block glow-orb glow-orb-3 opacity-20" />
      </div>

      {/* Header - Full width */}
      <header className="sticky top-0 z-20 glass-effect-strong border-b border-border">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-surface-raised hover:bg-surface-overlay transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text-primary" />
          </button>
          <h1 className="text-xl font-bold text-text-primary">Passer a Premium</h1>

          {/* Desktop CTA in header */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">
            <span className="text-text-secondary text-sm">
              <span className="text-accent font-bold">{price.toLocaleString()} FCFA</span>/mois
            </span>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="py-2 px-5 bg-accent hover:bg-accent-600 text-dark font-bold rounded-xl transition-all hover:shadow-glow hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {loading ? 'Chargement...' : 'Payer maintenant'}
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 px-4 lg:px-8 py-6 lg:py-12 max-w-6xl mx-auto">

        {/* Compte a rebours si offre active */}
        {isOfferActive && (
          <div className="mb-6 bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border border-accent/30 rounded-2xl p-4 animate-pulse-slow">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-xl">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-accent font-bold text-sm">OFFRE DE BIENVENUE -50%</p>
                  <p className="text-text-tertiary text-xs">Valable uniquement pour les nouveaux utilisateurs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-dark/50 rounded-lg px-3 py-2 text-center">
                  <span className="text-xl font-black text-accent">{formattedTime.hours}</span>
                  <span className="text-text-quaternary text-xs block">h</span>
                </div>
                <span className="text-accent font-bold">:</span>
                <div className="bg-dark/50 rounded-lg px-3 py-2 text-center">
                  <span className="text-xl font-black text-accent">{formattedTime.minutes}</span>
                  <span className="text-text-quaternary text-xs block">min</span>
                </div>
                <span className="text-accent font-bold">:</span>
                <div className="bg-dark/50 rounded-lg px-3 py-2 text-center">
                  <span className="text-xl font-black text-accent">{formattedTime.seconds}</span>
                  <span className="text-text-quaternary text-xs block">sec</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop: Two column layout */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">

          {/* Left Column - Hero & Benefits */}
          <div className="lg:sticky lg:top-28">
            {/* Hero Section */}
            <section className="text-center lg:text-left mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 mb-4">
                <Crown className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">
                  {isOfferActive ? 'Offre -50% limitee' : 'Offre speciale'}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary mb-3 lg:mb-4">
                Debloquez tout le
                <span className="text-gradient-accent block">potentiel de MisterAll</span>
              </h2>

              <p className="text-text-secondary text-base lg:text-lg max-w-md mx-auto lg:mx-0">
                Revisez plus efficacement et reussissez vos examens avec des outils IA avances
              </p>
            </section>

            {/* Key Benefits - Desktop only */}
            <section className="hidden lg:block mb-8 animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="space-y-4">
                {keyBenefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 glass-effect rounded-2xl hover:bg-surface-raised/50 transition-colors">
                    <div className="p-3 rounded-xl bg-accent/10">
                      <benefit.icon className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-text-primary font-bold mb-1">{benefit.title}</h4>
                      <p className="text-text-secondary text-sm">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Pricing & Details */}
          <div>

            {/* Pricing Card */}
            <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="glass-effect-strong rounded-3xl p-6 lg:p-8 border-2 border-accent/30 relative overflow-hidden">
                {/* Badge */}
                <div className="absolute top-0 right-0 bg-accent text-dark text-xs font-bold px-4 py-1.5 rounded-bl-xl">
                  {isOfferActive ? '-50% BIENVENUE' : 'POPULAIRE'}
                </div>

                {/* Prix */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl lg:text-6xl font-black text-text-primary">{price.toLocaleString()}</span>
                  <div className="flex flex-col">
                    <span className="text-xl lg:text-2xl font-bold text-accent">FCFA</span>
                    <span className="text-text-tertiary text-sm">/mois</span>
                  </div>
                </div>

                {/* Savings badge */}
                {isOfferActive && (
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-text-tertiary line-through text-sm lg:text-base">{originalPrice.toLocaleString()} FCFA</span>
                    <span className="bg-success/20 text-success text-xs lg:text-sm font-bold px-3 py-1 rounded-full">
                      -{discount}% BIENVENUE
                    </span>
                  </div>
                )}

                {/* Compte a rebours dans la carte */}
                {isOfferActive && (
                  <div className="mb-6 p-3 bg-accent/10 border border-accent/20 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Offre expire dans</span>
                      <div className="flex items-center gap-1 font-mono">
                        <span className="text-accent font-bold">{formattedTime.hours}:{formattedTime.minutes}:{formattedTime.seconds}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-error/10 border border-error/30 rounded-xl">
                    <p className="text-error text-sm text-center">{error}</p>
                  </div>
                )}

                {/* CTA Principal */}
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full py-4 lg:py-5 px-6 bg-accent hover:bg-accent-600 text-dark font-bold text-lg rounded-2xl transition-all hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 mb-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {loading ? 'Redirection en cours...' : `Payer maintenant - ${price.toLocaleString()} FCFA`}
                </button>

                {/* Security badge */}
                <div className="flex items-center justify-center gap-2 text-text-tertiary text-sm mb-4">
                  <Lock className="w-4 h-4" />
                  <span>Paiement securise par Moneroo</span>
                </div>

                {/* Payment methods */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <span className="text-text-quaternary text-xs">Accepte:</span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">MTN</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">Orange</span>
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded">Wave</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Moov</span>
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Carte</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Comparison */}
            <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Comparez les offres
              </h3>

              <div className="glass-effect rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-3 gap-2 p-4 border-b border-border">
                  <div className="text-text-tertiary text-sm font-medium">Fonctionnalite</div>
                  <div className="text-center text-text-tertiary text-sm font-medium">Gratuit</div>
                  <div className="text-center text-accent text-sm font-bold">Premium</div>
                </div>

                {/* Features list */}
                <div className="divide-y divide-border">
                  {features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 p-4 items-center hover:bg-surface-raised/30 transition-colors">
                      <div className="flex items-center gap-2 lg:gap-3">
                        <feature.icon className="w-4 h-4 lg:w-5 lg:h-5 text-text-tertiary flex-shrink-0" />
                        <span className="text-text-primary text-sm lg:text-base">{feature.name}</span>
                      </div>
                      <div className="text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-success mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-text-quaternary mx-auto" />
                          )
                        ) : (
                          <span className="text-text-secondary text-xs lg:text-sm">{feature.free}</span>
                        )}
                      </div>
                      <div className="text-center">
                        {typeof feature.premium === 'boolean' ? (
                          feature.premium ? (
                            <Check className="w-5 h-5 text-accent mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-text-quaternary mx-auto" />
                          )
                        ) : (
                          <span className="text-accent text-xs lg:text-sm font-semibold">{feature.premium}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-bold text-text-primary mb-4">
                Questions frequentes
              </h3>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="glass-effect rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full p-4 lg:p-5 flex items-center justify-between text-left hover:bg-surface-raised/30 transition-colors"
                    >
                      <span className="text-text-primary text-sm lg:text-base font-medium pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-text-tertiary flex-shrink-0 transition-transform duration-300 ${
                          openFaq === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      className={`accordion-content ${openFaq === index ? 'open' : ''}`}
                    >
                      <div className="accordion-inner">
                        <p className="px-4 lg:px-5 pb-4 lg:pb-5 text-text-secondary text-sm lg:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Final CTA */}
            <section className="pb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="glass-accent rounded-2xl p-6 lg:p-8 text-center">
                <Crown className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl lg:text-2xl font-bold text-text-primary mb-2">
                  Pret a booster tes revisions ?
                </h3>
                <p className="text-text-secondary text-sm lg:text-base mb-5">
                  {isOfferActive
                    ? `Profite de -${discount}% avant la fin du compte a rebours!`
                    : "Profite de l'offre de lancement avant qu'elle ne se termine"
                  }
                </p>
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full lg:w-auto lg:px-12 py-4 bg-accent hover:bg-accent-600 text-dark font-bold text-lg rounded-2xl transition-all hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CreditCard className="w-5 h-5" />
                  )}
                  {loading ? 'Chargement...' : 'Payer maintenant'}
                </button>
                <p className="text-text-quaternary text-xs lg:text-sm mt-4">
                  Paiement securise par Moneroo
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SusbscriptionModal
