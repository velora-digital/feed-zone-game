import { create } from 'zustand';
import { resetPlayerStore } from '@/logic/playerLogic';
import { useMapStore } from '@/store/mapStore';
import { useUserStore } from '@/store/userStore';
import { DEFAULT_GAME_STATE, STREAK_BASE_POINTS, STREAK_MULTIPLIER, MAX_STREAK_MULTIPLIER, NEAR_MISS_POINTS } from '@/utils/constants';
import { GameStore } from '@/types';

// GA tracking helper
const trackEvent = (
  eventName: string,
  parameters: Record<string, unknown> = {}
) => {
  if (typeof window !== 'undefined' && window.trackEvent) {
    window.trackEvent(eventName, parameters);
  }
};

const PB_STORAGE_KEY = 'feed-zone-pb';
function loadPersonalBest(): number {
  try {
    const stored = localStorage.getItem(PB_STORAGE_KEY);
    return stored ? parseInt(stored, 10) || 0 : 0;
  } catch { return 0; }
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...DEFAULT_GAME_STATE,
  status: 'idle' as const,
  playCount: 0,
  totalMusettesCollected: 0,
  personalBest: loadPersonalBest(),
  startGame: () => {
    set({ status: 'running' });
  },
  pause: () => {
    set({ isPaused: true });
    trackEvent('game_pause', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      event_category: 'game_interaction',
    });
  },
  resume: () => {
    set({ isPaused: false });
    trackEvent('game_resume', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      event_category: 'game_interaction',
    });
  },
  updateScore: (rowIndex: number) => {
    const state = get();
    const newScore = Math.max(rowIndex, state.score);
    set({ score: newScore });

    // Track score milestones
    if (newScore > state.score && newScore % 10 === 0) {
      trackEvent('score_milestone', {
        game_id: 'feed_zone',
        game_name: 'Feed Zone',
        score: newScore,
        milestone: newScore,
        event_category: 'game_interaction',
      });
    }
  },
  collectMusette: () => {
    const state = get();
    const newMusetteCount = state.musetteCount + 1;
    const newTotalMusettes = state.totalMusettesCollected + 1;
    set({ musetteCount: newMusetteCount, totalMusettesCollected: newTotalMusettes });

    trackEvent('musette_collected', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      musette_count: newMusetteCount,
      total_musettes_collected: newTotalMusettes,
      event_category: 'game_interaction',
    });
  },
  incrementFeed: () => {
    const state = get();
    const newFeedCount = state.feedCount + 1;
    const newTotalFeeds = state.totalFeeds + 1;
    const multiplier = state.feedStreak >= 2 ? 1.0 + (state.feedStreak - 1) * 0.1 : 1.0;
    const streakPoints = Math.round(STREAK_BASE_POINTS * multiplier);
    const newFeedPoints = state.feedPoints + streakPoints;
    const newFeedStreak = state.feedStreak + 1;
    const newBestStreak = Math.max(state.bestStreak, newFeedStreak);
    set({
      feedCount: newFeedCount,
      totalFeeds: newTotalFeeds,
      feedPoints: newFeedPoints,
      feedStreak: newFeedStreak,
      bestStreak: newBestStreak,
      musetteCount: Math.max(0, state.musetteCount - 1),
    });

    trackEvent('cyclist_fed', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      feed_count: newFeedCount,
      total_feeds: newTotalFeeds,
      streak: newFeedStreak,
      streak_points: streakPoints,
      event_category: 'game_interaction',
    });
  },
  breakStreak: () => {
    const currentStreak = get().feedStreak;
    trackEvent('streak_broken', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      streak_length: currentStreak,
      event_category: 'game_interaction',
    });
    set({ feedStreak: 0 });
  },
  setCheckpoint: (row: number, tile: number) =>
    set(() => ({ checkpointRow: row, checkpointTile: tile })),
  setStatus: (status: 'running' | 'over' | 'paused') => set({ status }),
  setPaused: (paused: boolean) => set({ isPaused: paused }),
  endGame: () => {
    const state = get();
    const newLifetimeBestStreak = Math.max(state.lifetimeBestStreak, state.bestStreak);
    const totalScore = state.feedPoints + state.score + state.nearMissPoints;
    const isNewRecord = totalScore > state.personalBest;
    const newPersonalBest = isNewRecord ? totalScore : state.personalBest;
    if (isNewRecord) {
      try { localStorage.setItem(PB_STORAGE_KEY, String(newPersonalBest)); } catch {}
    }
    set({ status: 'over', lifetimeBestStreak: newLifetimeBestStreak, personalBest: newPersonalBest, isNewRecord });

    trackEvent('game_over', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      final_score: totalScore,
      distance_score: state.score,
      feed_points: state.feedPoints,
      best_streak: state.bestStreak,
      musettes_collected: state.musetteCount,
      total_musettes_collected: state.totalMusettesCollected,
      feeds: state.feedCount,
      total_feeds: state.totalFeeds,
      play_count: state.playCount,
      event_category: 'game_interaction',
    });

    // Send game over message to parent iframe
    if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'GAME_OVER',
        gameName: 'Feed Zone',
        score: totalScore,
        distanceScore: state.score,
        feedPoints: state.feedPoints,
        bestStreak: state.bestStreak,
        musettesCollected: state.musetteCount,
        totalMusettesCollected: state.totalMusettesCollected,
      }, '*');
    }
  },
  reset: () => {
    const state = get();
    const newPlayCount = state.playCount + 1;

    trackEvent('game_restart', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      play_count: newPlayCount,
      restart_method: 'keyboard',
      event_category: 'game_interaction',
    });

    useMapStore.getState().reset();
    resetPlayerStore();
    set({
      ...DEFAULT_GAME_STATE,
      status: 'idle' as const,
      playCount: newPlayCount,
      totalMusettesCollected: state.totalMusettesCollected,
      totalFeeds: state.totalFeeds,
      lifetimeBestStreak: state.lifetimeBestStreak,
      personalBest: state.personalBest,
      isNewRecord: false,
      feedStreak: 0,
      bestStreak: 0,
      feedPoints: 0,
      nearMissCount: 0,
      nearMissPoints: 0,
    });
  },
  recordNearMiss: () => {
    set(state => ({
      nearMissCount: state.nearMissCount + 1,
      nearMissPoints: state.nearMissPoints + NEAR_MISS_POINTS,
    }));
    trackEvent('near_miss', {
      game_id: 'feed_zone',
      near_miss_count: get().nearMissCount,
    });
  },
}));
