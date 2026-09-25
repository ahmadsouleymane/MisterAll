import { ChevronRight, Home } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Composant Breadcrumbs pour la navigation
 * @param {Array} items - [{label: string, path?: string}]
 * @param {boolean} showHome - Afficher le lien Accueil
 */
function Breadcrumbs({ items = [], showHome = true }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-1 text-sm">
      {showHome && (
        <>
          <Link
            to="/home"
            className="flex items-center gap-1 text-text-tertiary hover:text-accent transition-colors"
            aria-label="Accueil"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Accueil</span>
          </Link>
          {items.length > 0 && (
            <ChevronRight className="w-4 h-4 text-text-quaternary" aria-hidden="true" />
          )}
        </>
      )}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={index} className="flex items-center gap-1">
            {item.path && !isLast ? (
              <Link
                to={item.path}
                state={item.state}
                className="text-text-tertiary hover:text-accent transition-colors truncate max-w-[150px] sm:max-w-[200px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={`truncate max-w-[150px] sm:max-w-[250px] ${
                  isLast ? 'text-text-primary font-medium' : 'text-text-tertiary'
                }`}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronRight className="w-4 h-4 text-text-quaternary flex-shrink-0" aria-hidden="true" />
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
