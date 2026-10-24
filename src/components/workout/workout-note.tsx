import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';

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
        <Text style={styles.title}>📝 Antrenman Notu</Text>
        <Text style={styles.toggleText}>{isOpen ? 'Gizle' : 'Ekle / Düzenle'}</Text>
      </TouchableOpacity>

      {isOpen ? (
        <View style={styles.body}>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={3}
            placeholder="Bugünkü antrenman, uyku, enerji veya sakatlık durumu hakkında notlar..."
            placeholderTextColor={Colors.light.textSecondary}
            value={value}
            onChangeText={onChange}
            maxLength={500}
          />
          <Text style={styles.counter}>{value.length} / 500</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.label,
    fontWeight: '600',
    color: Colors.light.text,
  },
  toggleText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: AppColors.primary,
  },
  body: {
    marginTop: Spacing.two,
    gap: 4,
  },
  input: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.sm,
    padding: Spacing.two,
    fontSize: Typography.label,
    color: Colors.light.text,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  counter: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: 'right',
  },
});
