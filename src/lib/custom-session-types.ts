export type DashboardPreferences = {
  schema_version?: number;
  pr_targets?: Record<string, number>;
  custom_session_types?: string[];
  favorite_session_types?: string[];
  [key: string]: unknown;
};

export const BUILTIN_SESSION_TYPES = [
  'Push',
  'Pull',
  'Legs',
  'Upper',
  'Lower',
  'Full Body',
  'Arms',
  'Core',
  'Rotatorlar',
  'Kardiyo',
  'Diğer',
] as const;

const BUILTIN_SESSION_ALIASES: Record<string, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs',
  upper: 'Upper',
  'üst vücut': 'Upper',
  lower: 'Lower',
  'alt vücut': 'Lower',
  'full body': 'Full Body',
  'tam vücut': 'Full Body',
  arms: 'Arms',
  core: 'Core',
  rotatorlar: 'Rotatorlar',
  kardiyo: 'Kardiyo',
  diğer: 'Diğer',
  custom: 'Diğer',
};

export const MAX_CUSTOM_SESSION_TYPES = 30;
export const MAX_CUSTOM_SESSION_TYPE_LENGTH = 48;

export function normalizeSessionTypeLabel(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function findBuiltInSessionType(raw: string): string | null {
  const clean = normalizeSessionTypeLabel(raw);
  if (!clean) return null;
  return BUILTIN_SESSION_ALIASES[clean.toLocaleLowerCase('tr-TR')] ?? null;
}

export function sanitizeCustomSessionTypes(rawTypes: unknown): string[] {
  if (!Array.isArray(rawTypes)) return [];
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of rawTypes) {
    if (typeof item !== 'string') continue;
    const clean = normalizeSessionTypeLabel(item);
    if (!clean || clean.length > MAX_CUSTOM_SESSION_TYPE_LENGTH) continue;
    if (findBuiltInSessionType(clean) !== null) continue;
    const key = clean.toLocaleLowerCase('tr-TR');
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
    if (result.length >= MAX_CUSTOM_SESSION_TYPES) break;
  }

  return result;
}

export function parseDashboardPreferencesObject(
  rawPreferences?: string | Record<string, unknown> | null,
): DashboardPreferences {
  if (rawPreferences && typeof rawPreferences === 'object' && !Array.isArray(rawPreferences)) {
    return { ...rawPreferences };
  }
  if (typeof rawPreferences !== 'string' || !rawPreferences.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(rawPreferences);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as DashboardPreferences;
    }
  } catch {
    // Bozuk JSON geldiğinde güvenli varsayılana düş
  }
  return {};
}

export function parseCustomSessionTypes(
  rawPreferences?: string | Record<string, unknown> | null,
): string[] {
  const prefs = parseDashboardPreferencesObject(rawPreferences);
  return sanitizeCustomSessionTypes(prefs.custom_session_types);
}

export function serializeWithCustomSessionTypes(
  rawPreferences: string | Record<string, unknown> | null | undefined,
  customSessionTypes: string[],
): string {
  const prefs = parseDashboardPreferencesObject(rawPreferences);
  prefs.schema_version =
    typeof prefs.schema_version === 'number' && prefs.schema_version >= 1
      ? prefs.schema_version
      : 1;
  prefs.custom_session_types = sanitizeCustomSessionTypes(customSessionTypes);
  return JSON.stringify(prefs);
}

export function addCustomSessionTypeToList(
  current: string[],
  rawLabel: string,
): { nextTypes: string[]; selectedType: string; didAdd: boolean } {
  const clean = normalizeSessionTypeLabel(rawLabel);
  if (!clean) {
    return { nextTypes: current, selectedType: '', didAdd: false };
  }

  const builtIn = findBuiltInSessionType(clean);
  if (builtIn) {
    return { nextTypes: current, selectedType: builtIn, didAdd: false };
  }

  const key = clean.toLocaleLowerCase('tr-TR');
  const existing = current.find((item) => item.toLocaleLowerCase('tr-TR') === key);
  if (existing) {
    return { nextTypes: current, selectedType: existing, didAdd: false };
  }

  const nextTypes = sanitizeCustomSessionTypes([...current, clean]);
  return { nextTypes, selectedType: clean, didAdd: true };
}

export function removeCustomSessionTypeFromList(
  current: string[],
  targetLabel: string,
): string[] {
  const key = normalizeSessionTypeLabel(targetLabel).toLocaleLowerCase('tr-TR');
  return current.filter((item) => item.toLocaleLowerCase('tr-TR') !== key);
}

export function renameCustomSessionTypeInList(
  current: string[],
  oldLabel: string,
  rawNewLabel: string,
): {
  nextTypes: string[];
  renamedTo: string;
  error?: string;
} {
  const oldKey = normalizeSessionTypeLabel(oldLabel).toLocaleLowerCase('tr-TR');
  const cleanNew = normalizeSessionTypeLabel(rawNewLabel);

  if (!cleanNew) {
    return {
      nextTypes: current,
      renamedTo: '',
      error: 'Lütfen geçerli bir seans türü adı girin.',
    };
  }
  if (cleanNew.length > MAX_CUSTOM_SESSION_TYPE_LENGTH) {
    return {
      nextTypes: current,
      renamedTo: '',
      error: `Özel seans adı en fazla ${MAX_CUSTOM_SESSION_TYPE_LENGTH} karakter olabilir.`,
    };
  }
  if (findBuiltInSessionType(cleanNew) !== null) {
    return {
      nextTypes: current,
      renamedTo: '',
      error: 'Bu isim yerleşik seans türleriyle çakışıyor.',
    };
  }

  const newKey = cleanNew.toLocaleLowerCase('tr-TR');
  const conflict = current.some((item) => {
    const itemKey = item.toLocaleLowerCase('tr-TR');
    return itemKey === newKey && itemKey !== oldKey;
  });
  if (conflict) {
    return {
      nextTypes: current,
      renamedTo: '',
      error: 'Bu isimde başka bir özel seans türü zaten var.',
    };
  }

  const nextTypes = current.map((item) =>
    item.toLocaleLowerCase('tr-TR') === oldKey ? cleanNew : item,
  );
  return { nextTypes, renamedTo: cleanNew };
}
