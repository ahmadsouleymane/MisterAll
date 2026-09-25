import React from 'react'

function Options({ options = [], placeholder = "Sélectionner", className = "", ...rest }) {
  return (
    <select
      {...rest}
      className={`
        bg-surface border border-white/20
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
    >
      <option value="" hidden className='text-text-tertiary'>{placeholder}</option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className='bg-surface text-text-primary'
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default Options