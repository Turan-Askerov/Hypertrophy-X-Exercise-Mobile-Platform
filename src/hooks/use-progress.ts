import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/api/progress';
import type { PersonalRecordItem, ProgressChartResponse, ProgressResponse } from '@/types/progress';
import type { Workout } from '@/types/workout';

export const PROGRESS_KEY = ['progress'];
export const PROGRESS_CHART_KEY = (exercise: string, exerciseId?: string) => [
  'progress',
  'chart',
  exerciseId || exercise,
];

export type LatestExerciseResult = {
  id: string;
  name: string;
};

/**
 * Kullanıcının girmiş olduğu son antrenmanın ilk hareketini belirler (Web versiyonu ile 1:1 uyumlu).
 * 1. Öncelik: En güncel antrenmanın ilk hareketi (workouts listesindeki en son tarihli antrenman)
 * 2. Öncelik: Kişisel rekorlar (personal_records) listesinin ilk elemanı (backend'de son antrenmanın ilk hareketi olarak sıralanır)
 * 3. Öncelik: Egzersiz havuzunun ilk hareketi veya varsayılan Bench Press
 */
export function getLatestWorkoutFirstExercise(
  workouts?: Workout[],
  personalRecords?: PersonalRecordItem[],
  selectableExercises?: { id: string; name: string }[]
): LatestExerciseResult | null {
  // 1. Antrenmanlar listesinden en son antrenmanın ilk hareketini bul
  if (workouts && workouts.length > 0) {
    const sorted = [...workouts].sort((a, b) => {
      const timeA = new Date(a.date).getTime() || 0;
      const timeB = new Date(b.date).getTime() || 0;
      return timeB - timeA;
    });

    for (const w of sorted) {
      if (w.exercises && w.exercises.length > 0) {
        for (const ex of w.exercises) {
          const rawName = (ex.exercise_name || ex.canonical_exercise_id || ex.exercise_id || '').trim();
          if (!rawName) continue;
          const cleanName = rawName
            .replace(/\s*\((?:vücut ağırlığı|vucut agirligi|ağırlıklı|agirlikli|bodyweight|weighted)\)/gi, '')
            .trim();
          const rawId = ex.canonical_exercise_id || ex.exercise_id || cleanName.toLowerCase().replace(/\s+/g, '-');

          // selectableExercises içinde tam eşleşen resmi adı ve id'yi bul
          const matched = selectableExercises?.find(
            (item) =>
              item.id.toLowerCase() === rawId.toLowerCase() ||
              item.name.toLowerCase() === cleanName.toLowerCase()
          );

          return {
            id: matched?.id || rawId,
            name: matched?.name || cleanName,
          };
        }
      }
    }
  }

  // 2. Kişisel rekorlar (PR) listesinin ilk hareketi (Web platformundaki data.personal_records[0] mantığı)
  if (personalRecords && personalRecords.length > 0) {
    const firstPr = personalRecords[0];
    const rawName = (firstPr.exercise || '').trim();
    if (rawName) {
      const cleanName = rawName
        .replace(/\s*\((?:vücut ağırlığı|vucut agirligi|ağırlıklı|agirlikli|bodyweight|weighted)\)/gi, '')
        .trim();
      const rawId = firstPr.exercise_id || cleanName.toLowerCase().replace(/\s+/g, '-');
      const matched = selectableExercises?.find(
        (item) =>
          item.id.toLowerCase() === rawId.toLowerCase() ||
          item.name.toLowerCase() === cleanName.toLowerCase()
      );
      return {
        id: matched?.id || rawId,
        name: matched?.name || cleanName,
      };
    }
  }

  // 3. Hiç antrenman/PR yoksa egzersiz havuzunun ilk hareketi veya varsayılan hareket
  if (selectableExercises && selectableExercises.length > 0) {
    return {
      id: selectableExercises[0].id,
      name: selectableExercises[0].name,
    };
  }

  return {
    id: 'bench-press',
    name: 'Bench Press',
  };
}

export function useProgress(
  selectedExercise?: string,
  exerciseId?: string
) {
  const progressQuery = useQuery<ProgressResponse>({
    queryKey: PROGRESS_KEY,
    queryFn: () => progressApi.getProgress(),
  });

  const chartQuery = useQuery<ProgressChartResponse>({
    queryKey: PROGRESS_CHART_KEY(selectedExercise || '', exerciseId),
    queryFn: () =>
      progressApi.getExerciseChart({
        exercise_id: exerciseId || undefined,
        exercise: selectedExercise || '',
      }),
    enabled: Boolean(selectedExercise || exerciseId),
  });

  return {
    progress: progressQuery.data,
    topProgress: progressQuery.data?.top_progress ?? [],
    personalRecords: progressQuery.data?.personal_records ?? [],
    chartData: chartQuery.data,
    isLoading: progressQuery.isLoading,
    isChartLoading: chartQuery.isLoading,
    isError: progressQuery.isError || chartQuery.isError,
    isProgressError: progressQuery.isError,
    isChartError: chartQuery.isError,
    refetch: () => {
      progressQuery.refetch();
      chartQuery.refetch();
    },
  };
}
