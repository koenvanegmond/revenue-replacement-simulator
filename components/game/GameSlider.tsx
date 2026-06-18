'use client';

import { SliderConfig } from '@/lib/game-types';

interface GameSliderProps {
  field: string;
  config: SliderConfig;
  value: number;
  onChange: (value: number) => void;
}

function getTrackGradient(value: number, min: number, max: number, realisticMax: number): string {
  const range = max - min;
  const valuePct = ((value - min) / range) * 100;
  const boundaryPct = ((realisticMax - min) / range) * 100;

  if (value <= realisticMax) {
    // In realistic zone — green active, then inactive grey, then inactive amber hint
    return [
      `#1B3A2D 0%`, `#1B3A2D ${valuePct}%`,
      `#E0D9D0 ${valuePct}%`, `#E0D9D0 ${boundaryPct}%`,
      `#FDE68A ${boundaryPct}%`, `#FDE68A 100%`,
    ].join(', ');
  } else {
    // In aggressive zone — green up to boundary, then amber active, then lighter amber inactive
    return [
      `#1B3A2D 0%`, `#1B3A2D ${boundaryPct}%`,
      `#D97706 ${boundaryPct}%`, `#D97706 ${valuePct}%`,
      `#FEF3C7 ${valuePct}%`, `#FEF3C7 100%`,
    ].join(', ');
  }
}

export function GameSlider({ field: _field, config, value, onChange }: GameSliderProps) {
  const { min, max, realisticMax, unit, label, benchmark } = config;
  const isAggressive = value > realisticMax;
  const displayValue = unit === '€' ? `€\u202F${value}` : `${value}${unit}`;

  return (
    <div className="mb-4">
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-medium text-[#3A3A3A]">{label}</label>
        <span className={`stat-number text-base font-bold ${isAggressive ? 'text-[#D97706]' : 'text-[#1B3A2D]'}`}>
          {displayValue}
          {isAggressive && (
            <span className="ml-1.5 rounded bg-[#FEF3C7] px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#B45309]">
              aggressive
            </span>
          )}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(to right, ${getTrackGradient(value, min, max, realisticMax)})` }}
        className="w-full"
      />

      <div className="mt-0.5 flex justify-between text-[10px] text-[#AAAAAA]">
        <span>{unit === '€' ? `€${min}` : `${min}${unit}`}</span>
        <span className="text-[#C4A050]">
          realistic up to {unit === '€' ? `€${realisticMax}` : `${realisticMax}${unit}`}
        </span>
        <span>{unit === '€' ? `€${max}` : `${max}${unit}`}</span>
      </div>

      {isAggressive && (
        <p className="mt-1 text-[10px] font-medium text-[#B45309]">
          ⚠ Aggressive setting requires extra training/staff hours (+€400/month)
        </p>
      )}

      {benchmark && (
        <p className="mt-0.5 text-[10px] italic text-[#AAAAAA]">{benchmark}</p>
      )}
    </div>
  );
}
