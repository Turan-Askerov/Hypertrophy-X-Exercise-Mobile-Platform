// Karşılığı: backend/expert_system/recommendation.py (_number)
// toNumber ve sayı yardımcıları

/**
 * Bilinmeyen değeri sayıya çevirir. null/undefined/"" → fallback.
 * 0, false, "" gibi falsy ama geçerli değerleri korur.
 */
export function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Ağırlığı kullanıcıya gösterilecek biçime çevirir.
 * 80   → "80"
 * 80.5 → "80.5"
 * 0    → "0"
 */
export function formatWeight(kg: number): string {
  if (!Number.isFinite(kg)) return '0';
  // Ondalık kısmı varsa göster, yoksa tam sayı
  return kg % 1 === 0 ? String(Math.round(kg)) : kg.toFixed(1);
}

/**
 * Yüzde biçimi. 87.333 → "87.3"
 * Varsayılan 1 ondalık basamak.
 */
export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '0';
  const clamped = Math.min(100, Math.max(0, value));
  return clamped.toFixed(decimals);
}
