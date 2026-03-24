import { MoveDirection } from '@/types';

interface SwipeConfig {
  minDistance: number;
  maxTime: number;
}

const DEFAULT_CONFIG: SwipeConfig = {
  minDistance: 30,
  maxTime: 300,
};

export function initSwipeDetector(
  element: HTMLElement,
  onSwipe: (direction: MoveDirection) => void,
  config?: Partial<SwipeConfig>
): () => void {
  const { minDistance, maxTime } = { ...DEFAULT_CONFIG, ...config };

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  function handleTouchStart(e: TouchEvent) {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
  }

  function handleTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const elapsed = Date.now() - startTime;

    if (elapsed > maxTime) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX < minDistance && absY < minDistance) return;

    // Determine dominant direction
    if (absY > absX) {
      // Vertical swipe
      onSwipe(deltaY < 0 ? 'forward' : 'backward');
    } else {
      // Horizontal swipe
      onSwipe(deltaX < 0 ? 'left' : 'right');
    }
  }

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
  };
}
