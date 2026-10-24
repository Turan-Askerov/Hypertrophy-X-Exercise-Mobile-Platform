# Yol haritası (durumlu)

Ana numaralandırma bu dosyadır. Alt adımlar 4.1, 4.2 gibi yazılır.

- [x] **Aşama 0: Hazırlık.** Kurulum, Git, Expo Go ile ilk ekran.
- [x] **Aşama 1: JavaScript/TypeScript.** Gerçek parçalarla öğrenildi. *Ertelenen:* RIR→RPE ve hacim hesabı (Aşama 5'te tamamlandı).
- [x] **Aşama 2: React temelleri.** useState, useEffect, Context, özel kanca, useRef.
- [x] **Aşama 3: React Native yerleşim ve gezinme.** Gruplu rotalar, korumalı yönlendirme, 5 sekme.
- [x] **Aşama 4: Backend'e bağlanma.**
  - [x] 4.0 Kararlar ve sözleşme
  - [x] 4.1 Çalışma ortamı (telefon ↔ backend)
  - [x] 4.2 Görünmez altyapı (ayar, hata modeli, ağ istemcisi, token deposu)
  - [x] 4.3 Oturum durumu (yükleniyor / çıkış / giriş / ulaşılamıyor)
  - [x] 4.4 Yönlendirme (oturuma göre ekran)
  - [x] 4.5 Ekranlar: giriş, kayıt (e-posta kodlu), şifre sıfırlama
  - [x] 4.6 Son kontroller (dayanıklılık, güvenlik gözden geçirme)
  - [x] 4.7 İlk gerçek veri: antrenman geçmişini çekme (Aşama 4'ün çıktısı)
  - [ ] Backend hazırlığı: refresh token, API sürümleme, hx_pass temizliği (web), /register/confirm ve /reset-password hız sınırı (yayın öncesi)
- [x] **Aşama 5: Çekirdek özellik: antrenman kaydı.**
  - [x] 5.0 Tasarım temeli (renk, yazı, boşluk sabitleri, Radius, AppColors)
  - [x] 5.1 RIR→RPE ve hacim hesabı (TypeScript'e port, unit testli: rpe.test.ts, volume.test.ts)
  - [x] 5.2 Altyapı, API ve Hook'lar (Workout, Exercise modelleri, createWorkoutsApi, createExercisesApi, useWorkouts, useExercises, workoutDraft)
  - [x] 5.3 UI bileşen kiti (Card, ConfirmDialog, Skeleton, EmptyState, DatePickerSheet)
  - [x] 5.4 Antrenman bileşenleri (SetRow - RIR Chip'li, ExerciseCard, LiveStatsBar, RestTimer, WorkoutNote, ExerciseList)
  - [x] 5.5 Ekranlar (Egzersiz seçme Stack ekranı: add-exercise, Ana antrenman kayıt ekranı: workout.tsx, Antrenman geçmişi ekranı: history.tsx düzenleme/silme ile)
- [ ] **Aşama 6: Tasarım cilası.** Figma, animasyon, karanlık mod, grafikler, uzman sistem kartları.
- [ ] **Aşama 7: Çevrimdışı ve bildirim.** Yerel kayıt, senkronizasyon, idempotent kayıt, hatırlatıcılar.
- [ ] **Aşama 8: Yayın hazırlığı.** EAS ile Android derlemesi, kapalı test, gizlilik politikası, **profil yönetimi** (e-posta/şifre değiştirme, hesap silme), Play Console.
