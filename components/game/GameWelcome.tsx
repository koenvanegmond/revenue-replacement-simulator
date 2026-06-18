'use client';

import Link from 'next/link';

interface Props {
  onStart: () => void;
}

export function GameWelcome({ onStart }: Props) {
  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D97706] bg-[#FEF3C7] px-4 py-1.5">
          <span className="text-lg">🏆</span>
          <span className="text-xs font-bold uppercase tracking-widest text-[#B45309]">
            Expo Challenge
          </span>
        </div>

        {/* Title */}
        <h1 className="mb-4 font-[family-name:var(--font-playfair)] text-4xl font-bold text-[#1B3A2D] sm:text-5xl">
          The Silent Grant Challenge
        </h1>

        <p className="mb-2 text-lg font-medium text-[#3A3A3A]">
          Can you save a fine-dining restaurant from the alcohol decline?
        </p>

        <p className="mb-10 text-sm leading-relaxed text-[#6A6A6A]">
          Pick a numbered card from the bag and enter its restaurant data. Then adjust three
          financial levers to close the 2030 profit gap — but watch out for aggressive settings
          that cost you penalty points. The highest net recovery wins.
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group mb-5 w-full max-w-xs rounded-xl bg-[#1B3A2D] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-[#244E3C] hover:shadow-xl active:scale-95"
        >
          <span className="flex items-center justify-center gap-2">
            Start Challenge
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        </button>

        <div>
          <Link
            href="/leaderboard"
            className="text-sm text-[#8A8A8A] underline underline-offset-4 hover:text-[#1B3A2D] transition-colors"
          >
            View leaderboard
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-left">
          {[
            { step: '1', title: 'Pick a card', desc: 'Take a numbered card from the bag' },
            { step: '2', title: 'Enter the data', desc: 'Type in the restaurant metrics on your card' },
            { step: '3', title: 'Close the gap', desc: 'Adjust the levers to recover maximum profit' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="rounded-xl border border-[#E8E3DC] bg-white p-4">
              <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#1B3A2D] text-xs font-bold text-white">
                {step}
              </div>
              <p className="text-xs font-semibold text-[#1B3A2D]">{title}</p>
              <p className="mt-0.5 text-xs text-[#7A7A7A]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
