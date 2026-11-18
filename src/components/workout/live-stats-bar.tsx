import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, Radius, Spacing } from '@/constants/theme';
import { rirSummaryFromSets } from '@/lib/rpe';
import { formatVolume, workoutSetCount, workoutVolume } from '@/lib/volume';
import type { ExerciseEntry } from '@/types/workout';

export type LiveStatsBarProps = {
  exercises: ExerciseEntry[];
  date?: string; // ISO "YYYY-MM-DD"
  onPressDate?: () => void;
};

function getStatDateInfo(dateIso?: string) {
  if (!dateIso) return null;
  const [y, m, d] = dateIso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = today.getTime() - target.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const dayMonth = `${d} ${months[m - 1]}`;

  if (diffDays === 0) {
    return {
      label: 'KAYIT TARİHİ',
      value: `Bugün · ${dayMonth}`,
      isPast: false,
      badge: null,
    };
  } else if (diffDays === 1) {
    return {
      label: 'GEÇMİŞ KAYIT',
      value: `Dün · ${dayMonth}`,
      isPast: true,
      badge: 'DÜN',
    };
  } else if (diffDays > 1) {
    return {
      label: 'GEÇMİŞ KAYIT',
      value: `${dayMonth} ${y !== now.getFullYear() ? y : ''}`.trim(),
      isPast: true,
      badge: `${diffDays} GÜN ÖNCE`,
    };
  } else {
    // Gelecek tarih
    return {
      label: 'PLANLANAN GÜN',
      value: `${dayMonth}`,
      isPast: false,
      badge: 'GELECEK',
    };
  }
}

export function LiveStatsBar({ exercises, date, onPressDate }: LiveStatsBarProps) {
  const totalSets = workoutSetCount(exercises);
  const totalVol = workoutVolume(exercises);

  // Tüm egzersizlerdeki setleri topla
  const allSets = exercises.flatMap((ex) => ex.sets_data ?? []);
  const rirSummary = rirSummaryFromSets(allSets);

  const dateInfo = getStatDateInfo(date);

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

      {/* 3. Kayıt Tarihi Göstergesi (Geçmiş Seçilmişse Belirgin Vurgulu) */}
      {dateInfo && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity
            style={[
              styles.statBox,
              styles.dateBox,
              dateInfo.isPast && styles.dateBoxPast,
            ]}
            onPress={onPressDate}
            activeOpacity={onPressDate ? 0.7 : 1}
            disabled={!onPressDate}
          >
            <View style={styles.dateLabelRow}>
              <Text
                style={[
                  styles.statLabel,
                  styles.dateLabel,
                  dateInfo.isPast && styles.dateLabelPast,
                ]}
                numberOfLines={1}
              >
                {dateInfo.label}
              </Text>
              {dateInfo.badge && (
                <View style={styles.dateWarningPill}>
                  <Text style={styles.dateWarningPillText}>
                    {dateInfo.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.statValue,
                styles.dateValue,
                dateInfo.isPast && styles.dateValuePast,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {dateInfo.value}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {/* 4. Ortalama RPE (Opsiyonel) */}
      {rirSummary && !dateInfo ? (
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
  // Tarih Göstergesi Stilleri
  dateBox: {
    paddingVertical: 2,
    borderRadius: 8,
  },
  dateBoxPast: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    color: '#C084FC',
  },
  dateLabelPast: {
    color: '#FBBF24',
    fontWeight: '800',
  },
  dateWarningPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dateWarningPillText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#FDE047',
    letterSpacing: 0.2,
  },
  dateValue: {
    color: '#C084FC',
  },
  dateValuePast: {
    color: '#FBBF24',
    fontWeight: '900',
  },
  rpeValue: {
    color: AppColors.primary,
  },
});
