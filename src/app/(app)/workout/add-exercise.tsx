import { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useExercises } from '@/hooks/use-exercises';
import { workoutDraft } from '@/lib/workout-draft';
import type { Exercise } from '@/types/exercise';

export default function AddExerciseScreen() {
  const router = useRouter();
  const { exercises, muscleGroups, loading, error, refetch } = useExercises();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

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

  const handleSelectExercise = (exercise: Exercise) => {
    workoutDraft.addExercise(exercise);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Başlık ve Geri */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.backBtnText}>‹ Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Egzersiz Seç</Text>
          <View style={{ width: 48 }} />
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

        {/* Liste */}
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
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => handleSelectExercise(item)}
                activeOpacity={0.7}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
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
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    borderBottomColor: AppColors.border,
  },
  backBtn: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  backBtnText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: AppColors.primary,
  },
  title: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.light.text,
  },
  searchContainer: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  searchInput: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: Typography.label,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  filtersWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
    paddingBottom: Spacing.two,
  },
  filtersScroll: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  selectedFilterChip: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  filterText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  selectedFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    paddingBottom: Spacing.six,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginBottom: Spacing.two,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.light.text,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  itemMuscle: {
    fontSize: Typography.small,
    color: Colors.light.textSecondary,
  },
  bwTag: {
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  bwTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: AppColors.primary,
  },
  addIcon: {
    fontSize: 24,
    color: AppColors.primary,
    fontWeight: '600',
    paddingLeft: Spacing.two,
  },
  loadingContainer: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  skeletonItem: {
    marginBottom: Spacing.two,
  },
});
