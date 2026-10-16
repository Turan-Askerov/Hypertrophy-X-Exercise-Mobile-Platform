import { ApiError } from "../api/api-error.ts";
import type { RegisterConfirmResponse, RegisterStartResponse } from "../types/auth";
import type { User } from "../types/user";

export type RegistrationForm = {
  username: string;
  password: string;
  email: string;
};

export type RegistrationCodeStep = {
  step: "code";
  form: RegistrationForm; // "tekrar gönder" için bellekte tutulur
  ticket: string; // sunucunun verdiği işlem bileti
  maskedEmail: string;
};

export type RegistrationResult = {
  token: string;
  user: User;
};

export type RegistrationDeps = {
  authApi: {
    startRegistration: (
      username: string,
      password: string,
      email: string
    ) => Promise<RegisterStartResponse>;
    confirmRegistration: (ticket: string, code: string) => Promise<RegisterConfirmResponse>;
  };
};

export function createRegistrationFlow(deps: RegistrationDeps) {
  async function start(form: RegistrationForm): Promise<RegistrationCodeStep> {
    const res = await deps.authApi.startRegistration(form.username, form.password, form.email);
    if (!res.success) {
      throw new ApiError({ kind: "client", message: res.message });
    }
    return { step: "code", form, ticket: res.token, maskedEmail: res.masked_email };
  }

  // Sunucuda ayrı bir "tekrar gönder" ucu yok: kaydı yeniden başlatmak eski talebi
  // geçersiz kılıp yeni bilet ve yeni kod verir.
  function resend(current: RegistrationCodeStep): Promise<RegistrationCodeStep> {
    return start(current.form);
  }

  async function confirm(
    current: RegistrationCodeStep,
    code: string
  ): Promise<RegistrationResult> {
    const res = await deps.authApi.confirmRegistration(current.ticket, code);
    if (!res.success) {
      throw new ApiError({ kind: "client", message: res.message });
    }
    if (!res.token || !res.user) {
      throw new ApiError({
        kind: "client",
        message: "Sunucudan beklenmeyen bir cevap geldi.",
      });
    }
    return { token: res.token, user: res.user };
  }

  return { start, resend, confirm };
}