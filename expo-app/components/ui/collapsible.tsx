import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import { getAppTheme } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialIcons } from '@expo/vector-icons';

type CollapsibleProps = PropsWithChildren & { 
  title: string;
  defaultOpen?: boolean;
};

export function Collapsible({ children, title, defaultOpen = false }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const theme = getAppTheme(useColorScheme());

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.heading, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <MaterialIcons
          name="keyboard-arrow-right"
          size={24}
          color={theme.text}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <Text style={[styles.headingText, { color: theme.text }]}>{title}</Text>
      </TouchableOpacity>
      {isOpen && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  headingText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    marginTop: 4,
  },
});
