import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2]">
      {/* ── Header ── */}
      <header className="bg-[#1B3A2D] px-6 py-4 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#8FC4A8]">
          Hotelschool The Hague — Graduation Thesis 2025
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-white sm:text-2xl">
          Fine-Dining Financial Resilience · The Silent Grant
        </h1>
      </header>

      {/* ── Main choice ── */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        <div className="mb-10 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#1B3A2D] sm:text-4xl">
            Choose your mode
          </h2>
          <p className="mt-3 text-base text-[#6A6A6A]">
            A research tool and a live challenge — two ways into the same financial model.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-5 sm:grid-cols-2">
          {/* ── Professional Tool ── */}
          <Link
            href="/simulator"
            className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#1B3A2D] p-8 transition-all hover:bg-[#244E3C] hover:shadow-xl"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#2E6B4F]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8FC4A8" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3 3v18h18" />
                <path d="M7 16l4-4 4 4 4-4" />
              </svg>
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#8FC4A8]">
              Professional Tool
            </p>
            <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
              Revenue Replacement Simulator
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-[#A8C4B4]">
              Three-step financial analysis tool. Enter your restaurant data, model the 2030
              alcohol decline, and configure interventions to stress-test your P&amp;L.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#8FC4A8] group-hover:text-white transition-colors">
              Open Simulator
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </Link>

          {/* ── Challenge Mode ── */}
          <Link
            href="/game"
            className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-[#D4C5A9] bg-white p-8 transition-all hover:border-[#1B3A2D] hover:shadow-xl"
          >
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FEF3C7]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#D97706]">
              Expo Challenge
            </p>
            <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#1B3A2D]">
              The Silent Grant Challenge
            </h3>
            <p className="mb-8 text-sm leading-relaxed text-[#5A5A5A]">
              Pick a card from the bag, enter the numbers, and adjust three levers to save
              your restaurant from the 2030 profit gap. Compete on the live leaderboard.
            </p>
            <div className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#1B3A2D] group-hover:text-[#D97706] transition-colors">
              Start Challenge
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </div>
          </Link>
        </div>

        {/* ── Leaderboard link ── */}
        <div className="mt-8">
          <Link
            href="/leaderboard"
            className="text-sm text-[#8A8A8A] underline underline-offset-4 hover:text-[#1B3A2D] transition-colors"
          >
            View challenge leaderboard →
          </Link>
        </div>
      </main>

      <footer className="border-t border-[#DDD7CF] py-4 text-center">
        <p className="text-xs text-[#AAAAAA]">
          Hotelschool The Hague Thesis 2025 · Data: CBS (2024), IWSR (2024)
        </p>
      </footer>
    </div>
  );
}
