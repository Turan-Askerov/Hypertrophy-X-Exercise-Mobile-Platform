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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useExpertData } from '@/hooks/use-expert';
import { ModernSwitch } from '@/components/ui/modern-switch';
import type { Gym, GymEquipmentCatalogItem } from '@/types/expert';

// ─── Cyber Dark Renk Paleti ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
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

  // Emerald / Yeşil
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',

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
const CARD_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.85), 330);
const CARD_GAP = 12;

// ─── İkonlar ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function PlusIcon({ color = colors.cyanLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function BuildingIcon({ color = colors.cyan, size = 22 }: { color?: string; size?: number }) {
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

function DumbbellIcon({ color = colors.purpleLight, size = 22 }: { color?: string; size?: number }) {
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

function WeightsIcon({ color = colors.cyanLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M4 10h2v4H4v-4zM18 10h2v4h-2v-4zM6 11h12v2H6v-2zM2 11h2v2H2v-2zM20 11h2v2h-2v-2z"
      />
    </Svg>
  );
}

function StarIcon({ color = colors.emeraldLight, size = 14 }: { color?: string; size?: number }) {
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

function CheckIcon({ color = colors.emeraldLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 6L9 17l-5-5" />
    </Svg>
  );
}

function EditIcon({ color = colors.purpleLight, size = 15 }: { color?: string; size?: number }) {
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

function TrashIcon({ color = colors.danger, size = 15 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </Svg>
  );
}

// ─── Sürüklenebilir & Modern Alttan Çıkan Salon Formu Panosu ───
interface GymFormBottomSheetProps {
  visible: boolean;
  editingGym: Gym | null;
  catalogEquipment: GymEquipmentCatalogItem[];
  groupedEquipment: Record<string, GymEquipmentCatalogItem[]>;
  gymCount: number;
  onClose: () => void;
  onSave: (data: { name: string; equipment: string[]; is_default: boolean }) => Promise<void>;
  isSaving: boolean;
}

function GymFormBottomSheet({
  visible,
  editingGym,
  catalogEquipment,
  groupedEquipment,
  gymCount,
  onClose,
  onSave,
  isSaving,
}: GymFormBottomSheetProps) {
  const estimatedSheetHeight = 650;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  // Form State'leri
  const [gymName, setGymName] = useState(editingGym ? editingGym.name : '');
  const [isDefault, setIsDefault] = useState(
    editingGym ? editingGym.is_default : gymCount === 0
  );
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(
    editingGym ? [...editingGym.equipment] : catalogEquipment.map((e) => e.id)
  );
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

  // PanResponder ile aşağı sürükleyerek kapatma
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
    const trimmed = gymName.trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      setFormError('Salon adı 2 ile 20 karakter arasında olmalıdır.');
      return;
    }

    try {
      await onSave({
        name: trimmed,
        equipment: selectedEquipment,
        is_default: isDefault,
      });
      closeSheet();
    } catch (err: any) {
      setFormError(err?.message || 'Salon kaydedilirken bir hata oluştu.');
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
          {/* Sürükleme Tutamaç Alanı (PanResponder buraya bağlıdır) */}
          <View {...panResponder.panHandlers} style={modalStyles.dragZone}>
            <View style={modalStyles.modalHandle} />
            <View style={modalStyles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={modalStyles.modalTitle}>
                  {editingGym ? 'Salon Kaydını Düzenle' : 'Yeni Salon Ekle'}
                </Text>
                <Text style={modalStyles.modalDesc}>
                  Salondaki ekipman ve istasyon olanaklarını yapılandırın.
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

            {/* Salon Adı */}
            <View style={modalStyles.fieldGroup}>
              <Text style={modalStyles.fieldLabel}>SALON ADI</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Örn: BESYO, MacFit, Ev..."
                placeholderTextColor={colors.textDim}
                value={gymName}
                onChangeText={(val) => {
                  setGymName(val);
                  if (formError) setFormError(null);
                }}
                maxLength={20}
                selectionColor={colors.purple}
              />
            </View>

            {/* Varsayılan Yap Switch (Modern Animasyonlu) */}
            <View style={modalStyles.switchCard}>
              <View style={modalStyles.switchInfo}>
                <Text style={modalStyles.switchTitle}>Varsayılan Antrenman Merkezi</Text>
                <Text style={modalStyles.switchSubtitle}>
                  Program taslaklarında öncelikli olarak bu salonun imkânları kullanılır.
                </Text>
              </View>
              <ModernSwitch value={isDefault} onValueChange={setIsDefault} />
            </View>

            {/* Ekipman Seçimi (Modern Yeşil Anahtarlar ile) */}
            <View style={modalStyles.equipmentSection}>
              <View style={modalStyles.equipmentSectionHeader}>
                <Text style={modalStyles.equipmentSectionTitle}>
                  SALONDA BULUNAN MAKİNE VE İSTASYONLAR ({selectedEquipment.length})
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
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Diğer Sayfaların Panosuyla Birebir Butonlar (Profile / Units Standardı) */}
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
                  <CheckIcon size={16} color="#10B981" />
                  <Text style={modalStyles.neonSaveBtnText}>
                    {editingGym ? 'Salonu Güncelle' : 'Salonu Kaydet'}
                  </Text>
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

export default function GymsScreen() {
  const router = useRouter();
  const {
    expertData,
    isLoading,
    isRefetching,
    refetch,
    createGymMutation,
    updateGymMutation,
    deleteGymMutation,
  } = useExpertData();

  const gyms = expertData?.gyms || [];
  const defaultGym = gyms.find((g) => g.is_default);
  const catalogEquipment = useMemo(
    () => expertData?.catalog?.gym_equipment || [],
    [expertData?.catalog?.gym_equipment]
  );

  // ID -> Label Sözlüğü
  const equipmentLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    catalogEquipment.forEach((item) => {
      map.set(item.id, item.label);
    });
    return map;
  }, [catalogEquipment]);

  // Gruplandırılmış Ekipman Kataloğu (Form için)
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

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [activeGymIndex, setActiveGymIndex] = useState(0);

  const openAddModal = () => {
    setEditingGym(null);
    setModalKey((prev) => prev + 1);
    setModalVisible(true);
  };

  const openEditModal = (gym: Gym) => {
    setEditingGym(gym);
    setModalKey((prev) => prev + 1);
    setModalVisible(true);
  };

  const handleModalSave = async (data: {
    name: string;
    equipment: string[];
    is_default: boolean;
  }) => {
    if (editingGym) {
      await updateGymMutation.mutateAsync({
        gymId: editingGym.id,
        data,
      });
    } else {
      await createGymMutation.mutateAsync(data);
    }
  };

  const handleDeleteGym = (gym: Gym) => {
    Alert.alert(
      'Salonu Sil',
      `"${gym.name}" salonunu silmek istediğine emin misin?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGymMutation.mutateAsync(gym.id);
            } catch (err: any) {
              Alert.alert('Hata', err?.message || 'Salon silinemedi.');
            }
          },
        },
      ]
    );
  };

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

        <Text style={styles.headerTitle}>Kayıtlı Salonlar</Text>

        <View style={styles.headerRightSpacer} />
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
        {/* ─── 1. SALON VE EKİPMAN KAYNAKLARI HERO KARTI (Hesap ve Güvenlik Sayfası Standardı) ─── */}
        <View style={styles.heroCard}>
          {/* Kart Üst Bilgisi: Sol İkon, Orta Başlık & Açıklama, Sağ Üst Rozet */}
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconWrap}>
              <DumbbellIcon size={26} color={colors.purpleLight} />
            </View>

            <View style={styles.heroTitleCol}>
              <Text style={styles.heroTitle}>Salon ve Ekipman Kaynakları</Text>
              <Text style={styles.heroDesc}>
                Varsayılan salon, antrenman motorunun birincil ekipman kaynağıdır.
              </Text>
            </View>

            {/* Kartın Sağ Üst Köşesindeki Rozet */}
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{gyms.length} Salon</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* 3'lü İstatistik Alanı (Hesap ve Güvenlik heroStatsRow Standardı) */}
          <View style={styles.heroStatsRow}>
            {/* 1. TOPLAM SALON */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>TOPLAM</Text>
              <View style={styles.heroStatContentRow}>
                <BuildingIcon size={20} color={colors.purpleLight} />
                <Text style={styles.heroStatValueText}>
                  {gyms.length} <Text style={styles.heroStatUnitText}>mekân</Text>
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
                    !defaultGym && styles.heroStatValueDim,
                  ]}
                  numberOfLines={1}
                >
                  {defaultGym?.name || 'Seçilmedi'}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 3. EKİPMAN HAVUZU */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>Toplam</Text>
              <View style={styles.heroStatContentRow}>
                <WeightsIcon size={19} color={colors.cyanLight} />
                <Text style={[styles.heroStatValueText, { color: colors.cyanLight }]}>
                  {defaultGym ? defaultGym.equipment.length : 0}{' '}
                  <Text style={styles.heroStatUnitText}>ekipman</Text>
                </Text>
              </View>
            </View>
          </View>

          {/* Bilgi / İpucu Şeridi */}
          <View style={styles.tipBanner}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>💡 Salon Yönetimi: </Text>
              Bir salonu varsayılan yapmak için &quot;Düzenle&quot; butonuna dokunup varsayılan
              anahtarını açabilirsin. Programın bu salona göre optimize edilir.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Salonlar yükleniyor...</Text>
          </View>
        ) : gyms.length === 0 ? (
          /* Boş Durum */
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Kayıtlı Salon Bulunmuyor</Text>
            <Text style={styles.emptyDesc}>
              Antrenman yaptığın salonu veya ev imkanlarını ekleyerek başla.
            </Text>
            <TouchableOpacity style={styles.emptyAddBtn} onPress={openAddModal} activeOpacity={0.8}>
              <PlusIcon size={18} color="#FFFFFF" />
              <Text style={styles.emptyAddBtnText}>Yeni Salon Ekle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Yana Kaydırılabilir Salon Kartları (Horizontal Carousel) */
          <View style={styles.carouselSection}>
            <View style={styles.carouselHeaderRow}>
              <View style={styles.carouselHeaderTitleCol}>
                <Text style={styles.carouselTitle}>Kayıtlı Salonlar</Text>
                <Text style={styles.carouselSubtitle}>
                  Yana kaydırarak salonları ve ekipmanlarını görüntüle
                </Text>
              </View>

              <View style={styles.carouselCounterBadge}>
                <Text style={styles.carouselCounterBadgeText}>
                  {Math.min(activeGymIndex + 1, gyms.length)} / {gyms.length}
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
                if (index >= 0 && index < gyms.length && index !== activeGymIndex) {
                  setActiveGymIndex(index);
                }
              }}
              scrollEventThrottle={16}
            >
              {gyms.map((gym) => {
                const eqCount = gym.equipment.length;
                const isDefaultGym = gym.is_default;

                return (
                  <View
                    key={gym.id}
                    style={[
                      styles.gymCard,
                      isDefaultGym && styles.gymCardDefault,
                    ]}
                  >
                    {/* Kart Üst Bilgisi */}
                    <View style={styles.gymCardHeader}>
                      <View
                        style={[
                          styles.gymIconBadge,
                          isDefaultGym && styles.gymIconBadgeDefault,
                        ]}
                      >
                        <BuildingIcon
                          size={18}
                          color={isDefaultGym ? colors.emeraldLight : colors.purpleLight}
                        />
                      </View>

                      <View style={styles.gymCardTitleCol}>
                        <View style={styles.gymCardNameRow}>
                          <Text style={styles.gymName} numberOfLines={1}>
                            {gym.name}
                          </Text>

                          {/* Sağ Üst: YALNIZCA Varsayılan Salon ise Rozet Göster */}
                          {isDefaultGym && (
                            <View style={styles.defaultBadge}>
                              <StarIcon size={10} color={colors.emeraldLight} />
                              <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.gymSub} numberOfLines={1}>
                          {isDefaultGym ? 'Varsayılan Antrenman Merkezi' : 'Kayıtlı Salon'}
                        </Text>
                      </View>
                    </View>

                    {/* Ekipman Sayısı & İnce Çip Listesi */}
                    <View style={styles.equipmentMetaRow}>
                      <Text style={styles.equipmentMetaText}>
                        ✓ {eqCount} Ekipman Tanımlı
                      </Text>
                      <Text style={styles.equipmentMetaSub}>Makine & İstasyon</Text>
                    </View>

                    {/* Çipler Alanı — Tüm Ekipman Listesi */}
                    <View style={styles.chipsContainer}>
                      <ScrollView
                        nestedScrollEnabled
                        showsVerticalScrollIndicator={false}
                        style={styles.chipsScrollView}
                        contentContainerStyle={styles.chipsWrap}
                      >
                        {gym.equipment.length === 0 ? (
                          <Text style={styles.noChipsText}>Ekipman tanımlanmamış</Text>
                        ) : (
                          gym.equipment.map((eqId) => (
                            <View key={eqId} style={styles.eqChip}>
                              <Text style={styles.eqChipText} numberOfLines={1}>
                                {equipmentLabelMap.get(eqId) || eqId}
                              </Text>
                            </View>
                          ))
                        )}
                      </ScrollView>
                    </View>

                    {/* Eylemler (Tüm Kartlarda Standart: Düzenle & Sil) */}
                    <View style={styles.gymCardActions}>
                      <View style={styles.actionBtnRow}>
                        <TouchableOpacity
                          style={styles.actionBtnEdit}
                          onPress={() => openEditModal(gym)}
                          activeOpacity={0.7}
                        >
                          <EditIcon size={14} color={colors.purpleLight} />
                          <Text style={styles.actionBtnEditText}>Düzenle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionBtnDelete}
                          onPress={() => handleDeleteGym(gym)}
                          activeOpacity={0.7}
                        >
                          <TrashIcon size={14} color={colors.danger} />
                          <Text style={styles.actionBtnDeleteText}>Sil</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}

              {/* En Sağda Yeni Salon Ekle Kartı */}
              <TouchableOpacity
                style={styles.addGymCard}
                onPress={openAddModal}
                activeOpacity={0.75}
              >
                <View style={styles.addGymIconCircle}>
                  <PlusIcon size={24} color={colors.purpleLight} />
                </View>
                <Text style={styles.addGymTitle}>Yeni Salon Ekle</Text>
                <Text style={styles.addGymDesc}>
                  Farklı bir salon veya ev istasyonu tanımla
                </Text>
                <View style={styles.addGymActionBtn}>
                  <Text style={styles.addGymActionBtnText}>+ Salon Ekle</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            {/* Sayfalama Noktaları (Pagination Dots) */}
            {gyms.length > 1 && (
              <View style={styles.paginationDotsContainer}>
                {gyms.map((_, dotIdx) => (
                  <View
                    key={dotIdx}
                    style={[
                      styles.paginationDot,
                      activeGymIndex === dotIdx && styles.paginationDotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Sürüklenerek Kapatılabilen Bottom Sheet Panosu */}
      <GymFormBottomSheet
        key={modalKey}
        visible={modalVisible}
        editingGym={editingGym}
        catalogEquipment={catalogEquipment}
        groupedEquipment={groupedEquipment}
        gymCount={gyms.length}
        onClose={() => setModalVisible(false)}
        onSave={handleModalSave}
        isSaving={createGymMutation.isPending || updateGymMutation.isPending}
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
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerRightSpacer: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
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
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  heroTitleCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingRight: 4,
  },
  heroTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  heroDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16.5,
  },
  heroBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
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
    marginVertical: 14,
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
  emptyCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  emptyAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  carouselSection: {
    marginHorizontal: -16,
    gap: 10,
  },
  carouselHeaderRow: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  carouselHeaderTitleCol: {
    gap: 2,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  carouselSubtitle: {
    fontSize: 12,
    color: colors.textDim,
  },
  carouselCounterBadge: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  carouselCounterBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
    paddingBottom: 6,
  },
  gymCard: {
    width: CARD_WIDTH,
    height: 340,
    backgroundColor: colors.cardBg,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: colors.cardBorder,
    padding: 16,
    justifyContent: 'space-between',
    gap: 12,
  },
  gymCardDefault: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: '#0C1520',
  },
  gymCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gymIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  gymIconBadgeDefault: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  gymCardTitleCol: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  gymCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  gymName: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  gymSub: {
    fontSize: 11.5,
    color: colors.textDim,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 3.5,
    flexShrink: 0,
  },
  defaultBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  equipmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  equipmentMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  equipmentMetaSub: {
    fontSize: 11,
    color: colors.textDim,
  },
  chipsContainer: {
    flex: 1,
    minHeight: 120,
    maxHeight: 160,
  },
  chipsScrollView: {
    flex: 1,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: 4,
  },
  noChipsText: {
    fontSize: 12,
    color: colors.textDim,
    fontStyle: 'italic',
  },
  eqChip: {
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eqChipText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gymCardActions: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtnEdit: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    borderRadius: 9,
    gap: 5,
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  actionBtnDelete: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 9,
    gap: 5,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  addGymCard: {
    width: CARD_WIDTH,
    height: 340,
    backgroundColor: 'rgba(16, 21, 36, 0.5)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  addGymIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addGymTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  addGymDesc: {
    fontSize: 12,
    color: colors.textDim,
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 220,
  },
  addGymActionBtn: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  addGymActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  paginationDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 4,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  paginationDotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purpleLight,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3,
  },
});

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
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  switchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  switchInfo: {
    flex: 1,
    gap: 3,
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  switchSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
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
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.35)',
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
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  neonSaveBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.3,
  },
});
