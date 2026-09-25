const API = import.meta.env.VITE_API_URL + '/course'

export const AddCourse = async (course) => {
    try {
        const formData = new FormData()
        formData.append('title', course.title)
        formData.append('subject', course.subject)
        formData.append('attachment', course.file)

        const response = await fetch(API + '/add', {
            method: 'POST',
            credentials: "include",
            body: formData
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de l\'ajout du cours' }
    }
}

export const getCoursesWithAssets = async () => {
    try {
        const response = await fetch(API + '/all', {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' }
    }
}

export const getUserCourses = async () => {
    try {
        const response = await fetch(API + '/get', {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération des cours' }
    }
}

export const getCourseAssets = async (courseId) => {
    try {
        const response = await fetch(API + '/assets/' + courseId, {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération des assets' }
    }
}

export const deleteCourse = async (id) => {
    try {
        const response = await fetch(API + '/delete/' + id, {
            method: 'DELETE',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la suppression' }
    }
}

export const updateCourse = async (title, subject, id) => {
    try {
        const response = await fetch(API + '/update/' + id, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({ title, subject })
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la mise à jour' }
    }
}

export const updateQuizScore = async (isCorrect, courseId, sheetId, quizId) => {
    try {
        const response = await fetch(API + '/assets/sheet/score-update', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                "isCorrect": isCorrect,
                "courseId": courseId,
                "sheetId": sheetId,
                "quizId": quizId
            })
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la mise à jour du score' }
    }
}

// ==================== FLASHCARDS API ====================

export const getDueFlashcards = async () => {
    try {
        const response = await fetch(API + '/flashcards/due', {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération des flashcards' }
    }
}

export const getCourseFlashcards = async (courseId) => {
    try {
        const response = await fetch(API + '/flashcards/' + courseId, {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération des flashcards' }
    }
}

export const reviewFlashcard = async (courseId, flashcardId, quality) => {
    try {
        const response = await fetch(API + '/flashcards/review', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: "include",
            body: JSON.stringify({
                courseId,
                flashcardId,
                quality
            })
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la mise à jour de la flashcard' }
    }
}

export const getFlashcardStats = async () => {
    try {
        const response = await fetch(API + '/flashcards/stats', {
            method: 'GET',
            credentials: "include",
        })
        const data = await response.json()
        return data
    } catch (error) {
        return { error: true, message: 'Erreur lors de la récupération des stats' }
    }
}

// ==================== DOWNLOAD ASSETS API ====================

/**
 * Get the download URL for course assets
 * @param {string} courseId - Course ID
 * @param {string} type - Asset type: 'resume', 'sheets', 'quizs', 'flashcards', 'all'
 * @returns {string} Download URL
 */
export const getAssetDownloadUrl = (courseId, type) => {
    return `${API}/assets/${courseId}/download/${type}`
}

/**
 * Download course assets as a file
 * @param {string} courseId - Course ID
 * @param {string} type - Asset type: 'resume', 'sheets', 'quizs', 'flashcards', 'all'
 */
export const downloadCourseAsset = async (courseId, type) => {
    try {
        const response = await fetch(`${API}/assets/${courseId}/download/${type}`, {
            method: 'GET',
            credentials: "include",
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Erreur lors du téléchargement')
        }

        // Get the filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `asset_${type}`
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/)
            if (match) filename = match[1]
        }

        // Download the file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        return { success: true }
    } catch (error) {
        return { error: true, message: error.message || 'Erreur lors du téléchargement' }
    }
}

/**
 * Download flashcards as a formatted PDF
 * @param {string} courseId - Course ID
 */
export const downloadFlashcardsPDF = async (courseId) => {
    try {
        const response = await fetch(`${API}/flashcards/${courseId}/pdf`, {
            method: 'GET',
            credentials: "include",
        })

        if (!response.ok) {
            const error = await response.json()
            return { error: true, message: error.message || 'Erreur lors de la génération du PDF' }
        }

        // Get the filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = 'flashcards.pdf'
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="(.+)"/)
            if (match) filename = match[1]
        }

        // Download the file
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        return { success: true }
    } catch (error) {
        return { error: true, message: 'Erreur lors du téléchargement du PDF' }
    }
}
