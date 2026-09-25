import { Crown, Sparkles, Lock, Gift, ArrowRight, BookOpen, Layers, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../Contexts/AuthContext'
import useTrialOffer from '../hooks/useTrialOffer'

/**
 * Premium Paywall Component - Glassmorphic style like Spotify
 * Shows when user tries to access premium content
 */
export default function PremiumPaywall({
    lockedCount = 0,
    type = 'content', // 'sheets' | 'quiz' | 'flashcards' | 'content'
    onTrialActivate,
    showTrialOption = true,
    compact = false
}) {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { isEligible, isLoading: trialLoading, activate } = useTrialOffer()

    const handleActivateTrial = async () => {
        const result = await activate()
        if (result.success && onTrialActivate) {
            onTrialActivate()
        }
    }

    const typeLabels = {
        sheets: { singular: 'fiche', plural: 'fiches', icon: BookOpen },
        quiz: { singular: 'quiz', plural: 'quiz', icon: HelpCircle },
        flashcards: { singular: 'flashcard', plural: 'flashcards', icon: Layers },
        content: { singular: 'contenu', plural: 'contenus', icon: Lock }
    }

    const { singular, plural, icon: TypeIcon } = typeLabels[type] || typeLabels.content

    if (compact) {
        return (
            <div className='glass-accent rounded-xl p-4 border border-accent/30'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center'>
                        <Lock className='w-5 h-5 text-accent' />
                    </div>
                    <div className='flex-1'>
                        <p className='text-accent font-bold text-sm'>
                            +{lockedCount} {lockedCount > 1 ? plural : singular} Premium
                        </p>
                        <p className='text-accent/70 text-xs'>
                            Passe à Premium pour tout débloquer
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/get-premium')}
                        className='px-4 py-2 bg-accent text-dark rounded-lg font-bold text-sm hover:scale-105 transition-transform'
                    >
                        <Crown className='w-4 h-4' />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='relative overflow-hidden rounded-2xl'>
            {/* Background with gradient */}
            <div className='absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent' />
            <div className='absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl' />
            <div className='absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl' />

            {/* Content */}
            <div className='relative glass-effect border border-accent/30 rounded-2xl p-6 sm:p-8'>
                {/* Header */}
                <div className='text-center mb-6'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/20 border border-accent/30 mb-4 animate-float'>
                        <Sparkles className='w-8 h-8 text-accent' />
                    </div>
                    <h3 className='text-xl sm:text-2xl font-bold text-text-primary mb-2'>
                        Tu as découvert du contenu Premium !
                    </h3>
                    <p className='text-text-tertiary text-sm sm:text-base'>
                        Débloque {lockedCount > 0 ? `${lockedCount} ${lockedCount > 1 ? plural : singular}` : `tout le ${singular}`} supplémentaire{lockedCount > 1 ? 's' : ''}
                    </p>
                </div>

                {/* Locked content preview */}
                {lockedCount > 0 && (
                    <div className='flex justify-center gap-2 mb-6'>
                        {Array.from({ length: Math.min(lockedCount, 5) }).map((_, i) => (
                            <div
                                key={i}
                                className='w-10 h-10 rounded-lg bg-surface border border-white/10 flex items-center justify-center'
                                style={{ opacity: 1 - (i * 0.15) }}
                            >
                                <TypeIcon className='w-5 h-5 text-text-tertiary' />
                            </div>
                        ))}
                        {lockedCount > 5 && (
                            <div className='w-10 h-10 rounded-lg bg-surface border border-white/10 flex items-center justify-center'>
                                <span className='text-text-tertiary text-xs font-bold'>+{lockedCount - 5}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Avantages */}
                <div className='space-y-3 mb-6'>
                    <div className='flex items-center gap-3 text-text-secondary text-sm'>
                        <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center'>
                            <BookOpen className='w-3.5 h-3.5 text-success' />
                        </div>
                        <span>20 cours par mois (vs 1 gratuit)</span>
                    </div>
                    <div className='flex items-center gap-3 text-text-secondary text-sm'>
                        <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center'>
                            <Layers className='w-3.5 h-3.5 text-success' />
                        </div>
                        <span>Toutes les fiches et flashcards</span>
                    </div>
                    <div className='flex items-center gap-3 text-text-secondary text-sm'>
                        <div className='w-6 h-6 rounded-full bg-success/20 flex items-center justify-center'>
                            <HelpCircle className='w-3.5 h-3.5 text-success' />
                        </div>
                        <span>Tous les quiz illimités</span>
                    </div>
                </div>

                {/* CTAs */}
                <div className='space-y-3'>
                    {/* Primary CTA */}
                    <button
                        onClick={() => navigate('/get-premium')}
                        className='
                            w-full flex items-center justify-center gap-2
                            px-6 py-4 rounded-xl
                            bg-accent text-dark font-bold text-base
                            hover:shadow-glow-lg hover:scale-[1.02]
                            active:scale-[0.98]
                            transition-all duration-300
                        '
                    >
                        <Crown className='w-5 h-5' />
                        Passer à Premium
                        <ArrowRight className='w-5 h-5' />
                    </button>

                    {/* Trial CTA - only show if eligible */}
                    {showTrialOption && isEligible && !user?.premium && (
                        <button
                            onClick={handleActivateTrial}
                            disabled={trialLoading}
                            className='
                                w-full flex items-center justify-center gap-2
                                px-6 py-3 rounded-xl
                                glass-effect border border-success/30
                                text-success font-bold text-sm
                                hover:bg-success/10 hover:border-success/50
                                disabled:opacity-50
                                transition-all duration-300
                            '
                        >
                            <Gift className='w-4 h-4' />
                            {trialLoading ? 'Activation...' : 'Essayer 7 jours gratuits'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
