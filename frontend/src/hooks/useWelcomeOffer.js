import { useState, useEffect } from 'react'

const OFFER_STORAGE_KEY = 'misterall_first_offer'
const OFFER_DURATION = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

export const useWelcomeOffer = () => {
  const [timeRemaining, setTimeRemaining] = useState(null)
  const [isOfferActive, setIsOfferActive] = useState(false)

  useEffect(() => {
    // Verifier si l'offre existe dans localStorage
    const offerData = localStorage.getItem(OFFER_STORAGE_KEY)

    if (!offerData) {
      // Premiere connexion - creer l'offre
      const offerStart = Date.now()
      localStorage.setItem(OFFER_STORAGE_KEY, JSON.stringify({
        startTime: offerStart,
        shown: false
      }))
      setTimeRemaining(OFFER_DURATION)
      setIsOfferActive(true)
    } else {
      const { startTime } = JSON.parse(offerData)
      const elapsed = Date.now() - startTime
      const remaining = OFFER_DURATION - elapsed

      if (remaining > 0) {
        setTimeRemaining(remaining)
        setIsOfferActive(true)
      } else {
        setIsOfferActive(false)
        setTimeRemaining(0)
      }
    }
  }, [])

  // Compte a rebours
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1000) {
          clearInterval(timer)
          setIsOfferActive(false)
          return 0
        }
        return prev - 1000
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return { hours: '00', minutes: '00', seconds: '00' }

    const hours = Math.floor(ms / (1000 * 60 * 60))
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0')
    }
  }

  const formattedTime = formatTime(timeRemaining)

  // Prix selon l'offre
  const price = isOfferActive ? 1000 : 2000
  const originalPrice = 2000
  const discount = isOfferActive ? 50 : 0

  return {
    isOfferActive,
    timeRemaining,
    formattedTime,
    price,
    originalPrice,
    discount
  }
}

export default useWelcomeOffer
