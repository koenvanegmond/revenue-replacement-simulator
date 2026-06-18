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
  naAttachRate: number;       // % of non-drinking guests who order NA pairing
  naPairingPrice: number;     // € price per pairing
  naPairingMargin: number;    // gross margin %
  starPromotion: number;      // 0-100, aggressiveness of Star Promotion lever
  plowhorseEngineering: number; // 0-100, aggressiveness of Plowhorse Re-engineering lever
  puzzleActivation: number;   // 0-100, aggressiveness of Puzzle Activation lever
  welcomeConversion: number;  // % of guests ordering NA welcome drink
  welcomePrice: number;       // € price of welcome drink
  dessertAttachRate: number;  // pp increase in dessert attach due to moral licensing
  coffeeAttachRate: number;   // % of covers ordering coffee/tea post-meal
}

export type SimulatorAction =
  | { type: 'SET_STEP'; payload: 1 | 2 | 3 }
  | { type: 'UPDATE'; field: keyof Omit<SimulatorState, 'step'>; value: number };

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
  nonDrinkingCovers: number;
  naPairingRevenue: number;
  naPairingProfit: number;
  starProfit: number;
  plowhorseProfit: number;
  puzzleProfit: number;
  totalMarginUpliftPP: number;
  additionalFoodProfit: number;
  welcomeDrinkRevenue: number;
  welcomeDrinkProfit: number;
  additionalDessertRevenue: number;
  additionalDessertProfit: number;
  coffeeRevenue: number;
  coffeeProfit: number;
  totalInterventionProfit: number;
  finalGrossProfit: number;
  gapRecoveryPercent: number;
}
