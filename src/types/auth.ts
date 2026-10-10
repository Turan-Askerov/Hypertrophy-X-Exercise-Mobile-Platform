export type ForgotPasswordResponse = {
  success: boolean;
  reset_token: string;
  masked_email: string;
  expires_in_minutes: number;
  message: string;
};

export type VerifyResetCodeResponse = {
  success: boolean;
  verified_token: string;
  message: string;
};

export type ResetPasswordResponse = {
  success: boolean;
  message: string;
};