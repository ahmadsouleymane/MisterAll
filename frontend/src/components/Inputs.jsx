function Inputs({ className = '', ...props }) {
  return (
    <input
      className={`
        bg-surface border border-white/10
        text-text-primary placeholder:text-text-tertiary
        font-medium text-sm
        px-5 h-12 w-full
        rounded-xl
        outline-none
        transition-all duration-300 ease-out
        focus:border-white/20-focus focus:bg-surface-raised focus:shadow-glow-sm
        hover:border-white/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
  )
}

export default Inputs
