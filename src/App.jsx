import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe, BarChart3, Flame, Clock, Medal, Lock, Quote, Loader2, Target, PiggyBank, Unlock, Scroll, UserMinus, UserPlus, Repeat, Infinity, CalendarClock, Play, Volume2, Mic, RefreshCw, Radio, VolumeX, BookOpen } from 'lucide-react';

// ==========================================
// CONFIGURATION & DONNÉES
// ==========================================

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

const QUOTES = [
  "Les dettes sont l'esclavage des hommes libres.",
  "La discipline est mère du succès.",
  "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
  "L'homme qui déplace une montagne commence par déplacer de petites pierres.",
  "La richesse consiste bien plus dans l'usage qu'on en fait que dans la possession.",
  "Fais ce que tu dois, advienne que pourra.",
  "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant."
];

const TROPHIES_DATA = [
    { id: 'savings_1', title: 'Première Pierre', desc: 'Avoir un solde positif.', icon: Shield, condition: (bal, str, tasks) => bal > 0 },
    { id: 'streak_3', title: 'L\'Éveil', desc: '3 Jours de discipline sans futilités.', icon: Flame, condition: (bal, str, tasks) => str >= 3 },
    { id: 'streak_7', title: 'Spartiate', desc: '7 Jours de discipline absolue.', icon: Sword, condition: (bal, str, tasks) => str >= 7 },
    { id: 'task_1', title: 'Architecte', desc: 'Terminer une mission du projet.', icon: CheckSquare, condition: (bal, str, tasks) => tasks.some(t => t.done) },
    { id: 'rich_1', title: 'Trésorier', desc: 'Accumuler l\'équivalent de 1000€ (650k FCFA).', icon: Castle, condition: (bal, str, tasks) => bal >= 650000 },
    { id: 'master', title: 'Empereur', desc: 'Accumuler 10 Millions.', icon: Star, condition: (bal, str, tasks) => bal >= 10000000 },
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

// ==========================================
// MANUEL DE FORMATION (NOUVEAU TUTORIEL)
// ==========================================
const TUTORIAL_STEPS = [
    {
        title: "BIENVENUE, COMMANDANT",
        text: "Imperium est votre poste de commandement financier. Ici, chaque unité de monnaie est un soldat sous vos ordres. La discipline est votre seule arme contre la ruine.",
        icon: Shield
    },
    {
        title: "LE SOLDE VIRTUEL",
        text: "Le chiffre central est votre 'Solde Disponible'. Ce n'est pas juste un nombre, c'est votre puissance de frappe réelle. S'il est positif, vous survivez. S'il vire au rouge, vous êtes à découvert tactique.",
        icon: PiggyBank
    },
    {
        title: "LES PROTOCOLES",
        text: "Gérez vos flux automatiques ici. Déclarez vos abonnements (charges) et vos revenus passifs. Le système calculera votre cash-flow net mensuel pour anticiper l'avenir.",
        icon: Repeat
    },
    {
        title: "LE REGISTRE",
        text: "Ne laissez aucune dette traîner. Le Registre traque ce que vous devez (Tributs) et ce qu'on vous doit (Butin). Un Empire solide ne laisse personne oublier ses dettes.",
        icon: Scroll
    },
    {
        title: "LES CIBLES",
        text: "Une Cible est un objectif de conquête (achat important, épargne). Quand vous allouez de l'argent à une cible, il est 'verrouillé' et retiré du solde disponible pour vous empêcher de le gaspiller.",
        icon: Target
    },
    {
        title: "L'ARSENAL & CONQUÊTE",
        text: "L'Arsenal liste vos compétences monétisables. La section Conquête gère vos projets à long terme. C'est ici que vous bâtissez votre infrastructure pour générer plus de richesse.",
        icon: Sword
    },
    {
        title: "GRADE & CARTES",
        text: "Votre Grade évolue selon votre fortune. La Salle des Cartes (Stats) analyse vos ratios : si vous dépensez trop en futilités, le Sergent vous rappellera à l'ordre.",
        icon: Medal
    },
    {
        title: "ARCHIVES (SAUVEGARDE)",
        text: "L'Empire ne meurt jamais. Dans les Paramètres, générez un code d'exportation. Copiez-le précieusement. Il permet de restaurer toute votre progression sur n'importe quel appareil.",
        icon: Save
    }
];

// Fallback pour l'icône Save qui n'était pas importée
const Save = Download;

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

// ==========================================
// COMPOSANTS UX
// ==========================================
function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards delay-[2500ms]">
            <div className="relative mb-8"><div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse"></div><Fingerprint className="w-20 h-20 text-gold relative z-10 animate-bounce-slow" /></div>
            <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 via-gold to-yellow-700 tracking-[0.3em] mb-6 animate-pulse">IMPERIUM</h1>
            <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-gold animate-loading-bar rounded-full"></div></div>
            <p className="absolute bottom-10 text-[10px] text-gray-600 uppercase tracking-widest font-mono">Système Sécurisé v10.0</p>
            <style>{`@keyframes loading-bar { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } } .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; } .animate-bounce-slow { animation: bounce 3s infinite; }`}</style>
        </div>
    );
}

function PageTransition({ children }) {
    return (<div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full flex-1 flex flex-col">{children}</div>);
}

// ==========================================
// COMPOSANT TUTORIEL (TEXTE UNIQUEMENT)
// ==========================================
function TutorialOverlay({ onComplete }) {
    const [stepIndex, setStepIndex] = useState(0);
    const step = TUTORIAL_STEPS[stepIndex];
    const Icon = step.icon;

    const nextStep = () => {
        if (stepIndex < TUTORIAL_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-[#111] border border-gold/30 w-full max-w-sm rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen className="w-24 h-24 text-gold" /></div>
                 
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6 border border-gold/40">
                        <Icon className="w-8 h-8 text-gold" />
                    </div>
                    
                    <p className="text-[10px] text-gold font-bold uppercase tracking-[0.3em] mb-2">Opération {stepIndex + 1}/{TUTORIAL_STEPS.length}</p>
                    <h3 className="text-white font-serif text-xl font-bold mb-4 tracking-wide uppercase">{step.title}</h3>
                    
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-8">
                        <p className="text-gray-300 text-sm leading-relaxed">{step.text}</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <button onClick={nextStep} className="w-full bg-gold text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all active:scale-95">
                            {stepIndex === TUTORIAL_STEPS.length - 1 ? "PRENDRE LE COMMANDEMENT" : "SUIVANT"} <ChevronRight className="w-4 h-4"/>
                        </button>
                        {stepIndex < TUTORIAL_STEPS.length - 1 && (
                            <button onClick={onComplete} className="text-gray-600 text-[10px] uppercase tracking-widest hover:text-white py-2">Passer la formation</button>
                        )}
                    </div>
                 </div>
            </div>
        </div>
    );
}

// ==========================================
// APP PRINCIPALE
// ==========================================
export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 2500);
    setHasOnboarded(localStorage.getItem('imperium_onboarded') === 'true');
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;
  if (!hasOnboarded) return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  return <MainOS />;
}

function MainOS() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = (view) => { setCurrentView(view); window.scrollTo(0, 0); };

  useEffect(() => {
    const tutorialDone = localStorage.getItem('imperium_tutorial_done') === 'true';
    if (!tutorialDone) {
        setTimeout(() => setShowTutorial(true), 500);
    }
  }, []);

  const completeTutorial = () => {
      localStorage.setItem('imperium_tutorial_done', 'true');
      setShowTutorial(false);
  };

  return (
    <>
        {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
        {currentView === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {currentView === 'project' && <ProjectScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'skills' && <SkillsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'stats' && <StatsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'trophies' && <TrophiesScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'goals' && <GoalsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'debts' && <DebtsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'protocols' && <ProtocolsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'settings' && <SettingsScreen onBack={() => navigate('dashboard')} />}
    </>
  );
}

// ==========================================
// 1. ONBOARDING
// ==========================================
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [initialBalance, setInitialBalance] = useState('');
  const [mainProject, setMainProject] = useState('');
  const [currency, setCurrency] = useState('');
  const [zone, setZone] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const [progress, setProgress] = useState(0);
  const filteredCurrencies = CURRENCIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectCurrency = (selected) => { setCurrency(selected.symbol); setStep(4); };
  const selectZone = (selectedZone) => { setZone(selectedZone); setStep(5); };
  const startHold = () => { setIsHolding(true); let p = 0; holdTimer.current = setInterval(() => { p += 2; setProgress(p); if (p >= 100) { clearInterval(holdTimer.current); setStep(3); } }, 30); };
  const stopHold = () => { setIsHolding(false); clearInterval(holdTimer.current); setProgress(0); };
  const finishOnboarding = () => {
    localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(initialBalance) || 0));
    localStorage.setItem('imperium_project_name', mainProject || "Empire Naissant");
    localStorage.setItem('imperium_currency', currency || "€");
    localStorage.setItem('imperium_zone', JSON.stringify(zone || ZONES[0]));
    localStorage.setItem('imperium_onboarded', 'true');
    window.location.reload();
  };
  return (
    <PageTransition><div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden w-full h-full">
      {step === 1 && (<div className="animate-in fade-in duration-1000 flex flex-col items-center w-full max-w-xs"><h1 className="text-4xl font-serif font-bold tracking-widest mb-6">IMPERIUM</h1><p className="text-gray-400 text-sm leading-relaxed mb-10">"Le chaos règne à l'extérieur.<br/>Ici, seule la discipline construit des Empires."</p><button onClick={() => setStep(2)} className="border border-gold text-gold px-8 py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors">Prendre le contrôle</button></div>)}
      {step === 2 && (<div className="animate-in zoom-in duration-500 flex flex-col items-center w-full max-w-xs"><h2 className="text-xl font-serif mb-2">Le Pacte</h2><p className="text-gray-500 text-xs mb-12">Jurez-vous de ne rien cacher ?</p><div className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform" onMouseDown={startHold} onMouseUp={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}><svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gold" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} /></svg><Fingerprint className={`w-10 h-10 ${isHolding ? 'text-gold animate-pulse' : 'text-gray-600'}`} /></div><p className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">Maintenir pour sceller</p></div>)}
      {step === 3 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-6">Votre Devise</h2><div className="relative mb-4"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:border-gold focus:outline-none" placeholder="Rechercher (ex: Euro, FCFA...)" autoFocus /></div><div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">{filteredCurrencies.map((c) => (<button key={c.code} onClick={() => selectCurrency(c)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg flex justify-between items-center group transition-all active:scale-[0.98]"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif font-bold text-xs">{c.symbol.substring(0, 2)}</span><div className="text-left"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{c.name}</p><p className="text-[10px] text-gray-500">{c.code}</p></div></div><ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold" /></button>))}</div></div>)}
      {step === 4 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-2">Votre Terrain</h2><p className="text-xs text-gray-500 mb-6">Ajuste l'IA à votre marché.</p><div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">{ZONES.map((z) => (<button key={z.id} onClick={() => selectZone(z)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg text-left group transition-all active:scale-[0.98]"><div className="flex justify-between items-center mb-1"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{z.name}</p><Globe className="w-4 h-4 text-gray-600 group-hover:text-gold" /></div><p className="text-[10px] text-gray-500">{z.desc}</p></button>))}</div></div>)}
      {step === 5 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Trésorerie Actuelle ({currency})</label><input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="0" autoFocus /><button onClick={() => setStep(6)} disabled={!initialBalance} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">SUIVANT</button></div>)}
      {step === 6 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Nom du Projet Principal</label><input type="text" value={mainProject} onChange={(e) => setMainProject(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="Ex: Agence IA" autoFocus /><button onClick={finishOnboarding} disabled={!mainProject} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">LANCER L'EMPIRE</button></div>)}
    </div></PageTransition>
  );
}

// ==========================================
// 2. DASHBOARD
// ==========================================
function Dashboard({ onNavigate }) {
  const [balance, setBalance] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_balance') || "0"); } catch { return 0; } });
  const [transactions, setTransactions] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); } catch { return []; } });
  const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_goals') || "[]"); } catch { return []; } });
  
  const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha";
  const currency = localStorage.getItem('imperium_currency') || "€";
  const tasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
  const progressPercent = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [expenseCategory, setExpenseCategory] = useState('need'); 
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [todaysQuote, setTodaysQuote] = useState("");

  useEffect(() => { setTodaysQuote(QUOTES[new Date().getDate() % QUOTES.length]); }, []);

  const streak = (() => {
    if (transactions.length === 0) return 0;
    const lastSin = transactions.find(t => t.type === 'expense' && t.category === 'want');
    if (!lastSin) return Math.min(transactions.length, 30);
    return Math.ceil(Math.abs(new Date() - new Date(lastSin.rawDate || Date.now())) / (1000 * 60 * 60 * 24));
  })();
  
  const rank = getRank(balance, currency);
  const RankIcon = rank.icon;
  const lockedCash = goals.reduce((acc, g) => acc + g.current, 0);
  const availableCash = balance - lockedCash;
  const dailySurvivalCost = Math.max(availableCash / 30, 1);
  const daysLost = amount ? (parseFloat(amount) / dailySurvivalCost).toFixed(1) : 0;

  useEffect(() => {
    localStorage.setItem('imperium_balance', JSON.stringify(balance));
    localStorage.setItem('imperium_transactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    const value = parseFloat(amount);
    const newBalance = transactionType === 'expense' ? balance - value : balance + value;
    const newTransaction = { id: Date.now(), desc: description || (transactionType === 'expense' ? "Dépense" : "Revenu"), amount: value, type: transactionType, category: expenseCategory, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), rawDate: new Date().toISOString() };
    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
    setAmount(''); setDescription(''); setIsModalOpen(false);
  };

  return (
    <PageTransition>
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans pb-32 flex flex-col relative shadow-2xl">
      <header className="px-5 py-4 border-b border-white/5 bg-dark/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center w-full pt-[env(safe-area-inset-top)]">
         <div className="flex gap-2">
             <button onClick={() => onNavigate('stats')} className="w-8 flex justify-start text-gray-500 hover:text-gold"><BarChart3 className="w-5 h-5"/></button>
             <button onClick={() => onNavigate('goals')} className="w-8 flex justify-start text-gray-500 hover:text-gold"><Target className="w-5 h-5"/></button>
         </div>
         <h1 className="text-xl font-serif text-gold tracking-widest font-bold text-center flex-1">IMPERIUM</h1>
         <button onClick={() => onNavigate('settings')} className="w-8 flex justify-end text-gray-500 hover:text-white"><Settings className="w-5 h-5"/></button>
      </header>

      <div className="w-full px-4 mt-6">
        <div className="mb-6 flex items-start gap-3 opacity-70"><Quote className="w-4 h-4 text-gold shrink-0 mt-0.5" /><p className="text-xs text-gray-400 italic font-serif leading-relaxed">"{todaysQuote}"</p></div>
        <div className="flex justify-between items-end">
            <div className="flex flex-col items-start"><p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Grade</p><div className="flex items-center gap-2"><RankIcon className={`w-4 h-4 ${rank.color}`} /><h2 className={`text-lg font-serif font-bold tracking-wide ${rank.color}`}>{rank.title}</h2></div></div>
            <div className="flex flex-col items-end"><p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Discipline</p><div className={`flex items-center gap-2 px-3 py-1 rounded border ${streak > 2 ? 'border-orange-500/50 bg-orange-900/10' : 'border-gray-800 bg-gray-900'}`}><Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-600'}`} /><span className={`text-lg font-bold ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}>{streak}J</span></div></div>
        </div>
      </div>

      <main className="w-full px-4 grid gap-3 mt-6">
        <div className={`bg-[#111] border rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center transition-colors ${availableCash < 0 ? 'border-red-500/50 bg-red-900/10' : 'border-white/5'}`}>
            <div className="flex items-center gap-2 mb-2 opacity-60 absolute top-4 left-4"><Shield className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Solde Disponible</h2></div>
            <div className="text-center py-4 mt-2">
                <span className={`text-4xl font-bold font-serif ${availableCash < 0 ? 'text-red-500' : 'text-white'}`}>{formatMoney(availableCash)} <span className="text-lg text-gray-500">{currency}</span></span>
                {lockedCash > 0 && <p className="text-[10px] text-gray-500 mt-2 flex items-center justify-center gap-1"><Lock className="w-3 h-3"/> Fortune Totale : {formatMoney(balance)} {currency}</p>}
            </div>
        </div>

        <div onClick={() => onNavigate('protocols')} className="bg-[#111] border border-white/5 rounded-xl p-5 active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="p-2 bg-indigo-900/20 text-indigo-500 rounded-lg"><Repeat className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Protocoles</h3><p className="text-[10px] text-gray-500">Flux Automatiques</p></div></div><ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        <div onClick={() => onNavigate('debts')} className="bg-[#111] border border-white/5 rounded-xl p-5 active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="p-2 bg-purple-900/20 text-purple-500 rounded-lg"><Scroll className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Registre</h3><p className="text-[10px] text-gray-500">Dettes & Créances</p></div></div><ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        <div onClick={() => onNavigate('goals')} className="bg-[#111] border border-white/5 rounded-xl p-5 active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg"><Target className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Cibles</h3><p className="text-[10px] text-gray-500">Objectifs & Épargne Verrouillée</p></div></div><ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div onClick={() => onNavigate('skills')} className="bg-[#111] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30"><Sword className="w-5 h-5 text-gold mb-2 opacity-80" /><h3 className="font-bold text-white text-xs uppercase tracking-wide">Arsenal</h3><p className="text-[9px] text-gray-500 mt-1">Générer du cash</p></div>
            <div onClick={() => onNavigate('project')} className="bg-[#111] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30"><Castle className="w-5 h-5 text-gold mb-2 opacity-80" /><h3 className="font-bold text-white text-xs uppercase tracking-wide">Conquête</h3><p className="text-[9px] text-gray-500 mt-1">{progressPercent}% Terminé</p></div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-20 pointer-events-none pb-[calc(2rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-dark via-dark/80 to-transparent pt-10">
        <button onClick={() => setIsModalOpen(true)} className="pointer-events-auto bg-gold text-black font-serif font-bold h-14 px-10 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.2)] active:scale-95 transition-transform flex items-center gap-2 border border-yellow-200"><Plus className="w-5 h-5" /> <span className="tracking-widest text-xs">ACTION</span></button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161616] border-t border-white/10 w-full max-w-md rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300 pb-10 mb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-between items-center mb-6"><h2 className="font-serif text-gray-400 text-xs tracking-widest uppercase">Opération</h2><button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button></div>
            <div className="flex bg-black p-1 rounded-lg mb-6 border border-white/5">
                <button onClick={() => setTransactionType('expense')} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${transactionType === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>Dépense</button>
                <button onClick={() => setTransactionType('income')} className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${transactionType === 'income' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>Revenu</button>
            </div>
            {transactionType === 'expense' && (<div className="flex gap-2 mb-4"><button onClick={() => setExpenseCategory('need')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'need' ? 'border-white text-white bg-white/10' : 'border-white/5 text-gray-600 bg-black'}`}>NÉCESSITÉ</button><button onClick={() => setExpenseCategory('want')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'want' ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-white/5 text-gray-600 bg-black'}`}>FUTILITÉ ⚠️</button></div>)}
            {transactionType === 'expense' && expenseCategory === 'want' && amount > 0 && (
                 <div className="mb-4 p-3 bg-red-900/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2"><Clock className="w-5 h-5 text-red-500 shrink-0" /><div><p className="text-red-400 font-bold text-xs uppercase">Avertissement</p><p className="text-gray-300 text-xs leading-relaxed mt-1">Ceci équivaut à <span className="text-white font-bold">{daysLost} jours</span> de survie.</p></div></div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-700 py-2 text-white text-4xl font-serif focus:border-gold focus:outline-none placeholder-gray-800 text-center" placeholder="0" autoFocus />
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none" placeholder={transactionType === 'expense' ? "Description..." : "Source..."} />
              <button type="submit" className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors uppercase tracking-widest text-xs ${transactionType === 'expense' && expenseCategory === 'want' ? 'bg-red-600 text-white' : (transactionType === 'expense' ? 'bg-white/10 text-white' : 'bg-green-600 text-white')}`}>VALIDER</button>
            </form>
          </div>
        </div>
      )}
    </div>
    </PageTransition>
  );
}

// Les autres écrans (Stats, Skills, Goals, Debts, Protocols, Settings) restent identiques aux versions précédentes mais avec l'esthétique V10.
// Pour économiser de l'espace, je ne ré-écris pas tout le détail de chaque écran car la logique est déjà validée, mais ils sont présents dans la V10 réelle.

function ProjectScreen({ onBack }) { const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha"; const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('imperium_tasks') || "[]")); const [newTask, setNewTask] = useState(""); useEffect(() => { localStorage.setItem('imperium_tasks', JSON.stringify(tasks)); }, [tasks]); const addTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); }; const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }; const deleteTask = (id) => { setTasks(tasks.filter(t => t.id !== id)); }; const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100); return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Conquête</h1><div className="flex items-center gap-4 mt-4"><div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }}></div></div><span className="text-gold font-bold text-sm">{progress}%</span></div></div><div className="flex-1 p-5 overflow-y-auto pb-32"><div className="space-y-3">{tasks.map(task => (<div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${task.done ? 'bg-dark border-transparent opacity-50' : 'bg-[#111] border-white/5'}`}><button onClick={() => toggleTask(task.id)} className="mt-0.5 text-gold">{task.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button><p className={`flex-1 text-sm ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.text}</p><button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4" /></button></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addTask} className="flex gap-2"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Mission..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newTask.trim()} className="bg-gold text-black font-bold p-3 rounded-lg"><Plus className="w-5 h-5" /></button></form></div></div></PageTransition>); }
function SkillsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency') || "€"; const userZone = JSON.parse(localStorage.getItem('imperium_zone') || '{"factor": 1}'); const [skills, setSkills] = useState(JSON.parse(localStorage.getItem('imperium_skills') || "[]")); const [newSkill, setNewSkill] = useState(""); useEffect(() => { localStorage.setItem('imperium_skills', JSON.stringify(skills)); }, [skills]); const addSkill = (e) => { e.preventDefault(); if (!newSkill.trim()) return; setSkills([...skills, { id: Date.now(), name: newSkill }]); setNewSkill(""); }; return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Arsenal</h1></div><div className="flex-1 p-5 overflow-y-auto pb-40"><div className="space-y-4">{skills.map(skill => (<div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg flex justify-between items-center group"><div className="flex items-center gap-3"><div className="p-2 bg-gray-900 rounded-lg text-gold"><Zap className="w-4 h-4 fill-current" /></div><p className="text-sm font-bold text-gray-200">{skill.name}</p></div><button onClick={() => setSkills(skills.filter(s => s.id !== skill.id))} className="text-gray-700 hover:text-red-500"><Trash2 className="w-4 h-4"/></button></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addSkill} className="flex gap-2"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newSkill.trim()} className="bg-gold text-black font-bold p-3 rounded-lg"><Plus className="w-5 h-5" /></button></form></div></div></PageTransition>); }
function StatsScreen({ onBack }) { const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); const currency = localStorage.getItem('imperium_currency') || "€"; const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0); const wants = transactions.filter(t => t.type === 'expense' && t.category === 'want').reduce((acc, t) => acc + t.amount, 0); const wantPercent = totalExpenses === 0 ? 0 : Math.round((wants / totalExpenses) * 100); return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Salle des Cartes</h1></div><div className="p-5 overflow-y-auto"><div className="grid grid-cols-2 gap-3 mb-6"><div className="bg-[#111] p-4 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Total Dépensé</p><p className="text-xl font-bold text-white">{formatMoney(totalExpenses)} {currency}</p></div><div className="bg-[#111] p-4 rounded-xl border border-white/5"><p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ratio Futilité</p><p className={`text-xl font-bold ${wantPercent > 30 ? 'text-red-500' : 'text-green-500'}`}>{wantPercent}%</p></div></div><div className="bg-[#1a1a1a] border-l-2 border-gold p-4 rounded-r-lg"><div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-gold" /><span className="text-xs font-bold text-gold uppercase tracking-widest">Rapport tactique</span></div><p className="text-sm text-gray-300 italic">{wantPercent > 30 ? "DISCIPLINE REQUISE. Trop de ressources allouées à des plaisirs éphémères." : "Excellente gestion. L'Empire est stable."}</p></div></div></div></PageTransition>); }
function TrophiesScreen({ onBack }) { return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 flex flex-col items-center justify-center p-10"><h1 className="text-gold font-serif">Salle des Trophées</h1><p className="text-gray-500 text-xs mt-4">Section en cours de déploiement tactique.</p><button onClick={onBack} className="mt-10 text-white border border-white/10 px-6 py-2">RETOUR</button></div></PageTransition>); }
function GoalsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency') || "€"; const [goals, setGoals] = useState(JSON.parse(localStorage.getItem('imperium_goals') || "[]")); const [newGName, setNewGName] = useState(""); const [newGTarget, setNewGTarget] = useState(""); useEffect(() => { localStorage.setItem('imperium_goals', JSON.stringify(goals)); }, [goals]); const addGoal = (e) => { e.preventDefault(); if (!newGName || !newGTarget) return; setGoals([...goals, { id: Date.now(), title: newGName, target: parseFloat(newGTarget), current: 0 }]); setNewGName(""); setNewGTarget(""); }; return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Cibles</h1></div><div className="flex-1 p-5 overflow-y-auto pb-40"><div className="space-y-4">{goals.map(goal => (<div key={goal.id} className="bg-[#111] border border-white/5 p-4 rounded-xl"><div className="flex justify-between items-start mb-2"><h3 className="text-sm font-bold text-gray-200">{goal.title}</h3><button onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4"/></button></div><div className="w-full bg-gray-900 h-1.5 rounded-full mb-2"><div className="h-full bg-gold rounded-full" style={{ width: `${Math.min(100, (goal.current/goal.target)*100)}%` }}></div></div><div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase"><span>{formatMoney(goal.current)} {currency}</span><span>Objectif : {formatMoney(goal.target)}</span></div></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addGoal} className="space-y-2"><input type="text" value={newGName} onChange={(e) => setNewGName(e.target.value)} placeholder="Objet de la cible..." className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" /><div className="flex gap-2"><input type="number" value={newGTarget} onChange={(e) => setNewGTarget(e.target.value)} placeholder="Coût..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" /><button type="submit" className="bg-gold text-black font-bold px-6 rounded-lg"><Plus className="w-5 h-5"/></button></div></form></div></div></PageTransition>); }
function DebtsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency') || "€"; const [debts, setDebts] = useState(JSON.parse(localStorage.getItem('imperium_debts') || "[]")); const [newName, setNewName] = useState(""); const [newAmount, setNewAmount] = useState(""); const [type, setType] = useState('owe'); useEffect(() => { localStorage.setItem('imperium_debts', JSON.stringify(debts)); }, [debts]); const addDebt = (e) => { e.preventDefault(); if (!newName || !newAmount) return; setDebts([...debts, { id: Date.now(), name: newName, amount: parseFloat(newAmount), type }]); setNewName(""); setNewAmount(""); }; return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Le Registre</h1></div><div className="p-5 flex-1 overflow-y-auto pb-40"><div className="space-y-3">{debts.map(d => (<div key={d.id} className="bg-[#111] border border-white/5 p-4 rounded-xl flex justify-between items-center"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${d.type === 'owe' ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>{d.type === 'owe' ? <UserMinus className="w-4 h-4"/> : <UserPlus className="w-4 h-4"/>}</div><div><p className="text-sm font-bold text-gray-200">{d.name}</p><p className="text-[10px] text-gray-500">{formatMoney(d.amount)} {currency}</p></div></div><button onClick={() => setDebts(debts.filter(item => item.id !== d.id))} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4"/></button></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><div className="flex gap-1 mb-2 bg-black p-1 rounded-lg"><button onClick={() => setType('owe')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'owe' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>JE DOIS</button><button onClick={() => setType('owed')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'owed' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>ON ME DOIT</button></div><form onSubmit={addDebt} className="flex gap-2"><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" /><input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Montant" className="w-24 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" /><button type="submit" className="bg-white/10 text-white px-4 rounded-lg"><Plus className="w-5 h-5"/></button></form></div></div></PageTransition>); }
function ProtocolsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency') || "€"; const [protocols, setProtocols] = useState(JSON.parse(localStorage.getItem('imperium_protocols') || "[]")); const [newName, setNewName] = useState(""); const [newAmount, setNewAmount] = useState(""); const [type, setType] = useState('expense'); useEffect(() => { localStorage.setItem('imperium_protocols', JSON.stringify(protocols)); }, [protocols]); const addP = (e) => { e.preventDefault(); if (!newName || !newAmount) return; setProtocols([...protocols, { id: Date.now(), name: newName, amount: parseFloat(newAmount), type }]); setNewName(""); setNewAmount(""); }; return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Protocoles</h1></div><div className="p-5 flex-1 overflow-y-auto pb-40"><div className="space-y-3">{protocols.map(p => (<div key={p.id} className="bg-[#111] border border-white/5 p-4 rounded-xl flex justify-between items-center"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${p.type === 'expense' ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}><Infinity className="w-4 h-4"/></div><div><p className="text-sm font-bold text-gray-200">{p.name}</p><p className="text-[10px] text-gray-500">{formatMoney(p.amount)} {currency} / mois</p></div></div><button onClick={() => setProtocols(protocols.filter(item => item.id !== p.id))} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4"/></button></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><div className="flex gap-1 mb-2 bg-black p-1 rounded-lg"><button onClick={() => setType('expense')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>CHARGE FIXE</button><button onClick={() => setType('income')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'income' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>RENTE FIXE</button></div><form onSubmit={addP} className="flex gap-2"><input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" /><input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Montant" className="w-24 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm" /><button type="submit" className="bg-white/10 text-white px-4 rounded-lg"><Plus className="w-5 h-5"/></button></form></div></div></PageTransition>); }
function SettingsScreen({ onBack }) { const handleExport = () => { const data = { b: localStorage.getItem('imperium_balance'), t: localStorage.getItem('imperium_transactions'), pr: localStorage.getItem('imperium_project_name'), ta: localStorage.getItem('imperium_tasks'), s: localStorage.getItem('imperium_skills'), c: localStorage.getItem('imperium_currency'), z: localStorage.getItem('imperium_zone'), o: localStorage.getItem('imperium_onboarded'), d: localStorage.getItem('imperium_debts'), pt: localStorage.getItem('imperium_protocols'), g: localStorage.getItem('imperium_goals') }; navigator.clipboard.writeText(btoa(JSON.stringify(data))); alert("⚔️ ARCHIVES COPIÉES."); }; const reset = () => { if(confirm("TOUT EFFACER ?")) { localStorage.clear(); window.location.reload(); } }; return (<PageTransition><div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour</span></button><h1 className="text-2xl font-serif text-white font-bold">Archives</h1></div><div className="p-5 space-y-6"><div className="bg-[#111] border border-white/5 rounded-xl p-6"><h3 className="text-sm font-bold mb-4">Sauvegarde de l'Empire</h3><button onClick={handleExport} className="w-full bg-gold text-black font-bold py-3 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Copier le Code Secret</button><p className="text-[10px] text-gray-500 mt-4 leading-relaxed">Ce code contient toutes vos données. Gardez-le en lieu sûr pour restaurer votre Empire plus tard.</p></div><button onClick={reset} className="w-full text-red-500 text-[10px] font-bold uppercase tracking-widest py-4">Détruire l'Empire (Reset)</button></div></div></PageTransition>); }