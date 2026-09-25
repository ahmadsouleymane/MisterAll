import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase credentials are available
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin SDK not configured - Google OAuth will be disabled');
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    return null;
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Verify a Firebase ID token from Google Sign-In
 * @param {string} idToken - The Firebase ID token from the client
 * @returns {Object} - { success: boolean, uid?, email?, emailVerified?, name?, picture?, error? }
 */
export const verifyFirebaseToken = async (idToken) => {
  try {
    if (!firebaseApp) {
      return {
        success: false,
        error: 'Firebase is not configured',
      };
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);

    return {
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
      providerId: decodedToken.firebase?.sign_in_provider || 'google.com',
    };
  } catch (error) {
    console.error('Firebase token verification error:', error);

    let errorMessage = 'Token invalide';
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Token expire';
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Format de token invalide';
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Check if Firebase is configured and available
 * @returns {boolean}
 */
export const isFirebaseConfigured = () => {
  return firebaseApp !== null;
};

export default {
  verifyFirebaseToken,
  isFirebaseConfigured,
};
