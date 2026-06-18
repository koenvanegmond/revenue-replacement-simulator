'use client';

import { useEffect, useState } from 'react';
import { GameScreen, CardData, GameLevers, DEFAULT_LEVERS, DEFAULT_CARD } from '@/lib/game-types';
import { GameScore } from '@/lib/game-calculations';
import { ShonenWelcome } from '@/components/game/ShonenWelcome';
import { RestaurantPicker } from '@/components/game/RestaurantPicker';
import { Challenge } from '@/components/game/Challenge';
import { GameResult } from '@/components/game/GameResult';
import { audioManager } from '@/lib/audio';

interface GameState {
  screen: GameScreen;
  card: CardData;
  levers: GameLevers;
  score: GameScore | null;
  hasMovedSlider: boolean;
}

const initialState: GameState = {
  screen: 'welcome',
  card: DEFAULT_CARD,
  levers: DEFAULT_LEVERS,
  score: null,
  hasMovedSlider: false,
};

export default function GamePage() {
  const [state, setState] = useState<GameState>(initialState);

  // Crossfade background music based on screen. ShonenWelcome handles the
  // initial autoplay-on-gesture retry; this effect handles all subsequent
  // transitions with a smooth fade-out before swapping tracks.
  useEffect(() => {
    let cancelled = false;
    const target =
      state.screen === 'welcome' || state.screen === 'restaurant-picker'
        ? '/audio/intro-music.mp3'
        : '/audio/restaurant-music.mp3'; // challenge + result share one track
    if (audioManager.nowPlaying === target) return; // already on the right track
    (async () => {
      await audioManager.fadeOut(500);
      if (cancelled) return;
      audioManager.play(target, { volume: 0.35 });
    })();
    return () => { cancelled = true; };
  }, [state.screen]);

  // Stop audio entirely on unmount (navigation away from /game).
  useEffect(() => () => { audioManager.stop(); }, []);

  const go = (screen: GameScreen) => setState((s) => ({ ...s, screen }));

  function handleRestaurantSelect(card: CardData) {
    setState((s) => ({ ...s, card, levers: DEFAULT_LEVERS, hasMovedSlider: false, screen: 'challenge' }));
  }

  function handleLeversChange(levers: GameLevers) {
    setState((s) => ({ ...s, levers, hasMovedSlider: true }));
  }

  function handleSubmitScore(score: GameScore) {
    setState((s) => ({ ...s, score, screen: 'result' }));
  }

  function handlePlayAgain() {
    setState(initialState);
  }

  return (
    <>
      {state.screen === 'welcome' && (
        <ShonenWelcome onStart={() => go('restaurant-picker')} />
      )}
      {state.screen === 'restaurant-picker' && (
        <RestaurantPicker
          onSelect={handleRestaurantSelect}
          onBack={() => go('welcome')}
        />
      )}
      {state.screen === 'challenge' && (
        <Challenge
          card={state.card}
          levers={state.levers}
          onChange={handleLeversChange}
          onSubmit={handleSubmitScore}
          hasMovedSlider={state.hasMovedSlider}
        />
      )}
      {state.screen === 'result' && state.score && (
        <GameResult
          card={state.card}
          levers={state.levers}
          score={state.score}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </>
  );
}
