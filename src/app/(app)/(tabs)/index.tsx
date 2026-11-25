import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

import { useAuth } from '@/auth/auth-provider';
import { useUser } from '@/hooks/use-user';
import { useWorkouts } from '@/hooks/use-workouts';

// ─── Minimalist Vektörel İkonlar ───
function BellIcon({ size = 18, color = '#A98BFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Ay İsmi Formatlayıcı (YYYY-MM -> "Kasım 2026") ───
function formatMonthTR(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${months[m - 1]} ${y}`;
}

// ─── MuscleWiki Tarzı Mini Vektörel Vücut Silüeti ───
type SilhouetteTarget = 'legs' | 'push' | 'pull' | 'upper' | 'lower' | 'other' | 'rest';

// Bugün aktif olan kasları oturum türüne göre neon renklerle vurgular.
function AnatomyMiniSilhouette({ target = 'legs' }: { target?: SilhouetteTarget }) {
  const isRest = target === 'rest';
  const isLegs = !isRest && (target === 'legs' || target === 'lower' || target === 'other');
  const isPush = !isRest && (target === 'push' || target === 'upper' || target === 'other');
  const isPull = !isRest && (target === 'pull' || target === 'upper' || target === 'other');

  const labelText =
    target === 'rest'
      ? 'DİNLENME'
      : target === 'push'
      ? 'İTİŞ'
      : target === 'pull'
      ? 'ÇEKİŞ'
      : target === 'upper'
      ? 'ÜST VÜCUT'
      : target === 'other'
      ? 'TÜM VÜCUT'
      : 'BACAK';

  const labelColor = isRest ? '#F4C35C' : isPull && !isPush && !isLegs ? '#35D69F' : '#55D6FF';

  return (
    <View style={styles.anatomyBox}>
      <Svg width={58} height={80} viewBox="0 0 100 140" fill="none">
        <Defs>
          <LinearGradient id="glowLegs" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#55D6FF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#35D69F" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Baş & Boyun */}
        <Circle cx="50" cy="13" r="8" stroke={isRest ? '#475569' : '#334155'} strokeWidth="1.5" fill="#141c2e" />
        <Path d="M46 21 L46 25 L54 25 L54 21" stroke="#334155" strokeWidth="1.2" fill="#141c2e" />

        {/* Omuzlar */}
        <Path
          d="M33 26 C26 30 24 38 25 45 C28 42 32 40 35 36 Z"
          fill={isPush ? '#55D6FF' : isPull ? '#35D69F' : '#141c2e'}
          stroke={isPush ? '#A98BFF' : isPull ? '#35D69F' : '#334155'}
          strokeWidth={1.2}
        />
        <Path
          d="M67 26 C74 30 76 38 75 45 C72 42 68 40 65 36 Z"
          fill={isPush ? '#55D6FF' : isPull ? '#35D69F' : '#141c2e'}
          stroke={isPush ? '#A98BFF' : isPull ? '#35D69F' : '#334155'}
          strokeWidth={1.2}
        />

        {/* Göğüs / Sırt Üst Gövde */}
        <Path
          d="M36 29 C42 28 48 30 49 40 C42 41 36 41 34 38 Z"
          fill={isPush ? '#55D6FF' : isPull ? '#35D69F' : '#141c2e'}
          stroke={isPush ? '#55D6FF' : isPull ? '#35D69F' : '#334155'}
          strokeWidth={1.2}
        />
        <Path
          d="M64 29 C58 28 52 30 51 40 C58 41 64 41 66 38 Z"
          fill={isPush ? '#55D6FF' : isPull ? '#35D69F' : '#141c2e'}
          stroke={isPush ? '#55D6FF' : isPull ? '#35D69F' : '#334155'}
          strokeWidth={1.2}
        />

        {/* Merkez / Sırt Bölgesi */}
        <Rect
          x="42"
          y="42"
          width="16"
          height="23"
          rx="3"
          fill={isPull ? 'rgba(53, 214, 159, 0.35)' : '#141c2e'}
          stroke={isPull ? '#35D69F' : '#334155'}
          strokeWidth="1.2"
        />

        {/* Kollar */}
        <Path
          d="M24 47 L20 72 L26 72 L29 47 Z"
          fill={isPull || isPush ? '#55D6FF' : '#141c2e'}
          stroke={isPull || isPush ? '#A98BFF' : '#334155'}
          strokeWidth={1.2}
        />
        <Path
          d="M76 47 L80 72 L74 72 L71 47 Z"
          fill={isPull || isPush ? '#55D6FF' : '#141c2e'}
          stroke={isPull || isPush ? '#A98BFF' : '#334155'}
          strokeWidth={1.2}
        />

        {/* Üst Bacak (Quadriceps & Gluteus) */}
        <Path
          d="M33 67 C30 84 31 100 35 106 C42 106 46 100 48 67 Z"
          fill={isLegs ? '#55D6FF' : '#141c2e'}
          stroke={isLegs ? '#A98BFF' : '#334155'}
          strokeWidth={isLegs ? 1.6 : 1.2}
        />
        <Path
          d="M67 67 C70 84 69 100 65 106 C58 106 54 100 52 67 Z"
          fill={isLegs ? '#55D6FF' : '#141c2e'}
          stroke={isLegs ? '#A98BFF' : '#334155'}
          strokeWidth={isLegs ? 1.6 : 1.2}
        />

        {/* Alt Bacak (Calf / Kalf) */}
        <Path
          d="M34 109 C32 120 33 133 39 135 C42 135 44 125 45 109 Z"
          fill={isLegs ? '#35D69F' : '#141c2e'}
          stroke={isLegs ? '#35D69F' : '#334155'}
          strokeWidth={1.2}
        />
        <Path
          d="M66 109 C68 120 67 133 61 135 C58 135 56 125 55 109 Z"
          fill={isLegs ? '#35D69F' : '#141c2e'}
          stroke={isLegs ? '#35D69F' : '#334155'}
          strokeWidth={1.2}
        />
      </Svg>
      <Text style={[styles.anatomyLabel, { color: labelColor }]}>{labelText}</Text>
    </View>
  );
}

// ─── Oturum Türü & Biçimlendirme Araçları (Web Platform Uyumu) ───
function getSessionKind(
  value?: string | null
): 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'rest' | 'other' | null {
  if (!value) return null;
  const text = value.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, ' ').trim();
  const tokens = new Set(text.split(/\s+/));
  if (!text || text === 'workout' || text === 'antrenman' || text === 'training') return null;
  if (
    tokens.has('dinlenme') ||
    tokens.has('rest') ||
    tokens.has('off') ||
    tokens.has('tatil') ||
    tokens.has('toparlanma')
  ) {
    return 'rest';
  }
  if (
    tokens.has('push') ||
    tokens.has('itis') ||
    tokens.has('itiş') ||
    tokens.has('itme') ||
    tokens.has('gogus') ||
    tokens.has('göğüs')
  ) {
    return 'push';
  }
  if (
    tokens.has('pull') ||
    tokens.has('cekis') ||
    tokens.has('çekiş') ||
    tokens.has('ceki') ||
    tokens.has('sirt') ||
    tokens.has('sırt')
  ) {
    return 'pull';
  }
  if (
    tokens.has('leg') ||
    tokens.has('legs') ||
    tokens.has('bacak') ||
    tokens.has('alt')
  ) {
    return 'legs';
  }
  if (tokens.has('upper') || tokens.has('ust') || tokens.has('üst')) return 'upper';
  if (tokens.has('lower')) return 'lower';
  return 'other';
}

function formatSessionTitle(rawType?: string | null): string {
  const kind = getSessionKind(rawType);
  if (kind === 'push') return 'Push Day';
  if (kind === 'pull') return 'Pull Day';
  if (kind === 'legs') return 'Legs Day';
  if (kind === 'upper') return 'Upper Body';
  if (kind === 'lower') return 'Lower Body';
  if (kind === 'rest') return 'Dinlenme Günü';
  return rawType?.trim() || 'Antrenman';
}

const SESSION_DEFAULT_FOCUS: Record<string, string> = {
  push: 'Göğüs · Ön Omuz · Triceps',
  pull: 'Latissimus · Üst Sırt · Biceps',
  legs: 'Quadriceps · Hamstring · Gluteus · Calf',
  upper: 'Göğüs · Sırt · Omuz · Kollar',
  lower: 'Quadriceps · Hamstring · Gluteus · Calf',
  rest: 'Toparlanma ve Dinlenme',
  other: 'Genel Kuvvet & Hipertrofi',
};

// Standart Web / Uzman Önerisi Split (Özel programı olmayan veya yeni kayıt olan kullanıcılar için)
const DEFAULT_WEEKLY_SCHEDULE = [
  { day: 'Pazartesi', type: 'Push Day', focus: 'Göğüs, Ön Omuz, Triceps', isRest: false },
  { day: 'Salı', type: 'Pull Day', focus: 'Latissimus, Üst Sırt, Biceps', isRest: false },
  { day: 'Çarşamba', type: 'Dinlenme Günü', focus: 'Dinlenme & Toparlanma', isRest: true },
  { day: 'Perşembe', type: 'Push Day', focus: 'Göğüs, Ön Omuz, Triceps', isRest: false },
  { day: 'Cuma', type: 'Legs Day', focus: 'Quadriceps, Hamstring, Gluteus, Calf', isRest: false },
  { day: 'Cumartesi', type: 'Legs Day', focus: 'Quadriceps, Hamstring, Gluteus, Calf', isRest: false },
  { day: 'Pazar', type: 'Pull Day', focus: 'Latissimus, Üst Sırt, Biceps', isRest: false },
];

type HeroExerciseItem = {
  index: number;
  name: string;
  target: string;
  setsCount: number;
  sets: string;
  reps: string;
};

const DEFAULT_EXERCISES_BY_KIND: Record<string, HeroExerciseItem[]> = {
  legs: [
    { index: 1, name: 'Squat', target: 'Ön Bacak & Kalça Çömelmesi', setsCount: 4, sets: '4 set', reps: '6–8 tekrar' },
    { index: 2, name: 'Romanian Deadlift', target: 'Arka Bacak & Bel Çekişi', setsCount: 3, sets: '3 set', reps: '8–10 tekrar' },
    { index: 3, name: 'Bulgarian Split Squat', target: 'Tek Bacak Çömelme (Kalça & Denge)', setsCount: 3, sets: '3 set', reps: '10–12 tekrar' },
    { index: 4, name: 'Standing Calf Raise', target: 'Baldır Yükselişi (Alt Bacak)', setsCount: 4, sets: '4 set', reps: '12–15 tekrar' },
  ],
  lower: [
    { index: 1, name: 'Squat', target: 'Ön Bacak & Kalça', setsCount: 4, sets: '4 set', reps: '6–8 tekrar' },
    { index: 2, name: 'Romanian Deadlift', target: 'Arka Bacak & Kalça', setsCount: 3, sets: '3 set', reps: '8–10 tekrar' },
    { index: 3, name: 'Leg Press / Split Squat', target: 'Quadriceps & Denge', setsCount: 3, sets: '3 set', reps: '10–12 tekrar' },
    { index: 4, name: 'Standing Calf Raise', target: 'Baldır (Alt Bacak)', setsCount: 4, sets: '4 set', reps: '12–15 tekrar' },
  ],
  push: [
    { index: 1, name: 'Incline Dumbbell Press', target: 'Üst Göğüs İtişi', setsCount: 4, sets: '4 set', reps: '6–8 tekrar' },
    { index: 2, name: 'Overhead Press', target: 'Omuz & Üst İtiş', setsCount: 3, sets: '3 set', reps: '6–10 tekrar' },
    { index: 3, name: 'Lateral Raises', target: 'Yan Omuz Yana Açış', setsCount: 4, sets: '4 set', reps: '12–15 tekrar' },
    { index: 4, name: 'Dips / Skull Crushers', target: 'Arka Kol / Triceps', setsCount: 3, sets: '3 set', reps: '8–12 tekrar' },
  ],
  pull: [
    { index: 1, name: 'Lat Pulldown / Chin Ups', target: 'Geniş Sırt & Kanat', setsCount: 4, sets: '4 set', reps: '6–10 tekrar' },
    { index: 2, name: 'Dumbbell Row', target: 'Orta Sırt Çekişi', setsCount: 3, sets: '3 set', reps: '8–12 tekrar' },
    { index: 3, name: 'Face Pull', target: 'Arka Omuz & Postür', setsCount: 3, sets: '3 set', reps: '12–15 tekrar' },
    { index: 4, name: 'Incline Biceps Curl', target: 'Pazu & Kol Büküşü', setsCount: 3, sets: '3 set', reps: '10–12 tekrar' },
  ],
  upper: [
    { index: 1, name: 'Bench / Incline Press', target: 'Göğüs & Ön Omuz', setsCount: 4, sets: '4 set', reps: '6–10 tekrar' },
    { index: 2, name: 'Barbell / Lat Row', target: 'Sırt & Kanat', setsCount: 4, sets: '4 set', reps: '8–12 tekrar' },
    { index: 3, name: 'Overhead Press & Lateral', target: 'Omuz Kompleksi', setsCount: 3, sets: '3 set', reps: '8–15 tekrar' },
    { index: 4, name: 'Biceps & Triceps', target: 'Kollar', setsCount: 3, sets: '3 set', reps: '10–12 tekrar' },
  ],
  other: [
    { index: 1, name: 'Bileşik İtiş (Press)', target: 'Göğüs & Omuz', setsCount: 4, sets: '4 set', reps: '6–10 tekrar' },
    { index: 2, name: 'Bileşik Çekiş (Row / Pull)', target: 'Sırt & Kol', setsCount: 4, sets: '4 set', reps: '8–12 tekrar' },
    { index: 3, name: 'Squat / Hinge', target: 'Bacak & Kalça', setsCount: 3, sets: '3 set', reps: '8–10 tekrar' },
    { index: 4, name: 'Core & İzolasyon', target: 'Merkez & Denge', setsCount: 3, sets: '3 set', reps: '12–15 tekrar' },
  ],
  rest: [
    { index: 1, name: 'Hafif Yürüyüş', target: 'Aktif Toparlanma', setsCount: 0, sets: 'Dinlenme', reps: '20–30 dk' },
    { index: 2, name: 'Mobilite & Esneme', target: 'Kas Gevşetme', setsCount: 0, sets: 'Dinlenme', reps: '10–15 dk' },
  ],
};

type WeekScheduleItem = {
  dayNum: string;
  dayName: string;
  fullDayName: string;
  dateIso: string;
  title: string;
  subtitle: string;
  plannedFocus: string;
  isRest: boolean;
  exercises: any[];
  status: 'done' | 'today' | 'missed' | 'rest' | 'planned';
  badgeText: string;
  actualWorkout?: any;
};

type MonthDayCellData = {
  kind: 'day';
  key: string;
  day: number;
  cellIso: string;
  isToday: boolean;
  isDone: boolean;
  isMissed: boolean;
  isRest: boolean;
};

type MonthCellEntry = { kind: 'empty'; key: string } | MonthDayCellData;

function getDefaultIsoForMonth(
  monthIso: string,
  todayIso: string,
  currentSelectedIso: string
): string {
  if (monthIso === todayIso.slice(0, 7)) {
    return todayIso;
  }
  const [y, m] = monthIso.split('-').map(Number);
  const maxDays = new Date(y, m, 0).getDate();
  const preferredDay = Number(currentSelectedIso.slice(8, 10)) || 1;
  const clampedDay = Math.min(preferredDay, maxDays);
  return `${monthIso}-${String(clampedDay).padStart(2, '0')}`;
}

const WeekPage = React.memo(function WeekPage({
  schedule,
  width,
  pageIndex,
  scrollX,
}: {
  schedule: WeekScheduleItem[];
  width: number;
  pageIndex: number;
  scrollX: Animated.Value;
}) {
  const inputRange = [(pageIndex - 1) * width, pageIndex * width, (pageIndex + 1) * width];
  const pageOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.45, 1, 0.45],
    extrapolate: 'clamp',
  });
  const pageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.955, 1, 0.955],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width, paddingHorizontal: 5 }}>
      <Animated.View
        style={[
          styles.weekBoard,
          {
            opacity: pageOpacity,
            transform: [{ scale: pageScale }],
          },
        ]}
      >
        {schedule.map((item, idx) => {
          const isToday = item.status === 'today';
          const isDone = item.status === 'done';
          const isMissed = item.status === 'missed';
          const isRest = item.status === 'rest';

          return (
            <View
              key={`${item.dateIso}-${idx}`}
              style={[
                styles.programCard,
                isDone && styles.cardDone,
                isMissed && styles.cardMissed,
                isRest && styles.cardRest,
                isToday && styles.cardToday,
              ]}
            >
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.dateBox,
                    isDone && styles.dateBoxDone,
                    isMissed && styles.dateBoxMissed,
                    isRest && styles.dateBoxRest,
                    isToday && styles.dateBoxToday,
                  ]}
                >
                  <Text style={styles.dateBoxNum}>{item.dayNum}</Text>
                  <Text style={styles.dateBoxName}>{item.dayName}</Text>
                </View>

                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSub}>{item.subtitle}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    isDone && styles.statusBadgeDone,
                    isMissed && styles.statusBadgeMissed,
                    isRest && styles.statusBadgeRest,
                    isToday && styles.statusBadgeToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isDone && styles.statusBadgeTextDone,
                      isMissed && styles.statusBadgeTextMissed,
                      isRest && styles.statusBadgeTextRest,
                      isToday && styles.statusBadgeTextToday,
                    ]}
                  >
                    {item.badgeText}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
});

const MonthDayCell = React.memo(function MonthDayCell({
  cell,
  isSelected,
  onSelect,
}: {
  cell: MonthDayCellData;
  isSelected: boolean;
  onSelect: (iso: string) => void;
}) {
  const [selectAnim] = useState(() => new Animated.Value(isSelected ? 1 : 0));

  useEffect(() => {
    selectAnim.stopAnimation();
    Animated.timing(selectAnim, {
      toValue: isSelected ? 1 : 0,
      duration: 420,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isSelected, selectAnim]);

  const cardScale = selectAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.07],
  });

  const selectedBorderColor =
    cell.isDone ? '#35D69F' :
    cell.isMissed ? '#FF7188' :
    cell.isRest ? '#F4C35C' :
    cell.isToday ? '#BFA7FF' :
    '#55D6FF';

  return (
    <TouchableOpacity
      style={styles.monthCell}
      activeOpacity={0.75}
      delayPressIn={0}
      onPress={() => onSelect(cell.cellIso)}
    >
      <Animated.View
        style={[
          styles.monthDot,
          cell.isToday && styles.dotToday,
          cell.isDone && styles.dotDone,
          cell.isMissed && styles.dotMissed,
          cell.isRest && styles.dotRest,
          { transform: [{ scale: cardScale }] },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.monthDotSelectedRing,
            {
              borderColor: selectedBorderColor,
              opacity: selectAnim,
            },
          ]}
        />
        <Text
          style={[
            styles.dotText,
            cell.isToday && styles.dotTextToday,
            isSelected && styles.dotTextSelected,
          ]}
        >
          {cell.day}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
});

const MonthGridPage = React.memo(function MonthGridPage({
  cells,
  selectedIsoInMonth,
  width,
  pageIndex,
  scrollX,
  onSelectDay,
}: {
  cells: MonthCellEntry[];
  selectedIsoInMonth: string | null;
  width: number;
  pageIndex: number;
  scrollX: Animated.Value;
  onSelectDay: (iso: string) => void;
}) {
  const inputRange = [(pageIndex - 1) * width, pageIndex * width, (pageIndex + 1) * width];
  const pageOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.45, 1, 0.45],
    extrapolate: 'clamp',
  });
  const pageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.955, 1, 0.955],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ width, paddingHorizontal: 4 }}>
      <Animated.View
        style={[
          styles.animatedMonthGrid,
          {
            opacity: pageOpacity,
            transform: [{ scale: pageScale }],
          },
        ]}
      >
        {cells.map((cell) => {
          if (cell.kind === 'empty') {
            return <View key={cell.key} style={styles.monthCellEmpty} />;
          }
          return (
            <MonthDayCell
              key={cell.key}
              cell={cell}
              isSelected={selectedIsoInMonth === cell.cellIso}
              onSelect={onSelectDay}
            />
          );
        })}
      </Animated.View>
    </View>
  );
});

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const { user } = useUser();
  const { workouts } = useWorkouts();

  // Durum Yönetimi: Sekmeler & Hero Akordiyon (Kullanıcı isteği: default kapalı)
  const [viewTab, setViewTab] = useState<'weekly' | 'monthly'>('weekly');
  const [isHeroOpen, setIsHeroOpen] = useState<boolean>(false);
  const [isHeroMounted, setIsHeroMounted] = useState<boolean>(false);
  const [heroContentHeight, setHeroContentHeight] = useState<number>(360);

  // Sekmeler arası yavaş, akıcı (slow-motion) tek eksenli native geçiş sürücüsü (0: Haftalık, 1: Aylık)
  const [tabProgress] = useState(() => new Animated.Value(0));

  const handleTabChange = (newTab: 'weekly' | 'monthly') => {
    if (newTab === viewTab) return;
    tabProgress.stopAnimation();
    setViewTab(newTab);

    Animated.timing(tabProgress, {
      toValue: newTab === 'weekly' ? 0 : 1,
      duration: 460,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };

  // Bugünün planı detayları için gün detay kartıyla aynı yavaş & soft geçiş animasyonu
  const [heroHeightAnim] = useState(() => new Animated.Value(0));
  const [heroFadeAnim] = useState(() => new Animated.Value(0));
  const [heroDriftAnim] = useState(() => new Animated.Value(-8));

  const toggleHeroDetail = () => {
    heroHeightAnim.stopAnimation();
    heroFadeAnim.stopAnimation();
    heroDriftAnim.stopAnimation();

    if (isHeroOpen) {
      setIsHeroOpen(false);
      Animated.parallel([
        Animated.timing(heroFadeAnim, {
          toValue: 0,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(heroDriftAnim, {
          toValue: -6,
          duration: 240,
          easing: Easing.out(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(heroHeightAnim, {
          toValue: 0,
          duration: 480,
          delay: 60,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setIsHeroMounted(false);
        }
      });
    } else {
      setIsHeroOpen(true);
      if (!isHeroMounted) {
        setIsHeroMounted(true);
        heroFadeAnim.setValue(0);
        heroDriftAnim.setValue(-8);
      }

      Animated.parallel([
        Animated.timing(heroHeightAnim, {
          toValue: 1,
          duration: 480,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(heroFadeAnim, {
          toValue: 1,
          duration: 540,
          delay: 90,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(heroDriftAnim, {
          toValue: 0,
          duration: 540,
          delay: 90,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const detailHeight = heroHeightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, heroContentHeight],
  });

  // Kullanıcı Bilgisi
  const username = user?.username || (state.status === 'signedIn' ? state.user.username : 'Turan');
  const userInitials = username.slice(0, 1).toUpperCase();

  // Tarih Bilgisi
  const today = useMemo(() => new Date(), []);
  const todayIso = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  const todayFormatted = useMemo(() => {
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const monthNames = [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ];
    return `Bugün, ${today.getDate()} ${monthNames[today.getMonth()]} ${dayNames[today.getDay()]}`;
  }, [today]);

  // ─── PAGER & GENİŞLİK YÖNETİMİ (MODERN YATAY AKIŞ) ───
  const { width: windowWidth } = useWindowDimensions();
  const initialBoardOuterWidth = Math.max(300, windowWidth - 32);
  const initialBoardInnerWidth = Math.max(270, initialBoardOuterWidth - 30);
  const [segTabWidth, setSegTabWidth] = useState<number>(initialBoardOuterWidth);
  const [tabStageWidth, setTabStageWidth] = useState<number>(initialBoardOuterWidth);
  const [containerWidth, setContainerWidth] = useState<number>(initialBoardInnerWidth);
  const [monthGridWidth, setMonthGridWidth] = useState<number>(initialBoardInnerWidth);

  // Haftalık Program Pager Ref & Aktif İndeks (0: 4 Hafta Önce, ..., 4: Bu Hafta)
  const weekScrollRef = useRef<any>(null);
  const weekScrollX = useRef(new Animated.Value(4 * initialBoardInnerWidth)).current;
  const isProgrammaticWeekScrollRef = useRef<boolean>(false);
  const [activeWeekIndex, setActiveWeekIndex] = useState<number>(4);

  // Aylık Takip Pager Ref & Aktif İndeks (0: 11 Ay Önce, ..., 11: Bu Ay)
  const monthScrollRef = useRef<any>(null);
  const monthScrollX = useRef(new Animated.Value(11 * initialBoardInnerWidth)).current;
  const isProgrammaticMonthScrollRef = useRef<boolean>(false);
  const [activeMonthIndex, setActiveMonthIndex] = useState<number>(11);
  // Gün kartı daima seçili kalır (varsayılan: bugün)
  const [selectedMonthIso, setSelectedMonthIso] = useState<string>(todayIso);
  const [displayedDetailIso, setDisplayedDetailIso] = useState<string>(todayIso);
  const displayedDetailIsoRef = useRef<string>(displayedDetailIso);
  displayedDetailIsoRef.current = displayedDetailIso;

  // Seçili gün detay kartı içeriği için yavaş, yumuşak (soft cross-dissolve) geçiş animasyonu
  const [monthDetailFadeAnim] = useState(() => new Animated.Value(1));
  const [monthDetailDriftAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (selectedMonthIso === displayedDetailIsoRef.current) {
      return;
    }
    let cancelled = false;
    monthDetailFadeAnim.stopAnimation();
    monthDetailDriftAnim.stopAnimation();

    // 1. Aşama: Mevcut içerik yumuşakça solar
    Animated.parallel([
      Animated.timing(monthDetailFadeAnim, {
        toValue: 0,
        duration: 190,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(monthDetailDriftAnim, {
        toValue: -6,
        duration: 190,
        easing: Easing.out(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(({ finished }) => {
      if (cancelled || !finished) return;
      // 2. Aşama: İçerik görünmezken güncellenir ve uzun/yumuşak (540ms) süzülerek yüklenir
      setDisplayedDetailIso(selectedMonthIso);
      monthDetailDriftAnim.setValue(10);

      Animated.parallel([
        Animated.timing(monthDetailFadeAnim, {
          toValue: 1,
          duration: 540,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(monthDetailDriftAnim, {
          toValue: 0,
          duration: 540,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    });

    return () => {
      cancelled = true;
    };
  }, [selectedMonthIso, monthDetailFadeAnim, monthDetailDriftAnim]);

  const handleSelectMonthDay = React.useCallback((cellIso: string) => {
    // Aynı güne tekrar basıldığında detay kartını kapatma, seçili kalsın
    setSelectedMonthIso((prev) => (prev === cellIso ? prev : cellIso));
  }, []);

  const handlePrevWeek = () => {
    if (activeWeekIndex > 0) {
      const target = activeWeekIndex - 1;
      isProgrammaticWeekScrollRef.current = true;
      setActiveWeekIndex(target);
      weekScrollRef.current?.scrollTo({ x: target * containerWidth, animated: true });
    }
  };

  const handleNextWeek = () => {
    if (activeWeekIndex < 4) {
      const target = activeWeekIndex + 1;
      isProgrammaticWeekScrollRef.current = true;
      setActiveWeekIndex(target);
      weekScrollRef.current?.scrollTo({ x: target * containerWidth, animated: true });
    }
  };

  const activeWeekIndexRef = useRef(activeWeekIndex);
  activeWeekIndexRef.current = activeWeekIndex;
  const activeMonthIndexRef = useRef(activeMonthIndex);
  activeMonthIndexRef.current = activeMonthIndex;

  // İlk çizim ve genişlik değişimlerinde hafta pager'ını hizala (sekme değişiminde sıfırlama yok)
  useEffect(() => {
    const targetX = activeWeekIndexRef.current * containerWidth;
    requestAnimationFrame(() => {
      weekScrollRef.current?.scrollTo({ x: targetX, animated: false });
      weekScrollX.setValue(targetX);
    });
  }, [containerWidth, weekScrollX]);

  // İlk çizim ve genişlik değişimlerinde aylık pager'ı hizala (sekme değişiminde sıfırlama yok)
  useEffect(() => {
    const targetX = activeMonthIndexRef.current * monthGridWidth;
    requestAnimationFrame(() => {
      monthScrollRef.current?.scrollTo({ x: targetX, animated: false });
      monthScrollX.setValue(targetX);
    });
  }, [monthGridWidth, monthScrollX]);

  // Kayıtlı gerçek antrenmanların haritası
  const workoutDatesMap = useMemo(() => {
    const map = new Map<string, (typeof workouts)[0]>();
    workouts.forEach((w) => {
      map.set(w.date, w);
    });
    return map;
  }, [workouts]);

  // ─── KULLANICININ ÖZEL PROGRAMI VEYA STANDART UZMAN SPLİTİ ───
  const userCustomSplit = user?.custom_split;
  const { baseProgram, hasCustomProgram, programBadgeText } = useMemo(() => {
    let rawDays: any[] = [];
    let customFound = false;

    if (userCustomSplit) {
      try {
        const parsed = JSON.parse(userCustomSplit);
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawDays = Array.isArray(parsed[0]) ? parsed[0] : parsed;
          if (rawDays.length >= 7) {
            customFound = true;
          }
        }
      } catch (e) {
        console.warn('custom_split parse hatası:', e);
      }
    }

    const program = customFound ? rawDays.slice(0, 7) : DEFAULT_WEEKLY_SCHEDULE;
    return {
      baseProgram: program,
      hasCustomProgram: customFound,
      programBadgeText: customFound ? 'Özel Programım' : 'Uzman Önerisi',
    };
  }, [userCustomSplit]);

  const buildWeekSchedule = React.useCallback(
    (offset: number) => {
      // Haftanın (Pazartesi - Pazar) gün tarihlerini hesapla
      const dayOfWeek = today.getDay(); // 0: Pazar, 1: Pazartesi
      const distToMon = (dayOfWeek + 6) % 7; // Pazartesi = 0

      const dayLabelsTR = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
      const fullDayLabelsTR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

      const weekDates = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - distToMon + offset * 7 + i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dateNum = String(d.getDate()).padStart(2, '0');
        weekDates.push({
          dateIso: `${y}-${m}-${dateNum}`,
          dayNum: String(d.getDate()),
          dayName: dayLabelsTR[i],
          fullDayName: fullDayLabelsTR[i],
          index: i,
        });
      }

      // Başlangıç haftalık kartlarını oluştur
      const result = weekDates.map((wDate, idx) => {
        const base = baseProgram[idx] || DEFAULT_WEEKLY_SCHEDULE[idx];
        const focusText = base.focus || (base.isRest ? 'Toparlanma ve dinlenme' : 'Genel antrenman');
        return {
          dayNum: wDate.dayNum,
          dayName: wDate.dayName,
          fullDayName: wDate.fullDayName,
          dateIso: wDate.dateIso,
          title: base.type || (base.isRest ? 'Dinlenme Günü' : 'Antrenman'),
          subtitle: focusText,
          plannedFocus: focusText,
          isRest: !!base.isRest,
          exercises: base.exercises || [],
          status: 'planned' as 'done' | 'today' | 'missed' | 'rest' | 'planned',
          badgeText: 'Planlandı',
          actualWorkout: undefined as (typeof workouts)[0] | undefined,
        };
      });

      // Bu haftaya denk gelen gerçek antrenmanları eşle
      const actualSlots = new Map<number, (typeof workouts)[0]>();
      for (let i = 0; i < 7; i++) {
        const w = workoutDatesMap.get(weekDates[i].dateIso);
        if (w) {
          actualSlots.set(i, w);
        }
      }

      if (offset === 0) {
        // 5. Adaptif Seans Yer Değiştirme (Dinamik Reconcile & Swap Logic - Sadece Bu Hafta için)
        for (const [sourceIndex, actual] of actualSlots.entries()) {
          const actualKind = getSessionKind(actual.session_type);
          if (!actualKind || actualKind === 'rest') continue;

          const plannedKind = getSessionKind(result[sourceIndex].title);

          if (plannedKind === actualKind && !result[sourceIndex].isRest) {
            result[sourceIndex].title = formatSessionTitle(actual.session_type || result[sourceIndex].title);
            result[sourceIndex].status = 'done';
            result[sourceIndex].badgeText = 'Yapıldı ✓';
            result[sourceIndex].actualWorkout = actual;
            if (actual.exercises && actual.exercises.length > 0) {
              result[sourceIndex].exercises = actual.exercises;
            }
            continue;
          }

          const candidates = [
            ...Array.from({ length: 7 - sourceIndex - 1 }, (_, k) => sourceIndex + 1 + k),
            ...Array.from({ length: sourceIndex }, (_, k) => sourceIndex - 1 - k),
          ];

          let targetIndex = candidates.find(
            (idx) =>
              !actualSlots.has(idx) &&
              !result[idx].isRest &&
              getSessionKind(result[idx].title) === actualKind
          );

          if (targetIndex === undefined) {
            targetIndex = candidates.find((idx) => !actualSlots.has(idx));
          }

          if (targetIndex !== undefined) {
            const displacedContent = {
              title: result[sourceIndex].title,
              subtitle: result[sourceIndex].subtitle,
              plannedFocus: result[sourceIndex].plannedFocus,
              isRest: result[sourceIndex].isRest,
              exercises: result[sourceIndex].exercises,
            };

            result[sourceIndex].title = formatSessionTitle(actual.session_type);
            result[sourceIndex].subtitle = actual.exercises?.length
              ? `${actual.exercises.length} Egzersiz Tamamlandı`
              : (SESSION_DEFAULT_FOCUS[actualKind] || result[sourceIndex].subtitle);
            result[sourceIndex].isRest = false;
            result[sourceIndex].status = 'done';
            result[sourceIndex].badgeText = 'Yapıldı ✓';
            result[sourceIndex].actualWorkout = actual;
            if (actual.exercises && actual.exercises.length > 0) {
              result[sourceIndex].exercises = actual.exercises;
            }

            result[targetIndex].title = displacedContent.title;
            result[targetIndex].subtitle = displacedContent.subtitle;
            result[targetIndex].plannedFocus = displacedContent.plannedFocus;
            result[targetIndex].isRest = displacedContent.isRest;
            result[targetIndex].exercises = displacedContent.exercises;
          } else {
            result[sourceIndex].title = formatSessionTitle(actual.session_type);
            result[sourceIndex].status = 'done';
            result[sourceIndex].badgeText = 'Yapıldı ✓';
            result[sourceIndex].actualWorkout = actual;
          }
        }

        // 6. Bu haftanın boş günlerini finalize et
        const todayIndex = distToMon;
        for (let i = 0; i < 7; i++) {
          if (!actualSlots.has(i)) {
            if (i < todayIndex) {
              if (result[i].isRest) {
                result[i].status = 'rest';
                result[i].badgeText = 'Dinlenme ☾';
              } else {
                result[i].status = 'missed';
                result[i].badgeText = 'Kaçırıldı !';
              }
            } else if (i === todayIndex) {
              if (result[i].isRest) {
                result[i].status = 'rest';
                result[i].badgeText = 'Dinlenme ☾';
              } else {
                result[i].status = 'today';
                result[i].badgeText = 'BUGÜN 🔥';
              }
            } else {
              if (result[i].isRest) {
                result[i].status = 'rest';
                result[i].badgeText = 'Dinlenme ☾';
              } else {
                result[i].status = 'planned';
                result[i].badgeText = 'Planlandı';
              }
            }
          }
        }
      } else {
        // GEÇMİŞ HAFTALAR İÇİN (offset < 0)
        // Hangi günler antrenman yapılmışsa doğrudan gösterilir
        for (let i = 0; i < 7; i++) {
          const actual = actualSlots.get(i);
          if (actual) {
            result[i].title = formatSessionTitle(actual.session_type || result[i].title);
            result[i].subtitle = actual.exercises?.length
              ? `${actual.exercises.length} Egzersiz Tamamlandı`
              : (result[i].subtitle || 'Antrenman tamamlandı');
            result[i].isRest = false;
            result[i].status = 'done';
            result[i].badgeText = 'Yapıldı ✓';
            result[i].actualWorkout = actual;
            if (actual.exercises && actual.exercises.length > 0) {
              result[i].exercises = actual.exercises;
            }
          } else {
            if (result[i].isRest) {
              result[i].status = 'rest';
              result[i].badgeText = 'Dinlenme ☾';
            } else {
              result[i].status = 'missed';
              result[i].badgeText = 'Kaçırıldı !';
            }
          }
        }
      }

      return result;
    },
    [baseProgram, today, workoutDatesMap]
  );

  const getWeekInfo = React.useCallback(
    (offset: number) => {
      const dayOfWeek = today.getDay();
      const distToMon = (dayOfWeek + 6) % 7;
      const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - distToMon + offset * 7);
      const sunday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - distToMon + offset * 7 + 6);

      const monthNamesTR = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
      ];

      let label = 'Bu Hafta';
      if (offset === -1) label = 'Geçen Hafta';
      else if (offset === -2) label = '2 Hafta Önce';
      else if (offset === -3) label = '3 Hafta Önce';
      else if (offset === -4) label = '4 Hafta Önce';

      const mMonth = monthNamesTR[monday.getMonth()];
      const sMonth = monthNamesTR[sunday.getMonth()];

      let rangeText = '';
      if (mMonth === sMonth) {
        rangeText = `${monday.getDate()} - ${sunday.getDate()} ${sMonth}`;
      } else {
        rangeText = `${monday.getDate()} ${mMonth} - ${sunday.getDate()} ${sMonth}`;
      }

      return { label, rangeText };
    },
    [today]
  );

  const WEEK_OFFSETS = useMemo(() => [-4, -3, -2, -1, 0] as const, []);

  // 5 Haftalık Tüm Veriler Önceden Hazırlanır (Yatay kaydırma anında yan yana durur)
  const allWeeksData = useMemo(() => {
    return WEEK_OFFSETS.map((offset) => {
      const schedule = buildWeekSchedule(offset);
      const info = getWeekInfo(offset);
      return {
        offset,
        schedule,
        info,
      };
    });
  }, [WEEK_OFFSETS, buildWeekSchedule, getWeekInfo]);

  const currentWeekItem = allWeeksData[activeWeekIndex] || allWeeksData[4];

  // Bugünün planı kartı için veriler (Haftalık uyumlaştırılmış plandan otomatik çekilir - daima mevcut hafta)
  const currentWeekSchedule = useMemo(() => buildWeekSchedule(0), [buildWeekSchedule]);
  const todayIndex = useMemo(() => (today.getDay() + 6) % 7, [today]);
  const todayCard = useMemo(
    () => currentWeekSchedule[todayIndex] || currentWeekSchedule[0],
    [currentWeekSchedule, todayIndex]
  );

  const todaySilhouetteTarget = useMemo((): SilhouetteTarget => {
    if (todayCard.isRest) return 'rest';
    const kind = getSessionKind(todayCard.title);
    if (kind === 'rest') return 'rest';
    if (kind === 'push') return 'push';
    if (kind === 'pull') return 'pull';
    if (kind === 'upper') return 'upper';
    if (kind === 'lower') return 'lower';
    if (kind === 'legs') return 'legs';
    return 'other';
  }, [todayCard.isRest, todayCard.title]);

  const todayExercisesList = useMemo<HeroExerciseItem[]>(() => {
    if (todayCard.isRest) {
      return DEFAULT_EXERCISES_BY_KIND.rest;
    }
    if (todayCard.exercises && todayCard.exercises.length > 0) {
      return todayCard.exercises.map((ex: any, idx: number) => {
        const setsCount = Array.isArray(ex.sets_data)
          ? ex.sets_data.length
          : Number(ex.sets) || 3;
        return {
          index: idx + 1,
          name: String(ex.exercise_name || ex.name || 'Egzersiz'),
          target: String(ex.muscle_group || ex.target || todayCard.plannedFocus || todayCard.subtitle),
          setsCount,
          sets: `${setsCount} set`,
          reps: ex.sets_data?.[0]?.reps ? `${ex.sets_data[0].reps} tekrar` : '8–12 tekrar',
        };
      });
    }
    const kind = getSessionKind(todayCard.title);
    return DEFAULT_EXERCISES_BY_KIND[kind || 'other'] || DEFAULT_EXERCISES_BY_KIND.other;
  }, [todayCard]);

  const todayExerciseCount = todayCard.isRest ? 0 : todayExercisesList.length;

  const todayTotalSets = useMemo(() => {
    if (todayCard.isRest) return 0;
    return todayExercisesList.reduce((sum, item) => sum + item.setsCount, 0);
  }, [todayCard.isRest, todayExercisesList]);

  const todayTargetMuscles = useMemo(() => {
    if (todayCard.isRest) {
      return 'Dinlenme';
    }
    const actualExercises = todayCard.actualWorkout?.exercises;
    if (Array.isArray(actualExercises) && actualExercises.length > 0) {
      const uniqueMuscles = Array.from(
        new Set(actualExercises.map((ex: any) => ex.muscle_group).filter(Boolean))
      );
      if (uniqueMuscles.length > 0) {
        return uniqueMuscles.join(', ');
      }
    }
    const kind = getSessionKind(todayCard.title);
    return (
      todayCard.plannedFocus ||
      todayCard.subtitle ||
      SESSION_DEFAULT_FOCUS[kind || 'other'] ||
      'Genel Kuvvet'
    );
  }, [todayCard]);

  // 12 Aylık Tüm Takvim Verileri Önceden Hazırlanır (Yatay kaydırırken aylar anında görünür)
  const MONTH_OFFSETS = useMemo(
    () => [-11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0] as const,
    []
  );

  const allMonthsData = useMemo(() => {
    return MONTH_OFFSETS.map((offset) => {
      const target = new Date(today.getFullYear(), today.getMonth() + offset, 1);
      const y = target.getFullYear();
      const m = String(target.getMonth() + 1).padStart(2, '0');
      const monthIso = `${y}-${m}`;

      const firstDay = new Date(y, target.getMonth(), 1);
      const lastDay = new Date(y, target.getMonth() + 1, 0);

      let startDayIdx = firstDay.getDay() - 1;
      if (startDayIdx === -1) startDayIdx = 6;

      const totalDays = lastDay.getDate();
      const cells: MonthCellEntry[] = [];
      let completed = 0;
      let missed = 0;
      let rest = 0;

      for (let i = 0; i < startDayIdx; i++) {
        cells.push({ kind: 'empty', key: `empty-lead-${monthIso}-${i}` });
      }

      for (let d = 1; d <= totalDays; d++) {
        const dayStr = String(d).padStart(2, '0');
        const cellIso = `${monthIso}-${dayStr}`;
        const hasRealWorkout = workoutDatesMap.has(cellIso);
        const isToday = cellIso === todayIso;
        const isFuture = cellIso > todayIso;

        const isDone = hasRealWorkout;
        let isMissed = false;
        let isRest = false;

        if (hasRealWorkout) {
          completed++;
        } else if (!isFuture) {
          const dayIdx = (startDayIdx + d - 1) % 7;
          const plannedDay = baseProgram[dayIdx] || DEFAULT_WEEKLY_SCHEDULE[dayIdx];

          if (cellIso < todayIso) {
            if (plannedDay.isRest) {
              isRest = true;
              rest++;
            } else {
              isMissed = true;
              missed++;
            }
          } else if (isToday) {
            if (plannedDay.isRest) {
              isRest = true;
              rest++;
            }
          }
        }

        cells.push({
          kind: 'day',
          key: `day-${cellIso}`,
          day: d,
          cellIso,
          isToday,
          isDone,
          isMissed,
          isRest,
        });
      }

      let trailIdx = 0;
      while (cells.length < 42) {
        cells.push({ kind: 'empty', key: `empty-trail-${monthIso}-${trailIdx++}` });
      }

      return {
        offset,
        monthIso,
        title: formatMonthTR(monthIso),
        cells,
        stats: { completed, missed, rest },
      };
    });
  }, [MONTH_OFFSETS, today, todayIso, workoutDatesMap, baseProgram]);

  const currentMonthItem = allMonthsData[activeMonthIndex] || allMonthsData[allMonthsData.length - 1];
  const monthStats = currentMonthItem.stats;

  const syncMonthIndexAndSelection = React.useCallback(
    (targetIdx: number) => {
      setActiveMonthIndex(targetIdx);
      const targetMonthIso = allMonthsData[targetIdx]?.monthIso;
      if (!targetMonthIso) return;
      setSelectedMonthIso((prev) => {
        if (prev.startsWith(targetMonthIso)) {
          return prev;
        }
        return getDefaultIsoForMonth(targetMonthIso, todayIso, prev);
      });
    },
    [allMonthsData, todayIso]
  );

  const handlePrevMonth = () => {
    if (activeMonthIndex > 0) {
      const target = activeMonthIndex - 1;
      isProgrammaticMonthScrollRef.current = true;
      syncMonthIndexAndSelection(target);
      monthScrollRef.current?.scrollTo({ x: target * monthGridWidth, animated: true });
    }
  };

  const handleNextMonth = () => {
    if (activeMonthIndex < allMonthsData.length - 1) {
      const target = activeMonthIndex + 1;
      isProgrammaticMonthScrollRef.current = true;
      syncMonthIndexAndSelection(target);
      monthScrollRef.current?.scrollTo({ x: target * monthGridWidth, animated: true });
    }
  };

  // Seçili günün seans detay bilgileri (displayedDetailIso ile yumuşak cross-dissolve sonrası gösterilir)
  const selectedDayInfo = useMemo(() => {
    if (!displayedDetailIso) {
      return null;
    }
    const realW = workoutDatesMap.get(displayedDetailIso);
    const isToday = displayedDetailIso === todayIso;
    const isFuture = displayedDetailIso > todayIso;

    // 1. Gerçek Yapılmış Antrenman
    if (realW) {
      const realSets =
        realW.exercises?.reduce((sum, ex) => sum + (ex.sets_data?.length || 0), 0) || 0;
      const setDisplay =
        realSets > 0 ? `${realSets} Set` : `${realW.exercises?.length || 4} Egzersiz`;

      const uniqueMuscles = Array.from(
        new Set(realW.exercises?.map((e) => e.muscle_group).filter(Boolean))
      );
      const kind = getSessionKind(realW.session_type);
      const muscles =
        uniqueMuscles.length > 0
          ? uniqueMuscles.join(' · ')
          : (SESSION_DEFAULT_FOCUS[kind || 'other'] || 'Tüm Vücut');

      const rawNote = realW.notes?.replace(/\s+/g, ' ').trim() || '';
      const NOTE_MAX_CHARS = 42;
      const truncatedNote = rawNote
        ? rawNote.length > NOTE_MAX_CHARS
          ? `${rawNote.slice(0, NOTE_MAX_CHARS - 3).trimEnd()}...`
          : rawNote
        : '';

      return {
        sessionType: formatSessionTitle(realW.session_type),
        totalSets: setDisplay,
        subtitleText: truncatedNote || muscles,
        hasNote: Boolean(truncatedNote),
        statusBadge: isToday ? 'Bugün Tamamlandı ✓' : 'Tamamlandı ✓',
        statusType: 'done' as const,
      };
    }

    // Seçilen günün haftalık plandaki karşılığını bul
    const [y, m, d] = displayedDetailIso.split('-').map(Number);
    const cellDate = new Date(y, m - 1, d);
    const dayIdx = (cellDate.getDay() + 6) % 7;
    const planned = baseProgram[dayIdx] || DEFAULT_WEEKLY_SCHEDULE[dayIdx];
    const kind = getSessionKind(planned.type);
    const focusMuscles =
      planned.focus || SESSION_DEFAULT_FOCUS[kind || 'other'] || 'Genel Kuvvet & Hipertrofi';

    // 2. Bugün (Henüz girilmemişse)
    if (isToday) {
      if (planned.isRest) {
        return {
          sessionType: 'Dinlenme Günü',
          totalSets: '0 Set',
          subtitleText: 'Toparlanma ve Dinlenme',
          hasNote: false,
          statusBadge: 'Bugün Dinlenme ☾',
          statusType: 'rest' as const,
        };
      }
      const setsEst =
        todayExercisesList.length > 0
          ? `${todayExercisesList.length * 3} Set`
          : '14 Set';
      return {
        sessionType: todayCard.title || formatSessionTitle(planned.type),
        totalSets: setsEst,
        subtitleText: todayCard.subtitle || focusMuscles,
        hasNote: false,
        statusBadge: 'Bugünün Planı 🔥',
        statusType: 'today' as const,
      };
    }

    // 3. Geçmiş Gün (Antrenman yapılmamış)
    if (!isFuture) {
      if (planned.isRest) {
        return {
          sessionType: 'Dinlenme Günü',
          totalSets: '0 Set',
          subtitleText: 'Toparlanma ve Dinlenme',
          hasNote: false,
          statusBadge: 'Dinlenme ☾',
          statusType: 'rest' as const,
        };
      }
      return {
        sessionType: formatSessionTitle(planned.type),
        totalSets: '0',
        subtitleText: focusMuscles,
        hasNote: false,
        statusBadge: 'Kaçırıldı !',
        statusType: 'missed' as const,
      };
    }

    // 4. Gelecek Gün (Planlanan)
    if (planned.isRest) {
      return {
        sessionType: 'Dinlenme Günü',
        totalSets: '0 Set',
        subtitleText: 'Toparlanma ve Dinlenme',
        hasNote: false,
        statusBadge: 'Planlanan Dinlenme',
        statusType: 'rest' as const,
      };
    }
    const plannedSets = planned.exercises?.length
      ? `${planned.exercises.length * 3} Set`
      : '14 Set';
    return {
      sessionType: formatSessionTitle(planned.type),
      totalSets: plannedSets,
      subtitleText: focusMuscles,
      hasNote: false,
      statusBadge: 'Planlandı',
      statusType: 'planned' as const,
    };
  }, [
    displayedDetailIso,
    workoutDatesMap,
    todayIso,
    baseProgram,
    todayCard,
    todayExercisesList,
  ]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* ─── 1. ÜST HEADER: AVATAR, SELAMLAMA & SERİ ─── */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            style={styles.avatarWrap}
            activeOpacity={0.8}
            onPress={() => router.push('/(app)/(tabs)/profile')}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </TouchableOpacity>

          <View style={styles.greetingCol}>
            <Text style={styles.greetingTitle}>Merhaba {username}</Text>
            <Text style={styles.greetingDate}>{todayFormatted}</Text>
          </View>

          <View style={styles.streakPill}>
            <Text style={styles.streakPillText}>🔥 4. Gün Seri</Text>
          </View>

          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.75}
            onPress={() => Alert.alert('Bildirimler', 'Yeni bildiriminiz bulunmuyor.')}
          >
            <BellIcon size={18} color="#A98BFF" />
          </TouchableOpacity>
        </View>

        {/* ─── 2. HERO KART: BUGÜNÜN PLANI (Dinamik ve Uyumlaştırılmış) ─── */}
        <View style={styles.heroCard}>
          <View style={styles.heroMainRow}>
            <View style={styles.heroLeft}>
              <View style={styles.eyebrowRow}>
                <Text style={styles.eyebrowStar}>✦</Text>
                <Text style={styles.eyebrowText}>
                  {todayCard.status === 'done' ? 'BUGÜN TAMAMLANDI ✓' : 'BUGÜNÜN PLANI'}
                </Text>
              </View>
              <Text style={styles.heroTitle}>{todayCard.title}</Text>
              {todayCard.isRest ? (
                <Text style={styles.heroDesc}>
                  Kas onarımı ve sinir sistemi yenilenmesi için ayrılmış{' '}
                  <Text style={[styles.heroDescBold, { color: '#F4C35C' }]}>aktif dinlenme</Text> günü.
                </Text>
              ) : (
                <Text style={styles.heroDesc}>
                  Hedef:{' '}
                  <Text style={styles.heroDescBold}>{todayTargetMuscles}</Text> odaklı güç ve hipertrofi seansı.
                </Text>
              )}
            </View>

            {/* MuscleWiki Görsel Silüeti (Bugünün hedefine göre dinamik parlar) */}
            <AnatomyMiniSilhouette target={todaySilhouetteTarget} />
          </View>

          {/* Mini 3 İstatistik */}
          <View style={styles.heroMetaRow}>
            <View style={[styles.miniMetaBox, { flex: 0.9 }]}>
              <Text style={styles.miniMetaLabel}>HAREKET</Text>
              <Text style={styles.miniMetaVal} numberOfLines={1}>
                {todayExerciseCount} Egzersiz
              </Text>
            </View>
            <View style={[styles.miniMetaBox, { flex: 0.9 }]}>
              <Text style={styles.miniMetaLabel}>TOPLAM SET</Text>
              <Text style={styles.miniMetaVal} numberOfLines={1}>
                {todayTotalSets} Set
              </Text>
            </View>
            <View style={[styles.miniMetaBox, { flex: 1.3 }]}>
              <Text style={styles.miniMetaLabel}>HEDEF BÖLGE</Text>
              <Text
                style={[
                  styles.miniMetaVal,
                  { fontSize: 10.5, color: todayCard.isRest ? '#F4C35C' : '#55D6FF' },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {todayTargetMuscles}
              </Text>
            </View>
          </View>

          {/* Hızlı Başlat & Detay Butonları (Detay flex:1, Antrenmanı Başlat Kompakt) */}
          <View style={styles.heroActionBar}>
            <TouchableOpacity
              style={styles.heroExpandBtn}
              activeOpacity={0.8}
              onPress={toggleHeroDetail}
            >
              <Text style={styles.heroExpandBtnText}>
                {isHeroOpen ? 'Detayları Kapat ▴' : 'Detayları Gör ▾'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.heroStartBtn,
                todayCard.status === 'done' && styles.heroStartBtnDone,
              ]}
              activeOpacity={0.85}
              onPress={() => router.push('/(app)/(tabs)/workout')}
            >
              <Text style={styles.heroStartBtnText}>
                {todayCard.status === 'done' ? '✓ Kaydedildi' : '▶ Başlat'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Genişleyen Egzersiz Listesi (Gün detay kartıyla aynı yumuşak ve yavaş animasyon) */}
          {isHeroMounted && (
            <Animated.View
              style={{
                height: detailHeight,
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <Animated.View
                onLayout={(e) => {
                  const h = Math.ceil(e.nativeEvent.layout.height) + 14;
                  if (h > 14 && Math.abs(h - heroContentHeight) > 1) {
                    setHeroContentHeight(h);
                  }
                }}
                style={[
                  styles.heroDetailContainer,
                  {
                    opacity: heroFadeAnim,
                    transform: [{ translateY: heroDriftAnim }],
                  },
                ]}
              >
                {todayExercisesList.map((ex) => (
                  <View key={ex.index} style={styles.exerciseItem}>
                    <View style={styles.exerciseIndexBadge}>
                      <Text style={styles.exerciseIndexText}>{ex.index}</Text>
                    </View>
                    <View style={styles.exerciseCopy}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseTarget}>{ex.target}</Text>
                    </View>
                    <View style={styles.exerciseValue}>
                      <Text style={styles.exerciseSetsVal}>{ex.sets}</Text>
                      <Text style={styles.exerciseRepsVal}>{ex.reps}</Text>
                    </View>
                  </View>
                ))}

                <View style={styles.detailNoteBox}>
                  <Text style={styles.detailNoteText}>
                    {todayCard.isRest
                      ? '💧 Kas onarımı için gün boyu yeterli su tüketin, hafif yürüyüş yapın ve 7–9 saat uykuya özen gösterin.'
                      : '💡 Kontrollü negatif tekrarlar uygulayın. Set aralarında 90–120 saniye dinlenin.'}
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          )}
        </View>

        {/* ─── 3. BÖLÜM BAŞLIĞI & SEKMELER ─── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Antrenman Programım</Text>
            <TouchableOpacity
              style={styles.programSourceTag}
              activeOpacity={0.7}
              onPress={() => router.push('/(app)/program/custom')}
            >
              <Text style={styles.programSourceText}>{programBadgeText}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hafta / Ay Geçiş Düğmeleri (Kayan Akıcı Gösterge) */}
        <View
          style={styles.segmentedTabs}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && Math.abs(w - segTabWidth) > 1) {
              setSegTabWidth(w);
            }
          }}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.segTabIndicator,
              {
                width: Math.max(80, (segTabWidth - 8) / 2),
                transform: [
                  {
                    translateX: tabProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.max(80, (segTabWidth - 8) / 2)],
                    }),
                  },
                ],
              },
            ]}
          />

          <TouchableOpacity
            style={styles.segTab}
            activeOpacity={0.85}
            onPress={() => handleTabChange('weekly')}
          >
            <Text style={[styles.segTabText, viewTab === 'weekly' && styles.segTabTextActive]}>
              Haftalık Program
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.segTab}
            activeOpacity={0.85}
            onPress={() => handleTabChange('monthly')}
          >
            <Text style={[styles.segTabText, viewTab === 'monthly' && styles.segTabTextActive]}>
              Aylık Takip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sekmeler Arası Sıfır Takılmalı Yatay Kaydırma Sahnesi (Slow-Motion Native Driver) */}
        <View
          style={styles.tabStageOuter}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && Math.abs(w - tabStageWidth) > 1) {
              setTabStageWidth(w);
            }
          }}
        >
          <Animated.View
            style={{
              flexDirection: 'row',
              width: tabStageWidth * 2,
              alignItems: 'flex-start',
              transform: [
                {
                  translateX: tabProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -tabStageWidth],
                  }),
                },
              ],
            }}
          >
            {/* ─── 4A. HAFTALIK PROGRAM KARTLARI (YATAY MODERN PAGER) ─── */}
            <Animated.View
              pointerEvents={viewTab === 'weekly' ? 'auto' : 'none'}
              style={{
                width: tabStageWidth,
                opacity: tabProgress.interpolate({
                  inputRange: [0, 0.65, 1],
                  outputRange: [1, 0.25, 0],
                }),
                transform: [
                  {
                    scale: tabProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0.955],
                    }),
                  },
                ],
              }}
            >
              <View style={styles.weeklyBoard}>
                {/* Eğer özel programı yoksa Web stili yönlendirici banner (Sadece bu haftada) */}
                {activeWeekIndex === 4 && !hasCustomProgram && (
                  <TouchableOpacity
                    style={[styles.noProgramBanner, { marginBottom: 10 }]}
                    activeOpacity={0.8}
                    onPress={() => router.push('/(app)/program/custom')}
                  >
                    <View style={styles.noProgramIconWrap}>
                      <Text style={styles.noProgramIconText}>⚡</Text>
                    </View>
                    <View style={styles.noProgramTexts}>
                      <Text style={styles.noProgramTitle}>Uzman Önerisi Aktif (Standart Split)</Text>
                      <Text style={styles.noProgramDesc}>
                        Kendine özel haftalık splitini yazmak ve egzersizlerini belirlemek için dokun.
                      </Text>
                    </View>
                    <Text style={styles.noProgramArrow}>→</Text>
                  </TouchableOpacity>
                )}

                {/* Hafta Gezinme Başlığı (Aylık Takvim gibi Oklar & Başlık) */}
                <View style={styles.weekCenterNav}>
                  <TouchableOpacity
                    style={[styles.weekArrowBtn, activeWeekIndex <= 0 && styles.arrowBtnDisabled]}
                    onPress={handlePrevWeek}
                    disabled={activeWeekIndex <= 0}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.weekArrowText, activeWeekIndex <= 0 && styles.arrowTextDisabled]}>‹</Text>
                  </TouchableOpacity>

                  <View style={styles.weekTitleWrap}>
                    <Text style={styles.weekTitleText}>{currentWeekItem.info.label}</Text>
                    <Text style={styles.weekRangeText}>{currentWeekItem.info.rangeText}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.weekArrowBtn, activeWeekIndex >= 4 && styles.arrowBtnDisabled]}
                    onPress={handleNextWeek}
                    disabled={activeWeekIndex >= 4}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.weekArrowText, activeWeekIndex >= 4 && styles.arrowTextDisabled]}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Modern Yatay Paging ScrollView: Yumuşak ivmelenme ve sayfa geçiş animasyonu */}
                <View
                  style={styles.weekContainer}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    if (w > 0 && Math.abs(w - containerWidth) > 1) {
                      setContainerWidth(w);
                    }
                  }}
                >
                  <Animated.ScrollView
                    ref={weekScrollRef}
                    horizontal
                    pagingEnabled={true}
                    decelerationRate="normal"
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    directionalLockEnabled={true}
                    overScrollMode="never"
                    scrollEventThrottle={16}
                    contentOffset={{ x: 4 * containerWidth, y: 0 }}
                    onScrollBeginDrag={() => {
                      isProgrammaticWeekScrollRef.current = false;
                    }}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: weekScrollX } } }],
                      {
                        useNativeDriver: Platform.OS !== 'web',
                        listener: (e: any) => {
                          if (isProgrammaticWeekScrollRef.current) return;
                          const x = e.nativeEvent.contentOffset.x;
                          const idx = Math.max(0, Math.min(4, Math.round(x / containerWidth)));
                          if (idx !== activeWeekIndexRef.current) {
                            setActiveWeekIndex(idx);
                          }
                        },
                      }
                    )}
                    onMomentumScrollEnd={(e) => {
                      isProgrammaticWeekScrollRef.current = false;
                      const x = e.nativeEvent.contentOffset.x;
                      const idx = Math.max(0, Math.min(4, Math.round(x / containerWidth)));
                      if (idx !== activeWeekIndexRef.current) {
                        setActiveWeekIndex(idx);
                      }
                    }}
                  >
                    {allWeeksData.map((weekItem, wIndex) => (
                      <WeekPage
                        key={`week-${weekItem.offset}`}
                        schedule={weekItem.schedule}
                        width={containerWidth}
                        pageIndex={wIndex}
                        scrollX={weekScrollX}
                      />
                    ))}
                  </Animated.ScrollView>
                </View>
              </View>
            </Animated.View>

            {/* ─── 4B. AYLIK TAKİP GÖRÜNÜMÜ (KAYDIRILABİLİR PANORAMA) ─── */}
            <Animated.View
              pointerEvents={viewTab === 'monthly' ? 'auto' : 'none'}
              style={{
                width: tabStageWidth,
                opacity: tabProgress.interpolate({
                  inputRange: [0, 0.35, 1],
                  outputRange: [0, 0.25, 1],
                }),
                transform: [
                  {
                    scale: tabProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.955, 1],
                    }),
                  },
                ],
              }}
            >
              <View style={styles.monthBoard}>
                {/* 1. KARTIN YUKARISINA TAŞINAN NEON ETİKETLER */}
                <View style={styles.neonBadgesRow}>
                  <View style={[styles.neonBadge, styles.neonBadgeGreen]}>
                    <Text style={styles.neonBadgeLabelGreen}>YAPILDI</Text>
                    <Text style={styles.neonBadgeValGreen}>{monthStats.completed}</Text>
                  </View>

                  <View style={[styles.neonBadge, styles.neonBadgeRed]}>
                    <Text style={styles.neonBadgeLabelRed}>KAÇIRILDI</Text>
                    <Text style={styles.neonBadgeValRed}>{monthStats.missed}</Text>
                  </View>

                  <View style={[styles.neonBadge, styles.neonBadgeYellow]}>
                    <Text style={styles.neonBadgeLabelYellow}>DİNLENME</Text>
                    <Text style={styles.neonBadgeValYellow}>{monthStats.rest}</Text>
                  </View>
                </View>

                {/* 2. KÖŞELERE YASLANMIŞ OK BUTONLARI VE ORTADA AY BAŞLIĞI */}
                <View style={styles.monthCenterNav}>
                  <TouchableOpacity
                    onPress={handlePrevMonth}
                    style={[styles.monthArrowBtn, activeMonthIndex <= 0 && styles.arrowBtnDisabled]}
                    disabled={activeMonthIndex <= 0}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.monthArrowText, activeMonthIndex <= 0 && styles.arrowTextDisabled]}>‹</Text>
                  </TouchableOpacity>

                  <Text style={styles.monthTitleText}>{currentMonthItem.title}</Text>

                  <TouchableOpacity
                    onPress={handleNextMonth}
                    style={[styles.monthArrowBtn, activeMonthIndex >= allMonthsData.length - 1 && styles.arrowBtnDisabled]}
                    disabled={activeMonthIndex >= allMonthsData.length - 1}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.monthArrowText, activeMonthIndex >= allMonthsData.length - 1 && styles.arrowTextDisabled]}>›</Text>
                  </TouchableOpacity>
                </View>

                {/* Gün Kısaltmaları (Pzt Sal Çar Per Cum Cmt Paz) - Üstte Sabit */}
                <View style={styles.monthDaysHeadRow}>
                  {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d, i) => (
                    <View key={i} style={styles.monthDayHeadCol}>
                      <Text style={styles.monthDayHeadText}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Modern Yatay Paging ScrollView: Yumuşak ivmelenme ve sayfa geçiş animasyonu */}
                <View
                  style={styles.gridContainer}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width;
                    if (w > 0 && Math.abs(w - monthGridWidth) > 1) {
                      setMonthGridWidth(w);
                    }
                  }}
                >
                  <Animated.ScrollView
                    ref={monthScrollRef}
                    horizontal
                    pagingEnabled={true}
                    decelerationRate="normal"
                    showsHorizontalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    directionalLockEnabled={true}
                    overScrollMode="never"
                    scrollEventThrottle={16}
                    contentOffset={{ x: (allMonthsData.length - 1) * monthGridWidth, y: 0 }}
                    onScrollBeginDrag={() => {
                      isProgrammaticMonthScrollRef.current = false;
                    }}
                    onScroll={Animated.event(
                      [{ nativeEvent: { contentOffset: { x: monthScrollX } } }],
                      {
                        useNativeDriver: Platform.OS !== 'web',
                        listener: (e: any) => {
                          if (isProgrammaticMonthScrollRef.current) return;
                          const x = e.nativeEvent.contentOffset.x;
                          const idx = Math.max(0, Math.min(allMonthsData.length - 1, Math.round(x / monthGridWidth)));
                          if (idx !== activeMonthIndexRef.current) {
                            syncMonthIndexAndSelection(idx);
                          }
                        },
                      }
                    )}
                    onMomentumScrollEnd={(e) => {
                      isProgrammaticMonthScrollRef.current = false;
                      const x = e.nativeEvent.contentOffset.x;
                      const idx = Math.max(0, Math.min(allMonthsData.length - 1, Math.round(x / monthGridWidth)));
                      if (idx !== activeMonthIndexRef.current) {
                        syncMonthIndexAndSelection(idx);
                      }
                    }}
                  >
                    {allMonthsData.map((mItem, mIndex) => (
                      <MonthGridPage
                        key={`month-${mItem.monthIso}`}
                        cells={mItem.cells}
                        selectedIsoInMonth={
                          selectedMonthIso.startsWith(mItem.monthIso) ? selectedMonthIso : null
                        }
                        width={monthGridWidth}
                        pageIndex={mIndex}
                        scrollX={monthScrollX}
                        onSelectDay={handleSelectMonthDay}
                      />
                    ))}
                  </Animated.ScrollView>
                </View>

                {/* Seçili Günün Seans Detayı (Sabit çerçeve, yavaş akıcı içerik geçişi) */}
                {selectedDayInfo ? (
                  <View style={styles.monthDetailCard}>
                    <Animated.View
                      style={[
                        styles.detailContentRow,
                        {
                          opacity: monthDetailFadeAnim,
                          transform: [{ translateX: monthDetailDriftAnim }],
                        },
                      ]}
                    >
                      <View style={styles.detailLeftCol}>
                        <View style={styles.detailTypeWrap}>
                          <Text style={styles.detailSessionType} numberOfLines={1}>
                            {selectedDayInfo.sessionType}
                          </Text>
                          <View
                            style={[
                              styles.detailStatusBadge,
                              selectedDayInfo.statusType === 'done' && styles.detailBadgeDone,
                              selectedDayInfo.statusType === 'today' && styles.detailBadgeToday,
                              selectedDayInfo.statusType === 'rest' && styles.detailBadgeRest,
                              selectedDayInfo.statusType === 'missed' && styles.detailBadgeMissed,
                            ]}
                          >
                            <Text
                              style={[
                                styles.detailStatusText,
                                selectedDayInfo.statusType === 'done' && styles.detailTextDone,
                                selectedDayInfo.statusType === 'today' && styles.detailTextToday,
                                selectedDayInfo.statusType === 'rest' && styles.detailTextRest,
                                selectedDayInfo.statusType === 'missed' && styles.detailTextMissed,
                              ]}
                            >
                              {selectedDayInfo.statusBadge}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.detailMuscleRow}>
                          <Text
                            style={[
                              styles.detailMuscleVal,
                              selectedDayInfo.hasNote && styles.detailNoteVal,
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {selectedDayInfo.subtitleText}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.detailSetBox}>
                        <View style={styles.detailSetRow}>
                          <Text style={styles.detailSetLabel}>TOPLAM SET</Text>
                          <Text style={styles.detailSetVal}>{selectedDayInfo.totalSets}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.detailHistoryBtn}
                          activeOpacity={0.65}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={() => router.push('/(app)/history')}
                        >
                          <Text style={styles.detailHistoryBtnText}>Detayları Gör →</Text>
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  </View>
                ) : null}
              </View>
            </Animated.View>
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#060813',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // 1. ÜST HEADER
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#7049DF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8C5CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingCol: {
    flex: 1,
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  greetingDate: {
    fontSize: 10,
    color: '#8E99B5',
    marginTop: 2,
    fontWeight: '500',
  },
  streakPill: {
    borderWidth: 1,
    borderColor: 'rgba(244, 195, 92, 0.35)',
    backgroundColor: 'rgba(244, 195, 92, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  streakPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F4C35C',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 2. HERO KART
  heroCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: '#12182D',
    padding: 16,
    shadowColor: '#743BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroLeft: {
    flex: 1,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  eyebrowStar: {
    fontSize: 10,
    color: '#D0B9FF',
  },
  eyebrowText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D0B9FF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  heroDesc: {
    fontSize: 11,
    color: '#C0B9D7',
    lineHeight: 15,
  },
  heroDescBold: {
    fontWeight: '700',
    color: '#55D6FF',
  },

  // Anatomi Vektör Kutusu
  anatomyBox: {
    width: 76,
    height: 98,
    backgroundColor: '#090C18',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  anatomyLabel: {
    position: 'absolute',
    bottom: 4,
    fontSize: 7.5,
    fontWeight: '800',
    color: '#55D6FF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Hero Mini Meta
  heroMetaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  miniMetaBox: {
    flex: 1,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  miniMetaLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#A9A4BF',
    letterSpacing: 0.5,
  },
  miniMetaVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 3,
  },

  // Hero Butonları (Detay flex:1, Antrenmanı Başlat Kompakt)
  heroActionBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  heroExpandBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.45)',
    backgroundColor: 'rgba(169, 139, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroExpandBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D0B9FF',
  },
  heroStartBtn: {
    backgroundColor: '#7049DF',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7049DF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 4,
  },
  heroStartBtnDone: {
    backgroundColor: '#35D69F',
    shadowColor: '#35D69F',
  },
  heroStartBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Genişleyen Egzersiz Listesi
  heroDetailContainer: {
    position: 'absolute',
    top: 14,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(169, 139, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseIndexText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#A98BFF',
  },
  exerciseCopy: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  exerciseTarget: {
    fontSize: 9.5,
    color: '#55D6FF',
    marginTop: 2,
    fontWeight: '500',
  },
  exerciseValue: {
    alignItems: 'flex-end',
  },
  exerciseSetsVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#55D6FF',
  },
  exerciseRepsVal: {
    fontSize: 9,
    color: '#D8CAFF',
    marginTop: 1,
  },
  detailNoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderLeftWidth: 2,
    borderLeftColor: '#A98BFF',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  detailNoteText: {
    fontSize: 9,
    color: '#8E99B5',
    lineHeight: 13,
  },

  // 3. BÖLÜM BAŞLIĞI & SEKMELER
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  programSourceTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(169, 139, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
  },
  programSourceText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A98BFF',
  },
  segmentedTabs: {
    flexDirection: 'row',
    position: 'relative',
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 13,
    marginBottom: 12,
  },
  segTabIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A98BFF',
    backgroundColor: 'rgba(169, 139, 255, 0.16)',
  },
  segTab: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    zIndex: 1,
  },
  segTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E99B5',
  },
  segTabTextActive: {
    color: '#FFFFFF',
  },
  tabStageOuter: {
    overflow: 'hidden',
  },

  // 4A. HAFTALIK PROGRAM KARTLARI
  weeklyBoard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#0E1528',
    padding: 14,
  },
  weekContainer: {
    overflow: 'hidden',
  },
  weekBoard: {
    gap: 6,
  },
  weekCenterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  weekArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A98BFF',
    lineHeight: 20,
  },
  arrowBtnDisabled: {
    opacity: 0.25,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'transparent',
  },
  arrowTextDisabled: {
    color: '#8E99B5',
  },
  weekTitleWrap: {
    alignItems: 'center',
  },
  weekTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  weekRangeText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#8E99B5',
    marginTop: 2,
  },
  noProgramBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(85, 214, 255, 0.35)',
    backgroundColor: 'rgba(85, 214, 255, 0.08)',
    padding: 10,
    marginBottom: 4,
    gap: 10,
  },
  noProgramIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: 'rgba(85, 214, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noProgramIconText: {
    fontSize: 15,
  },
  noProgramTexts: {
    flex: 1,
  },
  noProgramTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#55D6FF',
  },
  noProgramDesc: {
    fontSize: 8.5,
    color: '#8E99B5',
    marginTop: 2,
    lineHeight: 12,
  },
  noProgramArrow: {
    fontSize: 15,
    fontWeight: '700',
    color: '#55D6FF',
  },
  programCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#11192F',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cardToday: {
    borderColor: 'rgba(169, 139, 255, 0.45)',
    backgroundColor: 'rgba(169, 139, 255, 0.06)',
  },
  cardDone: {
    borderColor: 'rgba(53, 214, 159, 0.35)',
    backgroundColor: 'rgba(53, 214, 159, 0.04)',
  },
  cardMissed: {
    borderColor: 'rgba(255, 113, 136, 0.35)',
    backgroundColor: 'rgba(255, 113, 136, 0.04)',
  },
  cardRest: {
    borderColor: 'rgba(244, 195, 92, 0.35)',
    backgroundColor: 'rgba(244, 195, 92, 0.04)',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  dateBox: {
    width: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: 'rgba(169, 139, 255, 0.08)',
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBoxDone: {
    borderColor: 'rgba(53, 214, 159, 0.4)',
    backgroundColor: 'rgba(53, 214, 159, 0.12)',
  },
  dateBoxMissed: {
    borderColor: 'rgba(255, 113, 136, 0.4)',
    backgroundColor: 'rgba(255, 113, 136, 0.12)',
  },
  dateBoxRest: {
    borderColor: 'rgba(244, 195, 92, 0.4)',
    backgroundColor: 'rgba(244, 195, 92, 0.12)',
  },
  dateBoxToday: {
    borderColor: 'rgba(169, 139, 255, 0.45)',
    backgroundColor: 'rgba(169, 139, 255, 0.12)',
  },
  dateBoxNum: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateBoxName: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#8E99B5',
    marginTop: 0.5,
  },

  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSub: {
    fontSize: 9,
    color: '#8E99B5',
    marginTop: 1,
  },

  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: 'rgba(169, 139, 255, 0.08)',
  },
  statusBadgeDone: {
    borderColor: 'rgba(53, 214, 159, 0.4)',
    backgroundColor: 'rgba(53, 214, 159, 0.12)',
  },
  statusBadgeMissed: {
    borderColor: 'rgba(255, 113, 136, 0.4)',
    backgroundColor: 'rgba(255, 113, 136, 0.12)',
  },
  statusBadgeRest: {
    borderColor: 'rgba(244, 195, 92, 0.4)',
    backgroundColor: 'rgba(244, 195, 92, 0.12)',
  },
  statusBadgeToday: {
    borderColor: 'rgba(169, 139, 255, 0.45)',
    backgroundColor: 'rgba(169, 139, 255, 0.12)',
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#A98BFF',
  },
  statusBadgeTextDone: { color: '#35D69F' },
  statusBadgeTextMissed: { color: '#FF7188' },
  statusBadgeTextRest: { color: '#F4C35C' },
  statusBadgeTextToday: { color: '#BFA7FF' },

  // 4B. AYLIK TAKİP GÖRÜNÜMÜ
  monthBoard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: '#0E1528',
    padding: 14,
  },

  // 1. Neon Rozetler (Kartın Üstünde - Kompakt ve Yan Yana)
  neonBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  neonBadge: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 3.5,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4.5,
  },
  neonBadgeGreen: {
    borderColor: 'rgba(53, 214, 159, 0.45)',
    backgroundColor: 'rgba(53, 214, 159, 0.1)',
  },
  neonBadgeRed: {
    borderColor: 'rgba(255, 113, 136, 0.45)',
    backgroundColor: 'rgba(255, 113, 136, 0.1)',
  },
  neonBadgeYellow: {
    borderColor: 'rgba(244, 195, 92, 0.45)',
    backgroundColor: 'rgba(244, 195, 92, 0.1)',
  },
  neonBadgeLabelGreen: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#8E99B5',
    letterSpacing: 0.3,
  },
  neonBadgeValGreen: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#35D69F',
  },
  neonBadgeLabelRed: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#8E99B5',
    letterSpacing: 0.3,
  },
  neonBadgeValRed: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FF7188',
  },
  neonBadgeLabelYellow: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#8E99B5',
    letterSpacing: 0.3,
  },
  neonBadgeValYellow: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#F4C35C',
  },

  // 2. Köşelere Yaslanmış Ok Butonları ve Ortada Ay Başlığı
  monthCenterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  monthArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrowText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A98BFF',
    lineHeight: 20,
  },
  monthTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  monthDaysHeadRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  monthDayHeadCol: {
    width: '14.2857%',
    alignItems: 'center',
  },
  monthDayHeadText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E99B5',
  },
  gridContainer: {
    overflow: 'hidden',
    height: 270,
  },
  animatedMonthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCellEmpty: {
    width: '14.2857%',
    height: 38,
    marginBottom: 4,
  },
  monthCell: {
    width: '14.2857%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  monthDot: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: {
    borderColor: 'rgba(53, 214, 159, 0.4)',
    backgroundColor: 'rgba(53, 214, 159, 0.12)',
  },
  dotMissed: {
    borderColor: 'rgba(255, 113, 136, 0.4)',
    backgroundColor: 'rgba(255, 113, 136, 0.12)',
  },
  dotRest: {
    borderColor: 'rgba(244, 195, 92, 0.4)',
    backgroundColor: 'rgba(244, 195, 92, 0.12)',
  },
  dotToday: {
    borderColor: 'rgba(169, 139, 255, 0.45)',
    backgroundColor: 'rgba(169, 139, 255, 0.12)',
  },
  // Kartın kendi rengindeki seçili çerçevenin yumuşak animasyonla belirmesi
  monthDotSelectedRing: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 8,
    borderWidth: 2,
  },
  dotText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  dotTextToday: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dotTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  monthDetailCard: {
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: '#151B32',
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: 'hidden',
  },
  detailContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLeftCol: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  detailTypeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  detailSessionType: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  detailStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  detailBadgeDone: {
    borderColor: 'rgba(53, 214, 159, 0.45)',
    backgroundColor: 'rgba(53, 214, 159, 0.12)',
  },
  detailBadgeToday: {
    borderColor: 'rgba(169, 139, 255, 0.55)',
    backgroundColor: 'rgba(169, 139, 255, 0.18)',
  },
  detailBadgeRest: {
    borderColor: 'rgba(244, 195, 92, 0.45)',
    backgroundColor: 'rgba(244, 195, 92, 0.12)',
  },
  detailBadgeMissed: {
    borderColor: 'rgba(255, 113, 136, 0.45)',
    backgroundColor: 'rgba(255, 113, 136, 0.12)',
  },
  detailStatusText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#8E99B5',
  },
  detailTextDone: { color: '#35D69F' },
  detailTextToday: { color: '#BFA7FF' },
  detailTextRest: { color: '#F4C35C' },
  detailTextMissed: { color: '#FF7188' },
  detailMuscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailMuscleVal: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D8CAFF',
    flex: 1,
  },
  detailNoteVal: {
    fontWeight: '500',
    color: '#CBD5E1',
  },
  detailSetBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  detailSetRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
  },
  detailSetLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8E99B5',
    letterSpacing: 0.5,
  },
  detailSetVal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#55D6FF',
  },
  detailHistoryBtn: {
    marginTop: 3,
    paddingVertical: 1,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  detailHistoryBtnText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#A98BFF',
    letterSpacing: 0.2,
  },
});
