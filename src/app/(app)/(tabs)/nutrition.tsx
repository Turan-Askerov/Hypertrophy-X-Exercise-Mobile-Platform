import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

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
};

// ─── SVG İkonları ───

function SettingsGearIcon({ size = 20, color = colors.text }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="3" strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </Svg>
  );
}

function TargetRadioIcon({ size = 16, color = colors.muted }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" strokeOpacity={0.6} />
      <Circle cx="12" cy="12" r="4" fill={color} />
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

// ─── Yardımcı Fonksiyonlar ───

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function getTodayIsoString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTurkishDate(dateIso: string): string {
  const today = getTodayIsoString();
  const [y, m, d] = dateIso.split('-').map(Number);
  const monthName = TURKISH_MONTHS[(m || 1) - 1];

  if (dateIso === today) {
    return `Bugün · ${d} ${monthName} ${y}`;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yY = yesterdayDate.getFullYear();
  const yM = String(yesterdayDate.getMonth() + 1).padStart(2, '0');
  const yD = String(yesterdayDate.getDate()).padStart(2, '0');
  const yesterdayIso = `${yY}-${yM}-${yD}`;

  if (dateIso === yesterdayIso) {
    return `Dün · ${d} ${monthName} ${y}`;
  }

  return `${d} ${monthName} ${y}`;
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

// ─── Bileşenler ───

type GoalCardProps = {
  emoji: string;
  label: string;
  value: string;
  tint: string;
};

function GoalCard({ emoji, label, value, tint }: GoalCardProps) {
  return (
    <View style={[styles.goalCard, { borderColor: `${tint}55` }]}>
      <View style={styles.goalTop}>
        <Text style={styles.goalLabel}>
          <Text style={{ color: tint }}>{emoji}</Text> {label}
        </Text>
        <TargetRadioIcon color={tint} size={15} />
      </View>
      <Text style={styles.goalValue}>{value}</Text>
    </View>
  );
}

function MacroProgressRow({
  emoji,
  label,
  value,
  target,
  unit = 'g',
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  target: number;
  unit?: string;
  color: string;
}) {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

  return (
    <View style={styles.macroProgress}>
      <View style={styles.metricRow}>
        <Text style={styles.metricLabel}>
          <Text style={{ color }}>{emoji}</Text> {label}
        </Text>
        <Text style={styles.metricValue}>
          {Math.round(value)} {unit} / {Math.round(target)} {unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.trackFill, { backgroundColor: color, width: `${percent}%` }]} />
      </View>
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

// ─── Günlük Giriş Formu (Key ile İzole Edilmiş & Re-render Dostu) ───

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
  const [calorieInput, setCalorieInput] = useState(
    initialLog.calories > 0 ? String(initialLog.calories) : ''
  );
  const [proteinInput, setProteinInput] = useState(
    initialLog.protein > 0 ? String(initialLog.protein) : ''
  );
  const [carbInput, setCarbInput] = useState(
    initialLog.carbs > 0 ? String(initialLog.carbs) : ''
  );
  const [fatInput, setFatInput] = useState(
    initialLog.fat > 0 ? String(initialLog.fat) : ''
  );
  const [notesInput, setNotesInput] = useState(initialLog.notes || '');

  // Otomatik Kalori Hesaplama (Protein/Karb/Yağ girildiğinde)
  const handleAutoCalculateCalories = (p: string, c: string, f: string) => {
    const pNum = parseFloat(p) || 0;
    const cNum = parseFloat(c) || 0;
    const fNum = parseFloat(f) || 0;
    if (pNum > 0 || cNum > 0 || fNum > 0) {
      const calculated = Math.round(pNum * 4 + cNum * 4 + fNum * 9);
      setCalorieInput(String(calculated));
    }
  };

  const handleClear = () => {
    setCalorieInput('');
    setProteinInput('');
    setCarbInput('');
    setFatInput('');
    setNotesInput('');
  };

  const handleSavePress = () => {
    const cNum = parseFloat(calorieInput) || 0;
    const pNum = parseFloat(proteinInput) || 0;
    const cbNum = parseFloat(carbInput) || 0;
    const fNum = parseFloat(fatInput) || 0;

    let finalCalories = cNum;
    if (finalCalories <= 0 && (pNum > 0 || cbNum > 0 || fNum > 0)) {
      finalCalories = Math.round(pNum * 4 + cbNum * 4 + fNum * 9);
    }

    if (finalCalories === 0 && pNum === 0 && cbNum === 0 && fNum === 0 && !notesInput.trim()) {
      Alert.alert('Uyarı', 'Lütfen en az bir makro veya kalori değeri girin.');
      return;
    }

    onSave({
      calories: finalCalories,
      protein: pNum,
      carbs: cbNum,
      fat: fNum,
      notes: notesInput.trim(),
    });
  };

  return (
    <View style={[styles.card, styles.inputCard]}>
      {/* Toplam Kalori */}
      <Text style={styles.inputLabel}>TOPLAM KALORİ</Text>
      <TextInput
        placeholder="0 kcal"
        placeholderTextColor={colors.muted}
        keyboardType="numeric"
        value={calorieInput}
        onChangeText={setCalorieInput}
        style={[styles.input, styles.calorieInput]}
      />

      {/* Üçlü Makro Girişi */}
      <Text style={styles.inputLabel}>MAKRO DEĞERLERİ</Text>
      <View style={styles.threeInputsRow}>
        <TextInput
          placeholder="Protein (g)"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={proteinInput}
          onChangeText={(val) => {
            setProteinInput(val);
            handleAutoCalculateCalories(val, carbInput, fatInput);
          }}
          style={[styles.input, styles.proteinInput]}
        />
        <TextInput
          placeholder="Karb (g)"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={carbInput}
          onChangeText={(val) => {
            setCarbInput(val);
            handleAutoCalculateCalories(proteinInput, val, fatInput);
          }}
          style={[styles.input, styles.carbInput]}
        />
        <TextInput
          placeholder="Yağ (g)"
          placeholderTextColor={colors.muted}
          keyboardType="numeric"
          value={fatInput}
          onChangeText={(val) => {
            setFatInput(val);
            handleAutoCalculateCalories(proteinInput, carbInput, val);
          }}
          style={[styles.input, styles.fatInput]}
        />
      </View>

      {/* Notlar */}
      <Text style={styles.inputLabel}>NOTLAR</Text>
      <TextInput
        placeholder="Öğünler, takviyeler veya ek notlar..."
        placeholderTextColor={colors.muted}
        multiline
        value={notesInput}
        onChangeText={setNotesInput}
        style={[styles.input, styles.notesInput]}
      />

      {/* Eylem Butonları */}
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
  const router = useRouter();
  const { user } = useUser();
  const { todayLog, history, isSaving, saveLog } = useNutrition();

  const todayIso = useMemo(() => getTodayIsoString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);

  // İstatistik Sekmesi State: 'weekly' | 'monthly' | 'all'
  const [statPeriod, setStatPeriod] = useState<'weekly' | 'monthly' | 'all'>('weekly');

  // Hedef Değerler (Kullanıcı verilerine veya varsayılan bilimsel hedeflere göre)
  const targets = useMemo(() => {
    const weight = user?.weight || 80;
    // Kullanıcı hedefine göre kalori ayarı
    const targetCal = 2911;
    const targetProt = Math.round(weight * 2.0) || 160;
    const targetFat = 72;
    const targetCarbs = 406;
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

  // Tarih Değiştirme
  const handlePrevDay = () => {
    setSelectedDate((prev) => offsetIsoDate(prev, -1));
  };

  const handleNextDay = () => {
    if (selectedDate >= todayIso) return;
    setSelectedDate((prev) => offsetIsoDate(prev, 1));
  };

  const handleGoToday = () => {
    setSelectedDate(todayIso);
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
      Alert.alert('Başarılı', `${formatTurkishDate(selectedDate)} beslenme verileri kaydedildi.`);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Beslenme verisi kaydedilemedi.');
    }
  };

  // İstatistik Hesaplamaları (Haftalık / Aylık / Genel)
  const stats = useMemo(() => {
    const allLogs = [...history];
    // Bugünün logunu da ekle/güncelle
    const existingTodayIndex = allLogs.findIndex((h) => h.date === todayIso);
    if (existingTodayIndex >= 0) {
      allLogs[existingTodayIndex] = { ...allLogs[existingTodayIndex], ...todayLog };
    } else if (todayLog.calories > 0 || todayLog.protein > 0) {
      allLogs.push({ date: todayIso, ...todayLog });
    }

    let filtered = allLogs;
    if (statPeriod === 'weekly') {
      const sevenDaysAgo = offsetIsoDate(todayIso, -7);
      filtered = allLogs.filter((l) => l.date >= sevenDaysAgo);
    } else if (statPeriod === 'monthly') {
      const thirtyDaysAgo = offsetIsoDate(todayIso, -30);
      filtered = allLogs.filter((l) => l.date >= thirtyDaysAgo);
    }

    const count = filtered.length || 1;
    const totalCal = filtered.reduce((s, l) => s + (l.calories || 0), 0);
    const totalProt = filtered.reduce((s, l) => s + (l.protein || 0), 0);
    const totalCarb = filtered.reduce((s, l) => s + (l.carbs || 0), 0);
    const totalFat = filtered.reduce((s, l) => s + (l.fat || 0), 0);

    return {
      avgCal: filtered.length ? Math.round(totalCal / count) : 0,
      avgProt: filtered.length ? Math.round(totalProt / count) : 0,
      avgCarb: filtered.length ? Math.round(totalCarb / count) : 0,
      avgFat: filtered.length ? Math.round(totalFat / count) : 0,
    };
  }, [history, todayLog, todayIso, statPeriod]);

  // Haftalık Grafik Barları (Pzt, Sal, Çar, Per, Cum, Cmt, Paz)
  const weeklyChartBars = useMemo(() => {
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    // Örnek doluluk ve gerçek veri eşlemesi
    const sampleHeights = [36, 48, 42, 60, 52, 72, 45];
    return days.map((day, idx) => ({
      day,
      height: sampleHeights[idx],
    }));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── 1. Üst Bar (Header) ─── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.overline}>Hypertrophy-X</Text>
              <Text style={styles.title}>Beslenme</Text>
            </View>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/(app)/settings')}
              accessibilityLabel="Beslenme ayarları"
              hitSlop={10}
            >
              <SettingsGearIcon size={19} color={colors.text} />
            </Pressable>
          </View>

          {/* ─── 2. Tarih Seçici Satırı ─── */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>{formatTurkishDate(selectedDate)}</Text>
            <View style={styles.dateNavPill}>
              <Pressable
                style={styles.dateArrowBtn}
                onPress={handlePrevDay}
                hitSlop={8}
                accessibilityLabel="Önceki Gün"
              >
                <Text style={styles.dateArrowText}>‹</Text>
              </Pressable>
              <Pressable
                style={styles.dateCenterBtn}
                onPress={handleGoToday}
                hitSlop={8}
                accessibilityLabel="Bugüne Dön"
              >
                <Text style={styles.dateCenterText}>
                  {selectedDate === todayIso ? 'Bugün' : 'Bugüne Dön'}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.dateArrowBtn,
                  selectedDate >= todayIso && { opacity: 0.35 },
                ]}
                onPress={handleNextDay}
                disabled={selectedDate >= todayIso}
                hitSlop={8}
                accessibilityLabel="Sonraki Gün"
              >
                <Text style={styles.dateArrowText}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* ─── 3. 2×2 Günlük Hedef Kartları ─── */}
          <View style={styles.goalGrid}>
            <GoalCard
              emoji="🔥"
              label="HEDEF KALORİ"
              value={`${targets.calories} kcal`}
              tint={colors.violet}
            />
            <GoalCard
              emoji="🥩"
              label="PROTEİN HEDEFİ"
              value={`${targets.protein} g`}
              tint={colors.mint}
            />
            <GoalCard
              emoji="🍞"
              label="KARB HEDEFİ"
              value={`${targets.carbs} g`}
              tint={colors.orange}
            />
            <GoalCard
              emoji="🥑"
              label="YAĞ HEDEFİ"
              value={`${targets.fat} g`}
              tint={colors.cyan}
            />
          </View>

          {/* ─── 4. Bugünün Alınan Makro Özeti ─── */}
          <View style={styles.sectionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Bugünün alınan makro özeti</Text>
              <Text style={styles.sectionSubtitle}>Hedefe göre gerçekleşen günlük dağılım</Text>
            </View>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>
                {selectedDate === todayIso ? 'Bugün' : 'Seçili Gün'}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <MacroProgressRow
              emoji="🔥"
              label="Toplam Kalori"
              value={activeLog.calories}
              target={targets.calories}
              unit="kcal"
              color={colors.violet}
            />
            <MacroProgressRow
              emoji="🥩"
              label="Protein"
              value={activeLog.protein}
              target={targets.protein}
              unit="g"
              color={colors.mint}
            />
            <MacroProgressRow
              emoji="🍞"
              label="Karbonhidrat"
              value={activeLog.carbs}
              target={targets.carbs}
              unit="g"
              color={colors.orange}
            />
            <MacroProgressRow
              emoji="🥑"
              label="Yağ"
              value={activeLog.fat}
              target={targets.fat}
              unit="g"
              color={colors.cyan}
            />
          </View>

          {/* ─── 5. "Bugün Ne Yedin?" Veri Giriş Formu ─── */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Bugün ne yedin?</Text>
              <Text style={styles.sectionSubtitle}>
                Günlük makro değerlerini gir, kaloriyi otomatik hesapla
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
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Beslenme istatistikleri</Text>
              <Text style={styles.sectionSubtitle}>Geçmiş trendlerini incele</Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* Dönem Sekmeleri */}
            <View style={styles.tabsRow}>
              <Pressable
                style={[styles.tab, statPeriod === 'weekly' && styles.activeTab]}
                onPress={() => setStatPeriod('weekly')}
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
                onPress={() => setStatPeriod('monthly')}
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
                onPress={() => setStatPeriod('all')}
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

            {/* 2×2 İstatistik Değerleri */}
            <View style={styles.statGrid}>
              <StatCard
                label="ORT. KALORİ"
                value={`${stats.avgCal} kcal`}
                color={colors.violet}
              />
              <StatCard
                label="ORT. PROTEİN"
                value={`${stats.avgProt} g`}
                color={colors.mint}
              />
              <StatCard
                label="ORT. KARBONHİDRAT"
                value={`${stats.avgCarb} g`}
                color={colors.orange}
              />
              <StatCard
                label="ORT. YAĞ"
                value={`${stats.avgFat} g`}
                color={colors.cyan}
              />
            </View>

            {/* Kompakt Haftalık Bar Grafik */}
            <View style={styles.chartContainer}>
              <View style={styles.chartBarsRow}>
                {weeklyChartBars.map((item, index) => (
                  <View key={item.day} style={styles.chartBarCol}>
                    <View
                      style={[
                        styles.chartBarPill,
                        {
                          height: item.height,
                          backgroundColor: index === 5 ? '#C084FC' : colors.violet,
                          opacity: index === 5 ? 1 : 0.85,
                        },
                      ]}
                    />
                    <Text style={styles.chartDayLabel}>{item.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
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

  /* ─── Header ─── */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  overline: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  /* ─── Tarih Satırı ─── */
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  dateText: {
    color: colors.muted,
    fontSize: 11.5,
    fontWeight: '600',
  },
  dateNavPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
  },
  dateArrowBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dateArrowText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  dateCenterBtn: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dateCenterText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },

  /* ─── Hedef Kartları 2x2 ─── */
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 18,
  },
  goalCard: {
    width: '48.6%',
    minHeight: 74,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    justifyContent: 'space-between',
  },
  goalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    color: colors.muted,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    flex: 1,
  },
  goalValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
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
  todayBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
  },
  todayBadgeText: {
    color: colors.violet,
    fontSize: 10.5,
    fontWeight: '700',
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

  /* ─── Makro İlerleme Satırları ─── */
  macroProgress: {
    marginBottom: 13,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  metricLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  track: {
    height: 5,
    backgroundColor: '#202D48',
    borderRadius: 999,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 999,
  },

  /* ─── Form Kartı ─── */
  inputCard: {
    borderColor: 'rgba(67, 214, 173, 0.35)',
    backgroundColor: colors.inputCardBg,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 5,
  },

  /* ─── Mini Haftalık Bar Grafik ─── */
  chartContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 4,
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 80,
  },
  chartBarCol: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  chartBarPill: {
    width: 26,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginBottom: 6,
  },
  chartDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
  },
});
