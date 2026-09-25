// Enregistrement du Service Worker - MisterAll PWA

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      })

      // Gérer les mises à jour du SW
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {

            // Option 1: Recharger automatiquement
            // window.location.reload()

            // Option 2: Notifier l'utilisateur (recommandé)
            if (confirm('Une nouvelle version est disponible. Recharger ?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' })
              window.location.reload()
            }
          }
        })
      })

      // Vérifier les mises à jour toutes les heures
      setInterval(() => {
        registration.update()
      }, 60 * 60 * 1000)

    } catch (error) {
      console.error('❌ Erreur Service Worker:', error)
    }
  } else {
    console.warn('⚠️  Service Worker non supporté')
  }
}

// Vérifier si l'app est en mode standalone (installée)
export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://')
}

// Vérifier si l'app est installable
export function checkInstallability() {
  let deferredPrompt = null

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
  })

  return {
    get prompt() {
      return deferredPrompt
    },
    async install() {
      if (!deferredPrompt) {
        console.warn('App déjà installée ou non installable')
        return false
      }

      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      deferredPrompt = null

      return outcome === 'accepted'
    }
  }
}

// Nettoyer le cache (utile pour debug)
export async function clearAllCaches() {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    await Promise.all(cacheNames.map(name => caches.delete(name)))
  }
}
