'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { audioManager } from '@/lib/audio';

interface Props {
  onStart: () => void;
}

export function ShonenWelcome({ onStart }: Props) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (!titleRef.current || !raysRef.current) return;
      const x = (window.innerWidth / 2 - e.pageX) / 40;
      const y = (window.innerHeight / 2 - e.pageY) / 40;
      titleRef.current.style.transform = `translate(${x}px, ${y}px) skewX(-10deg) scale(1.1)`;
      raysRef.current.style.transform = `translate(${-x / 2}px, ${-y / 2}px) scale(2) rotate(${x}deg)`;
    }
    document.addEventListener('mousemove', handleMouseMove);
    // Autoplay may be blocked until first user gesture; retry on any pointer/key event.
    audioManager.play('/audio/intro-music.mp3', { volume: 0.35 });
    function kickAudio() {
      audioManager.play('/audio/intro-music.mp3', { volume: 0.35 });
    }
    document.addEventListener('pointerdown', kickAudio, { once: true });
    document.addEventListener('keydown', kickAudio, { once: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('pointerdown', kickAudio);
      document.removeEventListener('keydown', kickAudio);
    };
  }, []);

  function handleStart() {
    // Music transition is handled by app/game/page.tsx based on screen state.
    onStart();
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-b from-[#87CEEB] via-[#B0E2FF] to-[#E0F7FF]">
      {/* ── Header ── */}
      <header className="relative z-50 border-b border-white/20 bg-white/30 backdrop-blur-md">
        <div className="mx-auto flex h-20 w-full max-w-[1280px] items-center justify-between px-10">
          <div className="font-[family-name:var(--font-archivo-black)] text-xl italic uppercase tracking-widest text-blue-900 drop-shadow-sm">
            SAVE THE RESTAURANT
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="/leaderboard" className="font-bold text-blue-800 transition-colors duration-300 hover:text-blue-600">
              High Scores
            </Link>
            <Link href="/simulator" className="font-medium text-blue-800 transition-colors duration-300 hover:text-blue-600">
              Simulator
            </Link>
          </nav>
          <button
            onClick={handleStart}
            className="border-b-4 border-blue-800 bg-blue-600 px-6 py-2 text-[13px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-500 active:scale-95"
          >
            ENTER THE CHALLENGE
          </button>
        </div>
      </header>

      {/* ── Main hero canvas ── */}
      <main className="relative flex flex-grow items-center justify-center overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div ref={raysRef} className="ki-rays absolute inset-0 origin-center opacity-40" />
          <div className="energy-sphere absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-60" />
          <div className="energy-sphere absolute -left-10 bottom-40 h-64 w-64 rounded-full opacity-30" />
          <div className="speed-lines absolute inset-0 opacity-20" />
        </div>

        {/* Floating character */}
        <div className="character-float pointer-events-none absolute bottom-0 right-0 z-20 h-4/5 md:right-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/hero-character.png"
            alt="Anime hero with wine"
            className="h-full w-auto object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%), linear-gradient(to top, transparent 0%, black 12%)',
              WebkitMaskComposite: 'source-in',
              maskImage: 'linear-gradient(to right, transparent 0%, black 18%), linear-gradient(to top, transparent 0%, black 12%)',
              maskComposite: 'intersect',
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-30 mx-auto flex max-w-[1280px] flex-col items-center justify-center space-y-4 px-10 text-center">
          {/* S-RANK badge */}
          <div className="mb-2 animate-bounce">
            <span className="inline-block -skew-x-12 border-4 border-white bg-yellow-400 px-6 py-1.5 text-[12px] font-black italic tracking-widest text-blue-900 shadow-lg">
              S-RANK DIFFICULTY
            </span>
          </div>

          {/* Title */}
          <div className="aura-glow">
            <h1
              ref={titleRef}
              className="shonen-title mb-4 text-[72px] uppercase tracking-tighter md:text-[150px]"
              data-text="SAVE THE RESTAURANT"
            >
              SAVE THE<br className="md:hidden" /> RESTAURANT
            </h1>
          </div>

          {/* Subtitle */}
          <p className="mb-8 max-w-2xl text-xl font-black uppercase italic leading-tight text-blue-900 opacity-90 drop-shadow-md md:text-2xl">
            By 2030, the alcohol decline will hit fine-dining hard.
            <br className="hidden md:block" />
            <span className="font-black text-orange-600 underline decoration-4 underline-offset-4">
              CAN YOU CLOSE THE GAP?
            </span>
          </p>

          {/* CTA button */}
          <button
            onClick={handleStart}
            className="group relative overflow-hidden border-4 border-white bg-[#FF4500] px-16 py-6 text-2xl font-black italic tracking-tighter text-white shadow-[8px_8px_0px_rgba(0,0,0,0.2)] transition-all hover:-translate-y-1 hover:scale-110 active:translate-y-1 active:shadow-none"
          >
            <div className="absolute inset-0 -translate-x-full skew-x-12 bg-white/30 transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10 flex items-center gap-3">
              ENTER THE CHALLENGE
              <span className="text-3xl font-bold">⚡</span>
            </span>
          </button>

          {/* KI energy meter */}
          <div className="mt-8 flex items-center gap-4">
            <div className="-skew-x-12 flex flex-col items-start border-2 border-white/60 bg-white/40 p-3 backdrop-blur-sm">
              <span className="text-[12px] font-black uppercase tracking-tighter text-blue-900">
                KI ENERGY LEVELS
              </span>
              <div className="relative mt-1 h-3 w-48 border border-blue-900/30 bg-blue-900/20">
                <div className="h-full w-[85%] animate-pulse bg-gradient-to-r from-yellow-300 to-orange-500" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="z-30 border-t border-blue-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center justify-between gap-4 px-10 py-4 md:flex-row">
          <div className="font-[family-name:var(--font-archivo-black)] text-lg italic text-blue-900">
            REVENUE REPLACEMENT SIMULATOR
          </div>
          <div className="flex gap-8 text-sm font-bold text-blue-800">
            <Link href="/leaderboard" className="underline decoration-orange-400/30 underline-offset-4 transition-all hover:text-orange-600">
              View Leaderboard
            </Link>
            <Link href="/simulator" className="underline decoration-orange-400/30 underline-offset-4 transition-all hover:text-orange-600">
              Open Simulator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
