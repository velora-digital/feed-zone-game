import { useGameStore } from '@/store/gameStore';
import { useMapStore } from '@/store/mapStore';
import { playerState } from '@/logic/playerLogic';
import { useFrame } from '@react-three/fiber';
import { playHorn } from '@/sound/playHorn';
import { playGameOverSound } from '@/sound/playGameOverSound';
import { playFeedSound } from '@/sound/playFeedSound';
import { useRef } from 'react';
import { boundingBoxesIntersect, isRowNear } from '@/logic/collisionUtils';

export function useHitDetection(vehicle, rowIndex, needsFeed = false, entityIndex?: number) {
  const endGame = useGameStore(state => state.endGame);
  const musetteCount = useGameStore(state => state.musetteCount);
  const checkpointRow = useGameStore(state => state.checkpointRow);
  const checkpointTile = useGameStore(state => state.checkpointTile);
  const status = useGameStore(state => state.status);
  const incrementFeed = useGameStore(state => state.incrementFeed);
  const decrementMusette = () =>
    useGameStore.setState(state => ({
      musetteCount: Math.max(0, state.musetteCount - 1),
    }));

  // Sound flags
  const collisionSoundPlayedRef = useRef(false);
  const gameOverSoundPlayedRef = useRef(false);
  const feedSoundPlayedRef = useRef(false);
  // Once fed, this cyclist never causes damage (persists across re-renders)
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
            // rowIndex is visual position (array index + 1), so subtract 1 for array lookup
            const arrayIndex = rowIndex - 1;
            const rows = useMapStore.getState().rows;
            const row = rows[arrayIndex];
            if (row && row.type === 'racelane' && entityIndex !== undefined) {
              const entity = row.entities[entityIndex];
              if (entity && entity.needsFeed && !entity.fed) {
                // Mark as fed via proper store action (triggers re-render)
                useMapStore.getState().markEntityFed(arrayIndex, entityIndex);
                incrementFeed();
                if (!feedSoundPlayedRef.current) {
                  playFeedSound();
                  feedSoundPlayedRef.current = true;
                }
              }
            }
          }
          return; // No damage from feedable/fed cyclists
        }

        // Reset feed sound flag
        feedSoundPlayedRef.current = false;

        // Play horn sound only if musetteCount > 0 and game is not over
        if (musetteCount > 0 && !collisionSoundPlayedRef.current) {
          playHorn();
          collisionSoundPlayedRef.current = true;
        }
        if (!playerState.shake) {
          playerState.shake = true;
          playerState.shakeStartTime = performance.now();
          setTimeout(() => {
            playerState.shake = false;
          }, 600); // shake duration in ms
        }
        if (musetteCount > 0) {
          // Reset collision sound flag for next collision
          collisionSoundPlayedRef.current = false;
          decrementMusette();
          // Play horn sound on respawn only if game is not over
          if (status !== 'over') {
            playHorn();
          }
          playerState.currentRow = checkpointRow;
          playerState.currentTile = checkpointTile;
          playerState.movesQueue = [];
          if (playerState.ref) {
            playerState.ref.position.x =
              checkpointTile * (window.tileSize || 42);
            playerState.ref.position.y =
              checkpointRow * (window.tileSize || 42);
            playerState.ref.position.z = 0;
            if (playerState.ref.children && playerState.ref.children[0]) {
              playerState.ref.children[0].scale.set(1, 1, 1);
              playerState.ref.children[0].position.z = 0;
            }
          }
          playerState.respawning = true;
          playerState.respawnStartTime = performance.now();
          playerState.respawnDuration = 1200; // ms
          return;
        }
        // Play game over sound once
        if (!gameOverSoundPlayedRef.current) {
          playGameOverSound();
          gameOverSoundPlayedRef.current = true;
        }
        endGame();
      } else {
        // Reset sound flags if not colliding
        collisionSoundPlayedRef.current = false;
        gameOverSoundPlayedRef.current = false;
        feedSoundPlayedRef.current = false;
      }
    } else {
      // Reset sound flags if not colliding
      collisionSoundPlayedRef.current = false;
      gameOverSoundPlayedRef.current = false;
      feedSoundPlayedRef.current = false;
    }
  });
}
