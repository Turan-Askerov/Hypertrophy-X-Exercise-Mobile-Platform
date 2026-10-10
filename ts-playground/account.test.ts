import assert from "node:assert/strict";
import { isAdminAccount } from "../src/auth/account-kind.ts";
import type { AdminLoginResponse, User, UserLoginResponse } from "../src/types/user.ts";

// Gerçek giriş cevabındaki alanların birebir aynısı (değerler uydurma).
// Alan eksik ya da fazlaysa `npx tsc -p ts-playground` hata verir.
const sampleUser: User = {
  id: 2,
  username: "ali",
  email: "",
  role: "athlete",
  is_active: 1,
  is_admin: 0,
  created_at: "2026-07-23T00:22:19+00:00",
  updated_at: "2026-10-06T13:47:51.811665+03:00",
  age: 22,
  gender: "male",
  height: 180.0,
  weight: 80.0,
  fitness_level: "Intermediate",
  goal: "bulk",
  days_per_week: 6,
  session_time_mins: 75,
  stagnation_detected: 0,
  custom_split: "[]",
  dashboard_preferences: "{}",
  daily_nutrition: "{}",
  admin_role_title: null,
  admin_permissions: null,
};

function userLogin(overrides: Partial<User> = {}): UserLoginResponse {
  return { ...sampleUser, ...overrides, token: "t" };
}

// 1. admin hesabı (env tabanlı): is_admin JSON true, başka alan yok
const envAdmin: AdminLoginResponse = { username: "admin", is_admin: true, token: "t" };
assert.equal(isAdminAccount(envAdmin), true);

// 2. sıradan sporcu
assert.equal(isAdminAccount(userLogin()), false);

// 3. veritabanı kullanıcısı: is_admin = 1
assert.equal(isAdminAccount(userLogin({ is_admin: 1 })), true);

// 4. veritabanı kullanıcısı: role admin (is_admin 0 olsa bile)
assert.equal(isAdminAccount(userLogin({ role: "admin" })), true);
assert.equal(isAdminAccount(userLogin({ role: "ADMIN" })), true);

// 5. admin'e benzeyen ama admin olmayan roller
assert.equal(isAdminAccount(userLogin({ role: "administrator-assistant" })), false);
assert.equal(isAdminAccount(userLogin({ role: "athlete" })), false);

console.log("account testleri geçti ✅");