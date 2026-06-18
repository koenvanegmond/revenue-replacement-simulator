'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Step3Results } from '@/lib/types';
import { fmt, fmtPct } from '@/lib/calculations';

interface Props {
  results: Step3Results;
}

const COLORS = {
  today: '#1B3A2D',
  gap: '#9E3A3A',
  recovered: '#2E7D5A',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#E8E3DC] bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-[#5A5A5A]">{label}</p>
      <p className="stat-number text-base font-bold text-[#1A1A1A]">
        {fmt(payload[0].value)}
      </p>
    </div>
  );
}

function LeverBar({
  label,
  profit,
  gap,
  color,
}: {
  label: string;
  profit: number;
  gap: number;
  color: string;
}) {
  const pct = gap > 0 ? Math.min((profit / gap) * 100, 100) : 0;
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-xs font-medium text-[#4A4A4A]">{label}</span>
        <div className="text-right">
          <span className="stat-number text-sm font-semibold text-[#1A1A1A]">
            {fmt(profit)}
          </span>
          <span className="ml-1.5 text-xs text-[#9A9A9A]">
            {fmtPct(pct)} of gap
          </span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#E8E3DC]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function Results({ results }: Props) {
  const r = results;
  const pct = Math.min(r.gapRecoveryPercent, 100);

  const scenarioData = [
    { scenario: 'Today', profit: r.totalGrossProfit },
    { scenario: '2030\nWithout Action', profit: r.newTotalGrossProfit },
    { scenario: '2030\nWith Interventions', profit: r.finalGrossProfit },
  ];

  const isFullyClosed = r.gapRecoveryPercent >= 100;
  const isPartial = r.gapRecoveryPercent > 0 && r.gapRecoveryPercent < 100;

  const verdict = isFullyClosed
    ? { text: 'Gap fully closed', sub: `You recover ${fmtPct(r.gapRecoveryPercent)} of lost profit — the model is resilient.`, bg: 'bg-[#1B3A2D]', text_: 'text-white', sub_: 'text-[#8FC4A8]' }
    : isPartial
    ? { text: `Gap ${fmtPct(pct)} recovered`, sub: `You close part of the gap. ${fmtPct(100 - pct)} (${fmt(r.gap - r.totalInterventionProfit)}) remains open.`, bg: 'bg-[#7A5C00]', text_: 'text-white', sub_: 'text-[#F5D98C]' }
    : { text: 'Gap not closed', sub: 'Current interventions are insufficient. Increase the lever intensities to recover lost profit.', bg: 'bg-[#722F37]', text_: 'text-white', sub_: 'text-[#F0A0A8]' };

  return (
    <div className="space-y-6">
      {/* ── Verdict ── */}
      <div className={`rounded-lg px-5 py-4 ${verdict.bg}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-serif text-2xl font-bold ${verdict.text_}`}>
              {verdict.text}
            </p>
            <p className={`mt-1 text-sm ${verdict.sub_}`}>{verdict.sub}</p>
          </div>
          <div className="text-right">
            <p className={`stat-number text-3xl font-bold ${verdict.text_}`}>
              {fmtPct(pct)}
            </p>
            <p className={`text-xs ${verdict.sub_}`}>recovered</p>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Today's profit", value: fmt(r.totalGrossProfit), accent: false },
          { label: '2030 gap', value: fmt(r.gap), accent: true },
          { label: 'Interventions recover', value: fmt(Math.min(r.totalInterventionProfit, r.gap)), accent: false },
          { label: 'Final 2030 profit', value: fmt(r.finalGrossProfit), accent: false },
        ].map(({ label, value, accent }) => (
          <div
            key={label}
            className="rounded-lg border border-[#E8E3DC] bg-white px-4 py-3"
          >
            <p className="text-xs text-[#8A8A8A]">{label}</p>
            <p
              className={`stat-number mt-0.5 text-xl font-bold ${
                accent ? 'text-[#722F37]' : 'text-[#1A1A1A]'
              }`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Bar chart ── */}
      <div className="rounded-lg border border-[#E8E3DC] bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
          Gross Profit — Three Scenarios
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={scenarioData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" vertical={false} />
            <XAxis
              dataKey="scenario"
              tick={{ fontSize: 11, fill: '#7A7A7A' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`}
              tick={{ fontSize: 11, fill: '#7A7A7A' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(27,58,45,0.05)' }} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              <Cell fill={COLORS.today} />
              <Cell fill={COLORS.gap} />
              <Cell fill={COLORS.recovered} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex gap-5 text-xs text-[#7A7A7A]">
          {[
            { color: COLORS.today, label: 'Today' },
            { color: COLORS.gap, label: '2030 without action' },
            { color: COLORS.recovered, label: '2030 with interventions' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Lever breakdown ── */}
      <div className="rounded-lg border border-[#E8E3DC] bg-white p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
          Gap Recovery by Lever
        </p>
        <LeverBar
          label="Premium NA Pairing"
          profit={r.naPairingProfit}
          gap={r.gap}
          color="#2E7D5A"
        />
        <LeverBar
          label="Menu Engineering Uplift"
          profit={r.additionalFoodProfit}
          gap={r.gap}
          color="#5B9279"
        />
        <LeverBar
          label="Welcome Drink + Dessert Upsell"
          profit={r.welcomeDrinkProfit + r.additionalDessertProfit}
          gap={r.gap}
          color="#8FC4A8"
        />

        {/* Remaining gap */}
        {r.gap - r.totalInterventionProfit > 0 && (
          <div className="mt-4 rounded bg-[#FEF2F2] px-3 py-2">
            <p className="text-xs text-[#9E3A3A]">
              <span className="font-semibold">Remaining gap: </span>
              {fmt(r.gap - r.totalInterventionProfit)} — increase lever intensities to close it.
            </p>
          </div>
        )}
        {r.gap - r.totalInterventionProfit <= 0 && (
          <div className="mt-4 rounded bg-[#F0FDF4] px-3 py-2">
            <p className="text-xs text-[#1B5E3B]">
              <span className="font-semibold">Surplus: </span>
              {fmt(r.totalInterventionProfit - r.gap)} above the gap — your interventions
              do more than replace lost alcohol profit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
