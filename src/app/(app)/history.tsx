import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWorkouts } from '@/hooks/use-workouts';
import { HistoryCard } from '@/components/workout/history-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';

export default function HistoryScreen() {
  const { workouts, loading, error, refetch } = useWorkouts();

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Antrenman Geçmişi</Text>
        </View>
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={90} radius={12} style={styles.skeleton} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Antrenman Geçmişi</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.errorText}>Geçmiş yüklenemedi.</Text>
          <Button title="Tekrar dene" onPress={() => refetch()} />
        </View>
      </SafeAreaView>
    );
  }

  if (workouts.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Antrenman Geçmişi</Text>
        </View>
        <EmptyState
          title="Henüz kayıt yok"
          description="İlk antrenmanını kaydettiğinde burada görünecek."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Antrenman Geçmişi</Text>
      </View>
      <FlatList
        data={workouts}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <HistoryCard workout={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 12 },
  skeleton: { marginBottom: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 16 },
  errorText: { fontSize: 16, color: '#111' },
});