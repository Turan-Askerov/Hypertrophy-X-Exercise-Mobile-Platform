import assert from "node:assert/strict";
import { ApiError } from "../src/api/api-error.ts";
import { createSessionService } from "../src/auth/create-session-service.ts";
import { createTokenStorage, type StorageAdapter } from "../src/auth/create-token-storage.ts";
import type { User, UserLoginResponse } from "../src/types/user.ts";
import { sampleUser, userLogin } from "./fixtures.ts";

function memoryAdapter(initial?: string) {
  const data = new Map<string, string>();
  if (initial !== undefined) data.set("hx_token", initial);
  const stats = { failSet: false };
  const adapter: StorageAdapter = {
    get: async (key) => data.get(key) ?? null,
    set: async (key, value) => {
      if (stats.failSet) throw new Error("yazılamadı");
      data.set(key, value);
    },
    remove: async (key) => {
      data.delete(key);
    },
  };
  return { adapter, data, stats };
}

type Options = {
  token?: string;
  getMe?: () => Promise<User>;
  login?: () => Promise<UserLoginResponse>;
  register?: () => Promise<unknown>;
};

function setup(options: Options = {}) {
  const mem = memoryAdapter(options.token);
  const calls = { getMe: 0, login: 0, register: 0 };
  const service = createSessionService({
    tokenStorage: createTokenStorage(mem.adapter),
    usersApi: {
      getMe: async () => {
        calls.getMe += 1;
        return (options.getMe ?? (async () => sampleUser))();
      },
    },
    authApi: {
      login: async () => {
        calls.login += 1;
        return (options.login ?? (async () => userLogin({})))();
      },
      register: async () => {
        calls.register += 1;
        return (options.register ?? (async () => ({ message: "ok" })))();
      },
    },
  });
  return { service, mem, calls };
}

const apiError = (kind: ApiError["info"]["kind"], status?: number) =>
  new ApiError({ kind, message: `${kind} hatası`, status });

// ---- restore ----
{
  const s = setup();
  assert.deepEqual(await s.service.restore(), { status: "signedOut" });
  assert.equal(s.calls.getMe, 0); // token yoksa sunucuya sorma
}
{
  const s = setup({ token: "tkn" });
  assert.deepEqual(await s.service.restore(), { status: "signedIn", user: sampleUser });
}
{
  const s = setup({ token: "tkn", getMe: async () => { throw apiError("unauthorized", 401); } });
  assert.deepEqual(await s.service.restore(), { status: "signedOut" });
  assert.equal(s.mem.data.has("hx_token"), false); // geçersiz token silinir
}
for (const kind of ["network", "timeout", "server", "rate-limited"] as const) {
  const s = setup({ token: "tkn", getMe: async () => { throw apiError(kind); } });
  const state = await s.service.restore();
  assert.equal(state.status, "unreachable");
  assert.equal(s.mem.data.get("hx_token"), "tkn"); // token SİLİNMEZ
}
{
  const s = setup({ token: "tkn", getMe: async () => { throw new Error("beklenmedik"); } });
  const state = await s.service.restore();
  assert.deepEqual(state, { status: "unreachable", message: "Beklenmeyen bir hata oluştu." });
  assert.equal(s.mem.data.get("hx_token"), "tkn");
}

// ---- signIn ----
{
  const s = setup({ login: async () => userLogin({ username: "veli" }) });
  const state = await s.service.signIn("veli", "pw");
  assert.equal(state.status, "signedIn");
  if (state.status === "signedIn") {
    assert.equal(state.user.username, "veli");
    assert.equal("token" in state.user, false); // token durumda tutulmaz
  }
  assert.equal(s.mem.data.get("hx_token"), "t"); // güvenli depoda
}
{
  const s = setup({ login: async () => { throw apiError("unauthorized", 401); } });
  await assert.rejects(s.service.signIn("ali", "yanlis"), ApiError);
  assert.equal(s.mem.data.size, 0);
}
{
  const s = setup();
  s.mem.stats.failSet = true;
  await assert.rejects(s.service.signIn("ali", "pw"), /yazılamadı/);
}

// ---- register (otomatik giriş) ----
{
  const s = setup();
  const state = await s.service.register("ali", "123456", "a@b.com");
  assert.equal(state.status, "signedIn");
  assert.equal(s.calls.register, 1);
  assert.equal(s.calls.login, 1);
}
{
  const s = setup({ register: async () => { throw apiError("client", 409); } });
  await assert.rejects(s.service.register("ali", "123456"), ApiError);
  assert.equal(s.calls.login, 0); // kayıt başarısızsa giriş denenmez
}

// ---- completeSignIn (kayıt onayından sonra) ----
{
  const s = setup();
  const state = await s.service.completeSignIn("jwt-1", sampleUser);
  assert.deepEqual(state, { status: "signedIn", user: sampleUser });
  assert.equal(s.mem.data.get("hx_token"), "jwt-1"); // token güvenli depoda
  assert.equal("token" in (state.status === "signedIn" ? state.user : {}), false);
}
{
  const s = setup();
  s.mem.stats.failSet = true;
  await assert.rejects(s.service.completeSignIn("jwt-1", sampleUser), /yazılamadı/);
}

// ---- signOut ----
{
  const s = setup({ token: "tkn" });
  assert.deepEqual(await s.service.signOut(), { status: "signedOut" });
  assert.equal(s.mem.data.has("hx_token"), false);
}

console.log("session testleri geçti ✅");