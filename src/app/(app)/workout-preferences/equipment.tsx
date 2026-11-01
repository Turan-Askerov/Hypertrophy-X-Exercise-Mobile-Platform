import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { useExpertData } from '@/hooks/use-expert';
import type { GymEquipmentCatalogItem } from '@/types/expert';

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
  const equipmentSourceLabel =
    expertData?.equipment_source_label ||
    (hasCustomPrefs ? 'Tercih edilen ve hâkim olunan ekipmanlar' : 'Varsayılan salon ekipmanı');

  // Düzenleme Modu State
  const [isEditing, setIsEditing] = useState(false);
  const [draftEquipment, setDraftEquipment] = useState<string[] | null>(null);

  const currentDraft = draftEquipment ?? serverPreferred;

  // ID -> Label Haritası
  const equipmentMap = useMemo(() => {
    const map = new Map<string, GymEquipmentCatalogItem>();
    catalogEquipment.forEach((item) => {
      map.set(item.id, item);
    });
    return map;
  }, [catalogEquipment]);

  // Gruplandırılmış Ekipman Kataloğu
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

  // Düzenleme Başlat
  const handleStartEdit = () => {
    if (serverPreferred.length > 0) {
      setDraftEquipment([...serverPreferred]);
    } else {
      const defaultGym = expertData?.gyms?.find((g) => g.is_default);
      if (defaultGym && defaultGym.equipment.length > 0) {
        setDraftEquipment([...defaultGym.equipment]);
      } else {
        setDraftEquipment(catalogEquipment.map((e) => e.id));
      }
    }
    setIsEditing(true);
  };

  // Düzenlemeden Vazgeç
  const handleCancelEdit = () => {
    setDraftEquipment(null);
    setIsEditing(false);
  };

  // Switch Aç/Kapat
  const toggleEquipmentSwitch = (id: string) => {
    const current = draftEquipment ?? serverPreferred;
    setDraftEquipment(
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  // Tümünü Seç / Tümünü Kaldır
  const selectAll = () => {
    setDraftEquipment(catalogEquipment.map((e) => e.id));
  };

  const clearAll = () => {
    setDraftEquipment([]);
  };

  // Kaydet
  const handleSave = async () => {
    try {
      await saveEquipmentMutation.mutateAsync({
        preferred_equipment: currentDraft,
      });
      setDraftEquipment(null);
      setIsEditing(false);
      Alert.alert('Başarılı', 'Ekipman tercihleriniz kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Ekipman tercihleri kaydedilemedi.');
    }
  };

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
              setDraftEquipment([]);
              setIsEditing(false);
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

  // Görüntüleme Modu için Kayıtlı Ekipmanların Gruplanması
  const savedGrouped = useMemo(() => {
    const map: Record<string, string[]> = {};
    serverPreferred.forEach((id) => {
      const item = equipmentMap.get(id);
      const groupName = item?.group || 'Diğer Ekipmanlar';
      const label = item?.label || id;
      if (!map[groupName]) {
        map[groupName] = [];
      }
      map[groupName].push(label);
    });
    return map;
  }, [serverPreferred, equipmentMap]);

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

        <Text style={styles.headerTitle}>
          {isEditing ? 'Ekipmanları Düzenle' : 'Ekipman Tercihleri'}
        </Text>

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
        {/* İsteğe Bağlı Bilgi Kartı */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>Kişisel Ekipman ve Makine Tercihi (İsteğe Bağlı)</Text>
          <Text style={styles.infoDesc}>
            Sehpalar ve serbest ağırlıklar her zaman temel kabul edilir. Yalnızca salonunun sunduğu
            özel makineleri belirleyebilirsin. Özel seçim yapmazsan varsayılan salonundaki ekipmanlar
            otomatik olarak kullanılır.
          </Text>
        </View>

        {/* Durum Özeti Kartları (Web Görseli 4 standardı) */}
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>GEÇERLİ EKİPMAN KAYNAĞI</Text>
            <Text style={styles.metaValue} numberOfLines={2}>
              {equipmentSourceLabel}
            </Text>
          </View>

          <View style={styles.metaCard}>
            <Text style={styles.metaLabel}>VARSAYILAN SALON</Text>
            <Text style={styles.metaValue} numberOfLines={1}>
              {defaultGymName}
            </Text>
          </View>

          <View style={styles.metaCardSmall}>
            <Text style={styles.metaLabel}>ÖZEL SEÇİM</Text>
            <Text style={styles.metaValueBold}>
              {isEditing ? currentDraft.length : serverPreferred.length} Seçili
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Ekipman tercihleri yükleniyor...</Text>
          </View>
        ) : isEditing ? (
          /* ───────────── DÜZENLEME MODU (Web Görselleri 5 & 6) ───────────── */
          <View style={styles.editContainer}>
            {/* Araç Çubuğu: Tümünü Seç / Tümünü Kaldır */}
            <View style={styles.editToolbar}>
              <Text style={styles.editSectionTitle}>
                TERCİH EDİLEN MAKİNE VE İSTASYONLAR ({currentDraft.length})
              </Text>
              <View style={styles.toolbarBtns}>
                <TouchableOpacity onPress={selectAll} style={styles.batchBtn} hitSlop={6}>
                  <Text style={styles.batchBtnText}>Tümünü Seç</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={clearAll} style={styles.batchBtn} hitSlop={6}>
                  <Text style={styles.batchBtnText}>Tümünü Kaldır</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Gruplar & Switch Toggle Listeleri */}
            {Object.entries(groupedEquipment).map(([groupName, items]) => (
              <View key={groupName} style={styles.editGroupCard}>
                <View style={styles.editGroupHeader}>
                  <Text style={styles.editGroupTitle}>{groupName}</Text>
                  <Text style={styles.editGroupCount}>{items.length} Ekipman</Text>
                </View>

                <View style={styles.editItemList}>
                  {items.map((item) => {
                    const isChecked = currentDraft.includes(item.id);

                    return (
                      <View key={item.id} style={styles.switchRow}>
                        <View style={styles.switchTextCol}>
                          <Text style={styles.switchItemLabel}>{item.label}</Text>
                          <Text
                            style={[
                              styles.switchItemStatus,
                              isChecked ? styles.statusActive : styles.statusInactive,
                            ]}
                          >
                            {isChecked ? 'Var' : 'Yok'}
                          </Text>
                        </View>
                        <Switch
                          value={isChecked}
                          onValueChange={() => toggleEquipmentSwitch(item.id)}
                          trackColor={{ false: '#334155', true: colors.purple }}
                          thumbColor="#FFFFFF"
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}

            {/* Düzenleme Modu Alt Aksiyonları */}
            <View style={styles.editFooterActions}>
              <TouchableOpacity
                style={styles.cancelEditBtn}
                onPress={handleCancelEdit}
                disabled={isSaving}
              >
                <Text style={styles.cancelEditBtnText}>Vazgeç</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveEditBtn, isSaving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <CheckIcon size={16} color="#FFFFFF" />
                    <Text style={styles.saveEditBtnText}>Tercihleri Kaydet</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* ───────────── GÖRÜNTÜLEME MODU (Web Görseli 4) ───────────── */
          <View style={styles.viewContainer}>
            {hasCustomPrefs ? (
              <View style={styles.customPrefsSection}>
                <View style={styles.customPrefsHeader}>
                  <View style={styles.customPrefsBadge}>
                    <CheckIcon size={13} color={colors.purpleLight} />
                    <Text style={styles.customPrefsBadgeText}>
                      SEÇİLEN ÖZEL EKİPMANLAR ({serverPreferred.length})
                    </Text>
                  </View>
                  <Text style={styles.customPrefsNote}>
                    Yalnızca bu ekipmanları içeren hareket varyasyonları önerilir
                  </Text>
                </View>

                {/* Gruplandırılmış Çip Kartları */}
                <View style={styles.groupedChipsContainer}>
                  {Object.entries(savedGrouped).map(([groupName, items]) => (
                    <View key={groupName} style={styles.groupChipCard}>
                      <View style={styles.groupChipCardHead}>
                        <View style={styles.groupDot} />
                        <Text style={styles.groupChipCardTitle}>{groupName}</Text>
                        <View style={styles.groupChipCountBadge}>
                          <Text style={styles.groupChipCountText}>{items.length} Ekipman</Text>
                        </View>
                      </View>

                      <View style={styles.chipsWrap}>
                        {items.map((label) => (
                          <View key={label} style={styles.chip}>
                            <Text style={styles.chipText}>{label}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              /* Henüz Özel Tercih Yok — Varsayılan Salondan Kullanılıyor */
              <View style={styles.defaultGymBanner}>
                <Text style={styles.defaultGymTitle}>Varsayılan Salon Ekipmanları Aktif</Text>
                <Text style={styles.defaultGymDesc}>
                  Şu anda &quot;{defaultGymName}&quot; salonunda kayıtlı olan ekipman listesi temel alınıyor.
                  Dilersen &quot;Tercihleri Düzenle&quot; butonuna dokunarak bu salondan bağımsız özel bir ekipman
                  havuzu oluşturabilirsin.
                </Text>
              </View>
            )}

            {/* Alt Eylemler */}
            <View style={styles.viewActions}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={handleStartEdit}
                activeOpacity={0.8}
              >
                <EditIcon size={16} color="#FFFFFF" />
                <Text style={styles.editBtnText}>Tercihleri Düzenle</Text>
              </TouchableOpacity>

              {hasCustomPrefs && (
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handleResetToDefaultGym}
                  activeOpacity={0.7}
                >
                  <ResetIcon size={14} color={colors.textMuted} />
                  <Text style={styles.resetBtnText}>Seçimleri Sıfırla</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </ScrollView>
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
  optionalPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  infoBanner: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  infoDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metaCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 10,
    gap: 4,
  },
  metaCardSmall: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 10,
    gap: 4,
    minWidth: 80,
  },
  metaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  metaValueBold: {
    fontSize: 13,
    fontWeight: '800',
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
  viewContainer: {
    gap: 16,
  },
  customPrefsSection: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderRadius: 16,
    padding: 14,
    gap: 14,
  },
  customPrefsHeader: {
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 10,
  },
  customPrefsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  customPrefsBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.purpleLight,
    letterSpacing: 0.3,
  },
  customPrefsNote: {
    fontSize: 11,
    color: colors.textDim,
  },
  groupedChipsContainer: {
    gap: 12,
  },
  groupChipCard: {
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  groupChipCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.purpleLight,
  },
  groupChipCardTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  groupChipCountBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupChipCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
  },
  chipText: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  defaultGymBanner: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  defaultGymTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  defaultGymDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  viewActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.purple,
    paddingVertical: 12,
    borderRadius: 10,
  },
  editBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  editContainer: {
    gap: 14,
  },
  editToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  editSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.4,
  },
  toolbarBtns: {
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
  editGroupCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  editGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.cardBgInner,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  editGroupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  editGroupCount: {
    fontSize: 11,
    color: colors.textDim,
  },
  editItemList: {
    padding: 8,
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
    color: colors.purpleLight,
  },
  statusInactive: {
    color: colors.textDim,
  },
  editFooterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 6,
  },
  cancelEditBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelEditBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  saveEditBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
