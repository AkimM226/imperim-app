import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe, BarChart3, Flame, Clock, Medal, Lock, Quote, Loader2, Target, PiggyBank, Unlock, Scroll, UserMinus, UserPlus, Repeat, Infinity, CalendarClock, BookOpen, Save, Edit3, Calendar, HelpCircle, Lightbulb, Hourglass, TrendingUp, LayoutGrid, Coins, Landmark, Activity, Trophy, FileText, Info, Smartphone, Wallet, RefreshCw, Undo2, Key, PieChart, Radio, CheckCircle2 } from 'lucide-react';

// ==========================================
// MOTEUR SONORE TACTIQUE (SANS FICHIERS)
// ==========================================
const playSound = (type) => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        
        if (type === 'click') {
            // Petit clic mécanique
            osc.type = 'square';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'success') {
            // Bip de validation aigu
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'error') {
            // Buzz grave d'erreur
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.3);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else if (type === 'radio') {
            // Bruit blanc (static) pour la radio
            const bufferSize = ctx.sampleRate * 0.5; // 0.5 sec
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.05, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            noise.connect(noiseGain);
            noiseGain.connect(ctx.destination);
            noise.start(now);
        }
    } catch (e) { console.error("Audio error", e); }
};

// ==========================================
// CONFIGURATION & DONNÉES
// ==========================================
const APP_VERSION = "16.0.0-Ultimate"; 

const RELEASE_NOTES = [
    {
        version: "16.0.0",
        title: "Opération Sentinelle",
        desc: "L'Empire est complet.",
        changes: [
            { icon: Radio, text: "Ordres du Jour : 3 missions quotidiennes pour maintenir la discipline." },
            { icon: BookOpen, text: "Académie : Base de savoir stratégique." },
            { icon: Shield, text: "Citadelle : Calculateur de survie actif." }
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
    
    // Fonction de navigation principale
    const navigate = (view) => { setCurrentView(view); window.scrollTo(0, 0); };
    
    useEffect(() => { 
        const lastVersion = localStorage.getItem('imperium_version');
        if (lastVersion !== APP_VERSION) { setTimeout(() => setShowPatchNotes(true), 500); }
    }, []);
    const ackPatchNotes = () => { localStorage.setItem('imperium_version', APP_VERSION); setShowPatchNotes(false); };
  
    return (
      <>
          {showPatchNotes && <PatchNotesModal onAck={ackPatchNotes} />}
          
          {/* Le Dashboard gère sa propre navigation interne via le menu du bas */}
          {currentView === 'dashboard' && <Dashboard onNavigate={navigate} />}
          
          {/* Les autres écrans ont un bouton retour */}
          {currentView === 'project' && <ProjectScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'skills' && <SkillsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'stats' && <StatsScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'trophies' && <TrophiesScreen onBack={() => navigate('dashboard')} />}
          {currentView === 'goals' && <GoalsScreen onBack={() => navigate('dashboard')} />}
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
    const [mainProject, setMainProject] = useState('');
    const [currency, setCurrency] = useState('');
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
    const API_KEY = "AIzaSyBjPLcZ1CrRTmIKULCMPctu86D0W7KuRz0"; 
    
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

 // Remplace toute la fonction Dashboard par celle-ci
function Dashboard({ onNavigate }) {

    // DONNÉES
    const [showRadio, setShowRadio] = useState(false);
    const [balance, setBalance] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_balance') || "0"); } catch { return 0; } });
    const [bunker, setBunker] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_bunker') || "0"); } catch { return 0; } });
    const [transactions, setTransactions] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); } catch { return []; } });
    const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_goals') || "[]"); } catch { return []; } });
    const [debts, setDebts] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_debts') || "[]"); } catch { return []; } });
    const [projects, setProjects] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_projects') || "[]"); } catch { return []; } });
    const currency = localStorage.getItem('imperium_currency') || "€";
    
    // ETATS UI
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBunkerModalOpen, setIsBunkerModalOpen] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [pendingTransaction, setPendingTransaction] = useState(null);
  
    // SAISIE
    const [transactionType, setTransactionType] = useState('expense');
    const [expenseCategory, setExpenseCategory] = useState('need'); 
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [bunkerAmount, setBunkerAmount] = useState('');
  
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
    }, [balance, bunker, transactions]);
  
    // FONCTIONS
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!amount) return;
      const value = parseFloat(amount);
      
      if (transactionType === 'income' && (goals.length > 0 || totalBunker >= 0)) {
          setPendingTransaction({ value, description });
          setShowTaxModal(true);
          setIsModalOpen(false);
          setAmount(''); setDescription('');
          return;
      }
      if (transactionType === 'expense') {
          if (value > balance) return alert("Fonds insuffisants (Cash/OM).");
          setBalance(balance - value);
      } else {
          setBalance(balance + value);
      }
      const newTransaction = { id: Date.now(), desc: description || (transactionType === 'expense' ? "Dépense" : "Revenu"), amount: value, type: transactionType, category: expenseCategory, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), rawDate: new Date().toISOString() };
      setTransactions([newTransaction, ...transactions]);
      setAmount(''); setDescription(''); setIsModalOpen(false);
    };
  
    const processIncomeWithTax = (applyTax) => {
        if (!pendingTransaction) return;
        const totalIncome = pendingTransaction.value;
        const taxAmount = applyTax ? Math.floor(totalIncome * 0.2) : 0;
        const keptAmount = totalIncome - taxAmount;
        setBalance(balance + keptAmount);
        setBunker(bunker + taxAmount);
        const incomeTx = { id: Date.now(), desc: pendingTransaction.description || "Revenu", amount: totalIncome, type: 'income', category: 'income', date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), rawDate: new Date().toISOString() };
        setTransactions([incomeTx, ...transactions]);
        setPendingTransaction(null);
        setShowTaxModal(false);
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
  
          {/* ALERTE DETTE PRIORITAIRE (CORRECTION TYPO 'a') */}
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

              <button onClick={() => onNavigate('skills')} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-white/5 active:scale-[0.98]">
                  <Sword className="w-6 h-6 text-white mb-3 opacity-90" /><h3 className="text-sm font-bold text-white">Arsenal</h3><p className="text-[9px] text-gray-500 uppercase tracking-wide">Compétences</p>
              </button>
              <button onClick={() => onNavigate('protocols')} className="bg-[#1a1a1a] rounded-xl p-4 text-left hover:bg-[#222] transition-colors border border-white/5 active:scale-[0.98]">
                  <RefreshCw className="w-6 h-6 text-white mb-3 opacity-90" /><h3 className="text-sm font-bold text-white">Protocole</h3><p className="text-[9px] text-gray-500 uppercase tracking-wide">Rentes/Charges</p>
              </button>
          </div>
          
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
          
           {/* --- BOUTON CITADELLE CORRIGÉ --- */}
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

          {/* BOUTON REGISTRE CORRIGÉ */}
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
  
          {/* BOUTON TROPHÉES CORRIGÉ */}
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
        {showTaxModal && pendingTransaction && (<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-6 animate-in fade-in"><div className="bg-[#111] border border-gold/40 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center"><h3 className="text-[#F4D35E] font-serif text-xl font-bold mb-4">Impôt Impérial (20%)</h3><p className="text-gray-400 text-sm mb-6">Sécuriser une partie de ce revenu dans Wave ?</p><div className="flex gap-3 w-full"><button onClick={() => processIncomeWithTax(false)} className="flex-1 py-3 rounded-lg border border-white/10 text-gray-500 text-xs font-bold uppercase">Non (0%)</button><button onClick={() => processIncomeWithTax(true)} className="flex-1 py-3 rounded-lg bg-[#F4D35E] text-black text-xs font-bold uppercase">Oui (20%)</button></div></div></div>)}
        {showOrders && <OrdersModal onClose={() => setShowOrders(false)} />}
        {showRadio && <RadioLink onClose={() => setShowRadio(false)} />}
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
// 4. ARSENAL (Compétences)
// ==========================================
function SkillsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const savedZone = localStorage.getItem('imperium_zone');
    const userZone = savedZone ? JSON.parse(savedZone) : ZONES[1];
    const [skills, setSkills] = useState(JSON.parse(localStorage.getItem('imperium_skills') || "[]"));
    const [newSkill, setNewSkill] = useState("");
    const [selectedGig, setSelectedGig] = useState(null);
    useEffect(() => { localStorage.setItem('imperium_skills', JSON.stringify(skills)); }, [skills]);
    const addSkill = (e) => { e.preventDefault(); if (!newSkill.trim()) return; setSkills([...skills, { id: Date.now(), name: newSkill, level: "Apprenti" }]); setNewSkill(""); };
    const deleteSkill = (id) => { setSkills(skills.filter(s => s.id !== id)); };
    const findGig = (skillName) => {
        const key = Object.keys(BUSINESS_IDEAS).find(k => skillName.toLowerCase().includes(k));
        const gig = key ? BUSINESS_IDEAS[key] : BUSINESS_IDEAS['default'];
        let finalPrice = gig.price;
        if (currency.includes('FCFA') || currency.includes('XOF') || currency.includes('XAF')) finalPrice = gig.price * 655;
        else if (currency.includes('GNF')) finalPrice = gig.price * 9000;
        else if (currency.includes('CDF')) finalPrice = gig.price * 2500;
        else if (currency.includes('$') && currency !== 'CAD') finalPrice = gig.price * 1.1;
        if (userZone && userZone.factor) finalPrice = finalPrice * userZone.factor;
        if (finalPrice > 1000) finalPrice = Math.round(finalPrice / 500) * 500;
        return { ...gig, displayPrice: formatMoney(finalPrice) };
    };
    return (
        <PageTransition>
        <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Arsenal</h1><div className="flex items-center gap-2 mt-2"><Globe className="w-3 h-3 text-gold" /><span className="text-[10px] text-gray-400 uppercase">Marché : {userZone ? userZone.name : "Monde"}</span></div>
            </div>
            <div className="flex-1 overflow-y-auto p-5 pb-20 custom-scrollbar"><div className="space-y-4">{skills.map(skill => { const gig = findGig(skill.name); return (<div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg group hover:border-gold/30 transition-colors"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-3"><div className="p-2 bg-gray-900 rounded-lg text-gold"><Zap className="w-4 h-4 fill-current" /></div><div><p className="text-sm font-bold text-gray-200">{skill.name}</p><p className="text-[10px] text-gray-500 uppercase">Potentiel Détecté</p></div></div><button onClick={() => deleteSkill(skill.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button></div><button onClick={() => setSelectedGig(gig)} className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded px-3 py-2 flex items-center justify-between text-xs text-gold transition-colors"><span className="flex items-center gap-2"><Briefcase className="w-3 h-3"/> Monétiser cette compétence</span><span className="font-bold">~{gig.displayPrice} {currency}</span></button></div>)})}</div></div>
            {selectedGig && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in"><div className="bg-[#1a1a1a] border border-gold w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"><button onClick={() => setSelectedGig(null)} className="absolute top-4 right-4 text-gray-500"><X className="w-5 h-5"/></button><h3 className="text-gold font-serif text-xl mb-1">{selectedGig.title}</h3><p className="text-white font-bold text-2xl mb-4">{selectedGig.displayPrice} {currency}</p><div className="bg-black/50 p-4 rounded-lg border border-white/10 mb-4"><p className="text-xs text-gray-400 uppercase mb-2">Ordre de Mission :</p><p className="text-sm text-gray-200 leading-relaxed">{selectedGig.task}</p></div><button onClick={() => setSelectedGig(null)} className="w-full bg-gold text-black font-bold py-3 rounded text-xs uppercase tracking-widest">J'accepte le défi</button></div></div>)}
            <div className="shrink-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto w-full"><form onSubmit={addSkill} className="flex gap-2"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence (Infographie, Anglais...)" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newSkill.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form></div>
        </div>
        </PageTransition>
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

function SettingsScreen({ onBack }) { 
    const [importData, setImportData] = useState("");
    const [exportCode, setExportCode] = useState(""); 
    
    // CALIBRAGE STATES
    const [calibBalance, setCalibBalance] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0"));
    const [calibBunker, setCalibBunker] = useState(JSON.parse(localStorage.getItem('imperium_bunker') || "0"));

    const handleExport = () => { 
        const data = { 
            balance: localStorage.getItem('imperium_balance'), 
            transactions: localStorage.getItem('imperium_transactions'), 
            projects: localStorage.getItem('imperium_projects'),
            tasks: localStorage.getItem('imperium_tasks'), 
            skills: localStorage.getItem('imperium_skills'), 
            currency: localStorage.getItem('imperium_currency'), 
            zone: localStorage.getItem('imperium_zone'), 
            onboarded: localStorage.getItem('imperium_onboarded'), 
            bunker: localStorage.getItem('imperium_bunker'),
            version: localStorage.getItem('imperium_version'),
            license: localStorage.getItem('imperium_license') 
        }; 
        const encoded = btoa(JSON.stringify(data)); 
        setExportCode(encoded); 
        
        navigator.clipboard.writeText(encoded)
            .then(() => alert("CODE D'ARCHIVE COPIÉ."))
            .catch(() => alert("Copie automatique échouée. Veuillez copier le code affiché manuellement."));
    }; 
    
    const handleImport = () => { 
        try { 
            if(!importData) return; 
            const decoded = JSON.parse(atob(importData)); 
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
            if(decoded.version) localStorage.setItem('imperium_version', decoded.version);
            if(decoded.license) localStorage.setItem('imperium_license', decoded.license); 
            alert("✅ RESTAURATION RÉUSSIE."); 
            window.location.reload(); 
        } catch (e) { alert("❌ ERREUR : Code invalide."); } 
    }; 

    const handleRecalibrate = () => {
        if(confirm("Confirmer le recalibrage manuel des soldes ?")) {
            localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(calibBalance) || 0));
            localStorage.setItem('imperium_bunker', JSON.stringify(parseFloat(calibBunker) || 0));
            alert("SYSTÈME RECALIBRÉ.");
            window.location.reload();
        }
    };
    
    const resetEmpire = () => { if(confirm("DANGER : Voulez-vous vraiment TOUT effacer ?")) { localStorage.clear(); window.location.reload(); } }; 

    return (
        <PageTransition>
            <div className="h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col overflow-hidden">
                <div className="shrink-0 px-5 py-4 bg-[#151515] border-b border-white/5 pt-16 z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                    <h1 className="text-2xl font-serif text-white font-bold">Paramètres</h1>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
                    
                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5"><RefreshCw className="w-24 h-24 text-white" /></div>
                         <div className="flex items-center gap-3 mb-4 relative z-10">
                            <div className="p-2 bg-white/10 text-white rounded-lg"><RefreshCw className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Calibrage du Système</h3><p className="text-[10px] text-gray-500">Correction manuelle des soldes.</p></div>
                        </div>
                        
                        <div className="space-y-4 relative z-10">
                            <div>
                                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Solde Cash/OM Actuel</label>
                                <input type="number" value={calibBalance} onChange={(e) => setCalibBalance(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-gold outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">Solde Wave (Bunker) Actuel</label>
                                <input type="number" value={calibBunker} onChange={(e) => setCalibBunker(e.target.value)} className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
                            </div>
                            <button onClick={handleRecalibrate} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-bold py-3 rounded-lg text-xs uppercase tracking-widest transition-colors">Appliquer les Corrections</button>
                        </div>
                    </div>

                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg"><Download className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Sauvegarder l'Empire</h3><p className="text-[10px] text-gray-500">Générez un code unique.</p></div>
                        </div>
                        <button onClick={handleExport} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors mb-3"><Copy className="w-4 h-4" /> Générer Code</button>
                        
                        {exportCode && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <p className="text-[10px] text-gray-500 mb-1">Copiez ce code manuellement si besoin :</p>
                                <textarea readOnly value={exportCode} className="w-full h-24 bg-black border border-blue-500/30 rounded-lg p-2 text-[10px] text-blue-300 font-mono focus:outline-none" onClick={(e) => e.target.select()}></textarea>
                            </div>
                        )}
                    </div>
                    
                    <div className="bg-[#111] border border-white/5 rounded-xl p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-900/20 text-green-400 rounded-lg"><Upload className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Restaurer les données</h3><p className="text-[10px] text-gray-500">Collez le code ici.</p></div>
                        </div>
                        <textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Collez votre code ici..." className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:border-gold focus:outline-none h-20 mb-3 font-mono"/>
                        <button onClick={handleImport} disabled={!importData} className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50 transition-colors">Restaurer</button>
                    </div>
                    
                    <div className="pt-10 border-t border-white/5">
                        <button onClick={resetEmpire} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-xs uppercase tracking-widest py-4 hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /> Détruire l'Empire (Reset)</button>
                    </div>
                </div>
            </div>
        </PageTransition>
    ); 
}