import { RestaurantNAProfile } from './types';

// 9% laag tarief voor NA-dranken (BTW)
export const BTW_NA = 1.09;

// Keys match the IDs used in RESTAURANTS (lib/game-types.ts) — kept stable so
// existing leaderboard entries, RESTAURANT_DATA narratives and game routing
// don't need a parallel rename.
export const RESTAURANT_NA_PROFILES: Record<string, RestaurantNAProfile> = {
  'le-bistro': {
    id: 'le-bistro',
    glassesPerCover: 3,
    hourlyWage: 20,
    bottled: {
      defaultPrice: 15,
      plafondPrice: 18,
      cogsPercent: 32,
      baseAttachRate: 0.20,
      baseChurnRate: 0.40,
    },
    inHouse: {
      available: true,
      defaultPrice: 18,
      plafondPrice: 22.50,
      cogsPercent: 11,
      requiredLaborHoursPer100Covers: 10,
      wasteMultiplier: 1.05,
      baseAttachRate: 0.40,
      baseChurnRate: 0.10,
    },
  },
  'maison-elegante': {
    id: 'maison-elegante',
    glassesPerCover: 5,
    hourlyWage: 24,
    bottled: {
      defaultPrice: 50,
      plafondPrice: 60,
      cogsPercent: 30,
      baseAttachRate: 0.15,
      baseChurnRate: 0.55,
    },
    inHouse: {
      available: true,
      defaultPrice: 66.75,
      plafondPrice: 80.10,
      cogsPercent: 9,
      requiredLaborHoursPer100Covers: 18,
      wasteMultiplier: 1.05,
      baseAttachRate: 0.45,
      baseChurnRate: 0.08,
    },
  },
  'harbour-co': {
    id: 'harbour-co',
    glassesPerCover: 3,
    hourlyWage: 20,
    bottled: {
      defaultPrice: 15,
      plafondPrice: 22.50,
      cogsPercent: 35,
      baseAttachRate: 0.30,
      baseChurnRate: 0.15,
    },
    inHouse: {
      available: false, // volume logistiek niet haalbaar
      defaultPrice: 0,
      plafondPrice: 0,
      cogsPercent: 0,
      requiredLaborHoursPer100Covers: 0,
      wasteMultiplier: 1.0,
      baseAttachRate: 0,
      baseChurnRate: 1,
    },
  },
  'stadshotel': {
    id: 'stadshotel',
    glassesPerCover: 4,
    hourlyWage: 20,
    bottled: {
      defaultPrice: 30,
      plafondPrice: 36,
      cogsPercent: 33,
      baseAttachRate: 0.25,
      baseChurnRate: 0.35,
    },
    inHouse: {
      available: true,
      defaultPrice: 36,
      plafondPrice: 40.35,
      cogsPercent: 10,
      requiredLaborHoursPer100Covers: 10,
      wasteMultiplier: 1.20, // hoge derving door bezettingsschommelingen
      baseAttachRate: 0.35,
      baseChurnRate: 0.12,
    },
  },
  'atelier-noord': {
    id: 'atelier-noord',
    glassesPerCover: 5,
    hourlyWage: 24,
    bottled: {
      // Theoretisch beschikbaar maar conceptueel onlogisch — UI verbergt
      // deze knop voor dit restaurant (zie PART Q).
      defaultPrice: 50,
      plafondPrice: 55,
      cogsPercent: 32,
      baseAttachRate: 0.20,
      baseChurnRate: 0.60,
    },
    inHouse: {
      available: true,
      defaultPrice: 55,
      plafondPrice: 66.75,
      cogsPercent: 8,
      requiredLaborHoursPer100Covers: 15,
      wasteMultiplier: 1.05,
      baseAttachRate: 0.55,
      baseChurnRate: 0.05,
    },
  },
};

export function getRestaurantNAProfile(id: string): RestaurantNAProfile {
  const profile = RESTAURANT_NA_PROFILES[id];
  if (!profile) {
    throw new Error(`No NA profile found for restaurant: ${id}`);
  }
  return profile;
}
