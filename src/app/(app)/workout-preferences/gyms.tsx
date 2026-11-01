import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useExpertData } from '@/hooks/use-expert';
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

// ─── İkonlar (bug-report.tsx standardı) ───
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

function CloseIcon({ color = colors.textDim, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
    </Svg>
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

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [gymName, setGymName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingGym(null);
    setGymName('');
    setIsDefault(gyms.length === 0);
    // Varsayılan olarak tüm katalogdaki ekipmanları işaretli başlat
    setSelectedEquipment(catalogEquipment.map((e) => e.id));
    setFormError(null);
    setModalVisible(true);
  };

  const openEditModal = (gym: Gym) => {
    setEditingGym(gym);
    setGymName(gym.name);
    setIsDefault(gym.is_default);
    setSelectedEquipment([...gym.equipment]);
    setFormError(null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingGym(null);
    setGymName('');
    setSelectedEquipment([]);
    setFormError(null);
  };

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

  const handleSaveGym = async () => {
    const trimmedName = gymName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 80) {
      setFormError('Salon adı 2 ile 80 karakter arasında olmalıdır.');
      return;
    }

    try {
      if (editingGym) {
        await updateGymMutation.mutateAsync({
          gymId: editingGym.id,
          data: {
            name: trimmedName,
            equipment: selectedEquipment,
            is_default: isDefault,
          },
        });
      } else {
        await createGymMutation.mutateAsync({
          name: trimmedName,
          equipment: selectedEquipment,
          is_default: isDefault,
        });
      }
      closeModal();
    } catch (err: any) {
      setFormError(err?.message || 'Salon kaydedilirken bir hata oluştu.');
    }
  };

  const handleSetDefault = async (gym: Gym) => {
    try {
      await updateGymMutation.mutateAsync({
        gymId: gym.id,
        data: {
          name: gym.name,
          equipment: gym.equipment,
          is_default: true,
        },
      });
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Varsayılan salon ayarlanamadı.');
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

  const isSaving = createGymMutation.isPending || updateGymMutation.isPending;

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

        <TouchableOpacity
          style={styles.headerAddBtn}
          onPress={openAddModal}
          activeOpacity={0.7}
          hitSlop={8}
        >
          <PlusIcon size={18} color={colors.cyanLight} />
          <Text style={styles.headerAddBtnText}>Ekle</Text>
        </TouchableOpacity>
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
        {/* Başlık ve Açıklama Panosu */}
        <View style={styles.subHeaderCard}>
          <Text style={styles.subHeaderTitle}>Salon ve Ekipman Kaynakları</Text>
          <Text style={styles.subHeaderDesc}>
            Varsayılan salon, özel ekipman tercihi belirlenmediğinde antrenman programı motorunun
            birincil ekipman kaynağıdır. Birden fazla salon ekleyip dilediğini varsayılan yapabilirsin.
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.gymCountBadge}>
              <Text style={styles.gymCountBadgeText}>{gyms.length} Kayıtlı Salon</Text>
            </View>
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
          /* Salon Listesi Kartları (Web görseli 2 ile birebir uyumlu) */
          <View style={styles.gymListContainer}>
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
                    <View style={styles.gymCardTitleCol}>
                      <Text style={styles.gymName} numberOfLines={1}>
                        {gym.name}
                      </Text>
                      <Text style={styles.gymSub}>
                        {isDefaultGym ? 'Varsayılan Antrenman Merkezi' : 'Kayıtlı Salon'}
                      </Text>
                    </View>

                    {isDefaultGym && (
                      <View style={styles.defaultBadge}>
                        <StarIcon size={12} color={colors.emeraldLight} />
                        <Text style={styles.defaultBadgeText}>Varsayılan Salon</Text>
                      </View>
                    )}
                  </View>

                  {/* Ekipman Sayısı & İnce Çip Listesi */}
                  <View style={styles.equipmentMetaRow}>
                    <Text style={styles.equipmentMetaText}>
                      ✓ {eqCount} Ekipman Tanımlı
                    </Text>
                    <Text style={styles.equipmentMetaSub}>Makine & İstasyon</Text>
                  </View>

                  <View style={styles.chipsWrap}>
                    {gym.equipment.length === 0 ? (
                      <Text style={styles.noChipsText}>Ekipman tanımlanmamış</Text>
                    ) : (
                      gym.equipment.slice(0, 12).map((eqId) => (
                        <View key={eqId} style={styles.eqChip}>
                          <Text style={styles.eqChipText} numberOfLines={1}>
                            {equipmentLabelMap.get(eqId) || eqId}
                          </Text>
                        </View>
                      ))
                    )}
                    {gym.equipment.length > 12 && (
                      <View style={styles.eqChipMore}>
                        <Text style={styles.eqChipMoreText}>
                          +{gym.equipment.length - 12} diğer
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Eylemler */}
                  <View style={styles.gymCardActions}>
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

                    {!isDefaultGym && (
                      <TouchableOpacity
                        style={styles.actionBtnSetDefault}
                        onPress={() => handleSetDefault(gym)}
                        activeOpacity={0.7}
                      >
                        <StarIcon size={13} color={colors.emeraldLight} />
                        <Text style={styles.actionBtnSetDefaultText}>Varsayılan Yap</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Salon Ekle / Düzenle Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={modalStyles.overlay}
        >
          <View style={modalStyles.modalContainer}>
            {/* Modal Header */}
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>
                {editingGym ? 'Salon Kaydını Düzenle' : 'Yeni Salon Ekle'}
              </Text>
              <TouchableOpacity
                onPress={closeModal}
                style={modalStyles.closeBtn}
                hitSlop={10}
              >
                <CloseIcon size={20} color={colors.textMuted} />
              </TouchableOpacity>
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
                  maxLength={80}
                  selectionColor={colors.purple}
                />
              </View>

              {/* Varsayılan Yap Switch */}
              <View style={modalStyles.switchCard}>
                <View style={modalStyles.switchInfo}>
                  <Text style={modalStyles.switchTitle}>Varsayılan Antrenman Merkezi</Text>
                  <Text style={modalStyles.switchSubtitle}>
                    Program taslaklarında öncelikli olarak bu salonun imkânları kullanılır.
                  </Text>
                </View>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: '#334155', true: colors.emerald }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Ekipman Seçimi */}
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
                          <TouchableOpacity
                            key={item.id}
                            style={[
                              modalStyles.eqItemRow,
                              isChecked && modalStyles.eqItemRowChecked,
                            ]}
                            onPress={() => toggleEquipmentItem(item.id)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                modalStyles.eqItemLabel,
                                isChecked && modalStyles.eqItemLabelChecked,
                              ]}
                            >
                              {item.label}
                            </Text>
                            <View
                              style={[
                                modalStyles.checkbox,
                                isChecked && modalStyles.checkboxChecked,
                              ]}
                            >
                              {isChecked && <CheckIcon size={12} color="#FFFFFF" />}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Modal Alt Aksiyon Butonları */}
            <View style={modalStyles.modalFooter}>
              <TouchableOpacity
                style={modalStyles.cancelBtn}
                onPress={closeModal}
                disabled={isSaving}
              >
                <Text style={modalStyles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.saveBtn, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveGym}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckIcon size={16} color="#FFFFFF" />
                    <Text style={modalStyles.saveBtnText}>
                      {editingGym ? 'Salonu Güncelle' : 'Salonu Kaydet'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cyanBg,
    borderColor: colors.cyanBorder,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  headerAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.cyanLight,
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
  subHeaderCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 6,
  },
  subHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  subHeaderDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  gymCountBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gymCountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purpleLight,
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
  gymListContainer: {
    gap: 14,
  },
  gymCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  gymCardDefault: {
    borderColor: 'rgba(16, 185, 129, 0.45)',
    backgroundColor: '#0F1824',
  },
  gymCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  gymCardTitleCol: {
    flex: 1,
    gap: 2,
  },
  gymName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  gymSub: {
    fontSize: 12,
    color: colors.textDim,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  equipmentMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
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
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  eqChipMore: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eqChipMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  gymCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  actionBtnEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnEditText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  actionBtnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
  },
  actionBtnDeleteText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.danger,
  },
  actionBtnSetDefault: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 5,
    marginLeft: 'auto',
  },
  actionBtnSetDefaultText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalScrollContent: {
    padding: 20,
    gap: 16,
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
    fontSize: 11,
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
    padding: 8,
    gap: 4,
  },
  eqItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  eqItemRowChecked: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  eqItemLabel: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
    marginRight: 8,
  },
  eqItemLabelChecked: {
    color: colors.text,
    fontWeight: '600',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.textDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
