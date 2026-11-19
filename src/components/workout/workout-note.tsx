import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppColors, Radius, Spacing, Typography } from '@/constants/theme';

export type WorkoutNoteProps = {
  value: string;
  onChange: (text: string) => void;
};

export function WorkoutNote({ value, onChange }: WorkoutNoteProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>📝</Text>
        <Text style={styles.title}>Günün Antrenman Notu</Text>
      </View>

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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
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
  body: {
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
    minHeight: 72,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    color: AppColors.muted,
    textAlign: 'right',
  },
});
