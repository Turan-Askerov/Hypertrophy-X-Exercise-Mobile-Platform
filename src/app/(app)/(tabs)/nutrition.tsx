import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  GestureResponderEvent,
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
import Svg, { Path } from 'react-native-svg';

import { useNutrition } from '@/hooks/use-nutrition';
import { useUser } from '@/hooks/use-user';

// ─── Renk Token'ları (Cyber Dark Theme) ───
const colors = {
  background: '#070B18',
  surface: '#111A2F',
  surfaceAlt: '#17223B',
  inputCardBg: '#112333',
  inputBackground: '#080E1C',
  border: '#263452',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  text: '#F5F7FF',
  muted: '#8995B2',
  violet: '#A78BFA', // Kalori & Ana Vurgu
  mint: '#43D6AD',   // Protein
  orange: '#FFAD21', // Karbonhidrat
  cyan: '#39C6EF',   // Yağ
  danger: '#FF7898', // Temizle & Hata
  blue: '#2F80ED',   // Kalori İlerleme Çubuğu
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
    color: '#34D399',
    key: 'protein',
  },
  carbs: {
    label: 'Ort. Karbonhidrat 🍞',
    unit: 'g',
    color: '#FBBF24',
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

function CheckMiniIcon({ size = 11, color = '#070B18' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </Svg>
  );
}

function SwapIcon({ size = 16, color = colors.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4"
      />
    </Svg>
  );
}

function PencilEditIcon({ size = 16, color = colors.mint }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
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

function formatNumberTR(num: number): string {
  if (num % 1 === 0) {
    return num.toLocaleString('tr-TR');
  }
  return num.toLocaleString('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

function calculateYAxisSteps(maxValue: number): number[] {
  let roundedMax = 100;
  if (maxValue <= 50) roundedMax = 50;
  else if (maxValue <= 100) roundedMax = 100;
  else if (maxValue <= 200) roundedMax = 200;
  else if (maxValue <= 400) roundedMax = 400;
  else if (maxValue <= 750) roundedMax = 750;
  else if (maxValue <= 1000) roundedMax = 1000;
  else if (maxValue <= 1500) roundedMax = 1500;
  else if (maxValue <= 2000) roundedMax = 2000;
  else if (maxValue <= 2500) roundedMax = 2500;
  else if (maxValue <= 3000) roundedMax = 3000;
  else if (maxValue <= 4000) roundedMax = 4000;
  else roundedMax = Math.ceil(maxValue / 500) * 500;

  return [
    roundedMax,
    Math.round((roundedMax * 2) / 3),
    Math.round(roundedMax / 3),
    0,
  ];
}

function getWeekDaysForDate(selectedDateIso: string, todayIso: string) {
  const [y, m, d] = selectedDateIso.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  let dayOfWeek = dateObj.getDay() - 1; // 0: Pazartesi ... 6: Pazar
  if (dayOfWeek < 0) dayOfWeek = 6;

  // Haftanın başlangıcı Pazartesi:
  const monday = new Date(y, m - 1, d - dayOfWeek);

  const labels = ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
  const fullNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  const result = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const cY = cur.getFullYear();
    const cM = String(cur.getMonth() + 1).padStart(2, '0');
    const cD = String(cur.getDate()).padStart(2, '0');
    const iso = `${cY}-${cM}-${cD}`;
    result.push({
      label: labels[i],
      shortName: fullNames[i],
      date: iso,
      dayNum: cur.getDate(),
      isToday: iso === todayIso,
      isSelected: iso === selectedDateIso,
    });
  }
  return result;
}

function getMonthCalendarDays(yearMonth: string, todayIso: string) {
  const [y, m] = yearMonth.split('-').map(Number);
  const firstDayObj = new Date(y, m - 1, 1);
  let firstDayIndex = firstDayObj.getDay() - 1;
  if (firstDayIndex < 0) firstDayIndex = 6;

  const daysInMonth = new Date(y, m, 0).getDate();
  const cells: ({ dayNum: number; dateIso: string; isFuture: boolean; isToday: boolean } | null)[] = [];

  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(null);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const iso = `${y}-${mStr}-${dStr}`;
    cells.push({
      dayNum: d,
      dateIso: iso,
      isFuture: iso > todayIso,
      isToday: iso === todayIso,
    });
  }

  return cells;
}

// ─── Web Tarzı Tarih Seçim Panosu (NutriCalendarModal) ───

type NutriCalendarModalProps = {
  visible: boolean;
  selectedDate: string;
  todayIso: string;
  onSelect: (dateStr: string) => void;
  onClose: () => void;
};

function NutriCalendarModal({
  visible,
  selectedDate,
  todayIso,
  onSelect,
  onClose,
}: NutriCalendarModalProps) {
  const [viewMonth, setViewMonth] = useState<string>(() => selectedDate.slice(0, 7));

  const calendarCells = useMemo(
    () => getMonthCalendarDays(viewMonth, todayIso),
    [viewMonth, todayIso]
  );

  const handlePrev = () => {
    setViewMonth((prev) => offsetMonth(prev, -1));
  };

  const handleNext = () => {
    if (viewMonth < todayIso.slice(0, 7)) {
      setViewMonth((prev) => offsetMonth(prev, 1));
    }
  };

  const handleQuick = (type: 'today' | 'yesterday') => {
    if (type === 'today') {
      onSelect(todayIso);
    } else {
      onSelect(offsetIsoDate(todayIso, -1));
    }
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
                <CalendarIcon size={18} color={colors.violet} />
              </View>
              <View>
                <Text style={styles.calTitle}>Tarih Seçimi</Text>
                <Text style={styles.calSubtitle}>Geriye dönük beslenme kaydı</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.calCloseBtn} onPress={onClose} hitSlop={8}>
              <CloseIcon size={16} color={colors.muted} />
            </TouchableOpacity>
          </View>

          {/* Ay / Yıl Gezgini */}
          <View style={styles.calNav}>
            <TouchableOpacity style={styles.calNavBtn} onPress={handlePrev} hitSlop={8}>
              <Text style={styles.calNavArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.calMonthLabel}>{formatMonthTR(viewMonth)}</Text>
            <TouchableOpacity
              style={[
                styles.calNavBtn,
                viewMonth >= todayIso.slice(0, 7) && { opacity: 0.3 },
              ]}
              onPress={handleNext}
              disabled={viewMonth >= todayIso.slice(0, 7)}
              hitSlop={8}
            >
              <Text style={styles.calNavArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Hafta Günleri Başlığı (Pzt Sal Çar Per Cum Cmt Paz) */}
          <View style={styles.calWeekdaysRow}>
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((wName) => (
              <Text key={wName} style={styles.calWeekdayName}>
                {wName}
              </Text>
            ))}
          </View>

          {/* Günler Grid'i (7 sütun) */}
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
                    cell.isFuture && styles.calCellDisabled,
                  ]}
                  disabled={cell.isFuture}
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
                  {cell.isToday && !isSelected && (
                    <View style={styles.calTodayDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Alt Hızlı Butonlar & Kapat */}
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
              <Text style={styles.calConfirmBtnText}>Tamam</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Tıklanabilir Ortalama Kart Butonu ───

type StatCardButtonProps = {
  label: string;
  value: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
};

function StatCardButton({
  label,
  value,
  color,
  isSelected,
  onPress,
}: StatCardButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.statCard,
        isSelected && {
          borderColor: color,
          backgroundColor: `${color}18`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.statCardHeader}>
        <Text
          style={[
            styles.statLabel,
            isSelected && { color: colors.text, fontWeight: '800' },
          ]}
        >
          {label}
        </Text>
        {isSelected && (
          <View style={[styles.activeMetricDot, { backgroundColor: color }]} />
        )}
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </TouchableOpacity>
  );
}

// ─── Günlük Giriş Formu (Key ile İzole Edilmiş & Otomatik Kalori Hesaplamalı) ───

type DailyInputFormProps = {
  initialLog: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes?: string;
  };
  onSave: (data: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes: string;
  }) => void;
  isSaving: boolean;
};

function DailyInputForm({ initialLog, onSave, isSaving }: DailyInputFormProps) {
  const [protein, setProtein] = useState(
    initialLog.protein > 0 ? String(initialLog.protein) : ''
  );
  const [carbs, setCarbs] = useState(
    initialLog.carbs > 0 ? String(initialLog.carbs) : ''
  );
  const [fat, setFat] = useState(
    initialLog.fat > 0 ? String(initialLog.fat) : ''
  );
  const [notes, setNotes] = useState(initialLog.notes || '');

  // Otomatik hesaplanan kalori (p*4 + c*4 + f*9)
  const calculatedCalories = useMemo(() => {
    const p = Number(protein) || 0;
    const c = Number(carbs) || 0;
    const f = Number(fat) || 0;
    if (p === 0 && c === 0 && f === 0) {
      return initialLog.calories > 0 ? initialLog.calories : 0;
    }
    return Math.round(p * 4 + c * 4 + f * 9);
  }, [protein, carbs, fat, initialLog.calories]);

  const handleMacroChange = (type: 'p' | 'c' | 'f', val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    if (type === 'p') setProtein(cleanVal);
    if (type === 'c') setCarbs(cleanVal);
    if (type === 'f') setFat(cleanVal);
  };

  const handleSavePress = () => {
    const pNum = Number(protein) || 0;
    const cNum = Number(carbs) || 0;
    const fNum = Number(fat) || 0;

    if (calculatedCalories === 0 && pNum === 0 && cNum === 0 && fNum === 0) {
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

  const handleClear = () => {
    setProtein('');
    setCarbs('');
    setFat('');
    setNotes('');
  };

  return (
    <View style={[styles.card, styles.inputCard]}>
      {/* Kalori Göstergesi (Doğrudan Girdi Almaz - Makrolara Göre Otomatik Güncellenir) */}
      <View style={styles.calorieLabelRow}>
        <Text style={styles.inputLabel}>TOPLAM KALORİ (KCAL)</Text>
        <View style={styles.autoBadge}>
          <Text style={styles.autoBadgeText}>Otomatik Hesaplanır</Text>
        </View>
      </View>
      <TextInput
        style={[styles.input, styles.calorieInput, styles.calorieInputReadOnly]}
        editable={false}
        value={calculatedCalories > 0 ? `${calculatedCalories.toLocaleString('tr-TR')} kcal` : '0 kcal'}
      />

      {/* 3'lü Makro Giriş Satırı */}
      <View style={styles.threeInputsRow}>
        <View style={styles.proteinInput}>
          <Text style={styles.inputLabel}>PROTEİN (G)</Text>
          <TextInput
            style={styles.input}
            placeholder="160"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={protein}
            onChangeText={(v) => handleMacroChange('p', v)}
          />
        </View>

        <View style={styles.carbInput}>
          <Text style={styles.inputLabel}>KARBONHİDRAT (G)</Text>
          <TextInput
            style={styles.input}
            placeholder="250"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={carbs}
            onChangeText={(v) => handleMacroChange('c', v)}
          />
        </View>

        <View style={styles.fatInput}>
          <Text style={styles.inputLabel}>YAĞ (G)</Text>
          <TextInput
            style={styles.input}
            placeholder="70"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            value={fat}
            onChangeText={(v) => handleMacroChange('f', v)}
          />
        </View>
      </View>

      {/* Notlar */}
      <Text style={styles.inputLabel}>GÜNLÜK NOTLAR</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Bugün yedikleriniz hakkında eklemek istediğiniz notlar..."
        placeholderTextColor={colors.muted}
        multiline
        numberOfLines={2}
        value={notes}
        onChangeText={setNotes}
      />

      {/* Butonlar */}
      <View style={styles.actionRow}>
        <Pressable
          style={[
            styles.actionButton,
            styles.saveButton,
            isSaving && { opacity: 0.7 },
          ]}
          onPress={handleSavePress}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Kaydediliyor...' : '■ Günlük verileri kaydet'}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>▲ Girdileri temizle</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function NutritionScreen() {
  const { user } = useUser();
  const { todayLog, history, isSaving, saveLog } = useNutrition();

  const todayIso = useMemo(() => getTodayIsoString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // İstatistik Sekmesi: 'weekly' | 'monthly' | 'all'
  const [statPeriod, setStatPeriod] = useState<'weekly' | 'monthly' | 'all'>('monthly');

  // Aktif İncelenen Metrik: 'calories' | 'protein' | 'carbs' | 'fat'
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('calories');

  // 'Genel' sekmesinde görüntülenen aktif ay (YYYY-MM)
  const [activeMonth, setActiveMonth] = useState<string>(() => todayIso.slice(0, 7));

  // Grafikte seçili / basılmış olan barın indeksi
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);

  // Sağa/Sola kaydırma (Swipe) için dokunma başlangıcı
  const touchStartX = useRef<number>(0);

  // ─── Animasyon Değerleri ───
  const [barAnim] = useState(() => new Animated.Value(0));
  const [tooltipAnim] = useState(() => new Animated.Value(1));

  // Hedef Değerler (Kullanıcı verilerine veya bilimsel hedeflere göre)
  const targets = useMemo(() => {
    const weight = user?.weight || 80;
    const targetCal = 2930;
    const targetProt = Math.round(weight * 2.0) || 146;
    const targetFat = 98;
    const targetCarbs = 366;
    return {
      calories: targetCal,
      protein: targetProt,
      carbs: targetCarbs,
      fat: targetFat,
    };
  }, [user]);

  // Seçili tarihe ait mevcut log
  const activeLog = useMemo(() => {
    if (selectedDate === todayIso) {
      return todayLog;
    }
    const found = history.find((h) => h.date === selectedDate);
    return found || { calories: 0, protein: 0, carbs: 0, fat: 0, notes: '' };
  }, [selectedDate, todayIso, todayLog, history]);

  // Hafta Günleri (P S Ç P C C P)
  const weekDays = useMemo(
    () => getWeekDaysForDate(selectedDate, todayIso),
    [selectedDate, todayIso]
  );

  // Kalan Kalori & İlerleme Yüzdeleri
  const caloriesLeft = targets.calories - (activeLog.calories || 0);
  const calPercent = targets.calories > 0
    ? Math.min(100, Math.max(0, Math.round(((activeLog.calories || 0) / targets.calories) * 100)))
    : 0;

  const carbsPercent = targets.carbs > 0
    ? Math.min(100, Math.max(0, Math.round(((activeLog.carbs || 0) / targets.carbs) * 100)))
    : 0;

  const fatPercent = targets.fat > 0
    ? Math.min(100, Math.max(0, Math.round(((activeLog.fat || 0) / targets.fat) * 100)))
    : 0;

  const proteinPercent = targets.protein > 0
    ? Math.min(100, Math.max(0, Math.round(((activeLog.protein || 0) / targets.protein) * 100)))
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

  // Aktif Döneme Göre Çubuk Grafik Verileri
  const chartDays = useMemo(() => {
    const dates: string[] = [];

    if (statPeriod === 'weekly') {
      // 7 gün (Seçili tarihten geriye doğru 7 gün)
      for (let i = 6; i >= 0; i--) {
        dates.push(offsetIsoDate(selectedDate, -i));
      }
    } else if (statPeriod === 'monthly') {
      // 30 gün (Seçili tarihten geriye doğru tam 30 çubuk)
      for (let i = 29; i >= 0; i--) {
        dates.push(offsetIsoDate(selectedDate, -i));
      }
    } else {
      // 'all' -> Seçili ayın tüm gün sayısı (28, 29, 30 veya 31 gün)
      const [y, m] = activeMonth.split('-').map(Number);
      const daysCount = new Date(y, m, 0).getDate();
      for (let d = 1; d <= daysCount; d++) {
        const dayStr = String(d).padStart(2, '0');
        const mStr = String(m).padStart(2, '0');
        dates.push(`${y}-${mStr}-${dayStr}`);
      }
    }

    return dates.map((dStr) => {
      const log = logMap.get(dStr);
      const val = log ? (log[selectedMetric] || 0) : 0;
      return {
        date: dStr,
        value: val,
        hasData: !!log && val > 0,
        calories: log?.calories || 0,
        protein: log?.protein || 0,
        carbs: log?.carbs || 0,
        fat: log?.fat || 0,
      };
    });
  }, [statPeriod, selectedDate, activeMonth, logMap, selectedMetric]);

  // Çubukların X Ekseninden Yukarıya Süzülme Animasyonu (Geçişler Yumuşak)
  useEffect(() => {
    barAnim.setValue(0);
    Animated.timing(barAnim, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [statPeriod, selectedMetric, activeMonth, barAnim]);

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

  // Aktif İncelenen Gün (Varsayılan olarak en son veri olan veya seçili tarihe denk gelen bar)
  const resolvedActiveIndex = useMemo(() => {
    if (activeBarIndex !== null && activeBarIndex >= 0 && activeBarIndex < chartDays.length) {
      return activeBarIndex;
    }
    // Seçili tarihe denk gelen bar var mı?
    const selIdx = chartDays.findIndex((d) => d.date === selectedDate);
    if (selIdx >= 0) return selIdx;

    // Verisi olan en son günü bul
    for (let i = chartDays.length - 1; i >= 0; i--) {
      if (chartDays[i].hasData) return i;
    }
    return chartDays.length - 1;
  }, [activeBarIndex, chartDays, selectedDate]);

  // Tooltip Yumuşak Açılma Animasyonu
  useEffect(() => {
    tooltipAnim.setValue(0);
    Animated.spring(tooltipAnim, {
      toValue: 1,
      friction: 7,
      tension: 70,
      useNativeDriver: true,
    }).start();
  }, [resolvedActiveIndex, selectedMetric, tooltipAnim]);

  const inspectedDay = chartDays[resolvedActiveIndex] || null;

  // Tooltip X konumu (Yüzde olarak)
  const tooltipLeftPercent = useMemo(() => {
    if (chartDays.length === 0) return 50;
    const percent = ((resolvedActiveIndex + 0.5) / chartDays.length) * 100;
    return Math.min(Math.max(percent, 18), 82);
  }, [resolvedActiveIndex, chartDays.length]);

  // X Ekseni Etiketleri (Örn: 3 Eyl, 9 Eyl, 15 Eyl, 21 Eyl, 27 Eyl)
  const xAxisLabels = useMemo(() => {
    if (chartDays.length === 0) return [];

    if (statPeriod === 'weekly') {
      return chartDays.map((item, idx) => ({
        key: item.date,
        label: formatShortDateTR(item.date),
        percent: ((idx + 0.5) / chartDays.length) * 100,
      }));
    }

    const targetIndices = [2, 8, 14, 20, 26].filter((i) => i < chartDays.length);
    return targetIndices.map((idx) => ({
      key: chartDays[idx].date,
      label: formatShortDateTR(chartDays[idx].date),
      percent: ((idx + 0.5) / chartDays.length) * 100,
    }));
  }, [chartDays, statPeriod]);

  // Ay Değiştirme Eylemleri (Genel Görünümü İçin)
  const handlePrevMonth = () => {
    setActiveMonth((prev) => offsetMonth(prev, -1));
    setActiveBarIndex(null);
  };

  const handleNextMonth = () => {
    if (activeMonth < todayIso.slice(0, 7)) {
      setActiveMonth((prev) => offsetMonth(prev, 1));
      setActiveBarIndex(null);
    }
  };

  // Sağa / Sola Kaydırma (Swipe) Algılayıcıları
  const handleTouchStart = (e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
  };

  const handleTouchEnd = (e: GestureResponderEvent) => {
    const deltaX = e.nativeEvent.pageX - touchStartX.current;
    if (statPeriod === 'all') {
      if (deltaX > 45) {
        handlePrevMonth();
      } else if (deltaX < -45) {
        handleNextMonth();
      }
    }
  };

  // Hafta Günlerine Dokunulduğunda Hem Tarihi Hem Grafiği Eşle
  const handleSelectWeekday = (dateStr: string) => {
    setSelectedDate(dateStr);
    const foundIdx = chartDays.findIndex((d) => d.date === dateStr);
    if (foundIdx >= 0) {
      setActiveBarIndex(foundIdx);
    } else if (statPeriod === 'all') {
      const monthPart = dateStr.slice(0, 7);
      if (monthPart !== activeMonth) {
        setActiveMonth(monthPart);
      }
    }
  };

  // Grafikte Bir Bara Dokunulduğunda Seçili Tarihi de Güncelle
  const handleBarPress = (index: number, dateStr: string) => {
    setActiveBarIndex(index);
    setSelectedDate(dateStr);
  };

  // Kaydetme Eylemi
  const handleSave = async (formData: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    notes: string;
  }) => {
    try {
      await saveLog({
        username: user?.username || 'user',
        log_date: selectedDate,
        calories: formData.calories,
        protein: formData.protein,
        carbs: formData.carbs,
        fat: formData.fat,
        notes: formData.notes,
      });
      Alert.alert('Başarılı', `${selectedDate} beslenme verileri kaydedildi.`);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Beslenme verisi kaydedilemedi.');
    }
  };

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
          {/* ─── 1. Header: Bugün ▾ & 1 ⚡ ─── */}
          <View style={styles.topHeader}>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text style={styles.dropdownTitle}>
                {formatHeaderDate(selectedDate, todayIso)}
              </Text>
              <ChevronDownIcon size={18} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>1</Text>
              <LightningIcon size={14} color="#F59E0B" />
            </View>
          </View>

          {/* ─── 2. Hafta Günleri Çubuğu (P S Ç P C C P) ─── */}
          <View style={styles.weekRow}>
            {weekDays.map((item) => (
              <TouchableOpacity
                key={item.date}
                style={styles.weekDayCol}
                onPress={() => handleSelectWeekday(item.date)}
                activeOpacity={0.7}
              >
                {/* Seçili gün üst noktası */}
                <View style={styles.dotContainer}>
                  {item.isSelected && <View style={styles.activeDot} />}
                </View>
                <Text
                  style={[
                    styles.weekDayLabel,
                    item.isSelected && styles.weekDayLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
                {/* Gün Çemberi */}
                <View
                  style={[
                    styles.dayCircle,
                    item.isSelected && styles.dayCircleSelected,
                  ]}
                >
                  {item.isSelected && <CheckMiniIcon size={11} color="#070B18" />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* ─── 3. Kalori Kartı ─── */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardHeaderTitle}>Kalori</Text>
            <View style={styles.calRow}>
              <View style={styles.calLeftGroup}>
                <Text style={styles.calBigNumber}>
                  {(activeLog.calories || 0).toLocaleString('tr-TR')}
                </Text>
                <Text style={styles.calUnitText}> kcal</Text>
                <Text style={styles.calTargetText}>
                  {' '}/ {targets.calories.toLocaleString('tr-TR')}
                </Text>
              </View>
              <Text style={styles.calRemainingText}>
                {caloriesLeft >= 0
                  ? `${caloriesLeft.toLocaleString('tr-TR')} kaldı`
                  : `${Math.abs(caloriesLeft).toLocaleString('tr-TR')} aşıldı`}
              </Text>
            </View>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${calPercent}%`,
                    backgroundColor: colors.blue,
                  },
                ]}
              />
            </View>
          </View>

          {/* ─── 4. Makrolar Kartı (Karbonhidrat, Yağ, Protein) ─── */}
          <View style={styles.summaryCard}>
            <View style={styles.macrosTopRow}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={styles.swapBtn} activeOpacity={0.7} hitSlop={8}>
                <SwapIcon size={16} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <View style={styles.macroColumnsRow}>
              {/* Karbonhidrat (Karb) */}
              <View style={styles.macroColumn}>
                <Text style={styles.macroColTitle}>Karbonhidrat</Text>
                <View style={styles.macroValueRow}>
                  <Text style={styles.macroBigNumber}>{activeLog.carbs || 0} g</Text>
                  <Text style={styles.macroTargetNumber}> / {targets.carbs}</Text>
                </View>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${carbsPercent}%`,
                        backgroundColor: '#2DD4BF',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Yağ */}
              <View style={styles.macroColumn}>
                <Text style={styles.macroColTitle}>Yağ</Text>
                <View style={styles.macroValueRow}>
                  <Text style={styles.macroBigNumber}>{activeLog.fat || 0} g</Text>
                  <Text style={styles.macroTargetNumber}> / {targets.fat}</Text>
                </View>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${fatPercent}%`,
                        backgroundColor: '#8B5CF6',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Protein */}
              <View style={styles.macroColumn}>
                <Text style={styles.macroColTitle}>Protein</Text>
                <View style={styles.macroValueRow}>
                  <Text style={styles.macroBigNumber}>{activeLog.protein || 0} g</Text>
                  <Text style={styles.macroTargetNumber}> / {targets.protein}</Text>
                </View>
                <View style={styles.miniBarTrack}>
                  <View
                    style={[
                      styles.miniBarFill,
                      {
                        width: `${proteinPercent}%`,
                        backgroundColor: '#F59E0B',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          {/* ─── 5. "Bugün Ne Yedin?" Veri Giriş Formu ─── */}
          <View style={[styles.sectionHeader, { marginTop: 18 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Bugün ne yedin?</Text>
              <Text style={styles.sectionSubtitle}>
                Makro değerlerini gir, kalori otomatik olarak hesaplansın
              </Text>
            </View>
            <View style={styles.editIconBox}>
              <PencilEditIcon size={16} color={colors.mint} />
            </View>
          </View>

          <DailyInputForm
            key={`${selectedDate}-${activeLog.calories}-${activeLog.protein}-${activeLog.carbs}-${activeLog.fat}-${activeLog.notes || ''}`}
            initialLog={activeLog}
            onSave={handleSave}
            isSaving={isSaving}
          />

          {/* ─── 6. Beslenme İstatistikleri ─── */}
          <View style={[styles.sectionHeader, { marginTop: 22 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Beslenme istatistikleri</Text>
              <Text style={styles.sectionSubtitle}>
                Kartlara basarak metriği değiştir, çubuklara basarak o günün değerini gör
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* Dönem Sekmeleri (Haftalık / Aylık / Genel) */}
            <View style={styles.tabsRow}>
              <Pressable
                style={[styles.tab, statPeriod === 'weekly' && styles.activeTab]}
                onPress={() => {
                  setStatPeriod('weekly');
                  setActiveBarIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    statPeriod === 'weekly' && styles.activeTabText,
                  ]}
                >
                  Haftalık
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, statPeriod === 'monthly' && styles.activeTab]}
                onPress={() => {
                  setStatPeriod('monthly');
                  setActiveBarIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    statPeriod === 'monthly' && styles.activeTabText,
                  ]}
                >
                  Aylık
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, statPeriod === 'all' && styles.activeTab]}
                onPress={() => {
                  setStatPeriod('all');
                  setActiveBarIndex(null);
                }}
              >
                <Text
                  style={[
                    styles.tabText,
                    statPeriod === 'all' && styles.activeTabText,
                  ]}
                >
                  Genel
                </Text>
              </Pressable>
            </View>

            {/* 2×2 Tıklanabilir Ortalama Kartları (Web Platformu Gibi Buton) */}
            <View style={styles.statGrid}>
              <StatCardButton
                label={METRICS.calories.label}
                value={`${stats.avgCal} kcal`}
                color={METRICS.calories.color}
                isSelected={selectedMetric === 'calories'}
                onPress={() => setSelectedMetric('calories')}
              />
              <StatCardButton
                label={METRICS.protein.label}
                value={`${stats.avgProt} g`}
                color={METRICS.protein.color}
                isSelected={selectedMetric === 'protein'}
                onPress={() => setSelectedMetric('protein')}
              />
              <StatCardButton
                label={METRICS.carbs.label}
                value={`${stats.avgCarb} g`}
                color={METRICS.carbs.color}
                isSelected={selectedMetric === 'carbs'}
                onPress={() => setSelectedMetric('carbs')}
              />
              <StatCardButton
                label={METRICS.fat.label}
                value={`${stats.avgFat} g`}
                color={METRICS.fat.color}
                isSelected={selectedMetric === 'fat'}
                onPress={() => setSelectedMetric('fat')}
              />
            </View>

            {/* Genel Sekmesi: Ay Gezinme Çubuğu (‹ Ekim 2026 ›) */}
            {statPeriod === 'all' && (
              <View style={styles.monthNavRow}>
                <TouchableOpacity
                  style={styles.monthNavBtn}
                  onPress={handlePrevMonth}
                  hitSlop={8}
                  accessibilityLabel="Önceki Ay"
                >
                  <Text style={styles.monthNavArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.monthNavTitle}>{formatMonthTR(activeMonth)}</Text>
                <TouchableOpacity
                  style={[
                    styles.monthNavBtn,
                    activeMonth >= todayIso.slice(0, 7) && { opacity: 0.3 },
                  ]}
                  onPress={handleNextMonth}
                  disabled={activeMonth >= todayIso.slice(0, 7)}
                  hitSlop={8}
                  accessibilityLabel="Sonraki Ay"
                >
                  <Text style={styles.monthNavArrow}>›</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ─── İnce Dikey Çubuk Grafik & Etkileşimli İpucu (Tooltip) ─── */}
            <View
              style={styles.chartContainer}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Tooltip & İndikatör Alanı (Yumuşak Animasyonlu Açılan Kart) */}
              <View style={styles.tooltipArea}>
                {inspectedDay && (
                  <Animated.View
                    style={[
                      styles.tooltipWrapper,
                      {
                        left: `${tooltipLeftPercent}%`,
                        opacity: tooltipAnim,
                        transform: [
                          { translateX: -48 },
                          {
                            translateY: tooltipAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-6, 0],
                            }),
                          },
                          {
                            scale: tooltipAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0.92, 1],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <View style={styles.tooltipCard}>
                      <Text style={styles.tooltipValueText}>
                        {selectedMetric === 'calories'
                          ? `${formatNumberTR(inspectedDay.calories)} Kcal`
                          : `${formatNumberTR(inspectedDay[selectedMetric])} g`}
                      </Text>
                      <Text style={styles.tooltipDateText}>
                        {formatShortDateTR(inspectedDay.date)}
                      </Text>
                    </View>
                    <View style={styles.tooltipArrow} />
                  </Animated.View>
                )}
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
                <View style={styles.barsCanvas}>
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

                  {/* Çubuklar Satırı (X Ekseninden Yukarıya Süzülen Animasyon) */}
                  <View style={styles.barsRow}>
                    {chartDays.map((item, index) => {
                      const isInspected = index === resolvedActiveIndex;
                      const barHeight = yMax > 0 && item.value > 0
                        ? Math.max(4, Math.round((item.value / yMax) * CHART_HEIGHT))
                        : 0;

                      // Çubuğun yukarı doğru süzülme animasyonlu yüksekliği
                      const animatedBarHeight = barAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, barHeight > 0 ? barHeight : 2],
                      });

                      // Kırmızı indikatör çizgisinin yüksekliği
                      const animatedLineHeight = barAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, CHART_HEIGHT - barHeight],
                      });

                      return (
                        <Pressable
                          key={item.date}
                          style={styles.barSlot}
                          onPress={() => handleBarPress(index, item.date)}
                          hitSlop={{ top: 20, bottom: 20, left: 3, right: 3 }}
                        >
                          {/* Çubuğun Tepesine Ulaşan İnce Kırmızı Çizgi */}
                          {isInspected && (
                            <Animated.View
                              style={[
                                styles.redIndicatorLine,
                                {
                                  bottom: barHeight,
                                  height: animatedLineHeight,
                                },
                              ]}
                            />
                          )}

                          {/* İnce Beyaz Dikey Çubuk */}
                          <Animated.View
                            style={[
                              styles.barPill,
                              {
                                height: animatedBarHeight,
                                backgroundColor:
                                  barHeight > 0
                                    ? '#FFFFFF'
                                    : 'rgba(255, 255, 255, 0.15)',
                                width:
                                  statPeriod === 'weekly'
                                    ? 14
                                    : chartDays.length > 28
                                    ? 4.5
                                    : 6,
                              },
                            ]}
                          />
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
          onSelect={(newDate) => {
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
    paddingBottom: 90,
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
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  weekDayCol: {
    alignItems: 'center',
    width: 38,
  },
  dotContainer: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.muted,
  },
  weekDayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
  },
  weekDayLabelSelected: {
    fontWeight: '800',
    color: colors.text,
  },
  dayCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  /* ─── 3. Özet Kartları (Kalori & Makrolar) ─── */
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 16,
    marginBottom: 12,
  },
  cardHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 6,
  },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  calLeftGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  calBigNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  calUnitText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  calTargetText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.muted,
  },
  calRemainingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#17223B',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },

  /* ─── 4. Makrolar Kartı Detayları ─── */
  macrosTopRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 2,
  },
  swapBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  macroColumnsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  macroColumn: {
    flex: 1,
  },
  macroColTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted,
    marginBottom: 4,
  },
  macroValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  macroBigNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  macroTargetNumber: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.muted,
  },
  miniBarTrack: {
    height: 5,
    backgroundColor: '#17223B',
    borderRadius: 999,
    overflow: 'hidden',
  },
  miniBarFill: {
    height: '100%',
    borderRadius: 999,
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

  /* ─── Form Kartı (Otomatik Kalorili) ─── */
  inputCard: {
    borderColor: 'rgba(67, 214, 173, 0.35)',
    backgroundColor: colors.inputCardBg,
  },
  calorieLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  autoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(67, 214, 173, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(67, 214, 173, 0.3)',
  },
  autoBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.mint,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    backgroundColor: colors.inputBackground,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600',
  },
  calorieInput: {
    borderColor: 'rgba(167, 139, 250, 0.45)',
    marginBottom: 8,
  },
  calorieInputReadOnly: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(167, 139, 250, 0.3)',
    color: colors.text,
    fontWeight: '800',
  },
  threeInputsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  proteinInput: {
    flex: 1,
    borderColor: 'rgba(67, 214, 173, 0.45)',
  },
  carbInput: {
    flex: 1,
    borderColor: 'rgba(255, 173, 33, 0.45)',
  },
  fatInput: {
    flex: 1,
    borderColor: 'rgba(57, 198, 239, 0.45)',
  },
  notesInput: {
    minHeight: 52,
    borderColor: colors.border,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(67, 214, 173, 0.5)',
    backgroundColor: 'rgba(67, 214, 173, 0.15)',
  },
  saveButtonText: {
    color: colors.mint,
    fontWeight: '800',
    fontSize: 11.5,
  },
  clearButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 120, 152, 0.4)',
    backgroundColor: 'rgba(255, 120, 152, 0.1)',
  },
  clearButtonText: {
    color: colors.danger,
    fontWeight: '800',
    fontSize: 11.5,
  },

  /* ─── İstatistikler Kartı ─── */
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  activeTab: {
    backgroundColor: colors.violet,
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },

  /* ─── Tıklanabilir Ortalama Kartları Grid ─── */
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statCard: {
    width: '48.6%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  activeMetricDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
  },

  /* ─── Ay Gezinme Çubuğu (Genel Sekmesi) ─── */
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  monthNavBtn: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  monthNavArrow: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  monthNavTitle: {
    fontSize: 13,
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
    marginTop: 4,
  },

  /* ─── İpucu (Tooltip) & Kırmızı İndikatör ─── */
  tooltipArea: {
    height: 54,
    justifyContent: 'flex-end',
    marginBottom: 6,
    position: 'relative',
  },
  tooltipWrapper: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipCard: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  tooltipValueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tooltipDateText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: '600',
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
    borderTopColor: '#FF4500',
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
  redIndicatorLine: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: '#FF453A',
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
    backgroundColor: 'rgba(167, 139, 250, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  calTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  calSubtitle: {
    fontSize: 11,
    color: colors.muted,
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
    color: colors.muted,
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
    backgroundColor: colors.violet,
  },
  calCellDisabled: {
    opacity: 0.2,
  },
  calCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  calCellTextSelected: {
    fontWeight: '800',
    color: '#070B18',
  },
  calCellTextToday: {
    fontWeight: '800',
    color: colors.mint,
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
    backgroundColor: colors.violet,
  },
  calConfirmBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#070B18',
  },
});
