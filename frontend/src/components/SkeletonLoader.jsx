// Skeleton Loaders - Modern shimmer loading states
import React from 'react'

// Base Skeleton with shimmer effect
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`
        relative overflow-hidden
        bg-surface/80 rounded-lg
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_1.5s_infinite]
        before:bg-gradient-to-r
        before:from-transparent before:via-white/5 before:to-transparent
        ${className}
      `}
      aria-busy="true"
      aria-live="polite"
    />
  )
}

// Skeleton pour CourseCard (nouveau design simplifié)
export function SkeletonCourseCard() {
  return (
    <div className='
      bg-surface/50 border border-white/20
      rounded-xl p-4
    '>
      {/* Header: Subject */}
      <div className='flex items-center justify-between mb-2'>
        <Skeleton className='h-3 w-16' />
      </div>

      {/* Title */}
      <div className='space-y-1.5 mb-3'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>

      {/* Footer */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-3 w-14' />
          <Skeleton className='h-3 w-16' />
        </div>
        <Skeleton className='h-3 w-12' />
      </div>
    </div>
  )
}

// Skeleton Grid pour AllCourses
export function SkeletonCoursesGrid({ count = 6 }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCourseCard key={index} />
      ))}
    </div>
  )
}

// Skeleton pour la page AllCourses complète
export function SkeletonAllCoursesPage() {
  return (
    <div className='min-h-screen bg-dark pb-24'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-3'>
          <Skeleton className='h-9 w-9 rounded-lg' />
          <div className='space-y-1.5'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-3 w-48' />
          </div>
        </div>

        {/* Search */}
        <Skeleton className='h-10 w-full rounded-lg' />

        {/* Grid */}
        <SkeletonCoursesGrid />
      </div>
    </div>
  )
}

// Skeleton Text Lines
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

// Skeleton Fiche Card
export function SkeletonFicheCard() {
  return (
    <div className='bg-surface/50 border border-white/20 rounded-xl p-5'>
      <div className='flex items-start justify-between mb-4'>
        <Skeleton className='h-5 w-32' />
        <Skeleton className='h-6 w-6 rounded' />
      </div>
      <SkeletonText lines={4} />
      <div className='mt-4 pt-4 border-t border-white/20'>
        <Skeleton className='h-3 w-20' />
      </div>
    </div>
  )
}

// Skeleton Quiz Question
export function SkeletonQuizQuestion() {
  return (
    <div className='bg-surface/50 border border-white/20 rounded-xl p-5'>
      <Skeleton className='h-5 w-3/4 mb-5' />
      <div className='space-y-3'>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className='h-11 w-full rounded-lg' />
        ))}
      </div>
    </div>
  )
}

// Loading Spinner minimal
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  return (
    <svg
      className={`animate-spin text-accent ${sizeClasses[size]} ${className}`}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-20'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='3'
      />
      <path
        className='opacity-80'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
      />
    </svg>
  )
}

// Loading Screen minimal
export function LoadingScreen({ message }) {
  return (
    <div className='min-h-screen bg-dark flex items-center justify-center'>
      <div className='flex flex-col items-center gap-4'>
        <LoadingSpinner size='xl' />
        {message && (
          <p className='text-text-tertiary text-sm'>{message}</p>
        )}
      </div>
    </div>
  )
}

// Skeleton Page générique
export function SkeletonPage() {
  return (
    <div className='min-h-screen bg-dark pb-24'>
      <div className='max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-40' />
          <Skeleton className='h-9 w-24 rounded-lg' />
        </div>

        {/* Content */}
        <div className='space-y-4'>
          <Skeleton className='h-32 w-full rounded-xl' />
          <Skeleton className='h-48 w-full rounded-xl' />
          <Skeleton className='h-24 w-full rounded-xl' />
        </div>
      </div>
    </div>
  )
}

export default Skeleton
