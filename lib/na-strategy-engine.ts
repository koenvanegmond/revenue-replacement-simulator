import { RestaurantNAProfile, NAStrategy } from './types';
import { BTW_NA } from './restaurant-na-profiles';

// ─────────────────────────────────────────────────────────────────────────
// 1. Netto Marge per NA Glas
// ─────────────────────────────────────────────────────────────────────────
export function calculateNettoMargePerGlas(params: {
  sellingPrice: number;
  strategy: NAStrategy;
  cogsPercent: number;
  scheduledLaborHours: number;
  totalCovers: number;
  glassesPerCover: number;
  hourlyWage: number;
  wasteMultiplier: number;
}) {
  const {
    sellingPrice, strategy, cogsPercent, scheduledLaborHours,
    totalCovers, glassesPerCover, hourlyWage, wasteMultiplier,
  } = params;

  const priceExclBTW = sellingPrice / BTW_NA;
  const cogsPerGlass = priceExclBTW * (cogsPercent / 100);

  const totalGlasses = totalCovers * glassesPerCover;
  const laborCostPerGlass =
    strategy === 'in_house' && totalGlasses > 0
      ? (scheduledLaborHours * hourlyWage) / totalGlasses
      : 0;

  const wasteCostPerGlass =
    strategy === 'in_house' ? cogsPerGlass * (wasteMultiplier - 1) : 0;

  const nettoMarge = priceExclBTW - cogsPerGlass - laborCostPerGlass - wasteCostPerGlass;

  return { nettoMarge, priceExclBTW, cogsPerGlass, laborCostPerGlass, wasteCostPerGlass };
}

// ─────────────────────────────────────────────────────────────────────────
// 2. Attach Rate & Churn — non-linear pricing elasticity
// ─────────────────────────────────────────────────────────────────────────
export function calculateAttachAndChurn(params: {
  currentPrice: number;
  defaultPrice: number;
  plafondPrice: number;
  baseAttachRate: number;
  baseChurnRate: number;
}) {
  const {
    currentPrice, defaultPrice, plafondPrice,
    baseAttachRate, baseChurnRate,
  } = params;

  let attachRate: number;
  let churnRate: number;

  const softZoneStart = defaultPrice + (plafondPrice - defaultPrice) * 0.5;

  if (currentPrice <= softZoneStart) {
    attachRate = baseAttachRate;
    churnRate = baseChurnRate;
  } else if (currentPrice <= plafondPrice) {
    const stretchRatio = (currentPrice - softZoneStart) / (plafondPrice - softZoneStart);
    attachRate = baseAttachRate * (1 - stretchRatio * 0.30);
    churnRate = baseChurnRate + stretchRatio * 0.12;
  } else {
    const overshoot = (currentPrice - plafondPrice) / plafondPrice;
    const penaltyFactor = Math.pow(1 + overshoot, 3) - 1;
    attachRate = Math.max(0.02, baseAttachRate * 0.70 * Math.exp(-penaltyFactor));
    churnRate = Math.min(0.90, baseChurnRate + 0.12 + penaltyFactor * 0.40);
  }

  return {
    effectiveAttachRate: attachRate,
    effectiveChurnRate: churnRate,
    effectiveGlassesPerCoverMultiplier: 1 - churnRate,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// 3. Valstrik-Logica — Fatigue & Reviews bij onderbezetting (in-house only)
// ─────────────────────────────────────────────────────────────────────────
export function calculateValstrikImpact(params: {
  strategy: NAStrategy;
  scheduledLaborHours: number;
  requiredLaborHours: number;
  baseReviewScore: number;
}) {
  const { strategy, scheduledLaborHours, requiredLaborHours, baseReviewScore } = params;

  if (strategy !== 'in_house') {
    return {
      fatigueRate: 0,
      reviewScoreDelta: 0,
      newReviewScore: baseReviewScore,
      qualityImpactMultiplier: 1.0,
      warningLevel: 'ok' as const,
    };
  }

  const laborShortfall = Math.max(0, requiredLaborHours - scheduledLaborHours);
  const shortfallRatio = requiredLaborHours > 0 ? laborShortfall / requiredLaborHours : 0;

  const fatigueRate = Math.min(1.0, Math.pow(shortfallRatio, 1.5) * 1.2);
  const reviewScoreDelta = -(fatigueRate * 1.5);
  const newReviewScore = Math.max(1.0, baseReviewScore + reviewScoreDelta);
  const qualityImpactMultiplier = Math.max(0.4, 1 - fatigueRate * 0.7);

  let warningLevel: 'ok' | 'stress' | 'critical';
  if (fatigueRate < 0.15) warningLevel = 'ok';
  else if (fatigueRate < 0.45) warningLevel = 'stress';
  else warningLevel = 'critical';

  return { fatigueRate, reviewScoreDelta, newReviewScore, qualityImpactMultiplier, warningLevel };
}

// ─────────────────────────────────────────────────────────────────────────
// PIPELINE — combines all three into monthly profit
// ─────────────────────────────────────────────────────────────────────────
export interface NAStrategyOutcome {
  monthlyNAProfit: number;
  effectiveAttachRate: number;
  effectiveChurnRate: number;
  realisedMargePerGlas: number;
  fatigueRate: number;
  reviewScoreDelta: number;
  qualityImpactMultiplier: number;
  warningLevel: 'ok' | 'stress' | 'critical';
  requiredLaborHours: number;
  nettoMarge: number;
  error?: string;
}

export function calculateNAStrategyOutcome(params: {
  restaurantProfile: RestaurantNAProfile;
  strategy: NAStrategy;
  playerSetPrice: number;
  scheduledLaborHours: number;
  totalCovers: number;
  baseReviewScore?: number;
}): NAStrategyOutcome {
  const {
    restaurantProfile, strategy, playerSetPrice,
    scheduledLaborHours, totalCovers, baseReviewScore = 4.5,
  } = params;

  if (strategy === 'in_house' && !restaurantProfile.inHouse.available) {
    return {
      error: 'In-house not available for this restaurant',
      monthlyNAProfit: 0,
      effectiveAttachRate: 0,
      effectiveChurnRate: 1,
      realisedMargePerGlas: 0,
      fatigueRate: 0,
      reviewScoreDelta: 0,
      qualityImpactMultiplier: 1,
      warningLevel: 'ok',
      requiredLaborHours: 0,
      nettoMarge: 0,
    };
  }

  const stratProfile =
    strategy === 'in_house' ? restaurantProfile.inHouse : restaurantProfile.bottled;

  const requiredLaborHours =
    strategy === 'in_house'
      ? (restaurantProfile.inHouse.requiredLaborHoursPer100Covers * totalCovers) / 100
      : 0;

  const margin = calculateNettoMargePerGlas({
    sellingPrice: playerSetPrice,
    strategy,
    cogsPercent: stratProfile.cogsPercent,
    scheduledLaborHours,
    totalCovers,
    glassesPerCover: restaurantProfile.glassesPerCover,
    hourlyWage: restaurantProfile.hourlyWage,
    wasteMultiplier:
      strategy === 'in_house' ? restaurantProfile.inHouse.wasteMultiplier : 1.0,
  });

  const demand = calculateAttachAndChurn({
    currentPrice: playerSetPrice,
    defaultPrice: stratProfile.defaultPrice,
    plafondPrice: stratProfile.plafondPrice,
    baseAttachRate: stratProfile.baseAttachRate,
    baseChurnRate: stratProfile.baseChurnRate,
  });

  const trap = calculateValstrikImpact({
    strategy, scheduledLaborHours, requiredLaborHours, baseReviewScore,
  });

  const realisedMargePerGlas = margin.nettoMarge * trap.qualityImpactMultiplier;

  const monthlyNAProfit = Math.max(
    0,
    totalCovers
      * demand.effectiveAttachRate
      * restaurantProfile.glassesPerCover
      * demand.effectiveGlassesPerCoverMultiplier
      * realisedMargePerGlas,
  );

  return {
    monthlyNAProfit,
    effectiveAttachRate: demand.effectiveAttachRate,
    effectiveChurnRate: demand.effectiveChurnRate,
    realisedMargePerGlas,
    fatigueRate: trap.fatigueRate,
    reviewScoreDelta: trap.reviewScoreDelta,
    qualityImpactMultiplier: trap.qualityImpactMultiplier,
    warningLevel: trap.warningLevel,
    requiredLaborHours,
    nettoMarge: margin.nettoMarge,
  };
}

// "Do-nothing" reference: bottled at default price, 0 labor hours.
// Used by calcStep3 to compute incremental NA profit so baseline sales
// don't double-count toward gap recovery.
export function calculateNABaseline(params: {
  restaurantProfile: RestaurantNAProfile;
  totalCovers: number;
}): NAStrategyOutcome {
  return calculateNAStrategyOutcome({
    restaurantProfile: params.restaurantProfile,
    strategy: 'bottled',
    playerSetPrice: params.restaurantProfile.bottled.defaultPrice,
    scheduledLaborHours: 0,
    totalCovers: params.totalCovers,
  });
}
