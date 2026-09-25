import { useState, useEffect } from 'react'

/**
 * Hook pour détecter le type d'appareil, OS et navigateur
 * Utile pour afficher les instructions d'installation PWA adaptées
 *
 * @returns {object} - Informations sur l'appareil
 *
 * @example
 * const { os, browser, isMobile, isStandalone, canInstall } = useDeviceDetect()
 *
 * if (os === 'iOS') {
 *   // Afficher instructions Safari
 * }
 */
export function useDeviceDetect() {
  const [deviceInfo, setDeviceInfo] = useState({
    os: 'unknown',
    osVersion: '',
    browser: 'unknown',
    browserVersion: '',
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isStandalone: false,
    isPWAInstalled: false,
    canInstall: false,
    installPrompt: null
  })

  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent
      const platform = navigator.platform || ''

      // Détecter l'OS
      let os = 'unknown'
      let osVersion = ''

      if (/iPhone|iPad|iPod/.test(ua)) {
        os = 'iOS'
        const match = ua.match(/OS (\d+[._]\d+)/)
        if (match) osVersion = match[1].replace('_', '.')
      } else if (/Android/.test(ua)) {
        os = 'Android'
        const match = ua.match(/Android (\d+(\.\d+)?)/)
        if (match) osVersion = match[1]
      } else if (/Windows/.test(ua)) {
        os = 'Windows'
        if (/Windows NT 10/.test(ua)) osVersion = '10'
        else if (/Windows NT 11/.test(ua)) osVersion = '11'
      } else if (/Mac OS X/.test(ua)) {
        os = 'macOS'
        const match = ua.match(/Mac OS X (\d+[._]\d+)/)
        if (match) osVersion = match[1].replace('_', '.')
      } else if (/Linux/.test(ua)) {
        os = 'Linux'
      } else if (/CrOS/.test(ua)) {
        os = 'ChromeOS'
      }

      // Détecter le navigateur
      let browser = 'unknown'
      let browserVersion = ''

      if (/Firefox\/(\d+)/.test(ua)) {
        browser = 'Firefox'
        browserVersion = ua.match(/Firefox\/(\d+)/)[1]
      } else if (/Edg\/(\d+)/.test(ua)) {
        browser = 'Edge'
        browserVersion = ua.match(/Edg\/(\d+)/)[1]
      } else if (/Chrome\/(\d+)/.test(ua) && !/Edg/.test(ua)) {
        browser = 'Chrome'
        browserVersion = ua.match(/Chrome\/(\d+)/)[1]
      } else if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) {
        browser = 'Safari'
        const match = ua.match(/Version\/(\d+(\.\d+)?)/)
        if (match) browserVersion = match[1]
      } else if (/Opera|OPR\/(\d+)/.test(ua)) {
        browser = 'Opera'
        const match = ua.match(/(?:Opera|OPR)\/(\d+)/)
        if (match) browserVersion = match[1]
      } else if (/SamsungBrowser\/(\d+)/.test(ua)) {
        browser = 'Samsung'
        browserVersion = ua.match(/SamsungBrowser\/(\d+)/)[1]
      }

      // Détecter le type d'appareil
      const isMobile = /iPhone|Android.*Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      const isTablet = /iPad|Android(?!.*Mobile)|Tablet/i.test(ua)
      const isDesktop = !isMobile && !isTablet

      // Vérifier si en mode standalone (PWA installée)
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://')

      // Vérifier si PWA peut être installée
      // Note: canInstall sera mis à jour par l'event beforeinstallprompt
      const canInstall = !isStandalone && 'serviceWorker' in navigator

      setDeviceInfo({
        os,
        osVersion,
        browser,
        browserVersion,
        isMobile,
        isTablet,
        isDesktop,
        isStandalone,
        isPWAInstalled: isStandalone,
        canInstall,
        installPrompt: null
      })
    }

    detectDevice()

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeviceInfo(prev => ({
        ...prev,
        canInstall: true,
        installPrompt: e
      }))
    }

    // Écouter quand la PWA est installée
    const handleAppInstalled = () => {
      setDeviceInfo(prev => ({
        ...prev,
        isPWAInstalled: true,
        isStandalone: true,
        canInstall: false,
        installPrompt: null
      }))
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  /**
   * Déclencher l'installation PWA (Chrome/Edge/etc)
   * @returns {Promise<boolean>} - true si accepté, false sinon
   */
  const promptInstall = async () => {
    if (!deviceInfo.installPrompt) {
      return false
    }

    try {
      deviceInfo.installPrompt.prompt()
      const { outcome } = await deviceInfo.installPrompt.userChoice

      if (outcome === 'accepted') {
        setDeviceInfo(prev => ({
          ...prev,
          isPWAInstalled: true,
          canInstall: false,
          installPrompt: null
        }))
        return true
      }

      return false
    } catch (err) {
      console.error('Erreur installation PWA:', err)
      return false
    }
  }

  return {
    ...deviceInfo,
    promptInstall
  }
}

export default useDeviceDetect
