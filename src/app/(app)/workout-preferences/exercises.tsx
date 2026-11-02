import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Keyboard,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

import { useExpertData } from '@/hooks/use-expert';
import type { ExercisePreferenceCatalogItem } from '@/types/expert';

// ─── Cyber Dark Renk Paleti ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Neon Violet
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleActiveBg: 'rgba(139, 92, 246, 0.28)',
  purpleBorder: 'rgba(139, 92, 246, 0.35)',
  purpleActiveBorder: 'rgba(139, 92, 246, 0.60)',

  // Emerald / Neon Yeşil
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.12)',
  emeraldBorder: '#10B981',

  // Amber / Turuncu
  amber: '#F59E0B',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.40)',

  // Rose / Kırmızı (Önerilmesin)
  danger: '#EF4444',
  dangerLight: '#F87171',
  dangerBg: 'rgba(239, 68, 68, 0.16)',
  dangerBorder: 'rgba(239, 68, 68, 0.50)',
};

// Kanonik kas grubu sıralaması (Görseldeki sıra: Triceps, Biceps, Calf, Sırt...)
const CANONICAL_GROUP_ORDER: Record<string, number> = {
  triceps: 1,
  biceps: 2,
  calf: 3,
  kalf: 3,
  sırt: 4,
  back: 4,
  göğüs: 5,
  chest: 5,
  omuz: 6,
  shoulder: 6,
  bacak: 7,
  leg: 7,
  quadriceps: 8,
  hamstring: 9,
  gluteus: 10,
  karın: 11,
  core: 11,
  'ön kol': 12,
  forearms: 12,
};

// ─── Genel İkonlar ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function BarChartIcon({ color = colors.purpleLight, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        d="M6 19v-5M12 19v-10M18 19v-14"
      />
    </Svg>
  );
}

function StarButtonIcon({ filled = false, size = 18 }: { filled?: boolean; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#EDE9FE' : 'none'}
      stroke={filled ? '#EDE9FE' : '#64748B'}
    >
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </Svg>
  );
}

function BanButtonIcon({ active = false, size = 18 }: { active?: boolean; size?: number }) {
  const color = active ? colors.danger : '#64748B';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.5 5.5l13 13" />
    </Svg>
  );
}

function ChevronDownIcon({ color = colors.textDim, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function CheckIcon({ color = colors.emerald, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

// ─── Kas Grubu Özel Anatomik SVG İkonları ───

// 1. Biceps: Gerçek Biceps Pozu İkonu (Flexed Bicep Pose)
function BicepsPoseIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Kolun dirsekten bükülmesi ve pazu bombesi */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M4 17c1-3 2.5-4.8 5-5.2 1-2 3-3.2 5.2-2.8 1.8.4 2.8 1.8 3.3 3.5 1 .3 2.5 1.2 2.5 2.7 0 1.8-1.5 2.8-3.5 2.8H4z"
      />
      {/* Ön kol ve yumruk */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M13.5 9c0-2.2 1.2-4 3.2-4 1.8 0 2.8 1 2.8 2.5 0 1.5-.7 2.5-1.5 3"
      />
      {/* Pazu zirve çizgisi (Peak) */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.6"
        d="M10 12c.8-.8 1.8-1 3-.7"
      />
    </Svg>
  );
}

// 2. Triceps: Arka Kol Kası İkonu
function TricepsMuscleIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Omuzdan dirseğe uzanan arka hat */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M6 5.5c2 1 3.8 3 4.2 6 .4 3-1 6-2.2 8"
      />
      {/* Ön kol ve dirsek açısı */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M10.2 11.5c1.8-1 3.5-.8 5 .2 2 1.5 2.3 3.8 2.3 6.8H8"
      />
      {/* Triceps at nalı (horseshoe) ayrımı */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.7"
        d="M8.8 8.5c1.5.8 2.2 2.2 2 4"
      />
    </Svg>
  );
}

// 3. Calf: Kalf / Baldır ve Bacak İkonu
function CalfMuscleIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Dizden baldıra, aşil tendonuna ve topuk/ayağa inen hat */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M8.5 3c.5 2.2.8 4.5.8 6.8 0 3-1.8 5-1.8 7 0 2.2 1.5 3.7 3.5 3.7h6.5c1 0 1.5-.7 1-1.4l-2.8-1.8c-.8-.5-1.2-1.2-1.2-2.3 0-2.8 1.5-5.5 1.5-8.8 0-1-.2-2.2-.5-3.2"
      />
      {/* Belirgin kalf kası iç kavisi (Gastrocnemius) */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.6"
        d="M11 7.5c1.5 1.5 2 3.5 1.5 5.5"
      />
    </Svg>
  );
}

// 4. Sırt: Geniş Kanat ve V-Taper Sırt İkonu (Lat Spread & Back Silhouette)
function BackLatsIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Baş ve boyun */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M10 5.5a2 2 0 104 0 2 2 0 00-4 0z"
      />
      {/* Trapezler ve omuzlar */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M4 10l3-2.5 3 1h4l3-1 3 2.5"
      />
      {/* V-Taper kanat kasları (Lats) ve dar bel */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M4 10c1.5 2.5 3.5 5 4.5 8.5h7c1-3.5 3-6 4.5-8.5"
      />
      {/* Omurga çizgisi */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.6"
        d="M12 9v9.5"
      />
    </Svg>
  );
}

// 5. Göğüs: Pectoralis Göğüs Plakaları İkonu
function ChestPecsIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Köprücük kemikleri ve boyun */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M9 4.5h6M4 8.5l4-2.5 4 1.5 4-1.5 4 2.5"
      />
      {/* Sol ve sağ göğüs kası kıvrımları */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M4 8.5c.5 4 2.5 6.5 6 7l2-1 2 1c3.5-.5 5.5-3 6-7"
      />
      {/* Göğüs kafesi orta ayrımı (Sternum) */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.8"
        d="M12 7.5v6.5"
      />
    </Svg>
  );
}

// 6. Omuz: Omuz Başları (Deltoids) İkonu
function ShouldersDeltsIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Boyun */}
      <Path strokeLinecap="round" strokeWidth="1.9" d="M10 5h4" />
      {/* Omuz başları ve deltoid yayları */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M4 13.5c-1-2.5-.5-5.5 2-7.5l4-1h4l4 1c2.5 2 3 5 2 7.5"
      />
      {/* Deltoid kas ayrım çizgileri */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.6"
        d="M7.5 8c1 1.5 1.5 3.5 1 5M16.5 8c-1 1.5-1.5 3.5-1 5"
      />
    </Svg>
  );
}

// 7. Bacak: Quadriceps & Bacak Kası İkonu
function LegsQuadsIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Üst bacaklar / Uyluk */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M6.5 4h11l-1 8c-.3 3-.8 6-1.5 8h-3l.5-7.5h-1L12 20H9c-.7-2-1.2-5-1.5-8l-1-8z"
      />
      {/* Quadriceps kas çizgisi */}
      <Path
        strokeLinecap="round"
        strokeWidth="1.5"
        d="M9.5 9c.5 1.5.5 3 0 4.5M14.5 9c-.5 1.5-.5 3 0 4.5"
      />
    </Svg>
  );
}

// 8. Karın: 6-Pack Core / Abs İkonu
function CoreAbsIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      {/* Gövde / Bel */}
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M7 4h10c.5 4-.5 8-1 12l-1 4H9l-1-4C7.5 12 6.5 8 7 4z"
      />
      {/* 6-Pack grid çizgileri */}
      <Path strokeLinecap="round" strokeWidth="1.6" d="M12 4v16M8.5 9.5h7M9 14h6" />
    </Svg>
  );
}

// 9. Kalça: Gluteus İkonu
function GlutesMuscleIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M5 6h14c-.5 4-1 6-2 9-1.5 4.5-4 5-5 5s-3.5-.5-5-5c-1-3-1.5-5-2-9z"
      />
      <Path strokeLinecap="round" strokeWidth="1.7" d="M12 6v14" />
    </Svg>
  );
}

// 10. Ön Kol: Forearms İkonu
function ForearmMuscleIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
        d="M6 18l5-12c.5-1 1.5-1.5 2.5-1.5s2 .5 2.5 1.5l5 12c-2.5 1.5-5 2-7.5 2s-5-.5-7.5-2z"
      />
    </Svg>
  );
}

// Kas Grubu İsim Eşleyicisi
function MuscleGroupIcon({
  group,
  size = 20,
  color = colors.purpleLight,
}: {
  group: string;
  size?: number;
  color?: string;
}) {
  const g = group.toLowerCase();

  // Biceps -> Biceps Pozu
  if (g.includes('biceps') || g.includes('pazu')) {
    return <BicepsPoseIcon size={size} color={color} />;
  }

  // Triceps -> Triceps Arka Kol
  if (g.includes('triceps')) {
    return <TricepsMuscleIcon size={size} color={color} />;
  }

  // Calf / Kalf -> Baldır ve Ayak
  if (g.includes('calf') || g.includes('kalf')) {
    return <CalfMuscleIcon size={size} color={color} />;
  }

  // Sırt / Lats -> V-Taper Sırt & Kanat
  if (
    g.includes('sırt') ||
    g.includes('back') ||
    g.includes('lat') ||
    g.includes('traps') ||
    g.includes('trapez') ||
    g.includes('skapula')
  ) {
    return <BackLatsIcon size={size} color={color} />;
  }

  // Göğüs / Chest -> Göğüs Kasları
  if (g.includes('göğüs') || g.includes('chest') || g.includes('pec')) {
    return <ChestPecsIcon size={size} color={color} />;
  }

  // Omuz / Shoulder -> Deltoid Omuz Başları
  if (g.includes('omuz') || g.includes('shoulder') || g.includes('delt') || g.includes('rotator')) {
    return <ShouldersDeltsIcon size={size} color={color} />;
  }

  // Bacak / Quad / Hamstring -> Uyluk / Quads
  if (
    g.includes('quad') ||
    g.includes('hamstring') ||
    g.includes('bacak') ||
    g.includes('leg') ||
    g.includes('alt vücut') ||
    g.includes('adductor')
  ) {
    return <LegsQuadsIcon size={size} color={color} />;
  }

  // Kalça / Gluteus -> Glutes
  if (g.includes('glute') || g.includes('kalça')) {
    return <GlutesMuscleIcon size={size} color={color} />;
  }

  // Karın / Core / Abs -> 6-Pack Grid
  if (g.includes('karın') || g.includes('core') || g.includes('abs')) {
    return <CoreAbsIcon size={size} color={color} />;
  }

  // Ön Kol -> Forearms
  if (g.includes('ön kol') || g.includes('forearm') || g.includes('bilek')) {
    return <ForearmMuscleIcon size={size} color={color} />;
  }

  // Varsayılan
  return <BicepsPoseIcon size={size} color={color} />;
}

// ─── Akordiyon Kart Bileşeni (Yumuşak Açılan / Kapanan Animasyonlu) ───
interface MuscleGroupAccordionCardProps {
  groupName: string;
  exercises: ExercisePreferenceCatalogItem[];
  isExpanded: boolean;
  onToggle: () => void;
  preferredIds: string[];
  avoidIds: string[];
  onTogglePreferred: (id: string) => void;
  onToggleAvoid: (id: string) => void;
}

function MuscleGroupAccordionCard({
  groupName,
  exercises,
  isExpanded,
  onToggle,
  preferredIds,
  avoidIds,
  onTogglePreferred,
  onToggleAvoid,
}: MuscleGroupAccordionCardProps) {
  const [anim] = useState(() => new Animated.Value(isExpanded ? 1 : 0));
  const [measuredHeight, setMeasuredHeight] = useState(0);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: isExpanded ? 1 : 0,
      duration: 280,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
  }, [isExpanded, anim]);

  const chevronRotate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const estimatedHeight = Math.max(exercises.length * 64, 120);
  const targetHeight = measuredHeight > 0 ? measuredHeight : estimatedHeight;

  const maxHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, targetHeight],
  });

  const contentOpacity = anim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0, 0.4, 1],
  });

  return (
    <View style={styles.groupCard}>
      {/* Kas Grubu Başlığı (Akordiyon Aç/Kapa) */}
      <TouchableOpacity
        style={styles.groupHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.groupHeaderLeft}>
          {/* Dairesel Mor İkon Kutusu: Kasa Özel Gerçekçi İkon */}
          <View style={styles.groupIconCircle}>
            <MuscleGroupIcon group={groupName} size={19} color={colors.purpleLight} />
          </View>

          <View style={styles.groupTitleCol}>
            <Text style={styles.groupNameText}>{groupName}</Text>
            <Text style={styles.groupCountText}>{exercises.length} Hareket</Text>
          </View>
        </View>

        <View style={styles.groupHeaderRight}>
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <ChevronDownIcon size={18} color={isExpanded ? colors.purpleLight : colors.textDim} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* Yumuşak Açılan / Kapanan Liste Gövdesi */}
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            maxHeight,
            opacity: contentOpacity,
          },
        ]}
      >
        <View
          style={styles.exerciseList}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && h !== measuredHeight) {
              setMeasuredHeight(h);
            }
          }}
        >
          {exercises.map((exercise) => {
            const isPref = preferredIds.includes(exercise.id);
            const isAvoid = avoidIds.includes(exercise.id);

            return (
              <View key={exercise.id} style={styles.exerciseRow}>
                {/* Sol: Hareket Adı */}
                <Text style={styles.exerciseNameText} numberOfLines={2}>
                  {exercise.name}
                </Text>

                {/* Sağ: İkili Butonlar (Yıldız / Tercih & Engelle / Önerme) */}
                <View style={styles.actionsRow}>
                  {/* Yıldız / Tercih Butonu */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isPref && styles.actionBtnStarActive,
                    ]}
                    onPress={() => onTogglePreferred(exercise.id)}
                    activeOpacity={0.7}
                    hitSlop={4}
                  >
                    <StarButtonIcon filled={isPref} size={18} />
                  </TouchableOpacity>

                  {/* Engelle / Önerme Butonu */}
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isAvoid && styles.actionBtnBanActive,
                    ]}
                    onPress={() => onToggleAvoid(exercise.id)}
                    activeOpacity={0.7}
                    hitSlop={4}
                  >
                    <BanButtonIcon active={isAvoid} size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

export default function ExercisePreferencesScreen() {
  const router = useRouter();
  const { expertData, isLoading, isRefetching, refetch, saveMovementMutation } = useExpertData();

  const catalog = useMemo(
    () => expertData?.catalog?.exercise_preferences || [],
    [expertData?.catalog?.exercise_preferences]
  );
  const serverPreferred = useMemo(
    () => expertData?.preferred_exercise_ids || [],
    [expertData?.preferred_exercise_ids]
  );
  const serverAvoid = useMemo(
    () => expertData?.avoid_exercise_ids || [],
    [expertData?.avoid_exercise_ids]
  );

  // Yerel Taslak State
  const [draftPreferred, setDraftPreferred] = useState<string[] | null>(null);
  const [draftAvoid, setDraftAvoid] = useState<string[] | null>(null);

  // Kullanıcı Talimatı: Sayfaya ilk girildiğinde hiçbir liste açık durumda olmasın (hepsi varsayılan olarak kapalı)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const preferredIds = useMemo(
    () => draftPreferred ?? serverPreferred,
    [draftPreferred, serverPreferred]
  );
  const avoidIds = useMemo(
    () => draftAvoid ?? serverAvoid,
    [draftAvoid, serverAvoid]
  );

  // Tercih Aç/Kapa
  const togglePreferred = (exerciseId: string) => {
    Keyboard.dismiss();
    const currentPref = draftPreferred ?? serverPreferred;
    const currentAvoid = draftAvoid ?? serverAvoid;
    const nextPref = currentPref.includes(exerciseId)
      ? currentPref.filter((id) => id !== exerciseId)
      : [...currentPref, exerciseId];
    const nextAvoid = currentAvoid.filter((id) => id !== exerciseId);
    setDraftPreferred(nextPref);
    setDraftAvoid(nextAvoid);
  };

  // Önerme Aç/Kapa
  const toggleAvoid = (exerciseId: string) => {
    Keyboard.dismiss();
    const currentPref = draftPreferred ?? serverPreferred;
    const currentAvoid = draftAvoid ?? serverAvoid;
    const nextAvoid = currentAvoid.includes(exerciseId)
      ? currentAvoid.filter((id) => id !== exerciseId)
      : [...currentAvoid, exerciseId];
    const nextPref = currentPref.filter((id) => id !== exerciseId);
    setDraftAvoid(nextAvoid);
    setDraftPreferred(nextPref);
  };

  // Kaydet
  const handleSave = async () => {
    try {
      await saveMovementMutation.mutateAsync({
        preferred_exercise_ids: preferredIds,
        avoid_exercise_ids: avoidIds,
      });
      setDraftPreferred(null);
      setDraftAvoid(null);
      Alert.alert('Başarılı', 'Hareket tercihleriniz başarıyla kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Tercihler kaydedilemedi.');
    }
  };

  // Gruplandırılmış Egzersizler (Görseldeki sıra: Triceps, Biceps, Calf, Sırt...)
  const groupsMap = new Map<string, ExercisePreferenceCatalogItem[]>();

  catalog.forEach((ex) => {
    const groupName = ex.display_groups?.[0] || ex.group || 'Diğer';
    if (!groupsMap.has(groupName)) {
      groupsMap.set(groupName, []);
    }
    groupsMap.get(groupName)!.push(ex);
  });

  const groupedExercises = Array.from(groupsMap.entries()).sort(([a], [b]) => {
    const orderA = CANONICAL_GROUP_ORDER[a.toLowerCase()] ?? 99;
    const orderB = CANONICAL_GROUP_ORDER[b.toLowerCase()] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, 'tr');
  });

  // Akordiyon Grubu Aç/Kapa
  const toggleGroup = (groupName: string) => {
    Keyboard.dismiss();
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const isSaving = saveMovementMutation.isPending;

  // İlerleme yüzdesi hesaplama
  const totalConfigured = preferredIds.length + avoidIds.length;
  const progressPercent = catalog.length > 0 ? Math.min(100, Math.round((totalConfigured / catalog.length) * 100)) : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ─── Üst Başlık Barı ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <BackIcon size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Hareket Tercihlerim</Text>

        <View style={styles.optionalPill}>
          <Text style={styles.optionalPillText}>İsteğe Bağlı</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={colors.purple}
            colors={[colors.purple]}
          />
        }
      >
        {/* ─── Hero Kart: Tercih Durumum (Fotoğraftaki Yan Yana Düzen) ─── */}
        <View style={styles.heroCard}>
          {/* Üst Kısım: Sol (İkon + Başlık + Açıklama) ve Sağ (3 Sütunlu Sayılar) */}
          <View style={styles.heroMainRow}>
            {/* Sol Kısım: İkon + Başlık ve Açıklama (Asla Taşmaz) */}
            <View style={styles.heroLeftCol}>
              <View style={styles.heroIconBox}>
                <BarChartIcon size={20} color={colors.purpleLight} />
              </View>

              <View style={styles.heroTextCol}>
                <Text style={styles.heroTitle} numberOfLines={1}>
                  Tercih Durumum
                </Text>
                <Text style={styles.heroDesc} numberOfLines={2}>
                  Hareket tercihlerini belirle, sana daha uygun bir plan oluşturalım.
                </Text>
              </View>
            </View>

            {/* Sağ Kısım: 3 Sütunlu Rakamlar (Fotoğraftaki Birebir Düzen) */}
            <View style={styles.heroStatsCol}>
              {/* 1. Tercih (Yeşil Sayı ve Yeşil Yazı) */}
              <View style={styles.heroStatItem}>
                <Text style={styles.statNumEmerald}>{preferredIds.length}</Text>
                <Text style={styles.statLabelEmerald}>Tercih</Text>
              </View>

              <View style={styles.statDivider} />

              {/* 2. Önerilmesin (Kırmızı Sayı ve Kırmızı Yazı) */}
              <View style={styles.heroStatItem}>
                <Text style={styles.statNumDanger}>{avoidIds.length}</Text>
                <Text style={styles.statLabelDanger}>Önerilmesin</Text>
              </View>

              <View style={styles.statDivider} />

              {/* 3. Toplam (Beyaz Sayı ve Muted Yazı) */}
              <View style={styles.heroStatItem}>
                <Text style={styles.statNumWhite}>{totalConfigured}</Text>
                <Text style={styles.statLabelMuted}>Toplam</Text>
              </View>
            </View>
          </View>

          {/* Alt Kısım: İlerleme Çubuğu ve Yan Yana Yüzde (Fotoğraftaki Düzen) */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarTrack}>
              <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
            </View>
            <Text style={styles.progressPercentText}>%{progressPercent}</Text>
          </View>
        </View>

        {/* ─── Kas Grupları & Egzersiz Listesi ─── */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Hareket kataloğu yükleniyor...</Text>
          </View>
        ) : groupedExercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Eşleşen Hareket Bulunamadı</Text>
            <Text style={styles.emptyDesc}>
              Katalogda hareket bulunamadı.
            </Text>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {groupedExercises.map(([groupName, exercises]) => {
              const isExpanded = Boolean(expandedGroups[groupName]);

              return (
                <MuscleGroupAccordionCard
                  key={groupName}
                  groupName={groupName}
                  exercises={exercises}
                  isExpanded={isExpanded}
                  onToggle={() => toggleGroup(groupName)}
                  preferredIds={preferredIds}
                  avoidIds={avoidIds}
                  onTogglePreferred={togglePreferred}
                  onToggleAvoid={toggleAvoid}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ─── Alt Sabit Kaydet Butonu (Neon Yeşil Çerçeveli) ─── */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.neonGreenSaveBtn, isSaving && { opacity: 0.6 }]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.emeraldLight} />
          ) : (
            <View style={styles.saveBtnContent}>
              <CheckIcon size={18} color={colors.emeraldLight} />
              <Text style={styles.neonGreenSaveBtnText}>Seçimleri Kaydet</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  optionalPill: {
    backgroundColor: colors.amberBg,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  optionalPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.amber,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 14,
  },

  // ─── Hero Kart: Tercih Durumum ───
  heroCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  heroLeftCol: {
    flex: 1.15,
    flexShrink: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingRight: 4,
  },
  heroIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroTextCol: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    gap: 2,
  },
  heroTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  heroDesc: {
    fontSize: 10.5,
    color: colors.textMuted,
    lineHeight: 14,
    flexWrap: 'wrap',
  },
  heroStatsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  heroStatItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
  },
  statNumEmerald: {
    fontSize: 16.5,
    fontWeight: '900',
    color: colors.emeraldLight,
  },
  statLabelEmerald: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.emeraldLight,
    marginTop: 2,
  },
  statNumDanger: {
    fontSize: 16.5,
    fontWeight: '900',
    color: colors.dangerLight,
  },
  statLabelDanger: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.dangerLight,
    marginTop: 2,
  },
  statNumWhite: {
    fontSize: 16.5,
    fontWeight: '900',
    color: colors.text,
  },
  statLabelMuted: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.textDim,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.purpleLight,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
  },

  // ─── Kas Grupları Akordiyon Kartları ───
  groupsContainer: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 18,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  groupIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTitleCol: {
    gap: 2,
  },
  groupNameText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.text,
  },
  groupCountText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textDim,
  },
  groupHeaderRight: {
    paddingLeft: 8,
  },

  // ─── Egzersiz Listesi Animasyon Kapsayıcısı ───
  animatedContainer: {
    overflow: 'hidden',
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  exerciseNameText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.text,
    paddingRight: 12,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnStarActive: {
    backgroundColor: colors.purpleActiveBg,
    borderColor: colors.purpleActiveBorder,
  },
  actionBtnBanActive: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },

  // ─── Alt Sabit Kaydet Butonu (Neon Yeşil Çerçeveli) ───
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: 'rgba(8, 11, 20, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  neonGreenSaveBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1.5,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  neonGreenSaveBtnText: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.emeraldLight,
    letterSpacing: 0.3,
  },

  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  emptyCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
