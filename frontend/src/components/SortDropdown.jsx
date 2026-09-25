import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, TrendingUp, TrendingDown, Calendar, Type } from 'lucide-react'

const sortOptions = [
  { value: 'progress-desc', label: 'Plus avancés en premier', icon: TrendingDown },
  { value: 'progress-asc', label: 'Moins avancés en premier', icon: TrendingUp },
  { value: 'date-desc', label: 'Plus récents d\'abord', icon: Calendar },
  { value: 'date-asc', label: 'Plus anciens d\'abord', icon: Calendar },
  { value: 'name-asc', label: 'Nom (A-Z)', icon: Type },
  { value: 'name-desc', label: 'Nom (Z-A)', icon: Type },
  { value: 'score-desc', label: 'Meilleur score en premier', icon: TrendingDown },
]

export default function SortDropdown({ sortBy, setSortBy }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  const selectedOption = sortOptions.find(opt => opt.value === sortBy) || sortOptions[0]

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (value) => {
    setSortBy(value)
    setIsOpen(false)
  }

  const SelectedIcon = selectedOption.icon

  return (
    <div className='relative'>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative group
          h-12 px-3 sm:px-4
          glass-effect rounded-xl
          border border-white/20
          transition-all duration-300
          hover:border-accent/30
          active:scale-[0.98]
          flex items-center gap-2
          text-text-secondary hover:text-text-primary
          ${isOpen ? 'border-accent/50 bg-surface/80' : ''}
        `}
      >
        <SelectedIcon className='h-4 w-4' />
        <span className='hidden sm:inline text-sm font-medium line-clamp-1'>
          {selectedOption.label}
        </span>
        <ChevronDown className={`
          h-4 w-4 ml-auto
          transition-transform duration-300
          ${isOpen ? 'rotate-180' : ''}
        `} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className='
            absolute top-full right-0 mt-2
            w-max sm:w-48
            glass-effect rounded-xl
            border border-white/20
            shadow-glass-lg
            z-50
            animate-slide-up
            max-h-96 overflow-y-auto
          '
        >
          {sortOptions.map((option) => {
            const OptionIcon = option.icon
            const isSelected = sortBy === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full px-3 sm:px-4 py-2.5 sm:py-3
                  flex items-center gap-2
                  text-sm sm:text-base
                  transition-all duration-200
                  text-left
                  border-b border-white/20/30 last:border-0
                  ${isSelected
                    ? 'bg-accent/10 text-accent font-semibold border-accent/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface/50'
                  }
                `}
              >
                <OptionIcon className='h-4 w-4 flex-shrink-0' />
                <span>{option.label}</span>
                {isSelected && (
                  <div className='ml-auto h-2 w-2 rounded-full bg-accent' />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
