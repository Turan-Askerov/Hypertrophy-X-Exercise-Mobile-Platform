# Giriş akışı sözleşmesi

## Kararlar

| # | Konu | Karar | Durum |
| --- | --- | --- | --- |
| 1 | Token | Mevcut 24 saatlik token, refresh yok. Süre dolunca giriş ekranına dön. Refresh token mağaza yayınından önce eklenecek | Kesin |
| 2 | Admin hesabı | Login cevabında `is_admin: true` ise token kaydedilmez, "Bu hesap mobil uygulamada desteklenmiyor" gösterilir | Öneri |
| 3 | Kayıtta e-posta | Opsiyonel, "Şifreni unutursan kod buraya gelir" uyarısı. Biçim istemcide basitçe kontrol edilir | Öneri |
| 4 | Kayıttan sonra | Otomatik giriş (aynı bilgilerle `/login`) | Öneri |
| 5 | Hata mesajı | 400/401/409'da backend `detail` metni gösterilir. Ağ yok, 429, 5xx için kendi mesajımız | Öneri |

## Uçlar (`/api/auth` ve `/api/user`)

| Uç | İstek | Cevap / not |
| --- | --- | --- |
| `POST /api/auth/login` | `username`, `password` | Kullanıcı alanları + `token`. E-posta ile değil kullanıcı adıyla giriş |
| `POST /api/auth/register` | `username` (≥2), `password` (≥6), `email` (opsiyonel) | `{message, username}`. **Token yok.** Aynı ad: 409 |
| `POST /api/auth/forgot-password` | `email_or_username` | `reset_token`, maskeli e-posta, 15 dk süre |
| `POST /api/auth/verify-reset-code` | `reset_token`, 6 haneli `code` | `verified_token` |
| `POST /api/auth/reset-password` | `verified_token`, `new_password` | Sıfırlama |
| `GET /api/user` | `Authorization: Bearer <token>` | Profil. Oturum doğrulamak için kullanılır |

## Bilinen backend davranışları

- Hata gövdesi genelde `{"detail": "mesaj"}`. 422 doğrulama hatalarında `detail` bir **liste** olur. İstemci ikisini de tanımalı.
- Süresi dolan token: `401` ("Oturum süresi doldu, lütfen tekrar giriş yapın").
- Hız sınırı: `429` + `Retry-After` başlığı (saniye). Varsayılan 15 dakikada 10 deneme, yol ve IP bazlı.
- Admin de aynı `/login` ucundan girer.
- "Kullanıcı bulunamadı" ile "Şifre hatalı" ayrı mesajlar (kullanıcı varlığını açığa verir, güvenlik gözden geçirmesinde ele alınacak).
- Backend e-posta biçimini doğrulamıyor.

## Oturum durumları

1. **Yükleniyor:** kayıtlı token var mı, geçerli mi bakılıyor
2. **Çıkış yapılmış**
3. **Giriş yapılmış** (kullanıcı bilgisiyle)

## Açık

- Giriş ekranı karalaması

## Doğrulanmış bulgular (gerçek cevaptan ve koddan)

- Giriş cevabı: kullanıcının tüm kaydı + `token`.
- `is_admin`, `is_active`, `stagnation_detected`: normal kullanıcıda 0/1 **tamsayı**. Admin hesabında (`/login` admin dalı) `is_admin` JSON **true**. Tip: `boolean | number`.
- Admin tespiti istemcide: `role === "admin" || Boolean(is_admin)`.
- `created_at`, `updated_at`: ISO metin, farklı UTC farkıyla gelebilir (`+00:00`, `+03:00`).
- Bilinmeyen `/api/...` GET yolu 404 değil **405** döner (`detail: "Not Found"`). Sebep: `main.py` içindeki SPA yakalayıcısı.
- `custom_split`, `dashboard_preferences`, `daily_nutrition`: veritabanında JSON metni (varsayılan `'[]'` / `'{}'`). Cevapta metin mi nesne mi olduğu henüz doğrulanmadı.

## Karar 6 ve oturum durumları (güncel)

Yukarıdaki "Oturum durumları" listesine dördüncü durum eklendi:

1. **loading:** kayıtlı token var mı, geçerli mi bakılıyor
2. **signedOut:** çıkış yapılmış
3. **signedIn:** giriş yapılmış (kullanıcıyla birlikte, token durumda tutulmaz)
4. **unreachable:** sunucuya ulaşılamıyor, "tekrar dene" ekranı

Açılışta token varsa `GET /api/user`:
- 200 → signedIn
- 401 → token silinir, signedOut
- ağ hatası, zaman aşımı, 429, 5xx → unreachable (token SİLİNMEZ)

## GÜNCEL: kayıt iki adımlıdır (kaynak: Hypertrophy-X-v4_0_1.zip)

Önceki "Karar 3 (e-posta isteğe bağlı)" ve "Karar 4 (kayıttan sonra otomatik giriş)" GEÇERSİZ.

| Adım | Uç | İstek | Cevap |
|---|---|---|---|
| 1 | `POST /api/auth/register` | `username`, `password`, `email` (zorunlu) | `{success, token, masked_email, message}`. Buradaki `token` bir **işlem bileti**, JWT değil |
| 2 | `POST /api/auth/register/confirm` | `token` (bilet), `code` (6 rakam) | `{success, message, token, user, username}`. Buradaki `token` **JWT**, `user` **iç içe** (girişteki gibi düz değil) |

- Kod 15 dakika geçerli. 5 hatalı denemede talep iptal olur, yeniden kayıt gerekir.
- Yanlış kod: 400, "Girdiğiniz doğrulama kodu hatalı. Kalan deneme hakkı: N".
- "Tekrar gönder" ucu yok: `/register`'ı aynı bilgilerle yeniden çağırmak eski talebi geçersiz kılar ve yeni bilet + kod verir. Form bilgileri (şifre dahil) akış boyunca bellekte tutulur.
- Çakışma (kullanıcı adı ya da e-posta): 409, büyük/küçük harfe duyarsız.
- `/register` hız sınırı kapsamında, `/register/confirm` değil (her talep 5 denemeyle sınırlı).
- Giriş ve `GET /api/user` cevabı DEĞİŞMEDİ (`User` tipi geçerli). Şifre sıfırlama aynı.
- Diğer iki adımlı akışlar (profil aşamasında): şifre değiştirme (`/change-password/request` + `/confirm`), e-posta güncelleme (`/api/user/email/request-update` + `/confirm-update`).
