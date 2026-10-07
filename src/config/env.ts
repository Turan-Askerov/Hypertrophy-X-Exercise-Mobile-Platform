// Backend adresi .env dosyasından okunur.
// EXPO_PUBLIC_ ile başlayan değişkenler uygulama paketine gömülür:
// buraya GİZLİ anahtar koyma, herkes görebilir.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";
