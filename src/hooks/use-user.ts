import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { usersApi } from '@/api/users';
import {
  parseCustomSessionTypes,
  serializeWithCustomSessionTypes,
} from '@/lib/custom-session-types';
import type {
  ChangePasswordConfirmRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  EmailConfirmRequest,
  EmailUpdateRequest,
  RequestDeleteAccountRequest,
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

  const customSessionTypes = useMemo(
    () => parseCustomSessionTypes(user?.dashboard_preferences),
    [user?.dashboard_preferences],
  );

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfile) => usersApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(USER_QUERY_KEY, updatedUser);
    },
  });

  const customSessionTypesMutation = useMutation({
    mutationFn: (custom_session_types: string[]) =>
      usersApi.updateCustomSessionTypes({ custom_session_types }),
    onMutate: async (nextCustomTypes) => {
      await queryClient.cancelQueries({ queryKey: USER_QUERY_KEY });
      const previousUser = queryClient.getQueryData<User>(USER_QUERY_KEY);
      if (previousUser) {
        queryClient.setQueryData<User>(USER_QUERY_KEY, {
          ...previousUser,
          dashboard_preferences: serializeWithCustomSessionTypes(
            previousUser.dashboard_preferences,
            nextCustomTypes,
          ),
        });
      }
      return { previousUser };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(USER_QUERY_KEY, context.previousUser);
      }
    },
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

  const deleteAccountReqMutation = useMutation({
    mutationFn: (data: RequestDeleteAccountRequest) =>
      usersApi.requestDeleteAccount(data),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: (data: DeleteAccountRequest) => usersApi.deleteAccount(data),
  });

  return {
    user,
    customSessionTypes,
    loading: isLoading,
    error: isError ? (error as Error) : null,
    refetch,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    updateCustomSessionTypes: customSessionTypesMutation.mutateAsync,
    isUpdatingCustomSessionTypes: customSessionTypesMutation.isPending,
    requestEmailUpdate: emailUpdateReqMutation.mutateAsync,
    isRequestingEmail: emailUpdateReqMutation.isPending,
    confirmEmailUpdate: emailUpdateConfirmMutation.mutateAsync,
    isConfirmingEmail: emailUpdateConfirmMutation.isPending,
    requestChangePassword: changePasswordReqMutation.mutateAsync,
    isRequestingPassword: changePasswordReqMutation.isPending,
    confirmChangePassword: changePasswordConfirmMutation.mutateAsync,
    isConfirmingPassword: changePasswordConfirmMutation.isPending,
    requestDeleteAccount: deleteAccountReqMutation.mutateAsync,
    isRequestingDeleteAccount: deleteAccountReqMutation.isPending,
    deleteAccount: deleteAccountMutation.mutateAsync,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
}
