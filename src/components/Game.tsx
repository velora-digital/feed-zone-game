import React, { useRef, useEffect } from 'react';
import Player from '@/components/Player';
import Map from '@/components/Map';
import Scene from '@/components/Scene';
import { Score, Controls, Result, StartScreen, NearMissFlash, GameHUD } from '@/components/UI';
import { useGameStore } from '@/store/gameStore';

export default function Game() {
  const status = useGameStore((s) => s.status);
  const gameRef = useRef<HTMLDivElement>(null);

  // Auto-focus so keyboard works immediately
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.focus();
    }
    const handleClick = () => gameRef.current?.focus();
    const handleFullscreen = () => setTimeout(() => gameRef.current?.focus(), 100);
    document.addEventListener('click', handleClick);
    document.addEventListener('fullscreenchange', handleFullscreen);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('fullscreenchange', handleFullscreen);
    };
  }, []);

  return (
    <div className="game" ref={gameRef} tabIndex={0} style={{ outline: 'none' }}>
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
