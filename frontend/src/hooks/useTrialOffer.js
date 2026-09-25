import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../Contexts/AuthContext'
import { checkTrialEligibility, activateTrial, declineTrial } from '../api/userApi'

/**
 * Hook for managing trial offer state and actions
 */
export function useTrialOffer() {
    const { user, refreshUser } = useAuth()
    const [isEligible, setIsEligible] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [eligibilityData, setEligibilityData] = useState(null)

    // Check eligibility on mount and when user changes
    const checkEligibility = useCallback(async () => {
        if (!user) {
            setIsLoading(false)
            setIsEligible(false)
            return
        }

        // Quick checks before API call
        if (user.premium || user.trialOffered || user.trialDeclined) {
            setIsLoading(false)
            setIsEligible(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            const result = await checkTrialEligibility()

            if (result.error) {
                setError(result.message)
                setIsEligible(false)
            } else {
                setIsEligible(result.eligible || false)
                setEligibilityData(result)
            }
        } catch (err) {
            setError('Erreur lors de la vérification')
            setIsEligible(false)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        checkEligibility()
    }, [checkEligibility])

    // Activate trial
    const activate = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await activateTrial()

            if (result.error) {
                setError(result.message)
                return { success: false, message: result.message }
            }

            // Refresh user data to update premium status
            if (refreshUser) {
                await refreshUser()
            }

            setIsEligible(false)
            return { success: true, message: result.message, trialEndDate: result.trialEndDate }
        } catch (err) {
            const message = 'Erreur lors de l\'activation'
            setError(message)
            return { success: false, message }
        } finally {
            setIsLoading(false)
        }
    }, [refreshUser])

    // Decline trial
    const decline = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const result = await declineTrial()

            if (result.error) {
                setError(result.message)
                return { success: false, message: result.message }
            }

            // Refresh user data
            if (refreshUser) {
                await refreshUser()
            }

            setIsEligible(false)
            return { success: true, message: result.message }
        } catch (err) {
            const message = 'Erreur lors du refus'
            setError(message)
            return { success: false, message }
        } finally {
            setIsLoading(false)
        }
    }, [refreshUser])

    return {
        isEligible,
        isLoading,
        error,
        eligibilityData,
        activate,
        decline,
        refresh: checkEligibility
    }
}

export default useTrialOffer
