import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Toujours appliquer le thème sombre
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");

    // Nettoyer localStorage si un thème était sauvegardé
    localStorage.removeItem("theme");

    // Mettre à jour la meta theme-color pour le navigateur mobile
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", "#0A0A0A");
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme: "dark",
        isDark: true,
        isLight: false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export default ThemeContext;
