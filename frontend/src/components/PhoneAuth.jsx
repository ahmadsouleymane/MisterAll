// src/components/PhoneAuth.jsx
import React, { useState, useEffect } from "react";
import Inputs from "./Inputs.jsx";
import Buttons from "./Buttons.jsx";
import BigTitle from "./BigTitle.jsx";

export default function PhoneAuth({ phoneNumber, onSuccess, onError }) {
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  // Formater le numéro de téléphone au format international
  const formatPhoneNumber = (phone) => {
    // Nettoyer le numéro (enlever espaces, tirets, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Si déjà au format international (commence par +), retourner tel quel
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    // Numéros ivoiriens : depuis 2021, ils font 10 chiffres avec le 0
    // Format: 0X XX XX XX XX où X sont des chiffres
    // On garde le 0 et on ajoute +225
    if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      // GARDER le 0 et ajouter +225 (résultat: +225 + 10 chiffres = 14 caractères)
      return '+225' + cleanPhone;
    }
    
    // Si le numéro fait 10 chiffres sans le 0 (cas rare)
    if (!cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      return '+225' + cleanPhone;
    }
    
    // Par défaut, ajouter +225 (pour les numéros ivoiriens sans indicatif)
    return '+225' + cleanPhone;
  };

  // Initialiser le recaptcha invisible
  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
            },
            'expired-callback': () => {
            }
          }
        );
      } catch (error) {
        console.error("Erreur initialisation RecaptchaVerifier:", error);
        throw error;
      }
    }
  };

  const sendOtp = async () => {
    setLoading(true);
    setError("");
    
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // MODE DÉVELOPPEMENT : Simuler l'envoi SMS pour tous les numéros
      if (import.meta.env.DEV) {
        // Simuler un délai d'envoi réaliste
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Créer un objet de confirmation simulé
        const mockConfirmationResult = {
          confirm: async (code) => {
            // Convertir en string et comparer
            const codeStr = String(code).trim();
            
            if (codeStr === "123456") {
              return {
                user: {
                  uid: "dev-test-user-" + Date.now(),
                  phoneNumber: formattedPhone
                }
              };
            } else {
              throw new Error("Code invalide");
            }
          }
        };
        
        setConfirmationResult(mockConfirmationResult);
        setLoading(false);
        return;
      }
      
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmationResult);
      setLoading(false);
      
    } catch (error) {
      setLoading(false);
      
      // Messages d'erreur spécifiques
      let errorMessage = "Erreur lors de l'envoi du SMS.";
      
      if (error.code === 'auth/billing-not-enabled') {
        errorMessage = "L'authentification SMS n'est pas activée. Activez le plan Blaze dans Firebase Console.";
      } else if (error.code === 'auth/invalid-phone-number') {
        errorMessage = "Numéro de téléphone invalide. Vérifiez le format.";
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = "Quota SMS dépassé. Réessayez plus tard.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Trop de tentatives. Attendez quelques minutes.";
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = "Région non activée. Activez le plan Blaze pour cette région.";
      }
      
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const verifyOtp = async () => {
    if (!confirmationResult || !otp) {
      return;
    }
    
    setVerifying(true);
    setError("");

    try {
      const result = await confirmationResult.confirm(otp);
      setVerifying(false);
      if (onSuccess) {
        onSuccess(result.user);
      }
    } catch (error) {
      setVerifying(false);
      setError("Code invalide. Veuillez réessayer.");
      if (onError) {
        onError("Code invalide. Veuillez réessayer.");
      }
    }
  };

  // Envoyer automatiquement le SMS au montage du composant
  useEffect(() => {
    if (phoneNumber) {
      sendOtp();
    }

    // Cleanup du recaptcha au démontage
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, [phoneNumber]);

  return (
    <div className="flex flex-col gap-2.5">
      <div id="recaptcha-container"></div>
      
      <div>
        <BigTitle title="Vérification SMS" primary />
        <p className='text-white font-medium mb-5'>
          {loading 
            ? "Envoi du code en cours..." 
            : confirmationResult 
              ? `Code envoyé au ${formatPhoneNumber(phoneNumber)}`
              : "Préparation de l'envoi..."
          }
        </p>

        {import.meta.env.DEV && confirmationResult && (
          <div className='bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4'>
            <p className='text-green-300 text-sm font-medium mb-2'>
              🧪 Mode Test Activé
            </p>
            <p className='text-white text-lg font-bold text-center'>
              Code de vérification : <span className='text-green-400'>123456</span>
            </p>
            <p className='text-green-200 text-xs mt-2 text-center'>
              Entrez ce code ci-dessous pour continuer
            </p>
          </div>
        )}

        {error && (
          <p className='text-red-500 font-medium mb-3 text-center'>{error}</p>
        )}

        {confirmationResult && (
          <div className="flex flex-col gap-2.5">
            <Inputs
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Entrez le code à 6 chiffres"
              maxLength="6"
            />
            <Buttons 
              secondary 
              onClick={verifyOtp} 
              title={verifying ? "Vérification..." : "Vérifier le code"}
              disabled={verifying || !otp || otp.length !== 6}
            />
          </div>
        )}

        {!confirmationResult && !loading && (
          <Buttons 
            secondary 
            onClick={sendOtp} 
            title="Renvoyer le code"
          />
        )}
      </div>
    </div>
  );
}
