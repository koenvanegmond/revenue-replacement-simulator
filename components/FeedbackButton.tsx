'use client';

export const FEEDBACK_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScux2nRn-JkDVItBpSAPKTsHCUw3bbYlezs1iSX1b6qYYjytA/viewform';

export function FeedbackButton() {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="feedback-btn-pulse fixed bottom-5 right-5 z-[9998] flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 hover:from-fuchsia-500 hover:via-pink-400 hover:to-orange-400 text-white px-5 py-3 text-sm font-semibold shadow-xl ring-2 ring-white/40 transition-transform hover:scale-105"
    >
      <span aria-hidden>💬</span>
      <span>Give Feedback</span>
      <span aria-hidden>↗</span>
    </a>
  );
}

// Big in-page CTA — used on the game result screen so players don't miss it.
export function FeedbackCallout() {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-2xl bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 p-[2px] shadow-lg transition-transform hover:scale-[1.01]"
    >
      <div className="rounded-2xl bg-white px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl" aria-hidden>📝</span>
              <h3 className="bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 bg-clip-text text-base font-bold text-transparent sm:text-lg">
                Help me graduate — share your feedback
              </h3>
            </div>
            <p className="text-sm text-stone-600">
              Two minutes of your time directly shapes my Hotelschool thesis.
              Anonymous, 7 short questions.
            </p>
          </div>
          <div className="hidden sm:block">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
              Open form ↗
            </span>
          </div>
        </div>
        <div className="mt-3 sm:hidden">
          <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-fuchsia-600 via-pink-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md">
            Open form ↗
          </span>
        </div>
      </div>
    </a>
  );
}
