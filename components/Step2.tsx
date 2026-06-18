'use client';

import { SimulatorState, SimulatorAction, Step2Results } from '@/lib/types';
import { fmt, fmtPct } from '@/lib/calculations';
import { Slider } from './Slider';
import { InfoBox } from './InfoBox';

interface Props {
  state: SimulatorState;
  dispatch: React.Dispatch<SimulatorAction>;
  results: Step2Results;
}

function GapBar({ results }: { results: Step2Results }) {
  const lossPct = results.totalGrossProfit > 0
    ? (results.lostGrossProfit / results.totalGrossProfit) * 100
    : 0;

  return (
    <div className="mt-4 rounded-lg border border-[#E8E3DC] bg-white p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
        Gross Profit Impact
      </p>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-sm text-[#5A5A5A]">Today</span>
        <span className="stat-number ml-auto font-semibold text-[#1A1A1A]">
          {fmt(results.totalGrossProfit)}
        </span>
      </div>

      {/* Visual bar */}
      <div className="relative h-8 overflow-hidden rounded-md bg-[#E8E3DC]">
        {/* Remaining profit */}
        <div
          className="absolute left-0 top-0 h-full rounded-l-md bg-[#1B3A2D] transition-all duration-300"
          style={{ width: `${100 - lossPct}%` }}
        />
        {/* Lost profit */}
        <div
          className="absolute top-0 h-full rounded-r-md bg-[#9E3A3A] transition-all duration-300"
          style={{ left: `${100 - lossPct}%`, width: `${lossPct}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-xs text-[#7A7A7A]">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#1B3A2D]" />
          Retained {fmt(results.newTotalGrossProfit)}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-[#9E3A3A]" />
          Lost {fmt(results.lostGrossProfit)}
        </span>
      </div>
    </div>
  );
}

export function Step2({ state, dispatch, results }: Props) {
  const upd = (value: number) =>
    dispatch({ type: 'UPDATE', field: 'declineRate', value });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* ── LEFT: Scenario control ── */}
      <div>
        <h3 className="mb-2 font-serif text-xl font-semibold text-[#1B3A2D]">
          Alcohol Decline Assumption
        </h3>
        <p className="mb-6 text-sm text-[#6A6A6A]">
          Based on CBS and IWSR trend data, adjust how much alcohol revenue your restaurant
          will lose by 2030.
        </p>

        <div className="rounded-lg border border-[#E8E3DC] bg-white p-5">
          <Slider
            label="Alcohol revenue decline by 2030"
            value={state.declineRate}
            min={10}
            max={40}
            unit="%"
            onChange={upd}
            description="Dutch alcohol volume has been declining 2–3% annually since 2019 (CBS, 2024). The IWSR projects continuation of this structural trend."
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Conservative', value: 10 },
              { label: 'Base case', value: 25 },
              { label: 'Accelerated', value: 40 },
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => upd(value)}
                className={`rounded-md border px-2 py-1.5 text-xs font-medium transition-all ${
                  state.declineRate === value
                    ? 'border-[#1B3A2D] bg-[#1B3A2D] text-white'
                    : 'border-[#E0D9D0] bg-[#FAF7F2] text-[#5A5A5A] hover:border-[#1B3A2D]'
                }`}
              >
                {label}
                <br />
                <span className="font-bold">{value}%</span>
              </button>
            ))}
          </div>
        </div>

        <InfoBox title="Why this decline is structural, not cyclical">
          <p>
            The fall in alcohol consumption in the Netherlands is driven by generational
            change, not economic pressure. Among adults aged 18–34, sober-curious and
            mindful-drinking movements are accelerating the trend. CBS data shows that
            the share of non-drinkers among young adults grew from 24% (2016) to 38%
            (2023). The IWSR projects Dutch still-wine volume to fall a further 15–20%
            by 2030. This is not a dip — it is a structural repricing of the model.
          </p>
        </InfoBox>

        <InfoBox title="Assumptions and Limitations">
          <p>
            This simulator models revenue-side impact at a constant cost base. Rising
            labour costs, energy prices, and inflation pressure margins further, increasing
            the gap to be closed. These cost dynamics are outside the scope of the tool
            but are addressed in the thesis context. All slider ranges are grounded in
            interview data and industry sources, but final results depend on local
            restaurant context and execution quality.
          </p>
        </InfoBox>
      </div>

      {/* ── RIGHT: Impact numbers ── */}
      <div>
        <h3 className="mb-5 font-serif text-xl font-semibold text-[#1B3A2D]">
          Your 2030 Exposure
        </h3>

        {/* Hero: the gap */}
        <div className="mb-4 rounded-lg bg-[#722F37] px-5 py-5 text-white">
          <p className="mb-1 text-sm text-[#F0A0A8]">Monthly Profit Gap by 2030</p>
          <p className="stat-number text-4xl font-bold tracking-tight">
            {fmt(results.gap)}
          </p>
          <p className="mt-1 text-sm text-[#F0A0A8]">
            gross profit to replace per month
          </p>
        </div>

        {/* Key numbers */}
        <div className="mb-4 rounded-lg border border-[#E8E3DC] bg-white p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#8A8A8A]">Lost alcohol revenue</p>
              <p className="stat-number mt-0.5 text-xl font-semibold text-[#722F37]">
                {fmt(results.lostAlcoholRevenue)}
              </p>
              <p className="text-xs text-[#9A9A9A]">per month</p>
            </div>
            <div>
              <p className="text-xs text-[#8A8A8A]">Lost gross profit</p>
              <p className="stat-number mt-0.5 text-xl font-semibold text-[#722F37]">
                {fmt(results.lostGrossProfit)}
              </p>
              <p className="text-xs text-[#9A9A9A]">per month</p>
            </div>
            <div>
              <p className="text-xs text-[#8A8A8A]">2030 baseline profit</p>
              <p className="stat-number mt-0.5 text-xl font-semibold text-[#1A1A1A]">
                {fmt(results.newTotalGrossProfit)}
              </p>
              <p className="text-xs text-[#9A9A9A]">without intervention</p>
            </div>
            <div>
              <p className="text-xs text-[#8A8A8A]">Decline share</p>
              <p className="stat-number mt-0.5 text-xl font-semibold text-[#1A1A1A]">
                {fmtPct(
                  results.totalGrossProfit > 0
                    ? (results.lostGrossProfit / results.totalGrossProfit) * 100
                    : 0
                )}
              </p>
              <p className="text-xs text-[#9A9A9A]">of gross profit at risk</p>
            </div>
          </div>
        </div>

        <GapBar results={results} />
      </div>
    </div>
  );
}
