import { ApiError } from "../api/api-error.ts";

export type AuthFailure = {
  message: string;
  cooldownSeconds: number;
};

export function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} saniye`;
  return `${Math.ceil(seconds / 60)} dakika`;
}

export function authFailureFrom(err: unknown): AuthFailure {
  if (!(err instanceof ApiError)) {
    return { message: "Beklenmeyen bir hata oluştu.", cooldownSeconds: 0 };
  }

  switch (err.info.kind) {
    case "rate-limited": {
      const seconds = err.info.retryAfterSeconds;
      if (seconds === undefined) {
        return {
          message: "Çok fazla deneme yaptınız. Biraz sonra tekrar deneyin.",
          cooldownSeconds: 0,
        };
      }
      const wait = Math.ceil(seconds);
      return {
        message: `Çok fazla deneme yaptınız. ${formatWait(wait)} sonra tekrar deneyin.`,
        cooldownSeconds: wait,
      };
    }
    case "unauthorized":
      // Sunucu "kullanıcı bulunamadı" ve "şifre hatalı" arasında ayrım yapıyor.
      // Hesap varlığını sızdırmamak için tek bir mesaj gösteriyoruz.
      return { message: "Kullanıcı adı ya da şifre hatalı.", cooldownSeconds: 0 };
    default:
      return { message: err.message, cooldownSeconds: 0 };
  }
}