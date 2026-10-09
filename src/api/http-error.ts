import type { ApiErrorInfo } from "../types/common";

// Backend hataları genelde {"detail": "mesaj"} biçiminde gelir.
// 422'de detail bir liste olur, o durumda undefined döner.
function extractDetail(body: unknown): string | undefined {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = body.detail;
    if (typeof detail === "string") return detail;
  }
  return undefined;
}

export function httpErrorFrom(
  status: number,
  body: unknown,
  retryAfter: string | null
): ApiErrorInfo {
  const detailText = extractDetail(body);

  if (status === 429) {
    const seconds = Number(retryAfter);
    const retryAfterSeconds =
      retryAfter !== null && Number.isFinite(seconds) && seconds > 0
        ? seconds
        : undefined;
    return {
      kind: "rate-limited",
      message: "Çok fazla istek gönderildi. Lütfen biraz bekleyin.",
      status,
      retryAfterSeconds,
    };
  }

  if (status === 401) {
    return {
      kind: "unauthorized",
      message: detailText ?? "Yetkisiz erişim. Lütfen tekrar giriş yapın.",
      status,
    };
  }

  if (status === 422) {
    return {
      kind: "validation",
      message: "Girilen bilgiler geçersiz.",
      status,
    };
  }

  if (status >= 500 && status < 600) {
    return {
      kind: "server",
      message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.",
      status,
    };
  }

  if (status >= 400 && status < 500) {
    return {
      kind: "client",
      message: detailText ?? `İstek tamamlanamadı (${status}).`,
      status,
    };
  }

  return {
    kind: "unknown",
    message: "Bilinmeyen bir hata oluştu.",
    status,
  };
}