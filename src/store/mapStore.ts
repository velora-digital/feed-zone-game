import { create } from 'zustand';
import { generateRows } from '@/logic/mapLogic';
import { INITIAL_ROWS, NEW_ROWS_BATCH } from '@/utils/constants';
import { MapStore, RowData } from '@/types';

export const useMapStore = create<MapStore>(set => ({
  rows: generateRows(INITIAL_ROWS),
  addRows: () => {
    const newRows = generateRows(NEW_ROWS_BATCH);
    set(state => ({
      rows: [...state.rows, ...newRows],
    }));
  },
  markAnimalFed: (rowIndex: number, animalIndex: number) => {
    set(state => {
      const newRows = [...state.rows];
      const row = newRows[rowIndex];
      if (row && row.type === 'animal') {
        const newAnimals = [...row.animals];
        newAnimals[animalIndex] = { ...newAnimals[animalIndex], fed: true };
        newRows[rowIndex] = { ...row, animals: newAnimals };
      }
      return { rows: newRows };
    });
  },
  reset: () => set({ rows: generateRows(INITIAL_ROWS) }),
}));

// NOTE: Do not mutate rows or row objects directly. Always use setState and create new arrays/objects for updates.
