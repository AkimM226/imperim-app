import React, { useState, useEffect, useRef } from 'react';
import { 
    // Outils de base (Doublons supprimés)
    ArrowLeft, Wallet, Shield, Target, Award, Zap, 
    TrendingUp, Menu, X, Plus, Trash2, CheckCircle, 
    AlertTriangle, Lock, Clock, History, Radio, 
    MessageSquare, Send, ChevronRight, Calculator,
    Bell, UserCircle,
    
    // Outils avancés & Arsenal
    Sword, Loader2, Globe, PiggyBank, Skull, Flame, 
    Star, Smartphone, Settings, LogOut,
    
    // Icônes additionnelles
    CheckSquare, Square, CheckCircle2, BookOpen, Scroll, 
    Trophy, BarChart3, Activity, TrendingDown, Lightbulb, 
    PieChart, UserMinus, UserPlus, CalendarClock, Briefcase, 
    Infinity, Unlock, Key, Fingerprint, FileText, Info, 
    Search, RefreshCw, Download, Upload, Copy, Castle
  } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
// Remplacez : import { auth, saveEmpireToCloud, loadEmpireFromCloud } from './firebase';
// PAR CECI :
import { auth, saveEmpireToCloud, loadEmpireFromCloud, loginWithGoogle, logoutUser } from './firebase';
import { onAuthStateChanged } from "firebase/auth";

// ==========================================
// MOTEUR SONORE TACTIQUE (MODE SILENCE RADIO)
// ==========================================
let audioContext = null;

const playSound = (type) => {
    // 🛑 FILTRE ABSOLU : Si ce n'est pas la radio, on ne fait rien.
    if (type !== 'radio') return;

    try {
        // Initialisation (seulement si c'est la radio)
        if (!audioContext) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            audioContext = new AudioContext();
        }

        // Réveil du moteur (pour iPhone/Chrome)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const ctx = audioContext;
        const now = ctx.currentTime;
        
        // GÉNÉRATEUR DE BRUIT BLANC (RADIO)
        if (type === 'radio') {
            const bufferSize = ctx.sampleRate * 0.5; // 0.5 secondes de static
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Création du grésillement aléatoire
            for (let i = 0; i < bufferSize; i++) { 
                data[i] = Math.random() * 2 - 1; 
            }
            
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.1, now); // Volume modéré
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Fondu de sortie
            
            noise.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
        }

    } catch (e) { console.error("Audio error", e); }
};

// ==========================================
// CONFIGURATION & DONNÉES
// ==========================================
const APP_VERSION = "17.1.0-Architect"; // Changement de version pour déclencher l'affichage

const RELEASE_NOTES = [
    {
        version: "17.1.0",
        title: "Opération Identité",
        desc: "L'Empire reconnaît désormais ses Commandantes et renforce ses communications.",
        changes: [
            { icon: UserCircle, text: "PROTOCOLE INCLUSION : Vous pouvez désormais définir votre titre (Commandant ou Commandante) dans les Réglages." },
            { icon: Bell, text: "SYSTÈME D'ALERTE : Activation des Notifications Tactiques. Recevez vos ordres directement sur votre appareil." },
            { icon: Zap, text: "STABILISATION DU NOYAU : Correction des conflits d'armement (Imports) et optimisation de la fluidité." }
        ]
    }
];

const TUTORIAL_STEPS = [
    { title: "BIENVENUE, COMMANDANT", text: "Imperium est votre poste de commandement. Ici, la discipline est votre seule arme.", icon: Shield },
    { title: "LE SOLDE VIRTUEL", text: "Le chiffre central est votre Cash réel. S'il est positif, vous survivez.", icon: PiggyBank },
    { title: "LA STRATÉGIE WAVE", text: "Wave est votre Bunker (Épargne). Ne touchez jamais à cet argent sans raison vitale.", icon: Smartphone },
    { title: "LES ORDRES", text: "Chaque matin, recevez 3 missions. Accomplissez-les pour renforcer votre discipline.", icon: Radio },
    { title: "LA CITADELLE", text: "Vérifiez votre temps de survie estimé si tous vos revenus s'arrêtent.", icon: Castle },
];

const VALID_HASHES = [
    "SU1QLUFMUEhBLTc3", "SU1QLUJSQVZPLTg4", "SU1QLUNIQVJMSUUtOTk=", "SU1QLURFTEVULTEw", 
    "SU1QLRUNITy0yMA==", "SU1QLUZPWFRST1QtMzA=", "SU1QLUdPTEYtNDA=", "SU1QLUhPVEVMLTUw", 
    "SU1QLUlORElBLTYw", "SU1QLUpVTElFVFQtNzA=", "SU1QRVJBVE9SLVg=" 
];

const DAILY_QUOTES = [
    { text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque" },
    { text: "La richesse consiste bien plus dans l'usage qu'on en fait que dans la possession.", author: "Aristote" },
    { text: "Ne dépensez pas votre argent avant de l'avoir gagné.", author: "Thomas Jefferson" },
    { text: "L'art de la guerre, c'est de soumettre l'ennemi sans combat.", author: "Sun Tzu" },
    { text: "La discipline est mère du succès.", author: "Eschyle" },
    { text: "Fais ce que tu dois, advienne que pourra.", author: "Devise Chevaleresque" },
    { text: "Si tu achètes des choses dont tu n'as pas besoin, tu devras bientôt vendre des choses dont tu as besoin.", author: "Warren Buffett" },
    { text: "Le prix est ce que vous payez. La valeur est ce que vous obtenez.", author: "Warren Buffett" },
    { text: "Un voyage de mille lieues commence toujours par un premier pas.", author: "Lao Tseu" },
    { text: "La pauvreté n'est pas le manque de biens, mais le désir insatiable d'en avoir plus.", author: "Sénèque" },
    { text: "Celui qui a le contrôle sur lui-même est plus puissant que celui qui contrôle une cité.", author: "Proverbe" },
    { text: "L'intérêt composé est la huitième merveille du monde.", author: "Einstein" }
];

const CURRENCIES = [
  { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (BCEAO)' }, 
  { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (BEAC)' }, 
  { code: 'EUR', symbol: '€', name: 'Euro' }, 
  { code: 'USD', symbol: '$', name: 'Dollar Américain' }, 
  { code: 'GNF', symbol: 'FG', name: 'Franc Guinéen' }, 
  { code: 'CDF', symbol: 'FC', name: 'Franc Congolais' }, 
  { code: 'MAD', symbol: 'DH', name: 'Dirham Marocain' },
  { code: 'CAD', symbol: '$', name: 'Dollar Canadien' }
];

const ZONES = [
  { id: 'west_africa', name: 'Afrique (Marché Local)', factor: 0.6 },
  { id: 'europe', name: 'Europe / Occident', factor: 1.0 },
  { id: 'remote', name: 'Afrique vers l\'International', factor: 1.0 },
  { id: 'maghreb', name: 'Maghreb', factor: 0.8 }
];

const FREQUENCIES = [
    { id: 'daily', label: 'Quotidien (Chaque jour)', factor: 30 },
    { id: 'weekly', label: 'Hebdomadaire (Semaine)', factor: 4.33 },
    { id: 'monthly', label: 'Mensuel (Mois)', factor: 1 },
    { id: 'yearly', label: 'Annuel (An)', factor: 0.083 }
];

const STRATEGIC_QUESTIONS = [
    { id: 'goal', q: "Quel est l'objectif financier précis de ce projet ?" },
    { id: 'obstacle', q: "Quel est le plus grand obstacle actuel ?" },
    { id: 'first_step', q: "Quelle est la toute première action (gratuite) à faire ?" }
];

const TROPHIES_DATA = [
    { id: 'savings_1', title: 'Première Pierre', desc: 'Avoir un solde positif.', icon: Shield, condition: (bal, str, projects) => bal > 0 },
    { id: 'streak_3', title: 'L\'Éveil', desc: '3 Jours de discipline sans futilités.', icon: Flame, condition: (bal, str, projects) => str >= 3 },
    { id: 'streak_7', title: 'Spartiate', desc: '7 Jours de discipline absolue.', icon: Sword, condition: (bal, str, projects) => str >= 7 },
    { id: 'task_1', title: 'Architecte', desc: 'Terminer une mission d\'un projet.', icon: CheckSquare, condition: (bal, str, projects) => projects.some(p => p.tasks && p.tasks.some(t => t.done)) },
    { id: 'rich_1', title: 'Trésorier', desc: 'Accumuler l\'équivalent de 1000€ (650k FCFA).', icon: Castle, condition: (bal, str, projects) => bal >= 650000 },
    { id: 'master', title: 'Empereur', desc: 'Accumuler 10 Millions.', icon: Star, condition: (bal, str, projects) => bal >= 10000000 },
];

const BUSINESS_IDEAS = {
  'default': { title: 'Freelance Standard', price: 50, task: 'Propose tes services sur les groupes Facebook ou ton entourage.' },
  'react': { title: 'Site Vitrine Commerçant', price: 250, task: 'Crée un site simple pour un maquis, un hôtel ou un artisan.' },
  'javascript': { title: 'Automatisation Excel', price: 100, task: 'Aide une PME à gérer ses stocks automatiquement.' },
  'design': { title: 'Identité Visuelle', price: 150, task: 'Refais le menu et le logo d\'un restaurant local.' },
  'infographie': { title: 'Pack Pub Réseaux Sociaux', price: 45, task: 'Crée 5 visuels pro pour le statut WhatsApp d\'un vendeur.' },
  'montage': { title: 'Vidéos TikTok/Reels', price: 40, task: 'Monte des vidéos dynamiques pour un influenceur local.' },
  'ia': { title: 'Formation ChatGPT', price: 80, task: 'Forme une petite équipe à utiliser l\'IA pour gagner du temps.' },
};

const KNOWLEDGE_BASE = [
    { id: 'k1', title: "La Règle 50/30/20", subtitle: "Logistique de Base", icon: PieChart, content: "Pour qu'un Empire tienne, les ressources doivent être divisées avec rigueur :\n\n• 50% NÉCESSITÉS (Survie) : Loyer, Manger, Électricité. C'est le socle.\n• 30% FUTILITÉS (Moral) : Plaisirs, Sorties. C'est pour garder le moral des troupes. Si vous coupez tout, vous craquerez.\n• 20% BUNKER (Épargne) : C'est votre assurance vie. Cet argent ne doit jamais être touché sauf en cas de guerre totale." },
    { id: 'k2', title: "L'Effet Boule de Neige", subtitle: "Intérêts Composés", icon: TrendingUp, content: "L'argent doit travailler, pas dormir. C'est ce qu'on appelle 'l'Intérêt Composé'.\n\nImaginez que chaque pièce d'or recrute un soldat, et que ce soldat recrute à son tour.\nAu début, c'est lent. Mais après 10 ans, votre armée grandit toute seule.\n\nAction : Placez votre Bunker sur un compte qui rapporte (DAT, Assurance Vie, Crypto Stable, Bourse), ne le laissez pas sous le matelas." },
    { id: 'k3', title: "La Guerre des Prix", subtitle: "Négociation", icon: Sword, content: "Le prix affiché est une proposition, pas une loi. Un bon commandant ne paie jamais le prix fort sans combattre.\n\nTechnique du Silence : Annoncez votre prix. Si le vendeur refuse, taisez-vous et regardez-le dans les yeux. Le malaise le fera souvent baisser.\n\nChaque pièce économisée est une munition pour votre propre Empire." },
    { id: 'k4', title: "Le Fonds d'Urgence", subtitle: "Défense Absolue", icon: Shield, content: "Avant d'attaquer (investir), il faut savoir défendre.\n\nVotre priorité absolue est d'avoir 3 mois de survie dans votre Bunker (voir module Citadelle).\nPourquoi ? Parce que si vous perdez votre source de revenu et que vous n'avez pas de réserve, vous devrez accepter n'importe quel travail d'esclave pour survivre.\n\nL'épargne, c'est la liberté de dire 'NON'." },
    { id: 'k5', title: "Dette : L'Ennemi Intérieur", subtitle: "Gestion du Passif", icon: UserMinus, content: "Il y a deux types de dettes :\n\n1. La Dette Toxique : Emprunter pour du passif (téléphone, vêtements, fêtes). C'est se mettre les menottes soi-même.\n2. La Dette Stratégique : Emprunter pour investir (immobilier, commerce). C'est utiliser l'argent des autres pour s'enrichir.\n\nÉliminez toute dette toxique sans pitié avant de songer à l'expansion." }
];

const DAILY_MISSIONS_POOL = [
    { id: 'm1', text: "Silence Radio : Aucune dépense 'Futilité' aujourd'hui.", type: 'discipline' },
    { id: 'm2', text: "Ravitaillement : Verser un montant symbolique au Bunker.", type: 'savings' },
    { id: 'm3', text: "Inspection : Vérifier le registre des dettes.", type: 'admin' },
    { id: 'm4', text: "Renseignement : Lire une fiche de l'Académie.", type: 'learning' },
    { id: 'm5', text: "Négociation : Essayer de baisser un prix aujourd'hui.", type: 'action' },
    { id: 'm6', text: "Cartographie : Analyser la courbe de puissance (Stats).", type: 'admin' },
    { id: 'm7', text: "Privation : Boire de l'eau au lieu d'une boisson payante.", type: 'discipline' },
    { id: 'm8', text: "Stratégie : Mettre à jour l'avancement d'un Projet.", type: 'admin' }
];

const getRank = (balance, currency) => {
  let points = balance;
  if (currency.includes('FCFA')) points = balance / 650;
  else if (currency.includes('GNF')) points = balance / 9000;
  else if (currency.includes('CDF')) points = balance / 2500;
   
  if (points < 0) return { title: "RUINE", color: "text-red-600", icon: AlertTriangle };
  if (points < 50) return { title: "VAGABOND", color: "text-gray-500", icon: Fingerprint };
  if (points < 200) return { title: "MERCENAIRE", color: "text-blue-400", icon: Sword };
  if (points < 1000) return { title: "GOUVERNEUR", color: "text-purple-400", icon: Castle };
  return { title: "EMPEREUR", color: "text-gold", icon: Star };
};

const formatMoney = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return Math.floor(amount).toLocaleString('fr-FR');
};

const getDaysLeft = (targetDate) => {
    if (!targetDate) return null;
    const diff = new Date(targetDate) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
};

// ==========================================
// COMPOSANT GRAPHIQUE SVG
// ==========================================
const PowerChart = ({ data, color = "#D4AF37" }) => {
    if (!data || data.length < 2) return <div className="h-32 flex items-center justify-center text-gray-600 text-xs">Données insuffisantes</div>;
    const height = 100;
    const width = 300;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal || 1; 
    const points = data.map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - minVal) / range) * height * 0.8 - 10; 
        return `${x},${y}`;
    }).join(' ');
    const fillPoints = `${points} ${width},${height} 0,${height}`;
    return (
        <div className="w-full h-32 relative overflow-hidden rounded-lg bg-[#0a0a0a] border border-white/5">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full p-2">
                <defs><linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs>
                <polygon points={fillPoints} fill="url(#chartGradient)" />
                <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="absolute top-2 right-2 text-[9px] text-gray-500 font-mono bg-black/50 px-1 rounded">30 Jours</div>
        </div>
    );
};

// ==========================================
// COMPOSANTS UX
// ==========================================
function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards delay-[2500ms]">
            <div className="relative mb-8"><div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse"></div><Fingerprint className="w-20 h-20 text-gold relative z-10 animate-bounce-slow" /></div>
            <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 via-gold to-yellow-700 tracking-[0.3em] mb-6 animate-pulse">IMPERIUM</h1>
            <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-gold animate-loading-bar rounded-full"></div></div>
            <p className="absolute bottom-10 text-[10px] text-gray-600 uppercase tracking-widest font-mono">Système Sécurisé v{APP_VERSION}</p>
            <style>{`@keyframes loading-bar { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } } .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; } .animate-bounce-slow { animation: bounce 3s infinite; }`}</style>
        </div>
    );
}

function PageTransition({ children }) {
    return (<div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full flex-1 flex flex-col overflow-hidden">{children}</div>);
}

// ==========================================
// SYSTEME DE SECURITE
// ==========================================
function SecurityGate({ onAccessGranted }) {
    const [code, setCode] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkCode = (e) => {
        e.preventDefault();
        setLoading(true);
        setError(false);

        setTimeout(() => {
            const inputHash = btoa(code.trim().toUpperCase());
            if (VALID_HASHES.includes(inputHash)) {
                localStorage.setItem('imperium_license', 'GRANTED_V1');
                onAccessGranted();
            } else {
                setError(true);
                setLoading(false);
                setCode("");
            }
        }, 1500); 
    };

    return (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-sm">
                <div className="w-24 h-24 bg-red-900/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 animate-pulse">
                    <Lock className="w-10 h-10 text-red-500" />
                </div>
                
                <h1 className="text-2xl font-serif text-white font-bold mb-2 uppercase tracking-widest">Zone Restreinte</h1>
                <p className="text-gray-500 text-xs mb-8 leading-relaxed">
                    Cette application est en phase de test classifiée.<br/>
                    L'accès est limité au personnel autorisé disposant d'une Clé Impériale.
                </p>

                <form onSubmit={checkCode} className="space-y-4">
                    <div className="relative">
                        <Key className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                        <input 
                            type="text" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value)} 
                            className={`w-full bg-[#111] border rounded-lg pl-10 pr-4 py-3 text-white font-mono text-center uppercase tracking-widest focus:outline-none transition-all ${error ? 'border-red-500 animate-shake' : 'border-white/20 focus:border-gold'}`}
                            placeholder="XXX-XXXXX-00" 
                            autoFocus
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={!code || loading}
                        className={`w-full font-bold py-4 rounded-lg uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 ${loading ? 'bg-gray-800 text-gray-500' : 'bg-white text-black hover:bg-gray-200'}`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Unlock className="w-4 h-4"/>}
                        {loading ? "Vérification..." : "Déverrouiller"}
                    </button>
                </form>

                {error && (
                    <div className="mt-6 p-3 bg-red-900/20 border border-red-500/20 rounded text-red-400 text-xs flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle className="w-4 h-4" /> Code invalide ou expiré.
                    </div>
                )}
                
                <p className="fixed bottom-6 w-full left-0 text-[9px] text-gray-700 uppercase tracking-widest">Security Protocol v{APP_VERSION}</p>
            </div>
            <style>{`@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } } .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }`}</style>
        </div>
    );
}

function PatchNotesModal({ onAck }) {
    const note = RELEASE_NOTES[0];
    return (
        <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
             <div className="bg-[#151515] border border-gold/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><FileText className="w-32 h-32 text-gold" /></div>
                <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                         <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20"><Info className="w-5 h-5 text-gold"/></div>
                         <div><p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Rapport de Mise à Jour</p><h2 className="text-white font-serif font-bold text-lg">Version {note.version}</h2></div>
                     </div>
                     <div className="mb-6"><h3 className="text-gold font-bold text-sm uppercase mb-1">{note.title}</h3><p className="text-gray-400 text-xs italic">{note.desc}</p></div>
                     <div className="space-y-3 mb-8">{note.changes.map((change, idx) => { const Icon = change.icon; return ( <div key={idx} className="flex gap-3 items-start bg-black/40 p-3 rounded-lg border border-white/5"><Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" /><p className="text-xs text-gray-200 leading-relaxed">{change.text}</p></div> ) })}</div>
                     <button onClick={onAck} className="w-full bg-gold text-black font-bold py-3.5 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)]">Reçu, Retour au combat</button>
                </div>
             </div>
        </div>
    );
}

// ==========================================
// COMPOSANT: ORDRES DU JOUR (MODAL)
// ==========================================
function OrdersModal({ onClose }) {
    const [missions, setMissions] = useState([]);
    const [progress, setProgress] = useState(0);

    // Initialisation et Génération Quotidienne
    useEffect(() => {
        const todayStr = new Date().toLocaleDateString('fr-FR');
        const savedDate = localStorage.getItem('imperium_missions_date');
        const savedMissions = JSON.parse(localStorage.getItem('imperium_missions') || "[]");

        if (savedDate !== todayStr) {
            // C'est un nouveau jour : On génère 3 nouvelles missions aléatoires
            const shuffled = [...DAILY_MISSIONS_POOL].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3).map(m => ({ ...m, done: false }));
            setMissions(selected);
            localStorage.setItem('imperium_missions', JSON.stringify(selected));
            localStorage.setItem('imperium_missions_date', todayStr);
        } else {
            // C'est le même jour : On charge les missions existantes
            setMissions(savedMissions);
        }
    }, []);

    // Mise à jour de la progression
    useEffect(() => {
        if (missions.length > 0) {
            const doneCount = missions.filter(m => m.done).length;
            setProgress(Math.round((doneCount / missions.length) * 100));
        }
    }, [missions]);

    const toggleMission = (id) => {
        const updated = missions.map(m => m.id === id ? { ...m, done: !m.done } : m);
        setMissions(updated);
        localStorage.setItem('imperium_missions', JSON.stringify(updated));
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-[#151515] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* DÉCORATION D'ARRIÈRE PLAN */}
                <div className="absolute top-0 right-0 p-4 opacity-5"><Radio className="w-32 h-32 text-white" /></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-900/20 rounded-full text-orange-500 border border-orange-500/20">
                                <Radio className="w-6 h-6 animate-pulse" />
                            </div>
                            <div>
                                <h2 className="text-white font-serif font-bold text-lg">Ordres du Jour</h2>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Priorité Absolue</p>
                            </div>
                        </div>
                        <button onClick={onClose}><X className="w-6 h-6 text-gray-500 hover:text-white" /></button>
                    </div>

                    {/* BARRE DE PROGRESSION */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-gray-400">Progression</span>
                            <span className={progress === 100 ? "text-green-500 font-bold" : "text-white"}>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all duration-500 ${progress === 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-orange-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    {/* LISTE DES MISSIONS */}
                    <div className="space-y-3 mb-6">
                        {missions.map((m, idx) => (
                            <div key={idx} onClick={() => toggleMission(m.id)} className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all active:scale-[0.98] ${m.done ? 'bg-green-900/10 border-green-500/30' : 'bg-[#1a1a1a] border-white/5 hover:border-white/20'}`}>
                                <div className={`mt-0.5 ${m.done ? 'text-green-500' : 'text-gray-600'}`}>
                                    {m.done ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </div>
                                <p className={`text-sm leading-tight ${m.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>{m.text}</p>
                            </div>
                        ))}
                    </div>

                    <button onClick={onClose} className={`w-full font-bold py-3.5 rounded-lg uppercase tracking-widest text-xs transition-all ${progress === 100 ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}>
                        {progress === 100 ? "Mission Accomplie" : "Retour au Combat"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ==========================================
// 13. LE CHRONO-VISOR (SIMULATEUR QUANTIQUE - AUTONOME)
// ==========================================
function QuantumScreen({ onBack }) {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    // 1. CHARGEMENT AUTONOME DES DONNÉES
    const currency = localStorage.getItem('imperium_currency') || "€";
    const balance = JSON.parse(localStorage.getItem('imperium_balance') || "0");
    const bunker = JSON.parse(localStorage.getItem('imperium_bunker') || "0");
    const goals = JSON.parse(localStorage.getItem('imperium_goals') || "[]");
    
    // Calcul du cash réellement disponible (sans les Cibles)
    const lockedCash = goals.reduce((acc, g) => acc + (parseFloat(g.current) || 0), 0);
    const availableCash = parseFloat(balance) - lockedCash;

    const [scenario, setScenario] = useState("");
    const [cost, setCost] = useState("");
    const [loading, setLoading] = useState(false);
    const [simulation, setSimulation] = useState(null);

    const runSimulation = async (e) => {
        e.preventDefault();
        if (!scenario) return;
        setLoading(true);
        setSimulation(null);

        // Prompt Recalibré : Moins de poésie, plus de stratégie financière
        const prompt = `
            Tu es le système central IMPERIUM. Tu es un CONSEILLER FINANCIER FROID ET LOGIQUE.
            
            DONNÉES DU COMMANDANT :
            - Argent disponible (Cash) : ${availableCash} ${currency}
            - Épargne de secours (Bunker) : ${bunker} ${currency}

            ACTION PROPOSÉE : "${scenario}"
            COÛT ESTIMÉ : ${cost || "Inconnu"} ${currency}

            TES ORDRES :
            Analyse cette dépense froidement. Ne sois pas poétique. Sois BRUTAL et RÉALISTE.
            
            RÉPONDS UNIQUEMENT AVEC CE JSON STRICT (SANS RIEN D'AUTRE) :
            {
                "success_rate": (Note de 0 à 100 sur la viabilité financière de cette action),
                "verdict": "FEU VERT / FEU ROUGE / RISQUE ÉLEVÉ",
                "timeline_1m": "Conséquence immédiate CONCRÈTE. (Ex: 'Tu seras à découvert', 'Tu devras manger des pâtes', 'Ton épargne va stagner').",
                "timeline_1y": "Conséquence à long terme. (Ex: 'Retard sur tes projets', 'Endettement probable' ou 'Liberté financière accrue').",
                "visual": "Une phrase courte décrivant l'état de mes finances (Ex: 'Un bunker vide et froid' ou 'Une forteresse imprenable')."
            }
        `;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await response.json();
            
            if (data.candidates && data.candidates[0].content) {
                const text = data.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
                setSimulation(JSON.parse(text));
            } else {
                throw new Error("Pas de réponse");
            }
        } catch (error) {
            alert("⚠️ Erreur de distorsion temporelle. Réessayez.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-black text-cyan-400 font-mono flex flex-col overflow-hidden relative">
            {/* EFFET DE FOND MATRIX/QUANTIQUE */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-black to-black pointer-events-none"></div>

            <div className="shrink-0 px-5 py-4 border-b border-cyan-900/50 pt-16 z-10 relative">
                <button onClick={onBack} className="flex items-center gap-2 text-cyan-600 hover:text-cyan-400 mb-4 mt-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Déconnexion Flux</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 border border-cyan-500 rounded animate-pulse">
                        <Infinity className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 uppercase tracking-widest">CHRONO-VISOR</h1>
                        <p className="text-[10px] text-cyan-700 uppercase">Module de Prédiction v9.0</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar relative z-10">
                {!simulation && !loading && (
                    <div className="text-center mt-10 opacity-70">
                        <Activity className="w-16 h-16 mx-auto text-cyan-900 mb-4 animate-bounce" />
                        <p className="text-xs text-cyan-600 uppercase tracking-widest">En attente de données temporelles...</p>
                    </div>
                )}

                <form onSubmit={runSimulation} className="space-y-4 mb-8">
                    <div className="bg-cyan-900/5 border border-cyan-500/30 p-4 rounded-xl">
                        <label className="text-[10px] uppercase text-cyan-500 font-bold mb-2 block">Action à Simuler</label>
                        <input 
                            type="text" 
                            value={scenario} 
                            onChange={(e) => setScenario(e.target.value)} 
                            placeholder="Ex: Acheter un PC Gamer, Lancer une marque..." 
                            className="w-full bg-black border-b border-cyan-800 py-2 text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none placeholder-cyan-900" 
                        />
                    </div>
                    <div className="flex gap-2">
                         <div className="bg-cyan-900/5 border border-cyan-500/30 p-4 rounded-xl flex-1">
                            <label className="text-[10px] uppercase text-cyan-500 font-bold mb-2 block">Coût (Optionnel)</label>
                            <input 
                                type="number" 
                                value={cost} 
                                onChange={(e) => setCost(e.target.value)} 
                                placeholder="0" 
                                className="w-full bg-black border-b border-cyan-800 py-2 text-cyan-100 text-sm focus:border-cyan-400 focus:outline-none placeholder-cyan-900" 
                            />
                        </div>
                        <button type="submit" disabled={!scenario || loading} className="bg-cyan-600 text-black font-bold px-6 rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : <Zap className="w-6 h-6"/>}
                        </button>
                    </div>
                </form>

                {simulation && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-10 duration-700">
                        {/* VERDICT */}
                        <div className={`p-6 rounded-xl border-2 text-center relative overflow-hidden ${simulation.success_rate > 50 ? 'border-green-500 bg-green-900/10' : 'border-red-500 bg-red-900/10'}`}>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                            <p className="text-[10px] uppercase tracking-[0.3em] mb-2 font-bold">Probabilité de Succès</p>
                            <h2 className={`text-6xl font-bold mb-2 ${simulation.success_rate > 50 ? 'text-green-400' : 'text-red-500'}`}>{simulation.success_rate}%</h2>
                            <p className={`text-xl font-bold uppercase tracking-widest ${simulation.success_rate > 50 ? 'text-green-400' : 'text-red-400'}`}>{simulation.verdict}</p>
                        </div>

                        {/* VISION */}
                        <div className="bg-black border border-cyan-500/30 p-4 rounded-xl relative">
                            <div className="absolute top-0 right-0 p-2"><Globe className="w-4 h-4 text-cyan-600"/></div>
                            <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-widest mb-2">Projection Visuelle</h3>
                            <p className="text-sm text-cyan-100 italic">"{simulation.visual}"</p>
                        </div>

                        {/* TIMELINES */}
                        <div className="space-y-4 pt-4 relative">
                            <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-cyan-900"></div>
                            
                            <div className="flex gap-4 relative">
                                <div className="w-10 h-10 rounded-full bg-black border-2 border-cyan-500 flex items-center justify-center shrink-0 z-10">
                                    <span className="text-[10px] font-bold text-cyan-400">1M</span>
                                </div>
                                <div className="bg-cyan-900/10 border border-cyan-500/20 p-4 rounded-xl flex-1">
                                    <h4 className="text-xs font-bold text-cyan-400 uppercase mb-1">Impact Tactique (Court Terme)</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">{simulation.timeline_1m}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 relative">
                                <div className="w-10 h-10 rounded-full bg-black border-2 border-purple-500 flex items-center justify-center shrink-0 z-10 shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                                    <span className="text-[10px] font-bold text-purple-400">1A</span>
                                </div>
                                <div className="bg-purple-900/10 border border-purple-500/20 p-4 rounded-xl flex-1">
                                    <h4 className="text-xs font-bold text-purple-400 uppercase mb-1">Impact Stratégique (Long Terme)</h4>
                                    <p className="text-xs text-gray-400 leading-relaxed">{simulation.timeline_1y}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ==========================================
// APP PRINCIPALE & NAVIGATION
// ==========================================
export default function App() {
    const [loading, setLoading] = useState(true);
    const [hasOnboarded, setHasOnboarded] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false); 
  
    useEffect(() => { 
        const timer = setTimeout(() => { setLoading(false); }, 2500); 
        setHasOnboarded(localStorage.getItem('imperium_onboarded') === 'true');
        setIsAuthorized(localStorage.getItem('imperium_license') === 'GRANTED_V1'); 
        return () => clearTimeout(timer); 
    }, []);
  
    if (loading) return <SplashScreen />;
    if (!isAuthorized) return <SecurityGate onAccessGranted={() => setIsAuthorized(true)} />;
    if (!hasOnboarded) return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
    
    return <MainOS />;
  }
  
  function MainOS() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [showPatchNotes, setShowPatchNotes] = useState(false);
    const navigate = (view) => { setCurrentView(view); window.scrollTo(0, 0); };

    useEffect(() => { 
        const lastVersion = localStorage.getItem('imperium_version');
        if (lastVersion !== APP_VERSION) { setTimeout(() => setShowPatchNotes(true), 500); }
    }, []);
    
    const ackPatchNotes = () => { localStorage.setItem('imperium_version', APP_VERSION); setShowPatchNotes(false); };

    // --- SYSTÈME CLOUD : JUSTE LE TÉLÉCHARGEMENT (LOAD) ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                // Au login, on vérifie s'il y a une sauvegarde
                const cloudData = await loadEmpireFromCloud(currentUser.uid);
                if (cloudData) {
                    // On compare avec la date locale pour ne pas écraser bêtement
                    // Pour simplifier ici : on demande confirmation
                    if(confirm("☁️ Sauvegarde Cloud trouvée. Voulez-vous charger votre Empire ?")) {
                        if(cloudData.balance) localStorage.setItem('imperium_balance', cloudData.balance);
                        if(cloudData.bunker) localStorage.setItem('imperium_bunker', cloudData.bunker);
                        if(cloudData.transactions) localStorage.setItem('imperium_transactions', cloudData.transactions);
                        if(cloudData.goals) localStorage.setItem('imperium_goals', cloudData.goals);
                        if(cloudData.debts) localStorage.setItem('imperium_debts', cloudData.debts);
                        if(cloudData.skills) localStorage.setItem('imperium_skills', cloudData.skills);
                        if(cloudData.quantum) localStorage.setItem('imperium_beta_quantum', cloudData.quantum);
                        
                        window.location.reload(); 
                    }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    return (
      <>
          {showPatchNotes && <PatchNotesModal onAck={ackPatchNotes} />}
          {currentView === 'dashboard' && <Dashboard onNavigate={navigate} />}
          {currentView === 'project' && <ProjectScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'skills' && <SkillsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'stats' && <StatsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'trophies' && <TrophiesScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'goals' && <GoalsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'quantum' && <QuantumScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'debts' && <DebtsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'protocols' && <ProtocolsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'citadel' && <CitadelScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'academy' && <AcademyScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'settings' && <SettingsScreen onBack={() => navigate('dashboard')} />}
      </>
    );
}

// ==========================================
// 1. ONBOARDING (CONFIG + TUTORIEL)
// ==========================================
function OnboardingScreen({ onComplete }) {
    const [step, setStep] = useState(1);
    // Mode Tuto : false = Config, true = Slides
    const [showTutorial, setShowTutorial] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);

    const [initialBalance, setInitialBalance] = useState('');
    const [mainProject, setMainProject] = useState('');    const [currency, setCurrency] = useState('');
    const [zone, setZone] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isHolding, setIsHolding] = useState(false);
    const holdTimer = useRef(null);
    const [progress, setProgress] = useState(0);

    const filteredCurrencies = CURRENCIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const selectCurrency = (selected) => { setCurrency(selected.symbol); setStep(3.5); }; 
    const selectZone = (selectedZone) => { setZone(selectedZone); setStep(5); };
    
    const startHold = () => { setIsHolding(true); let p = 0; holdTimer.current = setInterval(() => { p += 2; setProgress(p); if (p >= 100) { clearInterval(holdTimer.current); setStep(3); } }, 30); };
    const stopHold = () => { setIsHolding(false); clearInterval(holdTimer.current); setProgress(0); };
    
    // Transition Config -> Tuto
    const startTutorial = () => {
        // On sauvegarde les données mais on ne reload pas encore
        localStorage.setItem('imperium_balance', initialBalance || 0);
        const firstProject = { id: Date.now(), title: mainProject || "Empire Naissant", deadline: "", tasks: [], answers: {} };
        localStorage.setItem('imperium_projects', JSON.stringify([firstProject]));
        localStorage.setItem('imperium_currency', currency || "€");
        localStorage.setItem('imperium_zone', JSON.stringify(zone || ZONES[0]));
        
        setShowTutorial(true); // Lancement des slides
    };

    // Fin du Tuto -> Dashboard
    const finishComplete = () => {
        localStorage.setItem('imperium_onboarded', 'true');
        window.location.reload();
    };

    // Navigation Slides
    const nextSlide = () => {
        if (slideIndex < TUTORIAL_STEPS.length - 1) {
            setSlideIndex(slideIndex + 1);
        } else {
            finishComplete();
        }
    };

    // --- AFFICHAGE DU TUTORIEL ---
    if (showTutorial) {
        const currentSlide = TUTORIAL_STEPS[slideIndex];
        const Icon = currentSlide.icon;
        
        return (
            <PageTransition>
                <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 z-50 text-center">
                    <div className="flex-1 flex flex-col items-center justify-center max-w-sm animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-[#111] rounded-full flex items-center justify-center mb-8 border border-gold/30 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                            <Icon className="w-10 h-10 text-gold" />
                        </div>
                        <h2 className="text-2xl font-serif text-white font-bold mb-6 tracking-wide uppercase">{currentSlide.title}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{currentSlide.text}</p>
                    </div>

                    <div className="w-full max-w-xs mt-8">
                        <div className="flex justify-center gap-1 mb-6">
                            {TUTORIAL_STEPS.map((_, idx) => (
                                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === slideIndex ? 'w-8 bg-gold' : 'w-2 bg-gray-800'}`} />
                            ))}
                        </div>
                        <button onClick={nextSlide} className="w-full bg-gold text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors">
                            {slideIndex === TUTORIAL_STEPS.length - 1 ? "ACCÉDER AU QG" : "SUIVANT"}
                        </button>
                    </div>
                </div>
            </PageTransition>
        );
    }

    // --- AFFICHAGE DE LA CONFIGURATION (Classique) ---
    return (
      <PageTransition><div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden w-full h-full">
        {step === 1 && (<div className="animate-in fade-in duration-1000 flex flex-col items-center w-full max-w-xs"><h1 className="text-4xl font-serif font-bold tracking-widest mb-6">IMPERIUM</h1><p className="text-gray-400 text-sm leading-relaxed mb-10">"Le chaos règne à l'extérieur.<br/>Ici, seule la discipline construit des Empires."</p><button onClick={() => setStep(2)} className="border border-gold text-gold px-8 py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors">Prendre le contrôle</button></div>)}
        {step === 2 && (<div className="animate-in zoom-in duration-500 flex flex-col items-center w-full max-w-xs"><h2 className="text-xl font-serif mb-2">Le Pacte</h2><p className="text-gray-500 text-xs mb-12">Jurez-vous de ne rien cacher ?</p><div className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform" onMouseDown={startHold} onMouseUp={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}><svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gold" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} /></svg><Fingerprint className={`w-10 h-10 ${isHolding ? 'text-gold animate-pulse' : 'text-gray-600'}`} /></div><p className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">Maintenir pour sceller</p></div>)}
        {step === 3 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-6">Votre Devise</h2><div className="relative mb-4"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:border-gold focus:outline-none" placeholder="Rechercher (ex: Euro, FCFA...)" autoFocus /></div><div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">{filteredCurrencies.map((c) => (<button key={c.code} onClick={() => selectCurrency(c)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg flex justify-between items-center group transition-all active:scale-[0.98]"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif font-bold text-xs">{c.symbol.substring(0, 2)}</span><div className="text-left"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{c.name}</p><p className="text-[10px] text-gray-500">{c.code}</p></div></div><ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold" /></button>))}</div></div>)}
        {step === 3.5 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs flex flex-col items-center"><div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/30"><Smartphone className="w-10 h-10 text-blue-500" /></div><h2 className="text-xl font-serif text-white mb-4">La Stratégie Wave</h2><p className="text-gray-400 text-sm leading-relaxed mb-8">Dans ce système, <span className="text-blue-400 font-bold">Wave est votre Coffre-Fort</span>.<br/><br/>L'argent liquide et OM sont pour la guerre (dépenses). Wave est pour la sécurité (épargne).<br/><br/><span className="text-xs italic text-gray-500">Si vous n'avez pas de compte Wave, ouvrez-en un maintenant.</span></p><button onClick={() => setStep(4)} className="w-full bg-blue-600 text-white font-bold py-3 rounded uppercase tracking-widest text-xs hover:bg-blue-500 transition-colors">C'est compris, continuons</button></div>)}
        {step === 4 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-2">Votre Terrain</h2><p className="text-xs text-gray-500 mb-6">Ajuste l'intelligence artificielle à votre marché.</p><div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">{ZONES.map((z) => (<button key={z.id} onClick={() => selectZone(z)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg text-left group transition-all active:scale-[0.98]"><div className="flex justify-between items-center mb-1"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{z.name}</p><Globe className="w-4 h-4 text-gray-600 group-hover:text-gold" /></div><p className="text-[10px] text-gray-500">{z.desc}</p></button>))}</div></div>)}
        {step === 5 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Trésorerie Actuelle (Cash + OM)</label><input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="0" autoFocus /><p className="text-[10px] text-gray-500 mb-4 text-left">*Ne comptez pas ce qu'il y a déjà sur Wave.</p><button onClick={() => setStep(6)} disabled={!initialBalance} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">SUIVANT</button></div>)}
        {step === 6 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Nom du Projet Principal</label><input type="text" value={mainProject} onChange={(e) => setMainProject(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="Ex: Agence IA" autoFocus /><button onClick={startTutorial} disabled={!mainProject} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">LANCER L'EMPIRE</button></div>)}
      </div></PageTransition>
    );
} 

// ==========================================
// 11. RADIO LINK (VERSION STABLE - FLASH LATEST)
// ==========================================
function RadioLink({ onClose }) {
    // ⚠️ COLLE TA CLÉ API ICI ⚠️
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const balance = JSON.parse(localStorage.getItem('imperium_balance') || "0");
        const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]");
        const daysLeft = 30 - new Date().getDate(); 

        const expenses = transactions.filter(t => t.type === 'expense');
        const wants = expenses.filter(t => t.category === 'want').reduce((acc, t) => acc + t.amount, 0);
        const totalExp = expenses.reduce((acc, t) => acc + t.amount, 0);
        const ratio = totalExp > 0 ? Math.round((wants / totalExp) * 100) : 0;

        const prompt = `
            Tu es le Sergent Hartman. Ta recrue a ces stats :
            - Solde : ${balance}
            - Jours restants : ${daysLeft}
            - Dépenses Futiles : ${ratio}%

            Analyse ça en 2 phrases max.
            Si futilité > 30% ou solde bas : Sois dur, autoritaire, secoue-le.
            Sinon : Sois méfiant mais valide la discipline.
            Termine impérativement par "ROMPEZ !".
        `;

        const callGemini = async () => {
            try {
                // CHANGEMENT ICI : On utilise "gemini-flash-latest" qui est dans ta liste et a de meilleurs quotas
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                
                const data = await response.json();

                if (data.error) {
                    // Si erreur de quota, on l'affiche gentiment
                    if (data.error.message.includes("quota")) {
                        setMessage("Le QG est saturé d'appels. Réessayez dans 1 minute.");
                    } else {
                        setMessage(`Erreur QG : ${data.error.message}`);
                    }
                } else if (data.candidates && data.candidates[0].content) {
                    setMessage(data.candidates[0].content.parts[0].text);
                } else {
                    setMessage("Silence radio...");
                }
            } catch (error) {
                setMessage("Liaison coupée. Vérifiez votre réseau.");
            } finally {
                setLoading(false);
            }
        };

        callGemini();
    }, []);

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-[#1a1a1a] border border-green-900/50 w-full max-w-sm rounded-none p-6 shadow-[0_0_50px_rgba(34,197,94,0.1)] relative font-mono">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6 border-b border-green-900/30 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-900/20 text-green-500 animate-pulse border border-green-500/30">
                                <Radio className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-green-500 font-bold text-lg tracking-widest uppercase">TRANSMISSION</h2>
                                <p className="text-[10px] text-green-800 uppercase">Canal Sécurisé • Priorité Alpha</p>
                            </div>
                        </div>
                        <button onClick={onClose}><X className="w-6 h-6 text-green-800 hover:text-green-500" /></button>
                    </div>

                    <div className="min-h-[100px] flex items-center justify-center text-left">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2 text-green-800">
                                <Loader2 className="w-8 h-8 animate-spin" />
                                <span className="text-xs uppercase blink">Déchiffrement...</span>
                            </div>
                        ) : (
                            <p className="text-green-400 text-sm leading-relaxed typing-effect">
                                "{message}"
                            </p>
                        )}
                    </div>

                    <button onClick={onClose} className="w-full mt-6 bg-green-900/20 border border-green-500/30 text-green-500 font-bold py-3 uppercase tracking-widest text-xs hover:bg-green-500 hover:text-black transition-colors">
                        Reçu, Terminé.
                    </button>
                </div>
            </div>
            <style>{`
                .blink { animation: blinker 1s linear infinite; }
                @keyframes blinker { 50% { opacity: 0; } }
            `}</style>
        </div>
    );
}

// ==========================================
// SERVICE JARVIS PRIME - VISION TOTALE (MISE À JOUR V17.1)
// ==========================================
const askJarvisChat = async (history, userMessage, contextData, userTitle = "Commandant") => {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
    const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

    try {
       // 1. Préparation des données
       const recentLogs = (contextData.transactions || []).slice(0, 15).map(t => 
        `[${t.date}] ${t.type === 'expense' ? '-' : '+'}${t.amount} (${t.desc})`
    ).join("\n");

    const arsenal = (contextData.skills || []).map(s => `- ${s.name} (Niveau ${s.level})`).join("\n");
    const citadelle = (contextData.debts || []).map(d => `- Dette: ${d.name} (${d.amount} restant)`).join("\n");
    const protocoles = (contextData.protocols || []).map(p => `- Règle: ${p.text}`).join("\n");
    const cibles = (contextData.projects || []).map(p => `- ${p.title} (${p.current}/${p.target})`).join("\n");
        
        // 2. Le contexte global (L'état de l'Empire)
        // MODIFICATION ICI : On injecte userTitle (Commandant ou Commandante)
        const systemContext = `
            Tu es JARVIS, l'IA centrale d'IMPERIUM.
            Tu t'adresses à ton utilisateur en l'appelant : "${userTitle.toUpperCase()}".
            Si c'est "COMMANDANTE", accorde tes adjectifs au féminin (ex: "Vous êtes prête", "Soyez attentive").
            
            DONNÉES STRATÉGIQUES DU ${userTitle.toUpperCase()} :
            💰 FINANCES (Cash/Wave): ${contextData.balance} / ${contextData.bunker} ${contextData.currency}
            
            📜 REGISTRE (15 derniers mouvements) :
            ${recentLogs}
            
            🎯 CIBLES (Projets en cours) :
            ${cibles}
            
            ⚔️ ARSENAL (Compétences) :
            ${arsenal || "Aucune compétence enregistrée."}
            
            🏰 CITADELLE (Dettes & Règles) :
            ${citadelle || "Aucune dette active."}
            ${protocoles}
            
            TES ORDRES :
            1. Utilise ces données pour répondre. 
            2. Sois bref, style militaire/efficace mais respectueux du grade.
            3. Termine parfois par "Rompez !" ou "À vos ordres !".
        `;

        const contents = [
            { role: "user", parts: [{ text: systemContext }] },
            ...history.map(msg => ({
                role: msg.sender === 'user' ? "user" : "model",
                parts: [{ text: msg.text }]
            })),
            { role: "user", parts: [{ text: userMessage }] }
        ];

        const response = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: contents })
        });

        const data = await response.json();

        if (data.error) return "⚠️ Erreur liaison QG.";
        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
        return "Silence radio...";

    } catch (error) {
        console.error(error);
        return "⚠️ Connexion perdue.";
    }
};

// ==========================================
// INTERFACE JARVIS PRIME (CHAT)
// ==========================================
function JarvisModal({ onClose, contextData }) {
    // RECUPERATION DU GENRE
    const gender = localStorage.getItem('imperium_gender') || 'M';
    const title = gender === 'F' ? 'Commandante' : 'Commandant';
    const accord = gender === 'F' ? 'prête' : 'prêt';

    // Message d'accueil proactif ADAPTÉ
    const [messages, setMessages] = useState([
        { id: 1, sender: 'jarvis', text: `${title}. Je suis connecté aux systèmes d'Imperium. Vous êtes ${accord} ? Analyse terminée. Que puis-je faire pour votre stratégie aujourd'hui ?` }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    // Auto-scroll vers le bas
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        // 🛠️ ASTUCE DÉMO : LE TRIGGER SECRET (OFFLINE)
        if (input.toLowerCase().includes("demo") || input.toLowerCase().includes("status")) {
            setTimeout(() => {
                 setMessages(prev => [...prev, { 
                    id: Date.now() + 1, 
                    sender: 'jarvis', 
                    text: `Rapport Tactique pour la ${title} :\n\n1. Discipline : Excellente (Flamme active).\n2. Finance : Le Bunker est sécurisé.\n3. Alerte : Attention aux dépenses futiles ce week-end.\n\nContinuez comme ça. Rompez !` 
                }]);
                setLoading(false);
            }, 800);
            return;
        }

        // --- CORRECTION ICI ---
        // On passe 'title' (Commandant ou Commandante) en 4ème argument
        const responseText = await askJarvisChat(messages, input, contextData, title);
        
        const jarvisMsg = { id: Date.now() + 1, sender: 'jarvis', text: responseText };
        setMessages(prev => [...prev, jarvisMsg]);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#0f1115] border border-gold/30 w-full max-w-md h-[85vh] sm:h-[600px] sm:rounded-2xl flex flex-col shadow-2xl relative overflow-hidden">
                
                {/* Header Jarvis */}
                <div className="p-4 border-b border-gold/10 bg-[#161b22] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gold/10 rounded-full flex items-center justify-center border border-gold/50 animate-pulse">
                                <Zap className="w-5 h-5 text-gold" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#161b22]"></div>
                        </div>
                        <div>
                            <h3 className="text-gold font-bold font-serif tracking-widest text-sm">JARVIS PRIME</h3>
                            <p className="text-[9px] text-gray-500 uppercase">En ligne • {title}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5 text-gray-500" /></button>
                </div>

                {/* Zone de Chat */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20" ref={scrollRef}>
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                msg.sender === 'user' 
                                ? 'bg-gold text-black font-medium rounded-tr-none' 
                                : 'bg-[#1e232e] text-gray-200 border border-white/5 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-[#1e232e] p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1 items-center">
                                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-100"></div>
                                <div className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Zone */}
                <div className="p-4 bg-[#161b22] border-t border-white/5 shrink-0">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Ordonnez, ${title}...`} 
                            className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
                            autoFocus
                        />
                        <button onClick={handleSend} disabled={!input.trim() || loading} className="bg-gold/90 hover:bg-gold text-black p-3 rounded-xl disabled:opacity-50 transition-colors">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ==========================================
//              DASHBOARD
// ==========================================
function Dashboard({ onNavigate }) {
    
    // 1. CHARGEMENT DES DONNÉES
    const [balance, setBalance] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_balance') || "0"); } catch { return 0; } });
    const [bunker, setBunker] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_bunker') || "0"); } catch { return 0; } });
    const [transactions, setTransactions] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); } catch { return []; } });
    const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_goals') || "[]"); } catch { return []; } });
    const [debts, setDebts] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_debts') || "[]"); } catch { return []; } });
    const [projects, setProjects] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_projects') || "[]"); } catch { return []; } });
    
    // Pour Jarvis
    const [skills, setSkills] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_skills') || "[]"); } catch { return []; } });
    const [protocols, setProtocols] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_protocols') || "[]"); } catch { return []; } });
    
    const currency = localStorage.getItem('imperium_currency') || "€";

    // 2. ETATS D'INTERFACE
    const [showRadio, setShowRadio] = useState(false);
    const [showJarvis, setShowJarvis] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    
    // Modales de transaction
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBunkerModalOpen, setIsBunkerModalOpen] = useState(false);
    const [showDistributeModal, setShowDistributeModal] = useState(false);
    
    // États pour la distribution tactique
    const [pendingTransaction, setPendingTransaction] = useState(null);
    const [distributeWave, setDistributeWave] = useState("");
    const [distributeGoalId, setDistributeGoalId] = useState("");
    const [distributeGoalAmount, setDistributeGoalAmount] = useState("");

    // SAISIE
    const [transactionType, setTransactionType] = useState('expense');
    const [expenseCategory, setExpenseCategory] = useState('need'); 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [bunkerAmount, setBunkerAmount] = useState('');

    // --- SÉCURITÉ BETA (CHRONO-VISOR) ---
    const [showBetaLock, setShowBetaLock] = useState(false); // Affiche la modale de code
    const [betaCodeInput, setBetaCodeInput] = useState("");
    const [isQuantumUnlocked, setIsQuantumUnlocked] = useState(() => {
        // Vérifie si le code a DÉJÀ été entré par le passé
        return localStorage.getItem('imperium_beta_quantum') === 'GRANTED';
    });
       // ... après vos useState ...
    const [user, setUser] = useState(null);

    // 1. Détecter l'utilisateur connecté
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    // 2. SAUVEGARDE AUTOMATIQUE (CLOUD)
    // À chaque fois que balance, bunker, transactions ou goals changent -> On envoie au Cloud
    useEffect(() => {
        if (user) {
            const dataToSave = {
                balance: localStorage.getItem('imperium_balance'),
                bunker: localStorage.getItem('imperium_bunker'),
                transactions: localStorage.getItem('imperium_transactions'),
                goals: localStorage.getItem('imperium_goals'),
                debts: localStorage.getItem('imperium_debts'),
                skills: localStorage.getItem('imperium_skills'),
                quantum: localStorage.getItem('imperium_beta_quantum')
            };

            // Petit délai pour éviter de spammer Google à chaque lettre tapée
            const timer = setTimeout(() => {
                saveEmpireToCloud(user.uid, dataToSave);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [balance, bunker, transactions, goals, user]); // On surveille ces variables

    const handleQuantumAccess = () => {
        if (isQuantumUnlocked) {
            // Si déjà débloqué, on y va direct
            playSound('click'); 
            onNavigate('quantum');
        } else {
            // Sinon, on affiche la modale de sécurité
            playSound('error'); // Petit son de refus
            setShowBetaLock(true);
        }
    };

    const unlockQuantum = (e) => {
        e.preventDefault();
        if (betaCodeInput.trim() === "IMPERATOR-X") {
            // SUCCÈS
            localStorage.setItem('imperium_beta_quantum', 'GRANTED');
            setIsQuantumUnlocked(true);
            setShowBetaLock(false);
            playSound('success');
            alert("ACCÈS AUTORISÉ : Bienvenue dans le futur, Commandant.");
            onNavigate('quantum');
        } else {
            // ÉCHEC
            playSound('error');
            alert("ACCÈS REFUSÉ"); // <--- Modification ici
            setBetaCodeInput("");
            setShowBetaLock(false);
        }
    };

    // === CALCULS TEMPORELS & IMPACT ===
    const today = new Date();
    const currentDay = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(1, daysInMonth - currentDay + 1); 
    const daysRemainingTomorrow = Math.max(1, daysRemaining - 1); 
    
    const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    
    // Soldes
    const totalBalance = balance; 
    const totalBunker = bunker;     
    const lockedCash = goals.reduce((acc, g) => acc + (parseFloat(g.current) || 0), 0);
    const availableCash = totalBalance - lockedCash; 
    
    // Dépenses du Jour
    const spentToday = transactions
        .filter(t => t.type === 'expense' && t.date === todayStr)
        .reduce((acc, t) => acc + t.amount, 0);
  
    // RATION DU JOUR
    const realDailyAllocation = Math.floor((availableCash + spentToday) / daysRemaining);
    const remainingDaily = realDailyAllocation - spentToday;
    const dailyProgress = Math.min(100, (spentToday / realDailyAllocation) * 100);
  
    // PROJECTION DEMAIN
    const projectedRationTomorrow = Math.floor(availableCash / daysRemainingTomorrow);
    const impactValue = projectedRationTomorrow - realDailyAllocation;
    let impactStatus = "neutre";
    if (impactValue > 50) impactStatus = "bonus"; 
    if (impactValue < -50) impactStatus = "malus"; 
  
    // Couleur barre
    let rationColor = "bg-[#F4D35E]";
    if (remainingDaily < 0) rationColor = "bg-red-600";
    else if (dailyProgress < 50) rationColor = "bg-green-500";
  
    // FLAMME (STREAK)
    const calculateStreak = () => {
      if (transactions.length === 0) return 0;
      const lastSin = transactions.find(t => t.type === 'expense' && t.category === 'want');
      if (!lastSin) return Math.min(transactions.length, 30); 
      const lastSinDate = new Date(lastSin.rawDate || Date.now());
      const now = new Date();
      const diffTime = Math.abs(now - lastSinDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
    };
    const streak = calculateStreak();
  
    // ALERTE DETTE PRIORITAIRE
    const priorityDebt = debts
          .filter(d => d.type === 'owe' && d.amount <= availableCash)
          .sort((a, b) => a.amount - b.amount)[0];
  
    // Grades & Autres
    const rank = getRank(totalBalance + totalBunker, currency); 
    const RankIcon = rank.icon;
    const quoteIndex = new Date().getDate() % DAILY_QUOTES.length;
    const dailyQuote = DAILY_QUOTES[quoteIndex];
    const dailySurvivalCost = Math.max(availableCash / 30, 1);
    const daysLost = amount ? (parseFloat(amount) / dailySurvivalCost).toFixed(1) : 0;
  
    // EFFETS DE SAUVEGARDE
   useEffect(() => {
    localStorage.setItem('imperium_balance', JSON.stringify(balance)); 
    localStorage.setItem('imperium_bunker', JSON.stringify(bunker)); 
    localStorage.setItem('imperium_transactions', JSON.stringify(transactions));
    localStorage.setItem('imperium_goals', JSON.stringify(goals)); 
  }, [balance, bunker, transactions, goals]);
  
    
    // =======================================================
    // FONCTION DE VALIDATION (AVEC INTERCEPTEUR JARVIS)
    // =======================================================
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!amount) return;
        const value = parseFloat(amount);
        
        // 1. GESTION DES REVENUS
        if (transactionType === 'income') {
            setPendingTransaction({ value, description });
            setShowDistributeModal(true); 
            setDistributeWave("");
            setDistributeGoalId("");
            setDistributeGoalAmount("");
            setIsModalOpen(false);
            setAmount(''); setDescription('');
            return;
        }
        
        // 2. 🛡️ INTERCEPTEUR JARVIS
        if (transactionType === 'expense' && expenseCategory === 'want') {
            const threshold = availableCash * 0.20;
            
            if (value > threshold) {
                const confirmAction = window.confirm(
                    `⚠️ ALERTE JARVIS\n\nCommandant, vous êtes sur le point de dépenser ${formatMoney(value)} ${currency} en futilités.\n\nCela représente plus de 20% de votre trésorerie disponible.\n\nConfirmez-vous cet ordre malgré le risque ?`
                );
                if (!confirmAction) return; 
            }
        }
  
        // 3. GESTION DES DÉPENSES
        if (transactionType === 'expense') {
            if (value > balance) return alert("Fonds insuffisants (Cash/OM).");
            setBalance(balance - value);
        } else {
            setBalance(balance + value);
        }
  
        // 4. ENREGISTREMENT
        const newTransaction = { 
            id: Date.now(), 
            desc: description || (transactionType === 'expense' ? "Dépense" : "Revenu"), 
            amount: value, 
            type: transactionType, 
            category: expenseCategory, 
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), 
            rawDate: new Date().toISOString() 
        };
        
        setTransactions([newTransaction, ...transactions]);
        setAmount(''); setDescription(''); setIsModalOpen(false);
      };
  
    const finalizeIncome = () => {
        if (!pendingTransaction) return;

        const totalIncome = pendingTransaction.value;
        const waveAlloc = parseFloat(distributeWave) || 0;
        const goalAlloc = parseFloat(distributeGoalAmount) || 0;
        
        if (waveAlloc + goalAlloc > totalIncome) {
            alert(`Erreur : Répartition trop élevée.`);
            return;
        }

        const remainingCash = totalIncome - waveAlloc - goalAlloc;
        setBalance(balance + totalIncome - waveAlloc); 

        if (waveAlloc > 0) {
            setBunker(bunker + waveAlloc);
        }

        if (goalAlloc > 0 && distributeGoalId) {
            const updatedGoals = goals.map(g => {
                if (g.id === parseInt(distributeGoalId)) {
                    return { ...g, current: g.current + goalAlloc };
                }
                return g;
            });
            setGoals(updatedGoals);
        }

        const incomeTx = { 
            id: Date.now(), 
            desc: pendingTransaction.description || "Revenu", 
            amount: totalIncome, 
            type: 'income', 
            category: 'income', 
            date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), 
            rawDate: new Date().toISOString(),
            details: `Reçu: ${totalIncome} | Wave: -${waveAlloc} | Cible: ${goalAlloc} (Réservé) | Reste: ${remainingCash}`
        };

        setTransactions([incomeTx, ...transactions]);
        
        setPendingTransaction(null);
        setShowDistributeModal(false);
        playSound('success');
    };
  
    const handleBunkerAction = (action) => {
        if (!bunkerAmount) return;
        const val = parseFloat(bunkerAmount);
        if (action === 'deposit') {
            if (val > availableCash) return alert(`Fonds insuffisants.`);
            setBalance(balance - val); setBunker(bunker + val);     
        } else if (action === 'withdraw') {
            if (val > bunker) return alert(`Fonds insuffisants sur Wave.`);
            setBunker(bunker - val); setBalance(balance + val); 
        }
        setBunkerAmount(''); setIsBunkerModalOpen(false);
    };
    
    const handleUndoTransaction = (txId) => {
        if(!confirm("Annuler cette opération ?")) return;
        const tx = transactions.find(t => t.id === txId);
        if(!tx) return;
        if(tx.type === 'expense') setBalance(balance + tx.amount); else setBalance(balance - tx.amount);
        setTransactions(transactions.filter(t => t.id !== txId));
    };
  
    return (
      <PageTransition>
      <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col relative overflow-hidden">
        
        {/* 1. EN-TÊTE */}
        <div className="px-5 pt-safe-top mt-4 flex justify-between items-start shrink-0">
           <div>
              <h1 className="text-xl font-serif text-[#F4D35E] font-bold tracking-widest">IMPERIUM</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">J-{daysRemaining} • {todayStr}</p>
           </div>
           
           <div className="flex gap-2">
               {/* FLAMME */}
               <div className={`flex items-center gap-1.5 bg-[#1a2333] border ${streak > 0 ? 'border-orange-500/30' : 'border-white/5'} px-3 py-1.5 rounded-full`}>
                  <Flame className={`w-3 h-3 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-600'}`} />
                  <span className={`text-[10px] font-bold uppercase ${streak > 0 ? 'text-orange-400' : 'text-gray-600'} tracking-wider`}>{streak}J</span>
               </div>
  
               {/* GRADE */}
               <button onClick={() => onNavigate('trophies')} className="flex items-center gap-1.5 bg-[#1a2333] border border-blue-500/30 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                  <RankIcon className={`w-3 h-3 ${rank.color}`} />
                  <span className={`text-[10px] font-bold uppercase ${rank.color} tracking-wider`}>{rank.title}</span>
               </button>
           </div>
        </div>
  
        {/* 2. CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-48 custom-scrollbar space-y-4">
          
          {/* CARTE PRINCIPALE */}
          <div className="bg-[#111] rounded-2xl border-t-2 border-[#F4D35E] p-5 relative shadow-lg overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-b from-[#F4D35E]/5 to-transparent rounded-2xl pointer-events-none"></div>
               
               {/* Solde Global */}
               <div className="text-center mb-6">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Disponible (Cash + OM)</p>
                  <h2 className="text-4xl font-serif font-bold text-white tracking-wide">{formatMoney(availableCash)} <span className="text-base text-[#F4D35E] font-sans font-bold">{currency}</span></h2>
               </div>
  
               {/* RATION DU JOUR */}
               <div className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Clock className="w-3 h-3 text-[#F4D35E]"/> Ration du Jour</span>
                      <span className={`text-xs font-bold ${remainingDaily < 0 ? 'text-red-500' : 'text-white'}`}>
                          {remainingDaily < 0 ? 'DÉPASSÉ' : 'Reste : ' + formatMoney(remainingDaily)}
                      </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                      <div className={`h-full transition-all duration-500 ${rationColor}`} style={{ width: `${dailyProgress}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] mb-3">
                        <span className="text-gray-500">Dépensé : <span className="text-white font-bold">{formatMoney(spentToday)}</span></span>
                        <span className="text-gray-500">Budget Max : <span className="text-gray-400">{formatMoney(realDailyAllocation)}</span></span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Projection Demain</p>
                      <div className="text-right">
                           <p className={`text-xs font-bold ${impactStatus === 'bonus' ? 'text-green-400' : impactStatus === 'malus' ? 'text-red-400' : 'text-gray-400'}`}>
                               {formatMoney(projectedRationTomorrow)} {currency}
                           </p>
                           <p className="text-[9px] text-gray-500 italic">{impactStatus === 'bonus' ? "▲ Bonus (Discipline)" : impactStatus === 'malus' ? "▼ Malus (Dette)" : "= Stable"}</p>
                      </div>
                  </div>
               </div>
          </div>
  
          {/* ALERTE DETTE PRIORITAIRE */}
          {priorityDebt && (
              <div onClick={() => onNavigate('debts')} className="bg-red-600/10 border border-red-500/50 p-3 rounded-xl flex items-center justify-between animate-pulse cursor-pointer">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-500/20 rounded-full"><AlertTriangle className="w-4 h-4 text-red-500"/></div>
                      <div>
                          <p className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Dette Payable Immédiatement</p>
                          <p className="text-xs text-white">Rembourser <span className="font-bold">{priorityDebt.name}</span> ({formatMoney(priorityDebt.amount)})</p>
                      </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-500" />
              </div>
          )}
  
          {/* CARTE WAVE */}
          <div onClick={() => setIsBunkerModalOpen(true)} className="bg-[#10141d] border border-blue-900/40 rounded-xl p-5 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
               <div className="flex items-center gap-4 relative z-10">
                   <div className="p-2.5 bg-[#1a2333] rounded-lg text-blue-400 border border-blue-500/20"><Smartphone className="w-5 h-5"/></div>
                   <div>
                       <p className="text-[9px] text-blue-300 uppercase tracking-widest font-bold mb-0.5">Coffre-Fort Wave</p>
                       <p className="text-xl font-bold text-white font-serif">{formatMoney(totalBunker)} {currency}</p>
                   </div>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 relative z-10" />
          </div>
  
          {/* GRILLE D'ACTIONS RAPIDES */}
          <div className="grid grid-cols-2 gap-3 mb-2">
              <button onClick={() => onNavigate('project')} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-white/5 active:scale-[0.98]">
                  <Castle className="w-6 h-6 text-[#F4D35E] mb-3 opacity-90" /><h3 className="text-sm font-bold text-white">Projets</h3><p className="text-[9px] text-gray-500 uppercase tracking-wide">Conquêtes</p>
              </button>
              
              <button onClick={() => { playSound('radio'); setShowRadio(true); }} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-white/5 active:scale-[0.98] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20"><Radio className="w-12 h-12 text-green-500 -rotate-12"/></div>
                    <Radio className="w-6 h-6 text-green-500 mb-3 opacity-90 relative z-10" />
                    <h3 className="text-sm font-bold text-white relative z-10">Radio QG</h3>
                    <p className="text-[9px] text-gray-500 uppercase tracking-wide relative z-10">Rapport Sergent</p>
              </button>
              
             {/* BOUTON JARVIS (PREMIUM) */}
             <button onClick={() => setShowJarvis(true)} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-gold/20 active:scale-[0.98] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Zap className="w-6 h-6 text-gold mb-3 opacity-90 relative z-10" />
                  <h3 className="text-sm font-bold text-white relative z-10">JARVIS AI</h3>
                  <p className="text-[9px] text-gold uppercase tracking-wide relative z-10">Analyse Tactique</p>
             </button>

              <button onClick={() => onNavigate('skills')} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-white/5 active:scale-[0.98]">
                  <Sword className="w-6 h-6 text-white mb-3 opacity-90" /><h3 className="text-sm font-bold text-white">Arsenal</h3><p className="text-[9px] text-gray-500 uppercase tracking-wide">Compétences</p>
              </button>
              <button onClick={() => onNavigate('protocols')} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-white/5 active:scale-[0.98]">
                  <RefreshCw className="w-6 h-6 text-white mb-3 opacity-90" /><h3 className="text-sm font-bold text-white">Protocole</h3><p className="text-[9px] text-gray-500 uppercase tracking-wide">Rentes/Charges</p>
              </button>
          </div>
          
          {/* BOUTON CHRONO-VISOR (AVEC VERROU SEC) */}
          <button onClick={handleQuantumAccess} className="w-full bg-[#111] rounded-xl p-0.5 flex items-center justify-between active:scale-[0.98] mt-2 group relative overflow-hidden mb-3">
             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
             <div className="bg-[#0a0a0a] w-full h-full rounded-[10px] p-4 flex items-center gap-4 relative z-10">
                 <div className="p-2 bg-cyan-900/20 rounded-full text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                     <Infinity className="w-6 h-6 animate-spin-slow" />
                 </div>
                 <div className="text-left">
                     <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">CHRONO-VISOR</h3>
                     <p className="text-[9px] text-cyan-600 uppercase tracking-widest">Simuler le Futur</p>
                 </div>
                 {isQuantumUnlocked ? (
                    <ChevronRight className="w-5 h-5 text-cyan-400 ml-auto" />
                 ) : (
                    <Lock className="w-4 h-4 text-gray-500 ml-auto" />
                 )}
             </div>
             <style>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-spin-slow { animation: spin-slow 10s linear infinite; }`}</style>
          </button>
          
          {/* BOUTON CIBLES */}
           <button onClick={() => { playSound('click'); onNavigate('goals'); }} className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] mb-2 group hover:bg-[#222] transition-colors">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-900/20 rounded-full text-blue-400 border border-blue-500/20">
                      <Target className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                      <h3 className="text-sm font-bold text-white">Cibles</h3>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Objectifs d'Achat</p>
                  </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
          </button>
          
           {/* --- BOUTON CITADELLE --- */}
          <button onClick={() => { playSound('citadel'); onNavigate('citadel'); }} className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] mt-2 group hover:bg-[#222] transition-colors relative overflow-hidden">
               <div className="absolute inset-0 bg-[#F4D35E]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <div className="flex items-center gap-4 relative z-10">
                   <div className="p-2 bg-[#F4D35E]/10 rounded-full text-[#F4D35E] border border-[#F4D35E]/20">
                       <Shield className="w-5 h-5" />
                   </div>
                   <div className="text-left">
                       <h3 className="text-sm font-bold text-white">La Citadelle</h3>
                       <p className="text-[9px] text-gray-500 uppercase tracking-wide">Simulateur de Survie</p>
                   </div>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#F4D35E] transition-colors" />
          </button>

           {/* --- BOUTON ACADÉMIE --- */}
          <button onClick={() => { playSound('click'); onNavigate('academy'); }} className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] mt-2 group hover:bg-[#222] transition-colors">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-purple-900/20 rounded-full text-purple-400 border border-purple-500/20">
                      <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                      <h3 className="text-sm font-bold text-white">L'Académie</h3>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Savoir Stratégique</p>
                  </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-400 transition-colors" />
          </button>

          {/* BOUTON REGISTRE */}
          <button onClick={() => { playSound('debts'); onNavigate('debts'); }} className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] mt-2 group hover:bg-[#222] transition-colors">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-red-900/20 rounded-full text-red-500 border border-red-500/20">
                      <Scroll className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                      <h3 className="text-sm font-bold text-white">Le Registre</h3>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Dettes & Créances</p>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                   {(debts.length > 0) && <span className="bg-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded">{debts.length}</span>}
                   <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
              </div>
          </button>
  
          {/* BOUTON TROPHÉES */}
          <button onClick={() => { playSound('trophies'); onNavigate('trophies'); }} className="w-full bg-[#1a1a1a] rounded-xl p-4 flex items-center justify-between border border-white/5 active:scale-[0.98] mt-2 group hover:bg-[#222] transition-colors">
              <div className="flex items-center gap-4">
                  <div className="p-2 bg-[#F4D35E]/10 rounded-full text-[#F4D35E] border border-[#F4D35E]/20">
                      <Trophy className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                      <h3 className="text-sm font-bold text-white">Salle des Trophées</h3>
                      <p className="text-[9px] text-gray-500 uppercase tracking-wide">Voir mes succès</p>
                  </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#F4D35E] transition-colors" />
          </button>
  
          {/* CITATION */}
          <div className="text-center pt-4 opacity-60"><p className="text-[10px] text-gray-400 italic">"{dailyQuote.text}"</p></div>
        </div>
  
        {/* 3. FAB */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center z-30 pointer-events-none">
            <button onClick={() => setIsModalOpen(true)} className="pointer-events-auto w-14 h-14 rounded-full bg-[#EAB308] text-black shadow-[0_0_20px_rgba(234,179,8,0.4)] flex items-center justify-center active:scale-90 transition-transform border-4 border-[#0d0d0d]">
                <Plus className="w-7 h-7" />
            </button>
        </div>
  
        {/* 4. NAV */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#161616] border-t border-white/5 px-6 pb-6 pt-3 flex justify-between items-end z-20">
            <button onClick={() => onNavigate('dashboard')} className="flex flex-col items-center gap-1 text-[#F4D35E] opacity-100"><div className="w-6 h-6 bg-[#F4D35E]/10 rounded flex items-center justify-center"><Castle className="w-4 h-4" /></div><span className="text-[9px] font-bold uppercase">QG</span></button>
            <button onClick={() => onNavigate('stats')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"><BarChart3 className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Cartes</span></button>
            <div className="w-10"></div> 
            <button onClick={() => setShowHistory(true)} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"><History className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Journal</span></button>
            <button onClick={() => onNavigate('settings')} className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors"><Settings className="w-5 h-5" /><span className="text-[9px] font-bold uppercase">Réglages</span></button>
        </div>
  
        {/* MODALES INTEGREES */}
        {isModalOpen && (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-[#161616] border-t border-white/10 w-full max-w-md rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300 pb-10 mb-[env(safe-area-inset-bottom)]"><div className="flex justify-between items-center mb-6"><h2 className="font-serif text-gray-400 text-xs tracking-widest uppercase">Nouvelle Entrée</h2><button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button></div><div className="flex bg-black p-1 rounded-lg mb-4 border border-white/5"><button onClick={() => setTransactionType('expense')} className={`flex-1 py-3 text-xs font-bold uppercase rounded transition-colors ${transactionType === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>Dépense</button><button onClick={() => setTransactionType('income')} className={`flex-1 py-3 text-xs font-bold uppercase rounded transition-colors ${transactionType === 'income' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>Revenu</button></div>{transactionType === 'expense' && (<div className="flex gap-2 mb-4"><button onClick={() => setExpenseCategory('need')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'need' ? 'border-white text-white bg-white/10' : 'border-white/5 text-gray-600 bg-black'}`}>NÉCESSITÉ</button><button onClick={() => setExpenseCategory('want')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'want' ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-white/5 text-gray-600 bg-black'}`}>FUTILITÉ ⚠️</button></div>)}{transactionType === 'expense' && expenseCategory === 'want' && amount > 0 && (<div className="mb-4 p-3 bg-red-900/10 border border-red-500/30 rounded-lg flex items-start gap-3"><Clock className="w-5 h-5 text-red-500 shrink-0" /><div><p className="text-red-400 font-bold text-xs uppercase">Alerte</p><p className="text-gray-300 text-xs mt-1">Coût: <span className="text-white font-bold">{daysLost} jours</span> de survie.</p></div></div>)}<form onSubmit={handleSubmit} className="space-y-5"><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-700 py-2 text-white text-4xl font-serif focus:border-gold focus:outline-none placeholder-gray-800 text-center" placeholder="0" autoFocus /><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none" placeholder={transactionType === 'expense' ? "Ex: Burger..." : "Ex: Vente..."} /><button type="submit" className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors uppercase tracking-widest text-xs ${transactionType === 'expense' ? 'bg-white text-black' : 'bg-[#EAB308] text-black'}`}>VALIDER</button></form></div></div>)}
        {isBunkerModalOpen && (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"><div className="bg-[#050b1a] border-t border-blue-500/30 w-full max-w-md rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300 pb-10 mb-[env(safe-area-inset-bottom)] relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div><div className="flex justify-between items-center mb-6"><div className="flex items-center gap-2"><Smartphone className="w-5 h-5 text-blue-400"/><h2 className="font-serif text-blue-400 text-sm tracking-widest uppercase font-bold">Compte Wave</h2></div><button onClick={() => setIsBunkerModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button></div><div className="text-center mb-6"><h2 className="text-4xl font-bold text-white font-serif">{formatMoney(totalBunker)} {currency}</h2></div><div className="space-y-4"><input type="number" value={bunkerAmount} onChange={(e) => setBunkerAmount(e.target.value)} className="w-full bg-blue-900/20 border border-blue-500/20 rounded-lg py-3 text-white text-center text-2xl font-serif focus:border-blue-400 focus:outline-none placeholder-gray-600" placeholder="0" autoFocus /><div className="flex gap-3"><button onClick={() => handleBunkerAction('withdraw')} className="flex-1 bg-red-900/10 text-red-500 border border-red-900/30 py-4 rounded-lg font-bold text-xs uppercase">Retrait</button><button onClick={() => handleBunkerAction('deposit')} className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-bold text-xs uppercase">Dépôt</button></div></div></div></div>)}
        {showHistory && (<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in"><div className="bg-[#111] border-t border-white/10 w-full max-w-md rounded-t-2xl p-6 shadow-2xl h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300"><div className="flex justify-between items-center mb-6"><h2 className="font-serif text-white text-sm tracking-widest uppercase font-bold">Journal</h2><button onClick={() => setShowHistory(false)}><X className="w-5 h-5 text-gray-500" /></button></div><div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pb-10">{transactions.map(tx => (<div key={tx.id} className="flex justify-between items-center p-3 bg-[#1a1a1a] rounded-lg border border-white/5"><div><p className="text-xs text-white font-bold">{tx.desc}</p><p className="text-[10px] text-gray-500">{tx.date}</p></div><div className="flex items-center gap-3"><span className={`text-sm font-bold ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>{tx.type === 'expense' ? '-' : '+'}{formatMoney(tx.amount)}</span><button onClick={() => handleUndoTransaction(tx.id)} className="p-2 text-red-500"><Trash2 className="w-4 h-4" /></button></div></div>))}</div></div></div>)}
        
        {/* MODALE DE RÉPARTITION TACTIQUE */}
      {showDistributeModal && pendingTransaction && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in">
              <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                  <div className="text-center mb-6">
                      <h3 className="text-[#F4D35E] font-serif text-xl font-bold uppercase tracking-widest">Rapport de Butin</h3>
                      <p className="text-white text-3xl font-bold mt-2">{formatMoney(pendingTransaction.value)} <span className="text-sm text-gray-500">{currency}</span></p>
                      <p className="text-[10px] text-gray-500 mt-1">À répartir stratégiquement</p>
                  </div>
                  <div className="space-y-4 mb-8">
                      <div className="bg-black/50 p-3 rounded-lg border border-blue-900/30">
                          <div className="flex items-center gap-2 mb-2">
                              <Smartphone className="w-4 h-4 text-blue-400"/>
                              <span className="text-xs font-bold text-blue-100 uppercase">Sécuriser sur Wave</span>
                          </div>
                          <input type="number" value={distributeWave} onChange={(e) => setDistributeWave(e.target.value)} placeholder="Montant (ex: 5000)" className="w-full bg-[#111] border border-blue-500/20 rounded p-2 text-white text-sm focus:border-blue-500 outline-none text-right"/>
                      </div>
                      {goals.length > 0 ? (
                          <div className="bg-black/50 p-3 rounded-lg border border-green-900/30">
                              <div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-green-400"/><span className="text-xs font-bold text-green-100 uppercase">Investir sur Cible</span></div>
                              <select value={distributeGoalId} onChange={(e) => setDistributeGoalId(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded p-2 text-xs text-white mb-2 outline-none focus:border-green-500">
                                  <option value="">-- Choisir une cible --</option>
                                  {goals.map(g => (<option key={g.id} value={g.id}>{g.title} (Reste: {formatMoney(g.target - g.current)})</option>))}
                              </select>
                              <input type="number" value={distributeGoalAmount} onChange={(e) => setDistributeGoalAmount(e.target.value)} placeholder="Montant" disabled={!distributeGoalId} className="w-full bg-[#111] border border-green-500/20 rounded p-2 text-white text-sm focus:border-green-500 outline-none text-right disabled:opacity-50"/>
                          </div>
                      ) : (
                          <div className="p-3 rounded-lg border border-white/5 bg-white/5 text-center"><p className="text-[10px] text-gray-500 italic">Aucune cible active pour investir.</p></div>
                      )}
                  </div>
                  <div className="flex justify-between items-center text-xs mb-4 px-2">
                      <span className="text-gray-500">Reste en Cash (Dispo):</span>
                      <span className="text-white font-bold">{formatMoney(pendingTransaction.value - (parseFloat(distributeWave)||0) - (parseFloat(distributeGoalAmount)||0))} {currency}</span>
                  </div>
                  <button onClick={finalizeIncome} className="w-full bg-[#F4D35E] text-black font-bold py-3.5 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-[0_0_15px_rgba(244,211,94,0.3)]">Confirmer la Répartition</button>
              </div>
          </div>
      )}
      
        {showOrders && <OrdersModal onClose={() => setShowOrders(false)} />}
        {showRadio && <RadioLink onClose={() => setShowRadio(false)} />}
        
        {/* MODALE JARVIS PRIME */}
        {showJarvis && (
            <JarvisModal 
                onClose={() => setShowJarvis(false)} 
                contextData={{ balance: availableCash, bunker: totalBunker, currency: currency, transactions: transactions, projects: projects, skills: skills, debts: debts, protocols: protocols }}
            />
        )}

        {/* MODALE DE SÉCURITÉ BETA (TEXTE MODIFIÉ) */}
        {showBetaLock && (
             <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in">
                <div className="bg-[#1a1a1a] border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-[0_0_50px_rgba(220,38,38,0.2)] text-center relative overflow-hidden">
                    
                    {/* Message de développement (MODIFIÉ) */}
                    <div className="mb-6">
                        <Lock className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
                        <h2 className="text-red-500 font-bold text-xl uppercase tracking-widest mb-2">ZONE CLASSIFIÉE</h2>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Ce module est indisponible car toujours en cours de développement.
                        </p>
                    </div>

                    {/* Zone de saisie secrète (Invisible pour l'utilisateur lambda qui pense que c'est juste une info, mais active pour vous) */}
                    <form onSubmit={unlockQuantum} className="relative">
                        <div className="relative">
                             <Key className="absolute left-3 top-3 w-4 h-4 text-gray-600" />
                             <input 
                                type="text" 
                                value={betaCodeInput} 
                                onChange={(e) => setBetaCodeInput(e.target.value)} 
                                placeholder="Code d'Accès..." 
                                className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white text-xs focus:border-red-500 focus:outline-none uppercase tracking-widest"
                             />
                        </div>
                        <div className="flex gap-2 mt-4">
                            <button type="button" onClick={() => setShowBetaLock(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-lg text-xs uppercase font-bold transition-colors">Retour</button>
                            <button type="submit" className="flex-1 bg-red-900/30 hover:bg-red-900/50 border border-red-500/30 text-red-500 py-3 rounded-lg text-xs uppercase font-bold transition-colors">Déverrouiller</button>
                        </div>
                    </form>
                </div>
             </div>
        )}

      </div>
      </PageTransition>
    );
  }

// ==========================================
// 8. PROTOCOLES - GESTION DES FRÉQUENCES
// ==========================================
function ProtocolsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const [protocols, setProtocols] = useState(JSON.parse(localStorage.getItem('imperium_protocols') || "[]"));
    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [type, setType] = useState('expense');
    const [freq, setFreq] = useState('monthly'); 

    useEffect(() => { localStorage.setItem('imperium_protocols', JSON.stringify(protocols)); }, [protocols]);

    const addProtocol = (e) => {
        e.preventDefault();
        if (!newName || !newAmount) return;
        setProtocols([...protocols, { id: Date.now(), name: newName, amount: parseFloat(newAmount), type, freq }]);
        setNewName(""); setNewAmount(""); setFreq('monthly');
    };

    const deleteProtocol = (id) => { setProtocols(protocols.filter(p => p.id !== id)); };

    const calculateMonthly = (p) => {
        const frequency = FREQUENCIES.find(f => f.id === (p.freq || 'monthly')); 
        return p.amount * (frequency ? frequency.factor : 1);
    };

    const fixedExpenses = protocols.filter(p => p.type === 'expense').reduce((acc, p) => acc + calculateMonthly(p), 0);
    const fixedIncome = protocols.filter(p => p.type === 'income').reduce((acc, p) => acc + calculateMonthly(p), 0);
    const cashFlow = fixedIncome - fixedExpenses;

    return (
        <PageTransition>
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Protocoles</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                <div className="mb-6 bg-[#111] rounded-xl border border-white/10 p-5">
                    <div className="flex items-center gap-2 mb-4 opacity-70"><Infinity className="w-4 h-4 text-gold" /><h3 className="text-xs font-bold uppercase tracking-widest">Projection Mensuelle</h3></div>
                    <div className="flex justify-between items-center mb-2"><span className="text-xs text-gray-500">Revenus Projetés</span><span className="text-xs font-bold text-green-500">+{formatMoney(fixedIncome)} {currency}</span></div>
                    <div className="flex justify-between items-center mb-4"><span className="text-xs text-gray-500">Charges Projetées</span><span className="text-xs font-bold text-red-500">-{formatMoney(fixedExpenses)} {currency}</span></div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center"><span className="text-xs font-bold text-white uppercase">Cash-Flow Net</span><span className={`text-xl font-bold font-serif ${cashFlow >= 0 ? 'text-gold' : 'text-red-500'}`}>{cashFlow > 0 ? '+' : ''}{formatMoney(cashFlow)} <span className="text-xs">{currency}</span></span></div>
                </div>

                <div className="space-y-3">
                    {protocols.length === 0 && <p className="text-center text-gray-600 text-xs mt-10">Aucun protocole actif.</p>}
                    {protocols.map(p => {
                        const fLabel = FREQUENCIES.find(f => f.id === (p.freq || 'monthly'))?.label.split('(')[0] || 'Mensuel';
                        return (
                            <div key={p.id} className="bg-[#111] border border-white/5 p-4 rounded-xl flex justify-between items-center group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${p.type === 'expense' ? 'bg-red-900/10 text-red-500' : 'bg-green-900/10 text-green-500'}`}>{p.type === 'expense' ? <CalendarClock className="w-5 h-5"/> : <Briefcase className="w-5 h-5"/>}</div>
                                    <div><h3 className="text-sm font-bold text-gray-200">{p.name}</h3><p className="text-[10px] text-gray-500">{fLabel}</p></div>
                                </div>
                                <div className="flex items-center gap-4"><span className={`text-sm font-bold ${p.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>{formatMoney(p.amount)}</span><button onClick={() => deleteProtocol(p.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4"/></button></div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="shrink-0 p-4 bg-[#0a0a0a] border-t border-white/10 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
                <div className="flex bg-black p-1 rounded-lg mb-3 border border-white/5">
                    <button onClick={() => setType('expense')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-colors ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>Charge</button>
                    <button onClick={() => setType('income')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-colors ${type === 'income' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>Rente</button>
                </div>
                <form onSubmit={addProtocol} className="flex flex-col gap-3">
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom (ex: Loyer, Salaire...)" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                    <div className="flex gap-2">
                         <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Montant" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                         <select value={freq} onChange={(e) => setFreq(e.target.value)} className="bg-[#111] border border-white/10 rounded-lg px-2 text-white text-xs focus:border-gold outline-none w-24">
                            {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label.split('(')[1].replace(')', '')}</option>)}
                         </select>
                         <button type="submit" disabled={!newName || !newAmount} className="bg-white/10 text-white font-bold px-4 rounded-lg disabled:opacity-50 hover:bg-white/20 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                </form>
            </div>
        </div>
        </PageTransition>
    );
}

// ==========================================
// 8. LE GRAND LIVRE (CORRIGÉ & STICKY)
// ==========================================
function DebtsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    
    // 1. ON RECUPERE TOUTES LES DONNEES FINANCIERES
    const [balance, setBalance] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_balance') || "0"); } catch { return 0; } });
    const [debts, setDebts] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_debts') || "[]"); } catch { return []; } });
    const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_goals') || "[]"); } catch { return []; } });
    
    // Etats de saisie
    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [type, setType] = useState('owe');

    // Synchronisation
    useEffect(() => { localStorage.setItem('imperium_debts', JSON.stringify(debts)); }, [debts]);
    useEffect(() => { localStorage.setItem('imperium_balance', JSON.stringify(balance)); }, [balance]);

    // CALCUL DU VRAI CASH DISPONIBLE (Comme sur le Dashboard)
    // On ne peut pas payer une dette avec l'argent verrouillé dans les "Cibles"
    const lockedCash = goals.reduce((acc, g) => acc + (parseFloat(g.current) || 0), 0);
    const availableCash = parseFloat(balance) - lockedCash;

    // Ajouter une entrée
    const addEntry = (e) => {
        e.preventDefault();
        if (!newName || !newAmount) return;
        setDebts([...debts, { id: Date.now(), name: newName, amount: parseFloat(newAmount), type }]);
        setNewName(""); setNewAmount("");
    };

    // Payer ou Encaisser
    const settleEntry = (item) => {
        if(item.type === 'owe') {
            if(availableCash < item.amount) return alert(`Trésorerie disponible insuffisante (${formatMoney(availableCash)}). L'argent des Cibles est verrouillé.`);
            if(confirm(`Payer ${item.name} ? ${formatMoney(item.amount)} seront déduits de votre Cash.`)) {
                setBalance(balance - item.amount);
                setDebts(debts.filter(d => d.id !== item.id));
            }
        } else {
            if(confirm(`Avez-vous reçu l'argent de ${item.name} ? ${formatMoney(item.amount)} seront ajoutés à votre Cash.`)) {
                setBalance(balance + item.amount);
                setDebts(debts.filter(d => d.id !== item.id));
            }
        }
    };
    
    const deleteEntry = (id) => {
        if(confirm("Supprimer cette entrée ? (Aucun impact sur le solde)")) {
            setDebts(debts.filter(d => d.id !== id));
        }
    };

    const totalOwe = debts.filter(d => d.type === 'owe').reduce((acc, d) => acc + d.amount, 0);
    const totalOwed = debts.filter(d => d.type === 'owed').reduce((acc, d) => acc + d.amount, 0);

    // LOGIQUE DE L'ALERTE PRIORITAIRE
    // On cherche la dette la plus petite que l'on peut payer MAINTENANT avec le CASH DISPONIBLE
    const priorityDebt = debts
        .filter(d => d.type === 'owe' && d.amount <= availableCash)
        .sort((a, b) => a.amount - b.amount)[0]; 

    return (
        <PageTransition>
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col relative overflow-hidden">
            
            {/* 1. EN-TÊTE */}
            <div className="px-5 pt-safe-top mt-4 flex justify-between items-center shrink-0">
                <div>
                   <h1 className="text-xl font-serif text-[#F4D35E] font-bold tracking-widest">LE REGISTRE</h1>
                   <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5">Dispo: {formatMoney(availableCash)} {currency}</p>
                </div>
                <button onClick={onBack} className="w-10 h-10 bg-[#1a2333] border border-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white active:scale-95 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                </button>
            </div>

            {/* 2. CONTENU SCROLLABLE */}
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-40 custom-scrollbar relative">
                
                {/* RESUME DES TOTAUX */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#1a0f0f] border border-red-900/30 p-4 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><UserMinus className="w-12 h-12 text-red-500"/></div>
                        <p className="text-[9px] text-red-400 uppercase tracking-widest font-bold mb-1">Dettes (Tributs)</p>
                        <p className="text-xl font-serif font-bold text-white">{formatMoney(totalOwe)} <span className="text-xs text-red-500">{currency}</span></p>
                    </div>
                    <div className="bg-[#0f1a13] border border-green-900/30 p-4 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10"><UserPlus className="w-12 h-12 text-green-500"/></div>
                        <p className="text-[9px] text-green-400 uppercase tracking-widest font-bold mb-1">Créances (Dû)</p>
                        <p className="text-xl font-serif font-bold text-white">{formatMoney(totalOwed)} <span className="text-xs text-green-500">{currency}</span></p>
                    </div>
                </div>

                {/* --- ALERTE PRIORITAIRE (STICKY EN HAUT DE LISTE) --- */}
                {priorityDebt && (
                    <div className="sticky top-0 z-10 mb-4 animate-in slide-in-from-top-2">
                        <div className="bg-[#2a0a0a] border border-red-500 p-4 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-between backdrop-blur-md">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Action Requise</p>
                                </div>
                                <p className="text-xs text-white leading-tight">Liquidité suffisante pour payer <span className="font-bold border-b border-red-500/50">{priorityDebt.name}</span>.</p>
                                <p className="text-sm font-serif font-bold text-[#F4D35E] mt-1">{formatMoney(priorityDebt.amount)} {currency}</p>
                            </div>
                            <button onClick={() => settleEntry(priorityDebt)} className="bg-red-600 text-white font-bold px-4 py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-red-500 transition-colors shadow-lg active:scale-95">
                                Payer
                            </button>
                        </div>
                    </div>
                )}

                {/* LISTE DES ENTRÉES */}
                <div className="space-y-3 pb-6">
                    {debts.length === 0 && <div className="text-center py-10 opacity-50"><Scroll className="w-10 h-10 mx-auto mb-2 text-gray-600"/><p className="text-xs text-gray-500">Le registre est vierge.</p></div>}
                    
                    {debts.map(item => (
                        <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center bg-[#111] transition-all hover:bg-[#161616] ${item.type === 'owe' ? 'border-red-500/10' : 'border-green-500/10'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.type === 'owe' ? 'bg-red-900/10 text-red-500' : 'bg-green-900/10 text-green-500'}`}>
                                    {item.type === 'owe' ? <UserMinus className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-200">{item.name}</h3>
                                    <p className={`text-xs font-serif font-bold ${item.type === 'owe' ? 'text-red-400' : 'text-green-400'}`}>
                                        {formatMoney(item.amount)} {currency}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => settleEntry(item)} className={`px-4 py-2 rounded text-[10px] font-bold uppercase border transition-colors ${item.type === 'owe' ? 'border-red-500/30 text-red-400 hover:bg-red-900/20' : 'border-green-500/30 text-green-400 hover:bg-green-900/20'}`}>
                                    {item.type === 'owe' ? "Payer" : "Reçu"}
                                </button>
                                <button onClick={() => deleteEntry(item.id)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. FORMULAIRE FIXE EN BAS */}
            <div className="bg-[#161616] border-t border-white/5 p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shrink-0 z-20">
                <div className="flex bg-black p-1 rounded-lg mb-3 border border-white/5">
                    <button onClick={() => setType('owe')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-colors ${type === 'owe' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>Je Dois (Dette)</button>
                    <button onClick={() => setType('owed')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-colors ${type === 'owed' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>On me Doit (Créance)</button>
                </div>
                
                <form onSubmit={addEntry} className="flex flex-col gap-3">
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom (ex: Moussa)" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#F4D35E] focus:outline-none placeholder-gray-600" />
                    <div className="flex gap-2">
                        <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Montant" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#F4D35E] focus:outline-none placeholder-gray-600" />
                        <button type="submit" disabled={!newName || !newAmount} className="bg-[#F4D35E] text-black font-bold px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(244,211,94,0.2)]">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </PageTransition>
    );
}

// ==========================================
// 7. CIBLES DE CONQUÊTE
// ==========================================
function GoalsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const [goals, setGoals] = useState(JSON.parse(localStorage.getItem('imperium_goals') || "[]"));
    const [newGoalName, setNewGoalName] = useState("");
    const [newGoalTarget, setNewGoalTarget] = useState("");
    const [newGoalDeadline, setNewGoalDeadline] = useState("");
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [allocAmount, setAllocAmount] = useState("");

    useEffect(() => { localStorage.setItem('imperium_goals', JSON.stringify(goals)); }, [goals]);

    const addGoal = (e) => {
        e.preventDefault();
        if (!newGoalName || !newGoalTarget) return;
        setGoals([...goals, { id: Date.now(), title: newGoalName, target: parseFloat(newGoalTarget), deadline: newGoalDeadline, current: 0 }]);
        setNewGoalName(""); setNewGoalTarget(""); setNewGoalDeadline("");
    };

    const deleteGoal = (id) => { setGoals(goals.filter(g => g.id !== id)); };

    const handleAllocation = (type) => { // type = 'deposit' or 'withdraw'
        if(!allocAmount || !selectedGoal) return;
        const val = parseFloat(allocAmount);
        const updatedGoals = goals.map(g => {
            if (g.id === selectedGoal.id) {
                return { ...g, current: type === 'deposit' ? g.current + val : Math.max(0, g.current - val) };
            }
            return g;
        });
        setGoals(updatedGoals);
        setAllocAmount(""); setSelectedGoal(null);
    };

    return (
        <PageTransition>
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Cibles</h1>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                <div className="space-y-4">
                    {goals.map(goal => {
                        const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                        const daysLeft = getDaysLeft(goal.deadline);
                        return (
                            <div key={goal.id} className="bg-[#111] border border-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${percent >= 100 ? 'bg-green-900/20 text-green-500' : 'bg-blue-900/20 text-blue-500'}`}><Target className="w-5 h-5"/></div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-200">{goal.title}</h3>
                                            <p className="text-[10px] text-gray-500">{percent}% Sécurisé</p>
                                        </div>
                                    </div>
                                    <button onClick={() => deleteGoal(goal.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4"/></button>
                                </div>
                                
                                {daysLeft !== null && (
                                    <div className={`text-[10px] font-bold mb-2 flex items-center gap-1 ${daysLeft < 3 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                                        <Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} Jours restants` : "Date dépassée"}
                                    </div>
                                )}

                                <div className="w-full bg-gray-900 rounded-full h-2 mb-2"><div className={`h-2 rounded-full transition-all duration-500 ${percent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div></div>
                                <div className="flex justify-between items-center mb-4"><span className="text-xs font-bold text-white">{formatMoney(goal.current)} {currency}</span><span className="text-[10px] text-gray-500">Obj: {formatMoney(goal.target)}</span></div>
                                <div className="flex gap-2">
                                    <button onClick={() => setSelectedGoal(goal)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-2 rounded text-xs font-bold uppercase">Gérer</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedGoal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in">
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                        <button onClick={() => setSelectedGoal(null)} className="absolute top-4 right-4 text-gray-500"><X className="w-5 h-5"/></button>
                        <h3 className="text-white font-serif text-lg mb-4 text-center">Gérer: {selectedGoal.title}</h3>
                        <input type="number" value={allocAmount} onChange={(e) => setAllocAmount(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-center text-xl focus:border-gold focus:outline-none mb-4" placeholder="Montant" autoFocus />
                        <div className="flex gap-3">
                            <button onClick={() => handleAllocation('withdraw')} className="flex-1 bg-red-900/20 text-red-500 border border-red-500/30 py-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2"><Unlock className="w-4 h-4"/> Retirer</button>
                            <button onClick={() => handleAllocation('deposit')} className="flex-1 bg-green-900/20 text-green-500 border border-green-500/30 py-3 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2"><Lock className="w-4 h-4"/> Verser</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="shrink-0 p-4 bg-[#0a0a0a] border-t border-white/10 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
                <form onSubmit={addGoal} className="flex flex-col gap-3">
                    <input type="text" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Nom (ex: PC Gamer)" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                    <div className="flex gap-2">
                        <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="Cible" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                        <input type="date" value={newGoalDeadline} onChange={(e) => setNewGoalDeadline(e.target.value)} className="bg-[#111] border border-white/10 rounded-lg px-2 text-white text-xs focus:border-gold outline-none" />
                        <button type="submit" disabled={!newGoalName || !newGoalTarget} className="bg-blue-600/80 text-white font-bold px-4 py-3 rounded-lg disabled:opacity-50 hover:bg-blue-500 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                </form>
            </div>
        </div>
        </PageTransition>
    );
}

// ==========================================
// 3. STATISTIQUES AVEC COURBE
// ==========================================
function StatsScreen({ onBack }) {
    const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]");
    const balance = JSON.parse(localStorage.getItem('imperium_balance') || "0");
    const currency = localStorage.getItem('imperium_currency') || "€";
    
    // CALCUL STATISTIQUES CLASSIQUES
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const wants = transactions.filter(t => t.type === 'expense' && t.category === 'want').reduce((acc, t) => acc + t.amount, 0);
    const needs = transactions.filter(t => t.type === 'expense' && t.category === 'need').reduce((acc, t) => acc + t.amount, 0);
    const wantPercent = totalExpenses === 0 ? 0 : Math.round((wants / totalExpenses) * 100);
    const needPercent = totalExpenses === 0 ? 0 : Math.round((needs / totalExpenses) * 100);

    // CALCUL DONNÉES COURBE (30 JOURS)
    const generateTrendData = () => {
        const data = [];
        let current = balance; // Solde TOTAL actuel (incluant tout)
        // On remonte le temps sur 30 jours
        for (let i = 0; i < 30; i++) {
            data.unshift(current); // On ajoute la valeur actuelle au début du tableau
            
            // On calcule la valeur de la veille en inversant les transactions du jour 'i'
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            
            // Trouver les transactions de ce jour là
            const dayTx = transactions.filter(t => t.date === dateStr);
            
            // Pour revenir en arrière : 
            // Solde Hier = Solde Aujourd'hui - Revenus Aujourd'hui + Dépenses Aujourd'hui
            dayTx.forEach(t => {
                if (t.type === 'income') current -= t.amount;
                else current += t.amount;
            });
        }
        return data;
    };
    
    const trendData = generateTrendData();
    const isTrendingUp = trendData[trendData.length - 1] >= trendData[0];

    return (
        <PageTransition>
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Salle des Cartes</h1>
            </div>
            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                
                {/* LA COURBE DE PUISSANCE */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-gold"/><h3 className="text-xs font-bold uppercase tracking-widest text-white">Courbe de Puissance</h3></div>
                        <span className={`text-xs font-bold flex items-center gap-1 ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
                            {isTrendingUp ? <TrendingUp className="w-3 h-3"/> : <TrendingDown className="w-3 h-3"/>}
                            {isTrendingUp ? "Croissance" : "Déclin"}
                        </span>
                    </div>
                    <PowerChart data={trendData} color={isTrendingUp ? "#22c55e" : "#ef4444"} />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-[#111] p-4 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Dépensé</p><p className="text-xl font-bold text-white">{formatMoney(totalExpenses)} {currency}</p></div>
                    <div className="bg-[#111] p-4 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ratio Futilité</p><p className={`text-xl font-bold ${wantPercent > 30 ? 'text-red-500' : 'text-green-500'}`}>{wantPercent}%</p></div>
                </div>
                <div className="bg-[#111] border border-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Répartition Stratégique</h3>
                    <div className="mb-4"><div className="flex justify-between text-xs mb-2"><span className="text-white font-bold">Nécessités</span><span className="text-gray-400">{formatMoney(needs)} {currency}</span></div><div className="w-full bg-gray-900 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{ width: `${needPercent}%` }}></div></div></div>
                    <div><div className="flex justify-between text-xs mb-2"><span className="text-red-400 font-bold">Futilités (Plaisirs)</span><span className="text-gray-400">{formatMoney(wants)} {currency}</span></div><div className="w-full bg-gray-900 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${wantPercent}%` }}></div></div></div>
                </div>
                <div className="bg-[#1a1a1a] border-l-2 border-gold p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-gold" /><span className="text-xs font-bold text-gold uppercase tracking-widest">Rapport du Sergent</span></div>
                    <p className="text-sm text-gray-300 italic leading-relaxed">{totalExpenses === 0 ? "Aucune donnée. L'Empire est immobile." : wantPercent > 50 ? "DISCIPLINE REQUISE ! Vous gaspillez plus de la moitié de vos ressources. L'Empire va s'effondrer." : wantPercent > 20 ? "Attention. Les plaisirs grignotent le trésor." : "Excellent. Vos ressources sont allouées à la survie et à la conquête."}</p>
                </div>
            </div>
        </div>
        </PageTransition>
    );
}

// ==========================================
// 4. ARSENAL (Version Stable - Sans Animation)
// ==========================================
function SkillsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    const savedZone = localStorage.getItem('imperium_zone');
    const userZone = savedZone ? JSON.parse(savedZone) : { name: "Zone Inconnue" };
    
    const [skills, setSkills] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_skills') || "[]"); } catch { return []; } });
    const [newSkill, setNewSkill] = useState("");
    
    // États pour l'analyse IA
    const [analyzing, setAnalyzing] = useState(null); 
    const [tacticResult, setTacticResult] = useState(null); 

    useEffect(() => { localStorage.setItem('imperium_skills', JSON.stringify(skills)); }, [skills]);

    const addSkill = (e) => { 
        e.preventDefault(); 
        if (!newSkill.trim()) return; 
        setSkills([...skills, { id: Date.now(), name: newSkill, level: "Apprenti" }]); 
        setNewSkill(""); 
    };
    
    const deleteSkill = (id) => { setSkills(skills.filter(s => s.id !== id)); };

    const generateWarTactic = async (skill) => {
        setAnalyzing(skill.id);
        setTacticResult(null);

        const prompt = `
            AGIS COMME UN GÉNÉRAL EN GUERRE ÉCONOMIQUE.
            SOLDAT : Possède la compétence "${skill.name}".
            TERRAIN : ${userZone.name}.
            DEVISE : ${currency}.
            MISSION : Donne-moi UNE SEULE stratégie d'attaque immédiate (Guérilla Marketing) pour trouver un client AUJOURD'HUI.
            FORMAT DE RÉPONSE STRICT (JSON) :
            {
                "target": "Qui aller voir précisément",
                "action": "L'action exacte",
                "price": "Prix psychologique (juste le chiffre)",
                "pitch": "Une phrase d'accroche tueuse"
            }
        `;

        try {
            // Utilisation du modèle PRO pour l'Arsenal
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error.message);
            }

            if (data.candidates && data.candidates[0].content) {
                const rawText = data.candidates[0].content.parts[0].text;
                const cleanJson = rawText.replace(/```json|```/g, '').trim();
                const tactic = JSON.parse(cleanJson);
                setTacticResult({ ...tactic, skillName: skill.name });
            }
        } catch (error) {
            console.error("Erreur Tactique:", error);
            alert("Erreur QG : " + error.message);
        } finally {
            setAnalyzing(null);
        }
    };

    // 👇 J'AI RETIRÉ <PageTransition> ICI 👇
    return (
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Arsenal Tactique</h1>
                <div className="flex items-center gap-2 mt-2"><Globe className="w-3 h-3 text-gold" /><span className="text-[10px] text-gray-400 uppercase">Zone d'Opération : {userZone.name}</span></div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                <div className="space-y-4">
                    {skills.map(skill => (
                        <div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg group hover:border-gold/30 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-900 rounded-lg text-gold"><Zap className="w-4 h-4 fill-current" /></div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-200">{skill.name}</p>
                                        <p className="text-[10px] text-gray-500 uppercase">Arme enregistrée</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteSkill(skill.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            
                            <button 
                                onClick={() => generateWarTactic(skill)} 
                                disabled={analyzing === skill.id}
                                className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded px-3 py-3 flex items-center justify-center gap-2 text-xs text-gold transition-colors uppercase tracking-widest font-bold"
                            >
                                {analyzing === skill.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <><Sword className="w-4 h-4"/> Générer Plan d'Attaque</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* MODALE DE RÉSULTAT TACTIQUE */}
            {tacticResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in">
                    <div className="bg-[#1a1a1a] border border-gold w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                        <button onClick={() => setTacticResult(null)} className="absolute top-4 right-4 text-gray-500"><X className="w-5 h-5"/></button>
                        
                        <div className="mb-6 border-b border-white/10 pb-4">
                            <p className="text-[10px] text-gold uppercase tracking-widest mb-1">Cible Identifiée</p>
                            <h3 className="text-white font-serif text-lg font-bold leading-tight">{tacticResult.target}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Manœuvre (Action)</p>
                                <p className="text-sm text-gray-200 bg-black/40 p-3 rounded border-l-2 border-gold">{tacticResult.action}</p>
                            </div>
                            
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Arme Verbale (Pitch)</p>
                                <p className="text-sm text-gray-300 italic">"{tacticResult.pitch}"</p>
                            </div>

                            <div className="pt-4 flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase">Revenu Estimé</span>
                                <span className="text-xl font-bold text-gold font-serif">{tacticResult.price} {currency}</span>
                            </div>
                        </div>

                        <button onClick={() => setTacticResult(null)} className="w-full mt-6 bg-gold text-black font-bold py-3 rounded text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors">
                            À vos ordres
                        </button>
                    </div>
                </div>
            )}

            <div className="shrink-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
                <form onSubmit={addSkill} className="flex gap-2">
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Nouvelle Compétence..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                    <button type="submit" disabled={!newSkill.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button>
                </form>
            </div>
        </div>
    );
}

// ==========================================
// 5. TROPHÉES
// ==========================================
function TrophiesScreen({ onBack }) {
    const balance = JSON.parse(localStorage.getItem('imperium_balance') || "0");
    const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]");
    const projects = JSON.parse(localStorage.getItem('imperium_projects') || "[]");
    
    const calculateStreak = () => {
        if (transactions.length === 0) return 0;
        const lastSin = transactions.find(t => t.type === 'expense' && t.category === 'want');
        if (!lastSin) return Math.min(transactions.length, 30);
        const lastSinDate = new Date(lastSin.rawDate || Date.now());
        const diffTime = Math.abs(new Date() - lastSinDate);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    };
    const streak = calculateStreak();

    return (
        <PageTransition>
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Salle des Trophées</h1>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                    {TROPHIES_DATA.map(trophy => {
                        const isUnlocked = trophy.condition(balance, streak, projects);
                        const TrophyIcon = trophy.icon;
                        return (
                            <div key={trophy.id} className={`p-4 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${isUnlocked ? 'bg-[#111] border-gold/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]' : 'bg-black border-white/5 opacity-50 grayscale'}`}>
                                <div className={`p-3 rounded-full ${isUnlocked ? 'bg-gold/10 text-gold' : 'bg-gray-900 text-gray-600'}`}>
                                    {isUnlocked ? <TrophyIcon className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className={`text-sm font-bold ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>{trophy.title}</h3>
                                    <p className="text-[10px] text-gray-500 mt-1 leading-tight">{trophy.desc}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
        </PageTransition>
    );
}

// ==========================================
// 6. PROJET & STRATÉGIE (MULTI-PROJETS)
// ==========================================
function ProjectScreen({ onBack }) { 
    // GESTION DES PROJETS MULTIPLES
    const [projects, setProjects] = useState(() => {
        const saved = localStorage.getItem('imperium_projects');
        if (saved) return JSON.parse(saved);
        const oldName = localStorage.getItem('imperium_project_name');
        const oldTasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
        if (oldName) {
            return [{ id: Date.now(), title: oldName, deadline: "", tasks: oldTasks, answers: {} }];
        }
        return [];
    });
    
    const [activeProject, setActiveProject] = useState(null); 
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDeadline, setNewProjectDeadline] = useState("");
    const [newTask, setNewTask] = useState("");

    useEffect(() => { localStorage.setItem('imperium_projects', JSON.stringify(projects)); }, [projects]);

    const addProject = (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        setProjects([...projects, { id: Date.now(), title: newProjectName, deadline: newProjectDeadline, tasks: [], answers: {} }]);
        setNewProjectName(""); setNewProjectDeadline("");
    };

    const deleteProject = (id, e) => {
        e.stopPropagation();
        if(confirm("Confirmer l'abandon de ce front ?")) {
             setProjects(projects.filter(p => p.id !== id));
             if(activeProject && activeProject.id === id) setActiveProject(null);
        }
    };

    const addTask = (e) => { 
        e.preventDefault(); 
        if (!newTask.trim() || !activeProject) return; 
        const updatedProjects = projects.map(p => {
            if (p.id === activeProject.id) {
                return { ...p, tasks: [...(p.tasks || []), { id: Date.now(), text: newTask, done: false }] };
            }
            return p;
        });
        setProjects(updatedProjects);
        setActiveProject(updatedProjects.find(p => p.id === activeProject.id));
        setNewTask(""); 
    }; 
    
    const toggleTask = (taskId) => { 
        const updatedProjects = projects.map(p => {
            if (p.id === activeProject.id) {
                const newTasks = p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
                return { ...p, tasks: newTasks };
            }
            return p;
        });
        setProjects(updatedProjects);
        setActiveProject(updatedProjects.find(p => p.id === activeProject.id));
    }; 
    
    const deleteTask = (taskId) => { 
          const updatedProjects = projects.map(p => {
            if (p.id === activeProject.id) {
                return { ...p, tasks: p.tasks.filter(t => t.id !== taskId) };
            }
            return p;
        });
        setProjects(updatedProjects);
        setActiveProject(updatedProjects.find(p => p.id === activeProject.id));
    };

    const updateAnswer = (qId, value) => {
          const updatedProjects = projects.map(p => {
            if (p.id === activeProject.id) {
                return { ...p, answers: { ...(p.answers || {}), [qId]: value } };
            }
            return p;
        });
        setProjects(updatedProjects);
        setActiveProject(updatedProjects.find(p => p.id === activeProject.id));
    };

    // VUE 1 : LISTE DES PROJETS
    if (!activeProject) {
        return (
            <PageTransition>
                <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
                    <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                        <h1 className="text-2xl font-serif text-white font-bold">Conquêtes</h1>
                        <p className="text-[10px] text-gray-500 mt-1">Gérez vos fronts actifs.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4 custom-scrollbar">
                        {projects.length === 0 && <div className="text-center p-10 opacity-50"><Castle className="w-12 h-12 mx-auto mb-4 text-gray-600"/><p className="text-sm">Aucune conquête en cours.</p></div>}
                        
                        {projects.map(p => {
                            const pTasks = p.tasks || [];
                            const progress = pTasks.length === 0 ? 0 : Math.round((pTasks.filter(t => t.done).length / pTasks.length) * 100);
                            const daysLeft = getDaysLeft(p.deadline);
                            return (
                                <div key={p.id} onClick={() => setActiveProject(p)} className="bg-[#111] border border-white/5 p-5 rounded-xl active:scale-[0.98] transition-all cursor-pointer group hover:border-gold/30">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-white font-bold font-serif text-lg">{p.title}</h3>
                                            {daysLeft !== null && (<p className={`text-[10px] font-bold ${daysLeft < 3 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>{daysLeft > 0 ? `${daysLeft} Jours restants` : "Date dépassée"}</p>)}
                                        </div>
                                        <button onClick={(e) => deleteProject(p.id, e)} className="text-gray-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                    <div className="w-full bg-gray-900 rounded-full h-1.5 mb-3"><div className="h-full bg-gold rounded-full" style={{ width: `${progress}%` }}></div></div>
                                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                                        <span>{pTasks.length} Missions</span>
                                        <span>{progress}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="shrink-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
                        <form onSubmit={addProject} className="flex gap-2">
                            <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Nouveau Front..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                            <input type="date" value={newProjectDeadline} onChange={(e) => setNewProjectDeadline(e.target.value)} className="bg-[#111] border border-white/10 rounded-lg px-2 text-white text-xs focus:border-gold outline-none" />
                            <button type="submit" disabled={!newProjectName.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button>
                        </form>
                    </div>
                </div>
            </PageTransition>
        );
    }

    // VUE 2 : DÉTAIL DU PROJET ACTIF
    const pTasks = activeProject.tasks || [];
    const progress = pTasks.length === 0 ? 0 : Math.round((pTasks.filter(t => t.done).length / pTasks.length) * 100);

    return (
        <PageTransition>
            <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
                <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                    <button onClick={() => setActiveProject(null)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour aux Conquêtes</span></button>
                    <h1 className="text-2xl font-serif text-white font-bold">{activeProject.title}</h1>
                    <div className="flex items-center gap-4 mt-4"><div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }}></div></div><span className="text-gold font-bold text-sm">{progress}%</span></div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 pb-32 custom-scrollbar">
                    
                    <div className="mb-8 space-y-4">
                        <div className="flex items-center gap-2 mb-2 opacity-80"><Lightbulb className="w-4 h-4 text-gold" /><h3 className="text-xs font-bold uppercase tracking-widest text-gold">Interrogatoire Tactique</h3></div>
                        {STRATEGIC_QUESTIONS.map(q => (
                            <div key={q.id} className="bg-[#111] border border-white/5 p-4 rounded-lg">
                                <p className="text-xs text-gray-400 mb-2 italic">{q.q}</p>
                                <input 
                                    type="text" 
                                    value={(activeProject.answers && activeProject.answers[q.id]) || ""} 
                                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                                    placeholder="Réponse stratégique..." 
                                    className="w-full bg-black border-b border-white/10 text-white text-sm py-1 focus:border-gold focus:outline-none placeholder-gray-800"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 mb-4 opacity-80"><CheckSquare className="w-4 h-4 text-white" /><h3 className="text-xs font-bold uppercase tracking-widest text-white">Plan de Bataille</h3></div>
                    <div className="space-y-3">
                        {pTasks.map(task => (
                            <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${task.done ? 'bg-dark border-transparent opacity-50' : 'bg-[#111] border-white/5'}`}>
                                <button onClick={() => toggleTask(task.id)} className="mt-0.5 text-gold hover:scale-110 transition-transform">{task.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
                                <p className={`flex-1 text-sm ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.text}</p>
                                <button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4" /></button>
                            </div>
                        ))}
                        {pTasks.length === 0 && <p className="text-gray-600 text-xs italic">Aucune mission définie. L'ennemi avance.</p>}
                    </div>
                </div>

                <div className="shrink-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full">
                    <form onSubmit={addTask} className="flex gap-2">
                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nouvelle mission..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                        <button type="submit" disabled={!newTask.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>
        </PageTransition>
    ); 
}

// ==========================================
// 9. LA CITADELLE (CALCULATEUR DE SURVIE)
// ==========================================
function CitadelScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const balance = JSON.parse(localStorage.getItem('imperium_balance') || "0");
    const bunker = JSON.parse(localStorage.getItem('imperium_bunker') || "0");
    const protocols = JSON.parse(localStorage.getItem('imperium_protocols') || "[]");

    // 1. CALCUL DES RESSOURCES TOTALES
    const totalLiquidity = parseFloat(balance) + parseFloat(bunker);

    // 2. CALCUL DE LA CONSOMMATION MENSUELLE (CHARGES FIXES)
    const monthlyBurn = protocols
        .filter(p => p.type === 'expense')
        .reduce((acc, p) => {
            const freq = FREQUENCIES.find(f => f.id === (p.freq || 'monthly'));
            return acc + (p.amount * (freq ? freq.factor : 1));
        }, 0);

    // 3. CALCUL DE L'AUTONOMIE
    let survivalMonths = 0;
    let status = { title: "INCONNU", color: "text-gray-500", desc: "Données insuffisantes." };

    if (monthlyBurn > 0) {
        survivalMonths = totalLiquidity / monthlyBurn;
        
        if (survivalMonths < 1) status = { title: "CRITIQUE", color: "text-red-600", desc: "Effondrement imminent. Réduisez les charges immédiatement." };
        else if (survivalMonths < 3) status = { title: "VULNÉRABLE", color: "text-orange-500", desc: "Position fragile. Renforcez le Bunker." };
        else if (survivalMonths < 6) status = { title: "STABLE", color: "text-[#F4D35E]", desc: "Défense standard. Continuez l'expansion." };
        else status = { title: "IMPRENABLE", color: "text-green-500", desc: "Forteresse économique. Vous dominez le temps." };
    } else {
        status = { title: "INFINI", color: "text-green-500", desc: "Aucune charge fixe détectée." };
        survivalMonths = 999;
    }

    const survivalDays = Math.floor(survivalMonths * 30);

    return (
        <PageTransition>
            <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
                <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2">
                        <ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span>
                    </button>
                    <h1 className="text-2xl font-serif text-white font-bold">La Citadelle</h1>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Simulateur de Siège</p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                    
                    {/* INDICATEUR PRINCIPAL */}
                    <div className={`p-6 rounded-2xl border ${survivalMonths < 1 ? 'bg-red-900/10 border-red-500/30' : 'bg-[#111] border-white/10'} text-center mb-6 relative overflow-hidden`}>
                        <div className={`absolute top-0 right-0 p-4 opacity-10 ${status.color}`}><Shield className="w-32 h-32"/></div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Autonomie Estimée</p>
                        <h2 className={`text-5xl font-serif font-bold ${status.color} mb-2`}>
                            {survivalMonths > 120 ? "∞" : survivalMonths.toFixed(1)} <span className="text-lg text-gray-500">Mois</span>
                        </h2>
                        <p className={`text-xs font-bold ${status.color} uppercase tracking-widest border px-3 py-1 rounded inline-block border-current/30`}>
                            État : {status.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-4 italic">{status.desc}</p>
                    </div>

                    {/* DÉTAILS TECHNIQUES */}
                    <div className="space-y-3">
                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-900/20 rounded-lg text-blue-400"><Smartphone className="w-5 h-5"/></div>
                                <div><p className="text-xs text-gray-400">Ressources Totales</p><p className="text-sm font-bold text-white">Cash + Wave</p></div>
                            </div>
                            <span className="font-mono text-white font-bold">{formatMoney(totalLiquidity)} {currency}</span>
                        </div>

                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Activity className="w-5 h-5"/></div>
                                <div><p className="text-xs text-gray-400">Consommation</p><p className="text-sm font-bold text-white">Charges Mensuelles</p></div>
                            </div>
                            <span className="font-mono text-red-400 font-bold">-{formatMoney(monthlyBurn)} {currency}</span>
                        </div>
                    </div>

                    {/* VISUALISATION */}
                    <div className="mt-8">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-4 text-center">Scénario de Survie (Jours)</h3>
                        <div className="flex gap-1 h-12 items-end justify-center">
                            {Array.from({ length: 12 }).map((_, i) => {
                                const active = i < survivalMonths;
                                return (
                                    <div key={i} className={`w-2 rounded-t-sm transition-all duration-500 ${active ? status.color.replace('text-', 'bg-') : 'bg-gray-800'}`} style={{ height: active ? '100%' : '20%' }}></div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between text-[9px] text-gray-600 mt-2 uppercase font-mono">
                            <span>Aujourd'hui</span>
                            <span>+6 Mois</span>
                            <span>+1 An</span>
                        </div>
                    </div>

                    {monthlyBurn === 0 && (
                        <div className="mt-6 p-4 bg-yellow-900/10 border border-yellow-500/20 rounded-lg text-center">
                            <p className="text-yellow-500 text-xs">⚠️ Configurez vos charges fixes dans "Protocoles" pour activer le calculateur.</p>
                        </div>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

// ==========================================
// 10. L'ACADÉMIE (BIBLIOTHÈQUE)
// ==========================================
function AcademyScreen({ onBack }) {
    const [selectedModule, setSelectedModule] = useState(null);

    return (
        <PageTransition>
            <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
                <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2">
                        <ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span>
                    </button>
                    <h1 className="text-2xl font-serif text-white font-bold">Académie</h1>
                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">Base de connaissances stratégiques</p>
                </div>

                <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar">
                    <div className="grid gap-4">
                        {KNOWLEDGE_BASE.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button 
                                    key={item.id} 
                                    onClick={() => setSelectedModule(item)}
                                    className="bg-[#111] border border-white/5 hover:border-gold/30 p-5 rounded-xl text-left group transition-all active:scale-[0.98] relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><Icon className="w-16 h-16 text-white"/></div>
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="p-3 bg-[#1a1a1a] rounded-lg text-gold border border-white/5 group-hover:bg-gold group-hover:text-black transition-colors">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white group-hover:text-gold transition-colors">{item.title}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">{item.subtitle}</p>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MODALE DE LECTURE */}
            {selectedModule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in">
                    <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col">
                        <button onClick={() => setSelectedModule(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-6 h-6"/></button>
                        
                        <div className="shrink-0 mb-6 text-center">
                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-gold/20">
                                <selectedModule.icon className="w-8 h-8 text-gold" />
                            </div>
                            <h2 className="text-xl font-serif font-bold text-white">{selectedModule.title}</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{selectedModule.subtitle}</p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                                {selectedModule.content}
                            </p>
                        </div>

                        <div className="shrink-0 mt-6 pt-4 border-t border-white/5">
                            <button onClick={() => setSelectedModule(null)} className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-colors">
                                Compris, Commandant
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageTransition>
    );
}

// ==========================================
// 12. ÉCRAN PARAMÈTRES (CORRIGÉ)
// ==========================================
function SettingsScreen({ onBack }) { 
    // ÉTATS
    const [importData, setImportData] = useState("");
    const [exportCode, setExportCode] = useState(""); 
    const [sending, setSending] = useState(false);
    
    // Identité (Inclusion)
    const [gender, setGender] = useState(localStorage.getItem('imperium_gender') || 'M');

    // Notifications
    const [notifTime, setNotifTime] = useState(localStorage.getItem('imperium_notif_time') || "20:00");
    const [notifEnabled, setNotifEnabled] = useState(localStorage.getItem('imperium_notif_enabled') === 'true');

    // Calibrage
    const [calibBalance, setCalibBalance] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0"));
    const [calibBunker, setCalibBunker] = useState(JSON.parse(localStorage.getItem('imperium_bunker') || "0"));

    // Feedback
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState("");

    // --- LOGIQUE IDENTITÉ ---
    const changeGender = (newGender) => {
        setGender(newGender);
        localStorage.setItem('imperium_gender', newGender);
    };

    // --- LOGIQUE NOTIFICATIONS ---
    const toggleNotifications = async () => {
        if (!notifEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotifEnabled(true);
                localStorage.setItem('imperium_notif_enabled', 'true');
                new Notification("IMPERIUM", { body: "Canal de communication sécurisé activé." });
            } else {
                alert("Permission refusée. Vérifiez les réglages du navigateur.");
            }
        } else {
            setNotifEnabled(false);
            localStorage.setItem('imperium_notif_enabled', 'false');
        }
    };

    const handleNotifTimeChange = (e) => {
        setNotifTime(e.target.value);
        localStorage.setItem('imperium_notif_time', e.target.value);
    };

    const testNotification = () => {
        if (Notification.permission === 'granted') {
            const title = gender === 'F' ? 'Commandante' : 'Commandant';
            new Notification("RAPPEL DU QG", { 
                body: `${title}, il est temps de faire le bilan. L'ennemi ne dort jamais.`,
                icon: '/icon.png'
            });
        } else {
            alert("Activez d'abord les notifications via le bouton ci-dessus.");
        }
    };

    const handleImport = () => { 
        try { 
            if(!importData) return; 
            const jsonString = decodeURIComponent(escape(atob(importData)));
            const decoded = JSON.parse(jsonString); 
            
            if(decoded.balance) localStorage.setItem('imperium_balance', decoded.balance); 
            if(decoded.transactions) localStorage.setItem('imperium_transactions', decoded.transactions); 
            if(decoded.projects) localStorage.setItem('imperium_projects', decoded.projects);
            if(decoded.project) localStorage.setItem('imperium_project_name', decoded.project); 
            if(decoded.tasks) localStorage.setItem('imperium_tasks', decoded.tasks); 
            if(decoded.skills) localStorage.setItem('imperium_skills', decoded.skills); 
            if(decoded.currency) localStorage.setItem('imperium_currency', decoded.currency); 
            if(decoded.zone) localStorage.setItem('imperium_zone', decoded.zone); 
            if(decoded.onboarded) localStorage.setItem('imperium_onboarded', decoded.onboarded); 
            if(decoded.bunker) localStorage.setItem('imperium_bunker', decoded.bunker);
            if(decoded.goals) localStorage.setItem('imperium_goals', decoded.goals);
            if(decoded.protocols) localStorage.setItem('imperium_protocols', decoded.protocols);
            if(decoded.debts) localStorage.setItem('imperium_debts', decoded.debts);
            if(decoded.version) localStorage.setItem('imperium_version', decoded.version);
            if(decoded.license) localStorage.setItem('imperium_license', decoded.license); 
            if(decoded.gender) localStorage.setItem('imperium_gender', decoded.gender); 
            
            alert("✅ RESTAURATION RÉUSSIE."); 
            window.location.reload(); 
        } catch (e) { 
            alert("❌ ERREUR : Code invalide."); 
        } 
    }; 

    const handleExport = () => {
         const data = {
            balance: localStorage.getItem('imperium_balance'),
            transactions: localStorage.getItem('imperium_transactions'),
            projects: localStorage.getItem('imperium_projects'),
            skills: localStorage.getItem('imperium_skills'),
            currency: localStorage.getItem('imperium_currency'),
            zone: localStorage.getItem('imperium_zone'),
            bunker: localStorage.getItem('imperium_bunker'),
            goals: localStorage.getItem('imperium_goals'),
            protocols: localStorage.getItem('imperium_protocols'),
            debts: localStorage.getItem('imperium_debts'),
            version: APP_VERSION,
            license: localStorage.getItem('imperium_license'),
            gender: localStorage.getItem('imperium_gender')
         };
         const jsonString = JSON.stringify(data);
         const encoded = btoa(unescape(encodeURIComponent(jsonString)));
         setExportCode(encoded);
    };

    const handleRecalibrate = () => {
        if(confirm("Confirmer le recalibrage manuel des soldes ?")) {
            localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(calibBalance) || 0));
            localStorage.setItem('imperium_bunker', JSON.stringify(parseFloat(calibBunker) || 0));
            alert("SYSTÈME RECALIBRÉ.");
            window.location.reload();
        }
    };
    
    const resetEmpire = () => { 
        if(confirm("DANGER : Voulez-vous vraiment TOUT effacer ?")) { 
            localStorage.clear(); 
            window.location.reload(); 
        } 
    }; 

    const sendFeedbackToHQ = async () => {
        if (!feedbackText.trim()) return;
        setSending(true);
        const FORM_ENDPOINT = "https://formspree.io/f/xdadkygr"; 
        try {
            const payload = {
                message: feedbackText,
                version: localStorage.getItem('imperium_version') || "Inconnue",
                date: new Date().toLocaleString(),
            };
            const response = await fetch(FORM_ENDPOINT, {
                method: "POST", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
            });
            if (response.ok) {
                alert("✅ TRANSMISSION REÇUE AU QG.");
                setFeedbackText(""); setShowFeedback(false);
            } else { alert("⚠️ ÉCHEC TRANSMISSION."); }
        } catch (error) { alert("⚠️ ERREUR RÉSEAU."); } finally { setSending(false); }
    };

    return (
        <PageTransition>
            <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
                <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                    <h1 className="text-2xl font-serif text-white font-bold">Paramètres</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">

                    {/* IDENTITÉ DU COMMANDANT */}
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg"><UserCircle className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Profil du Commandant</h3><p className="text-[10px] text-gray-500">Ajustez les protocoles vocaux.</p></div>
                        </div>
                        <div className="flex bg-black p-1 rounded-lg border border-white/5">
                            <button onClick={() => changeGender('M')} className={`flex-1 py-3 text-xs font-bold uppercase rounded transition-colors ${gender === 'M' ? 'bg-gold text-black' : 'text-gray-600'}`}>Commandant</button>
                            <button onClick={() => changeGender('F')} className={`flex-1 py-3 text-xs font-bold uppercase rounded transition-colors ${gender === 'F' ? 'bg-gold text-black' : 'text-gray-600'}`}>Commandante</button>
                        </div>
                    </div>

                    {/* RAPPELS TACTIQUES */}
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5">
                         <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-900/20 text-purple-400 rounded-lg"><Bell className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Rappels Tactiques</h3><p className="text-[10px] text-gray-500">Ne laissez pas l'ennemi gagner par oubli.</p></div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-300">Activer les Notifications</span>
                            <button onClick={toggleNotifications} className={`w-12 h-6 rounded-full p-1 transition-colors ${notifEnabled ? 'bg-green-500' : 'bg-gray-700'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${notifEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </button>
                        </div>

                        {notifEnabled && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between bg-black p-3 rounded-lg border border-white/5">
                                    <span className="text-xs text-gray-400">Heure du Rapport</span>
                                    <input type="time" value={notifTime} onChange={handleNotifTimeChange} className="bg-transparent text-white text-sm font-bold outline-none font-mono"/>
                                </div>
                                <button onClick={testNotification} className="w-full bg-purple-900/20 text-purple-400 border border-purple-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest hover:bg-purple-900/40 transition-colors">
                                    Tester le Signal (Démo)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ZONE CLOUD IMPERIUM */}
                    <div className="bg-[#1a1a1a] rounded-xl p-5 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Globe className="w-24 h-24 text-blue-500" />
                        </div>

                        <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-blue-400"/> Liaison Satellitaire
                        </h3>

                        {!auth.currentUser ? (
                            <div>
                                <p className="text-xs text-gray-400 mb-4">
                                    Connectez-vous au Cloud Impérial pour sécuriser vos données et synchroniser vos appareils.
                                </p>
                                <button 
                                    onClick={async () => {
                                        try {
                                            await loginWithGoogle();
                                            alert("📡 Connexion établie. Synchronisation...");
                                        } catch (e) {
                                            alert("Échec connexion satellite.");
                                        }
                                    }}
                                    className="w-full bg-white text-black font-bold py-3 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
                                >
                                    Connexion Google
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 mb-4 bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
                                    {auth.currentUser.photoURL && (
                                        <img src={auth.currentUser.photoURL} alt="Avatar" className="w-10 h-10 rounded-full border border-blue-400" />
                                    )}
                                    <div>
                                        <p className="text-xs text-blue-300 font-bold uppercase">Liaison Active</p>
                                        <p className="text-[10px] text-white">{auth.currentUser.email}</p>
                                    </div>
                                </div>
                                
                                <p className="text-[10px] text-gray-500 italic mb-4">
                                    ✅ Sauvegarde automatique activée. Vos données sont en sécurité dans le bunker Google.
                                </p>

                                <button 
                                    onClick={logoutUser}
                                    className="w-full border border-red-500/30 text-red-500 font-bold py-2 rounded-lg text-xs hover:bg-red-900/20 transition-colors uppercase tracking-widest"
                                >
                                    Couper la liaison
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* FEEDBACK */}
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gold/20 relative overflow-hidden">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gold/10 text-gold rounded-lg"><MessageSquare className="w-5 h-5"/></div>
                            <div>
                                <h3 className="text-sm font-bold text-gray-200">Rapport au QG</h3>
                                <p className="text-[10px] text-gray-500">Un bug ? Une idée ? Informez l'Architecte.</p>
                            </div>
                        </div>
                        <button onClick={() => setShowFeedback(true)} className="w-full bg-gold/10 hover:bg-gold/20 text-gold border border-gold/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" /> Transmettre
                        </button>
                    </div>

                    {/* CALIBRAGE */}
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5"><RefreshCw className="w-24 h-24 text-white" /></div>
                         <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-white/10 text-white rounded-lg"><RefreshCw className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Calibrage du Système</h3><p className="text-[10px] text-gray-500">Correction manuelle des soldes.</p></div>
                        </div>
                        <div className="space-y-4 relative z-10">
                            <div><label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Solde Cash/OM Actuel</label><input type="number" value={calibBalance} onChange={(e) => setCalibBalance(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" /></div>
                            <div><label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Solde Wave (Bunker) Actuel</label><input type="number" value={calibBunker} onChange={(e) => setCalibBunker(e.target.value)} className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" /></div>
                            <button onClick={handleRecalibrate} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-colors">Appliquer les Corrections</button>
                        </div>
                    </div>

                    {/* SAUVEGARDE MANUELLE */}
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg"><Download className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Sauvegarde Manuelle (Backup)</h3><p className="text-[10px] text-gray-500">Générez un code unique.</p></div>
                        </div>
                        
                        <button onClick={handleExport} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mb-3">
                            <Copy className="w-4 h-4" /> GÉNÉRER & COPIER
                        </button>
                        
                        {exportCode && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] text-gray-500 mb-1">Code généré :</p>
                                <textarea readOnly value={exportCode} className="w-full h-24 bg-black border border-blue-500/30 rounded-lg p-3 text-[10px] text-blue-300 font-mono focus:outline-none break-all" onClick={(e) => e.target.select()}></textarea>
                            </div>
                        )}
                    </div>
                    
                    {/* RESTAURATION */}
                    <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-900/20 text-green-400 rounded-lg"><Upload className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Restaurer les données</h3><p className="text-[10px] text-gray-500">Collez le code ici.</p></div>
                        </div>
                        <textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Collez votre code ici..." className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:border-gold focus:outline-none h-20 mb-3 font-mono"/>
                        <button onClick={handleImport} disabled={!importData} className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50 transition-colors">Restaurer</button>
                    </div>
                    
                    {/* RESET */}
                    <div className="pt-10 border-t border-white/5">
                        <button onClick={resetEmpire} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-xs uppercase tracking-widest py-4 hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /> Détruire l'Empire (Reset)</button>
                    </div>
                </div>

                {/* MODALE FEEDBACK */}
                {showFeedback && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in">
                        <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                            <button onClick={() => setShowFeedback(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                                <X className="w-5 h-5"/>
                            </button>
                            
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-gold/10 rounded-full text-gold border border-gold/20">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-white font-serif font-bold text-lg">Transmission</h3>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Ligne directe vers l'Architecte</p>
                                </div>
                            </div>

                            <textarea 
                                value={feedbackText} 
                                onChange={(e) => setFeedbackText(e.target.value)} 
                                placeholder="Commandant, je suggère..." 
                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:border-gold focus:outline-none h-32 mb-4 custom-scrollbar resize-none"
                                autoFocus
                            />

                            <button 
                                onClick={sendFeedbackToHQ} 
                                disabled={!feedbackText.trim() || sending} 
                                className="w-full bg-gold text-black font-bold py-3.5 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {sending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                        Transmission...
                                    </>
                                ) : (
                                    "Envoyer le rapport"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    ); 
}