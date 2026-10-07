# Karşılık haritası: Hypertrophy-X (web) → mobil

frontend/index.html satır numaraları yaklaşıktır (~).

| Mobil dosya | Orijinal kaynak | Ne yapacak |
|---|---|---|
| `src/api/client.ts` | backend/main.py + backend/core/security.py | fetch sarmalayıcı: token ekleme ve hata yönetimi |
| `src/api/auth.ts` | backend/routers/auth.py | giriş, kayıt, şifre sıfırlama istekleri |
| `src/api/users.ts` | backend/routers/users.py | profil istekleri |
| `src/api/workouts.ts` | backend/routers/workouts.py | antrenman kaydet/listele/sil |
| `src/api/exercises.ts` | backend/routers/exercises.py | egzersiz kataloğu istekleri |
| `src/api/progress.ts` | backend/routers/progress.py | dashboard ve ilerleme verisi |
| `src/api/nutrition.ts` | backend/routers/nutrition.py | beslenme kayıtları |
| `src/api/expert.ts` | backend/routers/expert.py | uzman sistem istekleri |
| `src/types/*.ts` | backend/models/schemas.py | Pydantic modelleri → TypeScript tipleri |
| `src/auth/*` | backend/core/security.py | token saklama ve oturum durumu |
| `src/config/env.ts` | backend/core/config.py | API adresi ayarı |
| `src/lib/rpe.ts ve src/lib/date.ts` | backend/expert_system/recommendation.py | RIR→RPE özeti ve tarih biçimleme (ts-playground'dan taşınacak) |
| `src/types/common.ts` | backend/models/schemas.py | ortak tipler: hata cevabı, sayfalama |
| `src/auth/use-auth.ts` | backend/core/security.py | useAuth hook'u: giriş yapılmış mı |
| `src/providers/app-providers.tsx` | backend/main.py | uygulama başlangıcı: QueryClient ve AuthProvider |
| `src/hooks/use-exercises.ts` | backend/exercise_catalog.py | katalog verisi ve önbellek |
| `src/hooks/use-expert.ts` | backend/routers/expert.py | uzman bulguları, DOMS, tercihler |
| `src/hooks/use-nutrition.ts` | backend/routers/nutrition.py | beslenme verisi |
| `src/hooks/use-user.ts` | backend/routers/users.py | profil verisi |
| `src/hooks/use-program.ts` | backend/program_schedule_sync.py | özel program verisi |
| `src/lib/number.ts` | backend/expert_system/recommendation.py (_number) | toNumber ve sayı yardımcıları |
| `src/lib/volume.ts` | frontend/index.html ~32113 | canlı antrenman istatistikleri: set ve hacim toplamları |
| `src/lib/priority.ts` | backend/expert_system/evaluator.py | öncelik değerinden ton: Koruma/Kontrollü/Planlanabilir |
| `src/db/schema.ts` | backend/postgres_schema.py | cihazdaki yerel tablo şeması (offline aşaması) |
| `src/db/client.ts` | backend/core/database.py | yerel SQLite bağlantısı (offline aşaması) |
| `src/sync/queue.ts` | backend/routers/workouts.py | bekleyen işlem kuyruğu (offline aşaması) |
| `src/components/ui/button.tsx` | frontend/index.html (genel butonlar) | ortak buton |
| `src/components/ui/card.tsx` | frontend/index.html (kart stilleri) | ortak kart |
| `src/components/ui/text-field.tsx` | frontend/index.html (form alanları) | metin ve sayı girişi |
| `src/components/ui/date-picker-sheet.tsx` | frontend/index.html ~32157 ve ~35114 | tarih seçici (antrenman ve beslenme için ortak) |
| `src/components/ui/confirm-dialog.tsx` | frontend/index.html ~33242 | silme onay penceresi |
| `src/components/ui/segmented-control.tsx` | frontend/index.html ~35791 | haftalık/aylık/genel zaman dilimi seçici |
| `src/components/ui/progress-bar.tsx` | frontend/index.html ~35484 | makro ilerleme çubuğu |
| `src/components/ui/skeleton.tsx` | yeni (webde yok) | yükleniyor iskeleti |
| `src/components/ui/empty-state.tsx` | yeni (webde yok) | boş durum ekranı |
| `src/components/dashboard/weekly-summary.tsx` | frontend/index.html ~29598 | program ve haftalık özet metrikleri |
| `src/components/workout/exercise-list.tsx` | frontend/index.html ~31960 | egzersiz listesi kartları ve ekle butonları |
| `src/components/workout/exercise-card.tsx` | frontend/index.html ~32381 | seçili egzersiz ve set tablosu |
| `src/components/workout/set-row.tsx` | frontend/index.html ~32381-32610 | set satırı: ağırlık, tekrar, RIR, silme |
| `src/components/workout/live-stats-bar.tsx` | frontend/index.html ~32113 | canlı antrenman istatistikleri |
| `src/components/workout/workout-note.tsx` | frontend/index.html ~32973 | antrenman notu |
| `src/components/workout/history-card.tsx` | frontend/index.html ~33071-33295 | geçmiş kartı: aç/kapa, düzenle, kaydet, sil |
| `src/components/workout/rest-timer.tsx` | yeni (webde yok) | dinlenme sayacı |
| `src/components/charts/muscle-distribution-chart.tsx` | frontend/index.html ~29847 | kas dağılımı grafiği |
| `src/components/charts/xp-level-chart.tsx` | frontend/index.html ~29891 | XP ve seviye trendi grafiği |
| `src/components/charts/nutrition-chart.tsx` | frontend/index.html ~35854 | beslenme zaman serisi grafiği |
| `src/components/charts/macro-bar-chart.tsx` | frontend/index.html ~35563 | makro yüzde çubuğu grafiği |
| `src/components/nutrition/macro-summary.tsx` | frontend/index.html ~35518 | hedef ve kalori özet kartları |
| `src/components/nutrition/nutrition-note.tsx` | frontend/index.html ~33351 | beslenme notu |
| `src/components/program/week-tabs.tsx` | frontend/index.html ~36096 | özel program hafta sekmeleri |
| `src/components/program/day-card.tsx` | frontend/index.html ~36262 | özel program gün kartları |
| `src/components/program/set-rep-target-editor.tsx` | frontend/index.html ~43527 | hareket set ve tekrar hedefi düzenleme |
| `src/components/program/expert-program-builder.tsx` | frontend/index.html ~43399 | uzman önerisiyle program oluşturma |
| `src/components/expert/finding-card.tsx` | backend/expert_system/evaluator.py (çıktı) | uzman bulgusu kartı |
| `src/components/expert/doms-form.tsx` | frontend/index.html ~40235 | DOMS giriş ve düzenleme formu |
| `src/components/expert/injury-picker.tsx` | frontend/index.html ~12119 (stil) | sakatlık seçimi |
| `src/components/expert/rir-volume-rules-card.tsx` | frontend/index.html ~42137 | RIR ve hacim kural hiyerarşisi kartı |
| `src/components/expert/coach-chat.tsx` | frontend/index.html ~42469 | akıllı koçluk sohbeti |
| `src/components/expert/alternative-exercise-sheet.tsx` | frontend/index.html ~45553 | hareketi alternatifiyle değiştirme |
| — (mobilde yok) | backend/core/email.py | e-posta gönderimi sunucuda kalır |
| — (mobilde yok) | backend/core/database.py ve postgres_schema.py | sunucu veritabanı; mobilde yalnızca offline için yerel kopya (src/db) |
| — (mobilde yok) | backend/services/*.py | istatistik ve iş mantığı sunucuda kalır |
| — (mobilde yok) | backend/expert_system/core.py, evaluator.py, fuzzy_logic.py, rule_utils.py, rules/* | kural motoru sunucuda kalır, mobil yalnızca sonucu gösterir |
| — (mobilde yok) | backend/exercise_catalog.py ve exercise_aliases.py | katalog ve eski ad eşlemesi sunucuda, mobil API'den çeker |
| — (mobilde yok) | backend/routers/admin.py ve admin/db-management sayfaları | yönetici işleri webde kalır |
| — (mobilde yok) | backend/migrate_*.py | veritabanı taşıma araçları, mobille ilgisi yok |
| — (mobilde yok) | backend/Procfile, railway.toml, render.yaml | sunucu dağıtımı; mobilde app.json ve ileride eas.json |
| — (mobilde yok) | backend/requirements.txt | mobilde package.json karşılığıdır |
| — (mobilde yok) | backend/tests/* | mobil testler test aracı kurulunca __tests__/ içine gelir |
