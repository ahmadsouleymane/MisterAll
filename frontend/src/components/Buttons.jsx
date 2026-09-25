import React from 'react'
import { Loader2 } from 'lucide-react'

function Buttons(props) {
  const {
    primary,
    secondary,
    title,
    className = '',
    loading = false,
    loadingText,
    disabled,
    ...buttonProps
  } = props;

  const isDisabled = disabled || loading;

  const LoadingSpinner = () => (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{loadingText || title}</span>
    </span>
  );

  return (
    <>
      {primary && (
        <button
          {...buttonProps}
          disabled={isDisabled}
          className={`
            bg-accent text-dark font-bold
            w-full h-12
            text-sm uppercase tracking-wider
            rounded-full
            outline-none
            transition-all duration-300 ease-out
            hover:bg-accent-600 hover:shadow-glow
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            ${className}
          `}
        >
          {loading ? <LoadingSpinner /> : title}
        </button>
      )}

      {secondary && (
        <button
          {...buttonProps}
          disabled={isDisabled}
          className={`
            bg-transparent border-2 border-accent text-accent font-bold
            w-full h-12
            text-sm uppercase tracking-wider
            rounded-full
            outline-none
            transition-all duration-300 ease-out
            hover:bg-accent/10 hover:border-accent-light
            active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
        >
          {loading ? <LoadingSpinner /> : title}
        </button>
      )}
    </>
  )
}

export default Buttons
