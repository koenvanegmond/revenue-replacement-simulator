'use client';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  description?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  description,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="mb-5">
      <div className="mb-2 flex items-baseline justify-between">
        <label className="text-sm font-medium text-[#2A2A2A]">{label}</label>
        <span className="stat-number text-lg font-semibold text-[#1B3A2D]">
          {unit === '€' ? `€\u202F${value}` : `${value}${unit}`}
        </span>
      </div>
      {description && (
        <p className="mb-2 text-xs text-[#7A7A7A]">{description}</p>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          background: `linear-gradient(to right, #1B3A2D ${pct}%, #E0D9D0 ${pct}%)`,
        }}
      />
      <div className="mt-1 flex justify-between text-xs text-[#9A9A9A]">
        <span>{unit === '€' ? `€${min}` : `${min}${unit}`}</span>
        <span>{unit === '€' ? `€${max}` : `${max}${unit}`}</span>
      </div>
    </div>
  );
}
