import React from 'react';
import Player from '@/components/Player';
import Map from '@/components/Map';
import Scene from '@/components/Scene';
import { Score, Controls, Result, CornScore, FeedScore, MusicToggle } from '@/components/UI';

export default function Game() {
  return (
    <div className="game">
      <Scene>
        <Player />
        <Map />
      </Scene>
      <Score />
      <FeedScore />
      <CornScore />
      <MusicToggle />
      <Controls />
      <Result />
    </div>
  );
}
