import React from 'react';
import { GameState } from '../types';
import { Play, Coffee, Truck } from 'lucide-react';

interface Props {
  onStart: () => void;
  gameState: GameState;
}

export const MainMenu: React.FC<Props> = ({ onStart, gameState }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-orange-50 text-cat-brown relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute text-4xl animate-bounce"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          >
            🐾
          </div>
        ))}
      </div>

      <div className="z-10 text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-cat-orange max-w-md w-full mx-4">
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 bg-cat-orange rounded-full flex items-center justify-center text-6xl shadow-inner border-4 border-white">
            🐱
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-bold text-cat-orange mb-2">Cat Snack Bar</h1>
        <h2 className="text-lg font-sans text-gray-600 mb-8">The Traveling Food Truck</h2>

        <div className="space-y-4">
          <button 
            onClick={onStart}
            className="w-full py-4 bg-cat-orange hover:bg-orange-500 text-white font-bold rounded-2xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-3 text-xl"
          >
            <Play size={24} fill="currentColor" />
            Start Journey
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100 flex flex-col items-center">
               <Truck className="text-blue-400 mb-2" />
               <span className="text-sm font-bold text-gray-500">Day {gameState.day}</span>
            </div>
             <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100 flex flex-col items-center">
               <Coffee className="text-green-400 mb-2" />
               <span className="text-sm font-bold text-gray-500">Lvl {gameState.kitchenLevel}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="absolute bottom-4 text-gray-400 text-sm">Made with 🧡 & Gemini</p>
    </div>
  );
};
