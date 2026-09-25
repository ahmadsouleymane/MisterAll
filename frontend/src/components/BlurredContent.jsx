import { Lock, Crown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * BlurredContent - Wrapper that applies blur effect with lock overlay
 * Used to show premium content in a blurred state for free users
 */
export default function BlurredContent({
    children,
    isLocked = false,
    showOverlay = true,
    blurAmount = 'sm', // 'sm' | 'md' | 'lg'
    onClick,
    className = ''
}) {
    const navigate = useNavigate()

    const blurClasses = {
        sm: 'blur-sm',
        md: 'blur-md',
        lg: 'blur-lg'
    }

    const handleClick = () => {
        if (onClick) {
            onClick()
        } else {
            navigate('/get-premium')
        }
    }

    if (!isLocked) {
        return <>{children}</>
    }

    return (
        <div className={`relative group cursor-pointer ${className}`} onClick={handleClick}>
            {/* Blurred content */}
            <div className={`${blurClasses[blurAmount]} pointer-events-none select-none`}>
                {children}
            </div>

            {/* Overlay with lock */}
            {showOverlay && (
                <div className='
                    absolute inset-0 flex flex-col items-center justify-center
                    bg-dark/40 backdrop-blur-[2px]
                    opacity-0 group-hover:opacity-100
                    transition-opacity duration-300
                    rounded-inherit
                '>
                    <div className='
                        w-12 h-12 rounded-full
                        bg-accent/20 border border-accent/40
                        flex items-center justify-center
                        mb-2 transform group-hover:scale-110 transition-transform
                    '>
                        <Lock className='w-5 h-5 text-accent' />
                    </div>
                    <p className='text-accent font-bold text-sm'>
                        Contenu Premium
                    </p>
                    <p className='text-text-tertiary text-xs mt-1'>
                        Clique pour débloquer
                    </p>
                </div>
            )}

            {/* Always visible lock badge */}
            <div className='
                absolute top-2 right-2
                px-2 py-1 rounded-full
                bg-accent/20 border border-accent/30
                flex items-center gap-1
            '>
                <Crown className='w-3 h-3 text-accent' />
                <span className='text-accent text-[10px] font-bold uppercase'>Premium</span>
            </div>
        </div>
    )
}

/**
 * Simplified locked card wrapper for lists
 */
export function LockedCard({ children, className = '' }) {
    const navigate = useNavigate()

    return (
        <div
            className={`relative cursor-pointer group ${className}`}
            onClick={() => navigate('/get-premium')}
        >
            {/* Blurred content */}
            <div className='blur-sm pointer-events-none select-none opacity-60'>
                {children}
            </div>

            {/* Lock overlay */}
            <div className='
                absolute inset-0 flex items-center justify-center
                rounded-xl bg-gradient-to-t from-dark/60 to-transparent
            '>
                <div className='
                    flex flex-col items-center
                    transform group-hover:scale-105 transition-transform
                '>
                    <div className='w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mb-1'>
                        <Lock className='w-4 h-4 text-accent' />
                    </div>
                    <span className='text-accent text-xs font-bold'>Premium</span>
                </div>
            </div>
        </div>
    )
}
