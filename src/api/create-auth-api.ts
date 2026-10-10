import { isAdminAccount } from "../auth/account-kind.ts";
import type { LoginResponse, RegisterResponse, UserLoginResponse } from "../types/user";
import type { createApiClient } from "./api-client.ts";
import { ApiError } from "./api-error.ts";


export type ApiCaller = ReturnType<typeof createApiClient>;

export function createAuthApi(client: ApiCaller) {
  async function login(username: string, password: string): Promise<UserLoginResponse> {
    // 1. client.call<LoginResponse>("/api/auth/login", { method: "POST", body: ..., auth: false })
    //    gövde: kullanıcı adı .trim(), şifre OLDUĞU GİBİ
    // 2. isAdminAccount(res) doğruysa YA DA !("role" in res) ise
    //    ApiError fırlat: { kind: "client", message: "Bu hesap mobil uygulamada desteklenmiyor." }
    // 3. res'i döndür (TypeScript burada res'in UserLoginResponse olduğunu bilir)
    return client.call<LoginResponse>("/api/auth/login", { method: "POST", body: { username: username.trim(), password }, auth: false })
      .then(res => {
        if (isAdminAccount(res) || !("role" in res)) {
          throw new ApiError({
            kind: "client",
            message: "Bu hesap mobil uygulamada desteklenmiyor.",
          });
        }
        return res;
      });
  }

  function register(username: string, password: string, email?: string) {
    // email'i kırp; boşsa gövdeye HİÇ koyma
    // ipucu: body: { username: ..., password, ...(cleanEmail ? { email: cleanEmail } : {}) }
    return client.call<RegisterResponse>("/api/auth/register", { method: "POST", body: { username: username.trim(), password, ...(email?.trim() ? { email: email.trim() } : {}) }, auth: false });
  } 

  function forgotPassword(emailOrUsername: string) {
    // POST /api/auth/forgot-password, gövde { email_or_username: kırpılmış }, auth: false
    return client.call("/api/auth/forgot-password", { method: "POST", body: { email_or_username: emailOrUsername.trim() }, auth: false });
  }

  function verifyResetCode(resetToken: string, code: string) {
    // POST /api/auth/verify-reset-code, gövde { reset_token, code: kırpılmış }, auth: false
    return client.call("/api/auth/verify-reset-code", { method: "POST", body: { reset_token: resetToken, code: code.trim() }, auth: false });
  }

  function resetPassword(verifiedToken: string, newPassword: string) {
    // POST /api/auth/reset-password, gövde { verified_token, new_password }, auth: false
    return client.call("/api/auth/reset-password", { method: "POST", body: { verified_token: verifiedToken, new_password: newPassword }, auth: false });
  }

  return { login, register, forgotPassword, verifyResetCode, resetPassword };
}