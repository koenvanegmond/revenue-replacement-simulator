'use client';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  description?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  description,
}: NumberInputProps) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-[#2A2A2A]">{label}</label>
      {description && <p className="mb-1.5 text-xs text-[#7A7A7A]">{description}</p>}
      <div className="flex items-center overflow-hidden rounded-md border border-[#E0D9D0] bg-white focus-within:border-[#1B3A2D] focus-within:ring-1 focus-within:ring-[#1B3A2D] transition-all">
        {prefix && (
          <span className="select-none border-r border-[#E0D9D0] bg-[#F5F2EC] px-3 py-2 text-sm font-medium text-[#6B6B6B]">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) onChange(v);
          }}
          className="w-full bg-white px-3 py-2 text-sm text-[#1A1A1A] outline-none stat-number"
        />
        {suffix && (
          <span className="select-none border-l border-[#E0D9D0] bg-[#F5F2EC] px-3 py-2 text-sm font-medium text-[#6B6B6B]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
