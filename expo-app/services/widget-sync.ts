import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { HoraDay } from '@/lib/hora-detector';
import { getGrahaName, grahaSymbols } from '@/lib/graha';
import { t, type AppLanguage } from '@/locales/translations';
import { useAppStore } from '@/store/app-store';

const { HoraWidgetModule } = NativeModules;

export async function syncWidgetSnapshot(
  day: HoraDay,
  highlightedHoras: string[],
  language: AppLanguage,
) {
  const isHighlighted = highlightedHoras.includes(day.current.graha);
  const backgroundIcon = grahaSymbols[day.current.graha] || '☉';
  
  // Get theme preference - for simplicity, default to light theme for widget
  // since we can't use hooks in service functions. This could be enhanced later.
  const state = useAppStore.getState();
  const storeTheme = state.theme;
  const isDarkTheme = storeTheme === 'dark'; // Simplified - doesn't handle system theme detection

  // Keep AsyncStorage sync as a local fallback
  await AsyncStorage.setItem(
    'hora-widget-snapshot',
    JSON.stringify({
      graha: day.current.graha,
      start: day.current.start.toISOString(),
      end: day.current.end.toISOString(),
      date: day.date.toISOString(),
      highlighted: isHighlighted,
      backgroundIcon: backgroundIcon,
      isDarkTheme: isDarkTheme,
      updatedAt: new Date().toISOString(),
    }),
  );

  // Sync to Native Android Widget if available
  if (Platform.OS === 'android' && HoraWidgetModule) {
    try {
      const title = t(language, 'currentHora');
      const grahaName = getGrahaName(day.current.graha, language);
      const grahaSymbol = grahaSymbols[day.current.graha] || '';

      const formatTime = (date: Date) => {
        return new Intl.DateTimeFormat(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        }).format(date);
      };

      const timeRange = `${formatTime(day.current.start)} - ${formatTime(day.current.end)}`;

      HoraWidgetModule.syncWidget(title, grahaName, grahaSymbol, timeRange, isHighlighted, backgroundIcon, isDarkTheme);
    } catch (e) {
      console.warn('Failed to sync native widget:', e);
    }
  } else {
    console.log('Widget sync skipped - not on Android or HoraWidgetModule not available');
  }
}
