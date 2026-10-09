import assert from "node:assert/strict";
import { createApiClient } from "../src/api/api-client.ts";
import { ApiError } from "../src/api/api-error.ts";

type Call = { url: string; init: RequestInit };

function fakeFetch(respond: () => Response | Promise<Response>) {
  const calls: Call[] = [];
  const impl: typeof fetch = async (url, init) => {
    calls.push({ url: String(url), init: init ?? {} });
    return respond();
  };
  return { impl, calls };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status });
}

function setup(respond: () => Response | Promise<Response>, token: string | null = "tkn") {
  const f = fakeFetch(respond);
  const counters = { getToken: 0, unauthorized: 0 };
  const client = createApiClient({
    baseUrl: "http://x:8000",
    fetchImpl: f.impl,
    getToken: async () => {
      counters.getToken += 1;
      return token;
    },
    onUnauthorized: () => {
      counters.unauthorized += 1;
    },
  });
  return { client, calls: f.calls, counters };
}

function authHeader(call: Call) {
  return (call.init.headers as Record<string, string>)["Authorization"];
}

// 1. varsayılan: token okunur ve Authorization gönderilir
{
  const s = setup(() => json({ id: 1 }));
  const result = await s.client.call<{ id: number }>("/api/user");
  assert.deepEqual(result, { id: 1 });
  assert.equal(s.counters.getToken, 1);
  assert.equal(authHeader(s.calls[0]), "Bearer tkn");
}

// 2. auth:false → token hiç okunmaz, Authorization gönderilmez
{
  const s = setup(() => json({ ok: true }));
  await s.client.call("/api/auth/login", { method: "POST", body: { username: "a", password: "b" }, auth: false });
  assert.equal(s.counters.getToken, 0);
  assert.equal(authHeader(s.calls[0]), undefined);
  assert.equal(s.calls[0].init.method, "POST");
}

// 3. tokenla gelen 401 → onUnauthorized bir kez çağrılır, hata yine fırlar
{
  const s = setup(() => json({ detail: "Oturum süresi doldu" }, 401));
  await assert.rejects(s.client.call("/api/user"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.info.kind, "unauthorized");
    return true;
  });
  assert.equal(s.counters.unauthorized, 1);
}

// 4. auth:false ile gelen 401 (yanlış şifre) → oturumu KAPATMAZ
{
  const s = setup(() => json({ detail: "Şifre hatalı" }, 401));
  await assert.rejects(
    s.client.call("/api/auth/login", { method: "POST", body: {}, auth: false }),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.message, "Şifre hatalı");
      return true;
    }
  );
  assert.equal(s.counters.unauthorized, 0);
}

// 5. token yokken (null) 401 → kapatılacak oturum yok
{
  const s = setup(() => json({ detail: "Giriş gerekli" }, 401), null);
  await assert.rejects(s.client.call("/api/user"));
  assert.equal(s.counters.unauthorized, 0);
  assert.equal(authHeader(s.calls[0]), undefined);
}

// 6. 401 dışındaki hatalar oturumu kapatmaz
{
  const s = setup(() => json({ detail: "yok" }, 404));
  await assert.rejects(s.client.call("/api/x"));
  const s2 = setup(() => json({ detail: "hata" }, 500));
  await assert.rejects(s2.client.call("/api/x"));
  assert.equal(s.counters.unauthorized + s2.counters.unauthorized, 0);
}

// 7. getToken senkron da olabilir
{
  const f = fakeFetch(() => json({}));
  const client = createApiClient({
    baseUrl: "http://x:8000",
    fetchImpl: f.impl,
    getToken: () => "senkron",
    onUnauthorized: () => {},
  });
  await client.call("/api/user");
  assert.equal(authHeader(f.calls[0]), "Bearer senkron");
}

// 8. sorgu parametresi ve zaman aşımı seçenekleri request'e geçer
{
  const s = setup(() => json([]));
  await s.client.call("/api/workouts", { query: { page: 3 }, timeoutMs: 5000 });
  assert.equal(s.calls[0].url, "http://x:8000/api/workouts?page=3");
}

console.log("api-client testleri geçti ✅");