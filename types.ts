export enum GamePhase {
  MENU = 'MENU',
  ROUTE_SELECT = 'ROUTE_SELECT',
  PREP = 'PREP',
  SERVICE = 'SERVICE',
  EVENT = 'EVENT',
  BUFF_SELECT = 'BUFF_SELECT',
  RESULT = 'RESULT',
  GAME_OVER = 'GAME_OVER',
}

export enum BiomeType {
  FOREST = 'Forest',
  DESERT = 'Desert',
  TOWN = 'Town',
  SNOW = 'Snow',
}

export interface Biome {
  type: BiomeType;
  name: string;
  description: string;
  difficulty: number; // 1-5
  weatherEffect: string;
  bgImage: string;
}

export interface Dish {
  id: string;
  name: string;
  icon: string;
  basePrice: number;
  prepTime: number; // in ms
  description: string;
  isSpecial?: boolean;
}

export interface Customer {
  id: string;
  name: string; // e.g., "Mr. Rabbit"
  species: string; // emoji
  order: Dish;
  patience: number; // 0-100
  maxPatience: number;
  tipMultiplier: number;
}

export interface GameState {
  phase: GamePhase;
  day: number;
  gold: number;
  stamina: number; // 0-100
  maxStamina: number;
  reputation: number; // 0-100
  
  // Current Run Stats
  currentBiome: Biome | null;
  dailyGoal: number;
  dailyEarnings: number;
  
  // Permanent Upgrades (Meta-progression)
  kitchenLevel: number; // Faster prep
  marketingLevel: number; // More customers
  decorLevel: number; // Higher tips
  
  // Inventory/Buffs
  menu: Dish[];
  activeBuffs: Buff[];
}

export interface Buff {
  id: string;
  name: string;
  description: string;
  effect: (state: GameState) => Partial<GameState>;
  duration: number; // Days remaining, -1 for permanent
}

export interface RandomEvent {
  title: string;
  description: string;
  choices: {
    text: string;
    outcomeText: string;
    apply: (state: GameState) => Partial<GameState>;
  }[];
}
