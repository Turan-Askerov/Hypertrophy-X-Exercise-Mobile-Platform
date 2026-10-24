import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { formatTrDate } from '@/lib/rpe';
import { formatVolume } from '@/lib/volume';
import type { ExerciseEntry, Workout } from '@/types/workout';

type Props = {
  workout: Workout;
  onPress?: () => void;
  onEdit?: (workout: Workout) => void;
  onDelete?: (id: number) => void;
};

export function HistoryCard({ workout, onPress, onEdit, onDelete }: Props) {
  const title = workout.date ? formatTrDate(workout.date) : 'Antrenman';
  const sessionType = workout.session_type || 'Antrenman';

  const exercises = workout.exercises ?? [];
  const totalSets = exercises.reduce(
    (sum: number, ex: ExerciseEntry) => sum + (ex.sets_data?.length ?? 0),
    0
  );
  const volumeText = formatVolume(workout.total_volume ?? 0);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sessionType}</Text>
          </View>
        </View>

        {(onEdit || onDelete) && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(workout)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}
              >
                <Text style={styles.editActionText}>Düzenle</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={() => onDelete(workout.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.actionBtn}
              >
                <Text style={styles.deleteActionText}>Sil</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaBadge}>{totalSets} set</Text>
        <Text style={styles.metaBadge}>{volumeText}</Text>
        <Text style={styles.metaBadge}>{exercises.length} hareket</Text>
      </View>

      {exercises.length > 0 && (
        <Text style={styles.exerciseList} numberOfLines={2}>
          {exercises.map((e) => e.exercise_name).join(' • ')}
        </Text>
      )}

      {workout.notes ? (
        <Text style={styles.notes} numberOfLines={2}>
          {workout.notes}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: Radius.md,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  title: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.light.text,
  },
  badge: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  badgeText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: AppColors.primary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  actionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  editActionText: {
    fontSize: Typography.small,
    color: AppColors.primary,
    fontWeight: '600',
  },
  deleteActionText: {
    fontSize: Typography.small,
    color: AppColors.danger,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    alignItems: 'center',
  },
  metaBadge: {
    fontSize: Typography.small,
    color: Colors.light.textSecondary,
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    fontWeight: '500',
  },
  exerciseList: {
    fontSize: Typography.small,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  notes: {
    fontSize: Typography.small,
    color: Colors.light.text,
    fontStyle: 'italic',
  },
});
