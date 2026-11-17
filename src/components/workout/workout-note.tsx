import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppColors, Radius, Spacing, Typography } from '@/constants/theme';

export type WorkoutNoteProps = {
  value: string;
  onChange: (text: string) => void;
};

export function WorkoutNote({ value, onChange }: WorkoutNoteProps) {
  const [isOpen, setIsOpen] = useState(Boolean(value));

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setIsOpen((prev) => !prev)}
        activeOpacity={0.7}
      >
        <View style={styles.titleRow}>
          <Text style={styles.icon}>📝</Text>
          <Text style={styles.title}>Günün Antrenman Notu</Text>
        </View>
        <View style={styles.togglePill}>
          <Text style={styles.toggleText}>{isOpen ? 'Gizle' : 'Düzenle'}</Text>
        </View>
      </TouchableOpacity>

      {isOpen ? (
        <View style={styles.body}>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Bugünkü antrenman, uyku, enerji veya form durumu hakkında notlar..."
            placeholderTextColor={AppColors.muted}
            value={value}
            onChangeText={onChange}
            maxLength={500}
          />
          <Text style={styles.counter}>{value.length} / 500</Text>
        </View>
      ) : value ? (
        <View style={styles.previewBox}>
          <Text style={styles.previewText} numberOfLines={2}>
            &ldquo;{value}&rdquo;
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D101C',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    padding: Spacing.two + 4,
    marginBottom: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 14,
  },
  title: {
    fontSize: Typography.label,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  togglePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
  },
  body: {
    marginTop: Spacing.two,
    gap: 4,
  },
  input: {
    backgroundColor: '#0F1528',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    padding: Spacing.two,
    fontSize: Typography.label,
    color: '#FFFFFF',
    minHeight: 70,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    color: AppColors.muted,
    textAlign: 'right',
  },
  previewBox: {
    marginTop: Spacing.two,
    backgroundColor: '#0F1528',
    borderRadius: Radius.md,
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  previewText: {
    fontSize: Typography.small,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
});
