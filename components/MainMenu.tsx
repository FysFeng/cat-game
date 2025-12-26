import React from 'react';
import { GameState } from '../types';
import { Play, Coffee, Truck, Star } from 'lucide-react';

interface Props {
  onStart: () => void;
  gameState: GameState;
}

export const MainMenu: React.FC<Props> = ({ onStart, gameState }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-b from-blue-100 to-orange-50 text-cat-brown relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="absolute text-5xl animate-bounce-short"
            style={{
              top: `${Math.random() * 80}%`,
              left: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random()}s`,
              animationDelay: `${Math.random()}s`,
              opacity: 0.5
            }}
          >
            {['☁️', '🌳', '🌸', '🍔'][i % 4]}
          </div>
        ))}
      </div>

      <div className="z-10 flex flex-col items-center w-full max-w-md px-6">
        {/* Logo Area */}
        <div className="relative mb-12 transform hover:scale-105 transition-transform duration-500">
           <div className="w-48 h-48 bg-cat-orange rounded-full flex items-center justify-center border-8 border-white shadow-2xl relative z-10">
             <span className="text-8xl">🐱</span>
           </div>
           <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-2 rounded-full shadow-lg animate-bounce">
              <Star fill="currentColor" size={24} />
           </div>
           {/* Truck graphic underneath */}
           <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-16 bg-blue-500 rounded-lg -z-0 flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-white font-display text-sm">FOOD TRUCK</span>
           </div>
        </div>
        
        <h1 className="text-5xl font-display font-bold text-cat-brown mb-2 text-center drop-shadow-sm">
          Cat Snack <br/> <span className="text-cat-orange">Bar</span>
        </h1>
        <p className="text-lg font-sans text-gray-500 mb-10 tracking-wide">
          Travel. Cook. Purr.
        </p>

        <div className="w-full space-y-4">
          <button 
            onClick={onStart}
            className="w-full py-5 bg-gradient-to-r from-cat-orange to-orange-500 hover:from-orange-400 hover:to-orange-500 text-white font-display font-bold rounded-2xl shadow-xl transform transition active:scale-95 flex items-center justify-center gap-3 text-2xl border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
          >
            <Play size={28} fill="currentColor" />
            OPEN SHOP
          </button>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-100 flex flex-col items-center shadow-sm">
               <div className="bg-blue-100 p-2 rounded-full mb-1">
                 <Truck className="text-blue-500" size={20} />
               </div>
               <span className="text-xs text-gray-400 font-bold uppercase">Current Day</span>
               <span className="text-xl font-display font-bold text-gray-700">{gameState.day}</span>
            </div>
             <div className="p-3 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-green-100 flex flex-col items-center shadow-sm">
               <div className="bg-green-100 p-2 rounded-full mb-1">
                 <Coffee className="text-green-500" size={20} />
               </div>
               <span className="text-xs text-gray-400 font-bold uppercase">Kitchen Lvl</span>
               <span className="text-xl font-display font-bold text-gray-700">{gameState.kitchenLevel}</span>
            </div>
          </div>
        </div>
      </div>
      
      <p className="absolute bottom-6 text-gray-400 text-xs font-bold opacity-50">POWERED BY GEMINI</p>
    </div>
  );
};
