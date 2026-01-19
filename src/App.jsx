import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe, BarChart3, Flame, Clock, Medal, Lock, Quote } from 'lucide-react';

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
  "On a deux vies. La deuxième commence quand on réalise qu'on n'en a qu'une.",
  "La discipline est mère du succès.",
  "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
  "L'homme qui déplace une montagne commence par déplacer de petites pierres.",
  "La richesse consiste bien plus dans l'usage qu'on en fait que dans la possession.",
  "Fais ce que tu dois, advienne que pourra.",
  "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant."
];

// LISTE DES TROPHÉES À DÉBLOQUER
const TROPHIES_DATA = [
    { id: 'savings_1', title: 'Première Pierre', desc: 'Avoir un solde positif.', icon: Shield, condition: (bal, str, tasks) => bal > 0 },
    { id: 'streak_3', title: 'L\'Éveil', desc: '3 Jours de discipline sans futilités.', icon: Flame, condition: (bal, str, tasks) => str >= 3 },
    { id: 'streak_7', title: 'Spartiate', desc: '7 Jours de discipline absolue.', icon: Sword, condition: (bal, str, tasks) => str >= 7 },
    { id: 'task_1', title: 'Architecte', desc: 'Terminer une mission du projet.', icon: CheckSquare, condition: (bal, str, tasks) => tasks.some(t => t.done) },
    { id: 'rich_1', title: 'Trésorier', desc: 'Accumuler l\'équivalent de 1000€ (650k FCFA).', icon: Castle, condition: (bal, str, tasks) => bal >= 650000 }, // Basé sur FCFA par défaut pour l'exemple
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

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  useEffect(() => { setHasOnboarded(localStorage.getItem('imperium_onboarded') === 'true'); }, []);
  if (!hasOnboarded) return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  return <MainOS />;
}

// ==========================================
// 0. NAVIGATION
// ==========================================
function MainOS() {
  const [currentView, setCurrentView] = useState('dashboard');
  if (currentView === 'dashboard') return <Dashboard onNavigate={(view) => setCurrentView(view)} />;
  if (currentView === 'project') return <ProjectScreen onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'skills') return <SkillsScreen onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'stats') return <StatsScreen onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'trophies') return <TrophiesScreen onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'settings') return <SettingsScreen onBack={() => setCurrentView('dashboard')} />;
  return null;
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
    <div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden w-full h-full">
      {step === 1 && (<div className="animate-in fade-in duration-1000 flex flex-col items-center w-full max-w-xs"><h1 className="text-4xl font-serif font-bold tracking-widest mb-6">IMPERIUM</h1><p className="text-gray-400 text-sm leading-relaxed mb-10">"Le chaos règne à l'extérieur.<br/>Ici, seule la discipline construit des Empires."</p><button onClick={() => setStep(2)} className="border border-gold text-gold px-8 py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors">Prendre le contrôle</button></div>)}
      {step === 2 && (<div className="animate-in zoom-in duration-500 flex flex-col items-center w-full max-w-xs"><h2 className="text-xl font-serif mb-2">Le Pacte</h2><p className="text-gray-500 text-xs mb-12">Jurez-vous de ne rien cacher ?</p><div className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform" onMouseDown={startHold} onMouseUp={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}><svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gold" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} /></svg><Fingerprint className={`w-10 h-10 ${isHolding ? 'text-gold animate-pulse' : 'text-gray-600'}`} /></div><p className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">Maintenir pour sceller</p></div>)}
      {step === 3 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-6">Votre Devise</h2><div className="relative mb-4"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:border-gold focus:outline-none" placeholder="Rechercher (ex: Euro, FCFA...)" autoFocus /></div><div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">{filteredCurrencies.map((c) => (<button key={c.code} onClick={() => selectCurrency(c)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg flex justify-between items-center group transition-all active:scale-[0.98]"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif font-bold text-xs">{c.symbol.substring(0, 2)}</span><div className="text-left"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{c.name}</p><p className="text-[10px] text-gray-500">{c.code}</p></div></div><ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold" /></button>))}</div></div>)}
      {step === 4 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-2">Votre Terrain</h2><p className="text-xs text-gray-500 mb-6">Ajuste l'intelligence artificielle à votre marché.</p><div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">{ZONES.map((z) => (<button key={z.id} onClick={() => selectZone(z)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg text-left group transition-all active:scale-[0.98]"><div className="flex justify-between items-center mb-1"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{z.name}</p><Globe className="w-4 h-4 text-gray-600 group-hover:text-gold" /></div><p className="text-[10px] text-gray-500">{z.desc}</p></button>))}</div></div>)}
      {step === 5 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Trésorerie Actuelle ({currency})</label><input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="0" autoFocus /><button onClick={() => setStep(6)} disabled={!initialBalance} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">SUIVANT</button></div>)}
      {step === 6 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Nom du Projet Principal</label><input type="text" value={mainProject} onChange={(e) => setMainProject(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="Ex: Agence IA" autoFocus /><button onClick={finishOnboarding} disabled={!mainProject} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">LANCER L'EMPIRE</button></div>)}
    </div>
  );
}

// ==========================================
// 2. DASHBOARD
// ==========================================
function Dashboard({ onNavigate }) {
  const [balance, setBalance] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_balance') || "0"); } catch { return 0; } });
  const [transactions, setTransactions] = useState(() => { try { return JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); } catch { return []; } });
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

  // Initialisation de la citation du jour (Stable)
  useEffect(() => {
    const dayIndex = new Date().getDate() % QUOTES.length;
    setTodaysQuote(QUOTES[dayIndex]);
  }, []);

  const calculateStreak = () => {
    if (transactions.length === 0) return 0;
    const lastSin = transactions.find(t => t.type === 'expense' && t.category === 'want');
    if (!lastSin) return Math.min(transactions.length, 30);
    const lastSinDate = new Date(lastSin.rawDate || Date.now());
    const now = new Date();
    const diffTime = Math.abs(now - lastSinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays; 
  };
  
  const streak = calculateStreak();
  const rank = getRank(balance, currency);
  const RankIcon = rank.icon;
  const dailySurvivalCost = Math.max(balance / 30, 1);
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
    let finalDesc = description;
    if (transactionType === 'expense' && expenseCategory === 'want') finalDesc = `⚠️ ${description}`;
    const newTransaction = { id: Date.now(), desc: finalDesc || (transactionType === 'expense' ? "Dépense" : "Revenu"), amount: value, type: transactionType, category: expenseCategory, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), rawDate: new Date().toISOString() };
    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
    setAmount(''); setDescription(''); setIsModalOpen(false);
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans pb-32 flex flex-col relative shadow-2xl animate-in fade-in duration-500">
      <header className="px-5 py-4 border-b border-white/5 bg-dark/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center w-full pt-[env(safe-area-inset-top)]">
         <button onClick={() => onNavigate('stats')} className="w-8 flex justify-start text-gray-500 hover:text-gold"><BarChart3 className="w-5 h-5"/></button>
         <h1 className="text-xl font-serif text-gold tracking-widest font-bold text-center flex-1">IMPERIUM</h1>
         <button onClick={() => onNavigate('settings')} className="w-8 flex justify-end text-gray-500 hover:text-white"><Settings className="w-5 h-5"/></button>
      </header>

      {/* RANG & STREAK & CITATION */}
      <div className="w-full px-4 mt-6">
        
        {/* CITATION DU JOUR */}
        <div className="mb-6 flex items-start gap-3 opacity-70">
            <Quote className="w-4 h-4 text-gold shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 italic font-serif leading-relaxed">"{todaysQuote}"</p>
        </div>

        <div className="flex justify-between items-end">
            <div className="flex flex-col items-start">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Grade</p>
                <div className="flex items-center gap-2">
                    <RankIcon className={`w-4 h-4 ${rank.color}`} />
                    <h2 className={`text-lg font-serif font-bold tracking-wide ${rank.color}`}>{rank.title}</h2>
                </div>
            </div>
            
            <div className="flex flex-col items-end">
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Discipline</p>
                <div className={`flex items-center gap-2 px-3 py-1 rounded border ${streak > 2 ? 'border-orange-500/50 bg-orange-900/10' : 'border-gray-800 bg-gray-900'}`}>
                    <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 fill-orange-500 animate-pulse' : 'text-gray-600'}`} />
                    <span className={`text-lg font-bold ${streak > 0 ? 'text-orange-400' : 'text-gray-600'}`}>{streak}J</span>
                </div>
            </div>
        </div>
      </div>

      <main className="w-full px-4 grid gap-3 mt-6">
        {/* TRESORERIE */}
        <div className={`bg-[#111] border rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center transition-colors ${balance < 0 ? 'border-red-500/50 bg-red-900/10' : 'border-white/5'}`}>
            <div className="flex items-center gap-2 mb-2 opacity-60 absolute top-4 left-4"><Shield className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Trésorerie</h2></div>
            <div className="text-center py-4 mt-2"><span className={`text-4xl font-bold font-serif ${balance < 0 ? 'text-red-500' : 'text-white'}`}>{formatMoney(balance)} <span className="text-lg text-gray-500">{currency}</span></span></div>
        </div>

        {/* SALLE DES TROPHÉES (NOUVEAU) */}
        <div onClick={() => onNavigate('trophies')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-900/20 text-yellow-500 rounded-lg"><Medal className="w-5 h-5"/></div>
                <div><h3 className="text-sm font-bold text-gray-200">Salle des Trophées</h3><p className="text-[10px] text-gray-500">Voir mes médailles et succès</p></div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold" />
        </div>

        {/* COMPÉTENCES & PROJET */}
        <div className="grid grid-cols-2 gap-3">
            <div onClick={() => onNavigate('skills')} className="bg-[#111] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30">
                <Sword className="w-5 h-5 text-gold mb-2 opacity-80" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wide">Arsenal</h3>
                <p className="text-[9px] text-gray-500 mt-1">Générer du cash</p>
            </div>
            <div onClick={() => onNavigate('project')} className="bg-[#111] border border-white/5 rounded-xl p-4 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30">
                <Castle className="w-5 h-5 text-gold mb-2 opacity-80" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wide">Conquête</h3>
                <p className="text-[9px] text-gray-500 mt-1">{progressPercent}% Terminé</p>
            </div>
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
            {transactionType === 'expense' && (
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setExpenseCategory('need')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'need' ? 'border-white text-white bg-white/10' : 'border-white/5 text-gray-600 bg-black'}`}>NÉCESSITÉ</button>
                    <button onClick={() => setExpenseCategory('want')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'want' ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-white/5 text-gray-600 bg-black'}`}>FUTILITÉ ⚠️</button>
                </div>
            )}
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
  );
}

// ==========================================
// 3. STATISTIQUES
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
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300">
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
    return (<div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button><h1 className="text-2xl font-serif text-white font-bold">Arsenal</h1><div className="flex items-center gap-2 mt-2"><Globe className="w-3 h-3 text-gold" /><span className="text-[10px] text-gray-400 uppercase">Marché : {userZone ? userZone.name : "Monde"}</span></div></div><div className="flex-1 p-5 overflow-y-auto pb-40"><div className="space-y-4">{skills.map(skill => { const gig = findGig(skill.name); return (<div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg group hover:border-gold/30 transition-colors"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-3"><div className="p-2 bg-gray-900 rounded-lg text-gold"><Zap className="w-4 h-4 fill-current" /></div><div><p className="text-sm font-bold text-gray-200">{skill.name}</p><p className="text-[10px] text-gray-500 uppercase">Potentiel Détecté</p></div></div><button onClick={() => deleteSkill(skill.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button></div><button onClick={() => setSelectedGig(gig)} className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded px-3 py-2 flex items-center justify-between text-xs text-gold transition-colors"><span className="flex items-center gap-2"><Briefcase className="w-3 h-3"/> Monétiser cette compétence</span><span className="font-bold">~{gig.displayPrice} {currency}</span></button></div>)})}</div></div>{selectedGig && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in"><div className="bg-[#1a1a1a] border border-gold w-full max-w-sm rounded-2xl p-6 shadow-2xl relative"><button onClick={() => setSelectedGig(null)} className="absolute top-4 right-4 text-gray-500"><X className="w-5 h-5"/></button><h3 className="text-gold font-serif text-xl mb-1">{selectedGig.title}</h3><p className="text-white font-bold text-2xl mb-4">{selectedGig.displayPrice} {currency}</p><div className="bg-black/50 p-4 rounded-lg border border-white/10 mb-4"><p className="text-xs text-gray-400 uppercase mb-2">Ordre de Mission :</p><p className="text-sm text-gray-200 leading-relaxed">{selectedGig.task}</p></div><button onClick={() => setSelectedGig(null)} className="w-full bg-gold text-black font-bold py-3 rounded text-xs uppercase tracking-widest">J'accepte le défi</button></div></div>)}<div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addSkill} className="flex gap-2"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence (Infographie, Anglais...)" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newSkill.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form></div></div>); }

// ==========================================
// 5. TROPHÉES (NOUVEAU)
// ==========================================
function TrophiesScreen({ onBack }) {
    const balance = JSON.parse(localStorage.getItem('imperium_balance') || "0");
    const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]");
    const tasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
    
    // Calcul du streak pour les trophées
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
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Salle des Trophées</h1>
            </div>
            
            <div className="p-5 overflow-y-auto grid grid-cols-2 gap-4 pb-20">
                {TROPHIES_DATA.map(trophy => {
                    const isUnlocked = trophy.condition(balance, streak, tasks);
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
    );
}

// ==========================================
// 6. PROJET & SETTINGS (Standard)
// ==========================================
function ProjectScreen({ onBack }) { const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha"; const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('imperium_tasks') || "[]")); const [newTask, setNewTask] = useState(""); useEffect(() => { localStorage.setItem('imperium_tasks', JSON.stringify(tasks)); }, [tasks]); const addTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); }; const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }; const deleteTask = (id) => { setTasks(tasks.filter(t => t.id !== id)); }; const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100); return (<div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button><h1 className="text-2xl font-serif text-white font-bold">{projectName}</h1><div className="flex items-center gap-4 mt-4"><div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }}></div></div><span className="text-gold font-bold text-sm">{progress}%</span></div></div><div className="flex-1 p-5 overflow-y-auto pb-32"><div className="space-y-3">{tasks.map(task => (<div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${task.done ? 'bg-dark border-transparent opacity-50' : 'bg-[#111] border-white/5'}`}><button onClick={() => toggleTask(task.id)} className="mt-0.5 text-gold hover:scale-110 transition-transform">{task.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button><p className={`flex-1 text-sm ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.text}</p><button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4" /></button></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addTask} className="flex gap-2"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nouvelle mission..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newTask.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form></div></div>); }
function SettingsScreen({ onBack }) { const [importData, setImportData] = useState(""); const handleExport = () => { const data = { balance: localStorage.getItem('imperium_balance'), transactions: localStorage.getItem('imperium_transactions'), project: localStorage.getItem('imperium_project_name'), tasks: localStorage.getItem('imperium_tasks'), skills: localStorage.getItem('imperium_skills'), currency: localStorage.getItem('imperium_currency'), zone: localStorage.getItem('imperium_zone'), onboarded: localStorage.getItem('imperium_onboarded'), }; const encoded = btoa(JSON.stringify(data)); navigator.clipboard.writeText(encoded); alert("⚔️ ARCHIVES SÉCURISÉES ⚔️\n\nCode copié."); }; const handleImport = () => { try { if(!importData) return; const decoded = JSON.parse(atob(importData)); if(decoded.balance) localStorage.setItem('imperium_balance', decoded.balance); if(decoded.transactions) localStorage.setItem('imperium_transactions', decoded.transactions); if(decoded.project) localStorage.setItem('imperium_project_name', decoded.project); if(decoded.tasks) localStorage.setItem('imperium_tasks', decoded.tasks); if(decoded.skills) localStorage.setItem('imperium_skills', decoded.skills); if(decoded.currency) localStorage.setItem('imperium_currency', decoded.currency); if(decoded.zone) localStorage.setItem('imperium_zone', decoded.zone); if(decoded.onboarded) localStorage.setItem('imperium_onboarded', decoded.onboarded); alert("✅ RESTAURATION RÉUSSIE."); window.location.reload(); } catch (e) { alert("❌ ERREUR : Code invalide."); } }; const resetEmpire = () => { if(confirm("DANGER : Voulez-vous vraiment TOUT effacer ?")) { localStorage.clear(); window.location.reload(); } }; return (<div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button><h1 className="text-2xl font-serif text-white font-bold">Archives</h1></div><div className="p-5 space-y-8"><div className="bg-[#111] border border-white/5 rounded-xl p-5"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg"><Download className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Sauvegarder l'Empire</h3><p className="text-[10px] text-gray-500">Générez un code unique.</p></div></div><button onClick={handleExport} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"><Copy className="w-4 h-4" /> Copier le Code</button></div><div className="bg-[#111] border border-white/5 rounded-xl p-5"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-green-900/20 text-green-400 rounded-lg"><Upload className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Restaurer les données</h3><p className="text-[10px] text-gray-500">Collez le code ici.</p></div></div><textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Collez votre code ici..." className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:border-gold focus:outline-none h-20 mb-3 font-mono"/><button onClick={handleImport} disabled={!importData} className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50 transition-colors">Restaurer</button></div><div className="pt-10 border-t border-white/5"><button onClick={resetEmpire} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-xs uppercase tracking-widest py-4 hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /> Détruire l'Empire (Reset)</button></div></div></div>); }