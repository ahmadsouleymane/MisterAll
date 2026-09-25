/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ===== DESIGN SYSTEM MODERNE INSPIRÉ DE VERCEL/LINEAR/STRIPE =====

        // Système de couleurs sombres premium
        dark: {
          DEFAULT: "#0A0A0A",      // Fond principal - noir profond
          50: "#1C1C1C",           // Surface élevée (cards, modals)
          100: "#141414",          // Surface standard
          200: "#0F0F0F",          // Surface basse
          300: "#000000",          // Noir pur pour texte sur jaune
          900: "#050505",          // Ultra dark pour depth
        },

        // Surfaces avec hiérarchie claire
        surface: {
          DEFAULT: "#121212",      // Surface de base
          raised: "#1A1A1A",       // Surface surélevée (hover states)
          overlay: "#1E1E1E",      // Overlays et modals
          subtle: "#0D0D0D",       // Surface subtile
        },

        // Système de texte optimisé pour contraste
        text: {
          primary: "#FFFFFF",      // Texte principal - contraste maximum
          secondary: "#A3A3A3",    // Texte secondaire - bien lisible
          tertiary: "#737373",     // Texte tertiaire - infos complémentaires
          quaternary: "#525252",   // Texte désactivé/placeholder
          inverse: "#0A0A0A",      // Texte sur fond clair (jaune)
        },

        // Bordures sophistiquées
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.08)",    // Bordure par défaut
          subtle: "rgba(255, 255, 255, 0.05)",     // Bordure très subtile
          medium: "rgba(255, 255, 255, 0.12)",     // Bordure visible
          strong: "rgba(255, 255, 255, 0.18)",     // Bordure forte
          accent: "rgba(255, 255, 92, 0.3)",       // Bordure accent
          focus: "rgba(255, 255, 92, 0.5)",        // Bordure focus
        },

        // Couleur principale - JAUNE (votre signature)
        accent: {
          DEFAULT: "#FFFF5C",      // Jaune vif - couleur principale
          50: "#FFFFF0",           // Jaune très pâle
          100: "#FFFFCC",          // Jaune pâle
          200: "#FFFF99",          // Jaune clair
          300: "#FFFF7A",          // Jaune moyen clair
          400: "#FFFF5C",          // Jaune principal
          500: "#F0F050",          // Jaune saturé
          600: "#E6E654",          // Jaune foncé
          700: "#D4D447",          // Jaune très foncé
          800: "#B8B83D",          // Jaune olive
          glow: "rgba(255, 255, 92, 0.15)",        // Effet glow
          'glow-strong': "rgba(255, 255, 92, 0.25)", // Glow fort
        },

        // États sémantiques modernes
        success: {
          DEFAULT: "#10B981",
          light: "#34D399",
          dark: "#059669",
          bg: "rgba(16, 185, 129, 0.1)",
        },

        error: {
          DEFAULT: "#EF4444",
          light: "#F87171",
          dark: "#DC2626",
          bg: "rgba(239, 68, 68, 0.1)",
        },

        warning: {
          DEFAULT: "#F59E0B",
          light: "#FBBF24",
          dark: "#D97706",
          bg: "rgba(245, 158, 11, 0.1)",
        },

        info: {
          DEFAULT: "#3B82F6",
          light: "#60A5FA",
          dark: "#2563EB",
          bg: "rgba(59, 130, 246, 0.1)",
        },

        // Couleurs fonctionnelles supplémentaires
        premium: {
          DEFAULT: "#FFD700",      // Or pour premium
          light: "#FFE55C",
          dark: "#E6C200",
        },

        // Compatibilité ancienne (migration progressive)
        primaryBlack: "#0A0A0A",
        secondaryBlack: "#121212",
        tertiaryBlack: "#1A1A1A",
        pop: "#FFFF5C",
      },

      fontFamily: {
        sans: ["Montserrat", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        myfont: ["Montserrat", "sans-serif"],
      },

      // Ombres sophistiquées inspirées de Vercel + effets futuristes
      boxShadow: {
        // Ombres avec accent jaune
        'glow-xs': '0 0 8px rgba(255, 255, 92, 0.08)',
        'glow-sm': '0 0 12px rgba(255, 255, 92, 0.15)',
        'glow': '0 0 24px rgba(255, 255, 92, 0.25)',
        'glow-md': '0 0 32px rgba(255, 255, 92, 0.3)',
        'glow-lg': '0 0 48px rgba(255, 255, 92, 0.4)',
        'glow-xl': '0 0 64px rgba(255, 255, 92, 0.5)',

        // Ombres dark mode élégantes avec profondeur
        'dark-xs': '0 1px 2px rgba(0, 0, 0, 0.3)',
        'dark-sm': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'dark': '0 4px 16px rgba(0, 0, 0, 0.5)',
        'dark-md': '0 8px 24px rgba(0, 0, 0, 0.6)',
        'dark-lg': '0 16px 48px rgba(0, 0, 0, 0.7)',
        'dark-xl': '0 24px 64px rgba(0, 0, 0, 0.8)',

        // Effets spéciaux inner
        'inner-glow': 'inset 0 0 24px rgba(255, 255, 92, 0.08)',
        'inner-glow-strong': 'inset 0 0 32px rgba(255, 255, 92, 0.15)',
        'inner-dark': 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',

        // Ombres combinées (dark + glow) - effet premium
        'premium': '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 24px rgba(255, 255, 92, 0.2)',
        'premium-lg': '0 16px 48px rgba(0, 0, 0, 0.7), 0 0 32px rgba(255, 255, 92, 0.25)',

        // Nouveaux effets 3D et glassmorphism
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glass-lg': '0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-accent': '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 24px rgba(255, 255, 92, 0.15), 0 0 0 1px rgba(255, 255, 92, 0.1)',

        // Effets de profondeur (depth)
        'depth-1': '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'depth-2': '0 4px 8px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.15)',
        'depth-3': '0 8px 16px rgba(0, 0, 0, 0.4), 0 4px 8px rgba(0, 0, 0, 0.2)',
        'depth-4': '0 16px 32px rgba(0, 0, 0, 0.5), 0 8px 16px rgba(0, 0, 0, 0.25)',

        // Effets hover sophistiqués
        'hover-accent': '0 12px 32px rgba(255, 255, 92, 0.3), 0 4px 12px rgba(0, 0, 0, 0.4)',
        'hover-lift': '0 20px 48px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.3)',

        // Effet néon subtil
        'neon-accent': '0 0 2px rgba(255, 255, 92, 0.5), 0 0 8px rgba(255, 255, 92, 0.3), 0 0 16px rgba(255, 255, 92, 0.2)',

        // Shadows sémantiques - Success (vert)
        'success-sm': '0 0 12px rgba(16, 185, 129, 0.3)',
        'success': '0 0 20px rgba(16, 185, 129, 0.4)',
        'success-lg': '0 0 32px rgba(16, 185, 129, 0.5)',
        'neon-success': '0 0 4px rgba(16, 185, 129, 0.6), 0 0 12px rgba(16, 185, 129, 0.4), 0 0 24px rgba(16, 185, 129, 0.3)',

        // Shadows sémantiques - Error (rouge)
        'error-sm': '0 0 12px rgba(239, 68, 68, 0.3)',
        'error': '0 0 20px rgba(239, 68, 68, 0.4)',
        'error-lg': '0 0 32px rgba(239, 68, 68, 0.5)',
        'neon-error': '0 0 4px rgba(239, 68, 68, 0.6), 0 0 12px rgba(239, 68, 68, 0.4), 0 0 24px rgba(239, 68, 68, 0.3)',

        // Shadows sémantiques - Warning (orange)
        'warning-sm': '0 0 12px rgba(245, 158, 11, 0.3)',
        'warning': '0 0 20px rgba(245, 158, 11, 0.4)',
        'warning-lg': '0 0 32px rgba(245, 158, 11, 0.5)',
        'neon-warning': '0 0 4px rgba(245, 158, 11, 0.6), 0 0 12px rgba(245, 158, 11, 0.4), 0 0 24px rgba(245, 158, 11, 0.3)',

        // Shadows sémantiques - Info (bleu)
        'info-sm': '0 0 12px rgba(59, 130, 246, 0.3)',
        'info': '0 0 20px rgba(59, 130, 246, 0.4)',
        'info-lg': '0 0 32px rgba(59, 130, 246, 0.5)',
        'neon-info': '0 0 4px rgba(59, 130, 246, 0.6), 0 0 12px rgba(59, 130, 246, 0.4), 0 0 24px rgba(59, 130, 246, 0.3)',
      },

      // Border radius système cohérent
      borderRadius: {
        'sm': '0.5rem',      // 8px - petits éléments
        'DEFAULT': '0.75rem', // 12px - par défaut
        'md': '0.875rem',    // 14px - medium
        'lg': '1rem',        // 16px - cards
        'xl': '1.25rem',     // 20px - grandes cards
        '2xl': '1.5rem',     // 24px - modals
        '3xl': '2rem',       // 32px - hero sections
        'full': '9999px',    // Pills/badges
      },

      // Animations fluides inspirées de Linear
      animation: {
        // Animations existantes améliorées
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-glow': 'pulseGlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2.5s ease-in-out infinite alternate',

        // Animations d'entrée/sortie
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-out': 'fadeOut 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-left': 'slideLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-right': 'slideRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',

        // Animations de scale
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out': 'scaleOut 0.2s ease-out',

        // Animations spéciales
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'shimmer': 'shimmer 2.5s linear infinite',
        'float': 'float 3s ease-in-out infinite',

        // Animations pour les toasts/modals
        'toast-enter': 'toastEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-exit': 'toastExit 0.2s ease-out forwards',
        'modal-enter': 'modalEnter 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'modal-exit': 'modalExit 0.2s ease-out forwards',
      },

      keyframes: {
        // Glow effects
        glow: {
          '0%': { boxShadow: '0 0 12px rgba(255, 255, 92, 0.2)' },
          '100%': { boxShadow: '0 0 32px rgba(255, 255, 92, 0.4)' },
        },
        pulseGlow: {
          '0%, 100%': {
            boxShadow: '0 0 12px rgba(255, 255, 92, 0.2)',
            transform: 'scale(1)',
          },
          '50%': {
            boxShadow: '0 0 24px rgba(255, 255, 92, 0.35)',
            transform: 'scale(1.02)',
          },
        },

        // Fade animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },

        // Slide animations
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-16px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },

        // Scale animations
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },

        // Special effects
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },

        // Keyframes pour les toasts
        toastEnter: {
          '0%': { transform: 'translateX(100%) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateX(0) scale(1)', opacity: '1' },
        },
        toastExit: {
          '0%': { transform: 'translateX(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateX(100%) scale(0.9)', opacity: '0' },
        },

        // Keyframes pour les modals
        modalEnter: {
          '0%': { transform: 'scale(0.95) translateY(10px)', opacity: '0' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        modalExit: {
          '0%': { transform: 'scale(1) translateY(0)', opacity: '1' },
          '100%': { transform: 'scale(0.95) translateY(10px)', opacity: '0' },
        },
      },

      // Backdrop blur optimisé
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },

      // Transitions personnalisées
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      // Spacing supplémentaire pour un design aéré
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
    },
  },
  plugins: [],
};
