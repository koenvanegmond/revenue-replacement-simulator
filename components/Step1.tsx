'use client';

import { SimulatorState, SimulatorAction, Step1Results } from '@/lib/types';
import { fmt, fmtPct } from '@/lib/calculations';
import { NumberInput } from './NumberInput';
import { InfoBox } from './InfoBox';

interface Props {
  state: SimulatorState;
  dispatch: React.Dispatch<SimulatorAction>;
  results: Step1Results;
}

function StatRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-[#F0EBE3] py-2.5 last:border-0">
      <span className="text-sm text-[#5A5A5A]">{label}</span>
      <div className="text-right">
        <span className="stat-number font-semibold text-[#1A1A1A]">{value}</span>
        {sub && <span className="ml-2 text-xs text-[#9A9A9A]">{sub}</span>}
      </div>
    </div>
  );
}

export function Step1({ state, dispatch, results }: Props) {
  const upd = (field: keyof Omit<SimulatorState, 'step'>) => (value: number) =>
    dispatch({ type: 'UPDATE', field, value });

  const alcoholRevPct = results.monthlyRevenue > 0
    ? (results.alcoholRevenue / results.monthlyRevenue) * 100
    : 0;
  const naRevPct = results.monthlyRevenue > 0
    ? (results.naRevenue / results.monthlyRevenue) * 100
    : 0;
  const foodRevPct = results.monthlyRevenue > 0
    ? (results.foodRevenue / results.monthlyRevenue) * 100
    : 0;

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* ── LEFT: Inputs ── */}
      <div>
        <h3 className="mb-5 font-serif text-xl font-semibold text-[#1B3A2D]">
          Restaurant Metrics
        </h3>

        <div className="mb-4 rounded-lg border border-[#E8E3DC] bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
            Volume
          </p>
          <NumberInput
            label="Covers per month"
            value={state.covers}
            onChange={upd('covers')}
            min={1}
            step={10}
            description="Total number of guests served per month"
          />
          <NumberInput
            label="Average spend per cover"
            value={state.avgSpend}
            onChange={upd('avgSpend')}
            min={1}
            prefix="€"
            description="Total spend per guest including food and beverages"
          />
        </div>

        <div className="mb-4 rounded-lg border border-[#E8E3DC] bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
            Revenue Mix
          </p>
          <NumberInput
            label="Beverage share of revenue"
            value={state.beverageShare}
            onChange={upd('beverageShare')}
            min={0}
            max={100}
            suffix="%"
            description="What percentage of total revenue comes from all drinks"
          />
          <NumberInput
            label="Alcohol share of beverage revenue"
            value={state.alcoholShare}
            onChange={upd('alcoholShare')}
            min={0}
            max={100}
            suffix="%"
            description="Of all beverage revenue, what fraction is alcoholic"
          />
        </div>

        <div className="rounded-lg border border-[#E8E3DC] bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
            Gross Margin by Category
          </p>
          <NumberInput
            label="Alcohol gross margin"
            value={state.alcoholMargin}
            onChange={upd('alcoholMargin')}
            min={0}
            max={100}
            suffix="%"
          />
          <NumberInput
            label="Non-alcohol beverage gross margin"
            value={state.naMargin}
            onChange={upd('naMargin')}
            min={0}
            max={100}
            suffix="%"
          />
          <NumberInput
            label="Food gross margin"
            value={state.foodMargin}
            onChange={upd('foodMargin')}
            min={0}
            max={100}
            suffix="%"
          />
        </div>
      </div>

      {/* ── RIGHT: Results ── */}
      <div>
        <h3 className="mb-5 font-serif text-xl font-semibold text-[#1B3A2D]">
          Current Month Snapshot
        </h3>

        {/* Hero KPI */}
        <div className="mb-4 rounded-lg bg-[#1B3A2D] px-5 py-5 text-white">
          <p className="mb-1 text-sm text-[#8FC4A8]">Monthly Gross Profit</p>
          <p className="stat-number text-4xl font-bold tracking-tight">
            {fmt(results.totalGrossProfit)}
          </p>
          <p className="mt-1 text-sm text-[#8FC4A8]">
            on {fmt(results.monthlyRevenue)} revenue
          </p>
        </div>

        {/* Revenue breakdown */}
        <div className="mb-4 rounded-lg border border-[#E8E3DC] bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
            Revenue Breakdown
          </p>
          <StatRow
            label="Food"
            value={fmt(results.foodRevenue)}
            sub={fmtPct(foodRevPct)}
          />
          <StatRow
            label="Alcohol beverages"
            value={fmt(results.alcoholRevenue)}
            sub={fmtPct(alcoholRevPct)}
          />
          <StatRow
            label="Non-alcohol beverages"
            value={fmt(results.naRevenue)}
            sub={fmtPct(naRevPct)}
          />
        </div>

        {/* Gross profit breakdown */}
        <div className="rounded-lg border border-[#E8E3DC] bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
            Gross Profit Breakdown
          </p>
          <StatRow label="Food profit" value={fmt(results.foodProfit)} />
          <StatRow
            label="Alcohol profit"
            value={fmt(results.alcoholProfit)}
            sub={`${state.alcoholMargin}% margin`}
          />
          <StatRow label="NA beverage profit" value={fmt(results.naProfit)} />

          {/* Silent Grant alert */}
          <div className="mt-3 rounded bg-[#FFF8EE] px-3 py-2.5">
            <p className="text-xs text-[#8A5A00]">
              <span className="font-semibold">Beverage profit share: </span>
              <span className="stat-number">{fmtPct(results.beverageProfitShare)}</span>
              {' '}of total gross profit — the Silent Grant at work.
            </p>
          </div>
        </div>

        <InfoBox title="Why this matters — the Silent Grant">
          <p>
            Alcohol carries a gross margin of ~75%, far above food (~65%). This means beverages
            contribute a disproportionate share of profit relative to their revenue share.
            Restaurants have unknowingly relied on this{' '}
            <em>silent subsidy</em> for decades. As alcohol consumption structurally declines,
            this hidden prop quietly disappears.
          </p>
        </InfoBox>
      </div>
    </div>
  );
}
