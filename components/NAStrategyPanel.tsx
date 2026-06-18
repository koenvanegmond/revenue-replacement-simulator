'use client';

import { NAStrategy, RestaurantNAProfile, Step3Results } from '@/lib/types';
import { fmt } from '@/lib/calculations';

interface Props {
  profile: RestaurantNAProfile;
  covers: number;
  // Current state
  strategy: NAStrategy;
  playerSetPrice: number;
  scheduledLaborHours: number;
  // Live results from calcStep3 — no extra calculation in the panel
  results: Pick<
    Step3Results,
    | 'naMonthlyProfit'
    | 'naEffectiveAttachRate'
    | 'naEffectiveChurnRate'
    | 'naRealisedMargePerGlas'
    | 'naWarningLevel'
    | 'naFatigueRate'
    | 'naRequiredLaborHours'
  >;
  // Combined patch emitter — caller spreads the patch into its own state.
  onChange: (patch: {
    naStrategy?: NAStrategy;
    naPlayerSetPrice?: number;
    naScheduledLaborHours?: number;
  }) => void;
  // Visual style. 'simulator' uses the larger Step3 layout, 'game' is the
  // compact Challenge-screen layout. Behaviour is identical.
  variant?: 'simulator' | 'game';
}

const ATELIER_ADVISORY =
  "Bottled is technically possible here, but conceptually mismatched for this restaurant's identity — compare the numbers yourself.";

export function NAStrategyPanel({
  profile,
  covers,
  strategy,
  playerSetPrice,
  scheduledLaborHours,
  results,
  onChange,
  variant = 'game',
}: Props) {
  const activeProfile = strategy === 'in_house' ? profile.inHouse : profile.bottled;
  const inHouseAvailable = profile.inHouse.available;
  const isAtelier = profile.id === 'atelier-noord';

  // Required labor scales linearly with covers.
  const requiredLabor = (profile.inHouse.requiredLaborHoursPer100Covers * covers) / 100;

  // Price slider range: 50% of bottled default → 150% of ACTIVE strategy plafond.
  const priceMin = Math.max(1, profile.bottled.defaultPrice * 0.5);
  const priceMax = activeProfile.plafondPrice * 1.5;

  // Labor slider range: 0 → 2× required hours.
  const laborMax = Math.max(2, Math.round(requiredLabor * 2));

  function handleStrategy(next: NAStrategy) {
    if (next === strategy) return;
    if (next === 'in_house' && !inHouseAvailable) return;
    const nextProfile = next === 'in_house' ? profile.inHouse : profile.bottled;
    onChange({
      naStrategy: next,
      naPlayerSetPrice: nextProfile.defaultPrice,
      naScheduledLaborHours: next === 'in_house'
        ? Math.round((profile.inHouse.requiredLaborHoursPer100Covers * covers) / 100)
        : 0,
    });
  }

  const badge = (() => {
    switch (results.naWarningLevel) {
      case 'ok': return { label: '✓ OK', bg: '#DCFCE7', fg: '#166534', pulse: false };
      case 'stress': return { label: '⚠ STRESS', bg: '#FEF3C7', fg: '#B45309', pulse: false };
      case 'critical': return { label: '⛔ CRITICAL', bg: '#FEE2E2', fg: '#B91C1C', pulse: true };
    }
  })();

  const baseAttach = activeProfile.baseAttachRate * 100;
  const compact = variant === 'game';
  const text = compact ? 'text-xs' : 'text-sm';
  const microText = compact ? 'text-[10px]' : 'text-xs';

  return (
    <div className="space-y-3">
      {/* ── Strategy toggle ── */}
      <div>
        <p className={`mb-1.5 font-semibold text-[#1B3A2D] ${text}`}>Strategy choice</p>
        <p className={`mb-2 italic text-[#7A7A7A] ${microText}`} title="In-house uses 9% VAT instead of bottled wine's 21% alcohol VAT, and has much lower cost of goods — but requires skilled labor you have to schedule and pay for.">
          In-house uses 9% VAT instead of bottled wine&apos;s 21%, and far lower COGS — but
          needs skilled labor you schedule and pay for.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <StrategyButton
            active={strategy === 'bottled'}
            disabled={false}
            onClick={() => handleStrategy('bottled')}
            title="Commercial Bottled"
            sub="Low margin, low risk. Quick to deploy."
            compact={compact}
          />
          <StrategyButton
            active={strategy === 'in_house'}
            disabled={!inHouseAvailable}
            disabledReason={!inHouseAvailable
              ? 'Volume restaurant — in-house production is logistically not viable at this scale.'
              : undefined}
            onClick={() => handleStrategy('in_house')}
            title="In-house Production"
            sub="High margin, requires skilled labor."
            compact={compact}
          />
        </div>
        {isAtelier && strategy === 'bottled' && (
          <p className={`mt-2 rounded border border-[#FDE68A] bg-[#FFFBEB] px-2 py-1.5 italic text-[#92400E] ${microText}`}>
            ⓘ {ATELIER_ADVISORY}
          </p>
        )}
      </div>

      <p className={`text-[#6A6A6A] ${microText}`}>
        Pairing format: <strong>{profile.glassesPerCover}-course pairing</strong>
      </p>

      {/* ── Price slider ── */}
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className={`font-medium text-[#3A3A3A] ${text}`} title="Above the plafond, guests start switching to free water mid-meal instead of paying for the pairing.">
            NA pairing price
          </label>
          <span className="stat-number text-base font-bold text-[#1B3A2D]">
            €{playerSetPrice.toFixed(2)}
          </span>
        </div>
        <input
          type="range"
          min={priceMin}
          max={priceMax}
          step={0.5}
          value={playerSetPrice}
          onChange={(e) => onChange({ naPlayerSetPrice: Number(e.target.value) })}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #1B3A2D ${((playerSetPrice - priceMin) / (priceMax - priceMin)) * 100}%, #E0D9D0 ${((playerSetPrice - priceMin) / (priceMax - priceMin)) * 100}%)`,
          }}
        />
        <div className={`mt-0.5 flex justify-between text-[#9A9A9A] ${microText}`}>
          <span>€{priceMin.toFixed(2)}</span>
          <span className="text-[#7A7A7A]">
            Default <strong>€{activeProfile.defaultPrice.toFixed(2)}</strong> · Plafond <strong>€{activeProfile.plafondPrice.toFixed(2)}</strong>
          </span>
          <span>€{priceMax.toFixed(2)}</span>
        </div>
        {playerSetPrice > activeProfile.plafondPrice && (
          <p className={`mt-1 font-medium text-[#B45309] ${microText}`}>
            ⚠ Above plafond — attach drops, guests switch to free water.
          </p>
        )}
      </div>

      {/* ── Labor slider (in_house only) ── */}
      {strategy === 'in_house' && (
        <div>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <label className={`font-medium text-[#3A3A3A] ${text}`} title="Understaffing in-house production causes fatigue, which silently drops quality and your review score over time.">
              Scheduled labor hours / month
            </label>
            <div className="flex items-center gap-2">
              <span className="stat-number text-base font-bold text-[#1B3A2D]">
                {scheduledLaborHours}h
              </span>
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.pulse ? 'animate-pulse' : ''}`}
                style={{ background: badge.bg, color: badge.fg }}
              >
                {badge.label}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={laborMax}
            step={1}
            value={scheduledLaborHours}
            onChange={(e) => onChange({ naScheduledLaborHours: Number(e.target.value) })}
            className="w-full"
            style={{
              background: `linear-gradient(to right, #1B3A2D ${(scheduledLaborHours / laborMax) * 100}%, #E0D9D0 ${(scheduledLaborHours / laborMax) * 100}%)`,
            }}
          />
          <div className={`mt-0.5 flex justify-between text-[#9A9A9A] ${microText}`}>
            <span>0h</span>
            <span className="text-[#7A7A7A]">
              Required <strong>{requiredLabor.toFixed(0)}h</strong> · Wage €{profile.hourlyWage}/h
            </span>
            <span>{laborMax}h</span>
          </div>
        </div>
      )}

      {/* ── Live output panel ── */}
      <div className="rounded border border-[#E8E3DC] bg-[#FAF7F2] p-3">
        <p className={`mb-1.5 font-semibold uppercase tracking-widest text-[#8A8A8A] ${microText}`}>
          Live engine output
        </p>
        <div className={`grid grid-cols-2 gap-x-3 gap-y-1 ${text}`}>
          <Row label="Effective attach" value={`${(results.naEffectiveAttachRate * 100).toFixed(1)}%`} hint={`base ${baseAttach.toFixed(0)}%`} />
          <Row label="Guest churn" value={`${(results.naEffectiveChurnRate * 100).toFixed(1)}%`} />
          <Row label="Net margin / glass" value={`€${results.naRealisedMargePerGlas.toFixed(2)}`} />
          <Row label="Monthly NA profit" value={fmt(results.naMonthlyProfit)} bold />
        </div>
        {strategy === 'in_house' && results.naWarningLevel !== 'ok' && (
          <p className={`mt-2 font-medium text-[#B45309] ${microText}`}>
            ⚠ Fatigue {(results.naFatigueRate * 100).toFixed(0)}% — quality and reviews dropping
            (review delta {(results.naFatigueRate * -1.5).toFixed(1)})
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, hint, bold }: { label: string; value: string; hint?: string; bold?: boolean }) {
  return (
    <>
      <span className="text-[#7A7A7A]">{label}</span>
      <span className={`stat-number text-right ${bold ? 'font-bold text-[#1B3A2D]' : 'font-semibold text-[#1A1A1A]'}`}>
        {value}{hint && <span className="ml-1 font-normal text-[10px] text-[#9A9A9A]">({hint})</span>}
      </span>
    </>
  );
}

function StrategyButton({
  active, disabled, disabledReason, onClick, title, sub, compact,
}: {
  active: boolean;
  disabled: boolean;
  disabledReason?: string;
  onClick: () => void;
  title: string;
  sub: string;
  compact: boolean;
}) {
  const base = compact ? 'px-3 py-2' : 'px-4 py-3';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabledReason}
      aria-pressed={active}
      className={`flex flex-col items-start gap-0.5 rounded-lg border-2 text-left transition-all ${base} ${
        disabled
          ? 'cursor-not-allowed border-[#E0D9D0] bg-[#F5F2EC] opacity-50'
          : active
          ? 'border-[#1B3A2D] bg-[#1B3A2D] text-white shadow-sm'
          : 'border-[#E0D9D0] bg-white text-[#3A3A3A] hover:border-[#1B3A2D]'
      }`}
    >
      <span className={`flex items-center gap-1.5 text-sm font-bold`}>
        <span className={`inline-block h-2 w-2 rounded-full ${active ? 'bg-white' : 'border border-[#9A9A9A]'}`} />
        {title}
      </span>
      <span className={`text-[10px] ${active ? 'text-white/80' : 'text-[#7A7A7A]'}`}>
        {disabled && disabledReason ? disabledReason : sub}
      </span>
    </button>
  );
}
