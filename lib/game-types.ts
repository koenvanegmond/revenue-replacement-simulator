import { NAStrategy } from './types';

export type GameScreen = 'welcome' | 'restaurant-picker' | 'challenge' | 'result';

export interface CardData {
  restaurantName: string;
  restaurantType: string;
  covers: number;
  avgSpend: number;
  beverageShare: number;
  alcoholShare: number;
  declineRate: number;
}

export interface GameLevers {
  // Lever 1 — NA strategy (make-or-buy + pricing elasticity)
  restaurantId: string;          // looks up RESTAURANT_NA_PROFILES; set on restaurant pick
  naStrategy: NAStrategy;        // 'bottled' | 'in_house'
  naPlayerSetPrice: number;      // € per NA glass
  naScheduledLaborHours: number; // hours/month allocated to NA production
  // Lever 2 — menu engineering
  starPromotion: number;
  plowhorseEngineering: number;
  puzzleActivation: number;
  dogReplacement: number;
  // Lever 3 — spend per table
  welcomeConversion: number;
  welcomePrice: number;
  dessertAttachRate: number;
  coffeeAttachRate: number;
}

// Subset of GameLevers that maps 1:1 to a numeric slider in the UI.
export type SliderKey =
  | 'starPromotion'
  | 'plowhorseEngineering'
  | 'puzzleActivation'
  | 'welcomeConversion'
  | 'welcomePrice'
  | 'dessertAttachRate'
  | 'coffeeAttachRate';

export interface LeaderboardEntry {
  name: string;
  restaurant: string;
  score_percent: number;
  timestamp: number;
}

// ─── Fixed gross margins for game mode (keeps card data entry simple) ─────────
export const GAME_MARGINS = {
  alcoholMargin: 75,
  naMargin: 70,
  foodMargin: 65,
} as const;

// ─── Default lever values (matching simulator defaults) ────────────────────────
// naPlayerSetPrice / restaurantId are overwritten on restaurant selection
// (see app/game/page.tsx handleRestaurantSelect).
export const DEFAULT_LEVERS: GameLevers = {
  restaurantId: 'le-bistro',
  naStrategy: 'bottled',
  naPlayerSetPrice: 15,          // le-bistro bottled defaultPrice
  naScheduledLaborHours: 0,      // bottled = no in-house labor
  starPromotion: 25,
  plowhorseEngineering: 20,
  puzzleActivation: 25,
  dogReplacement: 0,
  welcomeConversion: 25,
  welcomePrice: 8,
  dessertAttachRate: 2,
  coffeeAttachRate: 60,
};

export interface RestaurantCard extends CardData {
  id: string;
  themeColor: string;
  accentColor: string;
}

export const RESTAURANTS: RestaurantCard[] = [
  {
    id: 'le-bistro',
    restaurantName: 'Le Bistro Moderne',
    restaurantType: 'Midscale Fine-Dining',
    covers: 600, avgSpend: 65, beverageShare: 30, alcoholShare: 80, declineRate: 20,
    themeColor: '#A0522D',
    accentColor: '#F4A261',
  },
  {
    id: 'maison-elegante',
    restaurantName: 'Maison Élégante',
    restaurantType: 'High-End Fine-Dining',
    covers: 400, avgSpend: 120, beverageShare: 40, alcoholShare: 85, declineRate: 25,
    themeColor: '#6B2737',
    accentColor: '#C77D8A',
  },
  {
    id: 'harbour-co',
    restaurantName: 'Harbour & Co',
    restaurantType: 'Urban Fine-Dining',
    covers: 800, avgSpend: 75, beverageShare: 35, alcoholShare: 85, declineRate: 25,
    themeColor: '#14545E',
    accentColor: '#5FB3BF',
  },
  {
    id: 'stadshotel',
    restaurantName: 'Het Stadshotel Restaurant',
    restaurantType: 'Hotel Fine-Dining',
    covers: 1200, avgSpend: 85, beverageShare: 32, alcoholShare: 75, declineRate: 30,
    themeColor: '#1A3A5C',
    accentColor: '#6A9CC8',
  },
  {
    id: 'atelier-noord',
    restaurantName: 'Atelier Noord',
    restaurantType: 'Urban Concept Fine-Dining',
    covers: 500, avgSpend: 95, beverageShare: 38, alcoholShare: 88, declineRate: 22,
    themeColor: '#1B4332',
    accentColor: '#6FCF97',
  },
];

export const DEFAULT_CARD: CardData = {
  restaurantName: '',
  restaurantType: '',
  covers: 0,
  avgSpend: 0,
  beverageShare: 35,
  alcoholShare: 85,
  declineRate: 25,
};

// ─── Aggressive zone boundaries ────────────────────────────────────────────────
// Values above these thresholds are "aggressive" and incur a staff/training cost penalty
// (NA pricing aggression is modelled inside the elasticity engine, so no entry here.)
export const AGGRESSIVE_THRESHOLD: Record<SliderKey, number> = {
  starPromotion: 70,
  plowhorseEngineering: 70,
  puzzleActivation: 70,
  welcomeConversion: 30,
  welcomePrice: 10,
  dessertAttachRate: 3,
  coffeeAttachRate: 85,
};

export const STAFF_PENALTY_PER_AGGRESSIVE = 400; // €/month per aggressive lever

export interface SliderConfig {
  min: number;
  max: number;
  realisticMax: number;
  unit: string;
  label: string;
  benchmark: string;
}

export const SLIDER_CONFIGS: Record<SliderKey, SliderConfig> = {
  starPromotion: {
    min: 0, max: 100, realisticMax: 60, unit: '%', label: 'Star promotion',
    benchmark: '20–40% typical push; >70% courts menu fatigue (Kasavana & Smith, 1982)',
  },
  plowhorseEngineering: {
    min: 0, max: 100, realisticMax: 60, unit: '%', label: 'Plowhorse re-engineering',
    benchmark: '15–35% realistic redesign effort (Morrison, 1996)',
  },
  puzzleActivation: {
    min: 0, max: 100, realisticMax: 60, unit: '%', label: 'Puzzle activation',
    benchmark: '20–40% storytelling intensity; >70% strains kitchen complexity',
  },
  welcomeConversion: {
    min: 0, max: 100, realisticMax: 30, unit: '%', label: 'Welcome drink conversion',
    benchmark: '15–30% typical (Harpoon interview, 2026)',
  },
  welcomePrice: {
    min: 4, max: 15, realisticMax: 10, unit: '€', label: 'Welcome drink price',
    benchmark: '€6–10 typical',
  },
  dessertAttachRate: {
    min: 0, max: 15, realisticMax: 3, unit: ' pp', label: 'Dessert Attach Rate',
    benchmark: '1–3pp realistic (Prinsen et al., 2018)',
  },
  coffeeAttachRate: {
    min: 0, max: 100, realisticMax: 80, unit: '%', label: 'Coffee / tea attach',
    benchmark: '50–75% typical; >70% adds seat-time friction',
  },
};
