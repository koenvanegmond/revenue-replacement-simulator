import { SimulatorState } from './types';
import { calcStep3 } from './calculations';
import {
  CardData,
  GameLevers,
  GAME_MARGINS,
  AGGRESSIVE_THRESHOLD,
  STAFF_PENALTY_PER_AGGRESSIVE,
  DEFAULT_LEVERS,
} from './game-types';

// Build the SimulatorState expected by the shared calculation engine
export function buildSimulatorState(card: CardData, levers: GameLevers): SimulatorState {
  return {
    step: 3,
    covers: card.covers,
    avgSpend: card.avgSpend,
    beverageShare: card.beverageShare,
    alcoholShare: card.alcoholShare,
    alcoholMargin: GAME_MARGINS.alcoholMargin,
    naMargin: GAME_MARGINS.naMargin,
    foodMargin: GAME_MARGINS.foodMargin,
    declineRate: card.declineRate,
    // Lever 1 — NA strategy
    restaurantId: levers.restaurantId,
    naStrategy: levers.naStrategy,
    naPlayerSetPrice: levers.naPlayerSetPrice,
    naScheduledLaborHours: levers.naScheduledLaborHours,
    // Lever 2 — menu engineering
    starPromotion: levers.starPromotion,
    plowhorseEngineering: levers.plowhorseEngineering,
    puzzleActivation: levers.puzzleActivation,
    dogReplacement: levers.dogReplacement,
    // Lever 3 — spend per table
    welcomeConversion: levers.welcomeConversion,
    welcomePrice: levers.welcomePrice,
    dessertAttachRate: levers.dessertAttachRate,
    coffeeAttachRate: levers.coffeeAttachRate,
  };
}

export interface GameScore {
  gap: number;
  totalInterventionProfit: number;
  penaltyCount: number;
  totalPenalty: number;
  netRecovery: number;
  recoveryPercent: number;
  aggressiveLevers: (keyof typeof AGGRESSIVE_THRESHOLD)[];
  // Per-lever breakdown
  naPairingProfit: number;
  naWarningLevel: 'ok' | 'stress' | 'critical';
  naEffectiveAttachRate: number;
  naEffectiveChurnRate: number;
  naReviewScoreDelta: number;
  starProfit: number;
  plowhorseProfit: number;
  puzzleProfit: number;
  additionalFoodProfit: number; // sum of the three sub-levers
  welcomeDrinkProfit: number;
  additionalDessertProfit: number;
  welcomePlusDesertProfit: number;
  coffeeProfit: number;
}

export function calcGameScore(card: CardData, levers: GameLevers): GameScore {
  const state = buildSimulatorState(card, levers);
  const results = calcStep3(state);

  const aggressiveLevers: (keyof typeof AGGRESSIVE_THRESHOLD)[] = [];
  (Object.keys(AGGRESSIVE_THRESHOLD) as (keyof typeof AGGRESSIVE_THRESHOLD)[]).forEach((key) => {
    if (levers[key] > AGGRESSIVE_THRESHOLD[key]) aggressiveLevers.push(key);
  });

  // Critical understaffing on in-house NA counts as an aggressive penalty —
  // it represents the operational risk of running a programme you can't sustain.
  let extraPenalties = 0;
  if (results.naWarningLevel === 'critical') extraPenalties += 1;

  const penaltyCount = aggressiveLevers.length + extraPenalties;
  const totalPenalty = penaltyCount * STAFF_PENALTY_PER_AGGRESSIVE;
  const netRecovery = Math.max(0, results.totalInterventionProfit - totalPenalty);
  const recoveryPercent = results.gap > 0 ? (netRecovery / results.gap) * 100 : 0;

  return {
    gap: results.gap,
    totalInterventionProfit: results.totalInterventionProfit,
    penaltyCount,
    totalPenalty,
    netRecovery,
    recoveryPercent,
    aggressiveLevers,
    naPairingProfit: results.naPairingProfit,
    naWarningLevel: results.naWarningLevel,
    naEffectiveAttachRate: results.naEffectiveAttachRate,
    naEffectiveChurnRate: results.naEffectiveChurnRate,
    naReviewScoreDelta: results.naReviewScoreDelta,
    starProfit: results.starProfit,
    plowhorseProfit: results.plowhorseProfit,
    puzzleProfit: results.puzzleProfit,
    additionalFoodProfit: results.additionalFoodProfit,
    welcomeDrinkProfit: results.welcomeDrinkProfit,
    additionalDessertProfit: results.additionalDessertProfit,
    welcomePlusDesertProfit: results.welcomeDrinkProfit + results.additionalDessertProfit,
    coffeeProfit: results.coffeeProfit,
  };
}

// ─── Per-lever feedback ────────────────────────────────────────────────────────

function isUnused(key: keyof typeof DEFAULT_LEVERS, levers: GameLevers): boolean {
  const def = DEFAULT_LEVERS[key];
  const cur = levers[key];
  if (typeof def !== 'number' || typeof cur !== 'number') return false;
  return Math.abs(cur - def) < 1;
}

export function getLeverFeedback(
  leverLabel: string,
  profit: number,
  totalProfit: number,
  isAggressive: boolean,
  unused: boolean,
): string {
  if (unused) return `You left ${leverLabel} mostly unused — a missed opportunity.`;
  if (isAggressive) return `Your ${leverLabel} was aggressive — possible in theory, hard in practice.`;
  const contribution = totalProfit > 0 ? (profit / totalProfit) * 100 : 0;
  if (contribution > 25) return `Your ${leverLabel} was realistic and effective — good choice.`;
  return `Your ${leverLabel} made a modest contribution to closing the gap.`;
}

export function getCoachingSummary(score: GameScore, levers: GameLevers): string {
  const { naPairingProfit, additionalFoodProfit, welcomePlusDesertProfit, aggressiveLevers, totalInterventionProfit } = score;

  if (totalInterventionProfit === 0) return 'None of the levers were activated — the gap remains wide open.';

  if (aggressiveLevers.length >= 3) {
    return 'You used many aggressive settings — the training penalties cost you points. Staying in the realistic zone scores better in practice.';
  }

  const total = naPairingProfit + additionalFoodProfit + welcomePlusDesertProfit;
  if (total === 0) return 'Try moving the sliders to see what combination works best.';

  const naPct = (naPairingProfit / total) * 100;
  const menuPct = (additionalFoodProfit / total) * 100;
  const upsellPct = (welcomePlusDesertProfit / total) * 100;

  const menu_unused =
    isUnused('starPromotion', levers) &&
    isUnused('plowhorseEngineering', levers) &&
    isUnused('puzzleActivation', levers);
  const upsell_unused = isUnused('welcomeConversion', levers) && isUnused('dessertAttachRate', levers);
  const na_weak = naPairingProfit < 500;

  if (na_weak && menu_unused) return 'You relied almost entirely on upselling. A stronger NA programme and menu engineering would have added more.';
  if (na_weak && upsell_unused) return 'Menu engineering alone is not enough. A premium NA programme could close most of the remaining gap.';
  if (menu_unused && upsell_unused) return 'NA pairing was your only lever. Menu engineering and dessert upsell are both quick wins worth activating.';

  if (naPct > 50) return 'You leaned heavily on NA pairing. In practice, combining all three levers creates more resilience.';
  if (menuPct > 50) return 'Menu engineering was your main strategy. Sustainable — but diversifying into NA pairings makes the model more robust.';
  if (upsellPct > 50) return 'You relied on upselling. Combined with a premium NA pairing, this approach is most resilient for the long term.';

  return 'A balanced approach — exactly what industry data suggests works best. All three levers contributing.';
}
