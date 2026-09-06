import React, { useState, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ArrowRight, CheckCircle, X, 
  Info, Target, Wallet, BookOpen, BarChart3, Trophy
} from 'lucide-react';

// ==========================================
// CONTEXTE TUTORIEL GUIDÉ
// ==========================================
const TutorialContext = createContext(null);

export const useTutorial = () => useContext(TutorialContext);

// ==========================================
// TUTORIEL EXPLICATIF - DÉCOUVERTE DE L'EMPIRE
// ==========================================
function InteractiveTutorial({ onComplete, currency = "€", userRole = 'standard' }) {
  const isGeneral = userRole === 'general';
  const [currentStep, setCurrentStep] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // ==========================================
  // TOUTES LES ÉTAPES EXPLICATIVES
  // ==========================================
  const ALL_STEPS = [
    {
      id: 'intro',
      title: "BIENVENUE, COMMANDANT",
      subtitle: "Découverte de l'Empire",
      icon: Shield,
      content: "IMPERIUM transforme la gestion de votre vie financière et de vos projets en une véritable conquête. Chaque décision compte, chaque discipline vous rapproche de la victoire. Découvrons ensemble les piliers de votre Empire."
    },
    {
      id: 'dashboard',
      title: "LE QG - VOTRE POSTE DE COMMANDEMENT",
      subtitle: "Vue d'ensemble",
      icon: Shield,
      content: "Le Dashboard est le cœur de votre Empire. En un coup d'œil : votre solde disponible, vos dépenses du jour, et la Ration de Guerre qu'il vous reste à dépenser sans mettre votre stabilité en danger."
    },
    {
      id: 'bloodtax',
      title: "LA TAXE DE SANG",
      subtitle: "Votre discipline en action",
      icon: Wallet,
      content: "Chaque dépense futile ('Want') prélève automatiquement une partie vers votre Bunker. C'est le mécanisme central d'IMPERIUM : transformer vos petits écarts en épargne malgré vous."
    },
    {
      id: 'goals',
      title: "LE BUNKER - VOS OBJECTIFS",
      subtitle: "Argent guerre vs argent sécurité",
      icon: Target,
      content: "Le Bunker sépare votre argent 'guerre' (disponible) de votre argent 'sécurité' (objectifs verrouillés). Définissez des cibles d'épargne réelles pour donner une direction à votre discipline."
    },
    {
      id: 'trophies',
      title: "TROPHÉES - SALLE D'HONNEUR",
      subtitle: "Votre progression",
      icon: Trophy,
      content: "Chaque jour de discipline maintenue vous rapproche d'un nouveau grade. La Salle d'Honneur retrace votre parcours et vos accomplissements dans l'Empire."
    },
    {
      id: 'academy',
      title: "ACADÉMIE - SALLE D'ÉTUDE",
      subtitle: "Formation continue",
      icon: BookOpen,
      content: "L'Académie regroupe des connaissances essentielles en gestion financière : règle des 50/30/20, intérêts composés, négociation, et bien plus."
    },
    {
      id: 'stats',
      title: "SALLE DES CARTES",
      subtitle: "Analyse et tendances",
      icon: BarChart3,
      content: "Visualisez l'évolution de votre trésorerie et de vos habitudes de dépense dans le temps, pour ajuster votre stratégie en connaissance de cause."
    },
    {
      id: 'general_preview',
      title: "AU-DELÀ DU CHAPITRE 1",
      subtitle: "Réservé aux Généraux",
      icon: Shield,
      content: "Les Généraux de l'Empire ont accès à des modules avancés : Jarvis (votre stratège IA personnel), l'Arsenal Tactique pour monétiser vos compétences, la gestion de Projets avec plans d'action générés par IA, et plus encore. Ces modules s'ouvriront à tous progressivement."
    },
    {
      id: 'synthesis',
      title: "VOTRE EMPIRE VOUS ATTEND",
      subtitle: "Formation terminée",
      icon: CheckCircle,
      content: "Vous connaissez maintenant les piliers d'IMPERIUM. À vous de jouer, Commandant : chaque transaction, chaque objectif, chaque jour de discipline construit votre Empire."
    }
  ];

  // Adaptation de l'étape Généraux selon le rôle
  const TUTORIAL_STEPS = ALL_STEPS.map(step => {
    if (step.id === 'general_preview' && isGeneral) {
      return {
        ...step,
        title: "VOS MODULES DE GÉNÉRAL",
        subtitle: "Accès Général",
        content: "En tant que Général, vous avez déjà accès à Jarvis, l'Arsenal Tactique, la gestion de Projets, et plus encore. Explorez-les depuis le QG."
      };
    }
    return step;
  });

  const currentTutorialStep = TUTORIAL_STEPS[currentStep];
  const StepIcon = currentTutorialStep.icon;

  // ==========================================
  // NAVIGATION
  // ==========================================
  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
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

  if (isCompleted) {
    return null;
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
      <AnimatePresence mode="wait">
        {showOverlay && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              key={currentTutorialStep.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-[#111] rounded-xl border border-gold/30 p-6 max-w-md w-full shadow-2xl"
            >
              {/* En-tête */}
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
                      title="Fermer temporairement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h2 className="text-xl font-serif text-white font-bold mb-3">{currentTutorialStep.title}</h2>
                </div>
              </div>

              {/* Contenu explicatif */}
              <div className="space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">{currentTutorialStep.content}</p>
              </div>

              {/* Zone des boutons */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={skipTutorial}
                  className="text-gray-500 text-[10px] uppercase tracking-widest underline px-2"
                >
                  Quitter
                </button>
                {currentStep > 0 && (
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1 bg-transparent border border-gray-700 text-gray-400 font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-gray-800 transition-colors"
                  >
                    Précédent
                  </button>
                )}
                <button 
                  onClick={nextStep}
                  className="flex-1 bg-gold text-black font-bold py-3 rounded-lg uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                  {currentStep === TUTORIAL_STEPS.length - 1 ? "Terminer" : "Continuer"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Barre de progression */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-gray-500 uppercase">Progression</span>
                  <span className="text-[10px] text-gold font-bold">{currentStep + 1}/{TUTORIAL_STEPS.length}</span>
                </div>
                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gold"
                    initial={false}
                    animate={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton flottant pour réafficher l'overlay */}
      <AnimatePresence>
        {!showOverlay && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleOverlay}
            className="fixed bottom-4 right-4 bg-gold text-black p-3 rounded-full shadow-lg z-40 hover:bg-yellow-400 transition-colors"
            title="Afficher le tutoriel"
          >
            <Info className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </TutorialContext.Provider>
  );
}

export default InteractiveTutorial;
