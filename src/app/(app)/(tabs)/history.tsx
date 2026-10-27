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
import Svg, { Path, Rect } from 'react-native-svg';

import { Skeleton } from '@/components/ui/skeleton';
import { useWorkouts } from '@/hooks/use-workouts';
import { workoutDraft } from '@/lib/workout-draft';
import type { ExerciseEntry, Workout } from '@/types/workout';

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

  // Mor / Vurgu (Web'deki hist-badge-purple, hist-badge-volume)
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
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
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
      <Path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Tarih Formatlama ───

function formatDateTR(dateIso?: string): string {
  if (!dateIso) return '—';
  const clean = dateIso.slice(0, 10);
  const parts = clean.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return clean;
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
            <TouchableOpacity
              style={styles.calClearBtn}
              onPress={() => {
                onClear();
                onClose();
              }}
            >
              <Text style={styles.calClearBtnText}>Filtreyi Temizle (Tümü)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.calConfirmBtn} onPress={onClose}>
              <Text style={styles.calConfirmBtnText}>Kapat</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Ana Ekran Bileşeni (Seans Kartları - Web Tasarımı) ───

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading, updateWorkout, deleteWorkout } = useWorkouts();

  // Aktif Sekme (Web'deki gibi: Antrenman Geçmişi | Beslenme Geçmişi)
  const [activeTab, setActiveTab] = useState<'workout' | 'nutrition'>('workout');

  // Filtreler
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);

  // Kart Genişletme Durumları
  // 1. Özet Görünümü Açık/Kapalı: Record<workoutId, boolean> (Varsayılan olarak hepsi özet halinde açık veya tıklanabilir)
  const [openSummaries, setOpenSummaries] = useState<Record<number, boolean>>(() => {
    // İlk renderda ilk 3 kart özet olarak açık olsun
    return {};
  });

  // 2. Detaylı Set & Tekrar Verileri Açık/Kapalı: Record<workoutId, boolean>
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

  // Özet Açma / Kapama (Kart Header Tıklanınca)
  const toggleSummary = (workoutId: number) => {
    setOpenSummaries((prev) => {
      // Varsayılan olarak açık ise (undefined -> true kabul edilirse) kapat, değilse aç
      const isCurrentlyOpen = prev[workoutId] !== false;
      return { ...prev, [workoutId]: !isCurrentlyOpen };
    });
  };

  // Detaylı Set & Tekrar Görünümünü Açma / Kapama ("Daha Fazla" Butonu)
  const toggleFull = (workoutId: number) => {
    setOpenFullDetails((prev) => {
      const next = !prev[workoutId];
      if (next) {
        // Detaylar açıldığında özet de açık kalmalı
        setOpenSummaries((sPrev) => ({ ...sPrev, [workoutId]: true }));
      }
      return { ...prev, [workoutId]: next };
    });
  };

  // Düzenleme Modunu Açma / Kapatma (Kalem İkonu)
  const toggleEdit = (workout: Workout) => {
    const wId = workout.id;
    setEditModes((prev) => {
      const next = !prev[wId];
      if (next) {
        // Düzenleme açılınca her iki panel de açılsın
        setOpenSummaries((sPrev) => ({ ...sPrev, [wId]: true }));
        setOpenFullDetails((fPrev) => ({ ...fPrev, [wId]: true }));
        // Egzersiz verilerinin derin kopyasını hazırla
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
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  activeTab === 'workout' && styles.segmentBtnActive,
                ]}
                onPress={() => setActiveTab('workout')}
                activeOpacity={0.8}
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
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  activeTab === 'nutrition' && styles.segmentBtnActive,
                ]}
                onPress={() => router.push('/(app)/(tabs)/nutrition')}
                activeOpacity={0.8}
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
              </TouchableOpacity>
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
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={6}>
                  <Text style={{ color: colors.textDim, fontSize: 13 }}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Takvim Açıcı Buton */}
            <TouchableOpacity
              style={[
                styles.calTriggerBtn,
                selectedDate !== null && styles.calTriggerBtnActive,
              ]}
              onPress={() => setShowCalendarModal(true)}
              activeOpacity={0.7}
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
            </TouchableOpacity>
          </View>

          {/* Aktif Tarih Filtresi Varsa Bilgilendirme Çipi */}
          {selectedDate && (
            <View style={styles.activeFilterPillRow}>
              <Text style={styles.activeFilterPillLabel}>Filtrelendi:</Text>
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterPillText}>{formatDateTR(selectedDate)}</Text>
                <TouchableOpacity onPress={() => setSelectedDate(null)} hitSlop={6}>
                  <Text style={styles.activeFilterPillClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => setSelectedDate(null)}>
                <Text style={styles.showAllText}>Tümünü Göster</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ─── 3. Seans Kartları Listesi (Web Platformuna Birebir Uyumlu) ─── */}
          {loading ? (
            <View style={styles.skeletonContainer}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} height={180} radius={16} style={styles.skeletonItem} />
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
                <TouchableOpacity
                  style={styles.clearFilterBtn}
                  onPress={() => setSelectedDate(null)}
                >
                  <Text style={styles.clearFilterBtnText}>Tüm Seansları Göster</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredWorkouts.map((w, index) => {
              const exercises = w.exercises || [];
              const isSummaryOpen = openSummaries[w.id] !== false; // Varsayılan açık
              const isFullOpen = !!openFullDetails[w.id];
              const isEditing = !!editModes[w.id];
              const isSaving = !!savingWorkoutIds[w.id];
              const currentExercises = isEditing && editingData[w.id] ? editingData[w.id] : exercises;

              return (
                <View key={w.id} style={styles.sessionCard}>
                  {/* ─── Seans Kartı Üst Barı (Header) ─── */}
                  <TouchableOpacity
                    style={styles.cardHeader}
                    activeOpacity={0.8}
                    onPress={() => toggleSummary(w.id)}
                  >
                    {/* Sol Kısım: Başlık, Hareket Sayısı Rozeti, Tarih & Mekan */}
                    <View style={styles.cardHeaderLeft}>
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
                    </View>

                    {/* Sağ Kısım: Toplam Hacim Rozeti & Aksiyon Butonları (Düzenle, Ayarlar, Sil) */}
                    <View style={styles.cardHeaderRight}>
                      {/* Toplam Hacim Rozeti (Görsel 1: 🟣 3.080 kg) */}
                      <View style={styles.volumeBadge}>
                        <View style={styles.volumeDot} />
                        <Text style={styles.volumeBadgeText}>
                          {Math.round(w.total_volume || 0).toLocaleString('tr-TR')} kg
                        </Text>
                      </View>

                      {/* Setleri Düzenle Butonu (Kalem) */}
                      <TouchableOpacity
                        style={[styles.headerActionBtn, styles.editActionBtn]}
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleEdit(w);
                        }}
                        hitSlop={6}
                      >
                        <PencilEditIcon size={14} color={colors.purple} />
                      </TouchableOpacity>

                      {/* Genel Düzenle / Seansı Aç Butonu (Sliders) */}
                      <TouchableOpacity
                        style={[styles.headerActionBtn, styles.tuneActionBtn]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleLoadToDraft(w);
                        }}
                        hitSlop={6}
                      >
                        <TuneSlidersIcon size={14} color={colors.cyanAction} />
                      </TouchableOpacity>

                      {/* Sil Butonu (Çöp Kutusu) */}
                      <TouchableOpacity
                        style={[styles.headerActionBtn, styles.deleteActionBtn]}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(w.id);
                        }}
                        hitSlop={6}
                      >
                        <TrashIcon size={14} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>

                  {/* Kapat / Aç İpucu */}
                  <TouchableOpacity
                    onPress={() => toggleSummary(w.id)}
                    style={styles.hintBar}
                  >
                    <Text style={styles.hintBarText}>
                      {isSummaryOpen ? 'Özeti kapatmak için tıkla' : 'Antrenman özetini görmek için tıkla'}
                    </Text>
                  </TouchableOpacity>

                  {/* ─── 1. AŞAMA: ÖZET GÖRÜNÜMÜ (Görsel 1 ile Birebir) ─── */}
                  {isSummaryOpen && (
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

                      {/* Daha Fazla (Set & Ağırlık Detayları) Butonu (Görsel 1) */}
                      <TouchableOpacity
                        style={[
                          styles.btnMore,
                          isFullOpen && styles.btnMoreActive,
                        ]}
                        onPress={() => toggleFull(w.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.btnMoreText}>
                          {isFullOpen
                            ? 'Daha Az Göster'
                            : 'Daha Fazla (Set & Ağırlık Detayları)'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* ─── 2. AŞAMA: DETAYLI SET & TEKRAR VERİLERİ (Görsel 2 ile Birebir) ─── */}
                  {isFullOpen && (
                    <View style={styles.fullDetailsContainer}>
                      {/* Detay Başlığı: ⚡ DETAYLI SET & TEKRAR VERİLERİ */}
                      <View style={styles.fullDetailsHeaderRow}>
                        <Text style={styles.fullDetailsTitle}>
                          ⚡ DETAYLI SET & TEKRAR VERİLERİ
                        </Text>
                        {isEditing && (
                          <TouchableOpacity
                            style={[styles.saveInlineBtn, isSaving && { opacity: 0.6 }]}
                            onPress={() => handleSaveEdit(w.id)}
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <Text style={styles.saveInlineBtnText}>Kaydet</Text>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>

                      {/* Her Egzersiz İçin Tablo Kartı (Görsel 2: 1. Bulgarian Split Squat vb.) */}
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

                            {/* Tablo Satırları (Görsel 2'deki Yeşil, Mavi ve Sarı Rozetler) */}
                            {sets.map((set, sIdx) => {
                              const wKg = parseFloat(String(set.weight_kg)) || 0;
                              const isBw = !!ex.is_bodyweight;

                              return (
                                <View key={sIdx} style={styles.tableRow}>
                                  {/* Sütun 1: SET (1. Set) */}
                                  <Text style={styles.colSetText}>{sIdx + 1}. Set</Text>

                                  {/* Sütun 2: AĞIRLIK (Görsel 2: [ 40 kg ] Yeşil Rozet) */}
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

                                  {/* Sütun 3: TEKRAR (Görsel 2: [ 6 Tekrar ] Mavi Rozet) */}
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

                                  {/* Sütun 4: RIR (Görsel 2: [ 0 RIR ] Sarı Rozet) */}
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
                    </View>
                  )}
                </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    flex: 1,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 9,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  segmentBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  totalSessionsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 6,
  },
  totalBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  totalBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.purple,
  },

  /* ─── 2. Hızlı Arama & Takvim Butonu ─── */
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIconText: {
    fontSize: 12,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 12.5,
    paddingVertical: 0,
  },
  calTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 6,
  },
  calTriggerBtnActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  calTriggerBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.purple,
  },
  calTriggerBtnTextActive: {
    color: '#FFFFFF',
  },

  /* Aktif Filtre Çipi */
  activeFilterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  activeFilterPillLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  activeFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 6,
  },
  activeFilterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
  },
  activeFilterPillClose: {
    fontSize: 11,
    color: colors.purple,
    fontWeight: '800',
  },
  showAllText: {
    fontSize: 11,
    color: colors.repsBlue,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  /* ─── 3. Seans Kartı (Görsel 1 & Görsel 2) ─── */
  sessionCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },

  /* Kart Üst Barı */
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardHeaderLeft: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  movementBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  movementBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.purple,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  subtitleDateText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  subtitleGymText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textMuted,
  },

  /* Kart Üst Sağ (Hacim ve Aksiyon Butonları) */
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    gap: 5,
  },
  volumeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purple,
  },
  volumeBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.purple,
  },
  headerActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editActionBtn: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  tuneActionBtn: {
    backgroundColor: colors.cyanActionBg,
    borderWidth: 1,
    borderColor: colors.cyanActionBorder,
  },
  deleteActionBtn: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },

  /* İpucu Barı */
  hintBar: {
    paddingVertical: 4,
    marginTop: 6,
  },
  hintBarText: {
    fontSize: 10.5,
    color: colors.textDim,
    textAlign: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 6,
  },
  summaryExerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  summarySetBadge: {
    backgroundColor: colors.repsBlueBg,
    borderWidth: 1,
    borderColor: colors.repsBlueBorder,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  summarySetBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.repsBlue,
  },

  /* Not Kutusu */
  notesBox: {
    marginTop: 6,
    marginBottom: 6,
    padding: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
    borderRadius: 8,
  },
  notesBoxTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.purple,
    marginBottom: 3,
  },
  notesBoxContent: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },

  /* Daha Fazla (Set & Ağırlık Detayları) Butonu (Görsel 1) */
  btnMore: {
    width: '100%',
    paddingVertical: 9,
    backgroundColor: colors.purpleButtonBg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  btnMoreActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    borderColor: 'rgba(139, 92, 246, 0.6)',
  },
  btnMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.purple,
    letterSpacing: 0.3,
  },

  /* ─── 2. Aşama: Detaylı Set & Tekrar Verileri (Görsel 2) ─── */
  fullDetailsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.25)',
  },
  fullDetailsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fullDetailsTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.purple,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  saveInlineBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  saveInlineBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Egzersiz Set Tablosu Kartı (Görsel 2) */
  exerciseSetsCard: {
    backgroundColor: 'rgba(10, 15, 26, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  exerciseSetsCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.purple,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  /* Tablo Başlıkları */
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 6,
  },
  thText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  colSet: {
    width: 60,
  },
  colWeight: {
    flex: 1.1,
    textAlign: 'center',
  },
  colReps: {
    flex: 1,
    textAlign: 'center',
  },
  colRir: {
    flex: 0.9,
    textAlign: 'center',
  },

  /* Tablo Satırı */
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  colSetText: {
    width: 60,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  colWeightContainer: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colRepsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colRirContainer: {
    flex: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Rozetler (View Mode) */
  weightBadge: {
    backgroundColor: colors.weightGreenBg,
    borderWidth: 1,
    borderColor: colors.weightGreenBorder,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.weightGreen,
  },

  repsBadge: {
    backgroundColor: colors.repsBlueBg,
    borderWidth: 1,
    borderColor: colors.repsBlueBorder,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repsBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.repsBlue,
  },

  rirBadge: {
    backgroundColor: colors.rirAmberBg,
    borderWidth: 1,
    borderColor: colors.rirAmberBorder,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    minWidth: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rirBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.rirAmber,
  },

  /* Düzenleme Giriş Kutuları (Edit Mode) */
  editInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 7,
    paddingHorizontal: 5,
    height: 30,
  },
  editTextInput: {
    color: colors.text,
    fontSize: 11.5,
    fontWeight: '700',
    paddingVertical: 0,
    textAlign: 'center',
    minWidth: 28,
  },
  editUnitLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textDim,
    marginLeft: 2,
  },
  editRirInputBox: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  editRirTextInput: {
    color: colors.rirAmber,
  },
  editRirUnitLabel: {
    fontSize: 9,
    color: colors.rirAmber,
    fontWeight: '800',
    marginLeft: 2,
  },

  /* ─── Boş Durum & İskelet ─── */
  skeletonContainer: {
    gap: 12,
  },
  skeletonItem: {
    marginBottom: 4,
  },
  emptyContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
  },
  clearFilterBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearFilterBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ─── Takvim Modalı ─── */
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
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.purpleBorder,
    padding: 16,
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
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  calHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  calTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  calSubtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  calCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    marginBottom: 10,
  },
  calNavBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  calNavArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
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
    width: 36,
    textAlign: 'center',
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 6,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  calCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  calCellSelected: {
    backgroundColor: '#7C3AED',
  },
  calCellText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.text,
  },
  calCellTextSelected: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  calCellTextToday: {
    fontWeight: '800',
    color: colors.weightGreen,
  },
  calWorkoutDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purple,
  },
  calTodayDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.weightGreen,
  },
  calFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  calClearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  calClearBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.repsBlue,
  },
  calConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  calConfirmBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.text,
  },
});
