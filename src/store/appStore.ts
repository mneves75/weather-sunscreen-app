import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = {
  perfOverlay: boolean;
  setPerfOverlay: (v: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      perfOverlay: false,
      setPerfOverlay: (perfOverlay) => set({ perfOverlay }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
