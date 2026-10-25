import React, { useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useProgress } from '@/hooks/use-progress';
import type { PersonalRecordItem, ProgressMetric, ProgressPeriod } from '@/types/progress';

// Android için LayoutAnimation etkinleştirme
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Cyber Dark Tema Renkleri ───
const C = {
  bg: '#070B18',
  surface: '#111A2F',
  surfaceAlt: '#17223B',
  input: '#080E1C',
  border: '#263452',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  text: '#F5F7FF',
  muted: '#8995B2',
  violet: '#A78BFA',
  primaryDeep: '#7058DB',
  cyan: '#39C6EF',
  mint: '#43D6AD',
  yellow: '#FFC94D',
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

// ─── Varsayılan Zengin İlerleme Verileri (20 adet) ───
const DEFAULT_IMPROVEMENTS: ImprovementCardData[] = [
  { name: 'Shoulder Press Machine', muscle: 'Omuz', from: '50 kg', to: '55 kg', change: '+10%', startDate: '24.07', endDate: '20.10' },
  { name: 'Pull Ups (Barfiks)', muscle: 'Sırt', from: '8 tkr', to: '12 tkr', change: '+50%', startDate: '20.07', endDate: '17.10' },
  { name: 'Skull Crushers', muscle: 'Triceps', from: '30 kg', to: '35 kg', change: '+16%', startDate: '24.07', endDate: '05.10' },
  { name: 'Dips', muscle: 'Triceps', from: '15 tkr', to: '20 tkr', change: '+33%', startDate: '07.09', endDate: '30.09' },
  { name: 'Chin Ups', muscle: 'Sırt', from: '8 tkr', to: '10 tkr', change: '+25%', startDate: '24.08', endDate: '24.09' },
  { name: 'Lat Pull Down', muscle: 'Sırt', from: '60 kg', to: '65 kg', change: '+8%', startDate: '11.08', endDate: '15.09' },
  { name: 'Incline Dumbbell Press', muscle: 'Göğüs', from: '28 kg', to: '34 kg', change: '+21%', startDate: '15.06', endDate: '12.10' },
  { name: 'Barbell Row', muscle: 'Sırt', from: '60 kg', to: '72.5 kg', change: '+20%', startDate: '02.07', endDate: '18.10' },
  { name: 'Romanian Deadlift', muscle: 'Bacak', from: '70 kg', to: '85 kg', change: '+21%', startDate: '10.07', endDate: '22.10' },
  { name: 'Leg Press', muscle: 'Bacak', from: '140 kg', to: '180 kg', change: '+28%', startDate: '20.06', endDate: '19.10' },
  { name: 'Lateral Raises', muscle: 'Omuz', from: '10 kg', to: '14 kg', change: '+40%', startDate: '15.07', endDate: '14.10' },
  { name: 'Bicep Curl (Barbell)', muscle: 'Biceps', from: '25 kg', to: '32.5 kg', change: '+30%', startDate: '12.06', endDate: '16.10' },
  { name: 'Hammer Curl', muscle: 'Biceps', from: '12 kg', to: '16 kg', change: '+33%', startDate: '22.06', endDate: '11.10' },
  { name: 'Tricep Pushdown', muscle: 'Triceps', from: '25 kg', to: '35 kg', change: '+40%', startDate: '01.07', endDate: '20.10' },
  { name: 'Front Squat', muscle: 'Bacak', from: '60 kg', to: '75 kg', change: '+25%', startDate: '18.07', endDate: '23.10' },
  { name: 'Seated Cable Row', muscle: 'Sırt', from: '50 kg', to: '62.5 kg', change: '+25%', startDate: '05.07', endDate: '19.10' },
  { name: 'Flat DB Bench Press', muscle: 'Göğüs', from: '26 kg', to: '32 kg', change: '+23%', startDate: '14.07', endDate: '21.10' },
  { name: 'Face Pull', muscle: 'Omuz', from: '20 kg', to: '30 kg', change: '+50%', startDate: '08.07', endDate: '15.10' },
  { name: 'Calf Raises', muscle: 'Bacak', from: '50 kg', to: '70 kg', change: '+40%', startDate: '12.07', endDate: '17.10' },
  { name: 'Bulgarian Split Squat', muscle: 'Bacak', from: '30 kg', to: '40 kg', change: '+33%', startDate: '01.08', endDate: '25.10' },
];

const MONTHS_LIST = ['Temmuz 2026', 'Ağustos 2026', 'Eylül 2026', 'Ekim 2026'];

const DEFAULT_EXERCISES_LIST = [
  'Bulgarian Split Squat',
  'Bench Press',
  'Shoulder Press Machine',
  'Pull Ups (Barfiks)',
  'Lat Pull Down',
  'Romanian Deadlift',
  'Barbell Row',
  'Squat',
  'Dips',
  'Skull Crushers',
  'Chin Ups',
  'Incline Dumbbell Press',
];

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

// ─── Varsayılan PR Grupları (İlk Yükleme / Boş Veri Durumu İçin) ───
const DEFAULT_PR_GROUPS: PrGroupData[] = [
  {
    title: '⚡ BİLEŞİK HAREKETLER (COMPOUND)',
    badgeBg: 'rgba(139, 92, 246, 0.22)',
    borderColor: '#8B5CF6',
    textColor: '#E9D5FF',
    items: [
      { name: 'Bulgarian Split Squat', muscle: 'Quadriceps, Gluteus', weight: '40 kg', reps: '8 tkr', date: '25.10.2026' },
      { name: 'Bench Press', muscle: 'Göğüs', weight: '80 kg', reps: '8 tkr', date: '15.10.2026' },
      { name: 'Romanian Deadlift', muscle: 'Hamstring, Gluteus', weight: '75 kg', reps: '10 tkr', date: '15.10.2026' },
      { name: 'Barbell Squat', muscle: 'Quadriceps, Gluteus', weight: '110 kg', reps: '6 tkr', date: '22.10.2026' },
      { name: 'Overhead Press', muscle: 'Omuz, Triceps', weight: '55 kg', reps: '7 tkr', date: '18.10.2026' },
    ],
  },
  {
    title: 'GÖĞÜS HAREKETLERİ',
    badgeBg: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06B6D4',
    textColor: '#22D3EE',
    items: [
      { name: 'Incline Dumbbell Press', muscle: 'Üst Göğüs, Ön Omuz', weight: '35 kg', reps: '9 tkr', date: '20.10.2026' },
      { name: 'Cable Crossover', muscle: 'İç Göğüs', weight: '17.5 kg', reps: '12 tkr', date: '16.10.2026' },
      { name: 'Dips', muscle: 'Alt Göğüs, Triceps', weight: '20 kg', reps: '8 tkr', date: '14.10.2026' },
    ],
  },
  {
    title: 'SIRT HAREKETLERİ',
    badgeBg: 'rgba(99, 102, 241, 0.2)',
    borderColor: '#6366F1',
    textColor: '#818CF8',
    items: [
      { name: 'Lat Pull Down', muscle: 'Geniş Sırt, Biceps', weight: '70 kg', reps: '10 tkr', date: '21.10.2026' },
      { name: 'Barbell Row', muscle: 'Orta Sırt, Kanat', weight: '75 kg', reps: '8 tkr', date: '19.10.2026' },
      { name: 'Pull Ups (Barfiks)', muscle: 'Sırt', weight: '15 kg', reps: '8 tkr', date: '17.10.2026' },
      { name: 'Seated Cable Row', muscle: 'Sırt', weight: '65 kg', reps: '11 tkr', date: '13.10.2026' },
    ],
  },
  {
    title: 'OMUZ HAREKETLERİ',
    badgeBg: 'rgba(168, 85, 247, 0.2)',
    borderColor: '#A855F7',
    textColor: '#C084FC',
    items: [
      { name: 'Lateral Raises', muscle: 'Orta Omuz', weight: '14 kg', reps: '14 tkr', date: '24.10.2026' },
      { name: 'Face Pull', muscle: 'Arka Omuz, Rotator', weight: '30 kg', reps: '15 tkr', date: '15.10.2026' },
    ],
  },
  {
    title: 'KOL HAREKETLERİ',
    badgeBg: 'rgba(245, 158, 11, 0.2)',
    borderColor: '#F59E0B',
    textColor: '#FBBF24',
    items: [
      { name: 'Skull Crushers', muscle: 'Triceps', weight: '37.5 kg', reps: '10 tkr', date: '20.10.2026' },
      { name: 'Bicep Curl (Barbell)', muscle: 'Biceps', weight: '35 kg', reps: '8 tkr', date: '22.10.2026' },
      { name: 'Tricep Pushdown', muscle: 'Triceps', weight: '35 kg', reps: '12 tkr', date: '23.10.2026' },
      { name: 'Hammer Curl', muscle: 'Biceps, Ön Kol', weight: '16 kg', reps: '10 tkr', date: '11.10.2026' },
    ],
  },
  {
    title: 'BACAK HAREKETLERİ',
    badgeBg: 'rgba(244, 63, 94, 0.2)',
    borderColor: '#F43F5E',
    textColor: '#FDA4AF',
    items: [
      { name: 'Leg Press', muscle: 'Quadriceps, Gluteus', weight: '180 kg', reps: '10 tkr', date: '19.10.2026' },
      { name: 'Calf Raises', muscle: 'Calf', weight: '70 kg', reps: '15 tkr', date: '17.10.2026' },
      { name: 'Front Squat', muscle: 'Quadriceps', weight: '75 kg', reps: '8 tkr', date: '23.10.2026' },
    ],
  },
];

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

// ─── Tekil İlerleme Kartı Bileşeni ───
function ImprovementCard({
  item,
  onPressGraph,
}: {
  item: ImprovementCardData;
  onPressGraph?: () => void;
}) {
  return (
    <View style={styles.improvement}>
      <View style={styles.cardTopRow}>
        <Text numberOfLines={2} style={styles.cardExerciseName}>
          {item.name}
        </Text>
        <Text style={styles.cardMuscleBadge}>{item.muscle}</Text>
      </View>
      <View style={styles.cardMidRow}>
        <Text style={styles.cardFromVal}>{item.from}</Text>
        <Text style={styles.cardArrow}>→</Text>
        <Text style={styles.cardToVal}>{item.to}</Text>
        <Text style={styles.cardChangeBadge}>{item.change}</Text>
      </View>
      <View style={styles.cardBottomRow}>
        <Text style={styles.cardDates}>
          {item.startDate} → {item.endDate}
        </Text>
        <Pressable hitSlop={6} onPress={onPressGraph}>
          <Text style={styles.cardGraphLink}>Grafik ↗</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── 2'li Gruplar Halinde Sağa Kaydırılabilir Carousel Bileşeni ───
function ImprovementCarousel({
  items,
  pageWidth,
  onPressGraph,
}: {
  items: ImprovementCardData[];
  pageWidth: number;
  onPressGraph: (name: string) => void;
}) {
  const [activePage, setActivePage] = useState(0);

  // Son 6 kartı 2'şerli sayfalara böl
  const pages = useMemo(() => {
    const sixItems = items.slice(0, 6);
    const result: ImprovementCardData[][] = [];
    for (let i = 0; i < sixItems.length; i += 2) {
      result.push(sixItems.slice(i, i + 2));
    }
    return result;
  }, [items]);

  return (
    <View style={{ marginBottom: 12 }}>
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const offset = e.nativeEvent.contentOffset.x;
          const newIdx = Math.round(offset / pageWidth);
          setActivePage(newIdx);
        }}
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

      {/* 3 Sayfalık Sayfa Noktaları (Aktif Sayfa Genişletilmiş Mor Hap) */}
      <View style={styles.carouselDotsRow}>
        {pages.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.carouselDot,
              idx === activePage && styles.carouselDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function ProgressScreen() {
  const { width } = useWindowDimensions();
  const contentWidth = width - 32;

  // Ana Sekme State'i: 'progress' | 'records'
  const [activeTab, setActiveTab] = useState<'progress' | 'records'>('progress');

  // Grafik Seçici State'leri (Haftalık kaldırıldı -> Aylık, Yıllık, Genel)
  const [metric, setMetric] = useState<ProgressMetric>('weight');
  const [period, setPeriod] = useState<ProgressPeriod>('monthly');
  const [monthIndex, setMonthIndex] = useState(1); // Varsayılan: Ağustos 2026
  const [selectedExercise, setSelectedExercise] = useState('Bulgarian Split Squat');

  // Detaylı Bar Seçim State'i (Set sayıları, her setin kilosu ve tekrarı)
  const [selectedBarDetails, setSelectedBarDetails] = useState<{
    index: number;
    weight: number;
    reps: number;
    dayLabel: string;
    sets: SetDetailItem[];
  } | null>(null);

  const [showAllModal, setShowAllModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');

  // Kişisel Rekorlar Başlık Açıp/Kapatma (Accordion) State'i
  const [collapsedPrGroups, setCollapsedPrGroups] = useState<Record<string, boolean>>({});

  const togglePrGroup = (title: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedPrGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // ─── Backend API Hook Entegrasyonu (Gerçek DB Verileri) ───
  const { topProgress, personalRecords, chartData: rawChartData } = useProgress(selectedExercise);

  // Tüm İlerlemeler Listesi (Gerçek DB verisi varsa eşle, yoksa zengin mock listesini kullan)
  const allImprovements = useMemo<ImprovementCardData[]>(() => {
    if (topProgress && topProgress.length > 0) {
      return topProgress.map((item) => ({
        name: item.exercise,
        muscle: item.muscle,
        from: `${item.first_value} ${item.metric_type === 'reps' ? 'tkr' : 'kg'}`,
        to: `${item.current_pr_value} ${item.metric_type === 'reps' ? 'tkr' : 'kg'}`,
        change: `+${item.percentage}%`,
        startDate: item.first_date ? item.first_date.slice(5).replace('-', '.') : '01.07',
        endDate: item.current_pr_date ? item.current_pr_date.slice(5).replace('-', '.') : '20.10',
      }));
    }
    return DEFAULT_IMPROVEMENTS;
  }, [topProgress]);

  // Modal İçi İkili Gruplanmış İlerlemeler (Kesinlikle 2'li Gruplar)
  const pairedImprovements = useMemo(() => {
    const pairs: ImprovementCardData[][] = [];
    for (let i = 0; i < allImprovements.length; i += 2) {
      pairs.push(allImprovements.slice(i, i + 2));
    }
    return pairs;
  }, [allImprovements]);

  // Kişisel Rekorlar Grupları (Gerçek DB'deki 43 rekoru kategoriye böl)
  const prGroups = useMemo<PrGroupData[]>(() => {
    if (personalRecords && personalRecords.length > 0) {
      return groupPersonalRecords(personalRecords);
    }
    return DEFAULT_PR_GROUPS;
  }, [personalRecords]);

  // Dinamik Egzersiz Seçici Listesi (DB'de kaydı olan tüm hareketler + varsayılanlar)
  const exerciseOptions = useMemo(() => {
    const set = new Set<string>();
    if (personalRecords && personalRecords.length > 0) {
      personalRecords.forEach((pr) => {
        if (pr.exercise) set.add(pr.exercise);
      });
    }
    if (topProgress && topProgress.length > 0) {
      topProgress.forEach((tp) => {
        if (tp.exercise) set.add(tp.exercise);
      });
    }
    DEFAULT_EXERCISES_LIST.forEach((ex) => set.add(ex));
    return Array.from(set);
  }, [personalRecords, topProgress]);

  // Egzersiz Arama Filtresi
  const filteredExercises = useMemo(() => {
    if (!exerciseSearchQuery.trim()) return exerciseOptions;
    return exerciseOptions.filter((ex) =>
      ex.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
    );
  }, [exerciseSearchQuery, exerciseOptions]);

  // ─── Backend'den Gelen Gerçek Çubuk Grafik Verilerini Grupla ve Ayrıştır ───
  const parsedChartSummaries = useMemo<DayChartSummary[]>(() => {
    if (rawChartData && rawChartData.labels && rawChartData.labels.length > 0) {
      const groups = new Map<string, { dateStr: string; sets: SetDetailItem[] }>();

      rawChartData.labels.forEach((dateLabel, idx) => {
        const detail = rawChartData.details && rawChartData.details[idx];
        const weightVal = detail
          ? Number(detail.weight_kg ?? detail.value ?? 0)
          : Number(rawChartData.values[idx] || 0);
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
        const maxW = Math.max(...group.sets.map((s) => s.weight), 0);
        const maxR = Math.max(
          ...group.sets.filter((s) => s.weight === maxW).map((s) => s.reps),
          0
        );
        list.push({
          dateStr: dateLabel,
          label: dateLabel.slice(0, 5),
          maxWeight: maxW,
          repsAtMaxWeight: maxR > 0 ? maxR : 8,
          sets: group.sets.sort((a, b) => a.set - b.set),
        });
      });

      if (list.length > 0) return list;
    }

    // Gerçek veri henüz yoksa zengin simülasyon listesini üret
    const sampleWeights = [40, 38, 36, 35, 35, 37, 38, 39, 40, 40, 39, 40, 41, 40, 42, 42, 43, 42, 44, 43, 45, 44, 45, 46, 45, 47, 46, 48, 49, 50];
    const sampleReps = [8, 8, 9, 8, 10, 9, 10, 8, 10, 9, 10, 10, 8, 9, 10, 9, 10, 11, 10, 10, 11, 10, 12, 11, 12, 11, 12, 12, 10, 12];
    return sampleWeights.map((w, i) => ({
      dateStr: `${i + 1} Ekim 2026`,
      label: `${i + 1} Eki`,
      maxWeight: w,
      repsAtMaxWeight: sampleReps[i],
      sets: [
        { set: 1, weight: w, reps: sampleReps[i] },
        { set: 2, weight: w, reps: Math.max(5, sampleReps[i] - (i % 2 === 0 ? 0 : 1)) },
        { set: 3, weight: Math.max(20, w - 2.5), reps: Math.max(5, sampleReps[i] - 1) },
      ],
    }));
  }, [rawChartData]);

  // Döneme Göre Filtrelenmiş Çubuklar (Aylık: son 22-30 seans, Yıllık: seçili ay, Genel: tüm seanslar)
  const displayChartSummaries = useMemo<DayChartSummary[]>(() => {
    if (period === 'monthly') {
      return parsedChartSummaries.slice(-22);
    }
    if (period === 'yearly') {
      return parsedChartSummaries.slice(0, 30);
    }
    return parsedChartSummaries;
  }, [period, parsedChartSummaries]);

  // Yumuşak Geçişli Dönem Değiştirici
  const handlePeriodChange = (p: ProgressPeriod) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPeriod(p);
    setSelectedBarDetails(null);
  };

  // Yumuşak Geçişli Metrik Değiştirici
  const handleMetricChange = (m: ProgressMetric) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMetric(m);
    setSelectedBarDetails(null);
  };

  // Bara Dokunulduğunda Gerçekçi / Web Tarzı Set Detaylarını Göster
  const handleBarPress = (summary: DayChartSummary, idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedBarDetails({
      index: idx,
      weight: summary.maxWeight,
      reps: summary.repsAtMaxWeight,
      dayLabel: summary.dateStr,
      sets: summary.sets,
    });
  };

  const handleSelectExerciseFromModal = (ex: string) => {
    setSelectedExercise(ex);
    setShowExerciseModal(false);
    setSelectedBarDetails(null);
  };

  const handleGraphLinkClick = (exerciseName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedExercise(exerciseName);
    setShowAllModal(false);
    setActiveTab('progress');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. Üst Başlık (Header - Ayarlar İkonu Olmadan) ─── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.overline}>Hypertrophy-X</Text>
            <Text style={styles.title}>İlerleme</Text>
          </View>
        </View>

        {/* ─── 2. Ana Sekmeler (Grafik & İlerleme / Kişisel Rekorlar) ─── */}
        <View style={styles.mainTabs}>
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('progress');
            }}
            style={[styles.mainTab, activeTab === 'progress' && styles.activeMainTab]}
          >
            <Text
              style={[
                styles.mainTabText,
                activeTab === 'progress' && styles.activeMainTabText,
              ]}
            >
              Grafik & İlerleme
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setActiveTab('records');
            }}
            style={[styles.mainTab, activeTab === 'records' && styles.activeMainTab]}
          >
            <Text
              style={[
                styles.mainTabText,
                activeTab === 'records' && styles.activeMainTabText,
              ]}
            >
              Kişisel Rekorlar
            </Text>
          </Pressable>
        </View>

        {activeTab === 'progress' ? (
          <>
            {/* ─── 3. En İyi İlerlemeler Bölümü (Ekranda 2 Kart, Sağa Kaydırılabilir 3 Sayfa) ─── */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>En iyi ilerlemeler</Text>
                <Text style={styles.sectionSubtitle}>
                  {"Son 6 güç artışın · 2'li gruplar halinde kaydır"}
                </Text>
              </View>
              <View style={styles.badgeSuccess}>
                <Text style={styles.badgeSuccessText}>
                  ● {allImprovements.length} güç artışı
                </Text>
              </View>
            </View>

            {/* 2'li Grup Carousel */}
            <ImprovementCarousel
              items={allImprovements}
              pageWidth={contentWidth}
              onPressGraph={handleGraphLinkClick}
            />

            {/* Tüm Kartları Açan Buton */}
            <Pressable
              style={styles.viewAllButton}
              onPress={() => setShowAllModal(true)}
              hitSlop={8}
            >
              <Text style={styles.viewAllButtonText}>
                Tüm Güç Artışlarını Gör ({allImprovements.length} Egzersiz) ↗
              </Text>
            </Pressable>

            {/* ─── 4. Egzersiz İlerleme Analizi Paneli ─── */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <View>
                <Text style={styles.sectionTitle}>Egzersiz ilerleme analizi</Text>
                <Text style={styles.sectionSubtitle}>Günlük verilerin ince çubuklarla gösterimi</Text>
              </View>
            </View>

            <View style={styles.panelCard}>
              {/* Metrik Seçici: [ Ağırlık ] / [ Ağırlık + Tekrar ] */}
              <View style={styles.metricSelector}>
                <Pressable
                  onPress={() => handleMetricChange('weight')}
                  style={[
                    styles.metricButton,
                    metric === 'weight' && styles.metricButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.metricButtonText,
                      metric === 'weight' && styles.metricButtonTextActive,
                    ]}
                  >
                    Ağırlık
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleMetricChange('weight-reps')}
                  style={[
                    styles.metricButton,
                    metric === 'weight-reps' && styles.metricButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.metricButtonText,
                      metric === 'weight-reps' && styles.metricButtonTextActive,
                    ]}
                  >
                    Ağırlık + Tekrar
                  </Text>
                </Pressable>
              </View>

              {/* Egzersiz Seçici */}
              <Pressable
                style={styles.exercisePicker}
                onPress={() => setShowExerciseModal(true)}
              >
                <SearchIcon size={16} color={C.violet} />
                <Text numberOfLines={1} style={styles.selectedExerciseText}>
                  {selectedExercise}
                </Text>
                <ChevronDownIcon size={14} color={C.muted} />
              </Pressable>

              {/* Yıllık Görünümde Ay Seçici */}
              {period === 'yearly' && (
                <View style={styles.yearlyMonthContainer}>
                  <Text style={styles.yearlyMonthLabel}>{MONTHS_LIST[monthIndex]}</Text>
                  <View style={styles.monthDotsRow}>
                    {MONTHS_LIST.map((m, idx) => (
                      <Pressable
                        key={m}
                        onPress={() => {
                          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                          setMonthIndex(idx);
                          setSelectedBarDetails(null);
                        }}
                        style={[
                          styles.monthDot,
                          idx === monthIndex && styles.monthDotActive,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Çubuk Grafik Alanı */}
              <View style={styles.chartWrapper}>
                {/* Sol Y Ekseni */}
                <View style={styles.yAxis}>
                  <Text style={styles.yAxisText}>50</Text>
                  <Text style={styles.yAxisText}>40</Text>
                  <Text style={styles.yAxisText}>30</Text>
                </View>

                {/* Barlar */}
                <View style={styles.barsContainer}>
                  {displayChartSummaries.map((summary, idx) => {
                    const weightPct = Math.max(8, ((summary.maxWeight - 25) / 25) * 100);
                    const repsPct = (summary.repsAtMaxWeight / 14) * 82;
                    const isSelected = selectedBarDetails?.index === idx;

                    return (
                      <Pressable
                        key={idx}
                        style={styles.dayBarCol}
                        onPress={() => handleBarPress(summary, idx)}
                      >
                        <View
                          style={[
                            styles.barWeight,
                            { height: `${weightPct}%` },
                            isSelected && styles.barSelected,
                          ]}
                        />
                        {metric === 'weight-reps' && (
                          <View
                            style={[
                              styles.barReps,
                              { height: `${repsPct}%` },
                              isSelected && styles.barSelected,
                            ]}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* ─── DÖNEM SEÇİCİ BUTONLARI (Grafiğin Hemen Altında: Aylık / Yıllık / Genel) ─── */}
              <View style={styles.periodSelectorUnderChart}>
                {(['monthly', 'yearly', 'all'] as ProgressPeriod[]).map((p) => {
                  const label = p === 'monthly' ? 'Aylık' : p === 'yearly' ? 'Yıllık' : 'Genel';
                  const isActive = period === p;
                  return (
                    <Pressable
                      key={p}
                      onPress={() => handlePeriodChange(p)}
                      style={[styles.periodButton, isActive && styles.periodButtonActive]}
                    >
                      <Text
                        style={[
                          styles.periodButtonText,
                          isActive && styles.periodButtonTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* ─── Bara Dokunulduğunda Gösterilen Detay Kartı (Set Sayısı, Her Setin Tekrarı & Kilosu) ─── */}
              {selectedBarDetails && (
                <View style={styles.barDetailCard}>
                  <View style={styles.barDetailHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.barDetailTitle}>{selectedExercise}</Text>
                      <Text style={styles.barDetailDate}>{selectedBarDetails.dayLabel}</Text>
                    </View>
                    <View style={styles.barDetailPrBadge}>
                      <Text style={styles.barDetailPrText}>
                        {selectedBarDetails.sets.length} Set · En İyi: {selectedBarDetails.weight} kg
                      </Text>
                    </View>
                  </View>

                  {/* Setler Dökümü Çipleri */}
                  <View style={styles.setsChipsRow}>
                    {selectedBarDetails.sets.map((s) => (
                      <View key={s.set} style={styles.setChip}>
                        <Text style={styles.setChipLabel}>Set {s.set}</Text>
                        <Text style={styles.setChipValues}>
                          {s.weight} kg × {s.reps} tkr
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Gösterge (Legend) */}
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: C.violet }]} />
                <Text style={styles.legendText}>Ağırlık (kg)</Text>
                {metric === 'weight-reps' && (
                  <>
                    <View
                      style={[
                        styles.legendDot,
                        { backgroundColor: C.cyan, marginLeft: 12 },
                      ]}
                    />
                    <Text style={styles.legendText}>Tekrar</Text>
                  </>
                )}
              </View>

              {/* Açıklama İpucu */}
              <Text style={styles.chartHint}>
                {period === 'monthly'
                  ? `${displayChartSummaries.length} bar: mevcut kayıt sayısı (maks 30)`
                  : period === 'yearly'
                  ? '30 bar: 1 ayın tam günlük blokları'
                  : 'Genel ilerleme: tüm zamanların seans serisi'}
              </Text>
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
              <View style={styles.badgeSuccess}>
                <Text style={styles.badgeSuccessText}>
                  ● {personalRecords.length || 43} rekor
                </Text>
              </View>
            </View>

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
          </View>
        )}
      </ScrollView>

      {/* ─── 6. TÜM İLERLEMELER MODAL PANELİ (Hafif Bulanık Arka Plan, Alt Tabaka Görünür, 2'li Gruplar) ─── */}
      <Modal
        visible={showAllModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllModal(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Üst boşluğa dokunulduğunda paneli kapat */}
          <Pressable
            style={styles.modalBackdropTap}
            onPress={() => setShowAllModal(false)}
          />

          {/* Sayfanın %74'ünü kaplayan yüzen alt panel */}
          <View style={styles.modalSheet}>
            {/* Küçük çekme / tutamaç çizgisi */}
            <View style={styles.modalDragHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalOverline}>Hypertrophy-X</Text>
                <Text style={styles.modalTitle}>Tüm Güç Artışları</Text>
                <Text style={styles.modalSubtitle}>
                  {"Tüm egzersizlerdeki ilerlemeler (2'li gruplar)"}
                </Text>
              </View>
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowAllModal(false)}
                hitSlop={10}
              >
                <CloseIcon size={18} color={C.text} />
              </Pressable>
            </View>

            {/* 2'li Gruplar Halinde Alt Alta Sıralanmış Liste */}
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={true}
            >
              {pairedImprovements.map((pair, rowIndex) => (
                <View key={rowIndex} style={styles.modalCardRow}>
                  <View style={styles.modalCardCol}>
                    <ImprovementCard
                      item={pair[0]}
                      onPressGraph={() => handleGraphLinkClick(pair[0].name)}
                    />
                  </View>
                  <View style={styles.modalCardCol}>
                    {pair[1] ? (
                      <ImprovementCard
                        item={pair[1]}
                        onPressGraph={() => handleGraphLinkClick(pair[1].name)}
                      />
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
              <Pressable
                style={styles.modalCloseButton}
                onPress={() => setShowExerciseModal(false)}
                hitSlop={10}
              >
                <CloseIcon size={18} color={C.text} />
              </Pressable>
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
              {filteredExercises.map((ex) => {
                const isCurrent = ex === selectedExercise;
                return (
                  <Pressable
                    key={ex}
                    onPress={() => handleSelectExerciseFromModal(ex)}
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
                      {ex}
                    </Text>
                    {isCurrent && <Text style={{ color: C.violet, fontSize: 13 }}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
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
    paddingBottom: 40,
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

  /* ─── Ana Sekmeler ─── */
  mainTabs: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginBottom: 18,
  },
  mainTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 9,
  },
  activeMainTab: {
    backgroundColor: C.violet,
  },
  mainTabText: {
    color: C.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  activeMainTabText: {
    color: C.text,
    fontWeight: '700',
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
    backgroundColor: '#3B4866',
  },
  carouselDotActive: {
    width: 18,
    backgroundColor: C.violet,
  },

  /* ─── İlerleme Kartı (Flex 1 Desteği İle Tam Oturur) ─── */
  improvement: {
    flex: 1,
    minHeight: 116,
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

  /* ─── Tümünü Gör Butonu ─── */
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

  /* ─── Analiz Paneli ─── */
  panelCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 14,
    backgroundColor: C.surface,
  },
  metricSelector: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.input,
    marginBottom: 10,
  },
  metricButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 7,
  },
  metricButtonActive: {
    backgroundColor: C.violet,
  },
  metricButtonText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  metricButtonTextActive: {
    color: C.text,
    fontWeight: '700',
  },
  exercisePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.input,
    marginBottom: 12,
  },
  selectedExerciseText: {
    color: C.text,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  /* ─── Yıllık Ay Seçici ─── */
  yearlyMonthContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  yearlyMonthLabel: {
    color: C.text,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  monthDotsRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  monthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3B4866',
  },
  monthDotActive: {
    width: 18,
    backgroundColor: C.violet,
  },

  /* ─── Çubuk Grafik Alanı ─── */
  chartWrapper: {
    height: 180,
    borderRadius: 12,
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    position: 'relative',
    marginTop: 4,
  },
  yAxis: {
    position: 'absolute',
    left: 6,
    top: 12,
    bottom: 20,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  yAxisText: {
    color: C.muted,
    fontSize: 9,
    fontWeight: '600',
  },
  barsContainer: {
    position: 'absolute',
    left: 32,
    right: 8,
    top: 12,
    bottom: 16,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
  },
  dayBarCol: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 1,
  },
  barWeight: {
    width: '46%',
    maxWidth: 5,
    borderRadius: 3,
    backgroundColor: C.violet,
  },
  barReps: {
    width: '46%',
    maxWidth: 5,
    borderRadius: 3,
    backgroundColor: C.cyan,
  },
  barSelected: {
    opacity: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },

  /* ─── Dönem Seçici Butonları (Grafiğin Altında) ─── */
  periodSelectorUnderChart: {
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.input,
    marginTop: 12,
    marginBottom: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 7,
  },
  periodButtonActive: {
    backgroundColor: C.violet,
  },
  periodButtonText: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: C.text,
    fontWeight: '700',
  },

  /* ─── Bara Dokunulduğunda Gösterilen Detay Kartı (Set Sayısı & Tekrarları) ─── */
  barDetailCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    marginBottom: 8,
    marginTop: 4,
  },
  barDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  barDetailTitle: {
    color: C.text,
    fontSize: 12,
    fontWeight: '700',
  },
  barDetailDate: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  barDetailPrBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.4)',
  },
  barDetailPrText: {
    color: C.violet,
    fontSize: 10,
    fontWeight: '700',
  },
  setsChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  setChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  setChipLabel: {
    color: C.muted,
    fontSize: 9.5,
    fontWeight: '700',
  },
  setChipValues: {
    color: C.mint,
    fontSize: 10,
    fontWeight: '700',
  },

  /* ─── Legend & İpuçları ─── */
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: C.muted,
    fontSize: 10,
    fontWeight: '600',
  },
  chartHint: {
    color: C.muted,
    fontSize: 9.5,
    marginTop: 6,
    lineHeight: 14,
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
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: '74%',
    paddingTop: 10,
  },
  modalDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
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
    marginTop: 2,
  },
  modalSubtitle: {
    color: C.muted,
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.border,
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
});
