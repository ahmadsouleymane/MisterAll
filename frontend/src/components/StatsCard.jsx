import React, { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

export default function StatsCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  color = 'accent',
  trend = null,
}) {
  const [displayValue, setDisplayValue] = useState(0)

  // Animation counter-up
  useEffect(() => {
    let animationTimeout
    const startValue = 0
    const endValue = value
    const duration = 800 // ms

    const increment = endValue / (duration / 16)
    let current = startValue

    const animate = () => {
      current += increment
      if (current < endValue) {
        setDisplayValue(Math.floor(current))
        animationTimeout = setTimeout(animate, 16)
      } else {
        setDisplayValue(endValue)
      }
    }

    animate()

    return () => clearTimeout(animationTimeout)
  }, [value])

  const colorClasses = {
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    error: 'text-error bg-error/10 border-error/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
    info: 'text-info bg-info/10 border-info/20',
  }

  const hoverBorderClasses = {
    accent: 'hover:border-accent/30',
    success: 'hover:border-success/30',
    error: 'hover:border-error/30',
    warning: 'hover:border-warning/30',
    info: 'hover:border-info/30',
  }

  const gradientClasses = {
    accent: 'from-accent/5',
    success: 'from-success/5',
    error: 'from-error/5',
    warning: 'from-warning/5',
    info: 'from-info/5',
  }

  const cornerGradientClasses = {
    accent: 'from-accent/5',
    success: 'from-success/5',
    error: 'from-error/5',
    warning: 'from-warning/5',
    info: 'from-info/5',
  }

  const trendColor = trend?.includes('+') ? 'text-success' : 'text-error'

  return (
    <button
      className={`
        relative group w-full
        glass-effect rounded-xl p-4 sm:p-5
        border border-white/20
        transition-all duration-500
        ${hoverBorderClasses[color]}
        hover:shadow-glass-accent
        active:scale-[0.98]
        text-left
        overflow-hidden
      `}
    >
      {/* Gradient overlay on hover */}
      <div className={`
        absolute inset-0 rounded-xl
        bg-gradient-to-br ${gradientClasses[color]} via-transparent to-transparent
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
        pointer-events-none
      `} />

      {/* Icon container */}
      <div className={`
        relative
        w-10 h-10 rounded-lg
        ${colorClasses[color]}
        border
        flex items-center justify-center
        mb-3 sm:mb-4
        group-hover:scale-110
        transition-transform duration-300
      `}>
        <Icon className='h-5 w-5' />
      </div>

      {/* Label */}
      <p className='text-text-tertiary text-xs sm:text-sm font-medium mb-2 relative z-10'>
        {label}
      </p>

      {/* Value avec suffix */}
      <div className='relative z-10 flex items-baseline gap-1.5 mb-3'>
        <p className='text-text-primary text-2xl sm:text-3xl font-bold'>
          {displayValue}
        </p>
        {suffix && (
          <p className='text-text-secondary text-xs sm:text-sm font-medium'>
            {suffix}
          </p>
        )}
      </div>

      {/* Trend */}
      {trend && (
        <div className='relative z-10 flex items-center gap-1'>
          <TrendingUp className={`h-3.5 w-3.5 ${trendColor}`} />
          <p className={`text-xs font-semibold ${trendColor}`}>
            {trend}
          </p>
        </div>
      )}

      {/* Corner accent */}
      <div className={`
        absolute bottom-0 right-0
        w-12 h-12
        bg-gradient-to-tl ${cornerGradientClasses[color]} to-transparent
        rounded-xl
        opacity-0 group-hover:opacity-100
        transition-opacity duration-500
        pointer-events-none
      `} />
    </button>
  )
}
