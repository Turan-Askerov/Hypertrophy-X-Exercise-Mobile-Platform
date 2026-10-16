// Kural kaynağı: backend routers/auth.py (kullanıcı adı >= 2, şifre >= 6, kod 6 rakam).
// Python len() karakter (kod noktası) sayar; JS .length UTF-16 birimi sayar (emoji = 2).
// Aynı sonucu almak için kod noktalarını sayıyoruz.
export const MIN_USERNAME_LENGTH = 2; // B seçeneğinde 4 yap
export const MIN_PASSWORD_LENGTH = 6;

function charCount(value: string): number {
  return [...value].length;
}

// ---- kayıt ve şifre belirleme kuralları (yeni hesap için) ----
export function validateUsername(value: string): string | null {
  if (charCount(value.trim()) < MIN_USERNAME_LENGTH) {
    return `Kullanıcı adı en az ${MIN_USERNAME_LENGTH} karakter olmalı`;
  }
  return null;
}

export function validatePassword(value: string): string | null {
  if (charCount(value) < MIN_PASSWORD_LENGTH) {
    return `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`;
  }
  return null;
}

export function validatePasswordConfirm(password: string, confirm: string): string | null {
  if (password !== confirm) return "Şifreler eşleşmiyor";
  return null;
}

// Kayıtta e-posta zorunludur (backend istiyor). Basit bir biçim kontrolü yapılır.
export function validateEmail(value: string): string | null {
  const email = value.trim();
  if (email === "") return "E-posta adresi girin";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Geçerli bir e-posta adresi girin";
  return null;
}

// ---- giriş kuralları: eski hesaplar kapı dışında kalmasın diye YALNIZCA "boş olmasın" ----
export function validateLoginUsername(value: string): string | null {
  if (value.trim() === "") return "Kullanıcı adı girin";
  return null;
}

export function validateLoginPassword(value: string): string | null {
  if (value === "") return "Şifre girin";
  return null;
}

export function validateIdentifier(value: string): string | null {
  if (value.trim() === "") return "Kullanıcı adı ya da e-posta girin";
  return null;
}

export function validateResetCode(value: string): string | null {
  if (!/^\d{6}$/.test(value.trim())) return "Doğrulama kodu 6 haneli bir sayı olmalı";
  return null;
}


// ---- kayıt formunun tamamı ----
export type RegisterValues = {
  username: string;
  email: string;
  password: string;
  confirm: string;
};

export type RegisterErrors = Partial<Record<keyof RegisterValues, string>>;

export function validateRegisterForm(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};
  const checks: [keyof RegisterValues, string | null][] = [
    ["username", validateUsername(values.username)],
    ["email", validateEmail(values.email)],
    ["password", validatePassword(values.password)],
    ["confirm", validatePasswordConfirm(values.password, values.confirm)],
  ];
  for (const [field, message] of checks) {
    if (message !== null) errors[field] = message;
  }
  return errors;
}