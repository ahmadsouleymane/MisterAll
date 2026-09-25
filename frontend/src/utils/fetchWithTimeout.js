/**
 * Fetch avec timeout pour éviter les requêtes qui restent bloquées
 * @param {string} url - URL à fetch
 * @param {object} options - Options fetch standard
 * @param {number} timeout - Timeout en ms (défaut: 30000)
 * @returns {Promise<Response>}
 */
export const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La requête a expiré. Vérifiez votre connexion.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Vérifier si l'utilisateur est en ligne
 * @returns {boolean}
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Wrapper pour les appels API avec gestion d'erreur standardisée
 * @param {Function} apiCall - Fonction d'appel API
 * @param {string} errorMessage - Message d'erreur par défaut
 * @returns {Promise<object>}
 */
export const safeApiCall = async (apiCall, errorMessage = 'Une erreur est survenue') => {
  if (!isOnline()) {
    return { error: true, message: 'Pas de connexion internet' };
  }

  try {
    const result = await apiCall();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    return { error: true, message: error.message || errorMessage };
  }
};
