// Feedback storage. Uses localStorage — note that this is per-browser, not
// truly shared across devices. For wider data collection you'd need a backend.

export type FeedbackBackground =
  | 'hospitality_professional'
  | 'hospitality_student'
  | 'other_student_professional'
  | 'other';

export type FeedbackMode = 'simulator' | 'game' | 'both';

export type FeedbackAwareness = 'already_aware' | 'general_sense' | 'new_to_me';

export type FeedbackLeverClarity = 'yes_clearly' | 'partly' | 'no_confusing';

export type FeedbackWouldUse = 'yes' | 'no' | 'maybe';

export interface FeedbackEntry {
  background: FeedbackBackground;
  mode: FeedbackMode;
  awareness: FeedbackAwareness;
  awareness_comment: string;
  lever_clarity: FeedbackLeverClarity;
  lever_clarity_comment: string;
  would_use: FeedbackWouldUse;
  would_use_comment: string;
  suggestions: string;
  other_comments: string;
  timestamp: number;
}

const STORAGE_KEY = 'feedback:entries';

export function loadFeedback(): FeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFeedback(entry: FeedbackEntry): void {
  if (typeof window === 'undefined') return;
  const all = loadFeedback();
  all.push(entry);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function clearFeedback(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function exportFeedbackCSV(entries: FeedbackEntry[]): string {
  const headers = [
    'timestamp',
    'background',
    'mode',
    'awareness',
    'awareness_comment',
    'lever_clarity',
    'lever_clarity_comment',
    'would_use',
    'would_use_comment',
    'suggestions',
    'other_comments',
  ];
  const escape = (v: string | number) => {
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const rows = entries.map((e) =>
    [
      new Date(e.timestamp).toISOString(),
      e.background,
      e.mode,
      e.awareness,
      e.awareness_comment,
      e.lever_clarity,
      e.lever_clarity_comment,
      e.would_use,
      e.would_use_comment,
      e.suggestions,
      e.other_comments,
    ]
      .map(escape)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}
