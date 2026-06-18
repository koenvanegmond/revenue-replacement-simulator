'use client';

interface InfoBoxProps {
  title: string;
  children: React.ReactNode;
}

export function InfoBox({ title, children }: InfoBoxProps) {
  return (
    <div className="mt-6 flex gap-3 rounded-lg border border-[#D4C5A9] bg-[#F5F0E8] px-4 py-4">
      <div className="mt-0.5 flex-shrink-0 text-[#1B3A2D]">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#1B3A2D]">
          {title}
        </p>
        <div className="text-sm leading-relaxed text-[#4A4A4A]">{children}</div>
      </div>
    </div>
  );
}
