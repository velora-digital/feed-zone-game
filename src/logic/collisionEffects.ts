import { useGameStore } from '@/store/gameStore';
import { useMapStore } from '@/store/mapStore';
import { playerState } from '@/logic/playerLogic';
import { useFrame } from '@react-three/fiber';
import { playGameOverSound } from '@/sound/playGameOverSound';
import { playFeedSound } from '@/sound/playFeedSound';
import { useRef } from 'react';
import { boundingBoxesIntersect, isRowNear, isNearMiss } from '@/logic/collisionUtils';
import { NEAR_MISS_THRESHOLD, NEAR_MISS_COOLDOWN_MS } from '@/utils/constants';

export function useHitDetection(vehicle, rowIndex, needsFeed = false, entityIndex?: number) {
  const status = useGameStore(state => state.status);
  const lastNearMissRef = useRef(0);

  // Sound flags
  const gameOverSoundPlayedRef = useRef(false);
  const feedSoundPlayedRef = useRef(false);
  // Once fed, this cyclist never causes damage
  const wasFeedableRef = useRef(needsFeed);
  if (needsFeed) wasFeedableRef.current = true;

  useFrame(() => {
    if (!vehicle.current) return;
    if (!playerState.ref) return;
    if (status === 'over') return;
    if (isRowNear(rowIndex, playerState.currentRow)) {
      if (boundingBoxesIntersect(vehicle.current, playerState.ref)) {
        // Feedable or already-fed cyclist — never causes damage
        if (needsFeed || wasFeedableRef.current) {
          if (needsFeed) {
            const arrayIndex = rowIndex - 1;
            const rows = useMapStore.getState().rows;
            const row = rows[arrayIndex];
            if (row && row.type === 'road' && entityIndex !== undefined) {
              const entity = row.entities[entityIndex];
              if (entity && entity.needsFeed && !entity.fed) {
                const state = useGameStore.getState();
                // Check if player has bottles to feed
                if (state.musetteCount > 0) {
                  useMapStore.getState().markEntityFed(arrayIndex, entityIndex);
                  state.incrementFeed();
                  if (!feedSoundPlayedRef.current) {
                    playFeedSound();
                    feedSoundPlayedRef.current = true;
                  }
                } else {
                  // No bottles — signal to UI
                  useGameStore.setState(s => ({ noBottleAttempt: (s.noBottleAttempt || 0) + 1 }));
                }
              }
            }
          }
          return; // No damage from feedable/fed cyclists
        }

        // Non-feedable entity hit = instant death
        if (!gameOverSoundPlayedRef.current) {
          playGameOverSound();
          gameOverSoundPlayedRef.current = true;
        }
        useGameStore.getState().endGame();
      } else {
        // Reset sound flags if not colliding
        gameOverSoundPlayedRef.current = false;
        feedSoundPlayedRef.current = false;

        // Near-miss detection (only for non-feedable entities, not during respawn)
        if (!needsFeed && !wasFeedableRef.current && !playerState.respawning && vehicle.current && playerState.ref) {
          const now = performance.now();
          if (now - lastNearMissRef.current > NEAR_MISS_COOLDOWN_MS) {
            if (isNearMiss(vehicle.current, playerState.ref, NEAR_MISS_THRESHOLD)) {
              lastNearMissRef.current = now;
              useGameStore.getState().recordNearMiss();
            }
          }
        }
      }
    } else {
      gameOverSoundPlayedRef.current = false;
      feedSoundPlayedRef.current = false;
    }
  });
}
