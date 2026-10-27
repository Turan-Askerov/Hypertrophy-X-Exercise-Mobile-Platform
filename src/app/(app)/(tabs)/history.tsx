import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts } from '@/hooks/use-workouts';
import { workoutDraft } from '@/lib/workout-draft';
import type { ExerciseEntry, SetData, Workout } from '@/types/workout';

// ─── Cyber / Dark Tema Renkleri ───
const colors = {
  background: '#07090E',
  surface: '#111624',
  surfaceCard: '#151A28',
  surfaceCardExpanded: '#181E30',
  inputBg: '#1D2438',
  inputBorder: '#2E3A59',
  border: '#242C42',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  text: '#F8FAFC',
  textMuted: '#8E99AF',
  textDim: '#64748B',
  orange: '#FF5722',       // Aktif gün ve vurgu turuncusu (Görsellerdeki tema)
  orangeLight: '#FF7A59',
  orangeBadge: 'rgba(255, 87, 34, 0.15)',
  orangeBadgeBorder: 'rgba(255, 87, 34, 0.35)',
  mint: '#43D6AD',
  cyan: '#38BDF8',
  danger: '#FF7898',
};

// ─── SVG İkonları ───

function CalendarHeaderIcon({ size = 18, color = colors.orange }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="8" cy="14" r="1.2" fill={color} />
      <Circle cx="12" cy="14" r="1.2" fill={color} />
      <Circle cx="16" cy="14" r="1.2" fill={color} />
      <Circle cx="8" cy="18" r="1.2" fill={color} />
      <Circle cx="12" cy="18" r="1.2" fill={color} />
    </Svg>
  );
}

function ThreeDotsIcon({ size = 18, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </Svg>
  );
}

function ChevronDownIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M6 9l6 6 6-6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronUpIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 15l-6-6-6 6" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CloseIcon({ size = 16, color = colors.textMuted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

function TrashIcon({ size = 14, color = colors.danger }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Egzersiz Kategorisi İkonları
function ExerciseIcon({ name, muscle }: { name: string; muscle?: string }) {
  const lower = `${name} ${muscle || ''}`.toLowerCase();

  // Benchpress / Göğüs
  if (lower.includes('bench') || lower.includes('chest') || lower.includes('press') || lower.includes('göğüs')) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M4 18h16M7 18v-4h10v4M6 8h12M4 11h2M18 11h2M3 8v6M21 8v6" stroke={colors.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // Deadlift / Sırt / Pull
  if (lower.includes('deadlift') || lower.includes('back') || lower.includes('sırt') || lower.includes('row') || lower.includes('pull')) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="5" r="2.5" stroke={colors.orange} strokeWidth={2} />
        <Path d="M7 21l3-7 2 3 2-3 3 7M6 14h12M4 14l2-5 6-1 6 1 2 5" stroke={colors.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // Push-Up / Şınav / Vücut Ağırlığı
  if (lower.includes('push-up') || lower.includes('pushup') || lower.includes('şınav') || lower.includes('bodyweight')) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="18" cy="8" r="2" stroke={colors.orange} strokeWidth={2} />
        <Path d="M3 18l6-3 6-3 4 2M3 21h18M11 13l2 5" stroke={colors.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // Bicep / Curl / Kol
  if (lower.includes('curl') || lower.includes('bicep') || lower.includes('arm') || lower.includes('kol') || lower.includes('tricep')) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path d="M7 16a5 5 0 0110 0v2H7v-2zM9 11a3 3 0 016 0v2H9v-2zM6 18h12" stroke={colors.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // Bacak / Squat
  if (lower.includes('squat') || lower.includes('leg') || lower.includes('bacak') || lower.includes('calf') || lower.includes('lunge')) {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="4" r="2" stroke={colors.orange} strokeWidth={2} />
        <Path d="M7 21l2-8 3 4 3-4 2 8M6 9h12M10 9l2 5 2-5" stroke={colors.orange} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  // Genel Dambıl
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12" stroke={colors.orange} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── Tarih Yardımcıları ───

function getTodayIso(): string {
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

function formatHeaderSubtitle(dateIso: string, todayIso: string): string {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
  ];
  const [y, m, d] = dateIso.split('-').map(Number);

  if (dateIso === todayIso) {
    return `Bugün, ${d} ${months[m - 1]}`;
  }
  const yesterdayIso = offsetIsoDate(todayIso, -1);
  if (dateIso === yesterdayIso) {
    return `Dün, ${d} ${months[m - 1]}`;
  }

  const dt = new Date(y, m - 1, d);
  const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return `${dayNames[dt.getDay()]}, ${d} ${months[m - 1]}`;
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
  selectedDate: string;
  workoutDatesSet: Set<string>;
  onSelect: (dateIso: string) => void;
  onClose: () => void;
};

function WorkoutCalendarModal({
  visible,
  selectedDate,
  workoutDatesSet,
  onSelect,
  onClose,
}: CalendarModalProps) {
  const todayIso = useMemo(() => getTodayIso(), []);
  const [viewMonth, setViewMonth] = useState<string>(() => selectedDate.slice(0, 7));

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

  const handleQuick = (type: 'today' | 'yesterday') => {
    const targetIso = type === 'today' ? todayIso : offsetIsoDate(todayIso, -1);
    onSelect(targetIso);
    onClose();
  };

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
                <CalendarHeaderIcon size={18} color={colors.orange} />
              </View>
              <View>
                <Text style={styles.calTitle}>Tarih Seçimi</Text>
                <Text style={styles.calSubtitle}>Geriye dönük antrenman kaydı</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.calCloseBtn} onPress={onClose} hitSlop={8}>
              <CloseIcon size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Ay Gezintisi */}
          <View style={styles.calNav}>
            <TouchableOpacity style={styles.calNavBtn} onPress={handlePrev} hitSlop={8}>
              <Text style={styles.calNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthLabel}>{formatMonthTR(viewMonth)}</Text>
            <TouchableOpacity style={styles.calNavBtn} onPress={handleNext} hitSlop={8}>
              <Text style={styles.calNavArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Hafta Günleri (Pzt - Paz) */}
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
                <TouchableOpacity
                  key={cell.dateIso}
                  style={[
                    styles.calCell,
                    isSelected && styles.calCellSelected,
                  ]}
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
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Alt Butonlar */}
          <View style={styles.calFooter}>
            <View style={styles.calQuickRow}>
              <TouchableOpacity
                style={styles.calQuickBtn}
                onPress={() => handleQuick('today')}
              >
                <Text style={styles.calQuickBtnText}>Bugün</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.calQuickBtn}
                onPress={() => handleQuick('yesterday')}
              >
                <Text style={styles.calQuickBtnText}>Dün</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.calConfirmBtn} onPress={onClose}>
              <Text style={styles.calConfirmBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Ana Ekran Bileşeni ───

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading, refetch, updateWorkout, deleteWorkout } = useWorkouts();

  const todayIso = useMemo(() => getTodayIso(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Kart genişletme (Accordion) durumu: { [cardKey]: boolean }
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Düzenleme halindeki setler: { [cardKey]: SetData[] }
  const [editingSets, setEditingSets] = useState<Record<string, SetData[]>>({});
  const [savingKeys, setSavingKeys] = useState<Record<string, boolean>>({});

  // DB'de antrenman kaydı olan tüm günlerin Set'i
  const workoutDatesSet = useMemo(() => {
    const set = new Set<string>();
    for (const w of workouts) {
      if (w.date) {
        set.add(w.date.slice(0, 10));
      }
    }
    return set;
  }, [workouts]);

  // Seçili tarihe ait antrenman seansları
  const dayWorkouts = useMemo(() => {
    return workouts.filter((w) => w.date && w.date.slice(0, 10) === selectedDate);
  }, [workouts, selectedDate]);

  // ─── Haftalık Takvim Şeridi Günleri (Pzt - Paz) ───
  const weekDays = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dayOfWeek = dt.getDay(); // 0 is Sun, 1 is Mon
    const mondayOffset = (dayOfWeek + 6) % 7; // 0 for Mon

    const days = [];
    const trDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

    for (let i = 0; i < 7; i++) {
      const dayDt = new Date(y, m - 1, d - mondayOffset + i);
      const dayStr = String(dayDt.getDate()).padStart(2, '0');
      const monthStr = String(dayDt.getMonth() + 1).padStart(2, '0');
      const yearStr = dayDt.getFullYear();
      const iso = `${yearStr}-${monthStr}-${dayStr}`;

      days.push({
        dateIso: iso,
        dayNum: dayDt.getDate(),
        dayName: trDays[i],
        isSelected: iso === selectedDate,
        hasWorkout: workoutDatesSet.has(iso),
      });
    }
    return days;
  }, [selectedDate, workoutDatesSet]);

  // Önceki / Sonraki haftaya geçiş
  const handleShiftWeek = (offsetWeeks: number) => {
    setSelectedDate((curr) => offsetIsoDate(curr, offsetWeeks * 7));
  };

  // Kartı genişletme / daraltma
  const toggleExpand = (cardKey: string, initialSets: SetData[]) => {
    setExpandedCards((prev) => {
      const nextState = !prev[cardKey];
      if (nextState && !editingSets[cardKey]) {
        // Genişlerken mevcut set verilerini kopyala
        setEditingSets((ePrev) => ({
          ...ePrev,
          [cardKey]: initialSets.map((s) => ({ ...s })),
        }));
      }
      return { ...prev, [cardKey]: nextState };
    });
  };

  // Set verisi düzenleme (Kilo, Rep, RIR)
  const handleSetChange = (
    cardKey: string,
    setIndex: number,
    field: 'weight_kg' | 'reps' | 'rir',
    rawText: string
  ) => {
    const numVal = rawText === '' ? 0 : Number(rawText.replace(',', '.'));
    setEditingSets((prev) => {
      const current = prev[cardKey] ? [...prev[cardKey]] : [];
      if (!current[setIndex]) return prev;

      current[setIndex] = {
        ...current[setIndex],
        [field]: field === 'rir' && rawText === '' ? null : numVal,
      };

      return { ...prev, [cardKey]: current };
    });
  };

  // Yeni Set Ekleme
  const handleAddSet = (cardKey: string) => {
    setEditingSets((prev) => {
      const current = prev[cardKey] ? [...prev[cardKey]] : [];
      const last = current[current.length - 1];
      const newSet: SetData = {
        weight_kg: last?.weight_kg || 20,
        reps: last?.reps || 10,
        rir: 2,
      };
      return { ...prev, [cardKey]: [...current, newSet] };
    });
  };

  // Set Silme
  const handleDeleteSet = (cardKey: string, setIndex: number) => {
    setEditingSets((prev) => {
      const current = prev[cardKey] ? [...prev[cardKey]] : [];
      if (current.length <= 1) return prev;
      const updated = current.filter((_, idx) => idx !== setIndex);
      return { ...prev, [cardKey]: updated };
    });
  };

  // Değişiklikleri Veritabanına Kaydetme
  const handleSaveExercise = async (
    workout: Workout,
    exerciseIndex: number,
    cardKey: string
  ) => {
    const currentSets = editingSets[cardKey];
    if (!currentSets || currentSets.length === 0) {
      Alert.alert('Uyarı', 'En az bir set verisi bulunmalıdır.');
      return;
    }

    setSavingKeys((prev) => ({ ...prev, [cardKey]: true }));
    try {
      const updatedExercises: ExerciseEntry[] = workout.exercises.map((ex, idx) => {
        if (idx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets_data: currentSets,
        };
      });

      await updateWorkout({
        id: workout.id,
        data: {
          exercises: updatedExercises,
        },
      });

      Alert.alert('Başarılı', `${workout.exercises[exerciseIndex].exercise_name} setleri güncellendi.`);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Setler kaydedilirken sorun oluştu.');
    } finally {
      setSavingKeys((prev) => ({ ...prev, [cardKey]: false }));
    }
  };

  // Antrenmanı Komple Silme Seçeneği
  const handleDeleteWorkout = (workoutId: number) => {
    Alert.alert(
      'Antrenmanı Sil',
      'Bu antrenman kaydı tamamen silinecek. Emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteWorkout(workoutId);
              Alert.alert('Silindi', 'Antrenman kaydı silindi.');
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Antrenman silinemedi.');
            }
          },
        },
      ]
    );
  };

  // Antrenmanı Düzenleme Ekranına Yükle
  const handleEditInWorkoutTab = (workout: Workout) => {
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
          {/* ─── 1. Header: Workout & Today Date & Calendar Button ─── */}
          <View style={styles.topHeader}>
            <View style={styles.titleColumn}>
              <Text style={styles.mainTitle}>Antrenman</Text>
              <Text style={styles.subtitleText}>
                {formatHeaderSubtitle(selectedDate, todayIso)}
              </Text>
            </View>

            <View style={styles.headerRightActions}>
              <TouchableOpacity
                style={styles.calendarTriggerBtn}
                onPress={() => setShowCalendarModal(true)}
                activeOpacity={0.7}
                hitSlop={8}
              >
                <CalendarHeaderIcon size={20} color={colors.orange} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moreOptionsBtn}
                onPress={() => {
                  Alert.alert('Seçenekler', 'Geçmiş İşlemleri', [
                    { text: 'Bugüne Git', onPress: () => setSelectedDate(todayIso) },
                    { text: 'Yenile', onPress: () => refetch() },
                    { text: 'Yeni Antrenman Başlat', onPress: () => router.push('/(app)/(tabs)/workout') },
                    { text: 'Kapat', style: 'cancel' },
                  ]);
                }}
                activeOpacity={0.7}
                hitSlop={8}
              >
                <ThreeDotsIcon size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── 2. Haftalık Tarih Şeridi (Mon - Sun / Referans Fotoğraftaki Turuncu Seçim) ─── */}
          <View style={styles.weekSectionContainer}>
            <View style={styles.weekHeaderControls}>
              <TouchableOpacity
                style={styles.weekNavArrow}
                onPress={() => handleShiftWeek(-1)}
                hitSlop={8}
              >
                <Text style={styles.weekNavArrowText}>‹</Text>
              </TouchableOpacity>

              <View style={styles.weekStripRow}>
                {weekDays.map((item) => {
                  if (item.isSelected) {
                    return (
                      <View key={item.dateIso} style={styles.activeDayPill}>
                        <Text style={styles.activeDayNameText}>{item.dayName}</Text>
                        <Text style={styles.activeDayNumText}>{item.dayNum}</Text>
                      </View>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={item.dateIso}
                      style={styles.normalDayCol}
                      onPress={() => setSelectedDate(item.dateIso)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.normalDayNameText}>{item.dayName}</Text>
                      <Text style={styles.normalDayNumText}>{item.dayNum}</Text>
                      {item.hasWorkout && <View style={styles.workoutIndicatorDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.weekNavArrow}
                onPress={() => handleShiftWeek(1)}
                hitSlop={8}
              >
                <Text style={styles.weekNavArrowText}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── 3. Bölüm Başlığı: Antrenman Geçmişi (Workout History) ─── */}
          <View style={styles.historySectionHeader}>
            <Text style={styles.sectionTitle}>Antrenman Geçmişi</Text>
            {dayWorkouts.length > 0 && (
              <View style={styles.sessionCountBadge}>
                <Text style={styles.sessionCountBadgeText}>
                  {dayWorkouts[0].session_type || 'Kayıtlı Seans'}
                </Text>
              </View>
            )}
          </View>

          {/* ─── 4. Egzersiz Kartları Listesi (Görsel 1: Özet / Görsel 2: Açılan Panel & RIR Girdisi) ─── */}
          {loading ? (
            <View style={styles.loadingBox}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={110} radius={18} style={styles.skeletonItem} />
              ))}
            </View>
          ) : dayWorkouts.length === 0 ? (
            /* Seçili Günde Kayıt Yok */
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <ExerciseIcon name="Barbell" />
              </View>
              <Text style={styles.emptyTitle}>Bu Tarihte Antrenman Yok</Text>
              <Text style={styles.emptySubtitle}>
                {selectedDate} tarihinde henüz tamamlanmış bir antrenman kaydedilmemiş.
              </Text>

              <TouchableOpacity
                style={styles.startWorkoutBtn}
                onPress={() => router.push('/(app)/(tabs)/workout')}
              >
                <Text style={styles.startWorkoutBtnText}>Yeni Antrenman Başlat</Text>
              </TouchableOpacity>

              {/* Hızlı Son Antrenman Günleri */}
              {workoutDatesSet.size > 0 && (
                <View style={styles.recentWorkoutsCard}>
                  <Text style={styles.recentWorkoutsTitle}>Kayıtlı Son Antrenman Günleri:</Text>
                  <View style={styles.recentChipsWrap}>
                    {Array.from(workoutDatesSet)
                      .sort()
                      .reverse()
                      .slice(0, 4)
                      .map((dIso) => (
                        <TouchableOpacity
                          key={dIso}
                          style={styles.recentDateChip}
                          onPress={() => setSelectedDate(dIso)}
                        >
                          <Text style={styles.recentDateChipText}>{dIso}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* Kayıtlı Antrenman Seansları ve Hareket Kartları */
            dayWorkouts.map((workout) => {
              const exercises = workout.exercises || [];

              return (
                <View key={workout.id} style={styles.workoutSessionBlock}>
                  {/* Seans Üst Barı (Notlar veya Silme) */}
                  <View style={styles.workoutMetaBar}>
                    <Text style={styles.workoutVolumeText}>
                      Toplam Hacim: {workout.total_volume ? `${workout.total_volume.toLocaleString('tr-TR')} kg` : '—'}
                    </Text>
                    <View style={styles.workoutMetaActions}>
                      <TouchableOpacity
                        onPress={() => handleEditInWorkoutTab(workout)}
                        style={styles.metaActionBtn}
                      >
                        <Text style={styles.metaActionEditText}>Düzenle</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDeleteWorkout(workout.id)}
                        style={styles.metaActionBtn}
                      >
                        <Text style={styles.metaActionDeleteText}>Sil</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Egzersiz Kartları */}
                  {exercises.map((exercise, exIdx) => {
                    const cardKey = `w_${workout.id}_ex_${exIdx}`;
                    const isExpanded = !!expandedCards[cardKey];
                    const sets = exercise.sets_data || [];
                    const activeSets = editingSets[cardKey] || sets;
                    const isSaving = !!savingKeys[cardKey];

                    // Ortalama tekrar hesabı
                    const totalReps = sets.reduce((s, st) => s + (st.reps || 0), 0);
                    const avgReps = sets.length > 0 ? Math.round(totalReps / sets.length) : 0;
                    const totalExVol = sets.reduce(
                      (s, st) => s + (st.weight_kg || 0) * (st.reps || 0),
                      0
                    );

                    return (
                      <View
                        key={cardKey}
                        style={[
                          styles.exerciseCard,
                          isExpanded && styles.exerciseCardExpanded,
                        ]}
                      >
                        {/* ─── Kart Başlığı (Tıklanınca Açılır / Kapanır) ─── */}
                        <TouchableOpacity
                          style={styles.cardHeader}
                          activeOpacity={0.7}
                          onPress={() => toggleExpand(cardKey, sets)}
                        >
                          <View style={styles.cardIconCircle}>
                            <ExerciseIcon
                              name={exercise.exercise_name}
                              muscle={exercise.muscle_group}
                            />
                          </View>

                          <View style={styles.cardTitleBox}>
                            <Text style={styles.exerciseNameText}>
                              {exercise.exercise_name}
                            </Text>
                            <Text style={styles.exerciseSubText}>
                              {isExpanded
                                ? `${sets.length} SET • Toplam ${totalExVol.toLocaleString('tr-TR')} kg`
                                : `${sets.length} SETS X ${avgReps} REPS`}
                            </Text>
                          </View>

                          <View style={styles.cardHeaderRight}>
                            {isExpanded ? (
                              <ChevronUpIcon size={20} color={colors.textMuted} />
                            ) : (
                              <ChevronDownIcon size={20} color={colors.textMuted} />
                            )}
                          </View>
                        </TouchableOpacity>

                        {/* ─── 1. DURUM: KAPALI ÖZET GÖRÜNÜMÜ (Görsel 1 ile Birebir) ─── */}
                        {!isExpanded && (
                          <View style={styles.collapsedSummaryList}>
                            {sets.map((set, sIdx) => (
                              <View key={sIdx} style={styles.collapsedSummaryRow}>
                                <Text style={styles.collapsedIndexText}>{sIdx + 1}</Text>
                                <Text style={styles.collapsedWeightText}>
                                  {set.weight_kg} kg
                                </Text>
                                <Text style={styles.collapsedRepsText}>
                                  {set.reps} reps
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* ─── 2. DURUM: GENİŞLETİLMİŞ DÜZENLEME PANELİ (Görsel 2 + RIR Girdisi) ─── */}
                        {isExpanded && (
                          <View style={styles.expandedPanel}>
                            {/* Tablo Sütun Başlıkları: SET | KİLO (KG) | TEKRAR | RIR (Done yerine RIR) */}
                            <View style={styles.tableHeaderRow}>
                              <Text style={[styles.colHeader, styles.colSet]}>SET</Text>
                              <Text style={[styles.colHeader, styles.colFlex]}>
                                WEIGHT(KG)
                              </Text>
                              <Text style={[styles.colHeader, styles.colFlex]}>
                                REPS
                              </Text>
                              <Text style={[styles.colHeader, styles.colFlex]}>
                                RIR
                              </Text>
                              <View style={styles.colDeleteSpacer} />
                            </View>

                            {/* Set Satırları */}
                            {activeSets.map((set, sIdx) => (
                              <View key={sIdx} style={styles.tableRow}>
                                {/* Set Numarası Rozeti */}
                                <View style={styles.setNumBox}>
                                  <Text style={styles.setNumText}>{sIdx + 1}</Text>
                                </View>

                                {/* Kilo (kg) Girişi */}
                                <View style={styles.inputWrapper}>
                                  <TextInput
                                    style={styles.numInput}
                                    value={set.weight_kg !== undefined ? String(set.weight_kg) : ''}
                                    onChangeText={(txt) =>
                                      handleSetChange(cardKey, sIdx, 'weight_kg', txt)
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.textDim}
                                  />
                                </View>

                                {/* Tekrar (Reps) Girişi */}
                                <View style={styles.inputWrapper}>
                                  <TextInput
                                    style={styles.numInput}
                                    value={set.reps !== undefined ? String(set.reps) : ''}
                                    onChangeText={(txt) =>
                                      handleSetChange(cardKey, sIdx, 'reps', txt)
                                    }
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={colors.textDim}
                                  />
                                </View>

                                {/* RIR Girişi (Görsel 2'deki Done checkbox'ı yerine RIR kutusu) */}
                                <View style={[styles.inputWrapper, styles.rirInputWrapper]}>
                                  <TextInput
                                    style={[styles.numInput, styles.rirInputText]}
                                    value={
                                      set.rir !== undefined && set.rir !== null
                                        ? String(set.rir)
                                        : ''
                                    }
                                    onChangeText={(txt) =>
                                      handleSetChange(cardKey, sIdx, 'rir', txt)
                                    }
                                    keyboardType="numeric"
                                    placeholder="RIR"
                                    placeholderTextColor={colors.textDim}
                                  />
                                </View>

                                {/* Set Silme Butonu */}
                                <View style={styles.deleteActionBox}>
                                  {activeSets.length > 1 ? (
                                    <TouchableOpacity
                                      style={styles.deleteRowBtn}
                                      onPress={() => handleDeleteSet(cardKey, sIdx)}
                                      hitSlop={6}
                                    >
                                      <TrashIcon size={14} color={colors.danger} />
                                    </TouchableOpacity>
                                  ) : (
                                    <View style={{ width: 14 }} />
                                  )}
                                </View>
                              </View>
                            ))}

                            {/* Panel Alt Eylemleri (+ Set Ekle & Kaydet) */}
                            <View style={styles.panelFooterActions}>
                              <TouchableOpacity
                                style={styles.addSetBtn}
                                onPress={() => handleAddSet(cardKey)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.addSetBtnText}>+ Set Ekle</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                                onPress={() => handleSaveExercise(workout, exIdx, cardKey)}
                                disabled={isSaving}
                                activeOpacity={0.7}
                              >
                                {isSaving ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <Text style={styles.saveBtnText}>Kaydet</Text>
                                )}
                              </TouchableOpacity>
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── 5. Web Tarzı Tarih Seçim Panosu Modal ─── */}
      <WorkoutCalendarModal
        visible={showCalendarModal}
        selectedDate={selectedDate}
        workoutDatesSet={workoutDatesSet}
        onSelect={(newDate) => setSelectedDate(newDate)}
        onClose={() => setShowCalendarModal(false)}
      />
    </SafeAreaView>
  );
}

// ─── Stiller ───

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },

  /* ─── 1. Header ─── */
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  titleColumn: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTriggerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 87, 34, 0.12)',
    borderWidth: 1,
    borderColor: colors.orangeBadgeBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreOptionsBtn: {
    width: 36,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ─── 2. Haftalık Tarih Şeridi ─── */
  weekSectionContainer: {
    marginBottom: 18,
  },
  weekHeaderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekNavArrow: {
    width: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavArrowText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDim,
  },
  weekStripRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  normalDayCol: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 38,
  },
  normalDayNameText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 6,
  },
  normalDayNumText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  workoutIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
    marginTop: 4,
  },

  /* Aktif Seçili Gün Hapı (Görsel 1 Turuncu Kutu) */
  activeDayPill: {
    backgroundColor: colors.orange,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  activeDayNameText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activeDayNumText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  /* ─── 3. Bölüm Başlığı ─── */
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  sessionCountBadge: {
    backgroundColor: 'rgba(255, 87, 34, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.orangeBadgeBorder,
  },
  sessionCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.orangeLight,
  },

  /* ─── 4. Egzersiz Kartları ─── */
  workoutSessionBlock: {
    marginBottom: 16,
  },
  workoutMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  workoutVolumeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  workoutMetaActions: {
    flexDirection: 'row',
    gap: 12,
  },
  metaActionBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  metaActionEditText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.cyan,
  },
  metaActionDeleteText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.danger,
  },

  exerciseCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 16,
    marginBottom: 12,
  },
  exerciseCardExpanded: {
    backgroundColor: colors.surfaceCardExpanded,
    borderColor: 'rgba(255, 87, 34, 0.3)',
  },

  /* Kart Üst Başlık */
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.orangeBadge,
    borderWidth: 1,
    borderColor: colors.orangeBadgeBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitleBox: {
    flex: 1,
  },
  exerciseNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  exerciseSubText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    marginTop: 3,
  },
  cardHeaderRight: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ─── Kapalı Özet Görünüm (Görsel 1) ─── */
  collapsedSummaryList: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
  },
  collapsedSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  collapsedIndexText: {
    width: 32,
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDim,
  },
  collapsedWeightText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  collapsedRepsText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'right',
  },

  /* ─── Açılan Düzenleme Paneli (Görsel 2) ─── */
  expandedPanel: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  colSet: {
    width: 38,
    textAlign: 'center',
  },
  colFlex: {
    flex: 1,
    textAlign: 'center',
  },
  colDeleteSpacer: {
    width: 24,
  },

  /* Set Satırı */
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#192033',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  setNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 3,
  },
  numInput: {
    height: 38,
    borderRadius: 8,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  rirInputWrapper: {
    borderColor: colors.orangeBadgeBorder,
  },
  rirInputText: {
    borderColor: 'rgba(255, 87, 34, 0.4)',
    color: colors.orangeLight,
    fontWeight: '800',
  },
  deleteActionBox: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
  },
  deleteRowBtn: {
    padding: 4,
  },

  /* Panel Alt Butonları */
  panelFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
  },
  addSetBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  addSetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  saveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 78,
  },
  saveBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ─── Boş Durum ─── */
  loadingBox: {
    gap: 12,
    marginTop: 8,
  },
  skeletonItem: {
    marginBottom: 4,
  },
  emptyContainer: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.orangeBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  startWorkoutBtn: {
    backgroundColor: colors.orange,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  startWorkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  recentWorkoutsCard: {
    width: '100%',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
  },
  recentWorkoutsTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 10,
  },
  recentChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  recentDateChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  recentDateChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.text,
  },

  /* ─── Takvim Modalı Stilleri ─── */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  calHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
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
    backgroundColor: colors.orangeBadge,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.orangeBadgeBorder,
  },
  calTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  calSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  calCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    marginBottom: 12,
  },
  calNavBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  calNavArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  calMonthLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  calWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  calWeekdayName: {
    width: 38,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  calCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calCellSelected: {
    backgroundColor: colors.orange,
  },
  calCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  calCellTextSelected: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  calCellTextToday: {
    fontWeight: '800',
    color: colors.mint,
  },
  calWorkoutDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.orange,
  },
  calTodayDot: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.mint,
  },
  calFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  calQuickRow: {
    flexDirection: 'row',
    gap: 8,
  },
  calQuickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  calQuickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  calConfirmBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  calConfirmBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
  },
});
