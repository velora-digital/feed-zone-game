import { useFrame } from '@react-three/fiber';
import { useMapStore } from '@/store/mapStore';
import { useGameStore } from '@/store/gameStore';
import { playerState } from '@/logic/playerLogic';
import { visibleTilesDistance, FEED_WINDOW_PENALTY } from '@/utils/constants';

// Global state
let activeSectionId: number | null = null;
let sectionComplete = false;
let sectionActivatedAt = 0;

// Track spawn schedule: when each feed should appear (offset from section activation)
let spawnSchedule: number[] = []; // [delay1, delay2, delay3] in ms
let spawned: boolean[] = [false, false, false];

const MIN_SPAWN_DELAY = 0;      // First one spawns immediately
const MIN_SPAWN_GAP = 2000;     // At least 2s between each
const MAX_SPAWN_GAP = 6000;     // At most 6s between each

export function resetActivatedClusters() {
  activeSectionId = null;
  sectionComplete = false;
  sectionActivatedAt = 0;
  spawnSchedule = [];
  spawned = [false, false, false];
}

function generateSpawnSchedule(): number[] {
  // First one: immediate (0-1s delay)
  const first = Math.random() * 1000;
  // Second: 4-10s after first
  const second = first + MIN_SPAWN_GAP + Math.random() * (MAX_SPAWN_GAP - MIN_SPAWN_GAP);
  // Third: 4-10s after second
  const third = second + MIN_SPAWN_GAP + Math.random() * (MAX_SPAWN_GAP - MIN_SPAWN_GAP);
  return [first, second, third];
}

export function useFeedWindowTracker() {
  useFrame(() => {
    const status = useGameStore.getState().status;
    if (status !== 'running') return;

    const rows = useMapStore.getState().rows;
    const currentRow = playerState.currentRow;
    const now = performance.now();

    // Find which section the player is in
    let playerSectionId: number | undefined;
    for (let offset = 0; offset <= 1; offset++) {
      for (const dir of [0, -1, 1]) {
        const idx = currentRow + dir * offset;
        if (idx < 0 || idx >= rows.length) continue;
        const r = rows[idx];
        if (r && 'sectionId' in r && r.sectionId !== undefined) {
          playerSectionId = r.sectionId;
          break;
        }
      }
      if (playerSectionId !== undefined) break;
    }

    // Activate new section only if current is complete (or none active)
    if (playerSectionId !== undefined) {
      if (activeSectionId === null) {
        activateSection(playerSectionId, now);
      } else if (sectionComplete && playerSectionId !== activeSectionId) {
        activateSection(playerSectionId, now);
      }
    }

    if (activeSectionId === null) return;

    // Spawn feeds based on timer schedule
    const elapsed = now - sectionActivatedAt;
    for (let i = 0; i < spawnSchedule.length; i++) {
      if (!spawned[i] && elapsed >= spawnSchedule[i]) {
        spawned[i] = true;
        activateFeedByOrder(rows, activeSectionId, i + 1);
      }
    }

    // Process active feeds — timers and expiry
    const minVisible = Math.max(0, currentRow - visibleTilesDistance);
    const maxVisible = Math.min(rows.length - 1, currentRow + visibleTilesDistance);

    for (let i = minVisible; i <= maxVisible; i++) {
      const row = rows[i];
      if (!row || row.type !== 'road' || row.sectionId !== activeSectionId) continue;

      row.entities.forEach((entity, entityIndex) => {
        if (!entity.needsFeed || entity.fed || entity.feedExpired) return;
        if (!entity.feedWindowDuration) return;

        // Start the timer
        if (!entity.feedWindowStart) {
          useMapStore.getState().setFeedWindowStart(i, entityIndex, now);
          return;
        }

        // Check expiry
        if (now - entity.feedWindowStart > entity.feedWindowDuration) {
          useMapStore.getState().markFeedExpired(i, entityIndex);
          useGameStore.getState().breakStreak();
          useGameStore.setState(s => ({
            feedPoints: Math.max(0, s.feedPoints - FEED_WINDOW_PENALTY),
          }));
        }
      });
    }

    // Count how many feeds are resolved (fed or expired)
    let resolvedCount = 0;
    let totalFeedCount = 0;
    const freshRows = useMapStore.getState().rows;
    for (const row of freshRows) {
      if (row && row.type === 'road' && row.sectionId === activeSectionId) {
        for (const entity of row.entities) {
          if (entity.potentialFeed || entity.needsFeed || entity.fed || entity.feedExpired) {
            totalFeedCount++;
            if (entity.fed || entity.feedExpired) resolvedCount++;
          }
        }
      }
    }

    // If a feed was resolved but next one hasn't spawned yet, spawn it now
    for (let i = 0; i < spawnSchedule.length; i++) {
      if (!spawned[i] && resolvedCount >= i) {
        spawned[i] = true;
        activateFeedByOrder(freshRows, activeSectionId, i + 1);
      }
    }

    // Check if section is complete (all feeds resolved)
    if (!sectionComplete && resolvedCount >= totalFeedCount && totalFeedCount > 0) {
      sectionComplete = true;
    }
  });
}

function activateSection(sectionId: number, now: number) {
  activeSectionId = sectionId;
  sectionComplete = false;
  sectionActivatedAt = now;
  spawnSchedule = generateSpawnSchedule();
  spawned = [false, false, false];
}

export function getActiveSectionId(): number | null {
  return activeSectionId;
}

export function isSectionCompleteState(): boolean {
  return sectionComplete;
}

function activateFeedByOrder(rows: any[], sectionId: number, order: number) {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.type !== 'road' || row.sectionId !== sectionId) continue;
    row.entities.forEach((entity: any, entityIndex: number) => {
      if (entity.potentialFeed && entity.feedOrder === order && !entity.needsFeed && !entity.fed && !entity.feedExpired) {
        useMapStore.getState().activateFeed(i, entityIndex);
      }
    });
  }
}
