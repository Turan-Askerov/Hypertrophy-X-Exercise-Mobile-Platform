import { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { HistoryCard } from '@/components/workout/history-card';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useWorkouts } from '@/hooks/use-workouts';
import { workoutDraft } from '@/lib/workout-draft';
import type { Workout } from '@/types/workout';

export default function HistoryScreen() {
  const router = useRouter();
  const { workouts, loading, error, refetch, deleteWorkout, isDeleting } =
    useWorkouts();

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleEdit = (workout: Workout) => {
    workoutDraft.loadWorkout(workout);
    router.push('/(app)/(tabs)/workout');
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteWorkout(deleteTargetId);
      setDeleteTargetId(null);
    } catch (err: any) {
      Alert.alert(
        'Hata',
        err?.message || 'Antrenman silinirken bir sorun oluştu.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/(tabs)/history'))}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.backBtnText}>‹ Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Antrenman Geçmişi</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <View style={styles.list}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              height={100}
              borderRadius={Radius.md}
              style={styles.skeleton}
            />
          ))}
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error.message || 'Geçmiş yüklenemedi.'}
          </Text>
          <Button onPress={() => refetch()}>Tekrar dene</Button>
        </View>
      ) : workouts.length === 0 ? (
        <EmptyState
          title="Henüz kayıt yok"
          description="İlk antrenmanını kaydettiğinde burada görünecek."
          actionLabel="Hemen Antrenman Yap"
          onAction={() => router.push('/(app)/(tabs)/workout')}
        />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <HistoryCard
              workout={item}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Silme Onay Diyaloğu */}
      <ConfirmDialog
        visible={deleteTargetId !== null}
        title="Antrenmanı Sil"
        message="Bu antrenman kaydı kalıcı olarak silinecek. Emin misiniz?"
        confirmText="Sil"
        destructive
        busy={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  list: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  skeleton: {
    marginBottom: Spacing.two,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  errorText: {
    fontSize: Typography.body,
    color: Colors.light.text,
    textAlign: 'center',
  },
});
