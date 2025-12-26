import React from 'react';
import { GameState } from '../types';
import { ArrowRight, ShoppingBag, Heart, Zap } from 'lucide-react';

interface Props {
  gameState: GameState;
  onContinue: () => void;
  onUpgrade: (type: 'kitchen' | 'marketing' | 'decor', cost: number) => void;
  resultMessage: string | null;
}

export const ResultScreen: React.FC<Props> = ({ gameState, onContinue, onUpgrade, resultMessage }) => {
  const kitchenCost = (gameState.kitchenLevel + 1) * 100;
  const marketingCost = (gameState.marketingLevel + 1) * 100;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      <div className="bg-cat-orange p-8 text-white rounded-b-3xl shadow-lg">
        <h2 className="text-3xl font-display font-bold text-center mb-2">Day {gameState.day} Complete!</h2>
        <div className="flex justify-center gap-8 mt-4">
           <div className="text-center">
             <div className="text-4xl font-bold">${gameState.dailyEarnings}</div>
             <div className="text-sm opacity-80">Earned</div>
           </div>
           <div className="text-center">
             <div className="text-4xl font-bold">{gameState.stamina.toFixed(0)}%</div>
             <div className="text-sm opacity-80">Stamina</div>
           </div>
        </div>
      </div>

      {resultMessage && (
        <div className="mx-6 -mt-6 bg-white p-4 rounded-xl shadow-md z-10 border-l-4 border-purple-500">
          <h4 className="font-bold text-purple-900">Event Outcome</h4>
          <p className="text-gray-600">{resultMessage}</p>
        </div>
      )}

      <div className="p-6 max-w-2xl mx-auto w-full">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <ShoppingBag /> RV Upgrades
        </h3>
        
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800">Speedy Stove (Lvl {gameState.kitchenLevel})</h4>
              <p className="text-xs text-gray-500">Cook 200ms faster per level</p>
            </div>
            <button 
              disabled={gameState.gold < kitchenCost}
              onClick={() => onUpgrade('kitchen', kitchenCost)}
              className={`px-4 py-2 rounded-lg font-bold ${gameState.gold >= kitchenCost ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
            >
              ${kitchenCost}
            </button>
          </div>

          <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800">Catnip Marketing (Lvl {gameState.marketingLevel})</h4>
              <p className="text-xs text-gray-500">More customers appear</p>
            </div>
            <button 
              disabled={gameState.gold < marketingCost}
              onClick={() => onUpgrade('marketing', marketingCost)}
              className={`px-4 py-2 rounded-lg font-bold ${gameState.gold >= marketingCost ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-200 text-gray-400'}`}
            >
              ${marketingCost}
            </button>
          </div>
          
           <div className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center">
            <div>
              <h4 className="font-bold text-gray-800">Rest & Repair</h4>
              <p className="text-xs text-gray-500">Recover 50 Stamina</p>
            </div>
            <button 
              disabled={gameState.gold < 50}
              onClick={() => onUpgrade('decor', 50)} // Hacky use of 'decor' for heal
              className={`px-4 py-2 rounded-lg font-bold ${gameState.gold >= 50 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-400'}`}
            >
              $50
            </button>
          </div>
        </div>

        <button 
          onClick={onContinue}
          className="w-full py-4 bg-cat-orange hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xl"
        >
          Next Day <ArrowRight />
        </button>
      </div>
    </div>
  );
};
