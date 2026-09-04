// api/jarvis.js
import admin from 'firebase-admin';

// 1. INITIALISATION FIREBASE ADMIN (POUR LE QUOTA QUOTIDIEN)
if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          : undefined,
      }),
    });
  }
}

const DAILY_LIMIT = 15;

// Liste ordonnée de modèles de secours (Cascade anti-surcharge)
const FALLBACK_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest'
];

export default async function handler(req, res) {
  // Autoriser uniquement les requêtes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { prompt, contents, userId } = body;

    if (!prompt && (!contents || !Array.isArray(contents) || contents.length === 0)) {
      return res.status(400).json({ error: 'Données de requête invalides (prompt ou contents requis).' });
    }

    // 2. CHANTIER 3 — QUOTA QUOTIDIEN ANTI-ABUS (15 requêtes/jour par utilisateur)
    if (admin.apps.length) {
      try {
        const rawUserId = String(userId || 'anonymous').trim();
        const sanitizedUserId = rawUserId.replace(/[/\\?%*:|"<>]/g, '_');
        const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
        const docId = `${sanitizedUserId}_${today}`;

        const db = admin.firestore();
        const usageRef = db.collection('usage').doc(docId);
        const usageSnap = await usageRef.get();

        const currentCount = usageSnap.exists ? (usageSnap.data()?.count || 0) : 0;

        if (currentCount >= DAILY_LIMIT) {
          return res.status(429).json({
            error: `Quota quotidien dépassé (${DAILY_LIMIT}/${DAILY_LIMIT} requêtes). Le QG a suspendu les communications jusqu'à demain.`
          });
        }

        // Incrémenter le compteur atomiquement
        await usageRef.set({
          userId: sanitizedUserId,
          date: today,
          count: admin.firestore.FieldValue.increment(1),
          lastRequestAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

      } catch (quotaError) {
        console.error('Erreur lors du suivi du quota Firestore :', quotaError);
      }
    }

    // 3. CHANTIER 1 — APPEL SÉCURISÉ AVEC CASCADE DE MODÈLES ANTI-OVERLOAD
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY manquante dans l\'environnement serveur');
      return res.status(500).json({ error: 'Configuration serveur incomplète (GEMINI_API_KEY manquante sur Vercel).' });
    }

    const geminiPayload = contents && Array.isArray(contents)
      ? { contents }
      : { contents: [{ parts: [{ text: prompt }] }] };

    let lastErrorData = null;
    let lastStatus = 500;

    // Tentative en cascade sur chaque modèle disponible
    for (const model of FALLBACK_MODELS) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload)
        });

        const data = await geminiResponse.json();

        // Si le modèle a réussi, on renvoie immédiatement le résultat
        if (geminiResponse.ok && data.candidates && data.candidates.length > 0) {
          return res.status(200).json(data);
        }

        // En cas d'erreur de surcharge (503 / 429 / high demand), on passe au modèle suivant
        const errorMsg = data?.error?.message || '';
        const isOverloaded = geminiResponse.status === 503 ||
          geminiResponse.status === 429 ||
          errorMsg.toLowerCase().includes('high demand') ||
          errorMsg.toLowerCase().includes('overloaded') ||
          errorMsg.toLowerCase().includes('resource_exhausted') ||
          errorMsg.toLowerCase().includes('unavailable');

        if (isOverloaded) {
          console.warn(`Modèle ${model} saturé (${geminiResponse.status}: ${errorMsg}), bascule sur le modèle suivant...`);
          lastErrorData = data;
          lastStatus = geminiResponse.status;
          continue;
        }

        // Si c'est une autre erreur (ex: clé invalide 400/403), on la renvoie directement
        return res.status(geminiResponse.status).json(data);

      } catch (reqError) {
        console.warn(`Échec de requête sur ${model}:`, reqError.message);
        lastErrorData = { error: { message: reqError.message } };
      }
    }

    // Si tous les modèles ont échoué
    return res.status(lastStatus).json(lastErrorData || { error: { message: 'Tous les modèles Gemini sont actuellement indisponibles. Réessayez dans un instant.' } });

  } catch (error) {
    console.error('Erreur proxy Gemini /api/jarvis :', error);
    return res.status(500).json({ error: error.message || 'Erreur interne lors du traitement IA.' });
  }
}
