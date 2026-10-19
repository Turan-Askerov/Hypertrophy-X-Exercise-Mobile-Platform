import { isAdminAccount } from "../auth/account-kind.ts";
import type {
  ForgotPasswordResponse,
  RegisterConfirmResponse,
  RegisterStartResponse,
  ResetPasswordResponse,
  VerifyResetCodeResponse,
} from "../types/auth";
import type { LoginResponse, UserLoginResponse } from "../types/user";
import { ApiError } from "./api-error.ts";
import type { createApiClient } from "./api-client.ts";

export type ApiCaller = ReturnType<typeof createApiClient>;

export function createAuthApi(client: ApiCaller) {
  async function login(username: string, password: string): Promise<UserLoginResponse> {
    const res = await client.call<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: { username: username.trim(), password },
      auth: false,
    });
    if (isAdminAccount(res) || !("role" in res)) {
      throw new ApiError({
        kind: "client",
        message: "Bu hesap mobil uygulamada desteklenmiyor.",
      });
    }
    return res;
  }

  function startRegistration(username: string, password: string, email: string) {
    return client.call<RegisterStartResponse>("/api/auth/register", {
      method: "POST",
      body: { username: username.trim(), password, email: email.trim() },
      auth: false,
    });
  }

  function confirmRegistration(ticket: string, code: string) {
    return client.call<RegisterConfirmResponse>("/api/auth/register/confirm", {
      method: "POST",
      body: { token: ticket, code: code.trim() },
      auth: false,
    });
  }

  function forgotPassword(emailOrUsername: string) {
    return client.call<ForgotPasswordResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: { email_or_username: emailOrUsername.trim() },
      auth: false,
    });
  }

  function verifyResetCode(resetToken: string, code: string) {
    return client.call<VerifyResetCodeResponse>("/api/auth/verify-reset-code", {
      method: "POST",
      body: { reset_token: resetToken, code: code.trim() },
      auth: false,
    });
  }

  function resetPassword(verifiedToken: string, newPassword: string) {
    return client.call<ResetPasswordResponse>("/api/auth/reset-password", {
      method: "POST",
      body: { verified_token: verifiedToken, new_password: newPassword },
      auth: false,
    });
  }

  return {
    login,
    startRegistration,
    confirmRegistration,
    forgotPassword,
    verifyResetCode,
    resetPassword,
  };
}