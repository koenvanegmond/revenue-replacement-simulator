'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CardData, GameLevers, AGGRESSIVE_THRESHOLD, DEFAULT_LEVERS } from '@/lib/game-types';
import { GameScore, getLeverFeedback, getCoachingSummary } from '@/lib/game-calculations';
import { addEntry } from '@/lib/leaderboard';
import { fmt, fmtPct } from '@/lib/calculations';
import { FeedbackCallout } from '@/components/FeedbackButton';

interface Props {
  card: CardData;
  levers: GameLevers;
  score: GameScore;
  onPlayAgain: () => void;
}

function getVerdict(pct: number): { label: string; sub: string; color: string; bg: string } {
  if (pct >= 100) return { label: 'Resilient', sub: 'Your restaurant survives the Silent Grant — the model holds.', color: '#FFFFFF', bg: '#1B3A2D' };
  if (pct >= 70) return { label: 'Strong', sub: "You closed most of the gap, but it isn't fully sealed.", color: '#FFFFFF', bg: '#2E7D5A' };
  if (pct >= 40) return { label: 'Partial', sub: 'Your restaurant is exposed — the gap is only partly closed.', color: '#FFFFFF', bg: '#D97706' };
  return { label: 'Critical', sub: 'Alcohol decline will hit hard. The interventions were insufficient.', color: '#FFFFFF', bg: '#9E3A3A' };
}

export function GameResult({ card, levers, score, onPlayAgain }: Props) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const verdict = getVerdict(score.recoveryPercent);
  const pct = Math.min(score.recoveryPercent, 100);

  function handleSubmitLeaderboard() {
    if (!name.trim()) return;
    addEntry({ name: name.trim(), restaurant: card.restaurantName, score_percent: score.recoveryPercent });
    setSubmitted(true);
  }

  // Per-lever feedback
  const naProfit = score.naPairingProfit;
  const upsellProfit = score.welcomePlusDesertProfit;
  const totalProfit =
    naProfit + score.starProfit + score.plowhorseProfit + score.puzzleProfit + upsellProfit;

  // NA strategy feedback: reads strategy + engine outputs, not raw sliders.
  function getNAFeedback(): string {
    const { naWarningLevel, naEffectiveAttachRate, naEffectiveChurnRate, naReviewScoreDelta } = score;
    if (levers.naStrategy === 'bottled') {
      if (naEffectiveChurnRate > 0.45) {
        return 'You went commercial bottled, but guests are dropping out mid-meal for free water. Bottled NA wine has a sugar-trap reputation problem in this segment — it doesn\u2019t hold up.';
      }
      return 'Commercial bottled NA is low-risk but low-margin. It works as a baseline, but it won\u2019t close the gap on its own — the absolute profit per glass is too thin.';
    }
    // in_house
    if (naWarningLevel === 'critical') {
      return `In-house production needs skilled labor. You\u2019re understaffed and it shows: fatigue is hurting quality, and your review score dropped ${Math.abs(naReviewScoreDelta).toFixed(1)} points. High margin only works if you actually staff for it.`;
    }
    if (naWarningLevel === 'stress') {
      return 'In-house production is paying off, but staffing is tight. Push a bit more labor budget here before it starts hurting quality.';
    }
    if (naEffectiveAttachRate > 0.50) {
      return 'Strong result: in-house production at a well-staffed level is winning real attach rate at full margin. This is what the thesis means by closing the Silent Grant with NA.';
    }
    return 'In-house production is well-staffed and profitable, but you could push price or visibility further before guests start pulling back.';
  }
  const naFeedbackText = getNAFeedback();
  const naAggressive = score.naWarningLevel === 'critical';
  const naUnused = naProfit < 200;

  const upsellAggressive = levers.welcomeConversion > AGGRESSIVE_THRESHOLD.welcomeConversion || levers.dessertAttachRate > AGGRESSIVE_THRESHOLD.dessertAttachRate;
  const upsellUnused = Math.abs(levers.welcomeConversion - DEFAULT_LEVERS.welcomeConversion) < 2 && Math.abs(levers.dessertAttachRate - DEFAULT_LEVERS.dessertAttachRate) < 1;

  // Sub-lever (Lever 2) feedback by aggressiveness band — operator language, no jargon.
  function subLeverFeedback(label: string, value: number, highMsg: string, midMsg: string, lowMsg: string) {
    const aggressive = value > 70;
    const unused = value < 30;
    const text = aggressive ? highMsg : unused ? lowMsg : midMsg;
    return { label, aggressive, unused, text };
  }

  const star = subLeverFeedback(
    'Star Promotion',
    levers.starPromotion,
    'You pushed Stars hard — menu fatigue is starting to bite into the gain.',
    'Balanced push on your Stars — solid contribution without burning out the menu.',
    'You left profit on the table — your bestsellers were under-promoted.',
  );
  const plow = subLeverFeedback(
    'Plowhorse Re-engineering',
    levers.plowhorseEngineering,
    'Aggressive Plowhorse cuts — guests will notice the quality drop.',
    'Sensible recipe redesign on your Plowhorses — the biggest realistic lift.',
    'Plowhorses are your volume engine — you barely touched them.',
  );
  const puzzle = subLeverFeedback(
    'Puzzle Activation',
    levers.puzzleActivation,
    'You over-pushed Puzzles — kitchen complexity is eating the margin gain.',
    'Good storytelling on your Puzzles — high-margin items are moving.',
    'Your Puzzles stayed hidden on the menu — easy points missed.',
  );

  const feedbacks: { label: string; profit: number; aggressive: boolean; unused: boolean; text?: string }[] = [
    { label: `NA Strategy — ${levers.naStrategy === 'in_house' ? 'In-House' : 'Bottled'}`, profit: naProfit, aggressive: naAggressive, unused: naUnused, text: naFeedbackText },
    { label: star.label, profit: score.starProfit, aggressive: star.aggressive, unused: star.unused, text: star.text },
    { label: plow.label, profit: score.plowhorseProfit, aggressive: plow.aggressive, unused: plow.unused, text: plow.text },
    { label: puzzle.label, profit: score.puzzleProfit, aggressive: puzzle.aggressive, unused: puzzle.unused, text: puzzle.text },
    { label: 'Welcome + Dessert', profit: upsellProfit, aggressive: upsellAggressive, unused: upsellUnused },
  ];

  const coaching = getCoachingSummary(score, levers);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      {/* ── Hero verdict ── */}
      <div className="mb-8 overflow-hidden rounded-2xl" style={{ background: verdict.bg }}>
        <div className="px-8 py-8 text-center">
          <p className="mb-1 text-sm font-bold uppercase tracking-widest" style={{ color: verdict.color, opacity: 0.7 }}>
            {card.restaurantName} · {card.restaurantType}
          </p>
          <p className="stat-number mb-2 text-7xl font-black" style={{ color: verdict.color }}>
            {pct.toFixed(0)}%
          </p>
          <p className="mb-1 font-[family-name:var(--font-playfair)] text-3xl font-bold" style={{ color: verdict.color }}>
            {verdict.label}
          </p>
          <p className="text-sm" style={{ color: verdict.color, opacity: 0.8 }}>
            {verdict.sub}
          </p>
        </div>

        {/* Score breakdown */}
        <div className="border-t px-8 py-4" style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.15)' }}>
          <div className="grid grid-cols-3 gap-4 text-center text-sm" style={{ color: verdict.color }}>
            <div>
              <p className="opacity-70 text-xs">Gap</p>
              <p className="stat-number font-bold">{fmt(score.gap)}</p>
            </div>
            <div>
              <p className="opacity-70 text-xs">Net recovery</p>
              <p className="stat-number font-bold">{fmt(score.netRecovery)}</p>
            </div>
            <div>
              <p className="opacity-70 text-xs">Penalties</p>
              <p className="stat-number font-bold">
                {score.penaltyCount > 0 ? `−${fmt(score.totalPenalty)}` : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Per-lever feedback ── */}
      <div className="mb-6 rounded-xl border border-[#E8E3DC] bg-white p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#8A8A8A]">
          Lever Analysis
        </h3>
        <div className="space-y-3">
          {feedbacks.map(({ label, profit, aggressive, unused, text: subText }) => {
            const text = subText ?? getLeverFeedback(label, profit, totalProfit, aggressive, unused);
            const icon = unused ? '◯' : aggressive ? '⚠' : '✓';
            const color = unused ? '#9A9A9A' : aggressive ? '#D97706' : '#2E7D5A';
            return (
              <div key={label} className="flex gap-3">
                <span className="mt-0.5 text-sm font-bold flex-shrink-0" style={{ color }}>{icon}</span>
                <div>
                  <p className="text-xs font-semibold text-[#1A1A1A]">{label}</p>
                  <p className="text-xs text-[#6A6A6A]">{text}</p>
                  <p className="text-xs text-[#9A9A9A]">
                    contributed {fmtPct(totalProfit > 0 ? (profit / totalProfit) * 100 : 0)} of gross intervention ({fmt(profit)}/month)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Coaching summary ── */}
      <div className="mb-8 rounded-xl border border-[#D4C5A9] bg-[#F5F0E8] px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8A7A60]">Coaching insight</p>
        <p className="mt-2 text-sm leading-relaxed text-[#4A3A2A]">{coaching}</p>
      </div>

      {/* ── Submit to leaderboard ── */}
      {!submitted ? (
        <div className="mb-6 rounded-xl border border-[#E8E3DC] bg-white p-5">
          <h3 className="mb-1 font-semibold text-[#1B3A2D]">Submit to Leaderboard</h3>
          <p className="mb-4 text-xs text-[#7A7A7A]">Enter your name to post your score of {fmtPct(score.recoveryPercent)}.</p>
          <div className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitLeaderboard()}
              placeholder="Your name"
              maxLength={30}
              className="flex-1 rounded-lg border border-[#E0D9D0] bg-[#FAF7F2] px-3 py-2 text-sm outline-none focus:border-[#1B3A2D] focus:ring-1 focus:ring-[#1B3A2D] transition-all"
            />
            <button
              onClick={handleSubmitLeaderboard}
              disabled={!name.trim()}
              className="rounded-lg bg-[#1B3A2D] px-5 py-2 text-sm font-bold text-white transition-all hover:bg-[#244E3C] disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-[#A8DFBF] bg-[#F0FDF4] px-5 py-4 text-center">
          <p className="font-semibold text-[#1B5E3B]">Score posted to leaderboard! 🏆</p>
          <Link href="/leaderboard" className="mt-1 block text-sm text-[#2E7D5A] underline underline-offset-4 hover:text-[#1B3A2D]">
            View full leaderboard →
          </Link>
        </div>
      )}

      {/* ── Feedback callout (prominent, between leaderboard + action buttons) ── */}
      <div className="mb-6">
        <FeedbackCallout />
      </div>

      {/* ── Action buttons ── */}
      <div className="flex gap-3">
        <button
          onClick={onPlayAgain}
          className="flex-1 rounded-xl border-2 border-[#1B3A2D] py-3 text-base font-bold text-[#1B3A2D] transition-all hover:bg-[#1B3A2D] hover:text-white"
        >
          Play Again
        </button>
        <Link
          href="/leaderboard"
          className="flex-1 rounded-xl bg-[#F5F0E8] py-3 text-center text-base font-bold text-[#6A5A40] transition-all hover:bg-[#E8E0D0]"
        >
          Leaderboard
        </Link>
      </div>
    </div>
  );
}
