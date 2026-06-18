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
  naAttachRate: number;
  naPairingPrice: number;
  naPairingMargin: number;
  foodMarginUplift: number;
  welcomeConversion: number;
  welcomePrice: number;
  dessertAttachRate: number;
}

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
export const DEFAULT_LEVERS: GameLevers = {
  naAttachRate: 20,
  naPairingPrice: 25,
  naPairingMargin: 65,
  foodMarginUplift: 2,
  welcomeConversion: 25,
  welcomePrice: 8,
  dessertAttachRate: 2,
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
export const AGGRESSIVE_THRESHOLD = {
  naAttachRate: 30,
  naPairingPrice: 35,
  naPairingMargin: 70,
  foodMarginUplift: 3,
  welcomeConversion: 30,
  welcomePrice: 10,
  dessertAttachRate: 3,
} as const;

export const STAFF_PENALTY_PER_AGGRESSIVE = 400; // €/month per aggressive lever

export interface SliderConfig {
  min: number;
  max: number;
  realisticMax: number;
  unit: string;
  label: string;
  benchmark: string;
}

export const SLIDER_CONFIGS: Record<keyof GameLevers, SliderConfig> = {
  naAttachRate: {
    min: 0, max: 80, realisticMax: 30, unit: '%', label: 'Attach rate',
    benchmark: '10–20% typical, 30%+ best in class (World of Nix, 2026)',
  },
  naPairingPrice: {
    min: 15, max: 60, realisticMax: 35, unit: '€', label: 'Pairing price',
    benchmark: '€20–30 typical for premium NA pairings (World of Nix, 2026)',
  },
  naPairingMargin: {
    min: 50, max: 80, realisticMax: 70, unit: '%', label: 'NA pairing margin',
    benchmark: '60–70% (Harpoon interview, 2026)',
  },
  foodMarginUplift: {
    min: 0, max: 10, realisticMax: 3, unit: ' pp', label: 'Food margin uplift',
    benchmark: '1–3pp realistic, 5pp+ aggressive (Morrison, 1996)',
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
    min: 0, max: 15, realisticMax: 3, unit: ' pp', label: 'Dessert attach uplift',
    benchmark: '1–3pp realistic (Prinsen et al., 2018)',
  },
};
