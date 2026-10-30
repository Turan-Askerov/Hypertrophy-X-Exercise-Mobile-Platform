import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  LayoutAnimation,
  LayoutChangeEvent,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { useNutrition } from '@/hooks/use-nutrition';
import { useUser } from '@/hooks/use-user';

// Android için donanım hızlandırmalı LayoutAnimation etkinleştirme
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Yumuşak, düzgün geçiş konfigürasyonu (Yay/salınım olmadan tek süzülme)
const smoothTransition = () => {
  try {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  } catch {
    // LayoutAnimation hata verirse sessizce devam et
  }
};

// ─── Renk Token'ları (Geçmiş Sayfası ile Uyumlu Cyber Dark) ───
const colors = {
  background: '#080B14',
  surface: '#101524',
  surfaceAlt: '#0F1528',
  inputCardBg: '#101524',
  inputBackground: '#161E33',
  border: 'rgba(255, 255, 255, 0.08)',
  borderSoft: 'rgba(255, 255, 255, 0.06)',
  text: '#F8FAFC',
  muted: '#94A3B8',
  textDim: '#64748B',
  violet: '#C084FC', // Kalori & Ana Vurgu (Geçmiş sayfası mor tonu)
  purpleBg: 'rgba(192, 132, 252, 0.12)',
  purpleBorder: 'rgba(192, 132, 252, 0.3)',
  mint: '#34D399',   // Protein (Geçmiş weightGreen rozet tonu)
  orange: '#FBBF24', // Karbonhidrat (Geçmiş rirAmber tonu)
  cyan: '#38BDF8',   // Yağ (Geçmiş repsBlue cyan tonu)
  rose: '#FB7185',   // Protein (Vurgu)
  danger: '#EF4444', // Hata / Aşım
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.28)',
  blue: '#38BDF8',   // Kalori İlerleme
};

// ─── Metrik Yapılandırması ───
type MetricKey = 'calories' | 'protein' | 'carbs' | 'fat';

const METRICS: Record<
  MetricKey,
  {
    label: string;
    unit: string;
    color: string;
    key: MetricKey;
  }
> = {
  calories: {
    label: 'Ort. Kalori 🔥',
    unit: 'Kcal',
    color: '#C084FC',
    key: 'calories',
  },
  protein: {
    label: 'Ort. Protein 🥩',
    unit: 'g',
    color: '#FB7185',
    key: 'protein',
  },
  carbs: {
    label: 'Ort. Karbonhidrat 🍞',
    unit: 'g',
    color: '#FFAD21',
    key: 'carbs',
  },
  fat: {
    label: 'Ort. Yağ 🥑',
    unit: 'g',
    color: '#38BDF8',
    key: 'fat',
  },
};

const CHART_HEIGHT = 160;

// ─── SVG İkonları ───

function ChevronDownIcon({ size = 16, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
    </Svg>
  );
}

function LightningIcon({ size = 14, color = '#F59E0B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function CalendarIcon({ size = 18, color = colors.violet }: { size?: number; color?: string }) {
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

function CloseIcon({ size = 16, color = colors.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 6L6 18M6 6l12 12" />
    </Svg>
  );
}

function FlameIcon({ size = 20, color = colors.violet }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 23c6.075 0 8-4.925 8-9.5 0-3.1-2-5.5-4-7.5-1.5-1.5-2.5-3.5-2.5-5 0 0-1 1-2 3-1.5 3-4.5 4.5-4.5 9 0 4.575 1.925 10 5 10z" />
    </Svg>
  );
}

function MuscleIcon({ size = 16, color = '#FB7185' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L10.5 4.5 9.25 3.25a4.5 4.5 0 0 0-6.36 6.36l1.25 1.25L3 12a6 6 0 0 0 8.49 8.49l1.25-1.25 1.25 1.25a4.5 4.5 0 0 0 6.36-6.36l-1.25-1.25 1.14-.64zM12 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
    </Svg>
  );
}

function WheatIcon({ size = 16, color = '#FBBF24' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M7.41 18.59L6 20l-1.41-1.41L6 17.17l1.41 1.42zm4.24-4.24l-1.41 1.41-1.42-1.41 1.42-1.42 1.41 1.42zm4.25-4.25l-1.42 1.42-1.41-1.42 1.41-1.41 1.42 1.41zm3.53-7.77c-.39-.39-1.02-.39-1.41 0l-2.12 2.12 3.53 3.54 2.12-2.12c.39-.39.39-1.02 0-1.41l-2.12-2.13zm-5.65 5.66l-2.12 2.12 3.53 3.54 2.12-2.12-3.53-3.54zm-4.25 4.24l-2.12 2.12 3.54 3.54 2.12-2.12-3.54-3.54zM2.81 21.19a.996.996 0 0 0 1.41 0l4.95-4.95-1.41-1.41-4.95 4.95c-.39.39-.39 1.02 0 1.41z" />
    </Svg>
  );
}

function DropletIcon({ size = 16, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </Svg>
  );
}

function PencilIcon({ size = 16, color = '#94A3B8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </Svg>
  );
}

function TrashIcon({ size = 18, color = '#FB7185' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <Line x1="10" y1="11" x2="10" y2="17" />
      <Line x1="14" y1="11" x2="14" y2="17" />
    </Svg>
  );
}

function SaveIcon({ size = 18, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <Path d="M17 21v-8H7v8" />
      <Path d="M7 3v5h8V3" />
    </Svg>
  );
}



// ─── 60-90-120fps Dokunmatik Yay (Spring) Buton Bileşeni ───

type PressableScaleProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  activeScale?: number;
  hitSlop?: any;
  disabled?: boolean;
};

function PressableScale({
  children,
  onPress,
  style,
  containerStyle,
  activeScale = 0.95,
  hitSlop,
  disabled,
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const [opacity] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: activeScale,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 90,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  const flattenedStyle = StyleSheet.flatten(style) || {};
  const autoContainerStyle: Record<string, any> = {};
  if (flattenedStyle.flex !== undefined) autoContainerStyle.flex = flattenedStyle.flex;
  if (flattenedStyle.flexGrow !== undefined) autoContainerStyle.flexGrow = flattenedStyle.flexGrow;
  if (flattenedStyle.flexShrink !== undefined) autoContainerStyle.flexShrink = flattenedStyle.flexShrink;
  if (flattenedStyle.alignSelf !== undefined) autoContainerStyle.alignSelf = flattenedStyle.alignSelf;

  return (
    <Pressable
      style={[autoContainerStyle, containerStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      disabled={disabled}
    >
      <Animated.View
        style={[
          flattenedStyle.flex !== undefined ? { width: '100%' } : null,
          style,
          { transform: [{ scale }], opacity },
        ]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}

// ─── Kalori Yarım Daire (240° At Nalı) Göstergesi ───

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function CalorieSemiCircleGauge({
  percent,
  focusTrigger,
  saveTrigger,
}: {
  percent: number;
  focusTrigger?: number;
  saveTrigger?: number;
}) {
  // Makro hedeflerinin yarım dairesi ile aynı 240° at nalı mimarisi
  const radius = 35;
  const strokeWidth = 7;
  const sweepDeg = 240;
  const arcLength = (sweepDeg / 360) * 2 * Math.PI * radius; // ~146.61
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const [animValue] = useState(() => new Animated.Value(0));
  const [displayPercent, setDisplayPercent] = useState(0);
  const lastFocusRef = useRef(focusTrigger);
  const lastSaveRef = useRef(saveTrigger);

  useEffect(() => {
    // Sayfaya dışarıdan ilk girildiğinde veya KAYDET butonuna basıldığında sıfırdan dolma efekti ver
    if (focusTrigger !== undefined && lastFocusRef.current !== focusTrigger) {
      lastFocusRef.current = focusTrigger;
      animValue.setValue(0);
    }
    if (saveTrigger !== undefined && lastSaveRef.current !== saveTrigger) {
      lastSaveRef.current = saveTrigger;
      animValue.setValue(0);
    }

    // Gün değişiminde veya veri girişinde yumuşak geçiş / kaydetme anında sıfırdan dolma
    const anim = Animated.timing(animValue, {
      toValue: clampedPercent,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    const listenerId = animValue.addListener(({ value }) => {
      setDisplayPercent(value);
    });

    anim.start();

    return () => {
      animValue.removeListener(listenerId);
      anim.stop();
    };
  }, [animValue, clampedPercent, focusTrigger, saveTrigger]);

  const strokeDashoffset = useMemo(
    () =>
      animValue.interpolate({
        inputRange: [0, 100],
        outputRange: [arcLength, 0],
      }),
    [animValue, arcLength]
  );

  return (
    <View style={styles.calGaugeContainer}>
      <Svg width={96} height={68}>
        {/* Arka Plan Kılavuz Yayı */}
        <Path
          d="M 17.69 57.50 A 35 35 0 1 1 78.31 57.50"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* Ön Plan İlerleme Yayı */}
        <AnimatedPath
          d="M 17.69 57.50 A 35 35 0 1 1 78.31 57.50"
          stroke={colors.violet}
          strokeWidth={strokeWidth}
          strokeDasharray={[arcLength, arcLength]}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {/* Yay İçi Merkez: Alev İkonu & Yüzde */}
      <View style={styles.calGaugeCenterTextWrapper}>
        <FlameIcon size={22} color={colors.violet} />
        <Text style={styles.calGaugePercentText}>%{Math.round(displayPercent)}</Text>
      </View>
    </View>
  );
}

// ─── Yay / At Nalı Göstergesi (Horseshoe Arch Gauge - 240° Ferah Kubbe) ───

type SemiCircleGaugeProps = {
  percent: number;
  color: string;
  amountText: string;
  statusText: string;
  focusTrigger?: number;
  saveTrigger?: number;
};

function SemiCircleGauge({
  percent,
  color,
  amountText,
  statusText,
  focusTrigger,
  saveTrigger,
}: SemiCircleGaugeProps) {
  // 240 derecelik ferah at nalı yay (Referans tasarıma birebir uyumlu)
  // cx = 46, cy = 40, r = 35, strokeWidth = 7
  // Başlangıç açısı = 150° (sol alt), Bitiş açısı = 30° (sağ alt)
  // x1 = 15.69, y1 = 57.50 | x2 = 76.31, y2 = 57.50
  const radius = 35;
  const strokeWidth = 7;
  const sweepDeg = 240;
  const arcLength = (sweepDeg / 360) * 2 * Math.PI * radius; // ~146.61
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const [animValue] = useState(() => new Animated.Value(0));
  const lastFocusRef = useRef(focusTrigger);
  const lastSaveRef = useRef(saveTrigger);

  useEffect(() => {
    // Sayfaya dışarıdan ilk girildiğinde veya KAYDET butonuna basıldığında sıfırdan dolma efekti ver
    if (focusTrigger !== undefined && lastFocusRef.current !== focusTrigger) {
      lastFocusRef.current = focusTrigger;
      animValue.setValue(0);
    }
    if (saveTrigger !== undefined && lastSaveRef.current !== saveTrigger) {
      lastSaveRef.current = saveTrigger;
      animValue.setValue(0);
    }

    // Gün değişiminde veya veri girişinde yumuşak geçiş / kaydetme anında sıfırdan dolma
    const anim = Animated.timing(animValue, {
      toValue: clampedPercent,
      duration: 650,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    anim.start();

    return () => {
      anim.stop();
    };
  }, [animValue, clampedPercent, focusTrigger, saveTrigger]);

  const strokeDashoffset = useMemo(
    () =>
      animValue.interpolate({
        inputRange: [0, 100],
        outputRange: [arcLength, 0],
      }),
    [animValue, arcLength]
  );

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={92} height={66}>
        {/* Arka Plan Kılavuz Yayı (240° At Nalı Kubbesi) */}
        <Path
          d="M 15.69 57.50 A 35 35 0 1 1 76.31 57.50"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
        />
        {/* Ön Plan İlerleme Yayı */}
        <AnimatedPath
          d="M 15.69 57.50 A 35 35 0 1 1 76.31 57.50"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={[arcLength, arcLength]}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
      {/* Yay İçi Merkez Metinleri (Kubbeye Tam Oturan Ferah Boşluk) */}
      <View style={styles.gaugeCenterTextWrapper}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.gaugeAmountText}>
          {amountText}
        </Text>
        <Text numberOfLines={1} style={styles.gaugeStatusText}>
          {statusText}
        </Text>
      </View>
    </View>
  );
}

// ─── Yardımcı Fonksiyonlar ───

function getTodayIsoString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function offsetIsoDate(dateIso: string, offsetDays: number): string {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + offsetDays);
  const rY = dateObj.getFullYear();
  const rM = String(dateObj.getMonth() + 1).padStart(2, '0');
  const rD = String(dateObj.getDate()).padStart(2, '0');
  return `${rY}-${rM}-${rD}`;
}

function formatHeaderDate(dateIso: string, todayIso: string): string {
  if (dateIso === todayIso) return 'Bugün';
  const [, m, d] = dateIso.split('-').map(Number);
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${d} ${monthNames[(m || 1) - 1]}`;
}

function formatShortDateTR(dateIso: string): string {
  const [, m, d] = dateIso.split('-').map(Number);
  const months = [
    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
    'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
  ];
  return `${d} ${months[(m || 1) - 1]}`;
}

function formatMonthTR(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${months[(m || 1) - 1]} ${y}`;
}

function offsetMonth(yearMonth: string, offset: number): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const d = new Date(y, m - 1 + offset, 1);
  const rY = d.getFullYear();
  const rM = String(d.getMonth() + 1).padStart(2, '0');
  return `${rY}-${rM}`;
}

function getMonthShortNameTR(monthNum: number): string {
  const months = [
    'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
    'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
  ];
  return months[(monthNum || 1) - 1] || '';
}

function formatNumberTR(num: number): string {
  if (num % 1 === 0) {
    return num.toLocaleString('tr-TR');
  }
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function calculateYAxisSteps(maxValue: number): number[] {
  const safeMax = Math.max(maxValue, 10);

  // Standart temiz ve yuvarlatılmış adım büyüklükleri (153 gibi sayılar yerine 50, 100, 150, 200, 500...)
  const candidateSteps = [
    10, 20, 25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 750, 1000, 1500, 2000,
  ];

  let bestStep = 100;
  let bestIntervals = 3;
  let minDiff = Infinity;

  // 3, 4 veya 5 aralık (okunabilir, net basamaklar)
  for (const step of candidateSteps) {
    for (const intervals of [3, 4, 5]) {
      const top = step * intervals;
      if (top >= safeMax) {
        const diff = top - safeMax;
        if (diff < minDiff) {
          minDiff = diff;
          bestStep = step;
          bestIntervals = intervals;
        }
      }
    }
  }

  const steps: number[] = [];
  for (let i = bestIntervals; i >= 0; i--) {
    steps.push(bestStep * i);
  }
  return steps;
}

function getWeekDaysForDate(selectedDateIso: string, todayIso: string) {
  const [y, m, d] = selectedDateIso.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  let dayOfWeek = dateObj.getDay() - 1; // 0: Pazartesi ... 6: Pazar
  if (dayOfWeek < 0) dayOfWeek = 6;

  // Haftanın başlangıcı Pazartesi:
  const monday = new Date(y, m - 1, d - dayOfWeek);

  const labels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const result = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const cY = cur.getFullYear();
    const cM = String(cur.getMonth() + 1).padStart(2, '0');
    const cD = String(cur.getDate()).padStart(2, '0');
    const iso = `${cY}-${cM}-${cD}`;
    result.push({
      label: labels[i],
      date: iso,
      dayNum: cur.getDate(),
      isToday: iso === todayIso,
      isSelected: iso === selectedDateIso,
    });
  }
  return result;
}

// ─── Web Tarzı Tarih Seçim Panosu (NutriCalendarModal - Geçmiş Sayfası ile Birebir) ───

let isCalendarMonthAnimating = false;

type NutriCalendarModalProps = {
  visible: boolean;
  selectedDate: string;
  todayIso: string;
  logMap: Map<string, { calories: number; protein: number; carbs: number; fat: number }>;
  minCalories: number;
  onSelect: (dateStr: string) => void;
  onClose: () => void;
};

function NutriCalendarModal({
  visible,
  selectedDate,
  todayIso,
  logMap,
  minCalories,
  onSelect,
  onClose,
}: NutriCalendarModalProps) {
  const [viewMonth, setViewMonth] = useState<string>(() =>
    selectedDate ? selectedDate.slice(0, 7) : todayIso.slice(0, 7)
  );

  const [slideAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(1));

  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) {
      let targetMonth = todayIso.slice(0, 7);
      if (selectedDate) {
        targetMonth = selectedDate.slice(0, 7);
      } else if (logMap.size > 0) {
        const dates = Array.from(logMap.keys()).sort();
        targetMonth = dates[dates.length - 1].slice(0, 7);
      }
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
      status: 'none' | 'success' | 'warning';
    } | null)[] = [];

    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dStr = String(d).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const dateIso = `${y}-${mStr}-${dStr}`;

      const log = logMap.get(dateIso);
      const cal = log?.calories || 0;
      const hasLog = cal > 0 || (log?.protein || 0) > 0;

      let status: 'none' | 'success' | 'warning' = 'none';
      if (hasLog) {
        // Eğer kullanıcı o değeri (min kalori / hedef kalori) geçmişse veya eşitse YEŞİL,
        // geçememişse (altında kalmışsa) SARI!
        status = cal >= minCalories ? 'success' : 'warning';
      }

      cells.push({
        dateIso,
        dayNum: d,
        isToday: dateIso === todayIso,
        status,
      });
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [viewMonth, todayIso, logMap, minCalories]);

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
                <CalendarIcon size={18} color={colors.violet} />
              </View>
              <View style={styles.calHeaderTextWrap}>
                <Text style={styles.calTitle} numberOfLines={1}>Tarih Seçimi</Text>
                <Text style={styles.calSubtitle} numberOfLines={1}>
                  Beslenme kaydı için tarih seç
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

                    {/* Beslenme Durumu Noktası: Min kaloriyi geçen gün YEŞİL, altında kalan gün SARI. Bugün: MOR nokta */}
                    <View style={styles.calDotsContainer}>
                      {cell.status === 'success' && !isSelected && (
                        <View style={styles.calWorkoutDot} />
                      )}
                      {cell.status === 'warning' && !isSelected && (
                        <View style={styles.calWarningDot} />
                      )}
                      {cell.isToday && !isSelected && (
                        <View style={styles.calTodayDot} />
                      )}
                    </View>
                  </PressableScale>
                );
              })}
            </Animated.View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Rakam Haneleri Kayan Animasyon Bileşeni (Alternatif Yukarı / Aşağı Süzülme) ───

type SingleSlidingDigitProps = {
  char: string;
  isEven: boolean;
  delay: number;
  lineHeight: number;
  textStyle: TextStyle;
  trigger: string | number;
};

function SingleSlidingDigit({
  char,
  isEven,
  delay,
  lineHeight,
  textStyle,
  trigger,
}: SingleSlidingDigitProps) {
  const [anim] = useState(() => new Animated.Value(0));
  const prevCharRef = useRef<string | null>(null);
  const [displayPrevChar, setDisplayPrevChar] = useState<string | null>(null);

  useEffect(() => {
    const prev = prevCharRef.current;
    prevCharRef.current = char;

    if (prev !== null && prev !== char) {
      setDisplayPrevChar(prev);
    }

    anim.setValue(0);
    const timer = setTimeout(() => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }).start(({ finished }) => {
        if (finished) {
          setDisplayPrevChar(null);
        }
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [char, trigger, delay, anim]);

  const direction = isEven ? -1 : 1;
  const slideDistance = lineHeight * 0.95;

  return (
    <View
      style={{
        height: lineHeight,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Çıkan Eski Rakam (Varsa) */}
      {displayPrevChar !== null && (
        <Animated.View
          style={{
            position: 'absolute',
            opacity: anim.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [1, 0.2, 0],
            }),
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -direction * slideDistance],
                }),
              },
            ],
          }}
        >
          <Text style={textStyle}>{displayPrevChar}</Text>
        </Animated.View>
      )}

      {/* Giren Yeni Rakam */}
      <Animated.View
        style={{
          opacity: anim.interpolate({
            inputRange: [0, 0.35, 1],
            outputRange: [0, 0.75, 1],
          }),
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [direction * slideDistance, 0],
              }),
            },
          ],
        }}
      >
        <Text style={textStyle}>{char}</Text>
      </Animated.View>
    </View>
  );
}

type SlidingDigitsTextProps = {
  value: string | number;
  style?: StyleProp<TextStyle>;
  triggerKey?: string | number;
};

function SlidingDigitsText({
  value,
  style,
  triggerKey = '',
}: SlidingDigitsTextProps) {
  const str = String(value);
  const flatStyle = (StyleSheet.flatten(style) || {}) as TextStyle;
  const fontSize = flatStyle.fontSize || 16;
  const lineHeight = flatStyle.lineHeight || Math.round(fontSize * 1.35);

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: flatStyle.marginTop,
    marginBottom: flatStyle.marginBottom,
    marginLeft: flatStyle.marginLeft,
    marginRight: flatStyle.marginRight,
    maxWidth: flatStyle.maxWidth,
  };

  const textStyle: TextStyle = {
    fontSize: flatStyle.fontSize,
    fontWeight: flatStyle.fontWeight,
    color: flatStyle.color,
    letterSpacing: flatStyle.letterSpacing,
    fontFamily: flatStyle.fontFamily,
  };

  const tokens = useMemo(() => {
    type TokenItem =
      | { type: 'digit'; char: string; digitIndex: number; key: string }
      | { type: 'text'; text: string; key: string };

    const list: TokenItem[] = [];
    let digitCount = 0;
    let currentText = '';

    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (/\d/.test(c)) {
        if (currentText) {
          list.push({ type: 'text', text: currentText, key: `t_${list.length}` });
          currentText = '';
        }
        list.push({
          type: 'digit',
          char: c,
          digitIndex: digitCount,
          key: `d_${digitCount}`,
        });
        digitCount++;
      } else {
        currentText += c;
      }
    }
    if (currentText) {
      list.push({ type: 'text', text: currentText, key: `t_${list.length}` });
    }
    return list;
  }, [str]);

  return (
    <View style={containerStyle}>
      {tokens.map((token) => {
        if (token.type === 'digit') {
          const isEven = token.digitIndex % 2 === 0;
          return (
            <SingleSlidingDigit
              key={token.key}
              char={token.char}
              isEven={isEven}
              delay={Math.min(token.digitIndex * 22, 110)}
              lineHeight={lineHeight}
              textStyle={textStyle}
              trigger={`${triggerKey}_${str}`}
            />
          );
        }
        return (
          <View
            key={token.key}
            style={{
              height: lineHeight,
              justifyContent: 'center',
            }}
          >
            <Text style={textStyle}>{token.text}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ─── Tıklanabilir Ortalama Kart Butonu ───

type StatCardButtonProps = {
  label: string;
  value: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  triggerKey?: string | number;
};

function StatCardButton({
  label,
  value,
  color,
  isSelected,
  onPress,
  triggerKey,
}: StatCardButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        isSelected && {
          borderColor: color,
          backgroundColor: `${color}18`,
          shadowColor: color,
          shadowOpacity: 0.35,
          shadowRadius: 6,
          elevation: 2,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.statCardHeader}>
        <Text
          numberOfLines={1}
          style={[
            styles.statLabel,
            isSelected && { color: '#FFFFFF', fontWeight: '800' },
          ]}
        >
          {label}
        </Text>
        {isSelected && (
          <View style={[styles.activeMetricDot, { backgroundColor: color }]} />
        )}
      </View>
      <SlidingDigitsText
        value={value}
        style={[styles.statValue, { color }]}
        triggerKey={triggerKey}
      />
    </TouchableOpacity>
  );
}

// ─── Gerçekçi Günlük Maksimum Beslenme Sınırları (UI Taşma & Aşırı Giriş Koruması) ───
const MAX_MACRO_LIMITS = {
  fat: 500,        // Maksimum 500g Yağ (~4.500 kcal)
  carbs: 1500,     // Maksimum 1.500g Karbonhidrat (~6.000 kcal)
  protein: 600,    // Maksimum 600g Protein (~2.400 kcal)
  calories: 20000, // Maksimum 20.000 kcal
} as const;

// ─── Dinamik Dönen Mini Makro Çemberi ───

type MiniMacroProgressRingProps = {
  percent: number;
  color: string;
  size?: number;
};

function MiniMacroProgressRing({
  percent,
  color,
  size = 22,
}: MiniMacroProgressRingProps) {
  const strokeWidth = 2.2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const [animValue] = useState(() => new Animated.Value(clampedPercent));

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: clampedPercent,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [clampedPercent, animValue]);

  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Arka Plan Kılavuz Çemberi */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Dinamik Dönen İlerleme Çemberi */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={[circumference, circumference]}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
          fill="none"
        />
      </Svg>
      {/* Merkez Yüzde Metni */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={{
            color: '#FFFFFF',
            fontSize: 7,
            fontWeight: '800',
            textAlign: 'center',
            paddingHorizontal: 1,
          }}
        >
          {Math.min(999, Math.round(percent))}%
        </Text>
      </View>
    </View>
  );
}

// ─── Günlük Giriş Formu (Canlı Senkronizasyonlu & Otomatik Kalori Hesaplamalı) ───

type DailyInputFormProps = {
  initialLog: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes?: string;
  };
  targets?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  onDraftChange: (draft: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }) => void;
  onSave: (data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes: string;
  }) => void;
  isSaving: boolean;
};

const DailyInputForm = React.memo(function DailyInputForm({
  initialLog,
  targets,
  onDraftChange,
  onSave,
  isSaving,
}: DailyInputFormProps) {
  const [protein, setProtein] = useState(
    initialLog.protein > 0 ? String(Math.min(MAX_MACRO_LIMITS.protein, initialLog.protein)) : ''
  );
  const [carbs, setCarbs] = useState(
    initialLog.carbs > 0 ? String(Math.min(MAX_MACRO_LIMITS.carbs, initialLog.carbs)) : ''
  );
  const [fat, setFat] = useState(
    initialLog.fat > 0 ? String(Math.min(MAX_MACRO_LIMITS.fat, initialLog.fat)) : ''
  );
  const [notes, setNotes] = useState(initialLog.notes || '');

  const [prevLog, setPrevLog] = useState(initialLog);
  if (prevLog !== initialLog) {
    setPrevLog(initialLog);
    setProtein(initialLog.protein > 0 ? String(Math.min(MAX_MACRO_LIMITS.protein, initialLog.protein)) : '');
    setCarbs(initialLog.carbs > 0 ? String(Math.min(MAX_MACRO_LIMITS.carbs, initialLog.carbs)) : '');
    setFat(initialLog.fat > 0 ? String(Math.min(MAX_MACRO_LIMITS.fat, initialLog.fat)) : '');
    setNotes(initialLog.notes || '');
  }

  // Hedef Makrolar (Yüzde hesaplaması için)
  const targetProtein = targets?.protein || 160;
  const targetCarbs = targets?.carbs || 280;
  const targetFat = targets?.fat || 72;

  // Anlık Sayısal Değerler
  const pNum = Math.min(MAX_MACRO_LIMITS.protein, Number(protein) || 0);
  const cNum = Math.min(MAX_MACRO_LIMITS.carbs, Number(carbs) || 0);
  const fNum = Math.min(MAX_MACRO_LIMITS.fat, Number(fat) || 0);

  // Otomatik hesaplanan kalori (p*4 + c*4 + f*9) - Max 20.000 kcal tavanı
  const calculatedCalories = useMemo(() => {
    if (pNum === 0 && cNum === 0 && fNum === 0) {
      return initialLog.calories > 0
        ? Math.min(MAX_MACRO_LIMITS.calories, initialLog.calories)
        : 0;
    }
    return Math.min(
      MAX_MACRO_LIMITS.calories,
      Math.round(pNum * 4 + cNum * 4 + fNum * 9)
    );
  }, [pNum, cNum, fNum, initialLog.calories]);

  // Dinamik Yüzdeler (Çemberlerin veri girildikçe dinamik dönmesi için)
  const proteinPercent = targetProtein > 0 ? (pNum / targetProtein) * 100 : 0;
  const carbsPercent = targetCarbs > 0 ? (cNum / targetCarbs) * 100 : 0;
  const fatPercent = targetFat > 0 ? (fNum / targetFat) * 100 : 0;

  const handleMacroChange = (type: 'p' | 'c' | 'f', val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    let numVal = cleanVal === '' ? 0 : Number(cleanVal);

    // Gerçekçi fizyolojik üst sınır kontrolü
    const maxLimit =
      type === 'p'
        ? MAX_MACRO_LIMITS.protein
        : type === 'c'
        ? MAX_MACRO_LIMITS.carbs
        : MAX_MACRO_LIMITS.fat;

    if (numVal > maxLimit) {
      numVal = maxLimit;
    }

    const finalStr = cleanVal === '' ? '' : String(numVal);

    let nextP = protein;
    let nextC = carbs;
    let nextF = fat;
    if (type === 'p') {
      nextP = finalStr;
      setProtein(finalStr);
    }
    if (type === 'c') {
      nextC = finalStr;
      setCarbs(finalStr);
    }
    if (type === 'f') {
      nextF = finalStr;
      setFat(finalStr);
    }

    const nextPNum = Math.min(MAX_MACRO_LIMITS.protein, Number(nextP) || 0);
    const nextCNum = Math.min(MAX_MACRO_LIMITS.carbs, Number(nextC) || 0);
    const nextFNum = Math.min(MAX_MACRO_LIMITS.fat, Number(nextF) || 0);
    const cal = Math.min(
      MAX_MACRO_LIMITS.calories,
      Math.round(nextPNum * 4 + nextCNum * 4 + nextFNum * 9)
    );

    onDraftChange({
      protein: nextPNum,
      carbs: nextCNum,
      fat: nextFNum,
      calories: cal,
    });
  };

  const handleClear = () => {
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
    onDraftChange({
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
    });
  };

  const handleSavePress = () => {
    if (calculatedCalories === 0 && pNum === 0 && cNum === 0 && fNum === 0 && !notes.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen en az bir makro değeri girin.');
      return;
    }

    onSave({
      calories: calculatedCalories,
      protein: pNum,
      carbs: cNum,
      fat: fNum,
      notes: notes.trim(),
    });
  };

  return (
    <View style={styles.modernInputCard}>
      {/* Üst Satır: Başlık & Sağ Köşe Toplam Kalori Rozeti (Alev İkonlu & Dinamik Kalorili) */}
      <View style={styles.inputCardHeader}>
        <View style={styles.inputCardTitleGroup}>
          <Text style={styles.inputCardHeaderTitle}>Bugün ne yedin?</Text>
          <Text style={styles.inputCardSubtitle}>
            Makroları gir, kalori otomatik hesaplansın
          </Text>
        </View>

        {/* Sağ Köşe Toplam Kalori Rozeti */}
        <View style={styles.topCalBadge}>
          <Text style={styles.topCalLabel}>TOPLAM</Text>
          <View style={styles.topCalRow}>
            <FlameIcon size={18} color="#C084FC" />
            <SlidingDigitsText
              value={calculatedCalories.toLocaleString('tr-TR')}
              style={styles.topCalValue}
            />
            <Text style={styles.topCalUnit}>kcal</Text>
          </View>
        </View>
      </View>

      {/* Yan Yana 3'lü Makro Kartları (Yağ, Karb, Protein) - Kompakt ve Doğrudan Girişli */}
      <View style={styles.macroCardsRow}>
        {/* 1. YAĞ KARTI */}
        <View style={[styles.macroCard, styles.macroCardFat]}>
          <View style={styles.macroCardHeader}>
            <View style={styles.macroCardTitleGroup}>
              <View style={[styles.macroBadge, { backgroundColor: 'rgba(6, 182, 212, 0.2)' }]}>
                <DropletIcon size={11} color="#38BDF8" />
              </View>
              <Text numberOfLines={1} style={[styles.macroCardLabel, { color: '#38BDF8' }]}>
                YAĞ
              </Text>
            </View>
            <MiniMacroProgressRing percent={fatPercent} color="#38BDF8" size={22} />
          </View>

          {/* Ortadaki Sayı Doğrudan Düzenlenebilir Input */}
          <View style={styles.macroValueDisplayRow}>
            <TextInput
              style={styles.macroValueBigInput}
              value={fat}
              onChangeText={(v) => handleMacroChange('f', v)}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0"
              placeholderTextColor="#64748B"
              selectTextOnFocus
            />
            <Text style={styles.macroValueUnitText}>g</Text>
          </View>
        </View>

        {/* 2. KARB KARTI */}
        <View style={[styles.macroCard, styles.macroCardCarbs]}>
          <View style={styles.macroCardHeader}>
            <View style={styles.macroCardTitleGroup}>
              <View style={[styles.macroBadge, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <WheatIcon size={11} color="#FBBF24" />
              </View>
              <Text numberOfLines={1} style={[styles.macroCardLabel, { color: '#FBBF24' }]}>
                KARB
              </Text>
            </View>
            <MiniMacroProgressRing percent={carbsPercent} color="#FBBF24" size={22} />
          </View>

          {/* Ortadaki Sayı Doğrudan Düzenlenebilir Input */}
          <View style={styles.macroValueDisplayRow}>
            <TextInput
              style={styles.macroValueBigInput}
              value={carbs}
              onChangeText={(v) => handleMacroChange('c', v)}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0"
              placeholderTextColor="#64748B"
              selectTextOnFocus
            />
            <Text style={styles.macroValueUnitText}>g</Text>
          </View>
        </View>

        {/* 3. PROTEİN KARTI */}
        <View style={[styles.macroCard, styles.macroCardProtein]}>
          <View style={styles.macroCardHeader}>
            <View style={styles.macroCardTitleGroup}>
              <View style={[styles.macroBadge, { backgroundColor: 'rgba(244, 63, 94, 0.2)' }]}>
                <MuscleIcon size={11} color="#FB7185" />
              </View>
              <Text numberOfLines={1} style={[styles.macroCardLabel, { color: '#FB7185' }]}>
                PROTEİN
              </Text>
            </View>
            <MiniMacroProgressRing percent={proteinPercent} color="#FB7185" size={22} />
          </View>

          {/* Ortadaki Sayı Doğrudan Düzenlenebilir Input */}
          <View style={styles.macroValueDisplayRow}>
            <TextInput
              style={styles.macroValueBigInput}
              value={protein}
              onChangeText={(v) => handleMacroChange('p', v)}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0"
              placeholderTextColor="#64748B"
              selectTextOnFocus
            />
            <Text style={styles.macroValueUnitText}>g</Text>
          </View>
        </View>
      </View>

      {/* Notlar Kısmı (İkonlu & Şık Kapsayıcı) */}
      <View style={styles.notesSectionWrapper}>
        <Text style={styles.notesSectionLabel}>NOTLAR</Text>
        <View style={styles.notesInputContainer}>
          <PencilIcon size={16} color="#64748B" />
          <TextInput
            style={styles.notesTextInput}
            placeholder="Bugün hakkında eklemek istediğin notlar..."
            placeholderTextColor="#64748B"
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </View>

      {/* Kaydet ve Sil Butonları (Kaydetme Butonu da Temizle ile Birebir Aynı Tasarımda - Zümrüt Yeşili) */}
      <View style={styles.actionButtonsRow}>
        <PressableScale
          style={[styles.actionBtn, styles.clearBtn]}
          onPress={handleClear}
          activeScale={0.96}
        >
          <TrashIcon size={16} color="#FB7185" />
          <Text style={styles.clearBtnText}>Temizle</Text>
        </PressableScale>

        <PressableScale
          style={[
            styles.actionBtn,
            styles.saveBtnGreen,
            isSaving && { opacity: 0.65 },
          ]}
          onPress={handleSavePress}
          activeScale={0.96}
          disabled={isSaving}
        >
          <SaveIcon size={16} color="#10B981" />
          <Text style={styles.saveBtnGreenText}>
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
});

export default function NutritionScreen() {
  const { user } = useUser();
  const { todayLog, history, isSaving, saveLog } = useNutrition();

  const todayIso = useMemo(() => getTodayIsoString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Sayfaya her odaklanıldığında animasyonu tetiklemek için focusKey
  const [focusKey, setFocusKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusKey((prev) => prev + 1);
    }, [])
  );

  // En üstte seçili tarihi gösteren başlık metni için yumuşak süzülme animasyonu
  const [headerFadeAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    headerFadeAnim.setValue(0.2);
    Animated.timing(headerFadeAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [selectedDate, headerFadeAnim]);

  // İstatistik Sekmesi: 'weekly' | 'monthly' | 'yearly'
  const [statPeriod, setStatPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

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

  // Aktif İncelenen Metrik: 'calories' | 'protein' | 'carbs' | 'fat'
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('calories');
  const activeMetricColor = METRICS[selectedMetric].color;

  // Dönem Gezinme Referansları
  const [activeWeekOffset, setActiveWeekOffset] = useState<number>(0);
  const [activeMonth, setActiveMonth] = useState<string>(() => todayIso.slice(0, 7));
  const [activeYear, setActiveYear] = useState<number>(() => new Date().getFullYear());

  // Grafikte seçili / basılmış olan barın indeksi
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Tooltip ve Çizim Alanı Genişlikleri (Piksel Hassasiyetinde Hizalama İçin)
  const [chartCanvasWidth, setChartCanvasWidth] = useState<number>(0);
  const [measuredTooltipWidth, setMeasuredTooltipWidth] = useState<number>(86);

  const handleCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - chartCanvasWidth) > 1) {
      setChartCanvasWidth(w);
    }
  }, [chartCanvasWidth]);

  // ─── Animasyon Değerleri (useState ile kararlı referanslar) ───
  const [barAnim] = useState(() => new Animated.Value(0));
  const [tooltipAnim] = useState(() => new Animated.Value(1));
  const [selectedBarAnim] = useState(() => new Animated.Value(1));
  const [selectCounter, setSelectCounter] = useState(0);
  const [weekSlideAnim] = useState(() => new Animated.Value(0));
  const [weekOpacityAnim] = useState(() => new Animated.Value(1));

  // Hedef Değerler (Kullanıcı verilerine veya bilimsel hedeflere göre)
  const targets = useMemo(() => {
    const weight = user?.weight || 80;
    const height = user?.height || 178;
    const age = user?.age || 25;
    const gender = user?.gender || 'male';
    const level = user?.fitness_level || 'Beginner';
    const goal = user?.goal || 'bulk';

    // BMR (Harris-Benedict / Mifflin St Jeor)
    const bmr =
      gender === 'female'
        ? 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
        : 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;

    const multipliers: Record<string, number> = {
      Beginner: 1.2,
      Intermediate: 1.375,
      Advanced: 1.55,
    };
    const mult = multipliers[level] || 1.2;
    const tdee = Math.round(bmr * mult);

    let targetCal = tdee;
    if (goal === 'bulk') {
      targetCal += 300;
    } else if (goal === 'cut') {
      targetCal -= 500;
    }
    if (!targetCal || targetCal < 1200) {
      targetCal = 2500;
    }

    // Sistem kişinin alması gereken minimum kalori değeri
    const minCalories = targetCal;
    const targetProt = Math.round(weight * (goal === 'cut' ? 2.2 : 2.0)) || 160;
    const targetFat = Math.round(weight * 0.9) || 72;
    const targetCarbs = Math.round(Math.max(0, (targetCal - targetProt * 4 - targetFat * 9)) / 4) || 280;

    return {
      calories: targetCal,
      minCalories,
      protein: targetProt,
      carbs: targetCarbs,
      fat: targetFat,
    };
  }, [user]);

  // Seçili tarihe ait mevcut log (Aşırı verileri gerçekçi sınırlara filtreler)
  const activeLog = useMemo(() => {
    const raw =
      selectedDate === todayIso
        ? todayLog
        : history.find((h) => h.date === selectedDate);
    if (!raw) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, notes: '' };
    }
    return {
      calories: Math.min(MAX_MACRO_LIMITS.calories, Math.max(0, raw.calories || 0)),
      protein: Math.min(MAX_MACRO_LIMITS.protein, Math.max(0, raw.protein || 0)),
      carbs: Math.min(MAX_MACRO_LIMITS.carbs, Math.max(0, raw.carbs || 0)),
      fat: Math.min(MAX_MACRO_LIMITS.fat, Math.max(0, raw.fat || 0)),
      notes: raw.notes || '',
    };
  }, [selectedDate, todayIso, todayLog, history]);

  // Hafta Günleri (P S Ç P C C P)
  const weekDays = useMemo(
    () => getWeekDaysForDate(selectedDate, todayIso),
    [selectedDate, todayIso]
  );

  // ─── Canlı Form Taslağı (Kullanıcı veri girdikçe üstteki yarım dairelerin anlık güncellenmesi için) ───
  const [draftLog, setDraftLog] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  } | null>(null);

  const [saveTrigger, setSaveTrigger] = useState<number>(0);

  // Canlı / Görüntülenen anlık makro ve kalori değerleri
  const currentCalories = draftLog ? draftLog.calories : (activeLog.calories || 0);
  const currentProtein = draftLog ? draftLog.protein : (activeLog.protein || 0);
  const currentCarbs = draftLog ? draftLog.carbs : (activeLog.carbs || 0);
  const currentFat = draftLog ? draftLog.fat : (activeLog.fat || 0);

  // Kalan Kalori & Makro Değerleri (Kullanıcı veri girdikçe anlık güncellenir)
  const caloriesLeft = targets.calories - currentCalories;
  const fatRemaining = targets.fat - currentFat;
  const carbsRemaining = targets.carbs - currentCarbs;
  const proteinRemaining = targets.protein - currentProtein;

  // İlerleme Yüzdeleri (0-100) (Kullanıcı veri girdikçe anlık güncellenir)
  const carbsPercent = targets.carbs > 0
    ? Math.min(100, Math.max(0, Math.round((currentCarbs / targets.carbs) * 100)))
    : 0;

  const fatPercent = targets.fat > 0
    ? Math.min(100, Math.max(0, Math.round((currentFat / targets.fat) * 100)))
    : 0;

  const proteinPercent = targets.protein > 0
    ? Math.min(100, Math.max(0, Math.round((currentProtein / targets.protein) * 100)))
    : 0;

  const caloriePercent = targets.calories > 0
    ? Math.min(100, Math.max(0, Math.round((currentCalories / targets.calories) * 100)))
    : 0;

  // Tüm logların hızlı aranması için Map
  const logMap = useMemo(() => {
    const map = new Map<
      string,
      { calories: number; protein: number; carbs: number; fat: number }
    >();

    for (const item of history) {
      map.set(item.date, {
        calories: item.calories || 0,
        protein: item.protein || 0,
        carbs: item.carbs || 0,
        fat: item.fat || 0,
      });
    }

    if (todayLog && (todayLog.calories > 0 || todayLog.protein > 0)) {
      map.set(todayIso, {
        calories: todayLog.calories || 0,
        protein: todayLog.protein || 0,
        carbs: todayLog.carbs || 0,
        fat: todayLog.fat || 0,
      });
    }

    return map;
  }, [history, todayLog, todayIso]);

  // ─── Aktif Döneme Göre Çubuk Grafik Verileri (Haftalık / Aylık / Yıllık) ───
  const chartDays = useMemo(() => {
    if (statPeriod === 'weekly') {
      // 7 gün (activeWeekOffset'e göre seçili haftanın 7 günü)
      const dates: string[] = [];
      for (let i = 6; i >= 0; i--) {
        dates.push(offsetIsoDate(todayIso, activeWeekOffset * 7 - i));
      }
      return dates.map((dStr) => {
        const log = logMap.get(dStr);
        const val = log ? (log[selectedMetric] || 0) : 0;
        return {
          key: dStr,
          date: dStr,
          displayDate: formatShortDateTR(dStr),
          shortLabel: formatShortDateTR(dStr),
          value: val,
          hasData: !!log && val > 0,
          calories: log?.calories || 0,
          protein: log?.protein || 0,
          carbs: log?.carbs || 0,
          fat: log?.fat || 0,
        };
      });
    }

    if (statPeriod === 'monthly') {
      // Seçili ayın tüm günleri (28, 29, 30 veya 31 gün)
      const [y, m] = activeMonth.split('-').map(Number);
      const daysCount = new Date(y, m, 0).getDate();
      const items = [];
      for (let d = 1; d <= daysCount; d++) {
        const dayStr = String(d).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        const dStr = `${y}-${mStr}-${dayStr}`;
        const log = logMap.get(dStr);
        const val = log ? (log[selectedMetric] || 0) : 0;
        items.push({
          key: dStr,
          date: dStr,
          displayDate: formatShortDateTR(dStr),
          shortLabel: `${d}`,
          value: val,
          hasData: !!log && val > 0,
          calories: log?.calories || 0,
          protein: log?.protein || 0,
          carbs: log?.carbs || 0,
          fat: log?.fat || 0,
        });
      }
      return items;
    }

    // 'yearly' -> Seçili yılın 12 ayı (Ocak - Aralık)
    const items = [];
    for (let m = 1; m <= 12; m++) {
      const mStr = String(m).padStart(2, '0');
      const prefix = `${activeYear}-${mStr}`;
      let mCount = 0;
      let mCal = 0;
      let mProt = 0;
      let mCarb = 0;
      let mFat = 0;

      for (const [dateKey, log] of logMap.entries()) {
        if (dateKey.startsWith(prefix) && (log.calories > 0 || log.protein > 0 || log.carbs > 0 || log.fat > 0)) {
          mCount++;
          mCal += log.calories || 0;
          mProt += log.protein || 0;
          mCarb += log.carbs || 0;
          mFat += log.fat || 0;
        }
      }

      const avgCal = mCount > 0 ? Math.round(mCal / mCount) : 0;
      const avgProt = mCount > 0 ? Math.round(mProt / mCount) : 0;
      const avgCarb = mCount > 0 ? Math.round(mCarb / mCount) : 0;
      const avgFat = mCount > 0 ? Math.round(mFat / mCount) : 0;

      const metricVal =
        selectedMetric === 'calories'
          ? avgCal
          : selectedMetric === 'protein'
          ? avgProt
          : selectedMetric === 'carbs'
          ? avgCarb
          : avgFat;

      items.push({
        key: prefix,
        date: prefix,
        displayDate: `${getMonthShortNameTR(m)} ${activeYear}`,
        shortLabel: getMonthShortNameTR(m),
        value: metricVal,
        hasData: mCount > 0,
        calories: avgCal,
        protein: avgProt,
        carbs: avgCarb,
        fat: avgFat,
      });
    }
    return items;
  }, [statPeriod, todayIso, activeWeekOffset, activeMonth, activeYear, logMap, selectedMetric]);

  // Çubukların X Ekseninden Yukarıya Süzülme Animasyonu (60-120 FPS GPU Hızlandırmalı)
  useEffect(() => {
    barAnim.setValue(0);
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [statPeriod, selectedMetric, activeWeekOffset, activeMonth, activeYear, barAnim]);

  // Seçili Dönem İstatistikleri (4 Buton Kartı İçin Ortalama Değerler)
  const stats = useMemo(() => {
    const loggedItems = chartDays.filter((d) => d.hasData);
    const count = loggedItems.length || 1;
    const totalCal = loggedItems.reduce((s, d) => s + d.calories, 0);
    const totalProt = loggedItems.reduce((s, d) => s + d.protein, 0);
    const totalCarb = loggedItems.reduce((s, d) => s + d.carbs, 0);
    const totalFat = loggedItems.reduce((s, d) => s + d.fat, 0);

    return {
      avgCal: loggedItems.length ? Math.round(totalCal / count) : 0,
      avgProt: loggedItems.length ? Math.round(totalProt / count) : 0,
      avgCarb: loggedItems.length ? Math.round(totalCarb / count) : 0,
      avgFat: loggedItems.length ? Math.round(totalFat / count) : 0,
    };
  }, [chartDays]);

  // Y-Ekseni Basamakları (Max değere göre dinamik basamaklar)
  const ySteps = useMemo(() => {
    const maxVal = Math.max(...chartDays.map((d) => d.value), 10);
    return calculateYAxisSteps(maxVal);
  }, [chartDays]);

  const yMax = ySteps[0];

  // Aktif İncelenen Gün (Varsayılan olarak seçili tarihe denk gelen bar veya en son veri olan gün)
  const resolvedActiveIndex = useMemo(() => {
    if (activeBarIndex !== null && activeBarIndex >= 0 && activeBarIndex < chartDays.length) {
      return activeBarIndex;
    }
    if (statPeriod === 'weekly' || statPeriod === 'monthly') {
      const selIdx = chartDays.findIndex((d) => d.date === selectedDate);
      if (selIdx >= 0) return selIdx;
    }
    // Verisi olan en son günü / ayı bul
    for (let i = chartDays.length - 1; i >= 0; i--) {
      if (chartDays[i].hasData) return i;
    }
    return chartDays.length - 1;
  }, [activeBarIndex, chartDays, selectedDate, statPeriod]);

  // Seçili Bar & Tooltip Yumuşak Süzülme ve Yaylanma Animasyonu
  const playBarSelectAnimation = useCallback(() => {
    selectedBarAnim.stopAnimation();
    tooltipAnim.stopAnimation();

    selectedBarAnim.setValue(0);
    tooltipAnim.setValue(0);

    Animated.parallel([
      Animated.timing(selectedBarAnim, {
        toValue: 1,
        duration: 720,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(tooltipAnim, {
        toValue: 1,
        duration: 720,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [selectedBarAnim, tooltipAnim]);

  // Metrik veya Dönem Değiştiğinde Animasyonu Yumuşakça Başlat
  useEffect(() => {
    playBarSelectAnimation();
  }, [selectedMetric, statPeriod, activeWeekOffset, activeMonth, activeYear, playBarSelectAnimation]);

  const inspectedDay = chartDays[resolvedActiveIndex] || null;

  // Tooltip Konumu ve Ok Hizalaması (Çubuğun Tam Merkezine Piksel Hassasiyetinde)
  const { cardLeft, arrowOffset, isReadyWithPixels } = useMemo(() => {
    if (chartDays.length === 0) {
      return { cardLeft: 0, arrowOffset: 0, isReadyWithPixels: false };
    }

    if (chartCanvasWidth <= 0) {
      const pct = ((resolvedActiveIndex + 0.5) / chartDays.length) * 100;
      return { cardLeft: pct, arrowOffset: measuredTooltipWidth / 2, isReadyWithPixels: false };
    }

    // Çubuğun merkez X koordinatı (Canvas içindeki piksel)
    const barX = ((resolvedActiveIndex + 0.5) / chartDays.length) * chartCanvasWidth;

    // Kartın ortalanmış sol koordinatı
    const idealLeft = barX - measuredTooltipWidth / 2;

    // Kartın grafiğin sol ve sağ kenarlarından taşmasını önleyecek güvenli sınırlar
    const minLeft = -24; // Sol y-ekseni boşluğu yönünde güvenli sınır
    const maxLeft = chartCanvasWidth - measuredTooltipWidth + 6; // Sağ padding yönünde sınır
    const clampedCardLeft = Math.max(minLeft, Math.min(idealLeft, maxLeft));

    // Okun kart içindeki X pozisyonu (Çubuğun tam merkezine denk gelecek şekilde)
    const rawArrowX = barX - clampedCardLeft;
    // Okun kartın köşelerinden çıkmasını önle (en az 12px içeride kalsın)
    const clampedArrowX = Math.max(12, Math.min(rawArrowX, measuredTooltipWidth - 12));

    return {
      cardLeft: clampedCardLeft,
      arrowOffset: clampedArrowX,
      isReadyWithPixels: true,
    };
  }, [resolvedActiveIndex, chartDays.length, chartCanvasWidth, measuredTooltipWidth]);

  // X Ekseni Etiketleri
  const xAxisLabels = useMemo(() => {
    if (chartDays.length === 0) return [];

    if (statPeriod === 'weekly') {
      return chartDays.map((item, idx) => ({
        key: item.key,
        label: formatShortDateTR(item.date),
        percent: ((idx + 0.5) / chartDays.length) * 100,
      }));
    }

    if (statPeriod === 'monthly') {
      // 28-31 gün için çakışmayan, dengeli aralıklar: 1, 8, 15, 22 ve ayın son günü
      const lastIdx = chartDays.length - 1;
      const targetIndices = [0, 7, 14, 21, lastIdx];
      return targetIndices.map((idx) => {
        const dayNum = idx + 1;
        return {
          key: chartDays[idx].key,
          label: `${dayNum} ${getMonthShortNameTR(Number(activeMonth.slice(5, 7)))}`,
          percent: ((idx + 0.5) / chartDays.length) * 100,
        };
      });
    }

    // yearly: 12 ay (2 ayda bir: Oca, Mar, May, Tem, Eyl, Kas)
    const targetIndices = [0, 2, 4, 6, 8, 10];
    return targetIndices.map((idx) => ({
      key: chartDays[idx].key,
      label: chartDays[idx].shortLabel,
      percent: ((idx + 0.5) / chartDays.length) * 100,
    }));
  }, [chartDays, statPeriod, activeMonth]);

  // Dönem Başlığı ve Gezinme Mantığı (‹ ... ›)
  const periodTitle = useMemo(() => {
    if (statPeriod === 'weekly') {
      if (chartDays.length >= 7) {
        const first = chartDays[0].date;
        const last = chartDays[6].date;
        return `${formatShortDateTR(first)} - ${formatShortDateTR(last)}`;
      }
      return 'Bu Hafta';
    }
    if (statPeriod === 'monthly') {
      return formatMonthTR(activeMonth);
    }
    return `${activeYear}`;
  }, [statPeriod, chartDays, activeMonth, activeYear]);

  const periodBadgeLabel = statPeriod === 'weekly' ? 'Haftalık' : statPeriod === 'monthly' ? 'Aylık' : 'Yıllık';

  const canGoNext = useMemo(() => {
    if (statPeriod === 'weekly') {
      return activeWeekOffset < 0;
    }
    if (statPeriod === 'monthly') {
      return activeMonth < todayIso.slice(0, 7);
    }
    return activeYear < new Date().getFullYear();
  }, [statPeriod, activeWeekOffset, activeMonth, activeYear, todayIso]);

  const handlePrevPeriod = useCallback(() => {
    smoothTransition();
    setActiveBarIndex(null);
    if (statPeriod === 'weekly') {
      setActiveWeekOffset((prev) => prev - 1);
    } else if (statPeriod === 'monthly') {
      setActiveMonth((prev) => offsetMonth(prev, -1));
    } else {
      setActiveYear((prev) => prev - 1);
    }
  }, [statPeriod]);

  const handleNextPeriod = useCallback(() => {
    if (!canGoNext) return;
    smoothTransition();
    setActiveBarIndex(null);
    if (statPeriod === 'weekly') {
      setActiveWeekOffset((prev) => prev + 1);
    } else if (statPeriod === 'monthly') {
      setActiveMonth((prev) => offsetMonth(prev, 1));
    } else {
      setActiveYear((prev) => prev + 1);
    }
  }, [canGoNext, statPeriod]);

  // ─── Grafiği Sağa / Sola Kaydırma (Swipe) PanResponder ───
  // Dikey ScrollView ile çakışmayı önler, sayfanın yukarı/aşağı kaymasını engeller.
  const chartPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const { dx, dy } = gestureState;
          // Hafif yatay kaydırmada hemen responder ol (dx > 7 ve yatay hareket dikeyden belirgin)
          return Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 0.7;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          const { dx, dy } = gestureState;
          // Dikey ScrollView'in dokunmayı çalmasını engellemek için capture fazında yakala
          return Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 0.7;
        },
        // Üst ScrollView'in responder'ı geri almasını KESİNLİKLE engelle!
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_, gestureState) => {
          const { dx, vx } = gestureState;
          // Yüksek hassasiyet: 18px mesafe veya 0.18px/ms hız (snappy flick veya hafif sürükleme)
          if (dx > 18 || vx > 0.18) {
            // Sağa kaydırma -> Önceki dönem
            handlePrevPeriod();
          } else if (dx < -18 || vx < -0.18) {
            // Sola kaydırma -> Sonraki dönem
            if (canGoNext) {
              handleNextPeriod();
            }
          }
        },
      }),
    [handlePrevPeriod, handleNextPeriod, canGoNext]
  );

  // Hafta Günlerine Dokunulduğunda Hem Tarihi Hem Grafiği Eşle
  const handleSelectWeekday = (dateStr: string) => {
    smoothTransition();
    setDraftLog(null);
    setSelectedDate(dateStr);
    const foundIdx = chartDays.findIndex((d) => d.date === dateStr);
    if (foundIdx >= 0) {
      setActiveBarIndex(foundIdx);
    } else if (statPeriod === 'monthly') {
      const monthPart = dateStr.slice(0, 7);
      if (monthPart !== activeMonth) {
        setActiveMonth(monthPart);
      }
    }
  };

  // ─── Hafta Günlerini Sağa/Sola Kaydırma (Swipe) ───
  const changeWeek = useCallback(
    (direction: 1 | -1) => {
      Animated.parallel([
        Animated.timing(weekSlideAnim, {
          toValue: direction === 1 ? -65 : 65,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(weekOpacityAnim, {
          toValue: 0.15,
          duration: 120,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start(() => {
        const newDate = offsetIsoDate(selectedDate, direction * 7);
        smoothTransition();
        setDraftLog(null);
        setSelectedDate(newDate);

        const foundIdx = chartDays.findIndex((d) => d.date === newDate);
        if (foundIdx >= 0) {
          setActiveBarIndex(foundIdx);
        } else if (statPeriod === 'monthly') {
          const monthPart = newDate.slice(0, 7);
          if (monthPart !== activeMonth) {
            setActiveMonth(monthPart);
          }
        }

        weekSlideAnim.setValue(direction === 1 ? 65 : -65);

        Animated.parallel([
          Animated.timing(weekSlideAnim, {
            toValue: 0,
            duration: 180,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: Platform.OS !== 'web',
          }),
          Animated.timing(weekOpacityAnim, {
            toValue: 1,
            duration: 180,
            useNativeDriver: Platform.OS !== 'web',
          }),
        ]).start();
      });
    },
    [selectedDate, chartDays, statPeriod, activeMonth, weekSlideAnim, weekOpacityAnim]
  );

  const weekPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 12 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
          );
        },
        onPanResponderMove: (_, gestureState) => {
          weekSlideAnim.setValue(gestureState.dx * 0.7);
          const op = Math.max(0.35, 1 - Math.abs(gestureState.dx) / 250);
          weekOpacityAnim.setValue(op);
        },
        onPanResponderRelease: (_, gestureState) => {
          const { dx, vx } = gestureState;

          if (dx < -32 || vx < -0.3) {
            changeWeek(1);
          } else if (dx > 32 || vx > 0.3) {
            changeWeek(-1);
          } else {
            Animated.parallel([
              Animated.timing(weekSlideAnim, {
                toValue: 0,
                duration: 140,
                easing: Easing.out(Easing.quad),
                useNativeDriver: Platform.OS !== 'web',
              }),
              Animated.timing(weekOpacityAnim, {
                toValue: 1,
                duration: 140,
                useNativeDriver: Platform.OS !== 'web',
              }),
            ]).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.parallel([
            Animated.timing(weekSlideAnim, {
              toValue: 0,
              duration: 120,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(weekOpacityAnim, {
              toValue: 1,
              duration: 120,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]).start();
        },
      }),
    [changeWeek, weekSlideAnim, weekOpacityAnim]
  );

  // Grafikte Bir Bara Dokunulduğunda
  // Çubuk seçilir, yumuşak animasyon anında (0ms) tetiklenir ve o günün bilgileri üst kartlara aktarılır
  const handleBarPress = useCallback(
    (index: number, dateStr: string) => {
      setSelectCounter((c) => c + 1);
      playBarSelectAnimation();
      setActiveBarIndex(index);
      if (statPeriod === 'weekly' || statPeriod === 'monthly') {
        setDraftLog(null);
        setSelectedDate(dateStr);
      }
    },
    [statPeriod, playBarSelectAnimation]
  );

  // Kaydetme Eylemi (Kaydet Butonu)
  const handleSavePress = useCallback(
    async (formData: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      notes: string;
    }) => {
      // Kaydet butonuna basıldığında üstteki dairelerin dolum animasyonunu sıfırdan tekrar çizdir
      setSaveTrigger((prev) => prev + 1);

      const safeCalories = Math.min(MAX_MACRO_LIMITS.calories, Math.max(0, formData.calories));
      const safeProtein = Math.min(MAX_MACRO_LIMITS.protein, Math.max(0, formData.protein));
      const safeCarbs = Math.min(MAX_MACRO_LIMITS.carbs, Math.max(0, formData.carbs));
      const safeFat = Math.min(MAX_MACRO_LIMITS.fat, Math.max(0, formData.fat));

      try {
        await saveLog({
          username: user?.username || 'user',
          log_date: selectedDate,
          calories: safeCalories,
          protein: safeProtein,
          carbs: safeCarbs,
          fat: safeFat,
          notes: formData.notes,
        });
        setDraftLog(null);
        Alert.alert('Başarılı', `${selectedDate} beslenme verileri kaydedildi.`);
      } catch (err: any) {
        Alert.alert('Hata', err?.message || 'Beslenme verisi kaydedilemedi.');
      }
    },
    [user, selectedDate, saveLog]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── 1. Header: Bugün ▾ & 1 ⚡ (Yumuşak Süzülme Animasyonlu Tarih Başlığı) ─── */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Animated.View
                style={{
                  opacity: headerFadeAnim,
                  transform: [
                    {
                      translateY: headerFadeAnim.interpolate({
                        inputRange: [0.2, 1],
                        outputRange: [-3, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text style={styles.dropdownTitle}>
                  {formatHeaderDate(selectedDate, todayIso)}
                </Text>
              </Animated.View>
              <ChevronDownIcon size={18} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>1</Text>
              <LightningIcon size={14} color="#F59E0B" />
            </View>
          </View>

          {/* ─── 2. Hafta Günleri Çubuğu (Sağa/Sola Kaydırmalı, Hedefe Göre Renkli Çerçeve) ─── */}
          <View style={styles.weekContainer}>
            <Animated.View
              {...weekPanResponder.panHandlers}
              style={[
                styles.weekRow,
                {
                  transform: [{ translateX: weekSlideAnim }],
                  opacity: weekOpacityAnim,
                },
              ]}
            >
              {weekDays.map((item) => {
                const isSelected = item.isSelected;
                const log = logMap.get(item.date);
                const cal = log?.calories || 0;
                const hasLog = cal > 0 || (log?.protein || 0) > 0;

                // Renklendirme mantığı:
                // 1. Hedefe ulaşılmışsa yeşil çerçeve
                // 2. Girdi var ama hedefe ulaşılamamışsa sarı çerçeve
                // 3. Boş ve bugün ise mor tam çevre
                // 4. Boş ise kırık kırık mor çevre
                let circleStatusStyle: ViewStyle = styles.dayCircleDashed;
                let circleBgColor = 'transparent';

                if (hasLog) {
                  if (cal >= targets.minCalories) {
                    circleStatusStyle = styles.dayCircleSuccess;
                    if (isSelected) circleBgColor = 'rgba(16, 185, 129, 0.2)';
                  } else {
                    circleStatusStyle = styles.dayCircleWarning;
                    if (isSelected) circleBgColor = 'rgba(245, 158, 11, 0.2)';
                  }
                } else if (item.isToday) {
                  circleStatusStyle = styles.dayCircleToday;
                  if (isSelected) circleBgColor = 'rgba(192, 132, 252, 0.2)';
                } else {
                  circleStatusStyle = styles.dayCircleDashed;
                  if (isSelected) circleBgColor = 'rgba(192, 132, 252, 0.15)';
                }

                return (
                  <PressableScale
                    key={item.date}
                    style={[styles.weekDayCol, isSelected && styles.weekDayColSelected]}
                    onPress={() => handleSelectWeekday(item.date)}
                    activeScale={0.92}
                  >
                    <Text style={[styles.weekDayLabel, isSelected && styles.weekDayLabelSelected]}>
                      {item.label}
                    </Text>
                    <View
                      style={[
                        styles.dayCircle,
                        circleStatusStyle,
                        { backgroundColor: circleBgColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayCircleNum,
                          isSelected && styles.dayCircleNumSelected,
                        ]}
                      >
                        {item.dayNum}
                      </Text>
                    </View>
                  </PressableScale>
                );
              })}
            </Animated.View>
          </View>

          {/* ─── 3. Yeni Kalori Kartı (Görseldeki Tasarım + Yarım Daire At Nalı Göstergesi) ─── */}
          <View style={styles.topCalorieCard}>
            <View style={styles.calCardLeft}>
              <Text style={styles.calCardBigNumber} numberOfLines={1}>
                {caloriesLeft >= 0
                  ? caloriesLeft.toLocaleString('tr-TR')
                  : Math.abs(caloriesLeft).toLocaleString('tr-TR')}
              </Text>
              <View style={styles.calCardLabelRow}>
                <Text style={styles.calCardLabel}>
                  {caloriesLeft >= 0 ? 'Kalan kalori' : 'Kalori aşıldı'}
                </Text>
                <Text style={styles.calCardSelector}> ↕</Text>
              </View>
              <Text style={styles.calCardMeta} numberOfLines={1} ellipsizeMode="tail">
                Hedef: {targets.calories.toLocaleString('tr-TR')} · Alınan: {currentCalories.toLocaleString('tr-TR')} kcal
              </Text>
            </View>
            <View style={styles.calCardRight}>
              <CalorieSemiCircleGauge
                percent={caloriePercent}
                focusTrigger={focusKey}
                saveTrigger={saveTrigger}
              />
            </View>
          </View>

          {/* ─── 4. Yeni Makro Hedefleri Kartı (Referans Tasarım Alt Kart - Yay Göstergeleri) ─── */}
          <View style={styles.macroGoalsCard}>
            <Text style={styles.macroGoalsTitle}>Makro hedefleri</Text>
            <View style={styles.macroGaugesRow}>
              {/* Yağ Yay Göstergesi */}
              <View style={styles.macroGaugeCol}>
                <SemiCircleGauge
                  percent={fatPercent}
                  color={colors.cyan}
                  amountText={fatRemaining >= 0 ? `${fatRemaining}g` : `${Math.abs(fatRemaining)}g`}
                  statusText={fatRemaining >= 0 ? 'kaldı' : 'aşıldı'}
                  focusTrigger={focusKey}
                  saveTrigger={saveTrigger}
                />
                <Text style={[styles.macroGaugeLabel, { color: colors.cyan }]}>Yağ</Text>
              </View>

              {/* Karbohidrat Yay Göstergesi */}
              <View style={styles.macroGaugeCol}>
                <SemiCircleGauge
                  percent={carbsPercent}
                  color={colors.orange}
                  amountText={carbsRemaining >= 0 ? `${carbsRemaining}g` : `${Math.abs(carbsRemaining)}g`}
                  statusText={carbsRemaining >= 0 ? 'kaldı' : 'aşıldı'}
                  focusTrigger={focusKey}
                  saveTrigger={saveTrigger}
                />
                <Text style={[styles.macroGaugeLabel, { color: colors.orange }]}>Karbohidrat</Text>
              </View>

              {/* Protein Yay Göstergesi */}
              <View style={styles.macroGaugeCol}>
                <SemiCircleGauge
                  percent={proteinPercent}
                  color={colors.rose}
                  amountText={proteinRemaining >= 0 ? `${proteinRemaining}g` : `${Math.abs(proteinRemaining)}g`}
                  statusText={proteinRemaining >= 0 ? 'kaldı' : 'aşıldı'}
                  focusTrigger={focusKey}
                  saveTrigger={saveTrigger}
                />
                <Text style={[styles.macroGaugeLabel, { color: colors.rose }]}>Protein</Text>
              </View>
            </View>
          </View>

          {/* ─── 5. "Bugün Ne Yedin?" Veri Giriş Formu (Modern Üst Kart Uyumu & Canlı Senkron) ─── */}
          <DailyInputForm
            initialLog={activeLog}
            targets={targets}
            onDraftChange={setDraftLog}
            onSave={handleSavePress}
            isSaving={isSaving}
          />

          {/* ─── 6. Beslenme İstatistikleri (Başlık Kartın İçinde) ─── */}
          <View
            style={[
              styles.card,
              {
                marginTop: 22,
                zIndex: menuMounted ? 200 : 1,
                elevation: menuMounted ? 10 : 1,
              },
            ]}
          >
            {/* Üst Satır: Kart İçi Başlık (Solda) + Sağda Açılır Neon Dönem Seçici Buton */}
            <View style={styles.statCardTopRow}>
              <Text style={styles.statCardTitle}>Beslenme istatistikleri</Text>

              <View style={{ position: 'relative', zIndex: 100 }}>
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
                    {(['weekly', 'monthly', 'yearly'] as const).map((p) => {
                      const label = p === 'weekly' ? 'Haftalık' : p === 'monthly' ? 'Aylık' : 'Yıllık';
                      const isSelected = statPeriod === p;
                      return (
                        <Pressable
                          key={p}
                          style={[
                            styles.periodDropdownItem,
                            isSelected && styles.periodDropdownItemActive,
                          ]}
                          onPress={() => {
                            smoothTransition();
                            setStatPeriod(p);
                            setActiveBarIndex(null);
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

            {/* Menü Açıkken Dışarı Basılınca Kapanması İçin Şeffaf Katman */}
            {menuMounted && (
              <Pressable
                style={styles.periodMenuBackdrop}
                onPress={() => closePeriodMenu()}
              />
            )}

            {/* 2×2 Tıklanabilir Ortalama Kartları (Kompakt ve Şık Tasarım) */}
            <View style={styles.statGrid}>
              <StatCardButton
                label={METRICS.calories.label}
                value={`${stats.avgCal} kcal`}
                color={METRICS.calories.color}
                isSelected={selectedMetric === 'calories'}
                onPress={() => {
                  smoothTransition();
                  setSelectedMetric('calories');
                }}
                triggerKey={`${statPeriod}_${activeWeekOffset}_${activeMonth}_${activeYear}`}
              />
              <StatCardButton
                label={METRICS.protein.label}
                value={`${stats.avgProt} g`}
                color={METRICS.protein.color}
                isSelected={selectedMetric === 'protein'}
                onPress={() => {
                  smoothTransition();
                  setSelectedMetric('protein');
                }}
                triggerKey={`${statPeriod}_${activeWeekOffset}_${activeMonth}_${activeYear}`}
              />
              <StatCardButton
                label={METRICS.carbs.label}
                value={`${stats.avgCarb} g`}
                color={METRICS.carbs.color}
                isSelected={selectedMetric === 'carbs'}
                onPress={() => {
                  smoothTransition();
                  setSelectedMetric('carbs');
                }}
                triggerKey={`${statPeriod}_${activeWeekOffset}_${activeMonth}_${activeYear}`}
              />
              <StatCardButton
                label={METRICS.fat.label}
                value={`${stats.avgFat} g`}
                color={METRICS.fat.color}
                isSelected={selectedMetric === 'fat'}
                onPress={() => {
                  smoothTransition();
                  setSelectedMetric('fat');
                }}
                triggerKey={`${statPeriod}_${activeWeekOffset}_${activeMonth}_${activeYear}`}
              />
            </View>

            {/* Dönem Gezinme Çubuğu (‹ 19 Eki - 25 Eki / Ekim 2026 / 2026 ›) */}
            <View style={styles.periodNavRow}>
              <TouchableOpacity
                style={styles.periodNavBtn}
                onPress={handlePrevPeriod}
                hitSlop={8}
                accessibilityLabel="Önceki Dönem"
              >
                <Text style={styles.periodNavArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.periodNavTitle}>{periodTitle}</Text>
              <TouchableOpacity
                style={[
                  styles.periodNavBtn,
                  !canGoNext && { opacity: 0.25 },
                ]}
                onPress={handleNextPeriod}
                disabled={!canGoNext}
                hitSlop={8}
                accessibilityLabel="Sonraki Dönem"
              >
                <Text style={styles.periodNavArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ─── İnce Dikey Çubuk Grafik & Etkileşimli İpucu (Tooltip & Neon Mor Tema) ─── */}
            <View
              style={styles.chartContainer}
              {...chartPanResponder.panHandlers}
            >
              {/* Tooltip & İndikatör Alanı (Çubuklarla Birebir Aynı X Ekseninde Hizalı) */}
              <View style={styles.tooltipRow}>
                {/* Sol Y Ekseni Boşluğu (Hizalamanın Barlarla 1:1 Eşleşmesi İçin) */}
                <View style={{ width: 32 }} />

                {/* Çubuklarla Birebir Aynı Genişlik ve Konumdaki Tooltip Çizim Alanı */}
                <View style={styles.tooltipCanvas} onLayout={handleCanvasLayout}>
                  {inspectedDay && (
                    <Animated.View
                      key={`tooltip-${resolvedActiveIndex}-${selectCounter}`}
                      style={[
                        styles.tooltipWrapper,
                        isReadyWithPixels
                          ? { left: cardLeft }
                          : {
                              left: `${cardLeft}%`,
                              transform: [{ translateX: -measuredTooltipWidth / 2 }],
                            },
                        {
                          opacity: tooltipAnim,
                          transform: [
                            ...(!isReadyWithPixels ? [{ translateX: -measuredTooltipWidth / 2 }] : []),
                            {
                              translateY: tooltipAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [12, 0],
                              }),
                            },
                            {
                              scale: tooltipAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.93, 1],
                              }),
                            },
                          ],
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.tooltipCard,
                          {
                            borderColor: activeMetricColor,
                            shadowColor: activeMetricColor,
                          },
                        ]}
                        onLayout={(e) => {
                          const w = e.nativeEvent.layout.width;
                          if (w > 0 && Math.abs(w - measuredTooltipWidth) > 1) {
                            setMeasuredTooltipWidth(w);
                          }
                        }}
                      >
                        <Text style={styles.tooltipValueText}>
                          {selectedMetric === 'calories'
                            ? `${formatNumberTR(inspectedDay.calories)} Kcal`
                            : `${formatNumberTR(inspectedDay[selectedMetric])} g`}
                        </Text>
                        <Text style={[styles.tooltipDateText, { color: activeMetricColor }]}>
                          {inspectedDay.displayDate}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.tooltipArrow,
                          {
                            borderTopColor: activeMetricColor,
                            marginLeft: Math.max(0, arrowOffset - 5),
                          },
                        ]}
                      />
                    </Animated.View>
                  )}
                </View>
              </View>

              {/* Grafik Gövdesi (Y Ekseni + Kılavuz Çizgileri + Çubuklar) */}
              <View style={styles.chartMainArea}>
                {/* Sol Y Ekseni Değerleri */}
                <View style={styles.yAxisCol}>
                  {ySteps.map((stepVal, idx) => (
                    <Text key={idx} style={styles.yAxisLabel}>
                      {stepVal}
                    </Text>
                  ))}
                </View>

                {/* Sağ Çizim Alanı */}
                <View style={styles.barsCanvas} onLayout={handleCanvasLayout}>
                  {/* Yatay İnce Izgara Çizgileri */}
                  {ySteps.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.gridLine,
                        {
                          top: (idx / (ySteps.length - 1)) * (CHART_HEIGHT - 1),
                        },
                      ]}
                    />
                  ))}

                  {/* Çubuklar Satırı (X Ekseninden Yukarıya Süzülen 60-120 FPS GPU Hızlandırmalı Animasyon) */}
                  <View style={styles.barsRow}>
                    {chartDays.map((item, index) => {
                      const isInspected = index === resolvedActiveIndex;
                      const barHeight = yMax > 0 && item.value > 0
                        ? Math.max(4, Math.round((item.value / yMax) * CHART_HEIGHT))
                        : 0;
                      const targetHeight = barHeight > 0 ? barHeight : 2;

                      // Çubuğun tabandan yukarıya 60-120fps GPU animasyonu (Native Driver)
                      const translateY = barAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [targetHeight / 2, 0],
                      });

                      const scaleY = barAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      });


                      return (
                        <Pressable
                          key={item.key}
                          style={styles.barSlot}
                          unstable_pressDelay={0}
                          android_disableSound={true}
                          hitSlop={{
                            top: 25,
                            bottom: 25,
                            left: statPeriod === 'monthly' ? 3 : 6,
                            right: statPeriod === 'monthly' ? 3 : 6,
                          }}
                          onPress={() => handleBarPress(index, item.date)}
                        >
                          {/* Çubuğun Tepesine Ulaşan İnce Gösterge Çizgisi (Yumuşak Geçişli) */}
                          {isInspected && (
                            <Animated.View
                              style={[
                                styles.neonIndicatorLine,
                                {
                                  bottom: targetHeight,
                                  height: Math.max(0, CHART_HEIGHT - targetHeight),
                                  opacity: selectedBarAnim.interpolate({
                                    inputRange: [0, 0.3, 1],
                                    outputRange: [0, 0.5, 0.9],
                                  }),
                                  transform: [
                                    {
                                      scaleY: selectedBarAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.15, 1],
                                      }),
                                    },
                                  ],
                                  backgroundColor: activeMetricColor,
                                },
                              ]}
                            />
                          )}

                          {/* İnce Çubuk (60-120 FPS GPU Hızlandırmalı, Yumuşak Seçilme Animasyonlu) */}
                          <Animated.View
                            style={[
                              styles.barPill,
                              {
                                height: targetHeight,
                                backgroundColor:
                                  barHeight > 0
                                    ? isInspected
                                      ? '#FFFFFF'
                                      : activeMetricColor
                                    : `${activeMetricColor}24`,
                                shadowColor: isInspected || barHeight > 0 ? activeMetricColor : 'transparent',
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: isInspected
                                  ? selectedBarAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0.35, 0.95],
                                    })
                                  : 0.35,
                                shadowRadius: isInspected
                                  ? selectedBarAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [2, 7],
                                    })
                                  : 2,
                                width:
                                  statPeriod === 'weekly'
                                    ? 14
                                    : statPeriod === 'yearly'
                                    ? 11
                                    : chartDays.length > 28
                                    ? 4.2
                                    : 5.5,
                                transform: [
                                  { translateY },
                                  { scaleY },
                                  {
                                    scale: isInspected
                                      ? selectedBarAnim.interpolate({
                                          inputRange: [0, 0.4, 1],
                                          outputRange: [0.96, 1.05, 1],
                                        })
                                      : 1,
                                  },
                                ],
                              },
                            ]}
                          />

                          {/* Seçili Bar Tepe Işıltı Kapsülü (Yumuşak Genişleme) */}
                          {isInspected && (
                            <Animated.View
                              style={{
                                position: 'absolute',
                                bottom: Math.max(0, targetHeight - 2),
                                width:
                                  (statPeriod === 'weekly'
                                    ? 14
                                    : statPeriod === 'yearly'
                                    ? 11
                                    : chartDays.length > 28
                                    ? 4.2
                                    : 5.5) + 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: '#FFFFFF',
                                shadowColor: activeMetricColor,
                                shadowOffset: { width: 0, height: 0 },
                                shadowOpacity: 1,
                                shadowRadius: 5,
                                opacity: selectedBarAnim,
                                transform: [
                                  {
                                    scale: selectedBarAnim.interpolate({
                                      inputRange: [0, 1],
                                      outputRange: [0.35, 1],
                                    }),
                                  },
                                ],
                              }}
                            />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Alt X Ekseni Tarih Etiketleri */}
              <View style={styles.xAxisRow}>
                <View style={{ width: 34 }} />
                <View style={styles.xAxisLabelsContainer}>
                  {xAxisLabels.map((lblItem) => (
                    <Text
                      key={lblItem.key}
                      style={[
                        styles.xAxisLabel,
                        { left: `${lblItem.percent}%` },
                      ]}
                    >
                      {lblItem.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Web Tarzı Takvimli Tarih Seçim Panosu */}
        <NutriCalendarModal
          key={`${showDatePicker}-${selectedDate}`}
          visible={showDatePicker}
          selectedDate={selectedDate}
          todayIso={todayIso}
          logMap={logMap}
          minCalories={targets.minCalories}
          onSelect={(newDate) => {
            smoothTransition();
            setDraftLog(null);
            setSelectedDate(newDate);
            const foundIdx = chartDays.findIndex((d) => d.date === newDate);
            if (foundIdx >= 0) {
              setActiveBarIndex(foundIdx);
            }
          }}
          onClose={() => setShowDatePicker(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },

  /* ─── 1. Header: Bugün ▾ & 1 ⚡ ─── */
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },

  /* ─── 2. Hafta Günleri Çubuğu ─── */
  weekContainer: {
    overflow: 'hidden',
    width: '100%',
    marginVertical: 14,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    width: '100%',
  },
  weekDayCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 20,
    minWidth: 44,
  },
  weekDayColSelected: {
    backgroundColor: '#161E33',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    paddingVertical: 8,
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  weekDayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 6,
  },
  weekDayLabelSelected: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayCircleSuccess: {
    borderColor: '#10B981', // Yeşil daire çerçevesi (Hedefe ulaşılmış)
    borderStyle: 'solid',
  },
  dayCircleWarning: {
    borderColor: '#F59E0B', // Sarı daire çerçevesi (Hedefe ulaşılamamış)
    borderStyle: 'solid',
  },
  dayCircleToday: {
    borderColor: '#C084FC', // Mor tam çevre (Bugün)
    borderStyle: 'solid',
  },
  dayCircleDashed: {
    borderColor: 'rgba(192, 132, 252, 0.45)', // Kırık kırık mor çevre (Boş gün)
    borderStyle: 'dashed',
  },
  dayCircleNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  dayCircleNumSelected: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ─── 3. Yeni Kalori Kartı (Görseldeki Tasarım + Yarım Daire At Nalı) ─── */
  topCalorieCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  calCardLeft: {
    flex: 1,
    marginRight: 8,
    minWidth: 0,
  },
  calCardBigNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.5,
  },
  calCardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 6,
  },
  calCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  calCardSelector: {
    fontSize: 12,
    color: colors.muted,
  },
  calCardMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
    letterSpacing: -0.2,
  },
  calCardRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calGaugeContainer: {
    width: 96,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calGaugeCenterTextWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  calGaugePercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.violet,
    marginTop: 1,
  },
  miniMacroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  miniMacroName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  miniMacroValue: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },

  /* ─── 4. Yeni Makro Hedefleri Kartı (Yay Göstergeleri) ─── */
  macroGoalsCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 16,
    marginBottom: 12,
  },
  macroGoalsTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  macroGaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  macroGaugeCol: {
    alignItems: 'center',
    flex: 1,
  },
  gaugeContainer: {
    width: 92,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeCenterTextWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },
  gaugeAmountText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
    maxWidth: 72,
    textAlign: 'center',
  },
  gaugeStatusText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.muted,
    marginTop: 0,
  },
  macroGaugeLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },

  /* ─── Bölüm Başlıkları ─── */
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  editIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(67, 214, 173, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(67, 214, 173, 0.35)',
  },

  /* ─── Kart Genel ─── */
  card: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    padding: 15,
    backgroundColor: colors.surface,
  },

  /* ─── 5. Yenilenen Modern Besin Giriş Formu (Üst Kart Uyumu - Mobil Optimize) ─── */
  modernInputCard: {
    backgroundColor: '#0B101E',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(99, 102, 241, 0.22)',
    padding: 13,
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  inputCardTitleGroup: {
    flex: 1,
    marginRight: 8,
    minWidth: 140,
  },
  inputCardHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3,
  },
  inputCardSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 2,
  },
  topCalBadge: {
    backgroundColor: 'rgba(23, 18, 48, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    minWidth: 92,
    maxWidth: 145,
    flexShrink: 0,
  },
  topCalLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 1.2,
    textAlign: 'center',
    marginBottom: 1,
  },
  topCalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  topCalValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    maxWidth: 75,
  },
  topCalUnit: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C084FC',
  },
  macroCardsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 13,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#0E1424',
    borderRadius: 14,
    borderWidth: 1.2,
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  macroCardProtein: {
    borderColor: 'rgba(244, 63, 94, 0.45)',
  },
  macroCardCarbs: {
    borderColor: 'rgba(245, 158, 11, 0.45)',
  },
  macroCardFat: {
    borderColor: 'rgba(6, 182, 212, 0.45)',
  },
  macroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  macroCardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  macroBadge: {
    width: 17,
    height: 17,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCardLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.1,
    flexShrink: 0,
  },
  macroValueDisplayRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  macroValueBigInput: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    paddingVertical: 0,
    paddingHorizontal: 0,
    margin: 0,
    textAlign: 'center',
    minWidth: 26,
  },
  macroValueUnitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 3,
  },
  notesSectionWrapper: {
    marginBottom: 13,
  },
  notesSectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 5,
  },
  notesInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101626',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    height: 42,
  },
  notesTextInput: {
    flex: 1,
    marginLeft: 7,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    padding: 0,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 13,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  clearBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  clearBtnText: {
    color: '#FB7185',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  saveBtnGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  saveBtnGreenText: {
    color: '#10B981',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* ─── İstatistikler Kartı Üst Satır (Kart İçi Başlık & Neon Dönem Butonu) ─── */
  statCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    zIndex: 100,
    gap: 10,
  },
  statCardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
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
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.35)',
    padding: 5,
    minWidth: 115,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 14,
    zIndex: 999,
  },
  periodDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  periodDropdownItemActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.16)',
  },
  periodDropdownItemText: {
    fontSize: 12,
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
  periodMenuBackdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 90,
  },

  /* ─── Tıklanabilir Ortalama Kartları Grid (Kompakt ve Şık) ─── */
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  statCard: {
    width: '48.6%',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  activeMetricDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statValue: {
    fontSize: 14.5,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.2,
  },

  /* ─── Dönem Gezinme Çubuğu (‹ Başlık ›) ─── */
  periodNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  periodNavBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  periodNavArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  periodNavTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 0.3,
  },

  /* ─── İnce Dikey Çubuk Grafik Kapsayıcısı ─── */
  chartContainer: {
    backgroundColor: '#090D1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginTop: 2,
  },

  /* ─── İpucu (Tooltip) & Neon Mor İndikatör ─── */
  tooltipRow: {
    height: 54,
    flexDirection: 'row',
    marginBottom: 6,
    position: 'relative',
  },
  tooltipCanvas: {
    flex: 1,
    height: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  tooltipWrapper: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'flex-start',
    zIndex: 10,
  },
  tooltipCard: {
    backgroundColor: '#16102E',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipValueText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tooltipDateText: {
    color: '#C084FC',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 1,
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#C084FC',
  },

  /* ─── Çizim Alanı (Y Ekseni + Barlar) ─── */
  chartMainArea: {
    flexDirection: 'row',
    height: CHART_HEIGHT,
    position: 'relative',
  },
  yAxisCol: {
    width: 32,
    height: CHART_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 2,
  },
  yAxisLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
  },
  barsCanvas: {
    flex: 1,
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  barsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CHART_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  barSlot: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  neonIndicatorLine: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: '#C084FC',
  },
  barPill: {
    borderRadius: 999,
  },

  /* ─── X Ekseni Etiketleri ─── */
  xAxisRow: {
    flexDirection: 'row',
    height: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  xAxisLabelsContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.muted,
    transform: [{ translateX: -14 }],
  },

  /* ─── Web Tarzı Takvim Panosu (Modal) ─── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
    color: colors.muted,
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
  calGridContainer: {
    overflow: 'hidden',
    width: '100%',
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
    backgroundColor: colors.violet,
    shadowColor: colors.violet,
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
    color: colors.violet,
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
    backgroundColor: '#10B981', // Yeşil (Min kalori hedefine ulaşılmış gün)
  },
  calWarningDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: '#F59E0B', // Sarı / Kehribar (Min değerin altında kalmış gün)
  },
  calTodayDot: {
    width: 4.5,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: colors.violet, // Mor (Bugün)
  },
});
