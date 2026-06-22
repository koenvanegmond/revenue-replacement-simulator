'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FeedbackEntry,
  loadFeedback,
  clearFeedback,
  exportFeedbackCSV,
} from '@/lib/feedback';

const LABELS = {
  background: {
    hospitality_professional: 'Hospitality professional',
    hospitality_student: 'Hospitality student',
    other_student_professional: 'Other student / professional',
    other: 'Other',
  } as Record<string, string>,
  mode: {
    simulator: 'Simulator',
    game: 'Game',
    both: 'Both',
  } as Record<string, string>,
  awareness: {
    already_aware: 'Already aware',
    general_sense: 'General sense, not the scale',
    new_to_me: 'New to me',
  } as Record<string, string>,
  lever_clarity: {
    yes_clearly: 'Yes, clearly',
    partly: 'Partly',
    no_confusing: 'No, confusing',
  } as Record<string, string>,
  would_use: {
    yes: 'Yes',
    no: 'No',
    maybe: 'Maybe',
  } as Record<string, string>,
};

export default function FeedbackResultsPage() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setEntries(loadFeedback());
    setLoaded(true);
  }, []);

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#1B3A2D] mb-2">
            Not available
          </h1>
          <p className="text-sm text-stone-600">
            This page requires admin access.
          </p>
        </div>
      </main>
    );
  }

  function handleExport() {
    const csv = exportFeedbackCSV(entries);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedback-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClear() {
    if (!confirm(`Delete all ${entries.length} feedback entries? This cannot be undone.`)) return;
    clearFeedback();
    setEntries([]);
  }

  return (
    <main className="min-h-screen bg-[#FAF8F4]">
      <header className="border-b border-[#DDD7CF] bg-[#1B3A2D]">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8FC4A8]">
            Admin · Hotelschool The Hague — Graduation Thesis
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-white">
            Feedback Results
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-stone-700">
            <strong>{entries.length}</strong> {entries.length === 1 ? 'entry' : 'entries'} stored in this browser.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={entries.length === 0}
              className="rounded-md bg-[#1B3A2D] hover:bg-[#2A4F3F] disabled:bg-stone-300 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-medium transition"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={entries.length === 0}
              className="rounded-md border border-red-300 bg-white hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed text-red-700 px-4 py-2 text-sm font-medium transition"
            >
              Clear all
            </button>
          </div>
        </div>

        {!loaded ? null : entries.length === 0 ? (
          <p className="rounded-md border border-[#DDD7CF] bg-white p-8 text-center text-sm text-stone-500">
            No feedback yet.
          </p>
        ) : (
          <div className="space-y-4">
            {entries
              .slice()
              .reverse()
              .map((e, i) => (
                <article
                  key={e.timestamp + '-' + i}
                  className="rounded-md border border-[#DDD7CF] bg-white p-5 text-sm text-stone-800"
                >
                  <header className="flex items-center justify-between border-b border-[#EFEBE3] pb-2 mb-3">
                    <span className="text-xs text-stone-500">
                      {new Date(e.timestamp).toLocaleString('nl-NL')}
                    </span>
                    <span className="text-xs font-medium text-[#1B3A2D]">
                      #{entries.length - i}
                    </span>
                  </header>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    <Row label="Background" value={LABELS.background[e.background]} />
                    <Row label="Mode tried" value={LABELS.mode[e.mode]} />
                    <Row label="Awareness" value={LABELS.awareness[e.awareness]} />
                    <Row label="Levers clarity" value={LABELS.lever_clarity[e.lever_clarity]} />
                    <Row label="Would use" value={LABELS.would_use[e.would_use]} />
                  </dl>
                  <Comment label="Awareness comment" value={e.awareness_comment} />
                  <Comment label="Levers — what was unclear" value={e.lever_clarity_comment} />
                  <Comment label="Would-use — why/why not" value={e.would_use_comment} />
                  <Comment label="Suggestions / missing" value={e.suggestions} />
                  <Comment label="Other comments" value={e.other_comments} />
                </article>
              ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-800">{value}</dd>
    </div>
  );
}

function Comment({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="mt-3 pt-3 border-t border-[#EFEBE3]">
      <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">{label}</p>
      <p className="text-sm text-stone-700 whitespace-pre-wrap">{value}</p>
    </div>
  );
}
