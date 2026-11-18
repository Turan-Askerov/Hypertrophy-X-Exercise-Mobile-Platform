import React, { useMemo, useState } from 'react';
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Radius } from '@/constants/theme';
import { formatTrDate } from '@/lib/rpe';
import { FutureDateModal } from './future-date-modal';

export type WorkoutCalendarViewProps = {
  selectedDate: string; // ISO "YYYY-MM-DD"
  workoutDatesSet?: Set<string>;
  onSelect: (dateIso: string) => void;
  title?: string;
};

function CalendarIcon({ size = 16, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </Svg>
  );
}

function formatMonthTR(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${months[m - 1]} ${y}`;
}

let isCalendarAnimating = false;

export function WorkoutCalendarView({
  selectedDate,
  workoutDatesSet = new Set(),
  onSelect,
  title = 'Hangi Günün Antrenmanı?',
}: WorkoutCalendarViewProps) {
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const yesterdayIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const badgeLabel = useMemo(() => {
    if (!selectedDate) return '—';
    if (selectedDate === yesterdayIso) return 'Dün';
    if (selectedDate === todayIso) return 'Bugün';
    return formatTrDate(selectedDate);
  }, [selectedDate, yesterdayIso, todayIso]);

  const [futureModalOpen, setFutureModalOpen] = useState(false);

  const handleSelectDay = (cellIso: string) => {
    if (cellIso > todayIso) {
      setFutureModalOpen(true);
      return;
    }
    onSelect(cellIso);
  };

  const [viewMonth, setViewMonth] = useState<string>(() =>
    selectedDate ? selectedDate.slice(0, 7) : todayIso.slice(0, 7)
  );

  // Ay geçişinde yumuşak kayma (slide) ve opasite animasyonları
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(1));

  const changeMonth = (direction: 1 | -1) => {
    if (isCalendarAnimating) return;
    isCalendarAnimating = true;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: direction === 1 ? -65 : 65,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.1,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setViewMonth((cur) => {
        const [y, m] = cur.split('-').map(Number);
        const target = new Date(y, m - 1 + direction, 1);
        const tY = target.getFullYear();
        const tM = String(target.getMonth() + 1).padStart(2, '0');
        return `${tY}-${tM}`;
      });

      slideAnim.setValue(direction === 1 ? 65 : -65);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        isCalendarAnimating = false;
      });
    });
  };

  const handlePrev = () => changeMonth(-1);
  const handleNext = () => changeMonth(1);

  // Parmakla Kaydırma (Horizontal Swipe PanResponder)
  const [panResponder] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
        );
      },
      onPanResponderMove: (_, gestureState) => {
        if (isCalendarAnimating) return;
        slideAnim.setValue(gestureState.dx * 0.4);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isCalendarAnimating) return;
        if (gestureState.dx < -40) {
          handleNext();
        } else if (gestureState.dx > 40) {
          handlePrev();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      },
    })
  );

  // Takvim Hücreleri Matrisi: 7 Sütunlu tam hizalama
  const calendarCells = useMemo(() => {
    const [y, m] = viewMonth.split('-').map(Number);
    const firstDayOfMonth = new Date(y, m - 1, 1);
    const lastDayOfMonth = new Date(y, m, 0);

    let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;

    const totalDays = lastDayOfMonth.getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push(d);
    }
    return cells;
  }, [viewMonth]);

  const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  return (
    <View style={styles.container}>
      {/* Başlık Satırı */}
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={styles.iconBox}>
            <CalendarIcon size={16} color="#C084FC" />
          </View>
          <Text style={styles.titleText}>{title}</Text>
        </View>

        <View style={styles.selectedBadge}>
          <Text style={styles.selectedBadgeText}>
            {badgeLabel}
          </Text>
        </View>
      </View>

      {/* Ay Değiştirme Çubuğu */}
      <View style={styles.navRow}>
        <TouchableOpacity
          onPress={handlePrev}
          style={styles.navBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.monthLabel}>{formatMonthTR(viewMonth)}</Text>

        <TouchableOpacity
          onPress={handleNext}
          style={styles.navBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Hafta Günleri Başlıkları (14.2857% sütun genişliği ile birebir 7 kolon) */}
      <View style={styles.weekdaysRow}>
        {weekdays.map((day, i) => (
          <View key={i} style={styles.weekdayCol}>
            <Text style={styles.weekdayName}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Parmakla Kaydırılabilir & Animasyonlu Günler Tablosu (14.2857% sütun genişliği ile tam 7 gün alt alta) */}
      <View style={styles.gridContainer} {...panResponder.panHandlers}>
        <Animated.View
          style={[
            styles.grid,
            {
              transform: [{ translateX: slideAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {calendarCells.map((day, index) => {
            if (day === null) {
              return <View key={`empty-${index}`} style={styles.cellCol} />;
            }

            const dayStr = String(day).padStart(2, '0');
            const cellIso = `${viewMonth}-${dayStr}`;
            const isSelected = cellIso === selectedDate;
            const isToday = cellIso === todayIso;
            const isFuture = cellIso > todayIso;
            const hasWorkout = workoutDatesSet.has(cellIso);

            return (
              <View key={cellIso} style={styles.cellCol}>
                <TouchableOpacity
                  style={[
                    styles.cellBtn,
                    isSelected && styles.cellSelected,
                  ]}
                  onPress={() => handleSelectDay(cellIso)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.cellText,
                      isToday && styles.cellTextToday,
                      isFuture && styles.cellTextFuture,
                      isSelected && styles.cellTextSelected,
                    ]}
                  >
                    {day}
                  </Text>

                  {/* Alt Nokta Göstergeleri */}
                  {(hasWorkout || isToday) && (
                    <View style={styles.dotsContainer}>
                      {hasWorkout && <View style={styles.workoutDot} />}
                      {isToday && !hasWorkout && <View style={styles.todayDot} />}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </Animated.View>
      </View>

      <FutureDateModal
        visible={futureModalOpen}
        onClose={() => setFutureModalOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D111E',
    borderRadius: Radius.xl,
    borderWidth: 1.8,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  selectedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderWidth: 1.5,
    borderColor: '#C084FC',
  },
  selectedBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#E9D5FF',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  navBtn: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  navArrow: {
    fontSize: 16,
    color: '#E9D5FF',
    fontWeight: '900',
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  weekdaysRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 6,
  },
  weekdayCol: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayName: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  gridContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  cellCol: {
    width: '14.2857%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  cellBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    borderWidth: 2,
    borderColor: '#C084FC',
  },
  cellText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  cellTextToday: {
    color: '#C084FC',
    fontWeight: '900',
  },
  cellTextFuture: {
    color: '#475569',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
  },
  workoutDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  todayDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#C084FC',
  },
});
