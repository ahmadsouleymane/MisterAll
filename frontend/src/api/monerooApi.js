const API = import.meta.env.VITE_API_URL + '/moneroo';

// Initialiser un paiement Moneroo
export const initializeMonerooPayment = async (amount) => {
    try {
        const response = await fetch(API + '/initialize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ amount })
        });
        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.error || 'Erreur lors de l\'initialisation du paiement' };
        }

        return {
            success: true,
            checkout_url: data.checkout_url,
            payment_id: data.payment_id
        };
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' };
    }
};

// Verifier un paiement apres callback
export const verifyMonerooPayment = async (paymentId) => {
    try {
        const response = await fetch(API + `/verify/${paymentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();

        if (!response.ok) {
            return { error: true, message: data.error || 'Erreur lors de la verification' };
        }

        return {
            success: true,
            premium: data.premium,
            premiumExpiry: data.premiumExpiry,
            amount: data.amount
        };
    } catch (error) {
        return { error: true, message: 'Erreur de connexion au serveur' };
    }
};
