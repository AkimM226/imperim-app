import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2, ArrowUpCircle, ArrowDownCircle, Fingerprint } from 'lucide-react';

export default function App() {
  // --- ÉTATS GLOBAUX ---
  const [hasOnboarded, setHasOnboarded] = useState(localStorage.getItem('imperium_onboarded') === 'true');
  
  // --- SI PAS D'ONBOARDING, ON LANCE LA SÉQUENCE ---
  if (!hasOnboarded) {
    return <OnboardingScreen onComplete={() => setHasOnboarded(true)} />;
  }

  return <Dashboard />;
}

// ==========================================
// COMPOSANT 1 : L'ONBOARDING (Séquence d'intro)
// ==========================================
function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(1); // 1: Intro, 2: Pacte, 3: Setup Finance, 4: Setup Projet
  const [initialBalance, setInitialBalance] = useState('');
  const [mainProject, setMainProject] = useState('');
  const [isHolding, setIsHolding] = useState(false);
  
  // Gestion du Pacte (Appui long)
  const holdTimer = useRef(null);
  const [progress, setProgress] = useState(0);

  const startHold = () => {
    setIsHolding(true);
    let p = 0;
    holdTimer.current = setInterval(() => {
      p += 2; // Vitesse de chargement
      setProgress(p);
      if (navigator.vibrate) navigator.vibrate(10); // Petit feedback haptique
      if (p >= 100) {
        clearInterval(holdTimer.current);
        setStep(3); // On passe à l'étape suivante
      }
    }, 30);
  };

  const stopHold = () => {
    setIsHolding(false);
    clearInterval(holdTimer.current);
    setProgress(0);
  };

  const finishOnboarding = () => {
    // On sauvegarde tout
    localStorage.setItem('imperium_balance', JSON.stringify(parseFloat(initialBalance) || 0));
    localStorage.setItem('imperium_project_name', mainProject || "Empire Naissant");
    localStorage.setItem('imperium_onboarded', 'true');
    // On recharge la page pour lancer le Dashboard proprement
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black text-gold flex flex-col items-center justify-center p-6 text-center z-50 overflow-hidden">
      
      {/* ÉTAPE 1 : INTRO */}
      {step === 1 && (
        <div className="animate-in fade-in duration-1000 flex flex-col items-center">
          <h1 className="text-4xl font-serif font-bold tracking-widest mb-6">IMPERIUM</h1>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-10">
            "Le chaos règne à l'extérieur.<br/>Ici, seule la discipline construit des Empires."
          </p>
          <button 
            onClick={() => setStep(2)}
            className="border border-gold text-gold px-8 py-3 rounded-sm uppercase tracking-widest text-xs hover:bg-gold hover:text-black transition-colors"
          >
            Prendre le contrôle
          </button>
        </div>
      )}

      {/* ÉTAPE 2 : LE PACTE (Touch ID style) */}
      {step === 2 && (
        <div className="animate-in zoom-in duration-500 flex flex-col items-center w-full">
          <h2 className="text-xl font-serif mb-2">Le Pacte</h2>
          <p className="text-gray-500 text-xs mb-12 max-w-xs">
            Jurez-vous de ne rien cacher ?<br/>Chaque centime doit être déclaré.
          </p>
          
          <div 
            className="relative w-24 h-24 rounded-full border-2 border-white/10 flex items-center justify-center select-none cursor-pointer active:scale-95 transition-transform"
            onMouseDown={startHold}
            onMouseUp={stopHold}
            onTouchStart={startHold}
            onTouchEnd={stopHold}
          >
            {/* Cercle de progression */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="46" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gold" strokeDasharray="289" strokeDashoffset={289 - (289 * progress) / 100} style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
            </svg>
            <Fingerprint className={`w-10 h-10 ${isHolding ? 'text-gold animate-pulse' : 'text-gray-600'}`} />
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-widest text-gray-600">Maintenir pour sceller</p>
        </div>
      )}

      {/* ÉTAPE 3 : TRÉSORERIE */}
      {step === 3 && (
        <div className="animate-in slide-in-from-right duration-500 w-full max-w-xs">
          <label className="block text-xs text-gray-500 uppercase mb-2 text-left">Trésorerie Actuelle (€)</label>
          <input 
            type="number" 
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="w-full bg-transparent border-b border-gold text-3xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800"
            placeholder="0.00"
            autoFocus
          />
          <button 
            onClick={() => setStep(4)} 
            disabled={!initialBalance}
            className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50"
          >
            CONFIRMER
          </button>
        </div>
      )}

      {/* ÉTAPE 4 : PROJET */}
      {step === 4 && (
        <div className="animate-in slide-in-from-right duration-500 w-full max-w-xs">
          <label className="block text-xs text-gray-500 uppercase mb-2 text-left">Nom du Projet Principal</label>
          <input 
            type="text" 
            value={mainProject}
            onChange={(e) => setMainProject(e.target.value)}
            className="w-full bg-transparent border-b border-gold text-2xl text-white py-2 focus:outline-none mb-8 placeholder-gray-800"
            placeholder="Ex: Agence IA..."
            autoFocus
          />
          <button 
            onClick={finishOnboarding} 
            disabled={!mainProject}
            className="w-full bg-gold text-black font-bold py-3 rounded disabled:opacity-50"
          >
            LANCER L'EMPIRE
          </button>
        </div>
      )}
    </div>
  );
}

// ==========================================
// COMPOSANT 2 : LE DASHBOARD (L'application principale)
// ==========================================
function Dashboard() {
  // --- CHARGEMENT ---
  const savedBalance = localStorage.getItem('imperium_balance');
  const savedTransactions = localStorage.getItem('imperium_transactions');
  const projectName = localStorage.getItem('imperium_project_name') || "Projet Alpha";

  const [balance, setBalance] = useState(savedBalance ? JSON.parse(savedBalance) : 0);
  const [transactions, setTransactions] = useState(savedTransactions ? JSON.parse(savedTransactions) : []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState('expense'); // 'expense' ou 'income'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // --- SAUVEGARDE ---
  useEffect(() => {
    localStorage.setItem('imperium_balance', JSON.stringify(balance));
    localStorage.setItem('imperium_transactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    const value = parseFloat(amount);
    // Calcul selon le type (Dépense ou Revenu)
    const newBalance = transactionType === 'expense' ? balance - value : balance + value;
    
    const newTransaction = {
      id: Date.now(),
      desc: description || (transactionType === 'expense' ? "Dépense" : "Revenu"),
      amount: value,
      type: transactionType,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    };

    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]);
    
    setAmount('');
    setDescription('');
    setIsModalOpen(false);
  };

  const resetEmpire = () => {
    if(confirm("Attention : Cela effacera toutes les données et relancera l'Onboarding. Confirmer ?")) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-dark text-gray-200 font-sans pb-32 overflow-x-hidden">
      
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-white/5 bg-dark/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center pt-safe-top">
         <div className="w-6"></div>
         <div className="text-center">
            <h1 className="text-xl font-serif text-gold tracking-widest font-bold">IMPERIUM</h1>
         </div>
         <button onClick={resetEmpire} className="text-gray-800 hover:text-red-900"><Trash2 className="w-4 h-4"/></button>
      </header>

      {/* RAPPORT JOURNALIER */}
      <div className="max-w-md mx-auto mt-6 px-4">
        <div className="bg-[#151515] border-l-2 border-gold p-4 rounded-r-lg flex items-center gap-4 shadow-lg">
          <div className="p-2 bg-gold/10 rounded-full">
            <TrendingDown className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Allocation Survie</p>
            <p className="text-white font-bold text-lg">{(balance / 30).toFixed(2)} € <span className="text-gray-600 font-normal text-xs">/ jour</span></p>
          </div>
        </div>
      </div>

      {/* GRILLE DES PILIERS */}
      <main className="p-4 grid gap-3 max-w-md mx-auto mt-2">
        <Card title="Trésorerie" icon={<Shield className="w-3 h-3 text-gold" />}>
          <div className="text-center py-2">
            <span className={`text-4xl font-bold font-serif ${balance < 0 ? 'text-red-500' : 'text-white'}`}>
              {balance.toFixed(2)} <span className="text-sm align-top text-gray-500">€</span>
            </span>
          </div>
        </Card>

        <Card title="Conquête" icon={<Castle className="w-3 h-3 text-gold" />}>
          <div className="mt-1">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-white text-xs tracking-wide">{projectName}</span>
              <span className="text-[10px] text-gold bg-gold/10 px-2 py-0.5 rounded">Niveau 1</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1">
              <div className="bg-gold h-1 rounded-full shadow-[0_0_10px_#D4AF37]" style={{ width: '10%' }}></div>
            </div>
          </div>
        </Card>
      </main>

      {/* HISTORIQUE */}
      <section className="max-w-md mx-auto px-4 mt-6">
        <div className="flex items-center gap-2 mb-4 px-1">
          <History className="w-3 h-3 text-gray-600" />
          <h3 className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Derniers Mouvements</h3>
        </div>
        
        <div className="space-y-2 pb-safe-bottom">
          {transactions.length === 0 && (
            <p className="text-center text-xs text-gray-800 italic py-8">Le calme avant la tempête.</p>
          )}
          
          {transactions.map((t) => (
            <div key={t.id} className="bg-[#111] border-b border-white/5 p-3 flex justify-between items-center hover:bg-[#161616] transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                   {t.type === 'income' ? <ArrowUpCircle size={14}/> : <ArrowDownCircle size={14}/>}
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">{t.desc}</p>
                  <p className="text-[10px] text-gray-600">{t.date}</p>
                </div>
              </div>
              <span className={`font-mono font-bold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'} {t.amount}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* BOUTON D'ACTION */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none pb-safe-bottom">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto bg-gold text-black font-serif font-bold h-14 px-8 rounded-full shadow-[0_0_30px_rgba(212,175,55,0.2)] active:scale-95 transition-transform flex items-center gap-2 border border-yellow-200"
        >
          <Plus className="w-5 h-5" />
          <span className="tracking-widest text-xs">ACTION</span>
        </button>
      </div>

      {/* MODAL DE SAISIE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#161616] border-t border-white/10 w-full max-w-md rounded-t-2xl p-6 shadow-2xl animate-in slide-in-from-bottom-full duration-300 pb-10">
            
            <div className="flex justify-between items-center mb-6">
               <h2 className="font-serif text-gray-400 text-xs tracking-widest uppercase">Enregistrer une opération</h2>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            {/* Switch Dépense / Revenu */}
            <div className="flex bg-black p-1 rounded-lg mb-6 border border-white/5">
                <button 
                    onClick={() => setTransactionType('expense')}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${transactionType === 'expense' ? 'bg-red-900/50 text-red-200' : 'text-gray-600'}`}
                >
                    Dépense
                </button>
                <button 
                    onClick={() => setTransactionType('income')}
                    className={`flex-1 py-2 text-xs font-bold uppercase rounded transition-colors ${transactionType === 'income' ? 'bg-green-900/50 text-green-200' : 'text-gray-600'}`}
                >
                    Revenu
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent border-b border-gray-700 py-2 text-white text-4xl font-serif focus:border-gold focus:outline-none placeholder-gray-800 text-center"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              <div>
                <input 
                  type="text" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none"
                  placeholder={transactionType === 'expense' ? "Ex: Burger, Netflix..." : "Ex: Vente service, Cadeau..."}
                />
              </div>
              <button 
                type="submit" 
                className={`w-full font-bold py-4 rounded-lg mt-2 transition-colors uppercase tracking-widest text-xs ${transactionType === 'expense' ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-green-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}
              >
                {transactionType === 'expense' ? 'Confirmer la perte' : 'Encaisser le butin'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- PETIT COMPOSANT CARTE ---
function Card({ title, icon, children }) {
  return (
    <div className="bg-[#111] border border-white/5 rounded-xl p-4 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-2 opacity-60">
        {icon}
        <h2 className="font-serif text-gray-400 tracking-wide text-[9px] font-bold uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}