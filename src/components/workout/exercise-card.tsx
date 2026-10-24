import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { SetRow } from '@/components/workout/set-row';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { exerciseVolume, formatVolume } from '@/lib/volume';
import type { ExerciseEntry, SetData } from '@/types/workout';

export type ExerciseCardProps = {
  entry: ExerciseEntry;
  previousEntry?: ExerciseEntry | null;
  onUpdate: (updated: ExerciseEntry) => void;
  onRemove: () => void;
  onTriggerRestTimer?: () => void;
};

export function ExerciseCard({
  entry,
  previousEntry,
  onUpdate,
  onRemove,
  onTriggerRestTimer,
}: ExerciseCardProps) {
  const sets = entry.sets_data ?? [];

  const handleSetChange = (index: number, updatedSet: SetData) => {
    const nextSets = [...sets];
    nextSets[index] = updatedSet;
    onUpdate({ ...entry, sets_data: nextSets });
  };

  const handleAddSet = () => {
    // Son setin ağırlık ve tekrarını kopyalayarak kolaylık sağla
    const lastSet = sets[sets.length - 1];
    const prevMatchSet = previousEntry?.sets_data?.[sets.length];

    const newSet: SetData = {
      weight_kg: lastSet?.weight_kg ?? prevMatchSet?.weight_kg ?? 0,
      reps: lastSet?.reps ?? prevMatchSet?.reps ?? 0,
      rir: null,
    };
    onUpdate({ ...entry, sets_data: [...sets, newSet] });
  };

  const handleDeleteSet = (index: number) => {
    const nextSets = sets.filter((_, i) => i !== index);
    onUpdate({ ...entry, sets_data: nextSets });
  };

  const totalVolume = exerciseVolume(sets, entry.is_bodyweight);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={styles.name}>{entry.exercise_name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.muscleBadge}>
              <Text style={styles.muscleText}>{entry.muscle_group}</Text>
            </View>
            <Text style={styles.volumeText}>
              {formatVolume(totalVolume)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onRemove}
          style={styles.removeBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.removeText}>Kaldır</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.setsList}>
        {sets.map((set, idx) => {
          const prevSet = previousEntry?.sets_data?.[idx] ?? null;
          return (
            <SetRow
              key={idx}
              index={idx}
              set={set}
              isBodyweight={entry.is_bodyweight}
              previousSet={prevSet}
              onChange={(updated) => handleSetChange(idx, updated)}
              onDelete={() => handleDeleteSet(idx)}
              onComplete={onTriggerRestTimer}
            />
          );
        })}
      </View>

      <TouchableOpacity style={styles.addSetBtn} onPress={handleAddSet}>
        <Text style={styles.addSetText}>+ Set Ekle</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  titleInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.light.text,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  muscleBadge: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  muscleText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  volumeText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: AppColors.primary,
  },
  removeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    fontSize: Typography.small,
    color: AppColors.danger,
    fontWeight: '600',
  },
  setsList: {
    marginTop: Spacing.one,
  },
  addSetBtn: {
    marginTop: Spacing.one,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderStyle: 'dashed',
  },
  addSetText: {
    fontSize: Typography.label,
    fontWeight: '600',
    color: AppColors.primary,
  },
});
