import { BiomeType, Dish } from './types';

export const INITIAL_STAMINA = 100;
export const DAY_DURATION_MS = 60000; // 60 seconds per day

export const BASE_MENU: Dish[] = [
  { id: 'fish_soup', name: 'Fish Soup', icon: '🍲', basePrice: 10, prepTime: 2000, description: 'Warm and savory.' },
  { id: 'tuna_sushi', name: 'Tuna Sushi', icon: '🍣', basePrice: 15, prepTime: 3000, description: 'Fresh catch!' },
  { id: 'catnip_tea', name: 'Catnip Tea', icon: '🍵', basePrice: 8, prepTime: 1000, description: 'Relaxing brew.' },
];

export const BIOMES_DATA = {
  [BiomeType.FOREST]: {
    name: 'Whispering Woods',
    bg: 'https://picsum.photos/800/600?grayscale&blur=2',
    color: 'bg-green-100'
  },
  [BiomeType.DESERT]: {
    name: 'Sunbaked Dunes',
    bg: 'https://picsum.photos/800/601?sepia',
    color: 'bg-yellow-100'
  },
  [BiomeType.TOWN]: {
    name: 'Catnip City',
    bg: 'https://picsum.photos/800/602',
    color: 'bg-blue-100'
  },
  [BiomeType.SNOW]: {
    name: 'Frosty Peaks',
    bg: 'https://picsum.photos/800/603?blur',
    color: 'bg-slate-100'
  }
};

export const ANIMAL_EMOJIS = ['🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'];
