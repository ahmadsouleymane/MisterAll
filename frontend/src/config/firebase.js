import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase only if config is available
let app = null;
let auth = null;
let googleProvider = null;

const initializeFirebase = () => {
  if (app) return { app, auth, googleProvider };

  // Check if Firebase is configured
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase not configured - Google OAuth will be disabled');
    return { app: null, auth: null, googleProvider: null };
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Request email scope
    googleProvider.addScope('email');
    googleProvider.addScope('profile');

    return { app, auth, googleProvider };
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return { app: null, auth: null, googleProvider: null };
  }
};

// Initialize on module load
initializeFirebase();

/**
 * Check if Firebase/Google OAuth is available
 */
export const isGoogleAuthAvailable = () => {
  return auth !== null && googleProvider !== null;
};

/**
 * Sign in with Google and get the ID token
 * @returns {Promise<{success: boolean, idToken?: string, user?: object, error?: string}>}
 */
export const signInWithGoogle = async () => {
  if (!auth || !googleProvider) {
    return {
      success: false,
      error: 'Google authentication is not configured'
    };
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Get the ID token to send to backend
    const idToken = await user.getIdToken();

    return {
      success: true,
      idToken,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      }
    };
  } catch (error) {
    console.error('Google sign-in error:', error);

    let errorMessage = 'Erreur lors de la connexion avec Google';

    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Connexion annulee';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Le popup a ete bloque. Autorise les popups pour ce site.';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Une autre connexion est en cours';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Erreur de connexion. Verifie ta connexion internet.';
        break;
      default:
        if (error.message) {
          errorMessage = error.message;
        }
    }

    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Sign out from Firebase
 */
export const signOutFromGoogle = async () => {
  if (!auth) return;

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Google sign-out error:', error);
  }
};

export { auth, googleProvider };
