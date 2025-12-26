import React, { useEffect, useState } from 'react';
import { Biome, Dish, GameState } from '../types';
import { generateSpecialMenu } from '../services/geminiService';
import { Sparkles, Utensils, ArrowRight } from 'lucide-react';

interface Props {
  gameState: GameState;
  onFinishPrep: (specialDish: Dish) => void;
}

export const PrepPhase: React.FC<Props> = ({ gameState, onFinishPrep }) => {
  const [specialDish, setSpecialDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchMenu = async () => {
      if (gameState.currentBiome) {
        const dish = await generateSpecialMenu(gameState.currentBiome);
        if (mounted) {
          setSpecialDish(dish);
          setLoading(false);
        }
      }
    };
    fetchMenu();
    return () => { mounted = false; };
  }, [gameState.currentBiome]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-orange-50">
        <Sparkles className="animate-spin text-cat-orange mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-700">Inventing a new recipe...</h2>
        <p className="text-gray-500">Asking the AI Chef</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-orange-50 p-6 items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-cat-orange/20">
        <div className="bg-cat-orange p-6 text-white text-center">
          <h2 className="text-3xl font-display">Kitchen Prep</h2>
          <p className="opacity-90">Get ready for the rush in {gameState.currentBiome?.name}!</p>
        </div>

        <div className="p-8">
          <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Today's Special</h3>
          
          {specialDish && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 transform hover:scale-105 transition-transform duration-300">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-6xl shadow-md border-2 border-yellow-100">
                {specialDish.icon}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold text-gray-800">{specialDish.name}</h4>
                <p className="text-gray-600 italic mb-2">"{specialDish.description}"</p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-semibold">
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded">Price: ${specialDish.basePrice}</span>
                  <span className="text-blue-600 bg-blue-100 px-2 py-1 rounded">Prep: {specialDish.prepTime / 1000}s</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Standard Menu</h3>
            <div className="grid grid-cols-3 gap-2">
              {gameState.menu.map(dish => (
                <div key={dish.id} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center text-center opacity-70">
                  <span className="text-2xl">{dish.icon}</span>
                  <span className="text-xs font-bold text-gray-600">{dish.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex justify-center">
          <button
            onClick={() => specialDish && onFinishPrep(specialDish)}
            className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2 text-lg transition-all"
          >
            Open for Business <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
