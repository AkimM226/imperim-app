// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// 👇 COLLEZ ICI VOS NOUVELLES CLES (Celles copiées à l'Etape 2) 👇
const firebaseConfig = {
    apiKey: "AIzaSyAbbeWcWLPdwuuEmOrFDB1gfLewmdfh4f8",
    authDomain: "imperium-reborn.firebaseapp.com",
    projectId: "imperium-reborn",
    storageBucket: "imperium-reborn.firebasestorage.app",
    messagingSenderId: "707185287389",
    appId: "1:707185287389:web:cb5be8953576b35a3ffb34"
};
// 👆 ----------------------------------------------------------- 👆
// ... le début du fichier ...

console.log("--- DEBUG FIREBASE ---");
console.log("Projet ID:", firebaseConfig.projectId);
console.log("API Key:", firebaseConfig.apiKey);
console.log("----------------------");

// Initialisation
const app = initializeApp(firebaseConfig);

// Export des outils
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
    // Permet de voir l'erreur exacte à l'écran
    alert("Erreur de connexion : " + error.code + " - " + error.message);
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
    // Merge: true permet de ne mettre à jour que ce qui change
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