import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/api/progress';
import type { ProgressChartResponse, ProgressResponse } from '@/types/progress';

export const PROGRESS_KEY = ['progress'];
export const PROGRESS_CHART_KEY = (exercise: string, exerciseId?: string) => [
  'progress',
  'chart',
  exerciseId || exercise,
];

export function useProgress(
  selectedExercise: string = 'Overhead Press',
  exerciseId?: string
) {
  const progressQuery = useQuery<ProgressResponse>({
    queryKey: PROGRESS_KEY,
    queryFn: () => progressApi.getProgress(),
  });

  const chartQuery = useQuery<ProgressChartResponse>({
    queryKey: PROGRESS_CHART_KEY(selectedExercise, exerciseId),
    queryFn: () =>
      progressApi.getExerciseChart({
        exercise_id: exerciseId || undefined,
        exercise: selectedExercise,
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
