import React, { useMemo, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Radius, Spacing } from '@/constants/theme';
import { FutureDateModal } from './future-date-modal';

export type WorkoutCalendarModalProps = {
  visible: boolean;
  selectedDate: string; // ISO "YYYY-MM-DD"
  workoutDatesSet?: Set<string>;
  onSelect: (dateIso: string) => void;
  onClose: () => void;
};

function CalendarIcon({ size = 18, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </Svg>
  );
}

function CloseIcon({ size = 14, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
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

let isCalendarMonthAnimating = false;

export function WorkoutCalendarModal({
  visible,
  selectedDate,
  workoutDatesSet = new Set(),
  onSelect,
  onClose,
}: WorkoutCalendarModalProps) {
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

  const [viewMonth, setViewMonth] = useState<string>(() =>
    selectedDate ? selectedDate.slice(0, 7) : todayIso.slice(0, 7)
  );

  const [futureModalOpen, setFutureModalOpen] = useState(false);

  // Ay geçişinde yumuşak kayma (slide) ve opasite animasyonları
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(1));

  // Modal her açıldığında seçili aya odaklan
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      const targetMonth = selectedDate ? selectedDate.slice(0, 7) : todayIso.slice(0, 7);
      setViewMonth(targetMonth);
      slideAnim.setValue(0);
      opacityAnim.setValue(1);
    }
  }

  const changeMonth = (direction: 1 | -1) => {
    if (isCalendarMonthAnimating) return;
    isCalendarMonthAnimating = true;

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
        isCalendarMonthAnimating = false;
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
        if (isCalendarMonthAnimating) return;
        slideAnim.setValue(gestureState.dx * 0.7);
        const op = Math.max(0.3, 1 - Math.abs(gestureState.dx) / 250);
        opacityAnim.setValue(op);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isCalendarMonthAnimating) return;
        const { dx, vx } = gestureState;

        if (dx < -35 || vx < -0.3) {
          isCalendarMonthAnimating = true;
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: -80,
              duration: 110,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.1,
              duration: 110,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]).start(() => {
            setViewMonth((cur) => {
              const [y, m] = cur.split('-').map(Number);
              const target = new Date(y, m, 1);
              const tY = target.getFullYear();
              const tM = String(target.getMonth() + 1).padStart(2, '0');
              return `${tY}-${tM}`;
            });
            slideAnim.setValue(80);
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
              isCalendarMonthAnimating = false;
            });
          });
        } else if (dx > 35 || vx > 0.3) {
          isCalendarMonthAnimating = true;
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 80,
              duration: 110,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.1,
              duration: 110,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]).start(() => {
            setViewMonth((cur) => {
              const [y, m] = cur.split('-').map(Number);
              const target = new Date(y, m - 2, 1);
              const tY = target.getFullYear();
              const tM = String(target.getMonth() + 1).padStart(2, '0');
              return `${tY}-${tM}`;
            });
            slideAnim.setValue(-80);
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
              isCalendarMonthAnimating = false;
            });
          });
        } else {
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 140,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 140,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]).start();
        }
      },
    })
  );

  const calendarCells = useMemo(() => {
    const [y, m] = viewMonth.split('-').map(Number);
    const firstDayIndex = (new Date(y, m - 1, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(y, m, 0).getDate();

    const cells: ({
      dateIso: string;
      dayNum: number;
      isToday: boolean;
      hasWorkout: boolean;
    } | null)[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const dateIso = `${y}-${mStr}-${dStr}`;
      cells.push({
        dateIso,
        dayNum: d,
        isToday: dateIso === todayIso,
        hasWorkout: workoutDatesSet.has(dateIso),
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewMonth, todayIso, workoutDatesSet]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.calendarCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.calHeader}>
            <View style={styles.calHeaderTitleBox}>
              <View style={styles.calIconBox}>
                <CalendarIcon size={18} color="#C084FC" />
              </View>
              <View style={styles.calHeaderTextWrap}>
                <Text style={styles.calTitle} numberOfLines={1}>
                  Antrenman Tarihi
                </Text>
                <Text style={styles.calSubtitle} numberOfLines={1}>
                  Kaydın yapılacağı günü seçin
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.calCloseBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <CloseIcon size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Ay Gezintisi (< > Butonları) */}
          <View style={styles.calNav}>
            <TouchableOpacity
              style={styles.calNavBtn}
              onPress={handlePrev}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.calNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthLabel}>{formatMonthTR(viewMonth)}</Text>
            <TouchableOpacity
              style={styles.calNavBtn}
              onPress={handleNext}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.calNavArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Hafta Günleri */}
          <View style={styles.calWeekdaysRow}>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((wName) => (
              <Text key={wName} style={styles.calWeekdayName}>
                {wName}
              </Text>
            ))}
          </View>

          {/* Günler Grid (Yumuşak Kayma Animasyonu ve Parmakla Kaydırma Alanı) */}
          <View style={styles.calGridContainer}>
            <Animated.View
              {...panResponder.panHandlers}
              style={[
                styles.calGrid,
                {
                  transform: [{ translateX: slideAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <View key={`blank-${idx}`} style={styles.calCell} />;
                }

                const isSelected = cell.dateIso === selectedDate;

                return (
                  <TouchableOpacity
                    key={cell.dateIso}
                    style={[
                      styles.calCell,
                      isSelected && styles.calCellSelected,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (cell.dateIso > todayIso) {
                        setFutureModalOpen(true);
                        return;
                      }
                      onSelect(cell.dateIso);
                      onClose();
                    }}
                  >
                    <Text
                      style={[
                        styles.calCellText,
                        isSelected && styles.calCellTextSelected,
                        cell.isToday && !isSelected && styles.calCellTextToday,
                      ]}
                    >
                      {cell.dayNum}
                    </Text>

                    {/* Antrenman Yapılan Günler: YEŞİL nokta. Bugün: MOR nokta */}
                    <View style={styles.calDotsContainer}>
                      {cell.hasWorkout && !isSelected && (
                        <View style={styles.calWorkoutDot} />
                      )}
                      {cell.isToday && !isSelected && (
                        <View style={styles.calTodayDot} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </View>

          {/* Hızlı Seçim Butonları (Bugün / Dün) */}
          <View style={styles.calFooter}>
            <TouchableOpacity
              style={[
                styles.quickBtn,
                selectedDate === yesterdayIso && styles.quickBtnActive,
              ]}
              onPress={() => {
                onSelect(yesterdayIso);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  selectedDate === yesterdayIso && styles.quickBtnTextActive,
                ]}
              >
                Dün
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickBtn,
                styles.todayBtn,
                selectedDate === todayIso && styles.quickBtnActive,
              ]}
              onPress={() => {
                onSelect(todayIso);
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.quickBtnText,
                  styles.todayBtnText,
                  selectedDate === todayIso && styles.quickBtnTextActive,
                ]}
              >
                Bugün
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>

      <FutureDateModal
        visible={futureModalOpen}
        onClose={() => setFutureModalOpen(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#0D111E',
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    padding: 16,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  calHeaderTitleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
    minWidth: 0,
  },
  calHeaderTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  calIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  calSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  calCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  calNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  calNavArrow: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calMonthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  calWeekdaysRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 6,
  },
  calWeekdayName: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  calGridContainer: {
    overflow: 'hidden',
    width: '100%',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
  calCell: {
    width: '14.2857%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  calCellSelected: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C084FC',
  },
  calCellText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  calCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calCellTextToday: {
    color: '#C084FC',
    fontWeight: '800',
  },
  calDotsContainer: {
    position: 'absolute',
    bottom: 3.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  calWorkoutDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#10B981', // Yeşil (Antrenman yapılan gün)
  },
  calTodayDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#C084FC', // Mor (Bugün)
  },
  calFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickBtnActive: {
    borderColor: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  todayBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderColor: 'rgba(139, 92, 246, 0.35)',
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  todayBtnText: {
    color: '#C084FC',
  },
  quickBtnTextActive: {
    color: '#FFFFFF',
  },
});
