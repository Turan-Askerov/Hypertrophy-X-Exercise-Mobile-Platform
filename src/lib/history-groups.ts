import type { Workout } from '../types/workout';

export const MONTHS_TR = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
] as const;

const SHORT_WEEKDAYS_TR = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'] as const;

export type HistoryDaySlot = {
  dateIso: string;
  dayNumber: number;
  weekdayShort: string;
  formattedDate: string;
  workouts: Workout[];
  isFuture: boolean;
};

export type HistoryWeekGroup = {
  id: string; // YYYY-MM-w1..w6
  year: number;
  month: number; // 1-12
  weekNumber: number; // 1..6 (takvimdeki Pazartesi-Pazar hafta sırası)
  title: string; // "1. Hafta" .. "6. Hafta"
  rangeLabel: string; // "23 – 29 Kasım" veya "30 Kasım"
  startDay: number;
  endDay: number;
  sessionsCount: number;
  totalSets: number;
  totalExercises: number;
  days: HistoryDaySlot[]; // En güncel gün üstte (endDay -> startDay)
};

export type HistoryMonthGroup = {
  id: string; // YYYY-MM
  year: number;
  month: number; // 1-12
  name: string; // "Kasım"
  title: string; // "Kasım 2026"
  daysCount: number; // 28, 29, 30 veya 31
  sessionsCount: number;
  activeWeeksCount: number;
  totalSets: number;
  totalExercises: number;
  weeks: HistoryWeekGroup[]; // En güncel hafta grubu üstte (yeniden eskiye Pazartesi-Pazar blokları)
};

export type HistoryYearGroup = {
  year: number;
  sessionsCount: number;
  activeMonthsCount: number;
  totalSets: number;
  totalExercises: number;
  months: HistoryMonthGroup[]; // Yeniden eskiye (güncel ay üstte)
};

/**
 * Saat dilimi kayması olmadan Workout.date alanından yerel ISO tarihi (YYYY-MM-DD) çıkarır.
 */
export function extractWorkoutDateIso(dateString: string | undefined | null): string | null {
  if (!dateString) return null;
  const trimmed = dateString.trim();
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (isoMatch) {
    return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  }
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, '0');
  const d = String(parsed.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTodayLocalIso(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatWeekdayShortTR(dateString: string | undefined | null): string {
  const iso = extractWorkoutDateIso(dateString);
  if (!iso) return '';
  const [year, month, day] = iso.split('-').map(Number);
  const dt = new Date(year, month - 1, day);
  return SHORT_WEEKDAYS_TR[dt.getDay()];
}

export function countWorkoutSets(workout: Workout): number {
  const exercises = workout.exercises || [];
  let total = 0;
  for (const ex of exercises) {
    total += ex.sets_data?.length || 0;
  }
  return total;
}

/**
 * Veritabanından gelen Workout dizisini Yıl -> Ay -> Gerçek Takvim Haftaları (Pzt-Paz) -> Tüm Günler
 * hiyerarşisine böler. Ay sınırından taşmayan gerçek hafta blokları üretir ve güncel haftayı üste koyar.
 */
export function buildWorkoutHierarchy(
  workouts: Workout[],
  todayIso: string = getTodayLocalIso()
): HistoryYearGroup[] {
  type Bucket = {
    year: number;
    month: number;
    byDateIso: Map<string, Workout[]>;
  };

  const monthBuckets = new Map<string, Bucket>();

  for (const w of workouts) {
    const dateIso = extractWorkoutDateIso(w.date);
    if (!dateIso) continue;

    const year = Number(dateIso.slice(0, 4));
    const month = Number(dateIso.slice(5, 7));
    if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
      continue;
    }

    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    let bucket = monthBuckets.get(monthKey);
    if (!bucket) {
      bucket = { year, month, byDateIso: new Map() };
      monthBuckets.set(monthKey, bucket);
    }

    const dayList = bucket.byDateIso.get(dateIso);
    if (dayList) {
      dayList.push(w);
    } else {
      bucket.byDateIso.set(dateIso, [w]);
    }
  }

  const yearsMap = new Map<number, HistoryMonthGroup[]>();

  for (const [monthId, bucket] of monthBuckets.entries()) {
    const { year, month, byDateIso } = bucket;
    const monthName = MONTHS_TR[month - 1];
    const daysInMonth = new Date(year, month, 0).getDate();
    const mm = String(month).padStart(2, '0');

    // Ay içindeki 1..daysInMonth günlerini gerçek Pazartesi -> Pazar sınırlarından haftalara ayır
    const calendarSpans: { weekNumber: number; startDay: number; endDay: number }[] = [];
    let spanStart = 1;
    let wkIdx = 1;

    for (let d = 1; d <= daysInMonth; d++) {
      const weekday = new Date(year, month - 1, d).getDay(); // 0 = Pazar
      if (weekday === 0 || d === daysInMonth) {
        calendarSpans.push({
          weekNumber: wkIdx++,
          startDay: spanStart,
          endDay: d,
        });
        spanStart = d + 1;
      }
    }

    // En güncel hafta üstte olacak şekilde ters çevir (örn. 6. Hafta -> 1. Hafta)
    const weeks: HistoryWeekGroup[] = calendarSpans
      .slice()
      .reverse()
      .map(({ weekNumber, startDay, endDay }) => {
        const days: HistoryDaySlot[] = [];
        let sessionsCount = 0;
        let totalSets = 0;
        let totalExercises = 0;

        // En güncel gün üstte olacak şekilde endDay -> startDay
        for (let d = endDay; d >= startDay; d--) {
          const dd = String(d).padStart(2, '0');
          const dateIso = `${year}-${mm}-${dd}`;
          const dayWorkouts = (byDateIso.get(dateIso) ?? []).slice().sort((a, b) => b.id - a.id);
          const weekdayIdx = new Date(year, month - 1, d).getDay();

          for (const w of dayWorkouts) {
            sessionsCount += 1;
            totalSets += countWorkoutSets(w);
            totalExercises += w.exercises?.length || 0;
          }

          days.push({
            dateIso,
            dayNumber: d,
            weekdayShort: SHORT_WEEKDAYS_TR[weekdayIdx],
            formattedDate: `${dd}.${mm}.${year}`,
            workouts: dayWorkouts,
            isFuture: dateIso > todayIso,
          });
        }

        const rangeLabel =
          startDay === endDay
            ? `${startDay} ${monthName}`
            : `${startDay} – ${endDay} ${monthName}`;

        return {
          id: `${monthId}-w${weekNumber}`,
          year,
          month,
          weekNumber,
          title: `${weekNumber}. Hafta`,
          rangeLabel,
          startDay,
          endDay,
          sessionsCount,
          totalSets,
          totalExercises,
          days,
        };
      });

    const monthSessionsCount = weeks.reduce((sum, wk) => sum + wk.sessionsCount, 0);
    const monthTotalSets = weeks.reduce((sum, wk) => sum + wk.totalSets, 0);
    const monthTotalExercises = weeks.reduce((sum, wk) => sum + wk.totalExercises, 0);
    const activeWeeksCount = weeks.filter((wk) => wk.sessionsCount > 0).length;

    const monthGroup: HistoryMonthGroup = {
      id: monthId,
      year,
      month,
      name: monthName,
      title: `${monthName} ${year}`,
      daysCount: daysInMonth,
      sessionsCount: monthSessionsCount,
      activeWeeksCount,
      totalSets: monthTotalSets,
      totalExercises: monthTotalExercises,
      weeks,
    };

    const existingMonths = yearsMap.get(year);
    if (existingMonths) {
      existingMonths.push(monthGroup);
    } else {
      yearsMap.set(year, [monthGroup]);
    }
  }

  const years: HistoryYearGroup[] = Array.from(yearsMap.entries())
    .sort((a, b) => b[0] - a[0]) // En güncel yıl üstte
    .map(([year, months]) => {
      months.sort((a, b) => b.month - a.month); // En güncel aktif ay üstte

      const sessionsCount = months.reduce((sum, m) => sum + m.sessionsCount, 0);
      const totalSets = months.reduce((sum, m) => sum + m.totalSets, 0);
      const totalExercises = months.reduce((sum, m) => sum + m.totalExercises, 0);

      return {
        year,
        sessionsCount,
        activeMonthsCount: months.length,
        totalSets,
        totalExercises,
        months,
      };
    });

  return years;
}
