import React, { useState, useEffect } from 'react'
import { Home, FolderOpen, Plus, MessageCircle, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

function FixedNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  const isActive = (path) => location.pathname === path

  // Auto-hide navigation on scroll down (optionnel)
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false) // Scroll down - hide
      } else {
        setIsVisible(true) // Scroll up - show
      }

      setLastScrollY(currentScrollY)
    }

    // Décommenter pour activer le auto-hide
    // window.addEventListener('scroll', handleScroll, { passive: true })
    // return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <nav
      className={`
        fixed bottom-5 left-1/2 -translate-x-1/2
        w-[calc(100%-2.5rem)] max-w-md
        z-50
        pb-[env(safe-area-inset-bottom)]
        transition-all duration-500 ease-out-expo
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
      role="navigation"
      aria-label="Navigation principale"
    >
      {/* Glassmorphism Container */}
      <div className="
        relative
        glass-effect-strong
        rounded-2xl
        shadow-glass-lg
        overflow-hidden
        group
      ">
        {/* Accent glow on hover */}
        <div className="
          absolute inset-0
          bg-gradient-to-r from-transparent via-accent/5 to-transparent
          opacity-0 group-hover:opacity-100
          transition-opacity duration-500
          pointer-events-none
        " />

        {/* Active indicator background - Simple et centré */}
        <div className="absolute inset-0 flex justify-around items-center px-2">
          <div className={`
            h-10 w-10 bg-accent/10 rounded-xl
            transition-all duration-500 ease-out-expo
            ${isActive('/home') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `} />
          <div className={`
            h-10 w-10 bg-accent/10 rounded-xl
            transition-all duration-500 ease-out-expo
            ${isActive('/chat') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `} />
          <div className="h-11 w-11" /> {/* Spacer pour le bouton Add */}
          <div className={`
            h-10 w-10 bg-accent/10 rounded-xl
            transition-all duration-500 ease-out-expo
            ${isActive('/all-courses') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `} />
          <div className={`
            h-10 w-10 bg-accent/10 rounded-xl
            transition-all duration-500 ease-out-expo
            ${isActive('/profile') ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `} />
        </div>

        {/* Navigation Items */}
        <div className="
          relative
          flex flex-row h-16 px-2
          justify-around items-center
        ">
          {/* Home */}
          <NavButton
            onClick={() => navigate('/home')}
            isActive={isActive('/home')}
            icon={<Home />}
            label="Accueil"
          />

          {/* Chat IA */}
          <NavButton
            onClick={() => navigate('/chat')}
            isActive={isActive('/chat')}
            icon={<MessageCircle />}
            label="Assistant IA"
          />

          {/* Add - Bouton central simple et clair */}
          <button
            onClick={() => navigate('/add')}
            className="
              p-3 rounded-2xl
              shadow-depth-2
              text-dark-400
              hover:scale-105
              active:scale-95
              transition-all duration-300 ease-out-expo
              group/add
              focus-accent
            "
            aria-label="Ajouter un cours"
          >
            <Plus className="
              h-6 w-6 stroke-[3]
              text-text-secondary hover:text-accent/70
              transition-transform duration-300
              group-hover/add:rotate-90
            " />
          </button>

          {/* Mes Cours */}
          <NavButton
            onClick={() => navigate('/all-courses')}
            isActive={isActive('/all-courses')}
            icon={<FolderOpen />}
            label="Mes Cours"
          />

          {/* Profile */}
          <NavButton
            onClick={() => navigate('/profile')}
            isActive={isActive('/profile')}
            icon={<User />}
            label="Profil"
          />
        </div>

        {/* Bottom accent line */}
        <div className="
          absolute bottom-0 left-0 right-0
          h-[1px]
          bg-gradient-to-r from-transparent via-accent/20 to-transparent
        " />
      </div>
    </nav>
  )
}

// Navigation Button Component - Plus visible et mobile-friendly
function NavButton({ onClick, isActive, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative
        p-3 sm:p-3.5 rounded-xl
        transition-all duration-300 ease-out-expo
        focus-accent
        group/btn
        ${
          isActive
            ? 'text-accent'
            : 'text-text-secondary hover:text-accent/70'
        }
      `}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Icon avec taille augmentée pour mobile */}
      <span className={`
        relative z-10
        inline-flex
        transition-transform duration-300
        ${isActive ? 'scale-110' : 'group-hover/btn:scale-105'}
      `}>
        {React.cloneElement(icon, {
          className: `h-6 w-6 sm:h-7 sm:w-7 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`
        })}
      </span>

      {/* Active indicator bar - Plus visible */}
      {isActive && (
        <span className="
          absolute bottom-1 left-1/2 -translate-x-1/2
          w-1.5 h-1.5
          bg-accent
          rounded-full
        " />
      )}
    </button>
  )
}

export default FixedNavBar
