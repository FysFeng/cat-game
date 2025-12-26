import React from 'react';
import { Biome, BiomeType } from '../types';
import { BIOMES_DATA } from '../constants';
import { MapPin, CloudSun, Wind, Sun } from 'lucide-react';

interface Props {
  onSelect: (biome: Biome) => void;
  day: number;
}

export const RouteSelector: React.FC<Props> = ({ onSelect, day }) => {
  const routes: Biome[] = [
    { type: BiomeType.FOREST, difficulty: 1, weatherEffect: 'Clear', ...BIOMES_DATA[BiomeType.FOREST] } as any,
    { type: BiomeType.DESERT, difficulty: 3, weatherEffect: 'Heatwave', ...BIOMES_DATA[BiomeType.DESERT] } as any,
    { type: BiomeType.TOWN, difficulty: 2, weatherEffect: 'Crowded', ...BIOMES_DATA[BiomeType.TOWN] } as any,
  ].sort(() => Math.random() - 0.5); // Shuffle

  const getWeatherIcon = (weather: string) => {
    if (weather.includes('Heat')) return <Sun className="text-orange-500" />;
    if (weather.includes('Wind')) return <Wind className="text-blue-500" />;
    return <CloudSun className="text-yellow-500" />;
  };

  return (
    <div className="flex flex-col h-full w-full bg-sky-100 p-6">
      <h2 className="text-3xl font-display text-center text-cat-brown mb-2 mt-8">Day {day}</h2>
      <p className="text-center text-gray-600 mb-8">Where shall we drive the food truck today?</p>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {routes.map((biome, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(biome)}
            className="group relative bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-left flex flex-col"
          >
            <div className="h-40 bg-gray-200 w-full relative">
               <img src={biome.bgImage} alt={biome.name} className="w-full h-full object-cover" />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
               <div className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-sm">
                 {getWeatherIcon(biome.weatherEffect)}
               </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={18} className="text-cat-orange" />
                <span className="text-sm font-bold uppercase tracking-wider text-gray-400">{biome.type}</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{biome.name}</h3>
              <p className="text-gray-500 text-sm mb-4 flex-1">
                {biome.description || "A path less traveled. Good opportunities for sales."}
              </p>
              
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                  Difficulty: {'⭐'.repeat(biome.difficulty)}
                </span>
                <span className="text-cat-orange font-bold group-hover:underline">Select &rarr;</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
