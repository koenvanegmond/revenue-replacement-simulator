import { LeaderboardEntry } from './game-types';

const STORAGE_KEY = 'leaderboard:entries';

export function getLeaderboard(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as LeaderboardEntry[]) : [];
  } catch {
    return [];
  }
}

export function addEntry(entry: Omit<LeaderboardEntry, 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const entries = getLeaderboard();
  entries.push({ ...entry, timestamp: Date.now() });
  entries.sort((a, b) => b.score_percent - a.score_percent);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearLeaderboard(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getTopEntries(n = 10): LeaderboardEntry[] {
  return getLeaderboard().slice(0, n);
}
