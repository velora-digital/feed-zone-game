// Tile configuration
export const minTileIndex = -8;
export const maxTileIndex = 8;
export const tilesPerRow = maxTileIndex - minTileIndex + 1;
export const tileSize = 42;

// Performance configuration
export const TARGET_FPS = 25;
export const FRAME_INTERVAL = 1000 / TARGET_FPS;

// Map configuration
export const INITIAL_ROWS = 20;
export const MAX_ROWS = 40;
export const NEW_ROWS_BATCH = 20;

export const TOTAL_SECTIONS = 20;

export interface SectionConfig {
  clusterSize: [number, number];
  roadSpeed: [number, number];
  roadEntities: number;
  feedChance: number;
  musetteCount: [number, number];
  feedWindowDuration: number;
}

export function getSectionConfig(sectionNumber: number): SectionConfig {
  // sectionNumber: 1-20 (1 = first, 20 = last/hardest)
  if (sectionNumber <= 5) {
    // Easy: 2 roads, slow
    return {
      clusterSize: [2, 2],
      roadSpeed: [80, 110],
      roadEntities: 4,
      feedChance: 0.7,
      musetteCount: [0, 1],
      feedWindowDuration: 12000,
    };
  } else if (sectionNumber <= 10) {
    // Medium: 2-3 roads
    return {
      clusterSize: [2, 3],
      roadSpeed: [110, 150],
      roadEntities: 4,
      feedChance: 0.6,
      musetteCount: [0, 1],
      feedWindowDuration: 10000,
    };
  } else if (sectionNumber <= 15) {
    // Hard: 3-4 roads
    return {
      clusterSize: [3, 4],
      roadSpeed: [140, 180],
      roadEntities: 5,
      feedChance: 0.5,
      musetteCount: [0, 1],
      feedWindowDuration: 8000,
    };
  } else {
    // Brutal: 4-5 roads
    return {
      clusterSize: [4, 5],
      roadSpeed: [160, 210],
      roadEntities: 5,
      feedChance: 0.4,
      musetteCount: [0, 0],
      feedWindowDuration: 6000,
    };
  }
}

import { GameState, GameStatus } from '@/types';

// Game state defaults
export const DEFAULT_GAME_STATE: GameState = {
  status: 'running',
  score: 0,
  musetteCount: 0,
  feedCount: 0,
  feedStreak: 0,
  bestStreak: 0,
  lifetimeBestStreak: 0,
  feedPoints: 0,
  checkpointRow: 0,
  checkpointTile: 0,
  playCount: 0,
  totalMusettesCollected: 0,
  totalFeeds: 0,
  nearMissCount: 0,
  nearMissPoints: 0,
  personalBest: 0,
  isNewRecord: false,
  noBottleAttempt: 0,
};

// Camera configuration
export interface CameraConfig {
  up: [number, number, number];
  position: [number, number, number];
}

export const CAMERA_CONFIG: CameraConfig = {
  up: [0, 0, 1],
  position: [300, -300, 300],
};

// UI configuration
export interface UIConfig {
  MAX_MUSETTE_DISPLAY: number;
  MUSETTE_SCORE_STYLE: {
    position: string;
    top: number;
    right: number;
    fontSize: string;
    color: string;
    zIndex: number;
    whiteSpace: string;
  };
}

export const UI_CONFIG: UIConfig = {
  MAX_MUSETTE_DISPLAY: 20,
  MUSETTE_SCORE_STYLE: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: '2em',
    color: 'gold',
    zIndex: 10,
    whiteSpace: 'nowrap',
  },
};

// Player configuration
export interface PlayerConfig {
  RESPAWN_DURATION: number;
  ROWS_AHEAD_THRESHOLD: number;
}

export const PLAYER_CONFIG: PlayerConfig = {
  RESPAWN_DURATION: 1200,
  ROWS_AHEAD_THRESHOLD: 10, // When to generate new rows
};

export const visibleTilesDistance = 10;

export const FEED_BONUS_MULTIPLIER = 10;

export const STREAK_BASE_POINTS = 100;
export const STREAK_MULTIPLIER = 2;
export const MAX_STREAK_MULTIPLIER = 64;

export const FEED_WINDOW_BASE_MS = 12000;
export const FEED_WINDOW_MIN_MS = 6000;
export const FEED_WINDOW_PENALTY = 50;

export const NEAR_MISS_THRESHOLD = 8;
export const NEAR_MISS_POINTS = 25;
export const NEAR_MISS_COOLDOWN_MS = 500;
