import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Reanimated, {
  Easing as ReanimatedEasing,
  FadeIn,
  FadeInUp,
  FadeOut,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useExercises } from '@/hooks/use-exercises';
import { workoutDraft } from '@/lib/workout-draft';
import type { Exercise } from '@/types/exercise';

export default function AddExerciseScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; replaceIndex?: string }>();
  const isReplaceMode = params.mode === 'replace';
  const replaceIndex = params.replaceIndex ? parseInt(params.replaceIndex, 10) : -1;

  const { exercises, muscleGroups, loading, error, refetch } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);

  // ─── Egzersizleri Seç -> Egzersizleri Ekle Yumuşak Renk Geçişi (Büyüme/Küçülme olmadan sabit çerçeve) ───
  const hasSelection = selectedExercises.length > 0;
  const selectionProgress = useSharedValue(hasSelection ? 1 : 0);

  useEffect(() => {
    selectionProgress.value = withTiming(hasSelection ? 1 : 0, {
      duration: 220,
      easing: ReanimatedEasing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [hasSelection, selectionProgress]);

  const animatedBtnStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      selectionProgress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.12)', '#10B981']
    );

    const backgroundColor = interpolateColor(
      selectionProgress.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.04)', 'rgba(16, 185, 129, 0.16)']
    );

    return {
      borderColor,
      backgroundColor,
    };
  });

  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle_group.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMuscle =
      !selectedMuscle ||
      ex.muscle === selectedMuscle ||
      ex.muscle_group === selectedMuscle ||
      ex.display_muscle_groups?.includes(selectedMuscle);

    return matchesSearch && matchesMuscle;
  });

  const isExerciseAlreadyInDraft = (exercise: Exercise, excludeIndex = -1) => {
    const current = workoutDraft.getSnapshot().exercises;
    return current.some((e, idx) => {
      if (excludeIndex >= 0 && idx === excludeIndex) return false;
      return (
        e.exercise_id === exercise.id ||
        e.canonical_exercise_id === exercise.id ||
        (exercise.canonical_exercise_id &&
          (e.exercise_id === exercise.canonical_exercise_id ||
            e.canonical_exercise_id === exercise.canonical_exercise_id))
      );
    });
  };

  const toggleSelectExercise = (exercise: Exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.some((e) => e.id === exercise.id);
      if (exists) {
        return prev.filter((e) => e.id !== exercise.id);
      }
      return [...prev, exercise];
    });
  };

  const handleItemPress = (item: Exercise) => {
    if (isReplaceMode) {
      if (isExerciseAlreadyInDraft(item, replaceIndex)) {
        Alert.alert(
          'Egzersiz Zaten Ekli',
          `"${item.name}" zaten antrenman listenizde bulunuyor. Başka bir egzersiz seçiniz.`,
          [{ text: 'Tamam' }]
        );
        return;
      }
      if (replaceIndex >= 0) {
        workoutDraft.replaceExercise(replaceIndex, item);
      }
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(app)/(tabs)/workout');
      }
      return;
    }

    if (isExerciseAlreadyInDraft(item)) {
      Alert.alert(
        'Egzersiz Zaten Ekli',
        `"${item.name}" zaten antrenman listenizde bulunuyor. Aynı hareket birden fazla eklenemez.`,
        [{ text: 'Tamam' }]
      );
      return;
    }

    toggleSelectExercise(item);
  };

  const handleConfirmSelection = () => {
    if (selectedExercises.length === 0) return;
    workoutDraft.addExercises(selectedExercises);
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/workout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        {/* Başlık ve Geri */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/workout'))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backBtnText}>Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            {isReplaceMode ? 'Egzersizi Değiştir' : 'Egzersiz Seç'}
          </Text>
          {!isReplaceMode && (
            <View style={styles.counterBadge}>
              <Text style={styles.counterBadgeText}>
                {selectedExercises.length} Seçili
              </Text>
            </View>
          )}
          {isReplaceMode && <View style={{ width: 44 }} />}
        </View>

        {/* Arama Çubuğu */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Egzersiz ara (örn: Bench Press, Squat)..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>

        {/* Kas Grubu Filtreleri */}
        <View style={styles.filtersWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScroll}
          >
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedMuscle === null && styles.selectedFilterChip,
              ]}
              onPress={() => setSelectedMuscle(null)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedMuscle === null && styles.selectedFilterText,
                ]}
              >
                Tümü
              </Text>
            </TouchableOpacity>

            {muscleGroups.map((group) => {
              const isSelected = selectedMuscle === group;
              return (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.filterChip,
                    isSelected && styles.selectedFilterChip,
                  ]}
                  onPress={() => setSelectedMuscle(isSelected ? null : group)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.selectedFilterText,
                    ]}
                  >
                    {group}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Egzersiz Listesi (Eski Liste Tasarımı + Sağda + İkonu) */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Skeleton height={56} style={styles.skeletonItem} />
            <Skeleton height={56} style={styles.skeletonItem} />
            <Skeleton height={56} style={styles.skeletonItem} />
            <Skeleton height={56} style={styles.skeletonItem} />
          </View>
        ) : error ? (
          <EmptyState
            title="Katalog yüklenemedi"
            description={error.message || 'Lütfen bağlantınızı kontrol edin.'}
            actionLabel="Tekrar Dene"
            onAction={refetch}
          />
        ) : (
          <FlatList
            key={selectedMuscle || 'all'}
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Reanimated.View entering={FadeInUp.duration(200)}>
                <EmptyState
                  title="Egzersiz bulunamadı"
                  description="Arama kriterinize uygun bir hareket mevcut değil."
                />
              </Reanimated.View>
            }
            renderItem={({ item, index }) => {
              const isAlreadyInDraft = isReplaceMode
                ? isExerciseAlreadyInDraft(item, replaceIndex)
                : isExerciseAlreadyInDraft(item);
              const isSelected = selectedExercises.some((e) => e.id === item.id);
              const isBw = Boolean(
                item.is_bodyweight || item.bw || item.analysis?.load_mode === 'bodyweight'
              );
              const isWeighted = Boolean(
                !isBw && (
                  item.weighted ||
                  item.analysis?.load_mode === 'bodyweight_plus_external' ||
                  item.id.includes('weighted') ||
                  item.name.toLowerCase().includes('ağırlıklı') ||
                  item.name.toLowerCase().includes('weighted')
                )
              );

              return (
                <Reanimated.View
                  key={item.id}
                  entering={FadeInUp.delay(Math.min(index * 22, 160))
                    .duration(180)
                    .easing(ReanimatedEasing.out(ReanimatedEasing.cubic))}
                >
                  <TouchableOpacity
                    style={[
                      styles.itemCard,
                      isSelected && styles.itemCardSelected,
                      isAlreadyInDraft && styles.itemCardDisabled,
                    ]}
                    onPress={() => handleItemPress(item)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.itemLeftGroup}>
                      {/* Sol: Animasyonlu GIF / Egzersiz Görsel Çerçevesi (En Solda, Boş) */}
                      <View style={styles.thumbnailFrame} />

                      {/* Egzersiz Bilgileri */}
                      <View style={styles.itemInfo}>
                        <Text
                          style={[
                            styles.itemName,
                            isSelected && styles.itemNameSelected,
                            isAlreadyInDraft && styles.itemNameDisabled,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <View style={styles.itemMeta}>
                          <View style={styles.muscleBadge}>
                            <Text style={styles.muscleBadgeText}>
                              {item.muscle || item.muscle_group}
                            </Text>
                          </View>
                          {isBw ? (
                            <View style={styles.bwTag}>
                              <Text style={styles.bwTagText}>Vücut Ağırlığı</Text>
                            </View>
                          ) : isWeighted ? (
                            <View style={styles.weightedTag}>
                              <Text style={styles.weightedTagText}>Ağırlıklı</Text>
                            </View>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {/* Sağ Taraf: Ekli, Değiştirme Modunda 'Seç', Çoklu Seçimde + / ✓ */}
                    {isAlreadyInDraft ? (
                      <View style={styles.alreadyAddedBadge}>
                        <Text style={styles.alreadyAddedText}>Ekli</Text>
                      </View>
                    ) : isReplaceMode ? (
                      <View style={styles.replaceTag}>
                        <Text style={styles.replaceTagText}>Seç</Text>
                      </View>
                    ) : (
                      <Text style={[styles.addIcon, isSelected && styles.addIconSelected]}>
                        {isSelected ? '✓' : '+'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </Reanimated.View>
              );
            }}
          />
        )}

        {/* ─── ALT YAPIŞKAN: TOPLU SEÇİMİ ONAYLAMA BUTONU (Yalnızca Çoklu Seçim Modunda) ─── */}
        {!isReplaceMode && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={handleConfirmSelection}
              disabled={!hasSelection}
              activeOpacity={0.82}
              style={styles.confirmTouchable}
            >
              <Reanimated.View style={[styles.confirmBtn, animatedBtnStyle]}>
                {hasSelection ? (
                  <Reanimated.View
                    key="active"
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.confirmContentRow}
                  >
                    <Text style={styles.confirmBtnTextActive}>Egzersizleri Ekle</Text>
                    <Reanimated.View
                      key={`count-${selectedExercises.length}`}
                      entering={ZoomIn.duration(180)}
                      style={styles.confirmCountBadge}
                    >
                      <Text style={styles.confirmCountBadgeText}>
                        {selectedExercises.length}
                      </Text>
                    </Reanimated.View>
                  </Reanimated.View>
                ) : (
                  <Reanimated.View
                    key="idle"
                    entering={FadeIn.duration(200)}
                    exiting={FadeOut.duration(150)}
                    style={styles.confirmContentRow}
                  >
                    <Text style={styles.confirmBtnTextDisabled}>Egzersizleri Seç</Text>
                  </Reanimated.View>
                )}
              </Reanimated.View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B14',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0A0D18',
  },
  backBtn: {
    borderWidth: 1.5,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: Typography.small,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  title: {
    fontSize: Typography.heading - 2,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  counterBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  counterBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#34D399',
  },
  searchContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    backgroundColor: '#101524',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    fontSize: Typography.label,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: Spacing.two,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: Radius.lg,
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedFilterChip: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    borderColor: '#C084FC',
  },
  filterText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: '#94A3B8',
  },
  selectedFilterText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 90,
  },
  // Eski liste kart tasarımı (temiz, düz, gölgesiz)
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: '#101524',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.two,
  },
  itemCardSelected: {
    borderColor: '#10B981', // Neon Yeşil Çerçeve
    borderWidth: 1.5,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  itemCardDisabled: {
    opacity: 0.65,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    backgroundColor: '#0c101c',
  },
  itemNameDisabled: {
    color: '#94A3B8',
  },
  alreadyAddedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.28)',
  },
  alreadyAddedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  itemLeftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnailFrame: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#101424',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    overflow: 'hidden',
  },
  replaceTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1.2,
    borderColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  replaceTagText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  itemNameSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  muscleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muscleBadgeText: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '700',
  },
  bwTag: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bwTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.2,
  },
  weightedTag: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightedTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.2,
  },
  // Sağdaki + ikonu (normalde mor, seçildiğinde yeşil)
  addIcon: {
    fontSize: 24,
    color: '#C084FC',
    fontWeight: '600',
    paddingLeft: Spacing.two,
  },
  addIconSelected: {
    color: '#10B981',
    fontWeight: '800',
  },
  loadingContainer: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  skeletonItem: {
    marginBottom: Spacing.two,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0C101D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmTouchable: {
    width: '100%',
  },
  confirmBtn: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  confirmContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnTextActive: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: -0.1,
  },
  confirmBtnTextDisabled: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: -0.1,
  },
  confirmCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1.2,
    borderColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCountBadgeText: {
    fontSize: 11.5,
    fontWeight: '900',
    color: '#34D399',
  },
});
