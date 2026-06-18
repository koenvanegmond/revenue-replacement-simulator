# Revenue Replacement Simulator

A web-based financial simulator built as the central deliverable for a Hotelschool The Hague graduation thesis investigating how Dutch fine-dining restaurants can remain financially feasible as high-margin alcohol revenue structurally declines.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- No backend, no database — all state is in-browser

## Run locally

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

```bash
# Option A: Vercel CLI
npm i -g vercel
vercel

# Option B: Push to GitHub, then import the repo at vercel.com
```

No environment variables are required — the app is fully client-side.

## Project structure

```
revenue-simulator/
├── app/
│   ├── globals.css       # Global styles + custom range slider CSS
│   ├── layout.tsx        # Root layout (fonts, metadata)
│   └── page.tsx          # Main page — useReducer state + step navigation
├── components/
│   ├── InfoBox.tsx       # "Why this matters" educational callout
│   ├── NumberInput.tsx   # Labeled number input with prefix/suffix
│   ├── Results.tsx       # Bar chart + lever breakdown + verdict
│   ├── Slider.tsx        # Labeled range slider with gradient track
│   ├── Step1.tsx         # Current situation inputs & breakdown
│   ├── Step2.tsx         # 2030 decline scenario
│   └── Step3.tsx         # Three intervention levers + live results
└── lib/
    ├── calculations.ts   # All financial formulas (documented)
    └── types.ts          # TypeScript interfaces
```

## Financial model

All formulas are in [`lib/calculations.ts`](lib/calculations.ts).

### Step 1 — Baseline
```
Monthly revenue         = covers × avg spend
Beverage revenue        = monthly revenue × beverage share
Alcohol revenue         = beverage revenue × alcohol share
NA revenue              = beverage revenue × (1 − alcohol share)
Food revenue            = monthly revenue × (1 − beverage share)
Gross profit per cat.   = revenue × margin
Beverage profit share   = (alcohol profit + NA profit) / total gross profit
```

### Step 2 — 2030 decline
```
Lost alcohol revenue  = alcohol revenue × decline rate
Lost gross profit     = lost alcohol revenue × alcohol margin
Gap                   = lost gross profit
```

### Step 3 — Interventions
```
Lever 1 (NA Pairing):
  Non-drinking covers   = covers × decline rate
  NA pairing revenue    = non-drinking covers × attach rate × pairing price
  NA pairing profit     = NA pairing revenue × pairing margin

Lever 2 (Menu Engineering):
  Additional food profit = food revenue × margin uplift (pp)

Lever 3 (Upsell):
  Welcome drink revenue = covers × conversion rate × welcome price
  Welcome drink profit  = welcome drink revenue × 75%
  Dessert revenue       = covers × dessert attach increase × €12
  Dessert profit        = dessert revenue × 75%
```

## Academic references

- CBS (2024). *Gezondheidsenquête/Leefstijlmonitor.*
- IWSR (2024). *Drinks Market Analysis — Netherlands.*
- Kasavana, M. L., & Smith, D. I. (1982). *Menu Engineering.* Hospitality Publications.
- Morrison, P. (1996). Menu engineering in upscale restaurants. *International Journal of Contemporary Hospitality Management.*
- Prinsen, S., de Ridder, D. T. D., & de Vet, E. (2013). Moral licensing: A systematic review. *Psychological Bulletin.*
