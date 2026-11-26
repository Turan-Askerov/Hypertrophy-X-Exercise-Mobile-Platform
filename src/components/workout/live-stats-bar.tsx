import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { formatVolume, workoutSetCount, workoutVolume } from '@/lib/volume';
import type { ExerciseEntry } from '@/types/workout';

export type LiveStatsBarProps = {
  exercises: ExerciseEntry[];
  sessionType?: string;
  onPressSessionType?: () => void;
};

export function LiveStatsBar({
  exercises,
  sessionType = 'Seans Seç',
  onPressSessionType,
}: LiveStatsBarProps) {
  const totalSets = workoutSetCount(exercises);
  const totalVol = workoutVolume(exercises);

  return (
    <View style={styles.container}>
      {/* 1. Toplam Set */}
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>TOPLAM SET</Text>
        <Text style={styles.statValue}>{totalSets}</Text>
      </View>

      <View style={styles.divider} />

      {/* 2. Toplam Hacim */}
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>TOPLAM HACİM</Text>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatVolume(totalVol)}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* 3. Seans Türü Göstergesi (Header'dan Buraya Taşındı) */}
      <TouchableOpacity
        style={[styles.statBox, styles.sessionBox]}
        onPress={onPressSessionType}
        activeOpacity={onPressSessionType ? 0.7 : 1}
        disabled={!onPressSessionType}
      >
        <View style={styles.sessionLabelRow}>
          <Text style={styles.statLabel}>SEANS TÜRÜ</Text>
          {onPressSessionType && (
            <Text style={styles.editArrow}>▾</Text>
          )}
        </View>
        <Text
          style={[styles.statValue, styles.sessionValue]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {sessionType}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0F1528',
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  statBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  sessionBox: {
    paddingVertical: 2,
    borderRadius: 8,
  },
  sessionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editArrow: {
    fontSize: 10,
    color: '#C084FC',
    fontWeight: '700',
  },
  sessionValue: {
    color: '#C084FC',
    fontWeight: '900',
  },
});
