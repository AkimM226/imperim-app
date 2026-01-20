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
    { title: "BIENVENUE, COMMANDANT", text: "Imperium v12 est chargé. Analyse financière tactique prête.", icon: Shield },
    { title: "ALLOCATION DE SURVIE", text: "Le système calcule désormais votre budget quotidien strict. Ne dépassez jamais cette limite journalière pour garantir la pérennité de l'Empire.", icon: Flame },
    { title: "PROTOCOLES FLEXIBLES", text: "Déclarez vos rentes quotidiennes ou mensuelles. Le système normalise tout pour vous donner votre véritable Cash-Flow.", icon: Repeat },
    { title: "RADAR DE DETTES", text: "Si votre trésorerie le permet, l'IA vous ordonnera d'abattre une dette spécifique. Obéissez pour regagner votre liberté.", icon: Scroll },
    { title: "CENTRE DE PROJETS", text: "Gérez plusieurs conquêtes simultanément. Utilisez l'assistant Stratège pour auditer la viabilité de vos plans.", icon: BrainCircuit },
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
            <p className="text-[10px] text-gray-600 mt-2 tracking-widest uppercase">Version 12.0 Stratège</p>
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
    // Initialisation d'un projet par défaut dans le nouveau format
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
  const [desc, setDesc] = useState('');

  const rank = getRank(balance, currency);
  const RankIcon = rank.icon;

  const lockedCash = goals.reduce((acc, g) => acc + g.current, 0);
  const availableCash = balance - lockedCash;
  
  // CALCUL DE L'ALLOCATION QUOTIDIENNE (SURVIE)
  // On divise le solde disponible par 30 jours pour donner une limite réaliste.
  const dailyAllocation = Math.max(0, Math.floor(availableCash / 30));

  // LOGIQUE DE SUGGESTION DE DETTE
  // Si le solde dispo est supérieur à 30% de plus que la plus petite dette, on suggère de payer.
  const debtToPay = debts.find(d => d.type === 'owe' && d.amount <= availableCash * 0.4);

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val) return;
    const newBal = type === 'expense' ? balance - val : balance + val;
    const newTx = { id: Date.now(), amount: val, type, desc: desc || (type==='expense'?'Dépense':'Revenu'), rawDate: new Date().toISOString() };
    
    setBalance(newBal);
    setTransactions([newTx, ...transactions]);
    localStorage.setItem('imperium_balance', JSON.stringify(newBal));
    localStorage.setItem('imperium_transactions', JSON.stringify([newTx, ...transactions]));
    setAmount(''); setDesc(''); setIsModalOpen(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white pb-32">
        <header className="p-6 flex justify-between items-center border-b border-white/5">
            <button onClick={() => onNavigate('stats')}><BarChart3 className="w-5 h-5 text-gray-500 hover:text-gold"/></button>
            <h1 className="text-gold font-serif font-bold tracking-widest">IMPERIUM</h1>
            <button onClick={() => onNavigate('settings')}><Settings className="w-5 h-5 text-gray-500 hover:text-white"/></button>
        </header>

        <div className="p-6 space-y-4">
            {/* EN-TÊTE GRADE */}
            <div className="flex justify-between items-end">
                <div><p className="text-[10px] text-gray-500 uppercase">Grade Actuel</p><div className={`flex items-center gap-2 ${rank.color}`}><RankIcon className="w-5 h-5"/><span className="font-bold font-serif text-lg">{rank.title}</span></div></div>
            </div>

            {/* CARTE PRINCIPALE : SOLDE */}
            <div className="bg-[#111] p-6 rounded-2xl border border-white/10 text-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-2 flex items-center justify-center gap-2"><Shield className="w-3 h-3 text-gold"/> Solde Disponible</p>
                <h2 className="text-4xl font-serif font-bold text-white mb-2">{formatMoney(availableCash)} <span className="text-sm text-gray-500">{currency}</span></h2>
                {lockedCash > 0 && <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1"><Lock className="w-3 h-3"/> +{formatMoney(lockedCash)} sécurisés</p>}
            </div>

            {/* NOUVEAU : ALLOCATION QUOTIDIENNE */}
            <div className="bg-[#0f1210] p-4 rounded-xl border border-green-900/30 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-900/20 text-green-500 rounded-lg"><Flame className="w-4 h-4"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Allocation Quotidienne</p>
                        <p className="text-sm font-bold text-white">Max {formatMoney(dailyAllocation)} {currency} / jour</p>
                    </div>
                </div>
            </div>

            {/* NOUVEAU : SUGGESTION DE DETTE (S'AFFICHE SI PERTINENT) */}
            {debtToPay && (
                <div className="bg-[#1a0f0f] p-4 rounded-xl border border-red-900/30 animate-in slide-in-from-right">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-red-900/20 text-red-500 rounded-lg shrink-0"><AlertTriangle className="w-4 h-4"/></div>
                        <div>
                            <p className="text-[10px] text-red-400 uppercase tracking-widest font-bold mb-1">Opportunité Stratégique</p>
                            <p className="text-xs text-gray-300 leading-relaxed mb-2">Commandant, vos réserves permettent d'éliminer la dette envers <span className="text-white font-bold">{debtToPay.name}</span> ({formatMoney(debtToPay.amount)}). Honorer cette dette renforcera votre structure.</p>
                            <button onClick={() => onNavigate('debts')} className="bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 text-[10px] font-bold uppercase py-2 px-4 rounded transition-colors">Accéder au Registre</button>
                        </div>
                    </div>
                </div>
            )}

            {/* NAVIGATION RAPIDE */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <div onClick={() => onNavigate('protocols')} className="bg-[#111] p-4 rounded-xl border border-white/5 hover:border-gold/30 cursor-pointer transition-colors"><div className="flex items-center gap-2 mb-2"><Repeat className="w-4 h-4 text-indigo-500"/> <span className="text-xs font-bold text-gray-300">Protocoles</span></div><p className="text-[10px] text-gray-600">Flux & Rentes</p></div>
                <div onClick={() => onNavigate('debts')} className="bg-[#111] p-4 rounded-xl border border-white/5 hover:border-gold/30 cursor-pointer transition-colors"><div className="flex items-center gap-2 mb-2"><Scroll className="w-4 h-4 text-purple-500"/> <span className="text-xs font-bold text-gray-300">Registre</span></div><p className="text-[10px] text-gray-600">Dettes</p></div>
                <div onClick={() => onNavigate('project')} className="bg-[#111] p-4 rounded-xl border border-white/5 hover:border-gold/30 cursor-pointer transition-colors"><div className="flex items-center gap-2 mb-2"><Castle className="w-4 h-4 text-gold"/> <span className="text-xs font-bold text-gray-300">Conquête</span></div><p className="text-[10px] text-gray-600">Projets & IA</p></div>
                <div onClick={() => onNavigate('goals')} className="bg-[#111] p-4 rounded-xl border border-white/5 hover:border-gold/30 cursor-pointer transition-colors"><div className="flex items-center gap-2 mb-2"><Target className="w-4 h-4 text-blue-500"/> <span className="text-xs font-bold text-gray-300">Cibles</span></div><p className="text-[10px] text-gray-600">Épargne</p></div>
            </div>
        </div>

        <div className="fixed bottom-10 left-0 right-0 flex justify-center pointer-events-none">
            <button onClick={() => setIsModalOpen(true)} className="pointer-events-auto bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-90 transition-transform"><Plus className="w-6 h-6"/></button>
        </div>
        
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/90 flex items-end z-50 animate-in fade-in duration-200">
                <div className="bg-[#161616] w-full p-8 rounded-t-3xl border-t border-white/10 animate-in slide-in-from-bottom duration-300">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setType('expense')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-lg transition-colors ${type === 'expense' ? 'bg-red-900 text-white' : 'bg-gray-900 text-gray-600'}`}>DÉPENSE</button>
                        <button onClick={() => setType('income')} className={`flex-1 py-3 text-xs font-bold uppercase rounded-lg transition-colors ${type === 'income' ? 'bg-green-900 text-white' : 'bg-gray-900 text-gray-600'}`}>REVENU</button>
                    </div>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-800 text-4xl text-center mb-6 outline-none font-serif text-white placeholder-gray-800" placeholder="0" autoFocus/>
                    <input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded-lg text-white text-sm mb-6 outline-none" placeholder="Description (optionnel)"/>
                    <button onClick={handleSubmit} className="w-full bg-white text-black py-4 font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-gray-200">CONFIRMER</button>
                    <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 mt-4 text-xs uppercase tracking-widest py-2">ANNULER</button>
                </div>
            </div>
        )}
      </div>
    </PageTransition>
  );
}

// ==========================================
// ECRANS SECONDAIRES (AVANCÉS)
// ==========================================

function ProjectScreen({ onBack }) {
    // Migration automatique pour les anciens utilisateurs
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

    const addProject = () => {
        if(!newProjName) return;
        setProjects([...projects, { id: Date.now(), title: newProjName, tasks: [], strategy: [] }]);
        setNewProjName("");
    };

    const addTask = () => {
        if(!newTask || !selectedProject) return;
        const updated = projects.map(p => {
            if(p.id === selectedProject.id) return { ...p, tasks: [...p.tasks, { id: Date.now(), text: newTask, done: false }] };
            return p;
        });
        setProjects(updated);
        setSelectedProject(updated.find(p => p.id === selectedProject.id));
        setNewTask("");
    };

    const toggleTask = (taskId) => {
        const updated = projects.map(p => {
            if(p.id === selectedProject.id) {
                return { ...p, tasks: p.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t) };
            }
            return p;
        });
        setProjects(updated);
        setSelectedProject(updated.find(p => p.id === selectedProject.id));
    };

    const askStrategy = () => {
        setShowStrategy(true);
        setAiQuestion(STRATEGY_QUESTIONS[Math.floor(Math.random() * STRATEGY_QUESTIONS.length)]);
    };

    if (selectedProject) {
        return (
            <PageTransition>
                <div className="min-h-screen bg-black text-white p-6 flex flex-col">
                    <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-gray-500 mb-6 text-xs uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Retour aux Projets</button>
                    <h1 className="text-2xl font-serif text-white font-bold mb-2">{selectedProject.title}</h1>
                    
                    <button onClick={askStrategy} className="bg-indigo-900/20 text-indigo-400 border border-indigo-500/30 p-3 rounded-lg mb-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-indigo-900/40 transition-colors">
                        <BrainCircuit className="w-4 h-4"/> Consulter le Stratège
                    </button>

                    {showStrategy && (
                        <div className="bg-[#1a1a1a] p-4 rounded-xl border border-indigo-500/30 mb-6 animate-in fade-in">
                            <div className="flex items-center gap-2 mb-2 text-indigo-400"><Zap className="w-4 h-4"/> <span className="text-xs font-bold uppercase">Question Tactique</span></div>
                            <p className="text-sm text-gray-200 italic mb-4">"{aiQuestion}"</p>
                            <button onClick={() => setShowStrategy(false)} className="w-full bg-white/10 py-2 rounded text-[10px] uppercase">Fermer</button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-3 pb-24">
                        {selectedProject.tasks.map(t => (
                            <div key={t.id} onClick={() => toggleTask(t.id)} className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer ${t.done ? 'bg-black border-white/5 opacity-50' : 'bg-[#111] border-white/10'}`}>
                                {t.done ? <CheckSquare className="w-4 h-4 text-gold"/> : <Square className="w-4 h-4 text-gray-500"/>}
                                <span className={`text-sm ${t.done ? 'line-through text-gray-600' : 'text-gray-300'}`}>{t.text}</span>
                            </div>
                        ))}
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10">
                        <div className="flex gap-2">
                            <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none" placeholder="Nouvelle tâche..." />
                            <button onClick={addTask} className="bg-gold text-black p-3 rounded-lg"><Plus className="w-5 h-5"/></button>
                        </div>
                    </div>
                </div>
            </PageTransition>
        );
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-black text-white p-6 flex flex-col">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 text-xs uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Retour au QG</button>
                <h1 className="text-2xl font-serif text-gold font-bold mb-6">Centre de Commandement</h1>
                
                <div className="space-y-4 flex-1 overflow-y-auto">
                    {projects.map(p => {
                        const progress = p.tasks.length > 0 ? Math.round((p.tasks.filter(t=>t.done).length / p.tasks.length)*100) : 0;
                        return (
                            <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-[#111] p-5 rounded-xl border border-white/5 hover:border-gold/30 cursor-pointer transition-colors group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-lg text-gray-200 group-hover:text-white">{p.title}</h3>
                                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-gold"/>
                                </div>
                                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-gold h-full transition-all duration-500" style={{width: `${progress}%`}}></div>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 text-right">{progress}% Accomplis</p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-xs text-gray-500 uppercase mb-2">Lancer une nouvelle conquête</p>
                    <div className="flex gap-2">
                        <input type="text" value={newProjName} onChange={e => setNewProjName(e.target.value)} className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none" placeholder="Nom du projet..." />
                        <button onClick={addProject} className="bg-white/10 text-white p-3 rounded-lg"><Plus className="w-5 h-5"/></button>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

function ProtocolsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    const [protocols, setProtocols] = useState(JSON.parse(localStorage.getItem('imperium_protocols') || "[]"));
    const [name, setName] = useState("");
    const [amount, setAmount] = useState("");
    const [freq, setFreq] = useState('monthly');
    const [type, setType] = useState('expense');

    useEffect(() => { localStorage.setItem('imperium_protocols', JSON.stringify(protocols)); }, [protocols]);

    const add = (e) => {
        e.preventDefault();
        if(!name || !amount) return;
        setProtocols([...protocols, { id: Date.now(), name, amount: parseFloat(amount), freq, type }]);
        setName(""); setAmount("");
    };

    // Calcul du cashflow mensuel normalisé
    const calculateMonthly = (p) => {
        const f = FREQUENCIES.find(fr => fr.id === p.freq) || FREQUENCIES[2];
        return p.amount * f.factor;
    };

    const monthlyIncome = protocols.filter(p => p.type === 'income').reduce((acc, p) => acc + calculateMonthly(p), 0);
    const monthlyExpense = protocols.filter(p => p.type === 'expense').reduce((acc, p) => acc + calculateMonthly(p), 0);
    const netCashFlow = monthlyIncome - monthlyExpense;

    return (
        <PageTransition>
            <div className="min-h-screen bg-black text-white p-6 flex flex-col">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 text-xs uppercase tracking-widest"><ArrowLeft className="w-4 h-4"/> Retour au QG</button>
                <h1 className="text-2xl font-serif text-white font-bold mb-6">Protocoles</h1>
                
                <div className="bg-[#111] p-5 rounded-xl border border-white/10 mb-6">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cash-Flow Net (Estimé/Mois)</p>
                    <h2 className={`text-3xl font-serif font-bold ${netCashFlow >= 0 ? 'text-gold' : 'text-red-500'}`}>{netCashFlow > 0 ? '+' : ''}{formatMoney(netCashFlow)} <span className="text-sm text-gray-600">{currency}</span></h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pb-32">
                    {protocols.map(p => (
                        <div key={p.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-200">{p.name}</p>
                                <p className="text-[10px] text-gray-500 uppercase">{FREQUENCIES.find(f=>f.id===p.freq)?.label}</p>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold ${p.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>{p.type==='income'?'+':'-'}{formatMoney(p.amount)}</p>
                                <button onClick={() => setProtocols(protocols.filter(x=>x.id!==p.id))} className="text-[10px] text-gray-600 underline">Arrêter</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10">
                     <div className="flex gap-1 mb-2">
                        <button onClick={() => setType('expense')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'expense' ? 'bg-red-900/50 text-red-200' : 'bg-white/5 text-gray-500'}`}>CHARGE</button>
                        <button onClick={() => setType('income')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type === 'income' ? 'bg-green-900/50 text-green-200' : 'bg-white/5 text-gray-500'}`}>RENTE</button>
                    </div>
                    <form onSubmit={add} className="flex flex-col gap-2">
                        <div className="flex gap-2">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nom..." className="flex-[2] bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Montant" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none" />
                        </div>
                        <div className="flex gap-2">
                             <select value={freq} onChange={e => setFreq(e.target.value)} className="flex-[2] bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-xs outline-none">
                                {FREQUENCIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                             </select>
                             <button type="submit" className="flex-1 bg-white/10 text-white rounded-lg flex items-center justify-center"><Plus className="w-5 h-5"/></button>
                        </div>
                    </form>
                </div>
            </div>
        </PageTransition>
    );
}

// ==========================================
// AUTRES ECRANS (RESTANTS, SIMPLIFIÉS MAIS FONCTIONNELS)
// ==========================================
function SkillsScreen({ onBack }) { const [skills, setSkills] = useState(JSON.parse(localStorage.getItem('imperium_skills') || "[]")); const [newSkill, setNewSkill] = useState(""); useEffect(() => localStorage.setItem('imperium_skills', JSON.stringify(skills)), [skills]); return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Arsenal</h1><div className="space-y-2">{skills.map(s => <div key={s.id} className="bg-[#111] p-3 rounded border border-white/5 flex justify-between"><span className="text-gray-200">{s.name}</span><Trash2 onClick={() => setSkills(skills.filter(x=>x.id!==s.id))} className="w-4 h-4 text-gray-700 cursor-pointer"/></div>)}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10 flex gap-2"><input value={newSkill} onChange={e=>setNewSkill(e.target.value)} className="flex-1 bg-[#111] p-3 rounded text-white" placeholder="Compétence..."/><button onClick={()=>{if(newSkill)setSkills([...skills,{id:Date.now(),name:newSkill}]);setNewSkill("")}} className="bg-gold text-black p-3 rounded"><Plus/></button></div></div></PageTransition>); }
function StatsScreen({ onBack }) { const tx = JSON.parse(localStorage.getItem('imperium_transactions') || "[]"); const total = tx.filter(t=>t.type==='expense').reduce((a,b)=>a+b.amount,0); const wants = tx.filter(t=>t.type==='expense'&&t.category==='want').reduce((a,b)=>a+b.amount,0); const ratio = total ? Math.round((wants/total)*100) : 0; return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Salle des Cartes</h1><div className="bg-[#111] p-6 rounded-xl border border-white/10 mb-4"><p className="text-xs text-gray-500 uppercase">Ratio de Futilité</p><h2 className={`text-4xl font-bold ${ratio>30?'text-red-500':'text-green-500'}`}>{ratio}%</h2></div><p className="text-gray-400 text-sm italic">"{ratio > 30 ? "Attention soldat, trop de plaisirs affaiblissent l'Empire." : "Discipline exemplaire."}"</p></div></PageTransition>); }
function GoalsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency'); const [goals, setGoals] = useState(JSON.parse(localStorage.getItem('imperium_goals') || "[]")); const [name, setName] = useState(""); const [target, setTarget] = useState(""); useEffect(() => localStorage.setItem('imperium_goals', JSON.stringify(goals)), [goals]); return (<PageTransition><div className="min-h-screen bg-black text-white p-6 flex flex-col"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Cibles</h1><div className="flex-1 space-y-4 overflow-y-auto pb-24">{goals.map(g => (<div key={g.id} className="bg-[#111] p-4 rounded-xl border border-white/5"><div className="flex justify-between mb-2"><span className="font-bold">{g.title}</span><X onClick={()=>setGoals(goals.filter(x=>x.id!==g.id))} className="w-4 h-4 text-gray-700"/></div><div className="w-full bg-gray-900 h-1 rounded mb-2"><div className="bg-blue-500 h-full" style={{width:`${Math.min(100,(g.current/g.target)*100)}%`}}></div></div><div className="flex justify-between text-xs text-gray-500"><span>{formatMoney(g.current)} {currency}</span><span>Obj: {formatMoney(g.target)}</span></div></div>))}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10"><div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-[#111] p-3 rounded text-white text-sm" placeholder="Nom..."/><input type="number" value={target} onChange={e=>setTarget(e.target.value)} className="w-24 bg-[#111] p-3 rounded text-white text-sm" placeholder="Cible"/><button onClick={()=>{if(name&&target)setGoals([...goals,{id:Date.now(),title:name,target:parseFloat(target),current:0}]);setName("");setTarget("")}} className="bg-blue-600 p-3 rounded text-white"><Plus/></button></div></div></div></PageTransition>); }
function DebtsScreen({ onBack }) { const currency = localStorage.getItem('imperium_currency'); const [debts, setDebts] = useState(JSON.parse(localStorage.getItem('imperium_debts') || "[]")); const [name, setName] = useState(""); const [amount, setAmount] = useState(""); const [type, setType] = useState('owe'); const [bal, setBal] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0")); useEffect(() => {localStorage.setItem('imperium_debts', JSON.stringify(debts));localStorage.setItem('imperium_balance', JSON.stringify(bal));}, [debts, bal]); const settle = (d) => { if(d.type==='owe' && bal<d.amount) return alert("Fonds insuffisants."); if(d.type==='owe') setBal(bal-d.amount); else setBal(bal+d.amount); setDebts(debts.filter(x=>x.id!==d.id)); }; return (<PageTransition><div className="min-h-screen bg-black text-white p-6 flex flex-col"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Registre</h1><div className="flex-1 space-y-3 overflow-y-auto pb-32">{debts.map(d => (<div key={d.id} className="bg-[#111] p-4 rounded-xl border border-white/5 flex justify-between items-center"><div className="flex gap-3 items-center"><div className={`p-2 rounded ${d.type==='owe'?'bg-red-900/20 text-red-500':'bg-green-900/20 text-green-500'}`}>{d.type==='owe'?<UserMinus className="w-4 h-4"/>:<UserPlus className="w-4 h-4"/>}</div><div><p className="font-bold">{d.name}</p><p className="text-xs text-gray-500">{formatMoney(d.amount)} {currency}</p></div></div><button onClick={()=>settle(d)} className="text-[10px] border border-gray-700 px-3 py-1 rounded hover:bg-white/10 uppercase">Régler</button></div>))}</div><div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-white/10"><div className="flex gap-2 mb-2"><button onClick={()=>setType('owe')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type==='owe'?'bg-red-900/50 text-red-200':'bg-gray-800 text-gray-500'}`}>JE DOIS</button><button onClick={()=>setType('owed')} className={`flex-1 py-1 text-[10px] font-bold rounded ${type==='owed'?'bg-green-900/50 text-green-200':'bg-gray-800 text-gray-500'}`}>ON ME DOIT</button></div><div className="flex gap-2"><input value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-[#111] p-3 rounded text-white text-sm" placeholder="Qui..."/><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-24 bg-[#111] p-3 rounded text-white text-sm" placeholder="Montant"/><button onClick={()=>{if(name&&amount)setDebts([...debts,{id:Date.now(),name,amount:parseFloat(amount),type}]);setName("");setAmount("")}} className="bg-white/10 p-3 rounded text-white"><Plus/></button></div></div></div></PageTransition>); }
function SettingsScreen({ onBack }) { const handleExport = () => { navigator.clipboard.writeText(btoa(JSON.stringify(localStorage))); alert("Données copiées."); }; return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="text-gray-500 text-xs mb-6 uppercase tracking-widest flex items-center gap-2"><ArrowLeft className="w-4 h-4"/> Retour</button><h1 className="text-2xl font-serif text-white font-bold mb-6">Paramètres</h1><div className="bg-[#111] p-6 rounded-xl border border-white/10"><p className="text-sm font-bold mb-4">Sauvegarde Tactique</p><button onClick={handleExport} className="w-full bg-gold text-black py-3 font-bold rounded uppercase text-xs">Copier le Code de Restauration</button></div><div className="mt-8 text-center"><button onClick={()=>{if(confirm("Reset total ?")) {localStorage.clear(); window.location.reload();}}} className="text-red-500 text-xs uppercase font-bold">Réinitialiser l'Empire</button></div></div></PageTransition>); }