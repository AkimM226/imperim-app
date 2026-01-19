import React, { useState, useEffect } from 'react';
import { Shield, Sword, Castle, Plus, X, TrendingDown, History, Trash2 } from 'lucide-react';

export default function App() {
  // --- 1. CHARGEMENT DES DONNÉES (MÉMOIRE) ---
  // On regarde si des données existent déjà dans le navigateur
  const savedBalance = localStorage.getItem('imperium_balance');
  const savedTransactions = localStorage.getItem('imperium_transactions');

  const [balance, setBalance] = useState(savedBalance ? JSON.parse(savedBalance) : 150);
  const [transactions, setTransactions] = useState(savedTransactions ? JSON.parse(savedTransactions) : []);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // --- 2. SAUVEGARDE AUTOMATIQUE ---
  // À chaque fois que 'balance' ou 'transactions' change, on sauvegarde
  useEffect(() => {
    localStorage.setItem('imperium_balance', JSON.stringify(balance));
    localStorage.setItem('imperium_transactions', JSON.stringify(transactions));
  }, [balance, transactions]);

  // Fonction pour ajouter une dépense
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;

    const value = parseFloat(amount);
    const newBalance = balance - value;
    
    // Création de la transaction
    const newTransaction = {
      id: Date.now(),
      desc: description || "Dépense non justifiée",
      amount: value,
      date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    };

    setBalance(newBalance);
    setTransactions([newTransaction, ...transactions]); // On ajoute au début de la liste
    
    setAmount('');
    setDescription('');
    setIsModalOpen(false);
  };

  // Fonction pour supprimer une erreur (Reset)
  const resetEmpire = () => {
    if(confirm("Êtes-vous sûr de vouloir réinitialiser l'Empire à zéro ?")) {
      setBalance(150);
      setTransactions([]);
    }
  }

  return (
    <div className="min-h-screen bg-dark text-gray-200 font-sans selection:bg-gold selection:text-black pb-32">
      
      {/* EN-TÊTE */}
      <header className="p-6 text-center border-b border-white/10 bg-dark/95 backdrop-blur sticky top-0 z-10 flex justify-between items-center">
         <div className="w-6"></div> {/* Espacement pour centrer le titre */}
         <div>
            <h1 className="text-2xl font-serif text-gold tracking-widest font-bold">IMPERIUM</h1>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-500">Discipline • Conquête</p>
         </div>
         <button onClick={resetEmpire} className="text-gray-700 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
      </header>

      {/* RAPPORT */}
      <div className="max-w-md mx-auto mt-6 px-4">
        <div className="bg-gray-900/50 border-l-4 border-gold p-4 rounded-r-lg flex items-center gap-4">
          <div className="p-2 bg-gold/10 rounded-full">
            <TrendingDown className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase">Budget Journalier</p>
            <p className="text-white font-bold">{(balance / 20).toFixed(2)} € <span className="text-gray-500 font-normal text-xs">/ jour</span></p>
          </div>
        </div>
      </div>

      {/* DASHBOARD */}
      <main className="p-4 grid gap-4 md:grid-cols-3 max-w-5xl mx-auto mt-2">
        <Card title="Trésorerie" icon={<Shield className="w-4 h-4 text-gold" />}>
          <div className="text-center py-2">
            <span className={`text-4xl font-bold ${balance < 50 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              {balance.toFixed(2)} €
            </span>
            <p className="text-[10px] text-gray-500 uppercase mt-1">Capital de Guerre</p>
          </div>
        </Card>

        <Card title="Conquête" icon={<Castle className="w-4 h-4 text-gold" />}>
          <div className="mt-1">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-white text-xs">Agence Marketing</span>
              <span className="text-[10px] text-gold">15%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-1.5">
              <div className="bg-gold h-1.5 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </Card>
      </main>

      {/* LISTE HISTORIQUE DES DÉPENSES */}
      <section className="max-w-md mx-auto px-4 mt-4">
        <div className="flex items-center gap-2 mb-4 px-2">
          <History className="w-4 h-4 text-gray-500" />
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Journal des opérations</h3>
        </div>
        
        <div className="space-y-3">
          {transactions.length === 0 && (
            <p className="text-center text-xs text-gray-700 italic py-4">Aucune activité détectée.</p>
          )}
          
          {transactions.map((t) => (
            <div key={t.id} className="bg-[#121212] border border-white/5 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-200 font-medium">{t.desc}</p>
                <p className="text-[10px] text-gray-500">{t.date}</p>
              </div>
              <span className="text-red-400 font-bold text-sm">- {t.amount} €</span>
            </div>
          ))}
        </div>
      </section>

      {/* BOUTON FLOTTANT */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="pointer-events-auto group relative bg-gold text-black font-serif font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-yellow-300"
        >
          <Plus className="w-5 h-5" />
          SAISIR
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-300">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="font-serif text-gold text-xl mb-1">Dépense</h2>
            <p className="text-gray-500 text-xs mb-6">Le Sergent observe.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Montant (€)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-lg focus:border-gold focus:outline-none" placeholder="0.00" autoFocus />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">Motif</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black border border-white/20 rounded-lg p-3 text-white text-sm focus:border-gold focus:outline-none" placeholder="Ex: McDo..." />
              </div>
              <button type="submit" className="w-full bg-red-900/80 hover:bg-red-700 text-red-100 font-bold py-3 rounded-lg mt-2 transition-colors">CONFIRMER</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-card border border-white/10 rounded-xl p-4 shadow-lg relative overflow-hidden">
      <div className="flex items-center gap-2 mb-3 opacity-80">
        {icon}
        <h2 className="font-serif text-gray-400 tracking-wide text-[10px] font-bold uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}