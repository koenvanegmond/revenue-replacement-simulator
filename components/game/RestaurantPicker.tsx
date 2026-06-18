'use client';

import { CardData, RESTAURANTS, RestaurantCard } from '@/lib/game-types';
import { fmt, fmtPct } from '@/lib/calculations';

interface Props {
  onSelect: (card: CardData) => void;
  onBack: () => void;
}

const ICONS: Record<string, string> = {
  'le-bistro': '🍽',
  'maison-elegante': '✦',
  'harbour-co': '⚓',
  'stadshotel': '🏨',
  'atelier-noord': '◈',
};

function RestaurantTile({ restaurant, onSelect }: { restaurant: RestaurantCard; onSelect: () => void }) {
  const icon = ICONS[restaurant.id] ?? '🍽';

  return (
    <button
      onClick={onSelect}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-transparent text-left transition-all duration-200 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white/50"
      style={{ background: restaurant.themeColor }}
    >
      {/* Icon area */}
      <div
        className="flex h-32 items-center justify-center text-5xl"
        style={{ background: `linear-gradient(135deg, ${restaurant.themeColor}, ${restaurant.accentColor}33)` }}
      >
        <span className="opacity-90 drop-shadow-lg">{icon}</span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-[family-name:var(--font-playfair)] text-base font-bold leading-tight text-white">
          {restaurant.restaurantName}
        </p>
        <p className="text-xs text-white/70">{restaurant.restaurantType}</p>

        <div className="mt-3 space-y-1">
          {[
            { label: 'Covers/mo', value: restaurant.covers.toLocaleString('nl-NL') },
            { label: 'Avg spend', value: fmt(restaurant.avgSpend) },
            { label: 'Bev. share', value: fmtPct(restaurant.beverageShare) },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-[11px]">
              <span className="text-white/60">{label}</span>
              <span className="font-semibold text-white/90">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Select overlay */}
      <div
        className="absolute inset-0 flex items-center justify-center rounded-2xl opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `${restaurant.themeColor}CC` }}
      >
        <span
          className="rounded-full px-6 py-2.5 text-sm font-black uppercase tracking-widest text-white shadow-lg"
          style={{ background: restaurant.accentColor }}
        >
          Select →
        </span>
      </div>
    </button>
  );
}

export function RestaurantPicker({ onSelect, onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="border-b border-[#DDD7CF] bg-[#1B3A2D] px-6 py-5">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={onBack}
            className="text-xs font-medium uppercase tracking-widest text-[#8FC4A8] hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="mt-1 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
            Pick your restaurant
          </h1>
          <p className="mt-0.5 text-sm text-[#8FC4A8]">
            Find the card you picked up — select that restaurant to begin.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {RESTAURANTS.map((r) => (
            <RestaurantTile
              key={r.id}
              restaurant={r}
              onSelect={() => onSelect(r)}
            />
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-[#9A9A9A]">
          All restaurants use fixed margins: 75% alcohol · 70% NA beverages · 65% food
        </p>
      </main>
    </div>
  );
}
