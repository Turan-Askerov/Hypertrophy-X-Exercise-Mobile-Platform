import { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <EmptyState
                title="Egzersiz bulunamadı"
                description="Arama kriterinize uygun bir hareket mevcut değil."
              />
            }
            renderItem={({ item }) => {
              const isSelected = selectedExercises.some((e) => e.id === item.id);

              return (
                <TouchableOpacity
                  style={[
                    styles.itemCard,
                    isSelected && styles.itemCardSelected,
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
                        ]}
                      >
                        {item.name}
                      </Text>
                      <View style={styles.itemMeta}>
                        <Text style={styles.itemMuscle}>
                          {item.muscle || item.muscle_group}
                        </Text>
                        {item.is_bodyweight || item.bw ? (
                          <View style={styles.bwTag}>
                            <Text style={styles.bwTagText}>BW</Text>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* Sağ Taraf: Değiştirme Modunda 'Seç', Çoklu Seçimde + */}
                  {isReplaceMode ? (
                    <View style={styles.replaceTag}>
                      <Text style={styles.replaceTagText}>Seç</Text>
                    </View>
                  ) : (
                    <Text style={[styles.addIcon, isSelected && styles.addIconSelected]}>
                      +
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* ─── ALT YAPIŞKAN: TOPLU SEÇİMİ ONAYLAMA BUTONU (Yalnızca Çoklu Seçim Modunda) ─── */}
        {!isReplaceMode && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                selectedExercises.length > 0
                  ? styles.confirmBtnActive
                  : styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirmSelection}
              disabled={selectedExercises.length === 0}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  selectedExercises.length > 0
                    ? styles.confirmBtnTextActive
                    : styles.confirmBtnTextDisabled,
                ]}
              >
                {selectedExercises.length > 0
                  ? `Egzersizleri Ekle (${selectedExercises.length})`
                  : 'Egzersizleri Seç'}
              </Text>
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
    gap: Spacing.two,
  },
  itemMuscle: {
    fontSize: Typography.small,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bwTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bwTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C084FC',
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
  confirmBtn: {
    height: 48,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnActive: {
    borderColor: '#10B981', // Neon Yeşil Çerçeve (gölgesiz)
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  confirmBtnDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  confirmBtnText: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  confirmBtnTextActive: {
    color: '#34D399',
  },
  confirmBtnTextDisabled: {
    color: '#64748B',
  },
});
