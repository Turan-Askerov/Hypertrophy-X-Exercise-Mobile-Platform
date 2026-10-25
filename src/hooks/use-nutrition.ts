import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { nutritionApi } from '@/api/nutrition';
import type {
  NutritionHistoryItem,
  NutritionLog,
  NutritionLogPayload,
} from '@/types/nutrition';

export const NUTRITION_TODAY_KEY = ['nutrition', 'today'];
export const NUTRITION_HISTORY_KEY = ['nutrition', 'history'];

export function useNutrition() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery<{ success: boolean; log: NutritionLog }>({
    queryKey: NUTRITION_TODAY_KEY,
    queryFn: () => nutritionApi.getTodayNutrition(),
  });

  const historyQuery = useQuery<{ success: boolean; history: NutritionHistoryItem[] }>({
    queryKey: NUTRITION_HISTORY_KEY,
    queryFn: () => nutritionApi.getNutritionHistory(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: NutritionLogPayload) => nutritionApi.saveNutritionLog(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUTRITION_TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: NUTRITION_HISTORY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (dateStr: string) => nutritionApi.deleteNutritionLog(dateStr),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NUTRITION_TODAY_KEY });
      queryClient.invalidateQueries({ queryKey: NUTRITION_HISTORY_KEY });
    },
  });

  return {
    todayLog: todayQuery.data?.log ?? { calories: 0, protein: 0, carbs: 0, fat: 0 },
    history: historyQuery.data?.history ?? [],
    loading: todayQuery.isLoading || historyQuery.isLoading,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    saveLog: saveMutation.mutateAsync,
    deleteLog: deleteMutation.mutateAsync,
    refetch: () => {
      todayQuery.refetch();
      historyQuery.refetch();
    },
  };
}
