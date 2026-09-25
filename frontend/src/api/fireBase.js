// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB7SYP19-F4DnRR3dd8BnyxTnWtkgvYgUU",
  authDomain: "misterall2025.firebaseapp.com",
  projectId: "misterall2025",
  storageBucket: "misterall2025.firebasestorage.app",
  messagingSenderId: "523638069820",
  appId: "1:523638069820:web:231d947043a977519d8139"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configuration pour le développement (optionnel)
if (import.meta.env.DEV) {
  // Désactiver la vérification d'app pour les tests en développement
  auth.settings = {
    appVerificationDisabledForTesting: true
  };
}

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
