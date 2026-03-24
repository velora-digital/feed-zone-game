import { useFrame } from '@react-three/fiber';
import { minTileIndex, maxTileIndex, tileSize } from '@/utils/constants';
import { useGameStore } from '@/store/gameStore';

/**
 * Single-pass animation for feedable cyclists.
 * Enters from one edge, crosses once, exits the other side.
 * No looping — one chance to feed them.
 */
export function useSinglePassAnimation(
  ref: React.MutableRefObject<any>,
  direction: boolean,
  feedWindowStart: number | undefined,
  feedWindowDuration: number | undefined,
) {
  const isPaused = useGameStore(state => state.isPaused);

  const beginningOfRow = (minTileIndex - 2) * tileSize;
  const endOfRow = (maxTileIndex + 2) * tileSize;
  const totalDistance = endOfRow - beginningOfRow;

  useFrame(() => {
    if (!ref.current) return;
    if (isPaused) return;
    if (!feedWindowStart || !feedWindowDuration) {
      // Not yet activated — hide off-screen
      ref.current.position.x = direction ? beginningOfRow - 200 : endOfRow + 200;
      return;
    }

    const elapsed = performance.now() - feedWindowStart;
    const progress = Math.min(elapsed / feedWindowDuration, 1.0);

    if (direction) {
      // Left to right
      ref.current.position.x = beginningOfRow + progress * totalDistance;
    } else {
      // Right to left
      ref.current.position.x = endOfRow - progress * totalDistance;
    }
  });
}
