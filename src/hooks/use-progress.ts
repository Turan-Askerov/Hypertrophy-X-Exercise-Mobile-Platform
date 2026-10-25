import { useQuery } from '@tanstack/react-query';
import { progressApi } from '@/api/progress';
import type { ProgressChartResponse, ProgressResponse } from '@/types/progress';

export const PROGRESS_KEY = ['progress'];
export const PROGRESS_CHART_KEY = (exercise: string) => ['progress', 'chart', exercise];

export function useProgress(selectedExercise: string = 'Bulgarian Split Squat') {
  const progressQuery = useQuery<ProgressResponse>({
    queryKey: PROGRESS_KEY,
    queryFn: () => progressApi.getProgress(),
  });

  const chartQuery = useQuery<ProgressChartResponse>({
    queryKey: PROGRESS_CHART_KEY(selectedExercise),
    queryFn: () => progressApi.getExerciseChart({ exercise: selectedExercise }),
    enabled: Boolean(selectedExercise),
  });

  return {
    progress: progressQuery.data,
    topProgress: progressQuery.data?.top_progress ?? [],
    personalRecords: progressQuery.data?.personal_records ?? [],
    chartData: chartQuery.data,
    isLoading: progressQuery.isLoading,
    isChartLoading: chartQuery.isLoading,
    refetch: () => {
      progressQuery.refetch();
      chartQuery.refetch();
    },
  };
}
