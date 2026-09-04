// api/verify-access.js

const DEFAULT_ACCESS_CODES = [
  "IMP-ALPHA-77",
  "IMP-BRAVO-88",
  "IMP-CHARLIE-99",
  "IMP-DELET-10",
  "IMP-ECHO-20",
  "IMP-FOXTROT-30",
  "IMP-GOLF-40",
  "IMP-HOTEL-50",
  "IMP-INDIA-60",
  "IMP-JULIETT-70",
  "IMPERATOR-X"
];

export default async function handler(req, res) {
  // Autoriser uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const inputCode = String(body.code || '').trim().toUpperCase();

    if (!inputCode) {
      return res.status(400).json({ valid: false, error: 'Code d\'accès manquant.' });
    }

    // Récupération des codes autorisés depuis la variable d'environnement
    let validCodes = DEFAULT_ACCESS_CODES;
    if (process.env.VALID_ACCESS_CODES) {
      validCodes = process.env.VALID_ACCESS_CODES
        .split(',')
        .map(code => code.trim().toUpperCase())
        .filter(Boolean);
    }

    const isValid = validCodes.includes(inputCode);

    return res.status(200).json({ valid: isValid });
  } catch (error) {
    console.error('Erreur lors de la vérification du code d\'accès :', error);
    return res.status(500).json({ valid: false, error: 'Erreur interne du serveur.' });
  }
}
