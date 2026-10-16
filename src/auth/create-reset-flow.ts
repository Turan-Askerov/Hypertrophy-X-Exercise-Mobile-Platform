import { ApiError } from "../api/api-error.ts";
import type {
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetCodeResponse,
} from "../types/auth";

export type CodeStep = {
  step: "code";
  identifier: string;
  resetToken: string;
  maskedEmail: string;
  expiresInMinutes: number;
};

export type NewPasswordStep = { step: "newPassword"; verifiedToken: string };

export type ResetStep =
  | { step: "identify" }
  | CodeStep
  | NewPasswordStep
  | { step: "done" };

export type ResetDeps = {
  authApi: {
    forgotPassword: (identifier: string) => Promise<ForgotPasswordResponse>;
    verifyResetCode: (resetToken: string, code: string) => Promise<VerifyResetCodeResponse>;
    resetPassword: (verifiedToken: string, newPassword: string) => Promise<ResetPasswordResponse>;
  };
};

function ensureSuccess(res: { success: boolean; message: string }): void {
  if (!res.success) {
    throw new ApiError({ kind: "client", message: res.message });
  }
}

export function createResetFlow(deps: ResetDeps) {
  async function requestCode(identifier: string): Promise<CodeStep> {
    const res = await deps.authApi.forgotPassword(identifier);
    ensureSuccess(res);
    return {
      step: "code",
      identifier,
      resetToken: res.reset_token,
      maskedEmail: res.masked_email,
      expiresInMinutes: res.expires_in_minutes,
    };
  }

  function resend(current: CodeStep): Promise<CodeStep> {
    return requestCode(current.identifier);
  }

  async function submitCode(current: CodeStep, code: string): Promise<NewPasswordStep> {
    const res = await deps.authApi.verifyResetCode(current.resetToken, code);
    ensureSuccess(res);
    return { step: "newPassword", verifiedToken: res.verified_token };
  }

  async function submitNewPassword(
    current: NewPasswordStep,
    newPassword: string
  ): Promise<ResetStep> {
    const res = await deps.authApi.resetPassword(current.verifiedToken, newPassword);
    ensureSuccess(res);
    return { step: "done" };
  }

  return { requestCode, resend, submitCode, submitNewPassword };
}