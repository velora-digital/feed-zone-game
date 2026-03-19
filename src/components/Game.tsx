import React from 'react';
import Player from '@/components/Player';
import Map from '@/components/Map';
import Scene from '@/components/Scene';
import { Score, Controls, Result, MusetteScore, FeedScore, MusicToggle, StartScreen } from '@/components/UI';
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
          <FeedScore />
          <MusetteScore />
          <MusicToggle />
          <Controls />
        </>
      )}
      {status === 'over' && <Result />}
    </div>
  );
}
