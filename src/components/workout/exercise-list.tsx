import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ExerciseCard } from '@/components/workout/exercise-card';
import { AppColors, Radius, Spacing, Typography } from '@/constants/theme';
import type { ExerciseEntry } from '@/types/workout';

export type ExerciseListProps = {
  exercises: ExerciseEntry[];
  previousExercises?: ExerciseEntry[];
  onUpdateExercise: (index: number, updated: ExerciseEntry) => void;
  onRemoveExercise: (index: number) => void;
  onAddExercise: () => void;
  onTriggerRestTimer?: () => void;
};

export function ExerciseList({
  exercises,
  previousExercises = [],
  onUpdateExercise,
  onRemoveExercise,
  onAddExercise,
  onTriggerRestTimer,
}: ExerciseListProps) {
  if (exercises.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <EmptyState
          title="Henüz hareket eklenmedi"
          description="Antrenmanınıza başlamak için aşağıdan egzersiz ekleyin."
          actionLabel="+ İlk Egzersizi Ekle"
          onAction={onAddExercise}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {exercises.map((entry, index) => {
        // Önceki antrenmanda bu hareket var mıydı?
        const prevMatch =
          previousExercises.find(
            (p) =>
              (p.canonical_exercise_id &&
                p.canonical_exercise_id === entry.canonical_exercise_id) ||
              p.exercise_id === entry.exercise_id ||
              p.exercise_name.toLowerCase() === entry.exercise_name.toLowerCase()
          ) ?? null;

        return (
          <ExerciseCard
            key={`${entry.exercise_id}_${index}`}
            entry={entry}
            previousEntry={prevMatch}
            onUpdate={(updated) => onUpdateExercise(index, updated)}
            onRemove={() => onRemoveExercise(index)}
            onTriggerRestTimer={onTriggerRestTimer}
          />
        );
      })}

      <TouchableOpacity style={styles.addBtn} onPress={onAddExercise}>
        <Text style={styles.addBtnText}>+ Egzersiz Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.four,
  },
  emptyContainer: {
    paddingVertical: Spacing.four,
  },
  addBtn: {
    backgroundColor: AppColors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  addBtnText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#fff',
  },
});
