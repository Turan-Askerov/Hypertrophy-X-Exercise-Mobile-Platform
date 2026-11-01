import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
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

function CloseIcon({ color = '#EF4444', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
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
    // Varsayılan olarak tüm katalogdaki ekipmanları açık başlat
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
        {/* Şıklaştırılmış Salon ve Ekipman Kaynakları Panosu */}
        <View style={styles.subHeaderCard}>
          {/* Kart Üst Başlık Alanı */}
          <View style={styles.subHeaderTopRow}>
            <View style={styles.subHeaderIconBox}>
              <BuildingIcon size={22} color={colors.cyanLight} />
            </View>
            <View style={styles.subHeaderTitleCol}>
              <View style={styles.subHeaderHeadingRow}>
                <Text style={styles.subHeaderTitle}>Salon ve Ekipman Kaynakları</Text>
                <View style={styles.gymCountBadge}>
                  <Text style={styles.gymCountBadgeText}>{gyms.length} Kayıtlı</Text>
                </View>
              </View>
              <Text style={styles.subHeaderDesc}>
                Varsayılan salon, özel ekipman tercihi boş olduğunda antrenman programı motorunun
                birincil ekipman kaynağıdır.
              </Text>
            </View>
          </View>

          {/* İstatistik Gösterge Izgarası (3 Kolonlu) */}
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>TOPLAM SALON</Text>
              <Text style={styles.statValue}>{gyms.length}</Text>
              <Text style={styles.statSub}>Kayıtlı Mekân</Text>
            </View>

            <View style={[styles.statBox, styles.statBoxMiddle]}>
              <Text style={styles.statLabel}>VARSAYILAN</Text>
              <Text style={styles.statValueGreen} numberOfLines={1}>
                {defaultGym?.name || 'Seçilmedi'}
              </Text>
              <Text style={styles.statSubGreen}>
                {defaultGym ? '★ Birincil Merkez' : 'Tanımlanmadı'}
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statLabel}>EKİPMAN HAVUZU</Text>
              <Text style={styles.statValueCyan}>
                {defaultGym ? `${defaultGym.equipment.length}` : 'Katalog'}
              </Text>
              <Text style={styles.statSub}>
                {defaultGym ? 'Makine & İstasyon' : 'Tüm Olanaklar'}
              </Text>
            </View>
          </View>

          {/* Bilgi / İpucu Şeridi */}
          <View style={styles.tipBanner}>
            <Text style={styles.tipText}>
              <Text style={styles.tipBold}>💡 Salon Yönetimi: </Text>
              Antrenman yaptığın yeri tek dokunuşla &quot;Varsayılan Yap&quot;arak programını o salonun
              olanaklarına göre anında optimize edebilirsin.
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

      {/* Profil Sayfası Standardında Alttan Çıkan Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeModal}
        statusBarTranslucent
      >
        <View style={modalStyles.modalRootContainer}>
          <Pressable style={modalStyles.modalBackdropTap} onPress={closeModal} />
          <View style={modalStyles.modalSheet}>
            {/* Tutamaç Çubuğu */}
            <View style={modalStyles.modalHandle} />

            {/* Başlık ve Kırmızı Kapatma Butonu */}
            <View style={modalStyles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={modalStyles.modalTitle}>
                  {editingGym ? 'Salon Kaydını Düzenle' : 'Yeni Salon Ekle'}
                </Text>
                <Text style={modalStyles.modalDesc}>
                  Salondaki ekipman ve istasyon olanaklarını yapılandırın.
                </Text>
              </View>
              <TouchableOpacity
                style={modalStyles.modalCloseButtonRed}
                onPress={closeModal}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
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

              {/* Varsayılan Yap Switch (Basit Yeşil Anahtar) */}
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
                  trackColor={{ false: '#242B42', true: colors.emerald }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Ekipman Seçimi (Basit Yeşil Anahtarlı İkili Seçim Listesi) */}
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

                            {/* Basit Yeşil Anahtar */}
                            <Switch
                              value={isChecked}
                              onValueChange={() => toggleEquipmentItem(item.id)}
                              trackColor={{ false: '#242B42', true: colors.emerald }}
                              thumbColor="#FFFFFF"
                            />
                          </View>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>

            {/* Modal Alt Aksiyon Butonları (Profile Standartı) */}
            <View style={modalStyles.modalFooter}>
              <TouchableOpacity
                style={modalStyles.neonCancelBtn}
                onPress={closeModal}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={modalStyles.neonCancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[modalStyles.neonSaveBtn, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveGym}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckIcon size={16} color="#FFFFFF" />
                    <Text style={modalStyles.neonSaveBtnText}>
                      {editingGym ? 'Salonu Güncelle' : 'Salonu Kaydet'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Alt Taşma Uzantısı */}
            <View style={modalStyles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    padding: 16,
    gap: 14,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  subHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  subHeaderIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  subHeaderTitleCol: {
    flex: 1,
    gap: 4,
  },
  subHeaderHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  subHeaderTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  subHeaderDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  gymCountBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  gymCountBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  statGrid: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  statBoxMiddle: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  statValueGreen: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.emeraldLight,
  },
  statValueCyan: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.cyanLight,
  },
  statSub: {
    fontSize: 10,
    color: colors.textDim,
  },
  statSubGreen: {
    fontSize: 10,
    color: colors.emeraldLight,
    fontWeight: '600',
  },
  tipBanner: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 16,
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
  modalCloseButtonRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
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
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  neonCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  neonCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  neonSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  neonSaveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
