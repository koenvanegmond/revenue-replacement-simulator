'use client';

import { useEffect, useState } from 'react';
import { LeaderboardEntry } from '@/lib/game-types';
import { getTopEntries, clearLeaderboard } from '@/lib/leaderboard';

interface Props {
  showReset?: boolean;
  compact?: boolean;
}

function scoreColor(pct: number): string {
  if (pct >= 90) return 'text-[#2E7D5A]';
  if (pct >= 50) return 'text-[#D97706]';
  return 'text-[#9E3A3A]';
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

export function LeaderboardView({ showReset = false, compact = false }: Props) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getTopEntries(10));
  }, []);

  function handleClear() {
    if (confirm('Clear the entire leaderboard?')) {
      clearLeaderboard();
      setEntries([]);
    }
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-[#E8E3DC] bg-white px-6 py-10 text-center">
        <p className="text-2xl">🏆</p>
        <p className="mt-2 font-semibold text-[#3A3A3A]">No scores yet</p>
        <p className="mt-1 text-sm text-[#7A7A7A]">Be the first to complete the challenge!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E3DC] bg-[#F5F2EC]">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Player</th>
              {!compact && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Restaurant</th>
              )}
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">Score</th>
              {!compact && (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">When</th>
              )}
            </tr>
          </thead>
          <tbody>
            {entries.map((e, i) => (
              <tr key={e.timestamp} className="border-b border-[#F0EBE3] last:border-0 hover:bg-[#FAF7F2] transition-colors">
                <td className="px-4 py-3">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (
                    <span className="text-sm font-medium text-[#9A9A9A]">{i + 1}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold text-[#1A1A1A]">{e.name}</td>
                {!compact && (
                  <td className="px-4 py-3 text-[#5A5A5A]">{e.restaurant}</td>
                )}
                <td className={`px-4 py-3 text-right text-base font-bold stat-number ${scoreColor(e.score_percent)}`}>
                  {e.score_percent.toFixed(1)}%
                </td>
                {!compact && (
                  <td className="px-4 py-3 text-right text-xs text-[#AAAAAA]">{timeAgo(e.timestamp)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showReset && (
        <div className="mt-4 text-right">
          <button
            onClick={handleClear}
            className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            Reset leaderboard
          </button>
        </div>
      )}
    </div>
  );
}
