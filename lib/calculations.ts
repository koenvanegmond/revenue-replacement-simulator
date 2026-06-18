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

  // Lever 1 — Premium NA pairing
  // Non-drinking covers = proportion of guests who have shifted away from alcohol by 2030
  const nonDrinkingCovers = s.covers * (s.declineRate / 100);
  const naPairingRevenue = nonDrinkingCovers * (s.naAttachRate / 100) * s.naPairingPrice;
  const naPairingProfit = naPairingRevenue * (s.naPairingMargin / 100);

  // Lever 2 — Menu engineering (Kasavana & Smith 1982; Morrison 1996)
  // Strategic placement of Stars/Plowhorses lifts average food margin by `foodMarginUplift` pp
  const additionalFoodProfit = step2.foodRevenue * (s.foodMarginUplift / 100);

  // Lever 3 — Upsell: welcome drink + dessert attach
  // Moral licensing effect (Prinsen et al. 2018): choosing NA earlier licenses a small indulgence
  const welcomeDrinkRevenue = s.covers * (s.welcomeConversion / 100) * s.welcomePrice;
  const welcomeDrinkProfit = welcomeDrinkRevenue * 0.75; // assume 75% margin on welcome drinks

  // Dessert: average €12 plate, 75% gross margin
  const additionalDessertRevenue = s.covers * (s.dessertAttachRate / 100) * 12;
  const additionalDessertProfit = additionalDessertRevenue * 0.75;

  const totalInterventionProfit =
    naPairingProfit + additionalFoodProfit + welcomeDrinkProfit + additionalDessertProfit;

  const finalGrossProfit = step2.newTotalGrossProfit + totalInterventionProfit;

  // Gap recovery as a percentage of lost gross profit
  const gapRecoveryPercent =
    step2.gap > 0 ? (totalInterventionProfit / step2.gap) * 100 : 0;

  return {
    ...step2,
    nonDrinkingCovers,
    naPairingRevenue,
    naPairingProfit,
    additionalFoodProfit,
    welcomeDrinkRevenue,
    welcomeDrinkProfit,
    additionalDessertRevenue,
    additionalDessertProfit,
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
