import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Scheme = 'light' | 'dark';

type AppState = {
  scheme: Scheme;
  setScheme: (s: Scheme) => void;
  highContrast: boolean;
  setHighContrast: (v: boolean) => void;
  perfOverlay: boolean;
  setPerfOverlay: (v: boolean) => void;
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      scheme: 'light',
      setScheme: (scheme) => set({ scheme }),
      highContrast: false,
      setHighContrast: (highContrast) => set({ highContrast }),
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
