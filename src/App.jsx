import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe, BarChart3, Flame, Clock, Medal, Lock, Quote, Loader2, Target, PiggyBank, Unlock, Scroll, UserMinus, UserPlus, Repeat, Infinity, CalendarClock, BookOpen, Save, Edit3, Calendar, HelpCircle, Lightbulb } from 'lucide-react';

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

const FREQUENCIES = [
    { id: 'daily', label: 'Quotidien (Chaque jour)', factor: 30 },
    { id: 'weekly', label: 'Hebdomadaire (Semaine)', factor: 4.33 },
    { id: 'monthly', label: 'Mensuel (Mois)', factor: 1 },
    { id: 'yearly', label: 'Annuel (An)', factor: 0.083 }
];

// NOUVEAU : QUESTIONS STRATÉGIQUES POUR LES PROJETS
const STRATEGIC_QUESTIONS = [
    { id: 'goal', q: "Quel est l'objectif financier précis de ce projet ?" },
    { id: 'deadline', q: "Quelle est la date limite absolue pour la première victoire ?" },
    { id: 'obstacle', q: "Quel est le plus grand obstacle actuel ?" },
    { id: 'first_step', q: "Quelle est la toute première action (gratuite) à faire ?" }
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

const TUTORIAL_STEPS = [
    { title: "BIENVENUE, COMMANDANT", text: "Imperium est votre poste de commandement financier. Ici, chaque unité de monnaie est un soldat sous vos ordres.", icon: Shield },
    { title: "ALLOCATION DE SURVIE", text: "Le système calcule votre budget quotidien strict (Solde / 30). C'est votre limite absolue pour ne pas sombrer.", icon: Flame },
    { title: "CONQUÊTE & STRATÉGIE (Nouveau)", text: "Gérez plusieurs projets simultanément. L'IA vous posera des questions tactiques pour structurer votre avancée.", icon: Castle },
    { title: "LE RADAR DE DETTES", text: "L'IA surveille votre trésorerie et vous ordonne de payer vos dettes quand le moment est venu.", icon: AlertTriangle },
    { title: "LES PROTOCOLES", text: "Définissez vos rentes et charges avec leur fréquence. Le système calculera votre vraie puissance mensuelle.", icon: Repeat },
    { title: "LE REGISTRE", text: "Traquez ce que vous devez (Tributs) et ce qu'on vous doit (Butin).", icon: Scroll },
    { title: "ARCHIVES", text: "Sauvegardez votre Empire via les Paramètres.", icon: Save }
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

// ==========================================
// COMPOSANTS UX
// ==========================================
function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center animate-out fade-out duration-1000 fill-mode-forwards delay-[2500ms]">
            <div className="relative mb-8"><div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse"></div><Fingerprint className="w-20 h-20 text-gold relative z-10 animate-bounce-slow" /></div>
            <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 via-gold to-yellow-700 tracking-[0.3em] mb-6 animate-pulse">IMPERIUM</h1>
            <div className="w-48 h-1 bg-gray-900 rounded-full overflow-hidden"><div className="h-full bg-gold animate-loading-bar rounded-full"></div></div>
            <p className="absolute bottom-10 text-[10px] text-gray-600 uppercase tracking-widest font-mono">Système Sécurisé v11.5</p>
            <style>{`@keyframes loading-bar { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } } .animate-loading-bar { animation: loading-bar 2.5s ease-in-out forwards; } .animate-bounce-slow { animation: bounce 3s infinite; }`}</style>
        </div>
    );
}

function PageTransition({ children }) {
    return (<div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full flex-1 flex flex-col">{children}</div>);
}

function TutorialOverlay({ onComplete }) {
    const [stepIndex, setStepIndex] = useState(0);
    const step = TUTORIAL_STEPS[stepIndex];
    const Icon = step.icon;
    const nextStep = () => { if (stepIndex < TUTORIAL_STEPS.length - 1) { setStepIndex(stepIndex + 1); } else { onComplete(); } };
    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-[#111] border border-gold/30 w-full max-w-sm rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><BookOpen className="w-24 h-24 text-gold" /></div>
                 <div className="relative z-10">
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6 border border-gold/40"><Icon className="w-8 h-8 text-gold" /></div>
                    <p className="text-[10px] text-gold font-bold uppercase tracking-[0.3em] mb-2">Opération {stepIndex + 1}/{TUTORIAL_STEPS.length}</p>
                    <h3 className="text-white font-serif text-xl font-bold mb-4 tracking-wide uppercase">{step.title}</h3>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-8"><p className="text-gray-300 text-sm leading-relaxed">{step.text}</p></div>
                    <div className="flex flex-col gap-3"><button onClick={nextStep} className="w-full bg-gold text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all active:scale-95">{stepIndex === TUTORIAL_STEPS.length - 1 ? "PRENDRE LE COMMANDEMENT" : "SUIVANT"} <ChevronRight className="w-4 h-4"/></button></div>
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
  useEffect(() => { const timer = setTimeout(() => { setLoading(false); }, 2500); setHasOnboarded(localStorage.getItem('imperium_onboarded') === 'true'); return () => clearTimeout(timer); }, []);
  if (loading) return <SplashScreen />;
  if (!hasOnboarded) return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  return <MainOS />;
}

function MainOS() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showTutorial, setShowTutorial] = useState(false);
  const navigate = (view) => { setCurrentView(view); window.scrollTo(0, 0); };
  useEffect(() => { const tutorialDone = localStorage.getItem('imperium_tutorial_done') === 'true'; if (!tutorialDone) { setTimeout(() => setShowTutorial(true), 500); } }, []);
  const completeTutorial = () => { localStorage.setItem('imperium_tutorial_done', 'true'); setShowTutorial(false); };
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
    // MIGRATION POUR LE NOUVEAU SYSTÈME DE PROJETS
    const firstProject = {
        id: Date.now(),
        title: mainProject || "Empire Naissant",
        tasks: [],
        answers: {}
    };
    localStorage.setItem('imperium_projects', JSON.stringify([firstProject]));
    
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
      {step === 4 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-2">Votre Terrain</h2><p className="text-xs text-gray-500 mb-6">Ajuste l'intelligence artificielle à votre marché.</p><div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">{ZONES.map((z) => (<button key={z.id} onClick={() => selectZone(z)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg text-left group transition-all active:scale-[0.98]"><div className="flex justify-between items-center mb-1"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{z.name}</p><Globe className="w-4 h-4 text-gray-600 group-hover:text-gold" /></div><p className="text-[10px] text-gray-500">{z.desc}</p></button>))}</div></div>)}
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
  const [debts, setDebts] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_debts') || "[]"); } catch { return []; } });
  const [protocols, setProtocols] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_protocols') || "[]"); } catch { return []; } });
  
  // MIGRATION / CHARGEMENT DES PROJETS
  const [projects, setProjects] = useState(() => {
     const saved = localStorage.getItem('imperium_projects');
     if (saved) return JSON.parse(saved);
     // Fallback pour anciens utilisateurs
     const oldName = localStorage.getItem('imperium_project_name');
     const oldTasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
     if (oldName) {
         return [{ id: 1, title: oldName, tasks: oldTasks, answers: {} }];
     }
     return [];
  });

  const currency = localStorage.getItem('imperium_currency') || "€";
  
  // Calcul du progrès global (moyenne de tous les projets)
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks ? p.tasks.length : 0), 0);
  const doneTasks = projects.reduce((acc, p) => acc + (p.tasks ? p.tasks.filter(t => t.done).length : 0), 0);
  const progressPercent = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [expenseCategory, setExpenseCategory] = useState('need'); 
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [todaysQuote, setTodaysQuote] = useState("");

  useEffect(() => { const dayIndex = new Date().getDate() % QUOTES.length; setTodaysQuote(QUOTES[dayIndex]); }, []);

  const calculateStreak = () => {
    if (transactions.length === 0) return 0;
    const lastSin = transactions.find(t => t.type === 'expense' && t.category === 'want');
    if (!lastSin) return Math.min(transactions.length, 30);
    const lastSinDate = new Date(lastSin.rawDate || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now - lastSinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };
  
  const streak = calculateStreak();
  const rank = getRank(balance, currency);
  const RankIcon = rank.icon;

  const lockedCash = goals.reduce((acc, g) => acc + g.current, 0);
  const availableCash = balance - lockedCash;
  const dailyAllocation = Math.max(0, Math.floor(availableCash / 30));

  const dailySurvivalCost = Math.max(availableCash / 30, 1);
  const daysLost = amount ? (parseFloat(amount) / dailySurvivalCost).toFixed(1) : 0;

  const debtToPay = debts
    .filter(d => d.type === 'owe' && d.amount <= availableCash)
    .sort((a, b) => a.amount - b.amount)[0];

  useEffect(() => {
    localStorage.setItem('imperium_balance', JSON.stringify(balance));
    localStorage.setItem('imperium_transactions', JSON.stringify(transactions));
    localStorage.setItem('imperium_projects', JSON.stringify(projects)); // Sauvegarde des projets migrés
  }, [balance, transactions, projects]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    const value = parseFloat(amount);
    const newBalance = transactionType === 'expense' ? balance - value : balance + value;
    let finalDesc = description;
    if (transactionType === 'expense' && expenseCategory === 'want') finalDesc = `⚠️ ${description}`;
    const newTransaction = { id: Date.now(), desc: finalDesc || (transactionType === 'expense' ? "Dépense" : "Revenu"), amount: value, type: transactionType, category: expenseCategory, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), rawDate: new Date().toISOString() };
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
            
            <div className="w-full mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">Ration Journalière Max</span>
                <div className="flex items-center gap-2">
                     <Flame className={`w-4 h-4 ${dailyAllocation < 500 ? 'text-orange-500' : 'text-green-500'}`}/>
                     <span className="font-bold text-white font-serif">{formatMoney(dailyAllocation)} {currency}</span>
                </div>
            </div>
        </div>

        {debtToPay && (
            <div className="bg-[#1a0f0f] p-4 rounded-xl border border-red-900/30 animate-in slide-in-from-right">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-900/20 text-red-500 rounded-lg shrink-0"><AlertTriangle className="w-4 h-4"/></div>
                    <div className="flex-1">
                        <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1">Opportunité Stratégique</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-3">Commandant, vos réserves permettent d'éliminer la dette envers <span className="text-white font-bold">{debtToPay.name}</span> ({formatMoney(debtToPay.amount)} {currency}). Honorer cette dette renforcera votre structure.</p>
                        <button onClick={() => onNavigate('debts')} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 text-[10px] font-bold uppercase py-2 px-4 rounded transition-colors w-full">Accéder au Registre</button>
                    </div>
                </div>
            </div>
        )}

        <div onClick={() => onNavigate('protocols')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-900/20 text-indigo-500 rounded-lg"><Repeat className="w-5 h-5"/></div>
                <div><h3 className="text-sm font-bold text-gray-200">Protocoles</h3><p className="text-[10px] text-gray-500">{protocols.length === 0 ? "Gérer abonnements & rentes" : `${protocols.length} Flux Automatiques`}</p></div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        <div onClick={() => onNavigate('debts')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/20 text-purple-500 rounded-lg"><Scroll className="w-5 h-5"/></div>
                <div><h3 className="text-sm font-bold text-gray-200">Registre</h3><p className="text-[10px] text-gray-500">Dettes & Créances</p></div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        <div onClick={() => onNavigate('goals')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3"><div className="p-2 bg-blue-900/20 text-blue-500 rounded-lg"><Target className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Cibles</h3><p className="text-[10px] text-gray-500">{goals.length === 0 ? "Définir un objectif" : `${goals.length} Cibles`}</p></div></div><ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div onClick={() => onNavigate('skills')} className="bg-[#111] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30"><Sword className="w-5 h-5 text-gold mb-2 opacity-80" /><h3 className="font-bold text-white text-xs uppercase tracking-wide">Arsenal</h3><p className="text-[9px] text-gray-500 mt-1">Générer du cash</p></div>
            {/* CARTE CONQUETE MISE À JOUR POUR AFFICHER LE NOMBRE DE PROJETS */}
            <div onClick={() => onNavigate('project')} className="bg-[#111] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30"><Castle className="w-5 h-5 text-gold mb-2 opacity-80" /><h3 className="font-bold text-white text-xs uppercase tracking-wide">Conquête</h3><p className="text-[9px] text-gray-500 mt-1">{projects.length} Front(s) Actif(s)</p></div>
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
                 <div className="mb-4 p-3 bg-red-900/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2"><Clock className="w-5 h-5 text-red-500 shrink-0" /><div><p className="text-red-400 font-bold text-xs uppercase">Avertissement du Sergent</p><p className="text-gray-300 text-xs leading-relaxed mt-1">Cette dépense équivaut à <span className="text-white font-bold">{daysLost} jours</span> de survie.<br/>Est-ce que ça en vaut vraiment la peine ?</p></div></div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-700 py-2 text-white text-4xl font-serif focus:border-gold focus:outline-none placeholder-gray-800 text-center" placeholder="0" autoFocus />
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none" placeholder={transactionType === 'expense' ? "Ex: Burger..." : "Ex: Vente..."} />
              <button type="submit" className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors uppercase tracking-widest text-xs ${transactionType === 'expense' && expenseCategory === 'want' ? 'bg-red-600 text-white animate-pulse' : (transactionType === 'expense' ? 'bg-white/10 text-white' : 'bg-green-600 text-white')}`}>{transactionType === 'expense' && expenseCategory === 'want' ? "CONFIRMER LA PERTE" : "VALIDER"}</button>
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
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Protocoles</h1>
            </div>

            <div className="p-5 overflow-y-auto pb-48">
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

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-white/10 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
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
// 8. LE GRAND LIVRE
// ==========================================
function DebtsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const [balance, setBalance] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0"));
    const [debts, setDebts] = useState(JSON.parse(localStorage.getItem('imperium_debts') || "[]"));
    const [newName, setNewName] = useState("");
    const [newAmount, setNewAmount] = useState("");
    const [type, setType] = useState('owe');

    useEffect(() => { localStorage.setItem('imperium_debts', JSON.stringify(debts)); }, [debts]);
    useEffect(() => { localStorage.setItem('imperium_balance', JSON.stringify(balance)); }, [balance]);

    const addEntry = (e) => {
        e.preventDefault();
        if (!newName || !newAmount) return;
        setDebts([...debts, { id: Date.now(), name: newName, amount: parseFloat(newAmount), type }]);
        setNewName(""); setNewAmount("");
    };

    const settleEntry = (item) => {
        if(item.type === 'owe') {
            if(balance < item.amount) return alert("Trésorerie insuffisante pour honorer cette dette.");
            setBalance(balance - item.amount);
        } else {
            setBalance(balance + item.amount);
        }
        setDebts(debts.filter(d => d.id !== item.id));
    };

    const totalOwe = debts.filter(d => d.type === 'owe').reduce((acc, d) => acc + d.amount, 0);
    const totalOwed = debts.filter(d => d.type === 'owed').reduce((acc, d) => acc + d.amount, 0);

    return (
        <PageTransition>
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Le Registre</h1>
            </div>

            <div className="p-5 overflow-y-auto pb-48">
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl"><p className="text-[10px] text-red-400 uppercase tracking-widest mb-1">Dettes (Tributs)</p><p className="text-xl font-bold text-white">{formatMoney(totalOwe)} {currency}</p></div>
                    <div className="bg-green-900/10 border border-green-500/20 p-4 rounded-xl"><p className="text-[10px] text-green-400 uppercase tracking-widest mb-1">Créances (Butin)</p><p className="text-xl font-bold text-white">{formatMoney(totalOwed)} {currency}</p></div>
                </div>

                <div className="space-y-3">
                    {debts.length === 0 && <p className="text-center text-gray-600 text-xs mt-10">Le registre est vierge.</p>}
                    {debts.map(item => (
                        <div key={item.id} className={`p-4 rounded-xl border flex justify-between items-center ${item.type === 'owe' ? 'bg-[#111] border-red-500/20' : 'bg-[#111] border-green-500/20'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${item.type === 'owe' ? 'bg-red-900/20 text-red-500' : 'bg-green-900/20 text-green-500'}`}>{item.type === 'owe' ? <UserMinus className="w-5 h-5"/> : <UserPlus className="w-5 h-5"/>}</div>
                                <div><h3 className="text-sm font-bold text-gray-200">{item.name}</h3><p className="text-[10px] text-gray-500">{formatMoney(item.amount)} {currency}</p></div>
                            </div>
                            <button onClick={() => settleEntry(item)} className={`px-3 py-1 rounded text-[10px] font-bold uppercase border ${item.type === 'owe' ? 'border-red-500 text-red-500 hover:bg-red-900/20' : 'border-green-500 text-green-500 hover:bg-green-900/20'}`}>{item.type === 'owe' ? "Honorer" : "Encaisser"}</button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-white/10 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                <div className="flex bg-black p-1 rounded-lg mb-3 border border-white/5">
                    <button onClick={() => setType('owe')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-colors ${type === 'owe' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}>Je Dois (Dette)</button>
                    <button onClick={() => setType('owed')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded transition-colors ${type === 'owed' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}>On me Doit (Créance)</button>
                </div>
                <form onSubmit={addEntry} className="flex flex-col gap-3">
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom (ex: Moussa)" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                    <div className="flex gap-2">
                        <input type="number" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Montant" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                        <button type="submit" disabled={!newName || !newAmount} className="bg-white/10 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-white/20 transition-colors"><Plus className="w-5 h-5" /></button>
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
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [allocAmount, setAllocAmount] = useState("");

    useEffect(() => { localStorage.setItem('imperium_goals', JSON.stringify(goals)); }, [goals]);

    const addGoal = (e) => {
        e.preventDefault();
        if (!newGoalName || !newGoalTarget) return;
        setGoals([...goals, { id: Date.now(), title: newGoalName, target: parseFloat(newGoalTarget), current: 0 }]);
        setNewGoalName(""); setNewGoalTarget("");
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
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Cibles</h1>
            </div>

            <div className="flex-1 p-5 overflow-y-auto pb-40">
                <div className="space-y-4">
                    {goals.map(goal => {
                        const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
                        return (
                            <div key={goal.id} className="bg-[#111] border border-white/5 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${percent >= 100 ? 'bg-green-900/20 text-green-500' : 'bg-blue-900/20 text-blue-500'}`}><Target className="w-5 h-5"/></div>
                                        <div><h3 className="text-sm font-bold text-gray-200">{goal.title}</h3><p className="text-[10px] text-gray-500">{percent}% Sécurisé</p></div>
                                    </div>
                                    <button onClick={() => deleteGoal(goal.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4"/></button>
                                </div>
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

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-white/10 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                <form onSubmit={addGoal} className="flex flex-col gap-3">
                    <input type="text" value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)} placeholder="Nom (ex: PC Gamer)" className="w-full bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                    <div className="flex gap-2">
                        <input type="number" value={newGoalTarget} onChange={(e) => setNewGoalTarget(e.target.value)} placeholder="Cible" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                        <button type="submit" disabled={!newGoalName || !newGoalTarget} className="bg-blue-600/80 text-white font-bold px-6 py-3 rounded-lg disabled:opacity-50 hover:bg-blue-500 transition-colors"><Plus className="w-5 h-5" /></button>
                    </div>
                </form>
            </div>
        </div>
        </PageTransition>
    );
}

// ==========================================
// 3. STATISTIQUES (Inchangé)
// ==========================================
function StatsScreen({ onBack }) {
    const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]");
    const currency = localStorage.getItem('imperium_currency') || "€";
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    const wants = transactions.filter(t => t.type === 'expense' && t.category === 'want').reduce((acc, t) => acc + t.amount, 0);
    const needs = transactions.filter(t => t.type === 'expense' && t.category === 'need').reduce((acc, t) => acc + t.amount, 0);
    const wantPercent = totalExpenses === 0 ? 0 : Math.round((wants / totalExpenses) * 100);
    const needPercent = totalExpenses === 0 ? 0 : Math.round((needs / totalExpenses) * 100);

    return (
        <PageTransition>
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Salle des Cartes</h1>
            </div>
            <div className="p-5 overflow-y-auto">
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
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Arsenal</h1><div className="flex items-center gap-2 mt-2"><Globe className="w-3 h-3 text-gold" /><span className="text-[10px] text-gray-400 uppercase">Marché : {userZone ? userZone.name : "Monde"}</span></div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto pb-40"><div className="space-y-4">{skills.map(skill => { const gig = findGig(skill.name); return (<div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg group hover:border-gold/30 transition-colors"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-3"><div className="p-2 bg-gray-900 rounded-lg text-gold"><Zap className="w-4 h-4 fill-current" /></div><div><p className="text-sm font-bold text-gray-200">{skill.name}</p><p className="text-[10px] text-gray-500 uppercase">Potentiel Détecté</p></div></div><button onClick={() => deleteSkill(skill.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button></div><button onClick={() => setSelectedGig(gig)} className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded px-3 py-2 flex items-center justify-between text-xs text-gold transition-colors"><span className="flex items-center gap-2"><Briefcase className="w-3 h-3"/> Monétiser cette compétence</span><span className="font-bold">~{gig.displayPrice} {currency}</span></button></div>)})}</div></div>
            {selectedGig && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in"><div className="bg-[#1a1a1a] border border-gold w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"><button onClick={() => setSelectedGig(null)} className="absolute top-4 right-4 text-gray-500"><X className="w-5 h-5"/></button><h3 className="text-gold font-serif text-xl mb-1">{selectedGig.title}</h3><p className="text-white font-bold text-2xl mb-4">{selectedGig.displayPrice} {currency}</p><div className="bg-black/50 p-4 rounded-lg border border-white/10 mb-4"><p className="text-xs text-gray-400 uppercase mb-2">Ordre de Mission :</p><p className="text-sm text-gray-200 leading-relaxed">{selectedGig.task}</p></div><button onClick={() => setSelectedGig(null)} className="w-full bg-gold text-black font-bold py-3 rounded text-xs uppercase tracking-widest">J'accepte le défi</button></div></div>)}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addSkill} className="flex gap-2"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence (Infographie, Anglais...)" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newSkill.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form></div>
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
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Salle des Trophées</h1>
            </div>
            
            <div className="p-5 overflow-y-auto grid grid-cols-2 gap-4 pb-20">
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
        // Fallback backward compatibility
        const oldName = localStorage.getItem('imperium_project_name');
        const oldTasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
        if (oldName) {
            return [{ id: Date.now(), title: oldName, tasks: oldTasks, answers: {} }];
        }
        return [];
    });
    
    const [activeProject, setActiveProject] = useState(null); // Si null, affiche la liste. Sinon affiche le détail.
    const [newProjectName, setNewProjectName] = useState("");
    const [newTask, setNewTask] = useState("");

    useEffect(() => { localStorage.setItem('imperium_projects', JSON.stringify(projects)); }, [projects]);

    // AJOUTER UN PROJET
    const addProject = (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;
        setProjects([...projects, { id: Date.now(), title: newProjectName, tasks: [], answers: {} }]);
        setNewProjectName("");
    };

    // SUPPRIMER UN PROJET
    const deleteProject = (id, e) => {
        e.stopPropagation();
        if(confirm("Confirmer l'abandon de ce front ?")) {
             setProjects(projects.filter(p => p.id !== id));
             if(activeProject && activeProject.id === id) setActiveProject(null);
        }
    };

    // --- LOGIQUE INTERNE AU PROJET ACTIF ---
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

    // --- LOGIQUE REPONSES STRATEGIQUES ---
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
                <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
                    <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                        <h1 className="text-2xl font-serif text-white font-bold">Conquêtes</h1>
                        <p className="text-[10px] text-gray-500 mt-1">Gérez vos fronts actifs.</p>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto pb-40 space-y-4">
                        {projects.length === 0 && <div className="text-center p-10 opacity-50"><Castle className="w-12 h-12 mx-auto mb-4 text-gray-600"/><p className="text-sm">Aucune conquête en cours.</p></div>}
                        
                        {projects.map(p => {
                            const pTasks = p.tasks || [];
                            const progress = pTasks.length === 0 ? 0 : Math.round((pTasks.filter(t => t.done).length / pTasks.length) * 100);
                            return (
                                <div key={p.id} onClick={() => setActiveProject(p)} className="bg-[#111] border border-white/5 p-5 rounded-xl active:scale-[0.98] transition-all cursor-pointer group hover:border-gold/30">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-white font-bold font-serif text-lg">{p.title}</h3>
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

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                        <form onSubmit={addProject} className="flex gap-2">
                            <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Nouveau Front (ex: Agence Web)..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
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
            <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
                <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                    <button onClick={() => setActiveProject(null)} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour aux Conquêtes</span></button>
                    <h1 className="text-2xl font-serif text-white font-bold">{activeProject.title}</h1>
                    <div className="flex items-center gap-4 mt-4"><div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }}></div></div><span className="text-gold font-bold text-sm">{progress}%</span></div>
                </div>

                <div className="flex-1 p-5 overflow-y-auto pb-32">
                    
                    {/* SECTION INTERROGATOIRE TACTIQUE */}
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

                    {/* SECTION MISSIONS */}
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

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                    <form onSubmit={addTask} className="flex gap-2">
                        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nouvelle mission..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" />
                        <button type="submit" disabled={!newTask.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>
        </PageTransition>
    ); 
}

function SettingsScreen({ onBack }) { 
    const [importData, setImportData] = useState("");
    const [currentBalance, setCurrentBalance] = useState(() => JSON.parse(localStorage.getItem('imperium_balance') || "0"));

    const handleExport = () => { 
        const data = { 
            balance: localStorage.getItem('imperium_balance'), 
            transactions: localStorage.getItem('imperium_transactions'), 
            projects: localStorage.getItem('imperium_projects'), // Export des projets multiples
            tasks: localStorage.getItem('imperium_tasks'), 
            skills: localStorage.getItem('imperium_skills'), 
            currency: localStorage.getItem('imperium_currency'), 
            zone: localStorage.getItem('imperium_zone'), 
            onboarded: localStorage.getItem('imperium_onboarded'), 
        }; 
        const encoded = btoa(JSON.stringify(data)); 
        navigator.clipboard.writeText(encoded); 
        alert("CODE D'ARCHIVE COPIÉ."); 
    }; 
    
    const handleImport = () => { 
        try { 
            if(!importData) return; 
            const decoded = JSON.parse(atob(importData)); 
            if(decoded.balance) localStorage.setItem('imperium_balance', decoded.balance); 
            if(decoded.transactions) localStorage.setItem('imperium_transactions', decoded.transactions); 
            if(decoded.projects) localStorage.setItem('imperium_projects', decoded.projects); // Import projets
            if(decoded.project) localStorage.setItem('imperium_project_name', decoded.project); 
            if(decoded.tasks) localStorage.setItem('imperium_tasks', decoded.tasks); 
            if(decoded.skills) localStorage.setItem('imperium_skills', decoded.skills); 
            if(decoded.currency) localStorage.setItem('imperium_currency', decoded.currency); 
            if(decoded.zone) localStorage.setItem('imperium_zone', decoded.zone); 
            if(decoded.onboarded) localStorage.setItem('imperium_onboarded', decoded.onboarded); 
            alert("✅ RESTAURATION RÉUSSIE."); 
            window.location.reload(); 
        } catch (e) { alert("❌ ERREUR : Code invalide."); } 
    }; 
    
    const resetEmpire = () => { if(confirm("DANGER : Voulez-vous vraiment TOUT effacer ?")) { localStorage.clear(); window.location.reload(); } }; 
    
    const handleBalanceUpdate = () => {
        localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(currentBalance)));
        alert("✅ Trésorerie calibrée.");
        window.location.reload();
    };

    return (
        <PageTransition>
            <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col">
                <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                    <h1 className="text-2xl font-serif text-white font-bold">Paramètres</h1>
                </div>
                
                <div className="p-5 space-y-8 flex-1 overflow-y-auto">
                    
                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-yellow-900/20 text-gold rounded-lg"><Edit3 className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Calibrage Financier</h3><p className="text-[10px] text-gray-500">Correction d'erreur de saisie.</p></div>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-3 leading-relaxed">Utilisez ceci uniquement si votre solde actuel ne reflète pas la réalité (erreur lors de l'Onboarding).</p>
                        <div className="flex gap-2">
                             <input type="number" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className="flex-1 bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold outline-none" placeholder="Nouveau Solde" />
                             <button onClick={handleBalanceUpdate} className="bg-white/10 text-white font-bold px-4 rounded-lg text-xs uppercase hover:bg-white/20">Corriger</button>
                        </div>
                    </div>

                    <div className="bg-[#111] p-5 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg"><Download className="w-5 h-5"/></div>
                            <div><h3 className="text-sm font-bold text-gray-200">Sauvegarder l'Empire</h3><p className="text-[10px] text-gray-500">Générez un code unique.</p></div>
                        </div>
                        <button onClick={handleExport} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"><Copy className="w-4 h-4" /> Copier le Code</button>
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