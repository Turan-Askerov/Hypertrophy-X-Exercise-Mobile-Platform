import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
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
import { ModernSwitch } from '@/components/ui/modern-switch';
import type { DetailedMuscleCatalogItem } from '@/types/expert';

// ─── Cyber Dark Renk Paleti (gyms.tsx & equipment.tsx standardı) ───
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

  // Cyan
  cyan: '#38BDF8',
  cyanLight: '#7DD3FC',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
  cyanBorder: 'rgba(56, 189, 248, 0.35)',

  // Emerald / Neon Yeşil
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: '#10B981',

  // Amber / Turuncu
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.40)',

  // Rose / Kırmızı
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.86), 336);
const CARD_GAP = 12;

// ─── SVG İkonlar ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function CheckIcon({ color = colors.emeraldLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.6" d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function EditIcon({ color = colors.emeraldLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      />
    </Svg>
  );
}

function TargetBullseyeIcon({ color = colors.purpleLight, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" fill={color} strokeWidth="1" />
    </Svg>
  );
}

function ZapIcon({ color = colors.purpleLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      />
    </Svg>
  );
}

function FlameIcon({ color = colors.amberLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 2c0 3.5-3 5.5-3 9 0 3.3 2.7 6 6 6s6-2.7 6-6c0-2-1-3.5-2-4.5-.5 2-2 3.5-4 3.5-1 0-2-.5-2.5-1.5 2-1 3-3 3-6.5-1.5 1-2.5 1.5-3.5 1.5z"
      />
    </Svg>
  );
}

function UserGoalIcon({ color = colors.cyanLight, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </Svg>
  );
}

function SparklesIcon({ color = colors.amberLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 2l1.9 5.8a2 2 0 001.3 1.3L21 11l-5.8 1.9a2 2 0 00-1.3 1.3L12 20l-1.9-5.8a2 2 0 00-1.3-1.3L3 11l5.8-1.9a2 2 0 001.3-1.3L12 2z"
      />
    </Svg>
  );
}

// ─── Kas Grubu Anatomik Kategori İkonları ───
function ChestIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8c3-2 6-2 8 1 2-3 5-3 8-1 0 6-3 10-8 12-5-2-8-6-8-12z" />
    </Svg>
  );
}

function BackLatsIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v18M7 8l5 4 5-4M5 14l7 4 7-4" />
    </Svg>
  );
}

function ShoulderIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14c2-5 5-8 9-8s7 3 9 8M8 14a4 4 0 008 0" />
    </Svg>
  );
}

function ArmsIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 16c1-2 2-3 4-3 1-2 3-3 5-2 2 1 3 2 3 4M12 8c0-2 1-3 3-3 2 0 3 1 3 3" />
    </Svg>
  );
}

function LegsIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v18M16 3v18M8 12h8" />
    </Svg>
  );
}

function CoreIcon({ color = colors.purpleLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 4h8M8 9h8M8 14h8M8 19h8M12 4v16" />
    </Svg>
  );
}

function MuscleCategoryIcon({ group, color = colors.purpleLight, size = 16 }: { group: string; color?: string; size?: number }) {
  const g = group.toLowerCase();
  if (g.includes('göğüs') || g.includes('chest')) return <ChestIcon color={color} size={size} />;
  if (g.includes('sırt') || g.includes('back') || g.includes('lat')) return <BackLatsIcon color={color} size={size} />;
  if (g.includes('omuz') || g.includes('shoulder') || g.includes('delt')) return <ShoulderIcon color={color} size={size} />;
  if (g.includes('kol') || g.includes('biceps') || g.includes('triceps') || g.includes('bilek')) return <ArmsIcon color={color} size={size} />;
  if (g.includes('bacak') || g.includes('leg') || g.includes('calf') || g.includes('quad') || g.includes('glute')) return <LegsIcon color={color} size={size} />;
  return <CoreIcon color={color} size={size} />;
}

// ─── Varsayılan Kas Kataloğu ───
const DEFAULT_DETAILED_MUSCLES: DetailedMuscleCatalogItem[] = [
  { id: 'chest', label: 'Göğüs', ui_group: 'Göğüs' },
  { id: 'lats', label: 'Latissimus (Kanat)', ui_group: 'Sırt' },
  { id: 'upper_back', label: 'Üst Sırt', ui_group: 'Sırt' },
  { id: 'traps', label: 'Trapez', ui_group: 'Sırt' },
  { id: 'spinal_erectors', label: 'Bel / Omurga Erektörleri', ui_group: 'Sırt' },
  { id: 'front_delts', label: 'Ön Omuz', ui_group: 'Omuz' },
  { id: 'side_delts', label: 'Yan Omuz', ui_group: 'Omuz' },
  { id: 'rear_delts', label: 'Arka Omuz', ui_group: 'Omuz' },
  { id: 'rotator_cuff', label: 'Rotator Cuff', ui_group: 'Omuz' },
  { id: 'biceps', label: 'Biceps (Pazu)', ui_group: 'Kollar' },
  { id: 'triceps', label: 'Triceps (Arka Kol)', ui_group: 'Kollar' },
  { id: 'forearms', label: 'Bilek Kasları', ui_group: 'Kollar' },
  { id: 'quadriceps', label: 'Quadriceps (Ön Bacak)', ui_group: 'Bacak' },
  { id: 'hamstrings', label: 'Hamstring (Arka Bacak)', ui_group: 'Bacak' },
  { id: 'glutes', label: 'Gluteus (Kalça)', ui_group: 'Bacak' },
  { id: 'calves', label: 'Calf (Baldır)', ui_group: 'Bacak' },
  { id: 'adductors', label: 'Adductors (İç Bacak)', ui_group: 'Bacak' },
  { id: 'core', label: 'Core / Karın', ui_group: 'Core' },
];

// ─── Popüler Hazır Odak Şablonları ───
interface PresetGoalTemplate {
  id: string;
  title: string;
  subtitle: string;
  desc: string;
  muscles: string[];
  badge: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
}

const PRESET_GOAL_TEMPLATES: PresetGoalTemplate[] = [
  {
    id: 'v_taper',
    title: 'V-Taper Estetik',
    subtitle: 'Geniş Omuz & V-Sırt Profili',
    desc: 'Estetik V formu için kanat, yan omuz ve üst göğüs hipertrofisine odaklanır.',
    muscles: ['lats', 'side_delts', 'chest'],
    badge: 'Popüler',
    accentColor: colors.purpleLight,
    accentBg: colors.purpleBg,
    accentBorder: colors.purpleBorder,
  },
  {
    id: 'arm_shoulder',
    title: '3D Kol & Omuz',
    subtitle: 'Maksimum Kol Hipertrofisi',
    desc: 'Kollarda tepe noktası ve küre omuzlar için biceps, triceps ve yan omuz.',
    muscles: ['side_delts', 'biceps', 'triceps'],
    badge: 'Hipertrofi',
    accentColor: colors.cyanLight,
    accentBg: colors.cyanBg,
    accentBorder: colors.cyanBorder,
  },
  {
    id: 'lower_body',
    title: 'Güçlü Alt Gövde',
    subtitle: 'Patlayıcı Bacak & Kalça',
    desc: 'Dengeli ve hacimli alt gövde gelişimi için quad, hamstring ve gluteus.',
    muscles: ['quadriceps', 'glutes', 'hamstrings'],
    badge: 'Alt Gövde',
    accentColor: colors.emeraldLight,
    accentBg: colors.emeraldBg,
    accentBorder: colors.emeraldBorder,
  },
];

function MuscleTemplateIcon({
  id,
  color = colors.purpleLight,
  size = 14,
}: {
  id: string;
  color?: string;
  size?: number;
}) {
  if (id === 'v_taper') return <BackLatsIcon color={color} size={size} />;
  if (id === 'arm_shoulder') return <ArmsIcon color={color} size={size} />;
  if (id === 'lower_body') return <LegsIcon color={color} size={size} />;
  return <SparklesIcon color={color} size={size} />;
}

// ─── Alttan Açılan Hedef Düzenleme Panosu (equipment.tsx & gyms.tsx standardı) ───
interface GoalPreferencesBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (muscles: string[]) => Promise<void>;
  isSaving: boolean;
  initialMuscles: string[];
  catalogMuscles: DetailedMuscleCatalogItem[];
  muscleLabelMap: Map<string, string>;
}

function GoalPreferencesBottomSheet({
  visible,
  onClose,
  onSave,
  isSaving,
  initialMuscles,
  catalogMuscles,
}: GoalPreferencesBottomSheetProps) {
  const estimatedSheetHeight = 650;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  // Form State
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>(initialMuscles);
  const [formError, setFormError] = useState<string | null>(null);

  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));

  const openSheet = useCallback(() => {
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 220,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, sheetHeight, translateY]);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight || estimatedSheetHeight,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [backdropAnim, estimatedSheetHeight, onClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 3,
        onMoveShouldSetPanResponderCapture: (_, gestureState) => gestureState.dy > 3,
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const fade = Math.max(0.2, 1 - gestureState.dy / (sheetHeight * 1.1));
            backdropAnim.setValue(fade);
          } else {
            translateY.setValue(gestureState.dy * 0.15);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss = gestureState.dy > 80 || gestureState.vy > 0.45;
          if (shouldDismiss) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                mass: 0.8,
                stiffness: 240,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
      }),
    [backdropAnim, closeSheet, sheetHeight, translateY]
  );

  const toggleMuscleItem = (id: string) => {
    setFormError(null);
    if (selectedMuscles.includes(id)) {
      setSelectedMuscles((prev) => prev.filter((item) => item !== id));
    } else {
      if (selectedMuscles.length >= 3) {
        setFormError('En fazla 3 öncelikli hedef kas seçebilirsiniz.');
        return;
      }
      setSelectedMuscles((prev) => [...prev, id]);
    }
  };

  const clearAll = () => {
    setSelectedMuscles([]);
    setFormError(null);
  };

  const handleSubmit = async () => {
    await onSave(selectedMuscles);
  };

  // Kategorilere göre grupla
  const groupedMuscles = useMemo(() => {
    const groups: Record<string, DetailedMuscleCatalogItem[]> = {
      Göğüs: [],
      Sırt: [],
      Omuz: [],
      Kollar: [],
      Bacak: [],
      Core: [],
    };

    catalogMuscles.forEach((m) => {
      const g = m.ui_group || 'Diğer';
      if (!groups[g]) groups[g] = [];
      groups[g].push(m);
    });

    return groups;
  }, [catalogMuscles]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={modalStyles.modalRootContainer}>
        {/* Karartmalı Arka Plan */}
        <Animated.View style={[modalStyles.modalBackdropTap, { opacity: backdropAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        {/* Alttan Sürüklenerek Kapatılabilen Pano */}
        <Animated.View
          style={[
            modalStyles.modalSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 10) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükleme Tutamaç Alanı */}
          <View {...panResponder.panHandlers} style={modalStyles.dragZone}>
            <View style={modalStyles.modalHandle} />
            <View style={modalStyles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={modalStyles.modalTitle}>Öncelikli Hedef Kasları Düzenle</Text>
                <Text style={modalStyles.modalDesc}>
                  Programında öne çıkmasını istediğin maksimum 3 kas grubunu seç.
                </Text>
              </View>

              <View
                style={[
                  modalStyles.modalCountBadge,
                  selectedMuscles.length === 3 && modalStyles.modalCountBadgeFull,
                ]}
              >
                <Text
                  style={[
                    modalStyles.modalCountBadgeText,
                    selectedMuscles.length === 3 && modalStyles.modalCountBadgeTextFull,
                  ]}
                >
                  {selectedMuscles.length} / 3 Seçildi
                </Text>
              </View>
            </View>
          </View>

          <ScrollView
            style={modalStyles.modalScroll}
            contentContainerStyle={modalStyles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {formError && (
              <View style={modalStyles.errorBox}>
                <Text style={modalStyles.errorText}>⚠️ {formError}</Text>
              </View>
            )}

            {/* Bölüm Başlığı & Sıfırla Aksiyonu */}
            <View style={modalStyles.sectionHeaderRow}>
              <Text style={modalStyles.sectionTitleText}>
                HEDEF KASLAR ({selectedMuscles.length} / 3)
              </Text>
              {selectedMuscles.length > 0 && (
                <TouchableOpacity onPress={clearAll} style={modalStyles.clearBtn} hitSlop={6}>
                  <Text style={modalStyles.clearBtnText}>Seçimleri Sıfırla</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Kategorilere Göre Switch Listesi */}
            {Object.entries(groupedMuscles).map(([groupName, items]) => {
              if (items.length === 0) return null;
              const selectedCount = items.filter((m) => selectedMuscles.includes(m.id)).length;

              return (
                <View key={groupName} style={modalStyles.groupBlock}>
                  <View style={modalStyles.groupBlockHeader}>
                    <View style={modalStyles.groupTitleWithIcon}>
                      <MuscleCategoryIcon group={groupName} size={15} color={colors.purpleLight} />
                      <Text style={modalStyles.groupBlockTitle}>{groupName}</Text>
                    </View>
                    <Text style={modalStyles.groupBlockCount}>
                      {selectedCount > 0 ? `${selectedCount} seçili` : `${items.length} Kas`}
                    </Text>
                  </View>

                  <View style={modalStyles.groupItemsList}>
                    {items.map((item) => {
                      const isChecked = selectedMuscles.includes(item.id);

                      return (
                        <View key={item.id} style={modalStyles.switchRow}>
                          <View style={modalStyles.switchTextCol}>
                            <Text style={modalStyles.switchItemLabel}>{item.label}</Text>
                            <Text
                              style={[
                                modalStyles.switchItemStatus,
                                isChecked
                                  ? modalStyles.statusActive
                                  : modalStyles.statusInactive,
                              ]}
                            >
                              {isChecked ? 'Öncelikli Hedef' : 'Standart Hacim'}
                            </Text>
                          </View>

                          {/* Modern Yumuşak Animasyonlu Yeşil Anahtar */}
                          <ModernSwitch
                            value={isChecked}
                            onValueChange={() => toggleMuscleItem(item.id)}
                            activeColor={colors.emerald}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Aksiyon Butonları (Kaydet Butonu Neon Çerçeveli Yeşil) */}
          <View style={modalStyles.modalActionButtons}>
            <TouchableOpacity
              style={modalStyles.neonCancelBtn}
              onPress={closeSheet}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              <Text style={modalStyles.neonCancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[modalStyles.neonSaveBtn, isSaving && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={isSaving}
              activeOpacity={0.7}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#10B981" />
              ) : (
                <>
                  <CheckIcon size={16} color="#34D399" />
                  <Text style={modalStyles.neonSaveBtnText}>Tercihleri Kaydet</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Alt Taşma Uzantısı */}
          <View style={modalStyles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── ANA SAYFA BİLEŞENİ ───
export default function GoalsScreen() {
  const router = useRouter();
  const { expertData, isRefetching, refetch, saveGoalsMutation } = useExpertData();

  // Katalogdaki kas gruplarını normalize et
  const rawCatalogMuscles = expertData?.catalog?.detailed_muscles;
  const muscles: DetailedMuscleCatalogItem[] = useMemo(() => {
    if (Array.isArray(rawCatalogMuscles) && rawCatalogMuscles.length > 0) {
      return rawCatalogMuscles.map((item: any) => {
        if (typeof item === 'string') {
          const found = DEFAULT_DETAILED_MUSCLES.find((d) => d.id === item || d.label === item);
          return found || { id: item, label: item, ui_group: 'Diğer' };
        }
        return {
          id: item.id || item.label,
          label: item.label || item.id,
          ui_group: item.ui_group || 'Diğer',
        };
      });
    }
    return DEFAULT_DETAILED_MUSCLES;
  }, [rawCatalogMuscles]);

  // ID -> Label Sözlüğü
  const muscleLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    muscles.forEach((m) => map.set(m.id, m.label));
    DEFAULT_DETAILED_MUSCLES.forEach((m) => {
      if (!map.has(m.id)) map.set(m.id, m.label);
    });
    return map;
  }, [muscles]);

  const primaryGoals = expertData?.catalog?.primary_goals || {
    hypertrophy: 'Kas kazanımı (Bulk)',
    recomp: 'Yeniden yapılanma (Recomp)',
    strength: 'Kuvvet artışı',
    maintenance: 'Mevcut formu koruma',
  };

  const currentGoalData = expertData?.target_muscles || {};
  const currentGoalKey = currentGoalData.primary_goal || 'hypertrophy';

  // Sunucudan gelen priority_muscles değerlerini id olarak normalize et
  const selectedMuscles = useMemo(() => {
    const rawList = currentGoalData.priority_muscles || [];
    return rawList.map((val) => {
      const byId = DEFAULT_DETAILED_MUSCLES.find((m) => m.id === val);
      if (byId) return byId.id;
      const byLabel = DEFAULT_DETAILED_MUSCLES.find(
        (m) => m.label.toLowerCase() === String(val).toLowerCase()
      );
      return byLabel ? byLabel.id : String(val);
    });
  }, [currentGoalData.priority_muscles]);

  const primaryGoal = currentGoalKey;
  const priorityNote = currentGoalData.priority_note || '';

  // Aktif Şablon Algılama (Seçilen kaslar hazır şablonla eşleşiyorsa adı, değilse 'Özel Şablon')
  const activeTemplateName = useMemo(() => {
    if (selectedMuscles.length === 0) return 'Belirlenmedi';
    const matched = PRESET_GOAL_TEMPLATES.find(
      (tpl) =>
        tpl.muscles.length === selectedMuscles.length &&
        tpl.muscles.every((mId) => selectedMuscles.includes(mId))
    );
    if (matched) return matched.title;
    return 'Özel Şablon';
  }, [selectedMuscles]);

  // Alttan Açılan Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const openEditBottomSheet = () => {
    setModalKey((prev) => prev + 1);
    setModalVisible(true);
  };

  // Hazır Şablon Uygula (Doğrudan sunucuya kaydeder)
  const applyPresetTemplate = async (templateMuscles: string[]) => {
    try {
      await saveGoalsMutation.mutateAsync({
        primary_goal: primaryGoal,
        priority_muscles: templateMuscles,
        priority_note: priorityNote,
      });
      Alert.alert(
        'Şablon Uygulandı',
        'Öncelikli hedef kaslar şablon doğrultusunda kaydedildi.'
      );
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şablon uygulanamadı.');
    }
  };

  // Modaldan Gelen Kaydetme İsteği (Doğrudan sunucuya kaydeder)
  const handleModalSave = async (musclesToSave: string[]) => {
    try {
      await saveGoalsMutation.mutateAsync({
        primary_goal: primaryGoal,
        priority_muscles: musclesToSave,
        priority_note: priorityNote,
      });
      setModalVisible(false);
      Alert.alert('Başarılı', 'Öncelikli hedef kaslarınız başarıyla kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Hedefler kaydedilemedi.');
    }
  };

  const isSaving = saveGoalsMutation.isPending;

  // Carousel sayfa kaydırma takibi (2 Kart)
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    setActiveCardIndex(Math.max(0, Math.min(1, index)));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ─── 1. Üst Başlık Barı (İsteğe Bağlı Rozeti Kaldırıldı) ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <BackIcon size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Öncelikli Hedef Kaslar</Text>

        <View style={styles.headerRightSpacer} />
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
        {/* ─── 2. HEDEF KASLAR HERO KARTI (Kadro Dolu Rozeti Yerine Sayfa Başlığındaki Yeşil Rozet Taşındı) ─── */}
        <View style={styles.heroCard}>
          {/* Kart Üst Bilgisi: Sol İkon (Bullseye Target), Orta Başlık, Sağ Üst Yeşil Rozet */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <TargetBullseyeIcon size={24} color={colors.purpleLight} />
            </View>

            <View style={styles.heroTitleCol}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                Öncelikli Kas Tercihleri
              </Text>
            </View>
          </View>

          {/* Açıklama Metni (Taşma korumalı tam genişlikli yerleşim) */}
          <Text style={styles.heroDesc}>
            Antrenman motoru programını oluştururken seçtiğin bu kaslara eşit öncelik verir, haftalık set hacmi ve hareket sıralamasını öne alır.
          </Text>

          <View style={styles.heroDivider} />

          {/* 3'lü İstatistik Alanı */}
          <View style={styles.heroStatsRow}>
            {/* 1. AKTİF ŞABLON (Kullanıcının seçtiği hazır şablon veya Özel Şablon) */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>ŞABLON</Text>
              <View style={styles.heroStatContentRow}>
                <SparklesIcon size={15} color={colors.purpleLight} />
                <Text
                  style={[
                    styles.heroStatValueText,
                    {
                      color:
                        selectedMuscles.length === 0
                          ? colors.textDim
                          : colors.purpleLight,
                      flex: 1,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {activeTemplateName}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 2. ANA AMAC */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>ANA AMAC</Text>
              <View style={styles.heroStatContentRow}>
                <UserGoalIcon size={15} color={colors.cyanLight} />
                <Text
                  style={[styles.heroStatValueText, { color: colors.cyanLight }]}
                  numberOfLines={1}
                >
                  {primaryGoals[primaryGoal] ? primaryGoals[primaryGoal].split(' ')[0] : 'Hipertrofi'}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 3. HACİM ÖNCELİĞİ */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>HACİM ÖNCELİĞİ</Text>
              <View style={styles.heroStatContentRow}>
                <FlameIcon size={15} color={colors.emeraldLight} />
                <Text style={[styles.heroStatValueText, { color: colors.emeraldLight }]}>
                  {selectedMuscles.length > 0 ? 'Öne Alındı' : 'Dengeli'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bilgi Şeridi */}
          <View style={styles.tipBanner}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>💡 Hipertrofi Motoru: </Text>
              Seçilen kaslar için haftalık toparlanma periyotları korunarak ekstra hacim atanır.
            </Text>
          </View>
        </View>

        {/* ─── 3. YATAY KARUSEL: HEDEF PANO VE ŞABLONLAR ─── */}
        <View style={styles.carouselSection}>
          <View style={styles.carouselHeaderRow}>
            <View style={styles.carouselHeaderTitleCol}>
              <Text style={styles.carouselTitle}>Hedef Panoları & Şablonlar</Text>
              <Text style={styles.carouselSubtitle}>
                Seçilen öncelikleri incele veya hazır kombinasyonları uygula
              </Text>
            </View>

            <View style={styles.carouselCounterBadge}>
              <Text style={styles.carouselCounterBadgeText}>
                {activeCardIndex + 1} / 2
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_GAP}
            decelerationRate="fast"
            contentContainerStyle={styles.horizontalScrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* ── KART 1: Seçilen Öncelikli Hedef Kaslarım ── */}
            <View style={[styles.poolCard, styles.poolCardCustomActive]}>
              <View style={styles.poolCardHeader}>
                <View style={[styles.poolIconBadge, styles.poolIconBadgeActive]}>
                  <TargetBullseyeIcon size={20} color={colors.purpleLight} />
                </View>

                <View style={styles.poolCardTitleCol}>
                  <View style={styles.poolCardNameRow}>
                    <Text style={styles.poolName} numberOfLines={1}>
                      Öncelikli Kaslarım
                    </Text>
                    <View style={[styles.poolBadge, styles.poolBadgePurple]}>
                      <Text style={styles.poolBadgeTextPurple}>
                        {selectedMuscles.length} / 3 Seçildi
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.poolSubtitle} numberOfLines={1}>
                    {selectedMuscles.length > 0
                      ? 'Eşit hipertrofi hacmi uygulanır'
                      : 'Henüz hedef kas seçilmedi'}
                  </Text>
                </View>
              </View>

              {/* Kart Gövdesi: Tek Birleştirilmiş Konteyner */}
              <View style={styles.poolCardBody}>
                {selectedMuscles.length > 0 ? (
                  <ScrollView
                    style={styles.categoryScroll}
                    contentContainerStyle={styles.categoryScrollContent}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled
                  >
                    <View style={styles.categoryGroupBlock}>
                      <View style={styles.categoryGroupHeader}>
                        <View style={styles.categoryTitleRow}>
                          <ZapIcon size={14} color={colors.emeraldLight} />
                          <Text style={styles.categoryTitleText}>Aktif Hedef Kas Kadrosu</Text>
                        </View>
                        <Text style={styles.categoryItemCount}>
                          {selectedMuscles.length} Kas
                        </Text>
                      </View>

                      <View style={styles.categoryDashedLine} />

                      {/* Seçilen Kaslar Alt Alta Sıralanır (Maks 3, x silme butonu kaldırıldı) */}
                      <View style={styles.activeGoalsVerticalList}>
                        {selectedMuscles.map((muscleId, index) => {
                          const label = muscleLabelMap.get(muscleId) || muscleId;
                          const catalogItem = muscles.find((m) => m.id === muscleId);
                          const group = catalogItem?.ui_group || 'Hedef';

                          return (
                            <View key={muscleId} style={styles.activeGoalVerticalRow}>
                              <View style={styles.activeGoalRankPill}>
                                <Text style={styles.activeGoalRankText}>#{index + 1}</Text>
                              </View>

                              <View style={styles.activeGoalTextCol}>
                                <Text style={styles.activeGoalLabelText} numberOfLines={1}>
                                  {label}
                                </Text>
                                <Text style={styles.activeGoalSubText} numberOfLines={1}>
                                  {group} Grubu
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    {/* Odak Açıklaması */}
                    <View style={styles.poolCardMiniNote}>
                      <Text style={styles.poolCardMiniNoteText}>
                        ⚡ Motor bu kasları haftalık split planında ilk sıralara yerleştirir ve set sayısını artırır.
                      </Text>
                    </View>
                  </ScrollView>
                ) : (
                  <View style={styles.emptyPoolBox}>
                    <TargetBullseyeIcon size={28} color={colors.textDim} />
                    <Text style={styles.emptyPoolTitle}>Henüz Hedef Kas Belirlenmedi</Text>
                    <Text style={styles.emptyPoolDesc}>
                      &quot;Hedefleri Düzenle&quot; butonuna dokunarak veya yandaki hazır şablonları kullanarak en fazla 3 kas seçebilirsin.
                    </Text>
                  </View>
                )}
              </View>

              {/* Kart Altı Aksiyonları (Sıfırla butonu kaldırıldı) */}
              <View style={styles.poolCardActions}>
                <TouchableOpacity
                  style={styles.actionBtnEditNeon}
                  onPress={openEditBottomSheet}
                  activeOpacity={0.8}
                >
                  <EditIcon size={14} color={colors.emeraldLight} />
                  <Text style={styles.actionBtnEditNeonText}>Hedefleri Düzenle</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── KART 2: Popüler Odak Şablonları ── */}
            <View style={styles.poolCard}>
              <View style={styles.poolCardHeader}>
                <View style={[styles.poolIconBadge, { backgroundColor: colors.amberBg, borderColor: colors.amberBorder }]}>
                  <SparklesIcon size={20} color={colors.amberLight} />
                </View>

                <View style={styles.poolCardTitleCol}>
                  <View style={styles.poolCardNameRow}>
                    <Text style={styles.poolName} numberOfLines={1}>
                      Popüler Odak Şablonları
                    </Text>
                    <View style={[styles.poolBadge, { backgroundColor: colors.amberBg, borderColor: colors.amberBorder }]}>
                      <Text style={[styles.poolBadgeText, { color: colors.amberLight }]}>
                        3 Şablon
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.poolSubtitle} numberOfLines={1}>
                    Kanıtlanmış hipertrofi kombinasyonları
                  </Text>
                </View>
              </View>

              <View style={styles.poolCardBody}>
                <ScrollView
                  style={styles.categoryScroll}
                  contentContainerStyle={styles.categoryScrollContent}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled
                >
                  {PRESET_GOAL_TEMPLATES.map((tpl) => {
                    const isApplied =
                      tpl.muscles.length === selectedMuscles.length &&
                      tpl.muscles.every((mId) => selectedMuscles.includes(mId));

                    return (
                      <TouchableOpacity
                        key={tpl.id}
                        style={[
                          styles.presetTemplateCard,
                          isApplied && styles.presetTemplateCardApplied,
                        ]}
                        onPress={() => applyPresetTemplate(tpl.muscles)}
                        activeOpacity={0.7}
                      >
                        {/* Şablon Başlık Satırı */}
                        <View style={styles.presetTopRow}>
                          <View style={styles.presetTitleWithIcon}>
                            <View
                              style={[
                                styles.presetIconPill,
                                {
                                  backgroundColor: isApplied ? colors.emeraldBg : tpl.accentBg,
                                  borderColor: isApplied ? colors.emeraldBorder : tpl.accentBorder,
                                },
                              ]}
                            >
                              <MuscleTemplateIcon
                                id={tpl.id}
                                size={14}
                                color={isApplied ? colors.emeraldLight : tpl.accentColor}
                              />
                            </View>
                            <View style={styles.presetTitleCol}>
                              <Text style={styles.presetTitle}>{tpl.title}</Text>
                              <Text style={styles.presetSubtitle}>{tpl.subtitle}</Text>
                            </View>
                          </View>

                          {isApplied ? (
                            <View style={styles.presetAppliedBadge}>
                              <CheckIcon size={11} color={colors.emeraldLight} />
                              <Text style={styles.presetAppliedBadgeText}>Uygulandı</Text>
                            </View>
                          ) : (
                            <View
                              style={[
                                styles.presetBadge,
                                {
                                  backgroundColor: tpl.accentBg,
                                  borderColor: tpl.accentBorder,
                                },
                              ]}
                            >
                              <Text style={[styles.presetBadgeText, { color: tpl.accentColor }]}>
                                {tpl.badge}
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Açıklama */}
                        <Text style={styles.presetDesc}>{tpl.desc}</Text>

                        {/* Kas Etiketleri */}
                        <View style={styles.presetMusclesRow}>
                          {tpl.muscles.map((mId) => {
                            const isSelected = selectedMuscles.includes(mId);
                            return (
                              <View
                                key={mId}
                                style={[
                                  styles.presetMusclePill,
                                  isSelected && styles.presetMusclePillActive,
                                ]}
                              >
                                <View
                                  style={[
                                    styles.presetMuscleDot,
                                    {
                                      backgroundColor: isSelected
                                        ? colors.emeraldLight
                                        : colors.textDim,
                                    },
                                  ]}
                                />
                                <Text
                                  style={[
                                    styles.presetMusclePillText,
                                    isSelected && styles.presetMusclePillTextActive,
                                  ]}
                                >
                                  {muscleLabelMap.get(mId) || mId}
                                </Text>
                              </View>
                            );
                          })}
                        </View>

                        {/* Alt Uygula / Durum Şeridi */}
                        <View style={styles.presetActionRow}>
                          {isApplied ? (
                            <View style={styles.presetAppliedFooter}>
                              <Text style={styles.presetAppliedFooterText}>
                                ✓ Bu şablon aktif hedef kadrosunda
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.presetApplyBtn}>
                              <ZapIcon size={12} color={tpl.accentColor} />
                              <Text style={[styles.presetApplyBtnText, { color: tpl.accentColor }]}>
                                Şablonu Uygula
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.poolCardActions}>
                <Text style={styles.presetFooterHint}>
                  💡 Şablona dokunarak 3 kası tek tıkla öncelikli kadroya alabilirsin.
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Sayfalama Noktaları (Pagination Dots - 2 Kart) */}
          <View style={styles.paginationDotsRow}>
            {[0, 1].map((idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activeCardIndex === idx ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* ─── ALTTAN AÇILAN HEDEF DÜZENLEME MODALI ─── */}
      <GoalPreferencesBottomSheet
        key={modalKey}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
        isSaving={isSaving}
        initialMuscles={selectedMuscles}
        catalogMuscles={muscles}
        muscleLabelMap={muscleLabelMap}
      />
    </SafeAreaView>
  );
}

// ─── Modal Stilleri (equipment.tsx & gyms.tsx ile Birebir) ───
const modalStyles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  modalSheet: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopColor: colors.purpleLight,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetBottomExtension: {
    position: 'absolute',
    bottom: -1000,
    left: -1.5,
    right: -1.5,
    height: 1000,
    backgroundColor: '#0C101C',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  dragZone: {
    paddingBottom: 4,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purpleLight,
    shadowColor: colors.purpleLight,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 3,
  },
  modalCountBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  modalCountBadgeFull: {
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
  },
  modalCountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.purpleLight,
  },
  modalCountBadgeTextFull: {
    color: colors.emeraldLight,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    paddingVertical: 10,
    gap: 12,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 10,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 2,
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  clearBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  clearBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  groupBlock: {
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  groupTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupBlockTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
  },
  groupBlockCount: {
    fontSize: 11,
    color: colors.textDim,
  },
  groupItemsList: {
    padding: 6,
    gap: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    marginBottom: 3,
  },
  switchTextCol: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  switchItemLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  switchItemStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusActive: {
    color: colors.emeraldLight,
  },
  statusInactive: {
    color: colors.textDim,
  },
  modalActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  neonCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.40)',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FB7185',
    letterSpacing: 0.3,
  },
  neonSaveBtn: {
    flex: 1.3,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4,
  },
  neonSaveBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.3,
  },
});

// ─── Ana Ekran Stilleri ───
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
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },

  // ─── Hero Kartı (gyms & equipment standardı) ───
  heroCard: {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 4,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  heroTitleCol: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  heroDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 12,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  heroStatItem: {
    flex: 1,
    paddingHorizontal: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  heroStatLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  heroStatContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStatValueText: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.text,
  },
  heroStatUnitText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  tipBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
  },
  tipText: {
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 16.5,
  },
  tipBold: {
    color: colors.purpleLight,
    fontWeight: '700',
  },

  // ─── Carousel Bölümü ───
  carouselSection: {
    gap: 12,
  },
  carouselHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  carouselHeaderTitleCol: {
    flex: 1,
    gap: 2,
    paddingRight: 8,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  carouselSubtitle: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  carouselCounterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  carouselCounterBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
  },
  horizontalScrollContent: {
    paddingHorizontal: 2,
    gap: CARD_GAP,
    paddingBottom: 4,
  },

  // ─── Carousel Kart Tasarımı ───
  poolCard: {
    width: CARD_WIDTH,
    height: 385,
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.cardBorder,
    padding: 14,
    justifyContent: 'space-between',
  },
  poolCardCustomActive: {
    borderColor: colors.purpleBorder,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 3,
  },
  poolCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  poolIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  poolIconBadgeActive: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleBorder,
  },
  poolCardTitleCol: {
    flex: 1,
    gap: 2,
  },
  poolCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  poolName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  poolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  poolBadgePurple: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleBorder,
  },
  poolBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  poolBadgeTextPurple: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.purpleLight,
  },
  poolSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  poolCardBody: {
    flex: 1,
    marginVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 10,
    overflow: 'hidden',
  },
  categoryScroll: {
    flex: 1,
  },
  categoryScrollContent: {
    paddingBottom: 6,
    gap: 10,
  },
  categoryGroupBlock: {
    gap: 4,
  },
  categoryGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTitleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.2,
  },
  categoryItemCount: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  categoryDashedLine: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    marginBottom: 7,
    marginTop: 2,
  },
  activeGoalsVerticalList: {
    gap: 8,
    marginVertical: 4,
  },
  activeGoalVerticalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeGoalRankPill: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: colors.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeGoalRankText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.purpleLight,
  },
  activeGoalTextCol: {
    flex: 1,
    gap: 1.5,
  },
  activeGoalLabelText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  activeGoalSubText: {
    fontSize: 10.5,
    color: colors.textDim,
    fontWeight: '500',
  },
  poolCardMiniNote: {
    marginTop: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  poolCardMiniNoteText: {
    fontSize: 11,
    color: colors.textDim,
    lineHeight: 15,
  },
  emptyPoolBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 8,
  },
  emptyPoolTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  emptyPoolDesc: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },
  poolCardActions: {
    paddingTop: 4,
  },
  actionBtnEditNeon: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.40)',
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  actionBtnEditNeonText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: colors.emeraldLight,
    letterSpacing: 0.2,
  },

  // Şablon Kartı Stilleri (Cyber Dark Neon Revizyonu)
  presetTemplateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.025)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 14,
    padding: 11,
    gap: 7,
    marginBottom: 4,
  },
  presetTemplateCardApplied: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  presetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  presetTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  presetIconPill: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  presetTitleCol: {
    flex: 1,
    gap: 1,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.1,
  },
  presetSubtitle: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textDim,
  },
  presetBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    flexShrink: 0,
  },
  presetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  presetAppliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  presetAppliedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.emeraldLight,
  },
  presetDesc: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15.5,
  },
  presetMusclesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  presetMusclePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  presetMusclePillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  presetMuscleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  presetMusclePillText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '600',
  },
  presetMusclePillTextActive: {
    color: colors.emeraldLight,
    fontWeight: '700',
  },
  presetActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  presetAppliedFooter: {
    flex: 1,
  },
  presetAppliedFooterText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  presetApplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  presetApplyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  presetFooterHint: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
  },

  // Pagination Dots
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 2,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  activeDot: {
    width: 18,
    backgroundColor: colors.purpleLight,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
