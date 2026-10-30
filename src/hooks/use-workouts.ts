import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { workoutsApi } from '@/api/workouts';
import type { Workout, WorkoutCreate, WorkoutUpdate } from '@/types/workout';

export const WORKOUTS_QUERY_KEY = ['workouts', 'list'];

export function useWorkouts() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery<Workout[]>({
    queryKey: WORKOUTS_QUERY_KEY,
    queryFn: () => workoutsApi.listWorkouts(),
    staleTime: 1000 * 60 * 5, // 5 dakika boyunca taze kabul et (anında bellekten 0ms yüklenir)
    gcTime: 1000 * 60 * 30, // 30 dakika önbellekte tut
    refetchOnWindowFocus: false, // Odaklanmalarda gereksiz ağ isteklerini engelle
  });

  const saveMutation = useMutation({
    mutationFn: (newWorkout: WorkoutCreate) => workoutsApi.saveWorkout(newWorkout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUTS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkoutUpdate }) =>
      workoutsApi.updateWorkout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUTS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => workoutsApi.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WORKOUTS_QUERY_KEY });
    },
  });

  return {
    workouts: data ?? [],
    loading: isLoading,
    error: isError ? (error as Error) : null,
    refetch,
    saveWorkout: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    updateWorkout: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteWorkout: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
