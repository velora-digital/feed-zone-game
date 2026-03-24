import * as THREE from 'three';
import { minTileIndex, maxTileIndex, TOTAL_SECTIONS, getSectionConfig, SectionConfig } from '@/utils/constants';
import { RowData, VergRow, RoadRow, GrassRow, RoadEntity } from '@/types';

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

const FEEDS_PER_SECTION = 3;
const MIN_VERGE_PER_SECTION = 1;
const MAX_VERGE_PER_SECTION = 3;

/**
 * Generate the entire map: 20 sections, each = verge(s) + road cluster.
 * Returns all rows for the full game.
 */
export function generateFullMap(): RowData[] {
  const rows: RowData[] = [];

  // Start with safe grass + 3 verge rows to stockpile bottles
  rows.push({ type: 'grass' } as GrassRow);
  const introConfig = getSectionConfig(1);
  for (let i = 0; i < 3; i++) {
    const verge = generateVergeMetadata(introConfig);
    verge.sectionId = 1;
    rows.push(verge);
  }

  for (let section = 1; section <= TOTAL_SECTIONS; section++) {
    const config = getSectionConfig(section);

    // 1. Verge rows (approach) — skip for section 1, already have intro verges
    const vergeCount = section === 1 ? 0 : THREE.MathUtils.randInt(MIN_VERGE_PER_SECTION, MAX_VERGE_PER_SECTION);
    for (let v = 0; v < vergeCount; v++) {
      const verge = generateVergeMetadata(config);
      verge.sectionId = section;
      rows.push(verge);
    }

    // 2. Road cluster
    const clusterSize = THREE.MathUtils.randInt(config.clusterSize[0], config.clusterSize[1]);
    const clusterRows: RoadRow[] = [];
    for (let c = 0; c < clusterSize; c++) {
      clusterRows.push(generateRoadRow(config, section));
    }

    // Distribute exactly 3 sequential feeds
    distributeFeedsAcrossCluster(clusterRows, config);

    for (const road of clusterRows) {
      rows.push(road);
    }
  }

  // Finish line: a few verge rows after the last section
  const finishConfig = getSectionConfig(TOTAL_SECTIONS);
  for (let i = 0; i < 3; i++) {
    rows.push(generateVergeMetadata(finishConfig));
  }

  return rows;
}

// Legacy wrapper for compatibility with mapStore
export function generateRows(amount: number, startIndex: number = 0): RowData[] {
  // This is now only used for the initial generation
  return generateFullMap();
}

function generateRoadRow(config: SectionConfig, sectionId: number): RoadRow {
  const direction = randomElement([true, false]);
  const speed = THREE.MathUtils.randInt(config.roadSpeed[0], config.roadSpeed[1]);

  const entities: RoadEntity[] = Array.from({ length: config.roadEntities }, (_, i) => {
    const species = randomElement([
      'peloton', 'peloton', 'peloton', 'peloton', 'peloton',
      'teamcar',
      'motorbike', 'commissaire',
    ]);
    const isCyclist = species === 'peloton';
    const packSize = isCyclist ? randomElement([3, 3, 5, 8]) : undefined;
    return { index: i, species, needsFeed: false, packSize };
  });

  return { type: 'road', direction, speed, entities, sectionId, clusterFeedTotal: FEEDS_PER_SECTION };
}

function distributeFeedsAcrossCluster(clusterRows: RoadRow[], config: SectionConfig): void {
  const candidates: { row: RoadRow; entityIdx: number }[] = [];
  for (const row of clusterRows) {
    row.entities.forEach((entity, idx) => {
      if (entity.species === 'peloton') {
        candidates.push({ row, entityIdx: idx });
      }
    });
  }

  while (candidates.length < FEEDS_PER_SECTION) {
    for (const row of clusterRows) {
      for (let idx = 0; idx < row.entities.length; idx++) {
        const entity = row.entities[idx];
        if (entity.species !== 'peloton' && entity.species !== 'breakaway') {
          const alreadyCandidate = candidates.some(c => c.row === row && c.entityIdx === idx);
          if (!alreadyCandidate) {
            entity.species = 'peloton';
            entity.packSize = undefined;
            candidates.push({ row, entityIdx: idx });
            if (candidates.length >= FEEDS_PER_SECTION) break;
          }
        }
      }
      if (candidates.length >= FEEDS_PER_SECTION) break;
    }
    if (candidates.length < FEEDS_PER_SECTION) break;
  }

  // Shuffle and pick exactly 3
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const chosen = candidates.slice(0, FEEDS_PER_SECTION);
  chosen.forEach(({ row, entityIdx }, order) => {
    const entity = row.entities[entityIdx];
    entity.potentialFeed = true;
    entity.needsFeed = false;
    entity.packSize = undefined;
    entity.feedWindowDuration = config.feedWindowDuration;
    entity.feedOrder = order + 1;
  });
}

export function generateVergeMetadata(config: SectionConfig): VergRow {
  const occupiedTiles = new Set();
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
  const treeTiles = new Set(trees.map(t => t.tileIndex));
  const possibleMusetteTiles = [];
  for (let i = minTileIndex; i <= maxTileIndex; i++) {
    if (!treeTiles.has(i)) possibleMusetteTiles.push(i);
  }
  const musettePositions = [];
  const musetteCount = Math.min(2, possibleMusetteTiles.length);
  for (let i = 0; i < musetteCount; i++) {
    if (possibleMusetteTiles.length === 0) break;
    const idx = THREE.MathUtils.randInt(0, possibleMusetteTiles.length - 1);
    musettePositions.push(possibleMusetteTiles[idx]);
    possibleMusetteTiles.splice(idx, 1);
  }
  return { type: 'verge', trees, musettePositions };
}
