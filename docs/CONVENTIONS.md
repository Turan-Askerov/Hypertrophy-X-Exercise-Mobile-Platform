# Proje kuralları

- Testlerin yüklediği dosyalarda (`src/api`, `src/auth`, `src/types`, `src/lib`, `src/config/base-url.ts`):
  - içe aktarma yolu **göreli** olmalı (`@/` kısayolu yasak, Node bilmez)
  - çalışma anında yüklenen içe aktarmalar `.ts` uzantılı olmalı (`import type` satırları serbest)
- `@/` kısayolu yalnızca ekranlarda ve bileşenlerde (`src/app`, `src/components`).
- Mantığı fabrikaya koy (`createXxx(bağımlılıklar)`), gerçek bağımlılıkları ince bir dosyada bağla. Fabrika Node'da test edilir.
- Sadece `Error`'dan türeyen sınıfları fırlat (`throw new ApiError(...)`). Düz nesne ya da metin fırlatma.
- Falsy tuzağı: `0`, `""`, `false` geçerli değer olabilir. `if (x)` yerine `x !== undefined` / `x !== null` yaz.
- Dış veriyi (`unknown`) kontrollerle daralt, `as` ile zorlama.
- Her mantık değişikliğinden sonra: ilgili test + `npx tsc -p ts-playground` + `npx tsc --noEmit`.
- Yalnızca TİP olan şeyleri `import type { ... }` ile içe aktar (aksi halde Node "dışa aktarma yok" der).
- VS Code'un otomatik içe aktarmasını kabul ettikten sonra yolu (göreli mi?) ve `type`'ı kontrol et.
