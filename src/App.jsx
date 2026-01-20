import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe, BarChart3, Flame, Clock, Medal, Lock, Quote, Loader2, Target, PiggyBank, Unlock, Scroll, UserMinus, UserPlus, Repeat, Infinity, CalendarClock, BookOpen, Save, BrainCircuit, Calendar } from 'lucide-react';

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

const STRATEGY_QUESTIONS = [
    "Quel est le problème numéro 1 que ce projet résout pour le client ?",
    "Qui est prêt à payer MAINTENANT pour cette solution ? (Cible précise)",
    "Quelle est ton 'Offre Irrésistible' (Ce que le client reçoit vs ce qu'il paie) ?",
    "Comment vas-tu trouver tes 10 premiers clients sans dépenser d'argent ?",
    "Quel est le coût minimum pour lancer une version test (MVP) ?",
    "Si ce projet échoue, quelle en sera la cause la plus probable ?"
];

const QUOTES = [
  "Les dettes sont l'esclavage des hommes libres.",
  "La discipline est mère du succès.",
  "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
  "L'homme qui déplace une montagne commence par déplacer de petites pierres.",
  "La richesse consiste bien plus dans l'usage qu'on en fait que dans la possession.",
  "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant."
];

const TUTORIAL_STEPS = [
    { title: "BIENVENUE, COMMANDANT", text: "Imperium est votre poste de commandement financier. Ici, la discipline est reine.", icon: Shield },
    { title: "SURVIE & ALLOCATION", text: "Le système calcule votre budget quotidien strict. Ne dépassez jamais cette limite pour survivre.", icon: Flame },
    { title: "NÉCESSITÉ VS FUTILITÉ", text: "Chaque dépense doit être jugée. Si c'est une futilité, le Sergent vous le fera savoir. Assumez vos choix.", icon: AlertTriangle },
    { title: "PROTOCOLES & DETTES", text: "Gérez vos rentes et abattez vos dettes. L'IA vous signalera quand vous aurez assez de cash pour payer une dette.", icon: Scroll },
    { title: "ARCHIVES", text: "Dans les Paramètres, générez un code de sauvegarde. C'est votre seule assurance vie.", icon: Save }
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
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center">
            <Fingerprint className="w-20 h-20 text-gold animate-pulse mb-6" />
            <h1 className="text-3xl font-serif font-bold text-gold tracking-[0.3em]">IMPERIUM</h1>
            <p className="text-[10px] text-gray-600 mt-2 tracking-widest uppercase">Version 14.0 Ultimate</p>
        </div>
    );
}

function PageTransition({ children }) {
    return (<div className="animate-in slide-in-from-bottom-4 fade-in duration-300 w-full flex-1 flex flex-col">{children}</div>);
}

function TutorialOverlay({ onComplete }) {
    const [stepIndex, setStepIndex] = useState(0);
    const step = TUTORIAL_STEPS[stepIndex];
    const Icon = step.icon;
    return (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="bg-[#111] border border-gold/30 w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-gold/40">
                    <Icon className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-white font-serif text-xl font-bold mb-4 uppercase">{step.title}</h3>
                <p className="text-gray-300 text-sm mb-8 leading-relaxed">{step.text}</p>
                <button onClick={() => stepIndex < TUTORIAL_STEPS.length - 1 ? setStepIndex(stepIndex + 1) : onComplete()} className="w-full bg-gold text-black font-bold py-4 rounded-lg uppercase tracking-widest text-xs">
                    {stepIndex === TUTORIAL_STEPS.length - 1 ? "LANCER L'EMPIRE" : "SUIVANT"}
                </button>
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
    const timer = setTimeout(() => setLoading(false), 2000);
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
  useEffect(() => {
    if (localStorage.getItem('imperium_tutorial_done') !== 'true') setShowTutorial(true);
  }, []);
  const navigate = (view) => { setCurrentView(view); window.scrollTo(0, 0); };
  return (
    <>
        {showTutorial && <TutorialOverlay onComplete={() => { localStorage.setItem('imperium_tutorial_done', 'true'); setShowTutorial(false); }} />}
        {currentView === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {currentView === 'project' && <ProjectScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'skills' && <SkillsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'stats' && <StatsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'goals' && <GoalsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'debts' && <DebtsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'protocols' && <ProtocolsScreen onBack={() => navigate('dashboard')} />}
        {currentView === 'settings' && <SettingsScreen onBack={() => navigate('dashboard')} />}
    </>
  );
}

// ==========================================
// ECRANS
// ==========================================

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('€');
  const finish = () => {
    localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(balance) || 0));
    const defaultProject = { id: Date.now(), title: "Projet Alpha", tasks: [], strategy: [] };
    localStorage.setItem('imperium_projects', JSON.stringify([defaultProject]));
    localStorage.setItem('imperium_currency', currency);
    localStorage.setItem('imperium_onboarded', 'true');
    onComplete();
  };
  return (
    <div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-8 text-center">
      {step === 1 && <><h1 className="text-4xl font-serif font-bold mb-4">IMPERIUM</h1><button onClick={() => setStep(2)} className="border border-gold px-8 py-3 uppercase text-xs">Prendre le contrôle</button></>}
      {step === 2 && <><p className="mb-4">Trésorerie Actuelle</p><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="bg-transparent border-b border-gold text-2xl text-center mb-8 outline-none" placeholder="0"/><button onClick={finish} className="bg-gold text-black px-8 py-3 font-bold">LANCER</button></>}
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('imperium_balance') || "0"));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('imperium_transactions') || "[]"));
  const [debts, setDebts] = useState(() => JSON.parse(localStorage.getItem('imperium_debts') || "[]"));
  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('imperium_goals') || "[]"));
  const currency = localStorage.getItem('imperium_currency') || "€";
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  // Rétablissement de la catégorie de dépense
  const [expenseCategory, setExpenseCategory] = useState('need'); 
  const [desc, setDesc] = useState('');
  const [todaysQuote, setTodaysQuote] = useState("");

  useEffect(() => { setTodaysQuote(QUOTES[new Date().getDate() % QUOTES.length]); }, []);

  const rank = getRank(balance, currency);
  const RankIcon = rank.icon;

  const lockedCash = goals.reduce((acc, g) => acc + g.current, 0);
  const availableCash = balance - lockedCash;
  const dailyAllocation = Math.max(0, Math.floor(availableCash / 30));
  const dailySurvivalCost = Math.max(availableCash / 30, 1);
  const daysLost = amount ? (parseFloat(amount) / dailySurvivalCost).toFixed(1) : 0;
  
  const debtToPay = debts.find(d => d.type === 'owe' && d.amount <= availableCash * 0.4);

  // CALCUL DES FLAMMES (STREAK) - BASÉ SUR LES "WANTS"
  const calculateStreak = () => {
    if (transactions.length === 0) return 0;
    const lastSin = transactions.find(t => t.type === 'expense' && t.category === 'want');
    if (!lastSin) return Math.min(transactions.length, 30);
    const lastDate = new Date(lastSin.rawDate);
    const diffTime = Math.abs(new Date() - lastDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };
  const streak = calculateStreak();

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val) return;
    const newBal = type === 'expense' ? balance - val : balance + val;
    
    // Ajout du petit symbole d'alerte dans la description si c'est une futilité
    let finalDesc = desc;
    if (type === 'expense' && expenseCategory === 'want') finalDesc = `⚠️ ${desc || 'Futilité'}`;
    else if (!desc) finalDesc = type === 'expense' ? 'Dépense' : 'Revenu';

    const newTx = { 
        id: Date.now(), 
        amount: val, 
        type, 
        category: expenseCategory, // On sauvegarde la catégorie
        desc: finalDesc, 
        rawDate: new Date().toISOString() 
    };
    
    setBalance(newBal);
    setTransactions([newTx, ...transactions]);
    localStorage.setItem('imperium_balance', JSON.stringify(newBal));
    localStorage.setItem('imperium_transactions', JSON.stringify([newTx, ...transactions]));
    setAmount(''); setDesc(''); setIsModalOpen(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white pb-32">
        <header className="p-6 flex justify-between items-center border-b border-white/5 bg-[#050505]">
            <button onClick={() => onNavigate('stats')}><BarChart3 className="w-5 h-5 text-gray-500 hover:text-gold"/></button>
            <h1 className="text-gold font-serif font-bold tracking-widest">IMPERIUM</h1>
            <button onClick={() => onNavigate('settings')}><Settings className="w-5 h-5 text-gray-500 hover:text-white"/></button>
        </header>

        <div className="p-6 space-y-5">
            {/* CITATION */}
            <div className="flex items-start gap-3 opacity-80">
                <Quote className="w-4 h-4 text-gold shrink-0 mt-1"/>
                <p className="text-xs text-gray-400 italic leading-relaxed">"{todaysQuote}"</p>
            </div>

            {/* EN-TÊTE GRADE & FLAMMES */}
            <div className="flex justify-between items-end">
                <div><p className="text-[10px] text-gray-500 uppercase">Grade</p><div className={`flex items-center gap-2 ${rank.color}`}><RankIcon className="w-5 h-5"/><span className="font-bold font-serif text-lg">{rank.title}</span></div></div>
                <div><p className="text-[10px] text-gray-500 uppercase text-right">Discipline</p><div className={`flex items-center gap-2 px-3 py-1 rounded border ${streak > 2 ? 'border-orange-500/30 bg-orange-900/10 text-orange-500' : 'border-gray-800 bg-gray-900 text-gray-600'}`}><Flame className={`w-4 h-4 ${streak > 0 ? 'animate-pulse' : ''}`}/><span className="font-bold">{streak} Jours</span></div></div>
            </div>

            {/* CARTE PRINCIPALE : SOLDE */}
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden group shadow-lg shadow-gold/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-20"></div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2 relative z-10"><Shield className="w-3 h-3 text-gold"/> Solde Disponible</p>
                <h2 className="text-4xl font-serif font-bold text-white mb-2 relative z-10">{formatMoney(availableCash)} <span className="text-sm text-gray-500">{currency}</span></h2>
                {lockedCash > 0 && <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1 relative z-10"><Lock className="w-3 h-3"/> +{formatMoney(lockedCash)} sécurisés</p>}
            </div>

            {/* ALLOCATION QUOTIDIENNE */}
            <div className="bg-[#0f1210] p-4 rounded-xl border border-green-900/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/20 text-green-500 rounded-lg"><Flame className="w-4 h-4"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Survie Journalière</p>
                        <p className="text-sm font-bold text-white">Max {formatMoney(dailyAllocation)} {currency} / jour</p>
                    </div>
                </div>
            </div>

            {/* RADAR DE DETTES */}
            {debtToPay && (
                <div className="bg-[#1a0f0f] p-4 rounded-xl border border-red-900/30 animate-in slide-in-from-right">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-900/20 text-red-500 rounded-lg shrink-0"><AlertTriangle className="w-4 h-4"/></div>
                        <div>
                            <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1">Alerte Dette</p>
                            <p className="text-xs text-gray-300 leading-relaxed mb-2">Solde suffisant pour éliminer la cible : <span className="text-white font-bold">{debtToPay.name}</span> ({formatMoney(debtToPay.amount)}).</p>
                            <button onClick={() => onNavigate('debts')} className="bg-red-900/20 text-red-400 border border-red-900/50 text-[10px] font-bold uppercase py-1 px-3 rounded">Régler</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGATION OLD SCHOOL */}
            <div className="grid grid-cols-1 gap-3 mt-4">
                <div onClick={() => onNavigate('protocols')} className="bg-[#111] p-5 rounded-xl border border-white/5 active:scale-[0.98] transition-transform flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-900/20 text-indigo-500 rounded-lg border border-indigo-500/20"><Repeat className="w-6 h-6"/></div>
                        <div><h3 className="font-bold text-gray-200">Protocoles</h3><p className="text-[10px] text-gray-500 uppercase tracking-wider">Flux & Rentes</p></div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-indigo-500"/>
                </div>

                <div onClick={() => onNavigate('debts')} className="bg-[#111] p-5 rounded-xl border border-white/5 active:scale-[0.98] transition-transform flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-900/20 text-purple-500 rounded-lg border border-purple-500/20"><Scroll className="w-6 h-6"/></div>
                        <div><h3 className="font-bold text-gray-200">Registre</h3><p className="text-[10px] text-gray-500 uppercase tracking-wider">Dettes & Créances</p></div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-purple-500"/>
                </div>

                <div onClick={() => onNavigate('goals')} className="bg-[#111] p-5 rounded-xl border border-white/5 active:scale-[0.98] transition-transform flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-900/20 text-blue-500 rounded-lg border border-blue-500/20"><Target className="w-6 h-6"/></div>
                        <div><h3 className="font-bold text-gray-200">Cibles</h3><p className="text-[10px] text-gray-500 uppercase tracking-wider">Épargne Verrouillée</p></div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-500"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                     <div onClick={() => onNavigate('skills')} className="bg-[#111] p-4 rounded-xl border border-white/5 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30">
                        <div className="p-2 bg-yellow-900/20 text-gold rounded-lg w-fit mb-3"><Sword className="w-5 h-5"/></div>
                        <h3 className="font-bold text-white text-sm">Arsenal</h3>
                        <p className="text-[9px] text-gray-500 mt-1">Gagner plus</p>
                     </div>
                     <div onClick={() => onNavigate('project')} className="bg-[#111] p-4 rounded-xl border border-white/5 active:scale-[0.98] transition-transform cursor-pointer hover:border-gold/30">
                        <div className="p-2 bg-yellow-900/20 text-gold rounded-lg w-fit mb-3"><Castle className="w-5 h-5"/></div>
                        <h3 className="font-bold text-white text-sm">Conquête</h3>
                        <p className="text-[9px] text-gray-500 mt-1">Projets & IA</p>
                     </div>
                </div>
            </div>
        </div>

        <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <button onClick={() => setIsModalOpen(true)} className="pointer-events-auto bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-90 transition-transform border-2 border-yellow-300"><Plus className="w-6 h-6"/></button>
        </div>
        
        {/* MODALE RESTAURÉE AVEC CHOIX NÉCESSITÉ/FUTILITÉ ET COACH */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/90 flex items-end z-50 animate-in fade-in duration-200">
                <div className="bg-[#161616] w-full p-8 rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setType('expense')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-lg transition-colors ${type === 'expense' ? 'bg-red-900 text-white shadow-[0_0_15px_rgba(153,27,27,0.4)]' : 'bg-gray-900 text-gray-600'}`}>DÉPENSE</button>
                        <button onClick={() => setType('income')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-lg transition-colors ${type === 'income' ? 'bg-green-900 text-white shadow-[0_0_15px_rgba(22,101,52,0.4)]' : 'bg-gray-900 text-gray-600'}`}>REVENU</button>
                    </div>

                    {/* CHOIX NÉCESSITÉ vs FUTILITÉ (RESTAURÉ) */}
                    {type === 'expense' && (
                        <div className="flex gap-2 mb-4 animate-in fade-in">
                            <button onClick={() => setExpenseCategory('need')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'need' ? 'border-white text-white bg-white/10' : 'border-white/5 text-gray-600 bg-black'}`}>NÉCESSITÉ</button>
                            <button onClick={() => setExpenseCategory('want')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'want' ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-white/5 text-gray-600 bg-black'}`}>FUTILITÉ ⚠️</button>
                        </div>
                    )}

                    {/* MESSAGE DU COACH CULPABILISANT (RESTAURÉ) */}
                    {type === 'expense' && expenseCategory === 'want' && amount > 0 && (
                        <div className="mb-4 p-3 bg-red-900/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <Clock className="w-5 h-5 text-red-500 shrink-0" />
                            <div>
                                <p className="text-red-400 font-bold text-xs uppercase">Avertissement du Sergent</p>
                                <p className="text-gray-300 text-xs leading-relaxed mt-1">Cette dépense équivaut à <span className="text-white font-bold">{daysLost} jours</span> de survie. Est-ce que ça en vaut vraiment la peine ?</p>
                            </div>
                        </div>
                    )}

                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-800 text-4xl text-center mb-6 outline-none font-serif text-white placeholder-gray-800" placeholder="0" autoFocus/>
                    <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded-lg text-white text-sm mb-6 outline-none" placeholder="Description (optionnel)"/>
                    
                    <button onClick={handleSubmit} className={`w-full text-black py-4 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200 shadow-lg ${type === 'expense' && expenseCategory === 'want' ? 'bg-red-600 text-white animate-pulse' : 'bg-white'}`}>
                        {type === 'expense' && expenseCategory === 'want' ? "CONFIRMER LA PERTE" : "VALIDER"}
                    </button>
                    <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 mt-4 text-xs uppercase tracking-widest py-2">ANNULER</button>
                </div>
            </div>
        )}
      </div>
    </PageTransition>
  );
}

// ==========================================
// ECRANS SECONDAIRES
// ==========================================

function ProjectScreen({ onBack }) {
    const [projects, setProjects] = useState(() => {
        const stored = localStorage.getItem('imperium_projects');
        if (stored) return JSON.parse(stored);
        const oldName = localStorage.getItem('imperium_project_name');
        const oldTasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
        return [{ id: Date.now(), title: oldName || "Projet Alpha", tasks: oldTasks, strategy: [] }];
    });
    const [selectedProject, setSelectedProject] = useState(null);
    const [newTask, setNewTask] = useState("");
    const [newProjName, setNewProjName] = useState("");
    const [showStrategy, setShowStrategy] = useState(false);
    const [aiQuestion, setAiQuestion] = useState(null);
    useEffect(() => { localStorage.setItem('imperium_projects', JSON.stringify(projects)); }, [projects]);
    const addProject = () => { if(!newProjName) return; setProjects([...projects, { id: Date.now(), title: newProjName, tasks: [], strategy: [] }]); setNewProjName(""); };
    const addTask = () => { if(!newTask || !selectedProject) return; const updated = projects.map(p => { if(p.id === selectedProject.id) return { ...p, tasks: [...p.tasks, { id: Date.now(), text: newTask, done: false }] }; return p; }); setProjects(updated); setSelectedProject(updated.find(p => p.id === selectedProject.id)); setNewTask(""); };
    const toggleTask = (taskId) => { const updated = projects.map(p => { if(p.id === selectedProject.id) { return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) }; } return p; }); setProjects(updated); setSelectedProject(updated.find(p => p.id === selectedProject.id)); };
    const askStrategy = () => { setShowStrategy(true); setAiQuestion(STRATEGY_QUESTIONS[Math.floor(Math.random() * STRATEGY_QUESTIONS.length)]); };
    if (selectedProject) { return ( <PageTransition> <div className="min-h-screen bg-black text-white p-6 flex flex-col"> <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-gray-500 mb-6 text-xs uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Retour aux Projets</button> <h1 className="text-2xl font-serif text-white font-bold mb-2">{selectedProject.title}</h1> <button onClick={askStrategy} className="bg-indigo-900/20 text-indigo-400 border border-indigo-500/30 p-3 rounded-lg mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-indigo-900/40 transition-colors"> <BrainCircuit className="w-4 h-4"/> Consulter le Stratège </button> {showStrategy && ( <div className="bg-[#1a1a1a] p-4 rounded-xl border border-indigo-500/30 mb-6 animate-in fade-in"> <div className="flex items-center gap-2 mb-2 text-indigo-400"><Zap className="w-4 h-4"/> <span className="text-xs font-bold uppercase">Question Tactique</span></div> <p className="text-sm text-gray-200 italic mb-4">"{aiQuestion}"</p> <button onClick={() => setShowStrategy(false)} className="w-full bg-white/10 py-2 rounded text-[10px] uppercase">Fermer</button> </div> )} <div className="flex-1 overflow-y-auto space-y-3 pb-24"> {selectedProject.tasks.map(t => ( <div key={t.id} onClick={() => toggleTask(t.id)} className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer ${t.done ? 'bg-black border-white/5 opacity-50' : 'bg-[#111] border-white/10'}`}> {t.done ? <CheckSquare className="w-4 h-4 text-gold"/> : <Square className="w-4 h-4 text-gray-500"/>} <span className={`text-sm ${t.done ? 'line-through text-gray-600' : 'text-gray-300'}`}>{t.text}</span> </div> ))} </div> <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10"> <div className="flex gap-2"> <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none" placeholder="Nouvelle tâche..." /> <button onClick={addTask} className="bg-gold text-black p-3 rounded-lg"><Plus className="w-5 h-5"/></button> </div> </div> </div> </PageTransition> ); }
    return ( <PageTransition> <div className="min-h-screen bg-black text-white p-6 flex flex-col"> <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 text-xs uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Retour au QG</button> <h1 className="text-2xl font-serif text-gold font-bold mb-6">Centre de Commandement</h1> <div className="space-y-4 flex-1 overflow-y-auto"> {projects.map(p => { const progress = p.tasks.length > 0 ? Math.round((p.tasks.filter(t=>t.done).length / p.tasks.length)*100) : 0; return ( <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-[#111] p-5 rounded-xl border border-white/5 hover:border-gold/30 cursor-pointer transition-colors group"> <div className="flex justify-between items-start mb-4"> <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">{p.title}</h3> <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold"/> </div> <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden"> <div className="bg-gold h-full transition-all duration-500" style={{width: `${progress}%`}}></div> </div> <p className="text-[10px] text-gray-500 mt-2 text-right">{progress}% Accomplis</p> </div> ); })} </div> <div className="mt-6 pt-6 border-t border-white/10"> <p className="text-xs text-gray-500 uppercase mb-2">Lancer une nouvelle conquête</p> <div className="flex gap-2"> <input type="text" value={newProjName} onChange={e => setNewProjName(e.target.value)} className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none" placeholder="Nom du projet..." /> <button onClick={addProject} className="bg-white/10 text-white p-3 rounded-lg"><Plus className="w-5 h-5"/></button> </div> </div> </div> </PageTransition> );
}

function ProtocolsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const [protocols, setProtocols] = useState(JSON.parse(localStorage.getItem('imperium_protocols') || "[]"));
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [freq, setFreq] = useState('monthly');
    const [type, setType] = useState('expense');
    useEffect(() => { localStorage.setItem('imperium_protocols', JSON.stringify(protocols)); }, [protocols]);
    const add = (e) => { e.preventDefault(); if(!name || !amount) return; setProtocols([...protocols, { id: Date.now(), name, amount: parseFloat(amount), freq, type }]); setName(""); setAmount(""); };
    const calculateMonthly = (p) => { const f = FREQUENCIES.find(fr => fr.id === p.freq) || FREQUENCIES[2]; return p.amount * f.factor; };
    const monthlyIncome = protocols.filter(p => p.type === 'income').reduce((acc, p) => acc + calculateMonthly(p), 0);
    const monthlyExpense = protocols.filter(p => p.type === 'expense').reduce((acc, p) => acc + calculateMonthly(p), 0);
    const netCashFlow = monthlyIncome - monthlyExpense;
    return ( <PageTransition> <div className="min-h-screen bg-black text-white p-6 flex flex-col"> <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 text-xs uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Retour au QG</button> <h1 className="text-2xl font-serif text-white font-bold mb-6">Protocoles</h1> <div className="bg-[#111] p-5 rounded-xl border border-white/10 mb-6"> <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cash-Flow Net (Estimé/Mois)</p> <h2 className={`text-3xl font-serif font-bold ${netCashFlow >= 0 ? 'text-gold' : 'text-red-500'}`}>{netCashFlow > 0 ? '+' : ''}{formatMoney(netCashFlow)} <span className="text-sm text-gray-600">{currency}</span></h2> </div> <div className="flex-1 overflow-y-auto space-y-3 pb-32"> {protocols.map(p => ( <div key={p.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center"> <div> <p className="font-bold text-gray-200">{p.name}</p> <p className="text-[10px] text-gray-500 uppercase">{FREQUENCIES.find(f=>f.id===p.freq)?.label}</p> </div> <div className="text-right"> <p className={`font-bold ${p.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{p.type==='income'?'+':'-'}{formatMoney(p.amount)}</p> <button onClick={() => setProtocols(protocols.filter(x=>x.id!==p.id))} className="text-[10px] text-gray-600 underline">Arrêter</button> </div> </div> ))} </div> <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10"> <div className="flex gap-1 mb-2"> <button onClick={() => setType('expense')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'bg-white/5 text-gray-500'}`}>CHARGE</button> <button onClick={() => setType('income')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'income' ? 'bg-green-900/50 text-green-200' : 'bg-white/5 text-gray-500'}`}>RENTE</button> </div> <form onSubmit={add} className="flex flex-col gap-2"> <div className="flex gap-2"> <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom..." className="flex-[2] bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" /> <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Montant" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" /> </div> <div className="flex gap-2"> <select value={freq} onChange={e => setFreq(e.target.value)} className="flex-[2] bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-xs outline-none"> {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)} </select> <button type="submit" className="flex-1 bg-white/10 text-white rounded-lg flex items-center justify-center"><Plus className="w-5 h-5"/></button> </div> </form> </div> </div> </PageTransition> );
}

function StatsScreen({ onBack }) { 
    // RESTAURATION DES STATS AVEC LE JUGE
    const tx = JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); 
    const currency = localStorage.getItem('imperium_currency') || "€";
    const total = tx.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0); 
    const wants = tx.filter(t=>t.type==='expense'&&t.category==='want').reduce((a,b)=>a+b.amount,0); 
    const needs = tx.filter(t=>t.type==='expense'&&t.category==='need').reduce((a,b)=>a+b.amount,0); 
    const wantPercent = total ? Math.round((wants/total)*100) : 0; 
    const needPercent = total ? Math.round((needs/total)*100) : 0; 

    return (
        <PageTransition>
            <div className="min-h-screen bg-black text-white p-6">
                <button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button>
                <h1 className="text-2xl font-serif text-white font-bold mb-6">Salle des Cartes</h1>
                
                <div className="bg-[#111] p-6 rounded-xl border border-white/10 mb-6">
                    <p className="text-xs text-gray-500 uppercase">Ratio de Futilité</p>
                    <h2 className={`text-4xl font-bold ${wantPercent>30?'text-red-500':'text-green-500'}`}>{wantPercent}%</h2>
                    <p className="text-gray-400 text-xs mt-1">Total dépensé: {formatMoney(total)} {currency}</p>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-xl p-6 mb-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Répartition Stratégique</h3>
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-white font-bold">Nécessités</span>
                            <span className="text-gray-400">{formatMoney(needs)} {currency}</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full" style={{ width: `${needPercent}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-red-400 font-bold">Futilités (Plaisirs)</span>
                            <span className="text-gray-400">{formatMoney(wants)} {currency}</span>
                        </div>
                        <div className="w-full bg-gray-900 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]" style={{ width: `${wantPercent}%` }}></div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border-l-2 border-gold p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2"><Shield className="w-4 h-4 text-gold" /><span className="text-xs font-bold text-gold uppercase tracking-widest">Rapport du Sergent</span></div>
                    <p className="text-sm text-gray-300 italic leading-relaxed">
                        "{total === 0 ? "Aucune donnée. L'Empire est immobile." : wantPercent > 50 ? "DISCIPLINE REQUISE ! Vous gaspillez plus de la moitié de vos ressources. L'Empire va s'effondrer." : wantPercent > 20 ? "Attention. Les plaisirs grignotent le trésor." : "Excellent. Vos ressources sont allouées à la survie et à la conquête."}"
                    </p>
                </div>
            </div>
        </PageTransition>
    ); 
}

function SettingsScreen({ onBack }) { 
    // RESTAURATION DES PARAMÈTRES COMPLETS
    const [importData, setImportData] = useState("");
    
    const handleExport = () => { 
        const data = {
            b: localStorage.getItem('imperium_balance'),
            t: localStorage.getItem('imperium_transactions'),
            p: localStorage.getItem('imperium_projects'),
            s: localStorage.getItem('imperium_skills'),
            c: localStorage.getItem('imperium_currency'),
            d: localStorage.getItem('imperium_debts'),
            pr: localStorage.getItem('imperium_protocols'),
            g: localStorage.getItem('imperium_goals'),
            o: localStorage.getItem('imperium_onboarded')
        };
        const code = btoa(JSON.stringify(data));
        navigator.clipboard.writeText(code); 
        alert("CODE SÉCURISÉ COPIÉ DANS LE PRESSE-PAPIER."); 
    }; 

    const handleImport = () => {
        try {
            if(!importData) return;
            const data = JSON.parse(atob(importData));
            if(data.b) localStorage.setItem('imperium_balance', data.b);
            if(data.t) localStorage.setItem('imperium_transactions', data.t);
            if(data.p) localStorage.setItem('imperium_projects', data.p);
            if(data.s) localStorage.setItem('imperium_skills', data.s);
            if(data.c) localStorage.setItem('imperium_currency', data.c);
            if(data.d) localStorage.setItem('imperium_debts', data.d);
            if(data.pr) localStorage.setItem('imperium_protocols', data.pr);
            if(data.g) localStorage.setItem('imperium_goals', data.g);
            if(data.o) localStorage.setItem('imperium_onboarded', data.o);
            alert("RESTAURATION TERMINÉE.");
            window.location.reload();
        } catch(e) {
            alert("CODE INVALIDE.");
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-black text-white p-6">
                <button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button>
                <h1 className="text-2xl font-serif text-white font-bold mb-6">Paramètres</h1>
                
                <div className="space-y-6">
                    <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <Download className="w-5 h-5"/>
                            <h3 className="text-sm font-bold">Sauvegarde Tactique</h3>
                        </div>
                        <button onClick={handleExport} className="w-full bg-blue-900/20 text-blue-400 border border-blue-500/30 py-3 font-bold rounded uppercase text-xs hover:bg-blue-900/40 transition-colors">Copier le Code de Sécurité</button>
                        <p className="text-[10px] text-gray-500 mt-2">Ce code contient tout votre Empire. Gardez-le secret.</p>
                    </div>

                    <div className="bg-[#111] p-6 rounded-xl border border-white/10">
                        <div className="flex items-center gap-2 mb-4 text-green-400">
                            <Upload className="w-5 h-5"/>
                            <h3 className="text-sm font-bold">Restauration</h3>
                        </div>
                        <textarea value={importData} onChange={e => setImportData(e.target.value)} placeholder="Collez le code ici..." className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:border-gold outline-none h-20 mb-3"/>
                        <button onClick={handleImport} className="w-full bg-green-900/20 text-green-400 border border-green-500/30 py-3 font-bold rounded uppercase text-xs hover:bg-green-900/40 transition-colors">Restaurer l'Empire</button>
                    </div>

                    <div className="mt-8 text-center pt-8 border-t border-white/5">
                        <button onClick={()=>{if(confirm("DANGER: Ceci effacera TOUT l'historique. Continuer ?")) {localStorage.clear(); window.location.reload();}}} className="text-red-500 text-xs uppercase font-bold flex items-center justify-center gap-2 w-full hover:bg-red-900/10 py-4 rounded transition-colors">
                            <Trash2 className="w-4 h-4"/>
                            Détruire l'Empire (Reset Total)
                        </button>
                    </div>
                </div>
            </div>
        </PageTransition>
    ); 
}

function SkillsScreen({ onBack }) { const [skills, setSkills] = useState(JSON.parse(localStorage.getItem('imperium_skills') || "[]")); const [newSkill, setNewSkill] = useState(""); useEffect(() => localStorage.setItem('imperium_skills', JSON.stringify(skills)), [skills]); return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Arsenal</h1><div className="space-y-2">{skills.map(s => <div key={s.id} className="bg-[#111] p-3 rounded border border-white/5 flex justify-between"><span className="text-gray-200">{s.name}</span><Trash2 onClick={() => setSkills(skills.filter(x=>x.id!==s.id))} className="w-4 h-4 text-gray-700 cursor-pointer"/></div>)}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10 flex gap-2"><input value={newSkill} onChange={e=>setNewSkill(e.target.value)} className="flex-1 bg-[#111] p-3 rounded text-white" placeholder="Compétence..."/><button onClick={()=>{if(newSkill)setSkills([...skills,{id:Date.now(),name:newSkill}]);setNewSkill("")}} className="bg-gold text-black p-3 rounded"><Plus/></button></div></div></PageTransition>); }
function GoalsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency'); const [goals, setGoals] = useState(JSON.parse(localStorage.getItem('imperium_goals') || "[]")); const [name, setName] = useState(""); const [target, setTarget] = useState(""); useEffect(() => localStorage.setItem('imperium_goals', JSON.stringify(goals)), [goals]); return (<PageTransition><div className="min-h-screen bg-black text-white p-6 flex flex-col"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Cibles</h1><div className="flex-1 space-y-4 overflow-y-auto pb-24">{goals.map(g => (<div key={g.id} className="bg-[#111] p-4 rounded-xl border border-white/5"><div className="flex justify-between mb-2"><span className="font-bold">{g.title}</span><X onClick={()=>setGoals(goals.filter(x=>x.id!==g.id))} className="w-4 h-4 text-gray-700"/></div><div className="w-full bg-gray-900 h-1 rounded mb-2"><div className="bg-blue-500 h-full" style={{width:`${Math.min(100,(g.current/g.target)*100)}%`}}></div></div><div className="flex justify-between text-xs text-gray-500"><span>{formatMoney(g.current)} {currency}</span><span>Obj: {formatMoney(g.target)}</span></div></div>))}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10"><div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-[#111] p-3 rounded text-white text-sm" placeholder="Nom..."/><input type="number" value={target} onChange={e=>setTarget(e.target.value)} className="w-24 bg-[#111] p-3 rounded text-white text-sm" placeholder="Cible"/><button onClick={()=>{if(name&&target)setGoals([...goals,{id:Date.now(),title:name,target:parseFloat(target),current:0}]);setName("");setTarget("")}} className="bg-blue-600 p-3 rounded text-white"><Plus/></button></div></div></div></PageTransition>); }
function DebtsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency'); const [debts, setDebts] = useState(JSON.parse(localStorage.getItem('imperium_debts') || "[]")); const [name, setName] = useState(""); const [amount, setAmount] = useState(""); const [type, setType] = useState('owe'); const [bal, setBal] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0")); useEffect(() => {localStorage.setItem('imperium_debts', JSON.stringify(debts));localStorage.setItem('imperium_balance', JSON.stringify(bal));}, [debts, bal]); const settle = (d) => { if(d.type==='owe' && bal<d.amount) return alert("Fonds insuffisants."); if(d.type==='owe') setBal(bal-d.amount); else setBal(bal+d.amount); setDebts(debts.filter(x=>x.id!==d.id)); }; return (<PageTransition><div className="min-h-screen bg-black text-white p-6 flex flex-col"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Registre</h1><div className="flex-1 space-y-3 overflow-y-auto pb-32">{debts.map(d => (<div key={d.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center"><div className="flex gap-3 items-center"><div className={`p-2 rounded ${d.type==='owe'?'bg-red-900/20 text-red-500':'bg-green-900/20 text-green-500'}`}>{d.type==='owe'?<UserMinus className="w-4 h-4"/>:<UserPlus className="w-4 h-4"/>}</div><div><p className="font-bold">{d.name}</p><p className="text-xs text-gray-500">{formatMoney(d.amount)} {currency}</p></div></div><button onClick={()=>settle(d)} className="text-[10px] border border-gray-700 px-3 py-1 rounded hover:bg-white/10 uppercase">Régler</button></div>))}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10"><div className="flex gap-2 mb-2"><button onClick={()=>setType('owe')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type==='owe'?'bg-red-900/50 text-red-200':'bg-gray-800 text-gray-500'}`}>JE DOIS</button><button onClick={()=>setType('owed')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type==='owed'?'bg-green-900/50 text-green-200':'bg-gray-800 text-gray-500'}`}>ON ME DOIT</button></div><div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-[#111] p-3 rounded text-white text-sm" placeholder="Qui..."/><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-24 bg-[#111] p-3 rounded text-white text-sm" placeholder="Montant"/><button onClick={()=>{if(name&&amount)setDebts([...debts,{id:Date.now(),name,amount:parseFloat(amount),type}]);setName("");setAmount("")}} className="bg-white/10 p-3 rounded text-white"><Plus/></button></div></div></div></PageTransition>); }