import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search } from 'lucide-react';

// --- LISTE DES DEVISES (Base de données statique) ---
const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar Américain' },
  { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA (BCEAO)' },
  { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA (BEAC)' },
  { code: 'CAD', symbol: '$', name: 'Dollar Canadien' },
  { code: 'GBP', symbol: '£', name: 'Livre Sterling' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc Suisse' },
  { code: 'MAD', symbol: 'DH', name: 'Dirham Marocain' },
  { code: 'DZD', symbol: 'DA', name: 'Dinar Algérien' },
  { code: 'TND', symbol: 'DT', name: 'Dinar Tunisien' },
  { code: 'NGN', symbol: '₦', name: 'Naira Nigérian' },
  { code: 'GHS', symbol: '₵', name: 'Cedi Ghanéen' },
  { code: 'CDF', symbol: 'FC', name: 'Franc Congolais' },
  { code: 'GNF', symbol: 'FG', name: 'Franc Guinéen' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonais' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chinois' },
  { code: 'INR', symbol: '₹', name: 'Roupie Indienne' },
  { code: 'RUB', symbol: '₽', name: 'Rouble Russe' },
  { code: 'BRL', symbol: 'R$', name: 'Réal Brésilien' },
  { code: 'AUD', symbol: '$', name: 'Dollar Australien' },
  { code: 'HTG', symbol: 'G', name: 'Gourde Haïtienne' },
];

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(localStorage.getItem('imperium_onboarded') === 'true');
  
  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  }

  return <MainOS />;
}

// ==========================================
// 0. GESTIONNAIRE DE VUES
// ==========================================
function MainOS() {
  const [currentView, setCurrentView] = useState('dashboard');

  if (currentView === 'dashboard') return <Dashboard onNavigate={(view) => setCurrentView(view)} />;
  if (currentView === 'project') return <ProjectScreen onBack={() => setCurrentView('dashboard')} />;
  if (currentView === 'skills') return <SkillsScreen onBack={() => setCurrentView('dashboard')} />;
}

// ==========================================
// 1. ONBOARDING (AVEC RECHERCHE DE DEVISE)
// ==========================================
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [initialBalance, setInitialBalance] = useState('');
  const [mainProject, setMainProject] = useState('');
  
  // Gestion Devise
  const [currency, setCurrency] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Gestion Pacte
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const [progress, setProgress] = useState(0);

  // Filtre les devises selon la recherche
  const filteredCurrencies = CURRENCIES.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectCurrency = (selected) => {
    setCurrency(selected.symbol); // On garde le symbole (ex: € ou FCFA)
    setStep(4); // On passe direct à l'étape suivante
  };

  const startHold = () => {
    setIsHolding(true);
    let p = 0;
    holdTimer.current = setInterval(() => { p += 2; setProgress(p); if (p >= 100) { clearInterval(holdTimer.current); setStep(3); } }, 30);
  };

  const stopHold = () => { setIsHolding(false); clearInterval(holdTimer.current); setProgress(0); };

  const finishOnboarding = () => {
    localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(initialBalance) || 0));
    localStorage.setItem('imperium_project_name', mainProject || "Empire Naissant");
    localStorage.setItem('imperium_currency', currency || "€");
    localStorage.setItem('imperium_onboarded', 'true');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden w-full h-full">
      {step === 1 && (
        <div className="animate-in fade-in duration-1000 flex flex-col items-center w-full max-w-xs">
          <h1 className="text-4xl font-serif font-bold tracking-widest mb-6">IMPERIUM</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">"Le chaos règne à l'extérieur.<br/>Ici, seule la discipline construit des Empires."</p>
          <button onClick={() => setStep(2)} className="border border-gold text-gold px-8 py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors">Prendre le contrôle</button>
        </div>
      )}
      {step === 2 && (
        <div className="animate-in zoom-in duration-500 flex flex-col items-center w-full max-w-xs">
          <h2 className="text-xl font-serif mb-2">Le Pacte</h2>
          <p className="text-gray-500 text-xs mb-12">Jurez-vous de ne rien cacher ?</p>
          <div className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform" onMouseDown={startHold} onMouseUp={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}>
            <svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gold" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} /></svg>
            <Fingerprint className={`w-10 h-10 ${isHolding ? 'text-gold animate-pulse' : 'text-gray-600'}`} />
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">Maintenir pour sceller</p>
        </div>
      )}
      
      {/* ÉTAPE 3 : SÉLECTEUR DE DEVISE (NOUVEAU) */}
      {step === 3 && (
        <div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]">
          <h2 className="text-xl font-serif text-gold mb-6">Votre Devise</h2>
          
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:border-gold focus:outline-none"
              placeholder="Rechercher (ex: Euro, FCFA...)"
              autoFocus
            />
          </div>

          {/* Liste déroulante */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {filteredCurrencies.map((c) => (
              <button 
                key={c.code}
                onClick={() => selectCurrency(c)}
                className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg flex justify-between items-center group transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif font-bold text-xs">
                    {c.symbol.substring(0, 2)}
                  </span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-200 group-hover:text-gold">{c.name}</p>
                    <p className="text-[10px] text-gray-500">{c.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold" />
              </button>
            ))}
            {filteredCurrencies.length === 0 && (
               <p className="text-xs text-gray-500 mt-4">Aucune devise trouvée.</p>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="animate-in slide-in-from-right duration-500 w-full max-w-xs">
          <label className="block text-xs text-gray-500 uppercase mb-2 text-left">Trésorerie Actuelle ({currency})</label>
          <input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="0" autoFocus />
          <button onClick={() => setStep(5)} disabled={!initialBalance} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">SUIVANT</button>
        </div>
      )}
      {step === 5 && (
        <div className="animate-in slide-in-from-right duration-500 w-full max-w-xs">
          <label className="block text-xs text-gray-500 uppercase mb-2 text-left">Nom du Projet Principal</label>
          <input type="text" value={mainProject} onChange={(e) => setMainProject(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="Ex: Agence IA" autoFocus />
          <button onClick={finishOnboarding} disabled={!mainProject} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">LANCER L'EMPIRE</button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. DASHBOARD PRINCIPAL
// ==========================================
function Dashboard({ onNavigate }) {
  const [balance, setBalance] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0"));
  const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('imperium_transactions') || "[]"));
  const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha";
  const currency = localStorage.getItem('imperium_currency') || "€";
  
  const tasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
  const completedTasks = tasks.filter(t => t.done).length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

  const skills = JSON.parse(localStorage.getItem('imperium_skills') || "[]");
  const mainSkill = skills.length > 0 ? skills[0] : null;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    localStorage.setItem('imperium_balance', JSON.stringify(balance));
    localStorage.setItem('imperium_transactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    const value = parseFloat(amount);
    const newBalance = transactionType === 'expense' ? balance - value : balance + value;
    const newTransaction = { id: Date.now(), desc: description || (transactionType === 'expense' ? "Dépense" : "Revenu"), amount: value, type: transactionType, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) };
    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
    setAmount(''); setDescription(''); setIsModalOpen(false);
  };

  const resetEmpire = () => { if(confirm("Attention : Reset complet ?")) { localStorage.clear(); window.location.reload(); } }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans pb-32 flex flex-col relative shadow-2xl animate-in fade-in duration-500">
      <header className="px-5 py-4 border-b border-white/5 bg-dark/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center w-full pt-[env(safe-area-inset-top)]">
         <div className="w-8"></div>
         <h1 className="text-xl font-serif text-gold tracking-widest font-bold text-center flex-1">IMPERIUM</h1>
         <button onClick={resetEmpire} className="w-8 flex justify-end text-gray-800 hover:text-red-900"><Trash2 className="w-4 h-4"/></button>
      </header>
      <div className="w-full px-4 mt-6">
        <div className="bg-[#151515] border-l-2 border-gold p-4 rounded-r-lg flex items-center gap-4 shadow-lg w-full">
          <div className="p-2 bg-gold/10 rounded-full shrink-0"><TrendingDown className="w-5 h-5 text-gold" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Allocation Survie</p><p className="text-white font-bold text-lg">{(balance / 30).toFixed(2)} {currency} <span className="text-gray-600 font-normal text-xs">/ jour</span></p></div>
        </div>
      </div>
      <main className="w-full px-4 grid gap-3 mt-4">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2 opacity-60 absolute top-4 left-4"><Shield className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Trésorerie</h2></div>
            <div className="text-center py-4 mt-2"><span className={`text-4xl font-bold font-serif ${balance < 0 ? 'text-red-500' : 'text-white'}`}>{balance.toFixed(2)} <span className="text-lg text-gray-500">{currency}</span></span></div>
        </div>
        <div onClick={() => onNavigate('skills')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group">
            <div className="absolute top-4 right-4 text-gray-600 group-hover:text-gold transition-colors"><ChevronRight className="w-5 h-5" /></div>
            <div className="flex items-center gap-2 mb-3 opacity-60"><Sword className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Arsenal</h2></div>
            {mainSkill ? (<div className="flex justify-between items-center"><span className="font-bold text-white text-sm">{mainSkill.name}</span><span className="text-[10px] text-gold bg-gold/10 px-2 py-1 rounded uppercase">{mainSkill.level}</span></div>) : (<p className="text-xs text-gray-500 italic">Aucune arme. Cliquez pour forger.</p>)}
        </div>
        <div onClick={() => onNavigate('project')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group">
            <div className="absolute top-4 right-4 text-gray-600 group-hover:text-gold transition-colors"><ChevronRight className="w-5 h-5" /></div>
            <div className="flex items-center gap-2 mb-3 opacity-60"><Castle className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Conquête</h2></div>
            <div className="flex justify-between items-center mb-2"><span className="font-bold text-white text-sm tracking-wide">{projectName}</span><span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded">{progressPercent}%</span></div>
            <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-gold h-1.5 rounded-full shadow-[0_0_10px_#D4AF37]" style={{ width: `${progressPercent}%` }}></div></div>
        </div>
      </main>
      <section className="w-full px-4 mt-6 flex-1">
        <div className="flex items-center gap-2 mb-4 px-1"><History className="w-3 h-3 text-gray-600" /><h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Derniers Mouvements</h3></div>
        <div className="space-y-2 pb-24">
            {transactions.length === 0 && <p className="text-center text-xs text-gray-800 italic py-8">Le calme avant la tempête.</p>}
            {transactions.map((t) => (
            <div key={t.id} className="bg-[#111] border-b border-white/5 p-3 flex justify-between items-center hover:bg-[#161616] transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full shrink-0 ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}</div>
                    <div className="overflow-hidden"><p className="text-sm text-gray-300 font-medium truncate">{t.desc}</p><p className="text-[10px] text-gray-600">{t.date}</p></div>
                </div>
                <span className={`font-mono font-bold text-sm shrink-0 ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'} {t.amount} {currency}</span>
            </div>
            ))}
        </div>
      </section>
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-700 py-2 text-white text-4xl font-serif focus:border-gold focus:outline-none placeholder-gray-800 text-center" placeholder="0" autoFocus />
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none" placeholder={transactionType === 'expense' ? "Ex: Burger..." : "Ex: Vente..."} />
              <button type="submit" className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors uppercase tracking-widest text-xs ${transactionType === 'expense' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>{transactionType === 'expense' ? 'Confirmer la perte' : 'Encaisser le butin'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. ÉCRAN PROJET
// ==========================================
function ProjectScreen({ onBack }) {
    const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha";
    const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('imperium_tasks') || "[]"));
    const [newTask, setNewTask] = useState("");
    useEffect(() => { localStorage.setItem('imperium_tasks', JSON.stringify(tasks)); }, [tasks]);
    const addTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); };
    const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); };
    const deleteTask = (id) => { setTasks(tasks.filter(t => t.id !== id)); };
    const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);
    return (
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">{projectName}</h1>
                <div className="flex items-center gap-4 mt-4"><div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }}></div></div><span className="text-gold font-bold text-sm">{progress}%</span></div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto pb-32">
                <div className="space-y-3">
                    {tasks.length === 0 && <div className="text-center py-10 border border-dashed border-white/10 rounded-xl"><p className="text-gray-500 text-sm">Aucune mission.</p></div>}
                    {tasks.map(task => (
                        <div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${task.done ? 'bg-dark border-transparent opacity-50' : 'bg-[#111] border-white/5'}`}>
                            <button onClick={() => toggleTask(task.id)} className="mt-0.5 text-gold hover:scale-110 transition-transform">{task.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button>
                            <p className={`flex-1 text-sm ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.text}</p>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                <form onSubmit={addTask} className="flex gap-2"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nouvelle mission..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newTask.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form>
            </div>
        </div>
    );
}

// ==========================================
// 4. ÉCRAN ARSENAL
// ==========================================
function SkillsScreen({ onBack }) {
    const [skills, setSkills] = useState(JSON.parse(localStorage.getItem('imperium_skills') || "[]"));
    const [newSkill, setNewSkill] = useState("");
    const [newLevel, setNewLevel] = useState("Apprenti");
    useEffect(() => { localStorage.setItem('imperium_skills', JSON.stringify(skills)); }, [skills]);
    const addSkill = (e) => { e.preventDefault(); if (!newSkill.trim()) return; setSkills([...skills, { id: Date.now(), name: newSkill, level: newLevel }]); setNewSkill(""); };
    const deleteSkill = (id) => { setSkills(skills.filter(s => s.id !== id)); };
    return (
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <div className="flex justify-between items-end"><h1 className="text-2xl font-serif text-white font-bold">Arsenal</h1><span className="text-gold text-sm font-bold">{skills.length} armes</span></div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto pb-40">
                <div className="space-y-3">
                    {skills.length === 0 && <div className="text-center py-10 border border-dashed border-white/10 rounded-xl"><Zap className="w-8 h-8 text-gray-700 mx-auto mb-2" /><p className="text-gray-500 text-sm">Arsenal vide.</p></div>}
                    {skills.map(skill => (
                        <div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg flex justify-between items-center group hover:border-gold/30 transition-colors">
                            <div className="flex items-center gap-3"><div className="p-2 bg-gray-900 rounded-lg text-gold"><Star className="w-4 h-4 fill-current" /></div><div><p className="text-sm font-bold text-gray-200">{skill.name}</p><p className="text-[10px] text-gold uppercase tracking-wider">{skill.level}</p></div></div>
                            <button onClick={() => deleteSkill(skill.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                <form onSubmit={addSkill} className="flex flex-col gap-3">
                    <div className="flex gap-2"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><select value={newLevel} onChange={(e) => setNewLevel(e.target.value)} className="bg-[#111] border border-white/10 rounded-lg px-2 text-xs text-gold focus:border-gold focus:outline-none"><option>Apprenti</option><option>Soldat</option><option>Expert</option><option>Maître</option></select></div>
                    <button type="submit" disabled={!newSkill.trim()} className="w-full bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> AJOUTER À L'ARSENAL</button>
                </form>
            </div>
        </div>
    );
}