import { useQuery } from '@tanstack/react-query';

import { workoutsApi } from '@/api/workouts';
import type { WorkoutListItem } from '@/types/workout';

export function useWorkouts() {
  const { data, isLoading, isError, refetch } = useQuery<WorkoutListItem[]>({
    queryKey: ['workouts', 'list'],
    queryFn: () => workoutsApi.list(),
  });

  return {
    workouts: data ?? [],
    loading: isLoading,
    error: isError,
    refetch,
  };
}