import React from 'react';
import Player from '@/components/Player';
import Map from '@/components/Map';
import Scene from '@/components/Scene';
import { Score, Controls, Result, StartScreen, NearMissFlash, GameHUD } from '@/components/UI';
import { useGameStore } from '@/store/gameStore';

export default function Game() {
  const status = useGameStore((s) => s.status);

  return (
    <div className="game">
      <Scene>
        <Player />
        <Map />
      </Scene>
      {status === 'idle' && <StartScreen />}
      {status !== 'idle' && (
        <>
          <Score />
          <GameHUD />
          <NearMissFlash />
          <Controls />
        </>
      )}
      {status === 'over' && <Result />}
    </div>
  );
}
