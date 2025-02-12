import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { DreamSchema, type Dream } from '../types';
import { nanoid } from 'nanoid';
import localforage from 'localforage';

interface DreamState {
  dreams: Dream[];
  addDream: (dream: Omit<Dream, 'id'>) => void;
  updateDream: (id: string, dream: Partial<Dream>) => void;
  removeDream: (id: string) => void;
  exportDreams: () => string;
  importDreams: (jsonString: string) => boolean;
}

// Configure LocalForage
localforage.config({
  name: 'dreamJournal',
  storeName: 'dreams'
});

// Custom storage adapter for LocalForage
const localForageStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return await localforage.getItem(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

// Configuration for Zustand persist middleware
const persistOptions: PersistOptions<DreamState> = {
  name: 'dream-storage',
  getStorage: () => localForageStorage,
};

export const useDreamStore = create<DreamState>()(
  persist(
    (set, get) => ({
      dreams: [],
      
      addDream: (dream) => set((state) => ({ 
        dreams: [...state.dreams, { ...dream, id: nanoid() }] 
      })),
      
      updateDream: (id, updatedDream) => set((state) => ({
        dreams: state.dreams.map((dream) => 
          dream.id === id ? { ...dream, ...updatedDream } : dream
        ),
      })),
      
      removeDream: (id) => set((state) => ({
        dreams: state.dreams.filter((dream) => dream.id !== id),
      })),
      
      exportDreams: () => {
        const { dreams } = get();
        return JSON.stringify(dreams);
      },
      
      importDreams: (jsonString) => {
        try {
          const dreams = JSON.parse(jsonString);
          if (Array.isArray(dreams)) {
            set({ dreams });
            return true;
          }
          return false;
        } catch (e) {
          console.error("Failed to import dreams:", e);
          return false;
        }
      }
    }),
    persistOptions
  )
);