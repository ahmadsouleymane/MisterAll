import { useState, useEffect } from 'react'
import { Gift, Crown, BookOpen, Layers, HelpCircle, X, Sparkles, CheckCircle } from 'lucide-react'
import { useAuth } from '../Contexts/AuthContext'
import useTrialOffer from '../hooks/useTrialOffer'
import { useModal } from '../Contexts/ModalContext'

/**
 * TrialOfferModal - Automatically shows when user is eligible for trial
 * Displays after J+1 of registration for non-premium users
 */
export default function TrialOfferModal() {
    const { user } = useAuth()
    const { isEligible, isLoading, activate, decline } = useTrialOffer()
    const { showSuccess, showError } = useModal()
    const [isVisible, setIsVisible] = useState(false)
    const [isActivating, setIsActivating] = useState(false)
    const [isDeclining, setIsDeclining] = useState(false)

    // Show modal when eligible
    useEffect(() => {
        if (isEligible && !isLoading && user && !user.premium) {
            // Small delay to prevent flash on page load
            const timer = setTimeout(() => {
                setIsVisible(true)
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [isEligible, isLoading, user])

    const handleActivate = async () => {
        setIsActivating(true)
        const result = await activate()

        if (result.success) {
            showSuccess('Essai gratuit activé ! Profite de Premium pendant 7 jours.')
            setIsVisible(false)
        } else {
            showError(result.message || 'Erreur lors de l\'activation')
        }
        setIsActivating(false)
    }

    const handleDecline = async () => {
        setIsDeclining(true)
        await decline()
        setIsVisible(false)
        setIsDeclining(false)
    }

    const handleClose = () => {
        // Just hide without declining - will show again on next visit
        setIsVisible(false)
    }

    if (!isVisible) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className='fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 animate-fade-in'
                onClick={handleClose}
            />

            {/* Modal */}
            <div className='fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none'>
                <div
                    className='
                        relative w-full max-w-md pointer-events-auto
                        glass-effect rounded-3xl border border-accent/30
                        overflow-hidden animate-scale-up
                    '
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className='absolute top-4 right-4 p-2 rounded-full glass-effect hover:bg-white/10 transition-colors z-10'
                    >
                        <X className='w-5 h-5 text-text-tertiary' />
                    </button>

                    {/* Background decoration */}
                    <div className='absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-accent/20 to-transparent' />
                    <div className='absolute top-10 right-10 w-24 h-24 bg-accent/30 rounded-full blur-3xl' />
                    <div className='absolute bottom-10 left-10 w-20 h-20 bg-accent/20 rounded-full blur-2xl' />

                    {/* Content */}
                    <div className='relative p-6 sm:p-8'>
                        {/* Header */}
                        <div className='text-center mb-6'>
                            <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/30 to-accent/10 border border-accent/30 mb-4'>
                                <Gift className='w-10 h-10 text-accent animate-bounce-slow' />
                            </div>
                            <h2 className='text-2xl sm:text-3xl font-bold text-text-primary mb-2'>
                                Cadeau pour toi !
                            </h2>
                            <p className='text-text-tertiary text-sm sm:text-base'>
                                Tu utilises MisterAll depuis 24h - voici un cadeau de bienvenue
                            </p>
                        </div>

                        {/* Offer card */}
                        <div className='glass-accent rounded-2xl p-5 border border-accent/30 mb-6'>
                            <div className='flex items-center gap-3 mb-4'>
                                <Crown className='w-6 h-6 text-accent' />
                                <div>
                                    <p className='text-accent font-bold text-lg'>7 jours Premium</p>
                                    <p className='text-accent/70 text-sm'>100% gratuit, sans engagement</p>
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className='space-y-3'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0'>
                                        <CheckCircle className='w-4 h-4 text-success' />
                                    </div>
                                    <span className='text-text-secondary text-sm'>20 cours par mois</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0'>
                                        <CheckCircle className='w-4 h-4 text-success' />
                                    </div>
                                    <span className='text-text-secondary text-sm'>Toutes les fiches de révision</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0'>
                                        <CheckCircle className='w-4 h-4 text-success' />
                                    </div>
                                    <span className='text-text-secondary text-sm'>Flashcards illimitées</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0'>
                                        <CheckCircle className='w-4 h-4 text-success' />
                                    </div>
                                    <span className='text-text-secondary text-sm'>Quiz complets pour chaque cours</span>
                                </div>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className='space-y-3'>
                            <button
                                onClick={handleActivate}
                                disabled={isActivating || isDeclining}
                                className='
                                    w-full flex items-center justify-center gap-2
                                    px-6 py-4 rounded-xl
                                    bg-gradient-to-r from-success to-success/80
                                    text-white font-bold text-base
                                    hover:shadow-lg hover:scale-[1.02]
                                    active:scale-[0.98]
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all duration-300
                                '
                            >
                                {isActivating ? (
                                    <>
                                        <Sparkles className='w-5 h-5 animate-spin' />
                                        Activation en cours...
                                    </>
                                ) : (
                                    <>
                                        <Gift className='w-5 h-5' />
                                        Activer mon essai gratuit
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleDecline}
                                disabled={isActivating || isDeclining}
                                className='
                                    w-full text-center py-3
                                    text-text-tertiary text-sm
                                    hover:text-text-secondary
                                    disabled:opacity-50
                                    transition-colors
                                '
                            >
                                {isDeclining ? 'Un instant...' : 'Non merci, peut-être plus tard'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
