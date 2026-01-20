import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe, BarChart3, Flame, Clock, Medal, Lock, Quote, Loader2, Target, PiggyBank, Unlock, Scroll, UserMinus, UserPlus, Repeat, Infinity, CalendarClock, BookOpen, Save } from 'lucide-react';

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
  "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant."
];

// ==========================================
// MANUEL DE FORMATION (TUTORIEL)
// ==========================================
const TUTORIAL_STEPS = [
    { title: "BIENVENUE, COMMANDANT", text: "Imperium est votre poste de commandement financier. Ici, chaque unité de monnaie est un soldat sous vos ordres.", icon: Shield },
    { title: "LE SOLDE VIRTUEL", text: "Le chiffre central est votre 'Solde Disponible'. S'il est positif, vous survivez. S'il vire au rouge, vous êtes à découvert tactique.", icon: PiggyBank },
    { title: "LES PROTOCOLES", text: "Gérez vos abonnements (charges) et vos revenus passifs. Le système calculera votre cash-flow net mensuel automatiquement.", icon: Repeat },
    { title: "LE REGISTRE", text: "Traquez ce que vous devez (Tributs) et ce qu'on vous doit (Butin). Un Empire solide ne laisse personne oublier ses dettes.", icon: Scroll },
    { title: "LES CIBLES", text: "Une Cible est un objectif d'épargne. L'argent alloué à une cible est 'verrouillé' et retiré du solde disponible pour vous protéger.", icon: Target },
    { title: "ARSENAL & CONQUÊTE", text: "L'Arsenal liste vos compétences. La section Conquête gère vos projets. C'est ici que vous bâtissez votre infrastructure.", icon: Sword },
    { title: "GRADE & CARTES", text: "Votre Grade évolue selon votre fortune. La Salle des Cartes (Stats) analyse si vous dépensez trop en futilités.", icon: Medal },
    { title: "ARCHIVES", text: "Dans les Paramètres, générez un code d'exportation. Il permet de restaurer toute votre progression sur n'importe quel appareil.", icon: Save }
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
// COMPOSANTS UX DE BASE
// ==========================================
function SplashScreen() {
    return (
        <div className="fixed inset-0 bg-[#050505] z-[100] flex flex-col items-center justify-center">
            <Fingerprint className="w-20 h-20 text-gold animate-pulse mb-6" />
            <h1 className="text-3xl font-serif font-bold text-gold tracking-[0.3em]">IMPERIUM</h1>
        </div>
    );
}

function PageTransition({ children }) {
    return (<div className="animate-in slide-in-from-bottom-4 fade-in duration-300 w-full flex-1 flex flex-col">{children}</div>);
}

// ==========================================
// COMPOSANT TUTORIEL
// ==========================================
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
                    {stepIndex === TUTORIAL_STEPS.length - 1 ? "C'EST COMPRIS" : "SUIVANT"}
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
// ECRANS (DASHBOARD, ONBOARDING, ETC)
// ==========================================

function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [balance, setBalance] = useState('');
  const [project, setProject] = useState('');
  const [currency, setCurrency] = useState('€');
  const finish = () => {
    localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(balance) || 0));
    localStorage.setItem('imperium_project_name', project || "Empire");
    localStorage.setItem('imperium_currency', currency);
    localStorage.setItem('imperium_onboarded', 'true');
    onComplete();
  };
  return (
    <div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-8 text-center">
      {step === 1 && <><h1 className="text-4xl font-serif font-bold mb-4">IMPERIUM</h1><button onClick={() => setStep(2)} className="border border-gold px-8 py-3 uppercase text-xs">Prendre le contrôle</button></>}
      {step === 2 && <><p className="mb-4">Trésorerie Actuelle</p><input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="bg-transparent border-b border-gold text-2xl text-center mb-8 outline-none" placeholder="0"/><button onClick={() => setStep(3)} className="bg-gold text-black px-8 py-3 font-bold">SUIVANT</button></>}
      {step === 3 && <><p className="mb-4">Nom de l'Empire</p><input type="text" value={project} onChange={e => setProject(e.target.value)} className="bg-transparent border-b border-gold text-2xl text-center mb-8 outline-none" placeholder="Mon Projet"/><button onClick={finish} className="bg-gold text-black px-8 py-3 font-bold">LANCER</button></>}
    </div>
  );
}

function Dashboard({ onNavigate }) {
  const [balance, setBalance] = useState(() => JSON.parse(localStorage.getItem('imperium_balance') || "0"));
  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('imperium_transactions') || "[]"));
  const currency = localStorage.getItem('imperium_currency') || "€";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [cat, setCat] = useState('need');

  const rank = getRank(balance, currency);
  const RankIcon = rank.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    const newBal = type === 'expense' ? balance - val : balance + val;
    const newTx = { id: Date.now(), amount: val, type, category: cat, rawDate: new Date().toISOString() };
    setBalance(newBal);
    setTransactions([newTx, ...transactions]);
    localStorage.setItem('imperium_balance', JSON.stringify(newBal));
    localStorage.setItem('imperium_transactions', JSON.stringify([newTx, ...transactions]));
    setAmount(''); setIsModalOpen(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-black text-white pb-32">
        <header className="p-6 flex justify-between items-center border-b border-white/5">
            <button onClick={() => onNavigate('stats')}><BarChart3 className="w-5 h-5 text-gray-500"/></button>
            <h1 className="text-gold font-serif font-bold tracking-widest">IMPERIUM</h1>
            <button onClick={() => onNavigate('settings')}><Settings className="w-5 h-5 text-gray-500"/></button>
        </header>
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div><p className="text-[10px] text-gray-500 uppercase">Grade</p><div className={`flex items-center gap-2 ${rank.color}`}><RankIcon className="w-4 h-4"/><span className="font-bold">{rank.title}</span></div></div>
            </div>
            <div className="bg-[#111] p-8 rounded-2xl border border-white/5 text-center mb-6">
                <p className="text-xs text-gray-500 uppercase mb-2">Solde Disponible</p>
                <h2 className="text-4xl font-serif font-bold">{formatMoney(balance)} <span className="text-lg text-gray-600">{currency}</span></h2>
            </div>
            <div className="grid gap-3">
                <div onClick={() => onNavigate('protocols')} className="bg-[#111] p-5 rounded-xl flex justify-between items-center border border-white/5"><div className="flex items-center gap-3"><Repeat className="w-5 h-5 text-indigo-500"/><span>Protocoles</span></div><ChevronRight className="w-4 h-4 text-gray-700"/></div>
                <div onClick={() => onNavigate('debts')} className="bg-[#111] p-5 rounded-xl flex justify-between items-center border border-white/5"><div className="flex items-center gap-3"><Scroll className="w-5 h-5 text-purple-500"/><span>Registre</span></div><ChevronRight className="w-4 h-4 text-gray-700"/></div>
                <div onClick={() => onNavigate('goals')} className="bg-[#111] p-5 rounded-xl flex justify-between items-center border border-white/5"><div className="flex items-center gap-3"><Target className="w-5 h-5 text-blue-500"/><span>Cibles</span></div><ChevronRight className="w-4 h-4 text-gray-700"/></div>
                <div className="grid grid-cols-2 gap-3">
                    <div onClick={() => onNavigate('skills')} className="bg-[#111] p-4 rounded-xl border border-white/5"><Sword className="w-5 h-5 text-gold mb-2"/> Arsenal</div>
                    <div onClick={() => onNavigate('project')} className="bg-[#111] p-4 rounded-xl border border-white/5"><Castle className="w-5 h-5 text-gold mb-2"/> Conquête</div>
                </div>
            </div>
        </div>
        <div className="fixed bottom-10 left-0 right-0 flex justify-center"><button onClick={() => setIsModalOpen(true)} className="bg-gold text-black w-14 h-14 rounded-full flex items-center justify-center shadow-lg"><Plus/></button></div>
        
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/90 flex items-end z-50">
                <div className="bg-[#111] w-full p-8 rounded-t-3xl border-t border-white/10">
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded ${type === 'expense' ? 'bg-red-900 text-white' : 'bg-gray-900 text-gray-500'}`}>DÉPENSE</button>
                        <button onClick={() => setType('income')} className={`flex-1 py-2 rounded ${type === 'income' ? 'bg-green-900 text-white' : 'bg-gray-900 text-gray-500'}`}>REVENU</button>
                    </div>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-800 text-3xl text-center mb-8 outline-none" placeholder="0" autoFocus/>
                    <button onClick={handleSubmit} className="w-full bg-white text-black py-4 font-bold rounded-xl">VALIDER</button>
                    <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-500 mt-4">ANNULER</button>
                </div>
            </div>
        )}
      </div>
    </PageTransition>
  );
}

// ==========================================
// ECRANS SECONDAIRES SIMPLIFIÉS
// ==========================================
function ProjectScreen({ onBack }) { return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Conquête</h1><p className="text-gray-500 mt-4">Projets en cours de déploiement...</p></div></PageTransition>); }
function SkillsScreen({ onBack }) { return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Arsenal</h1><p className="text-gray-500 mt-4">Compétences tactiques...</p></div></PageTransition>); }
function StatsScreen({ onBack }) { return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Salle des Cartes</h1><p className="text-gray-500 mt-4">Analyse de discipline...</p></div></PageTransition>); }
function GoalsScreen({ onBack }) { return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Cibles</h1><p className="text-gray-500 mt-4">Objectifs de conquête...</p></div></PageTransition>); }
function DebtsScreen({ onBack }) { return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Le Registre</h1><p className="text-gray-500 mt-4">Dettes et créances...</p></div></PageTransition>); }
function ProtocolsScreen({ onBack }) { return (<PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Protocoles</h1><p className="text-gray-500 mt-4">Flux automatiques...</p></div></PageTransition>); }
function SettingsScreen({ onBack }) {
    const handleExport = () => {
        const data = btoa(JSON.stringify(localStorage));
        navigator.clipboard.writeText(data);
        alert("CODE D'ARCHIVE COPIÉ.");
    };
    return (
        <PageTransition><div className="min-h-screen bg-black text-white p-6"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-8"><ArrowLeft/> Retour</button><h1 className="text-2xl font-serif text-gold">Paramètres</h1><div className="mt-8 bg-[#111] p-6 rounded-xl border border-white/5"><h3 className="mb-4">Sauvegarde</h3><button onClick={handleExport} className="w-full bg-gold text-black py-3 font-bold rounded">EXPORTER L'EMPIRE</button></div></div></PageTransition>
    );
}