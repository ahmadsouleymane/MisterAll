import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useData } from '../Contexts/DataContext'
import { useNavigate } from 'react-router-dom'

function SearchBar({ onSearch = null }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const data = useData();
  const courses = data.courses || []

  const results = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSearchChange = (value) => {
    setSearch(value)
    // Appeler le callback onSearch si fourni
    if (onSearch) {
      onSearch(value)
    }
  }

  const handleCourseClick = (course) => {
    navigate(`/course`, { state: { course } })
    setSearch('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className='w-full relative'>
      {/* Input de recherche */}
      <div className='relative'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-tertiary pointer-events-none' />

        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Rechercher un cours..."
          type="text"
          className='
            bg-surface/50 border border-white/20
            text-text-primary placeholder:text-text-tertiary
            font-medium text-base
            pl-12 pr-12 h-12 w-full
            rounded-xl
            outline-none
            transition-all duration-300
            focus:border-accent focus:bg-surface
            hover:border-pop
            no-clear
            border-white/20
          '
        />

        {search && (
          <button
            onClick={() => handleSearchChange('')}
            className='absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-surface-light'
          >
            <X className='h-5 w-5' />
          </button>
        )}
      </div>

      {/* Résultats - seulement si pas de onSearch (mode navigation) */}
      {search && !onSearch && (
        <div className='
          absolute top-[calc(100%+0.5rem)] left-0 right-0
          glass-effect
          rounded-xl
          shadow-glass
          max-h-96 overflow-y-auto
          z-50
        '>
          {results && results.length > 0 ? (
            <div className='p-3'>
              <p className='text-text-secondary text-xs font-medium uppercase tracking-wider mb-3 px-2'>
                {results.length} Résultat{results.length > 1 ? 's' : ''}
              </p>

              <div className='flex flex-col gap-2'>
                {results.map((course, index) => (
                  <button
                    key={course._id || index}
                    onClick={() => handleCourseClick(course)}
                    className='
                      text-left p-3 rounded-lg
                      bg-surface/30 border border-white/20/50
                      hover:border-accent/50 hover:bg-accent/5
                      transition-all duration-300
                      group
                    '
                  >
                    <p className='text-text-primary text-sm font-semibold line-clamp-2 mb-1 group-hover:text-accent transition-colors'>
                      {course.title}
                    </p>
                    <p className='text-text-secondary text-xs'>
                      {course.subject}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='p-6 text-center'>
              <p className='text-text-tertiary text-sm'>Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
