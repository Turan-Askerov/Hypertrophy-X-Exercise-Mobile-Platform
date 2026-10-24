import { useQuery } from '@tanstack/react-query';

import { exercisesApi } from '@/api/exercises';
import type { ExercisesResponse } from '@/types/exercise';

export const EXERCISES_QUERY_KEY = ['exercises', 'catalog'];

export function useExercises() {
  const { data, isLoading, isError, error, refetch } = useQuery<ExercisesResponse>({
    queryKey: EXERCISES_QUERY_KEY,
    queryFn: () => exercisesApi.listExercises(),
    staleTime: 1000 * 60 * 60, // Katalog nadiren değiştiği için 1 saat cache
  });

  return {
    exercises: data?.exercises ?? [],
    muscleGroups: data?.muscle_groups ?? [],
    loading: isLoading,
    error: isError ? (error as Error) : null,
    refetch,
  };
}
