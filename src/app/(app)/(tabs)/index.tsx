import React, { useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
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
// Bugün aktif olan kasları (Bacak & Kalça) neon mavi ve nane yeşili olarak vurgular.
function AnatomyMiniSilhouette({ target = 'legs' }: { target?: 'legs' | 'push' | 'pull' }) {
  const isLegs = target === 'legs';
  const isPush = target === 'push';

  return (
    <View style={styles.anatomyBox}>
      <Svg width={58} height={80} viewBox="0 0 100 140" fill="none">
        <Defs>
          <LinearGradient id="glowLegs" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#55D6FF" stopOpacity="1" />
            <Stop offset="100%" stopColor="#35D69F" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Baş & Boyun (Pasif Koyu Gri) */}
        <Circle cx="50" cy="13" r="8" stroke="#334155" strokeWidth="1.5" fill="#141c2e" />
        <Path d="M46 21 L46 25 L54 25 L54 21" stroke="#334155" strokeWidth="1.2" fill="#141c2e" />

        {/* Omuzlar (Push ise aktif, değilse pasif) */}
        <Path
          d="M33 26 C26 30 24 38 25 45 C28 42 32 40 35 36 Z"
          fill={isPush ? '#55D6FF' : '#141c2e'}
          stroke={isPush ? '#A98BFF' : '#334155'}
          strokeWidth={1.2}
        />
        <Path
          d="M67 26 C74 30 76 38 75 45 C72 42 68 40 65 36 Z"
          fill={isPush ? '#55D6FF' : '#141c2e'}
          stroke={isPush ? '#A98BFF' : '#334155'}
          strokeWidth={1.2}
        />

        {/* Göğüs (Push ise aktif) */}
        <Path
          d="M36 29 C42 28 48 30 49 40 C42 41 36 41 34 38 Z"
          fill={isPush ? '#55D6FF' : '#141c2e'}
          stroke={isPush ? '#55D6FF' : '#334155'}
          strokeWidth={1.2}
        />
        <Path
          d="M64 29 C58 28 52 30 51 40 C58 41 64 41 66 38 Z"
          fill={isPush ? '#55D6FF' : '#141c2e'}
          stroke={isPush ? '#55D6FF' : '#334155'}
          strokeWidth={1.2}
        />

        {/* Karın Bölgesi (Pasif) */}
        <Rect x="42" y="42" width="16" height="23" rx="3" fill="#141c2e" stroke="#334155" strokeWidth="1.2" />

        {/* Kollar (Pasif) */}
        <Path d="M24 47 L20 72 L26 72 L29 47 Z" fill="#141c2e" stroke="#334155" strokeWidth="1.2" />
        <Path d="M76 47 L80 72 L74 72 L71 47 Z" fill="#141c2e" stroke="#334155" strokeWidth="1.2" />

        {/* BACAKLAR & KALÇA (BUGÜN AKTİF - NEON PARLAMA) */}
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
      <Text style={styles.anatomyLabel}>BACAK</Text>
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

const DEFAULT_EXERCISES_BY_KIND: Record<
  string,
  { index: number; name: string; target: string; sets: string; reps: string }[]
> = {
  legs: [
    { index: 1, name: 'Squat', target: 'Ön Bacak & Kalça Çömelmesi', sets: '4 set', reps: '6–8 tekrar' },
    { index: 2, name: 'Romanian Deadlift', target: 'Arka Bacak & Bel Çekişi', sets: '3 set', reps: '8–10 tekrar' },
    { index: 3, name: 'Bulgarian Split Squat', target: 'Tek Bacak Çömelme (Kalça & Denge)', sets: '3 set', reps: '10–12 tekrar' },
    { index: 4, name: 'Standing Calf Raise', target: 'Baldır Yükselişi (Alt Bacak)', sets: '4 set', reps: '12–15 tekrar' },
  ],
  push: [
    { index: 1, name: 'Incline Dumbbell Press', target: 'Üst Göğüs İtişi', sets: '4 set', reps: '6–8 tekrar' },
    { index: 2, name: 'Overhead Press', target: 'Omuz & Üst İtiş', sets: '3 set', reps: '6–10 tekrar' },
    { index: 3, name: 'Lateral Raises', target: 'Yan Omuz Yana Açış', sets: '4 set', reps: '12–15 tekrar' },
    { index: 4, name: 'Dips / Skull Crushers', target: 'Arka Kol / Triceps', sets: '3 set', reps: '8–12 tekrar' },
  ],
  pull: [
    { index: 1, name: 'Lat Pulldown / Chin Ups', target: 'Geniş Sırt & Kanat', sets: '4 set', reps: '6–10 tekrar' },
    { index: 2, name: 'Dumbbell Row', target: 'Orta Sırt Çekişi', sets: '3 set', reps: '8–12 tekrar' },
    { index: 3, name: 'Face Pull', target: 'Arka Omuz & Postür', sets: '3 set', reps: '12–15 tekrar' },
    { index: 4, name: 'Incline Biceps Curl', target: 'Pazu & Kol Büküşü', sets: '3 set', reps: '10–12 tekrar' },
  ],
  rest: [
    { index: 1, name: 'Hafif Yürüyüş', target: 'Aktif Toparlanma', sets: '1 set', reps: '20–30 dk' },
    { index: 2, name: 'Mobilite & Esneme', target: 'Kas Gevşetme', sets: '1 set', reps: '10–15 dk' },
  ],
};

// Android için LayoutAnimation etkinleştirme
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DashboardScreen() {
  const router = useRouter();
  const { state } = useAuth();
  const { user } = useUser();
  const { workouts } = useWorkouts();

  // Durum Yönetimi: Sekmeler & Hero Akordiyon (Kullanıcı isteği: default kapalı)
  const [viewTab, setViewTab] = useState<'weekly' | 'monthly'>('weekly');
  const [isHeroOpen, setIsHeroOpen] = useState<boolean>(false);

  // Sekmeler arası yumuşak akıcı geçiş animasyonu
  const [tabFadeAnim] = useState(() => new Animated.Value(1));
  const [tabSlideAnim] = useState(() => new Animated.Value(0));

  const handleTabChange = (newTab: 'weekly' | 'monthly') => {
    if (newTab === viewTab) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    tabFadeAnim.setValue(0);
    tabSlideAnim.setValue(newTab === 'weekly' ? -20 : 20);
    setViewTab(newTab);
    Animated.parallel([
      Animated.timing(tabFadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(tabSlideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  };

  // Bugünün planı detaylarını açıp kapatırken aşağı akıcı kayan animasyon
  const [heroSlideAnim] = useState(() => new Animated.Value(0));

  const toggleHeroDetail = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (isHeroOpen) {
      Animated.timing(heroSlideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: false,
      }).start(() => setIsHeroOpen(false));
    } else {
      setIsHeroOpen(true);
      Animated.timing(heroSlideAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: false,
      }).start();
    }
  };

  const detailHeight = heroSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 320],
  });
  const detailOpacity = heroSlideAnim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.4, 1],
  });
  const detailTranslateY = heroSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-24, 0],
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

  // ─── AYLIK TAKVİM KAYDIRMA & GEÇMİŞ AYLAR YÖNETİMİ ───
  const [viewMonth, setViewMonth] = useState<string>(() => todayIso.slice(0, 7));
  const [selectedMonthIso, setSelectedMonthIso] = useState<string>(() => todayIso);

  // Ay geçişinde yumuşak kayma (slide) ve opasite animasyonları
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(1));

  const changeMonth = React.useCallback(
    (direction: 1 | -1) => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: direction === 1 ? -65 : 65,
          duration: 120,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.15,
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
        ]).start();
      });
    },
    [slideAnim, opacityAnim]
  );

  const handlePrevMonth = React.useCallback(() => changeMonth(-1), [changeMonth]);
  const handleNextMonth = React.useCallback(() => changeMonth(1), [changeMonth]);

  // Sağa - Sola Kaydırma (Swipe PanResponder)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return (
            Math.abs(gestureState.dx) > 15 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5
          );
        },
        onPanResponderMove: (_, gestureState) => {
          slideAnim.setValue(gestureState.dx * 0.35);
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -45) {
            changeMonth(1);
          } else if (gestureState.dx > 45) {
            changeMonth(-1);
          } else {
            Animated.spring(slideAnim, {
              toValue: 0,
              useNativeDriver: Platform.OS !== 'web',
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: Platform.OS !== 'web',
          }).start();
        },
      }),
    [slideAnim, changeMonth]
  );

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

  const reconciledWeek = useMemo(() => {
    // 2. Bu haftanın (Pazartesi - Pazar) gün tarihlerini hesapla
    const dayOfWeek = today.getDay(); // 0: Pazar, 1: Pazartesi, ..., 5: Cuma
    const distToMon = (dayOfWeek + 6) % 7; // Pazartesi = 0
    const monday = new Date(today);
    monday.setDate(today.getDate() - distToMon);

    const dayLabelsTR = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
    const fullDayLabelsTR = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
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

    // 3. Başlangıç haftalık kartlarını oluştur
    const result = weekDates.map((wDate, idx) => {
      const base = baseProgram[idx] || DEFAULT_WEEKLY_SCHEDULE[idx];
      return {
        dayNum: wDate.dayNum,
        dayName: wDate.dayName,
        fullDayName: wDate.fullDayName,
        dateIso: wDate.dateIso,
        title: base.type || (base.isRest ? 'Dinlenme Günü' : 'Antrenman'),
        subtitle: base.focus || (base.isRest ? 'Toparlanma ve dinlenme' : 'Genel antrenman'),
        isRest: !!base.isRest,
        exercises: base.exercises || [],
        status: 'planned' as 'done' | 'today' | 'missed' | 'rest' | 'planned',
        badgeText: 'Planlandı',
        actualWorkout: undefined as (typeof workouts)[0] | undefined,
      };
    });

    // 4. Bu hafta yapılmış gerçek antrenmanları eşle
    const actualSlots = new Map<number, (typeof workouts)[0]>();
    for (let i = 0; i < 7; i++) {
      const w = workoutDatesMap.get(weekDates[i].dateIso);
      if (w) {
        actualSlots.set(i, w);
      }
    }

    // 5. Adaptif Seans Yer Değiştirme (Dinamik Reconcile & Swap Logic)
    // "Ben leg day için push seansı girersem eğer leg day ile push day kartlarda yer değiştirmeli otomatik"
    for (const [sourceIndex, actual] of actualSlots.entries()) {
      const actualKind = getSessionKind(actual.session_type);
      if (!actualKind || actualKind === 'rest') continue;

      const plannedKind = getSessionKind(result[sourceIndex].title);

      if (plannedKind === actualKind && !result[sourceIndex].isRest) {
        // Planlanan seans ile girilen seans aynı: doğrudan tamamlandı
        result[sourceIndex].title = formatSessionTitle(actual.session_type || result[sourceIndex].title);
        result[sourceIndex].status = 'done';
        result[sourceIndex].badgeText = 'Yapıldı ✓';
        result[sourceIndex].actualWorkout = actual;
        if (actual.exercises && actual.exercises.length > 0) {
          result[sourceIndex].exercises = actual.exercises;
        }
        continue;
      }

      // PLANLANANDAN FARKLI BİR SEANS GİRİLMİŞ (Örn: Legs Day yerine Push girilmiş)
      // Bu durumda girilen seans ile planlanan seans yer değiştirir:
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

      // Eğer aynı türde boş bir kart yoksa, gelecekteki ilk boş antrenman veya dinlenme gününü bul
      if (targetIndex === undefined) {
        targetIndex = candidates.find((idx) => !actualSlots.has(idx));
      }

      if (targetIndex !== undefined) {
        // Kartların içeriklerini (title, subtitle, isRest, exercises) takas et
        const displacedContent = {
          title: result[sourceIndex].title,
          subtitle: result[sourceIndex].subtitle,
          isRest: result[sourceIndex].isRest,
          exercises: result[sourceIndex].exercises,
        };

        // Girilen gün yapılan seans olur (Örn: Push Day)
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

        // Takas edilen hedef gün, yerinden olan planı devralır (Örn: Legs Day)
        result[targetIndex].title = displacedContent.title;
        result[targetIndex].subtitle = displacedContent.subtitle;
        result[targetIndex].isRest = displacedContent.isRest;
        result[targetIndex].exercises = displacedContent.exercises;
      } else {
        result[sourceIndex].title = formatSessionTitle(actual.session_type);
        result[sourceIndex].status = 'done';
        result[sourceIndex].badgeText = 'Yapıldı ✓';
        result[sourceIndex].actualWorkout = actual;
      }
    }

    // 6. Gerçek antrenman kaydedilmemiş günlerin durumlarını finalize et
    const todayIndex = distToMon; // Bugünün haftadaki indeksi (0-6)
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

    return result;
  }, [baseProgram, today, workoutDatesMap]);

  // Bugünün planı kartı için veriler (Haftalık uyumlaştırılmış plandan otomatik çekilir)
  const todayIndex = useMemo(() => (today.getDay() + 6) % 7, [today]);
  const todayCard = useMemo(
    () => reconciledWeek[todayIndex] || reconciledWeek[0],
    [reconciledWeek, todayIndex]
  );

  const todaySilhouetteTarget = useMemo((): 'legs' | 'push' | 'pull' => {
    const kind = getSessionKind(todayCard.title);
    if (kind === 'push') return 'push';
    if (kind === 'pull') return 'pull';
    return 'legs';
  }, [todayCard.title]);

  const todayExercisesList = useMemo<
    { index: number; name: string; target: string; sets: string; reps: string }[]
  >(() => {
    if (todayCard.exercises && todayCard.exercises.length > 0) {
      return todayCard.exercises.map((ex: any, idx: number) => ({
        index: idx + 1,
        name: String(ex.exercise_name || ex.name || 'Egzersiz'),
        target: String(ex.muscle_group || ex.target || todayCard.subtitle),
        sets: `${ex.sets_data?.length || ex.sets || 3} set`,
        reps: ex.sets_data?.[0]?.reps ? `${ex.sets_data[0].reps} tekrar` : '8–12 tekrar',
      }));
    }
    const kind = getSessionKind(todayCard.title);
    return DEFAULT_EXERCISES_BY_KIND[kind || 'legs'] || DEFAULT_EXERCISES_BY_KIND.legs;
  }, [todayCard]);

  const weeklyCompletedCount = useMemo(() => {
    return reconciledWeek.filter((d) => d.status === 'done').length;
  }, [reconciledWeek]);

  const weeklyPlannedCount = useMemo(() => {
    return reconciledWeek.filter((d) => !d.isRest).length;
  }, [reconciledWeek]);

  // Görüntülenen ayın takvim hücreleri (Pzt-Paz 7 sütun, her zaman 42 hücreye sabitlenir)
  const calendarCells = useMemo(() => {
    const [y, m] = viewMonth.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0);

    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; // Pazar -> 6

    const totalDays = lastDay.getDate();
    const cells: (number | null)[] = [];

    for (let i = 0; i < startDayIdx; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      cells.push(d);
    }
    // Her ay için tam 6 satır (42 hücre) sabit tutulur, pano boyutu asla oynamaz
    while (cells.length < 42) {
      cells.push(null);
    }
    return cells;
  }, [viewMonth]);

  // Görüntülenen ayın gerçek istatistikleri (YAPILDI, KAÇIRILDI, DİNLENME)
  const monthStats = useMemo(() => {
    let completed = 0;
    let missed = 0;
    let rest = 0;

    const [y, m] = viewMonth.split('-').map(Number);
    const totalDays = new Date(y, m, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const dayStr = String(d).padStart(2, '0');
      const iso = `${viewMonth}-${dayStr}`;

      // Gelecek günlerin istatistiği henüz oluşmamıştır (gelecek günün verisi olmasın)
      if (iso > todayIso) {
        continue;
      }

      if (workoutDatesMap.has(iso)) {
        completed++;
      } else {
        const cellDate = new Date(y, m - 1, d);
        const dayIdx = (cellDate.getDay() + 6) % 7;
        const plannedDay = baseProgram[dayIdx] || DEFAULT_WEEKLY_SCHEDULE[dayIdx];

        if (iso < todayIso) {
          if (plannedDay.isRest) {
            rest++;
          } else {
            missed++;
          }
        } else if (iso === todayIso) {
          if (plannedDay.isRest) {
            rest++;
          }
          // Bugün antrenman günüyse henüz gün bitmediği için 'kaçırıldı' sayılmaz
        }
      }
    }

    return { completed, missed, rest };
  }, [viewMonth, workoutDatesMap, todayIso, baseProgram]);

  // Seçili günün seans detay bilgileri (Tarih yok; Oturum Tipi, Toplam Set ve Hedef Kaslar)
  const selectedDayInfo = useMemo(() => {
    const realW = workoutDatesMap.get(selectedMonthIso);
    const isToday = selectedMonthIso === todayIso;
    const isFuture = selectedMonthIso > todayIso;

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

      return {
        sessionType: formatSessionTitle(realW.session_type),
        totalSets: setDisplay,
        targetMuscles: muscles,
        statusBadge: isToday ? 'Bugün Tamamlandı ✓' : 'Tamamlandı ✓',
        statusType: 'done' as const,
      };
    }

    // Seçilen günün haftalık plandaki karşılığını bul
    const [y, m, d] = selectedMonthIso.split('-').map(Number);
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
          targetMuscles: 'Toparlanma ve Dinlenme',
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
        targetMuscles: todayCard.subtitle || focusMuscles,
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
          targetMuscles: 'Toparlanma ve Dinlenme',
          statusBadge: 'Dinlenme ☾',
          statusType: 'rest' as const,
        };
      }
      return {
        sessionType: formatSessionTitle(planned.type),
        totalSets: '0 Set (Yapılmadı)',
        targetMuscles: focusMuscles,
        statusBadge: 'Kaçırıldı !',
        statusType: 'missed' as const,
      };
    }

    // 4. Gelecek Gün (Planlanan)
    if (planned.isRest) {
      return {
        sessionType: 'Dinlenme Günü',
        totalSets: '0 Set',
        targetMuscles: 'Toparlanma ve Dinlenme',
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
      targetMuscles: focusMuscles,
      statusBadge: 'Planlandı',
      statusType: 'planned' as const,
    };
  }, [
    selectedMonthIso,
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
              <Text style={styles.heroDesc}>
                Hedef:{' '}
                <Text style={styles.heroDescBold}>{todayCard.subtitle}</Text> odaklı güç ve hipertrofi seansı.
              </Text>
            </View>

            {/* MuscleWiki Görsel Silüeti (Bugünün hedefine göre dinamik parlar) */}
            <AnatomyMiniSilhouette target={todaySilhouetteTarget} />
          </View>

          {/* Mini 3 İstatistik */}
          <View style={styles.heroMetaRow}>
            <View style={styles.miniMetaBox}>
              <Text style={styles.miniMetaLabel}>HAREKET</Text>
              <Text style={styles.miniMetaVal}>{todayExercisesList.length} Egzersiz</Text>
            </View>
            <View style={styles.miniMetaBox}>
              <Text style={styles.miniMetaLabel}>TAHMİNİ</Text>
              <Text style={styles.miniMetaVal}>55 Dakika</Text>
            </View>
            <View style={styles.miniMetaBox}>
              <Text style={styles.miniMetaLabel}>ODAK BÖLGE</Text>
              <Text style={[styles.miniMetaVal, { color: '#55D6FF' }]}>
                {todayCard.subtitle.split(',')[0].split('·')[0].trim() || 'Bacak & Kalça'}
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

          {/* Genişleyen Egzersiz Listesi (Yukarıdan aşağı akıcı kayarak açılır) */}
          {isHeroOpen && (
            <Animated.View
              style={[
                styles.heroDetailContainer,
                {
                  maxHeight: detailHeight,
                  opacity: detailOpacity,
                  transform: [{ translateY: detailTranslateY }],
                  overflow: 'hidden',
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
                  💡 Kontrollü negatif tekrarlar uygulayın. Set aralarında 90–120 saniye dinlenin.
                </Text>
              </View>
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
          {viewTab === 'weekly' && (
            <Text style={styles.sectionSubtitle}>
              Bu hafta · {weeklyCompletedCount} / {weeklyPlannedCount} tamamlandı
            </Text>
          )}
        </View>

        {/* Hafta / Ay Geçiş Düğmeleri */}
        <View style={styles.segmentedTabs}>
          <TouchableOpacity
            style={[styles.segTab, viewTab === 'weekly' && styles.segTabActive]}
            activeOpacity={0.8}
            onPress={() => handleTabChange('weekly')}
          >
            <Text style={[styles.segTabText, viewTab === 'weekly' && styles.segTabTextActive]}>
              Haftalık Program
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segTab, viewTab === 'monthly' && styles.segTabActive]}
            activeOpacity={0.8}
            onPress={() => handleTabChange('monthly')}
          >
            <Text style={[styles.segTabText, viewTab === 'monthly' && styles.segTabTextActive]}>
              Aylık Takip
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sekmeler Arası Akıcı Animasyonlu Kapsayıcı */}
        <Animated.View
          style={{
            opacity: tabFadeAnim,
            transform: [{ translateX: tabSlideAnim }],
          }}
        >
          {/* ─── 4A. HAFTALIK PROGRAM KARTLARI ─── */}
          {viewTab === 'weekly' && (
            <View style={styles.weekBoard}>
              {/* Eğer özel programı yoksa Web stili yönlendirici banner */}
              {!hasCustomProgram && (
                <TouchableOpacity
                  style={styles.noProgramBanner}
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

              {reconciledWeek.map((item, idx) => {
                const isToday = item.status === 'today';
                const isDone = item.status === 'done';
                const isMissed = item.status === 'missed';
                const isRest = item.status === 'rest';

                return (
                  <View
                    key={idx}
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

            {/* Web Panelinden Gelen Güç Hedefleri (PR İlerlemesi) */}
            <View style={styles.prBox}>
              <View style={styles.prHeader}>
                <Text style={styles.prTitle}>Güç Hedeflerim (PR)</Text>
                <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/(app)/history')}>
                  <Text style={styles.prActionText}>Tümünü Gör ↗</Text>
                </TouchableOpacity>
              </View>

              {/* Bench Press */}
              <View style={styles.prItem}>
                <View style={styles.prMeta}>
                  <Text style={styles.prName}>Bench Press (Göğüs)</Text>
                  <Text style={[styles.prScore, { color: '#55D6FF' }]}>80 / 100 kg (%80)</Text>
                </View>
                <View style={styles.prBarBg}>
                  <View style={[styles.prBarFill, { width: '80%', backgroundColor: '#55D6FF' }]} />
                </View>
              </View>

              {/* Squat */}
              <View style={styles.prItem}>
                <View style={styles.prMeta}>
                  <Text style={styles.prName}>Squat (Bacak)</Text>
                  <Text style={[styles.prScore, { color: '#A98BFF' }]}>80 / 120 kg (%67)</Text>
                </View>
                <View style={styles.prBarBg}>
                  <View style={[styles.prBarFill, { width: '67%', backgroundColor: '#A98BFF' }]} />
                </View>
              </View>

              {/* Deadlift */}
              <View style={styles.prItem}>
                <View style={styles.prMeta}>
                  <Text style={styles.prName}>Deadlift (Sırt & Arka Bacak)</Text>
                  <Text style={[styles.prScore, { color: '#35D69F' }]}>75 / 100 kg (%75)</Text>
                </View>
                <View style={styles.prBarBg}>
                  <View style={[styles.prBarFill, { width: '75%', backgroundColor: '#35D69F' }]} />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ─── 4B. AYLIK TAKİP GÖRÜNÜMÜ (KAYDIRILABİLİR PANORAMA) ─── */}
        {viewTab === 'monthly' && (
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
                style={styles.monthArrowBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.monthArrowText}>‹</Text>
              </TouchableOpacity>

              <Text style={styles.monthTitleText}>{formatMonthTR(viewMonth)}</Text>

              <TouchableOpacity
                onPress={handleNextMonth}
                style={styles.monthArrowBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.monthArrowText}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Gün Kısaltmaları (Pzt Sal Çar Per Cum Cmt Paz) */}
            <View style={styles.monthDaysHeadRow}>
              {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d, i) => (
                <View key={i} style={styles.monthDayHeadCol}>
                  <Text style={styles.monthDayHeadText}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Parmakla Kaydırılabilir & Animasyonlu Takvim Matrisi */}
            <View style={styles.gridContainer} {...panResponder.panHandlers}>
              <Animated.View
                style={[
                  styles.animatedMonthGrid,
                  {
                    transform: [{ translateX: slideAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              >
                {calendarCells.map((day, idx) => {
                  if (day === null) {
                    return <View key={`empty-${idx}`} style={styles.monthCellEmpty} />;
                  }

                  const dayStr = String(day).padStart(2, '0');
                  const cellIso = `${viewMonth}-${dayStr}`;
                  const isSelected = selectedMonthIso === cellIso;
                  const isToday = cellIso === todayIso;

                  // Antrenman durumu belirleme (Tamamen Gerçek Veritabanı ve Program Mantığı)
                  const hasRealWorkout = workoutDatesMap.has(cellIso);
                  const isFuture = cellIso > todayIso;
                  let isDone = hasRealWorkout;
                  let isMissed = false;
                  let isRest = false;

                  if (!hasRealWorkout && !isFuture) {
                    const [y, m] = viewMonth.split('-').map(Number);
                    const cellDate = new Date(y, m - 1, day);
                    const dayIdx = (cellDate.getDay() + 6) % 7;
                    const plannedDay = baseProgram[dayIdx] || DEFAULT_WEEKLY_SCHEDULE[dayIdx];

                    if (cellIso < todayIso) {
                      if (plannedDay.isRest) {
                        isRest = true;
                      } else {
                        isMissed = true;
                      }
                    } else if (isToday) {
                      if (plannedDay.isRest) {
                        isRest = true;
                      }
                    }
                  }

                  const icon = isDone ? '✓' : isMissed ? '!' : isRest ? '☾' : day;

                  return (
                    <TouchableOpacity
                      key={`day-${cellIso}`}
                      style={[styles.monthCell, isSelected && styles.monthCellSelected]}
                      activeOpacity={0.7}
                      onPress={() => setSelectedMonthIso(cellIso)}
                    >
                      <Text style={styles.monthCellLabel}>{day}</Text>
                      <View
                        style={[
                          styles.monthDot,
                          isDone && styles.dotDone,
                          isMissed && styles.dotMissed,
                          isRest && styles.dotRest,
                          isToday && styles.dotToday,
                        ]}
                      >
                        <Text
                          style={[
                            styles.dotText,
                            isDone && styles.dotTextDone,
                            isMissed && styles.dotTextMissed,
                            isRest && styles.dotTextRest,
                            isToday && styles.dotTextToday,
                          ]}
                        >
                          {icon}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            </View>

            {/* Seçili Günün Seans Detayı (Tarihsiz, Net Bilgi Sunumu) */}
            <View style={styles.monthDetailCard}>
              <View style={styles.detailCardTopRow}>
                <View style={styles.detailTypeWrap}>
                  <Text style={styles.detailSessionType}>{selectedDayInfo.sessionType}</Text>
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

                <View style={styles.detailSetBox}>
                  <Text style={styles.detailSetLabel}>TOPLAM SET</Text>
                  <Text style={styles.detailSetVal}>{selectedDayInfo.totalSets}</Text>
                </View>
              </View>

              <View style={styles.detailMuscleRow}>
                <Text style={styles.detailMuscleLabel}>Hedef Kaslar:</Text>
                <Text style={styles.detailMuscleVal}>{selectedDayInfo.targetMuscles}</Text>
              </View>
            </View>
          </View>
        )}
        </Animated.View>
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
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 14,
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
  sectionSubtitle: {
    fontSize: 10,
    color: '#8E99B5',
    fontWeight: '600',
  },
  segmentedTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  segTab: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 11,
    paddingVertical: 9,
    alignItems: 'center',
  },
  segTabActive: {
    borderColor: '#A98BFF',
    backgroundColor: 'rgba(169, 139, 255, 0.14)',
  },
  segTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E99B5',
  },
  segTabTextActive: {
    color: '#FFFFFF',
  },

  // 4A. HAFTALIK PROGRAM KARTLARI
  weekBoard: {
    gap: 8,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#11192F',
    padding: 12,
  },
  cardToday: {
    borderColor: 'rgba(169, 139, 255, 0.65)',
    backgroundColor: '#161836',
  },
  cardDone: {
    borderColor: 'rgba(53, 214, 159, 0.4)',
  },
  cardMissed: {
    borderColor: 'rgba(255, 113, 136, 0.4)',
    backgroundColor: '#201522',
  },
  cardRest: {
    borderColor: 'rgba(244, 195, 92, 0.4)',
    backgroundColor: '#211D18',
  },

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateBox: {
    width: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: 'rgba(169, 139, 255, 0.1)',
    paddingVertical: 5,
    alignItems: 'center',
  },
  dateBoxDone: {
    borderColor: 'rgba(53, 214, 159, 0.4)',
    backgroundColor: 'rgba(53, 214, 159, 0.1)',
  },
  dateBoxMissed: {
    borderColor: 'rgba(255, 113, 136, 0.4)',
    backgroundColor: 'rgba(255, 113, 136, 0.1)',
  },
  dateBoxRest: {
    borderColor: 'rgba(244, 195, 92, 0.4)',
    backgroundColor: 'rgba(244, 195, 92, 0.1)',
  },
  dateBoxToday: {
    borderColor: '#A98BFF',
    backgroundColor: 'rgba(169, 139, 255, 0.2)',
  },
  dateBoxNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateBoxName: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8E99B5',
    marginTop: 1,
  },

  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardSub: {
    fontSize: 9.5,
    color: '#8E99B5',
    marginTop: 2,
  },

  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: 'rgba(169, 139, 255, 0.1)',
  },
  statusBadgeDone: {
    borderColor: 'rgba(53, 214, 159, 0.4)',
    backgroundColor: 'rgba(53, 214, 159, 0.1)',
  },
  statusBadgeMissed: {
    borderColor: 'rgba(255, 113, 136, 0.4)',
    backgroundColor: 'rgba(255, 113, 136, 0.1)',
  },
  statusBadgeRest: {
    borderColor: 'rgba(244, 195, 92, 0.4)',
    backgroundColor: 'rgba(244, 195, 92, 0.1)',
  },
  statusBadgeToday: {
    borderColor: '#A98BFF',
    backgroundColor: 'rgba(169, 139, 255, 0.2)',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A98BFF',
  },
  statusBadgeTextDone: { color: '#35D69F' },
  statusBadgeTextMissed: { color: '#FF7188' },
  statusBadgeTextRest: { color: '#F4C35C' },
  statusBadgeTextToday: { color: '#FFFFFF' },

  // PR / GÜÇ HEDEFLERİM KARTI
  prBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: '#10162A',
    padding: 14,
  },
  prHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  prTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  prActionText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#A98BFF',
  },
  prItem: {
    marginTop: 10,
  },
  prMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  prName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  prScore: {
    fontSize: 10,
    fontWeight: '700',
  },
  prBarBg: {
    height: 6,
    backgroundColor: '#1C2438',
    borderRadius: 4,
    overflow: 'hidden',
  },
  prBarFill: {
    height: '100%',
    borderRadius: 4,
  },

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
    gap: 8,
    marginBottom: 14,
  },
  neonBadge: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
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
    fontSize: 8.5,
    fontWeight: '800',
    color: '#8E99B5',
    letterSpacing: 0.4,
  },
  neonBadgeValGreen: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#35D69F',
  },
  neonBadgeLabelRed: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#8E99B5',
    letterSpacing: 0.4,
  },
  neonBadgeValRed: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FF7188',
  },
  neonBadgeLabelYellow: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#8E99B5',
    letterSpacing: 0.4,
  },
  neonBadgeValYellow: {
    fontSize: 13.5,
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
    height: 42,
    marginBottom: 3,
  },
  monthCell: {
    width: '14.2857%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 3,
  },
  monthCellSelected: {
    backgroundColor: 'rgba(169, 139, 255, 0.15)',
  },
  monthCellLabel: {
    fontSize: 7.5,
    color: '#8E99B5',
    marginBottom: 2,
    fontWeight: '600',
  },
  monthDot: {
    width: 26,
    height: 26,
    borderRadius: 7,
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
    borderColor: '#BFA7FF',
    backgroundColor: 'rgba(169, 139, 255, 0.25)',
  },
  dotText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E99B5',
  },
  dotTextDone: { color: '#35D69F' },
  dotTextMissed: { color: '#FF7188' },
  dotTextRest: { color: '#F4C35C' },
  dotTextToday: { color: '#FFFFFF' },

  monthDetailCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(169, 139, 255, 0.35)',
    backgroundColor: '#151B32',
    padding: 12,
  },
  detailCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailTypeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  detailSessionType: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  detailStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
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
  detailSetBox: {
    alignItems: 'flex-end',
  },
  detailSetLabel: {
    fontSize: 7.5,
    fontWeight: '700',
    color: '#8E99B5',
    letterSpacing: 0.5,
  },
  detailSetVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#55D6FF',
    marginTop: 1,
  },
  detailMuscleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailMuscleLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: '#8E99B5',
  },
  detailMuscleVal: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#D8CAFF',
    flex: 1,
  },
});
