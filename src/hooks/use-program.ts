import { useMutation, useQueryClient } from '@tanstack/react-query';

import { programApi } from '@/api/program';
import { USER_QUERY_KEY } from '@/hooks/use-user';
import type { CustomProgramRequest, CustomProgramResponse } from '@/types/program';

export function useProgram() {
  const queryClient = useQueryClient();

  const saveProgramMutation = useMutation<
    CustomProgramResponse,
    Error,
    CustomProgramRequest
  >({
    mutationFn: (data: CustomProgramRequest) =>
      programApi.saveCustomProgram(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });

  return {
    saveCustomProgram: saveProgramMutation.mutateAsync,
    isSaving: saveProgramMutation.isPending,
  };
}
