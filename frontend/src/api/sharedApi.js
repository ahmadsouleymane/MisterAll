const API = import.meta.env.VITE_API_URL + '/shared'

// ==================== Authenticated API ====================

export const enableCourseSharing = async (courseId) => {
    try {
        const response = await fetch(`${API}/enable/${courseId}`, {
            method: 'POST',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de l\'activation du partage' }
    }
}

export const disableCourseSharing = async (courseId) => {
    try {
        const response = await fetch(`${API}/disable/${courseId}`, {
            method: 'POST',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la désactivation du partage' }
    }
}

export const getSharingStatus = async (courseId) => {
    try {
        const response = await fetch(`${API}/status/${courseId}`, {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération du statut' }
    }
}

// ==================== Public API ====================

export const getSharedCourse = async (shareToken) => {
    try {
        const response = await fetch(`${API}/course/${shareToken}`, {
            method: 'GET',
        })
        if (!response.ok) {
            const data = await response.json()
            return { error: true, message: data.error || 'Cours non trouvé' }
        }
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération du cours' }
    }
}

export const getSharedCourseAssets = async (shareToken) => {
    try {
        const response = await fetch(`${API}/assets/${shareToken}`, {
            method: 'GET',
        })
        if (!response.ok) {
            const data = await response.json()
            return { error: true, message: data.error || 'Assets non trouvés' }
        }
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération des assets' }
    }
}
