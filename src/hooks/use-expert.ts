import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expertApi } from '@/api/expert';
import type {
  ExpertDataState,
  SaveEquipmentPreferencesRequest,
  SaveGoalsRequest,
  SaveGymRequest,
  SaveMovementPreferencesRequest,
} from '@/types/expert';

export const EXPERT_DATA_QUERY_KEY = ['expert', 'data'];

export function useExpertData() {
  const queryClient = useQueryClient();

  const query = useQuery<ExpertDataState>({
    queryKey: EXPERT_DATA_QUERY_KEY,
    queryFn: () => expertApi.getExpertData(),
    staleTime: 1000 * 60 * 2, // 2 dk
  });

  const createGymMutation = useMutation({
    mutationFn: (data: SaveGymRequest) => expertApi.createGym(data),
    onSuccess: (updatedState) => {
      queryClient.setQueryData(EXPERT_DATA_QUERY_KEY, updatedState);
    },
  });

  const updateGymMutation = useMutation({
    mutationFn: ({ gymId, data }: { gymId: string; data: SaveGymRequest }) =>
      expertApi.updateGym(gymId, data),
    onSuccess: (updatedState) => {
      queryClient.setQueryData(EXPERT_DATA_QUERY_KEY, updatedState);
    },
  });

  const deleteGymMutation = useMutation({
    mutationFn: (gymId: string) => expertApi.deleteGym(gymId),
    onSuccess: (updatedState) => {
      queryClient.setQueryData(EXPERT_DATA_QUERY_KEY, updatedState);
    },
  });

  const saveEquipmentMutation = useMutation({
    mutationFn: (data: SaveEquipmentPreferencesRequest) =>
      expertApi.saveEquipmentPreferences(data),
    onSuccess: (updatedState) => {
      queryClient.setQueryData(EXPERT_DATA_QUERY_KEY, updatedState);
    },
  });

  const saveMovementMutation = useMutation({
    mutationFn: (data: SaveMovementPreferencesRequest) =>
      expertApi.saveMovementPreferences(data),
    onSuccess: (updatedState) => {
      queryClient.setQueryData(EXPERT_DATA_QUERY_KEY, updatedState);
    },
  });

  const saveGoalsMutation = useMutation({
    mutationFn: (data: SaveGoalsRequest) => expertApi.saveGoals(data),
    onSuccess: (updatedState) => {
      queryClient.setQueryData(EXPERT_DATA_QUERY_KEY, updatedState);
    },
  });

  return {
    ...query,
    expertData: query.data,
    createGymMutation,
    updateGymMutation,
    deleteGymMutation,
    saveEquipmentMutation,
    saveMovementMutation,
    saveGoalsMutation,
  };
}
