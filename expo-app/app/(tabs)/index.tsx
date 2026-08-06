import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppThemes, getAppTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGrahaName, grahaColors, grahaSymbols } from '@/lib/graha';
import { horaDetector, type HoraDay } from '@/lib/hora-detector';
import { t } from '@/locales/translations';
import { getCachedHoraDay, setCachedHoraDay } from '@/services/cache';
import { ensureStickyHoraNotification, refreshHoraNotifications } from '@/services/notifications';
import { getCurrentCoordinates, syncPermissionState } from '@/services/permissions';
import { syncWidgetSnapshot } from '@/services/widget-sync';
import { useAppStore } from '@/store/app-store';

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export default function HomeScreen() {
  const [day, setDay] = useState<HoraDay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = getAppTheme(useColorScheme());
  const language = useAppStore((state) => state.language);
  const highlightedHoras = useAppStore((state) => state.highlightedHoras);
  const permissions = useAppStore((state) => state.permissions);
  const startAlerts = useAppStore((state) => state.startAlerts);
  const endAlerts = useAppStore((state) => state.endAlerts);
  const stickyNotificationsEnabled = useAppStore((state) => state.stickyNotificationsEnabled);

  const loadHora = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const currentPermissions = await syncPermissionState();

      if (!currentPermissions.locationGranted || !currentPermissions.notificationsGranted) {
        router.replace('/permissions');
        return;
      }

      const coordinates = await getCurrentCoordinates();
      const showRahuKetu = useAppStore.getState().showRahuKetu;
      
      // Try to use cached data if not forcing refresh
      if (!forceRefresh) {
        const cachedDay = await getCachedHoraDay();
        if (cachedDay) {
          setDay(cachedDay);
          await syncWidgetSnapshot(cachedDay, highlightedHoras, language);
          await refreshHoraNotifications(cachedDay, language);
          return;
        }
      }

      // Calculate fresh data
      const nextDay = await horaDetector.getHoraDay(coordinates, undefined, showRahuKetu);
      setDay(nextDay);
      await setCachedHoraDay(nextDay);
      await syncWidgetSnapshot(nextDay, highlightedHoras, language);
      await refreshHoraNotifications(nextDay, language);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t(language, 'noLocation'));
    } finally {
      setIsLoading(false);
    }
  }, [highlightedHoras, language]);

  useFocusEffect(
    useCallback(() => {
      loadHora(false);
    }, [loadHora]),
  );

  useEffect(() => {
    if (day) {
      syncWidgetSnapshot(day, highlightedHoras, language);
      refreshHoraNotifications(day, language);
    }
  }, [day, endAlerts, highlightedHoras, language, startAlerts, stickyNotificationsEnabled]);

  useEffect(() => {
    if (!day || !stickyNotificationsEnabled) {
      return;
    }

    const interval = setInterval(() => {
      ensureStickyHoraNotification(day, language);
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [day, language, stickyNotificationsEnabled]);

  useEffect(() => {
    if (!day || !stickyNotificationsEnabled) {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        ensureStickyHoraNotification(day, language);
      }
    });

    return () => subscription.remove();
  }, [day, language, stickyNotificationsEnabled]);

  if (!permissions.locationGranted || !permissions.notificationsGranted) {
    return null;
  }

  const currentColor = day ? grahaColors[day.current.graha] : grahaColors.Ravi;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => loadHora(true)} />}>
        <View style={styles.header}>
          <Text style={[styles.appTitle, { color: theme.text }]}>{t(language, 'appTitle')}</Text>
          <Text style={[styles.date, { color: theme.textMuted }]}>
            {day ? formatDate(day.date) : ''}
          </Text>
        </View>

        <View style={[styles.hero, { backgroundColor: currentColor.background }]}>
          {isLoading && !day ? (
            <ActivityIndicator color={currentColor.foreground} />
          ) : (
            <>
              <Text style={[styles.heroLabel, { color: currentColor.foreground }]}>
                {t(language, 'currentHora')}
              </Text>
              <Text style={[styles.heroSymbol, { color: currentColor.foreground }]}>
                {day ? grahaSymbols[day.current.graha] : grahaSymbols.Ravi}
              </Text>
              <Text style={[styles.heroTitle, { color: currentColor.foreground }]}>
                {day ? getGrahaName(day.current.graha, language) : ''}
              </Text>
              <View style={styles.heroMeta}>
                <Text style={[styles.heroMetaText, { color: currentColor.foreground }]}>
                  {t(language, 'starts')} {day ? formatTime(day.current.start) : '--'}
                </Text>
                <Text style={[styles.heroMetaText, { color: currentColor.foreground }]}>
                  {t(language, 'ends')} {day ? formatTime(day.current.end) : '--'}
                </Text>
              </View>
            </>
          )}
        </View>

        {day && (
          <View style={[styles.sunriseCard, { backgroundColor: theme.inverse }]}>
            <Text style={[styles.sunriseLabel, { color: theme.accent }]}>
              {t(language, 'sunrise')}
            </Text>
            <Text style={[styles.sunriseValue, { color: theme.inverseText }]}>
              {formatTime(day.sunrise)}
            </Text>
          </View>
        )}

        {error && (
          <View style={[styles.errorCard, { backgroundColor: theme.dangerSoft }]}>
            <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
            <Pressable style={[styles.retryButton, { backgroundColor: theme.danger }]} onPress={() => loadHora(true)}>
              <Text style={[styles.retryText, { color: theme.inverseText }]}>
                {t(language, 'retry')}
              </Text>
            </Pressable>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {t(language, 'todayTable')}
        </Text>
        <View style={styles.table}>
          {day?.periods.map((period) => {
            const colors = grahaColors[period.graha];
            const highlighted = highlightedHoras.includes(period.graha);

            return (
              <View
                key={`${period.index}-${period.graha}`}
                style={[
                  styles.horaRow,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                  period.isActive && [styles.activeRow, { borderColor: theme.inverse }],
                  highlighted && { borderColor: colors.background, backgroundColor: colors.soft },
                ]}>
                <View
                  style={[
                    styles.planetBadge,
                    {
                      backgroundColor: highlighted ? colors.background : theme.tableBadge,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.planetSymbol,
                      { color: highlighted ? colors.foreground : theme.text },
                    ]}>
                    {grahaSymbols[period.graha]}
                  </Text>
                </View>
                <View style={styles.rowBody}>
                  <Text style={[styles.rowTitle, { color: highlighted ? AppThemes.light.text : theme.text }]}>
                    {getGrahaName(period.graha, language)}
                  </Text>
                  <Text style={[styles.rowMeta, { color: highlighted ? AppThemes.light.textMuted : theme.textMuted }]}>
                    {formatTime(period.start)} - {formatTime(period.end)}
                  </Text>
                </View>
                <Text style={[styles.rowIndex, { color: highlighted ? AppThemes.light.textMuted : theme.textMuted }]}>
                  {String(period.index + 1).padStart(2, '0')}
                </Text>
              </View>
            );
          })}
          {isLoading && !day && (
            <Text style={[styles.loadingText, { color: theme.textMuted }]}>
              {t(language, 'loading')}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7EFE1',
  },
  content: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 18,
  },
  appTitle: {
    color: '#281B10',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 26,
  },
  date: {
    color: '#806C55',
    fontFamily: 'Switzer-Semibold',
    fontSize: 14,
  },
  hero: {
    borderRadius: 28,
    minHeight: 270,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#22170D',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
    elevation: 10,
  },
  heroLabel: {
    fontFamily: 'Switzer-Bold',
    fontSize: 15,
  },
  heroSymbol: {
    fontFamily: 'Switzer-Regular',
    fontSize: 86,
    lineHeight: 92,
  },
  heroTitle: {
    fontFamily: 'Switzer-Extrabold',
    fontSize: 50,
    lineHeight: 54,
  },
  heroMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroMetaText: {
    fontFamily: 'Switzer-Bold',
    fontSize: 15,
  },
  sunriseCard: {
    alignItems: 'center',
    backgroundColor: '#2A2119',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
    padding: 18,
  },
  sunriseLabel: {
    color: '#F1D8A6',
    fontFamily: 'Switzer-Semibold',
    fontSize: 15,
  },
  sunriseValue: {
    color: '#FFF8EA',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 20,
  },
  errorCard: {
    backgroundColor: '#FFE0D8',
    borderRadius: 18,
    gap: 12,
    marginTop: 18,
    padding: 16,
  },
  errorText: {
    color: '#7E271B',
    fontFamily: 'Switzer-Semibold',
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#7E271B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryText: {
    color: '#FFF8EA',
    fontFamily: 'Switzer-Bold',
  },
  sectionTitle: {
    color: '#281B10',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 22,
    marginTop: 28,
    marginBottom: 14,
  },
  table: {
    gap: 10,
  },
  horaRow: {
    alignItems: 'center',
    backgroundColor: '#FFF8EA',
    borderColor: '#ECD8B6',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    padding: 12,
  },
  activeRow: {
    borderColor: '#2A2119',
    borderWidth: 2,
  },
  planetBadge: {
    alignItems: 'center',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  planetSymbol: {
    fontSize: 28,
  },
  rowBody: {
    flex: 1,
    marginLeft: 14,
  },
  rowTitle: {
    color: '#281B10',
    fontFamily: 'Switzer-Bold',
    fontSize: 17,
  },
  rowMeta: {
    color: '#806C55',
    fontFamily: 'Switzer-Regular',
    fontSize: 14,
    marginTop: 3,
  },
  rowIndex: {
    color: '#B49B78',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 16,
  },
  loadingText: {
    color: '#806C55',
    fontFamily: 'Switzer-Semibold',
    padding: 18,
    textAlign: 'center',
  },
});
