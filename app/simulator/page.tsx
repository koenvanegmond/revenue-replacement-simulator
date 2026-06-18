'use client';

import { useReducer } from 'react';
import Link from 'next/link';
import { SimulatorState, SimulatorAction } from '@/lib/types';
import { calcStep1, calcStep2, calcStep3 } from '@/lib/calculations';
import { Step1 } from '@/components/Step1';
import { Step2 } from '@/components/Step2';
import { Step3 } from '@/components/Step3';

// ─── Default values representative of a mid-scale Dutch fine-dining restaurant ──
const initialState: SimulatorState = {
  step: 1,
  covers: 800,
  avgSpend: 75,
  beverageShare: 35,
  alcoholShare: 85,
  alcoholMargin: 75,
  naMargin: 70,
  foodMargin: 65,
  declineRate: 25,
  // Lever 1 — NA strategy (defaults match Le Bistro bottled profile)
  restaurantId: 'le-bistro',
  naStrategy: 'bottled',
  naPlayerSetPrice: 15,
  naScheduledLaborHours: 0,
  // Lever 2 — menu engineering
  starPromotion: 25,
  plowhorseEngineering: 20,
  puzzleActivation: 25,
  dogReplacement: 0,
  // Lever 3 — spend per table
  welcomeConversion: 25,
  welcomePrice: 8,
  dessertAttachRate: 2,
  coffeeAttachRate: 60,
};

function reducer(state: SimulatorState, action: SimulatorAction): SimulatorState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'UPDATE':
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
}

const STEPS = [
  { n: 1 as const, label: 'Current Situation' },
  { n: 2 as const, label: '2030 Scenario' },
  { n: 3 as const, label: 'Interventions' },
];

export default function SimulatorPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const step1Results = calcStep1(state);
  const step2Results = calcStep2(state);
  const step3Results = calcStep3(state);

  const setStep = (s: 1 | 2 | 3) => dispatch({ type: 'SET_STEP', payload: s });

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="border-b border-[#DDD7CF] bg-[#1B3A2D]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link href="/" className="text-xs font-medium uppercase tracking-[0.2em] text-[#8FC4A8] hover:text-white transition-colors">
                ← Hotelschool The Hague — Graduation Thesis 2025
              </Link>
              <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl">
                Revenue Replacement Simulator
              </h1>
            </div>
            <p className="text-sm text-[#8FC4A8]">
              Fine-Dining Financial Resilience · 2030 Outlook
            </p>
          </div>
        </div>
      </header>

      {/* ── Step navigator ── */}
      <div className="border-b border-[#DDD7CF] bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex">
            {STEPS.map(({ n, label }, i) => (
              <button
                key={n}
                onClick={() => n < state.step || n === state.step ? setStep(n) : undefined}
                disabled={n > state.step}
                className={`relative flex items-center gap-2.5 border-b-2 px-4 py-4 text-sm font-medium transition-colors disabled:cursor-default ${
                  state.step === n
                    ? 'border-[#1B3A2D] text-[#1B3A2D]'
                    : n < state.step
                    ? 'border-transparent text-[#5A5A5A] hover:text-[#1B3A2D]'
                    : 'border-transparent text-[#AAAAAA]'
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    state.step === n
                      ? 'bg-[#1B3A2D] text-white'
                      : n < state.step
                      ? 'bg-[#2E7D5A] text-white'
                      : 'bg-[#E8E3DC] text-[#AAAAAA]'
                  }`}
                >
                  {n < state.step ? (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    n
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
                {i < STEPS.length - 1 && (
                  <span className="absolute -right-px top-1/2 -translate-y-1/2 text-[#DDD7CF]">/</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {state.step === 1 && <Step1 state={state} dispatch={dispatch} results={step1Results} />}
        {state.step === 2 && <Step2 state={state} dispatch={dispatch} results={step2Results} />}
        {state.step === 3 && <Step3 state={state} dispatch={dispatch} results={step3Results} />}

        <div className="mt-10 flex items-center justify-between border-t border-[#E8E3DC] pt-6">
          <button
            onClick={() => setStep((state.step - 1) as 1 | 2 | 3)}
            disabled={state.step === 1}
            className="flex items-center gap-2 rounded-lg border border-[#E0D9D0] bg-white px-5 py-2.5 text-sm font-medium text-[#3A3A3A] transition-all hover:border-[#1B3A2D] hover:text-[#1B3A2D] disabled:cursor-default disabled:opacity-30"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back
          </button>
          <p className="text-xs text-[#9A9A9A]">
            {state.step === 1 && 'Enter your restaurant data to begin'}
            {state.step === 2 && 'Set your decline assumption, then model interventions'}
            {state.step === 3 && 'Adjust the levers to close the gap'}
          </p>
          {state.step < 3 ? (
            <button
              onClick={() => setStep((state.step + 1) as 1 | 2 | 3)}
              className="flex items-center gap-2 rounded-lg bg-[#1B3A2D] px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-[#244E3C]"
            >
              {state.step === 1 ? 'View 2030 Scenario' : 'Configure Interventions'}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          ) : (
            <button
              onClick={() => dispatch({ type: 'SET_STEP', payload: 1 })}
              className="flex items-center gap-2 rounded-lg border border-[#1B3A2D] px-5 py-2.5 text-sm font-medium text-[#1B3A2D] transition-all hover:bg-[#1B3A2D] hover:text-white"
            >
              Reset &amp; Start Over
            </button>
          )}
        </div>
      </main>

      <footer className="mt-8 border-t border-[#DDD7CF] py-6 text-center">
        <p className="text-xs text-[#9A9A9A]">
          Revenue Replacement Simulator · Hotelschool The Hague Thesis 2025 ·
          Data: CBS (2024), IWSR (2024), Prinsen et al. (2018), Morrison (1996)
        </p>
      </footer>
    </div>
  );
}
