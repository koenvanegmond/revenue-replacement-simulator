export type MenuItem = {
  name: string;
  price: number;
  marginPercent: number;
  ordersPerMonth: number;
  category: 'Star' | 'Plowhorse' | 'Puzzle';
};

export type RestaurantNarrative = {
  id: string;
  story: string;
  challenge: string;
  menu: MenuItem[];
};

// Keyed by the same id used in lib/game-types.ts RESTAURANTS array.
export const RESTAURANT_DATA: Record<string, RestaurantNarrative> = {
  'le-bistro': {
    id: 'le-bistro',
    story:
      'A 60-seat neighborhood favorite with a respected wine list. Tables share bottles, the bar carries 30% of revenue, and your sommelier knows every regular by name. The model has worked for years.',
    challenge:
      'By 2030, 20% fewer of your guests will drink alcohol. The wine spend per cover that quietly carried your food margin is structurally eroding. Where does the lost profit come back from?',
    menu: [
      { name: 'Steak Frites', price: 32, marginPercent: 68, ordersPerMonth: 110, category: 'Star' },
      { name: 'Truffle Risotto', price: 28, marginPercent: 72, ordersPerMonth: 95, category: 'Star' },
      { name: 'Caesar Salad', price: 18, marginPercent: 45, ordersPerMonth: 140, category: 'Plowhorse' },
      { name: 'House Burger', price: 22, marginPercent: 48, ordersPerMonth: 130, category: 'Plowhorse' },
      { name: 'Sea Bass Carpaccio', price: 26, marginPercent: 75, ordersPerMonth: 35, category: 'Puzzle' },
      { name: 'Duck Confit', price: 34, marginPercent: 70, ordersPerMonth: 40, category: 'Puzzle' },
    ],
  },
  'maison-elegante': {
    id: 'maison-elegante',
    story:
      'A high-end gastronomic destination. Average ticket €120 per person, 40% of revenue on beverage, 85% of that on alcohol. Your six-course wine pairing arrangements are central to the experience and to the P&L.',
    challenge:
      'By 2030, 25% of your future guests will skip the wine pairing. That is the highest-margin product in your house quietly walking out the door. Replacing it is the entire challenge.',
    menu: [
      { name: 'Wagyu Tartare', price: 48, marginPercent: 70, ordersPerMonth: 75, category: 'Star' },
      { name: 'Lobster Thermidor', price: 72, marginPercent: 65, ordersPerMonth: 70, category: 'Star' },
      { name: 'Roast Chicken Suprême', price: 42, marginPercent: 50, ordersPerMonth: 95, category: 'Plowhorse' },
      { name: 'Truffle Tagliatelle', price: 38, marginPercent: 48, ordersPerMonth: 85, category: 'Plowhorse' },
      { name: 'Caviar Service', price: 95, marginPercent: 78, ordersPerMonth: 20, category: 'Puzzle' },
      { name: 'Aged Beef Côte', price: 85, marginPercent: 72, ordersPerMonth: 28, category: 'Puzzle' },
    ],
  },
  'harbour-co': {
    id: 'harbour-co',
    story:
      'An 800-cover seafood-driven kitchen on the waterfront. Strong walk-in volume, a confident wine program, and a kitchen that lives by absolute contribution margin in euros, not percentages. The wine carries the night.',
    challenge:
      "By 2030, 25% fewer guests will order wine with their fish. Your sommelier's hardest job stops being upselling vintages and starts being justifying a €30 NA pairing. Can you make that shift work?",
    menu: [
      { name: 'Bouillabaisse Royale', price: 38, marginPercent: 65, ordersPerMonth: 140, category: 'Star' },
      { name: 'Mussels Marinière', price: 26, marginPercent: 70, ordersPerMonth: 165, category: 'Star' },
      { name: 'Tuna Steak', price: 34, marginPercent: 48, ordersPerMonth: 180, category: 'Plowhorse' },
      { name: 'Salmon Risotto', price: 28, marginPercent: 50, ordersPerMonth: 170, category: 'Plowhorse' },
      { name: 'Oyster Platter', price: 38, marginPercent: 72, ordersPerMonth: 45, category: 'Puzzle' },
      { name: 'Seafood Boil', price: 48, marginPercent: 68, ordersPerMonth: 38, category: 'Puzzle' },
    ],
  },
  stadshotel: {
    id: 'stadshotel',
    story:
      'A hotel restaurant with 1,200 covers per month. Mixed crowd: hotel guests, business lunches, occasion diners. The wine list is broad rather than deep, and the bar contributes meaningfully to room profitability.',
    challenge:
      'By 2030, 30% fewer of your guests will drink alcohol — the largest decline in the field. Business travellers in particular are leading the shift. Hotel breakfast covers the bills, but evening profitability is at risk.',
    menu: [
      { name: 'Schnitzel Holstein', price: 36, marginPercent: 68, ordersPerMonth: 210, category: 'Star' },
      { name: 'Beef Stroganoff', price: 34, marginPercent: 65, ordersPerMonth: 195, category: 'Star' },
      { name: 'Club Sandwich', price: 19, marginPercent: 45, ordersPerMonth: 280, category: 'Plowhorse' },
      { name: 'Chicken Curry', price: 26, marginPercent: 48, ordersPerMonth: 240, category: 'Plowhorse' },
      { name: 'Lamb Rack', price: 48, marginPercent: 72, ordersPerMonth: 55, category: 'Puzzle' },
      { name: 'Truffle Pasta', price: 42, marginPercent: 70, ordersPerMonth: 60, category: 'Puzzle' },
    ],
  },
  'atelier-noord': {
    id: 'atelier-noord',
    story:
      'A fine-dining concept restaurant with an open kitchen and a strong product story. Average ticket €95. Loyal regulars, a confident NA experimentation streak from the bar, and a chef who already pushes guests beyond their comfort zone.',
    challenge:
      'By 2030, 22% fewer guests order alcohol — but your existing NA experimentation gives you a head start. The question is whether you can turn that head start into actual replaced euros, not just brand goodwill.',
    menu: [
      { name: 'Confit Duck Leg', price: 42, marginPercent: 68, ordersPerMonth: 90, category: 'Star' },
      { name: 'Bavette Steak', price: 38, marginPercent: 67, ordersPerMonth: 85, category: 'Star' },
      { name: 'Burrata Salad', price: 18, marginPercent: 42, ordersPerMonth: 130, category: 'Plowhorse' },
      { name: 'Pizza Tartufo', price: 28, marginPercent: 50, ordersPerMonth: 115, category: 'Plowhorse' },
      { name: 'Octopus Tataki', price: 36, marginPercent: 72, ordersPerMonth: 30, category: 'Puzzle' },
      { name: 'Foie Gras Terrine', price: 44, marginPercent: 75, ordersPerMonth: 25, category: 'Puzzle' },
    ],
  },
};
