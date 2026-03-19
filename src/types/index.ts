import * as THREE from 'three';

// Game state types
export type GameStatus = 'idle' | 'running' | 'over' | 'paused';

export interface GameState {
  status: GameStatus;
  score: number;
  musetteCount: number;
  feedCount: number;
  checkpointRow: number;
  checkpointTile: number;
  playCount: number;
  totalMusettesCollected: number;
  totalFeeds: number;
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
export type RowType = 'verge' | 'convoy' | 'racelane' | 'grass';

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
}

export interface ConvoyRow {
  type: 'convoy';
  direction: boolean;
  speed: number;
  vehicles: Array<{ index: number }>;
}

export interface RaceEntity {
  index: number;
  species: string;
  needsFeed?: boolean;
  fed?: boolean;
  packSize?: number;
}

export interface RaceLaneRow {
  type: 'racelane';
  direction: boolean;
  speed: number;
  entities: RaceEntity[];
}

export interface GrassRow {
  type: 'grass';
}

export type RowData = VergRow | ConvoyRow | RaceLaneRow | GrassRow;

// Store types
export interface GameStore {
  status: GameStatus;
  score: number;
  musetteCount: number;
  feedCount: number;
  checkpointRow: number;
  checkpointTile: number;
  playCount: number;
  totalMusettesCollected: number;
  totalFeeds: number;
  pause: () => void;
  resume: () => void;
  setCheckpoint: (row: number, tile: number) => void;
  collectMusette: () => void;
  incrementFeed: () => void;
  updateScore: (row: number) => void;
  setStatus: (status: GameStatus) => void;
  endGame: () => void;
  reset: () => void;
}

export interface MapStore {
  rows: RowData[];
  addRows: () => void;
  markEntityFed: (rowIndex: number, entityIndex: number) => void;
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
