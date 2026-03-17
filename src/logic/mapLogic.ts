import * as THREE from 'three';
import { minTileIndex, maxTileIndex } from '@/utils/constants';
import { RowData, ForestRow, LogRow, AnimalRow, GrassRow, Tree } from '@/types';

export function generateRows(amount: number): RowData[] {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    if (i === 0) {
      rows.push({ type: 'grass' });
    } else if (i === 1) {
      rows.push(generateForesMetadata());
    } else {
      const rowData = generateRow();
      rows.push(rowData);
    }
  }
  return rows;
}

export function generateRow(): RowData {
  const type = randomElement(['log', 'animal', 'forest']);
  if (type === 'log') return generateLogLaneMetadata();
  if (type === 'animal') return generateAnimalLaneMetadata();
  return generateForesMetadata();
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateForesMetadata(): ForestRow {
  const occupiedTiles = new Set();
  // More roadside elements for a crowded feed zone feel
  const count = THREE.MathUtils.randInt(4, 6);
  const trees = Array.from({ length: count }, () => {
    let tileIndex;
    do {
      tileIndex = THREE.MathUtils.randInt(minTileIndex, maxTileIndex);
    } while (occupiedTiles.has(tileIndex));
    occupiedTiles.add(tileIndex);
    const height = randomElement([20, 45, 60]);
    return { tileIndex, height };
  });
  // Corn: randomly place on tree-free tiles
  const treeTiles = new Set(trees.map(t => t.tileIndex));
  const possibleCornTiles = [];
  for (let i = minTileIndex; i <= maxTileIndex; i++) {
    if (!treeTiles.has(i)) possibleCornTiles.push(i);
  }
  // Place 0-2 corn per row
  const corn = [];
  const cornCount = THREE.MathUtils.randInt(
    0,
    Math.min(2, possibleCornTiles.length)
  );
  for (let i = 0; i < cornCount; i++) {
    if (possibleCornTiles.length === 0) break;
    const idx = THREE.MathUtils.randInt(0, possibleCornTiles.length - 1);
    corn.push(possibleCornTiles[idx]);
    possibleCornTiles.splice(idx, 1);
  }
  return { type: 'forest', trees, corn };
}

export function generateLogLaneMetadata(): LogRow {
  const direction = randomElement([true, false]);
  const speed = randomElement([110, 140, 170]);
  // For logs, just store N logs; position will be calculated in animation
  const logCount = THREE.MathUtils.randInt(3, 5);
  const logs = Array.from({ length: logCount }, (_, i) => ({ index: i }));
  return { type: 'log', direction, speed, logs };
}

export function generateAnimalLaneMetadata(): AnimalRow {
  const direction = randomElement([true, false]);
  const speed = randomElement([120, 150, 180]);
  const animals = Array.from({ length: 2 }, (_, i) => {
    // 70% cyclists, 30% motorbikes
    const species = randomElement([
      'peloton', 'peloton', 'peloton', 'breakaway', 'breakaway',
      'peloton', 'breakaway',
      'motorbike', 'commissaire', 'motorbike',
    ]);
    // ~30% of cyclist groups need a feed (not motorbikes)
    const isCyclist = species === 'peloton' || species === 'breakaway';
    const needsFeed = isCyclist && Math.random() < 0.3;
    // Variable pack sizes: 1 (solo), 3 (small group), 6 (big peloton)
    const packSize = isCyclist && !needsFeed ? randomElement([1, 3, 3, 6]) : undefined;
    return { index: i, species, needsFeed, packSize };
  });
  return { type: 'animal', direction, speed, animals };
}
