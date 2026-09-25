import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

/**
 * Indicateur de statut de connexion
 * Affiche une bannière quand l'utilisateur est hors ligne
 */
function OfflineIndicator() {
  const { isOnline, wasOffline } = useOnlineStatus();

  // Connexion rétablie
  if (isOnline && wasOffline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed top-0 left-0 right-0 z-[200] bg-success text-white px-4 py-3 flex items-center justify-center gap-2 animate-slide-down"
      >
        <Wifi className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">Connexion rétablie</span>
      </div>
    );
  }

  // Hors ligne
  if (!isOnline) {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className="fixed top-0 left-0 right-0 z-[200] bg-warning text-white px-4 py-3 flex items-center justify-center gap-2 animate-slide-down"
      >
        <WifiOff className="h-4 w-4" aria-hidden="true" />
        <span className="text-sm font-medium">
          Vous êtes hors ligne - Certaines fonctionnalités peuvent être limitées
        </span>
      </div>
    );
  }

  return null;
}

export default OfflineIndicator;
