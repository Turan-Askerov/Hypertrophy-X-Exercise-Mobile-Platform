import assert from "node:assert/strict";
import type { ApiCallOptions } from "../src/api/api-client.ts";
import { ApiError } from "../src/api/api-error.ts";
import { createAuthApi, type ApiCaller } from "../src/api/create-auth-api.ts";
import { createUsersApi } from "../src/api/create-users-api.ts";
import { sampleUser, userLogin } from "./fixtures.ts";

type Call = { path: string; options?: ApiCallOptions };

function fakeClient(response: unknown) {
  const calls: Call[] = [];
  const client: ApiCaller = {
    call: async (path, options) => {
      calls.push({ path, options });
      return response as never;
    },
  };
  return { client, calls };
}

function failingClient(error: unknown): ApiCaller {
  return {
    call: async () => {
      throw error;
    },
  };
}

// ---- login ----
{
  const f = fakeClient(userLogin());
  const res = await createAuthApi(f.client).login("  ali  ", " pw ");
  assert.equal(res.username, "ali");
  assert.equal(f.calls[0].path, "/api/auth/login");
  assert.equal(f.calls[0].options?.method, "POST");
  assert.equal(f.calls[0].options?.auth, false);
  // kullanıcı adı kırpılır, şifreye dokunulmaz
  assert.deepEqual(f.calls[0].options?.body, { username: "ali", password: " pw " });
}

// admin hesapları reddedilir
for (const adminLike of [
  { username: "admin", is_admin: true, token: "t" },
  userLogin({ is_admin: 1 }),
  userLogin({ role: "admin" }),
]) {
  const api = createAuthApi(fakeClient(adminLike).client);
  await assert.rejects(api.login("x", "y"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.info.kind, "client");
    assert.equal(err.message, "Bu hesap mobil uygulamada desteklenmiyor.");
    return true;
  });
}

// sunucu hatası olduğu gibi iletilir
{
  const original = new ApiError({ kind: "unauthorized", message: "Şifre hatalı", status: 401 });
  const api = createAuthApi(failingClient(original));
  await assert.rejects(api.login("ali", "yanlis"), (err: unknown) => {
    assert.equal(err, original);
    return true;
  });
}

// ---- register ----
{
  const f = fakeClient({ message: "Hesap oluşturuldu", username: "ali" });
  const api = createAuthApi(f.client);

  await api.register("  ali ", "123456");
  assert.equal(f.calls[0].path, "/api/auth/register");
  assert.equal(f.calls[0].options?.method, "POST");
  assert.equal(f.calls[0].options?.auth, false);
  assert.deepEqual(f.calls[0].options?.body, { username: "ali", password: "123456" });

  await api.register("ali", "123456", "   ");
  assert.deepEqual(f.calls[1].options?.body, { username: "ali", password: "123456" });

  await api.register("ali", "123456", "  Ali@Ornek.com ");
  assert.deepEqual(f.calls[2].options?.body, { username: "ali", password: "123456", email: "Ali@Ornek.com" });
}

// ---- kayıt (2 adım: başlat + onayla) ----
{
  const f = fakeClient({ success: true });
  const api = createAuthApi(f.client);

  await api.startRegistration("  ali ", "123456", "  ali@ornek.com ");
  assert.equal(f.calls[0].path, "/api/auth/register");
  assert.equal(f.calls[0].options?.method, "POST");
  assert.equal(f.calls[0].options?.auth, false);
  assert.deepEqual(f.calls[0].options?.body, {
    username: "ali",
    password: "123456",
    email: "ali@ornek.com",
  });

  await api.confirmRegistration("ticket1", " 123456 ");
  assert.equal(f.calls[1].path, "/api/auth/register/confirm");
  assert.equal(f.calls[1].options?.method, "POST");
  assert.equal(f.calls[1].options?.auth, false);
  assert.deepEqual(f.calls[1].options?.body, { token: "ticket1", code: "123456" });
}

// ---- şifre sıfırlama (3 adım) ----
{
  const f = fakeClient({ success: true });
  const api = createAuthApi(f.client);

  await api.forgotPassword("  ali@ornek.com ");
  assert.equal(f.calls[0].path, "/api/auth/forgot-password");
  assert.deepEqual(f.calls[0].options?.body, { email_or_username: "ali@ornek.com" });
  assert.equal(f.calls[0].options?.auth, false);

  await api.verifyResetCode("rt123", " 123456 ");
  assert.equal(f.calls[1].path, "/api/auth/verify-reset-code");
  assert.deepEqual(f.calls[1].options?.body, { reset_token: "rt123", code: "123456" });
  assert.equal(f.calls[1].options?.auth, false);

  await api.resetPassword("vt456", "yeniSifre");
  assert.equal(f.calls[2].path, "/api/auth/reset-password");
  assert.deepEqual(f.calls[2].options?.body, { verified_token: "vt456", new_password: "yeniSifre" });
  assert.equal(f.calls[2].options?.auth, false);
  assert.equal(f.calls[2].options?.method, "POST");
}

// ---- getMe ----
{
  const f = fakeClient(sampleUser);
  const me = await createUsersApi(f.client).getMe();
  assert.equal(me.username, "ali");
  assert.equal(f.calls[0].path, "/api/user");
  assert.notEqual(f.calls[0].options?.auth, false); // token gönderilmeli
  assert.notEqual(f.calls[0].options?.method, "POST");
}

console.log("auth-api testleri geçti ✅");