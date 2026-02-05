// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// ⚠️ REMPLACEZ PAR VOS INFOS FIREBASE (Console Firebase > Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyAoxKR0Wf5juMXsIvS-3I_34bThx28hvkQ",
  authDomain: "imperium-os.firebaseapp.com",
  projectId: "imperium-os",
  storageBucket: "imperium-os.firebasestorage.app",
  messagingSenderId: "519531425912",
  appId: "1:519531425912:web:8955432ac7e35c71417d8d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Connexion Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Erreur Login:", error);
    throw error;
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Erreur Logout:", error);
  }
};

// Sauvegarder l'Empire
export const saveEmpireToCloud = async (userId, data) => {
  if (!userId) return;
  try {
    // On sauvegarde avec la date de mise à jour
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
    return null;
  } catch (e) {
    console.error("Erreur Load:", e);
    return null;
  }
};