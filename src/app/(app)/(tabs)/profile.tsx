import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
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
import { Colors, Spacing } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { useWorkouts } from '@/hooks/use-workouts';
import { formatTrDate } from '@/lib/rpe';

// ─── SVG İkonları ───

function BackIcon({ color = '#ffffff', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function EditPencilIcon({ color = '#ffffff', size = 18 }: { color?: string; size?: number }) {
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

function ChevronRightIcon({ color = '#6b7280', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function UserIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
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

function BellIcon({ color = '#8b5cf6', size = 20 }: { color?: string; size?: number }) {
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

function SoundIcon({ color = '#10b981', size = 20 }: { color?: string; size?: number }) {
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

function TrophyIcon({ color = '#f59e0b', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 21h8m-4-4v4M5 4h14v4a7 7 0 01-14 0V4z" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 6H3a2 2 0 00-2 2v1a4 4 0 004 4h0m14-7h2a2 2 0 012 2v1a4 4 0 01-4 4h0" />
    </Svg>
  );
}

function TargetIcon({ color = '#ec4899', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Circle cx="12" cy="12" r="6" strokeWidth="2" />
      <Circle cx="12" cy="12" r="2" strokeWidth="2" />
    </Svg>
  );
}

function DumbbellIcon({ color = '#06b6d4', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
    </Svg>
  );
}

function ScaleIcon({ color = '#a855f7', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l9-4 9 4M12 2v20M5 18h14M6 18l-3-7h6l-3 7zm12 0l-3-7h6l-3 7z" />
    </Svg>
  );
}

function GlobeIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Svg>
  );
}

function MailIcon({ color = '#6366f1', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 6 9-6" />
    </Svg>
  );
}

function InfoIcon({ color = '#64748b', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </Svg>
  );
}

function ShieldIcon({ color = '#10b981', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function LogoutIcon({ color = '#f59e0b', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </Svg>
  );
}

function TrashIcon({ color = '#ef4444', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Svg>
  );
}

function CheckCircleFill({ size = 20, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2.5 2.5L16 9" />
    </Svg>
  );
}

function RadioUnchecked({ size = 20, color = '#374151' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function MaleIcon({ size = 18, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="10" cy="14" r="5" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 5l-5.4 5.4M19 5h-5M19 5v5" />
    </Svg>
  );
}

function FemaleIcon({ size = 18, color = '#ec4899' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="9" r="5" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7M9 18h6" />
    </Svg>
  );
}

function SeedlingIcon({ size = 20, color = '#10b981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22V12m0 0a5 5 0 015-5h2a5 5 0 01-5 5zm0 0a5 5 0 00-5-5H5a5 5 0 005 5z" />
    </Svg>
  );
}

function LightningIcon({ size = 20, color = '#3b82f6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

function MuscleIcon({ size = 20, color = '#8b5cf6' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 19v-2a4 4 0 014-4h8a4 4 0 014 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />
    </Svg>
  );
}

function FlameIcon({ size = 20, color = '#ef4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </Svg>
  );
}

function BoltIcon({ size = 20, color = '#06b6d4' }: { size?: number; color?: string }) {
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
    accent: '#10b981',
  },
  {
    key: 'Intermediate',
    title: 'Orta Seviye',
    badge: '1 - 3 Yıl',
    desc: 'Aşamalı aşırı yüklenme (progressive overload), hacim döngüleri ve hipertrofi.',
    icon: LightningIcon,
    accent: '#3b82f6',
  },
  {
    key: 'Advanced',
    title: 'İleri Seviye (Elite)',
    badge: '3+ Yıl',
    desc: 'Yüksek yoğunluklu setler, RPE/RIR hassasiyeti, plato aşımı ve mikro döngüler.',
    icon: TrophyIcon,
    accent: '#f59e0b',
  },
] as const;

const GOAL_OPTIONS = [
  {
    key: 'hypertrophy',
    title: 'Kas Odaklı (Hipertrofi)',
    badge: 'Lif Büyümesi',
    desc: 'Mekanik gerilim ve metabolik stres ile hedef kas lifi mikroyırtığı ve optimum büyüme.',
    icon: MuscleIcon,
    accent: '#8b5cf6',
  },
  {
    key: 'bulk',
    title: 'Hacim & Kütle (Bulk)',
    badge: 'MAV Hacim',
    desc: 'Kontrollü kalori fazlası ve maksimum hipertrofi hacmi ile net kas kütlesi inşası.',
    icon: DumbbellIcon,
    accent: '#3b82f6',
  },
  {
    key: 'cut',
    title: 'Definasyon & Yağ Yakımı (Cut)',
    badge: 'MEV Yağ Yakımı',
    desc: 'Kalori açığında kas kütlesini azami seviyede koruyan minimum etkili hacim.',
    icon: FlameIcon,
    accent: '#ef4444',
  },
  {
    key: 'strength',
    title: 'Maksimal Güç (Kuvvet)',
    badge: '1RM & MSS',
    desc: 'Düşük tekrar, yüksek yoğunluklu nöromüsküler patlayıcı kuvvet adaptasyonu.',
    icon: BoltIcon,
    accent: '#06b6d4',
  },
  {
    key: 'maintain',
    title: 'Form Koruma & Rekomp',
    badge: 'MV Denge',
    desc: 'Yorulma birikimi olmadan mevcut kas kütlesini koruma ve metabolik zindelik.',
    icon: ShieldIcon,
    accent: '#10b981',
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

function normalizeGender(raw?: string | null): 'male' | 'female' {
  if (!raw) return 'male';
  const g = raw.toLowerCase();
  if (g.includes('fem') || g.includes('kadın') || g.includes('kadin')) return 'female';
  return 'male';
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
    isUpdatingProfile,
    deleteAccount,
    isDeletingAccount,
    requestEmailUpdate,
    isRequestingEmail,
    confirmEmailUpdate,
    isConfirmingEmail,
    requestChangePassword,
    isRequestingPassword,
    confirmChangePassword,
    isConfirmingPassword,
  } = useUser();

  // Tercih Durumları
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mil'>('km');
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
    | 'personalInfo'
    | 'fitnessLevel'
    | 'goal'
    | 'account'
    | 'notifications'
    | 'workout'
    | 'units'
    | 'themeAndLanguage'
    | 'contact'
    | 'about'
    | 'deleteAccount'
    | null
  >(null);

  // Kişisel Bilgiler Form State (Modal içi düzenleme)
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [daysPerWeek, setDaysPerWeek] = useState('4');
  const [sessionTimeMins, setSessionTimeMins] = useState('60');

  // Hesap & Güvenlik State
  const [accountSubView, setAccountSubView] = useState<'info' | 'changeEmail' | 'changePassword'>('info');
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailStep, setEmailStep] = useState<'request' | 'confirm'>('request');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordOtpToken, setPasswordOtpToken] = useState('');
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [passwordStep, setPasswordStep] = useState<'request' | 'confirm'>('request');

  // Tehlikeli Bölge State
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Geri Bildirim Formu
  const [feedbackText, setFeedbackText] = useState('');

  // RPG & XP Durumu
  const rpgState = useMemo(() => calculateRpgState(workouts), [workouts]);

  // Seviye Rozet Bilgisi
  const levelBadgeInfo =
    rpgState.currentLevel >= 6
      ? { label: 'Elit Atlet', color: '#f59e0b' }
      : rpgState.currentLevel >= 3
        ? { label: 'İleri Seviye', color: '#3b82f6' }
        : { label: 'Başlangıç Atlet', color: '#10b981' };

  // Seçili Seviye & Hedef Bilgisi
  const userFitness = normalizeFitnessLevel(user?.fitness_level);
  const selectedFitnessObj = useMemo(
    () => FITNESS_LEVELS.find((f) => f.key === userFitness) || FITNESS_LEVELS[1],
    [userFitness]
  );

  const userGoal = normalizeGoal(user?.goal);
  const selectedGoalObj = useMemo(
    () => GOAL_OPTIONS.find((g) => g.key === userGoal) || GOAL_OPTIONS[0],
    [userGoal]
  );

  // Kişisel Bilgiler Modalını Aç ve Formu Doldur
  const openPersonalInfoModal = () => {
    if (user) {
      setGender(normalizeGender(user.gender));
      setAge(user.age ? String(user.age) : '');
      setHeight(user.height ? String(user.height) : '');
      setWeight(user.weight ? String(user.weight) : '');
      setDaysPerWeek(user.days_per_week ? String(user.days_per_week) : '4');
      setSessionTimeMins(user.session_time_mins ? String(user.session_time_mins) : '60');
    }
    setActiveModal('personalInfo');
  };

  // Kişisel Bilgileri Kaydet
  const handleSavePersonalInfo = async () => {
    if (!user) return;
    try {
      await updateProfile({
        username: user.username,
        gender,
        age: age ? parseInt(age, 10) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        fitness_level: user.fitness_level || 'Intermediate',
        goal: user.goal || 'hypertrophy',
        days_per_week: daysPerWeek ? parseInt(daysPerWeek, 10) : 4,
        session_time_mins: sessionTimeMins ? parseInt(sessionTimeMins, 10) : 60,
      });
      Alert.alert('Başarılı', 'Kişisel bilgileriniz güncellendi.');
      setActiveModal(null);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Bilgiler güncellenemedi.');
    }
  };

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

  // E-posta Güncelleme Adım 1
  const handleRequestEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    try {
      const res = await requestEmailUpdate({ new_email: newEmail.trim() });
      setEmailOtpToken(res.token);
      setEmailStep('confirm');
      Alert.alert('Doğrulama Kodu Gönderildi', res.message);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'E-posta kodu gönderilemedi.');
    }
  };

  // E-posta Güncelleme Adım 2
  const handleConfirmEmail = async () => {
    if (emailOtpCode.trim().length !== 6) {
      Alert.alert('Uyarı', 'Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    try {
      const res = await confirmEmailUpdate({
        token: emailOtpToken,
        code: emailOtpCode.trim(),
      });
      Alert.alert('Başarılı', res.message);
      setAccountSubView('info');
      setEmailStep('request');
      setNewEmail('');
      setEmailOtpCode('');
      refetch();
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Kod doğrulanamadı.');
    }
  };

  // Şifre Değiştirme Adım 1
  const handleRequestPassword = async () => {
    if (!oldPassword || newPassword.length < 6) {
      Alert.alert('Uyarı', 'Mevcut şifrenizi ve en az 6 karakterli yeni şifrenizi girin.');
      return;
    }
    try {
      const res = await requestChangePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordOtpToken(res.token);
      setPasswordStep('confirm');
      Alert.alert('Doğrulama Kodu Gönderildi', res.message);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre değiştirme talebi başarısız.');
    }
  };

  // Şifre Değiştirme Adım 2
  const handleConfirmPassword = async () => {
    if (passwordOtpCode.trim().length !== 6) {
      Alert.alert('Uyarı', 'Lütfen 6 haneli onay kodunu girin.');
      return;
    }
    try {
      const res = await confirmChangePassword({
        token: passwordOtpToken,
        code: passwordOtpCode.trim(),
      });
      Alert.alert('Başarılı', res.message);
      setAccountSubView('info');
      setPasswordStep('request');
      setOldPassword('');
      setNewPassword('');
      setPasswordOtpCode('');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre güncellenemedi.');
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
              <BackIcon size={20} color="#ffffff" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </View>
        <Text style={styles.headerTitle}>Profil</Text>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={openPersonalInfoModal}
          activeOpacity={0.7}
          hitSlop={10}
          accessibilityLabel="Kişisel Bilgileri Düzenle"
        >
          <EditPencilIcon size={18} color="#ffffff" />
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

          {/* ─── 3'lü Özet İstatistik Kutuları (Görseldeki Yaş / Boy / Kilo) ─── */}
          <View style={styles.statBoxesRow}>
            <TouchableOpacity
              style={styles.statBox}
              onPress={openPersonalInfoModal}
              activeOpacity={0.7}
            >
              <Text style={styles.statBoxLabel}>Yaş</Text>
              <Text style={styles.statBoxValue}>
                {user.age ? `${user.age}` : '--'}{' '}
                <Text style={styles.statBoxUnit}>yaş</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              onPress={openPersonalInfoModal}
              activeOpacity={0.7}
            >
              <Text style={styles.statBoxLabel}>Boy</Text>
              <Text style={styles.statBoxValue}>
                {user.height ? `${user.height}` : '--'}{' '}
                <Text style={styles.statBoxUnit}>cm</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              onPress={openPersonalInfoModal}
              activeOpacity={0.7}
            >
              <Text style={styles.statBoxLabel}>Kilo</Text>
              <Text style={styles.statBoxValue}>
                {user.weight ? `${user.weight}` : '--'}{' '}
                <Text style={styles.statBoxUnit}>kg</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 1: HESAP AYARLARI (Account settings)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<UserIcon color="#3b82f6" />}
            title="Kişisel Bilgiler"
            subtitle="Cinsiyet, yaş, boy ve kilo ölçümleri"
            valueBadge={user.age && user.weight ? `${user.age} y · ${user.weight} kg` : undefined}
            onPress={openPersonalInfoModal}
          />
          <SettingItem
            icon={<BellIcon color="#8b5cf6" />}
            title="Hatırlatıcılar & Bildirimler"
            subtitle="Antrenman saatleri ve dinlenme uyarıları"
            valueBadge={workoutReminders ? 'Açık' : 'Kapalı'}
            onPress={() => setActiveModal('notifications')}
          />
          <SettingItem
            icon={<SoundIcon color="#10b981" />}
            title="Sesler"
            subtitle="Dinlenme sayacı ses efektleri"
            rightElement={
              <Switch
                value={restTimerSound}
                onValueChange={setRestTimerSound}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            }
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 2: TERCİHLER (Preferences)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Tercihler</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<TrophyIcon color="#f59e0b" />}
            title="Deneyim Seviyesi"
            subtitle="Mevcut antrenman tecrübeniz ve periyotlama"
            valueBadge={selectedFitnessObj.title}
            onPress={() => setActiveModal('fitnessLevel')}
          />
          <SettingItem
            icon={<TargetIcon color="#ec4899" />}
            title="Fitness Hedefi"
            subtitle="Hipertrofi, bulk, definasyon, güç..."
            valueBadge={selectedGoalObj.title}
            onPress={() => setActiveModal('goal')}
          />
          <SettingItem
            icon={<DumbbellIcon color="#06b6d4" />}
            title="Antrenman Tercihleri"
            subtitle="Dinlenme sayacı ve otomatik başlatma"
            valueBadge={`${defaultRestSec} sn`}
            onPress={() => setActiveModal('workout')}
          />
          <SettingItem
            icon={<ScaleIcon color="#a855f7" />}
            title="Birimler"
            subtitle="Ağırlık ve mesafe ölçü birimleri"
            valueBadge={`${weightUnit} / ${distanceUnit}`}
            onPress={() => setActiveModal('units')}
          />
          <SettingItem
            icon={<GlobeIcon color="#3b82f6" />}
            title="Tema ve Dil"
            subtitle="Arayüz renk teması ve dil seçimi"
            valueBadge={`${language} · ${themeMode}`}
            onPress={() => setActiveModal('themeAndLanguage')}
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 3: YARDIM VE DESTEK (Help & Support)
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Yardım ve Destek</Text>
        <View style={styles.groupCard}>
          <SettingItem
            icon={<MailIcon color="#6366f1" />}
            title="Bize Ulaşın"
            subtitle="Destek ekibi ve geri bildirim gönderin"
            onPress={() => setActiveModal('contact')}
          />
          <SettingItem
            icon={<InfoIcon color="#64748b" />}
            title="Hakkında"
            subtitle="Hypertrophy-X v4.0.0 · Gizlilik & Şartlar"
            onPress={() => setActiveModal('about')}
          />
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 4: HESAP GÜVENLİĞİ & OTURUM
           ═══════════════════════════════════════════════ */}
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>Hesap Güvenliği & Oturum</Text>
        <View style={[styles.groupCard, styles.dangerCard]}>
          <SettingItem
            icon={<ShieldIcon color="#10b981" />}
            title="Hesap ve Güvenlik"
            subtitle="E-posta güncelleme, şifre değiştirme ve detaylar"
            onPress={() => {
              setAccountSubView('info');
              setActiveModal('account');
            }}
          />
          <SettingItem
            icon={<LogoutIcon color="#f59e0b" />}
            title="Oturumu Kapat"
            subtitle="Bu cihazdaki sporcu oturumunu sonlandır"
            destructive
            onPress={() => setLogoutConfirmVisible(true)}
          />
          <SettingItem
            icon={<TrashIcon color="#ef4444" />}
            title="Hesabı Kalıcı Olarak Sil"
            subtitle="Tüm verilerinizi ve geçmişinizi kalıcı olarak siler"
            destructive
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

      {/* 1. KİŞİSEL BİLGİLER MODALI */}
      <Modal visible={activeModal === 'personalInfo'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Kişisel Bilgiler</Text>
            <Text style={styles.modalDesc}>
              Biyometrik ölçümlerinizi güncelleyin. Kalori motoru ve antrenman hacmi bu değerlere göre optimize edilir.
            </Text>

            {/* Cinsiyet Seçimi */}
            <Text style={styles.modalSubheading}>CİNSİYET</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderCard, gender === 'male' && styles.genderCardActiveMale]}
                onPress={() => setGender('male')}
                activeOpacity={0.7}
              >
                <MaleIcon size={18} color={gender === 'male' ? '#3b82f6' : '#94a3b8'} />
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>
                  Erkek
                </Text>
                {gender === 'male' && <CheckCircleFill size={16} color="#3b82f6" />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.genderCard, gender === 'female' && styles.genderCardActiveFemale]}
                onPress={() => setGender('female')}
                activeOpacity={0.7}
              >
                <FemaleIcon size={18} color={gender === 'female' ? '#ec4899' : '#94a3b8'} />
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>
                  Kadın
                </Text>
                {gender === 'female' && <CheckCircleFill size={16} color="#ec4899" />}
              </TouchableOpacity>
            </View>

            {/* Yaş, Boy, Kilo Kutuları */}
            <Text style={styles.modalSubheading}>BİYOMETRİK ÖLÇÜMLER</Text>
            <View style={styles.metricInputRow}>
              <View style={styles.metricInputCol}>
                <Text style={styles.label}>
                  Yaş <Text style={styles.labelUnit}>(yıl)</Text>
                </Text>
                <TextInput
                  style={styles.metricTextInput}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  placeholder="24"
                  placeholderTextColor="#6b7280"
                  maxLength={3}
                />
              </View>

              <View style={styles.metricInputCol}>
                <Text style={styles.label}>
                  Boy <Text style={styles.labelUnit}>(cm)</Text>
                </Text>
                <TextInput
                  style={styles.metricTextInput}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholder="178"
                  placeholderTextColor="#6b7280"
                  maxLength={5}
                />
              </View>

              <View style={styles.metricInputCol}>
                <Text style={styles.label}>
                  Kilo <Text style={styles.labelUnit}>(kg)</Text>
                </Text>
                <TextInput
                  style={styles.metricTextInput}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="76.5"
                  placeholderTextColor="#6b7280"
                  maxLength={5}
                />
              </View>
            </View>

            {/* Haftalık Gün Sıklığı */}
            <Text style={styles.modalSubheading}>HAFTALIK ANTRENMAN SIKLIĞI</Text>
            <View style={styles.pillOptionsRow}>
              {[2, 3, 4, 5, 6, 7].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.smallPill, daysPerWeek === String(d) && styles.smallPillActive]}
                  onPress={() => setDaysPerWeek(String(d))}
                >
                  <Text style={[styles.smallPillText, daysPerWeek === String(d) && styles.smallPillTextActive]}>
                    {d} Gün
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Seans Süresi */}
            <Text style={styles.modalSubheading}>HEDEF SEANS SÜRESİ</Text>
            <View style={styles.pillOptionsRow}>
              {[45, 60, 75, 90, 120].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[styles.smallPill, sessionTimeMins === String(mins) && styles.smallPillActive]}
                  onPress={() => setSessionTimeMins(String(mins))}
                >
                  <Text style={[styles.smallPillText, sessionTimeMins === String(mins) && styles.smallPillTextActive]}>
                    {mins} dk
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActionButtons}>
              <Button
                variant="secondary"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              >
                Vazgeç
              </Button>
              <Button
                onPress={handleSavePersonalInfo}
                loading={isUpdatingProfile}
                disabled={isUpdatingProfile}
                style={{ flex: 1.4 }}
              >
                Bilgileri Kaydet
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. DENEYİM SEVİYESİ MODALI */}
      <Modal visible={activeModal === 'fitnessLevel'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Deneyim Seviyesi</Text>
            <Text style={styles.modalDesc}>
              Ağırlık antrenmanı tecrübenize uygun periyotlama ve set hacmini belirleyin.
            </Text>

            <View style={{ gap: 10, marginTop: Spacing.two }}>
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
                        <Text style={[styles.pickerCardTitle, isSelected && { color: '#ffffff' }]}>
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
                      <RadioUnchecked size={22} color="#374151" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              variant="secondary"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: Spacing.four }}
            >
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 3. FİTNESS HEDEFİ MODALI */}
      <Modal visible={activeModal === 'goal'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Fitness Hedefi</Text>
            <Text style={styles.modalDesc}>
              Antrenman hacmi, hedef tekrar aralıkları ve toparlanma hedefinize göre ayarlanır.
            </Text>

            <View style={{ gap: 10, marginTop: Spacing.two }}>
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
                        <Text style={[styles.pickerCardTitle, isSelected && { color: '#ffffff' }]}>
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
                      <RadioUnchecked size={22} color="#374151" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <Button
              variant="secondary"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: Spacing.four }}
            >
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 4. ANTRENMAN AYARLARI MODALI */}
      <Modal visible={activeModal === 'workout'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Antrenman Tercihleri</Text>

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
                trackColor={{ false: '#334155', true: '#3b82f6' }}
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
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Kaydet ve Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 5. BİLDİRİMLER MODALI */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bildirim Ayarları</Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Antrenman Hatırlatıcıları</Text>
                <Text style={styles.switchSubtitle}>Planlanan günlerde hazırlık bildirimi gönder</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
                trackColor={{ false: '#334155', true: '#3b82f6' }}
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
                trackColor={{ false: '#334155', true: '#3b82f6' }}
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
                trackColor={{ false: '#334155', true: '#3b82f6' }}
                thumbColor="#ffffff"
              />
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Tamam
            </Button>
          </View>
        </View>
      </Modal>

      {/* 6. BİRİMLER MODALI */}
      <Modal visible={activeModal === 'units'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Birim Tercihleri</Text>
            <Text style={styles.modalDesc}>
              Ağırlıkları ve mesafeleri hangi birimde takip etmek istersiniz?
            </Text>

            <Text style={styles.modalSubheading}>AĞIRLIK BİRİMİ</Text>
            <View style={styles.pillOptionsRow}>
              {(['kg', 'lbs'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.smallPill, weightUnit === unit && styles.smallPillActive]}
                  onPress={() => setWeightUnit(unit)}
                >
                  <Text style={[styles.smallPillText, weightUnit === unit && styles.smallPillTextActive]}>
                    {unit.toUpperCase()} ({unit === 'kg' ? 'Kilogram' : 'Pound'})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSubheading}>MESAFE BİRİMİ</Text>
            <View style={styles.pillOptionsRow}>
              {(['km', 'mil'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.smallPill, distanceUnit === unit && styles.smallPillActive]}
                  onPress={() => setDistanceUnit(unit)}
                >
                  <Text style={[styles.smallPillText, distanceUnit === unit && styles.smallPillTextActive]}>
                    {unit === 'km' ? 'Kilometre (km)' : 'Mil (mi)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Tamam
            </Button>
          </View>
        </View>
      </Modal>

      {/* 7. TEMA VE DİL MODALI */}
      <Modal visible={activeModal === 'themeAndLanguage'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tema ve Dil Tercihleri</Text>

            <Text style={styles.modalSubheading}>DİL SEÇİMİ</Text>
            <View style={{ gap: 8, marginTop: 4 }}>
              {(['Türkçe', 'English'] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.modalRadioItem, language === lang && styles.modalRadioItemActive]}
                  onPress={() => setLanguage(lang)}
                >
                  <Text style={[styles.modalRadioText, language === lang && styles.modalRadioTextActive]}>
                    {lang}
                  </Text>
                  {language === lang ? <Text style={styles.checkmarkText}>✓</Text> : null}
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalSubheading, { marginTop: Spacing.three }]}>TEMA TERCİHİ</Text>
            <View style={{ gap: 8, marginTop: 4 }}>
              {(['Koyu', 'Açık', 'Sistem'] as const).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.modalRadioItem, themeMode === item && styles.modalRadioItemActive]}
                  onPress={() => setThemeMode(item)}
                >
                  <Text style={[styles.modalRadioText, themeMode === item && styles.modalRadioTextActive]}>
                    {item === 'Koyu'
                      ? '🌙 Koyu Mod (Tavsiye Edilen)'
                      : item === 'Açık'
                        ? '☀️ Açık Mod'
                        : '📱 Sistem Teması'}
                  </Text>
                  {themeMode === item ? <Text style={styles.checkmarkText}>✓</Text> : null}
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Kaydet ve Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 8. BİZE ULAŞIN MODALI */}
      <Modal visible={activeModal === 'contact'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bize Ulaşın</Text>
            <Text style={styles.modalDesc}>Öneri, istek veya geri bildirimlerinizi iletin.</Text>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Mesajınızı veya geri bildiriminizi buraya yazın..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />

            <Button
              onPress={() => {
                if (!feedbackText.trim()) {
                  Alert.alert('Uyarı', 'Lütfen bir mesaj yazın.');
                  return;
                }
                Alert.alert('Teşekkürler', 'Geri bildiriminiz geliştirici ekibine iletildi.');
                setFeedbackText('');
                setActiveModal(null);
              }}
              style={{ marginTop: Spacing.three }}
            >
              Gönder
            </Button>
            <Button
              variant="secondary"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: Spacing.two }}
            >
              Vazgeç
            </Button>
          </View>
        </View>
      </Modal>

      {/* 9. HAKKINDA MODALI */}
      <Modal visible={activeModal === 'about'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Hypertrophy-X Hakkında</Text>
            <Text style={styles.modalDesc}>
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

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 10. HESAP VE GÜVENLİK MODALI */}
      <Modal visible={activeModal === 'account'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {accountSubView === 'info' && (
              <>
                <Text style={styles.modalTitle}>Hesap ve Güvenlik</Text>
                <Text style={styles.modalDesc}>
                  Profil güvenliği, e-posta ve şifre yönetimi ayarlarınız.
                </Text>

                <View style={styles.accountDetailBox}>
                  <Text style={styles.accountDetailLabel}>Kullanıcı Adı</Text>
                  <Text style={styles.accountDetailVal}>{user?.username || '-'}</Text>
                </View>

                <View style={styles.accountDetailBox}>
                  <Text style={styles.accountDetailLabel}>Kayıtlı E-posta</Text>
                  <Text style={styles.accountDetailVal}>{user?.email || 'Tanımlanmamış'}</Text>
                </View>

                <View style={styles.accountDetailBox}>
                  <Text style={styles.accountDetailLabel}>Hesap Rolü</Text>
                  <Text style={styles.accountDetailVal}>{user?.is_admin ? 'Yönetici' : 'Sporcu'}</Text>
                </View>

                <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
                  <Button
                    variant="secondary"
                    onPress={() => {
                      setEmailStep('request');
                      setNewEmail('');
                      setEmailOtpCode('');
                      setAccountSubView('changeEmail');
                    }}
                  >
                    E-posta Adresini Değiştir
                  </Button>

                  <Button
                    variant="secondary"
                    onPress={() => {
                      setPasswordStep('request');
                      setOldPassword('');
                      setNewPassword('');
                      setPasswordOtpCode('');
                      setAccountSubView('changePassword');
                    }}
                  >
                    Şifre Değiştir
                  </Button>
                </View>

                <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.three }}>
                  Kapat
                </Button>
              </>
            )}

            {accountSubView === 'changeEmail' && (
              <>
                <Text style={styles.modalTitle}>E-posta Güncelleme</Text>
                {emailStep === 'request' ? (
                  <>
                    <Text style={styles.modalDesc}>
                      Yeni e-posta adresinizi girin. Bu adrese 6 haneli doğrulama kodu gönderilecektir.
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="yeni.eposta@ornek.com"
                      placeholderTextColor="#6b7280"
                      value={newEmail}
                      onChangeText={setNewEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <View style={styles.modalActionButtons}>
                      <Button variant="secondary" onPress={() => setAccountSubView('info')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleRequestEmail} loading={isRequestingEmail} style={{ flex: 1.2 }}>
                        Kod Gönder
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalDesc}>
                      {newEmail} adresine gönderilen 6 haneli doğrulama kodunu girin:
                    </Text>
                    <TextInput
                      style={[styles.modalInput, { textAlign: 'center', fontSize: 20, letterSpacing: 4 }]}
                      placeholder="123456"
                      placeholderTextColor="#6b7280"
                      value={emailOtpCode}
                      onChangeText={setEmailOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <View style={styles.modalActionButtons}>
                      <Button variant="secondary" onPress={() => setEmailStep('request')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleConfirmEmail} loading={isConfirmingEmail} style={{ flex: 1.2 }}>
                        Onayla
                      </Button>
                    </View>
                  </>
                )}
              </>
            )}

            {accountSubView === 'changePassword' && (
              <>
                <Text style={styles.modalTitle}>Şifre Değiştirme</Text>
                {passwordStep === 'request' ? (
                  <>
                    <Text style={styles.modalDesc}>
                      Mevcut şifrenizi ve en az 6 haneli yeni şifrenizi girin.
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Mevcut Şifre"
                      placeholderTextColor="#6b7280"
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      secureTextEntry
                    />
                    <TextInput
                      style={[styles.modalInput, { marginTop: Spacing.two }]}
                      placeholder="Yeni Şifre (en az 6 karakter)"
                      placeholderTextColor="#6b7280"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                    <View style={styles.modalActionButtons}>
                      <Button variant="secondary" onPress={() => setAccountSubView('info')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleRequestPassword} loading={isRequestingPassword} style={{ flex: 1.2 }}>
                        Kod Gönder
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalDesc}>
                      Kayıtlı e-posta adresinize gönderilen 6 haneli onay kodunu girin:
                    </Text>
                    <TextInput
                      style={[styles.modalInput, { textAlign: 'center', fontSize: 20, letterSpacing: 4 }]}
                      placeholder="123456"
                      placeholderTextColor="#6b7280"
                      value={passwordOtpCode}
                      onChangeText={setPasswordOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <View style={styles.modalActionButtons}>
                      <Button variant="secondary" onPress={() => setPasswordStep('request')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleConfirmPassword} loading={isConfirmingPassword} style={{ flex: 1.2 }}>
                        Şifreyi Güncelle
                      </Button>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 11. HESAP SİLME MODALI (TEHLİKELİ BÖLGE) */}
      <Modal visible={activeModal === 'deleteAccount'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { borderColor: '#ef4444', borderWidth: 1.5 }]}>
            <View style={[styles.modalHandle, { backgroundColor: '#ef4444' }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.two }}>
              <TrashIcon size={22} color="#ef4444" />
              <Text style={[styles.modalTitle, { color: '#ef4444', marginBottom: 0 }]}>
                Hesabı Kalıcı Olarak Sil
              </Text>
            </View>
            <Text style={styles.modalDesc}>
              Bu işlem kesinlikle geri alınamaz. Antrenman geçmişiniz, programlarınız ve tüm
              verileriniz sistemden tamamen silinecektir. Devam etmek için şifrenizi girin ve
              onay kutusuna büyük harflerle{' '}
              <Text style={{ fontWeight: '800', color: '#ffffff' }}>
                HESABIMI KALICI OLARAK SİL
              </Text>{' '}
              yazın.
            </Text>

            <TextInput
              style={[styles.modalInput, { borderColor: 'rgba(239, 68, 68, 0.4)' }]}
              placeholder="Mevcut Şifreniz"
              placeholderTextColor="#6b7280"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />

            <TextInput
              style={[
                styles.modalInput,
                {
                  marginTop: Spacing.two,
                  borderColor:
                    deleteConfirmationText.trim() === 'HESABIMI KALICI OLARAK SİL'
                      ? '#10b981'
                      : 'rgba(239, 68, 68, 0.4)',
                },
              ]}
              placeholder="HESABIMI KALICI OLARAK SİL"
              placeholderTextColor="#6b7280"
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
              autoCapitalize="characters"
            />

            <View style={styles.modalActionButtons}>
              <Button
                variant="secondary"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              >
                Vazgeç
              </Button>
              <Button
                variant="danger"
                onPress={handleDeleteAccount}
                loading={isDeletingAccount}
                style={{ flex: 1.2 }}
              >
                Hesabı Sil
              </Button>
            </View>
          </View>
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
    backgroundColor: Colors.dark.background,
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
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
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
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },

  // ─── 1. KULLANICI KARTI & RPG WIDGET'I ───
  userCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
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
    color: '#ffffff',
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
    color: '#94a3b8',
  },
  dateSubtext: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },

  // RPG Kartı
  rpgCard: {
    backgroundColor: '#0c101c',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
    color: '#64748b',
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
    color: '#ffffff',
  },
  rpgLevelBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  rpgLevelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60a5fa',
  },
  rpgStreakPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  rpgStreakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f87171',
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
    color: '#64748b',
    letterSpacing: 0.5,
  },
  rpgProgressValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
  },
  rpgProgressBarTrack: {
    height: 8,
    backgroundColor: '#1e293b',
    borderRadius: 4,
    overflow: 'hidden',
  },
  rpgProgressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
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
    color: '#64748b',
  },
  rpgTotalXpText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#f59e0b',
  },

  // ─── 3'lü Özet İstatistik Kutuları (Görseldeki Yaş / Boy / Kilo) ───
  statBoxesRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBoxLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 4,
  },
  statBoxValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  statBoxUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },

  // ─── AYAR KARTLARI & PILL BİLEŞENLERİ ───
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#e2e8f0',
    letterSpacing: 0.3,
    marginTop: 6,
    marginBottom: 2,
  },
  groupCard: {
    backgroundColor: '#101524',
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: '#150f14',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#161E33',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  destructiveItemContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveIconWrapper: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  textWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  destructiveTitle: {
    color: '#ef4444',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60a5fa',
  },
  footerText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
  },

  // ─── MODAL BOTTOM SHEETS ───
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 16,
  },
  modalSubheading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
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
    backgroundColor: '#161E33',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  genderCardActiveMale: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  genderCardActiveFemale: {
    borderColor: '#ec4899',
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  genderTextActive: {
    color: '#ffffff',
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
    color: '#64748b',
  },
  metricTextInput: {
    backgroundColor: '#161E33',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
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
    backgroundColor: '#161E33',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  smallPillActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  smallPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94a3b8',
  },
  smallPillTextActive: {
    color: '#ffffff',
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
    backgroundColor: '#161E33',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  pickerCardActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
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
    color: '#cbd5e1',
  },
  pickerCardDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  modalRadioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#161E33',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modalRadioItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  modalRadioText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94a3b8',
  },
  modalRadioTextActive: {
    color: '#ffffff',
  },
  checkmarkText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3b82f6',
  },
  feedbackInput: {
    backgroundColor: '#161E33',
    borderRadius: 14,
    padding: 14,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  aboutLabel: {
    fontSize: 13,
    color: '#94a3b8',
  },
  aboutVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  accountDetailBox: {
    backgroundColor: '#161E33',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  accountDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  accountDetailVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 2,
  },
  modalInput: {
    backgroundColor: '#161E33',
    borderRadius: 14,
    padding: 14,
    color: '#ffffff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
