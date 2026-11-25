import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated as RNAnimated,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';

import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts } from '@/hooks/use-workouts';
import {
  buildWorkoutHierarchy,
  extractWorkoutDateIso,
  formatWeekdayShortTR,
  MONTHS_TR,
} from '@/lib/history-groups';
import { workoutDraft } from '@/lib/workout-draft';
import type { ExerciseEntry, Workout } from '@/types/workout';

type SmoothAccordionBodyProps = {
  isOpen: boolean;
  animateOnMount: boolean;
  naturalHeightWhenSettled: boolean;
  onExited: () => void;
  children: React.ReactNode;
};

function SmoothAccordionBody({
  isOpen,
  animateOnMount,
  naturalHeightWhenSettled,
  onExited,
  children,
}: SmoothAccordionBodyProps) {
  const [isSettledOpen, setIsSettledOpen] = useState(
    naturalHeightWhenSettled && isOpen && !animateOnMount
  );
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (prevIsOpen !== isOpen) {
    setPrevIsOpen(isOpen);
    if (isSettledOpen) {
      setIsSettledOpen(false);
    }
  }

  const startOpenImmediate = isOpen && !animateOnMount;
  const measuredHeight = useSharedValue(0);
  const heightProgress = useSharedValue(startOpenImmediate ? 1 : 0);
  const contentOpacity = useSharedValue(startOpenImmediate ? 1 : 0);
  const contentDriftY = useSharedValue(startOpenImmediate ? 0 : -8);

  useEffect(() => {
    if (isSettledOpen) return;

    if (isOpen) {
      heightProgress.value = withTiming(1, {
        duration: 480,
        easing: Easing.inOut(Easing.quad),
      });
      contentOpacity.value = withDelay(
        90,
        withTiming(
          1,
          {
            duration: 540,
            easing: Easing.inOut(Easing.quad),
          },
          (finished) => {
            if (finished && naturalHeightWhenSettled) {
              scheduleOnRN(setIsSettledOpen, true);
            }
          }
        )
      );
      contentDriftY.value = withDelay(
        90,
        withTiming(0, {
          duration: 540,
          easing: Easing.inOut(Easing.quad),
        })
      );
    } else {
      contentOpacity.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.ease),
      });
      contentDriftY.value = withTiming(-6, {
        duration: 240,
        easing: Easing.out(Easing.ease),
      });
      heightProgress.value = withDelay(
        60,
        withTiming(
          0,
          {
            duration: 480,
            easing: Easing.inOut(Easing.quad),
          },
          (finished) => {
            if (finished) {
              scheduleOnRN(onExited);
            }
          }
        )
      );
    }
  }, [
    isOpen,
    isSettledOpen,
    naturalHeightWhenSettled,
    heightProgress,
    contentOpacity,
    contentDriftY,
    onExited,
  ]);

  const outerStyle = useAnimatedStyle(() => ({
    height: measuredHeight.value * heightProgress.value,
    overflow: 'hidden',
  }));

  const innerStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentDriftY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.accordionOuter,
        isSettledOpen ? styles.accordionOuterNatural : outerStyle,
      ]}
    >
      <Animated.View
        onLayout={(e) => {
          const h = Math.ceil(e.nativeEvent.layout.height);
          if (h > 0 && Math.abs(h - measuredHeight.value) > 1) {
            measuredHeight.value = h;
          }
        }}
        style={[
          isSettledOpen ? styles.accordionInnerNatural : styles.accordionInner,
          innerStyle,
        ]}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

// 120Hz Saf UI-Thread Reanimated Akordiyon (Kapalıyken 0 hook / 0 worklet maliyeti)
const SmoothAccordion = React.memo(function SmoothAccordion({
  isOpen,
  naturalHeightWhenSettled = false,
  children,
}: {
  isOpen: boolean;
  naturalHeightWhenSettled?: boolean;
  children: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(isOpen);
  const [animateOnMount, setAnimateOnMount] = useState(false);

  if (isOpen && !hasMounted) {
    setHasMounted(true);
    setAnimateOnMount(true);
  }

  const handleExited = useCallback(() => {
    setHasMounted(false);
    setAnimateOnMount(false);
  }, []);

  if (!hasMounted) return null;

  return (
    <SmoothAccordionBody
      isOpen={isOpen}
      animateOnMount={animateOnMount}
      naturalHeightWhenSettled={naturalHeightWhenSettled}
      onExited={handleExited}
    >
      {children}
    </SmoothAccordionBody>
  );
});

// Önceden önbelleğe alınmış giriş animasyonları (her kart için ayrı Keyframe allocate etmez)
const SLIDE_DOWN_KEYFRAMES = Array.from({ length: 9 }, (_, i) =>
  new Keyframe({
    0: {
      opacity: 0,
      transform: [{ translateY: -22 }],
    },
    100: {
      opacity: 1,
      transform: [{ translateY: 0 }],
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  })
    .duration(480)
    .delay(i * 55)
);

const getSlideDownKeyframe = (index: number) =>
  SLIDE_DOWN_KEYFRAMES[Math.min(Math.max(index, 0), SLIDE_DOWN_KEYFRAMES.length - 1)];

// Sayfa geçişlerinde donmasız 120Hz yumuşak aşağı süzülme + opaklık geçişi
function SoftPageReveal({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-14);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 540,
      easing: Easing.inOut(Easing.quad),
    });
    translateY.value = withTiming(0, {
      duration: 540,
      easing: Easing.inOut(Easing.quad),
    });
  }, [opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={animStyle}>{children}</Animated.View>;
}

// ─── Web Tema Renkleri (Web Platformuna Birebir Uyumlu Cyber Dark) ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: 'rgba(15, 23, 42, 0.65)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(139, 92, 246, 0.35)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Vurgu (Web'deki hist-badge-purple)
  purple: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.4)',
  purpleButtonBg: 'rgba(139, 92, 246, 0.12)',

  // Ağırlık Rozeti (Yeşil / Emerald)
  weightGreen: '#34D399',
  weightGreenBg: 'rgba(16, 185, 129, 0.14)',
  weightGreenBorder: 'rgba(16, 185, 129, 0.38)',

  // Tekrar Rozeti (Mavi / Cyan)
  repsBlue: '#38BDF8',
  repsBlueBg: 'rgba(56, 189, 248, 0.14)',
  repsBlueBorder: 'rgba(56, 189, 248, 0.35)',

  // RIR Rozeti (Amber / Turuncu)
  rirAmber: '#FBBF24',
  rirAmberBg: 'rgba(245, 158, 11, 0.12)',
  rirAmberBorder: 'rgba(245, 158, 11, 0.3)',

  // Eylemler
  danger: '#FF7898',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',

  cyanAction: '#38BDF8',
  cyanActionBg: 'rgba(56, 189, 248, 0.12)',
  cyanActionBorder: 'rgba(56, 189, 248, 0.35)',

  inputBg: '#161E33',
  inputBorder: '#283554',
};

// ─── 60-90-120fps Dokunmatik Yay (Spring) Buton Bileşeni ───

type PressableScaleProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
  activeScale?: number;
  hitSlop?: any;
  disabled?: boolean;
  unstable_pressDelay?: number;
};

function PressableScale({
  children,
  onPress,
  style,
  activeScale = 0.95,
  hitSlop,
  disabled,
  unstable_pressDelay = 0,
}: PressableScaleProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      disabled={disabled}
      unstable_pressDelay={unstable_pressDelay}
      style={({ pressed }) => [
        style,
        pressed && !disabled && { transform: [{ scale: activeScale }], opacity: 0.84 },
      ]}
    >
      {children}
    </Pressable>
  );
}

// ─── SVG İkonları ───

function ArrowBackIcon({ size = 18, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}


const CalendarIcon = React.memo(function CalendarIcon({
  size = 14,
  color = colors.textMuted,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
});

const PencilEditIcon = React.memo(function PencilEditIcon({
  size = 14,
  color = colors.purple,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

const TuneSlidersIcon = React.memo(function TuneSlidersIcon({
  size = 14,
  color = colors.cyanAction,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

const TrashIcon = React.memo(function TrashIcon({
  size = 14,
  color = colors.danger,
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

function CloseIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CautionTriangleIcon({ size = 18, color = '#F87171' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 16, color = colors.purple }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth={2.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Tarih Formatlama Yardımcıları ───

function formatDateTR(dateString: string): string {
  if (!dateString) return '';
  const iso = extractWorkoutDateIso(dateString);
  if (iso) {
    const [year, month, day] = iso.split('-');
    return `${day}.${month}.${year}`;
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatMonthTR(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  return `${MONTHS_TR[m - 1]} ${y}`;
}

// ─── Web Tarzı Tarih Seçim Panosu (Modal) ───

type CalendarModalProps = {
  visible: boolean;
  selectedDate: string | null;
  searchQuery?: string;
  workoutDatesSet: Set<string>;
  onSelect: (dateIso: string) => void;
  onClear: () => void;
  onClose: () => void;
};

// Ay geçiş animasyon kilidi
let isCalendarMonthAnimating = false;

function WorkoutCalendarModal({
  visible,
  selectedDate,
  searchQuery,
  workoutDatesSet,
  onSelect,
  onClear,
  onClose,
}: CalendarModalProps) {
  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const [viewMonth, setViewMonth] = useState<string>(() =>
    selectedDate ? selectedDate.slice(0, 7) : todayIso.slice(0, 7)
  );

  // Ay geçişinde yumuşak kayma (slide) ve opasite animasyonları
  const [slideAnim] = useState(() => new RNAnimated.Value(0));
  const [opacityAnim] = useState(() => new RNAnimated.Value(1));

  // Modal her açıldığında ilgili aya odaklan ve animasyon değerlerini sıfırla
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      let targetMonth = todayIso.slice(0, 7);
      if (selectedDate) {
        targetMonth = selectedDate.slice(0, 7);
      } else if (workoutDatesSet.size > 0) {
        const dates = Array.from(workoutDatesSet).sort();
        targetMonth = dates[dates.length - 1].slice(0, 7);
      }
      setViewMonth(targetMonth);
      slideAnim.setValue(0);
      opacityAnim.setValue(1);
    }
  }

  // Ay değiştirme fonksiyonu (direction: 1 = sonraki, -1 = önceki)
  const changeMonth = (direction: 1 | -1) => {
    if (isCalendarMonthAnimating) return;
    isCalendarMonthAnimating = true;

    // 1. Mevcut ayı yumuşakça dışarı kaydır
    RNAnimated.parallel([
      RNAnimated.timing(slideAnim, {
        toValue: direction === 1 ? -65 : 65,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
      RNAnimated.timing(opacityAnim, {
        toValue: 0.1,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      // 2. Ayı güncelle
      setViewMonth((cur) => {
        const [y, m] = cur.split('-').map(Number);
        const target = new Date(y, m - 1 + direction, 1);
        const tY = target.getFullYear();
        const tM = String(target.getMonth() + 1).padStart(2, '0');
        return `${tY}-${tM}`;
      });

      // 3. Karşı tarafa hazırla
      slideAnim.setValue(direction === 1 ? 65 : -65);

      // 4. Yeni ayı merkeze yumuşakça süzdür
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: Platform.OS !== 'web',
        }),
        RNAnimated.timing(opacityAnim, {
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

        // Sola kaydırıldı -> Sonraki Ay
        if (dx < -35 || vx < -0.3) {
          isCalendarMonthAnimating = true;
          RNAnimated.parallel([
            RNAnimated.timing(slideAnim, {
              toValue: -80,
              duration: 110,
              useNativeDriver: Platform.OS !== 'web',
            }),
            RNAnimated.timing(opacityAnim, {
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
            RNAnimated.parallel([
              RNAnimated.timing(slideAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: Platform.OS !== 'web',
              }),
              RNAnimated.timing(opacityAnim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: Platform.OS !== 'web',
              }),
            ]).start(() => {
              isCalendarMonthAnimating = false;
            });
          });
        }
        // Sağa kaydırıldı -> Önceki Ay
        else if (dx > 35 || vx > 0.3) {
          isCalendarMonthAnimating = true;
          RNAnimated.parallel([
            RNAnimated.timing(slideAnim, {
              toValue: 80,
              duration: 110,
              useNativeDriver: Platform.OS !== 'web',
            }),
            RNAnimated.timing(opacityAnim, {
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
            RNAnimated.parallel([
              RNAnimated.timing(slideAnim, {
                toValue: 0,
                duration: 180,
                useNativeDriver: Platform.OS !== 'web',
              }),
              RNAnimated.timing(opacityAnim, {
                toValue: 1,
                duration: 180,
                useNativeDriver: Platform.OS !== 'web',
              }),
            ]).start(() => {
              isCalendarMonthAnimating = false;
            });
          });
        }
        // Yetersiz çekme -> Geri merkeze yaylan
        else {
          RNAnimated.parallel([
            RNAnimated.timing(slideAnim, {
              toValue: 0,
              duration: 140,
              useNativeDriver: Platform.OS !== 'web',
            }),
            RNAnimated.timing(opacityAnim, {
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
    >
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable style={styles.calendarCard} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.calHeader}>
            <View style={styles.calHeaderTitleBox}>
              <View style={styles.calIconBox}>
                <CalendarIcon size={18} color={colors.purple} />
              </View>
              <View style={styles.calHeaderTextWrap}>
                <Text style={styles.calTitle} numberOfLines={1}>Tarihe Göre Filtrele</Text>
                <Text style={styles.calSubtitle} numberOfLines={1} ellipsizeMode="tail">
                  {searchQuery && searchQuery.trim()
                    ? `"${searchQuery.trim()}" için ${workoutDatesSet.size} gün işaretlendi`
                    : 'Seans geçmişinde tarih seç'}
                </Text>
              </View>
            </View>
            <PressableScale
              style={styles.calCloseBtn}
              onPress={onClose}
              activeScale={0.88}
              hitSlop={8}
            >
              <CloseIcon size={14} color={colors.danger} />
            </PressableScale>
          </View>

          {/* Ay Gezintisi (< > Butonları) */}
          <View style={styles.calNav}>
            <PressableScale style={styles.calNavBtn} onPress={handlePrev} activeScale={0.85} hitSlop={8}>
              <Text style={styles.calNavArrow}>‹</Text>
            </PressableScale>
            <Text style={styles.calMonthLabel}>{formatMonthTR(viewMonth)}</Text>
            <PressableScale style={styles.calNavBtn} onPress={handleNext} activeScale={0.85} hitSlop={8}>
              <Text style={styles.calNavArrow}>›</Text>
            </PressableScale>
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
            <RNAnimated.View
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
                  <PressableScale
                    key={cell.dateIso}
                    style={[
                      styles.calCell,
                      isSelected && styles.calCellSelected,
                    ]}
                    activeScale={0.88}
                    onPress={() => {
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
                  </PressableScale>
                );
              })}
            </RNAnimated.View>
          </View>

          {/* Alt Buton: Filtreleri Temizle */}
          <View style={styles.calFooter}>
            <PressableScale
              style={styles.calClearBtn}
              activeScale={0.96}
              onPress={() => {
                onClear();
                onClose();
              }}
            >
              <Text style={styles.calClearBtnText}>Filtreleri Temizle</Text>
            </PressableScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Web Tarzı Bulanık Arka Planlı Antrenman Silme Onay Panosu ───

type DeleteWorkoutModalProps = {
  workout: Workout | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

function DeleteWorkoutConfirmModal({
  workout,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteWorkoutModalProps) {
  if (!workout) return null;

  const exercisesCount = workout.exercises?.length || 0;
  const dateFormatted = formatDateTR(workout.date);
  const sessionName = workout.session_type || 'Antrenman';

  return (
    <Modal
      visible={!!workout}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.delModalBackdrop}>
        {/* Arka Planı Bulanıklaştıran Katman (BlurView) */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 35 : 25}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.delModalBackdropTint} />

        {/* Ortadaki Onay Panosu Kartı (Fotoğraftaki Tasarım) */}
        <Pressable style={styles.delModalCard} onPress={(e) => e.stopPropagation()}>
          {/* Üst Kısım: Kırmızı Kutu İçi Çöp Kutusu İkonu + Başlık & Alt Başlık */}
          <View style={styles.delModalHeader}>
            <View style={styles.delModalIconBox}>
              <TrashIcon size={22} color="#EF4444" />
            </View>
            <View style={styles.delModalHeaderTextBox}>
              <Text style={styles.delModalTitle}>Antrenmanı Silmeyi Onayla</Text>
              <Text style={styles.delModalSubtitle}>
                Antrenman seansı ve tüm set kayıtları kaldırılacak
              </Text>
            </View>
          </View>

          {/* Ayırıcı İnce Çizgi */}
          <View style={styles.delModalDivider} />

          {/* Seans Detay Metni */}
          <Text style={styles.delModalDesc}>
            <Text style={styles.delModalHighlight}>
              {`${dateFormatted} tarihli "${sessionName}" (${exercisesCount} Hareket)`}
            </Text>{' '}
            ve bu kayda ait tüm veriler veritabanından kalıcı olarak silinecektir.
          </Text>

          {/* Kesikli Çizgili Uyarı Kutusu */}
          <View style={styles.delModalWarningBox}>
            <CautionTriangleIcon size={18} color="#F87171" />
            <Text style={styles.delModalWarningText}>
              Bu işlem geri alınamaz. Kaydı silmek istediğinize emin misiniz?
            </Text>
          </View>

          {/* Butonlar: Sol - Platform Moru "Vazgeç", Sağ - Normal Kırmızı "Evet, Kaydı Sil" (İkonsuz) */}
          <View style={styles.delModalButtonsRow}>
            <PressableScale
              style={styles.delCancelBtn}
              onPress={onCancel}
              disabled={isDeleting}
              activeScale={0.96}
            >
              <Text style={styles.delCancelBtnText}>Vazgeç</Text>
            </PressableScale>

            <PressableScale
              style={styles.delConfirmBtn}
              onPress={onConfirm}
              disabled={isDeleting}
              activeScale={0.96}
            >
              {isDeleting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.delConfirmBtnText}>Evet, Kaydı Sil</Text>
              )}
            </PressableScale>
          </View>
        </Pressable>
      </View>
    </Modal>
  );
}

// ─── Seans Kartı Bileşeni (React.memo ile Yüksek Performanslı, Tetikleme Gecikmesiz) ───

type SessionCardItemProps = {
  workout: Workout;
  index: number;
  disableEntering?: boolean;
  isSummaryOpen: boolean;
  isFullOpen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editingExercises?: ExerciseEntry[];
  onToggleSummary: (workoutId: number) => void;
  onToggleFull: (workoutId: number) => void;
  onToggleEdit: (workout: Workout) => void;
  onLoadToDraft: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  onSetChange: (
    workoutId: number,
    exIdx: number,
    setIdx: number,
    field: 'weight_kg' | 'reps' | 'rir',
    rawText: string
  ) => void;
  onSaveEdit: (workoutId: number) => void;
};

const SessionCardItem = React.memo(function SessionCardItem({
  workout,
  index,
  disableEntering = false,
  isSummaryOpen,
  isFullOpen,
  isEditing,
  isSaving,
  editingExercises,
  onToggleSummary,
  onToggleFull,
  onToggleEdit,
  onLoadToDraft,
  onDelete,
  onSetChange,
  onSaveEdit,
}: SessionCardItemProps) {
  const exercises = workout.exercises || [];
  const currentExercises = isEditing && editingExercises ? editingExercises : exercises;

  const cardBody = (
    <>
      {/* ─── Seans Kartı Üst Barı (Header) ─── */}
      <View style={styles.cardHeader}>
        {/* Sol Kısım: Başlık, Hareket Sayısı Rozeti, Tarih & Mekan (Dokunmatik - Kapatır/Açar) */}
        <PressableScale
          style={styles.cardHeaderLeft}
          activeScale={0.98}
          onPress={() => onToggleSummary(workout.id)}
          unstable_pressDelay={0}
        >
          <View style={styles.titleRow}>
            <Text style={styles.sessionTitle}>
              {workout.session_type || 'Antrenman'}
            </Text>
            <View style={styles.movementBadge}>
              <Text style={styles.movementBadgeText}>
                {exercises.length} Hareket
              </Text>
            </View>
          </View>

          <View style={styles.subtitleRow}>
            <CalendarIcon size={12} color={colors.textMuted} />
            <Text style={styles.subtitleDateText} numberOfLines={1}>
              {formatDateTR(workout.date)}
              {formatWeekdayShortTR(workout.date) ? ` (${formatWeekdayShortTR(workout.date)})` : ''}
            </Text>
            {workout.gym_name ? (
              <Text
                style={styles.subtitleGymText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                • 📍 {workout.gym_name}
              </Text>
            ) : null}
          </View>
        </PressableScale>

        {/* Sağ Kısım: Sadece 3 Aksiyon Butonu */}
        <View style={styles.cardHeaderRight}>
          {/* Setleri Düzenle Butonu (Kalem) */}
          <PressableScale
            style={[styles.headerActionBtn, styles.editActionBtn]}
            activeScale={0.88}
            onPress={() => onToggleEdit(workout)}
            hitSlop={6}
            unstable_pressDelay={0}
          >
            <PencilEditIcon size={14} color={colors.purple} />
          </PressableScale>

          {/* Genel Düzenle / Seansı Aç Butonu (Sliders) */}
          <PressableScale
            style={[styles.headerActionBtn, styles.tuneActionBtn]}
            activeScale={0.88}
            onPress={() => onLoadToDraft(workout)}
            hitSlop={6}
            unstable_pressDelay={0}
          >
            <TuneSlidersIcon size={14} color={colors.cyanAction} />
          </PressableScale>

          {/* Sil Butonu (Çöp Kutusu - Bulanık Arka Planlı Panoyu Açar) */}
          <PressableScale
            style={[styles.headerActionBtn, styles.deleteActionBtn]}
            activeScale={0.88}
            onPress={() => onDelete(workout)}
            hitSlop={6}
            unstable_pressDelay={0}
          >
            <TrashIcon size={14} color={colors.danger} />
          </PressableScale>
        </View>
      </View>

      {/* Kapat / Aç İpucu Çubuğu */}
      <PressableScale
        onPress={() => onToggleSummary(workout.id)}
        style={styles.hintBar}
        activeScale={0.98}
        unstable_pressDelay={0}
      >
        <Text style={styles.hintBarText}>
          {isSummaryOpen ? 'Özeti kapatmak için tıkla ▴' : 'Antrenman özetini görmek için tıkla ▾'}
        </Text>
      </PressableScale>

      {/* ─── 1. AŞAMA: ÖZET GÖRÜNÜMÜ (120Hz Saf Reanimated Akordiyon) ─── */}
      <SmoothAccordion isOpen={isSummaryOpen}>
        <View style={styles.summaryTopSpacer}>
          <View style={styles.summaryContainer}>
            {/* Hareketler Listesi: Ad ve Set Sayısı Rozeti */}
            {exercises.map((ex, exIdx) => (
              <PressableScale
                key={exIdx}
                style={styles.summaryExerciseRow}
                onPress={() => onToggleSummary(workout.id)}
                activeScale={0.98}
                unstable_pressDelay={0}
              >
                <Text style={styles.summaryExerciseName}>
                  {ex.exercise_name}
                </Text>
                <View style={styles.summarySetBadge}>
                  <Text style={styles.summarySetBadgeText}>
                    {ex.sets_data?.length || 0} Set
                  </Text>
                </View>
              </PressableScale>
            ))}

            {/* Not Bölümü */}
            {workout.notes && workout.notes.trim() !== '' ? (
              <PressableScale
                style={styles.notesBox}
                onPress={() => onToggleSummary(workout.id)}
                activeScale={0.98}
                unstable_pressDelay={0}
              >
                <Text style={styles.notesBoxTitle}>📝 NOT</Text>
                <Text style={styles.notesBoxContent}>{workout.notes}</Text>
              </PressableScale>
            ) : null}

            {/* Daha Fazla (Set & Ağırlık Detayları) Butonu */}
            <PressableScale
              style={[
                styles.btnMore,
                isFullOpen && styles.btnMoreActive,
              ]}
              onPress={() => onToggleFull(workout.id)}
              activeScale={0.97}
              unstable_pressDelay={0}
            >
              <Text style={styles.btnMoreText}>
                {isFullOpen
                  ? 'Daha Az Göster ▴'
                  : 'Daha Fazla (Set & Ağırlık Detayları) ▾'}
              </Text>
            </PressableScale>
          </View>
        </View>
      </SmoothAccordion>

      {/* ─── 2. AŞAMA: DETAYLI SET & TEKRAR VERİLERİ (120Hz Saf Reanimated Akordiyon) ─── */}
      <SmoothAccordion isOpen={isSummaryOpen && isFullOpen}>
        <View style={styles.fullDetailsTopSpacer}>
          <View style={styles.fullDetailsContainer}>
            {/* Detay Başlığı */}
            <View style={styles.fullDetailsHeaderRow}>
              <Text style={styles.fullDetailsTitle}>
                ⚡ DETAYLI SET & TEKRAR VERİLERİ
              </Text>
              {isEditing && (
                <PressableScale
                  style={[styles.saveInlineBtn, isSaving && { opacity: 0.6 }]}
                  onPress={() => onSaveEdit(workout.id)}
                  disabled={isSaving}
                  activeScale={0.92}
                  unstable_pressDelay={0}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveInlineBtnText}>Kaydet</Text>
                  )}
                </PressableScale>
              )}
            </View>

            {/* Her Egzersiz İçin Tablo Kartı */}
            {currentExercises.map((ex, exIdx) => {
              const sets = ex.sets_data || [];

              return (
                <View key={exIdx} style={styles.exerciseSetsCard}>
                  <Text style={styles.exerciseSetsCardTitle}>
                    {exIdx + 1}. {ex.exercise_name}
                  </Text>

                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.thText, styles.colSet]}>SET</Text>
                    <Text style={[styles.thText, styles.colWeight]}>AĞIRLIK</Text>
                    <Text style={[styles.thText, styles.colReps]}>TEKRAR</Text>
                    <Text style={[styles.thText, styles.colRir]}>RIR</Text>
                  </View>

                  {sets.map((set, sIdx) => {
                    const wKg = parseFloat(String(set.weight_kg)) || 0;
                    const isBw = !!ex.is_bodyweight;

                    return (
                      <View key={sIdx} style={styles.tableRow}>
                        <Text style={styles.colSetText}>{sIdx + 1}. Set</Text>

                        <View style={styles.colWeightContainer}>
                          {isEditing ? (
                            <View style={styles.editInputBox}>
                              <TextInput
                                style={styles.editTextInput}
                                value={set.weight_kg !== undefined ? String(set.weight_kg) : ''}
                                onChangeText={(txt) =>
                                  onSetChange(workout.id, exIdx, sIdx, 'weight_kg', txt)
                                }
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textDim}
                              />
                              <Text style={styles.editUnitLabel}>kg</Text>
                            </View>
                          ) : (
                            <View style={styles.weightBadge}>
                              <Text style={styles.weightBadgeText}>
                                {isBw ? 'V. Ağ.' : `${wKg} kg`}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.colRepsContainer}>
                          {isEditing ? (
                            <View style={styles.editInputBox}>
                              <TextInput
                                style={styles.editTextInput}
                                value={set.reps !== undefined ? String(set.reps) : ''}
                                onChangeText={(txt) =>
                                  onSetChange(workout.id, exIdx, sIdx, 'reps', txt)
                                }
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textDim}
                              />
                              <Text style={styles.editUnitLabel}>Tkr</Text>
                            </View>
                          ) : (
                            <View style={styles.repsBadge}>
                              <Text style={styles.repsBadgeText}>
                                {set.reps || 0} Tekrar
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.colRirContainer}>
                          {isEditing ? (
                            <View style={[styles.editInputBox, styles.editRirInputBox]}>
                              <TextInput
                                style={[styles.editTextInput, styles.editRirTextInput]}
                                value={
                                  set.rir !== undefined && set.rir !== null
                                    ? String(set.rir)
                                    : ''
                                }
                                onChangeText={(txt) =>
                                  onSetChange(workout.id, exIdx, sIdx, 'rir', txt)
                                }
                                keyboardType="numeric"
                                placeholder="—"
                                placeholderTextColor={colors.textDim}
                              />
                              <Text style={styles.editRirUnitLabel}>RIR</Text>
                            </View>
                          ) : (
                            <View style={styles.rirBadge}>
                              <Text style={styles.rirBadgeText}>
                                {set.rir === 0 || set.rir ? `${set.rir} RIR` : '—'}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>
        </View>
      </SmoothAccordion>
    </>
  );

  if (disableEntering) {
    return <View style={styles.sessionCard}>{cardBody}</View>;
  }

  return (
    <Animated.View entering={getSlideDownKeyframe(index)} style={styles.sessionCard}>
      {cardBody}
    </Animated.View>
  );
});

// ─── Kompakt Yıl / Ay / Hafta Şerit Kartı (Seans kartı ile birebir aynı oranlarda) ───

type CompactGroupCardProps = {
  title: string;
  badgeText: string;
  metaText: string;
  hintText: string;
  index: number;
  onPress: () => void;
};

const CompactGroupCard = React.memo(function CompactGroupCard({
  title,
  badgeText,
  metaText,
  hintText,
  index,
  onPress,
}: CompactGroupCardProps) {
  const enteringAnim = getSlideDownKeyframe(index);

  return (
    <Animated.View entering={enteringAnim}>
      <PressableScale
        style={styles.sessionCard}
        activeScale={0.985}
        onPress={onPress}
        unstable_pressDelay={0}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.titleRow}>
              <Text style={styles.sessionTitle}>{title}</Text>
              <View style={styles.movementBadge}>
                <Text style={styles.movementBadgeText}>{badgeText}</Text>
              </View>
            </View>

            <View style={styles.subtitleRow}>
              <CalendarIcon size={12} color={colors.textMuted} />
              <Text style={styles.subtitleDateText} numberOfLines={1}>
                {metaText}
              </Text>
            </View>
          </View>

          <View style={styles.cardHeaderRight}>
            <View style={[styles.headerActionBtn, styles.editActionBtn]}>
              <ChevronRightIcon size={15} color={colors.purple} />
            </View>
          </View>
        </View>

        <View style={styles.hintBar}>
          <Text style={styles.hintBarText}>{hintText}</Text>
        </View>
      </PressableScale>
    </Animated.View>
  );
});

const RestDayStripCard = React.memo(function RestDayStripCard({
  formattedDate,
  weekdayShort,
  isFuture,
}: {
  formattedDate: string;
  weekdayShort: string;
  isFuture: boolean;
}) {
  return (
    <View style={styles.restDayCard}>
      <View style={styles.restDayLeft}>
        <CalendarIcon size={12} color={colors.textDim} />
        <Text style={styles.restDayDateText}>
          {formattedDate} • {weekdayShort}
        </Text>
      </View>
      <Text style={styles.restDayStatusText}>
        {isFuture ? 'Yaklaşan Gün' : 'Dinlenme / Kayıt Yok'}
      </Text>
    </View>
  );
});

// ─── Ana Ekran Bileşeni (HistoryScreen) ───

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading, refetch, updateWorkout, deleteWorkout } = useWorkouts();

  // Sayfaya her girildiğinde kartların webdeki gibi yukardan aşağı sıralı süzülmesini tetikleyen anahtar
  const [animKey, setAnimKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 3 Seviyeli Gezinti: Yıl -> Ay -> Ay İçi Tüm Günler (Haftalık Gruplu)
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [weekOpenOverrides, setWeekOpenOverrides] = useState<Record<string, boolean>>({});
  const [renderedWeekLimit, setRenderedWeekLimit] = useState(3);

  useFocusEffect(
    useCallback(() => {
      // Sayfaya girildiğinde doğrudan bellekten anında (0ms gecikmeyle) render et ve animasyonu başlat
      setAnimKey((k) => k + 1);
    }, [])
  );

  const handlePullToRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  // Filtreler
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  const isFilterActive = selectedDate !== null || searchQuery.trim().length > 0;

  // Ekran açılışında ilk görünen haftalar anında açık yüklenir, alttaki haftalar 1 kare sonra tamamlanır
  useEffect(() => {
    if (!selectedMonthId || isFilterActive) return;

    const rafId = requestAnimationFrame(() => {
      setRenderedWeekLimit(99);
    });

    return () => cancelAnimationFrame(rafId);
  }, [selectedMonthId, isFilterActive]);

  // Gerçek antrenmanlardan Yıl -> Ay -> Pzt-Paz Haftalık Gruplu Tüm Günler
  const yearGroups = useMemo(() => buildWorkoutHierarchy(workouts), [workouts]);

  const activeYear = useMemo(
    () => (selectedYear !== null ? yearGroups.find((y) => y.year === selectedYear) ?? null : null),
    [yearGroups, selectedYear]
  );

  const activeMonth = useMemo(
    () =>
      activeYear && selectedMonthId
        ? activeYear.months.find((m) => m.id === selectedMonthId) ?? null
        : null,
    [activeYear, selectedMonthId]
  );

  const handleOpenMonth = useCallback((monthId: string) => {
    setRenderedWeekLimit(3);
    setSelectedMonthId(monthId);
  }, []);

  const handleBackNavigation = useCallback(() => {
    if (!isFilterActive) {
      if (activeMonth) {
        setRenderedWeekLimit(3);
        setSelectedMonthId(null);
        return true;
      }
      if (activeYear) {
        setSelectedYear(null);
        return true;
      }
    }
    return false;
  }, [isFilterActive, activeMonth, activeYear]);

  const toggleWeekCollapse = useCallback((weekId: string, currentlyOpen: boolean) => {
    setWeekOpenOverrides((prev) => ({
      ...prev,
      [weekId]: !currentlyOpen,
    }));
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackNavigation);
    return () => subscription.remove();
  }, [handleBackNavigation]);

  const handleTopBackPress = useCallback(() => {
    if (handleBackNavigation()) return;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/workout');
    }
  }, [handleBackNavigation, router]);

  // Kart Genişletme Durumları (Görseldeki gibi varsayılan olarak hepsi KAPALI özet çubuğu)
  const [openSummaries, setOpenSummaries] = useState<Record<number, boolean>>({});
  const [openFullDetails, setOpenFullDetails] = useState<Record<number, boolean>>({});

  // Düzenleme Modu Durumları: Record<workoutId, boolean>
  const [editModes, setEditModes] = useState<Record<number, boolean>>({});
  const [editingData, setEditingData] = useState<Record<number, ExerciseEntry[]>>({});
  const editingDataRef = useRef(editingData);
  useEffect(() => {
    editingDataRef.current = editingData;
  }, [editingData]);
  const [savingWorkoutIds, setSavingWorkoutIds] = useState<Record<number, boolean>>({});

  // Antrenman tarihlerinin Set'i (Arama filtresi varsa sadece aranan seans/hareket günlerini yeşil noktayla işaretler)
  const workoutDatesSet = useMemo(() => {
    const set = new Set<string>();
    const q = searchQuery.trim().toLowerCase();
    for (const w of workouts) {
      const dateIso = extractWorkoutDateIso(w.date);
      if (!dateIso) continue;
      if (q) {
        const matchSession = (w.session_type || '').toLowerCase().includes(q);
        const matchGym = (w.gym_name || '').toLowerCase().includes(q);
        const matchEx = (w.exercises || []).some((e) =>
          e.exercise_name.toLowerCase().includes(q)
        );
        if (!matchSession && !matchGym && !matchEx) continue;
      }
      set.add(dateIso);
    }
    return set;
  }, [workouts, searchQuery]);

  // Filtrelenmiş ve Sıralanmış Seanslar (Arama veya Takvim filtresi aktifken)
  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((w) => {
        if (selectedDate) {
          const dateIso = extractWorkoutDateIso(w.date);
          if (dateIso !== selectedDate) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSession = (w.session_type || '').toLowerCase().includes(q);
          const matchGym = (w.gym_name || '').toLowerCase().includes(q);
          const matchEx = (w.exercises || []).some((e) =>
            e.exercise_name.toLowerCase().includes(q)
          );
          if (!matchSession && !matchGym && !matchEx) return false;
        }
        return true;
      })
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [workouts, selectedDate, searchQuery]);

  const headerSessionCount = isFilterActive
    ? filteredWorkouts.length
    : activeMonth
      ? activeMonth.sessionsCount
      : activeYear
        ? activeYear.sessionsCount
        : workouts.length;

  // Özet Açma / Kapama (120Hz saf Reanimated worklet düzen geçişi)
  const toggleSummary = useCallback((workoutId: number) => {
    setOpenSummaries((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  }, []);

  // Detaylı Set & Tekrar Görünümünü Açma / Kapama ("Daha Fazla" Butonu)
  const toggleFull = useCallback((workoutId: number) => {
    setOpenFullDetails((prev) => {
      const next = !prev[workoutId];
      if (next) {
        setOpenSummaries((sPrev) => ({ ...sPrev, [workoutId]: true }));
      }
      return { ...prev, [workoutId]: next };
    });
  }, []);

  // Düzenleme Modunu Açma / Kapatma (Kalem İkonu)
  const toggleEdit = useCallback((workout: Workout) => {
    const wId = workout.id;
    setEditModes((prev) => {
      const next = !prev[wId];
      if (next) {
        setOpenSummaries((sPrev) => ({ ...sPrev, [wId]: true }));
        setOpenFullDetails((fPrev) => ({ ...fPrev, [wId]: true }));
        setEditingData((dPrev) => ({
          ...dPrev,
          [wId]: JSON.parse(JSON.stringify(workout.exercises || [])),
        }));
      }
      return { ...prev, [wId]: next };
    });
  }, []);

  // Set Değeri Değiştirme (Düzenleme Modunda)
  const handleSetChange = useCallback((
    workoutId: number,
    exIdx: number,
    setIdx: number,
    field: 'weight_kg' | 'reps' | 'rir',
    rawText: string
  ) => {
    const num = rawText === '' ? 0 : Number(rawText.replace(',', '.'));
    setEditingData((prev) => {
      const wExs: ExerciseEntry[] = prev[workoutId] ? JSON.parse(JSON.stringify(prev[workoutId])) : [];
      if (!wExs[exIdx] || !wExs[exIdx].sets_data[setIdx]) return prev;

      wExs[exIdx].sets_data[setIdx] = {
        ...wExs[exIdx].sets_data[setIdx],
        [field]: field === 'rir' && rawText === '' ? null : num,
      };

      return { ...prev, [workoutId]: wExs };
    });
  }, []);

  // Düzenlenen Seansı Kaydet
  const handleSaveEdit = useCallback(async (workoutId: number) => {
    const currentExercises = editingDataRef.current[workoutId];
    if (!currentExercises) return;

    setSavingWorkoutIds((prev) => ({ ...prev, [workoutId]: true }));
    try {
      await updateWorkout({
        id: workoutId,
        data: {
          exercises: currentExercises,
        },
      });

      setEditModes((prev) => ({ ...prev, [workoutId]: false }));
      Alert.alert('Başarılı', 'Antrenman seansı güncellendi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Seans güncellenirken bir sorun oluştu.');
    } finally {
      setSavingWorkoutIds((prev) => ({ ...prev, [workoutId]: false }));
    }
  }, [updateWorkout]);

  // Silme Onay Panosu Durumu
  const [workoutToDelete, setWorkoutToDelete] = useState<Workout | null>(null);
  const [isDeletingWorkout, setIsDeletingWorkout] = useState<boolean>(false);

  // Silme Onaylama İşlemi
  const handleConfirmDelete = async () => {
    if (!workoutToDelete) return;
    setIsDeletingWorkout(true);
    try {
      const deletedId = workoutToDelete.id;
      await deleteWorkout(deletedId);
      setWorkoutToDelete(null);

      // Silinen seans sonrası seçili ay/yıl boşaldıysa bir üst seviyeye güvenle dön
      const remaining = workouts.filter((w) => w.id !== deletedId);
      const nextGroups = buildWorkoutHierarchy(remaining);
      const nextYear =
        selectedYear !== null ? nextGroups.find((y) => y.year === selectedYear) ?? null : null;
      const nextMonth =
        nextYear && selectedMonthId
          ? nextYear.months.find((m) => m.id === selectedMonthId) ?? null
          : null;
      if (selectedYear !== null && !nextYear) {
        setSelectedYear(null);
        setSelectedMonthId(null);
      } else if (selectedMonthId && !nextMonth) {
        setSelectedMonthId(null);
      }
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Antrenman silinemedi.');
    } finally {
      setIsDeletingWorkout(false);
    }
  };

  const handleDelete = useCallback((workout: Workout) => {
    setWorkoutToDelete(workout);
  }, []);

  // Antrenman Sekmesine Yükle (Tune İkonu)
  const handleLoadToDraft = useCallback((workout: Workout) => {
    workoutDraft.loadWorkout(workout);
    router.push('/(app)/(tabs)/workout');
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handlePullToRefresh}
              tintColor={colors.purple}
              colors={[colors.purple]}
            />
          }
        >
          {/* ─── 1. Ekran Başlığı & Seans Sayacı Rozeti ─── */}
          <View style={styles.topHeaderBar}>
            <View style={styles.titleWithIcon}>
              <PressableScale
                style={styles.backButton}
                onPress={handleTopBackPress}
                activeScale={0.9}
                hitSlop={8}
              >
                <ArrowBackIcon size={18} color={colors.text} />
              </PressableScale>
              <Text style={styles.screenTitle} numberOfLines={1}>Antrenman Geçmişi</Text>
            </View>

            {/* Sağ: Bağlama Göre Seans Sayacı Rozeti */}
            <View style={styles.totalSessionsBadge}>
              <Text style={styles.totalBadgeText}>
                {headerSessionCount} Seans
              </Text>
            </View>
          </View>

          {/* ─── 2. Hızlı Filtre / Arama ve Takvim Butonu ─── */}
          <View style={styles.filterBar}>
            <View style={styles.searchInputBox}>
              <Text style={styles.searchIconText}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Seans veya hareket ara..."
                placeholderTextColor={colors.textDim}
              />
              {searchQuery.length > 0 && (
                <PressableScale onPress={() => setSearchQuery('')} activeScale={0.85} hitSlop={6}>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>✕</Text>
                </PressableScale>
              )}
            </View>

            {/* Tarih Seçim Butonu */}
            <PressableScale
              style={[
                styles.calTriggerBtn,
                selectedDate !== null && styles.calTriggerBtnActive,
              ]}
              onPress={() => setShowCalendarModal(true)}
              activeScale={0.94}
              hitSlop={6}
            >
              <CalendarIcon
                size={16}
                color={selectedDate ? '#FFFFFF' : colors.purple}
              />
              <Text
                style={[
                  styles.calTriggerBtnText,
                  selectedDate !== null && styles.calTriggerBtnTextActive,
                ]}
              >
                {selectedDate ? formatDateTR(selectedDate) : 'Tarih'}
              </Text>
            </PressableScale>
          </View>

          {/* Aktif Tarih Filtresi Varsa Bilgilendirme Çipi */}
          {selectedDate && (
            <View style={styles.activeFilterPillRow}>
              <Text style={styles.activeFilterPillLabel}>Filtrelendi:</Text>
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterPillText}>{formatDateTR(selectedDate)}</Text>
                <PressableScale onPress={() => setSelectedDate(null)} activeScale={0.85} hitSlop={6}>
                  <Text style={styles.activeFilterPillClose}>✕</Text>
                </PressableScale>
              </View>
              <PressableScale onPress={() => setSelectedDate(null)} activeScale={0.92}>
                <Text style={styles.showAllText}>Tümünü Göster</Text>
              </PressableScale>
            </View>
          )}

          {/* Hiyerarşi Konum Yolu (Breadcrumb): Yıllar › 2026 › Kasım 2026 */}
          {!isFilterActive && activeYear && (
            <View style={styles.breadcrumbRow}>
              <PressableScale
                activeScale={0.94}
                onPress={() => {
                  setRenderedWeekLimit(3);
                  setSelectedYear(null);
                  setSelectedMonthId(null);
                }}
              >
                <Text style={styles.breadcrumbLink}>Yıllar</Text>
              </PressableScale>

              <Text style={styles.breadcrumbSep}>›</Text>

              {activeMonth ? (
                <PressableScale
                  activeScale={0.94}
                  onPress={() => {
                    setRenderedWeekLimit(3);
                    setSelectedMonthId(null);
                  }}
                >
                  <Text style={styles.breadcrumbLink}>{activeYear.year}</Text>
                </PressableScale>
              ) : (
                <Text style={styles.breadcrumbCurrent}>{activeYear.year}</Text>
              )}

              {activeMonth && (
                <>
                  <Text style={styles.breadcrumbSep}>›</Text>
                  <Text style={styles.breadcrumbCurrent}>{activeMonth.title}</Text>
                </>
              )}
            </View>
          )}

          {/* ─── 3. İçerik Alanı: Yıl -> Ay (Alt Alta) -> Ay İçi Tüm Günler (Haftalık Gruplu) ─── */}
          {loading ? (
            <View style={styles.skeletonContainer}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={84} radius={16} style={styles.skeletonItem} />
              ))}
            </View>
          ) : isFilterActive ? (
            filteredWorkouts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🏋️</Text>
                <Text style={styles.emptyTitle}>Kayıtlı Seans Bulunamadı</Text>
                <Text style={styles.emptySubtitle}>
                  {selectedDate
                    ? `${formatDateTR(selectedDate)} tarihinde kayıtlı antrenman seansı yok.`
                    : 'Aramanızla eşleşen antrenman seansı bulunamadı.'}
                </Text>
                <PressableScale
                  style={styles.clearFilterBtn}
                  activeScale={0.95}
                  onPress={() => {
                    setSelectedDate(null);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.clearFilterBtnText}>Filtreleri Temizle</Text>
                </PressableScale>
              </View>
            ) : (
              filteredWorkouts.map((w, index) => (
                <SessionCardItem
                  key={`session-${w.id}-${animKey}-${selectedDate || 'search'}`}
                  workout={w}
                  index={index}
                  disableEntering={index >= 10}
                  isSummaryOpen={!!openSummaries[w.id]}
                  isFullOpen={!!openFullDetails[w.id]}
                  isEditing={!!editModes[w.id]}
                  isSaving={!!savingWorkoutIds[w.id]}
                  editingExercises={editingData[w.id]}
                  onToggleSummary={toggleSummary}
                  onToggleFull={toggleFull}
                  onToggleEdit={toggleEdit}
                  onLoadToDraft={handleLoadToDraft}
                  onDelete={handleDelete}
                  onSetChange={handleSetChange}
                  onSaveEdit={handleSaveEdit}
                />
              ))
            )
          ) : yearGroups.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>Kayıtlı Seans Bulunamadı</Text>
              <Text style={styles.emptySubtitle}>
                Henüz kaydedilmiş antrenman bulunmuyor.
              </Text>
            </View>
          ) : activeMonth ? (
            <SoftPageReveal key={`month-stage-${activeMonth.id}-${animKey}`}>
              <View style={styles.monthMetaBar}>
                <Text style={styles.monthMetaText}>
                  {activeMonth.title} · {activeMonth.daysCount} Gün
                </Text>
                <Text style={styles.monthMetaText}>
                  {activeMonth.weeks.length} Haftalık Grup
                </Text>
              </View>

              {activeMonth.weeks.slice(0, renderedWeekLimit).map((week) => {
                // Antrenman olan haftalar başlangıçtan itibaren AÇIK, kayıtsız haftalar KAPALI
                const isWeekOpen = weekOpenOverrides[week.id] ?? week.sessionsCount > 0;

                return (
                  <View key={`week-box-${week.id}`} style={styles.weekGroupBox}>
                    <PressableScale
                      style={styles.weekGroupHeader}
                      activeScale={0.985}
                      onPress={() => toggleWeekCollapse(week.id, isWeekOpen)}
                      unstable_pressDelay={0}
                    >
                      <View style={styles.weekGroupHeaderLeft}>
                        <Text style={styles.weekGroupTitle}>{week.title}</Text>
                        <Text style={styles.weekGroupRange}>• {week.rangeLabel}</Text>
                      </View>

                      <View style={styles.weekGroupHeaderRight}>
                        <View
                          style={
                            week.sessionsCount > 0
                              ? styles.weekGroupPillActive
                              : styles.weekGroupPillEmpty
                          }
                        >
                          <Text
                            style={
                              week.sessionsCount > 0
                                ? styles.weekGroupPillTextActive
                                : styles.weekGroupPillTextEmpty
                            }
                          >
                            {week.sessionsCount > 0
                              ? `${week.sessionsCount} İdman · ${week.totalSets} Set`
                              : 'İdman Yok'}
                          </Text>
                        </View>
                        <Text style={styles.weekGroupChevron}>
                          {isWeekOpen ? '▴' : '▾'}
                        </Text>
                      </View>
                    </PressableScale>

                    <SmoothAccordion isOpen={isWeekOpen} naturalHeightWhenSettled>
                      <View style={styles.weekGroupBody}>
                        {week.days.map((day) => {
                          if (day.workouts.length === 0) {
                            return (
                              <RestDayStripCard
                                key={`rest-${day.dateIso}`}
                                formattedDate={day.formattedDate}
                                weekdayShort={day.weekdayShort}
                                isFuture={day.isFuture}
                              />
                            );
                          }

                          return day.workouts.map((w) => (
                            <SessionCardItem
                              key={`month-${activeMonth.id}-session-${w.id}`}
                              workout={w}
                              index={0}
                              disableEntering
                              isSummaryOpen={!!openSummaries[w.id]}
                              isFullOpen={!!openFullDetails[w.id]}
                              isEditing={!!editModes[w.id]}
                              isSaving={!!savingWorkoutIds[w.id]}
                              editingExercises={editingData[w.id]}
                              onToggleSummary={toggleSummary}
                              onToggleFull={toggleFull}
                              onToggleEdit={toggleEdit}
                              onLoadToDraft={handleLoadToDraft}
                              onDelete={handleDelete}
                              onSetChange={handleSetChange}
                              onSaveEdit={handleSaveEdit}
                            />
                          ));
                        })}
                      </View>
                    </SmoothAccordion>
                  </View>
                );
              })}
            </SoftPageReveal>
          ) : activeYear ? (
            activeYear.months.map((month, index) => (
              <CompactGroupCard
                key={`month-card-${month.id}-${animKey}`}
                index={index}
                title={month.title}
                badgeText={`${month.sessionsCount} Antrenman`}
                metaText={`${month.daysCount} Gün (${month.weeks.length} Hafta)  •  ${month.totalSets} Toplam Set`}
                hintText={`Tüm ${month.daysCount} günü haftalık gruplarla görmek için tıkla ▸`}
                onPress={() => handleOpenMonth(month.id)}
              />
            ))
          ) : (
            yearGroups.map((yearGroup, index) => (
              <CompactGroupCard
                key={`year-card-${yearGroup.year}-${animKey}`}
                index={index}
                title={String(yearGroup.year)}
                badgeText={`${yearGroup.sessionsCount} Antrenman`}
                metaText={`${yearGroup.activeMonthsCount} Aktif Ay  •  ${yearGroup.totalSets} Toplam Set`}
                hintText="Ayları görmek için tıkla ▸"
                onPress={() => {
                  setSelectedYear(yearGroup.year);
                  setSelectedMonthId(null);
                }}
              />
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── 4. Web Tarzı Tarih Seçim Panosu Modalı ─── */}
      <WorkoutCalendarModal
        visible={showCalendarModal}
        selectedDate={selectedDate}
        searchQuery={searchQuery}
        workoutDatesSet={workoutDatesSet}
        onSelect={(newDate) => setSelectedDate(newDate)}
        onClear={() => {
          setSelectedDate(null);
          setSearchQuery('');
        }}
        onClose={() => setShowCalendarModal(false)}
      />

      {/* ─── 5. Web Tarzı Bulanık Arka Planlı Antrenman Silme Onay Panosu ─── */}
      <DeleteWorkoutConfirmModal
        workout={workoutToDelete}
        isDeleting={isDeletingWorkout}
        onConfirm={handleConfirmDelete}
        onCancel={() => setWorkoutToDelete(null)}
      />
    </SafeAreaView>
  );
}

// ─── Stiller (Görsel 1 ve Görsel 2 Tasarımı) ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },

  /* ─── 1. Ekran Başlığı & Seans Sayacı Rozeti ─── */
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  titleWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  totalSessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    flexShrink: 0,
  },
  totalBadgeText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.purple,
  },

  /* ─── 2. Filtre ve Takvim Barı ─── */
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  searchIconText: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    paddingVertical: 0,
  },
  calTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 12,
    height: 38,
    gap: 6,
  },
  calTriggerBtnActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  calTriggerBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
  },
  calTriggerBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Aktif Filtre Çipi */
  activeFilterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  activeFilterPillLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 6,
  },
  activeFilterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purple,
  },
  activeFilterPillClose: {
    fontSize: 11,
    color: colors.purple,
    fontWeight: '700',
  },
  showAllText: {
    fontSize: 12,
    color: colors.cyanAction,
    textDecorationLine: 'underline',
  },

  /* Hiyerarşi Breadcrumb & Grup Kartları */
  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  breadcrumbLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  breadcrumbSep: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDim,
  },
  breadcrumbCurrent: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.purple,
  },
  monthMetaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  monthMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  weekGroupBox: {
    backgroundColor: 'rgba(16, 21, 36, 0.36)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(192, 132, 252, 0.68)',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 6,
    marginBottom: 14,
  },
  weekGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
  weekGroupHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },
  weekGroupTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.purple,
  },
  weekGroupRange: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textMuted,
  },
  weekGroupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  weekGroupPillActive: {
    backgroundColor: colors.weightGreenBg,
    borderWidth: 1,
    borderColor: colors.weightGreenBorder,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  weekGroupPillTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.weightGreen,
  },
  weekGroupPillEmpty: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  weekGroupPillTextEmpty: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  weekGroupChevron: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  weekGroupBody: {
    marginTop: 8,
  },
  restDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 21, 36, 0.45)',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 13,
    paddingVertical: 9,
    marginBottom: 8,
    gap: 8,
  },
  restDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  restDayDateText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  restDayStatusText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
  },

  /* ─── 3. Seans Kartları (Kompakt Şerit Tasarımı) ─── */
  sessionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },

  /* Kart Üst Başlık & Sağ Aksiyon Barı */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderLeft: {
    flex: 1,
    minWidth: 0,
    paddingRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sessionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  movementBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  movementBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
    flexWrap: 'nowrap',
    minWidth: 0,
  },
  subtitleDateText: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontWeight: '500',
    flexShrink: 0,
  },
  subtitleGymText: {
    fontSize: 11.5,
    color: colors.textMuted,
    flexShrink: 1,
    minWidth: 0,
  },

  /* Kart Üst Sağ (Sadece 3 Aksiyon Butonu) */
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  headerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  editActionBtn: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tuneActionBtn: {
    backgroundColor: colors.cyanActionBg,
    borderColor: colors.cyanActionBorder,
  },
  deleteActionBtn: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },

  /* İpucu Barı */
  hintBar: {
    paddingTop: 10,
    paddingBottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintBarText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#7E8DAA',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  accordionOuter: {
    position: 'relative',
    overflow: 'hidden',
  },
  accordionOuterNatural: {
    overflow: 'visible',
  },
  accordionInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  accordionInnerNatural: {
    position: 'relative',
  },

  /* ─── 1. Aşama: Özet Görünüm (Görsel 1) ─── */
  summaryTopSpacer: {
    paddingTop: 10,
  },
  summaryContainer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  summaryExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B0F1C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  summaryExerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    paddingRight: 8,
  },
  summarySetBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  summarySetBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.repsBlue,
  },
  notesBox: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.purple,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  notesBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.purple,
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  notesBoxContent: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  btnMore: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 2,
  },
  btnMoreActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderColor: colors.purple,
  },
  btnMoreText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.purple,
  },

  /* ─── 2. Aşama: Detaylı Set & Tekrar Verileri (Görsel 2) ─── */
  fullDetailsTopSpacer: {
    paddingTop: 14,
  },
  fullDetailsContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.2)',
  },
  fullDetailsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  fullDetailsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.purple,
    letterSpacing: 0.5,
  },
  saveInlineBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  saveInlineBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Egzersiz Tablosu Kartı */
  exerciseSetsCard: {
    backgroundColor: '#0B0F1C',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 10,
    marginBottom: 10,
  },
  exerciseSetsCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.purple,
    marginBottom: 8,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 6,
  },
  thText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  colSet: {
    width: 58,
  },
  colSetText: {
    width: 58,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  colWeight: {
    flex: 1,
    textAlign: 'center',
  },
  colWeightContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightBadge: {
    backgroundColor: colors.weightGreenBg,
    borderWidth: 1,
    borderColor: colors.weightGreenBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 54,
    alignItems: 'center',
  },
  weightBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.weightGreen,
  },
  colReps: {
    flex: 1,
    textAlign: 'center',
  },
  colRepsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repsBadge: {
    backgroundColor: colors.repsBlueBg,
    borderWidth: 1,
    borderColor: colors.repsBlueBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 58,
    alignItems: 'center',
  },
  repsBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.repsBlue,
  },
  colRir: {
    width: 54,
    textAlign: 'center',
  },
  colRirContainer: {
    width: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rirBadge: {
    backgroundColor: colors.rirAmberBg,
    borderWidth: 1,
    borderColor: colors.rirAmberBorder,
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 46,
    alignItems: 'center',
  },
  rirBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.rirAmber,
  },

  /* Düzenleme Modu Girdileri */
  editInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 7,
    paddingHorizontal: 6,
    height: 28,
  },
  editRirInputBox: {
    width: 46,
  },
  editTextInput: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
    paddingVertical: 0,
    minWidth: 24,
    textAlign: 'center',
  },
  editRirTextInput: {
    minWidth: 20,
  },
  editUnitLabel: {
    fontSize: 10,
    color: colors.textDim,
    marginLeft: 2,
  },
  editRirUnitLabel: {
    fontSize: 9,
    color: colors.textDim,
    marginLeft: 1,
  },

  /* İskelet ve Boş Durum */
  skeletonContainer: {
    gap: 12,
  },
  skeletonItem: {
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearFilterBtn: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  clearFilterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.purple,
  },

  /* ─── 4. Web Tarzı Tarih Seçim Modal Stilleri ─── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F1528',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
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
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  calSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  calCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  calNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
    color: colors.text,
    fontWeight: '800',
  },
  calMonthLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  calWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  calWeekdayName: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  calCell: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    position: 'relative',
  },
  calCellSelected: {
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 3,
  },
  calCellText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
  },
  calCellTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calCellTextToday: {
    color: colors.purple,
    fontWeight: '800',
  },
  calGridContainer: {
    overflow: 'hidden',
    width: '100%',
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
    backgroundColor: colors.purple, // Mor (Bugün)
  },
  calFooter: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  calClearBtn: {
    width: '100%',
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calClearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.purple,
    letterSpacing: 0.2,
  },

  /* ─── 5. Antrenman Silme Onay Panosu Stilleri (Bulanık Arka Plan) ─── */
  delModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  delModalBackdropTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 8, 20, 0.72)',
  },
  delModalCard: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#0F1528',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    padding: 22,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  delModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  delModalIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delModalHeaderTextBox: {
    flex: 1,
  },
  delModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  delModalSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  delModalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginBottom: 14,
  },
  delModalDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 14,
  },
  delModalHighlight: {
    color: '#F87171',
    fontWeight: '700',
  },
  delModalWarningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 11,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  delModalWarningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#FCA5A5',
    lineHeight: 16,
  },
  delModalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
  },
  delCancelBtn: {
    backgroundColor: '#6D28D9', // Platform mor rengi
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 85,
  },
  delCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  delConfirmBtn: {
    backgroundColor: '#DC2626', // Normal kırmızı renk (parlak/neon değil)
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 125,
  },
  delConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
