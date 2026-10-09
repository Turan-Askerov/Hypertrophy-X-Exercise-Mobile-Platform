import assert from "node:assert/strict";
import { ApiError } from "../src/api/api-error.ts";
import { request } from "../src/api/request.ts";
import type { ApiErrorKind } from "../src/types/common.ts";

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Call[] = [];
  const impl: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return respond();
  };
  return { impl, calls };
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers });
}

async function expectApiError(promise: Promise<unknown>, kind: ApiErrorKind, message?: string) {
  await assert.rejects(promise, (err: unknown) => {
    assert.ok(err instanceof ApiError, "ApiError bekleniyordu");
    assert.equal(err.info.kind, kind);
    if (message !== undefined) assert.equal(err.message, message);
    return true;
  });
}

const base = "http://x:8000";

// 1. başarılı GET
{
  const f = fakeFetch(() => json({ status: "ok" }));
  const result = await request<{ status: string }>({ baseUrl: base, fetchImpl: f.impl }, "/api/health");
  assert.deepEqual(result, { status: "ok" });
  assert.equal(f.calls[0].url, "http://x:8000/api/health");
  assert.equal(f.calls[0].init.method, "GET");
  assert.equal(f.calls[0].init.body, undefined);
  assert.equal((f.calls[0].init.headers as Record<string, string>)["Accept"], "application/json");
}

// 2. POST gövdesi ve Content-Type
{
  const f = fakeFetch(() => json({ ok: true }));
  await request({ baseUrl: base, fetchImpl: f.impl }, "/api/auth/login", {
    method: "POST",
    body: { username: "ali", password: "123456" },
  });
  const h = f.calls[0].init.headers as Record<string, string>;
  assert.equal(f.calls[0].init.method, "POST");
  assert.equal(f.calls[0].init.body, '{"username":"ali","password":"123456"}');
  assert.equal(h["Content-Type"], "application/json");
  assert.equal(h["Authorization"], undefined);
}

// 3. token varsa Authorization, sorgu parametreleri URL'ye girer
{
  const f = fakeFetch(() => json([]));
  await request({ baseUrl: base, fetchImpl: f.impl }, "/api/workouts", { token: "abc", query: { page: 2 } });
  assert.equal(f.calls[0].url, "http://x:8000/api/workouts?page=2");
  assert.equal((f.calls[0].init.headers as Record<string, string>)["Authorization"], "Bearer abc");
}

// 4. HTTP hataları ApiError olur
await expectApiError(
  request({ baseUrl: base, fetchImpl: fakeFetch(() => json({ detail: "Şifre hatalı" }, 401)).impl }, "/x"),
  "unauthorized",
  "Şifre hatalı"
);
await expectApiError(
  request({ baseUrl: base, fetchImpl: fakeFetch(() => json({ detail: [{ msg: "kısa" }] }, 422)).impl }, "/x"),
  "validation"
);
{
  const f = fakeFetch(() => json({ detail: "çok fazla" }, 429, { "Retry-After": "30" }));
  await assert.rejects(request({ baseUrl: base, fetchImpl: f.impl }, "/x"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.info.kind, "rate-limited");
    assert.equal(err.info.retryAfterSeconds, 30);
    return true;
  });
}
await expectApiError(
  request({ baseUrl: base, fetchImpl: fakeFetch(() => new Response("<html>Bad Gateway</html>", { status: 502 })).impl }, "/x"),
  "server"
);

// 5. bağlantı hatası
await expectApiError(
  request({ baseUrl: base, fetchImpl: (async () => { throw new TypeError("fetch failed"); }) as typeof fetch }, "/x"),
  "network"
);

// 6. zaman aşımı
{
  const hanging: typeof fetch = (_url, init) =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    });
  await expectApiError(request({ baseUrl: base, fetchImpl: hanging }, "/x", { timeoutMs: 20 }), "timeout");
}

// 7. boş gövde (204) ve JSON olmayan başarılı cevap
assert.equal(
  await request({ baseUrl: base, fetchImpl: fakeFetch(() => new Response(null, { status: 204 })).impl }, "/x"),
  null
);
assert.equal(
  await request({ baseUrl: base, fetchImpl: fakeFetch(() => new Response("tamam", { status: 200 })).impl }, "/x"),
  "tamam"
);

console.log("request testleri geçti ✅");