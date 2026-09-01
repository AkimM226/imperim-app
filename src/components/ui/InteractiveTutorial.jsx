import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Shield, ArrowRight, CheckCircle, X, Sparkles,
  ArrowLeft, Info, Plus, Target, Wallet, BookOpen, BarChart3
} from 'lucide-react';

// ==========================================
// CONTEXTE TUTORIEL GUIDÉ
// ==========================================
const TutorialContext = createContext(null);

export const useTutorial = () => useContext(TutorialContext);

// ==========================================
// TUTORIEL GUIDÉ - OVERLAYS SUR VRAIS ÉCRANS
// ==========================================
function InteractiveTutorial({ onComplete, currency = "€" }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Étapes du tutoriel guidé - guide l'utilisateur sur les vrais écrans
  const TUTORIAL_STEPS = [
    {
      id: 'intro',
      title: "BIENVENUE, COMMANDANT",
      subtitle: "Formation Guidée",
      type: 'intro',
      icon: Shield,
      content: "Bienvenue dans Imperium ! Ce tutoriel va vous guider à travers les fonctionnalités principales de l'application. Vous utiliserez vos propres données réelles pour découvrir chaque fonctionnalité.",
      objectives: [
        "Découvrir le Dashboard et enregistrer des transactions",
        "Apprendre à gérer vos objectifs d'épargne",
        "Comprendre le suivi des dettes",
        "Explorer les projets et ROI",
        "Analyser vos statistiques"
      ]
    },
    {
      id: 'dashboard',
      title: "DASHBOARD - POSTE DE COMMANDEMENT",
      subtitle: "Étape 1/5 : Le QG",
      type: 'guided',
      icon: Shield,
      content: "Le Dashboard est votre centre de commandement. Vous y voyez votre solde, vos dépenses du jour, et pouvez enregistrer des transactions. Enregistrez une transaction réelle pour voir l'impact sur votre solde.",
      instruction: "Cliquez sur le bouton '+' en haut à droite pour ajouter une transaction. Essayez d'enregistrer une dépense réelle.",
      targetElement: 'transaction-button',
      validation: () => {
        const transactions = JSON.parse(localStorage.getItem('imperium_transactions') || "[]");
        return transactions.length > 0;
      }
    },
    {
      id: 'goals',
      title: "OBJECTIFS - CIBLES DE CONQUÊTE",
      subtitle: "Étape 2/5 : Gestion d'Objectifs",
      type: 'guided',
      icon: Target,
      content: "Les Cibles sont vos objectifs d'épargne. L'argent alloué est verrouillé et ne peut être dépensé. Créez un objectif réel pour voir comment cela affecte votre trésorerie disponible.",
      instruction: "Cliquez sur l'icône 'Objectifs' dans la barre de navigation en bas, puis créez votre première cible d'épargne.",
      targetElement: 'goals-nav',
      validation: () => {
        const goals = JSON.parse(localStorage.getItem('imperium_goals') || "[]");
        return goals.length > 0;
      }
    },
    {
      id: 'debts',
      title: "DETTE - LE GRAND LIVRE",
      subtitle: "Étape 3/5 : Gestion de Dettes",
      type: 'guided',
      icon: Wallet,
      content: "Le Grand Livre suit toutes vos dettes (ce que vous devez et ce qu'on vous doit). C'est essentiel pour maintenir une comptabilité précise.",
      instruction: "Cliquez sur l'icône 'Dettes' dans la barre de navigation pour découvrir cette fonctionnalité. Vous pouvez enregistrer une dette si nécessaire.",
      targetElement: 'debts-nav',
      validation: () => true // Optionnel
    },
    {
      id: 'projects',
      title: "PROJETS - CONQUÊTES STRATÉGIQUES",
      subtitle: "Étape 4/5 : Gestion de Projets",
      type: 'guided',
      icon: BookOpen,
      content: "Les Projets sont vos conquêtes avec un ROI (Retour sur Investissement). Transformez vos compétences en revenus ou gains uniques.",
      instruction: "Cliquez sur l'icône 'Projets' dans la barre de navigation pour découvrir cette fonctionnalité et créer un projet si vous le souhaitez.",
      targetElement: 'projects-nav',
      validation: () => true // Optionnel
    },
    {
      id: 'stats',
      title: "STATISTIQUES - SALLE DES CARTES",
      subtitle: "Étape 5/5 : Analyse",
      type: 'guided',
      icon: BarChart3,
      content: "La Salle des Cartes vous montre vos statistiques et tendances financières. Analysez vos dépenses pour optimiser votre gestion.",
      instruction: "Cliquez sur l'icône 'Cartes' dans la barre de navigation pour voir vos statistiques et tendances.",
      targetElement: 'stats-nav',
      validation: () => true
    },
    {
      id: 'synthesis',
      title: "MISSION ACCOMPLIE",
      subtitle: "Formation Terminée",
      type: 'intro',
      icon: CheckCircle,
      content: "Félicitations, Commandant ! Vous avez découvert les principales fonctionnalités d'Imperium avec vos propres données. Vous pouvez maintenant utiliser l'application en toute autonomie.",
      objectives: [
        "Dashboard et transactions maîtrisés",
        "Gestion d'objectifs comprise",
        "Suivi des dettes découvert",
        "Projets et ROI explorés",
        "Statistiques analysées"
      ]
    }
  ];

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];
  const StepIcon = currentTutorialStep.icon;

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
      // Marquer le tutoriel comme terminé
      localStorage.setItem('imperium_tutorial_completed', 'true');
      setTimeout(() => onComplete(), 500);
    }
  };

  const skipTutorial = () => {
    localStorage.setItem('imperium_tutorial_completed', 'true');
    onComplete();
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  // Vérifier si l'étape est validée
  const isStepValidated = () => {
    if (currentTutorialStep.validation) {
      return currentTutorialStep.validation();
    }
    return false;
  };

  if (isCompleted) {
    return null; // Le tutoriel est terminé
  }

  return (
    <TutorialContext.Provider value={{ 
      isTutorial: true, 
      currentStep,
      currentTutorialStep,
      nextStep,
      skipTutorial
    }}>
      {/* Overlay de guidage */}
      {showOverlay && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] rounded-xl border border-gold/30 p-6 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
                <StepIcon className="w-6 h-6 text-gold" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gold font-bold uppercase tracking-widest">{currentTutorialStep.subtitle}</span>
                  <button 
                    onClick={toggleOverlay}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-xl font-serif text-white font-bold mb-3">{currentTutorialStep.title}</h2>
              </div>
            </div>

            {currentTutorialStep.type === 'intro' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">{currentTutorialStep.content}</p>
                {currentTutorialStep.objectives && (
                  <div className="space-y-2">
                    {currentTutorialStep.objectives.map((obj, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400">
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                        <span>{obj}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">{currentTutorialStep.content}</p>
                <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                  <p className="text-xs text-gold font-bold uppercase tracking-widest mb-1">Instruction</p>
                  <p className="text-sm text-white">{currentTutorialStep.instruction}</p>
                </div>
                {isStepValidated() && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Étape validée !</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button 
                onClick={skipTutorial}
                className="flex-1 bg-transparent border border-gray-700 text-gray-400 font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors"
              >
                Passer
              </button>
              <button 
                onClick={nextStep}
                className="flex-1 bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? "Terminer" : "Continuer"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Progression */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-gray-500 uppercase">Progression</span>
                <span className="text-[10px] text-gold font-bold">{currentStep + 1}/{TUTORIAL_STEPS.length}</span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold transition-all duration-500"
                  style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton flottant pour réafficher l'overlay */}
      {!showOverlay && (
        <button 
          onClick={toggleOverlay}
          className="fixed bottom-4 right-4 bg-gold text-black p-3 rounded-full shadow-lg z-40 hover:bg-yellow-400 transition-colors"
          title="Afficher le tutoriel"
        >
          <Info className="w-5 h-5" />
        </button>
      )}
    </TutorialContext.Provider>
  );
}

export default InteractiveTutorial;
