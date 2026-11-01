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
import Svg, { Path } from 'react-native-svg';

import { useExpertData } from '@/hooks/use-expert';
import type { DetailedMuscleCatalogItem } from '@/types/expert';

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

function UserGoalIcon({ color = colors.cyanLight, size = 18 }: { color?: string; size?: number }) {
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

function ZapIcon({ color = colors.purpleLight, size = 13 }: { color?: string; size?: number }) {
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
  { id: 'biceps', label: 'Biceps', ui_group: 'Biceps' },
  { id: 'triceps', label: 'Triceps', ui_group: 'Triceps' },
  { id: 'quadriceps', label: 'Quadriceps', ui_group: 'Bacak' },
  { id: 'hamstrings', label: 'Hamstring', ui_group: 'Bacak' },
  { id: 'glutes', label: 'Gluteus', ui_group: 'Bacak' },
  { id: 'calves', label: 'Calf', ui_group: 'Bacak' },
  { id: 'adductors', label: 'Adductors', ui_group: 'Bacak' },
  { id: 'forearms', label: 'Bilek Kasları', ui_group: 'Bilek' },
  { id: 'core', label: 'Core', ui_group: 'Core' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const { expertData, isLoading, isRefetching, refetch, saveGoalsMutation } = useExpertData();

  // Katalogdaki kas gruplarını normalize et (nesne veya string desteği)
  const rawCatalogMuscles = expertData?.catalog?.detailed_muscles;
  const muscles: DetailedMuscleCatalogItem[] = useMemo(() => {
    if (Array.isArray(rawCatalogMuscles) && rawCatalogMuscles.length > 0) {
      return rawCatalogMuscles.map((item: any) => {
        if (typeof item === 'string') {
          const found = DEFAULT_DETAILED_MUSCLES.find((d) => d.id === item || d.label === item);
          return found || { id: item, label: item };
        }
        return {
          id: item.id || item.label,
          label: item.label || item.id,
          ui_group: item.ui_group || '',
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
  const currentMuscles = useMemo(() => {
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

  const currentNote = currentGoalData.priority_note || '';

  // Yerel Taslak State
  const [draftGoal, setDraftGoal] = useState<string | null>(null);
  const [draftMuscles, setDraftMuscles] = useState<string[] | null>(null);
  const [draftNote, setDraftNote] = useState<string | null>(null);

  const primaryGoal = draftGoal ?? currentGoalKey;
  const selectedMuscles = draftMuscles ?? currentMuscles;
  const priorityNote = draftNote ?? currentNote;

  // Kas Seç / Çıkar (Maksimum 3)
  const toggleMuscle = (muscleId: string) => {
    Keyboard.dismiss();
    const current = draftMuscles ?? currentMuscles;
    if (current.includes(muscleId)) {
      setDraftMuscles(current.filter((m) => m !== muscleId));
    } else {
      if (current.length >= 3) {
        Alert.alert('Sınır Aşıldı', 'En fazla 3 hedef kas seçebilirsiniz.');
        return;
      }
      setDraftMuscles([...current, muscleId]);
    }
  };

  // Sıfırla
  const handleReset = () => {
    Alert.alert('Seçimleri Sıfırla', 'Seçilen hedef kasları temizlemek istiyor musun?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sıfırla',
        style: 'destructive',
        onPress: () => {
          setDraftMuscles([]);
          setDraftNote('');
        },
      },
    ]);
  };

  // Kaydet
  const handleSave = async () => {
    if (primaryGoal === 'hypertrophy' && selectedMuscles.length < 1) {
      Alert.alert('Uyarı', 'Kas kazanımı hedefinde en az 1 öncelikli kas seçmelisiniz.');
      return;
    }

    try {
      await saveGoalsMutation.mutateAsync({
        primary_goal: primaryGoal,
        priority_muscles: selectedMuscles,
        priority_note: priorityNote.trim(),
      });
      setDraftMuscles(null);
      setDraftNote(null);
      setDraftGoal(null);
      Alert.alert('Başarılı', 'Hedef kaslarınız kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Hedefler kaydedilemedi.');
    }
  };

  const isSaving = saveGoalsMutation.isPending;

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

        <Text style={styles.headerTitle}>Öncelikli Hedef Kaslar</Text>

        <View
          style={[
            styles.countBadge,
            selectedMuscles.length === 3 && styles.countBadgeFull,
          ]}
        >
          <Text
            style={[
              styles.countBadgeText,
              selectedMuscles.length === 3 && styles.countBadgeTextFull,
            ]}
          >
            {selectedMuscles.length} / 3 Seçildi
          </Text>
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
        {/* Bilgilendirme Notu */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoTitle}>Hedef Odaklı Hipertrofi Optimizasyonu</Text>
          <Text style={styles.infoDesc}>
            Aktif antrenman programınız seçtiğiniz bu kas gruplarına eşit öncelikle optimize edilir.
            Öncelikli kasların haftalık set hacmi ve hareket sıralaması motor tarafından öne alınır.
          </Text>
        </View>

        {/* Profil Ana Amacı Kartı */}
        <View style={styles.goalProfileCard}>
          <View style={styles.goalProfileIconBox}>
            <UserGoalIcon size={18} color={colors.cyanLight} />
          </View>
          <View style={styles.goalProfileContent}>
            <Text style={styles.goalProfileLabel}>PROFİL ANA AMACI</Text>
            <Text style={styles.goalProfileValue}>
              {primaryGoals[primaryGoal] || primaryGoal}
            </Text>
          </View>
          <View style={styles.syncBadge}>
            <Text style={styles.syncBadgeText}>Profil Senkronizasyonu</Text>
          </View>
        </View>

        {/* Aktif Hedefler Panosu (Web Görseli 1 standardı) */}
        {selectedMuscles.length > 0 && (
          <View style={styles.activeGoalsCard}>
            <View style={styles.activeGoalsHeader}>
              <Text style={styles.activeGoalsTitle}>Öncelikli Hedef Panosu</Text>
              <View style={styles.activeGoalsBadge}>
                <Text style={styles.activeGoalsBadgeText}>{selectedMuscles.length} Aktif Hedef</Text>
              </View>
            </View>

            <View style={styles.activeGoalsRow}>
              {selectedMuscles.map((muscleId) => {
                const label = muscleLabelMap.get(muscleId) || muscleId;
                return (
                  <View key={muscleId} style={styles.activeGoalItem}>
                    <View style={styles.activeGoalTop}>
                      <Text style={styles.activeGoalName} numberOfLines={1}>
                        {label}
                      </Text>
                      <View style={styles.activeGoalPill}>
                        <Text style={styles.activeGoalPillText}>Aktif</Text>
                      </View>
                    </View>
                    <View style={styles.activeGoalModTag}>
                      <Text style={styles.activeGoalModTagText}>
                        Öncelikli Hareket Modifikasyonu
                      </Text>
                    </View>
                    <View style={styles.activeGoalBottom}>
                      <Text style={styles.activeGoalSub}>Eşit Hipertrofi</Text>
                      <View style={styles.equalPriorityTag}>
                        <ZapIcon size={11} color={colors.purpleLight} />
                        <Text style={styles.equalPriorityText}>Eşit Öncelik</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Kas Grupları Başlığı */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>KAS GRUPLARI LİSTESİ (MAKSİMUM 3)</Text>
          <Text style={styles.sectionSub}>Dokunarak seç veya kaldır</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={styles.loadingText}>Kas kataloğu yükleniyor...</Text>
          </View>
        ) : (
          /* Kas Grupları Grid Izgarası (Web Görseli 8 standardı) */
          <View style={styles.muscleGrid}>
            {muscles.map((muscle) => {
              const isSelected = selectedMuscles.includes(muscle.id);

              return (
                <TouchableOpacity
                  key={muscle.id}
                  style={[
                    styles.muscleCard,
                    isSelected && styles.muscleCardSelected,
                  ]}
                  onPress={() => toggleMuscle(muscle.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.muscleCardName,
                      isSelected && styles.muscleCardNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {muscle.label}
                  </Text>

                  <View
                    style={[
                      styles.muscleCardStatus,
                      isSelected && styles.muscleCardStatusSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.muscleCardStatusText,
                        isSelected && styles.muscleCardStatusTextSelected,
                      ]}
                    >
                      {isSelected ? '● Hedef Kas' : '○ Seç'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Hedef ve Odak Notu (İsteğe Bağlı) */}
        <View style={styles.noteCard}>
          <View style={styles.noteCardHeader}>
            <Text style={styles.noteCardTitle}>HEDEF VE ODAK NOTU · İSTEĞE BAĞLI</Text>
            <Text style={styles.noteCharCount}>{priorityNote.length}/100</Text>
          </View>

          <TextInput
            style={styles.noteInput}
            placeholder="Örn: Üst göğüs ve arka omuz odaklı (Maks. 100 karakter)"
            placeholderTextColor={colors.textDim}
            value={priorityNote}
            onChangeText={(text) => setDraftNote(text.slice(0, 100))}
            maxLength={100}
            selectionColor={colors.purple}
          />
        </View>

        {/* Alt Aksiyon Butonları */}
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
                <Text style={styles.saveBtnText}>Hedefleri Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
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
  countBadge: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  countBadgeFull: {
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  countBadgeTextFull: {
    color: colors.emeraldLight,
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
  goalProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  goalProfileIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.cyanBg,
    borderWidth: 1,
    borderColor: colors.cyanBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalProfileContent: {
    flex: 1,
    gap: 3,
  },
  goalProfileLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.4,
  },
  goalProfileValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.cyanLight,
  },
  syncBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textDim,
  },
  activeGoalsCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.28)',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  activeGoalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeGoalsTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
  },
  activeGoalsBadge: {
    backgroundColor: colors.emeraldBg,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeGoalsBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  activeGoalsRow: {
    gap: 8,
  },
  activeGoalItem: {
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  activeGoalTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeGoalName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  activeGoalPill: {
    backgroundColor: colors.emeraldBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeGoalPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  activeGoalModTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  activeGoalModTagText: {
    fontSize: 10,
    color: colors.cyanLight,
    fontWeight: '600',
  },
  activeGoalBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  activeGoalSub: {
    fontSize: 11,
    color: colors.textDim,
  },
  equalPriorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  equalPriorityText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textDim,
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
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  muscleCard: {
    width: '48.5%',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  muscleCardSelected: {
    borderColor: 'rgba(139, 92, 246, 0.5)',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  muscleCardName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  muscleCardNameSelected: {
    color: colors.purpleLight,
  },
  muscleCardStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  muscleCardStatusSelected: {
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  muscleCardStatusText: {
    fontSize: 10.5,
    color: colors.textDim,
    fontWeight: '600',
  },
  muscleCardStatusTextSelected: {
    color: colors.purpleLight,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteCardTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.4,
  },
  noteCharCount: {
    fontSize: 11,
    color: colors.textDim,
  },
  noteInput: {
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.text,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.emerald,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
