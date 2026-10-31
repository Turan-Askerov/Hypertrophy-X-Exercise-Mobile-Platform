import type {
  ChangePasswordConfirmRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  DeleteAccountRequest,
  EmailConfirmRequest,
  EmailUpdateRequest,
  EmailUpdateResponse,
  RequestDeleteAccountRequest,
  RequestDeleteAccountResponse,
  User,
  UserProfile,
} from "../types/user.ts";
import type { ApiCaller } from "./create-auth-api.ts";

export function createUsersApi(client: ApiCaller) {
  function getMe(): Promise<User> {
    return client.call<User>("/api/user", { method: "GET", auth: true });
  }

  function updateProfile(data: UserProfile): Promise<User> {
    return client.call<User>("/api/user", {
      method: "POST",
      body: data,
      auth: true,
    });
  }

  function requestEmailUpdate(
    data: EmailUpdateRequest
  ): Promise<EmailUpdateResponse> {
    return client.call<EmailUpdateResponse>("/api/user/email/request-update", {
      method: "POST",
      body: data,
      auth: true,
    });
  }

  function confirmEmailUpdate(
    data: EmailConfirmRequest
  ): Promise<{ success: boolean; email: string; message: string }> {
    return client.call<{ success: boolean; email: string; message: string }>(
      "/api/user/email/confirm-update",
      {
        method: "POST",
        body: data,
        auth: true,
      }
    );
  }

  function requestChangePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    return client.call<ChangePasswordResponse>(
      "/api/auth/change-password/request",
      {
        method: "POST",
        body: data,
        auth: true,
      }
    );
  }

  function confirmChangePassword(
    data: ChangePasswordConfirmRequest
  ): Promise<{ success: boolean; message: string }> {
    return client.call<{ success: boolean; message: string }>(
      "/api/auth/change-password/confirm",
      {
        method: "POST",
        body: data,
        auth: true,
      }
    );
  }

  function requestDeleteAccount(
    data: RequestDeleteAccountRequest
  ): Promise<RequestDeleteAccountResponse> {
    return client.call<RequestDeleteAccountResponse>(
      "/api/user/delete-account/request",
      {
        method: "POST",
        body: data,
        auth: true,
      }
    );
  }

  function deleteAccount(
    data: DeleteAccountRequest
  ): Promise<{ success: boolean; message: string }> {
    return client.call<{ success: boolean; message: string }>(
      "/api/user/delete-account",
      {
        method: "POST",
        body: data,
        auth: true,
      }
    );
  }

  return {
    getMe,
    updateProfile,
    requestEmailUpdate,
    confirmEmailUpdate,
    requestChangePassword,
    confirmChangePassword,
    requestDeleteAccount,
    deleteAccount,
  };
}
