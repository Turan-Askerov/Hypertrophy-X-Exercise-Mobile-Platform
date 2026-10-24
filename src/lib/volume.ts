// Karşılığı: frontend/index.html ~32113
// Antrenman hacim ve set sayısı hesaplamaları.

/**
 * Tek bir setin yükü (kg × tekrar).
 * Vücut ağırlığı hareketlerinde weightKg kullanılmaz — yalnızca reps sayılır.
 * Sıfır veya negatif değerler 0 döndürür.
 */
export function setVolume(
  reps: number,
  weightKg: number,
  isBodyweight: boolean
): number {
  const r = Math.max(0, reps);
  if (isBodyweight) return r;
  return Math.max(0, r * Math.max(0, weightKg));
}

/**
 * Bir egzersizin tüm setlerinin toplam hacmi.
 */
export function exerciseVolume(
  sets: readonly { reps: number; weight_kg: number }[],
  isBodyweight: boolean
): number {
  return sets.reduce((sum, s) => sum + setVolume(s.reps, s.weight_kg, isBodyweight), 0);
}

/**
 * Birden fazla egzersizi kapsayan antrenmanda toplam hacim.
 */
export function workoutVolume(
  exercises: readonly {
    sets_data: readonly { reps: number; weight_kg: number }[];
    is_bodyweight: boolean;
  }[]
): number {
  return exercises.reduce(
    (sum, ex) => sum + exerciseVolume(ex.sets_data, ex.is_bodyweight),
    0
  );
}

/**
 * Toplam set sayısı (tüm egzersizler).
 */
export function workoutSetCount(
  exercises: readonly { sets_data: readonly unknown[] }[]
): number {
  return exercises.reduce((sum, ex) => sum + ex.sets_data.length, 0);
}

/**
 * Hacmi kullanıcı dostu biçime çevirir.
 * 1240 → "1.240 kg"
 * 800  → "800 kg"
 */
export function formatVolume(kg: number): string {
  if (!Number.isFinite(kg) || kg < 0) return '0 kg';
  return kg.toLocaleString('tr-TR', { maximumFractionDigits: 0 }) + ' kg';
}
