// Karşılığı: backend/expert_system/recommendation.py (rpe_summary_from_rir, format_tr_date)
// ts-playground/rpe.ts'ten taşındı ve genişletildi.

import { toNumber } from "./number.ts";

// ─── Yardımcılar (ts-playground'dan port) ───────────────────────────────────

/**
 * ISO tarihi (YYYY-MM-DD) Türkçe biçimine çevirir: "04.10.2026"
 */
export function formatTrDate(value: unknown): string {
  const raw = String(value ?? '').trim().slice(0, 10);
  const parts = raw.split('-');
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return raw || '—';
}

// ─── RIR → RPE dönüşümü ─────────────────────────────────────────────────────

/**
 * RIR değerini RPE'ye çevirir: RPE = 10 − RIR.
 * Sınırlar: RIR < 0 → RPE 10 (maksimum), RIR > 5 → RPE 5 (minimum).
 * Kaydedilen veri her zaman RIR olarak kalır; bu yalnızca görsel özet içindir.
 */
export function rirToRpe(rir: number): number {
  const clamped = Math.min(5, Math.max(0, rir));
  return 10 - clamped;
}

export type RirSummary = {
  averageRir: number;
  lowestRir: number;   // en düşük RIR = en yüksek efor
  averageRpe: number;
  highestRpe: number;
  setCount: number;
};

/**
 * Set listesinden RIR/RPE özeti üretir.
 * RIR girilmemiş setler (null/undefined) hesaba katılmaz.
 * Tüm setlerde RIR yoksa null döner.
 *
 * Backend karşılığı: recommendation.py::rpe_summary_from_rir
 */
export function rirSummaryFromSets(
  sets: readonly { rir?: number | null }[]
): RirSummary | null {
  const rirValues: number[] = [];
  for (const s of sets) {
    const r = s.rir;
    if (r !== null && r !== undefined && Number.isFinite(toNumber(r))) {
      rirValues.push(Math.min(5, Math.max(0, toNumber(r))));
    }
  }
  if (rirValues.length === 0) return null;

  const avg = rirValues.reduce((a, b) => a + b, 0) / rirValues.length;
  const lowest = Math.min(...rirValues);
  return {
    averageRir: Math.round(avg * 10) / 10,
    lowestRir: lowest,
    averageRpe: Math.round((10 - avg) * 10) / 10,
    highestRpe: 10 - lowest,
    setCount: rirValues.length,
  };
}
