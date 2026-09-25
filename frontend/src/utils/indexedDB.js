// IndexedDB Cache Manager - MisterAll
// Stockage local optimisé pour cours et assets

const DB_NAME = 'MisterAllDB'
const DB_VERSION = 1

// Stores
const STORES = {
  COURSES: 'courses',
  ASSETS: 'courseAssets',
  USER: 'user',
  METADATA: 'metadata'
}

// Initialiser la base de données
function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = event.target.result

      // Store: Cours
      if (!db.objectStoreNames.contains(STORES.COURSES)) {
        const courseStore = db.createObjectStore(STORES.COURSES, {
          keyPath: '_id'
        })
        courseStore.createIndex('userId', 'userId', { unique: false })
        courseStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Store: Assets (résumés, fiches, quiz)
      if (!db.objectStoreNames.contains(STORES.ASSETS)) {
        const assetStore = db.createObjectStore(STORES.ASSETS, {
          keyPath: 'courseId'
        })
        assetStore.createIndex('status', 'status', { unique: false })
        assetStore.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // Store: User
      if (!db.objectStoreNames.contains(STORES.USER)) {
        db.createObjectStore(STORES.USER, { keyPath: 'id' })
      }

      // Store: Metadata (cache info, timestamps)
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' })
      }
    }
  })
}

// ==================== COURSES ====================

// Sauvegarder tous les cours
export async function saveCourses(courses) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.COURSES, 'readwrite')
    const store = tx.objectStore(STORES.COURSES)

    // Vider le store avant de sauvegarder
    await store.clear()

    // Ajouter tous les cours
    for (const course of courses) {
      await store.add({
        ...course,
        _cachedAt: Date.now()
      })
    }

    await tx.complete

    // Mettre à jour le metadata
    await saveMetadata('courses_last_sync', Date.now())

    return true
  } catch (error) {
    console.error('❌ Erreur sauvegarde cours:', error)
    return false
  }
}

// Récupérer tous les cours
export async function getCourses() {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.COURSES, 'readonly')
    const store = tx.objectStore(STORES.COURSES)

    const courses = await store.getAll()

    return courses
  } catch (error) {
    console.error('❌ Erreur récupération cours:', error)
    return []
  }
}

// Récupérer un cours par ID
export async function getCourse(courseId) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.COURSES, 'readonly')
    const store = tx.objectStore(STORES.COURSES)

    const course = await store.get(courseId)
    return course || null
  } catch (error) {
    console.error('❌ Erreur récupération cours:', error)
    return null
  }
}

// Supprimer un cours
export async function deleteCourse(courseId) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.COURSES, 'readwrite')
    const store = tx.objectStore(STORES.COURSES)

    await store.delete(courseId)

    return true
  } catch (error) {
    console.error('❌ Erreur suppression cours:', error)
    return false
  }
}

// ==================== ASSETS ====================

// Sauvegarder les assets d'un cours
export async function saveCourseAssets(courseId, assets) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.ASSETS, 'readwrite')
    const store = tx.objectStore(STORES.ASSETS)

    await store.put({
      courseId,
      ...assets,
      _cachedAt: Date.now()
    })

    return true
  } catch (error) {
    console.error('❌ Erreur sauvegarde assets:', error)
    return false
  }
}

// Récupérer les assets d'un cours
export async function getCourseAssets(courseId) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.ASSETS, 'readonly')
    const store = tx.objectStore(STORES.ASSETS)

    const assets = await store.get(courseId)
    return assets || null
  } catch (error) {
    console.error('❌ Erreur récupération assets:', error)
    return null
  }
}

// Récupérer tous les assets
export async function getAllAssets() {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.ASSETS, 'readonly')
    const store = tx.objectStore(STORES.ASSETS)

    const assets = await store.getAll()

    // Convertir en objet { courseId: assets }
    const assetsMap = {}
    assets.forEach(asset => {
      assetsMap[asset.courseId] = asset
    })

    return assetsMap
  } catch (error) {
    console.error('❌ Erreur récupération tous assets:', error)
    return {}
  }
}

// Supprimer les assets d'un cours
export async function deleteCourseAssets(courseId) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.ASSETS, 'readwrite')
    const store = tx.objectStore(STORES.ASSETS)

    await store.delete(courseId)

    return true
  } catch (error) {
    return false
  }
}

// ==================== USER ====================

// Sauvegarder les infos utilisateur
export async function saveUser(user) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.USER, 'readwrite')
    const store = tx.objectStore(STORES.USER)

    await store.put({
      id: user._id || user.id || 'current_user',
      ...user,
      _cachedAt: Date.now()
    })

    return true
  } catch (error) {
    console.error('❌ Erreur sauvegarde user:', error)
    return false
  }
}

// Récupérer les infos utilisateur
export async function getUser() {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.USER, 'readonly')
    const store = tx.objectStore(STORES.USER)

    const users = await store.getAll()
    return users[0] || null
  } catch (error) {
    console.error('❌ Erreur récupération user:', error)
    return null
  }
}

// ==================== METADATA ====================

// Sauvegarder metadata
async function saveMetadata(key, value) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.METADATA, 'readwrite')
    const store = tx.objectStore(STORES.METADATA)

    await store.put({ key, value, timestamp: Date.now() })
    return true
  } catch (error) {
    console.error('❌ Erreur sauvegarde metadata:', error)
    return false
  }
}

// Récupérer metadata
export async function getMetadata(key) {
  try {
    const db = await initDB()
    const tx = db.transaction(STORES.METADATA, 'readonly')
    const store = tx.objectStore(STORES.METADATA)

    const result = await store.get(key)
    return result ? result.value : null
  } catch (error) {
    console.error('❌ Erreur récupération metadata:', error)
    return null
  }
}

// ==================== UTILITIES ====================

// Vérifier si le cache est frais (< 5 minutes)
export async function isCacheFresh(maxAge = 5 * 60 * 1000) {
  const lastSync = await getMetadata('courses_last_sync')
  if (!lastSync) return false

  return (Date.now() - lastSync) < maxAge
}

// Nettoyer tout le cache
export async function clearAllCache() {
  try {
    const db = await initDB()

    const stores = [STORES.COURSES, STORES.ASSETS, STORES.USER, STORES.METADATA]

    for (const storeName of stores) {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      await store.clear()
    }

    return true
  } catch (error) {
    console.error('❌ Erreur nettoyage cache:', error)
    return false
  }
}

// Obtenir la taille du cache (approximatif)
export async function getCacheSize() {
  try {
    const courses = await getCourses()
    const assets = await getAllAssets()
    const user = await getUser()

    // Estimation grossière en JSON
    const dataSize = JSON.stringify({ courses, assets, user }).length
    const sizeKB = (dataSize / 1024).toFixed(2)

    return {
      courses: courses.length,
      assets: Object.keys(assets).length,
      sizeKB: parseFloat(sizeKB),
      sizeMB: (sizeKB / 1024).toFixed(2)
    }
  } catch (error) {
    console.error('❌ Erreur calcul taille cache:', error)
    return null
  }
}

// Vérifier si IndexedDB est disponible
export function isIndexedDBAvailable() {
  return 'indexedDB' in window
}
