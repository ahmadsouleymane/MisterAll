import { useState } from 'react'
import { RotateCcw, X, Frown, Smile } from 'lucide-react'
import RichText from './RichText'

export default function Flashcard({
  question,
  answer,
  onRate,
  isLoading = false,
  showRating = true
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    if (!isLoading) {
      setIsFlipped(!isFlipped)
    }
  }

  const handleRate = (quality) => {
    if (onRate && !isLoading) {
      onRate(quality)
      setIsFlipped(false)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Card Container avec perspective */}
      <div
        className="relative w-full aspect-[3/4] cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        {/* Card Inner - rotation 3D */}
        <div
          className={`
            relative w-full h-full transition-transform duration-500
            ${isFlipped ? '[transform:rotateY(180deg)]' : ''}
          `}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Front - Question */}
          <div
            className="
              absolute inset-0 w-full h-full
              glass-effect-strong rounded-2xl
              border-2 border-white/20
              flex flex-col items-center justify-center
              p-6 sm:p-8
              shadow-glass
              hover:shadow-glass-accent hover:border-accent/30
              transition-all duration-300
              overflow-hidden
            "
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Badge Question */}
            <div className="absolute top-4 left-4">
              <span className="
                glass-accent px-3 py-1.5 rounded-full
                text-xs font-bold text-accent uppercase tracking-wider
              ">
                Question
              </span>
            </div>

            {/* Hint to flip */}
            <div className="absolute top-4 right-4">
              <div className="
                p-2 rounded-lg glass-effect border border-white/20
                text-text-tertiary
              ">
                <RotateCcw className="h-4 w-4" />
              </div>
            </div>

            {/* Question Text */}
            <div className="
              text-text-primary text-lg sm:text-xl font-medium
              text-center leading-relaxed
              max-h-[70%] overflow-y-auto overflow-x-hidden
              w-full px-1
              prose prose-invert prose-sm max-w-none
              break-words [word-break:break-word]
              [&_.katex]:text-[0.85em] [&_.katex]:max-w-full [&_.katex]:overflow-x-auto
            ">
              <RichText mode="inline">{question}</RichText>
            </div>

            {/* Tap hint */}
            <p className="
              absolute bottom-4 text-text-quaternary text-xs
              animate-pulse
            ">
              Appuie pour voir la réponse
            </p>
          </div>

          {/* Back - Answer */}
          <div
            className="
              absolute inset-0 w-full h-full
              glass-accent rounded-2xl
              border-2 border-accent/30
              flex flex-col items-center justify-center
              p-6 sm:p-8
              shadow-glow-md
              overflow-hidden
            "
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)'
            }}
          >
            {/* Badge Réponse */}
            <div className="absolute top-4 left-4">
              <span className="
                bg-accent/20 px-3 py-1.5 rounded-full
                text-xs font-bold text-accent uppercase tracking-wider
                border border-accent/30
              ">
                Réponse
              </span>
            </div>

            {/* Answer Text */}
            <div className="
              text-text-primary text-base sm:text-lg font-medium
              text-center leading-relaxed
              max-h-[60%] overflow-y-auto overflow-x-hidden
              w-full px-1
              prose prose-invert prose-sm max-w-none
              break-words [word-break:break-word]
              [&_.katex]:text-[0.85em] [&_.katex]:max-w-full [&_.katex]:overflow-x-auto
            ">
              <RichText>{answer}</RichText>
            </div>

            {/* Tap hint */}
            {!showRating && (
              <p className="
                absolute bottom-4 text-accent/70 text-xs
              ">
                Appuie pour retourner
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Rating Buttons - only visible when flipped and showRating is true */}
      {showRating && isFlipped && (
        <div className="
          mt-6 flex justify-center gap-3
          animate-slide-up
        ">
          {/* Je ne savais pas - quality 1 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRate(1)
            }}
            disabled={isLoading}
            className="
              flex-1 max-w-[120px]
              flex flex-col items-center gap-2
              px-4 py-3 rounded-xl
              bg-error/10 border-2 border-error/30
              text-error
              hover:bg-error/20 hover:border-error/50
              hover:shadow-glow-sm
              active:scale-95
              transition-all duration-200
              disabled:opacity-50
              group
            "
          >
            <X className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Je ne savais pas</span>
          </button>

          {/* Difficile - quality 3 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRate(3)
            }}
            disabled={isLoading}
            className="
              flex-1 max-w-[120px]
              flex flex-col items-center gap-2
              px-4 py-3 rounded-xl
              bg-warning/10 border-2 border-warning/30
              text-warning
              hover:bg-warning/20 hover:border-warning/50
              hover:shadow-glow-sm
              active:scale-95
              transition-all duration-200
              disabled:opacity-50
              group
            "
          >
            <Frown className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Difficile</span>
          </button>

          {/* Facile - quality 5 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleRate(5)
            }}
            disabled={isLoading}
            className="
              flex-1 max-w-[120px]
              flex flex-col items-center gap-2
              px-4 py-3 rounded-xl
              bg-success/10 border-2 border-success/30
              text-success
              hover:bg-success/20 hover:border-success/50
              hover:shadow-glow-sm
              active:scale-95
              transition-all duration-200
              disabled:opacity-50
              group
            "
          >
            <Smile className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold">Facile</span>
          </button>
        </div>
      )}
    </div>
  )
}
