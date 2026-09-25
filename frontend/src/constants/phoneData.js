// Indicatifs telephoniques des pays africains
// allowsLeadingZero: true si le pays utilise un 0 au debut du numero local
export const AFRICAN_COUNTRIES = [
  { code: "+225", country: "Cote d'Ivoire", flag: "🇨🇮", format: "0X XX XX XX XX", length: 10, allowsLeadingZero: true },
  { code: "+229", country: "Benin", flag: "🇧🇯", format: "XX XX XX XX", length: 8 },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫", format: "XX XX XX XX", length: 8 },
  { code: "+237", country: "Cameroun", flag: "🇨🇲", format: "6X XX XX XX XX", length: 9 },
  { code: "+221", country: "Senegal", flag: "🇸🇳", format: "7X XXX XX XX", length: 9 },
  { code: "+223", country: "Mali", flag: "🇲🇱", format: "XX XX XX XX", length: 8 },
  { code: "+224", country: "Guinee", flag: "🇬🇳", format: "6XX XX XX XX", length: 9 },
  { code: "+228", country: "Togo", flag: "🇹🇬", format: "9X XX XX XX", length: 8 },
  { code: "+227", country: "Niger", flag: "🇳🇪", format: "XX XX XX XX", length: 8 },
  { code: "+241", country: "Gabon", flag: "🇬🇦", format: "X XX XX XX", length: 7 },
  { code: "+242", country: "Congo-Brazzaville", flag: "🇨🇬", format: "XX XXX XXXX", length: 9 },
  { code: "+243", country: "RD Congo", flag: "🇨🇩", format: "XXX XXX XXX", length: 9 },
  { code: "+212", country: "Maroc", flag: "🇲🇦", format: "0X XX XX XX XX", length: 10, allowsLeadingZero: true },
  { code: "+213", country: "Algerie", flag: "🇩🇿", format: "0XXX XX XX XX", length: 10, allowsLeadingZero: true },
  { code: "+216", country: "Tunisie", flag: "🇹🇳", format: "XX XXX XXX", length: 8 },
  { code: "+20", country: "Egypte", flag: "🇪🇬", format: "0XX XXXX XXXX", length: 11, allowsLeadingZero: true },
  { code: "+234", country: "Nigeria", flag: "🇳🇬", format: "0XXX XXX XXXX", length: 11, allowsLeadingZero: true },
  { code: "+233", country: "Ghana", flag: "🇬🇭", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+254", country: "Kenya", flag: "🇰🇪", format: "0XXX XXX XXX", length: 10, allowsLeadingZero: true },
  { code: "+27", country: "Afrique du Sud", flag: "🇿🇦", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+250", country: "Rwanda", flag: "🇷🇼", format: "07XX XXX XXX", length: 10, allowsLeadingZero: true },
  { code: "+256", country: "Ouganda", flag: "🇺🇬", format: "0XXX XXX XXX", length: 10, allowsLeadingZero: true },
  { code: "+255", country: "Tanzanie", flag: "🇹🇿", format: "0XXX XXX XXX", length: 10, allowsLeadingZero: true },
  { code: "+251", country: "Ethiopie", flag: "🇪🇹", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+244", country: "Angola", flag: "🇦🇴", format: "9XX XXX XXX", length: 9 },
  { code: "+258", country: "Mozambique", flag: "🇲🇿", format: "8X XXX XXXX", length: 9 },
  { code: "+260", country: "Zambie", flag: "🇿🇲", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+230", country: "Maurice", flag: "🇲🇺", format: "5XXX XXXX", length: 8 },
  { code: "+261", country: "Madagascar", flag: "🇲🇬", format: "03X XX XXX XX", length: 10, allowsLeadingZero: true },
  { code: "+222", country: "Mauritanie", flag: "🇲🇷", format: "XX XX XX XX", length: 8 },
  { code: "+232", country: "Sierra Leone", flag: "🇸🇱", format: "XX XXX XXX", length: 8 },
  { code: "+231", country: "Liberia", flag: "🇱🇷", format: "XX XXX XXXX", length: 9 },
  { code: "+245", country: "Guinee-Bissau", flag: "🇬🇼", format: "XXX XXXX", length: 7 },
  { code: "+238", country: "Cap-Vert", flag: "🇨🇻", format: "XXX XXXX", length: 7 },
  { code: "+220", country: "Gambie", flag: "🇬🇲", format: "XXX XXXX", length: 7 },
  { code: "+240", country: "Guinee Equatoriale", flag: "🇬🇶", format: "XXX XXX XXX", length: 9 },
  { code: "+239", country: "Sao Tome-et-Principe", flag: "🇸🇹", format: "XXX XXXX", length: 7 },
  { code: "+235", country: "Tchad", flag: "🇹🇩", format: "XX XX XX XX", length: 8 },
  { code: "+236", country: "Centrafrique", flag: "🇨🇫", format: "XX XX XX XX", length: 8 },
  { code: "+249", country: "Soudan", flag: "🇸🇩", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+211", country: "Soudan du Sud", flag: "🇸🇸", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+252", country: "Somalie", flag: "🇸🇴", format: "XX XXX XXX", length: 8 },
  { code: "+253", country: "Djibouti", flag: "🇩🇯", format: "XX XX XX XX", length: 8 },
  { code: "+291", country: "Erythree", flag: "🇪🇷", format: "X XXX XXX", length: 7 },
  { code: "+257", country: "Burundi", flag: "🇧🇮", format: "XX XX XXXX", length: 8 },
  { code: "+265", country: "Malawi", flag: "🇲🇼", format: "0X XXXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+266", country: "Lesotho", flag: "🇱🇸", format: "XXXX XXXX", length: 8 },
  { code: "+267", country: "Botswana", flag: "🇧🇼", format: "7X XXX XXX", length: 8 },
  { code: "+268", country: "Eswatini", flag: "🇸🇿", format: "7XXX XXXX", length: 8 },
  { code: "+264", country: "Namibie", flag: "🇳🇦", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
  { code: "+269", country: "Comores", flag: "🇰🇲", format: "XXX XXXX", length: 7 },
  { code: "+262", country: "Mayotte/Reunion", flag: "🇾🇹", format: "0XXX XX XX XX", length: 10, allowsLeadingZero: true },
  { code: "+248", country: "Seychelles", flag: "🇸🇨", format: "X XX XX XX", length: 7 },
  { code: "+218", country: "Libye", flag: "🇱🇾", format: "0XX XXX XXXX", length: 10, allowsLeadingZero: true },
];

// Indicatif par defaut (Cote d'Ivoire)
export const DEFAULT_COUNTRY_CODE = "+225";

// Helper: Trouver un pays par son code
export const getCountryByCode = (code) => {
  return AFRICAN_COUNTRIES.find(c => c.code === code);
};

// Helper: Valider un numero de telephone
export const validatePhoneNumber = (phoneNumber, countryCode) => {
  // Nettoyer le numero (enlever espaces, tirets, parentheses)
  const cleanNumber = phoneNumber.replace(/[\s\-\(\)\.]/g, '');

  // Verifier que ce sont uniquement des chiffres
  if (!/^\d+$/.test(cleanNumber)) {
    return { valid: false, error: "Le numero ne doit contenir que des chiffres" };
  }

  // Trouver le pays
  const country = getCountryByCode(countryCode);
  if (!country) {
    return { valid: false, error: "Indicatif pays non reconnu" };
  }

  // Verifier la longueur
  if (cleanNumber.length !== country.length) {
    return {
      valid: false,
      error: `Le numero doit contenir ${country.length} chiffres pour ${country.country}`
    };
  }

  // Verifier que le numero ne commence pas par 0 (sauf pays qui l'autorisent)
  const allowsZero = country.allowsLeadingZero === true;
  if (cleanNumber.startsWith('0') && !allowsZero) {
    return { valid: false, error: "Le numero ne doit pas commencer par 0" };
  }

  // Verifier les numeros "betes" (repetitions excessives)
  if (/^(\d)\1{6,}$/.test(cleanNumber)) {
    return { valid: false, error: "Ce numero ne semble pas valide" };
  }

  // Verifier les sequences (123456789, 987654321)
  const sequences = ['0123456789', '9876543210', '1234567890'];
  for (const seq of sequences) {
    if (seq.includes(cleanNumber) && cleanNumber.length >= 6) {
      return { valid: false, error: "Ce numero ne semble pas valide" };
    }
  }

  // Verifier que ce n'est pas un numero avec trop de repetitions
  const digitCounts = {};
  for (const digit of cleanNumber) {
    digitCounts[digit] = (digitCounts[digit] || 0) + 1;
  }
  const maxRepeat = Math.max(...Object.values(digitCounts));
  if (maxRepeat > cleanNumber.length * 0.7) {
    return { valid: false, error: "Ce numero ne semble pas valide" };
  }

  return { valid: true, cleanNumber };
};

// Helper: Formater un numero pour l'affichage
export const formatPhoneDisplay = (phoneNumber, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) return phoneNumber;

  const clean = phoneNumber.replace(/[\s\-\(\)\.]/g, '');
  return `${countryCode} ${clean}`;
};
