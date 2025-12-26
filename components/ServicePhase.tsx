import React, { useEffect, useState, useRef, useCallback } from 'react';
import { GameState, Customer, Dish } from '../types';
import { ANIMAL_EMOJIS, DAY_DURATION_MS } from '../constants';
import { Clock, DollarSign, Battery, ChefHat, Trash2 } from 'lucide-react';

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
    if (customers.length >= 3) return; // Max 3 customers visible at counter
    
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
      const spawnRate = 4000 - (gameState.day * 200); 
      if (now - lastSpawnRef.current > Math.max(1500, spawnRate)) {
        spawnCustomer();
        lastSpawnRef.current = now;
      }

      // Patience Decay
      setCustomers(prev => {
        const nextCustomers = prev.map(c => ({
          ...c,
          patience: c.patience - (0.05 * (gameState.currentBiome?.difficulty || 1)) // Slower decay for better UX
        }));

        // Remove angry customers
        const angryCustomers = nextCustomers.filter(c => c.patience <= 0);
        if (angryCustomers.length > 0) {
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
    const adjustedPrepTime = Math.max(500, dish.prepTime - (gameState.kitchenLevel * 200));

    setTimeout(() => {
      setCooking(null);
      setPreparedDish(dish);
    }, adjustedPrepTime);
  };

  const handleServe = (customer: Customer) => {
    if (!preparedDish) return;
    if (preparedDish.id !== customer.order.id) {
      setGameStamina(prev => Math.max(0, prev - 5));
      setPreparedDish(null); // Waste food
      return;
    }

    const tip = Math.floor(customer.patience / 10) * customer.tipMultiplier;
    const total = preparedDish.basePrice + tip;
    
    setDayEarnings(prev => prev + total);
    setPreparedDish(null);
    setCustomers(prev => prev.filter(c => c.id !== customer.id));
    
    if (customer.patience > 80) {
       setGameStamina(prev => Math.min(gameState.maxStamina, prev + 2));
    }
  };

  const handleTrash = () => {
    setPreparedDish(null);
    setGameStamina(prev => Math.max(0, prev - 5));
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden bg-gray-900 text-white">
      
      {/* Background (Biome) */}
      <div 
        className="absolute inset-0 z-0 opacity-80"
        style={{ 
          backgroundImage: `url(${gameState.currentBiome?.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      {/* HUD */}
      <div className="relative z-20 p-4 flex justify-between items-start">
        <div className="flex flex-col gap-2">
           <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 shadow-lg">
             <Clock size={18} className="text-yellow-400" />
             <span className="font-bold font-display tracking-wider">{Math.ceil(timeLeft / 1000)}s</span>
           </div>
           <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 shadow-lg">
             <Battery size={18} className={gameStamina < 30 ? 'text-red-500' : 'text-green-400'} />
             <span className="font-bold">{Math.floor(gameStamina)}%</span>
           </div>
        </div>
        
        <div className="bg-green-500/90 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2 border-2 border-white shadow-xl transform scale-110 origin-top-right">
           <DollarSign size={24} className="text-white" />
           <span className="font-bold font-display text-xl">{dayEarnings}</span>
        </div>
      </div>

      {/* GAME SCENE */}
      <div className="flex-1 relative z-10 flex flex-col">
        
        {/* The Truck Window Frame */}
        <div className="mt-auto relative w-full h-[55%] bg-gradient-to-b from-gray-200 to-white rounded-t-[40px] shadow-2xl border-t-8 border-cat-orange overflow-hidden">
           
           {/* Chef (Player) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[80px] animate-bounce-short z-10">
             🐱
             {/* Chef Hat */}
             <div className="absolute -top-10 left-4 bg-white rounded-t-lg w-12 h-10 border-2 border-gray-300 transform -rotate-12 flex items-center justify-center">
                <ChefHat className="text-gray-400" size={24} />
             </div>
           </div>

           {/* Counter Top */}
           <div className="absolute bottom-0 w-full h-16 bg-cat-brown border-t-4 border-amber-900 shadow-inner z-20 flex justify-center items-center">
              {/* Prepared Dish Display on Counter */}
              <div className={`
                transition-all duration-300 transform
                ${preparedDish ? 'scale-100 opacity-100 translate-y-0' : 'scale-50 opacity-0 translate-y-4'}
              `}>
                <div className="relative">
                  <span className="text-5xl drop-shadow-lg filter">{preparedDish?.icon}</span>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-black/20 rounded-full blur-sm" />
                </div>
              </div>
           </div>

           {/* Kitchen Wall Background */}
           <div className="absolute inset-0 bg-blue-50 opacity-50 z-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        </div>

        {/* Customers Area (Foreground) */}
        <div className="absolute bottom-12 w-full h-40 z-30 pointer-events-none px-4">
           <div className="flex justify-around items-end h-full relative max-w-lg mx-auto">
             {customers.map((customer, idx) => (
               <div 
                 key={customer.id}
                 onClick={() => handleServe(customer)}
                 className={`
                   animate-walk-in pointer-events-auto cursor-pointer
                   relative flex flex-col items-center transition-transform hover:scale-105 active:scale-95
                 `}
                 style={{ 
                   animationDelay: `${idx * 0.1}s`,
                   zIndex: 30 - idx 
                 }}
               >
                 {/* Order Bubble */}
                 <div className="bg-white px-3 py-2 rounded-xl rounded-bl-none border-2 border-gray-200 shadow-lg mb-2 flex items-center gap-2 animate-bounce">
                    <span className="text-2xl">{customer.order.icon}</span>
                    <div className="h-1.5 w-10 bg-gray-200 rounded-full overflow-hidden">
                       <div 
                         className={`h-full transition-all duration-200 ${customer.patience < 30 ? 'bg-red-500' : 'bg-green-500'}`}
                         style={{ width: `${customer.patience}%` }}
                       />
                    </div>
                 </div>

                 {/* Customer Sprite */}
                 <span className="text-7xl filter drop-shadow-xl transform transition-all duration-300">
                   {customer.species}
                 </span>
               </div>
             ))}
           </div>
        </div>

      </div>

      {/* Control Panel */}
      <div className="relative z-40 bg-white pb-6 pt-4 px-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
          
          <button 
            onClick={handleTrash}
            disabled={!preparedDish}
            className="p-4 rounded-2xl bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={24} />
          </button>

          <div className="flex gap-3">
             {gameState.menu.map(dish => (
               <button
                 key={dish.id}
                 disabled={!!cooking || !!preparedDish}
                 onClick={() => handleCook(dish)}
                 className={`
                   group relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center
                   transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1
                   ${cooking === dish.id ? 'bg-yellow-100 border-yellow-300' : 'bg-white border-gray-200 hover:bg-orange-50 hover:border-cat-orange'}
                   ${(cooking || preparedDish) && cooking !== dish.id ? 'opacity-40 grayscale' : ''}
                 `}
               >
                 <span className="text-3xl group-hover:scale-110 transition-transform">{dish.icon}</span>
                 <div className="mt-1 h-1 w-8 bg-gray-100 rounded-full overflow-hidden">
                   {cooking === dish.id && (
                     <div className="h-full bg-yellow-400 animate-[width_2s_linear_infinite]" style={{ width: '100%' }} />
                   )}
                 </div>
               </button>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
};
