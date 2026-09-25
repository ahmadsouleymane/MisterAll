export default {
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
    }
      