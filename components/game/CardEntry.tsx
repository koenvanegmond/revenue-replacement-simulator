'use client';

import { useState } from 'react';
import { CardData, DEFAULT_CARD } from '@/lib/game-types';

interface Props {
  onSubmit: (card: CardData) => void;
  onBack: () => void;
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-[#2A2A2A]">{label}</label>
      {description && <p className="mb-1.5 text-xs text-[#8A8A8A]">{description}</p>}
      {children}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-[#E0D9D0] bg-white px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#1B3A2D] focus:ring-1 focus:ring-[#1B3A2D] transition-all';

export function CardEntry({ onSubmit, onBack }: Props) {
  const [card, setCard] = useState<CardData>(DEFAULT_CARD);
  const [errors, setErrors] = useState<Partial<Record<keyof CardData, string>>>({});

  const upd = <K extends keyof CardData>(key: K, value: CardData[K]) =>
    setCard((c) => ({ ...c, [key]: value }));

  function validate(): boolean {
    const e: Partial<Record<keyof CardData, string>> = {};
    if (!card.restaurantName.trim()) e.restaurantName = 'Required';
    if (!card.restaurantType.trim()) e.restaurantType = 'Required';
    if (card.covers <= 0) e.covers = 'Enter covers > 0';
    if (card.avgSpend <= 0) e.avgSpend = 'Enter spend > 0';
    if (card.beverageShare <= 0 || card.beverageShare > 100) e.beverageShare = '1–100';
    if (card.alcoholShare <= 0 || card.alcoholShare > 100) e.alcoholShare = '1–100';
    if (card.declineRate <= 0 || card.declineRate > 100) e.declineRate = '1–100';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (validate()) onSubmit(card);
  }

  function numInput(
    key: keyof CardData,
    suffix?: string,
    min?: number,
    max?: number,
  ) {
    return (
      <div className="flex overflow-hidden rounded-lg border border-[#E0D9D0] bg-white focus-within:border-[#1B3A2D] focus-within:ring-1 focus-within:ring-[#1B3A2D] transition-all">
        <input
          type="number"
          value={(card[key] as number) || ''}
          min={min}
          max={max}
          onChange={(e) => upd(key, Number(e.target.value) as CardData[typeof key])}
          className="w-full bg-transparent px-3 py-2 text-sm outline-none stat-number"
        />
        {suffix && (
          <span className="flex items-center border-l border-[#E0D9D0] bg-[#F5F2EC] px-3 text-sm font-medium text-[#6B6B6B]">
            {suffix}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm text-[#7A7A7A] hover:text-[#1B3A2D] transition-colors">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M10 3L5 8l5 5" />
        </svg>
        Back
      </button>

      <h2 className="mb-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1B3A2D]">
        Enter your card&apos;s numbers
      </h2>
      <p className="mb-8 text-sm text-[#6A6A6A]">
        Find these values on the physical card you picked.
      </p>

      <div className="rounded-xl border border-[#E8E3DC] bg-white p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Restaurant</p>

        <Field label="Restaurant name" >
          <input
            type="text"
            value={card.restaurantName}
            onChange={(e) => upd('restaurantName', e.target.value)}
            placeholder="e.g. Le Bistro Moderne"
            className={inputClass}
          />
          {errors.restaurantName && <p className="mt-1 text-xs text-red-500">{errors.restaurantName}</p>}
        </Field>

        <Field label="Restaurant type">
          <input
            type="text"
            value={card.restaurantType}
            onChange={(e) => upd('restaurantType', e.target.value)}
            placeholder="e.g. Midscale Fine-Dining"
            className={inputClass}
          />
          {errors.restaurantType && <p className="mt-1 text-xs text-red-500">{errors.restaurantType}</p>}
        </Field>

        <p className="mb-4 mt-6 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Volume</p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Covers per month">
            {numInput('covers', undefined, 1)}
            {errors.covers && <p className="mt-1 text-xs text-red-500">{errors.covers}</p>}
          </Field>
          <Field label="Avg spend per cover">
            {numInput('avgSpend', '€', 1)}
            {errors.avgSpend && <p className="mt-1 text-xs text-red-500">{errors.avgSpend}</p>}
          </Field>
        </div>

        <p className="mb-4 mt-2 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Revenue Mix</p>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Bev. share" description="% of total revenue">
            {numInput('beverageShare', '%', 1, 100)}
            {errors.beverageShare && <p className="mt-1 text-xs text-red-500">{errors.beverageShare}</p>}
          </Field>
          <Field label="Alcohol share" description="% of beverages">
            {numInput('alcoholShare', '%', 1, 100)}
            {errors.alcoholShare && <p className="mt-1 text-xs text-red-500">{errors.alcoholShare}</p>}
          </Field>
          <Field label="2030 decline" description="% drop in alc. rev.">
            {numInput('declineRate', '%', 1, 100)}
            {errors.declineRate && <p className="mt-1 text-xs text-red-500">{errors.declineRate}</p>}
          </Field>
        </div>

        <p className="mt-2 rounded-lg bg-[#F5F0E8] px-3 py-2 text-xs text-[#7A6A50]">
          Gross margins are fixed at standard industry values (alcohol 75%, NA 70%, food 65%) to keep things simple.
        </p>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full rounded-xl bg-[#1B3A2D] py-3.5 text-base font-bold text-white shadow transition-all hover:bg-[#244E3C] active:scale-95"
      >
        Reveal my 2030 gap →
      </button>
    </div>
  );
}
