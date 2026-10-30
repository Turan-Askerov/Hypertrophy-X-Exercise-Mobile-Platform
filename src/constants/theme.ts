import '@/global.css';

import { Platform } from 'react-native';

// Varsayılan geliştirme teması koyu mod (Geçmiş Sayfası ile Birebir Cyber Dark)
export const Colors = {
  light: {
    text: '#F8FAFC',
    background: '#080B14',
    backgroundElement: '#101524',
    backgroundSelected: '#161E33',
    textSecondary: '#94A3B8',
  },
  dark: {
    text: '#F8FAFC',
    background: '#080B14',
    backgroundElement: '#101524',
    backgroundSelected: '#161E33',
    textSecondary: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const Typography = {
  small: 13,
  label: 14,
  body: 16,
  heading: 20,
  title: 24,
} as const;

export const AppColors = {
  primary: '#C084FC', // Mor / Vurgu (Geçmiş sayfası Cyber Dark moru)
  primaryDark: '#8B5CF6',
  primaryMuted: 'rgba(139, 92, 246, 0.14)',
  primaryBorder: 'rgba(139, 92, 246, 0.4)',
  accentLime: '#34D399', // Emerald Ağırlık Rozeti
  accentCyan: '#38BDF8', // Tekrar Cyan Rozeti
  accentPurple: '#C084FC', // Mor Rozet
  accentOrange: '#FBBF24', // RIR Amber Rozeti
  bgDark: '#080B14', // Geçmiş sayfası arka planı
  surface: '#101524', // Geçmiş kartı arka planı
  surfaceAlt: '#0F1528', // Geçmiş pano/modal iç arka planı
  surfaceCard: '#101524',
  danger: '#FF7898', // Geçmiş eylem kırmızısı
  dangerMuted: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',
  success: '#34D399',
  successMuted: 'rgba(16, 185, 129, 0.14)',
  warning: '#FBBF24',
  warningMuted: 'rgba(245, 158, 11, 0.12)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderDark: '#1E293B',
  borderSoft: 'rgba(255, 255, 255, 0.06)',
  borderHover: 'rgba(139, 92, 246, 0.35)',
  muted: '#94A3B8',
  textSecondary: '#94A3B8',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
