import type React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { getAppTheme, Theme, ThemeOptions } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getGrahaName, grahaColors, grahaSymbols } from '@/lib/graha';
import { GRAHA_SEQUENCE, type Graha } from '@/lib/hora-detector';
import { t, type AppLanguage } from '@/locales/translations';
import { useAppStore } from '@/store/app-store';
import { MaterialIcons } from '@expo/vector-icons';
import { getCachedHoraDay, clearCachedHoraDay } from '@/services/cache';
import { refreshHoraNotifications } from '@/services/notifications';
import { router } from 'expo-router';
import { Collapsible } from '@/components/ui/collapsible';

const languages: { label: string; value: AppLanguage }[] = [
  { label: 'मराठी', value: 'mr' },
  { label: 'English', value: 'en' },
  { label: 'हिन्दी', value: 'hi' },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = getAppTheme(useColorScheme());

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function GrahaToggle({
  graha,
  active,
  onPress,
  language,
}: {
  graha: Graha;
  active: boolean;
  onPress: () => void;
  language: AppLanguage;
}) {
  const colors = grahaColors[graha];
  const theme = getAppTheme(useColorScheme());

  return (
    <Pressable
      style={[
        styles.chip,
        { backgroundColor: theme.surface, borderColor: theme.border },
        active && { backgroundColor: colors.background, borderColor: colors.background },
      ]}
      onPress={onPress}>
      <Text style={[styles.chipSymbol, { color: theme.textMuted }, active && { color: colors.foreground }]}>
        {grahaSymbols[graha]}
      </Text>
      <Text style={[styles.chipText, { color: theme.text }, active && { color: colors.foreground }]}>
        {getGrahaName(graha, language)}
      </Text>
    </Pressable>
  );
}

function AlertRow({ graha, kind }: { graha: Graha; kind: 'start' | 'end' }) {
  const preference = useAppStore((state) =>
    kind === 'start' ? state.startAlerts[graha] : state.endAlerts[graha],
  );
  const toggleAlert = useAppStore((state) => state.toggleAlert);
  const setAlertOffset = useAppStore((state) => state.setAlertOffset);
  const language = useAppStore((state) => state.language);
  const theme = getAppTheme(useColorScheme());
  const enabled = preference?.enabled ?? false;
  const offset = preference?.offsetMinutes ?? 10;

  return (
    <View style={[styles.alertRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.alertLabelGroup}>
        <Text style={[styles.alertSymbol, { color: theme.textMuted }]}>{grahaSymbols[graha]}</Text>
        <Text style={[styles.alertName, { color: theme.text }]}>{getGrahaName(graha, language)}</Text>
      </View>
      <View style={styles.alertControls}>
        <Pressable
          style={[styles.stepper, { backgroundColor: theme.inverse }]}
          onPress={() => setAlertOffset(kind, graha, Math.max(1, offset - 5))}>
          <Text style={[styles.stepperText, { color: theme.inverseText }]}>-</Text>
        </Pressable>
        <Text style={[styles.offsetText, { color: theme.textMuted }]}>
          {offset} {t(language, 'alertOffset')}
        </Text>
        <Pressable
          style={[styles.stepper, { backgroundColor: theme.inverse }]}
          onPress={() => setAlertOffset(kind, graha, Math.min(120, offset + 5))}>
          <Text style={[styles.stepperText, { color: theme.inverseText }]}>+</Text>
        </Pressable>
        <Switch value={enabled} onValueChange={() => toggleAlert(kind, graha)} />
      </View>
    </View>
  );
}

export default function PersonalizeScreen() {
  const selectedTheme = useAppStore((state) => state.theme);
  const setSelectedTheme = useAppStore((state) => state.setSelectedTheme);
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const highlightedHoras = useAppStore((state) => state.highlightedHoras);
  const theme = getAppTheme(useColorScheme());
  const toggleHighlightedHora = useAppStore((state) => state.toggleHighlightedHora);
  const stickyNotificationsEnabled = useAppStore((state) => state.stickyNotificationsEnabled);
  const setStickyNotificationsEnabled = useAppStore((state) => state.setStickyNotificationsEnabled);
  const startAlerts = useAppStore((state) => state.startAlerts);
  const endAlerts = useAppStore((state) => state.endAlerts);
  const showRahuKetu = useAppStore((state) => state.showRahuKetu);
  const setShowRahuKetu = useAppStore((state) => state.setShowRahuKetu);

  // Refresh notifications when alert preferences change
  useEffect(() => {
    const updateNotifications = async () => {
      const cachedDay = await getCachedHoraDay();
      if (cachedDay) {
        await refreshHoraNotifications(cachedDay, language);
      }
    };

    updateNotifications();
  }, [startAlerts, endAlerts, language]);

  // Recalculate when Rahu/Ketu setting changes
  useEffect(() => {
    const handleRahuKetuChange = async () => {
      await clearCachedHoraDay();
      router.replace('/'); // Navigate to home to trigger recalculation
    };

    handleRahuKetuChange();
  }, [showRahuKetu]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.screen }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t(language, 'personalize')}</Text>
        
        <Section title={t(language, 'language')}>
          <View style={[styles.languageRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {languages.map((item) => (
              <Pressable
                key={item.value}
                style={[
                  styles.languageButton,
                  language === item.value && { backgroundColor: theme.inverse },
                ]}
                onPress={() => setLanguage(item.value)}>
                <Text
                  style={[
                    styles.languageText,
                    { color: theme.textMuted },
                    language === item.value && { color: theme.inverseText },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Section>

        <Section title={t(language, 'rahuKetuSettings')}>
          <View style={[styles.stickyRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.stickyText, { color: theme.text }]}>
              {t(language, 'showRahuKetu')}
            </Text>
            <Switch
              value={showRahuKetu}
              onValueChange={setShowRahuKetu}
            />
          </View>
        </Section>

        <Section title={t(language, 'highlightList')}>
          <View style={styles.chipGrid}>
            {GRAHA_SEQUENCE.filter(graha => 
              showRahuKetu || (graha !== 'Rahu' && graha !== 'Ketu')
            ).map((graha) => (
              <GrahaToggle
                key={graha}
                graha={graha}
                active={highlightedHoras.includes(graha)}
                onPress={() => toggleHighlightedHora(graha)}
                language={language}
              />
            ))}
          </View>
        </Section>

        <Collapsible title={t(language, 'startAlerts')} defaultOpen={false}>
          {GRAHA_SEQUENCE.filter(graha => 
            showRahuKetu || (graha !== 'Rahu' && graha !== 'Ketu')
          ).map((graha) => (
            <AlertRow key={`start-${graha}`} graha={graha} kind="start" />
          ))}
        </Collapsible>

        <Collapsible title={t(language, 'endAlerts')} defaultOpen={false}>
          {GRAHA_SEQUENCE.filter(graha => 
            showRahuKetu || (graha !== 'Rahu' && graha !== 'Ketu')
          ).map((graha) => (
            <AlertRow key={`end-${graha}`} graha={graha} kind="end" />
          ))}
        </Collapsible>

        <Section title={t(language, 'theme')}>
          <View style={[styles.languageRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {ThemeOptions.map((item : Theme) => {
              let iconName: keyof typeof MaterialIcons.glyphMap = 'settings';
              if (item === 'light') iconName = 'wb-sunny';
              else if (item === 'dark') iconName = 'nightlight-round';
              else if (item === 'system') iconName = 'brightness-auto';

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.languageButton,
                    selectedTheme === item && { backgroundColor: theme.inverse },
                  ]}
                  onPress={() => setSelectedTheme(item)}>
                  <MaterialIcons
                    name={iconName}
                    size={24}
                    color={selectedTheme === item ? theme.inverseText : theme.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </Section>

        {Platform.OS === 'android' && (
          <Section title={t(language, 'stickyNotification')}>
            <View style={[styles.stickyRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.stickyText, { color: theme.text }]}>
                {t(language, 'stickyNotification')}
              </Text>
              <Switch
                value={stickyNotificationsEnabled}
                onValueChange={setStickyNotificationsEnabled}
              />
            </View>
          </Section>
        )}
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
    gap: 20,
    padding: 20,
    paddingBottom: 110,
  },
  title: {
    color: '#281B10',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 34,
    lineHeight: 38,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    color: '#4B3523',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 20,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    alignItems: 'center',
    backgroundColor: '#FFF8EA',
    borderColor: '#ECD8B6',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  chipSymbol: {
    color: '#6B5A48',
    fontSize: 20,
  },
  chipText: {
    color: '#281B10',
    fontFamily: 'Switzer-Bold',
    fontSize: 15,
  },
  alertRow: {
    alignItems: 'center',
    backgroundColor: '#FFF8EA',
    borderColor: '#ECD8B6',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 72,
    padding: 12,
  },
  alertLabelGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minWidth: 84,
  },
  alertSymbol: {
    color: '#4B3523',
    fontSize: 24,
  },
  alertName: {
    color: '#281B10',
    fontFamily: 'Switzer-Bold',
    fontSize: 15,
  },
  alertControls: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  stepper: {
    alignItems: 'center',
    backgroundColor: '#2A2119',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  stepperText: {
    color: '#FFF8EA',
    fontFamily: 'Switzer-Extrabold',
    fontSize: 20,
    lineHeight: 22,
  },
  offsetText: {
    color: '#6B5A48',
    flexShrink: 1,
    fontFamily: 'Switzer-Semibold',
    fontSize: 12,
    textAlign: 'center',
  },
  languageRow: {
    backgroundColor: '#FFF8EA',
    borderColor: '#ECD8B6',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  },
  languageButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
  },
  languageActive: {
    backgroundColor: '#2A2119',
  },
  languageText: {
    color: '#6B5A48',
    fontFamily: 'Switzer-Bold',
    fontSize: 13,
  },
  languageTextActive: {
    color: '#FFF8EA',
  },
  stickyRow: {
    alignItems: 'center',
    backgroundColor: '#FFF8EA',
    borderColor: '#ECD8B6',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  stickyText: {
    color: '#281B10',
    fontFamily: 'Switzer-Bold',
    fontSize: 16,
  },
});
