import * as THREE from 'three';
import { minTileIndex, maxTileIndex } from '@/utils/constants';
import { RowData, VergRow, ConvoyRow, RaceLaneRow, GrassRow, RoadsideObject } from '@/types';

export function generateRows(amount: number): RowData[] {
  const rows = [];
  for (let i = 0; i < amount; i++) {
    if (i === 0) {
      rows.push({ type: 'grass' });
    } else if (i === 1) {
      rows.push(generateVergeMetadata());
    } else {
      const rowData = generateRow();
      rows.push(rowData);
    }
  }
  return rows;
}

export function generateRow(): RowData {
  const type = randomElement(['convoy', 'racelane', 'verge']);
  if (type === 'convoy') return generateConvoyMetadata();
  if (type === 'racelane') return generateRaceLaneMetadata();
  return generateVergeMetadata();
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function generateVergeMetadata(): VergRow {
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
  // Musettes: randomly place on tree-free tiles
  const treeTiles = new Set(trees.map(t => t.tileIndex));
  const possibleMusetteTiles = [];
  for (let i = minTileIndex; i <= maxTileIndex; i++) {
    if (!treeTiles.has(i)) possibleMusetteTiles.push(i);
  }
  // Place 0-2 musettes per row
  const musettePositions = [];
  const musetteCount = THREE.MathUtils.randInt(
    0,
    Math.min(2, possibleMusetteTiles.length)
  );
  for (let i = 0; i < musetteCount; i++) {
    if (possibleMusetteTiles.length === 0) break;
    const idx = THREE.MathUtils.randInt(0, possibleMusetteTiles.length - 1);
    musettePositions.push(possibleMusetteTiles[idx]);
    possibleMusetteTiles.splice(idx, 1);
  }
  return { type: 'verge', trees, musettePositions };
}

export function generateConvoyMetadata(): ConvoyRow {
  const direction = randomElement([true, false]);
  const speed = randomElement([110, 140, 170]);
  // For vehicles, just store N vehicles; position will be calculated in animation
  const vehicleCount = THREE.MathUtils.randInt(3, 5);
  const vehicles = Array.from({ length: vehicleCount }, (_, i) => ({ index: i }));
  return { type: 'convoy', direction, speed, vehicles };
}

export function generateRaceLaneMetadata(): RaceLaneRow {
  const direction = randomElement([true, false]);
  const speed = randomElement([120, 150, 180]);
  const entities = Array.from({ length: 2 }, (_, i) => {
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
  return { type: 'racelane', direction, speed, entities };
}
