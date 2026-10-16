import assert from "node:assert/strict";
import { ApiError } from "../src/api/api-error.ts";
import { formatWait, authFailureFrom } from "../src/lib/auth-error.ts";
import type { ApiErrorInfo } from "../src/types/common.ts";

const failure = (info: ApiErrorInfo) => authFailureFrom(new ApiError(info));

// formatWait
assert.equal(formatWait(1), "1 saniye");
assert.equal(formatWait(59), "59 saniye");
assert.equal(formatWait(60), "1 dakika");
assert.equal(formatWait(61), "2 dakika");
assert.equal(formatWait(900), "15 dakika");

// çok fazla deneme
assert.deepEqual(
  failure({ kind: "rate-limited", message: "x", status: 429, retryAfterSeconds: 30 }),
  { message: "Çok fazla deneme yaptınız. 30 saniye sonra tekrar deneyin.", cooldownSeconds: 30 }
);
assert.deepEqual(
  failure({ kind: "rate-limited", message: "x", status: 429, retryAfterSeconds: 900 }),
  { message: "Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin.", cooldownSeconds: 900 }
);
assert.deepEqual(
  failure({ kind: "rate-limited", message: "x", status: 429, retryAfterSeconds: 1.5 }),
  { message: "Çok fazla deneme yaptınız. 2 saniye sonra tekrar deneyin.", cooldownSeconds: 2 }
);
assert.deepEqual(
  failure({ kind: "rate-limited", message: "x", status: 429 }),
  { message: "Çok fazla deneme yaptınız. Biraz sonra tekrar deneyin.", cooldownSeconds: 0 }
);

// yanlış kimlik bilgisi: kullanıcının var olup olmadığı sızdırılmaz
for (const detail of ["Kullanıcı bulunamadı", "Şifre hatalı"]) {
  assert.deepEqual(
    failure({ kind: "unauthorized", message: detail, status: 401 }),
    { message: "Kullanıcı adı ya da şifre hatalı.", cooldownSeconds: 0 }
  );
}

// diğer hatalar olduğu gibi gösterilir
assert.deepEqual(
  failure({ kind: "network", message: "Sunucuya ulaşılamadı. İnternet bağlantını kontrol et." }),
  { message: "Sunucuya ulaşılamadı. İnternet bağlantını kontrol et.", cooldownSeconds: 0 }
);
assert.deepEqual(
  failure({ kind: "client", message: "Bu hesap mobil uygulamada desteklenmiyor." }),
  { message: "Bu hesap mobil uygulamada desteklenmiyor.", cooldownSeconds: 0 }
);
assert.deepEqual(
  failure({ kind: "server", message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.", status: 500 }),
  { message: "Sunucu hatası. Lütfen daha sonra tekrar deneyin.", cooldownSeconds: 0 }
);

// ApiError olmayan her şey
assert.deepEqual(authFailureFrom(new Error("x")), { message: "Beklenmeyen bir hata oluştu.", cooldownSeconds: 0 });
assert.deepEqual(authFailureFrom("metin"), { message: "Beklenmeyen bir hata oluştu.", cooldownSeconds: 0 });
assert.deepEqual(authFailureFrom(undefined), { message: "Beklenmeyen bir hata oluştu.", cooldownSeconds: 0 });

console.log("auth-error testleri geçti ✅");