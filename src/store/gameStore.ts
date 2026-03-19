import { create } from 'zustand';
import { resetPlayerStore } from '@/logic/playerLogic';
import { useMapStore } from '@/store/mapStore';
import { useUserStore } from '@/store/userStore';
import { DEFAULT_GAME_STATE } from '@/utils/constants';
import { GameStore } from '@/types';

const FEED_BONUS_MULTIPLIER = 10;

// GA tracking helper
const trackEvent = (
  eventName: string,
  parameters: Record<string, unknown> = {}
) => {
  if (typeof window !== 'undefined' && window.trackEvent) {
    window.trackEvent(eventName, parameters);
  }
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...DEFAULT_GAME_STATE,
  status: 'idle' as const,
  playCount: 0,
  totalMusettesCollected: 0,
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
    set({ feedCount: newFeedCount, totalFeeds: newTotalFeeds });

    trackEvent('cyclist_fed', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      feed_count: newFeedCount,
      total_feeds: newTotalFeeds,
      event_category: 'game_interaction',
    });
  },
  setCheckpoint: (row: number, tile: number) =>
    set(() => ({ checkpointRow: row, checkpointTile: tile })),
  setStatus: (status: 'running' | 'over' | 'paused') => set({ status }),
  setPaused: (paused: boolean) => set({ isPaused: paused }),
  endGame: () => {
    const state = get();
    set({ status: 'over' });

    const totalScore = get().score + get().feedCount * FEED_BONUS_MULTIPLIER;

    trackEvent('game_over', {
      game_id: 'feed_zone',
      game_name: 'Feed Zone',
      final_score: state.score,
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
        score: state.score,
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
    });
  },
}));
