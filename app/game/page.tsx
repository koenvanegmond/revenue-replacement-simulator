'use client';

import { useState } from 'react';
import { GameScreen, CardData, GameLevers, DEFAULT_LEVERS, DEFAULT_CARD } from '@/lib/game-types';
import { GameScore } from '@/lib/game-calculations';
import { ShonenWelcome } from '@/components/game/ShonenWelcome';
import { RestaurantPicker } from '@/components/game/RestaurantPicker';
import { Challenge } from '@/components/game/Challenge';
import { GameResult } from '@/components/game/GameResult';

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
