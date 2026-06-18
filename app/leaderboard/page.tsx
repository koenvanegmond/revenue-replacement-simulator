'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { LeaderboardView } from '@/components/game/LeaderboardView';

function LeaderboardContent() {
  const params = useSearchParams();
  const isAdmin = params.get('admin') === 'true';

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <header className="border-b border-[#DDD7CF] bg-[#1B3A2D] px-6 py-5">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="text-xs font-medium uppercase tracking-widest text-[#8FC4A8] hover:text-white transition-colors">
            ← Back to home
          </Link>
          <div className="mt-1 flex items-end justify-between">
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
              Challenge Leaderboard
            </h1>
            <span className="text-sm text-[#8FC4A8]">Top 10 scores</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 rounded-xl border border-[#D4C5A9] bg-[#F5F0E8] px-4 py-3 text-sm text-[#6A5A40]">
          <span className="font-semibold">Scoring: </span>
          Net gap recovery after staff/training penalties for aggressive slider settings.
          100% = gap fully closed. Higher is better.
        </div>

        <LeaderboardView showReset={isAdmin} />

        <div className="mt-8 flex gap-4 text-center">
          <Link
            href="/game"
            className="flex-1 rounded-xl bg-[#1B3A2D] py-3 text-sm font-bold text-white transition-all hover:bg-[#244E3C]"
          >
            Play the Challenge →
          </Link>
          <Link
            href="/simulator"
            className="flex-1 rounded-xl border border-[#E0D9D0] bg-white py-3 text-sm font-medium text-[#3A3A3A] transition-all hover:border-[#1B3A2D]"
          >
            Open Simulator
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF7F2]" />}>
      <LeaderboardContent />
    </Suspense>
  );
}
