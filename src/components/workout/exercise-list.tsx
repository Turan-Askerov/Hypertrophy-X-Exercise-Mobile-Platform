import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/ui/empty-state';
import { ExerciseCard } from '@/components/workout/exercise-card';
import { Spacing } from '@/constants/theme';
import type { ExerciseEntry } from '@/types/workout';

export type ExerciseListProps = {
  exercises: ExerciseEntry[];
  onUpdateExercise: (index: number, updated: ExerciseEntry) => void;
  onRemoveExercise: (index: number) => void;
  onMoveUpExercise?: (index: number) => void;
  onMoveDownExercise?: (index: number) => void;
  onAddExercise: () => void;
  onTriggerRestTimer?: () => void;
};

export const ExerciseList = React.memo(function ExerciseList({
  exercises,
  onUpdateExercise,
  onRemoveExercise,
  onMoveUpExercise,
  onMoveDownExercise,
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
      {exercises.map((entry, index) => (
        <ExerciseCard
          key={`${entry.exercise_id}_${index}`}
          entry={entry}
          index={index}
          totalExercises={exercises.length}
          allExercises={exercises}
          onUpdate={(updated) => onUpdateExercise(index, updated)}
          onRemove={() => onRemoveExercise(index)}
          onMoveUp={onMoveUpExercise ? () => onMoveUpExercise(index) : undefined}
          onMoveDown={onMoveDownExercise ? () => onMoveDownExercise(index) : undefined}
          onTriggerRestTimer={onTriggerRestTimer}
        />
      ))}

      {/* Yeni Egzersiz Ekle Butonu (Neon Mor Çerçeveli, İkonsuz) */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={onAddExercise}
        activeOpacity={0.7}
      >
        <Text style={styles.addBtnText}>Yeni Egzersiz Ekle</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.two,
  },
  emptyContainer: {
    paddingVertical: Spacing.four,
  },
  addBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
    borderWidth: 1.6,
    borderColor: '#A855F7',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.two,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D8B4FE',
    letterSpacing: -0.1,
  },
});
