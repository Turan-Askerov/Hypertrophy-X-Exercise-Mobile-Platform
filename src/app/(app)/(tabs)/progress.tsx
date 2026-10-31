import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  LayoutAnimation,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { useFocusEffect } from 'expo-router';

import { useExercises } from '@/hooks/use-exercises';
import { useProgress } from '@/hooks/use-progress';
import { useWorkouts } from '@/hooks/use-workouts';
import type { PersonalRecordItem, ProgressChartResponse, ProgressMetric, ProgressPeriod } from '@/types/progress';
import type { Workout } from '@/types/workout';

// Android için LayoutAnimation etkinleştirme
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Cyber Dark Tema Renkleri (Geçmiş Sayfası ile Birebir) ───
const C = {
  bg: '#080B14',
  surface: '#101524',
  surfaceAlt: '#0F1528',
  input: '#161E33',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSoft: 'rgba(255, 255, 255, 0.06)',
  text: '#F8FAFC',
  muted: '#94A3B8',
  violet: '#C084FC',
  primaryDeep: '#8B5CF6',
  cyan: '#38BDF8',
  mint: '#34D399',
  yellow: '#FBBF24',
  danger: '#FF7898',
};

// ─── Tip Tanımları ───
type ImprovementCardData = {
  name: string;
  muscle: string;
  from: string;
  to: string;
  change: string;
  startDate: string;
  endDate: string;
};

type SetDetailItem = {
  set: number;
  weight: number;
  reps: number;
};

type DayChartSummary = {
  dateStr: string;
  rawDateStr: string;
  dateObj: Date;
  label: string;
  maxWeight: number;
  repsAtMaxWeight: number;
  sets: SetDetailItem[];
};

type PrGroupData = {
  title: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  items: {
    name: string;
    muscle: string;
    weight: string;
    reps: string;
    date: string;
  }[];
};

// ─── Uzun İsimleri Kısaltma Yardımcısı ───
function abbreviateExerciseName(name: string): string {
  const map: Record<string, string> = {
    'Shoulder Press Machine': 'Shoulder Press M.',
    'Incline Dumbbell Press': 'Incline DB Press',
    'Flat Dumbbell Bench Press': 'Flat DB Bench',
    'Standing Calf Raise (Barbell)': 'Standing Calf Raise',
    'Pull Ups (Ağırlıksız Barfiks)': 'Pull Ups (Barfiks)',
    'Chin Ups (Ağırlıksız)': 'Chin Ups',
    'Dumbbell Lateral Raise': 'DB Lateral Raise',
    'Bicep Curl (Barbell)': 'Bicep Curl (BB)',
    'Preacher Curl (Z Bar)': 'Preacher Curl (Z)',
  };
  if (map[name]) return map[name];
  if (name.length > 22) {
    return name
      .replace('Dumbbell', 'DB')
      .replace('Barbell', 'BB')
      .replace('Machine', 'M.');
  }
  return name;
}

// ─── Web Tarzı Kişisel Rekorlar Gruplama Fonksiyonu (Gerçek DB Verileri İçin) ───
const COMPOUND_KEYWORDS = ['bench', 'squat', 'deadlift', 'overhead press', 'barbell row', 'bulgarian', 'pull ups', 'chin ups'];

function groupPersonalRecords(prs: PersonalRecordItem[]): PrGroupData[] {
  if (!prs || prs.length === 0) return [];

  const compoundItems: PrGroupData['items'] = [];
  const muscleGroups: Record<string, PrGroupData['items']> = {};

  const groupOrder = ['Göğüs', 'Sırt', 'Omuz', 'Kol', 'Bacak', 'Core', 'Diğer'];

  prs.forEach((r) => {
    const exNameLower = (r.exercise || '').toLowerCase();
    const isCompound = COMPOUND_KEYWORDS.some((k) => exNameLower.includes(k)) && !exNameLower.includes('incline');

    const formattedDate = r.date
      ? r.date.includes('-')
        ? r.date.split(' ')[0].split('-').reverse().join('.')
        : r.date
      : '';
    const muscleName = r.muscle || 'Diğer';

    const itemObj = {
      name: r.exercise,
      muscle: r.primary_muscles && r.primary_muscles.length > 0 ? r.primary_muscles.join(', ') : muscleName,
      weight: r.metric_type === 'reps' ? 'Vücut A.' : `${r.max_weight || r.record_value || 0} kg`,
      reps: `${r.max_reps || 0} tkr`,
      date: formattedDate,
    };

    if (isCompound) {
      compoundItems.push(itemObj);
    } else {
      let mainGroup = 'Diğer';
      if (muscleName.includes('Göğüs') || muscleName.includes('Chest')) mainGroup = 'Göğüs';
      else if (muscleName.includes('Sırt') || muscleName.includes('Back') || muscleName.includes('Kanat')) mainGroup = 'Sırt';
      else if (['Biceps', 'Triceps', 'Kol', 'Pazu', 'Ön Kol'].some((m) => muscleName.includes(m))) mainGroup = 'Kol';
      else if (['Bacak', 'Leg', 'Legs', 'Quad', 'Quadriceps', 'Hamstring', 'Glute', 'Gluteus', 'Calf', 'Adductor'].some((m) => muscleName.includes(m))) mainGroup = 'Bacak';
      else if (muscleName.includes('Omuz') || muscleName.includes('Shoulder') || muscleName.includes('Delt')) mainGroup = 'Omuz';
      else if (muscleName.includes('Core') || muscleName.includes('Karın') || muscleName.includes('Abs')) mainGroup = 'Core';

      if (!muscleGroups[mainGroup]) muscleGroups[mainGroup] = [];
      muscleGroups[mainGroup].push(itemObj);
    }
  });

  const result: PrGroupData[] = [];

  if (compoundItems.length > 0) {
    result.push({
      title: '⚡ BİLEŞİK HAREKETLER (COMPOUND)',
      badgeBg: 'rgba(139, 92, 246, 0.22)',
      borderColor: '#8B5CF6',
      textColor: '#E9D5FF',
      items: compoundItems,
    });
  }

  const groupThemes: Record<string, { badgeBg: string; borderColor: string; textColor: string }> = {
    'Göğüs': { badgeBg: 'rgba(6, 182, 212, 0.2)', borderColor: '#06B6D4', textColor: '#22D3EE' },
    'Sırt': { badgeBg: 'rgba(99, 102, 241, 0.2)', borderColor: '#6366F1', textColor: '#818CF8' },
    'Omuz': { badgeBg: 'rgba(168, 85, 247, 0.2)', borderColor: '#A855F7', textColor: '#C084FC' },
    'Kol': { badgeBg: 'rgba(245, 158, 11, 0.2)', borderColor: '#F59E0B', textColor: '#FBBF24' },
    'Bacak': { badgeBg: 'rgba(244, 63, 94, 0.2)', borderColor: '#F43F5E', textColor: '#FDA4AF' },
    'Core': { badgeBg: 'rgba(20, 184, 166, 0.2)', borderColor: '#14B8A6', textColor: '#2DD4BF' },
    'Diğer': { badgeBg: 'rgba(148, 163, 184, 0.18)', borderColor: '#94A3B8', textColor: '#CBD5E1' },
  };

  groupOrder.forEach((g) => {
    if (muscleGroups[g] && muscleGroups[g].length > 0) {
      const theme = groupThemes[g] || groupThemes['Diğer'];
      result.push({
        title: `${g.toUpperCase()} HAREKETLERİ`,
        badgeBg: theme.badgeBg,
        borderColor: theme.borderColor,
        textColor: theme.textColor,
        items: muscleGroups[g],
      });
    }
  });

  return result;
}

// ─── Bağlantı Hatası / Boş Veri Durumu Bildirimi Bileşenleri ───
function AlertCircleIcon({ size = 20, color = '#F87171' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
      <Line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function ConnectionErrorNotice({
  message = 'Veriler yüklenirken hata oluştu, lütfen bağlantınızı kontrol edin',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.errorNoticeBox}>
      <View style={styles.errorNoticeIconWrap}>
        <AlertCircleIcon size={20} color="#F87171" />
      </View>
      <Text style={styles.errorNoticeText}>{message}</Text>
      {onRetry && (
        <TouchableOpacity
          style={styles.errorNoticeRetryBtn}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.errorNoticeRetryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Yardımcı SVG İkonlar ───
function SearchIcon({ size = 16, color = C.violet }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="11" cy="11" r="8" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
    </Svg>
  );
}

function ChevronDownIcon({ size = 14, color = C.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function CloseIcon({ size = 18, color = C.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}


function CalendarIcon({ size = 14, color = C.violet }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
    </Svg>
  );
}

function DumbbellIcon({ size = 22, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"
      />
    </Svg>
  );
}

function RepeatIcon({ size = 22, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </Svg>
  );
}

function BarChartIcon({ size = 18, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M18 20V10M12 20V4M6 20v-6"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 16, color = '#34D399' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function MultiBarChartIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Defs>
        <LinearGradient id="multiBar1" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#8B5CF6" />
          <Stop offset="100%" stopColor="#A855F7" />
        </LinearGradient>
        <LinearGradient id="multiBar2" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#6366F1" />
          <Stop offset="100%" stopColor="#818CF8" />
        </LinearGradient>
        <LinearGradient id="multiBar3" x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0%" stopColor="#06B6D4" />
          <Stop offset="100%" stopColor="#38BDF8" />
        </LinearGradient>
      </Defs>
      <Rect x="3" y="13" width="4" height="9" rx="2" fill="url(#multiBar1)" />
      <Rect x="10" y="8" width="4" height="14" rx="2" fill="url(#multiBar2)" />
      <Rect x="17" y="3" width="4" height="19" rx="2" fill="url(#multiBar3)" />
    </Svg>
  );
}

function TrendingUpIcon({ size = 15, color = '#2DD4BF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M23 6l-9.5 9.5-5-5L1 18" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M17 6h6v6" />
    </Svg>
  );
}

function PullUpIcon({ size = 20, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeWidth="2" d="M3 4h18" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v3.5l3 3.5" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 4v3.5l-3 3.5" />
      <Circle cx="12" cy="7.5" r="2" fill={color} />
      <Path strokeLinecap="round" strokeWidth="2" d="M12 9.5v5.5" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 20l2.5-5 2.5 5" />
    </Svg>
  );
}

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function parseDateStrToDate(dStr: string): Date | null {
  if (!dStr) return null;
  const trimmed = dStr.trim();
  const dotParts = trimmed.split('.');
  if (dotParts.length === 3) {
    const d = parseInt(dotParts[0], 10);
    const m = parseInt(dotParts[1], 10) - 1;
    const y = parseInt(dotParts[2], 10);
    return new Date(y, m, d);
  }
  const dashParts = trimmed.slice(0, 10).split('-');
  if (dashParts.length === 3) {
    const y = parseInt(dashParts[0], 10);
    const m = parseInt(dashParts[1], 10) - 1;
    const d = parseInt(dashParts[2], 10);
    return new Date(y, m, d);
  }
  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatTurkishDate(d: Date): string {
  const day = d.getDate();
  const month = TURKISH_MONTHS[d.getMonth()] || '';
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Veri tabanından gelen tarih dizgilerini tam tarih olarak (GG.AA.YYYY) formatlar.
 * Yıl bilgisinin hiçbir cihazda kesilmemesini sağlar.
 */
function formatFullDateStr(rawStr?: string | null, fallback = ''): string {
  if (!rawStr) return fallback;
  const d = parseDateStrToDate(rawStr);
  if (!d) return rawStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ─── PostgreSQL Veri Tabanından Gelen Grafik Verilerini Dinamik Çözümleme Fonksiyonları ───
function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[ıİ]/g, 'i')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[üÜ]/g, 'u')
    .replace(/[şŞ]/g, 's')
    .replace(/[öÖ]/g, 'o')
    .replace(/[çÇ]/g, 'c')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Backend API (/api/progress/chart) üzerinden PostgreSQL'den çekilen zaman serisi verilerini
 * gün bazında en yüksek ağırlık, o ağırlıktaki tekrar ve tüm setler olarak gruplar.
 */
function parseChartDataFromApi(
  rawChartData: ProgressChartResponse | undefined
): DayChartSummary[] {
  if (!rawChartData || !rawChartData.labels || rawChartData.labels.length === 0) {
    return [];
  }

  const groups = new Map<string, { dateStr: string; sets: SetDetailItem[] }>();

  rawChartData.labels.forEach((dateLabel, idx) => {
    const detail = rawChartData.details && rawChartData.details[idx];
    const weightVal = detail
      ? Number(detail.weight_kg ?? detail.value ?? 0)
      : Number(rawChartData.values?.[idx] || 0);
    const repsVal = detail ? Number(detail.reps ?? 0) : 0;
    const setNum = detail ? Number(detail.set || 1) : 1;

    if (!groups.has(dateLabel)) {
      groups.set(dateLabel, { dateStr: dateLabel, sets: [] });
    }
    groups.get(dateLabel)!.sets.push({
      set: setNum,
      weight: weightVal,
      reps: repsVal,
    });
  });

  const list: DayChartSummary[] = [];
  groups.forEach((group, dateLabel) => {
    const dateObj = parseDateStrToDate(dateLabel) || new Date();
    const maxW = Math.max(...group.sets.map((s) => s.weight), 0);
    const maxR = Math.max(
      ...group.sets.filter((s) => s.weight === maxW).map((s) => s.reps),
      0
    );
    list.push({
      dateStr: formatTurkishDate(dateObj),
      rawDateStr: dateLabel,
      dateObj,
      label: dateLabel,
      maxWeight: maxW,
      repsAtMaxWeight: maxR > 0 ? maxR : 8,
      sets: group.sets.sort((a, b) => a.set - b.set),
    });
  });

  list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  return list;
}

/**
 * Kullanıcının PostgreSQL veri tabanındaki tüm antrenmanlarından (workouts listesi)
 * seçili harekete ait gerçek seansları dinamik olarak derler.
 */
function parseChartDataFromWorkouts(
  workouts: Workout[] | undefined,
  targetExercise: string
): DayChartSummary[] {
  if (!workouts || workouts.length === 0 || !targetExercise) {
    return [];
  }

  const normalizedTarget = normalizeExerciseName(targetExercise);
  const groups = new Map<
    string,
    { dateObj: Date; dateStr: string; rawDateStr: string; sets: SetDetailItem[] }
  >();

  workouts.forEach((workout) => {
    if (!workout.exercises || !workout.date) return;
    const wDate = parseDateStrToDate(workout.date);
    if (!wDate) return;

    const parts = workout.date.slice(0, 10).split('-');
    const rawDateStr = parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : workout.date;

    for (const ex of workout.exercises) {
      const exName = ex.exercise_name || ex.canonical_exercise_id || '';
      const normEx = normalizeExerciseName(exName);
      const isMatch =
        normEx === normalizedTarget ||
        normEx.includes(normalizedTarget) ||
        normalizedTarget.includes(normEx);

      if (isMatch && ex.sets_data && ex.sets_data.length > 0) {
        if (!groups.has(rawDateStr)) {
          groups.set(rawDateStr, {
            dateObj: wDate,
            dateStr: formatTurkishDate(wDate),
            rawDateStr,
            sets: [],
          });
        }
        const existingGroup = groups.get(rawDateStr)!;
        ex.sets_data.forEach((s) => {
          existingGroup.sets.push({
            set: existingGroup.sets.length + 1,
            weight: Number(s.weight_kg ?? 0),
            reps: Number(s.reps ?? 0),
          });
        });
      }
    }
  });

  const list: DayChartSummary[] = [];
  groups.forEach((group) => {
    if (group.sets.length === 0) return;
    const maxW = Math.max(...group.sets.map((s) => s.weight), 0);
    const maxR = Math.max(
      ...group.sets.filter((s) => s.weight === maxW).map((s) => s.reps),
      0
    );
    list.push({
      dateStr: group.dateStr,
      rawDateStr: group.rawDateStr,
      dateObj: group.dateObj,
      label: group.rawDateStr,
      maxWeight: maxW,
      repsAtMaxWeight: maxR > 0 ? maxR : 8,
      sets: group.sets.sort((a, b) => a.set - b.set),
    });
  });

  list.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
  return list;
}

// ─── Grafik Eğrisi Hesaplama Yardımcıları (Cubic Bezier Spline & Alan Gradyanı) ───
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    // Catmull-Rom kontrol noktaları
    const tension = 0.22;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return d;
}

function generateAreaPath(points: { x: number; y: number }[], bottomY: number): string {
  if (points.length < 2) return '';
  const curve = generateSmoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${curve} L ${last.x.toFixed(1)} ${bottomY.toFixed(1)} L ${first.x.toFixed(1)} ${bottomY.toFixed(1)} Z`;
}

// ─── Tekil İlerleme Kartı Bileşeni (Görseldeki Birebir Modern Neon Sparkline Tasarımı) ───
function ImprovementCard({
  item,
  onPressGraph,
}: {
  item: ImprovementCardData;
  onPressGraph?: () => void;
}) {
  const isPullUp =
    item.name.toLowerCase().includes('pull') ||
    item.name.toLowerCase().includes('barfiks') ||
    item.name.toLowerCase().includes('chin') ||
    item.name.toLowerCase().includes('lat');

  const cleanId = item.name.replace(/[^a-zA-Z0-9]/g, '');

  return (
    <Pressable
      style={styles.improvementCardModern}
      onPress={onPressGraph}
      android_ripple={{ color: 'rgba(139, 92, 246, 0.15)' }}
    >
      {/* Üst Satır: Egzersiz İkonu, Başlık ve Kas Grubu Rozeti */}
      <View style={styles.impCardTopRow}>
        <View style={styles.impCardIconWrap}>
          {isPullUp ? (
            <PullUpIcon size={14} color="#C084FC" />
          ) : (
            <DumbbellIcon size={14} color="#C084FC" />
          )}
        </View>
        <Text numberOfLines={2} style={styles.impCardExerciseTitle}>
          {item.name}
        </Text>
        <View style={styles.impCardMuscleBadge}>
          <Text style={styles.impCardMuscleBadgeText}>{item.muscle}</Text>
        </View>
      </View>

      {/* Orta Satır: Önceki Değer → Yeni Değer & +% Artış Rozeti (Asla Alt Satıra Taşmaz) */}
      <View style={styles.impCardMetricRow}>
        <Text numberOfLines={1} style={styles.impCardValueText}>
          {item.from}
        </Text>
        <Text style={styles.impCardArrow}>→</Text>
        <Text numberOfLines={1} style={styles.impCardValueText}>
          {item.to}
        </Text>
        <View style={styles.impCardChangePill}>
          <Text numberOfLines={1} style={styles.impCardChangePillText}>
            {item.change}
          </Text>
        </View>
      </View>

      {/* Mini Sparkline Dalga Grafiği (Modern Neon Dolgu & Uç Noktaları) */}
      <View style={styles.impCardSparklineWrap}>
        <Svg width="100%" height={28} viewBox="0 0 140 28" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id={`sparkArea-${cleanId}`} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#38BDF8" stopOpacity="0.4" />
              <Stop offset="60%" stopColor="#6366F1" stopOpacity="0.12" />
              <Stop offset="100%" stopColor="#0E1426" stopOpacity="0.0" />
            </LinearGradient>
            <LinearGradient id={`sparkStroke-${cleanId}`} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#A855F7" />
              <Stop offset="65%" stopColor="#6366F1" />
              <Stop offset="100%" stopColor="#22D3EE" />
            </LinearGradient>
          </Defs>

          {/* Alan Dolgusu */}
          <Path
            d="M 5 20 C 22 20, 32 14, 46 14 C 58 14, 64 17, 76 17 C 90 17, 100 9, 114 9 C 122 9, 130 5, 135 5 L 135 28 L 5 28 Z"
            fill={`url(#sparkArea-${cleanId})`}
          />

          {/* Dalga Çizgisi */}
          <Path
            d="M 5 20 C 22 20, 32 14, 46 14 C 58 14, 64 17, 76 17 C 90 17, 100 9, 114 9 C 122 9, 130 5, 135 5"
            stroke={`url(#sparkStroke-${cleanId})`}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />

          {/* Sağ Uçtaki Fading Düşüş Çizgisi */}
          <Line
            x1={135}
            y1={5}
            x2={135}
            y2={28}
            stroke="#22D3EE"
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.5}
          />

          {/* Başlangıç Mor Noktası */}
          <Circle cx={5} cy={20} r={2.8} fill="#A855F7" stroke="#FFFFFF" strokeWidth={1.2} />

          {/* Bitiş Parlayan Cyan Noktası */}
          <Circle cx={135} cy={5} r={2.8} fill="#22D3EE" stroke="#FFFFFF" strokeWidth={1.2} />
        </Svg>
      </View>

      {/* Alt Satır: Tarih Aralığı (Yıl Bilgisini Eksiksiz Gösterir) */}
      <View style={styles.impCardBottomRow}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.78}
          style={styles.impCardDatesText}
        >
          {item.startDate} → {item.endDate}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── 2'li Gruplar Halinde Sağa Kaydırılabilir Ultra Akıcı Carousel Bileşeni ───
function ImprovementCarousel({
  items,
  pageWidth,
  onPressGraph,
  onPressViewAll,
}: {
  items: ImprovementCardData[];
  pageWidth: number;
  onPressGraph: (name: string) => void;
  onPressViewAll?: () => void;
}) {
  const [activePage, setActivePage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Son 6 kartı 2'şerli sayfalara böl
  const pages = useMemo(() => {
    const sixItems = items.slice(0, 6);
    const result: ImprovementCardData[][] = [];
    for (let i = 0; i < sixItems.length; i += 2) {
      result.push(sixItems.slice(i, i + 2));
    }
    return result;
  }, [items]);

  // Sayfa kaydıkça gerçek zamanlı (60/120fps) aktif nokta güncellemesi
  const handleScroll = useCallback(
    (e: any) => {
      const offset = e.nativeEvent.contentOffset.x;
      if (pageWidth > 0) {
        const newIdx = Math.min(
          pages.length - 1,
          Math.max(0, Math.round(offset / pageWidth))
        );
        if (newIdx !== activePage) {
          setActivePage(newIdx);
        }
      }
    },
    [activePage, pages.length, pageWidth]
  );

  return (
    <View style={{ marginBottom: 12 }}>
      <FlatList
        ref={flatListRef}
        data={pages}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={pageWidth}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        bounces={true}
        overScrollMode="always"
        getItemLayout={(_, index) => ({
          length: pageWidth,
          offset: pageWidth * index,
          index,
        })}
        onScroll={handleScroll}
        onMomentumScrollEnd={(e) => {
          const offset = e.nativeEvent.contentOffset.x;
          if (pageWidth > 0) {
            const newIdx = Math.min(
              pages.length - 1,
              Math.max(0, Math.round(offset / pageWidth))
            );
            setActivePage(newIdx);
          }
        }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={[styles.carouselPage, { width: pageWidth }]}>
            <View style={styles.carouselCol}>
              <ImprovementCard
                item={item[0]}
                onPressGraph={() => onPressGraph(item[0].name)}
              />
            </View>
            <View style={styles.carouselCol}>
              {item[1] ? (
                <ImprovementCard
                  item={item[1]}
                  onPressGraph={() => onPressGraph(item[1].name)}
                />
              ) : (
                <View style={{ flex: 1 }} />
              )}
            </View>
          </View>
        )}
      />

      {/* Sayfa Noktaları ve Sağ Taraftaki "Tümünü gör • 20 >" Bağlantısı */}
      <View style={styles.carouselFooterRow}>
        <View style={styles.carouselDotsCenterWrapper}>
          {pages.map((_, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: idx, animated: true });
                setActivePage(idx);
              }}
              hitSlop={6}
            >
              <View
                style={[
                  styles.carouselDot,
                  idx === activePage && styles.carouselDotActive,
                ]}
              />
            </Pressable>
          ))}
        </View>

        {onPressViewAll && (
          <Pressable
            style={({ pressed }) => [
              styles.carouselViewAllLink,
              pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
            ]}
            onPress={onPressViewAll}
            hitSlop={8}
          >
            <Text style={styles.carouselViewAllText}>
              Tümünü gör • {items.length}
            </Text>
            <ChevronRightIcon size={14} color="#38BDF8" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Instagram Explore Reels Stili Gri Işıltılı Shimmer Yükleme Kartları ───
function InstagramShimmerCards({ pageWidth }: { pageWidth: number }) {
  const [shimmerAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, pageWidth + 180],
  });

  return (
    <View style={{ marginBottom: 12 }}>
      {/* 2'li Yan Yana İskelet Kartlar */}
      <View style={[styles.carouselPage, { width: pageWidth, overflow: 'hidden', position: 'relative' }]}>
        {/* 1. İskelet Kart */}
        <View style={[styles.carouselCol, styles.shimmerCardContainer]}>
          <View style={styles.shimmerTopRow}>
            <View style={styles.shimmerMusclePill} />
            <View style={styles.shimmerTitleBar} />
          </View>
          <View style={styles.shimmerValuesRow}>
            <View style={styles.shimmerValueBlock} />
            <Text style={styles.shimmerArrow}>→</Text>
            <View style={styles.shimmerValueBlock} />
            <View style={styles.shimmerChangePill} />
          </View>
          <View style={styles.shimmerWavePlaceholder} />
          <View style={styles.shimmerDateBar} />
        </View>

        {/* 2. İskelet Kart */}
        <View style={[styles.carouselCol, styles.shimmerCardContainer]}>
          <View style={styles.shimmerTopRow}>
            <View style={styles.shimmerMusclePill} />
            <View style={styles.shimmerTitleBar} />
          </View>
          <View style={styles.shimmerValuesRow}>
            <View style={styles.shimmerValueBlock} />
            <Text style={styles.shimmerArrow}>→</Text>
            <View style={styles.shimmerValueBlock} />
            <View style={styles.shimmerChangePill} />
          </View>
          <View style={styles.shimmerWavePlaceholder} />
          <View style={styles.shimmerDateBar} />
        </View>

        {/* Soldan Sağa Kayan Gri-Gümüş Işıltı (Instagram Sheen Effect) */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmerLightBeam,
            {
              transform: [{ translateX: shimmerTranslateX }, { skewX: '-20deg' }],
            },
          ]}
        >
          <Svg width="160" height="100%" viewBox="0 0 160 160" preserveAspectRatio="none">
            <Defs>
              <LinearGradient id="igShimmerBeam" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.04" />
                <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.22" />
                <Stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.04" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="160" height="160" fill="url(#igShimmerBeam)" />
          </Svg>
        </Animated.View>
      </View>

      {/* Yükleniyor Bildirimi ve Dönen İndikatör */}
      <View style={styles.shimmerStatusRow}>
        <ActivityIndicator size="small" color="#38BDF8" />
        <Text style={styles.shimmerStatusText}>Veriler yükleniyor...</Text>
      </View>
    </View>
  );
}

// ─── Kişisel Rekorlar İçin Shimmer Yükleme İskeleti ───
function PersonalRecordsShimmer() {
  const [shimmerAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    );
    anim.start();
    return () => anim.stop();
  }, [shimmerAnim]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 420],
  });

  return (
    <View style={styles.prShimmerContainer}>
      <View style={styles.prShimmerRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ width: '60%', height: 13, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
          <View style={{ width: '40%', height: 9, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3 }} />
        </View>
        <View style={{ width: 50, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
        <View style={{ width: 40, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
      </View>
      <View style={styles.prShimmerRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ width: '50%', height: 13, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
          <View style={{ width: '35%', height: 9, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3 }} />
        </View>
        <View style={{ width: 50, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
        <View style={{ width: 40, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
      </View>
      <View style={styles.prShimmerRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ width: '65%', height: 13, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
          <View style={{ width: '45%', height: 9, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 3 }} />
        </View>
        <View style={{ width: 50, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
        <View style={{ width: 40, height: 14, backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 4 }} />
      </View>

      {/* Soldan Sağa Kayan Gri-Gümüş Işıltı */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmerLightBeam,
          {
            transform: [{ translateX: shimmerTranslateX }, { skewX: '-20deg' }],
          },
        ]}
      >
        <Svg width="160" height="100%" viewBox="0 0 160 160" preserveAspectRatio="none">
          <Defs>
            <LinearGradient id="prShimmerBeam" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <Stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.04" />
              <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.20" />
              <Stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.04" />
              <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="160" height="160" fill="url(#prShimmerBeam)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

// ─── Tüm İlerlemeler Sürükle-Bırak & Yüksek Akışlı Alt Panel Bileşeni ───
function AllImprovementsBottomSheetModal({
  visible,
  onClose,
  pairedImprovements,
  onPressGraph,
  onRetry,
  timedOut,
}: {
  visible: boolean;
  onClose: () => void;
  pairedImprovements: ImprovementCardData[][];
  onPressGraph: (name: string) => void;
  onRetry: () => void;
  timedOut?: boolean;
}) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const estimatedSheetHeight = Math.max(500, Math.round(windowHeight * 0.74));
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  // Animasyon Değerleri: useNativeDriver: false ile JS PanResponder setValue anında senkronize olur
  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));

  // Yüksek akışlı (high-flow) yaylanma animasyonuyla açılış
  const openSheet = useCallback(() => {
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 220,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, sheetHeight, translateY]);

  // Yüksek akışlı pürüzsüz kapanış animasyonu
  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight || estimatedSheetHeight,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [backdropAnim, estimatedSheetHeight, onClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  // PanResponder: Tutamaç veya başlık çekildiğinde paneli parmakla 1:1 aşağı indirir
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const fade = Math.max(0.2, 1 - gestureState.dy / (sheetHeight * 1.1));
            backdropAnim.setValue(fade);
          } else {
            translateY.setValue(gestureState.dy * 0.18);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss = gestureState.dy > 70 || gestureState.vy > 0.4;
          if (shouldDismiss) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                mass: 0.8,
                stiffness: 240,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              damping: 22,
              mass: 0.8,
              stiffness: 240,
              useNativeDriver: false,
            }),
            Animated.timing(backdropAnim, {
              toValue: 1,
              duration: 160,
              easing: Easing.out(Easing.quad),
              useNativeDriver: false,
            }),
          ]).start();
        },
      }),
    [backdropAnim, closeSheet, sheetHeight, translateY]
  );

  const handleCardPress = useCallback(
    (exerciseName: string) => {
      closeSheet();
      onPressGraph(exerciseName);
    },
    [closeSheet, onPressGraph]
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={styles.modalRootContainer}>
        {/* Dokunulduğunda Kapanan Bulanık Arka Plan */}
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={styles.modalBackdropTap} onPress={closeSheet} />
        </Animated.View>

        {/* Sürükle Bırak Yapılabilir Yüzen Alt Panel */}
        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 2) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükle Bırak Tutamaç ve Başlık Alanı (PanResponder) */}
          <View style={styles.modalDragZone}>
            {/* Tutamaç Barı (Tüm genişlik boyunca dokunma alanı) */}
            <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
              <View style={styles.modalDragHandle} />
            </View>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View {...panResponder.panHandlers} style={styles.modalHeaderLeft}>
                <View style={styles.modalHeaderIconWrap}>
                  <TrendingUpIcon size={18} color={C.violet} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>Tüm Güç Artışları</Text>
                  <Text style={styles.modalSubtitle}>
                    Aşağı sürükleyerek kapatabilirsiniz
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={closeSheet}
                style={styles.modalCloseButtonRed}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* 2'li Gruplar Halinde Alt Alta Sıralanmış Liste */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={true}
            bounces={true}
          >
            {pairedImprovements.length === 0 ? (
              !timedOut ? (
                <InstagramShimmerCards pageWidth={windowWidth - 32} />
              ) : (
                <ConnectionErrorNotice onRetry={onRetry} />
              )
            ) : (
              pairedImprovements.map((pair, rowIndex) => (
                <View key={rowIndex} style={styles.modalCardRow}>
                  <View style={styles.modalCardCol}>
                    <ImprovementCard
                      item={pair[0]}
                      onPressGraph={() => handleCardPress(pair[0].name)}
                    />
                  </View>
                  <View style={styles.modalCardCol}>
                    {pair[1] ? (
                      <ImprovementCard
                        item={pair[1]}
                        onPressGraph={() => handleCardPress(pair[1].name)}
                      />
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Sonsuz Alt Uzantı Eteği (Pano yukarı çekildiğinde alt sınırın görünmemesini sağlar) */}
          <View style={styles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Web Alt Bölüm 17.2: Kas Grupları & Çeviri Eşleştirmeleri ───
const PROGRESS_GROUP_ORDER = ['Göğüs', 'Sırt', 'Omuz', 'Kol', 'Bacak', 'Rotatorlar', 'Core', 'Diğer'] as const;

const MUSCLE_ALIASES: Record<string, string> = {
  'Chest': 'Göğüs', 'Göğüs': 'Göğüs',
  'Back': 'Sırt', 'Sırt': 'Sırt',
  'Shoulders': 'Omuz', 'Shoulder': 'Omuz', 'Omuz': 'Omuz',
  'Biceps': 'Kol', 'Triceps': 'Kol', 'Arms': 'Kol', 'Arm': 'Kol', 'Kol': 'Kol',
  'Legs': 'Bacak', 'Leg': 'Bacak', 'Bacak': 'Bacak', 'Alt Vücut': 'Bacak',
  'Quadriceps': 'Bacak', 'Hamstring': 'Bacak', 'Glute': 'Bacak', 'Gluteus': 'Bacak',
  'Calf': 'Bacak', 'Adductors': 'Bacak',
  'Rotatorlar': 'Rotatorlar', 'Rotator Cuff': 'Rotatorlar', 'Hip Rotators': 'Rotatorlar',
  'Core': 'Core', 'Abs': 'Core', 'Karın': 'Core',
};

function getProgressMuscleGroup(rawMuscle?: string, rawGroup?: string): string {
  const raw = String(rawMuscle || rawGroup || 'Diğer').trim();
  return MUSCLE_ALIASES[raw] || raw || 'Diğer';
}

export type ProgressExerciseOption = {
  id: string;
  name: string;
  muscle: string;
  group: string;
  bw: boolean;
  weighted: boolean;
};

// ─── Hızlı & Akıcı Egzersiz Seçici Satırı (Sağdaki Mavi Cyan Kas Grubu Kaldırıldı, Etiketler Korundu) ───
type ExerciseDropdownRowProps = {
  item: ProgressExerciseOption;
  isSelected: boolean;
  onSelect: (item: ProgressExerciseOption) => void;
};

const ExerciseDropdownRow = React.memo(function ExerciseDropdownRow({
  item,
  isSelected,
  onSelect,
}: ExerciseDropdownRowProps) {
  return (
    <TouchableOpacity
      style={[
        styles.exerciseDropdownItem,
        isSelected && styles.exerciseDropdownItemActive,
      ]}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.dropdownItemLeft}>
        <Text
          numberOfLines={1}
          style={[
            styles.exerciseDropdownItemText,
            isSelected && styles.exerciseDropdownItemTextActive,
          ]}
        >
          {item.name}
        </Text>
        {item.bw && (
          <View style={styles.dropdownBwBadge}>
            <Text style={styles.dropdownBwBadgeText}>Vücut Ağırlığı</Text>
          </View>
        )}
        {item.weighted && !item.bw && (
          <View style={styles.dropdownWeightedBadge}>
            <Text style={styles.dropdownWeightedBadgeText}>Ağırlıklı</Text>
          </View>
        )}
      </View>

      {/* Sağ tarafta SADECE Seçim İmi (Mavi cyan renkli kas grubu yazısı kaldırıldı!) */}
      {isSelected && (
        <View style={styles.exerciseDropdownCheckWrap}>
          <Text style={styles.exerciseDropdownCheckText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function ProgressScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = width - 32;

  // Ana Sekme State'i: 'progress' | 'records'
  const [activeTab, setActiveTab] = useState<'progress' | 'records'>('progress');

  // Grafik Seçici State'leri (Aylık, Yıllık, Genel & Ağırlık / Ağırlık+Tekrar)
  const [metric, setMetric] = useState<ProgressMetric>('weight');
  const [period, setPeriod] = useState<ProgressPeriod>('monthly');
  const [selectedExercise, setSelectedExercise] = useState('Overhead Press');
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | undefined>('overhead-press');

  // Dönem Menüsü Açılış/Kapanış Yumuşak Yay & Süzülme Animasyonu
  const [menuMounted, setMenuMounted] = useState(false);
  const [menuAnim] = useState(() => new Animated.Value(0));

  const openPeriodMenu = useCallback(() => {
    setMenuMounted(true);
    Animated.spring(menuAnim, {
      toValue: 1,
      friction: 8,
      tension: 90,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [menuAnim]);

  const closePeriodMenu = useCallback((onFinished?: () => void) => {
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) {
        setMenuMounted(false);
        onFinished?.();
      }
    });
  }, [menuAnim]);

  const togglePeriodMenu = useCallback(() => {
    if (menuMounted) {
      closePeriodMenu();
    } else {
      openPeriodMenu();
    }
  }, [menuMounted, openPeriodMenu, closePeriodMenu]);

  const [selectedPointIndex, setSelectedPointIndex] = useState<number | null>(null);

  const periodBadgeLabel = period === 'monthly' ? 'Aylık' : period === 'yearly' ? 'Yıllık' : 'Genel';

  const chartScrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);

  const [showAllModal, setShowAllModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isExerciseDropdownOpen, setIsExerciseDropdownOpen] = useState(false);
  const [exerciseDropdownMounted, setExerciseDropdownMounted] = useState(false);
  const [exerciseDropdownAnim] = useState(() => new Animated.Value(0));
  const [isSearching, setIsSearching] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const searchInputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const openExerciseDropdown = useCallback(() => {
    setExerciseDropdownMounted(true);
    setIsExerciseDropdownOpen(true);
    exerciseDropdownAnim.stopAnimation();
    exerciseDropdownAnim.setValue(0);
    Animated.timing(exerciseDropdownAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [exerciseDropdownAnim]);

  const closeExerciseDropdown = useCallback((onFinished?: () => void) => {
    setIsSearching(false);
    setExerciseSearchQuery('');
    searchInputRef.current?.blur();
    exerciseDropdownAnim.stopAnimation();
    Animated.timing(exerciseDropdownAnim, {
      toValue: 0,
      duration: 260,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) {
        setIsExerciseDropdownOpen(false);
        setExerciseDropdownMounted(false);
        onFinished?.();
      }
    });
  }, [exerciseDropdownAnim]);

  const toggleExerciseDropdown = useCallback(() => {
    if (exerciseDropdownMounted) {
      closeExerciseDropdown();
    } else {
      openExerciseDropdown();
    }
  }, [exerciseDropdownMounted, openExerciseDropdown, closeExerciseDropdown]);

  const handleBarPress = useCallback(() => {
    if (!exerciseDropdownMounted) {
      // 1. Dokunuş: Hemen klavye açılmasın, önce liste açılsın
      openExerciseDropdown();
    } else if (!isSearching) {
      // 2. Dokunuş: Liste açıkken kullanıcı ikinci kez çubuğa dokunduğunda klavye açılsın
      setIsSearching(true);
      setExerciseSearchQuery('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [exerciseDropdownMounted, isSearching, openExerciseDropdown]);

  const chevronRotate = useMemo(() => {
    return exerciseDropdownAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });
  }, [exerciseDropdownAnim]);

  // Kişisel Rekorlar Başlık Açıp/Kapatma (Accordion) State'i
  const [collapsedPrGroups, setCollapsedPrGroups] = useState<Record<string, boolean>>({});

  const togglePrGroup = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedPrGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // ─── ALT BÖLÜM 17.3: GRAFİK HÜZME DOLUM ANİMASYONU VE KANVAS EFEKTLERİ (HX BEAM REVEAL) ───
  // Web versiyonundaki _hxBeamRevealPlugin & _playHxBeamReveal animasyonunun birebir React Native SVG uyarlaması
  const [hxBeamProgress] = useState(() => new Animated.Value(1));
  const [hxBeamOpacity] = useState(() => new Animated.Value(0));

  // ─── Node Seçimi Yumuşak Yay (Spring Pulse) & Belirgin Süzülme Animasyonu ───
  const [nodePulseAnim] = useState(() => new Animated.Value(1));
  const [nodePanoAnim] = useState(() => new Animated.Value(1));
  const [nodeSelectCount, setNodeSelectCount] = useState(0);

  const triggerNodeSelectAnimation = useCallback(() => {
    nodePulseAnim.stopAnimation();
    nodePanoAnim.stopAnimation();

    nodePulseAnim.setValue(0.3);
    nodePanoAnim.setValue(0);
    setNodeSelectCount((c) => c + 1);

    Animated.parallel([
      Animated.spring(nodePulseAnim, {
        toValue: 1,
        tension: 38,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(nodePanoAnim, {
        toValue: 1,
        duration: 820,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [nodePulseAnim, nodePanoAnim]);

  const lastLayoutKeyRef = useRef('');

  const playHxBeamReveal = useCallback(() => {
    hxBeamProgress.stopAnimation();
    hxBeamOpacity.stopAnimation();

    hxBeamProgress.setValue(0);
    hxBeamOpacity.setValue(1);

    // Hem Web hem Mobilde (Android & iOS) %100 Donanım Hızlandırmalı 820ms easeOutQuart / cubic animasyon
    Animated.timing(hxBeamProgress, {
      toValue: 1,
      duration: 820,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start(({ finished }) => {
      if (finished) {
        // Hüzme tepeye ulaştığında lazer ışığı yumuşakça sönümlenir
        Animated.timing(hxBeamOpacity, {
          toValue: 0,
          duration: 160,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }).start();
      }
    });
  }, [hxBeamProgress, hxBeamOpacity]);

  const triggerChartAnimation = useCallback(() => {
    playHxBeamReveal();
  }, [playHxBeamReveal]);

  // 1. Sayfaya odaklanıldığında (Focus / Giriş) mobilde ve webde grafiğe hüzme animasyonunu uygula
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'progress') {
        lastLayoutKeyRef.current = '';
        triggerChartAnimation();
      }
    }, [activeTab, triggerChartAnimation])
  );

  // 2. Sekme değiştiğinde ('progress' sekmesine geçildiğinde) hüzme animasyonunu uygula
  useEffect(() => {
    if (activeTab === 'progress') {
      triggerChartAnimation();
    }
  }, [activeTab, triggerChartAnimation]);

  // 3. Egzersiz, metrik veya dönem değiştiğinde hüzme animasyonunu uygula
  useEffect(() => {
    if (activeTab === 'progress') {
      triggerChartAnimation();
    }
  }, [selectedExercise, metric, period, activeTab, triggerChartAnimation]);

  // ─── Backend API Hook Entegrasyonu (Egzersiz Havuzu, PR'lar, Workouts) ───
  const {
    exercises: catalogExercises,
    isError: isExercisesError,
    refetch: refetchExercises,
  } = useExercises();
  const {
    topProgress,
    personalRecords,
    chartData: rawChartData,
    isChartLoading,
    isError: isProgressError,
    refetch: refetchProgress,
  } = useProgress(selectedExercise, selectedExerciseId);
  const {
    workouts,
    refetch: refetchWorkouts,
  } = useWorkouts();

  // 10 Saniyelik Yükleme Gecikmesi & Zaman Aşımı (Timeout) Kontrolü
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timeoutTimerRef.current = setTimeout(() => {
      setLoadTimedOut(true);
    }, 10000);

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, []);

  const handleGlobalRetry = useCallback(() => {
    setLoadTimedOut(false);
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    timeoutTimerRef.current = setTimeout(() => {
      setLoadTimedOut(true);
    }, 10000);

    refetchExercises();
    refetchProgress();
    refetchWorkouts();
  }, [refetchExercises, refetchProgress, refetchWorkouts]);

  // 4. Veri tabanından veri yüklenmesi tamamlandığında grafiği süzdür
  const prevLoadingRef = useRef(isChartLoading);
  useEffect(() => {
    if (prevLoadingRef.current && !isChartLoading && activeTab === 'progress') {
      triggerChartAnimation();
    }
    prevLoadingRef.current = isChartLoading;
  }, [isChartLoading, activeTab, triggerChartAnimation]);

  // Tüm İlerlemeler Listesi (Sadece veritabanındaki gerçek veriler)
  const allImprovements = useMemo<ImprovementCardData[]>(() => {
    if (topProgress && topProgress.length > 0) {
      return topProgress.map((item) => ({
        name: item.exercise,
        muscle: item.muscle,
        from: `${item.first_value} ${item.metric_type === 'reps' ? 'tkr' : 'kg'}`,
        to: `${item.current_pr_value} ${item.metric_type === 'reps' ? 'tkr' : 'kg'}`,
        change: `+${item.percentage}%`,
        startDate: formatFullDateStr(item.first_date, '01.07.2024'),
        endDate: formatFullDateStr(item.current_pr_date, '20.10.2024'),
      }));
    }
    return [];
  }, [topProgress]);

  // Modal İçi İkili Gruplanmış İlerlemeler (Kesinlikle 2'li Gruplar)
  const pairedImprovements = useMemo(() => {
    const pairs: ImprovementCardData[][] = [];
    for (let i = 0; i < allImprovements.length; i += 2) {
      pairs.push(allImprovements.slice(i, i + 2));
    }
    return pairs;
  }, [allImprovements]);

  // Kişisel Rekorlar Grupları (Gerçek DB'deki rekorları kategoriye böl)
  const prGroups = useMemo<PrGroupData[]>(() => {
    if (personalRecords && personalRecords.length > 0) {
      return groupPersonalRecords(personalRecords);
    }
    return [];
  }, [personalRecords]);

  // ─── Egzersiz Havuzu: Tüm Egzersizler (Backend /api/exercises + PR'lar + Workouts) ───
  const selectableExercises = useMemo<ProgressExerciseOption[]>(() => {
    const list: ProgressExerciseOption[] = [];
    const seenNames = new Set<string>();

    const addExercise = (
      rawId: string | undefined,
      rawName: string | undefined,
      rawMuscle?: string,
      rawGroup?: string,
      isBw?: boolean,
      isWeighted?: boolean
    ) => {
      const name = String(rawName || '').trim();
      if (!name) return;
      const cleanName = name
        .replace(/\s*\((?:vücut ağırlığı|vucut agirligi|ağırlıklı|agirlikli|bodyweight|weighted)\)/gi, '')
        .trim();
      const lower = cleanName.toLowerCase();
      if (seenNames.has(lower)) return;
      seenNames.add(lower);

      const id = String(rawId || '').trim() || cleanName.toLowerCase().replace(/\s+/g, '-');
      const group = getProgressMuscleGroup(rawMuscle, rawGroup);
      list.push({
        id,
        name: cleanName,
        muscle: rawMuscle || rawGroup || 'Diğer',
        group,
        bw: Boolean(isBw),
        weighted: Boolean(isWeighted),
      });
    };

    // 1. Backend Egzersiz Kataloğu (/api/exercises havuzundan tüm hareketler)
    if (catalogExercises && catalogExercises.length > 0) {
      catalogExercises.forEach((ex) => {
        const isBw = Boolean(ex.is_bodyweight || ex.bw || ex.analysis?.load_mode === 'bodyweight');
        const isWeighted = Boolean(ex.weighted && !isBw);
        addExercise(ex.id || ex.canonical_exercise_id, ex.name, ex.muscle, ex.muscle_group, isBw, isWeighted);
      });
    }

    // 2. Kişisel Rekorlar (PR) - Havuzda henüz yer almayan hareketler
    if (personalRecords && personalRecords.length > 0) {
      personalRecords.forEach((pr) => {
        const isBw = pr.metric_type === 'reps' || Boolean(pr.is_bodyweight);
        addExercise(pr.exercise_id, pr.exercise, pr.muscle, undefined, isBw, !isBw);
      });
    }

    // 3. Antrenman Geçmişi (Workouts) - Varsa eksik hareketleri ekle
    if (workouts && workouts.length > 0) {
      workouts.forEach((w) => {
        (w.exercises || []).forEach((e) => {
          addExercise(undefined, e.exercise_name, e.muscle_group, e.muscle_group, false, true);
        });
      });
    }

    return list;
  }, [catalogExercises, personalRecords, workouts]);

  // Egzersiz Arama ve Kas Grubu Bazında Gruplama (Neon Kas Grubu Başlıkları)
  const groupedExercises = useMemo(() => {
    const search = exerciseSearchQuery.trim().toLocaleLowerCase('tr-TR');
    const grouped = new Map<string, ProgressExerciseOption[]>();

    selectableExercises.forEach((exercise) => {
      const name = exercise.name;
      if (!name) return;

      if (search) {
        const nameMatch = name.toLocaleLowerCase('tr-TR').includes(search);
        const muscleMatch = exercise.muscle.toLocaleLowerCase('tr-TR').includes(search);
        const groupMatch = exercise.group.toLocaleLowerCase('tr-TR').includes(search);
        if (!nameMatch && !muscleMatch && !groupMatch) return;
      }

      const group = exercise.group;
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group)!.push(exercise);
    });

    const groups = Array.from(grouped.keys()).sort((a, b) => {
      const aOrder = PROGRESS_GROUP_ORDER.indexOf(a as typeof PROGRESS_GROUP_ORDER[number]);
      const bOrder = PROGRESS_GROUP_ORDER.indexOf(b as typeof PROGRESS_GROUP_ORDER[number]);
      return (aOrder < 0 ? 99 : aOrder) - (bOrder < 0 ? 99 : bOrder) || a.localeCompare(b, 'tr-TR');
    });

    return groups.map((group) => {
      const exercises = grouped.get(group)!.sort((a, b) => a.name.localeCompare(b.name, 'tr-TR'));
      return {
        group,
        items: exercises,
      };
    });
  }, [selectableExercises, exerciseSearchQuery]);

  const totalMatchingExercises = useMemo(() => {
    return groupedExercises.reduce((sum, g) => sum + g.items.length, 0);
  }, [groupedExercises]);

  // Arama Filtresi (Türkçe karakter duyarlı, anlık filtrelenir)
  const filteredExercises = useMemo(() => {
    const search = exerciseSearchQuery.trim().toLocaleLowerCase('tr-TR');
    if (!search) return selectableExercises;
    return selectableExercises.filter((item) =>
      item.name.toLocaleLowerCase('tr-TR').includes(search)
    );
  }, [selectableExercises, exerciseSearchQuery]);

  // ─── Backend PostgreSQL Veri Tabanından Gelen Grafik Verilerini Dinamik Ayrıştır ───
  const parsedChartSummaries = useMemo<DayChartSummary[]>(() => {
    const fromApi = parseChartDataFromApi(rawChartData);
    if (fromApi.length > 0) return fromApi;

    const fromWorkouts = parseChartDataFromWorkouts(workouts, selectedExercise);
    if (fromWorkouts.length > 0) return fromWorkouts;

    return [];
  }, [rawChartData, workouts, selectedExercise]);

  // ─── Zaman Aralığına Göre Gerçek Tarih Bazlı Filtreleme (Aylık / Yıllık / Genel) ───
  const displayChartPoints = useMemo<DayChartSummary[]>(() => {
    if (parsedChartSummaries.length === 0) return [];
    if (period === 'all') return parsedChartSummaries;

    // Referans tarih: En son seans tarihi veya bugünün tarihi
    const latestDate = parsedChartSummaries[parsedChartSummaries.length - 1].dateObj;
    const refTime = latestDate.getTime();

    if (period === 'monthly') {
      // Son 30 gün içindeki antrenman seansları
      const cutoffTime = refTime - 30 * 24 * 60 * 60 * 1000;
      const filtered = parsedChartSummaries.filter(
        (p) => p.dateObj.getTime() >= cutoffTime
      );
      return filtered.length > 0 ? filtered : parsedChartSummaries.slice(-3);
    }

    if (period === 'yearly') {
      // Son 365 gün içindeki antrenman seansları
      const cutoffTime = refTime - 365 * 24 * 60 * 60 * 1000;
      const filtered = parsedChartSummaries.filter(
        (p) => p.dateObj.getTime() >= cutoffTime
      );
      return filtered.length > 0 ? filtered : parsedChartSummaries;
    }

    return parsedChartSummaries;
  }, [period, parsedChartSummaries]);

  // Seçili Nokta (Kullanıcı seçmemişse varsayılan olarak son seans seçilidir)
  const activePointIndex = useMemo(() => {
    if (displayChartPoints.length === 0) return null;
    if (
      selectedPointIndex !== null &&
      selectedPointIndex >= 0 &&
      selectedPointIndex < displayChartPoints.length
    ) {
      return selectedPointIndex;
    }
    return displayChartPoints.length - 1;
  }, [displayChartPoints.length, selectedPointIndex]);

  // 4. Grafik verisi (noktalar) backend'den yüklendiğinde veya değiştiğinde hüzme animasyonunu başlat
  useEffect(() => {
    if (activeTab === 'progress' && displayChartPoints.length > 0) {
      triggerChartAnimation();
    }
  }, [displayChartPoints.length, selectedExercise, period, metric, activeTab, triggerChartAnimation]);

  // Mobilde grafik ekrana yerleştiği anda (Layout bittiğinde) kesin tetikleme kontrolü
  const handleChartLayout = useCallback(() => {
    const layoutKey = `${selectedExercise}-${period}-${metric}-${displayChartPoints.length}`;
    if (lastLayoutKeyRef.current !== layoutKey) {
      lastLayoutKeyRef.current = layoutKey;
      triggerChartAnimation();
    }
  }, [selectedExercise, period, metric, displayChartPoints.length, triggerChartAnimation]);

  // Grafik Alanı Boyutları & Yatay Kaydırma Hesaplamaları
  const chartHeight = 180;
  const plotTop = 18;
  const plotBottom = chartHeight - 26;
  const plotHeight = plotBottom - plotTop;

  const leftColWidth = 32;
  const rightColWidth = metric === 'weight-reps' ? 22 : 0;
  const cardPadding = 24;
  const availablePlotWidth = Math.max(200, contentWidth - cardPadding - leftColWidth - rightColWidth);

  const isScrollable = displayChartPoints.length > 4;
  const pointSpacing = 76;
  const svgWidth = isScrollable
    ? Math.max(availablePlotWidth, (displayChartPoints.length - 1) * pointSpacing + 64)
    : availablePlotWidth;

  const initialScrollX = useMemo(() => {
    return isScrollable ? Math.max(0, svgWidth - availablePlotWidth) : 0;
  }, [isScrollable, svgWidth, availablePlotWidth]);

  // Yatay scroll aktifken en güncel antrenmana (sağa) sessizce hizala (sert sıçrama olmadan doğru konumda başlar)
  useEffect(() => {
    chartScrollRef.current?.scrollTo({ x: initialScrollX, animated: false });
  }, [initialScrollX, period, selectedExercise]);

  const plotLeft = 32;
  const plotRight = svgWidth - 28;
  const plotWidth = plotRight - plotLeft;

  // Grafik Çizgileri, Bezier Eğrileri ve Y Eksen Ticks Hesaplaması
  const {
    weightPoints,
    repsPoints,
    yTicks,
    yRepsTicks,
    smoothWeightPath,
    areaWeightPath,
    smoothRepsPath,
  } = useMemo(() => {
    if (displayChartPoints.length === 0) {
      return {
        weightPoints: [],
        repsPoints: [],
        yTicks: [],
        yRepsTicks: [],
        smoothWeightPath: '',
        areaWeightPath: '',
        smoothRepsPath: '',
      };
    }

    const n = displayChartPoints.length;
    const weights = displayChartPoints.map((p) => p.maxWeight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    // Y Ağırlık Ölçeği (Örn: 40 - 50 kg)
    const yWeightMin = Math.max(0, minWeight <= 5 ? 0 : Math.floor(minWeight / 5) * 5);
    const yWeightMax =
      Math.ceil(maxWeight / 5) * 5 === yWeightMin
        ? yWeightMin + 10
        : Math.ceil(maxWeight / 5) * 5;

    const tickCount = 5;
    const ticks: { val: number; y: number }[] = [];
    for (let i = 0; i < tickCount; i++) {
      const val = yWeightMax - (i * (yWeightMax - yWeightMin)) / (tickCount - 1);
      const y = plotTop + (i * plotHeight) / (tickCount - 1);
      ticks.push({ val: Math.round(val), y });
    }

    // Y Tekrar Ölçeği (Sağ Sütun)
    const repsArr = displayChartPoints.map((p) => p.repsAtMaxWeight);
    const minReps = Math.max(1, Math.min(...repsArr));
    const maxReps = Math.max(minReps + 1, Math.max(...repsArr));
    const rTicks: { val: number; y: number }[] = [];
    for (let i = 0; i < tickCount; i++) {
      const val = maxReps - (i * (maxReps - minReps)) / (tickCount - 1);
      const y = plotTop + (i * plotHeight) / (tickCount - 1);
      rTicks.push({ val: Math.round(val), y });
    }

    // Ağırlık Noktaları
    const wPoints = displayChartPoints.map((item, idx) => {
      const x = n === 1 ? plotLeft + plotWidth / 2 : plotLeft + (idx / (n - 1)) * plotWidth;
      const ratio = (item.maxWeight - yWeightMin) / (yWeightMax - yWeightMin || 1);
      const y = plotBottom - Math.max(0, Math.min(1, ratio)) * plotHeight;
      return {
        x,
        y,
        weight: item.maxWeight,
        reps: item.repsAtMaxWeight,
        label: item.label,
        rawDateStr: item.rawDateStr,
        dateStr: item.dateStr,
        dateObj: item.dateObj,
        sets: item.sets,
      };
    });

    const wCurve = generateSmoothPath(wPoints);
    const wArea = generateAreaPath(wPoints, plotBottom);

    // Tekrar Noktaları
    const rPoints = displayChartPoints.map((item, idx) => {
      const x = n === 1 ? plotLeft + plotWidth / 2 : plotLeft + (idx / (n - 1)) * plotWidth;
      const ratio = (item.repsAtMaxWeight - minReps) / (maxReps - minReps || 1);
      const y = plotBottom - Math.max(0, Math.min(1, ratio)) * plotHeight;
      return { x, y, reps: item.repsAtMaxWeight };
    });

    const rCurve = generateSmoothPath(rPoints);

    return {
      weightPoints: wPoints,
      repsPoints: rPoints,
      yTicks: ticks,
      yRepsTicks: rTicks,
      smoothWeightPath: wCurve,
      areaWeightPath: wArea,
      smoothRepsPath: rCurve,
    };
  }, [displayChartPoints, plotLeft, plotTop, plotBottom, plotWidth, plotHeight]);

  // Seçili Nokta Detayları
  const selectedPointDetails = useMemo(() => {
    if (activePointIndex !== null && weightPoints[activePointIndex]) {
      return weightPoints[activePointIndex];
    }
    return null;
  }, [activePointIndex, weightPoints]);

  // Yumuşak Geçişli Dönem Değiştirici (Aylık / Yıllık / Genel yumuşak süzülme)
  const handlePeriodChange = (p: ProgressPeriod) => {
    if (p === period) return;
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch {
      // sessizce devam et
    }
    setPeriod(p);
    setSelectedPointIndex(null);
    triggerChartAnimation();
    // Dönem değiştiğinde önceki kaydırma ofsetinin grafiği boş göstermesini önlemek için hemen başa sıfırla
    chartScrollRef.current?.scrollTo({ x: 0, animated: false });
  };

  const handleSelectExercise = useCallback(
    (item: ProgressExerciseOption | string) => {
      const exName = typeof item === 'string' ? item : item.name;
      const cleanName = exName
        .replace(/\s*\((?:vücut ağırlığı|vucut agirligi|ağırlıklı|agirlikli|bodyweight|weighted)\)/gi, '')
        .trim();
      const matched = selectableExercises.find(
        (e) => e.name.toLowerCase() === cleanName.toLowerCase() || e.id === cleanName.toLowerCase()
      );
      const exId = typeof item === 'string' ? matched?.id : item.id;

      setSelectedExercise(cleanName);
      setSelectedExerciseId(exId);
      closeExerciseDropdown();
      setSelectedPointIndex(null);
      triggerChartAnimation();
    },
    [selectableExercises, closeExerciseDropdown, triggerChartAnimation]
  );

  const handleSelectExerciseFromModal = (ex: string) => {
    handleSelectExercise(ex);
    setShowExerciseModal(false);
  };

  const handleGraphLinkClick = useCallback(
    (exerciseName: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      const cleanName = exerciseName
        .replace(/\s*\((?:vücut ağırlığı|vucut agirligi|ağırlıklı|agirlikli|bodyweight|weighted)\)/gi, '')
        .trim();
      const matched = selectableExercises.find(
        (e) => e.name.toLowerCase() === cleanName.toLowerCase() || e.id === cleanName.toLowerCase()
      );
      setSelectedExercise(cleanName);
      setSelectedExerciseId(matched?.id);
      setShowAllModal(false);
      setActiveTab('progress');
      triggerChartAnimation();
    },
    [selectableExercises, triggerChartAnimation]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Liste açıkken sayfa üzerinde dışarı dokunulduğunda listeyi kapatan tam sayfa katman */}
        {exerciseDropdownMounted && (
          <Pressable
            style={[StyleSheet.absoluteFill, { zIndex: 120 }]}
            onPress={() => closeExerciseDropdown()}
          />
        )}
        {/* ─── 1. Üst Başlık (Header - Ayarlar İkonu Olmadan) ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>Hypertrophy-X</Text>
            <Text style={styles.title}>İlerleme</Text>
          </View>
        </View>

        {/* ─── 2. Ana Sekmeler (Neon Mor Çerçeveli Butonlar) ─── */}
        <View style={styles.mainTabs}>
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('progress');
            }}
            style={({ pressed }) => [
              styles.mainTab,
              activeTab === 'progress' && styles.activeMainTab,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text
              style={[
                styles.mainTabText,
                activeTab === 'progress' && styles.activeMainTabText,
              ]}
              numberOfLines={1}
            >
              Grafik & İlerleme
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('records');
            }}
            style={({ pressed }) => [
              styles.mainTab,
              activeTab === 'records' && styles.activeMainTab,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text
              style={[
                styles.mainTabText,
                activeTab === 'records' && styles.activeMainTabText,
              ]}
              numberOfLines={1}
            >
              Kişisel Rekorlar
            </Text>
          </Pressable>
        </View>

        {activeTab === 'progress' ? (
          <>
            {/* ─── 3. En İyi İlerlemeler Bölümü (Görseldeki Birebir Yeni Tasarım) ─── */}
            <View style={styles.impSectionHeader}>
              <View style={styles.impSectionHeaderLeft}>
                <MultiBarChartIcon size={20} />
                <View style={styles.impSectionHeaderTextCol}>
                  <Text style={styles.impSectionTitle}>En iyi ilerlemeler</Text>
                  <Text style={styles.impSectionSubtitle}>
                    {"Son 6 güç artışın • 2'li gruplar halinde kaydır"}
                  </Text>
                </View>
              </View>

              {allImprovements.length > 0 && (
                <Pressable
                  style={styles.impPowerBadge}
                  onPress={() => setShowAllModal(true)}
                  hitSlop={6}
                >
                  <TrendingUpIcon size={12} color="#2DD4BF" />
                  <Text style={styles.impPowerBadgeText}>
                    {allImprovements.length} güç artışı
                  </Text>
                </Pressable>
              )}
            </View>

            {/* 2'li Grup Carousel veya Veri Yoksa Hata Uyarısı */}
            {allImprovements.length > 0 ? (
              <ImprovementCarousel
                items={allImprovements}
                pageWidth={contentWidth}
                onPressGraph={handleGraphLinkClick}
                onPressViewAll={() => setShowAllModal(true)}
              />
            ) : !loadTimedOut ? (
              <InstagramShimmerCards pageWidth={contentWidth} />
            ) : (
              <ConnectionErrorNotice onRetry={handleGlobalRetry} />
            )}

            {/* ─── 4. Egzersiz İlerleme Analizi Paneli (Başlık Kartın İçinde) ─── */}
            <View
              style={[
                styles.analysisCard,
                {
                  marginTop: 22,
                  zIndex: menuMounted || isExerciseDropdownOpen ? 200 : 1,
                  elevation: menuMounted || isExerciseDropdownOpen ? 10 : 1,
                },
              ]}
            >
              {/* Menü Açıkken Dışına Basınca Kapatan Şeffaf Katman */}
              {menuMounted && (
                <Pressable
                  style={styles.periodMenuBackdrop}
                  onPress={() => closePeriodMenu()}
                />
              )}

              {/* ─── Kart İçi Üst Başlık Satırı (Sol: Dumbbell + Pano Başlığı / Sağ: Neon Dönem Butonu) ─── */}
              <View style={styles.analysisCardTopRow}>
                <View style={styles.analysisCardTitleLeft}>
                  <View style={styles.analysisCardTitleIconWrap}>
                    <DumbbellIcon size={16} color="#C084FC" />
                  </View>
                  <Text style={styles.analysisCardTitle}>Egzersiz ilerleme analizi</Text>
                </View>

                {/* Sağ Üst Neon Dönem Butonu (Aylık / Yıllık / Genel) */}
                <View style={{ position: 'relative', zIndex: 210 }}>
                  <Pressable
                    style={[
                      styles.periodSelectBtn,
                      menuMounted && styles.periodSelectBtnActive,
                    ]}
                    onPress={togglePeriodMenu}
                    hitSlop={8}
                    accessibilityLabel="Dönem Seçimi Menüsü"
                  >
                    <Text style={styles.periodSelectBtnText}>{periodBadgeLabel}</Text>
                    <Animated.Text
                      style={[
                        styles.periodSelectChevron,
                        {
                          transform: [
                            {
                              rotate: menuAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0deg', '180deg'],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      ▾
                    </Animated.Text>
                  </Pressable>

                  {/* Butona Basıldığında Yumuşak Animasyonla Açılan / Kapanan Menü */}
                  {menuMounted && (
                    <Animated.View
                      style={[
                        styles.periodDropdownMenu,
                        {
                          opacity: menuAnim,
                          transform: [
                            {
                              scale: menuAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.88, 1],
                              }),
                            },
                            {
                              translateY: menuAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-6, 0],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {(['monthly', 'yearly', 'all'] as ProgressPeriod[]).map((p) => {
                        const label = p === 'monthly' ? 'Aylık' : p === 'yearly' ? 'Yıllık' : 'Genel';
                        const isSelected = period === p;
                        return (
                          <Pressable
                            key={p}
                            style={[
                              styles.periodDropdownItem,
                              isSelected && styles.periodDropdownItemActive,
                            ]}
                            onPress={() => {
                              handlePeriodChange(p);
                              closePeriodMenu();
                            }}
                          >
                            <Text
                              style={[
                                styles.periodDropdownItemText,
                                isSelected && styles.periodDropdownItemTextActive,
                              ]}
                            >
                              {label}
                            </Text>
                            {isSelected && <View style={styles.periodDropdownDot} />}
                          </Pressable>
                        );
                      })}
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* ─── Yenilenen Hareket Seçici: Arama Çubuğu & Hareket İsmi Aynı Yerde ─── */}
              <View
                style={styles.exerciseSelectorSection}
                pointerEvents={menuMounted ? 'none' : 'auto'}
              >
                <Pressable
                  style={[
                    styles.exerciseSearchBar,
                    exerciseDropdownMounted && styles.exerciseSearchBarActive,
                  ]}
                  onPress={handleBarPress}
                  hitSlop={4}
                  accessibilityLabel="Egzersiz Arama ve Seçici Çubuğu"
                >
                  {/* Başındaki Büyüteç İkonu */}
                  <View style={styles.exerciseSearchIconWrap}>
                    <SearchIcon size={16} color="#C084FC" />
                  </View>

                  {/* Hareket İsmi & Arama Girişi (Aynı Yerde - İlk dokunuşta liste açılır, ikinci dokunuşta arama açılır) */}
                  <View style={styles.exerciseSearchInputCol}>
                    <TextInput
                      ref={searchInputRef}
                      style={styles.exerciseBarInput}
                      value={isSearching ? exerciseSearchQuery : selectedExercise}
                      placeholder={isSearching ? 'Hareket ara...' : selectedExercise}
                      placeholderTextColor="#94A3B8"
                      editable={isSearching}
                      pointerEvents={isSearching ? 'auto' : 'none'}
                      onChangeText={(text) => {
                        setExerciseSearchQuery(text);
                      }}
                      autoCorrect={false}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Sağ Aksiyonlar: Temizle Butonu (Arama modunda) ve Aç/Kapat Oku */}
                  <View style={styles.exerciseSearchRightActions}>
                    {isSearching && (
                      <TouchableOpacity
                        onPress={() => {
                          if (exerciseSearchQuery.length > 0) {
                            setExerciseSearchQuery('');
                          } else {
                            setIsSearching(false);
                            searchInputRef.current?.blur();
                          }
                        }}
                        hitSlop={8}
                        style={styles.exerciseSearchClearBtn}
                      >
                        <Text style={styles.exerciseSearchClearText}>✕</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={toggleExerciseDropdown}
                      hitSlop={8}
                      style={styles.exerciseChevronWrap}
                      activeOpacity={0.7}
                    >
                      <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
                        <ChevronDownIcon size={14} color="#C084FC" />
                      </Animated.View>
                    </TouchableOpacity>
                  </View>
                </Pressable>
              </View>

              {/* Dışına basınca menüyü kapatan şeffaf arka plan */}
              {exerciseDropdownMounted && (
                <Pressable
                  style={styles.exerciseDropdownBackdrop}
                  onPress={() => closeExerciseDropdown()}
                />
              )}

              {/* Üzerine Basınca Açılan Liste: analysisCard'ın Doğrudan Çocuğu (Touch Bounds Kısıtı Yok) */}
              {exerciseDropdownMounted && (
                <Animated.View
                  style={[
                    styles.exerciseDropdownContainer,
                    {
                      opacity: exerciseDropdownAnim.interpolate({
                        inputRange: [0, 0.35, 1],
                        outputRange: [0, 0.85, 1],
                      }),
                      transform: [
                        {
                          translateY: exerciseDropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-26, 0],
                          }),
                        },
                        {
                          scaleY: exerciseDropdownAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.88, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <ScrollView
                    style={styles.exerciseDropdownScroll}
                    contentContainerStyle={styles.exerciseDropdownScrollContent}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    persistentScrollbar={true}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                    overScrollMode="always"
                  >
                    {totalMatchingExercises === 0 ? (
                      <View style={styles.exerciseEmptyWrap}>
                        <View style={styles.errorNoticeIconWrap}>
                          <AlertCircleIcon size={20} color="#F87171" />
                        </View>
                        <Text
                          style={[
                            styles.exerciseEmptyText,
                            {
                              color: '#FCA5A5',
                              textAlign: 'center',
                              marginTop: 4,
                              paddingHorizontal: 12,
                            },
                          ]}
                        >
                          {selectableExercises.length === 0
                            ? 'Veriler yüklenirken hata oluştu, lütfen bağlantınızı kontrol edin'
                            : 'Eşleşen hareket bulunamadı'}
                        </Text>
                        {selectableExercises.length === 0 && (
                          <TouchableOpacity
                            style={styles.errorNoticeRetryBtn}
                            onPress={handleGlobalRetry}
                          >
                            <Text style={styles.errorNoticeRetryText}>Tekrar Dene</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    ) : (
                      groupedExercises.map(({ group, items }) => (
                        <View key={`group-${group}`} style={styles.dropdownGroupSection}>
                          <View style={styles.dropdownGroupHeader}>
                            <View style={styles.dropdownGroupIndicator} />
                            <Text style={styles.dropdownGroupHeaderText}>{group.toUpperCase()}</Text>
                          </View>
                          {items.map((item) => (
                            <ExerciseDropdownRow
                              key={item.id || item.name}
                              item={item}
                              isSelected={
                                item.name.toLowerCase() === selectedExercise.toLowerCase() ||
                                (selectedExerciseId ? item.id === selectedExerciseId : false)
                              }
                              onSelect={handleSelectExercise}
                            />
                          ))}
                        </View>
                      ))
                    )}
                  </ScrollView>
                </Animated.View>
              )}

              {/* ─── Gösterge / Legend (Mor PR çizgisi & Yeşil Tekrar çizgisi) ─── */}
              {displayChartPoints.length > 0 && (
                <View style={styles.chartLegendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#6C63FF' }]} />
                    <Text style={styles.legendText}>En ağır set — Ağırlık (kg)</Text>
                  </View>
                  {metric === 'weight-reps' && (
                    <View style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
                      <Text style={styles.legendText}>Bu ağırlıktaki tekrar</Text>
                    </View>
                  )}
                </View>
              )}

              {/* ─── Yükleniyor / Boş Durum / Grafik Alanı ─── */}
              {isChartLoading && parsedChartSummaries.length === 0 ? (
                <View style={styles.chartLoadingContainer}>
                  <ActivityIndicator size="small" color="#C084FC" />
                  <Text style={styles.chartLoadingText}>Veriler PostgreSQL veri tabanından yükleniyor...</Text>
                </View>
              ) : isProgressError || (displayChartPoints.length === 0 && isExercisesError) ? (
                <View style={styles.chartEmptyContainer}>
                  <View style={styles.errorNoticeIconWrap}>
                    <AlertCircleIcon size={24} color="#F87171" />
                  </View>
                  <Text style={[styles.chartEmptyTitle, { color: '#FCA5A5' }]}>
                    Veriler yüklenirken hata oluştu
                  </Text>
                  <Text style={styles.chartEmptySubtitle}>
                    Lütfen bağlantınızı kontrol edin.
                  </Text>
                  <TouchableOpacity
                    style={[styles.errorNoticeRetryBtn, { marginTop: 12 }]}
                    onPress={handleGlobalRetry}
                  >
                    <Text style={styles.errorNoticeRetryText}>Tekrar Dene</Text>
                  </TouchableOpacity>
                </View>
              ) : displayChartPoints.length === 0 ? (
                <View style={styles.chartEmptyContainer}>
                  <View style={styles.chartEmptyIconWrap}>
                    <DumbbellIcon size={24} color="#C084FC" />
                  </View>
                  <Text style={styles.chartEmptyTitle}>Kayıtlı Seans Bulunamadı</Text>
                  <Text style={styles.chartEmptySubtitle}>
                    {selectedExercise} için veri tabanında henüz kayıtlı seans bulunmuyor. Yeni bir antrenman kaydettikçe ilerleme grafiğin burada otomatik olarak çizilecektir.
                  </Text>
                </View>
              ) : (
                <>
                  {/* ─── Sabit Y Eksenli ve Yatay Kaydırılabilir SVG Grafiği (HX Hüzme Dolum Efekti) ─── */}
                  <View
                    style={styles.chartWrapperContainer}
                    onLayout={handleChartLayout}
                  >
                    {/* Sol Sabit Ağırlık Y Ekseni */}
                    <View style={styles.fixedYAxisLeft}>
                      {yTicks.map((tick, idx) => (
                        <View
                          key={`ytick-left-${idx}`}
                          style={[styles.fixedTickLeftWrapper, { top: tick.y - 7 }]}
                        >
                          <Text style={styles.fixedTickLeftText}>
                            {tick.val} kg
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Yatay Kaydırılabilir SVG Çizgi Grafiği */}
                    <View
                      style={[
                        styles.chartHorizontalScrollView,
                        { overflow: 'hidden' },
                      ]}
                    >
                      <ScrollView
                        key={`chart-scroll-${period}-${selectedExercise}`}
                        ref={chartScrollRef}
                        horizontal
                        showsHorizontalScrollIndicator={isScrollable}
                        contentOffset={{ x: initialScrollX, y: 0 }}
                        contentContainerStyle={[
                          styles.chartHorizontalScrollContent,
                          !isScrollable && { width: availablePlotWidth },
                        ]}
                        style={{ flex: 1, height: 180 }}
                      >
                        <View style={{ width: svgWidth, height: chartHeight, position: 'relative' }}>
                          {/* ─── 1. VERİ SETİ KATMANI (Alan Gradyanı, Çizgiler, Noktalar) ─── */}
                          <Svg width={svgWidth} height={chartHeight} style={StyleSheet.absoluteFill}>
                            <Defs>
                              {/* Mor Alan Gradyanı */}
                              <LinearGradient id="purpleAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                <Stop offset="0%" stopColor="#6C63FF" stopOpacity="0.38" />
                                <Stop offset="70%" stopColor="#6C63FF" stopOpacity="0.06" />
                                <Stop offset="100%" stopColor="#6C63FF" stopOpacity="0.0" />
                              </LinearGradient>
                            </Defs>

                            {/* Mor Ağırlık Alan Gradyanı */}
                            {areaWeightPath ? (
                              <Path
                                d={areaWeightPath}
                                fill="url(#purpleAreaGrad)"
                              />
                            ) : null}

                            {/* Ağırlık Eğrisi (Mor Çizgi) */}
                            {smoothWeightPath ? (
                              <Path
                                d={smoothWeightPath}
                                stroke="#6C63FF"
                                strokeWidth={3}
                                fill="none"
                                strokeLinecap="round"
                              />
                            ) : null}

                            {/* Tekrar Eğrisi (Yeşil Çizgi - metric === 'weight-reps' durumunda) */}
                            {metric === 'weight-reps' && smoothRepsPath ? (
                              <Path
                                d={smoothRepsPath}
                                stroke="#22C55E"
                                strokeWidth={2.6}
                                fill="none"
                                strokeLinecap="round"
                              />
                            ) : null}

                            {/* Veri Noktaları (Nodes) */}
                            {weightPoints.map((pt, idx) => {
                              const isSelected = activePointIndex === idx;
                              const rPt = repsPoints[idx];

                              return (
                                <React.Fragment key={`node-group-${idx}`}>
                                  {/* Tekrar Noktası (Yeşil / Beyaz Çerçeveli - Seçiliyken büyüme) */}
                                  {metric === 'weight-reps' && rPt && (
                                    <Circle
                                      cx={rPt.x}
                                      cy={rPt.y}
                                      r={isSelected ? 6 : 4}
                                      fill="#22C55E"
                                      stroke="#FFFFFF"
                                      strokeWidth={isSelected ? 2.5 : 1.8}
                                    />
                                  )}

                                  {/* Ağırlık Noktası (Taban Daire) */}
                                  <Circle
                                    cx={pt.x}
                                    cy={pt.y}
                                    r={isSelected ? 6 : 4.5}
                                    fill={isSelected ? '#C084FC' : (metric === 'weight-reps' ? '#6C63FF' : '#22C55E')}
                                    stroke="#FFFFFF"
                                    strokeWidth={isSelected ? 2.5 : 1.8}
                                  />
                                </React.Fragment>
                              );
                            })}
                          </Svg>

                          {/* ─── 2. HÜZME SÜZÜLME MASKESİ (Mobilde ve Webde %100 Donanım Hızlandırmalı Açılma Perdesi) ─── */}
                          <Animated.View
                            pointerEvents="none"
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: svgWidth,
                              height: plotBottom + 2,
                              backgroundColor: '#101524',
                              transform: [
                                {
                                  translateY: hxBeamProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, -(plotBottom + 2)],
                                  }),
                                },
                              ],
                              opacity: hxBeamProgress.interpolate({
                                inputRange: [0, 0.98, 1],
                                outputRange: [1, 1, 0],
                              }),
                              zIndex: 6,
                            }}
                          />

                          {/* ─── 3. TABAN KATMAN: Izgara Çizgileri, Dikey Eksen ve Tarih Etiketleri (Maskenin Üstünde Her Zaman Net) ─── */}
                          <Svg width={svgWidth} height={chartHeight} pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 7 }]}>
                            {/* Yatay Kılavuz Çizgileri */}
                            {yTicks.map((tick, idx) => (
                              <Line
                                key={`grid-${idx}`}
                                x1={0}
                                y1={tick.y}
                                x2={svgWidth}
                                y2={tick.y}
                                stroke="rgba(255, 255, 255, 0.05)"
                                strokeWidth={1}
                                strokeDasharray="4 4"
                              />
                            ))}

                            {/* Sol Dikey Y Ekseni Çizgisi */}
                            <Line
                              x1={0}
                              y1={plotTop}
                              x2={0}
                              y2={plotBottom}
                              stroke="rgba(255, 255, 255, 0.12)"
                              strokeWidth={1}
                            />

                            {/* X Ekseni Tarih Etiketleri */}
                            {weightPoints.map((pt, idx) => (
                              <SvgText
                                key={`x-label-${idx}`}
                                x={pt.x}
                                y={chartHeight - 8}
                                fill={activePointIndex === idx ? '#FFFFFF' : '#8E8E93'}
                                fontSize="10"
                                fontWeight={activePointIndex === idx ? '700' : '500'}
                                textAnchor="middle"
                              >
                                {pt.label}
                              </SvgText>
                            ))}
                          </Svg>

                          {/* ─── 4. GRAFİK HÜZME IŞIN TARAMA KATMANI (ALT BÖLÜM 17.3: KANVAS LAZER HÜZMESİ) ─── */}
                          <Animated.View
                            pointerEvents="none"
                            style={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: svgWidth,
                              height: 92,
                              transform: [
                                {
                                  translateY: hxBeamProgress.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [plotBottom - 46, -46],
                                  }),
                                },
                              ],
                              opacity: hxBeamOpacity,
                              zIndex: 15,
                            }}
                          >
                            <Svg width={svgWidth} height={92}>
                              <Defs>
                                <LinearGradient id="hxBeamGlowGrad" x1="0" y1="0" x2="0" y2="1">
                                  <Stop offset="0%" stopColor="#6C63FF" stopOpacity="0" />
                                  <Stop offset="36%" stopColor="#6C63FF" stopOpacity="0.06" />
                                  <Stop offset="48%" stopColor="#8B5CF6" stopOpacity="0.25" />
                                  <Stop offset="50%" stopColor="#C084FC" stopOpacity="0.45" />
                                  <Stop offset="52%" stopColor="#8B5CF6" stopOpacity="0.25" />
                                  <Stop offset="64%" stopColor="#6C63FF" stopOpacity="0.08" />
                                  <Stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
                                </LinearGradient>
                              </Defs>
                              {/* 92px Genişliğinde Dikey Yumuşak Işıma Gradyanı */}
                              <Rect x={0} y={0} width={svgWidth} height={92} fill="url(#hxBeamGlowGrad)" />
                              {/* İnce Parlak Hüzme Odak Çizgisi */}
                              <Line
                                x1={0}
                                y1={46}
                                x2={svgWidth}
                                y2={46}
                                stroke="#F3E8FF"
                                strokeWidth={1.5}
                                strokeOpacity={0.85}
                              />
                              {/* Dış Yayılımlı Neon Lazer Hüzmesi */}
                              <Line
                                x1={0}
                                y1={46}
                                x2={svgWidth}
                                y2={46}
                                stroke="#C084FC"
                                strokeWidth={4}
                                strokeOpacity={0.35}
                              />
                            </Svg>
                          </Animated.View>

                          {/* Seçili Node Dikey Çizgisi ve Parlayan Halka Animasyonu (Yumuşak Yay & Opaklık) */}
                          {activePointIndex !== null && weightPoints[activePointIndex] && (() => {
                            const curPt = weightPoints[activePointIndex];
                            const curRPt = repsPoints[activePointIndex];
                            // Dikey çizgi tepe noktası: Eğer tekrar ile birlikte gösteriliyorsa tekrarın noduna kadar uzansın, onu geçmesin!
                            const lineTopY = (metric === 'weight-reps' && curRPt) ? Math.min(curRPt.y, curPt.y) : curPt.y;
                            const lineHeight = Math.max(0, plotBottom - lineTopY);

                            return (
                              <View
                                pointerEvents="none"
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: 0,
                                  width: svgWidth,
                                  height: chartHeight,
                                  zIndex: 10,
                                }}
                              >
                                {/* Yumuşak Süzülen Dikey Kılavuz Çizgisi (Tekrar nodunu geçmez) */}
                                <Animated.View
                                  style={{
                                    position: 'absolute',
                                    left: curPt.x - 0.75,
                                    top: lineTopY,
                                    width: 1.5,
                                    height: lineHeight,
                                    borderStyle: 'dashed',
                                    borderLeftWidth: 1.5,
                                    borderLeftColor: 'rgba(192, 132, 252, 0.55)',
                                    opacity: nodePanoAnim,
                                  }}
                                />

                                {/* Ağırlık / Kilo Nodu: Yumuşak Yay ile Genişleyen Dış Parlayan Neon Mor Halka */}
                                <Animated.View
                                  style={{
                                    position: 'absolute',
                                    left: curPt.x - 14,
                                    top: curPt.y - 14,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: 'rgba(192, 132, 252, 0.22)',
                                    borderWidth: 2,
                                    borderColor: '#C084FC',
                                    transform: [{ scale: nodePulseAnim }],
                                    opacity: nodePanoAnim,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  <View
                                    style={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: 4,
                                      backgroundColor: '#FFFFFF',
                                      shadowColor: '#C084FC',
                                      shadowOffset: { width: 0, height: 0 },
                                      shadowOpacity: 0.9,
                                      shadowRadius: 5,
                                    }}
                                  />
                                </Animated.View>

                                {/* Tekrar Nodu: Kilo nodu seçiliykenki görünümün aynısı (Yeşil Neon Halka + Beyaz Merkez Nokta) */}
                                {metric === 'weight-reps' && curRPt && (
                                  <Animated.View
                                    style={{
                                      position: 'absolute',
                                      left: curRPt.x - 14,
                                      top: curRPt.y - 14,
                                      width: 28,
                                      height: 28,
                                      borderRadius: 14,
                                      backgroundColor: 'rgba(34, 197, 94, 0.22)',
                                      borderWidth: 2,
                                      borderColor: '#22C55E',
                                      transform: [{ scale: nodePulseAnim }],
                                      opacity: nodePanoAnim,
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <View
                                      style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 4,
                                        backgroundColor: '#FFFFFF',
                                        shadowColor: '#22C55E',
                                        shadowOffset: { width: 0, height: 0 },
                                        shadowOpacity: 0.9,
                                        shadowRadius: 5,
                                      }}
                                    />
                                  </Animated.View>
                                )}
                              </View>
                            );
                          })()}

                          {/* Dokunma Katmanı (Hem Web hem Mobilde %100 Uyumlu Pressable) */}
                          {weightPoints.map((pt, idx) => (
                            <Pressable
                              key={`touch-col-${idx}`}
                              style={{
                                position: 'absolute',
                                left: Math.max(0, pt.x - 24),
                                top: 0,
                                width: 48,
                                height: chartHeight,
                                zIndex: 20,
                              }}
                              hitSlop={6}
                              onPress={() => {
                                setSelectedPointIndex(idx);
                                triggerNodeSelectAnimation();
                              }}
                            />
                          ))}
                        </View>
                      </ScrollView>
                    </View>

                    {/* Sağ Sabit Tekrar Y Ekseni (metric === 'weight-reps' aktifken) */}
                    {metric === 'weight-reps' && (
                      <View style={styles.fixedYAxisRight}>
                        {yRepsTicks.map((tick, idx) => (
                          <View
                            key={`ytick-right-${idx}`}
                            style={[styles.fixedTickRightWrapper, { top: tick.y - 7 }]}
                          >
                            <Text style={styles.fixedTickRightText}>
                              {tick.val}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {/* ─── Node Detay Panosu (Seçili Günün PR, Tekrar ve Tüm Setleri - Yumuşak Süzülme Animasyonu) ─── */}
                  {selectedPointDetails && (
                    <Animated.View
                      key={`node-pano-${activePointIndex}-${nodeSelectCount}`}
                      style={[
                        styles.nodeDetailPano,
                        {
                          opacity: nodePanoAnim,
                          transform: [
                            {
                              translateY: nodePanoAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [28, 0],
                              }),
                            },
                            {
                              scale: nodePanoAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.94, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      {/* Pano Üst Başlık & Seans Sayısı Rozeti */}
                      <View style={styles.panoHeaderRow}>
                        <View style={styles.panoDateWrapper}>
                          <CalendarIcon size={16} color={C.violet} />
                          <Text style={styles.panoDateText}>
                            {selectedPointDetails.dateStr}
                          </Text>
                        </View>
                        <View style={styles.panoSetsBadge}>
                          <Text style={styles.panoSetsBadgeText}>
                            {parsedChartSummaries.length} Seans
                          </Text>
                        </View>
                      </View>

                      {/* İki Önemli Metrik Kartı: PR Ağırlık ve Tekrar (İkonlu) */}
                      <View style={styles.panoStatsRow}>
                        <View style={[styles.panoStatCard, styles.panoStatCardPurple]}>
                          <View style={styles.panoStatIconWrapPurple}>
                            <DumbbellIcon size={20} color="#C084FC" />
                          </View>
                          <View style={styles.panoStatTextCol}>
                            <Text numberOfLines={1} style={styles.panoStatLabel}>En Ağır Set</Text>
                            <Text numberOfLines={1} style={styles.panoStatValuePurple}>
                              {selectedPointDetails.weight}{' '}
                              <Text style={styles.panoStatUnitPurple}>kg</Text>
                            </Text>
                          </View>
                        </View>

                        <View style={[styles.panoStatCard, styles.panoStatCardGreen]}>
                          <View style={styles.panoStatIconWrapGreen}>
                            <RepeatIcon size={20} color="#34D399" />
                          </View>
                          <View style={styles.panoStatTextCol}>
                            <Text numberOfLines={1} style={styles.panoStatLabel}>Max Tekrar</Text>
                            <Text numberOfLines={1} style={styles.panoStatValueGreen}>
                              {selectedPointDetails.reps}{' '}
                              <Text style={styles.panoStatUnitGreen}>tekrar</Text>
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Günün Tüm Setleri Dökümü (Dikey Satırlar) */}
                      <View style={styles.panoSetsSection}>
                        <Text style={styles.panoSetsSectionTitle}>Setler</Text>
                        <View style={styles.panoSetsList}>
                          {selectedPointDetails.sets.map((s) => {
                            const isPr =
                              s.weight === selectedPointDetails.weight &&
                              s.reps === selectedPointDetails.reps;
                            return (
                              <View
                                key={s.set}
                                style={[styles.panoSetRow, isPr && styles.panoSetRowPr]}
                              >
                                <View style={[styles.panoSetCircle, isPr && styles.panoSetCirclePr]}>
                                  <Text style={[styles.panoSetCircleText, isPr && styles.panoSetCircleTextPr]}>
                                    {s.set}
                                  </Text>
                                </View>
                                <View style={styles.panoSetValuesRow}>
                                  <Text style={styles.panoSetWeightText}>{s.weight} kg</Text>
                                  <Text style={styles.panoSetMultiplyText}> × </Text>
                                  <Text style={styles.panoSetRepsText}>{s.reps} tekrar</Text>
                                </View>
                                {isPr && (
                                  <View style={styles.panoPrTag}>
                                    <Text style={styles.panoPrTagText}>PR</Text>
                                  </View>
                                )}
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </>
              )}

              {/* ─── Kart Alt Bölümü: "Ağırlık + Tekrar" Butonu ─── */}
              {displayChartPoints.length > 0 && (
                <View style={styles.analysisBottomRow}>
                  <Pressable
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setMetric((prev) => (prev === 'weight' ? 'weight-reps' : 'weight'));
                      triggerChartAnimation();
                    }}
                    style={styles.weightRepsBtnWrapper}
                    hitSlop={6}
                  >
                    {metric === 'weight-reps' && (
                      <View style={styles.weightRepsBtnBacklight} pointerEvents="none" />
                    )}
                    <View
                      style={[
                        styles.weightRepsBtn,
                        metric === 'weight-reps'
                          ? styles.weightRepsBtnActive
                          : styles.weightRepsBtnInactive,
                      ]}
                    >
                      <BarChartIcon
                        size={18}
                        color={metric === 'weight-reps' ? '#34D399' : '#8E8E93'}
                      />
                      <Text
                        style={[
                          styles.weightRepsBtnText,
                          metric === 'weight-reps'
                            ? styles.weightRepsBtnTextActive
                            : styles.weightRepsBtnTextInactive,
                        ]}
                      >
                        Ağırlık + Tekrar
                      </Text>
                      <ChevronRightIcon
                        size={15}
                        color={metric === 'weight-reps' ? '#34D399' : '#8E8E93'}
                      />
                    </View>
                  </Pressable>
                </View>
              )}
            </View>
          </>
        ) : (
          /* ─── 5. Kişisel Rekorlar (PR) Bölümü (Web Platformu Tarzında Tablo) ─── */
          <View style={{ marginTop: 8 }}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Kişisel Rekorlar</Text>
                <Text style={styles.sectionSubtitle}>En iyi derecelerin</Text>
              </View>
              {personalRecords.length > 0 && (
                <View style={styles.badgeSuccess}>
                  <Text style={styles.badgeSuccessText}>
                    ● {personalRecords.length} rekor
                  </Text>
                </View>
              )}
            </View>

            {prGroups.length > 0 ? (
              <>
                {/* Tablo Sütun Başlıkları */}
                <View style={styles.tableHeaderRow}>
                  <Text style={[styles.tableColHeader, { flex: 1 }]}>HAREKET & TARİH</Text>
                  <Text style={[styles.tableColHeader, { width: 72, textAlign: 'right' }]}>AĞIRLIK</Text>
                  <Text style={[styles.tableColHeader, { width: 64, textAlign: 'right' }]}>TEKRAR</Text>
                </View>

                {/* Gruplandırılmış Tablo (Başlıklara Basıldığında Kendi Satırlarını Kapatır) */}
                {prGroups.map((group) => {
                  const isCollapsed = Boolean(collapsedPrGroups[group.title]);
                  return (
                    <View key={group.title} style={styles.prGroupWrapper}>
                      {/* Web Tarzı Neon / Renkli Bölüm Başlığı (Açıp/Kapatılabilir) */}
                      <Pressable
                        style={[
                          styles.prGroupBanner,
                          {
                            backgroundColor: group.badgeBg,
                            borderLeftColor: group.borderColor,
                          },
                        ]}
                        onPress={() => togglePrGroup(group.title)}
                      >
                        <Text
                          numberOfLines={1}
                          style={[styles.prGroupBannerText, { color: group.textColor, flex: 1 }]}
                        >
                          {group.title}
                        </Text>
                        <Text style={[styles.prGroupChevron, { color: group.textColor }]}>
                          {isCollapsed ? '⌄' : '⌃'}
                        </Text>
                      </Pressable>

                      {/* Tablo Satırları (Kapatıldığında Gizlenir) */}
                      {!isCollapsed && (
                        <View style={styles.prTableContainer}>
                          {group.items.map((record, index) => (
                            <Pressable
                              key={record.name}
                              style={[
                                styles.prTableRow,
                                index === group.items.length - 1 && { borderBottomWidth: 0 },
                              ]}
                              onPress={() => handleGraphLinkClick(record.name)}
                            >
                              {/* Hareket Adı (Gerekirse Kısaltılmış) & Altında Oluşturulma Tarihi */}
                              <View style={{ flex: 1, paddingRight: 8 }}>
                                <Text numberOfLines={1} style={styles.prExerciseName}>
                                  {abbreviateExerciseName(record.name)}
                                </Text>
                                <Text style={styles.prDateAndMuscleText}>
                                  {record.date} · {record.muscle}
                                </Text>
                              </View>

                              {/* Ağırlık Sütunu */}
                              <View style={styles.prWeightCol}>
                                <Text style={styles.prWeightValue}>{record.weight}</Text>
                              </View>

                              {/* Tekrar Sütunu */}
                              <View style={styles.prRepsCol}>
                                <Text style={styles.prRepsValue}>{record.reps}</Text>
                              </View>
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}
              </>
            ) : !loadTimedOut ? (
              <PersonalRecordsShimmer />
            ) : (
              <ConnectionErrorNotice onRetry={handleGlobalRetry} />
            )}
          </View>
        )}
      </ScrollView>

      {/* ─── 6. TÜM İLERLEMELER MODAL PANELİ (Sürükle-Bırak & Yüksek Akışlı) ─── */}
      <AllImprovementsBottomSheetModal
        visible={showAllModal}
        onClose={() => setShowAllModal(false)}
        pairedImprovements={pairedImprovements}
        onPressGraph={handleGraphLinkClick}
        onRetry={handleGlobalRetry}
        timedOut={loadTimedOut}
      />

      {/* ─── 7. EGZERSİZ SEÇİMİ MODAL PANELİ ─── */}
      <Modal
        visible={showExerciseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowExerciseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdropTap}
            onPress={() => setShowExerciseModal(false)}
          />
          <View style={[styles.modalSheet, { height: '65%' }]}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOverline}>İlerleme Analizi</Text>
                <Text style={styles.modalTitle}>Egzersiz Seç</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButtonRed}
                onPress={() => setShowExerciseModal(false)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Egzersiz Arama Çubuğu */}
            <View style={styles.exerciseSearchBox}>
              <SearchIcon size={16} color={C.muted} />
              <TextInput
                placeholder="Egzersiz ara..."
                placeholderTextColor={C.muted}
                value={exerciseSearchQuery}
                onChangeText={setExerciseSearchQuery}
                style={styles.exerciseSearchInput}
              />
            </View>

            {/* Egzersiz Listesi */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
              keyboardShouldPersistTaps="handled"
            >
              {filteredExercises.length === 0 ? (
                <ConnectionErrorNotice onRetry={handleGlobalRetry} />
              ) : (
                filteredExercises.map((item) => {
                  const isCurrent = item.name.toLowerCase() === selectedExercise.toLowerCase();
                  return (
                    <Pressable
                      key={item.id || item.name}
                      onPress={() => handleSelectExerciseFromModal(item.name)}
                      style={[
                        styles.exerciseListItem,
                        isCurrent && styles.exerciseListItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.exerciseListItemText,
                          isCurrent && styles.exerciseListItemTextActive,
                        ]}
                      >
                        {item.name}
                      </Text>
                      {isCurrent && <Text style={{ color: C.violet, fontSize: 13 }}>✓</Text>}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>

            {/* Sonsuz Alt Uzantı Eteği */}
            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Stiller ───
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
  },

  /* ─── Header (Ayarlar İkonu Olmadan) ─── */
  header: {
    marginTop: 6,
    marginBottom: 16,
  },
  overline: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    color: C.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 3,
  },

  /* ─── Ana Sekmeler (Neon Mor Çerçeveli Butonlar) ─── */
  mainTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.40)',
    backgroundColor: 'rgba(168, 85, 247, 0.06)',
  },
  activeMainTab: {
    borderColor: '#C084FC',
    borderWidth: 1.8,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 6,
  },
  mainTabText: {
    color: '#D8B4FE',
    fontSize: 12.5,
    fontWeight: '700',
  },
  activeMainTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* ─── Bölüm Başlıkları ─── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
  badgeSuccess: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(67, 214, 173, 0.35)',
    backgroundColor: 'rgba(67, 214, 173, 0.1)',
  },
  badgeSuccessText: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '700',
  },

  /* ─── 2'li Carousel ─── */
  carouselPage: {
    flexDirection: 'row',
    gap: 9,
  },
  carouselCol: {
    flex: 1,
  },
  carouselDotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  carouselDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  carouselDotActive: {
    width: 22,
    backgroundColor: '#8B5CF6',
  },
  carouselFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    position: 'relative',
    minHeight: 26,
  },
  carouselDotsCenterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  carouselViewAllLink: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  carouselViewAllText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },

  /* ─── Yeni En İyi İlerlemeler (Modern Neon Tasarım - Taşmasız Kompakt Boyutlar) ─── */
  impSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  impSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  impSectionHeaderTextCol: {
    flex: 1,
  },
  impSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.2,
  },
  impSectionSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  impPowerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(20, 184, 166, 0.4)',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  impPowerBadgeText: {
    color: '#2DD4BF',
    fontSize: 11,
    fontWeight: '800',
  },
  improvementCardModern: {
    flex: 1,
    minHeight: 124,
    backgroundColor: '#0E1426',
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 2,
  },
  impCardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginBottom: 6,
  },
  impCardIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  impCardExerciseTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 14.5,
  },
  impCardMuscleBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  impCardMuscleBadgeText: {
    color: '#C084FC',
    fontSize: 8.5,
    fontWeight: '700',
  },
  impCardMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginVertical: 4,
  },
  impCardValueText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  impCardArrow: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
    marginHorizontal: 1,
  },
  impCardChangePill: {
    backgroundColor: 'rgba(20, 184, 166, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.35)',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1.5,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  impCardChangePillText: {
    color: '#2DD4BF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  impCardSparklineWrap: {
    marginVertical: 2,
    width: '100%',
    height: 28,
  },
  impCardBottomRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  impCardDatesText: {
    color: '#94A3B8',
    fontSize: 8.5,
    fontWeight: '600',
    letterSpacing: -0.15,
  },

  /* ─── Eski Sınıflar İçin Güvenlik Geriye Uyumluluğu ─── */
  improvement: {
    flex: 1,
    minHeight: 120,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: C.surface,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 4,
  },
  cardExerciseName: {
    color: C.text,
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    lineHeight: 15,
  },
  cardMuscleBadge: {
    color: C.violet,
    fontSize: 8.5,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.14)',
  },
  cardMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 8,
  },
  cardFromVal: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
  },
  cardArrow: {
    color: C.muted,
    fontSize: 11,
  },
  cardToVal: {
    color: C.text,
    fontSize: 13,
    fontWeight: '700',
  },
  cardChangeBadge: {
    color: C.mint,
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 'auto',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(67, 214, 173, 0.15)',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDates: {
    color: C.muted,
    fontSize: 8.5,
    fontWeight: '600',
  },
  cardGraphLink: {
    color: C.cyan,
    fontSize: 9.5,
    fontWeight: '700',
  },
  viewAllButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.08)',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  viewAllButtonText: {
    color: C.violet,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ─── Yeni Egzersiz İlerleme Analizi Kartı (Referans Tasarıma Birebir Uygun) ─── */
  analysisCard: {
    backgroundColor: '#101524',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginTop: 6,
    position: 'relative',
    overflow: 'visible',
  },
  periodMenuBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 190,
  },
  analysisCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    zIndex: 200,
  },
  analysisCardTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  analysisCardTitleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: 'rgba(192, 132, 252, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analysisCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },

  /* ─── Yenilenen Hareket Seçici: Arama Çubuğu & Hareket İsmi Aynı Yerde ─── */
  exerciseSelectorSection: {
    marginBottom: 10,
    zIndex: 160,
    position: 'relative',
  },
  exerciseDropdownBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 145,
  },
  exerciseSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.2,
    borderColor: 'rgba(192, 132, 252, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
    zIndex: 140,
  },
  exerciseSearchBarActive: {
    borderColor: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
  },
  exerciseSearchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 132, 252, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  exerciseSearchInputCol: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseBarInput: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
  },
  exerciseSearchRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  exerciseSearchClearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseSearchClearText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '800',
  },
  exerciseChevronWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseDropdownContainer: {
    position: 'absolute',
    top: 112,
    left: 12,
    right: 12,
    maxHeight: 260,
    backgroundColor: '#0D1120',
    borderWidth: 1.2,
    borderColor: 'rgba(192, 132, 252, 0.40)',
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 16,
    elevation: 30,
    zIndex: 150,
  },
  exerciseDropdownScroll: {
    maxHeight: 248,
    ...(Platform.OS === 'web' ? { overflowY: 'auto' as const } : {}),
  },
  exerciseDropdownScrollContent: {
    paddingBottom: 8,
  },
  dropdownGroupSection: {
    marginBottom: 6,
  },
  dropdownGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 4,
  },
  dropdownGroupIndicator: {
    width: 3,
    height: 10,
    borderRadius: 1.5,
    backgroundColor: '#C084FC',
  },
  dropdownGroupHeaderText: {
    color: '#C084FC',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  exerciseDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 2,
  },
  exerciseDropdownItemActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.16)',
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  dropdownBwBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  dropdownBwBadgeText: {
    color: '#FBBF24',
    fontSize: 8.5,
    fontWeight: '700',
  },
  dropdownWeightedBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.35)',
  },
  dropdownWeightedBadgeText: {
    color: '#60A5FA',
    fontSize: 8.5,
    fontWeight: '700',
  },
  exerciseDropdownItemText: {
    color: '#CBD5E1',
    fontSize: 13.5,
    fontWeight: '600',
    flexShrink: 1,
  },
  exerciseDropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  exerciseDropdownCheckWrap: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  exerciseDropdownCheckText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  exerciseEmptyWrap: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  exerciseEmptyText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  periodSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    borderWidth: 1.2,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  periodSelectBtnActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.22)',
    borderColor: '#C084FC',
  },
  periodSelectBtnText: {
    color: '#C084FC',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  periodSelectChevron: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 2,
  },
  periodDropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#0F1528',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.45)',
    padding: 6,
    minWidth: 120,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.65,
    shadowRadius: 14,
    elevation: 25,
    zIndex: 250,
  },
  periodDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  periodDropdownItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  periodDropdownItemText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  periodDropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  periodDropdownDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C084FC',
  },
  chartLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
    marginTop: 2,
    paddingLeft: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  /* ─── Yükleniyor & Boş Durum ─── */
  chartLoadingContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  chartLoadingText: {
    fontSize: 12.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  chartEmptyContainer: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartEmptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.25)',
  },
  chartEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
    textAlign: 'center',
  },
  chartEmptySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  },
  /* ─── Grafik Sabit Eksenler & Yatay Scroll Alanı ─── */
  chartWrapperContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginVertical: 6,
    height: 180,
  },
  fixedYAxisLeft: {
    width: 32,
    height: 180,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  fixedTickLeftWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  fixedTickLeftText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8995B2',
    textAlign: 'left',
  },
  chartHorizontalScrollView: {
    flex: 1,
    height: 180,
  },
  chartHorizontalScrollContent: {
    alignItems: 'center',
  },
  fixedYAxisRight: {
    width: 22,
    height: 180,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  fixedTickRightWrapper: {
    position: 'absolute',
    left: 2,
    right: 0,
  },
  fixedTickRightText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
    textAlign: 'left',
  },

  /* ─── Node Detay Panosu (2. Fotoğraftaki Gibi Modern Kart Tasarımı) ─── */
  nodeDetailPano: {
    marginTop: 12,
    marginBottom: 6,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#0F1528',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.28)',
  },
  panoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  panoDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  panoDateText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  panoSetsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 99, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.35)',
  },
  panoSetsBadgeText: {
    color: '#C4B5FD',
    fontSize: 12,
    fontWeight: '800',
  },
  panoStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  panoStatCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  panoStatCardPurple: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderColor: 'rgba(108, 99, 255, 0.25)',
  },
  panoStatCardGreen: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderColor: 'rgba(34, 197, 94, 0.22)',
  },
  panoStatIconWrapPurple: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panoStatIconWrapGreen: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panoStatTextCol: {
    flex: 1,
    gap: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  panoStatLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  panoStatValuePurple: {
    fontSize: 16,
    fontWeight: '900',
    color: '#C084FC',
  },
  panoStatUnitPurple: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
  },
  panoStatValueGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: '#34D399',
  },
  panoStatUnitGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34D399',
  },
  panoSetsSection: {
    paddingTop: 4,
  },
  panoSetsSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 8,
  },
  panoSetsList: {
    gap: 8,
  },
  panoSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 12,
  },
  panoSetRowPr: {
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    borderColor: 'rgba(108, 99, 255, 0.25)',
  },
  panoSetCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 99, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.35)',
  },
  panoSetCirclePr: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  panoSetCircleText: {
    color: '#C4B5FD',
    fontSize: 12.5,
    fontWeight: '800',
  },
  panoSetCircleTextPr: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  panoSetValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  panoSetWeightText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  panoSetMultiplyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginHorizontal: 10,
  },
  panoSetRepsText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34D399',
  },
  panoPrTag: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  panoPrTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  analysisBottomRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
  },
  weightRepsBtnWrapper: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weightRepsBtnBacklight: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    left: -2,
    right: -2,
    borderRadius: 18,
    backgroundColor: 'rgba(16, 185, 129, 0.22)',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 8,
  },
  weightRepsBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.2,
  },
  weightRepsBtnInactive: {
    backgroundColor: '#161E33',
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  weightRepsBtnActive: {
    backgroundColor: '#132A20',
    borderColor: 'rgba(52, 211, 153, 0.50)',
  },
  weightRepsBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  weightRepsBtnTextInactive: {
    color: '#8E8E93',
  },
  weightRepsBtnTextActive: {
    color: '#34D399',
  },

  /* ─── Kişisel Rekorlar Sekmesi (Web Platformu Tarzında Tablo) ─── */
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 4,
  },
  tableColHeader: {
    color: C.muted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  prGroupWrapper: {
    marginBottom: 12,
  },
  prGroupBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 4,
    borderRadius: 6,
    marginBottom: 4,
  },
  prGroupBannerText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  prGroupChevron: {
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 6,
  },
  prTableContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: C.surface,
    overflow: 'hidden',
  },
  prTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  prExerciseName: {
    color: C.text,
    fontSize: 12.5,
    fontWeight: '700',
  },
  prDateAndMuscleText: {
    color: C.muted,
    fontSize: 9.5,
    marginTop: 2,
    fontWeight: '500',
  },
  prWeightCol: {
    width: 72,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  prWeightValue: {
    color: C.mint,
    fontSize: 12.5,
    fontWeight: '800',
  },
  prRepsCol: {
    width: 64,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  prRepsValue: {
    color: C.cyan,
    fontSize: 12,
    fontWeight: '700',
  },

  /* ─── Modal / Panel (Hafif Bulanık Arka Plan, Alt Tabaka Görünür, Yeni Sayfa Hissi Yok) ─── */
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 11, 24, 0.55)',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as any) : {}),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 11, 24, 0.45)',
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(8px)' } as any) : {}),
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopColor: C.violet,
    height: '74%',
    shadowColor: C.primaryDeep,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetBottomExtension: {
    position: 'absolute',
    bottom: -1000,
    left: -1.5,
    right: -1.5,
    height: 1000,
    backgroundColor: '#0C101C',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  modalDragZone: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  modalDragHandleZone: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.violet,
    shadowColor: C.violet,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  modalHeaderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverline: {
    color: C.violet,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalTitle: {
    color: C.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: C.muted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButtonRed: {
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
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },

  /* ─── Modal İçi Kesin 2'li Gruplar (Yan Yana 2 Kolon) ─── */
  modalCardRow: {
    flexDirection: 'row',
    gap: 9,
    marginBottom: 9,
    width: '100%',
  },
  modalCardCol: {
    flex: 1,
  },

  /* ─── Egzersiz Seçici Modal İçi ─── */
  exerciseSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
  },
  exerciseSearchInput: {
    flex: 1,
    color: C.text,
    fontSize: 13,
  },
  exerciseListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  exerciseListItemActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
  },
  exerciseListItemText: {
    color: C.text,
    fontSize: 13,
    fontWeight: '600',
  },
  exerciseListItemTextActive: {
    color: C.violet,
    fontWeight: '700',
  },

  /* ─── Instagram Explore Reels Stili Shimmer İskelet Stilleri ─── */
  shimmerCardContainer: {
    backgroundColor: '#12182B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
    height: 148,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  shimmerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shimmerMusclePill: {
    width: 48,
    height: 17,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  shimmerTitleBar: {
    flex: 1,
    height: 13,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  shimmerValuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  shimmerValueBlock: {
    width: 38,
    height: 13,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  shimmerArrow: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 12,
  },
  shimmerChangePill: {
    width: 36,
    height: 16,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  shimmerWavePlaceholder: {
    width: '100%',
    height: 26,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 4,
  },
  shimmerDateBar: {
    width: 65,
    height: 9,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  shimmerLightBeam: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 160,
  },
  shimmerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    marginBottom: 4,
  },
  shimmerStatusText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  prShimmerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
    position: 'relative',
    gap: 12,
  },
  prShimmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },

  /* ─── Bağlantı Hatası / Veri Yok Bildirimi Stilleri ─── */
  errorNoticeBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.28)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 8,
  },
  errorNoticeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  errorNoticeText: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorNoticeRetryBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  errorNoticeRetryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
