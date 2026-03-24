import { create } from 'zustand';
import { generateFullMap } from '@/logic/mapLogic';
import { resetActivatedClusters } from '@/logic/feedWindowTracker';
import { MapStore, RowData } from '@/types';

export const useMapStore = create<MapStore>(set => ({
  rows: generateFullMap(),
  addRows: () => {
    // No-op: full map is generated upfront for 20 sections
  },
  markEntityFed: (rowIndex: number, entityIndex: number) => {
    set(state => {
      const newRows = [...state.rows];
      const row = newRows[rowIndex];
      if (row && row.type === 'road') {
        const newEntities = [...row.entities];
        newEntities[entityIndex] = { ...newEntities[entityIndex], fed: true };
        newRows[rowIndex] = { ...row, entities: newEntities };
      }
      return { rows: newRows };
    });
  },
  setFeedWindowStart: (rowIndex: number, entityIndex: number, timestamp: number) => {
    set(state => {
      const newRows = [...state.rows];
      const row = newRows[rowIndex];
      if (row && row.type === 'road') {
        const newEntities = [...row.entities];
        newEntities[entityIndex] = { ...newEntities[entityIndex], feedWindowStart: timestamp };
        newRows[rowIndex] = { ...row, entities: newEntities };
      }
      return { rows: newRows };
    });
  },
  activateFeed: (rowIndex: number, entityIndex: number) => {
    set(state => {
      const newRows = [...state.rows];
      const row = newRows[rowIndex];
      if (row && row.type === 'road') {
        const newEntities = [...row.entities];
        newEntities[entityIndex] = { ...newEntities[entityIndex], needsFeed: true, potentialFeed: false };
        newRows[rowIndex] = { ...row, entities: newEntities };
      }
      return { rows: newRows };
    });
  },
  markFeedExpired: (rowIndex: number, entityIndex: number) => {
    set(state => {
      const newRows = [...state.rows];
      const row = newRows[rowIndex];
      if (row && row.type === 'road') {
        const newEntities = [...row.entities];
        newEntities[entityIndex] = { ...newEntities[entityIndex], feedExpired: true, needsFeed: false };
        newRows[rowIndex] = { ...row, entities: newEntities };
      }
      return { rows: newRows };
    });
  },
  reset: () => {
    resetActivatedClusters();
    set({ rows: generateFullMap() });
  },
}));
