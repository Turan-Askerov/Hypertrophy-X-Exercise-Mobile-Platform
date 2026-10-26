import '@/global.css';

import { Platform } from 'react-native';

// Varsayılan geliştirme teması koyu mod
export const Colors = {
  light: {
    text: '#ffffff',
    background: '#121214',
    backgroundElement: '#1a1b1e',
    backgroundSelected: '#2c2e33',
    textSecondary: '#909296',
  },
  dark: {
    text: '#ffffff',
    background: '#121214',
    backgroundElement: '#1a1b1e',
    backgroundSelected: '#2c2e33',
    textSecondary: '#909296',
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
  primary: '#C6F432', // Neon Lime (Design System Primary Accent)
  primaryDark: '#9BC71B',
  primaryMuted: '#2D3A12',
  accentLime: '#C6F432',
  accentCyan: '#38BDF8',
  accentPurple: '#A855F7',
  accentOrange: '#FB923C',
  bgDark: '#090A0F',
  surface: '#13161F',
  surfaceAlt: '#181C28',
  surfaceCard: '#151923',
  danger: '#ef4444',
  dangerMuted: '#450a0a',
  success: '#22c55e',
  successMuted: '#052e16',
  warning: '#f59e0b',
  warningMuted: '#451a03',
  border: '#232A3B',
  borderDark: '#1A1E29',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  muted: '#8E99AF',
  textSecondary: '#8E99AF',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
