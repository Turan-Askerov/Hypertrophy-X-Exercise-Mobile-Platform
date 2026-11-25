import assert from "node:assert/strict";
import {
  buildWorkoutHierarchy,
  countWorkoutSets,
  extractWorkoutDateIso,
  formatWeekdayShortTR,
} from "../src/lib/history-groups.ts";
import type { Workout } from "../src/types/workout.ts";

function makeWorkout(
  id: number,
  date: string,
  session_type: string,
  setsPerExercise: number[] = [3, 3]
): Workout {
  return {
    id,
    user_id: 1,
    date,
    session_type,
    gym_name: "Genç Mekan",
    total_volume: 1000,
    exercises: setsPerExercise.map((count, idx) => ({
      exercise_id: `ex-${idx}`,
      exercise_name: `Hareket ${idx + 1}`,
      muscle_group: "Göğüs",
      is_bodyweight: false,
      sets_data: Array.from({ length: count }, () => ({
        reps: 10,
        weight_kg: 60,
        rir: 1,
      })),
    })),
  };
}

// 1. Tarih & kısa gün adı ayrıştırma (saat dilimi kayması olmadan)
assert.equal(extractWorkoutDateIso("2026-11-23"), "2026-11-23");
assert.equal(extractWorkoutDateIso("2026-11-23T23:55:00.000Z"), "2026-11-23");
assert.equal(extractWorkoutDateIso(""), null);
assert.equal(extractWorkoutDateIso("gecersiz-tarih"), null);
assert.equal(formatWeekdayShortTR("2026-11-23"), "Pzt");
assert.equal(formatWeekdayShortTR("2026-11-30"), "Pzt");
assert.equal(formatWeekdayShortTR("2026-11-01"), "Paz");

// 2. Boş liste
assert.deepEqual(buildWorkoutHierarchy([]), []);

// 3. Çok yıllı + ayın tüm günleri (30/31/29 gün) + Pzt-Paz hafta blokları + aynı gün çoklu seans
const sampleWorkouts: Workout[] = [
  makeWorkout(1, "2024-02-29", "Artık Gün Bacak", [4, 4]), // 8 set -> Perşembe 29 Şub 2024
  makeWorkout(2, "2025-12-03", "Push 2025", [3]), // 3 set
  makeWorkout(3, "2026-10-31", "Ekim Sonu Sırt", [4, 3]), // 7 set
  makeWorkout(4, "2026-11-02", "Push", [3, 3, 2]), // 8 set -> 2-8 Kas (2. Hafta)
  makeWorkout(5, "2026-11-10", "Pull", [4]), // 4 set -> 9-15 Kas (3. Hafta)
  makeWorkout(6, "2026-11-23", "Push Sabah", [3, 3]), // 6 set -> 23-29 Kas (5. Hafta)
  makeWorkout(7, "2026-11-23T19:00:00Z", "Kardiyo Akşam", [2]), // 2 set -> 23-29 Kas (aynı gün 2. seans)
  makeWorkout(8, "hatali", "Bozuk Tarih", [5]), // Güvenli şekilde yok sayılmalı
];

const hierarchy = buildWorkoutHierarchy(sampleWorkouts, "2026-11-25");

// Yıllar en güncel üstte: 2026, 2025, 2024
assert.deepEqual(
  hierarchy.map((y) => y.year),
  [2026, 2025, 2024]
);

const y2026 = hierarchy[0];
assert.equal(y2026.sessionsCount, 5);
assert.equal(y2026.activeMonthsCount, 2);
assert.equal(y2026.totalSets, 27);
assert.deepEqual(
  y2026.months.map((m) => m.name),
  ["Kasım", "Ekim"]
);

// Kasım 2026: toplam 30 gün (1 Kas Paz, 2-8, 9-15, 16-22, 23-29, 30 Kas Pzt)
const nov = y2026.months[0];
assert.equal(nov.daysCount, 30);
assert.equal(nov.sessionsCount, 4);
assert.equal(nov.totalSets, 20);
assert.equal(nov.weeks.reduce((sum, wk) => sum + wk.days.length, 0), 30);

assert.deepEqual(
  nov.weeks.map((w) => w.rangeLabel),
  [
    "30 Kasım",
    "23 – 29 Kasım",
    "16 – 22 Kasım",
    "9 – 15 Kasım",
    "2 – 8 Kasım",
    "1 Kasım",
  ]
);

// Hafta içindeki günler en güncel üstte (29 -> 23) ve 23 Kasım'da 2 seans korunmalı
const weekNov23 = nov.weeks[1];
assert.equal(weekNov23.sessionsCount, 2);
assert.equal(weekNov23.totalSets, 8);
assert.deepEqual(
  weekNov23.days.map((d) => d.dayNumber),
  [29, 28, 27, 26, 25, 24, 23]
);
const nov23 = weekNov23.days.find((d) => d.dayNumber === 23);
assert.ok(nov23);
assert.equal(nov23.workouts.length, 2);
assert.equal(nov23.isFuture, false);
const nov27 = weekNov23.days.find((d) => d.dayNumber === 27);
assert.ok(nov27);
assert.equal(nov27.isFuture, true);

// Ekim 31 gün eksiksiz kaplanmalı
const oct = y2026.months[1];
assert.equal(oct.daysCount, 31);
assert.equal(oct.weeks.reduce((sum, wk) => sum + wk.days.length, 0), 31);
assert.equal(oct.weeks[0].days[0].dateIso, "2026-10-31");

// Şubat 2024 artık yıl 29 gün eksiksiz kaplanmalı
const feb2024 = hierarchy[2].months[0];
assert.equal(feb2024.daysCount, 29);
assert.equal(feb2024.weeks.reduce((sum, wk) => sum + wk.days.length, 0), 29);

assert.equal(countWorkoutSets(sampleWorkouts[3]), 8);

console.log("history-groups testleri geçti ✅");
