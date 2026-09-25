/**
 * Lien d'accessibilité "Skip to content"
 * Visible uniquement au focus (pour les utilisateurs clavier/screen reader)
 */
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[300]
        focus:px-4 focus:py-2
        focus:bg-accent focus:text-dark
        focus:rounded-lg focus:font-semibold
        focus:outline-none focus:ring-2 focus:ring-white
        transition-all
      "
    >
      Aller au contenu principal
    </a>
  );
}

export default SkipLink;
