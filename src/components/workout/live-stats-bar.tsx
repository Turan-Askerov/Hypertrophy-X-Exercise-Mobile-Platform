import { StyleSheet, Text, View } from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { rirSummaryFromSets } from '@/lib/rpe';
import { formatVolume, workoutSetCount, workoutVolume } from '@/lib/volume';
import type { ExerciseEntry } from '@/types/workout';

export type LiveStatsBarProps = {
  exercises: ExerciseEntry[];
};

export function LiveStatsBar({ exercises }: LiveStatsBarProps) {
  const totalSets = workoutSetCount(exercises);
  const totalVol = workoutVolume(exercises);

  // Tüm egzersizlerdeki setleri topla
  const allSets = exercises.flatMap((ex) => ex.sets_data ?? []);
  const rirSummary = rirSummaryFromSets(allSets);

  return (
    <View style={styles.container}>
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>TOPLAM SET</Text>
        <Text style={styles.statValue}>{totalSets}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statBox}>
        <Text style={styles.statLabel}>TOPLAM HACİM</Text>
        <Text style={styles.statValue}>{formatVolume(totalVol)}</Text>
      </View>

      {rirSummary ? (
        <>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>ORT. RPE</Text>
            <Text style={[styles.statValue, styles.rpeValue]}>
              {rirSummary.averageRpe}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.background,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: AppColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statBox: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.body,
    fontWeight: '800',
    color: Colors.light.text,
  },
  rpeValue: {
    color: AppColors.primary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: AppColors.border,
  },
});
