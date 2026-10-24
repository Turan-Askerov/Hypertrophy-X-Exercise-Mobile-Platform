import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import type { SetData } from '@/types/workout';

export type SetRowProps = {
  index: number;
  set: SetData;
  isBodyweight: boolean;
  previousSet?: SetData | null;
  onChange: (updated: SetData) => void;
  onDelete: () => void;
  onComplete?: () => void;
};

const RIR_OPTIONS = [0, 1, 2, 3, 4, 5];

export function SetRow({
  index,
  set,
  isBodyweight,
  previousSet,
  onChange,
  onDelete,
  onComplete,
}: SetRowProps) {
  const handleWeightChange = (text: string) => {
    // Virgülü noktaya çevirip ondalık desteği
    const clean = text.replace(',', '.');
    const val = parseFloat(clean);
    onChange({
      ...set,
      weight_kg: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  const handleRepsChange = (text: string) => {
    const val = parseInt(text, 10);
    onChange({
      ...set,
      reps: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  const handleRirSelect = (rirVal: number) => {
    // Aynı RIR'a tekrar basılırsa seçimi kaldır
    if (set.rir === rirVal) {
      onChange({ ...set, rir: null });
    } else {
      onChange({ ...set, rir: rirVal });
      if (onComplete) onComplete();
    }
  };

  const prevText = previousSet
    ? isBodyweight
      ? `Önceki: ${previousSet.reps} tekrar`
      : `Önceki: ${previousSet.weight_kg} kg × ${previousSet.reps}`
    : null;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{index + 1}</Text>
        </View>

        {!isBodyweight ? (
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ağırlık (kg)</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={set.weight_kg > 0 ? String(set.weight_kg) : ''}
              placeholder="0"
              placeholderTextColor={Colors.light.textSecondary}
              onChangeText={handleWeightChange}
            />
          </View>
        ) : (
          <View style={styles.bwBadge}>
            <Text style={styles.bwBadgeText}>Vücut Ağırlığı</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Tekrar</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={set.reps > 0 ? String(set.reps) : ''}
            placeholder="0"
            placeholderTextColor={Colors.light.textSecondary}
            onChangeText={handleRepsChange}
          />
        </View>

        <TouchableOpacity
          onPress={onDelete}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* RIR Chip Sırası */}
      <View style={styles.rirContainer}>
        <Text style={styles.rirLabel}>RIR (Kalan Tekrar):</Text>
        <View style={styles.chipRow}>
          {RIR_OPTIONS.map((opt) => {
            const isSelected = set.rir === opt;
            return (
              <TouchableOpacity
                key={opt}
                onPress={() => handleRirSelect(opt)}
                style={[styles.chip, isSelected && styles.selectedChip]}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.selectedChipText]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {prevText ? <Text style={styles.prevText}>{prevText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    padding: Spacing.two,
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.backgroundSelected,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: Colors.light.text,
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
  bwBadge: {
    flex: 1,
    backgroundColor: AppColors.primaryMuted,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bwBadgeText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: AppColors.primary,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.danger,
  },
  rirContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rirLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: AppColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedChip: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  selectedChipText: {
    color: '#fff',
  },
  prevText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
