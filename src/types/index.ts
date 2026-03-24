import * as THREE from 'three';

export type DifficultyStage = 'parcours' | 'feedzone' | 'flammeRouge' | 'sprint';

// Game state types
export type GameStatus = 'idle' | 'running' | 'over' | 'paused';

export interface GameState {
  status: GameStatus;
  score: number;
  musetteCount: number;
  feedCount: number;
  feedStreak: number;
  bestStreak: number;
  lifetimeBestStreak: number;
  feedPoints: number;
  checkpointRow: number;
  checkpointTile: number;
  playCount: number;
  totalMusettesCollected: number;
  totalFeeds: number;
  nearMissCount: number;
  nearMissPoints: number;
  personalBest: number;
  isNewRecord: boolean;
  noBottleAttempt: number;
}

// Player types
export type MoveDirection = 'forward' | 'backward' | 'left' | 'right';

export interface PlayerPosition {
  rowIndex: number;
  tileIndex: number;
}

export interface PlayerState {
  currentRow: number;
  currentTile: number;
  movesQueue: MoveDirection[];
  ref: THREE.Group | null;
  shake: boolean;
  shakeStartTime: number | null;
  respawning: boolean;
  respawnStartTime: number | null;
  respawnDuration: number;
}

// Map types
export type RowType = 'verge' | 'road' | 'grass';

export interface RoadsideObject {
  tileIndex: number;
  height: number;
}

export interface Corn {
  tileIndex: number;
  start?: number;
}

export interface CollectedCorn {
  tileIndex: number;
  start: number;
}

export interface VergRow {
  type: 'verge';
  trees: RoadsideObject[];
  musettePositions?: number[];
  collectedCorn?: CollectedCorn[];
  sectionId?: number;
}

export interface RoadEntity {
  index: number;
  species: string;
  needsFeed?: boolean;
  potentialFeed?: boolean;
  fed?: boolean;
  packSize?: number;
  feedWindowStart?: number;
  feedWindowDuration?: number;
  feedExpired?: boolean;
  feedOrder?: number;
}

export interface RoadRow {
  type: 'road';
  direction: boolean;
  speed: number;
  entities: RoadEntity[];
  sectionId?: number;
  clusterFeedTotal?: number;
}

export interface GrassRow {
  type: 'grass';
}

export type RowData = VergRow | RoadRow | GrassRow;

// Store types
export interface GameStore {
  status: GameStatus;
  score: number;
  musetteCount: number;
  feedCount: number;
  feedStreak: number;
  bestStreak: number;
  lifetimeBestStreak: number;
  feedPoints: number;
  checkpointRow: number;
  checkpointTile: number;
  playCount: number;
  totalMusettesCollected: number;
  totalFeeds: number;
  nearMissCount: number;
  nearMissPoints: number;
  personalBest: number;
  isNewRecord: boolean;
  noBottleAttempt: number;
  startGame: () => void;
  pause: () => void;
  resume: () => void;
  setCheckpoint: (row: number, tile: number) => void;
  collectMusette: () => void;
  incrementFeed: () => void;
  breakStreak: () => void;
  updateScore: (row: number) => void;
  setStatus: (status: GameStatus) => void;
  endGame: () => void;
  reset: () => void;
  recordNearMiss: () => void;
}

export interface MapStore {
  rows: RowData[];
  addRows: () => void;
  markEntityFed: (rowIndex: number, entityIndex: number) => void;
  activateFeed: (rowIndex: number, entityIndex: number) => void;
  setFeedWindowStart: (rowIndex: number, entityIndex: number, timestamp: number) => void;
  markFeedExpired: (rowIndex: number, entityIndex: number) => void;
  reset: () => void;
}

export interface UserData {
  id: string;
  name: string;
}

export interface UserStore {
  userData: UserData | null;
  setUserName: (name: string) => void;
  clearUser: () => void;
}

// Component props types
export interface GrassProps {
  rowIndex: number;
  children?: React.ReactNode;
}

export interface TreeProps {
  tileIndex: number;
  height: number;
}

export interface CornProps {
  tileIndex: number;
  collected?: boolean;
  start?: number;
  rowIndex?: number;
}

export interface RowProps {
  rowIndex: number;
  rowData: RowData;
}

export interface ForestProps {
  rowIndex: number;
  rowData: VergRow;
}

// Animation types
export interface AnimationRef {
  current: THREE.Group | null;
}

// Sound types
export interface SoundState {
  isPlaying: boolean;
  volume: number;
  buffer: AudioBuffer | null;
}
