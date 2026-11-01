import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
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

function SearchIcon({ color = colors.textDim, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
    </Svg>
  );
}

function StarIcon({
  filled = false,
  color = colors.cyanLight,
  size = 14,
}: {
  filled?: boolean;
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? color : 'none'}
      stroke={color}
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

function SlashIcon({ color = colors.danger, size = 14 }: { color?: string; size?: number }) {
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
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
    </Svg>
  );
}

function ChevronUpIcon({ color = colors.textDim, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15l-6-6-6 6" />
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

type FilterMode = 'all' | 'preferred' | 'avoid';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

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

  // Tüm Seçimleri Sıfırla
  const handleReset = () => {
    Alert.alert(
      'Seçimleri Sıfırla',
      'Tüm hareket tercihlerini ve önerme listesini sıfırlamak istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: () => {
            setDraftPreferred([]);
            setDraftAvoid([]);
          },
        },
      ]
    );
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
      Alert.alert('Başarılı', 'Hareket tercihleriniz kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Tercihler kaydedilemedi.');
    }
  };

  // Akordiyon Grubu Aç/Kapa
  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  // Tüm Grupları Kapat/Aç
  const toggleAllGroups = () => {
    const areAllCollapsed = Object.values(collapsedGroups).every(Boolean);
    const newCollapsed: Record<string, boolean> = {};
    if (!areAllCollapsed) {
      // Hepsini kapat
      groupedExercises.forEach(([group]) => {
        newCollapsed[group] = true;
      });
    }
    setCollapsedGroups(newCollapsed);
  };

  // Gruplandırılmış ve Filtrelenmiş Egzersizler
  const q = searchQuery.trim().toLowerCase();
  const groupsMap = new Map<string, ExercisePreferenceCatalogItem[]>();

  catalog.forEach((ex) => {
    // 1. Arama filtresi
    const matchesSearch =
      !q ||
      ex.name.toLowerCase().includes(q) ||
      ex.group.toLowerCase().includes(q) ||
      (ex.primary_muscles && ex.primary_muscles.some((m) => m.toLowerCase().includes(q)));

    if (!matchesSearch) return;

    // 2. Mod filtresi
    const isPref = preferredIds.includes(ex.id);
    const isAvoid = avoidIds.includes(ex.id);

    if (filterMode === 'preferred' && !isPref) return;
    if (filterMode === 'avoid' && !isAvoid) return;

    const groupName = ex.display_groups?.[0] || ex.group || 'Diğer';
    if (!groupsMap.has(groupName)) {
      groupsMap.set(groupName, []);
    }
    groupsMap.get(groupName)!.push(ex);
  });

  const groupedExercises = Array.from(groupsMap.entries()).sort(([a], [b]) =>
    a.localeCompare(b, 'tr')
  );

  const isSaving = saveMovementMutation.isPending;

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

        <Text style={styles.headerTitle}>Hareket Tercihleri</Text>

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
        {/* İsteğe Bağlı & Bilgilendirme Notu */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>Egzersiz ve Varyasyon Filtresi (İsteğe Bağlı)</Text>
          <Text style={styles.infoDesc}>
            Sevdiğin hareketleri <Text style={styles.textCyanBold}>&quot;Tercih Et&quot;</Text> ile önceliklendir,
            yapmak istemediğin veya sakatlık/rahatsızlık duyduğun hareketleri{' '}
            <Text style={styles.textDangerBold}>&quot;Önerme&quot;</Text> ile taslak dışı bırak. Hiçbir seçim
            yapmazsan uzman sistemi tüm uygun hareketleri dengeli şekilde kullanır.
          </Text>
        </View>

        {/* Arama ve Filtre Araç Çubuğu */}
        <View style={styles.toolbarCard}>
          {/* Arama Alanı */}
          <View style={styles.searchBox}>
            <SearchIcon size={16} color={colors.textDim} />
            <TextInput
              style={styles.searchInput}
              placeholder="Hareket veya kas grubu ara (Örn: Bench Press, Biceps...)"
              placeholderTextColor={colors.textDim}
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectionColor={colors.purple}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Filtre Çipleri & Sayaç */}
          <View style={styles.filterBar}>
            <View style={styles.filterChipsRow}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMode === 'all' && styles.filterChipActive,
                ]}
                onPress={() => setFilterMode('all')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMode === 'all' && styles.filterChipTextActive,
                  ]}
                >
                  Tümü
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMode === 'preferred' && styles.filterChipActiveCyan,
                ]}
                onPress={() => setFilterMode('preferred')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMode === 'preferred' && styles.filterChipTextCyan,
                  ]}
                >
                  ★ Tercihlerim ({preferredIds.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  filterMode === 'avoid' && styles.filterChipActiveDanger,
                ]}
                onPress={() => setFilterMode('avoid')}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filterMode === 'avoid' && styles.filterChipTextDanger,
                  ]}
                >
                  ⛔ Önerme ({avoidIds.length})
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={toggleAllGroups}
              style={styles.toggleAllBtn}
              hitSlop={6}
            >
              <Text style={styles.toggleAllBtnText}>Grupları Aç/Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Egzersiz Listesi / Grupları */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Egzersiz kataloğu yükleniyor...</Text>
          </View>
        ) : groupedExercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Eşleşen Hareket Bulunamadı</Text>
            <Text style={styles.emptyDesc}>
              Arama kriterlerine veya seçtiğin filtre moduna uygun hareket bulunamadı.
            </Text>
          </View>
        ) : (
          <View style={styles.groupsContainer}>
            {groupedExercises.map(([groupName, exercises]) => {
              const isCollapsed = Boolean(collapsedGroups[groupName]);
              const prefCountInGroup = exercises.filter((e) => preferredIds.includes(e.id)).length;
              const avoidCountInGroup = exercises.filter((e) => avoidIds.includes(e.id)).length;

              return (
                <View key={groupName} style={styles.groupAccordion}>
                  {/* Grup Başlığı */}
                  <TouchableOpacity
                    style={styles.groupHeader}
                    onPress={() => toggleGroup(groupName)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.groupHeaderLeft}>
                      <View style={styles.groupDot} />
                      <Text style={styles.groupTitle}>{groupName}</Text>
                    </View>

                    <View style={styles.groupHeaderRight}>
                      {prefCountInGroup > 0 && (
                        <View style={styles.groupPrefBadge}>
                          <Text style={styles.groupPrefBadgeText}>★ {prefCountInGroup}</Text>
                        </View>
                      )}
                      {avoidCountInGroup > 0 && (
                        <View style={styles.groupAvoidBadge}>
                          <Text style={styles.groupAvoidBadgeText}>⛔ {avoidCountInGroup}</Text>
                        </View>
                      )}
                      <View style={styles.groupCountBadge}>
                        <Text style={styles.groupCountBadgeText}>{exercises.length} Hareket</Text>
                      </View>
                      {isCollapsed ? (
                        <ChevronDownIcon size={16} color={colors.textDim} />
                      ) : (
                        <ChevronUpIcon size={16} color={colors.textDim} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Egzersizler (Akordiyon İçeriği) */}
                  {!isCollapsed && (
                    <View style={styles.exerciseItemsList}>
                      {exercises.map((exercise) => {
                        const isPref = preferredIds.includes(exercise.id);
                        const isAvoid = avoidIds.includes(exercise.id);

                        return (
                          <View key={exercise.id} style={styles.exerciseItemRow}>
                            <View style={styles.exerciseInfo}>
                              <Text style={styles.exerciseName} numberOfLines={1}>
                                {exercise.name}
                              </Text>
                              <Text style={styles.exerciseMeta} numberOfLines={1}>
                                {exercise.primary_muscles?.join(', ') || exercise.category || 'Genel'}
                              </Text>
                            </View>

                            <View style={styles.exerciseActions}>
                              {/* Tercih Et Butonu */}
                              <TouchableOpacity
                                style={[
                                  styles.actionBtnPref,
                                  isPref && styles.actionBtnPrefActive,
                                ]}
                                onPress={() => togglePreferred(exercise.id)}
                                activeOpacity={0.7}
                              >
                                <StarIcon
                                  size={13}
                                  filled={isPref}
                                  color={isPref ? colors.cyanLight : colors.textDim}
                                />
                                <Text
                                  style={[
                                    styles.actionBtnPrefText,
                                    isPref && styles.actionBtnPrefTextActive,
                                  ]}
                                >
                                  {isPref ? 'Tercih Edildi' : 'Tercih Et'}
                                </Text>
                              </TouchableOpacity>

                              {/* Önerme Butonu */}
                              <TouchableOpacity
                                style={[
                                  styles.actionBtnAvoid,
                                  isAvoid && styles.actionBtnAvoidActive,
                                ]}
                                onPress={() => toggleAvoid(exercise.id)}
                                activeOpacity={0.7}
                              >
                                <SlashIcon
                                  size={13}
                                  color={isAvoid ? colors.danger : colors.textDim}
                                />
                                <Text
                                  style={[
                                    styles.actionBtnAvoidText,
                                    isAvoid && styles.actionBtnAvoidTextActive,
                                  ]}
                                >
                                  {isAvoid ? 'Önerilmesin' : 'Önerme'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Alt Kaydet ve Sıfırla Eylemleri */}
        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={handleReset}
            activeOpacity={0.7}
            disabled={isSaving}
          >
            <ResetIcon size={14} color={colors.textMuted} />
            <Text style={styles.resetBtnText}>Seçimleri Sıfırla</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <CheckIcon size={16} color="#FFFFFF" />
                <Text style={styles.saveBtnText}>Tercihleri Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Planlama Notu Kutusu */}
        <View style={styles.planNoteCard}>
          <Text style={styles.planNoteTitle}>Planlama Notu:</Text>
          <Text style={styles.planNoteDesc}>
            Bu seçimler mevcut aktif programını bozmaz. Yalnızca yeni &quot;Öneri Programı Oluştur&quot; veya
            &quot;Taslağı Yenile&quot; işlemlerinde otomatik olarak devreye girer.
          </Text>
        </View>
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
  textCyanBold: {
    color: colors.cyanLight,
    fontWeight: '700',
  },
  textDangerBold: {
    color: colors.danger,
    fontWeight: '700',
  },
  toolbarCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textDim,
    padding: 4,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 7,
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterChipActive: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleBorder,
  },
  filterChipActiveCyan: {
    backgroundColor: colors.cyanBg,
    borderColor: colors.cyanBorder,
  },
  filterChipActiveDanger: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  filterChipTextActive: {
    color: colors.purpleLight,
    fontWeight: '700',
  },
  filterChipTextCyan: {
    color: colors.cyanLight,
    fontWeight: '700',
  },
  filterChipTextDanger: {
    color: colors.danger,
    fontWeight: '700',
  },
  toggleAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  toggleAllBtnText: {
    fontSize: 11,
    color: colors.textDim,
    fontWeight: '600',
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
  groupsContainer: {
    gap: 12,
  },
  groupAccordion: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.cardBgInner,
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  groupDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.purpleLight,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  groupHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  groupPrefBadge: {
    backgroundColor: colors.cyanBg,
    borderWidth: 1,
    borderColor: colors.cyanBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupPrefBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  groupAvoidBadge: {
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupAvoidBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.danger,
  },
  groupCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupCountBadgeText: {
    fontSize: 10,
    color: colors.textDim,
  },
  exerciseItemsList: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  exerciseItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    gap: 8,
  },
  exerciseInfo: {
    flex: 1,
    gap: 2,
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  exerciseMeta: {
    fontSize: 11,
    color: colors.textDim,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtnPref: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnPrefActive: {
    backgroundColor: colors.cyanBg,
    borderColor: colors.cyanBorder,
  },
  actionBtnPrefText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionBtnPrefTextActive: {
    color: colors.cyanLight,
    fontWeight: '700',
  },
  actionBtnAvoid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtnAvoidActive: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  actionBtnAvoidText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  actionBtnAvoidTextActive: {
    color: colors.danger,
    fontWeight: '700',
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.emerald,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  planNoteCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  planNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  planNoteDesc: {
    fontSize: 11.5,
    color: colors.textMuted,
    lineHeight: 16,
  },
});
