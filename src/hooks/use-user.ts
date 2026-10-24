import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/api/users';
import type {
  ChangePasswordConfirmRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  EmailConfirmRequest,
  EmailUpdateRequest,
  User,
  UserProfile,
} from '@/types/user';

export const USER_QUERY_KEY = ['user', 'me'];

export function useUser() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, error, refetch } = useQuery<User>({
    queryKey: USER_QUERY_KEY,
    queryFn: () => usersApi.getMe(),
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfile) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_QUERY_KEY, updatedUser);
    },
  });

  const emailUpdateReqMutation = useMutation({
    mutationFn: (data: EmailUpdateRequest) => usersApi.requestEmailUpdate(data),
  });

  const emailUpdateConfirmMutation = useMutation({
    mutationFn: (data: EmailConfirmRequest) => usersApi.confirmEmailUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
  });

  const changePasswordReqMutation = useMutation({
    mutationFn: (data: ChangePasswordRequest) => usersApi.requestChangePassword(data),
  });

  const changePasswordConfirmMutation = useMutation({
    mutationFn: (data: ChangePasswordConfirmRequest) =>
      usersApi.confirmChangePassword(data),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (data: DeleteAccountRequest) => usersApi.deleteAccount(data),
  });

  return {
    user,
    loading: isLoading,
    error: isError ? (error as Error) : null,
    refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    requestEmailUpdate: emailUpdateReqMutation.mutateAsync,
    isRequestingEmail: emailUpdateReqMutation.isPending,
    confirmEmailUpdate: emailUpdateConfirmMutation.mutateAsync,
    isConfirmingEmail: emailUpdateConfirmMutation.isPending,
    requestChangePassword: changePasswordReqMutation.mutateAsync,
    isRequestingPassword: changePasswordReqMutation.isPending,
    confirmChangePassword: changePasswordConfirmMutation.mutateAsync,
    isConfirmingPassword: changePasswordConfirmMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
