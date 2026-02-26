// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { initializeFirestore, doc, setDoc, getDoc, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";
// 👇 COLLEZ VOTRE CONFIGURATION IMPERIUM-V2 ICI 👇
const firebaseConfig = {
  apiKey: "AIzaSyC_gXxWHFBnIl6z2U26cNp0gzgY5DkiRcs",
  authDomain: "imperium-v2-a2ba1.firebaseapp.com",
  projectId: "imperium-v2-a2ba1",
  storageBucket: "imperium-v2-a2ba1.firebasestorage.app",
  messagingSenderId: "688896103671",
  appId: "1:688896103671:web:7a80ae9168765891d56ff2"
};

// 1. Initialisation de l'App
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

// 2. Initialisation de l'Auth
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 3. Initialisation de la Database (Avec correctif WebContainer)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true, // Vital pour StackBlitz/Replit
});

// --- LES FONCTIONS MANQUANTES (Celles que App.jsx réclame) ---

// Connexion Google
export const loginWithGoogle = async () => {
  try {
    auth.languageCode = 'fr';
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Erreur Login:", error);
    alert("Erreur: " + error.message);
    throw error;
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    console.error("Erreur Logout:", error);
  }
};

// Sauvegarder l'Empire
export const saveEmpireToCloud = async (userId, data) => {
  if (!userId) return;
  try {
    await setDoc(doc(db, "empires", userId), {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    console.log("☁️ Empire Sauvegardé");
  } catch (e) {
    console.error("Erreur Save:", e);
  }
};

// Charger l'Empire
export const loadEmpireFromCloud = async (userId) => {
  if (!userId) return null;
  try {
    const docRef = doc(db, "empires", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null; // Retourne null si pas de sauvegarde (nouvel utilisateur)
  } catch (e) {
    console.error("Erreur Load:", e);
    return null;
  }
};