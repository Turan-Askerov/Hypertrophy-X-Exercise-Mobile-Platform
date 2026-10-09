import assert from "node:assert/strict";
import { httpErrorFrom } from "../src/api/http-error.ts";

let e = httpErrorFrom(401, { detail: "Şifre hatalı" }, null);
assert.equal(e.kind, "unauthorized");
assert.equal(e.message, "Şifre hatalı");
assert.equal(e.status, 401);

e = httpErrorFrom(409, { detail: "Bu kullanıcı adı zaten kullanılıyor" }, null);
assert.equal(e.kind, "client");
assert.equal(e.message, "Bu kullanıcı adı zaten kullanılıyor");

// 422: FastAPI'de detail bir LİSTE olur, kendi mesajımızı kullanırız
e = httpErrorFrom(
  422,
  { detail: [{ loc: ["body", "username"], msg: "String should have at least 2 characters", type: "string_too_short" }] },
  null
);
assert.equal(e.kind, "validation");
assert.equal(e.message, "Girilen bilgiler geçersiz.");

e = httpErrorFrom(429, { detail: "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin." }, "120");
assert.equal(e.kind, "rate-limited");
assert.equal(e.retryAfterSeconds, 120);
assert.equal(httpErrorFrom(429, {}, null).retryAfterSeconds, undefined);
assert.equal(httpErrorFrom(429, {}, "abc").retryAfterSeconds, undefined);
assert.equal(httpErrorFrom(429, {}, "0").retryAfterSeconds, undefined);
assert.equal(httpErrorFrom(429, {}, "").retryAfterSeconds, undefined);

// 5xx: backend mesajı ne olursa olsun kendi mesajımız
e = httpErrorFrom(500, { detail: "Profil güncellenirken hata oluştu" }, null);
assert.equal(e.kind, "server");
assert.equal(e.message, "Sunucu hatası. Lütfen daha sonra tekrar deneyin.");

// gövde bozuk, boş ya da JSON değil
assert.equal(httpErrorFrom(502, null, null).kind, "server");
e = httpErrorFrom(404, "<html>Not Found</html>", null);
assert.equal(e.kind, "client");
assert.equal(e.message, "İstek tamamlanamadı (404).");
assert.equal(httpErrorFrom(401, {}, null).message, "Yetkisiz erişim. Lütfen tekrar giriş yapın.");
assert.equal(httpErrorFrom(400, { detail: 42 }, null).message, "İstek tamamlanamadı (400).");
assert.equal(httpErrorFrom(302, null, null).kind, "unknown");

console.log("http-error testleri geçti ✅");