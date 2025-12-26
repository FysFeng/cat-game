import React, { useState } from 'react';
import { GamePhase, GameState, Biome, Dish } from './types';
import { BASE_MENU, INITIAL_STAMINA } from './constants';
import { MainMenu } from './components/MainMenu';
import { RouteSelector } from './components/RouteSelector';
import { PrepPhase } from './components/PrepPhase';
import { ServicePhase } from './components/ServicePhase';
import { EventModal } from './components/EventModal';
import { ResultScreen } from './components/ResultScreen';

const INITIAL_STATE: GameState = {
  phase: GamePhase.MENU,
  day: 1,
  gold: 100,
  stamina: INITIAL_STAMINA,
  maxStamina: 100,
  reputation: 50,
  currentBiome: null,
  dailyGoal: 100,
  dailyEarnings: 0,
  kitchenLevel: 1,
  marketingLevel: 1,
  decorLevel: 1,
  menu: [...BASE_MENU],
  activeBuffs: []
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [lastEventResult, setLastEventResult] = useState<string | null>(null);

  const startGame = () => {
    setGameState({
      ...INITIAL_STATE,
      phase: GamePhase.ROUTE_SELECT
    });
  };

  const handleBiomeSelect = (biome: Biome) => {
    setGameState(prev => ({
      ...prev,
      currentBiome: biome,
      phase: GamePhase.PREP,
      // Reset daily menu to base first, prep phase will add special
      menu: [...BASE_MENU] 
    }));
  };

  const handlePrepFinish = (specialDish: Dish) => {
    setGameState(prev => ({
      ...prev,
      menu: [specialDish, ...prev.menu],
      phase: GamePhase.SERVICE,
      dailyEarnings: 0 // Reset daily earnings
    }));
  };

  const handleServiceComplete = (stats: { earned: number, reputationChange: number, exhausted: boolean }) => {
    if (stats.exhausted) {
      // Game Over logic
      alert(`Game Over! You passed out from exhaustion. Final Day: ${gameState.day}`);
      setGameState(INITIAL_STATE);
      return;
    }

    setGameState(prev => ({
      ...prev,
      gold: prev.gold + stats.earned,
      dailyEarnings: stats.earned,
      reputation: Math.min(100, Math.max(0, prev.reputation + stats.reputationChange)),
      phase: Math.random() > 0.5 ? GamePhase.EVENT : GamePhase.RESULT // 50% chance of event
    }));
  };
  
  const handleStateUpdate = (updates: Partial<GameState>) => {
      setGameState(prev => ({ ...prev, ...updates }));
  };

  const handleEventResolve = (resultText: string, updates: Partial<GameState>) => {
    setLastEventResult(resultText);
    setGameState(prev => ({
      ...prev,
      ...updates,
      phase: GamePhase.RESULT
    }));
  };

  const handleContinue = () => {
    setLastEventResult(null);
    setGameState(prev => ({
      ...prev,
      day: prev.day + 1,
      phase: GamePhase.ROUTE_SELECT
    }));
  };

  const handleUpgrade = (type: 'kitchen' | 'marketing' | 'decor', cost: number) => {
    setGameState(prev => {
      if (prev.gold < cost) return prev;
      
      const newState = { ...prev, gold: prev.gold - cost };
      
      if (type === 'kitchen') newState.kitchenLevel++;
      if (type === 'marketing') newState.marketingLevel++;
      if (type === 'decor') {
          // Special logic: Decor button used for healing in MVP
          newState.stamina = Math.min(newState.maxStamina, newState.stamina + 50);
      }
      
      return newState;
    });
  };

  // Rendering State Machine
  const renderPhase = () => {
    switch (gameState.phase) {
      case GamePhase.MENU:
        return <MainMenu onStart={startGame} gameState={gameState} />;
      case GamePhase.ROUTE_SELECT:
        return <RouteSelector onSelect={handleBiomeSelect} day={gameState.day} />;
      case GamePhase.PREP:
        return <PrepPhase gameState={gameState} onFinishPrep={handlePrepFinish} />;
      case GamePhase.SERVICE:
        return <ServicePhase gameState={gameState} onComplete={handleServiceComplete} onUpdateState={handleStateUpdate} />;
      case GamePhase.EVENT:
        return <EventModal gameState={gameState} onResolve={handleEventResolve} />;
      case GamePhase.RESULT:
        return <ResultScreen 
          gameState={gameState} 
          onContinue={handleContinue} 
          onUpgrade={handleUpgrade}
          resultMessage={lastEventResult}
        />;
      default:
        return <div>Unknown Phase</div>;
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 flex justify-center items-center font-sans">
      {/* Mobile-first container */}
      <div className="w-full max-w-md h-full md:h-[90vh] md:rounded-3xl overflow-hidden bg-white shadow-2xl relative">
         {renderPhase()}
      </div>
    </div>
  );
};

export default App;
