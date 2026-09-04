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
        // Sécuriser l'ID pour le nom de document Firestore
        const sanitizedUserId = rawUserId.replace(/[/\\?%*:|"<>]/g, '_');
        const today = new Date().toISOString().slice(0, 10); // Format: "YYYY-MM-DD"
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
        // On continue si Firestore admin a un problème temporaire, pour ne pas bloquer l'utilisateur légitime
      }
    }

    // 3. CHANTIER 1 — APPEL SÉCURISÉ À GEMINI AVEC CLÉ SERVEUR
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY manquante dans l\'environnement serveur');
      return res.status(500).json({ error: 'Configuration serveur incomplète (GEMINI_API_KEY manquante).' });
    }

    const geminiPayload = contents && Array.isArray(contents)
      ? { contents }
      : { contents: [{ parts: [{ text: prompt }] }] };

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    const data = await geminiResponse.json();

    return res.status(geminiResponse.status).json(data);

  } catch (error) {
    console.error('Erreur proxy Gemini /api/jarvis :', error);
    return res.status(500).json({ error: error.message || 'Erreur interne lors du traitement IA.' });
  }
}
