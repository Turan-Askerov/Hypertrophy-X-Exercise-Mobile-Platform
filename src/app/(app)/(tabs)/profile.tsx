import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { useWorkouts } from '@/hooks/use-workouts';
import { formatTrDate } from '@/lib/rpe';
import type { User } from '@/types/user';

// ─── SVG İkonları ───

function SettingsGearIcon({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
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

function ChevronDownIcon({ size = 18, color = '#9ca3af' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M19 9l-7 7-7-7" />
    </Svg>
  );
}

function CheckCircleFill({ size = 20, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
    </Svg>
  );
}

function RadioUnchecked({ size = 20, color = '#374151' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function SeedlingIcon({ size = 20, color = '#10b981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22V12m0 0a5 5 0 015-5h2a5 5 0 01-5 5zm0 0a5 5 0 00-5-5H5a5 5 0 005 5z" />
    </Svg>
  );
}

function LightningIcon({ size = 20, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function TrophyIcon({ size = 20, color = '#f59e0b' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4M5 4h14v4a7 7 0 01-14 0V4z" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 6H3a2 2 0 00-2 2v1a4 4 0 004 4h0m14-7h2a2 2 0 012 2v1a4 4 0 01-4 4h0" />
    </Svg>
  );
}

function DumbbellIcon({ size = 20, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
    </Svg>
  );
}

function FlameIcon({ size = 20, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </Svg>
  );
}

function StarIcon({ size = 20, color = '#C6F432' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        stroke={color}
        strokeWidth={2}
        fill={color}
        fillOpacity={0.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BadgeRibbonIcon({ size = 20, color = '#38BDF8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="6" stroke={color} strokeWidth={2} />
      <Path
        d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function MuscleIcon({ size = 20, color = '#8b5cf6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19v-2a4 4 0 014-4h8a4 4 0 014 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
    </Svg>
  );
}

function ShieldIcon({ size = 20, color = '#10b981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function BoltIcon({ size = 20, color = '#06b6d4' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </Svg>
  );
}

function CalendarIcon({ size = 18, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </Svg>
  );
}

function ClockIcon({ size = 18, color = '#f59e0b' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2" />
    </Svg>
  );
}

function MaleIcon({ size = 18, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="10" cy="14" r="5" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
    </Svg>
  );
}

function FemaleIcon({ size = 18, color = '#ec4899' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="9" r="5" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7M9 18h6" />
    </Svg>
  );
}

// ─── Sabit Seçenekler ───

const FITNESS_LEVELS = [
  {
    key: 'Beginner',
    title: 'Başlangıç Seviyesi',
    badge: '0 - 1 Yıl',
    desc: 'Temel bileşik hareket kalıpları, form stabilitesi ve nöromüsküler adaptasyon.',
    icon: SeedlingIcon,
    accent: '#10b981',
  },
  {
    key: 'Intermediate',
    title: 'Orta Seviye',
    badge: '1 - 3 Yıl',
    desc: 'Aşamalı aşırı yüklenme (progressive overload), hacim döngüleri ve hipertrofi.',
    icon: LightningIcon,
    accent: '#3b82f6',
  },
  {
    key: 'Advanced',
    title: 'İleri Seviye (Elite)',
    badge: '3+ Yıl',
    desc: 'Yüksek yoğunluklu setler, RPE/RIR hassasiyeti, plato aşımı ve mikro döngüler.',
    icon: TrophyIcon,
    accent: '#f59e0b',
  },
] as const;

const GOAL_OPTIONS = [
  {
    key: 'hypertrophy',
    title: 'Saf Hipertrofi (Kas Odaklı)',
    badge: 'Lif Büyümesi',
    desc: 'Mekanik gerilim ve metabolik stres ile hedef kas lifi mikroyırtığı ve optimum büyüme.',
    icon: MuscleIcon,
    accent: '#8b5cf6',
  },
  {
    key: 'bulk',
    title: 'Hacim & Kütle (Bulk)',
    badge: 'MAV Hacim',
    desc: 'Kontrollü kalori fazlası ve maksimum hipertrofi hacmi ile net kas kütlesi inşası.',
    icon: DumbbellIcon,
    accent: '#3b82f6',
  },
  {
    key: 'cut',
    title: 'Definasyon & Yağ Yakımı (Cut)',
    badge: 'MEV Yağ Yakımı',
    desc: 'Kalori açığında kas kütlesini azami seviyede koruyan minimum etkili hacim.',
    icon: FlameIcon,
    accent: '#ef4444',
  },
  {
    key: 'strength',
    title: 'Maksimal Güç (Kuvvet)',
    badge: '1RM & MSS',
    desc: 'Düşük tekrar, yüksek yoğunluklu nöromüsküler patlayıcı kuvvet adaptasyonu.',
    icon: BoltIcon,
    accent: '#06b6d4',
  },
  {
    key: 'maintain',
    title: 'Form Koruma & Rekomp',
    badge: 'MV Denge',
    desc: 'Yorulma birikimi olmadan mevcut kas kütlesini koruma ve metabolik zindelik.',
    icon: ShieldIcon,
    accent: '#10b981',
  },
] as const;

const DAY_PRESETS = [2, 3, 4, 5, 6, 7];
const SESSION_PRESETS = [45, 60, 75, 90, 120];

// ─── RPG & XP Hesaplama Fonksiyonu (Web Platformuyla Birebir Uyumlu) ───

const LEVEL_THRESHOLDS = [0, 500, 1000, 5000, 15000, 35000, 75000];
const LEVEL_TITLES = [
  'Çaylak',
  'Çaylak',
  'Demir Bükücü',
  'Çelik İradesi',
  'Spartalı',
  'Titan',
  'Yarı Tanrı',
  'Olimposlu',
];

function calculateRpgState(workouts: any[]) {
  const sorted = [...(workouts || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalXP = 0;
  sorted.forEach((w) => {
    let exercises: any[] = [];
    try {
      if (typeof w.exercises === 'string') {
        exercises = JSON.parse(w.exercises);
      } else if (Array.isArray(w.exercises)) {
        exercises = w.exercises;
      }
    } catch {}

    exercises.forEach((ex) => {
      const sets = ex.sets_data || [];
      const count =
        Array.isArray(sets) && sets.length > 0 ? sets.length : parseInt(ex.sets, 10) || 1;
      totalXP += count * 15;
    });

    if (totalXP === 0 && exercises.length > 0) {
      totalXP += 50;
    }
  });

  // Haftalık seri hesaplama
  let streakWeeks = 0;
  if (sorted.length > 0) {
    const dates = sorted.map((w) => new Date(w.date).getTime());
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const latestWorkoutTime = Math.max(...dates);
    if (now - latestWorkoutTime <= oneWeekMs * 2) {
      streakWeeks = Math.max(1, Math.min(12, Math.ceil(sorted.length / 3)));
    }
  }

  let currentLevel = 1;
  let prevTarget = 0;
  let nextTarget = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      currentLevel = i + 1;
      prevTarget = LEVEL_THRESHOLDS[i];
      nextTarget = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i] * 1.5;
    } else {
      break;
    }
  }

  const xpInCurrentLevel = Math.max(0, totalXP - prevTarget);
  const levelSize = Math.max(1, nextTarget - prevTarget);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / levelSize) * 100))
  );
  const xpLeft = Math.max(0, nextTarget - totalXP);
  const levelTitle = LEVEL_TITLES[currentLevel - 1] || 'Efsanevi Sporcu';

  return {
    totalXP,
    currentLevel,
    levelTitle,
    xpInCurrentLevel,
    levelSize,
    progressPercent,
    xpLeft,
    streakWeeks,
  };
}

function normalizeFitnessLevel(raw?: string | null): string {
  if (!raw) return 'Intermediate';
  const l = raw.toLowerCase();
  if (l.includes('adv') || l.includes('ileri')) return 'Advanced';
  if (l.includes('inter') || l.includes('orta')) return 'Intermediate';
  if (l.includes('beg') || l.includes('başlangıç') || l.includes('baslangic')) return 'Beginner';
  return 'Intermediate';
}

function normalizeGender(raw?: string | null): string {
  if (!raw) return 'male';
  const g = raw.toLowerCase();
  if (g.includes('fem') || g.includes('kadın') || g.includes('kadin')) return 'female';
  return 'male';
}

function normalizeGoal(raw?: string | null): string {
  if (!raw) return 'hypertrophy';
  const g = raw.toLowerCase();
  if (g.includes('hypertrophy') || g.includes('kas')) return 'hypertrophy';
  if (g.includes('bulk') || g.includes('kilo alma')) return 'bulk';
  if (g.includes('cut') || g.includes('yağ') || g.includes('yag')) return 'cut';
  if (g.includes('strength') || g.includes('güç') || g.includes('guc')) return 'strength';
  if (g.includes('maintain') || g.includes('koruma')) return 'maintain';
  return g;
}

// ─── Modern Atletik Profil Formu (Kompakt ve Açılır Liste Seçimli) ───

function ProfileForm({
  user,
  onSave,
  saving,
}: {
  user: User;
  onSave: (data: {
    age: number | null;
    gender: string;
    height: number | null;
    weight: number | null;
    fitness_level: string;
    goal: string;
    days_per_week: number;
    session_time_mins: number;
  }) => Promise<void>;
  saving: boolean;
}) {
  const [age, setAge] = useState(user.age ? String(user.age) : '');
  const [gender, setGender] = useState(normalizeGender(user.gender));
  const [height, setHeight] = useState(user.height ? String(user.height) : '');
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : '');
  const [fitnessLevel, setFitnessLevel] = useState(normalizeFitnessLevel(user.fitness_level));
  const [goal, setGoal] = useState(normalizeGoal(user.goal));
  const [daysPerWeek, setDaysPerWeek] = useState(
    user.days_per_week ? String(user.days_per_week) : '4'
  );
  const [sessionTimeMins, setSessionTimeMins] = useState(
    user.session_time_mins ? String(user.session_time_mins) : '60'
  );

  // Açılır Liste Seçici Modalları (Dropdown Modals)
  const [activePicker, setActivePicker] = useState<
    'fitness' | 'goal' | 'frequency' | 'duration' | null
  >(null);

  const selectedFitnessObj = useMemo(
    () => FITNESS_LEVELS.find((f) => f.key === fitnessLevel) || FITNESS_LEVELS[1],
    [fitnessLevel]
  );
  const SelectedFitnessIcon = selectedFitnessObj.icon;

  const selectedGoalObj = useMemo(
    () => GOAL_OPTIONS.find((g) => g.key === goal) || GOAL_OPTIONS[0],
    [goal]
  );
  const SelectedGoalIcon = selectedGoalObj.icon;

  const handleSubmit = () => {
    onSave({
      age: age ? parseInt(age, 10) : null,
      gender,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      fitness_level: fitnessLevel,
      goal,
      days_per_week: daysPerWeek ? parseInt(daysPerWeek, 10) : 4,
      session_time_mins: sessionTimeMins ? parseInt(sessionTimeMins, 10) : 60,
    });
  };

  return (
    <Card style={styles.formCard}>
      {/* 1. Biyometrik Ölçümler */}
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>Biyometrik Ölçümler</Text>
        <Text style={styles.groupSubtitle}>Kişisel kalori ve hacim motoru için temel değerler.</Text>
      </View>

      {/* Cinsiyet Seçimi */}
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderCard,
            gender === 'male' && styles.genderCardActiveMale,
          ]}
          onPress={() => setGender('male')}
          activeOpacity={0.7}
        >
          <MaleIcon size={18} color={gender === 'male' ? '#3b82f6' : Colors.dark.textSecondary} />
          <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
            Erkek
          </Text>
          {gender === 'male' && <CheckCircleFill size={16} color="#3b82f6" />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderCard,
            gender === 'female' && styles.genderCardActiveFemale,
          ]}
          onPress={() => setGender('female')}
          activeOpacity={0.7}
        >
          <FemaleIcon size={18} color={gender === 'female' ? '#ec4899' : Colors.dark.textSecondary} />
          <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
            Kadın
          </Text>
          {gender === 'female' && <CheckCircleFill size={16} color="#ec4899" />}
        </TouchableOpacity>
      </View>

      {/* Yaş, Boy, Kilo (Taşmayan, Temiz Metrik Düzeni) */}
      <View style={styles.metricInputRow}>
        <View style={styles.metricInputCol}>
          <Text style={styles.label}>
            Yaş <Text style={styles.labelUnit}>(yıl)</Text>
          </Text>
          <TextInput
            style={styles.metricTextInput}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="24"
            placeholderTextColor="#6b7280"
            maxLength={3}
          />
        </View>

        <View style={styles.metricInputCol}>
          <Text style={styles.label}>
            Boy <Text style={styles.labelUnit}>(cm)</Text>
          </Text>
          <TextInput
            style={styles.metricTextInput}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder="178"
            placeholderTextColor="#6b7280"
            maxLength={5}
          />
        </View>

        <View style={styles.metricInputCol}>
          <Text style={styles.label}>
            Kilo <Text style={styles.labelUnit}>(kg)</Text>
          </Text>
          <TextInput
            style={styles.metricTextInput}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="76.5"
            placeholderTextColor="#6b7280"
            maxLength={5}
          />
        </View>
      </View>

      {/* 2. Atletik Tercihler & Hedefler (Açılır Liste Seçicileri) */}
      <View style={[styles.groupHeader, { marginTop: Spacing.two }]}>
        <Text style={styles.groupTitle}>Atletik Tercihler & Hedefler</Text>
        <Text style={styles.groupSubtitle}>
          Dokunarak açılır listeden seviye, hedef ve antrenman sıklığını belirleyin.
        </Text>
      </View>

      <View style={styles.selectorsList}>
        {/* Fitness Seviyesi Seçici */}
        <TouchableOpacity
          style={styles.selectorTrigger}
          onPress={() => setActivePicker('fitness')}
          activeOpacity={0.7}
        >
          <View style={styles.selectorLeft}>
            <View style={[styles.selectorIconBox, { backgroundColor: `${selectedFitnessObj.accent}20` }]}>
              <SelectedFitnessIcon size={18} color={selectedFitnessObj.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>Fitness Seviyesi</Text>
              <Text style={styles.selectorValue}>{selectedFitnessObj.title}</Text>
            </View>
          </View>
          <View style={styles.selectorRight}>
            <View style={[styles.selectorBadge, { backgroundColor: `${selectedFitnessObj.accent}25` }]}>
              <Text style={[styles.selectorBadgeText, { color: selectedFitnessObj.accent }]}>
                {selectedFitnessObj.badge}
              </Text>
            </View>
            <ChevronDownIcon size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {/* Birincil Antrenman Hedefi Seçici */}
        <TouchableOpacity
          style={styles.selectorTrigger}
          onPress={() => setActivePicker('goal')}
          activeOpacity={0.7}
        >
          <View style={styles.selectorLeft}>
            <View style={[styles.selectorIconBox, { backgroundColor: `${selectedGoalObj.accent}20` }]}>
              <SelectedGoalIcon size={18} color={selectedGoalObj.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>Birincil Antrenman Hedefi</Text>
              <Text style={styles.selectorValue}>{selectedGoalObj.title}</Text>
            </View>
          </View>
          <View style={styles.selectorRight}>
            <View style={[styles.selectorBadge, { backgroundColor: `${selectedGoalObj.accent}25` }]}>
              <Text style={[styles.selectorBadgeText, { color: selectedGoalObj.accent }]}>
                {selectedGoalObj.badge}
              </Text>
            </View>
            <ChevronDownIcon size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {/* Haftalık Antrenman Sıklığı */}
        <TouchableOpacity
          style={styles.selectorTrigger}
          onPress={() => setActivePicker('frequency')}
          activeOpacity={0.7}
        >
          <View style={styles.selectorLeft}>
            <View style={[styles.selectorIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <CalendarIcon size={18} color="#3b82f6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>Antrenman Sıklığı</Text>
              <Text style={styles.selectorValue}>{daysPerWeek} Gün / Hafta</Text>
            </View>
          </View>
          <View style={styles.selectorRight}>
            <ChevronDownIcon size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>

        {/* Hedef Seans Süresi */}
        <TouchableOpacity
          style={styles.selectorTrigger}
          onPress={() => setActivePicker('duration')}
          activeOpacity={0.7}
        >
          <View style={styles.selectorLeft}>
            <View style={[styles.selectorIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <ClockIcon size={18} color="#f59e0b" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.selectorLabel}>Hedef Seans Süresi</Text>
              <Text style={styles.selectorValue}>{sessionTimeMins} Dakika</Text>
            </View>
          </View>
          <View style={styles.selectorRight}>
            <ChevronDownIcon size={18} color="#9ca3af" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Kaydet Butonu */}
      <View style={{ marginTop: Spacing.two }}>
        <Button onPress={handleSubmit} loading={saving} disabled={saving}>
          Atletik Profili Güncelle
        </Button>
      </View>

      {/* ─── Seçici Modalı (Picker Bottom Sheet Modal) ─── */}
      <Modal visible={activePicker !== null} animationType="slide" transparent>
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerSheet}>
            <View style={styles.pickerHandle} />

            {/* Fitness Seviyesi Listesi */}
            {activePicker === 'fitness' && (
              <>
                <Text style={styles.pickerTitle}>Fitness Seviyenizi Seçin</Text>
                <Text style={styles.pickerDesc}>
                  Haftalık set hacmini ve toparlanma periyotlarını belirler.
                </Text>

                <View style={styles.pickerOptionsList}>
                  {FITNESS_LEVELS.map((item) => {
                    const isSelected = fitnessLevel === item.key;
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.pickerOptionCard,
                          isSelected && styles.pickerOptionCardActive,
                          isSelected && { borderColor: item.accent },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setFitnessLevel(item.key);
                          setActivePicker(null);
                        }}
                      >
                        <View style={[styles.pickerIconBox, { backgroundColor: `${item.accent}20` }]}>
                          <IconComp size={20} color={item.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.pickerOptionTitle, isSelected && { color: '#ffffff' }]}>
                              {item.title}
                            </Text>
                            <View style={[styles.selectorBadge, { backgroundColor: `${item.accent}25` }]}>
                              <Text style={[styles.selectorBadgeText, { color: item.accent }]}>
                                {item.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.pickerOptionDesc}>{item.desc}</Text>
                        </View>
                        {isSelected ? (
                          <CheckCircleFill size={22} color={item.accent} />
                        ) : (
                          <RadioUnchecked size={22} color="#374151" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Antrenman Hedefi Listesi */}
            {activePicker === 'goal' && (
              <>
                <Text style={styles.pickerTitle}>Antrenman Hedefinizi Seçin</Text>
                <Text style={styles.pickerDesc}>
                  Set sayısı, hedef tekrar aralıkları ve dinlenme sürelerini optimize eder.
                </Text>

                <View style={styles.pickerOptionsList}>
                  {GOAL_OPTIONS.map((item) => {
                    const isSelected = goal === item.key;
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.pickerOptionCard,
                          isSelected && styles.pickerOptionCardActive,
                          isSelected && { borderColor: item.accent },
                        ]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setGoal(item.key);
                          setActivePicker(null);
                        }}
                      >
                        <View style={[styles.pickerIconBox, { backgroundColor: `${item.accent}20` }]}>
                          <IconComp size={20} color={item.accent} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.pickerOptionTitle, isSelected && { color: '#ffffff' }]}>
                              {item.title}
                            </Text>
                            <View style={[styles.selectorBadge, { backgroundColor: `${item.accent}25` }]}>
                              <Text style={[styles.selectorBadgeText, { color: item.accent }]}>
                                {item.badge}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.pickerOptionDesc}>{item.desc}</Text>
                        </View>
                        {isSelected ? (
                          <CheckCircleFill size={22} color={item.accent} />
                        ) : (
                          <RadioUnchecked size={22} color="#374151" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Sıklık (Frekans) Listesi */}
            {activePicker === 'frequency' && (
              <>
                <Text style={styles.pickerTitle}>Haftalık Antrenman Sıklığı</Text>
                <Text style={styles.pickerDesc}>
                  Haftada kaç gün spor yapacağınızı seçin.
                </Text>

                <View style={styles.pickerSimpleList}>
                  {DAY_PRESETS.map((day) => {
                    const isSelected = daysPerWeek === String(day);
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[styles.pickerSimpleItem, isSelected && styles.pickerSimpleItemActive]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setDaysPerWeek(String(day));
                          setActivePicker(null);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <CalendarIcon size={18} color={isSelected ? '#3b82f6' : '#9ca3af'} />
                          <Text style={[styles.pickerSimpleText, isSelected && styles.pickerSimpleTextActive]}>
                            {day} Gün / Hafta
                          </Text>
                        </View>
                        {isSelected ? (
                          <CheckCircleFill size={20} color="#3b82f6" />
                        ) : (
                          <RadioUnchecked size={20} color="#374151" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            {/* Seans Süresi Listesi */}
            {activePicker === 'duration' && (
              <>
                <Text style={styles.pickerTitle}>Hedef Seans Süresi</Text>
                <Text style={styles.pickerDesc}>
                  Antrenman başına ortalama harcamak istediğiniz süre.
                </Text>

                <View style={styles.pickerSimpleList}>
                  {SESSION_PRESETS.map((mins) => {
                    const isSelected = sessionTimeMins === String(mins);
                    return (
                      <TouchableOpacity
                        key={mins}
                        style={[styles.pickerSimpleItem, isSelected && styles.pickerSimpleItemActive]}
                        activeOpacity={0.7}
                        onPress={() => {
                          setSessionTimeMins(String(mins));
                          setActivePicker(null);
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <ClockIcon size={18} color={isSelected ? '#f59e0b' : '#9ca3af'} />
                          <Text style={[styles.pickerSimpleText, isSelected && styles.pickerSimpleTextActive]}>
                            {mins} Dakika
                          </Text>
                        </View>
                        {isSelected ? (
                          <CheckCircleFill size={20} color="#f59e0b" />
                        ) : (
                          <RadioUnchecked size={20} color="#374151" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}

            <Button
              variant="secondary"
              onPress={() => setActivePicker(null)}
              style={{ marginTop: Spacing.four }}
            >
              Kapat
            </Button>
          </View>
        </View>
      </Modal>
    </Card>
  );
}

// ─── Ana Profil Ekranı ───

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading, error, refetch, updateProfile, isUpdatingProfile } = useUser();
  const { workouts } = useWorkouts();

  // RPG & XP Gelişim Seviyesi Durumu (Web Platformuyla Uyumlu)
  const rpgState = useMemo(() => calculateRpgState(workouts), [workouts]);

  const normalizedLvl = normalizeFitnessLevel(user?.fitness_level);
  const levelBadgeInfo =
    normalizedLvl === 'Advanced'
      ? { label: 'İleri Seviye (Elite)', color: '#f59e0b' }
      : normalizedLvl === 'Intermediate'
        ? { label: 'Orta Seviye Atlet', color: '#3b82f6' }
        : { label: 'Başlangıç Atlet', color: '#10b981' };

  // Profil Güncelleme
  const handleSaveProfile = async (formData: {
    age: number | null;
    gender: string;
    height: number | null;
    weight: number | null;
    fitness_level: string;
    goal: string;
    days_per_week: number;
    session_time_mins: number;
  }) => {
    if (!user) return;
    try {
      await updateProfile({
        username: user.username,
        ...formData,
      });
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Profil güncellenemedi.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <Skeleton height={140} />
          <Skeleton height={280} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {typeof error === 'string' ? error : error?.message || 'Profil verisi yüklenemedi.'}
          </Text>
          <Button onPress={refetch}>Tekrar Dene</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Üst Başlık & Ayarlar Butonu */}
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Sporcu Profili</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push('/(app)/settings')}
            activeOpacity={0.7}
            accessibilityLabel="Ayarlar"
          >
            <SettingsGearIcon size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 1. Kullanıcı Başlık & XP Gelişim Seviyesi Kartı */}
        <Card style={styles.userCard}>
          <View style={styles.userCardTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {user.username.slice(0, 2).toUpperCase()}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.username}>{user.username}</Text>
                <View style={[styles.levelBadge, { backgroundColor: `${levelBadgeInfo.color}20` }]}>
                  <Text style={[styles.levelBadgeText, { color: levelBadgeInfo.color }]}>
                    {levelBadgeInfo.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.emailText}>{user.email || 'E-posta eklenmedi'}</Text>

              {user.created_at ? (
                <Text style={styles.dateSubtext}>
                  Üyelik: {formatTrDate(user.created_at)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* XP & Gelişim Seviyesi Widget'ı (Web Platformu Tarzında) */}
          <View style={styles.rpgCard}>
            <View style={styles.rpgTopRow}>
              <View>
                <Text style={styles.rpgLabel}>GELİŞİM SEVİYESİ</Text>
                <View style={styles.rpgTitleRow}>
                  <Text style={styles.rpgLevelTitle}>{rpgState.levelTitle}</Text>
                  <View style={styles.rpgLevelBadge}>
                    <Text style={styles.rpgLevelBadgeText}>LVL {rpgState.currentLevel}</Text>
                  </View>
                </View>
              </View>

              {rpgState.streakWeeks > 0 && (
                <View style={styles.rpgStreakPill}>
                  <Text style={styles.rpgStreakText}>🔥 {rpgState.streakWeeks} Hafta Seri</Text>
                </View>
              )}
            </View>

            <View style={styles.rpgProgressSection}>
              <View style={styles.rpgProgressHeader}>
                <Text style={styles.rpgProgressLabel}>SEVİYE İLERLEMESİ</Text>
                <Text style={styles.rpgProgressValue}>
                  {rpgState.xpInCurrentLevel} / {rpgState.levelSize} XP (%{rpgState.progressPercent})
                </Text>
              </View>
              <View style={styles.rpgProgressBarTrack}>
                <View
                  style={[
                    styles.rpgProgressBarFill,
                    { width: `${rpgState.progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.rpgBottomRow}>
              <Text style={styles.rpgNextText}>
                🎯 Seviye {rpgState.currentLevel + 1} için {rpgState.xpLeft} XP kaldı
              </Text>
              <Text style={styles.rpgTotalXpText}>{rpgState.totalXP} XP Toplam</Text>
            </View>
          </View>
        </Card>

        {/* 2. 3'lü Özet İstatistik Kartları (ProfilSayfası.png) */}
        <View style={styles.profileStatsRow}>
          <View style={styles.profileStatBox}>
            <View style={[styles.profileStatIconWrap, { backgroundColor: 'rgba(250, 204, 21, 0.12)' }]}>
              <FlameIcon size={18} color="#FACC15" />
            </View>
            <View style={styles.profileStatTextWrap}>
              <Text style={styles.profileStatVal}>{rpgState.streakWeeks > 0 ? rpgState.streakWeeks * 7 : 12} gün</Text>
              <Text style={styles.profileStatLabel}>Seri</Text>
            </View>
          </View>

          <View style={styles.profileStatBox}>
            <View style={[styles.profileStatIconWrap, { backgroundColor: 'rgba(198, 244, 50, 0.12)' }]}>
              <StarIcon size={18} color="#C6F432" />
            </View>
            <View style={styles.profileStatTextWrap}>
              <Text style={styles.profileStatVal}>{rpgState.totalXP > 0 ? rpgState.totalXP : 48} XP</Text>
              <Text style={styles.profileStatLabel}>Puan</Text>
            </View>
          </View>

          <View style={styles.profileStatBox}>
            <View style={[styles.profileStatIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.12)' }]}>
              <BadgeRibbonIcon size={18} color="#38BDF8" />
            </View>
            <View style={styles.profileStatTextWrap}>
              <Text style={styles.profileStatVal}>{Math.max(1, rpgState.currentLevel + 2)} rozet</Text>
              <Text style={styles.profileStatLabel}>Başarılar</Text>
            </View>
          </View>
        </View>

        {/* 3. Atletik Profil Formu */}
        <ProfileForm
          key={user.id}
          user={user}
          onSave={handleSaveProfile}
          saving={isUpdatingProfile}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six * 2,
    gap: Spacing.three,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileStatBox: {
    flex: 1,
    backgroundColor: '#13161F',
    borderRadius: Radius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#232A3B',
  },
  profileStatIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileStatTextWrap: {
    flex: 1,
  },
  profileStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileStatLabel: {
    fontSize: 11,
    color: '#8E99AF',
    marginTop: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  settingsBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1a1b1e',
    borderWidth: 1,
    borderColor: '#2d3139',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenTitle: {
    fontSize: Typography.title,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  errorText: {
    fontSize: Typography.body,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.three,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#252830',
    gap: Spacing.three,
  },
  userCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  username: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emailText: {
    fontSize: Typography.label,
    color: Colors.dark.textSecondary,
  },
  dateSubtext: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },

  /* ═══ RPG & XP Gelişim Kartı ═══ */
  rpgCard: {
    backgroundColor: '#16181d',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    padding: 14,
    gap: 10,
  },
  rpgTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rpgLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#94a3b8',
    marginBottom: 2,
  },
  rpgTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rpgLevelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  rpgLevelBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.4)',
  },
  rpgLevelBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#c084fc',
  },
  rpgStreakPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rpgStreakText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fbbf24',
  },
  rpgProgressSection: {
    gap: 6,
  },
  rpgProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rpgProgressLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rpgProgressValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#c084fc',
  },
  rpgProgressBarTrack: {
    height: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  rpgProgressBarFill: {
    height: '100%',
    backgroundColor: '#a855f7',
    borderRadius: 999,
  },
  rpgBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rpgNextText: {
    fontSize: 11,
    color: '#94a3b8',
    flex: 1,
  },
  rpgTotalXpText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#cbd5e1',
  },

  /* ═══ Form Kartı & Alanları ═══ */
  formCard: {
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  groupHeader: {
    marginBottom: 2,
  },
  groupTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  groupSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.two,
    backgroundColor: Colors.dark.background,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: AppColors.border,
  },
  genderCardActiveMale: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  genderCardActiveFemale: {
    borderColor: '#ec4899',
    backgroundColor: 'rgba(236, 72, 153, 0.08)',
  },
  genderText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  genderTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  metricInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  metricInputCol: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'lowercase',
  },
  metricTextInput: {
    height: 48,
    backgroundColor: '#14151a',
    borderWidth: 1.5,
    borderColor: '#262933',
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },

  /* ═══ Seçici Butonları (Açılır Liste Triggers) ═══ */
  selectorsList: {
    gap: 10,
  },
  selectorTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16171d',
    borderWidth: 1.5,
    borderColor: '#262933',
    borderRadius: Radius.md,
    padding: 12,
    gap: 10,
  },
  selectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  selectorIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 2,
  },
  selectorValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#ffffff',
  },
  selectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  selectorBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  /* ═══ Seçici Modal Bottom Sheet ═══ */
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#1a1b1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#2d3139',
    padding: Spacing.four,
    paddingBottom: Spacing.six,
    maxHeight: '85%',
  },
  pickerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4b5563',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  pickerDesc: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  pickerOptionsList: {
    gap: 10,
  },
  pickerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14151a',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: '#262933',
    padding: 12,
    gap: 12,
  },
  pickerOptionCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  pickerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e4e4e7',
  },
  pickerOptionDesc: {
    fontSize: 11.5,
    color: '#8b8e96',
    marginTop: 2,
    lineHeight: 16,
  },
  pickerSimpleList: {
    gap: 8,
  },
  pickerSimpleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: Radius.md,
    backgroundColor: '#14151a',
    borderWidth: 1.5,
    borderColor: '#262933',
  },
  pickerSimpleItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  pickerSimpleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
  },
  pickerSimpleTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
