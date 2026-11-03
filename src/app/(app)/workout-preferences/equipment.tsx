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
import Svg, { Path } from 'react-native-svg';

import { ModernSwitch } from '@/components/ui/modern-switch';
import { useExpertData } from '@/hooks/use-expert';
import type { GymEquipmentCatalogItem } from '@/types/expert';

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
  amberBg: 'rgba(245, 158, 11, 0.14)',
  amberBorder: 'rgba(245, 158, 11, 0.35)',

  // Rose / Kırmızı
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.86), 336);
const CARD_GAP = 12;

// ─── İkonlar ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
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

function CheckIcon({ color = '#FFFFFF', size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function ResetIcon({ color = colors.textMuted, size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M3 21v-5h5"
      />
    </Svg>
  );
}

function BuildingIcon({ color = colors.cyan, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 21h18M3 7v14M21 7v14M9 21V11M15 21V11M9 7h6M12 3l9 4H3l9-4z"
      />
    </Svg>
  );
}

function DumbbellIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"
      />
    </Svg>
  );
}

function StarIcon({ color = colors.emeraldLight, size = 11 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
    </Svg>
  );
}

function TuneControlsIcon({ color = colors.purpleLight, size = 26 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeWidth="2.2" d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
      <Path strokeLinecap="round" strokeWidth="2.2" d="M1 14h6M9 8h6M17 16h6" />
    </Svg>
  );
}

function LayersIcon({ color = colors.purpleLight, size = 19 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
      />
    </Svg>
  );
}

function WeightsIcon({ color = colors.cyanLight, size = 19 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 10v4M21 10v4M6 7v10M18 7v10M6 12h12"
      />
    </Svg>
  );
}

// ─── Ekipman ID'lerini Kategorilere Göre Gruplama Yardımcısı ───
function groupEquipmentIds(
  equipmentIds: string[],
  equipmentMap: Map<string, GymEquipmentCatalogItem>
): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  equipmentIds.forEach((id) => {
    const item = equipmentMap.get(id);
    const groupName = item?.group || 'Diğer Ekipmanlar';
    const label = item?.label || id;
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(label);
  });
  // İsimleri alfabetik sırala
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.localeCompare(b, 'tr'));
  });
  return groups;
}

// ─── ALTTAN ÇIKAN DÜZENLEME PANOSU (Kayıtlı Salonlar Standardı) ───
interface EquipmentPreferencesBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSave: (equipmentIds: string[]) => Promise<void>;
  isSaving: boolean;
  initialEquipment: string[];
  catalogEquipment: GymEquipmentCatalogItem[];
  groupedEquipment: Record<string, GymEquipmentCatalogItem[]>;
}

function EquipmentPreferencesBottomSheet({
  visible,
  onClose,
  onSave,
  isSaving,
  initialEquipment,
  catalogEquipment,
  groupedEquipment,
}: EquipmentPreferencesBottomSheetProps) {
  const estimatedSheetHeight = 650;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  // Form State
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(initialEquipment);
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

  const toggleEquipmentItem = (id: string) => {
    setSelectedEquipment((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllEquipment = () => {
    setSelectedEquipment(catalogEquipment.map((e) => e.id));
  };

  const clearAllEquipment = () => {
    setSelectedEquipment([]);
  };

  const handleSubmit = async () => {
    try {
      await onSave(selectedEquipment);
      closeSheet();
    } catch (err: any) {
      setFormError(err?.message || 'Tercihler kaydedilirken bir hata oluştu.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
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
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.modalTitle}>Özel Ekipman Tercihlerini Düzenle</Text>
                <Text style={modalStyles.modalDesc}>
                  Yalnızca salonunun sunduğu veya programında yer almasını istediğin ekipmanları seçin.
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
                <Text style={modalStyles.errorText}>{formError}</Text>
              </View>
            )}

            {/* Ekipman Seçimi */}
            <View style={modalStyles.equipmentSection}>
              <View style={modalStyles.equipmentSectionHeader}>
                <Text style={modalStyles.equipmentSectionTitle}>
                  TERCİH EDİLEN MAKİNE VE İSTASYONLAR ({selectedEquipment.length})
                </Text>
                <View style={modalStyles.batchActionRow}>
                  <TouchableOpacity
                    onPress={selectAllEquipment}
                    style={modalStyles.batchBtn}
                    hitSlop={6}
                  >
                    <Text style={modalStyles.batchBtnText}>Tümünü Seç</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={clearAllEquipment}
                    style={modalStyles.batchBtn}
                    hitSlop={6}
                  >
                    <Text style={modalStyles.batchBtnText}>Tümünü Kaldır</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {Object.entries(groupedEquipment).map(([groupName, items]) => (
                <View key={groupName} style={modalStyles.groupBlock}>
                  <View style={modalStyles.groupBlockHeader}>
                    <Text style={modalStyles.groupBlockTitle}>{groupName}</Text>
                    <Text style={modalStyles.groupBlockCount}>{items.length} Ekipman</Text>
                  </View>

                  <View style={modalStyles.groupItemsList}>
                    {items.map((item) => {
                      const isChecked = selectedEquipment.includes(item.id);
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
                              {isChecked ? 'Var' : 'Yok'}
                            </Text>
                          </View>

                          {/* Modern Yumuşak Animasyonlu Yeşil Anahtar */}
                          <ModernSwitch
                            value={isChecked}
                            onValueChange={() => toggleEquipmentItem(item.id)}
                            activeColor={colors.emerald}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
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
export default function EquipmentPreferencesScreen() {
  const router = useRouter();
  const { expertData, isLoading, isRefetching, refetch, saveEquipmentMutation } = useExpertData();

  const catalogEquipment = useMemo(
    () => expertData?.catalog?.gym_equipment || [],
    [expertData?.catalog?.gym_equipment]
  );
  const serverPreferred = useMemo(
    () => expertData?.preferred_equipment || [],
    [expertData?.preferred_equipment]
  );
  const hasCustomPrefs = serverPreferred.length > 0;
  const defaultGymName = expertData?.default_gym_name || 'Belirlenmedi';
  const defaultGym = useMemo(
    () => expertData?.gyms?.find((g) => g.is_default),
    [expertData?.gyms]
  );
  const activeEquipmentCount = hasCustomPrefs
    ? serverPreferred.length
    : (defaultGym?.equipment?.length || 0);

  // Bottom Sheet Modal State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  // ID -> Label Haritası
  const equipmentMap = useMemo(() => {
    const map = new Map<string, GymEquipmentCatalogItem>();
    catalogEquipment.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [catalogEquipment]);

  // Gruplandırılmış Ekipman Kataloğu (Modal için)
  const groupedEquipment = useMemo(() => {
    const groups: Record<string, GymEquipmentCatalogItem[]> = {};
    catalogEquipment.forEach((item) => {
      if (!groups[item.group]) {
        groups[item.group] = [];
      }
      groups[item.group].push(item);
    });
    return groups;
  }, [catalogEquipment]);

  // Ekipman Havuzu Kartları (1. Özel Seçim + 2. Kayıtlı Salonlar)
  const equipmentCards = useMemo(() => {
    const list: {
      type: 'custom' | 'gym';
      id: string;
      title: string;
      subtitle: string;
      badgeText?: string;
      isDefaultGym?: boolean;
      isActiveCustom?: boolean;
      equipmentIds: string[];
    }[] = [];

    // 1. Kart: Seçilen Özel Ekipmanlar (Kişisel Havuz)
    list.push({
      type: 'custom',
      id: 'custom-equipment-pool',
      title: 'Özel Ekipman Havuzum',
      subtitle: hasCustomPrefs
        ? 'Kişisel Olarak Belirlenen Ekipmanlar'
        : 'Varsayılan Salon Ekipmanları Kullanılıyor',
      badgeText: hasCustomPrefs ? 'Özel Tercih' : 'Pasif',
      isActiveCustom: hasCustomPrefs,
      equipmentIds: serverPreferred,
    });

    // 2+. Kartlar: Kayıtlı Salonlar
    const sortedGyms = [...(expertData?.gyms || [])].sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.name.localeCompare(b.name, 'tr');
    });

    sortedGyms.forEach((gym) => {
      list.push({
        type: 'gym',
        id: gym.id,
        title: gym.name,
        subtitle: gym.is_default ? 'Varsayılan Antrenman Merkezi' : 'Kayıtlı Salon',
        badgeText: gym.is_default ? 'Varsayılan' : undefined,
        isDefaultGym: gym.is_default,
        equipmentIds: gym.equipment || [],
      });
    });

    return list;
  }, [hasCustomPrefs, serverPreferred, expertData?.gyms]);

  // Düzenleme Başlat (Alttan Çıkan Panoyu Açar)
  const openEditBottomSheet = () => {
    setModalKey((prev) => prev + 1);
    setModalVisible(true);
  };

  // Modaldan Gelen Kaydetme İsteği
  const handleModalSave = async (equipmentIds: string[]) => {
    try {
      await saveEquipmentMutation.mutateAsync({
        preferred_equipment: equipmentIds,
      });
      setModalVisible(false);
      Alert.alert('Başarılı', 'Özel ekipman tercihleriniz kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Ekipman tercihleri kaydedilemedi.');
    }
  };

  // Modala Gönderilecek İlk Değer
  const initialEquipment = useMemo(() => {
    if (serverPreferred.length > 0) {
      return [...serverPreferred];
    }
    const defaultGym = expertData?.gyms?.find((g) => g.is_default);
    if (defaultGym && defaultGym.equipment.length > 0) {
      return [...defaultGym.equipment];
    }
    return catalogEquipment.map((e) => e.id);
  }, [serverPreferred, expertData?.gyms, catalogEquipment]);

  // Seçimleri Sıfırla (Özel tercihi siler, varsayılan salona döner)
  const handleResetToDefaultGym = () => {
    Alert.alert(
      'Seçimleri Sıfırla',
      'Özel ekipman tercihlerini sıfırlayıp varsayılan salonunun olanaklarına dönmek istiyor musun?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            try {
              await saveEquipmentMutation.mutateAsync({
                preferred_equipment: [],
              });
              Alert.alert('Bilgi', 'Özel tercihler sıfırlandı. Artık varsayılan salon kullanılacak.');
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Sıfırlama başarısız.');
            }
          },
        },
      ]
    );
  };

  const isSaving = saveEquipmentMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Üst Başlık Barı (bug-report.tsx standardı) */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <BackIcon size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Ekipman Tercihleri</Text>

        <View style={styles.optionalPill}>
          <Text style={styles.optionalPillText}>İsteğe Bağlı</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
        {/* ─── 1. KİŞİSEL EKİPMAN TERCİHLERİ HERO KARTI (Kayıtlı Salonlar Panosu Standardı) ─── */}
        <View style={styles.heroCard}>
          {/* Kart Üst Bilgisi: Sol İkon (Tune/Sliders), Orta Başlık, Sağ Üst Rozet */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <TuneControlsIcon size={24} color={colors.purpleLight} />
            </View>

            <View style={styles.heroTitleCol}>
              <Text style={styles.heroTitle} numberOfLines={1}>
                Kişisel Ekipman Tercihleri
              </Text>
            </View>

            {/* Kartın Sağ Üst Köşesindeki Rozet */}
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>
                {hasCustomPrefs ? `${serverPreferred.length} Özel Seçili` : 'Varsayılan Aktif'}
              </Text>
            </View>
          </View>

          {/* Açıklama Metni: Kartın tam genişliğini kullanır, sağa ASLA taşma yapmaz */}
          <Text style={styles.heroDesc}>
            Özel seçim yapmazsan varsayılan salon olanakları otomatik temel alınır.
          </Text>

          <View style={styles.heroDivider} />

          {/* 3'lü İstatistik Alanı (Kayıtlı Salonlar Panosu Standardı) */}
          <View style={styles.heroStatsRow}>
            {/* 1. KATALOG (Değiştirilen Kısım: Rakamlı & Çeşit Metrikli) */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>KATALOG</Text>
              <View style={styles.heroStatContentRow}>
                <LayersIcon size={20} color={colors.purpleLight} />
                <Text style={styles.heroStatValueText}>
                  {catalogEquipment.length}{' '}
                  <Text style={styles.heroStatUnitText}>çeşit</Text>
                </Text>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 2. VARSAYILAN SALON */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>VARSAYILAN</Text>
              <View style={styles.heroStatContentRow}>
                <StarIcon size={19} color={colors.emeraldLight} />
                <Text
                  style={[
                    styles.heroStatValueText,
                    { color: colors.emeraldLight, flex: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {defaultGymName}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 3. AKTİF HAVUZ */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>AKTİF HAVUZ</Text>
              <View style={styles.heroStatContentRow}>
                <WeightsIcon size={19} color={colors.cyanLight} />
                <Text style={[styles.heroStatValueText, { color: colors.cyanLight }]}>
                  {activeEquipmentCount}{' '}
                  <Text style={styles.heroStatUnitText}>ekipman</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Bilgi / İpucu Şeridi */}
          <View style={styles.tipBanner}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>💡 Ekipman Kapsamı: </Text>
              Sehpalar ve serbest ağırlıklar her zaman temel kabul edilir. Yalnızca salonunun sunduğu veya antrenmanlarında yer almasını istediğin makineleri belirleyebilirsin.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Ekipman tercihleri yükleniyor...</Text>
          </View>
        ) : (
          /* ───────────── Yana Kaydırılabilir Kartlar (Carousel) ───────────── */
          <View style={styles.carouselSection}>
            <View style={styles.carouselHeaderRow}>
              <View style={styles.carouselHeaderTitleCol}>
                <Text style={styles.carouselTitle}>Ekipman Havuzları</Text>
                <Text style={styles.carouselSubtitle}>
                  Yana kaydırarak özel tercihlerini ve salon olanaklarını görüntüle
                </Text>
              </View>

              <View style={styles.carouselCounterBadge}>
                <Text style={styles.carouselCounterBadgeText}>
                  {Math.min(activeCardIndex + 1, equipmentCards.length)} / {equipmentCards.length}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
              snapToInterval={CARD_WIDTH + CARD_GAP}
              decelerationRate="fast"
              snapToAlignment="start"
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                const index = Math.round(x / (CARD_WIDTH + CARD_GAP));
                if (index >= 0 && index < equipmentCards.length && index !== activeCardIndex) {
                  setActiveCardIndex(index);
                }
              }}
              scrollEventThrottle={16}
            >
              {equipmentCards.map((card) => {
                const eqCount = card.equipmentIds.length;
                const grouped = groupEquipmentIds(card.equipmentIds, equipmentMap);
                const isCustom = card.type === 'custom';

                return (
                  <View
                    key={card.id}
                    style={[
                      styles.poolCard,
                      card.isActiveCustom && styles.poolCardCustomActive,
                      card.isDefaultGym && styles.poolCardDefaultGym,
                    ]}
                  >
                    {/* Kart Üst Başlık & Rozet */}
                    <View style={styles.poolCardHeader}>
                      <View
                        style={[
                          styles.poolIconBadge,
                          card.isActiveCustom && styles.poolIconBadgeActive,
                          card.isDefaultGym && styles.poolIconBadgeDefault,
                        ]}
                      >
                        {isCustom ? (
                          <DumbbellIcon
                            size={18}
                            color={card.isActiveCustom ? colors.purpleLight : colors.textDim}
                          />
                        ) : (
                          <BuildingIcon
                            size={18}
                            color={card.isDefaultGym ? colors.emeraldLight : colors.purpleLight}
                          />
                        )}
                      </View>

                      <View style={styles.poolCardTitleCol}>
                        <View style={styles.poolCardNameRow}>
                          <Text style={styles.poolName} numberOfLines={1}>
                            {card.title}
                          </Text>

                          {card.badgeText && (
                            <View
                              style={[
                                styles.poolBadge,
                                card.isDefaultGym && styles.poolBadgeEmerald,
                                card.isActiveCustom && styles.poolBadgePurple,
                              ]}
                            >
                              {card.isDefaultGym && <StarIcon size={10} color={colors.emeraldLight} />}
                              {card.isActiveCustom && <CheckIcon size={11} color={colors.purpleLight} />}
                              <Text
                                style={[
                                  styles.poolBadgeText,
                                  card.isDefaultGym && styles.poolBadgeTextEmerald,
                                  card.isActiveCustom && styles.poolBadgeTextPurple,
                                ]}
                              >
                                {card.badgeText}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text style={styles.poolSub} numberOfLines={1}>
                          {card.subtitle}
                        </Text>
                      </View>
                    </View>

                    {/* Ekipman Sayısı & Meta */}
                    <View style={styles.equipmentMetaRow}>
                      <Text
                        style={[
                          styles.equipmentMetaText,
                          card.isActiveCustom && { color: colors.purpleLight },
                          card.isDefaultGym && { color: colors.emeraldLight },
                        ]}
                      >
                        ✓ {eqCount} Ekipman Tanımlı
                      </Text>
                      <Text style={styles.equipmentMetaSub}>
                        {isCustom ? 'Kişisel Havuz' : 'Makine & İstasyon'}
                      </Text>
                    </View>

                    {/* Tek Konteyner Altında Toplanan Kategoriler & Çipler */}
                    <View style={styles.chipsContainer}>
                      <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        style={styles.chipsScrollView}
                        contentContainerStyle={styles.chipsContent}
                      >
                        {eqCount === 0 ? (
                          <View style={styles.emptyPoolBox}>
                            <Text style={styles.emptyPoolTitle}>
                              {isCustom ? 'Özel Ekipman Seçilmedi' : 'Ekipman Tanımlanmamış'}
                            </Text>
                            <Text style={styles.emptyPoolDesc}>
                              {isCustom
                                ? 'Varsayılan salon ekipmanları geçerlidir. "Düzenle" butonuna dokunarak kişisel ekipman listesi seçebilirsin.'
                                : 'Bu salona henüz ekipman eklenmemiş.'}
                            </Text>
                          </View>
                        ) : (
                          Object.entries(grouped).map(([categoryName, items], catIdx) => (
                            <View
                              key={categoryName}
                              style={[
                                styles.categorySection,
                                catIdx > 0 && styles.categorySectionMargin,
                              ]}
                            >
                              {/* Alt Başlık: Kategori İsmi */}
                              <View style={styles.categoryHeaderRow}>
                                <View style={styles.categoryDot} />
                                <Text style={styles.categoryTitleText}>{categoryName}</Text>
                                <Text style={styles.categoryItemCount}>({items.length})</Text>
                              </View>

                              {/* ----- Kesikli Çizgi ----- */}
                              <View style={styles.categoryDashedLine} />

                              {/* Başlığa Uygun Çipler */}
                              <View style={styles.categoryChipsWrap}>
                                {items.map((label) => (
                                  <View key={label} style={styles.eqChip}>
                                    <Text style={styles.eqChipText} numberOfLines={1}>
                                      {label}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          ))
                        )}
                      </ScrollView>
                    </View>

                    {/* Kart Alt Aksiyonları (Neon Çerçeveli Yeşil Butonlar ile) */}
                    <View style={styles.poolCardActions}>
                      {isCustom ? (
                        <View style={styles.actionBtnRow}>
                          <TouchableOpacity
                            style={styles.actionBtnEditNeon}
                            onPress={openEditBottomSheet}
                            activeOpacity={0.7}
                          >
                            <EditIcon size={14} color={colors.emeraldLight} />
                            <Text style={styles.actionBtnEditNeonText}>Düzenle</Text>
                          </TouchableOpacity>

                          {hasCustomPrefs && (
                            <TouchableOpacity
                              style={styles.actionBtnReset}
                              onPress={handleResetToDefaultGym}
                              activeOpacity={0.7}
                            >
                              <ResetIcon size={13} color={colors.danger} />
                              <Text style={styles.actionBtnResetText}>Sıfırla</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ) : (
                        <View style={styles.actionBtnRow}>
                          <TouchableOpacity
                            style={styles.actionBtnGym}
                            onPress={() => router.push('/(app)/workout-preferences/gyms')}
                            activeOpacity={0.7}
                          >
                            <BuildingIcon size={14} color={colors.cyanLight} />
                            <Text style={styles.actionBtnGymText}>Salonu Yönet</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Sayfalama Noktaları (Pagination Dots) */}
            {equipmentCards.length > 1 && (
              <View style={styles.paginationDotsRow}>
                {equipmentCards.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activeCardIndex ? styles.activeDotPurple : styles.inactiveDot,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Alttan Çıkan Düzenleme Panosu (Bottom Sheet Modal) */}
      <EquipmentPreferencesBottomSheet
        key={modalKey}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
        isSaving={isSaving}
        initialEquipment={initialEquipment}
        catalogEquipment={catalogEquipment}
        groupedEquipment={groupedEquipment}
      />
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
    paddingBottom: 36,
    gap: 16,
  },

  // ─── Hero Kart: Tercih Durumu ───
  heroCard: {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 6,
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
  heroBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.purpleLight,
    letterSpacing: 0.3,
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
    gap: 7,
  },
  heroStatValueText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: colors.text,
  },
  heroStatUnitText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textDim,
  },
  heroStatValueDim: {
    color: colors.textDim,
  },
  tipBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 14,
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

  // ─── Kart Tasarımı ───
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
  poolCardDefaultGym: {
    borderColor: 'rgba(16, 185, 129, 0.35)',
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
  poolIconBadgeDefault: {
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
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
  poolBadgeEmerald: {
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
  },
  poolBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDim,
  },
  poolBadgeTextPurple: {
    color: colors.purpleLight,
  },
  poolBadgeTextEmerald: {
    color: colors.emeraldLight,
  },
  poolSub: {
    fontSize: 11,
    color: colors.textDim,
  },

  // ─── Ekipman Meta Satırı ───
  equipmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  equipmentMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  equipmentMetaSub: {
    fontSize: 10.5,
    color: colors.textDim,
    fontWeight: '600',
  },

  // ─── Tek Konteyner ve Kategoriler ───
  chipsContainer: {
    flex: 1,
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    overflow: 'hidden',
  },
  chipsScrollView: {
    flex: 1,
  },
  chipsContent: {
    paddingBottom: 6,
  },
  categorySection: {
    width: '100%',
  },
  categorySectionMargin: {
    marginTop: 12,
  },
  categoryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.purpleLight,
  },
  categoryTitleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.2,
  },
  categoryItemCount: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textDim,
  },
  categoryDashedLine: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderStyle: 'dashed',
    marginBottom: 7,
    marginTop: 2,
  },
  categoryChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  eqChip: {
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 7,
  },
  eqChipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  emptyPoolBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 6,
  },
  emptyPoolTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  emptyPoolDesc: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },

  // ─── Kart Alt Eylemleri (Neon Çerçeveli) ───
  poolCardActions: {
    paddingTop: 4,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnEditNeon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.40)',
    paddingVertical: 9,
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
  actionBtnReset: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnResetText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  actionBtnGym: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnGymText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.cyanLight,
  },

  // ─── Sayfalama Noktaları ───
  paginationDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDotPurple: {
    width: 20,
    backgroundColor: colors.purpleLight,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

// ─── ALTTAN ÇIKAN PANO STİLLERİ (gyms.tsx standardı & Neon Butonlar) ───
const modalStyles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
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
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    paddingVertical: 10,
    gap: 14,
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
  equipmentSection: {
    gap: 12,
    marginTop: 4,
  },
  equipmentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  equipmentSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  batchActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  batchBtn: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  batchBtnText: {
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
  groupBlockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  groupBlockCount: {
    fontSize: 10,
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
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  switchTextCol: {
    flex: 1,
    marginRight: 12,
  },
  switchItemLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
  switchItemStatus: {
    fontSize: 10.5,
    marginTop: 2,
  },
  statusActive: {
    color: colors.emeraldLight,
    fontWeight: '700',
  },
  statusInactive: {
    color: colors.textDim,
  },

  // ─── Modal Aksiyon Butonları (Neon Çerçeveli) ───
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
