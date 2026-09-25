import axios from 'axios';
import crypto from 'crypto';
import UserModel from '../models/userModel.js';

const MONEROO_API = process.env.MONEROO_API_URL || 'https://api.moneroo.io/v1';
const MONEROO_SECRET = process.env.MONEROO_SECRET_KEY;

const FRONTEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://www.misterall.tech'
    : 'http://localhost:5173';

// Initialiser un paiement
export const initializePayment = async (req, res) => {
  try {
    const user = req.user;
    const { amount } = req.body; // 1000 ou 2000 selon l'offre (envoye par le frontend)

    const response = await axios.post(
      `${MONEROO_API}/payments/initialize`,
      {
        amount: amount || 2000, // Prix dynamique (1000 FCFA offre / 2000 FCFA normal)
        currency: 'XOF',
        description: 'MisterAll Premium - 1 mois',
        return_url: `${FRONTEND_URL}/payment/callback`,
        customer: {
          email: user.email || `${user._id}@misterall.tech`,
          first_name: user.firstname || 'User',
          last_name: user.lastname || user.email?.split('@')[0] || 'MisterAll'
        },
        metadata: {
          user_id: user._id.toString(),
          plan: 'premium_monthly'
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${MONEROO_SECRET}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      checkout_url: response.data.data.checkout_url,
      payment_id: response.data.data.id
    });
  } catch (error) {
    console.error('Moneroo init error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

// Verifier un paiement
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const response = await axios.get(
      `${MONEROO_API}/payments/${paymentId}/verify`,
      {
        headers: {
          'Authorization': `Bearer ${MONEROO_SECRET}`,
          'Accept': 'application/json'
        }
      }
    );

    const payment = response.data.data;

    if (payment.status === 'success') {
      const userId = payment.metadata?.user_id;

      if (!userId) {
        return res.status(400).json({ success: false, error: 'User ID missing in metadata' });
      }

      // Activer le premium
      const premiumExpiry = new Date();
      premiumExpiry.setMonth(premiumExpiry.getMonth() + 1);

      await UserModel.findByIdAndUpdate(userId, {
        premium: true,
        premiumExpiry,
        'moneroo.lastPaymentId': paymentId,
        'moneroo.lastPaymentDate': new Date()
      });

      const user = await UserModel.findById(userId);

      res.json({
        success: true,
        premium: true,
        premiumExpiry: user.premiumExpiry,
        amount: payment.amount
      });
    } else {
      res.json({ success: false, status: payment.status });
    }
  } catch (error) {
    console.error('Moneroo verify error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.message || error.message
    });
  }
};

// Webhook Handler
export const handleWebhook = async (req, res) => {
  try {
    // Verifier la signature (optionnel mais recommande)
    const signature = req.headers['x-moneroo-signature'];
    const secret = process.env.MONEROO_WEBHOOK_SECRET;

    if (secret && signature) {
      const hash = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== signature) {
        console.error('Moneroo webhook: Invalid signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const { event, data } = req.body;

    console.log(`[Moneroo Webhook] Event: ${event}`);

    if (event === 'payment.success') {
      const userId = data.metadata?.user_id;

      if (userId) {
        const premiumExpiry = new Date();
        premiumExpiry.setMonth(premiumExpiry.getMonth() + 1);

        await UserModel.findByIdAndUpdate(userId, {
          premium: true,
          premiumExpiry,
          'moneroo.lastPaymentId': data.id,
          'moneroo.lastPaymentDate': new Date()
        });

        console.log(`[Moneroo Webhook] Premium active pour user ${userId}`);
      }
    }

    // Toujours retourner 200 pour confirmer la reception
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Moneroo webhook error:', error);
    // Toujours retourner 200 pour eviter les retentatives
    res.status(200).json({ received: true });
  }
};
