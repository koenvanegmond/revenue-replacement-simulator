import { SimulatorState, Step1Results, Step2Results, Step3Results } from './types';

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

  // ─── Lever 1 — Premium NA pairing ──────────────────────────────────────────
  // Non-drinking covers = guests who have shifted away from alcohol by 2030.
  const nonDrinkingCovers = s.covers * (s.declineRate / 100);
  const naRatio = s.naAttachRate / 100;
  const naPairingRevenue = nonDrinkingCovers * naRatio * s.naPairingPrice;
  const naPairingGross = naPairingRevenue * (s.naPairingMargin / 100);
  // Wastage rises non-linearly: above ~50% attach, perishable pairings get
  // opened for tables that don't finish them.
  const naWastage = Math.pow(naRatio, 1.3) * 12 * nonDrinkingCovers * 0.5;
  // Sommelier / staff training scaled to the size of the programme (15% of gross),
  // so it can't exceed the revenue it depends on.
  const naTraining = naPairingGross * 0.15;
  const naPairingProfit = naPairingGross - naWastage - naTraining;

  // ─── Lever 2 — Menu engineering (Kasavana & Smith 1982; Morrison 1996) ─────
  // Three sub-levers. Costs are expressed as a share of food revenue so they
  // scale with the size of the restaurant, and penalty curves use high
  // exponents so they only bite hard at aggressive (>70%) settings.

  // 2a. Star Promotion — visual hierarchy + suggestive selling on bestsellers.
  const starAgg = s.starPromotion / 100;
  const starUpliftPP = starAgg * 1.5;
  const starGross = step2.foodRevenue * (starUpliftPP / 100);
  const starTraining = step2.foodRevenue * starAgg * 0.001;
  const starFatigue = step2.foodRevenue * Math.pow(starAgg, 2.5) * 0.015; // bites at high agg
  const starProfit = starGross - starTraining - starFatigue;

  // 2b. Plowhorse Re-engineering — recipe redesign + sourcing optimisation.
  // Biggest headroom (3pp ceiling) because Plowhorses sell volume; quality risk
  // bites earlier than fatigue does on Stars.
  const plowAgg = s.plowhorseEngineering / 100;
  const plowUpliftPP = plowAgg * 3.0;
  const plowGross = step2.foodRevenue * (plowUpliftPP / 100);
  const plowDesign = step2.foodRevenue * plowAgg * 0.0015;
  const plowQuality = step2.foodRevenue * Math.pow(plowAgg, 2.2) * 0.025;
  const plowhorseProfit = plowGross - plowDesign - plowQuality;

  // 2c. Puzzle Activation — storytelling + FOH coaching on high-margin/low-volume items.
  const puzzleAgg = s.puzzleActivation / 100;
  const puzzleUpliftPP = puzzleAgg * 2.0;
  const puzzleGross = step2.foodRevenue * (puzzleUpliftPP / 100);
  const puzzleFOH = step2.foodRevenue * puzzleAgg * 0.001;
  const puzzleComplexity = step2.foodRevenue * Math.pow(puzzleAgg, 2.0) * 0.012;
  const puzzleProfit = puzzleGross - puzzleFOH - puzzleComplexity;

  // Net effective margin uplift in pp (after costs), expressed against food revenue.
  const additionalFoodProfit = starProfit + plowhorseProfit + puzzleProfit;
  const totalMarginUpliftPP =
    step2.foodRevenue > 0 ? (additionalFoodProfit / step2.foodRevenue) * 100 : 0;

  // ─── Lever 3 — Upsell: welcome drink + dessert attach ──────────────────────
  // Moral licensing (Prinsen et al. 2018): the virtuous NA choice licenses indulgence.
  const welcomeDrinkRevenue = s.covers * (s.welcomeConversion / 100) * s.welcomePrice;
  const welcomeGross = welcomeDrinkRevenue * 0.75;
  const welcomeMarketing = (s.welcomeConversion / 100) * 200;
  const welcomeDrinkProfit = welcomeGross - welcomeMarketing;

  // Dessert: average €12 plate, 75% gross margin.
  const additionalDessertRevenue = s.covers * (s.dessertAttachRate / 100) * 12;
  const dessertGross = additionalDessertRevenue * 0.75;
  const dessertMarketing = (s.dessertAttachRate / 100) * 150;
  const dessertLabor = (s.dessertAttachRate / 100) * 100;
  // Seat-time opportunity cost: extra dessert course slows turnover at high attach.
  const dessertSeatTime = Math.pow(s.dessertAttachRate / 10, 1.2) * 80;
  const additionalDessertProfit =
    dessertGross - dessertMarketing - dessertLabor - dessertSeatTime;

  // ─── Lever 3c — Coffee / Tea Service ───────────────────────────────────────
  // Post-meal espresso/tea is the highest-margin category in the house (~90%).
  // Light seat-time friction only kicks in above ~70% attach.
  const coffeePrice = 4.5;
  const coffeeMargin = 0.9;
  const coffeeRatio = s.coffeeAttachRate / 100;
  const coffeeRevenue = s.covers * coffeeRatio * coffeePrice;
  const coffeeSeatTimeCost =
    Math.pow(Math.max(0, coffeeRatio - 0.7), 2) * coffeeRevenue * 0.3;
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
    nonDrinkingCovers,
    naPairingRevenue,
    naPairingProfit,
    starProfit,
    plowhorseProfit,
    puzzleProfit,
    totalMarginUpliftPP,
    additionalFoodProfit,
    welcomeDrinkRevenue,
    welcomeDrinkProfit,
    additionalDessertRevenue,
    additionalDessertProfit,
    coffeeRevenue,
    coffeeProfit,
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
