import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated as RNAnimated,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Rect } from 'react-native-svg';

import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts } from '@/hooks/use-workouts';
import { workoutDraft } from '@/lib/workout-draft';
import type { ExerciseEntry, Workout } from '@/types/workout';

// Android için donanım hızlandırmalı LayoutAnimation etkinleştirme
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Düzgün, tek süzülme ile aşağı genişleme animasyon tetikleyicisi (Yay/salınım olmadan)
const triggerSmoothTransition = () => {
  try {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  } catch {
    // LayoutAnimation hata verirse sessizce devam et
  }
};

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
};

function PressableScale({
  children,
  onPress,
  style,
  activeScale = 0.95,
  hitSlop,
  disabled,
}: PressableScaleProps) {
  const [scale] = useState(() => new RNAnimated.Value(1));
  const [opacity] = useState(() => new RNAnimated.Value(1));

  const handlePressIn = () => {
    if (disabled) return;
    RNAnimated.parallel([
      RNAnimated.timing(scale, {
        toValue: activeScale,
        duration: 80,
        useNativeDriver: true,
      }),
      RNAnimated.timing(opacity, {
        toValue: 0.82,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    RNAnimated.parallel([
      RNAnimated.timing(scale, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
      RNAnimated.timing(opacity, {
        toValue: 1,
        duration: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      hitSlop={hitSlop}
      disabled={disabled}
    >
      <RNAnimated.View style={[style, { transform: [{ scale }], opacity }]}>
        {children}
      </RNAnimated.View>
    </Pressable>
  );
}

// ─── SVG İkonları ───

function DumbbellTabIcon({ size = 15, color = '#FFFFFF' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"
        stroke={color}
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function NutritionTabIcon({ size = 15, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CalendarIcon({ size = 14, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function PencilEditIcon({ size = 14, color = colors.purple }: { size?: number; color?: string }) {
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
}

function TuneSlidersIcon({ size = 14, color = colors.cyanAction }: { size?: number; color?: string }) {
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
}

function TrashIcon({ size = 14, color = colors.danger }: { size?: number; color?: string }) {
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
}

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

// ─── Tarih Formatlama Yardımcıları ───

function formatDateTR(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatMonthTR(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number);
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  return `${months[m - 1]} ${y}`;
}

// ─── Web Tarzı Tarih Seçim Panosu (Modal) ───

type CalendarModalProps = {
  visible: boolean;
  selectedDate: string | null;
  workoutDatesSet: Set<string>;
  onSelect: (dateIso: string) => void;
  onClear: () => void;
  onClose: () => void;
};

function WorkoutCalendarModal({
  visible,
  selectedDate,
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

  const handlePrev = () => {
    const [y, m] = viewMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    const pY = prev.getFullYear();
    const pM = String(prev.getMonth() + 1).padStart(2, '0');
    setViewMonth(`${pY}-${pM}`);
  };

  const handleNext = () => {
    const [y, m] = viewMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    const nY = next.getFullYear();
    const nM = String(next.getMonth() + 1).padStart(2, '0');
    setViewMonth(`${nY}-${nM}`);
  };

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
              <View>
                <Text style={styles.calTitle}>Tarihe Göre Filtrele</Text>
                <Text style={styles.calSubtitle}>Seans geçmişinde tarih seç</Text>
              </View>
            </View>
            <PressableScale style={styles.calCloseBtn} onPress={onClose} activeScale={0.88} hitSlop={8}>
              <CloseIcon size={16} color={colors.textMuted} />
            </PressableScale>
          </View>

          {/* Ay Gezintisi */}
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

          {/* Günler Grid */}
          <View style={styles.calGrid}>
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
                  {cell.hasWorkout && !isSelected && (
                    <View style={styles.calWorkoutDot} />
                  )}
                  {cell.isToday && !isSelected && !cell.hasWorkout && (
                    <View style={styles.calTodayDot} />
                  )}
                </PressableScale>
              );
            })}
          </View>

          {/* Alt Butonlar */}
          <View style={styles.calFooter}>
            <PressableScale
              style={styles.calClearBtn}
              activeScale={0.95}
              onPress={() => {
                onClear();
                onClose();
              }}
            >
              <Text style={styles.calClearBtnText}>Filtreyi Temizle (Tümü)</Text>
            </PressableScale>
            <PressableScale style={styles.calConfirmBtn} activeScale={0.95} onPress={onClose}>
              <Text style={styles.calConfirmBtnText}>Kapat</Text>
            </PressableScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Ana Ekran Bileşeni (HistoryScreen) ───

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading, updateWorkout, deleteWorkout } = useWorkouts();

  // Aktif Sekme (Web'deki gibi: Antrenman Geçmişi | Beslenme Geçmişi)
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

  // Filtreler
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Kart Genişletme Durumları (Görseldeki gibi varsayılan olarak hepsi KAPALI özet çubuğu)
  const [openSummaries, setOpenSummaries] = useState<Record<number, boolean>>({});
  const [openFullDetails, setOpenFullDetails] = useState<Record<number, boolean>>({});

  // Düzenleme Modu Durumları: Record<workoutId, boolean>
  const [editModes, setEditModes] = useState<Record<number, boolean>>({});
  const [editingData, setEditingData] = useState<Record<number, ExerciseEntry[]>>({});
  const [savingWorkoutIds, setSavingWorkoutIds] = useState<Record<number, boolean>>({});

  // Tüm antrenman tarihlerinin Set'i
  const workoutDatesSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of workouts) {
      if (w.date) {
        set.add(w.date.slice(0, 10));
      }
    }
    return set;
  }, [workouts]);

  // Filtrelenmiş ve Sıralanmış Seanslar
  const filteredWorkouts = useMemo(() => {
    return workouts
      .filter((w) => {
        // Tarih filtresi
        if (selectedDate && w.date && !w.date.startsWith(selectedDate)) {
          return false;
        }
        // Arama sorgusu
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

  // Özet Açma / Kapama (Karta basıldığında düzgün tek süzülme ile açılır/kapanır)
  const toggleSummary = (workoutId: number) => {
    triggerSmoothTransition();
    setOpenSummaries((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  // Detaylı Set & Tekrar Görünümünü Açma / Kapama ("Daha Fazla" Butonu)
  const toggleFull = (workoutId: number) => {
    triggerSmoothTransition();
    setOpenFullDetails((prev) => {
      const next = !prev[workoutId];
      if (next) {
        setOpenSummaries((sPrev) => ({ ...sPrev, [workoutId]: true }));
      }
      return { ...prev, [workoutId]: next };
    });
  };

  // Düzenleme Modunu Açma / Kapatma (Kalem İkonu)
  const toggleEdit = (workout: Workout) => {
    const wId = workout.id;
    triggerSmoothTransition();
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
  };

  // Set Değeri Değiştirme (Düzenleme Modunda)
  const handleSetChange = (
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
  };

  // Düzenlenen Seansı Kaydet
  const handleSaveEdit = async (workoutId: number) => {
    const currentExercises = editingData[workoutId];
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
  };

  // Seansı Komple Sil
  const handleDelete = (workoutId: number) => {
    Alert.alert(
      'Antrenmanı Sil',
      'Bu antrenman seansı tamamen silinecek. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              triggerSmoothTransition();
              await deleteWorkout(workoutId);
              Alert.alert('Silindi', 'Antrenman seansı silindi.');
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Antrenman silinemedi.');
            }
          },
        },
      ]
    );
  };

  // Antrenman Sekmesine Yükle (Tune İkonu)
  const handleLoadToDraft = (workout: Workout) => {
    workoutDraft.loadWorkout(workout);
    router.push('/(app)/(tabs)/workout');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── 1. Web Tarzı Üst Sekmeler & Seans Sayacı Rozeti (Görsel 1) ─── */}
          <View style={styles.topTabsBar}>
            {/* Sol: Sekme Butonları (Antrenman Geçmişi | Beslenme Geçmişi) */}
            <View style={styles.segmentedControl}>
              <PressableScale
                style={[
                  styles.segmentBtn,
                  activeTab === 'workout' && styles.segmentBtnActive,
                ]}
                onPress={() => setActiveTab('workout')}
                activeScale={0.96}
              >
                <DumbbellTabIcon
                  size={14}
                  color={activeTab === 'workout' ? '#FFFFFF' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    activeTab === 'workout' && styles.segmentBtnTextActive,
                  ]}
                >
                  Antrenman Geçmişi
                </Text>
              </PressableScale>

              <PressableScale
                style={[
                  styles.segmentBtn,
                  activeTab === 'nutrition' && styles.segmentBtnActive,
                ]}
                onPress={() => router.push('/(app)/(tabs)/nutrition')}
                activeScale={0.96}
              >
                <NutritionTabIcon
                  size={14}
                  color={activeTab === 'nutrition' ? '#FFFFFF' : colors.textMuted}
                />
                <Text
                  style={[
                    styles.segmentBtnText,
                    activeTab === 'nutrition' && styles.segmentBtnTextActive,
                  ]}
                >
                  Beslenme Geçmişi
                </Text>
              </PressableScale>
            </View>

            {/* Sağ: Toplam Seans Sayacı Rozeti (Görsel 1: Antrenman Kaydı: 55 Seans) */}
            <View style={styles.totalSessionsBadge}>
              <View style={styles.totalBadgeDot} />
              <Text style={styles.totalBadgeText}>
                {workouts.length} Seans
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

            {/* Takvim Açıcı Buton */}
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

          {/* ─── 3. Seans Kartları Listesi (Görseldeki Kapalı Kompakt Şerit Tasarımı) ─── */}
          {loading ? (
            <View style={styles.skeletonContainer}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={84} radius={16} style={styles.skeletonItem} />
              ))}
            </View>
          ) : filteredWorkouts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏋️</Text>
              <Text style={styles.emptyTitle}>Kayıtlı Seans Bulunamadı</Text>
              <Text style={styles.emptySubtitle}>
                {selectedDate
                  ? `${formatDateTR(selectedDate)} tarihinde kayıtlı antrenman seansı yok.`
                  : 'Henüz kaydedilmiş antrenman bulunmuyor.'}
              </Text>
              {selectedDate && (
                <PressableScale
                  style={styles.clearFilterBtn}
                  activeScale={0.95}
                  onPress={() => setSelectedDate(null)}
                >
                  <Text style={styles.clearFilterBtnText}>Tüm Seansları Göster</Text>
                </PressableScale>
              )}
            </View>
          ) : (
            filteredWorkouts.map((w) => {
              const exercises = w.exercises || [];
              const isSummaryOpen = !!openSummaries[w.id]; // Varsayılan kapalı (Görseldeki gibi)
              const isFullOpen = !!openFullDetails[w.id];
              const isEditing = !!editModes[w.id];
              const isSaving = !!savingWorkoutIds[w.id];
              const currentExercises = isEditing && editingData[w.id] ? editingData[w.id] : exercises;

              return (
                <Animated.View
                  key={w.id}
                  layout={LinearTransition.duration(240)}
                  style={styles.sessionCard}
                >
                  {/* ─── Seans Kartı Üst Barı (Header) ─── */}
                  <View style={styles.cardHeader}>
                    {/* Sol Kısım: Başlık, Hareket Sayısı Rozeti, Tarih & Mekan (Yay Animasyonlu Dokunmatik) */}
                    <PressableScale
                      style={styles.cardHeaderLeft}
                      activeScale={0.98}
                      onPress={() => toggleSummary(w.id)}
                    >
                      <View style={styles.titleRow}>
                        <Text style={styles.sessionTitle}>
                          {w.session_type || 'Antrenman'}
                        </Text>
                        <View style={styles.movementBadge}>
                          <Text style={styles.movementBadgeText}>
                            {exercises.length} Hareket
                          </Text>
                        </View>
                      </View>

                      <View style={styles.subtitleRow}>
                        <CalendarIcon size={12} color={colors.textMuted} />
                        <Text style={styles.subtitleDateText}>
                          {formatDateTR(w.date)}
                        </Text>
                        {w.gym_name ? (
                          <Text style={styles.subtitleGymText}>
                            • 📍 {w.gym_name}
                          </Text>
                        ) : null}
                      </View>
                    </PressableScale>

                    {/* Sağ Kısım: Sadece 3 Aksiyon Butonu (Hacim Göstergesi Kullanıcı İsteğiyle Kaldırıldı!) */}
                    <View style={styles.cardHeaderRight}>
                      {/* Setleri Düzenle Butonu (Kalem - Yay Animasyonlu) */}
                      <PressableScale
                        style={[styles.headerActionBtn, styles.editActionBtn]}
                        activeScale={0.88}
                        onPress={() => toggleEdit(w)}
                        hitSlop={6}
                      >
                        <PencilEditIcon size={14} color={colors.purple} />
                      </PressableScale>

                      {/* Genel Düzenle / Seansı Aç Butonu (Sliders - Yay Animasyonlu) */}
                      <PressableScale
                        style={[styles.headerActionBtn, styles.tuneActionBtn]}
                        activeScale={0.88}
                        onPress={() => handleLoadToDraft(w)}
                        hitSlop={6}
                      >
                        <TuneSlidersIcon size={14} color={colors.cyanAction} />
                      </PressableScale>

                      {/* Sil Butonu (Çöp Kutusu - Yay Animasyonlu) */}
                      <PressableScale
                        style={[styles.headerActionBtn, styles.deleteActionBtn]}
                        activeScale={0.88}
                        onPress={() => handleDelete(w.id)}
                        hitSlop={6}
                      >
                        <TrashIcon size={14} color={colors.danger} />
                      </PressableScale>
                    </View>
                  </View>

                  {/* Kapat / Aç İpucu Çubuğu (Görseldeki gibi ortalanmış ve animasyonlu) */}
                  <PressableScale
                    onPress={() => toggleSummary(w.id)}
                    style={styles.hintBar}
                    activeScale={0.98}
                  >
                    <Text style={styles.hintBarText}>
                      {isSummaryOpen ? 'Özeti kapatmak için tıkla ▴' : 'Antrenman özetini görmek için tıkla ▾'}
                    </Text>
                  </PressableScale>

                  {/* ─── 1. AŞAMA: ÖZET GÖRÜNÜMÜ (Tek süzülme ile aşağı açılır) ─── */}
                  {isSummaryOpen && (
                    <Animated.View
                      entering={FadeIn.duration(200)}
                      exiting={FadeOut.duration(150)}
                    >
                      <View style={styles.summaryContainer}>
                        {/* Hareketler Listesi: Ad ve Set Sayısı Rozeti */}
                        {exercises.map((ex, exIdx) => (
                          <View key={exIdx} style={styles.summaryExerciseRow}>
                            <Text style={styles.summaryExerciseName}>
                              {ex.exercise_name}
                            </Text>
                            <View style={styles.summarySetBadge}>
                              <Text style={styles.summarySetBadgeText}>
                                {ex.sets_data?.length || 0} Set
                              </Text>
                            </View>
                          </View>
                        ))}

                        {/* Not Bölümü (Görsel 1: 📝 NOT) */}
                        {w.notes && w.notes.trim() !== '' ? (
                          <View style={styles.notesBox}>
                            <Text style={styles.notesBoxTitle}>📝 NOT</Text>
                            <Text style={styles.notesBoxContent}>{w.notes}</Text>
                          </View>
                        ) : null}

                        {/* Daha Fazla (Set & Ağırlık Detayları) Butonu (Yay Animasyonlu) */}
                        <PressableScale
                          style={[
                            styles.btnMore,
                            isFullOpen && styles.btnMoreActive,
                          ]}
                          onPress={() => toggleFull(w.id)}
                          activeScale={0.97}
                        >
                          <Text style={styles.btnMoreText}>
                            {isFullOpen
                              ? 'Daha Az Göster ▴'
                              : 'Daha Fazla (Set & Ağırlık Detayları) ▾'}
                          </Text>
                        </PressableScale>
                      </View>

                      {/* ─── 2. AŞAMA: DETAYLI SET & TEKRAR VERİLERİ (Tek süzülme ile aşağı açılır) ─── */}
                      {isFullOpen && (
                        <Animated.View
                          entering={FadeIn.duration(200)}
                          exiting={FadeOut.duration(150)}
                          style={styles.fullDetailsContainer}
                        >
                          {/* Detay Başlığı: ⚡ DETAYLI SET & TEKRAR VERİLERİ */}
                          <View style={styles.fullDetailsHeaderRow}>
                            <Text style={styles.fullDetailsTitle}>
                              ⚡ DETAYLI SET & TEKRAR VERİLERİ
                            </Text>
                            {isEditing && (
                              <PressableScale
                                style={[styles.saveInlineBtn, isSaving && { opacity: 0.6 }]}
                                onPress={() => handleSaveEdit(w.id)}
                                disabled={isSaving}
                                activeScale={0.92}
                              >
                                {isSaving ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <Text style={styles.saveInlineBtnText}>Kaydet</Text>
                                )}
                              </PressableScale>
                            )}
                          </View>

                          {/* Her Egzersiz İçin Tablo Kartı (1. Bulgarian Split Squat vb.) */}
                          {currentExercises.map((ex, exIdx) => {
                            const sets = ex.sets_data || [];

                            return (
                              <View key={exIdx} style={styles.exerciseSetsCard}>
                                {/* Egzersiz Başlığı: 1. Bulgarian Split Squat */}
                                <Text style={styles.exerciseSetsCardTitle}>
                                  {exIdx + 1}. {ex.exercise_name}
                                </Text>

                                {/* Tablo Başlıkları: SET | AĞIRLIK | TEKRAR | RIR */}
                                <View style={styles.tableHeaderRow}>
                                  <Text style={[styles.thText, styles.colSet]}>SET</Text>
                                  <Text style={[styles.thText, styles.colWeight]}>AĞIRLIK</Text>
                                  <Text style={[styles.thText, styles.colReps]}>TEKRAR</Text>
                                  <Text style={[styles.thText, styles.colRir]}>RIR</Text>
                                </View>

                                {/* Tablo Satırları (Yeşil, Mavi ve Sarı Rozetler) */}
                                {sets.map((set, sIdx) => {
                                  const wKg = parseFloat(String(set.weight_kg)) || 0;
                                  const isBw = !!ex.is_bodyweight;

                                  return (
                                    <View key={sIdx} style={styles.tableRow}>
                                      {/* Sütun 1: SET (1. Set) */}
                                      <Text style={styles.colSetText}>{sIdx + 1}. Set</Text>

                                      {/* Sütun 2: AĞIRLIK (Yeşil Rozet) */}
                                      <View style={styles.colWeightContainer}>
                                        {isEditing ? (
                                          <View style={styles.editInputBox}>
                                            <TextInput
                                              style={styles.editTextInput}
                                              value={set.weight_kg !== undefined ? String(set.weight_kg) : ''}
                                              onChangeText={(txt) =>
                                                handleSetChange(w.id, exIdx, sIdx, 'weight_kg', txt)
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

                                      {/* Sütun 3: TEKRAR (Mavi Rozet) */}
                                      <View style={styles.colRepsContainer}>
                                        {isEditing ? (
                                          <View style={styles.editInputBox}>
                                            <TextInput
                                              style={styles.editTextInput}
                                              value={set.reps !== undefined ? String(set.reps) : ''}
                                              onChangeText={(txt) =>
                                                handleSetChange(w.id, exIdx, sIdx, 'reps', txt)
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

                                      {/* Sütun 4: RIR (Sarı Rozet) */}
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
                                                handleSetChange(w.id, exIdx, sIdx, 'rir', txt)
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
                        </Animated.View>
                      )}
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── 4. Web Tarzı Tarih Seçim Panosu Modalı ─── */}
      <WorkoutCalendarModal
        visible={showCalendarModal}
        selectedDate={selectedDate}
        workoutDatesSet={workoutDatesSet}
        onSelect={(newDate) => setSelectedDate(newDate)}
        onClear={() => setSelectedDate(null)}
        onClose={() => setShowCalendarModal(false)}
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
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* ─── 1. Üst Sekmeler & Seans Sayacı Rozeti ─── */
  topTabsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#0F1526',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 9,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#6D28D9',
    shadowColor: '#6D28D9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  segmentBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  totalSessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
  },
  totalBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
  },
  totalBadgeText: {
    fontSize: 12,
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
    flexWrap: 'wrap',
  },
  subtitleDateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  subtitleGymText: {
    fontSize: 12,
    color: colors.textMuted,
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

  /* ─── 1. Aşama: Özet Görünüm (Görsel 1) ─── */
  summaryContainer: {
    marginTop: 10,
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
  fullDetailsContainer: {
    marginTop: 14,
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
  },
  calHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  },
  calTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  calSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  calCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
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
  calWorkoutDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purple,
  },
  calTodayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  calFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  calClearBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calClearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  calConfirmBtn: {
    flex: 1,
    backgroundColor: colors.purple,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calConfirmBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
