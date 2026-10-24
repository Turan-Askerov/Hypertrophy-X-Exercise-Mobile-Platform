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
  primary: '#3b82f6',
  primaryMuted: '#1e3a8a',
  danger: '#ef4444',
  dangerMuted: '#450a0a',
  success: '#22c55e',
  successMuted: '#052e16',
  warning: '#f59e0b',
  warningMuted: '#451a03',
  border: '#2d3139',
  borderDark: '#2d3139',
  muted: '#4b5563',
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
