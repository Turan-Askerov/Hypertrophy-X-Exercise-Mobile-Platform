import { StyleSheet, Text, View } from 'react-native';

import type { WorkoutListItem } from '@/types/workout';

type Props = {
  workout: WorkoutListItem;
};

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR');
  } catch {
    return dateStr;
  }
}

export function HistoryCard({ workout }: Props) {
  const title = workout.workout_date
    ? formatDate(workout.workout_date)
    : 'Antrenman';

  const exercises = workout.exercises ?? [];
  const sets =
    workout.total_sets ??
    exercises.reduce((sum, ex) => sum + (ex.sets?.length ?? 0), 0);
  const volume = workout.total_volume ?? null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {workout.duration_minutes !== null && (
          <Text style={styles.meta}>{workout.duration_minutes} dk</Text>
        )}
      </View>

      <View style={styles.row}>
        <Text style={styles.meta}>{sets} set</Text>
        {volume !== null && <Text style={styles.meta}>{Math.round(volume)} kg·rep</Text>}
        {exercises.length > 0 && (
          <Text style={styles.meta} numberOfLines={1}>
            {exercises.map((e) => e.exercise_name).join(', ')}
          </Text>
        )}
      </View>

      {workout.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {workout.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  meta: {
    fontSize: 13,
    color: '#6b7280',
  },
  notes: {
    fontSize: 13,
    color: '#475569',
  },
});
