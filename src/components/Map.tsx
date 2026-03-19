import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useMapStore } from '@/store/mapStore';
import BallLane from './BallLane';
import Corn from './Corn';
import Grass from './Grass';
import LogLane from './LogLane';
import Tree from './Tree';
import { playerState } from '@/logic/playerLogic';
import { visibleTilesDistance } from '@/utils/constants';
import { RowProps, ForestProps, RowData, VergRow } from '@/types';

export default function Map() {
  const rows = useMapStore(state => state.rows);
  // Track player row in React state so Map re-renders as the player advances
  const [currentRow, setCurrentRow] = useState(0);
  useFrame(() => {
    if (playerState.currentRow !== currentRow) {
      setCurrentRow(playerState.currentRow);
    }
  });
  // Only render rows within [-visibleTilesDistance, +visibleTilesDistance] of the player's current row
  const minVisible = Math.max(0, currentRow - visibleTilesDistance);
  const maxVisible = Math.min(
    rows.length - 1,
    currentRow + visibleTilesDistance
  );
  const visibleRows = rows
    .slice(minVisible, maxVisible + 1)
    .map((rowData, idx) => ({ rowData, index: minVisible + idx }));
  return (
    <>
      <Grass rowIndex={0} />
      <Grass rowIndex={-1} />
      <Grass rowIndex={-2} />
      <Grass rowIndex={-3} />
      <Grass rowIndex={-4} />
      <Grass rowIndex={-5} />
      <Grass rowIndex={-6} />
      <Grass rowIndex={-7} />
      <Grass rowIndex={-8} />
      {visibleRows.map(({ rowData, index }) => (
        <Row key={index} rowIndex={index + 1} rowData={rowData} />
      ))}
    </>
  );
}

export function Row({ rowIndex, rowData }: RowProps) {
  switch (rowData.type) {
    case 'verge':
      return <Forest rowIndex={rowIndex} rowData={rowData} />;
    case 'convoy':
      return <LogLane rowIndex={rowIndex} rowData={rowData} />;
    case 'racelane':
      return <BallLane rowIndex={rowIndex} rowData={rowData} />;
    case 'grass':
      return <Grass rowIndex={rowIndex} />;
    default:
      return null;
  }
}

export function Forest({ rowIndex, rowData }: ForestProps) {
  return (
    <Grass rowIndex={rowIndex}>
      {rowData.trees.map((tree, index) => (
        <Tree key={index} tileIndex={tree.tileIndex} height={tree.height} />
      ))}
      {rowData.musettePositions &&
        rowData.musettePositions.map(tileIndex => (
          <Corn key={'musette-' + tileIndex} tileIndex={tileIndex} />
        ))}
      {rowData.collectedCorn &&
        rowData.collectedCorn.map(c => (
          <Corn
            key={'collected-' + c.tileIndex + '-' + c.start}
            tileIndex={c.tileIndex}
            collected
            start={c.start}
            rowIndex={rowIndex}
          />
        ))}
    </Grass>
  );
}
