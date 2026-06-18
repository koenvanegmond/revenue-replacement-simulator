'use client';

import { CardData, GameLevers, SLIDER_CONFIGS, DEFAULT_LEVERS, RESTAURANTS, SliderKey } from '@/lib/game-types';
import { calcGameScore, GameScore } from '@/lib/game-calculations';
import { calcStep3 } from '@/lib/calculations';
import { buildSimulatorState } from '@/lib/game-calculations';
import { getRestaurantNAProfile } from '@/lib/restaurant-na-profiles';
import { fmt, fmtPct } from '@/lib/calculations';
import { RESTAURANT_DATA, MenuItem } from '@/lib/restaurant-data';
import { GameSlider } from './GameSlider';
import { NAStrategyPanel } from '@/components/NAStrategyPanel';

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

// Wraps a GameSlider with optional tooltip and live calc text.
function SliderWithCalc({
  tooltip, calc, children,
}: { tooltip?: string; calc?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      {children}
      {tooltip && (
        <p className="-mt-2 mb-1 text-[10px] italic text-[#7A7A7A]">{tooltip}</p>
      )}
      {calc && (
        <div className="mb-3 rounded bg-[#F0F7F4] px-2 py-1.5 text-[10px] text-[#2E7D5A]">
          {calc}
        </div>
      )}
    </div>
  );
}

function MenuCategoryBlock({
  icon, title, hint, items, highlighted, borderColor,
}: {
  icon: string; title: string; hint: string; items: MenuItem[]; highlighted: boolean; borderColor: string;
}) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#1B3A2D]">
        {icon} {title} <span className="font-normal text-[#7A7A7A] normal-case">— {hint}</span>
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <div
            key={it.name}
            className="rounded border-l-4 bg-white px-2.5 py-1.5 text-xs shadow-sm transition-all"
            style={{
              borderLeftColor: borderColor,
              transform: highlighted ? 'scale(1.02)' : 'scale(1)',
              boxShadow: highlighted ? `0 0 0 2px ${borderColor}33` : undefined,
            }}
          >
            <p className="font-semibold text-[#1A1A1A]">{it.name}</p>
            <p className="text-[10px] text-[#7A7A7A]">
              €{it.price} · {it.marginPercent}% margin · {it.ordersPerMonth}/mo
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function findNarrative(restaurantName: string) {
  const match = RESTAURANTS.find((r) => r.restaurantName === restaurantName);
  return match ? RESTAURANT_DATA[match.id] : undefined;
}

export function Challenge({ card, levers, onChange, onSubmit, hasMovedSlider }: Props) {
  const score = calcGameScore(card, levers);
  // Re-derive full Step3Results to feed the NA panel — calcGameScore only
  // exposes a subset on GameScore. Cheap; the inner pipeline is the same call.
  const step3 = calcStep3(buildSimulatorState(card, levers));
  const naProfile = getRestaurantNAProfile(levers.restaurantId);
  const upd = (key: SliderKey) => (val: number) =>
    onChange({ ...levers, [key]: val });

  const verdictColor = score.recoveryPercent >= 90 ? '#2E7D5A' : score.recoveryPercent >= 50 ? '#D97706' : '#9E3A3A';
  const narrative = findNarrative(card.restaurantName);

  // Derived values for live calc strings
  const welcomeDrinksPerMonth = Math.round(card.covers * (levers.welcomeConversion / 100));
  const dessertCoversPerMonth = Math.round(card.covers * (levers.dessertAttachRate / 100));
  const coffeeCoversPerMonth = Math.round(card.covers * (levers.coffeeAttachRate / 100));

  // Live gap tracker (uses gross intervention profit, not penalised net)
  const gross = score.totalInterventionProfit;
  const grossRecoveryPct = score.gap > 0 ? (gross / score.gap) * 100 : 0;
  const stillMissing = Math.max(0, score.gap - gross);
  const overRecovered = grossRecoveryPct > 100;
  const trackerColor =
    grossRecoveryPct >= 90 ? '#2E7D5A'
    : grossRecoveryPct >= 50 ? '#D9A206'
    : '#9E3A3A';

  // Menu highlight flags — bonus visual cue when a sub-lever is pushed >50%
  const highlightStars = levers.starPromotion > 50;
  const highlightPlowhorses = levers.plowhorseEngineering > 50;
  const highlightPuzzles = levers.puzzleActivation > 50;

  const stars = narrative?.menu.filter((m) => m.category === 'Star') ?? [];
  const plowhorses = narrative?.menu.filter((m) => m.category === 'Plowhorse') ?? [];
  const puzzles = narrative?.menu.filter((m) => m.category === 'Puzzle') ?? [];

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

      {/* ── H1: Narrative panel ── */}
      {narrative && (
        <div className="border-b border-[#E8E3DC] bg-white">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#1B3A2D]">
              {card.restaurantName}
            </h3>
            <div className="my-2 h-px bg-[#E8E3DC]" />
            <p className="text-sm leading-relaxed text-[#3A3A3A]">{narrative.story}</p>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-[#B45309]">
              ⚠ The 2030 Challenge
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#3A3A3A]">{narrative.challenge}</p>
            <div className="mt-3 space-y-0.5 rounded bg-[#FAF7F2] px-3 py-2 text-xs text-[#4A4A4A]">
              <p>
                By 2030: <strong>{card.declineRate}%</strong> of guests drink less alcohol
              </p>
              <p>
                Projected monthly profit gap: <strong className="stat-number text-[#9E3A3A]">{fmt(score.gap)}</strong>
              </p>
              <p className="font-semibold text-[#1B3A2D]">→ How will you close it?</p>
            </div>
            <p className="mt-2 text-[10px] italic text-[#9A9A9A]">
              This tool assumes structural alcohol decline. The question is not whether to fight it — the question is how to replace the lost margin.
            </p>
          </div>
        </div>
      )}

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
              Your mission: close this gap using the levers.
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
          {/* H4: Live gap tracker */}
          <div className="mb-4 rounded-xl border-2 border-[#E8E3DC] bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8A8A8A]">Live Gap Tracker</p>
              {overRecovered && (
                <span className="rounded bg-[#1B3A2D] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  over-recovered
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div>
                <p className="text-[10px] text-[#7A7A7A]">Gap to close</p>
                <p className="stat-number text-base font-bold text-[#9E3A3A]">{fmt(score.gap)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#7A7A7A]">Currently recovered</p>
                <p className="stat-number text-base font-bold" style={{ color: trackerColor }}>
                  {fmt(gross)} <span className="text-[10px] font-medium">({grossRecoveryPct.toFixed(0)}%)</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#7A7A7A]">Still missing</p>
                <p className="stat-number text-base font-bold text-[#3A3A3A]">{fmt(stillMissing)}</p>
              </div>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#E8E3DC]">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(grossRecoveryPct, 100)}%`,
                  background: trackerColor,
                }}
              />
            </div>
          </div>

          <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-lg font-bold text-[#1B3A2D]">
            The Levers
          </h3>

          {/* Lever 1 — NA Beverage Strategy */}
          <LeverSection number="1" title="NA Beverage Strategy" color="#1B3A2D">
            <NAStrategyPanel
              profile={naProfile}
              covers={card.covers}
              strategy={levers.naStrategy}
              playerSetPrice={levers.naPlayerSetPrice}
              scheduledLaborHours={levers.naScheduledLaborHours}
              results={step3}
              onChange={(patch) => onChange({ ...levers, ...patch })}
              variant="game"
            />
          </LeverSection>

          {/* Lever 2 — three sub-levers (Kasavana & Smith) */}
          <LeverSection number="2" title="Menu Engineering (Kasavana & Smith)" color="#5B6B3A">
            <div className="mb-3 rounded border border-[#E8E3DC] bg-[#FAF7F2] p-2.5">
              <div className="mb-1 flex items-baseline justify-between">
                <h5 className="text-xs font-bold text-[#1B3A2D]">2a. Star Promotion</h5>
                <span className="stat-number text-[11px] font-semibold text-[#2E7D5A]">
                  +{fmt(score.starProfit)}
                </span>
              </div>
              <GameSlider field="starPromotion" config={SLIDER_CONFIGS.starPromotion} value={levers.starPromotion} onChange={upd('starPromotion')} />
            </div>

            <div className="mb-3 rounded border border-[#E8E3DC] bg-[#FAF7F2] p-2.5">
              <div className="mb-1 flex items-baseline justify-between">
                <h5 className="text-xs font-bold text-[#1B3A2D]">2b. Plowhorse Re-engineering</h5>
                <span className="stat-number text-[11px] font-semibold text-[#2E7D5A]">
                  +{fmt(score.plowhorseProfit)}
                </span>
              </div>
              <GameSlider field="plowhorseEngineering" config={SLIDER_CONFIGS.plowhorseEngineering} value={levers.plowhorseEngineering} onChange={upd('plowhorseEngineering')} />
            </div>

            <div className="mb-2 rounded border border-[#E8E3DC] bg-[#FAF7F2] p-2.5">
              <div className="mb-1 flex items-baseline justify-between">
                <h5 className="text-xs font-bold text-[#1B3A2D]">2c. Puzzle Activation</h5>
                <span className="stat-number text-[11px] font-semibold text-[#2E7D5A]">
                  +{fmt(score.puzzleProfit)}
                </span>
              </div>
              <GameSlider field="puzzleActivation" config={SLIDER_CONFIGS.puzzleActivation} value={levers.puzzleActivation} onChange={upd('puzzleActivation')} />
            </div>

            <div className="mt-1 rounded bg-[#F0F7F4] px-2 py-1.5 text-xs text-[#2E7D5A]">
              Total Lever 2: <span className="stat-number font-bold">{fmt(score.additionalFoodProfit)}</span>/month
            </div>
          </LeverSection>

          {/* H3: Menu Analysis Panel — between Lever 2 and Lever 3 */}
          {narrative && (
            <div className="mb-3 rounded-xl border border-[#E8E3DC] bg-[#FAF7F2] p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#1B3A2D]">
                Your Menu — Kasavana & Smith Analysis
              </p>
              <p className="mb-3 text-[10px] italic text-[#7A7A7A]">
                These are the dishes your Lever 2 sliders act on.
              </p>
              <MenuCategoryBlock
                icon="⭐"
                title="Stars"
                hint="high volume, high margin — push these"
                items={stars}
                highlighted={highlightStars}
                borderColor="#2E7D5A"
              />
              <MenuCategoryBlock
                icon="🐴"
                title="Plowhorses"
                hint="high volume, low margin — re-engineer these"
                items={plowhorses}
                highlighted={highlightPlowhorses}
                borderColor="#D97706"
              />
              <MenuCategoryBlock
                icon="🧩"
                title="Puzzles"
                hint="low volume, high margin — activate these"
                items={puzzles}
                highlighted={highlightPuzzles}
                borderColor="#3B82A8"
              />
            </div>
          )}

          {/* Lever 3 — three sub-levers (Spend per Table) */}
          <LeverSection number="3" title="Spend per Table" color="#7B4A2D">
            {/* 3a. Premium NA Welcome Drink */}
            <div className="mb-3 rounded border border-[#E8E3DC] bg-[#FAF7F2] p-2.5">
              <div className="mb-1 flex items-baseline justify-between">
                <h5 className="text-xs font-bold text-[#1B3A2D]">3a. Premium NA Welcome Drink</h5>
                <span className="stat-number text-[11px] font-semibold text-[#2E7D5A]">
                  +{fmt(score.welcomeDrinkProfit)}
                </span>
              </div>
              <SliderWithCalc
                tooltip={`Alcohol-free welcome drink (€${levers.welcomePrice}, ~75% margin). Sets the tone and anchors guests toward NA choices later in the meal.`}
                calc={
                  <>
                    = {welcomeDrinksPerMonth} drinks/mo × €{levers.welcomePrice} × 75% margin
                  </>
                }
              >
                <GameSlider field="welcomeConversion" config={SLIDER_CONFIGS.welcomeConversion} value={levers.welcomeConversion} onChange={upd('welcomeConversion')} />
              </SliderWithCalc>
              <GameSlider field="welcomePrice" config={SLIDER_CONFIGS.welcomePrice} value={levers.welcomePrice} onChange={upd('welcomePrice')} />
            </div>

            {/* 3b. Dessert Attach Rate */}
            <div className="mb-3 rounded border border-[#E8E3DC] bg-[#FAF7F2] p-2.5">
              <div className="mb-1 flex items-baseline justify-between">
                <h5 className="text-xs font-bold text-[#1B3A2D]">3b. Dessert Attach Rate</h5>
                <span className="stat-number text-[11px] font-semibold text-[#2E7D5A]">
                  +{fmt(score.additionalDessertProfit)}
                </span>
              </div>
              <SliderWithCalc
                tooltip="Extra percentage points of guests ordering dessert due to moral licensing after an NA choice (avg €12, 75% margin)."
                calc={
                  <>
                    = {dessertCoversPerMonth} desserts/mo × €12 × 75% margin
                  </>
                }
              >
                <GameSlider field="dessertAttachRate" config={SLIDER_CONFIGS.dessertAttachRate} value={levers.dessertAttachRate} onChange={upd('dessertAttachRate')} />
              </SliderWithCalc>
            </div>

            {/* 3c. Coffee / Tea Attach Rate */}
            <div className="mb-2 rounded border border-[#E8E3DC] bg-[#FAF7F2] p-2.5">
              <div className="mb-1 flex items-baseline justify-between">
                <h5 className="text-xs font-bold text-[#1B3A2D]">3c. Coffee / Tea Attach Rate</h5>
                <span className="stat-number text-[11px] font-semibold text-[#2E7D5A]">
                  +{fmt(score.coffeeProfit)}
                </span>
              </div>
              <SliderWithCalc
                tooltip="% of guests who order coffee or tea after the meal. Highest margin in the house (~90%). Light seat-time cost above 70%."
                calc={
                  <>
                    = {coffeeCoversPerMonth} × €4.50 × 90% margin ≈{' '}
                    <span className="font-bold">{fmt(score.coffeeProfit)}</span>/mo
                  </>
                }
              >
                <GameSlider field="coffeeAttachRate" config={SLIDER_CONFIGS.coffeeAttachRate} value={levers.coffeeAttachRate} onChange={upd('coffeeAttachRate')} />
              </SliderWithCalc>
            </div>

            <div className="mt-1 rounded bg-[#F0F7F4] px-2 py-1.5 text-xs text-[#2E7D5A]">
              Total Lever 3: <span className="stat-number font-bold">{fmt(score.welcomePlusDesertProfit + score.coffeeProfit)}</span>/month
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

          {/* Default comparison — slider levers only (NA strategy is its own panel). */}
          <div className="rounded-xl border border-[#E8E3DC] bg-white p-3 text-xs text-[#7A7A7A]">
            <p className="font-semibold text-[#1A1A1A]">Default settings:</p>
            {(Object.keys(SLIDER_CONFIGS) as SliderKey[]).map((k) => {
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
