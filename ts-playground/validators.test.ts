import assert from "node:assert/strict";
import {
  validateEmail,
  validateIdentifier,
  validateLoginPassword,
  validateLoginUsername,
  validatePassword,
  validatePasswordConfirm,
  validateRegisterForm,
  validateResetCode,
  validateUsername,
} from "../src/lib/validators.ts";

// kullanıcı adı
assert.equal(validateUsername("ali"), null);
assert.equal(validateUsername("al"), null);
assert.equal(validateUsername("  al  "), null); // kırpıldıktan sonra 2 karakter
assert.equal(validateUsername("a"), "Kullanıcı adı en az 2 karakter olmalı");
assert.equal(validateUsername("   a   "), "Kullanıcı adı en az 2 karakter olmalı");
assert.equal(validateUsername(""), "Kullanıcı adı en az 2 karakter olmalı");
assert.equal(validateUsername("Çğ"), null); // Türkçe karakterler 1'er karakter
assert.equal(validateUsername("😀"), "Kullanıcı adı en az 2 karakter olmalı"); // 1 karakter (JS length 2)

// şifre (boşluklar şifrenin parçası, kırpılmaz)
assert.equal(validatePassword("123456"), null);
assert.equal(validatePassword("12345"), "Şifre en az 6 karakter olmalı");
assert.equal(validatePassword("     "), "Şifre en az 6 karakter olmalı");
assert.equal(validatePassword("      "), null); // 6 boşluk = 6 karakter (backend de kabul eder)
assert.equal(validatePassword(""), "Şifre en az 6 karakter olmalı");

// şifre tekrarı
assert.equal(validatePasswordConfirm("abc123", "abc123"), null);
assert.equal(validatePasswordConfirm("abc123", "abc124"), "Şifreler eşleşmiyor");
assert.equal(validatePasswordConfirm("abc123", ""), "Şifreler eşleşmiyor");

// e-posta (zorunlu)
assert.equal(validateEmail(""), "E-posta adresi girin");
assert.equal(validateEmail("   "), "E-posta adresi girin");
assert.equal(validateEmail("ali@ornek.com"), null);
assert.equal(validateEmail("  ali@ornek.com "), null);
assert.equal(validateEmail("ali@ornek"), "Geçerli bir e-posta adresi girin");
assert.equal(validateEmail("ali.ornek.com"), "Geçerli bir e-posta adresi girin");
assert.equal(validateEmail("@ornek.com"), "Geçerli bir e-posta adresi girin");
assert.equal(validateEmail("a li@ornek.com"), "Geçerli bir e-posta adresi girin");

// giriş: yalnızca boş olmasın (eski kısa kullanıcı adları ve şifreler girebilsin)
assert.equal(validateLoginUsername("a"), null);
assert.equal(validateLoginUsername("  ali "), null);
assert.equal(validateLoginUsername("   "), "Kullanıcı adı girin");
assert.equal(validateLoginPassword("1"), null);
assert.equal(validateLoginPassword(" "), null); // tek boşluk da bir şifre olabilir
assert.equal(validateLoginPassword(""), "Şifre girin");

// şifre sıfırlama: kullanıcı adı ya da e-posta
assert.equal(validateIdentifier("ali"), null);
assert.equal(validateIdentifier("ali@ornek.com"), null);
assert.equal(validateIdentifier("   "), "Kullanıcı adı ya da e-posta girin");

// doğrulama kodu: tam 6 rakam
assert.equal(validateResetCode("123456"), null);
assert.equal(validateResetCode(" 123456 "), null);
assert.equal(validateResetCode("12345"), "Doğrulama kodu 6 haneli bir sayı olmalı");
assert.equal(validateResetCode("1234567"), "Doğrulama kodu 6 haneli bir sayı olmalı");
assert.equal(validateResetCode("12345a"), "Doğrulama kodu 6 haneli bir sayı olmalı");
assert.equal(validateResetCode(""), "Doğrulama kodu 6 haneli bir sayı olmalı");

// kayıt formunun tamamı
assert.deepEqual(
  validateRegisterForm({ username: "ali", email: "", password: "123456", confirm: "123456" }),
  { email: "E-posta adresi girin" }
);
assert.deepEqual(
  validateRegisterForm({ username: "ali", email: "ali@ornek.com", password: "123456", confirm: "123456" }),
  {}
);
assert.deepEqual(
  validateRegisterForm({ username: "", email: "bozuk", password: "123", confirm: "456" }),
  {
    username: "Kullanıcı adı en az 2 karakter olmalı",
    email: "Geçerli bir e-posta adresi girin",
    password: "Şifre en az 6 karakter olmalı",
    confirm: "Şifreler eşleşmiyor",
  }
);
assert.deepEqual(
  validateRegisterForm({ username: "ali", email: "ali@ornek.com", password: "123456", confirm: "123457" }),
  { confirm: "Şifreler eşleşmiyor" }
);

console.log("validators testleri geçti ✅");