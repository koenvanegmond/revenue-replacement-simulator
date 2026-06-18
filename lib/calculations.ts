import { SimulatorState, Step1Results, Step2Results, Step3Results } from './types';
import { getRestaurantNAProfile } from './restaurant-na-profiles';
import { calculateNAStrategyOutcome, calculateNABaseline } from './na-strategy-engine';

// ─── Step 1: Baseline financials ─────────────────────────────────────────────

export function calcStep1(s: SimulatorState): Step1Results {
  const monthlyRevenue = s.covers * s.avgSpend;

  const beverageRevenue = monthlyRevenue * (s.beverageShare / 100);
  const alcoholRevenue = beverageRevenue * (s.alcoholShare / 100);
  const naRevenue = beverageRevenue * (1 - s.alcoholShare / 100);
  const foodRevenue = monthlyRevenue * (1 - s.beverageShare / 100);

  const alcoholProfit = alcoholRevenue * (s.alcoholMargin / 100);
  const naProfit = naRevenue * (s.naMargin / 100);
  const foodProfit = foodRevenue * (s.foodMargin / 100);
  const totalGrossProfit = alcoholProfit + naProfit + foodProfit;

  // The "Silent Grant": alcohol's high margin means beverages punch above their revenue weight
  const beverageProfitShare =
    totalGrossProfit > 0 ? ((alcoholProfit + naProfit) / totalGrossProfit) * 100 : 0;

  return {
    monthlyRevenue,
    foodRevenue,
    alcoholRevenue,
    naRevenue,
    foodProfit,
    alcoholProfit,
    naProfit,
    totalGrossProfit,
    beverageProfitShare,
  };
}

// ─── Step 2: 2030 decline scenario ───────────────────────────────────────────

export function calcStep2(s: SimulatorState): Step2Results {
  const step1 = calcStep1(s);

  // CBS/IWSR trend data: Dutch alcohol volume declining ~2–3% p.a., structurally
  const lostAlcoholRevenue = step1.alcoholRevenue * (s.declineRate / 100);
  const lostGrossProfit = lostAlcoholRevenue * (s.alcoholMargin / 100);
  const newTotalGrossProfit = step1.totalGrossProfit - lostGrossProfit;
  const gap = lostGrossProfit; // the profit gap that must be closed

  return { ...step1, lostAlcoholRevenue, lostGrossProfit, newTotalGrossProfit, gap };
}

// ─── Step 3: Three intervention levers ───────────────────────────────────────

export function calcStep3(s: SimulatorState): Step3Results {
  const step2 = calcStep2(s);

  // ─── Lever 1 — NA Strategy (Bottled vs In-house) ─────────────────────────
  // NA pairing is a REPLACEMENT product for guests who shifted away from
  // alcohol — not a product sold to the full cover population. So the engine
  // is fed the shifted covers (totalCovers × declineRate), not s.covers.
  // baseAttachRate is calibrated as "% of the shifted target group", per
  // thesis §2.4.
  const shiftedCovers = s.covers * (s.declineRate / 100);
  const naProfile = getRestaurantNAProfile(s.restaurantId);
  const naOutcome = calculateNAStrategyOutcome({
    restaurantProfile: naProfile,
    strategy: s.naStrategy,
    playerSetPrice: s.naPlayerSetPrice,
    scheduledLaborHours: s.naScheduledLaborHours,
    totalCovers: shiftedCovers,
  });
  const naBaseline = calculateNABaseline({
    restaurantProfile: naProfile,
    totalCovers: shiftedCovers,
  });
  const naBaselineProfit = naBaseline.monthlyNAProfit;
  const naIncrementalProfit = Math.max(0, naOutcome.monthlyNAProfit - naBaselineProfit);
  const naPairingProfit = naIncrementalProfit;

  // ─── Lever 2 — Menu engineering (Kasavana & Smith 1982; Morrison 1996) ─────
  // Three sub-levers. Costs are expressed as a share of food revenue so they
  // scale with the size of the restaurant, and penalty curves use high
  // exponents so they only bite hard at aggressive (>70%) settings.

  // 2a. Star Promotion — visual hierarchy + suggestive selling on bestsellers.
  const starAgg = s.starPromotion / 100;
  const starUpliftPP = starAgg * 0.35;
  const starGross = step2.foodRevenue * (starUpliftPP / 100);
  const starTraining = step2.foodRevenue * starAgg * 0.001;
  const starFatigue = Math.pow(starAgg, 3) * 180;
  const starProfit = Math.max(0, starGross - starTraining - starFatigue);

  // 2b. Plowhorse Re-engineering — recipe redesign + sourcing optimisation.
  const plowAgg = s.plowhorseEngineering / 100;
  const plowUpliftPP = plowAgg * 0.8;
  const plowGross = step2.foodRevenue * (plowUpliftPP / 100);
  const plowDesign = step2.foodRevenue * plowAgg * 0.0015;
  const plowQuality = step2.foodRevenue * Math.pow(plowAgg, 1.8) * 0.055;
  const plowhorseProfit = plowGross - plowDesign - plowQuality;

  // 2c. Puzzle Activation — storytelling + FOH coaching on high-margin/low-volume items.
  const puzzleAgg = s.puzzleActivation / 100;
  const puzzleUpliftPP = puzzleAgg * 0.55;
  const puzzleGross = step2.foodRevenue * (puzzleUpliftPP / 100);
  const puzzleFOH = step2.foodRevenue * puzzleAgg * 0.001;
  const puzzleComplexity = Math.pow(puzzleAgg, 1.8) * 950;
  const puzzleProfit = puzzleGross - puzzleFOH - puzzleComplexity;

  // 2d. Dog Replacement — one-shot menu redesign, linear logic by design.
  // Not a continuous optimisation slider: replacing weak items is a single
  // editorial decision, so the cost/benefit profile stays flat.
  const dogReplacementRatio = s.dogReplacement / 100;
  const dogRevenueAffected = step2.foodRevenue * 0.04 * dogReplacementRatio;
  const dogMarginGainPP = 25;
  const dogReplacementCost = dogReplacementRatio * (s.covers * 0.35);
  const dogProfit = Math.max(
    0,
    (dogRevenueAffected * dogMarginGainPP) / 100 - dogReplacementCost,
  );

  const additionalFoodProfit = starProfit + plowhorseProfit + puzzleProfit + dogProfit;
  const totalMarginUpliftPP =
    step2.foodRevenue > 0
      ? (additionalFoodProfit / step2.foodRevenue) * 100 + dogReplacementRatio * 1.0
      : 0;

  // ─── Lever 3 — Upsell: welcome drink + dessert attach ──────────────────────
  // Moral licensing (Prinsen et al. 2018): the virtuous NA choice licenses indulgence.
  const welcomeDrinkRevenue = s.covers * (s.welcomeConversion / 100) * s.welcomePrice;
  const welcomeGross = welcomeDrinkRevenue * 0.75;
  const welcomeRatio = s.welcomeConversion / 100;
  const welcomeMarketing =
    welcomeRatio * welcomeDrinkRevenue * 0.20 +
    Math.pow(welcomeRatio, 2) * welcomeDrinkRevenue * 0.30;
  const welcomeDrinkProfit = welcomeGross - welcomeMarketing;

  // Dessert: average €12 plate, 75% gross margin.
  const additionalDessertRevenue = s.covers * (s.dessertAttachRate / 100) * 12;
  const dessertGross = additionalDessertRevenue * 0.75;
  const dessertMarketing = (s.dessertAttachRate / 100) * 150;
  const dessertLabor = (s.dessertAttachRate / 100) * 100;
  const dessertRatio = s.dessertAttachRate / 100;
  const dessertSeatTime = Math.pow(dessertRatio, 1.4) * additionalDessertRevenue * 1.6;
  const additionalDessertProfit =
    dessertGross - dessertMarketing - dessertLabor - dessertSeatTime;

  // ─── Lever 3c — Coffee / Tea Service ───────────────────────────────────────
  const coffeePrice = 4.5;
  const coffeeMargin = 0.55;
  const coffeeRatio = s.coffeeAttachRate / 100;
  const coffeeRevenue = s.covers * coffeeRatio * coffeePrice;
  const coffeeSeatTimeCost =
    Math.pow(Math.max(0, coffeeRatio - 0.25), 1.6) * coffeeRevenue * 0.90;
  const coffeeProfit = Math.max(0, coffeeRevenue * coffeeMargin - coffeeSeatTimeCost);

  const totalInterventionProfit =
    naPairingProfit +
    additionalFoodProfit +
    welcomeDrinkProfit +
    additionalDessertProfit +
    coffeeProfit;

  const finalGrossProfit = step2.newTotalGrossProfit + totalInterventionProfit;

  const gapRecoveryPercent =
    step2.gap > 0 ? (totalInterventionProfit / step2.gap) * 100 : 0;

  return {
    ...step2,
    // Lever 1
    naPairingProfit,
    naMonthlyProfit: naOutcome.monthlyNAProfit,
    naBaselineProfit,
    naIncrementalProfit,
    naEffectiveAttachRate: naOutcome.effectiveAttachRate,
    naEffectiveChurnRate: naOutcome.effectiveChurnRate,
    naRealisedMargePerGlas: naOutcome.realisedMargePerGlas,
    naFatigueRate: naOutcome.fatigueRate,
    naReviewScoreDelta: naOutcome.reviewScoreDelta,
    naQualityImpactMultiplier: naOutcome.qualityImpactMultiplier,
    naWarningLevel: naOutcome.warningLevel,
    naRequiredLaborHours: naOutcome.requiredLaborHours,
    // Lever 2
    starProfit,
    plowhorseProfit,
    puzzleProfit,
    dogProfit,
    totalMarginUpliftPP,
    additionalFoodProfit,
    // Lever 3
    welcomeDrinkRevenue,
    welcomeDrinkProfit,
    additionalDessertRevenue,
    additionalDessertProfit,
    coffeeRevenue,
    coffeeProfit,
    // Totals
    totalInterventionProfit,
    finalGrossProfit,
    gapRecoveryPercent,
  };
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function fmt(n: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}
