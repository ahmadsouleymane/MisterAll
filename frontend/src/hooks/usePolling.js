import { useEffect, useRef, useCallback } from "react";

/**
 * Hook de polling intelligent avec exponential backoff
 * @param {Function} callback - Fonction à appeler à chaque intervalle
 * @param {Object} options - Options de configuration
 * @param {boolean} options.enabled - Activer/désactiver le polling
 * @param {number} options.initialInterval - Intervalle initial en ms (défaut: 10000)
 * @param {number} options.maxInterval - Intervalle maximum en ms (défaut: 120000)
 * @param {number} options.maxDuration - Durée max du polling en ms (défaut: 600000 = 10min)
 * @param {number} options.backoffMultiplier - Multiplicateur pour le backoff (défaut: 2)
 */
export function usePolling(callback, options = {}) {
  const {
    enabled = true,
    initialInterval = 10000,
    maxInterval = 120000,
    maxDuration = 600000,
    backoffMultiplier = 2,
  } = options;

  const intervalRef = useRef(null);
  const currentIntervalMs = useRef(initialInterval);
  const startTimeRef = useRef(null);
  const lastResultRef = useRef(null);

  const executeCallback = useCallback(async () => {
    if (!enabled) return;

    // Vérifier si on a dépassé la durée max
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      if (elapsed >= maxDuration) {
        console.log("[Polling] Durée maximale atteinte, arrêt du polling");
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
    }

    try {
      const result = await callback();

      // Si le résultat n'a pas changé, augmenter l'intervalle (backoff)
      if (JSON.stringify(result) === JSON.stringify(lastResultRef.current)) {
        currentIntervalMs.current = Math.min(
          currentIntervalMs.current * backoffMultiplier,
          maxInterval
        );
      } else {
        // Résultat différent, reset l'intervalle
        currentIntervalMs.current = initialInterval;
        lastResultRef.current = result;
      }
    } catch (error) {
      console.error("[Polling] Erreur:", error);
      // En cas d'erreur, augmenter l'intervalle
      currentIntervalMs.current = Math.min(
        currentIntervalMs.current * backoffMultiplier,
        maxInterval
      );
    }

    // Planifier le prochain appel
    if (enabled) {
      intervalRef.current = setTimeout(executeCallback, currentIntervalMs.current);
    }
  }, [callback, enabled, initialInterval, maxInterval, maxDuration, backoffMultiplier]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initialiser
    startTimeRef.current = Date.now();
    currentIntervalMs.current = initialInterval;
    lastResultRef.current = null;

    // Premier appel après l'intervalle initial
    intervalRef.current = setTimeout(executeCallback, initialInterval);

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, executeCallback, initialInterval]);

  // Retourner une fonction pour reset manuellement
  const reset = useCallback(() => {
    currentIntervalMs.current = initialInterval;
    startTimeRef.current = Date.now();
    lastResultRef.current = null;
  }, [initialInterval]);

  return { reset };
}

export default usePolling;
