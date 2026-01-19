import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint, ChevronRight, CheckSquare, Square, ArrowLeft, Star, Zap, Search, Settings, Copy, Download, Upload, Briefcase, AlertTriangle, Globe } from 'lucide-react';

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

// NOUVEAU : ZONES ÉCONOMIQUES (Pour ajuster la réalité des prix)
const ZONES = [
  { id: 'west_africa', name: 'Afrique (Marché Local)', factor: 0.6, desc: 'Prix adaptés au pouvoir d\'achat local.' },
  { id: 'europe', name: 'Europe / Occident', factor: 1.0, desc: 'Prix standards internationaux.' },
  { id: 'remote', name: 'Afrique vers l\'International', factor: 1.0, desc: 'Tu vis en Afrique mais tu vends en France/USA.' },
  { id: 'maghreb', name: 'Maghreb', factor: 0.8, desc: 'Ajustement pour le marché du Nord.' }
];

// Base de prix en VALEUR EURO (Référence mondiale)
const BUSINESS_IDEAS = {
  'default': { title: 'Freelance Standard', price: 50, task: 'Propose tes services sur les groupes Facebook ou ton entourage.' },
  'react': { title: 'Site Vitrine Commerçant', price: 250, task: 'Crée un site simple pour un maquis, un hôtel ou un artisan.' },
  'javascript': { title: 'Automatisation Excel', price: 100, task: 'Aide une PME à gérer ses stocks automatiquement.' },
  'design': { title: 'Identité Visuelle', price: 150, task: 'Refais le logo et la carte de visite d\'un business local.' },
  'logo': { title: 'Création de Logo', price: 50, task: 'Crée 3 propositions de logos pour une nouvelle boutique.' },
  'infographie': { title: 'Pack Pub Réseaux Sociaux', price: 45, task: 'Crée 5 visuels pro pour le statut WhatsApp d\'un vendeur.' },
  'flyer': { title: 'Affiche / Flyer', price: 30, task: 'Conçois l\'affiche d\'un événement, mariage ou concert.' },
  'anglais': { title: 'Traduction Documents', price: 30, task: 'Traduis des CV ou des résumés pour des étudiants.' },
  'montage': { title: 'Vidéos TikTok/Reels', price: 40, task: 'Monte des vidéos dynamiques pour un influenceur local.' },
  'video': { title: 'Couverture Mariage/Event', price: 200, task: 'Filme et monte un résumé souvenir d\'une cérémonie.' },
  'redaction': { title: 'Rédaction CV Pro', price: 25, task: 'Refais le CV et la lettre de motivation d\'un chercheur d\'emploi.' },
  'ia': { title: 'Formation ChatGPT', price: 80, task: 'Forme une petite équipe à utiliser l\'IA pour gagner du temps.' },
  'community': { title: 'Gestion Page Facebook', price: 100, task: 'Anime la page d\'une boutique : 2 posts par semaine pendant 1 mois.' }
};

export default function App() {
  const [hasOnboarded, setHasOnboarded] = useState(localStorage.getItem('imperium_onboarded') === 'true');
  if (!hasOnboarded) return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  return <MainOS />;
}

const formatMoney = (amount) => {
  return Math.floor(amount).toLocaleString('fr-FR');
};

// ==========================================
// 1. ONBOARDING (AVEC ZONE GÉOGRAPHIQUE)
// ==========================================
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [initialBalance, setInitialBalance] = useState('');
  const [mainProject, setMainProject] = useState('');
  const [currency, setCurrency] = useState('');
  const [zone, setZone] = useState(null); // NOUVEAU
  const [searchTerm, setSearchTerm] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  const holdTimer = useRef(null);
  const [progress, setProgress] = useState(0);

  const filteredCurrencies = CURRENCIES.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()));
  const selectCurrency = (selected) => { setCurrency(selected.symbol); setStep(4); };
  
  // NOUVEAU : SÉLECTION ZONE
  const selectZone = (selectedZone) => { setZone(selectedZone); setStep(5); };

  const startHold = () => { setIsHolding(true); let p = 0; holdTimer.current = setInterval(() => { p += 2; setProgress(p); if (p >= 100) { clearInterval(holdTimer.current); setStep(3); } }, 30); };
  const stopHold = () => { setIsHolding(false); clearInterval(holdTimer.current); setProgress(0); };

  const finishOnboarding = () => {
    localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(initialBalance) || 0));
    localStorage.setItem('imperium_project_name', mainProject || "Empire Naissant");
    localStorage.setItem('imperium_currency', currency || "€");
    localStorage.setItem('imperium_zone', JSON.stringify(zone || ZONES[0])); // Sauvegarde de la zone
    localStorage.setItem('imperium_onboarded', 'true');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden w-full h-full">
      {step === 1 && (<div className="animate-in fade-in duration-1000 flex flex-col items-center w-full max-w-xs"><h1 className="text-4xl font-serif font-bold tracking-widest mb-6">IMPERIUM</h1><p className="text-gray-400 text-sm leading-relaxed mb-10">"Le chaos règne à l'extérieur.<br/>Ici, seule la discipline construit des Empires."</p><button onClick={() => setStep(2)} className="border border-gold text-gold px-8 py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors">Prendre le contrôle</button></div>)}
      {step === 2 && (<div className="animate-in zoom-in duration-500 flex flex-col items-center w-full max-w-xs"><h2 className="text-xl font-serif mb-2">Le Pacte</h2><p className="text-gray-500 text-xs mb-12">Jurez-vous de ne rien cacher ?</p><div className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform" onMouseDown={startHold} onMouseUp={stopHold} onTouchStart={startHold} onTouchEnd={stopHold}><svg className="absolute inset-0 w-full h-full -rotate-90"><circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gold" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} /></svg><Fingerprint className={`w-10 h-10 ${isHolding ? 'text-gold animate-pulse' : 'text-gray-600'}`} /></div><p className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">Maintenir pour sceller</p></div>)}
      
      {step === 3 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]"><h2 className="text-xl font-serif text-gold mb-6">Votre Devise</h2><div className="relative mb-4"><Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#111] border border-white/20 rounded-lg pl-10 pr-4 py-3 text-white text-sm focus:border-gold focus:outline-none" placeholder="Rechercher (ex: Euro, FCFA...)" autoFocus /></div><div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">{filteredCurrencies.map((c) => (<button key={c.code} onClick={() => selectCurrency(c)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg flex justify-between items-center group transition-all active:scale-[0.98]"><div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gold/10 text-gold flex items-center justify-center font-serif font-bold text-xs">{c.symbol.substring(0, 2)}</span><div className="text-left"><p className="text-sm font-bold text-gray-200 group-hover:text-gold">{c.name}</p><p className="text-[10px] text-gray-500">{c.code}</p></div></div><ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gold" /></button>))}</div></div>)}
      
      {/* ÉTAPE 4 : ZONE GÉOGRAPHIQUE (NOUVEAU) */}
      {step === 4 && (
        <div className="animate-in slide-in-from-right duration-500 w-full max-w-sm flex flex-col h-[70vh]">
          <h2 className="text-xl font-serif text-gold mb-2">Votre Terrain</h2>
          <p className="text-xs text-gray-500 mb-6">Ajuste l'intelligence artificielle à votre marché.</p>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {ZONES.map((z) => (
              <button key={z.id} onClick={() => selectZone(z)} className="w-full bg-[#111] border border-white/5 hover:border-gold/50 p-4 rounded-lg text-left group transition-all active:scale-[0.98]">
                 <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold text-gray-200 group-hover:text-gold">{z.name}</p>
                    <Globe className="w-4 h-4 text-gray-600 group-hover:text-gold" />
                 </div>
                 <p className="text-[10px] text-gray-500">{z.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Trésorerie Actuelle ({currency})</label><input type="number" value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="0" autoFocus /><button onClick={() => setStep(6)} disabled={!initialBalance} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">SUIVANT</button></div>)}
      {step === 6 && (<div className="animate-in slide-in-from-right duration-500 w-full max-w-xs"><label className="block text-xs text-gray-500 uppercase mb-2 text-left">Nom du Projet Principal</label><input type="text" value={mainProject} onChange={(e) => setMainProject(e.target.value)} className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800" placeholder="Ex: Agence IA" autoFocus /><button onClick={finishOnboarding} disabled={!mainProject} className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50">LANCER L'EMPIRE</button></div>)}
    </div>
  );
}

// ==========================================
// 2. DASHBOARD
// ==========================================
function Dashboard({ onNavigate }) {
  const [balance, setBalance] = useState(JSON.parse(localStorage.getItem('imperium_balance') || "0"));
  const [transactions, setTransactions] = useState(JSON.parse(localStorage.getItem('imperium_transactions') || "[]"));
  const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha";
  const currency = localStorage.getItem('imperium_currency') || "€";
  
  const tasks = JSON.parse(localStorage.getItem('imperium_tasks') || "[]");
  const progressPercent = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense');
  const [expenseCategory, setExpenseCategory] = useState('need'); 
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const getSergeantMessage = () => {
    if (transactionType === 'income') return "Encaisser le butin";
    if (expenseCategory === 'want') return "CONFIRMER LA PERTE (Futilité)";
    return "Confirmer Dépense Vitale";
  };

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
    const newTransaction = { id: Date.now(), desc: finalDesc || (transactionType === 'expense' ? "Dépense" : "Revenu"), amount: value, type: transactionType, category: expenseCategory, date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) };
    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
    setAmount(''); setDescription(''); setIsModalOpen(false);
  };

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans pb-32 flex flex-col relative shadow-2xl animate-in fade-in duration-500">
      <header className="px-5 py-4 border-b border-white/5 bg-dark/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center w-full pt-[env(safe-area-inset-top)]">
         <div className="w-8"></div>
         <h1 className="text-xl font-serif text-gold tracking-widest font-bold text-center flex-1">IMPERIUM</h1>
         <button onClick={() => onNavigate('settings')} className="w-8 flex justify-end text-gray-500 hover:text-white"><Settings className="w-5 h-5"/></button>
      </header>

      <div className="w-full px-4 mt-6">
        <div className={`border-l-2 p-4 rounded-r-lg flex items-center gap-4 shadow-lg w-full transition-colors ${balance < 0 ? 'bg-red-900/20 border-red-500' : 'bg-[#151515] border-gold'}`}>
          <div className="p-2 bg-gold/10 rounded-full shrink-0"><TrendingDown className="w-5 h-5 text-gold" /></div>
          <div><p className="text-[10px] text-gray-400 uppercase tracking-wider">Allocation Survie</p><p className="text-white font-bold text-lg">{formatMoney(balance / 30)} {currency} <span className="text-gray-600 font-normal text-xs">/ jour</span></p></div>
        </div>
      </div>

      <main className="w-full px-4 grid gap-3 mt-4">
        <div className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2 opacity-60 absolute top-4 left-4"><Shield className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Trésorerie</h2></div>
            <div className="text-center py-4 mt-2"><span className={`text-4xl font-bold font-serif ${balance < 0 ? 'text-red-500' : 'text-white'}`}>{formatMoney(balance)} <span className="text-lg text-gray-500">{currency}</span></span></div>
        </div>
        <div onClick={() => onNavigate('skills')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30">
            <div className="absolute top-4 right-4 text-gray-600 group-hover:text-gold transition-colors"><ChevronRight className="w-5 h-5" /></div>
            <div className="flex items-center gap-2 mb-3 opacity-60"><Sword className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Arsenal</h2></div>
            <p className="text-xs text-gray-400 italic">Générer du cash avec mes compétences...</p>
        </div>
        <div onClick={() => onNavigate('project')} className="bg-[#111] border border-white/5 rounded-xl p-5 relative overflow-hidden active:scale-[0.98] transition-transform cursor-pointer group hover:border-gold/30">
            <div className="absolute top-4 right-4 text-gray-600 group-hover:text-gold transition-colors"><ChevronRight className="w-5 h-5" /></div>
            <div className="flex items-center gap-2 mb-3 opacity-60"><Castle className="w-3 h-3 text-gold" /><h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">Conquête</h2></div>
            <div className="flex justify-between items-center mb-2"><span className="font-bold text-white text-sm tracking-wide">{projectName}</span><span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded">{progressPercent}%</span></div>
            <div className="w-full bg-gray-800 rounded-full h-1.5"><div className="bg-gold h-1.5 rounded-full shadow-[0_0_10px_#D4AF37]" style={{ width: `${progressPercent}%` }}></div></div>
        </div>
      </main>

      <section className="w-full px-4 mt-6 flex-1">
        <div className="flex items-center gap-2 mb-4 px-1"><History className="w-3 h-3 text-gray-600" /><h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Derniers Mouvements</h3></div>
        <div className="space-y-2 pb-24">
            {transactions.map((t) => (
            <div key={t.id} className="bg-[#111] border-b border-white/5 p-3 flex justify-between items-center hover:bg-[#161616] transition-colors rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full shrink-0 ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{t.type === 'income' ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}</div>
                    <div className="overflow-hidden"><p className="text-sm text-gray-300 font-medium truncate">{t.desc}</p><p className="text-[10px] text-gray-600">{t.date}</p></div>
                </div>
                <span className={`font-mono font-bold text-sm shrink-0 ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{t.type === 'income' ? '+' : '-'} {formatMoney(t.amount)} {currency}</span>
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
            {transactionType === 'expense' && (
                <div className="flex gap-2 mb-4">
                    <button onClick={() => setExpenseCategory('need')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'need' ? 'border-white text-white bg-white/10' : 'border-white/5 text-gray-600 bg-black'}`}>NÉCESSITÉ</button>
                    <button onClick={() => setExpenseCategory('want')} className={`flex-1 p-3 rounded-lg border text-xs font-bold transition-all ${expenseCategory === 'want' ? 'border-red-500 text-red-500 bg-red-900/20' : 'border-white/5 text-gray-600 bg-black'}`}>FUTILITÉ ⚠️</button>
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-transparent border-b border-gray-700 py-2 text-white text-4xl font-serif focus:border-gold focus:outline-none placeholder-gray-800 text-center" placeholder="0" autoFocus />
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none" placeholder={transactionType === 'expense' ? "Ex: Burger..." : "Ex: Vente..."} />
              <button type="submit" className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors uppercase tracking-widest text-xs ${transactionType === 'expense' && expenseCategory === 'want' ? 'bg-red-600 text-white animate-pulse' : (transactionType === 'expense' ? 'bg-white/10 text-white' : 'bg-green-600 text-white')}`}>{getSergeantMessage()}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. ÉCRAN ARSENAL (AVEC ZONES ÉCONOMIQUES)
// ==========================================
function SkillsScreen({ onBack }) {
    const currency = localStorage.getItem('imperium_currency') || "€";
    // Récupération de la zone (ou défaut)
    const savedZone = localStorage.getItem('imperium_zone');
    const userZone = savedZone ? JSON.parse(savedZone) : ZONES[1]; // Par défaut Europe

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

        // 1. Conversion de devise (Taux approximatifs)
        if (currency.includes('FCFA')) finalPrice = gig.price * 655;
        else if (currency.includes('GNF')) finalPrice = gig.price * 9000;
        else if (currency.includes('CDF')) finalPrice = gig.price * 2500;
        else if (currency.includes('$') && currency !== 'CAD') finalPrice = gig.price * 1.1; // USD

        // 2. Application du Facteur de Zone (Pouvoir d'Achat)
        finalPrice = finalPrice * userZone.factor;

        // 3. Arrondi "Joli" (Pour éviter 19345 -> 19500 ou 19000)
        if (finalPrice > 1000) {
            // Arrondir aux 500 les plus proches pour le FCFA
            finalPrice = Math.round(finalPrice / 500) * 500;
        }

        return { ...gig, displayPrice: formatMoney(finalPrice) };
    };

    return (
        <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300">
            <div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10">
                <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button>
                <h1 className="text-2xl font-serif text-white font-bold">Arsenal</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Globe className="w-3 h-3 text-gold" />
                    <span className="text-[10px] text-gray-400 uppercase">Marché : {userZone.name}</span>
                </div>
            </div>
            <div className="flex-1 p-5 overflow-y-auto pb-40">
                <div className="space-y-4">
                    {skills.map(skill => {
                        const gig = findGig(skill.name);
                        return (
                        <div key={skill.id} className="bg-[#111] border border-white/5 p-4 rounded-lg group hover:border-gold/30 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3"><div className="p-2 bg-gray-900 rounded-lg text-gold"><Zap className="w-4 h-4 fill-current" /></div><div><p className="text-sm font-bold text-gray-200">{skill.name}</p><p className="text-[10px] text-gray-500 uppercase">Potentiel Détecté</p></div></div>
                                <button onClick={() => deleteSkill(skill.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <button onClick={() => setSelectedGig(gig)} className="w-full bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded px-3 py-2 flex items-center justify-between text-xs text-gold transition-colors">
                                <span className="flex items-center gap-2"><Briefcase className="w-3 h-3"/> Monétiser cette compétence</span>
                                <span className="font-bold">~{gig.displayPrice} {currency}</span>
                            </button>
                        </div>
                    )})}
                </div>
            </div>
            {selectedGig && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-6 animate-in fade-in">
                    <div className="bg-[#1a1a1a] border border-gold w-full max-w-sm rounded-2xl p-6 shadow-2xl relative">
                        <button onClick={() => setSelectedGig(null)} className="absolute top-4 right-4 text-gray-500"><X className="w-5 h-5"/></button>
                        <h3 className="text-gold font-serif text-xl mb-1">{selectedGig.title}</h3>
                        <p className="text-white font-bold text-2xl mb-4">{selectedGig.displayPrice} {currency}</p>
                        <div className="bg-black/50 p-4 rounded-lg border border-white/10 mb-4"><p className="text-xs text-gray-400 uppercase mb-2">Ordre de Mission :</p><p className="text-sm text-gray-200 leading-relaxed">{selectedGig.task}</p></div>
                        <button onClick={() => setSelectedGig(null)} className="w-full bg-gold text-black font-bold py-3 rounded text-xs uppercase tracking-widest">J'accepte le défi</button>
                    </div>
                </div>
            )}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto">
                <form onSubmit={addSkill} className="flex gap-2"><input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Compétence (Infographie, Anglais...)" className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newSkill.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form>
            </div>
        </div>
    );
}

// ==========================================
// 3. ECRAN PROJET & 5. SETTINGS
// ==========================================
function ProjectScreen({ onBack }) { const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha"; const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('imperium_tasks') || "[]")); const [newTask, setNewTask] = useState(""); useEffect(() => { localStorage.setItem('imperium_tasks', JSON.stringify(tasks)); }, [tasks]); const addTask = (e) => { e.preventDefault(); if (!newTask.trim()) return; setTasks([...tasks, { id: Date.now(), text: newTask, done: false }]); setNewTask(""); }; const toggleTask = (id) => { setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t)); }; const deleteTask = (id) => { setTasks(tasks.filter(t => t.id !== id)); }; const progress = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.done).length / tasks.length) * 100); return (<div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button><h1 className="text-2xl font-serif text-white font-bold">{projectName}</h1><div className="flex items-center gap-4 mt-4"><div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }}></div></div><span className="text-gold font-bold text-sm">{progress}%</span></div></div><div className="flex-1 p-5 overflow-y-auto pb-32"><div className="space-y-3">{tasks.map(task => (<div key={task.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${task.done ? 'bg-dark border-transparent opacity-50' : 'bg-[#111] border-white/5'}`}><button onClick={() => toggleTask(task.id)} className="mt-0.5 text-gold hover:scale-110 transition-transform">{task.done ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}</button><p className={`flex-1 text-sm ${task.done ? 'line-through text-gray-600' : 'text-gray-200'}`}>{task.text}</p><button onClick={() => deleteTask(task.id)} className="text-gray-700 hover:text-red-500"><X className="w-4 h-4" /></button></div>))}</div></div><div className="fixed bottom-0 left-0 right-0 p-4 bg-dark border-t border-white/10 pb-[calc(1rem+env(safe-area-inset-bottom))] max-w-md mx-auto"><form onSubmit={addTask} className="flex gap-2"><input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Nouvelle mission..." className="flex-1 bg-[#111] border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-gold focus:outline-none" /><button type="submit" disabled={!newTask.trim()} className="bg-gold text-black font-bold p-3 rounded-lg disabled:opacity-50 hover:bg-yellow-400 transition-colors"><Plus className="w-5 h-5" /></button></form></div></div>); }
function SettingsScreen({ onBack }) { const [importData, setImportData] = useState(""); const handleExport = () => { const data = { balance: localStorage.getItem('imperium_balance'), transactions: localStorage.getItem('imperium_transactions'), project: localStorage.getItem('imperium_project_name'), tasks: localStorage.getItem('imperium_tasks'), skills: localStorage.getItem('imperium_skills'), currency: localStorage.getItem('imperium_currency'), zone: localStorage.getItem('imperium_zone'), onboarded: localStorage.getItem('imperium_onboarded'), }; const encoded = btoa(JSON.stringify(data)); navigator.clipboard.writeText(encoded); alert("⚔️ ARCHIVES SÉCURISÉES ⚔️\n\nCode copié."); }; const handleImport = () => { try { if(!importData) return; const decoded = JSON.parse(atob(importData)); if(decoded.balance) localStorage.setItem('imperium_balance', decoded.balance); if(decoded.transactions) localStorage.setItem('imperium_transactions', decoded.transactions); if(decoded.project) localStorage.setItem('imperium_project_name', decoded.project); if(decoded.tasks) localStorage.setItem('imperium_tasks', decoded.tasks); if(decoded.skills) localStorage.setItem('imperium_skills', decoded.skills); if(decoded.currency) localStorage.setItem('imperium_currency', decoded.currency); if(decoded.zone) localStorage.setItem('imperium_zone', decoded.zone); if(decoded.onboarded) localStorage.setItem('imperium_onboarded', decoded.onboarded); alert("✅ RESTAURATION RÉUSSIE."); window.location.reload(); } catch (e) { alert("❌ ERREUR : Code invalide."); } }; const resetEmpire = () => { if(confirm("DANGER : Voulez-vous vraiment TOUT effacer ?")) { localStorage.clear(); window.location.reload(); } }; return (<div className="min-h-[100dvh] w-full max-w-md mx-auto bg-dark text-gray-200 font-sans flex flex-col animate-in slide-in-from-right duration-300"><div className="px-5 py-4 bg-[#151515] border-b border-white/5 pt-[env(safe-area-inset-top)] sticky top-0 z-10"><button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-white mb-4 mt-2"><ArrowLeft className="w-4 h-4" /> <span className="text-xs uppercase tracking-widest">Retour au QG</span></button><h1 className="text-2xl font-serif text-white font-bold">Archives</h1></div><div className="p-5 space-y-8"><div className="bg-[#111] border border-white/5 rounded-xl p-5"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-blue-900/20 text-blue-400 rounded-lg"><Download className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Sauvegarder l'Empire</h3><p className="text-[10px] text-gray-500">Générez un code unique.</p></div></div><button onClick={handleExport} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"><Copy className="w-4 h-4" /> Copier le Code</button></div><div className="bg-[#111] border border-white/5 rounded-xl p-5"><div className="flex items-center gap-3 mb-3"><div className="p-2 bg-green-900/20 text-green-400 rounded-lg"><Upload className="w-5 h-5"/></div><div><h3 className="text-sm font-bold text-gray-200">Restaurer les données</h3><p className="text-[10px] text-gray-500">Collez le code ici.</p></div></div><textarea value={importData} onChange={(e) => setImportData(e.target.value)} placeholder="Collez votre code ici..." className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-gray-300 focus:border-gold focus:outline-none h-20 mb-3 font-mono"/><button onClick={handleImport} disabled={!importData} className="w-full bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 font-bold py-3 rounded-lg text-xs uppercase tracking-widest disabled:opacity-50 transition-colors">Restaurer</button></div><div className="pt-10 border-t border-white/5"><button onClick={resetEmpire} className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-400 text-xs uppercase tracking-widest py-4 hover:bg-red-900/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /> Détruire l'Empire (Reset)</button></div></div></div>); }