import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://misterall.tech';
// Use Resend test email in development, custom domain in production
const FROM_EMAIL = 'MisterAll <noreply@service.misterall.tech>';

/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Base email template
 */
const getEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; width: 100%; border-collapse: collapse;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="https://misterall.tech/logo.svg" alt="MisterAll" style="height: 50px;">
            </td>
          </tr>

          <!-- Content Card -->
          <tr>
            <td style="background-color: #1a1a1a; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,92,0.2);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 30px; text-align: center;">
              <p style="color: #666666; font-size: 12px; margin: 0;">
                MisterAll - L'outil qui te permet de revolutionner ta facon d'apprendre avec l'IA
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

/**
 * Code display component for emails
 */
const getCodeDisplay = (code) => `
<div style="background-color: #0a0a0a; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
  <p style="color: #666666; font-size: 12px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 2px;">
    Ton code de verification
  </p>
  <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #FFFF5C; font-family: 'Courier New', monospace;">
    ${code}
  </div>
</div>
`;

/**
 * Send verification email to new user with 6-digit code
 * @param {string} email - User's email
 * @param {string} code - 6-digit verification code
 * @param {string} firstname - User's first name
 */
export const sendVerificationEmail = async (email, code, firstname) => {
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
      Salut ${firstname} !
    </h1>

    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 8px 0; text-align: center;">
      Bienvenue sur MisterAll !
    </p>
    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
      Utilise ce code pour confirmer ton adresse email :
    </p>

    ${getCodeDisplay(code)}

    <p style="color: #666666; font-size: 14px; margin: 0; text-align: center;">
      Ce code expire dans <strong style="color: #a0a0a0;">15 minutes</strong>.
    </p>

    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">

    <p style="color: #666666; font-size: 12px; margin: 0; text-align: center;">
      Si tu n'as pas cree de compte sur MisterAll, ignore cet email.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `${code} - Code de verification MisterAll`,
      html: getEmailTemplate(content),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset email with 6-digit code
 * @param {string} email - User's email
 * @param {string} code - 6-digit reset code
 * @param {string} firstname - User's first name
 */
export const sendPasswordResetEmail = async (email, code, firstname) => {
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 16px 0; text-align: center;">
      Reinitialisation du mot de passe
    </h1>

    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0; text-align: center;">
      Salut ${firstname}, utilise ce code pour reinitialiser ton mot de passe :
    </p>

    ${getCodeDisplay(code)}

    <p style="color: #666666; font-size: 14px; margin: 0; text-align: center;">
      Ce code expire dans <strong style="color: #a0a0a0;">15 minutes</strong>.
    </p>

    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">

    <p style="color: #666666; font-size: 12px; margin: 0; text-align: center;">
      Si tu n'as pas demande cette reinitialisation, ignore cet email.<br>
      Ton mot de passe restera inchange.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `${code} - Reinitialisation mot de passe MisterAll`,
      html: getEmailTemplate(content),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email after verification
 * @param {string} email - User's email
 * @param {string} firstname - User's first name
 */
export const sendWelcomeEmail = async (email, firstname) => {
  const content = `
    <h1 style="color: #ffffff; font-size: 24px; margin: 0 0 20px 0; text-align: center;">
      Bienvenue ${firstname} !
    </h1>

    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0; text-align: center;">
      Ton compte est maintenant actif. Tu es pret a revolutionner ta facon d'apprendre avec l'IA !
    </p>

    <div style="background-color: rgba(255,255,92,0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="color: #FFFF5C; font-size: 14px; margin: 0 0 12px 0; font-weight: bold;">
        Commence maintenant :
      </p>
      <ul style="color: #a0a0a0; font-size: 14px; margin: 0; padding-left: 20px;">
        <li style="margin-bottom: 8px;">Ajoute ton premier cours (PDF ou DOCX)</li>
        <li style="margin-bottom: 8px;">L'IA genere automatiquement des fiches de revision</li>
        <li>Teste tes connaissances avec les quiz</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center">
          <a href="${FRONTEND_URL}/home"
             style="display: inline-block; background-color: #FFFF5C; color: #0a0a0a; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
            Commencer a apprendre
          </a>
        </td>
      </tr>
    </table>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: 'Bienvenue sur MisterAll !',
      html: getEmailTemplate(content),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send welcome email with 50% offer for new users (at signup, before verification)
 * @param {string} email - User's email
 * @param {string} firstname - User's first name
 */
export const sendWelcomeWithOfferEmail = async (email, firstname) => {
  const content = `
    <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; text-align: center;">
      Bienvenue ${firstname} !
    </h1>
    <p style="color: #FFFF5C; font-size: 16px; margin: 0 0 24px 0; text-align: center; font-weight: bold;">
      Ton compte MisterAll a ete cree avec succes
    </p>

    <p style="color: #a0a0a0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
      Tu es pret a revolutionner ta facon d'apprendre avec l'IA ! Ajoute tes cours et laisse MisterAll creer des fiches de revision et des quiz personnalises pour toi.
    </p>

    <!-- Offre speciale -->
    <div style="background: linear-gradient(135deg, rgba(255,255,92,0.15) 0%, rgba(255,255,92,0.05) 100%); border: 2px solid #FFFF5C; border-radius: 16px; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="color: #FFFF5C; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">
        Offre de bienvenue exclusive
      </p>
      <p style="color: #ffffff; font-size: 36px; margin: 0 0 8px 0; font-weight: bold;">
        -50%
      </p>
      <p style="color: #ffffff; font-size: 18px; margin: 0 0 16px 0;">
        sur ton premier mois Premium
      </p>

      <div style="background-color: rgba(0,0,0,0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="color: #FFFF5C; font-size: 14px; margin: 0 0 12px 0; font-weight: bold;">
          Avantages Premium :
        </p>
        <table style="width: 100%; color: #a0a0a0; font-size: 14px;">
          <tr>
            <td style="padding: 4px 0;">&#10003; 20 cours par mois (au lieu de 2)</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">&#10003; Acces a la bibliotheque complete</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">&#10003; Chat IA illimite avec tes cours</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">&#10003; Flashcards intelligentes</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;">&#10003; Streak freezes pour garder ta serie</td>
          </tr>
        </table>
      </div>

      <a href="${FRONTEND_URL}/get-premium?offer=welcome50"
         style="display: inline-block; background-color: #FFFF5C; color: #0a0a0a; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: bold; font-size: 16px;">
        Profiter de l'offre -50%
      </a>

      <p style="color: #666666; font-size: 12px; margin: 16px 0 0 0;">
        Offre valable 7 jours
      </p>
    </div>

    <!-- CTA secondaire -->
    <p style="color: #a0a0a0; font-size: 14px; margin: 24px 0 16px 0; text-align: center;">
      Ou commence gratuitement avec 2 cours par mois :
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center">
          <a href="${FRONTEND_URL}/home"
             style="display: inline-block; background-color: transparent; color: #FFFF5C; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: bold; font-size: 14px; border: 2px solid #FFFF5C;">
            Commencer gratuitement
          </a>
        </td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;">

    <p style="color: #666666; font-size: 12px; margin: 0; text-align: center;">
      Tu recevras bientot des conseils pour tirer le meilleur parti de MisterAll.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: `${firstname}, ton compte MisterAll est pret ! + Offre -50%`,
      html: getEmailTemplate(content),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error.message };
  }
};

export default {
  generateVerificationCode,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendWelcomeWithOfferEmail,
};
