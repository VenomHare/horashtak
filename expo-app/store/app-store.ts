import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Graha } from '@/lib/hora-detector';
import type { AppLanguage } from '@/locales/translations';
import { Theme } from '@/constants/theme';

export type AlertPreference = {
  enabled: boolean;
  offsetMinutes: number;
};

type PermissionState = {
  locationGranted: boolean;
  notificationsGranted: boolean;
};

type AppState = {
  hasHydrated: boolean;
  permissions: PermissionState;
  language: AppLanguage;
  theme: Theme;
  highlightedHoras: Graha[];
  startAlerts: Partial<Record<Graha, AlertPreference>>;
  endAlerts: Partial<Record<Graha, AlertPreference>>;
  stickyNotificationsEnabled: boolean;
  showRahuKetu: boolean;
  setHydrated: (value: boolean) => void;
  setPermissions: (permissions: PermissionState) => void;
  setLanguage: (language: AppLanguage) => void;
  toggleHighlightedHora: (graha: Graha) => void;
  toggleAlert: (kind: 'start' | 'end', graha: Graha) => void;
  setAlertOffset: (kind: 'start' | 'end', graha: Graha, offsetMinutes: number) => void;
  setStickyNotificationsEnabled: (value: boolean) => void;
  setSelectedTheme: (value: Theme) => void,
  setShowRahuKetu: (value: boolean) => void,
};

const defaultAlert: AlertPreference = {
  enabled: true,
  offsetMinutes: 10,
};

function toggleListValue<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      permissions: {
        locationGranted: false,
        notificationsGranted: false,
      },
      theme: "system",
      language: 'en',
      highlightedHoras: [],
      startAlerts: {},
      endAlerts: {},
      stickyNotificationsEnabled: true,
      showRahuKetu: false,
      setHydrated: (value) => set({ hasHydrated: value }),
      setPermissions: (permissions) => set({ permissions }),
      setLanguage: (language) => set({ language }),
      toggleHighlightedHora: (graha) =>
        set((state) => ({ highlightedHoras: toggleListValue(state.highlightedHoras, graha) })),
      toggleAlert: (kind, graha) =>
        set((state) => {
          const key = kind === 'start' ? 'startAlerts' : 'endAlerts';
          const current = state[key][graha] ?? defaultAlert;

          return {
            [key]: {
              ...state[key],
              [graha]: { ...current, enabled: !current.enabled },
            },
          };
        }),
      setAlertOffset: (kind, graha, offsetMinutes) =>
        set((state) => {
          const key = kind === 'start' ? 'startAlerts' : 'endAlerts';
          const current = state[key][graha] ?? defaultAlert;

          return {
            [key]: {
              ...state[key],
              [graha]: {
                ...current,
                enabled: true,
                offsetMinutes: Math.max(1, Math.min(120, Math.round(offsetMinutes))),
              },
            },
          };
        }),
      setStickyNotificationsEnabled: (value) => set({ stickyNotificationsEnabled: value }),
      setSelectedTheme: (value) => set({ theme: value}),
      setShowRahuKetu: (value) => set({ showRahuKetu: value })
    }),
    {
      name: 'hora-detector-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
      partialize: (state) => ({
        permissions: state.permissions,
        theme: state.theme,
        language: state.language,
        highlightedHoras: state.highlightedHoras,
        startAlerts: state.startAlerts,
        endAlerts: state.endAlerts,
        stickyNotificationsEnabled: state.stickyNotificationsEnabled,
        showRahuKetu: state.showRahuKetu,
      }),
    },
  ),
);
