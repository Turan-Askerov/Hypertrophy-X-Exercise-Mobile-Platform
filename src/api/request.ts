import { ApiError } from "./api-error.ts";
import { httpErrorFrom } from "./http-error.ts";
import { parseResponseBody } from "./parse-body.ts";
import { buildUrl, type QueryValue } from "./url.ts";

export type RequestDeps = {
  baseUrl: string;
  fetchImpl: typeof fetch;
};

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  body?: unknown;
  token?: string | null;
  timeoutMs?: number;
};

export async function request<T>(
  deps: RequestDeps,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  // 1. Seçenekleri çıkar, varsayılanları uygula
  const { method = "GET", query, body, token, timeoutMs = 15000 } = options;

  // 2. Adresi kur
  const url = buildUrl(deps.baseUrl, path, query);

  // 3. Başlıklar
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 4. Zaman aşımı: süre dolunca isteği iptal et ve nedenini bayrakla işaretle
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // 5. İsteği at. Bağlantı sorunlarını ApiError'a çevir
  let status: number;
  let ok: boolean;
  let retryAfter: string | null;
  let text: string;

  try {
    const res = await deps.fetchImpl(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    status = res.status;
    ok = res.ok;
    retryAfter = res.headers.get("Retry-After");
    text = await res.text();
  } catch {
    if (timedOut) {
      throw new ApiError({
        kind: "timeout",
        message: "Sunucu zamanında cevap vermedi. Biraz sonra tekrar dene.",
      });
    }
    throw new ApiError({
      kind: "network",
      message: "Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.",
    });
  } finally {
    clearTimeout(timer);
  }

  // 6-7. Cevabı ayrıştır, HTTP hatasıysa ApiError fırlat
  const parsed = parseResponseBody(text);
  if (!ok) {
    throw new ApiError(httpErrorFrom(status, parsed, retryAfter));
  }

  // 8. Başarılı cevap
  return parsed as T;
}