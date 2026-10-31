import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { useWorkouts } from '@/hooks/use-workouts';
import { formatTrDate } from '@/lib/rpe';

// ─── Renk Token'ları (Geçmiş & Beslenme Sayfaları ile Birebir Uyumlu Cyber Dark) ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(139, 92, 246, 0.35)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Vurgu (Cyber Dark / Neon Violet)
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleDark: '#7C3AED',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.35)',

  // Ağırlık / Başarı (Yeşil / Emerald)
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',

  // RIR / Rozet (Amber / Turuncu)
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.3)',

  // Cyan / Tekrar
  cyan: '#38BDF8',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
  cyanBorder: 'rgba(56, 189, 248, 0.3)',

  // Rose / Pembe
  rose: '#FB7185',
  roseBg: 'rgba(251, 113, 133, 0.12)',
  roseBorder: 'rgba(251, 113, 133, 0.3)',

  // Hata / Eylemler
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',

  // Modal Sheet
  modalSheetBg: '#0F1424',
  modalHandle: '#334155',
};

// ─── SVG İkonları ───

function BackIcon({ color = colors.text, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function EditPencilIcon({ color = colors.purpleLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
      />
    </Svg>
  );
}

function CloseIcon({ size = 14, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
    </Svg>
  );
}

function ChevronRightIcon({ color = colors.textDim, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function UserIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </Svg>
  );
}

function BellIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </Svg>
  );
}

function SoundIcon({ color = colors.emeraldLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"
      />
    </Svg>
  );
}

function TrophyIcon({ color = colors.amberLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4M5 4h14v4a7 7 0 01-14 0V4z" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 6H3a2 2 0 00-2 2v1a4 4 0 004 4h0m14-7h2a2 2 0 012 2v1a4 4 0 01-4 4h0" />
    </Svg>
  );
}

function DumbbellIcon({ color = colors.cyan, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
    </Svg>
  );
}

function ScaleIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l9-4 9 4M12 2v20M5 18h14M6 18l-3-7h6l-3 7zm12 0l-3-7h6l-3 7z" />
    </Svg>
  );
}

function RouteIcon({ color = colors.emeraldLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="6" cy="19" r="3" strokeWidth="2" />
      <Circle cx="18" cy="5" r="3" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19h4.5a3.5 3.5 0 000-7h-9a3.5 3.5 0 010-7H12" />
    </Svg>
  );
}

function RulerIcon({ color = colors.cyan, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="2" y="7" width="20" height="10" rx="2" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7v4M10 7v3M14 7v4M18 7v3" />
    </Svg>
  );
}

function GlobeIcon({ color = colors.cyan, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Svg>
  );
}

function MoonIcon({ color = colors.amberLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </Svg>
  );
}

function SunIcon({ color = colors.amberLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="5" strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
      />
    </Svg>
  );
}

function SystemThemeIcon({ color = colors.cyan, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="5" y="2" width="14" height="20" rx="3" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01" />
    </Svg>
  );
}

function ThemePaletteIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
      />
    </Svg>
  );
}

function MailIcon({ color = colors.purpleLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 6 9-6" />
    </Svg>
  );
}

function InfoIcon({ color = colors.textDim, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </Svg>
  );
}

function ShieldIcon({ color = colors.emeraldLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function LogoutIcon({ color = colors.amberLight, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </Svg>
  );
}

function TrashIcon({ color = colors.danger, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Svg>
  );
}

function CalendarIcon({ color = '#C084FC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
      <Circle cx="9" cy="15" r="1" fill={color} />
      <Circle cx="12" cy="15" r="1" fill={color} />
      <Circle cx="15" cy="15" r="1" fill={color} />
    </Svg>
  );
}

function SummaryFlameIcon({ color = '#34D399', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.879 16.121A3 3 0 1012.015 11L11 14H9.879z"
      />
    </Svg>
  );
}

function TrendingUpIcon({ color = '#C084FC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </Svg>
  );
}

function CheckCircleFill({ size = 20, color = colors.purpleLight }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
    </Svg>
  );
}

function RadioUnchecked({ size = 20, color = 'rgba(255, 255, 255, 0.2)' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function SeedlingIcon({ size = 20, color = colors.emeraldLight }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22V12m0 0a5 5 0 015-5h2a5 5 0 01-5 5zm0 0a5 5 0 00-5-5H5a5 5 0 005 5z" />
    </Svg>
  );
}

function LightningIcon({ size = 20, color = colors.purpleLight }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function MuscleIcon({ size = 20, color = colors.purpleLight }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19v-2a4 4 0 014-4h8a4 4 0 014 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
    </Svg>
  );
}

function FlameIcon({ size = 20, color = colors.danger }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </Svg>
  );
}

function BoltIcon({ size = 20, color = colors.cyan }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </Svg>
  );
}

// ─── Sabit Seçenekler ───

const FITNESS_LEVELS = [
  {
    key: 'Beginner',
    title: 'Başlangıç Seviyesi',
    badge: '0 - 1 Yıl',
    desc: 'Temel bileşik hareket kalıpları, form stabilitesi ve nöromüsküler adaptasyon.',
    icon: SeedlingIcon,
    accent: colors.emeraldLight,
  },
  {
    key: 'Intermediate',
    title: 'Orta Seviye',
    badge: '1 - 3 Yıl',
    desc: 'Aşamalı aşırı yüklenme (progressive overload), hacim döngüleri ve hipertrofi.',
    icon: LightningIcon,
    accent: colors.purpleLight,
  },
  {
    key: 'Advanced',
    title: 'İleri Seviye (Elite)',
    badge: '3+ Yıl',
    desc: 'Yüksek yoğunluklu setler, RPE/RIR hassasiyeti, plato aşımı ve mikro döngüler.',
    icon: TrophyIcon,
    accent: colors.amberLight,
  },
] as const;

const GOAL_OPTIONS = [
  {
    key: 'hypertrophy',
    title: 'Kas Odaklı (Hipertrofi)',
    badge: 'Lif Büyümesi',
    desc: 'Mekanik gerilim ve metabolik stres ile hedef kas lifi mikroyırtığı ve optimum büyüme.',
    icon: MuscleIcon,
    accent: colors.purpleLight,
  },
  {
    key: 'bulk',
    title: 'Hacim & Kütle (Bulk)',
    badge: 'MAV Hacim',
    desc: 'Kontrollü kalori fazlası ve maksimum hipertrofi hacmi ile net kas kütlesi inşası.',
    icon: DumbbellIcon,
    accent: colors.cyan,
  },
  {
    key: 'cut',
    title: 'Definasyon & Yağ Yakımı (Cut)',
    badge: 'MEV Yağ Yakımı',
    desc: 'Kalori açığında kas kütlesini azami seviyede koruyan minimum etkili hacim.',
    icon: FlameIcon,
    accent: colors.danger,
  },
  {
    key: 'strength',
    title: 'Maksimal Güç (Kuvvet)',
    badge: '1RM & MSS',
    desc: 'Düşük tekrar, yüksek yoğunluklu nöromüsküler patlayıcı kuvvet adaptasyonu.',
    icon: BoltIcon,
    accent: colors.cyan,
  },
  {
    key: 'maintain',
    title: 'Form Koruma & Rekomp',
    badge: 'MV Denge',
    desc: 'Yorulma birikimi olmadan mevcut kas kütlesini koruma ve metabolik zindelik.',
    icon: ShieldIcon,
    accent: colors.emeraldLight,
  },
] as const;

// ─── RPG & XP Hesaplama Fonksiyonu ───

const LEVEL_THRESHOLDS = [0, 500, 1000, 5000, 15000, 35000, 75000];
const LEVEL_TITLES = [
  'Çaylak',
  'Çaylak',
  'Demir Bükücü',
  'Çelik İradesi',
  'Spartalı',
  'Titan',
  'Yarı Tanrı',
  'Olimposlu',
];

function calculateRpgState(workouts: any[]) {
  const sorted = [...(workouts || [])].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalXP = 0;
  sorted.forEach((w) => {
    let exercises: any[] = [];
    try {
      if (typeof w.exercises === 'string') {
        exercises = JSON.parse(w.exercises);
      } else if (Array.isArray(w.exercises)) {
        exercises = w.exercises;
      }
    } catch {
      exercises = [];
    }

    const completedSets = exercises.reduce((acc: number, ex: any) => {
      const sets = Array.isArray(ex.sets) ? ex.sets : [];
      return acc + sets.filter((s: any) => s && (s.completed ?? true)).length;
    }, 0);

    totalXP += 50 + completedSets * 10;
  });

  let currentLevel = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      currentLevel = i + 1;
      break;
    }
  }

  const levelTitle = LEVEL_TITLES[currentLevel - 1] || 'Efsane';
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[currentLevel] || currentThreshold * 2;
  const levelSize = nextThreshold - currentThreshold;
  const xpInCurrentLevel = Math.max(0, totalXP - currentThreshold);
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / (levelSize || 1)) * 100))
  );
  const xpLeft = Math.max(0, nextThreshold - totalXP);

  // Seri Hesaplama
  let streakWeeks = 0;
  if (sorted.length > 0) {
    const today = new Date();
    const workoutWeeks = new Set<string>();
    sorted.forEach((w) => {
      const d = new Date(w.date);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNo = Math.ceil(
        ((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
      );
      workoutWeeks.add(`${d.getFullYear()}-W${weekNo}`);
    });

    const currStartOfYear = new Date(today.getFullYear(), 0, 1);
    let checkWeek = Math.ceil(
      ((today.getTime() - currStartOfYear.getTime()) / 86400000 + currStartOfYear.getDay() + 1) / 7
    );
    let checkYear = today.getFullYear();

    while (workoutWeeks.has(`${checkYear}-W${checkWeek}`)) {
      streakWeeks++;
      checkWeek--;
      if (checkWeek <= 0) {
        checkYear--;
        checkWeek = 52;
      }
    }
  }

  return {
    totalXP,
    currentLevel,
    levelTitle,
    xpInCurrentLevel,
    levelSize,
    progressPercent,
    xpLeft,
    streakWeeks,
  };
}

function normalizeFitnessLevel(raw?: string | null): string {
  if (!raw) return 'Intermediate';
  const l = raw.toLowerCase();
  if (l.includes('adv') || l.includes('ileri')) return 'Advanced';
  if (l.includes('inter') || l.includes('orta')) return 'Intermediate';
  if (l.includes('beg') || l.includes('başlangıç') || l.includes('baslangic')) return 'Beginner';
  return 'Intermediate';
}

function normalizeGoal(raw?: string | null): string {
  if (!raw) return 'hypertrophy';
  const g = raw.toLowerCase();
  if (g.includes('hypertrophy') || g.includes('kas')) return 'hypertrophy';
  if (g.includes('bulk') || g.includes('kilo alma')) return 'bulk';
  if (g.includes('cut') || g.includes('yağ') || g.includes('yag')) return 'cut';
  if (g.includes('strength') || g.includes('güç') || g.includes('guc')) return 'strength';
  if (g.includes('maintain') || g.includes('koruma')) return 'maintain';
  return g;
}

// ─── Ayar Satırı Bileşeni (Görseldeki Yuvarlatılmış Pill Tasarımı) ───

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  valueBadge?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
};

function SettingItem({
  icon,
  title,
  subtitle,
  valueBadge,
  onPress,
  destructive = false,
  rightElement,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, destructive && styles.destructiveItemContainer]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrapper, destructive && styles.destructiveIconWrapper]}>
          {icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.itemTitle, destructive && styles.destructiveTitle]}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.itemRight}>
        {rightElement ? (
          rightElement
        ) : (
          <>
            {valueBadge ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{valueBadge}</Text>
              </View>
            ) : null}
            <ChevronRightIcon color={destructive ? '#ef4444' : '#64748b'} size={18} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Otomatik Klavye Kaydırma Hesaplayıcı ───
function calculateAutoKeyboardShift(params: {
  keyboardScreenY?: number;
  keyboardHeight: number;
  containerLayoutY: number;
  containerHeight: number;
  sheetHeight: number;
  statusBarInset?: number;
}): number {
  const {
    keyboardScreenY = 0,
    keyboardHeight,
    containerLayoutY,
    containerHeight,
    sheetHeight,
    statusBarInset = 44,
  } = params;

  if (keyboardHeight <= 0) return 0;

  const screenH = Dimensions.get('screen').height;
  const windowH = Dimensions.get('window').height;
  const baseScreenHeight = Math.max(screenH, windowH);

  // 1. Android / Sistem adjustResize Kontrolü:
  const isAlreadyResizedBySystem = containerHeight <= baseScreenHeight - keyboardHeight * 0.7;
  if (isAlreadyResizedBySystem) {
    return 0;
  }

  // 2. Ekran Geometrisi:
  const actualKeyboardTop =
    keyboardScreenY > 0 && keyboardScreenY < baseScreenHeight
      ? keyboardScreenY
      : baseScreenHeight - keyboardHeight;

  const containerScreenBottom = containerLayoutY + containerHeight;
  const overlap = Math.max(0, containerScreenBottom - actualKeyboardTop);
  if (overlap <= 0) return 0;

  // 3. Tavan Güvenliği:
  const maxAllowedShift = Math.max(0, containerHeight - sheetHeight - statusBarInset);

  return Math.min(overlap, maxAllowedShift);
}

// ─── Sürüklenebilir Hakkında Alt Panosu ───
function AboutBottomSheetModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const estimatedSheetHeight = 360;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));

  const openSheet = useCallback(() => {
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 220,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, sheetHeight, translateY]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight || estimatedSheetHeight,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [backdropAnim, estimatedSheetHeight, onClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const fade = Math.max(0.2, 1 - gestureState.dy / (sheetHeight * 1.1));
            backdropAnim.setValue(fade);
          } else {
            translateY.setValue(gestureState.dy * 0.18);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss = gestureState.dy > 70 || gestureState.vy > 0.4;
          if (shouldDismiss) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                mass: 0.8,
                stiffness: 240,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
      }),
    [backdropAnim, closeSheet, sheetHeight, translateY]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={styles.modalRootContainer}>
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={styles.modalBackdropTapInner} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [{ translateY }],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 2) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükleme Tutamaç Alanı */}
          <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
            <View style={styles.modalHandle} />
          </View>

          {/* Başlık Satırı (Aynı zamanda sürüklenebilir) */}
          <View style={styles.modalHeaderRow}>
            <View {...panResponder.panHandlers} style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.modalTitle}>Hypertrophy-X Hakkında</Text>
              <Text style={styles.modalDesc}>
                Aşağı sürükleyerek kapatabilirsiniz
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButtonRed}
              onPress={closeSheet}
              hitSlop={10}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <CloseIcon size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <Text style={{ fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 14 }}>
            Hipertrofi odaklı bilimsel antrenman, RIR/RPE takibi, progresif aşırı yükleme ve hacim optimizasyon platformu.
          </Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Sürüm</Text>
            <Text style={styles.aboutVal}>v4.0.0 (Production)</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Framework</Text>
            <Text style={styles.aboutVal}>Expo SDK 58 / React Native</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Geliştirici</Text>
            <Text style={styles.aboutVal}>Turan Asgarlı</Text>
          </View>

          <View style={styles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Modern & Sürüklenebilir Tema Tercihi Alt Panosu ───
function ThemeBottomSheetModal({
  visible,
  onClose,
  currentTheme,
  onSelectTheme,
}: {
  visible: boolean;
  onClose: () => void;
  currentTheme: 'Koyu' | 'Açık' | 'Sistem';
  onSelectTheme: (theme: 'Koyu' | 'Açık' | 'Sistem') => void;
}) {
  const estimatedSheetHeight = 490;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerLayoutY, setContainerLayoutY] = useState(0);

  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));
  const [keyboardShiftAnim] = useState(() => new Animated.Value(0));

  const openSheet = useCallback(() => {
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);
    keyboardShiftAnim.setValue(0);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 220,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, keyboardShiftAnim, sheetHeight, translateY]);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight || estimatedSheetHeight,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [backdropAnim, estimatedSheetHeight, keyboardShiftAnim, onClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  // Klavye Dinamik Takipçi & Otomatik Hesaplama (Klavye Açıldığında Panoyu Klavyenin Üzerine Taşır)
  useEffect(() => {
    if (!visible) {
      keyboardShiftAnim.setValue(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const kHeight = e?.endCoordinates?.height || 0;
      const kScreenY = e?.endCoordinates?.screenY;
      const duration = e?.duration || 220;

      const targetShift = calculateAutoKeyboardShift({
        keyboardScreenY: kScreenY,
        keyboardHeight: kHeight,
        containerLayoutY,
        containerHeight,
        sheetHeight,
        statusBarInset: 44,
      });

      Animated.timing(keyboardShiftAnim, {
        toValue: targetShift,
        duration: Math.max(160, duration),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e: any) => {
      const duration = e?.duration || 200;
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: Math.max(140, duration),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [containerHeight, containerLayoutY, keyboardShiftAnim, sheetHeight, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const fade = Math.max(0.2, 1 - gestureState.dy / (sheetHeight * 1.1));
            backdropAnim.setValue(fade);
          } else {
            translateY.setValue(gestureState.dy * 0.18);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss = gestureState.dy > 70 || gestureState.vy > 0.4;
          if (shouldDismiss) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                mass: 0.8,
                stiffness: 240,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
      }),
    [backdropAnim, closeSheet, sheetHeight, translateY]
  );

  const themeOptions: {
    id: 'Koyu' | 'Açık' | 'Sistem';
    title: string;
    subtitle: string;
    badge?: string;
    badgeBg?: string;
    badgeBorder?: string;
    badgeColor?: string;
    icon: () => React.ReactNode;
    iconBg: string;
    iconBorder: string;
    preview: () => React.ReactNode;
  }[] = [
    {
      id: 'Koyu',
      title: 'Koyu Tema',
      subtitle: 'OLED derin siyahı & neon mor vurgular',
      badge: 'Tavsiye Edilen',
      badgeBg: 'rgba(139, 92, 246, 0.14)',
      badgeBorder: 'rgba(139, 92, 246, 0.4)',
      badgeColor: colors.purpleLight,
      iconBg: colors.purpleBg,
      iconBorder: colors.purpleBorder,
      icon: () => <MoonIcon color={colors.purpleLight} size={22} />,
      preview: () => (
        <View style={themeModalStyles.previewDarkBox}>
          <View style={themeModalStyles.previewDarkHeader} />
          <View style={themeModalStyles.previewDarkLine1} />
          <View style={themeModalStyles.previewDarkLine2} />
        </View>
      ),
    },
    {
      id: 'Açık',
      title: 'Açık Tema',
      subtitle: 'Yüksek aydınlıkta maksimum netlik ve kontrast',
      badge: 'Yüksek Kontrast',
      badgeBg: 'rgba(245, 158, 11, 0.14)',
      badgeBorder: 'rgba(245, 158, 11, 0.35)',
      badgeColor: colors.amberLight,
      iconBg: 'rgba(245, 158, 11, 0.12)',
      iconBorder: 'rgba(245, 158, 11, 0.35)',
      icon: () => <SunIcon color={colors.amberLight} size={22} />,
      preview: () => (
        <View style={themeModalStyles.previewLightBox}>
          <View style={themeModalStyles.previewLightHeader} />
          <View style={themeModalStyles.previewLightLine1} />
          <View style={themeModalStyles.previewLightLine2} />
        </View>
      ),
    },
    {
      id: 'Sistem',
      title: 'Sistem Teması',
      subtitle: 'Cihaz ayarlarınızla otomatik senkronize olur',
      badge: 'Otomatik',
      badgeBg: 'rgba(56, 189, 248, 0.12)',
      badgeBorder: 'rgba(56, 189, 248, 0.35)',
      badgeColor: colors.cyan,
      iconBg: colors.cyanBg,
      iconBorder: colors.cyanBorder,
      icon: () => <SystemThemeIcon color={colors.cyan} size={22} />,
      preview: () => (
        <View style={themeModalStyles.previewSplitBox}>
          <View style={themeModalStyles.previewSplitLeft}>
            <View style={themeModalStyles.previewDarkHeader} />
            <View style={themeModalStyles.previewDarkLine1} />
          </View>
          <View style={themeModalStyles.previewSplitRight}>
            <View style={themeModalStyles.previewLightHeader} />
            <View style={themeModalStyles.previewLightLine1} />
          </View>
        </View>
      ),
    },
  ];

  const handleSelect = (id: 'Koyu' | 'Açık' | 'Sistem') => {
    onSelectTheme(id);
    setTimeout(() => {
      closeSheet();
    }, 180);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View
        style={styles.modalRootContainer}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          setContainerLayoutY(y);
          setContainerHeight(height);
        }}
      >
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={styles.modalBackdropTapInner} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [
                {
                  translateY: Animated.subtract(translateY, keyboardShiftAnim),
                },
              ],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 2) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükleme Tutamaç Alanı */}
          <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
            <View style={styles.modalHandle} />
          </View>

          {/* Başlık Satırı */}
          <View style={styles.modalHeaderRow}>
            <View {...panResponder.panHandlers} style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ThemePaletteIcon size={20} color={colors.purpleLight} />
                <Text style={styles.modalTitle}>Tema Tercihi</Text>
              </View>
              <Text style={styles.modalDesc}>
                Uygulama arayüzünün görsel görünümünü seçin
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButtonRed}
              onPress={closeSheet}
              hitSlop={10}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <CloseIcon size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Tema Seçenek Kartları */}
          <View style={{ gap: 10, marginTop: 4, marginBottom: 14 }}>
            {themeOptions.map((opt) => {
              const isSelected = currentTheme === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    themeModalStyles.themeCard,
                    isSelected && themeModalStyles.themeCardSelected,
                  ]}
                  onPress={() => handleSelect(opt.id)}
                  activeOpacity={0.75}
                >
                  {/* İkon */}
                  <View
                    style={[
                      themeModalStyles.themeIconBox,
                      { backgroundColor: opt.iconBg, borderColor: opt.iconBorder },
                    ]}
                  >
                    {opt.icon()}
                  </View>

                  {/* Metinler */}
                  <View style={themeModalStyles.themeInfoCol}>
                    <View style={themeModalStyles.themeTitleRow}>
                      <Text style={themeModalStyles.themeTitle}>{opt.title}</Text>
                      {opt.badge ? (
                        <View
                          style={[
                            themeModalStyles.themeBadge,
                            {
                              backgroundColor: opt.badgeBg,
                              borderColor: opt.badgeBorder,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              themeModalStyles.themeBadgeText,
                              { color: opt.badgeColor },
                            ]}
                          >
                            {opt.badge}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={themeModalStyles.themeSubtitle} numberOfLines={2}>
                      {opt.subtitle}
                    </Text>
                  </View>

                  {/* Mini Önizleme Maketi */}
                  <View style={themeModalStyles.previewContainer}>
                    {opt.preview()}
                  </View>

                  {/* Radio Çemberi */}
                  <View
                    style={[
                      themeModalStyles.radioOuter,
                      isSelected && themeModalStyles.radioOuterSelected,
                    ]}
                  >
                    {isSelected ? <View style={themeModalStyles.radioInner} /> : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Alt Bilgi İpucu Kutusu */}
          <View style={themeModalStyles.tipBox}>
            <Text style={themeModalStyles.tipIcon}>💡</Text>
            <Text style={themeModalStyles.tipText}>
              {"Cyber Dark teması AMOLED ekranlarda %30'a kadar pil tasarrufu sağlar ve antrenman sırasında odaklanmanızı artırır."}
            </Text>
          </View>

          <View style={styles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Modern & Sürüklenebilir Birim Tercihleri Alt Panosu ───
function UnitsBottomSheetModal({
  visible,
  onClose,
  weightUnit,
  distanceUnit,
  bodyMeasurementUnit,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  weightUnit: 'kg' | 'lbs';
  distanceUnit: 'km' | 'mil';
  bodyMeasurementUnit: 'cm' | 'in';
  onSave: (units: {
    weight: 'kg' | 'lbs';
    distance: 'km' | 'mil';
    body: 'cm' | 'in';
  }) => void;
}) {
  const estimatedSheetHeight = 390;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);
  const [containerHeight, setContainerHeight] = useState(0);
  const [containerLayoutY, setContainerLayoutY] = useState(0);

  // Yerel seçim state'leri
  const [selectedWeight, setSelectedWeight] = useState<'kg' | 'lbs'>(weightUnit);
  const [selectedDistance, setSelectedDistance] = useState<'km' | 'mil'>(distanceUnit);
  const [selectedBody, setSelectedBody] = useState<'cm' | 'in'>(bodyMeasurementUnit);

  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));
  const [keyboardShiftAnim] = useState(() => new Animated.Value(0));


  const openSheet = useCallback(() => {
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);
    keyboardShiftAnim.setValue(0);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 220,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, keyboardShiftAnim, sheetHeight, translateY]);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight || estimatedSheetHeight,
        duration: 220,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        onClose();
      }
    });
  }, [backdropAnim, estimatedSheetHeight, keyboardShiftAnim, onClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  // Klavye Dinamik Takipçi & Otomatik Hesaplama
  useEffect(() => {
    if (!visible) {
      keyboardShiftAnim.setValue(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const kHeight = e?.endCoordinates?.height || 0;
      const kScreenY = e?.endCoordinates?.screenY;
      const duration = e?.duration || 220;

      const targetShift = calculateAutoKeyboardShift({
        keyboardScreenY: kScreenY,
        keyboardHeight: kHeight,
        containerLayoutY,
        containerHeight,
        sheetHeight,
        statusBarInset: 44,
      });

      Animated.timing(keyboardShiftAnim, {
        toValue: targetShift,
        duration: Math.max(160, duration),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e: any) => {
      const duration = e?.duration || 200;
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: Math.max(140, duration),
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [containerHeight, containerLayoutY, keyboardShiftAnim, sheetHeight, visible]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onMoveShouldSetPanResponderCapture: (_, gestureState) => {
          return gestureState.dy > 1 || Math.abs(gestureState.dy) > 2;
        },
        onPanResponderGrant: () => {
          translateY.stopAnimation();
        },
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const fade = Math.max(0.2, 1 - gestureState.dy / (sheetHeight * 1.1));
            backdropAnim.setValue(fade);
          } else {
            translateY.setValue(gestureState.dy * 0.18);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          const shouldDismiss = gestureState.dy > 70 || gestureState.vy > 0.4;
          if (shouldDismiss) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 22,
                mass: 0.8,
                stiffness: 240,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
      }),
    [backdropAnim, closeSheet, sheetHeight, translateY]
  );

  const handleSave = () => {
    onSave({
      weight: selectedWeight,
      distance: selectedDistance,
      body: selectedBody,
    });
    closeSheet();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View
        style={styles.modalRootContainer}
        onLayout={(e) => {
          const { y, height } = e.nativeEvent.layout;
          setContainerLayoutY(y);
          setContainerHeight(height);
        }}
      >
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={styles.modalBackdropTapInner} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [
                {
                  translateY: Animated.subtract(translateY, keyboardShiftAnim),
                },
              ],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 2) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükleme Tutamaç Alanı */}
          <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
            <View style={styles.modalHandle} />
          </View>

          {/* Başlık Satırı */}
          <View style={styles.modalHeaderRow}>
            <View {...panResponder.panHandlers} style={{ flex: 1, paddingRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ScaleIcon size={20} color={colors.purpleLight} />
                <Text style={styles.modalTitle}>Birim Tercihleri</Text>
              </View>
              <Text style={styles.modalDesc}>
                Ağırlık, mesafe ve vücut ölçüleri formatını seçin
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalCloseButtonRed}
              onPress={closeSheet}
              hitSlop={10}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <CloseIcon size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          <View style={{ gap: 14, marginVertical: 6 }}>
            {/* 1. BÖLÜM: AĞIRLIK BİRİMİ */}
            <View style={unitsModalStyles.groupBlock}>
              <View style={unitsModalStyles.groupHeader}>
                <DumbbellIcon size={14} color={colors.amberLight} />
                <Text style={unitsModalStyles.groupTitle}>AĞIRLIK BİRİMİ</Text>
              </View>
              <View style={unitsModalStyles.optionsRow}>
                <TouchableOpacity
                  style={[
                    unitsModalStyles.unitBtn,
                    selectedWeight === 'kg' && unitsModalStyles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedWeight('kg')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      unitsModalStyles.unitBtnSymbol,
                      selectedWeight === 'kg' && unitsModalStyles.unitBtnSymbolSelected,
                    ]}
                  >
                    kg
                  </Text>
                  <Text
                    style={[
                      unitsModalStyles.unitBtnName,
                      selectedWeight === 'kg' && unitsModalStyles.unitBtnNameSelected,
                    ]}
                  >
                    Kilogram
                  </Text>
                  {selectedWeight === 'kg' ? (
                    <Text style={unitsModalStyles.unitBtnCheck}>✓</Text>
                  ) : null}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    unitsModalStyles.unitBtn,
                    selectedWeight === 'lbs' && unitsModalStyles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedWeight('lbs')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      unitsModalStyles.unitBtnSymbol,
                      selectedWeight === 'lbs' && unitsModalStyles.unitBtnSymbolSelected,
                    ]}
                  >
                    lbs
                  </Text>
                  <Text
                    style={[
                      unitsModalStyles.unitBtnName,
                      selectedWeight === 'lbs' && unitsModalStyles.unitBtnNameSelected,
                    ]}
                  >
                    Pound
                  </Text>
                  {selectedWeight === 'lbs' ? (
                    <Text style={unitsModalStyles.unitBtnCheck}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. BÖLÜM: MESAFE BİRİMİ */}
            <View style={unitsModalStyles.groupBlock}>
              <View style={unitsModalStyles.groupHeader}>
                <RouteIcon size={14} color={colors.emeraldLight} />
                <Text style={unitsModalStyles.groupTitle}>MESAFE BİRİMİ</Text>
              </View>
              <View style={unitsModalStyles.optionsRow}>
                <TouchableOpacity
                  style={[
                    unitsModalStyles.unitBtn,
                    selectedDistance === 'km' && unitsModalStyles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedDistance('km')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      unitsModalStyles.unitBtnSymbol,
                      selectedDistance === 'km' && unitsModalStyles.unitBtnSymbolSelected,
                    ]}
                  >
                    km
                  </Text>
                  <Text
                    style={[
                      unitsModalStyles.unitBtnName,
                      selectedDistance === 'km' && unitsModalStyles.unitBtnNameSelected,
                    ]}
                  >
                    Kilometre
                  </Text>
                  {selectedDistance === 'km' ? (
                    <Text style={unitsModalStyles.unitBtnCheck}>✓</Text>
                  ) : null}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    unitsModalStyles.unitBtn,
                    selectedDistance === 'mil' && unitsModalStyles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedDistance('mil')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      unitsModalStyles.unitBtnSymbol,
                      selectedDistance === 'mil' && unitsModalStyles.unitBtnSymbolSelected,
                    ]}
                  >
                    mi
                  </Text>
                  <Text
                    style={[
                      unitsModalStyles.unitBtnName,
                      selectedDistance === 'mil' && unitsModalStyles.unitBtnNameSelected,
                    ]}
                  >
                    Mil
                  </Text>
                  {selectedDistance === 'mil' ? (
                    <Text style={unitsModalStyles.unitBtnCheck}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. BÖLÜM: VÜCUT ÖLÇÜLERİ */}
            <View style={unitsModalStyles.groupBlock}>
              <View style={unitsModalStyles.groupHeader}>
                <RulerIcon size={14} color={colors.cyan} />
                <Text style={unitsModalStyles.groupTitle}>VÜCUT ÖLÇÜLERİ</Text>
              </View>
              <View style={unitsModalStyles.optionsRow}>
                <TouchableOpacity
                  style={[
                    unitsModalStyles.unitBtn,
                    selectedBody === 'cm' && unitsModalStyles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedBody('cm')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      unitsModalStyles.unitBtnSymbol,
                      selectedBody === 'cm' && unitsModalStyles.unitBtnSymbolSelected,
                    ]}
                  >
                    cm
                  </Text>
                  <Text
                    style={[
                      unitsModalStyles.unitBtnName,
                      selectedBody === 'cm' && unitsModalStyles.unitBtnNameSelected,
                    ]}
                  >
                    Santimetre
                  </Text>
                  {selectedBody === 'cm' ? (
                    <Text style={unitsModalStyles.unitBtnCheck}>✓</Text>
                  ) : null}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    unitsModalStyles.unitBtn,
                    selectedBody === 'in' && unitsModalStyles.unitBtnSelected,
                  ]}
                  onPress={() => setSelectedBody('in')}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      unitsModalStyles.unitBtnSymbol,
                      selectedBody === 'in' && unitsModalStyles.unitBtnSymbolSelected,
                    ]}
                  >
                    in
                  </Text>
                  <Text
                    style={[
                      unitsModalStyles.unitBtnName,
                      selectedBody === 'in' && unitsModalStyles.unitBtnNameSelected,
                    ]}
                  >
                    İnç
                  </Text>
                  {selectedBody === 'in' ? (
                    <Text style={unitsModalStyles.unitBtnCheck}>✓</Text>
                  ) : null}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Yeşil Kaydet Butonu (Vazgeç Yok) */}
          <View style={unitsModalStyles.actionBox}>
            <TouchableOpacity
              style={unitsModalStyles.saveBtnGreen}
              onPress={handleSave}
              activeOpacity={0.75}
            >
              <Text style={unitsModalStyles.saveBtnGreenText}>Kaydet</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { workouts } = useWorkouts();
  const {
    user,
    loading,
    error,
    refetch,
    updateProfile,
    deleteAccount,
    isDeletingAccount,
  } = useUser();

  // Tercih Durumları
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mil'>('km');
  const [bodyMeasurementUnit, setBodyMeasurementUnit] = useState<'cm' | 'in'>('cm');
  const [themeMode, setThemeMode] = useState<'Koyu' | 'Açık' | 'Sistem'>('Koyu');
  const [language, setLanguage] = useState<'Türkçe' | 'English'>('Türkçe');

  // Antrenman Tercihleri
  const [defaultRestSec, setDefaultRestSec] = useState<number>(90);
  const [restTimerSound, setRestTimerSound] = useState<boolean>(true);
  const [autoStartTimer, setAutoStartTimer] = useState<boolean>(true);

  // Bildirimler
  const [workoutReminders, setWorkoutReminders] = useState<boolean>(true);
  const [restDayAlerts, setRestDayAlerts] = useState<boolean>(false);
  const [prCelebrations, setPrCelebrations] = useState<boolean>(true);

  // Modal Durumları
  const [activeModal, setActiveModal] = useState<
    | 'fitnessLevel'
    | 'goal'
    | 'notifications'
    | 'workout'
    | 'units'
    | 'language'
    | 'theme'
    | 'about'
    | 'deleteAccount'
    | null
  >(null);

  // Tehlikeli Bölge State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // RPG & XP Durumu
  const rpgState = useMemo(() => calculateRpgState(workouts), [workouts]);

  // ─── Dinamik Kullanıcı Antrenman & Devamlılık İstatistikleri ───
  const workoutStats = useMemo(() => {
    const list = Array.isArray(workouts) ? workouts : [];
    const totalCount = list.length;

    // 1. Bu Hafta tamamlanan seanslar (Pazartesi 00:00 - Pazar 23:59 yerel saat aralığı)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0: Pazar, 1: Pazartesi, ...
    const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const thisWeekCount = list.filter((w) => {
      if (!w || !w.date) return false;
      const dateStr = String(w.date).trim();
      const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
      return !isNaN(d.getTime()) && d >= monday && d <= sunday;
    }).length;

    // 2. Devamlılık Yüzdesi: Üyelik başlangıcından (user.created_at) bu yana kaçırılan antrenmanlara göre
    let hasConsistencyData = false;
    let consistencyRate = 0;

    if (user?.created_at) {
      const regDate = new Date(user.created_at);
      if (!isNaN(regDate.getTime())) {
        const diffMs = Math.max(0, now.getTime() - regDate.getTime());
        const elapsedDays = Math.max(1, diffMs / (1000 * 60 * 60 * 24));
        const elapsedWeeks = Math.max(1, elapsedDays / 7);
        const targetDaysPerWeek = Number(user.days_per_week) || 4;
        const totalTarget = elapsedWeeks * targetDaysPerWeek;

        if (totalTarget > 0 && totalCount > 0) {
          consistencyRate = Math.min(100, Math.max(0, Math.round((totalCount / totalTarget) * 100)));
          hasConsistencyData = true;
        }
      }
    }

    // 3. Veri bulunamıyorsa veya 0 ise BMI (Vücut Kitle İndeksi) yedeği
    let bmiValue: string | null = null;
    if (user?.height && user?.weight && user.height > 0 && user.weight > 0) {
      const heightM = user.height / 100;
      const bmiCalc = user.weight / (heightM * heightM);
      if (bmiCalc > 10 && bmiCalc < 80) {
        bmiValue = bmiCalc.toFixed(1);
      }
    }

    return {
      thisWeekCount,
      totalCount,
      hasConsistencyData,
      consistencyRate,
      bmiValue,
    };
  }, [workouts, user]);

  // Seviye Rozet Bilgisi
  const levelBadgeInfo =
    rpgState.currentLevel >= 6
      ? { label: 'Elit Atlet', color: colors.amberLight }
      : rpgState.currentLevel >= 3
        ? { label: 'İleri Seviye', color: colors.purpleLight }
        : { label: 'Başlangıç Atlet', color: colors.emeraldLight };

  // Seçili Seviye & Hedef Bilgisi
  const userFitness = normalizeFitnessLevel(user?.fitness_level);
  const userGoal = normalizeGoal(user?.goal);

  // Seviye Değiştir
  const handleSelectFitnessLevel = async (newLevel: string) => {
    if (!user) return;
    try {
      await updateProfile({
        username: user.username,
        fitness_level: newLevel,
      });
      setActiveModal(null);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Seviye güncellenemedi.');
    }
  };

  // Hedef Değiştir
  const handleSelectGoal = async (newGoal: string) => {
    if (!user) return;
    try {
      await updateProfile({
        username: user.username,
        goal: newGoal,
      });
      setActiveModal(null);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Hedef güncellenemedi.');
    }
  };

  // Çıkış Yap İşlemi
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setLogoutConfirmVisible(false);
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Çıkış hatası:', err);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hesabı Kalıcı Olarak Silme İşlemi
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Uyarı', 'Hesabı silmek için mevcut şifrenizi girmelisiniz.');
      return;
    }
    if (deleteConfirmationText.trim() !== 'HESABIMI KALICI OLARAK SİL') {
      Alert.alert(
        'Uyarı',
        "Lütfen onaylamak için tam olarak 'HESABIMI KALICI OLARAK SİL' yazın."
      );
      return;
    }

    try {
      const res = await deleteAccount({
        password: deletePassword,
        confirmation: deleteConfirmationText.trim(),
      });
      Alert.alert('Hesap Silindi', res.message, [
        {
          text: 'Tamam',
          onPress: () => {
            setActiveModal(null);
            signOut();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Hesap silinemedi.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.content}>
          <Skeleton height={140} />
          <Skeleton height={280} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {typeof error === 'string' ? error : error?.message || 'Profil verisi yüklenemedi.'}
          </Text>
          <Button onPress={refetch}>Tekrar Dene</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ─── Üst Başlık & Sağda Düzenle Kalemi (Görseldeki gibi) ─── */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {router.canGoBack() ? (
            <TouchableOpacity
              style={styles.headerCircleBtn}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={10}
            >
              <BackIcon size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.push('/(app)/personal-info' as any)}
          activeOpacity={0.7}
          hitSlop={10}
          accessibilityLabel="Kişisel Bilgiler"
        >
          <EditPencilIcon size={18} color={colors.purpleLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══════════════════════════════════════════════
            1. KULLANICI KARTI & RPG GELİŞİM SEVİYESİ
            (Kullanıcının isteği üzerine tam korunuyor)
           ═══════════════════════════════════════════════ */}
        <Card style={styles.userCard}>
          <View style={styles.userCardTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {(user.username || 'HX').slice(0, 2).toUpperCase()}
              </Text>
            </View>

            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.username}>{user.username}</Text>
                <View style={[styles.levelBadge, { backgroundColor: `${levelBadgeInfo.color}20` }]}>
                  <Text style={[styles.levelBadgeText, { color: levelBadgeInfo.color }]}>
                    {levelBadgeInfo.label}
                  </Text>
                </View>
              </View>

              <Text style={styles.emailText}>{user.email || 'E-posta eklenmedi'}</Text>

              {user.created_at ? (
                <Text style={styles.dateSubtext}>
                  Üyelik: {formatTrDate(user.created_at)}
                </Text>
              ) : null}
            </View>
          </View>

          {/* XP & Gelişim Seviyesi Widget'ı */}
          <View style={styles.rpgCard}>
            <View style={styles.rpgTopRow}>
              <View>
                <Text style={styles.rpgLabel}>GELİŞİM SEVİYESİ</Text>
                <View style={styles.rpgTitleRow}>
                  <Text style={styles.rpgLevelTitle}>{rpgState.levelTitle}</Text>
                  <View style={styles.rpgLevelBadge}>
                    <Text style={styles.rpgLevelBadgeText}>LVL {rpgState.currentLevel}</Text>
                  </View>
                </View>
              </View>

              {rpgState.streakWeeks > 0 && (
                <View style={styles.rpgStreakPill}>
                  <Text style={styles.rpgStreakText}>🔥 {rpgState.streakWeeks} Hafta Seri</Text>
                </View>
              )}
            </View>

            <View style={styles.rpgProgressSection}>
              <View style={styles.rpgProgressHeader}>
                <Text style={styles.rpgProgressLabel}>SEVİYE İLERLEMESİ</Text>
                <Text style={styles.rpgProgressValue}>
                  {rpgState.xpInCurrentLevel} / {rpgState.levelSize} XP (%{rpgState.progressPercent})
                </Text>
              </View>
              <View style={styles.rpgProgressBarTrack}>
                <View
                  style={[
                    styles.rpgProgressBarFill,
                    { width: `${rpgState.progressPercent}%` },
                  ]}
                />
              </View>
            </View>

            <View style={styles.rpgBottomRow}>
              <Text style={styles.rpgNextText}>
                🎯 Seviye {rpgState.currentLevel + 1} için {rpgState.xpLeft} XP kaldı
              </Text>
              <Text style={styles.rpgTotalXpText}>{rpgState.totalXP} XP Toplam</Text>
            </View>
          </View>

          {/* ─── Bu Ayki Özetin Kart Bölümü (Fotoğraftaki Tasarım) ─── */}
          <View style={styles.monthlySummarySection}>
            <Text style={styles.monthlySummaryTitle}>Bu ayki özetin</Text>

            <View style={styles.monthlySummaryStatsRow}>
              {/* 1. Bu Hafta */}
              <TouchableOpacity
                style={styles.monthlySummaryStatCol}
                onPress={() => router.push('/(app)/(tabs)/history' as any)}
                activeOpacity={0.7}
                accessibilityLabel="Bu Hafta Antrenman Seansları"
              >
                <CalendarIcon size={22} color="#C084FC" />
                <Text style={styles.monthlySummaryStatLabel}>Bu Hafta</Text>
                <View style={styles.monthlySummaryValWrap}>
                  <Text style={styles.monthlySummaryStatNumber}>{workoutStats.thisWeekCount}</Text>
                  <Text style={styles.monthlySummaryStatUnit}>seans</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.monthlySummaryDivider} />

              {/* 2. Devamlılık */}
              <TouchableOpacity
                style={styles.monthlySummaryStatCol}
                onPress={() => router.push('/(app)/(tabs)/progress' as any)}
                activeOpacity={0.7}
                accessibilityLabel="Antrenman Devamlılık Oranı"
              >
                <SummaryFlameIcon size={22} color="#34D399" />
                <Text style={styles.monthlySummaryStatLabel}>Devamlılık</Text>
                <View style={styles.monthlySummaryValWrap}>
                  <Text style={styles.monthlySummaryStatNumber}>%{workoutStats.consistencyRate}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.monthlySummaryDivider} />

              {/* 3. Toplam */}
              <TouchableOpacity
                style={styles.monthlySummaryStatCol}
                onPress={() => router.push('/(app)/(tabs)/history' as any)}
                activeOpacity={0.7}
                accessibilityLabel="Toplam Antrenman Seansları"
              >
                <TrendingUpIcon size={22} color="#C084FC" />
                <Text style={styles.monthlySummaryStatLabel}>Toplam</Text>
                <View style={styles.monthlySummaryValWrap}>
                  <Text style={styles.monthlySummaryStatNumber}>{workoutStats.totalCount}</Text>
                  <Text style={styles.monthlySummaryStatUnit}>seans</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 1: HESAP (Account)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Hesap</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<UserIcon color={colors.purpleLight} />}
            title="Kişisel Bilgiler"
            onPress={() => router.push('/(app)/personal-info' as any)}
          />
          <SettingItem
            icon={<ShieldIcon color={colors.emeraldLight} />}
            title="Hesap ve Güvenlik"
            onPress={() => router.push('/(app)/security' as any)}
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 2: BİLDİRİMLER (Notifications)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<BellIcon color={colors.purpleLight} />}
            title="Hatırlatıcılar & Bildirimler"
            subtitle="Antrenman saatleri ve dinlenme uyarıları"
            valueBadge={workoutReminders ? 'Açık' : 'Kapalı'}
            onPress={() => setActiveModal('notifications')}
          />
          <SettingItem
            icon={<SoundIcon color={colors.emeraldLight} />}
            title="Sesler"
            subtitle="Dinlenme sayacı ses efektleri"
            rightElement={
              <Switch
                value={restTimerSound}
                onValueChange={setRestTimerSound}
                trackColor={{ false: '#1E2538', true: colors.purple }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 3: TERCİHLER (Preferences)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Tercihler</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<DumbbellIcon color={colors.cyan} />}
            title="Antrenman Tercihi"
            subtitle="Dinlenme sayacı ve otomatik başlatma"
            valueBadge={`${defaultRestSec} sn`}
            onPress={() => setActiveModal('workout')}
          />
          <SettingItem
            icon={<ScaleIcon color={colors.purpleLight} />}
            title="Birimler"
            subtitle="Ağırlık, mesafe ve vücut ölçüleri"
            valueBadge={`${weightUnit} · ${distanceUnit} · ${bodyMeasurementUnit}`}
            onPress={() => setActiveModal('units')}
          />
          <SettingItem
            icon={<GlobeIcon color={colors.cyan} />}
            title="Dil"
            subtitle="Uygulama arayüz dili"
            valueBadge={language}
            onPress={() => setActiveModal('language')}
          />
          <SettingItem
            icon={<MoonIcon color={colors.amberLight} />}
            title="Tema"
            subtitle="Arayüz renk teması"
            valueBadge={themeMode}
            onPress={() => setActiveModal('theme')}
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 4: YARDIM VE DESTEK (Help & Support)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Yardım ve Destek</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<MailIcon color={colors.purpleLight} />}
            title="Bize Ulaşın"
            subtitle="Destek ekibi ve iletişim"
            onPress={() => router.push('/(app)/contact' as any)}
          />
          <SettingItem
            icon={<InfoIcon color={colors.textDim} />}
            title="Hakkında"
            subtitle="Hypertrophy-X v4.0.0 · Gizlilik & Şartlar"
            onPress={() => setActiveModal('about')}
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 5: OTURUM (Session)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Oturum</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<LogoutIcon color={colors.amberLight} />}
            title="Oturumu Kapat"
            subtitle="Bu cihazdaki sporcu oturumunu sonlandır"
            onPress={() => setLogoutConfirmVisible(true)}
          />
          <SettingItem
            icon={<TrashIcon color={colors.rose} />}
            title="Hesabı Kalıcı Olarak Sil"
            subtitle="Tüm verilerinizi ve geçmişinizi kalıcı olarak siler"
            onPress={() => {
              setDeletePassword('');
              setDeleteConfirmationText('');
              setActiveModal('deleteAccount');
            }}
          />
        </View>

        <Text style={styles.footerText}>
          Hypertrophy-X Pro Athlete Platform · v4.0 (Build 58)
        </Text>
      </ScrollView>

      {/* ═══════════════════════════════════════════════
          ETKİLEŞİMLİ MODAL PENCERELER (BOTTOM SHEETS)
         ═══════════════════════════════════════════════ */}

      {/* 1. DENEYİM SEVİYESİ MODALI */}
      <Modal visible={activeModal === 'fitnessLevel'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)} statusBarTranslucent>
        <View style={styles.modalRootContainer}>
          <Pressable style={styles.modalBackdropTap} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Deneyim Seviyesi</Text>
                <Text style={styles.modalDesc}>
                  Ağırlık antrenmanı tecrübenize uygun periyotlama ve set hacmini belirleyin.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButtonRed}
                onPress={() => setActiveModal(null)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: Spacing.one }}>
              {FITNESS_LEVELS.map((item) => {
                const isSelected = userFitness === item.key;
                const IconComp = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.pickerCard,
                      isSelected && styles.pickerCardActive,
                      isSelected && { borderColor: item.accent },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectFitnessLevel(item.key)}
                  >
                    <View style={[styles.pickerIconWrap, { backgroundColor: `${item.accent}20` }]}>
                      <IconComp size={20} color={item.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.pickerCardTitle, isSelected && { color: colors.text }]}>
                          {item.title}
                        </Text>
                        <View style={[styles.badge, { borderColor: `${item.accent}40`, backgroundColor: `${item.accent}20` }]}>
                          <Text style={[styles.badgeText, { color: item.accent }]}>{item.badge}</Text>
                        </View>
                      </View>
                      <Text style={styles.pickerCardDesc}>{item.desc}</Text>
                    </View>
                    {isSelected ? (
                      <CheckCircleFill size={22} color={item.accent} />
                    ) : (
                      <RadioUnchecked size={22} color="rgba(255, 255, 255, 0.2)" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
      </Modal>

      {/* 2. FİTNESS HEDEFİ MODALI */}
      <Modal visible={activeModal === 'goal'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)} statusBarTranslucent>
        <View style={styles.modalRootContainer}>
          <Pressable style={styles.modalBackdropTap} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Fitness Hedefi</Text>
                <Text style={styles.modalDesc}>
                  Antrenman hacmi, hedef tekrar aralıkları ve toparlanma hedefinize göre ayarlanır.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButtonRed}
                onPress={() => setActiveModal(null)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginTop: Spacing.one }}>
              {GOAL_OPTIONS.map((item) => {
                const isSelected = userGoal === item.key;
                const IconComp = item.icon;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.pickerCard,
                      isSelected && styles.pickerCardActive,
                      isSelected && { borderColor: item.accent },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectGoal(item.key)}
                  >
                    <View style={[styles.pickerIconWrap, { backgroundColor: `${item.accent}20` }]}>
                      <IconComp size={20} color={item.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.pickerCardTitle, isSelected && { color: colors.text }]}>
                          {item.title}
                        </Text>
                        <View style={[styles.badge, { borderColor: `${item.accent}40`, backgroundColor: `${item.accent}20` }]}>
                          <Text style={[styles.badgeText, { color: item.accent }]}>{item.badge}</Text>
                        </View>
                      </View>
                      <Text style={styles.pickerCardDesc}>{item.desc}</Text>
                    </View>
                    {isSelected ? (
                      <CheckCircleFill size={22} color={item.accent} />
                    ) : (
                      <RadioUnchecked size={22} color="rgba(255, 255, 255, 0.2)" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
      </Modal>

      {/* 3. ANTRENMAN AYARLARI MODALI */}
      <Modal visible={activeModal === 'workout'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)} statusBarTranslucent>
        <View style={styles.modalRootContainer}>
          <Pressable style={styles.modalBackdropTap} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Antrenman Tercihleri</Text>
                <Text style={styles.modalDesc}>Varsayılan dinlenme ve sayaç bildirimlerini yapılandırın.</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButtonRed}
                onPress={() => setActiveModal(null)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubheading}>VARSAYILAN DİNLENME SÜRESİ</Text>
            <View style={styles.pillOptionsRow}>
              {[60, 90, 120, 180].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.smallPill, defaultRestSec === sec && styles.smallPillActive]}
                  onPress={() => setDefaultRestSec(sec)}
                >
                  <Text style={[styles.smallPillText, defaultRestSec === sec && styles.smallPillTextActive]}>
                    {sec < 60 ? `${sec}sn` : `${sec / 60}dk`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Dinlenme Sayacı Sesi</Text>
                <Text style={styles.switchSubtitle}>Süre bittiğinde bip sesi çal</Text>
              </View>
              <Switch
                value={restTimerSound}
                onValueChange={setRestTimerSound}
                trackColor={{ false: '#1E2538', true: colors.purple }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Otomatik Sayacı Başlat</Text>
                <Text style={styles.switchSubtitle}>Set onaylandığında sayacı otomatik başlat</Text>
              </View>
              <Switch
                value={autoStartTimer}
                onValueChange={setAutoStartTimer}
                trackColor={{ false: '#1E2538', true: colors.purple }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.neonCancelBtn}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.neonCancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.neonSaveBtn}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.neonSaveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
      </Modal>

      {/* 4. BİLDİRİMLER MODALI */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)} statusBarTranslucent>
        <View style={styles.modalRootContainer}>
          <Pressable style={styles.modalBackdropTap} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Bildirim Ayarları</Text>
                <Text style={styles.modalDesc}>Antrenman hatırlatıcıları ve motivasyon uyarıları.</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButtonRed}
                onPress={() => setActiveModal(null)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Antrenman Hatırlatıcıları</Text>
                <Text style={styles.switchSubtitle}>Planlanan günlerde hazırlık bildirimi gönder</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
                trackColor={{ false: '#1E2538', true: colors.purple }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Dinlenme Günü Uyarıları</Text>
                <Text style={styles.switchSubtitle}>Toparlanma günlerinde hatırlatma yap</Text>
              </View>
              <Switch
                value={restDayAlerts}
                onValueChange={setRestDayAlerts}
                trackColor={{ false: '#1E2538', true: colors.purple }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Kişisel Rekor Tebrikleri</Text>
                <Text style={styles.switchSubtitle}>Yeni PR kırdığında motivasyon bildirimi al</Text>
              </View>
              <Switch
                value={prCelebrations}
                onValueChange={setPrCelebrations}
                trackColor={{ false: '#1E2538', true: colors.purple }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={styles.modalActionButtons}>
              <TouchableOpacity
                style={styles.neonSaveBtn}
                onPress={() => setActiveModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.neonSaveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
      </Modal>

      {/* 5. BİRİMLER MODALI (MODERN & SÜRÜKLE BIRAK & DİNAMİK KLAVYE) */}
      <UnitsBottomSheetModal
        key={activeModal === 'units' ? 'units-open' : 'units-closed'}
        visible={activeModal === 'units'}
        onClose={() => setActiveModal(null)}
        weightUnit={weightUnit}
        distanceUnit={distanceUnit}
        bodyMeasurementUnit={bodyMeasurementUnit}
        onSave={(newUnits) => {
          setWeightUnit(newUnits.weight);
          setDistanceUnit(newUnits.distance);
          setBodyMeasurementUnit(newUnits.body);
        }}
      />

      {/* 6. DİL MODALI */}
      <Modal visible={activeModal === 'language'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)} statusBarTranslucent>
        <View style={styles.modalRootContainer}>
          <Pressable style={styles.modalBackdropTap} onPress={() => setActiveModal(null)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle}>Dil Seçimi</Text>
                <Text style={styles.modalDesc}>Hypertrophy-X arayüzünde kullanmak istediğiniz dili belirleyin.</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseButtonRed}
                onPress={() => setActiveModal(null)}
                hitSlop={10}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Kapat"
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 8, marginTop: 4 }}>
              {(['Türkçe', 'English'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.modalRadioItem, language === lang && styles.modalRadioItemActive]}
                  onPress={() => {
                    setLanguage(lang);
                    setActiveModal(null);
                  }}
                >
                  <Text style={[styles.modalRadioText, language === lang && styles.modalRadioTextActive]}>
                    {lang}
                  </Text>
                  {language === lang ? <Text style={styles.checkmarkText}>✓</Text> : null}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sheetBottomExtension} pointerEvents="none" />
          </View>
        </View>
      </Modal>

      {/* 7. TEMA MODALI (MODERN & SÜRÜKLE BIRAK & DİNAMİK KLAVYE) */}
      <ThemeBottomSheetModal
        visible={activeModal === 'theme'}
        onClose={() => setActiveModal(null)}
        currentTheme={themeMode}
        onSelectTheme={(theme) => setThemeMode(theme)}
      />

      {/* 8. HAKKINDA MODALI (SÜRÜKLE BIRAK DESTEKLİ) */}
      <AboutBottomSheetModal
        visible={activeModal === 'about'}
        onClose={() => setActiveModal(null)}
      />

      {/* 9. HESAP SİLME MODALI (TEHLİKELİ BÖLGE) */}
      <Modal visible={activeModal === 'deleteAccount'} animationType="slide" transparent onRequestClose={() => setActiveModal(null)} statusBarTranslucent>
        <View style={styles.modalRootContainer}>
          <Pressable
            style={styles.modalBackdropTap}
            onPress={() => {
              Keyboard.dismiss();
              setActiveModal(null);
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={[styles.modalSheet, { borderColor: colors.danger, borderTopColor: colors.danger }]}>
              <View style={[styles.modalHandle, { backgroundColor: colors.danger, shadowColor: colors.danger }]} />
              <View style={styles.modalHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, paddingRight: 8 }}>
                  <TrashIcon size={20} color={colors.danger} />
                  <Text style={[styles.modalTitle, { color: colors.danger, marginBottom: 0 }]}>
                    Hesabı Kalıcı Olarak Sil
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButtonRed}
                  onPress={() => {
                    Keyboard.dismiss();
                    setActiveModal(null);
                  }}
                  hitSlop={10}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Kapat"
                >
                  <CloseIcon size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDesc}>
                Bu işlem kesinlikle geri alınamaz. Antrenman geçmişiniz, programlarınız ve tüm
                verileriniz sistemden tamamen silinecektir. Devam etmek için şifrenizi girin ve
                onay kutusuna büyük harflerle{' '}
                <Text style={{ fontWeight: '800', color: colors.text }}>
                  HESABIMI KALICI OLARAK SİL
                </Text>{' '}
                yazın.
              </Text>

              <TextInput
                style={[styles.modalInput, { borderColor: colors.dangerBorder }]}
                placeholder="Mevcut Şifreniz"
                placeholderTextColor={colors.textDim}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <TextInput
                style={[
                  styles.modalInput,
                  {
                    marginTop: Spacing.two,
                    borderColor:
                      deleteConfirmationText.trim() === 'HESABIMI KALICI OLARAK SİL'
                        ? colors.emeraldLight
                        : colors.dangerBorder,
                  },
                ]}
                placeholder="HESABIMI KALICI OLARAK SİL"
                placeholderTextColor={colors.textDim}
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                autoCapitalize="characters"
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />

              <View style={styles.modalActionButtons}>
                <TouchableOpacity
                  style={styles.neonCancelBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setActiveModal(null);
                  }}
                  activeOpacity={0.7}
                  disabled={isDeletingAccount}
                >
                  <Text style={styles.neonCancelBtnText}>Vazgeç</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.neonDangerBtn, isDeletingAccount && { opacity: 0.6 }]}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                  disabled={isDeletingAccount}
                >
                  <Text style={styles.neonDangerBtnText}>
                    {isDeletingAccount ? 'Siliniyor...' : 'Hesabı Sil'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.sheetBottomExtension, { borderColor: colors.danger }]} pointerEvents="none" />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 12. ÇIKIŞ ONAYI DİYALOĞU */}
      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Oturumu Kapat"
        message="Bu cihazdaki sporcu oturumunuzu sonlandırmak istediğinizden emin misiniz?"
        confirmText="Çıkış Yap"
        cancelText="Vazgeç"
        destructive
        busy={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLeft: {
    width: 40,
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    gap: Spacing.two,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },

  // ─── 1. KULLANICI KARTI & RPG WIDGET'I ───
  userCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 14,
  },
  userCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.purpleBg,
    borderWidth: 2,
    borderColor: colors.purpleLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  userInfo: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  username: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  emailText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  dateSubtext: {
    fontSize: 11,
    color: colors.textDim,
    marginTop: 1,
  },

  // RPG Kartı
  rpgCard: {
    backgroundColor: colors.cardBgInner,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    gap: 10,
  },
  rpgTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  rpgLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
  },
  rpgTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  rpgLevelTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  rpgLevelBadge: {
    backgroundColor: colors.purpleBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  rpgLevelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.purpleLight,
  },
  rpgStreakPill: {
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  rpgStreakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F87171',
  },
  rpgProgressSection: {
    gap: 6,
  },
  rpgProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rpgProgressLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textDim,
    letterSpacing: 0.5,
  },
  rpgProgressValue: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
  },
  rpgProgressBarTrack: {
    height: 8,
    backgroundColor: '#1E2538',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rpgProgressBarFill: {
    height: '100%',
    backgroundColor: colors.purpleLight,
    borderRadius: 4,
  },
  rpgBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  rpgNextText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textDim,
  },
  rpgTotalXpText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.amberLight,
  },

  // ─── Bu Ayki Özetin Kart Bölümü (Fotoğraftaki Tasarım) ───
  monthlySummarySection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  monthlySummaryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textDim,
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  monthlySummaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthlySummaryStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  monthlySummaryStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 4,
  },
  monthlySummaryValWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  monthlySummaryStatNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
  },
  monthlySummaryStatUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  monthlySummaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  // ─── AYAR KARTLARI & PILL BİLEŞENLERİ ───
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
    marginTop: 6,
    marginBottom: 2,
  },
  groupCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8,
  },
  dangerCard: {
    borderColor: colors.dangerBorder,
    backgroundColor: '#150f14',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.itemBg,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  destructiveItemContainer: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveIconWrapper: {
    backgroundColor: colors.dangerBg,
  },
  textWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  destructiveTitle: {
    color: colors.danger,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: colors.purpleBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  footerText: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  // ─── MODAL BOTTOM SHEETS ───
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalBackdropTapInner: {
    ...StyleSheet.absoluteFill,
  },
  modalDragHandleZone: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSheet: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    maxHeight: '90%',
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopColor: colors.purpleLight,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetBottomExtension: {
    position: 'absolute',
    bottom: -1000,
    left: -1.5,
    right: -1.5,
    height: 1000,
    backgroundColor: '#0C101C',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.purpleLight,
    shadowColor: colors.purpleLight,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalCloseButtonRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 3,
  },
  modalSubheading: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  neonCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FB7185',
    letterSpacing: 0.3,
  },
  neonSaveBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonSaveBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  neonDangerBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.45)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonDangerBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.3,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.itemBg,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  genderCardActiveMale: {
    borderColor: colors.purpleLight,
    backgroundColor: colors.purpleBg,
  },
  genderCardActiveFemale: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  genderTextActive: {
    color: colors.text,
  },
  metricInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricInputCol: {
    flex: 1,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#cbd5e1',
  },
  labelUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textDim,
  },
  metricTextInput: {
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    textAlign: 'center',
  },
  pillOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  smallPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purpleLight,
  },
  smallPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  smallPillTextActive: {
    color: colors.text,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  pickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.itemBg,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  pickerCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: colors.cardBorderHover,
  },
  pickerIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  pickerCardDesc: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 3,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  switchSubtitle: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
  },
  modalRadioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.itemBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  modalRadioItemActive: {
    borderColor: colors.purpleLight,
    backgroundColor: colors.purpleBg,
  },
  modalRadioText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  modalRadioTextActive: {
    color: colors.text,
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.purpleLight,
  },
  feedbackInput: {
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    padding: 14,
    color: colors.text,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  aboutLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  aboutVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  accountDetailBox: {
    backgroundColor: colors.itemBg,
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  accountDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textDim,
    textTransform: 'uppercase',
  },
  accountDetailVal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  modalInput: {
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    padding: 14,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});

const themeModalStyles = StyleSheet.create({
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgInner,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 12,
  },
  themeCardSelected: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleBorder,
  },
  themeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  themeInfoCol: {
    flex: 1,
    marginRight: 6,
  },
  themeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  themeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  themeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 5,
    borderWidth: 1,
  },
  themeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  themeSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  previewContainer: {
    flexShrink: 0,
    marginLeft: 6,
    marginRight: -4,
  },
  previewDarkBox: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#080B14',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    padding: 3,
    justifyContent: 'space-between',
  },
  previewDarkHeader: {
    height: 3.5,
    width: '60%',
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
  previewDarkLine1: {
    height: 2.5,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 1,
  },
  previewDarkLine2: {
    height: 2.5,
    width: '45%',
    backgroundColor: '#10B981',
    borderRadius: 1,
  },
  previewLightBox: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 3,
    justifyContent: 'space-between',
  },
  previewLightHeader: {
    height: 3.5,
    width: '60%',
    backgroundColor: '#334155',
    borderRadius: 1.5,
  },
  previewLightLine1: {
    height: 2.5,
    width: '80%',
    backgroundColor: '#94A3B8',
    borderRadius: 1,
  },
  previewLightLine2: {
    height: 2.5,
    width: '45%',
    backgroundColor: '#64748B',
    borderRadius: 1,
  },
  previewSplitBox: {
    width: 38,
    height: 28,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  previewSplitLeft: {
    flex: 1,
    backgroundColor: '#080B14',
    padding: 3,
    justifyContent: 'space-between',
  },
  previewSplitRight: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 3,
    justifyContent: 'space-between',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.purple,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.purpleLight,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});

const unitsModalStyles = StyleSheet.create({
  groupBlock: {
    marginBottom: 14,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  unitBtn: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBgInner,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    gap: 6,
  },
  unitBtnSelected: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleBorder,
  },
  unitBtnSymbol: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textDim,
  },
  unitBtnSymbolSelected: {
    color: colors.purpleLight,
  },
  unitBtnName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  unitBtnNameSelected: {
    color: colors.text,
  },
  unitBtnCheck: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.purpleLight,
    marginLeft: 2,
  },
  actionBox: {
    marginTop: 8,
    marginBottom: 4,
  },
  saveBtnGreen: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1.2,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnGreenText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
});
