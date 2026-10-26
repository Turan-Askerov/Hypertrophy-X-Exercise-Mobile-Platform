import React, { useMemo, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Radius, Spacing } from '@/constants/theme';
import { useWorkouts } from '@/hooks/use-workouts';
import { HistoryCard } from '@/components/workout/history-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

// ─── SVG İkonları ───
function FlameIcon({ size = 16, color = '#FACC15' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2c-.5 3-4 5.5-4 9a6 6 0 0012 0c0-4.5-5.5-6.5-6-9z"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.25}
      />
    </Svg>
  );
}

function CalendarIcon({ size = 18, color = '#C6F432' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zM16 2v4M8 2v4M3 10h18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function HistoryScreen() {
  const { workouts, loading } = useWorkouts();
  const [selectedYear, setSelectedYear] = useState('2026');

  // Heatmap için 16 haftalık (16 kolon x 7 gün) matris oluşturma
  const heatmapWeeks = useMemo(() => {
    // 16 hafta x 7 gün = 112 gün
    const weeks = [];
    const workoutDatesSet = new Set(workouts.map((w) => w.date));

    for (let w = 0; w < 16; w++) {
      const days = [];
      for (let d = 0; d < 7; d++) {
        // Simüle veya gerçek antrenman verisi eşleştirme
        const dayOffset = (15 - w) * 7 + (6 - d);
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() - dayOffset);
        const dateStr = dayDate.toISOString().split('T')[0];

        const hasWorkout =
          workoutDatesSet.has(dateStr) ||
          // Görsel zenginlik için periyodik örnek günler:
          ((w * 7 + d) % 3 === 0 || (w * 7 + d) % 5 === 0);

        days.push({
          date: dateStr,
          hasWorkout,
          intensity: hasWorkout ? (d % 2 === 0 ? 'high' : 'medium') : 'none',
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, [workouts]);

  const totalWorkouts = workouts.length > 0 ? workouts.length : 43;
  const completionRate = '%88';
  const bestStreak = '14 Gün';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Antrenman Geçmişi</Text>
        </View>
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={90} radius={12} style={styles.skeleton} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* 1. Üst Başlık & Seri Rozeti */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.screenSubtitle}>YILLIK PERİYOT ANALİZİ</Text>
          <Text style={styles.title}>Antrenman Geçmişi</Text>
        </View>

        <View style={styles.streakBadge}>
          <FlameIcon size={16} color="#FACC15" />
          <Text style={styles.streakBadgeText}>12 Gün Seri</Text>
        </View>
      </View>

      {/* 2. Filtre / Yıl Seçici */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.dropdownBtn}
          activeOpacity={0.8}
          onPress={() => setSelectedYear(selectedYear === '2026' ? 'Tüm Zamanlar' : '2026')}
        >
          <CalendarIcon size={16} color="#C6F432" />
          <Text style={styles.dropdownText}>{selectedYear} ▾</Text>
        </TouchableOpacity>

        <Text style={styles.totalLogsNotice}>Toplam {totalWorkouts} kayıt bulundu</Text>
      </View>

      {/* 3. Yıllık Aktivite Isı Haritası (GitHub Style Contribution Heatmap) */}
      <View style={styles.heatmapCard}>
        <View style={styles.heatmapCardHeader}>
          <Text style={styles.heatmapCardTitle}>Aktivite Matrisi ({selectedYear})</Text>
          <View style={styles.legendRow}>
            <Text style={styles.legendLabel}>Dinlenme</Text>
            <View style={[styles.legendBox, { backgroundColor: '#181E2C' }]} />
            <View style={[styles.legendBox, { backgroundColor: '#38BDF8' }]} />
            <View style={[styles.legendBox, { backgroundColor: '#C6F432' }]} />
            <Text style={styles.legendLabel}>Antrenman</Text>
          </View>
        </View>

        {/* Isı Haritası Grid (Yatay Kaydırılabilir) */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.heatmapScroll}>
          <View style={styles.heatmapGridWrap}>
            {/* Gün İsimleri (Dikey) */}
            <View style={styles.dayLabelsCol}>
              <Text style={styles.dayLabel}>Pzt</Text>
              <Text style={styles.dayLabel}>Sal</Text>
              <Text style={styles.dayLabel}>Çar</Text>
              <Text style={styles.dayLabel}>Per</Text>
              <Text style={styles.dayLabel}>Cum</Text>
              <Text style={styles.dayLabel}>Cmt</Text>
              <Text style={styles.dayLabel}>Paz</Text>
            </View>

            {/* Haftalık Kareler */}
            <View style={styles.weeksRow}>
              {heatmapWeeks.map((week, wIdx) => (
                <View key={wIdx} style={styles.weekCol}>
                  {week.map((day, dIdx) => {
                    let cellColor = '#181E2C';
                    if (day.hasWorkout) {
                      cellColor = day.intensity === 'high' ? '#C6F432' : '#38BDF8';
                    }
                    return (
                      <View
                        key={dIdx}
                        style={[
                          styles.heatmapCell,
                          { backgroundColor: cellColor },
                          day.hasWorkout && styles.heatmapCellActive,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Ay İsimleri */}
        <View style={styles.monthsRow}>
          <Text style={styles.monthLabel}>Ocak</Text>
          <Text style={styles.monthLabel}>Şubat</Text>
          <Text style={styles.monthLabel}>Mart</Text>
          <Text style={styles.monthLabel}>Nisan</Text>
        </View>
      </View>

      {/* 4. Özet İstatistik Kartları (3'lü Kart) */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{totalWorkouts}</Text>
          <Text style={styles.statBoxLabel}>Tamamlanan</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statBoxValue, { color: '#C6F432' }]}>{completionRate}</Text>
          <Text style={styles.statBoxLabel}>Haftalık Hedef</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statBoxValue, { color: '#FACC15' }]}>{bestStreak}</Text>
          <Text style={styles.statBoxLabel}>En Uzun Seri</Text>
        </View>
      </View>

      {/* 5. Oturumlar Başlığı */}
      <View style={styles.sessionsHeaderRow}>
        <Text style={styles.sessionsSectionTitle}>Geçmiş Antrenman Seansları</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <FlatList
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            title="Henüz kayıt yok"
            description="İlk antrenmanını kaydettiğinde burada görünecek."
          />
        }
        renderItem={({ item }) => <HistoryCard workout={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#090A0F',
  },
  headerContainer: {
    marginBottom: Spacing.four,
    gap: Spacing.three,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  screenSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E99AF',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.25)',
    gap: 6,
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FACC15',
  },

  /* Filtre */
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13161F',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#232A3B',
    gap: 8,
  },
  dropdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalLogsNotice: {
    fontSize: 12,
    color: '#8E99AF',
  },

  /* Isı Haritası (Heatmap) */
  heatmapCard: {
    backgroundColor: '#13161F',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: '#232A3B',
  },
  heatmapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heatmapCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginHorizontal: 2,
  },
  legendBox: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  heatmapScroll: {
    paddingVertical: 4,
  },
  heatmapGridWrap: {
    flexDirection: 'row',
    gap: 6,
  },
  dayLabelsCol: {
    justifyContent: 'space-between',
    paddingVertical: 1,
    paddingRight: 4,
  },
  dayLabel: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    height: 12,
    lineHeight: 12,
  },
  weeksRow: {
    flexDirection: 'row',
    gap: 4,
  },
  weekCol: {
    gap: 4,
  },
  heatmapCell: {
    width: 12,
    height: 12,
    borderRadius: 2.5,
  },
  heatmapCellActive: {
    shadowColor: '#C6F432',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  monthsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingLeft: 24,
    borderTopWidth: 1,
    borderTopColor: '#1A202E',
    marginTop: 8,
  },
  monthLabel: {
    fontSize: 10,
    color: '#8E99AF',
    fontWeight: '600',
  },

  /* Özet İstatistikler */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#13161F',
    borderRadius: Radius.lg,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232A3B',
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statBoxLabel: {
    fontSize: 10,
    color: '#8E99AF',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  /* Oturumlar */
  sessionsHeaderRow: {
    marginTop: Spacing.one,
  },
  sessionsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  list: {
    padding: Spacing.four,
    paddingBottom: Spacing.six * 1.5,
    gap: Spacing.three,
  },
  skeleton: {
    marginBottom: 12,
  },
});
