import type { User } from "./user";

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


// Kayıt 1. adım: "token" burada bir İŞLEM BİLETİDİR (JWT değil).
export type RegisterStartResponse = {
  success: boolean;
  token: string;
  masked_email: string;
  message: string;
};

// Kayıt 2. adım: "token" burada JWT'dir ve kullanıcı iç içe gelir (girişteki gibi düz değil).
export type RegisterConfirmResponse = {
  success: boolean;
  message: string;
  token: string;
  user: User;
  username: string;
};