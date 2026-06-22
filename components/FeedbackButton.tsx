'use client';

const FEEDBACK_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScux2nRn-JkDVItBpSAPKTsHCUw3bbYlezs1iSX1b6qYYjytA/viewform';

export function FeedbackButton() {
  return (
    <a
      href={FEEDBACK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-[9998] rounded-full bg-[#1B3A2D] hover:bg-[#2A4F3F] text-white px-4 py-2.5 text-sm font-medium shadow-lg ring-1 ring-black/10 transition"
    >
      Give Feedback ↗
    </a>
  );
}
