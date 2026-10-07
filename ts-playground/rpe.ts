export function toNumber(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function formatTrDate(value: unknown): string {
  const raw = String(value ?? "").trim().slice(0, 10);
  const parts = raw.split("-");
  if (parts.length === 3 && parts.every((p) => /^\d+$/.test(p))) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return raw || "—";
}