import { useState, useEffect, useCallback } from "react";

/**
 * Hook pour surveiller le statut de connexion internet
 * @returns {{ isOnline: boolean, wasOffline: boolean, checkConnection: () => Promise<boolean> }}
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  // Vérification active de la connexion (ping API)
  const checkConnection = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch("/api/health", {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-store",
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Marquer qu'on était offline pour afficher "Connexion rétablie"
      if (!isOnline) {
        setWasOffline(true);
        // Reset après 3 secondes
        setTimeout(() => setWasOffline(false), 3000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isOnline]);

  return { isOnline, wasOffline, checkConnection };
}

export default useOnlineStatus;
