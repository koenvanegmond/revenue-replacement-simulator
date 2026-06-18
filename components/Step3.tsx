'use client';

import { SimulatorState, SimulatorAction, Step3Results } from '@/lib/types';
import { fmt } from '@/lib/calculations';
import { Slider } from './Slider';
import { InfoBox } from './InfoBox';
import { Results } from './Results';

interface Props {
  state: SimulatorState;
  dispatch: React.Dispatch<SimulatorAction>;
  results: Step3Results;
}

function LeverCard({
  number,
  title,
  subtitle,
  profit,
  children,
}: {
  number: string;
  title: string;
  subtitle: string;
  profit: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#E8E3DC] bg-white p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1B3A2D] text-xs font-bold text-white">
              {number}
            </span>
            <h4 className="font-serif text-base font-semibold text-[#1B3A2D]">{title}</h4>
          </div>
          <p className="text-xs text-[#7A7A7A]">{subtitle}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-[#8A8A8A]">adds</p>
          <p className="stat-number text-lg font-bold text-[#2E7D5A]">{fmt(profit)}</p>
          <p className="text-xs text-[#9A9A9A]">/ month</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function Step3({ state, dispatch, results }: Props) {
  const upd = (field: keyof Omit<SimulatorState, 'step'>) => (value: number) =>
    dispatch({ type: 'UPDATE', field, value });

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── LEFT: Lever controls ── */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 font-serif text-xl font-semibold text-[#1B3A2D]">
              Configure Interventions
            </h3>
            <p className="text-sm text-[#6A6A6A]">
              Adjust each lever to model the combined effect of your strategy.
            </p>
          </div>

          {/* Lever 1: NA Pairing */}
          <LeverCard
            number="1"
            title="Premium NA Pairing"
            subtitle={`Based on ${Math.round(results.nonDrinkingCovers)} non-drinking covers/month`}
            profit={results.naPairingProfit}
          >
            <Slider
              label="Attach rate (of non-drinking guests)"
              value={state.naAttachRate}
              min={0}
              max={80}
              unit="%"
              onChange={upd('naAttachRate')}
              description="Share of guests not ordering alcohol who take a curated NA pairing"
            />
            <p className="mb-4 -mt-2 text-xs italic text-[#9A9A9A]">
              Industry benchmark: 10–20% typical, 30%+ best in class (World of Nix, 2026)
            </p>
            <Slider
              label="Pairing price"
              value={state.naPairingPrice}
              min={15}
              max={60}
              unit="€"
              onChange={upd('naPairingPrice')}
              description="Price of the full NA pairing (e.g. 3-course with premium juices, kombucha, shrubs)"
            />
            <p className="mb-4 -mt-2 text-xs italic text-[#9A9A9A]">
              Benchmark: €20–30 typical for premium NA pairings (World of Nix, 2026)
            </p>
            <Slider
              label="NA pairing gross margin"
              value={state.naPairingMargin}
              min={50}
              max={80}
              unit="%"
              onChange={upd('naPairingMargin')}
            />
            <p className="mb-1 -mt-2 text-xs italic text-[#9A9A9A]">
              Benchmark: 60–70% (Harpoon interview, 2026)
            </p>
          </LeverCard>

          {/* Lever 2: Menu Engineering */}
          <LeverCard
            number="2"
            title="Menu Engineering Uplift"
            subtitle="Kasavana & Smith (1982) + Morrison (1996) framework"
            profit={results.additionalFoodProfit}
          >
            <Slider
              label="Food margin improvement"
              value={state.foodMarginUplift}
              min={0}
              max={10}
              unit=" pp"
              onChange={upd('foodMarginUplift')}
              description="Percentage-point gain in average food gross margin from repositioning Stars and Plowhorses, reducing comping, and renegotiating supplier costs"
            />
            <p className="mb-3 -mt-2 text-xs italic text-[#9A9A9A]">
              Benchmark: 1–3pp realistic, 5pp+ aggressive (Morrison, 1996)
            </p>
            <div className="rounded bg-[#F5F0E8] px-3 py-2 text-xs text-[#6A5A40]">
              Current food margin: <strong>{state.foodMargin}%</strong> → New margin:{' '}
              <strong>{state.foodMargin + state.foodMarginUplift}%</strong>
            </div>
          </LeverCard>

          {/* Lever 3: Upsell */}
          <LeverCard
            number="3"
            title="Welcome Drink + Dessert Attach"
            subtitle="Moral licensing effect — Prinsen et al. (2018)"
            profit={results.welcomeDrinkProfit + results.additionalDessertProfit}
          >
            <Slider
              label="Welcome drink conversion"
              value={state.welcomeConversion}
              min={0}
              max={100}
              unit="%"
              onChange={upd('welcomeConversion')}
              description="Share of guests who order a NA welcome drink at table arrival"
            />
            <p className="mb-4 -mt-2 text-xs italic text-[#9A9A9A]">
              Benchmark: 15–30% typical (Harpoon interview, 2026)
            </p>
            <Slider
              label="Welcome drink price"
              value={state.welcomePrice}
              min={4}
              max={15}
              unit="€"
              onChange={upd('welcomePrice')}
            />
            <Slider
              label="Dessert attach rate increase"
              value={state.dessertAttachRate}
              min={0}
              max={15}
              unit=" pp"
              onChange={upd('dessertAttachRate')}
              description="Extra percentage points of guests ordering dessert due to moral licensing after an NA choice (avg €12 dessert, 75% margin)"
            />
            <p className="mb-1 -mt-2 text-xs italic text-[#9A9A9A]">
              Benchmark: 1–3pp realistic, based on moral licensing effect (Prinsen et al., 2018)
            </p>
          </LeverCard>

          <InfoBox title="Why these three levers work together">
            <p className="mb-2">
              <strong>Menu engineering</strong> (Kasavana & Smith 1982; Morrison 1996) uses
              contribution margin analysis to redesign the menu so high-margin dishes are
              more prominent, increasing average food profit without raising prices.
            </p>
            <p>
              <strong>Moral licensing</strong> (Prinsen et al. 2018) is a behavioural
              phenomenon where making a virtuous choice (selecting an NA drink) makes guests
              more likely to indulge elsewhere — such as ordering dessert. This unlocks a
              natural upsell that feels authentic rather than pushy.
            </p>
          </InfoBox>
        </div>

        {/* ── RIGHT: Live results ── */}
        <div>
          <h3 className="mb-5 font-serif text-xl font-semibold text-[#1B3A2D]">
            Combined Impact
          </h3>
          <Results results={results} />
        </div>
      </div>
    </div>
  );
}
