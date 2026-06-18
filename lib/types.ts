export type NAStrategy = 'bottled' | 'in_house';

export type NAStrategyProfile = {
  defaultPrice: number;
  plafondPrice: number;
  cogsPercent: number;
  baseAttachRate: number;   // 0-1
  baseChurnRate: number;    // 0-1
};

export type InHouseProfile = NAStrategyProfile & {
  available: boolean;
  requiredLaborHoursPer100Covers: number;
  wasteMultiplier: number;
};

export type RestaurantNAProfile = {
  id: string;
  glassesPerCover: number;
  hourlyWage: number;       // €/hour incl. employer costs
  bottled: NAStrategyProfile;
  inHouse: InHouseProfile;
};

export interface SimulatorState {
  step: 1 | 2 | 3;
  // Step 1 — current restaurant metrics
  covers: number;
  avgSpend: number;
  beverageShare: number;    // % of total revenue
  alcoholShare: number;     // % of beverage revenue that is alcohol
  alcoholMargin: number;    // gross margin %
  naMargin: number;         // gross margin %
  foodMargin: number;       // gross margin %
  // Step 2 — decline scenario
  declineRate: number;      // % drop in alcohol revenue by 2030
  // Step 3 — intervention levers
  // ─── Lever 1: NA strategy (make-or-buy + pricing elasticity) ────────────
  restaurantId: string;          // looks up RESTAURANT_NA_PROFILES
  naStrategy: NAStrategy;        // 'bottled' | 'in_house'
  naPlayerSetPrice: number;      // € per NA glass — player-set selling price
  naScheduledLaborHours: number; // hours/month allocated to NA production
  // ─── Lever 2: Menu engineering ───────────────────────────────────────────
  starPromotion: number;        // 0-100, aggressiveness of Star Promotion lever
  plowhorseEngineering: number; // 0-100, aggressiveness of Plowhorse Re-engineering lever
  puzzleActivation: number;     // 0-100, aggressiveness of Puzzle Activation lever
  dogReplacement: number;       // 0-100, % of Dogs replaced with high-margin alternative
  // ─── Lever 3: Spend per table ────────────────────────────────────────────
  welcomeConversion: number;    // % of guests ordering NA welcome drink
  welcomePrice: number;         // € price of welcome drink
  dessertAttachRate: number;    // pp increase in dessert attach due to moral licensing
  coffeeAttachRate: number;     // % of covers ordering coffee/tea post-meal
}

export type SimulatorAction =
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 }
  | { type: 'UPDATE'; field: Exclude<keyof SimulatorState, 'step'>; value: SimulatorState[Exclude<keyof SimulatorState, 'step'>] };

export interface Step1Results {
  monthlyRevenue: number;
  foodRevenue: number;
  alcoholRevenue: number;
  naRevenue: number;
  foodProfit: number;
  alcoholProfit: number;
  naProfit: number;
  totalGrossProfit: number;
  beverageProfitShare: number; // % of gross profit from beverages
}

export interface Step2Results extends Step1Results {
  lostAlcoholRevenue: number;
  lostGrossProfit: number;
  newTotalGrossProfit: number;
  gap: number;
}

export interface Step3Results extends Step2Results {
  // Lever 1 — NA strategy
  naPairingProfit: number;                  // = naIncrementalProfit; feeds totals
  naMonthlyProfit: number;                  // full NA profit under chosen strategy
  naBaselineProfit: number;                 // "do-nothing" bottled-at-default reference
  naIncrementalProfit: number;              // monthly - baseline, clamped at 0
  naEffectiveAttachRate: number;
  naEffectiveChurnRate: number;
  naRealisedMargePerGlas: number;
  naFatigueRate: number;
  naReviewScoreDelta: number;
  naQualityImpactMultiplier: number;
  naWarningLevel: 'ok' | 'stress' | 'critical';
  naRequiredLaborHours: number;
  // Lever 2 — menu engineering
  starProfit: number;
  plowhorseProfit: number;
  puzzleProfit: number;
  dogProfit: number;
  totalMarginUpliftPP: number;
  additionalFoodProfit: number;
  // Lever 3 — spend per table
  welcomeDrinkRevenue: number;
  welcomeDrinkProfit: number;
  additionalDessertRevenue: number;
  additionalDessertProfit: number;
  coffeeRevenue: number;
  coffeeProfit: number;
  // Totals
  totalInterventionProfit: number;
  finalGrossProfit: number;
  gapRecoveryPercent: number;
}
