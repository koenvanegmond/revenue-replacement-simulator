'use client';

import { CardData, GameLevers, SLIDER_CONFIGS, DEFAULT_LEVERS } from '@/lib/game-types';
import { calcGameScore, GameScore } from '@/lib/game-calculations';
import { fmt, fmtPct } from '@/lib/calculations';
import { GameSlider } from './GameSlider';

interface Props {
  card: CardData;
  levers: GameLevers;
  onChange: (levers: GameLevers) => void;
  onSubmit: (score: GameScore) => void;
  hasMovedSlider: boolean;
}

function RecoveryRing({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const color = pct >= 90 ? '#2E7D5A' : pct >= 50 ? '#D97706' : '#9E3A3A';
  return (
    <div className="relative mx-auto mb-4 flex h-28 w-28 items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#E8E3DC" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="42" fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 42}`}
          strokeDashoffset={`${2 * Math.PI * 42 * (1 - clamped / 100)}`}
          style={{ transition: 'stroke-dashoffset 0.4s ease, stroke 0.3s ease' }}
        />
      </svg>
      <div className="text-center">
        <p className="stat-number text-xl font-black" style={{ color }}>{clamped.toFixed(0)}%</p>
        <p className="text-[9px] uppercase tracking-wide text-[#8A8A8A]">recovered</p>
      </div>
    </div>
  );
}

function LeverSection({
  number, title, color, children,
}: { number: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 rounded-xl border border-[#E8E3DC] bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ background: color }}>
          {number}
        </span>
        <h4 className="text-sm font-bold text-[#1B3A2D]">{title}</h4>
      </div>
      {children}
    </div>
  );
}

export function Challenge({ card, levers, onChange, onSubmit, hasMovedSlider }: Props) {
  const score = calcGameScore(card, levers);
  const upd = (key: keyof GameLevers) => (val: number) =>
    onChange({ ...levers, [key]: val });

  const verdictColor = score.recoveryPercent >= 90 ? '#2E7D5A' : score.recoveryPercent >= 50 ? '#D97706' : '#9E3A3A';

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* ── Compact header ── */}
      <div className="border-b border-[#DDD7CF] bg-[#1B3A2D] px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8FC4A8]">Silent Grant Challenge</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-lg font-bold text-white leading-tight">
              {card.restaurantName}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#8FC4A8]">2030 gap to close</p>
            <p className="stat-number text-xl font-black text-[#F0A0A8]">{fmt(score.gap)}</p>
          </div>
        </div>
      </div>

      {/* ── Three-column layout ── */}
      <div className="mx-auto grid max-w-7xl gap-4 p-4 lg:grid-cols-[260px_1fr_260px]">

        {/* ── LEFT: Restaurant info ── */}
        <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Your restaurant</p>
            <h3 className="mt-1 font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1B3A2D]">
              {card.restaurantName}
            </h3>
            <p className="text-xs text-[#7A7A7A]">{card.restaurantType}</p>

            <div className="mt-4 space-y-2">
              {[
                { label: 'Covers / month', value: card.covers.toLocaleString('nl-NL') },
                { label: 'Avg spend', value: fmt(card.avgSpend) },
                { label: 'Bev. share', value: fmtPct(card.beverageShare) },
                { label: 'Alcohol share', value: fmtPct(card.alcoholShare) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-[#7A7A7A]">{label}</span>
                  <span className="font-semibold text-[#1A1A1A]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-[#9E3A3A] p-4 text-white">
            <p className="text-xs text-[#F0A0A8]">Profit gap to close</p>
            <p className="stat-number text-2xl font-black">{fmt(score.gap)}</p>
            <p className="mt-1 text-xs text-[#F0A0A8]">/ month by 2030</p>
            <p className="mt-3 text-xs font-medium text-white">
              Your mission: close this gap using the three levers.
            </p>
          </div>

          <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs text-[#92400E]">
            <p className="font-semibold">How scoring works</p>
            <p className="mt-1 leading-relaxed text-[#A16207]">
              Each lever in the <span className="font-semibold">aggressive zone</span> costs you €400/month in staff penalties.
              Maximise net recovery — not just raw intervention value.
            </p>
          </div>
        </div>

        {/* ── MIDDLE: Levers ── */}
        <div>
          <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-lg font-bold text-[#1B3A2D]">
            The Three Levers
          </h3>

          {/* Lever 1 */}
          <LeverSection number="1" title="Premium NA Pairing" color="#1B3A2D">
            <GameSlider field="naAttachRate" config={SLIDER_CONFIGS.naAttachRate} value={levers.naAttachRate} onChange={upd('naAttachRate')} />
            <GameSlider field="naPairingPrice" config={SLIDER_CONFIGS.naPairingPrice} value={levers.naPairingPrice} onChange={upd('naPairingPrice')} />
            <GameSlider field="naPairingMargin" config={SLIDER_CONFIGS.naPairingMargin} value={levers.naPairingMargin} onChange={upd('naPairingMargin')} />
            <div className="mt-1 rounded bg-[#F0F7F4] px-2 py-1.5 text-xs text-[#2E7D5A]">
              Adds <span className="stat-number font-bold">{fmt(score.naPairingProfit)}</span>/month
            </div>
          </LeverSection>

          {/* Lever 2 */}
          <LeverSection number="2" title="Menu Engineering" color="#5B6B3A">
            <GameSlider field="foodMarginUplift" config={SLIDER_CONFIGS.foodMarginUplift} value={levers.foodMarginUplift} onChange={upd('foodMarginUplift')} />
            <div className="mt-1 rounded bg-[#F0F7F4] px-2 py-1.5 text-xs text-[#2E7D5A]">
              Adds <span className="stat-number font-bold">{fmt(score.additionalFoodProfit)}</span>/month
            </div>
          </LeverSection>

          {/* Lever 3 */}
          <LeverSection number="3" title="Welcome Drink + Dessert" color="#7B4A2D">
            <GameSlider field="welcomeConversion" config={SLIDER_CONFIGS.welcomeConversion} value={levers.welcomeConversion} onChange={upd('welcomeConversion')} />
            <GameSlider field="welcomePrice" config={SLIDER_CONFIGS.welcomePrice} value={levers.welcomePrice} onChange={upd('welcomePrice')} />
            <GameSlider field="dessertAttachRate" config={SLIDER_CONFIGS.dessertAttachRate} value={levers.dessertAttachRate} onChange={upd('dessertAttachRate')} />
            <div className="mt-1 rounded bg-[#F0F7F4] px-2 py-1.5 text-xs text-[#2E7D5A]">
              Adds <span className="stat-number font-bold">{fmt(score.welcomePlusDesertProfit)}</span>/month
            </div>
          </LeverSection>
        </div>

        {/* ── RIGHT: Live score ── */}
        <div className="space-y-3 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-5">
            <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
              Live Score
            </p>

            <RecoveryRing pct={score.recoveryPercent} />

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#7A7A7A]">Gross interventions</span>
                <span className="stat-number font-semibold text-[#1A1A1A]">{fmt(score.totalInterventionProfit)}</span>
              </div>
              {score.penaltyCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#D97706]">Staff penalties ({score.penaltyCount}×)</span>
                  <span className="stat-number font-semibold text-[#D97706]">−{fmt(score.totalPenalty)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E8E3DC] pt-2">
                <span className="font-semibold text-[#1A1A1A]">Net recovery</span>
                <span className="stat-number font-bold" style={{ color: verdictColor }}>{fmt(score.netRecovery)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-[#1A1A1A]">Gap remaining</span>
                <span className="stat-number font-semibold text-[#9E3A3A]">
                  {fmt(Math.max(0, score.gap - score.netRecovery))}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-lg px-3 py-2 text-center text-xs font-medium"
              style={{ background: score.recoveryPercent >= 90 ? '#F0FDF4' : score.recoveryPercent >= 50 ? '#FFFBEB' : '#FEF2F2', color: verdictColor }}>
              {score.recoveryPercent >= 90
                ? '✓ Strong recovery'
                : score.recoveryPercent >= 50
                ? '◑ Partial recovery'
                : '✗ Gap not closed'}
            </div>
          </div>

          <button
            onClick={() => onSubmit(score)}
            disabled={!hasMovedSlider}
            className="w-full rounded-xl py-3.5 text-base font-bold text-white shadow transition-all disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            style={{ background: hasMovedSlider ? verdictColor : '#9A9A9A' }}
          >
            Submit Score →
          </button>

          {!hasMovedSlider && (
            <p className="text-center text-xs text-[#9A9A9A]">Move at least one slider to unlock</p>
          )}

          {/* Default comparison */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-3 text-xs text-[#7A7A7A]">
            <p className="font-semibold text-[#1A1A1A]">Default settings:</p>
            {(Object.keys(DEFAULT_LEVERS) as (keyof GameLevers)[]).map((k) => {
              const cfg = SLIDER_CONFIGS[k];
              const val = DEFAULT_LEVERS[k];
              const cur = levers[k];
              const changed = cur !== val;
              return (
                <div key={k} className={`flex justify-between ${changed ? 'text-[#1B3A2D] font-medium' : ''}`}>
                  <span>{cfg.label}</span>
                  <span className="stat-number">{cfg.unit === '€' ? `€${cur}` : `${cur}${cfg.unit}`}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
