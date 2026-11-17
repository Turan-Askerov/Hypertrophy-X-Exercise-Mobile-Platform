export type SupersetTheme = {
  letter: string;
  label: string;
  primary: string;
  bg: string;
  border: string;
  text: string;
};

export const SUPERSET_PALETTE: SupersetTheme[] = [
  {
    letter: 'A',
    label: 'SÜPERSET A',
    primary: '#EC4899', // Neon Pembe / Fuşya
    bg: 'rgba(236, 72, 153, 0.16)',
    border: 'rgba(236, 72, 153, 0.45)',
    text: '#F472B6',
  },
  {
    letter: 'B',
    label: 'SÜPERSET B',
    primary: '#06B6D4', // Neon Cyan / Turkuaz
    bg: 'rgba(6, 182, 212, 0.16)',
    border: 'rgba(6, 182, 212, 0.45)',
    text: '#22D3EE',
  },
  {
    letter: 'C',
    label: 'SÜPERSET C',
    primary: '#F59E0B', // Neon Amber / Altın Sarısı
    bg: 'rgba(245, 158, 11, 0.16)',
    border: 'rgba(245, 158, 11, 0.45)',
    text: '#FBBF24',
  },
  {
    letter: 'D',
    label: 'SÜPERSET D',
    primary: '#10B981', // Neon Zümrüt Yeşili
    bg: 'rgba(16, 185, 129, 0.16)',
    border: 'rgba(16, 185, 129, 0.45)',
    text: '#34D399',
  },
  {
    letter: 'E',
    label: 'SÜPERSET E',
    primary: '#A855F7', // Neon Mor / Eflatun
    bg: 'rgba(168, 85, 247, 0.16)',
    border: 'rgba(168, 85, 247, 0.45)',
    text: '#C084FC',
  },
];

/**
 * superset_id (örn: "A", "B", "SS-1" vb.) değerine göre tema döndürür
 */
export function getSupersetTheme(supersetId?: string | null): SupersetTheme | null {
  if (!supersetId) return null;

  // Harf kontrolü (A, B, C...)
  const directMatch = SUPERSET_PALETTE.find(
    (item) => item.letter.toUpperCase() === supersetId.toUpperCase()
  );
  if (directMatch) return directMatch;

  // Eğer legacy format (örn: "SS-1" veya "SS-2") ise indexe çevir
  if (supersetId.startsWith('SS-')) {
    const num = parseInt(supersetId.replace('SS-', ''), 10);
    if (!isNaN(num) && num > 0) {
      const idx = (num - 1) % SUPERSET_PALETTE.length;
      return SUPERSET_PALETTE[idx];
    }
  }

  // Varsayılan Grup A teması
  return SUPERSET_PALETTE[0];
}

/**
 * Mevcut egzersiz listesinde henüz kullanılmamış ilk harfi bulur (A -> B -> C -> ...)
 */
export function getNextAvailableSupersetLetter(
  exercises: { superset_id?: string | null }[]
): string {
  const usedLetters = new Set<string>();

  for (const ex of exercises) {
    if (ex.superset_id) {
      const theme = getSupersetTheme(ex.superset_id);
      if (theme) {
        usedLetters.add(theme.letter.toUpperCase());
      }
    }
  }

  for (const item of SUPERSET_PALETTE) {
    if (!usedLetters.has(item.letter)) {
      return item.letter;
    }
  }

  return 'A';
}
