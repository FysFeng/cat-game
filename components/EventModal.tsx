import React, { useEffect, useState } from 'react';
import { GameState, RandomEvent } from '../types';
import { generateRandomEvent } from '../services/geminiService';
import { Sparkles, AlertTriangle } from 'lucide-react';

interface Props {
  gameState: GameState;
  onResolve: (resultText: string, updates: Partial<GameState>) => void;
}

export const EventModal: React.FC<Props> = ({ gameState, onResolve }) => {
  const [eventData, setEventData] = useState<RandomEvent | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadEvent = async () => {
      if (gameState.currentBiome) {
        const evt = await generateRandomEvent(gameState.currentBiome);
        if (mounted) setEventData(evt);
      }
    };
    loadEvent();
    return () => { mounted = false; };
  }, [gameState.currentBiome]);

  if (!eventData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="text-white flex flex-col items-center animate-pulse">
          <Sparkles size={48} className="mb-4" />
          <h2 className="text-2xl font-display">Something is happening...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="bg-purple-600 p-6 flex items-center gap-4">
          <AlertTriangle className="text-yellow-300 w-10 h-10" />
          <h2 className="text-2xl font-display font-bold text-white">{eventData.title}</h2>
        </div>
        
        <div className="p-8">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {eventData.description}
          </p>
          
          <div className="space-y-4">
            {eventData.choices.map((choice, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const updates = choice.apply(gameState);
                  onResolve(choice.outcomeText, updates);
                }}
                className="w-full p-4 text-left border-2 border-purple-100 rounded-xl hover:bg-purple-50 hover:border-purple-300 transition-colors group"
              >
                <div className="font-bold text-purple-900 group-hover:text-purple-700">{choice.text}</div>
                <div className="text-sm text-gray-400 mt-1">Tap to decide</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
