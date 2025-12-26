import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Customer, Dish } from '../types';
import { ANIMAL_EMOJIS, DAY_DURATION_MS } from '../constants';
import { Clock, DollarSign, Battery, AlertCircle } from 'lucide-react';

interface Props {
  gameState: GameState;
  onComplete: (stats: { earned: number, reputationChange: number, exhausted: boolean }) => void;
  onUpdateState: (updates: Partial<GameState>) => void;
}

export const ServicePhase: React.FC<Props> = ({ gameState, onComplete, onUpdateState }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [timeLeft, setTimeLeft] = useState(DAY_DURATION_MS);
  const [cooking, setCooking] = useState<string | null>(null); // Dish ID being cooked
  const [preparedDish, setPreparedDish] = useState<Dish | null>(null);
  const [dayEarnings, setDayEarnings] = useState(0);
  const [gameStamina, setGameStamina] = useState(gameState.stamina);
  
  const frameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const isPausedRef = useRef(false);

  // Spawn Logic
  const spawnCustomer = useCallback(() => {
    if (customers.length >= 4) return; // Max 4 customers at once
    
    // Pick a random dish from available menu
    const availableMenu = [...gameState.menu];
    const randomDish = availableMenu[Math.floor(Math.random() * availableMenu.length)];
    
    const newCustomer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Visitor',
      species: ANIMAL_EMOJIS[Math.floor(Math.random() * ANIMAL_EMOJIS.length)],
      order: randomDish,
      patience: 100,
      maxPatience: 100,
      tipMultiplier: 1 + (gameState.decorLevel * 0.1),
    };
    
    setCustomers(prev => [...prev, newCustomer]);
  }, [gameState.menu, customers.length, gameState.decorLevel]);

  // Main Loop
  useEffect(() => {
    const loop = () => {
      if (isPausedRef.current) return;

      const now = Date.now();
      const elapsed = now - startTimeRef.current;
      const remaining = Math.max(0, DAY_DURATION_MS - elapsed);
      
      setTimeLeft(remaining);

      // Check End Conditions
      if (remaining <= 0) {
        onComplete({ earned: dayEarnings, reputationChange: 5, exhausted: false });
        return;
      }
      if (gameStamina <= 0) {
        onComplete({ earned: dayEarnings, reputationChange: -10, exhausted: true });
        return;
      }

      // Spawning
      // Spawn rate increases as time goes on (difficulty curve)
      const spawnRate = 4000 - (gameState.day * 200); 
      if (now - lastSpawnRef.current > Math.max(1000, spawnRate)) {
        spawnCustomer();
        lastSpawnRef.current = now;
      }

      // Patience Decay
      setCustomers(prev => {
        const nextCustomers = prev.map(c => ({
          ...c,
          patience: c.patience - (0.1 * (gameState.currentBiome?.difficulty || 1))
        }));

        // Remove angry customers
        const angryCustomers = nextCustomers.filter(c => c.patience <= 0);
        if (angryCustomers.length > 0) {
            // Penalty for leaving
            setGameStamina(s => Math.max(0, s - (angryCustomers.length * 10)));
            onUpdateState({ reputation: Math.max(0, gameState.reputation - 5) });
        }

        return nextCustomers.filter(c => c.patience > 0);
      });

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [dayEarnings, gameStamina, gameState.day, gameState.currentBiome, gameState.reputation, onComplete, spawnCustomer, onUpdateState]);


  // Interaction Handlers
  const handleCook = (dish: Dish) => {
    if (cooking || preparedDish) return;
    
    setCooking(dish.id);
    
    // Prep time reduced by kitchen level
    const adjustedPrepTime = Math.max(500, dish.prepTime - (gameState.kitchenLevel * 200));

    setTimeout(() => {
      setCooking(null);
      setPreparedDish(dish);
    }, adjustedPrepTime);
  };

  const handleServe = (customer: Customer) => {
    if (!preparedDish) return;
    if (preparedDish.id !== customer.order.id) {
      // Wrong order penalty
      setGameStamina(prev => Math.max(0, prev - 5));
      setPreparedDish(null); // Waste food
      return;
    }

    // Success!
    const tip = Math.floor(customer.patience / 10) * customer.tipMultiplier;
    const total = preparedDish.basePrice + tip;
    
    setDayEarnings(prev => prev + total);
    setPreparedDish(null);
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    
    // Small stamina refund for good service?
    if (customer.patience > 80) {
       setGameStamina(prev => Math.min(gameState.maxStamina, prev + 2));
    }
  };

  const handleTrash = () => {
    setPreparedDish(null);
    setGameStamina(prev => Math.max(0, prev - 5)); // Penalty for waste
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-cover bg-center"
         style={{ backgroundImage: `url(${gameState.currentBiome?.bgImage})` }}>
      
      {/* HUD */}
      <div className="bg-white/90 backdrop-blur-md p-2 flex justify-between items-center shadow-lg z-20">
        <div className="flex gap-4">
          <div className="flex items-center text-red-500 font-bold gap-1">
             <Clock size={20} /> 
             {Math.ceil(timeLeft / 1000)}s
          </div>
          <div className="flex items-center text-green-600 font-bold gap-1">
             <Battery size={20} fill={gameStamina < 30 ? 'red' : 'green'} /> 
             {Math.floor(gameStamina)}%
          </div>
        </div>
        <div className="flex items-center text-yellow-600 font-bold text-xl gap-1">
           <DollarSign size={24} /> {dayEarnings}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 relative flex flex-col justify-end pb-48">
         {/* Customers Queue */}
         <div className="flex justify-center items-end gap-2 px-4 mb-4">
            {customers.map(customer => (
              <div 
                key={customer.id}
                onClick={() => handleServe(customer)}
                className={`
                  relative bg-white rounded-2xl p-3 shadow-2xl flex flex-col items-center 
                  transition-all duration-300 transform hover:scale-110 cursor-pointer border-4
                  ${preparedDish?.id === customer.order.id ? 'border-green-400 ring-4 ring-green-200' : 'border-white'}
                `}
                style={{ width: '120px' }}
              >
                {/* Bubble Request */}
                <div className="absolute -top-10 bg-white px-2 py-1 rounded-lg border shadow-sm animate-bounce">
                  <span className="text-xl">{customer.order.icon}</span>
                </div>

                <div className="text-5xl mb-2">{customer.species}</div>
                
                {/* Patience Bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-200 ${customer.patience < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${customer.patience}%` }}
                  />
                </div>
              </div>
            ))}
            {customers.length === 0 && (
              <div className="text-white/80 font-bold bg-black/30 px-4 py-2 rounded-full">
                Waiting for customers...
              </div>
            )}
         </div>
      </div>

      {/* Player Station / Controls */}
      <div className="absolute bottom-0 w-full bg-slate-800 p-4 rounded-t-3xl shadow-2xl z-30">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
           
           {/* Trash */}
           <button 
             onClick={handleTrash}
             className="p-4 bg-red-500/20 rounded-full hover:bg-red-500 hover:text-white text-red-400 transition"
             disabled={!preparedDish}
           >
             Trash
           </button>

           {/* Kitchen Actions */}
           <div className="flex gap-4">
             {gameState.menu.map(dish => (
               <button
                 key={dish.id}
                 disabled={!!cooking || !!preparedDish}
                 onClick={() => handleCook(dish)}
                 className={`
                   relative w-24 h-24 rounded-xl flex flex-col items-center justify-center gap-1
                   transition-all duration-100 border-b-4 active:border-b-0 active:translate-y-1
                   ${cooking === dish.id ? 'bg-yellow-400 animate-pulse' : 'bg-white hover:bg-gray-50'}
                   ${(cooking || preparedDish) && cooking !== dish.id ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                 `}
               >
                 <span className="text-3xl">{dish.icon}</span>
                 <span className="text-xs font-bold text-gray-700">{dish.name}</span>
                 {cooking === dish.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-xl">
                      <Clock className="animate-spin text-white" />
                    </div>
                 )}
               </button>
             ))}
           </div>

           {/* Serving Tray (The "Hand") */}
           <div className={`
             w-28 h-28 rounded-full border-4 border-dashed flex items-center justify-center
             ${preparedDish ? 'border-green-400 bg-green-50' : 'border-gray-500 bg-gray-700'}
           `}>
             {preparedDish ? (
               <div className="flex flex-col items-center animate-bounce-short">
                 <span className="text-5xl">{preparedDish.icon}</span>
                 <span className="text-xs font-bold text-green-700">Ready!</span>
               </div>
             ) : (
               <span className="text-gray-500 text-xs text-center">Tray<br/>Empty</span>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
