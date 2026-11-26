import {
  type ComponentRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import {
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Reanimated, {
  Easing as ReanimatedEasing,
  FadeIn,
  FadeInUp,
  FadeOut,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ExerciseList } from '@/components/workout/exercise-list';
import { FinishWorkoutDialog } from '@/components/workout/finish-workout-dialog';
import { FutureDateModal } from '@/components/workout/future-date-modal';
import { GymPickerModal } from '@/components/workout/gym-picker-modal';
import { LiveStatsBar } from '@/components/workout/live-stats-bar';
import { RestTimer } from '@/components/workout/rest-timer';
import { WorkoutCalendarModal } from '@/components/workout/workout-calendar-modal';
import { WorkoutCalendarView } from '@/components/workout/workout-calendar-view';
import { WorkoutValidationModal } from '@/components/workout/workout-validation-modal';
import { WorkoutTimerBar } from '@/components/workout/workout-timer-bar';
import { WorkoutNote } from '@/components/workout/workout-note';
import { AppColors, Radius, Spacing, Typography } from '@/constants/theme';
import { useExpertData } from '@/hooks/use-expert';
import { useUser } from '@/hooks/use-user';
import { useWorkouts } from '@/hooks/use-workouts';
import {
  addCustomSessionTypeToList,
  normalizeSessionTypeLabel,
  removeCustomSessionTypeFromList,
  renameCustomSessionTypeInList,
} from '@/lib/custom-session-types';
import { formatTrDate } from '@/lib/rpe';
import {
  exerciseVolume,
  formatVolume,
  workoutSetCount,
  workoutVolume,
} from '@/lib/volume';
import { workoutDraft } from '@/lib/workout-draft';
import type { Workout } from '@/types/workout';

// Android için donanım hızlandırmalı LayoutAnimation etkinleştirme
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const PencilEditIcon = memo(function PencilEditIcon({
  size = 14,
  color = '#C084FC',
}: {
  size?: number;
  color?: string;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
});

const SESSION_DROPDOWN_GAP = 6;
const SESSION_DROPDOWN_CARD_HEIGHT = 280;
const SESSION_DROPDOWN_ANIM_DURATION = 260;

const triggerSmoothTransition = () => {
  try {
    LayoutAnimation.configureNext({
      duration: 280,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  } catch {}
};

export type SessionTypeDetail = {
  name: string;
  subtitle: string;
  tag?: string;
};

export const SESSION_DETAILS: Record<string, SessionTypeDetail> = {
  'Push': {
    name: 'Push (İtiş)',
    subtitle: 'Göğüs · Omuz · Triceps',
    tag: 'Split PPL',
  },
  'Pull': {
    name: 'Pull (Çekiş)',
    subtitle: 'Sırt · Biceps · Arka Omuz',
    tag: 'Split PPL',
  },
  'Legs': {
    name: 'Legs (Bacak)',
    subtitle: 'Quadriceps · Hamstrings · Kalça · Calf',
    tag: 'Split PPL',
  },
  'Upper': {
    name: 'Upper (Üst Vücut)',
    subtitle: 'Göğüs · Sırt · Omuz · Kollar',
    tag: 'Bölgesel',
  },
  'Üst Vücut': {
    name: 'Upper (Üst Vücut)',
    subtitle: 'Göğüs · Sırt · Omuz · Kollar',
    tag: 'Bölgesel',
  },
  'Lower': {
    name: 'Lower (Alt Vücut)',
    subtitle: 'Ön/Arka Bacak · Kalça · Karın (Core)',
    tag: 'Bölgesel',
  },
  'Alt Vücut': {
    name: 'Lower (Alt Vücut)',
    subtitle: 'Ön/Arka Bacak · Kalça · Karın (Core)',
    tag: 'Bölgesel',
  },
  'Full Body': {
    name: 'Full Body (Tüm Vücut)',
    subtitle: 'Bileşik Tüm Ana Kas Grupları',
    tag: 'Fonksiyonel',
  },
  'Tam Vücut': {
    name: 'Full Body (Tüm Vücut)',
    subtitle: 'Bileşik Tüm Ana Kas Grupları',
    tag: 'Fonksiyonel',
  },
  'Arms': {
    name: 'Arms (Kol)',
    subtitle: 'Biceps · Triceps · Ön Kol',
    tag: 'İzole',
  },
  'Core': {
    name: 'Core (Karın)',
    subtitle: 'Abs · Oblikler · Karın & Stabilite',
    tag: 'İzole',
  },
  'Rotatorlar': {
    name: 'Rotatorlar (Omuz ve Kalça)',
    subtitle: 'Omuz Stabilizasyonu · Kalça Mobilite',
    tag: 'Stabilite',
  },
  'Kardiyo': {
    name: 'Kardiyo & Kondisyon',
    subtitle: 'Kardiyovasküler Dayanıklılık & Yağ Yakımı',
    tag: 'Kondisyon',
  },
  'Diğer': {
    name: 'Özel Seans (Tüm Hareketler)',
    subtitle: 'Kişiselleştirilmiş antrenman seansı',
    tag: 'Özel',
  },
  'Custom': {
    name: 'Özel Seans (Tüm Hareketler)',
    subtitle: 'Kişiselleştirilmiş antrenman seansı',
    tag: 'Özel',
  },
};

export function getSessionInfo(type?: string | null): SessionTypeDetail {
  if (type && SESSION_DETAILS[type]) {
    return SESSION_DETAILS[type];
  }
  return {
    name: type || 'Özel Seans',
    subtitle: 'Özel antrenman seansı',
    tag: 'Özel',
  };
}

function formatDotDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-');
  if (parts.length === 3) {
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }
  return iso;
}

export const ORDERED_SESSION_TYPES = [
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
] as const;

export default function WorkoutScreen() {
  const router = useRouter();
  const draft = useSyncExternalStore(
    workoutDraft.subscribe,
    workoutDraft.getSnapshot
  );

  const { workouts, saveWorkout, isSaving, updateWorkout, isUpdating } = useWorkouts();
  const { customSessionTypes, updateCustomSessionTypes } = useUser();
  const { data: expertData } = useExpertData();
  const gyms = useMemo(() => expertData?.gyms || [], [expertData?.gyms]);

  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const workoutDatesSet = useMemo(() => {
    return new Set((workouts || []).map((w) => w.date));
  }, [workouts]);

  const selectedManualDate = draft.date || todayIso;
  const selectedDateWorkouts = useMemo(() => {
    return (workouts || []).filter((w) => w.date === selectedManualDate);
  }, [workouts, selectedManualDate]);
  const isSelectedManualEditDay =
    selectedManualDate !== todayIso && selectedDateWorkouts.length > 0;

  // ─── Kayıt Modu: 'live' (Salonda Canlı) veya 'manual' (Not Defterinden / Geçmişten Giriş) ───
  const [entryMode, setEntryMode] = useState<'live' | 'manual'>(() =>
    draft.date < todayIso ? 'manual' : 'live'
  );
  const [manualDurationMinutes, setManualDurationMinutes] = useState<number>(45);
  const [editingWorkoutId, setEditingWorkoutId] = useState<number | null>(null);
  const [dayWorkoutPickerOpen, setDayWorkoutPickerOpen] = useState(false);

  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [gymModalOpen, setGymModalOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sessionPickerOpen, setSessionPickerOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [customSessionOpen, setCustomSessionOpen] = useState(false);
  const [customSessionText, setCustomSessionText] = useState('');
  const [sessionDropdownOpen, setSessionDropdownOpen] = useState(false);
  const [editingCustomSession, setEditingCustomSession] = useState<string | null>(null);
  const [editCustomSessionInput, setEditCustomSessionInput] = useState('');
  const [editCustomSessionError, setEditCustomSessionError] = useState<string | null>(null);
  const reopenPickerAfterEditRef = useRef(false);
  const pendingDropdownCloseCbRef = useRef<(() => void) | null>(null);
  const dropdownOpIdRef = useRef(0);
  const dropdownScrollRef = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const dropdownProgress = useSharedValue(0);

  const dropdownOuterStyle = useAnimatedStyle(() => {
    const p = dropdownProgress.value;
    return {
      marginTop: SESSION_DROPDOWN_GAP * p,
      height: SESSION_DROPDOWN_CARD_HEIGHT * p,
      backgroundColor: '#121829',
      borderRadius: 14,
      borderWidth: p > 0.02 ? 1.5 : 0,
      borderColor: 'rgba(168, 85, 247, 0.45)',
      opacity: p > 0.005 ? 1 : 0,
      overflow: 'hidden',
    };
  });
  const dropdownInnerStyle = useAnimatedStyle(() => {
    const p = dropdownProgress.value;
    const t = p <= 0.15 ? 0 : (p - 0.15) / 0.85;
    return {
      height: SESSION_DROPDOWN_CARD_HEIGHT - 3,
      opacity: t,
      transform: [{ translateY: -8 * (1 - t) }],
    };
  });
  const belowDropdownStyle = useAnimatedStyle(() => ({
    marginTop: -(SESSION_DROPDOWN_GAP + SESSION_DROPDOWN_CARD_HEIGHT) * dropdownProgress.value,
  }));
  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dropdownProgress.value * 180}deg` }],
  }));
  const handleDropdownExited = useCallback((completedOpId: number) => {
    if (completedOpId !== dropdownOpIdRef.current) return;
    const cb = pendingDropdownCloseCbRef.current;
    pendingDropdownCloseCbRef.current = null;
    cb?.();
  }, []);

  useEffect(() => {
    if (sessionDropdownOpen) {
      dropdownProgress.value = withTiming(1, {
        duration: SESSION_DROPDOWN_ANIM_DURATION,
        easing: ReanimatedEasing.inOut(ReanimatedEasing.quad),
      });
    } else {
      const opId = dropdownOpIdRef.current;
      dropdownProgress.value = withTiming(
        0,
        {
          duration: SESSION_DROPDOWN_ANIM_DURATION,
          easing: ReanimatedEasing.inOut(ReanimatedEasing.quad),
        },
        (finished) => {
          if (finished) {
            scheduleOnRN(handleDropdownExited, opId);
          }
        },
      );
    }
  }, [
    sessionDropdownOpen,
    dropdownProgress,
    handleDropdownExited,
  ]);

  // ─── Canlı / Geçmiş Kayıt Mod Butonları Yumuşak Dokunma Animasyonu ───
  const [liveBtnScale] = useState(() => new Animated.Value(1));
  const [manualBtnScale] = useState(() => new Animated.Value(1));

  const animateModePress = (scaleVal: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scaleVal, {
        toValue: 0.94,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scaleVal, {
        toValue: 1,
        friction: 5,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const openDropdownWithAnimation = () => {
    dropdownOpIdRef.current += 1;
    pendingDropdownCloseCbRef.current = null;
    dropdownScrollRef.current?.scrollTo({ y: 0, animated: false });
    setSessionDropdownOpen(true);
  };

  const closeDropdownWithAnimation = (onClosed?: () => void) => {
    dropdownOpIdRef.current += 1;
    if (!sessionDropdownOpen) {
      onClosed?.();
      return;
    }
    pendingDropdownCloseCbRef.current = onClosed ?? null;
    setSessionDropdownOpen(false);
  };

  const handleDismissDropdown = () => {
    Keyboard.dismiss();
    closeDropdownWithAnimation(() => setCustomSessionOpen(false));
  };

  const handleToggleDropdown = () => {
    if (sessionDropdownOpen) {
      handleDismissDropdown();
      return;
    }
    openDropdownWithAnimation();
  };

  const hasSelectedSession = Boolean(normalizeSessionTypeLabel(draft.session_type || ''));

  const selectedSessionInfo = useMemo(() => {
    return getSessionInfo(draft.session_type);
  }, [draft.session_type]);

  const customSessionTypeSet = useMemo(() => {
    return new Set(customSessionTypes.map((t) => t.toLocaleLowerCase('tr-TR')));
  }, [customSessionTypes]);

  const availableSessionTypes = useMemo(() => {
    const merged: string[] = [...customSessionTypes];
    const seen = new Set(merged.map((t) => t.toLocaleLowerCase('tr-TR')));

    for (const builtIn of ORDERED_SESSION_TYPES) {
      merged.push(builtIn);
      seen.add(builtIn.toLocaleLowerCase('tr-TR'));
    }

    const active = normalizeSessionTypeLabel(draft.session_type || '');
    if (
      active &&
      !seen.has(active.toLocaleLowerCase('tr-TR')) &&
      active !== 'Üst Vücut' &&
      active !== 'Alt Vücut' &&
      active !== 'Tam Vücut' &&
      active !== 'Custom'
    ) {
      return [active, ...merged];
    }

    return merged;
  }, [customSessionTypes, draft.session_type]);

  // Seçili olan kart listede ikinci kez görünmesin (kullanıcı talebi)
  const filteredSessionTypes = useMemo(() => {
    return availableSessionTypes.filter((type) => {
      const isSelected =
        draft.session_type === type ||
        (type === 'Upper' && draft.session_type === 'Üst Vücut') ||
        (type === 'Üst Vücut' && draft.session_type === 'Upper') ||
        (type === 'Lower' && draft.session_type === 'Alt Vücut') ||
        (type === 'Alt Vücut' && draft.session_type === 'Lower') ||
        (type === 'Full Body' && draft.session_type === 'Tam Vücut') ||
        (type === 'Tam Vücut' && draft.session_type === 'Full Body') ||
        (type === 'Diğer' && draft.session_type === 'Custom') ||
        (type === 'Custom' && draft.session_type === 'Diğer');
      return !isSelected;
    });
  }, [availableSessionTypes, draft.session_type]);

  const [validationModal, setValidationModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    showCancel?: boolean;
    cancelLabel?: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  // ─── Canlı Antrenman Süresi Sayacı (Yalnızca Canlı Modda Çalışır) ───
  const [hasStarted, setHasStarted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedSecondsRef = useRef<number>(0);
  const [futureModalOpen, setFutureModalOpen] = useState(false);

  // Antrenman Kaydı Ana Sayfası: Başlatılana kadar veya egzersiz yoksa başlangıç ekranı gösterilir
  // Temizle dendiğinde hasStarted true kalır ve sayfa değişimi olmadan aktif ekranda kalınır
  const isLanding = !hasStarted && draft.exercises.length === 0;
  const hasExercises = draft.exercises.length > 0;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (entryMode === 'live' && hasStarted && isTimerRunning) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      } else {
        startTimeRef.current = Date.now() - pausedSecondsRef.current * 1000;
      }
      interval = setInterval(() => {
        if (startTimeRef.current !== null) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setDurationSeconds(elapsed);
          pausedSecondsRef.current = elapsed;
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [entryMode, hasStarted, isTimerRunning]);

  // Varsayılan salonu taslağa otomatik ata (eğer henüz seçilmemişse)
  useEffect(() => {
    if (
      expertData?.default_gym_id &&
      draft.gym_id === undefined
    ) {
      const defGym = expertData.gyms?.find((g) => g.id === expertData.default_gym_id);
      workoutDraft.setGym(
        expertData.default_gym_id,
        expertData.default_gym_name || defGym?.name || null
      );
    }
  }, [expertData, draft.gym_id]);

  const handleStartWorkout = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  // Tarih seçildiğinde geçmiş bir tarihse otomatik olarak "Notlardan Giriş" moduna uyarla
  const handleSelectDate = (newDate: string) => {
    if (newDate > todayIso) {
      setFutureModalOpen(true);
      return;
    }
    if (entryMode === 'live' && hasStarted && newDate !== todayIso) {
      setValidationModal({
        visible: true,
        title: 'Tarih Değiştirilemez',
        message:
          'Canlı antrenman seansları yalnızca güncel gün (Bugün) için kaydedilebilir.',
        actionLabel: 'Tamam',
        showCancel: false,
      });
      return;
    }
    workoutDraft.setDate(newDate);
    if (newDate < todayIso) {
      setEntryMode('manual');
    }
  };

  const handleSelectLiveMode = () => {
    if (entryMode === 'live') return;
    triggerSmoothTransition();
    animateModePress(liveBtnScale);
    setEntryMode('live');
    setEditingWorkoutId(null);
    setManualDurationMinutes(45);
    workoutDraft.setDate(todayIso);
  };

  const handleSelectManualMode = () => {
    if (entryMode === 'manual') return;
    triggerSmoothTransition();
    animateModePress(manualBtnScale);
    setEntryMode('manual');
    setEditingWorkoutId(null);
    setManualDurationMinutes(45);
    workoutDraft.setDate(todayIso);
  };

  const handleStartFromLanding = () => {
    setEditingWorkoutId(null);
    setSessionDropdownOpen(false);
    setCustomSessionOpen(false);
    if (entryMode === 'live') {
      workoutDraft.setDate(todayIso);
      setHasStarted(true);
      setIsTimerRunning(true);
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
    } else {
      if (draft.date > todayIso) {
        setFutureModalOpen(true);
        return;
      }
      setHasStarted(true);
    }
  };

  const loadExistingWorkoutIntoEditor = (targetWorkout: Workout) => {
    workoutDraft.loadWorkout(targetWorkout);
    setEntryMode('manual');
    setEditingWorkoutId(targetWorkout.id);
    setHasStarted(true);
    setIsTimerRunning(false);
    setDurationSeconds(0);
    startTimeRef.current = null;
    pausedSecondsRef.current = 0;
    setSessionDropdownOpen(false);
    setCustomSessionOpen(false);
    setDayWorkoutPickerOpen(false);
    if (targetWorkout.duration_seconds && targetWorkout.duration_seconds > 0) {
      setManualDurationMinutes(Math.max(1, Math.round(targetWorkout.duration_seconds / 60)));
    } else {
      setManualDurationMinutes(45);
    }
  };

  const handleEditFromLanding = () => {
    if (selectedDateWorkouts.length === 0) return;
    if (selectedDateWorkouts.length === 1) {
      loadExistingWorkoutIntoEditor(selectedDateWorkouts[0]);
      return;
    }
    setDayWorkoutPickerOpen(true);
  };

  const handleCancelWorkout = () => {
    workoutDraft.reset();
    setHasStarted(false);
    setEditingWorkoutId(null);
    setManualDurationMinutes(45);
    setIsTimerRunning(false);
    setDurationSeconds(0);
    startTimeRef.current = null;
    pausedSecondsRef.current = 0;
    setCancelDialogOpen(false);
    setDayWorkoutPickerOpen(false);
    setSessionDropdownOpen(false);
  };

  const handleSelectSessionType = (type: string) => {
    if (type === 'Diğer') {
      setCustomSessionOpen(true);
    } else {
      setCustomSessionOpen(false);
      workoutDraft.setSessionType(type);
    }
  };

  const handleCustomSessionSubmit = () => {
    const clean = normalizeSessionTypeLabel(customSessionText);
    if (!clean) return;
    if (clean.length > 48) {
      Alert.alert('Geçersiz İsim', 'Özel seans türü adı en fazla 48 karakter olabilir.');
      return;
    }

    const { nextTypes, selectedType, didAdd } = addCustomSessionTypeToList(
      customSessionTypes,
      clean,
    );
    if (didAdd && nextTypes.length === customSessionTypes.length) {
      Alert.alert('Limit Doldu', 'En fazla 30 özel seans türü kaydedebilirsiniz.');
      return;
    }

    if (selectedType) {
      workoutDraft.setSessionType(selectedType);
    }
    setCustomSessionText('');
    setCustomSessionOpen(false);
    closeDropdownWithAnimation();

    if (didAdd) {
      updateCustomSessionTypes(nextTypes).catch((err: any) => {
        Alert.alert(
          'Kaydedilemedi',
          err?.message || 'Özel seans türü sunucuya kaydedilirken bir hata oluştu.',
        );
      });
    }
  };

  const handleDeleteCustomSessionType = (targetType: string) => {
    const nextTypes = removeCustomSessionTypeFromList(customSessionTypes, targetType);
    if (
      normalizeSessionTypeLabel(draft.session_type || '').toLocaleLowerCase('tr-TR') ===
      normalizeSessionTypeLabel(targetType).toLocaleLowerCase('tr-TR')
    ) {
      workoutDraft.setSessionType('');
    }
    updateCustomSessionTypes(nextTypes).catch((err: any) => {
      Alert.alert(
        'Silinemedi',
        err?.message || 'Özel seans türü silinirken bir hata oluştu.',
      );
    });
  };

  const handleOpenEditCustomSession = (targetType: string, fromPickerModal = false) => {
    reopenPickerAfterEditRef.current = fromPickerModal;
    if (fromPickerModal) {
      setSessionPickerOpen(false);
    }
    setEditingCustomSession(targetType);
    setEditCustomSessionInput(targetType);
    setEditCustomSessionError(null);
  };

  const handleCloseEditCustomSession = () => {
    setEditingCustomSession(null);
    setEditCustomSessionInput('');
    setEditCustomSessionError(null);
    if (reopenPickerAfterEditRef.current) {
      reopenPickerAfterEditRef.current = false;
      setSessionPickerOpen(true);
    }
  };

  const handleSaveCustomSessionEdit = () => {
    if (!editingCustomSession) return;
    const { nextTypes, renamedTo, error } = renameCustomSessionTypeInList(
      customSessionTypes,
      editingCustomSession,
      editCustomSessionInput,
    );
    if (error) {
      setEditCustomSessionError(error);
      return;
    }

    const oldKey = normalizeSessionTypeLabel(editingCustomSession).toLocaleLowerCase('tr-TR');
    const activeKey = normalizeSessionTypeLabel(draft.session_type || '').toLocaleLowerCase('tr-TR');
    if (activeKey === oldKey) {
      workoutDraft.setSessionType(renamedTo);
    }

    const didChange = renamedTo !== editingCustomSession;
    handleCloseEditCustomSession();

    if (didChange) {
      updateCustomSessionTypes(nextTypes).catch((err: any) => {
        Alert.alert(
          'Güncellenemedi',
          err?.message || 'Özel seans türü güncellenirken bir hata oluştu.',
        );
      });
    }
  };

  const handleDeleteFromEditModal = () => {
    if (!editingCustomSession) return;
    const targetType = editingCustomSession;
    handleCloseEditCustomSession();
    handleDeleteCustomSessionType(targetType);
  };

  // Etkin Antrenman Süresi (Canlıysa saniyeler, Manuel ise seçilen dakika)
  const effectiveDurationSeconds =
    entryMode === 'manual' ? manualDurationMinutes * 60 : durationSeconds;

  // Bitir / Kaydet Butonuna Basıldığında Onay Diyaloğunu Aç
  const handleOpenFinishDialog = () => {
    if (!hasSelectedSession) {
      setValidationModal({
        visible: true,
        title: 'Seans Türü Seçilmedi',
        message: 'Antrenmanı kaydedebilmek için lütfen bir seans türü seçin.',
        actionLabel: 'Seans Seç',
        showCancel: false,
        onAction: () => {
          setValidationModal((prev) => ({ ...prev, visible: false }));
          setSessionPickerOpen(true);
        },
      });
      return;
    }

    if (draft.exercises.length === 0) {
      setValidationModal({
        visible: true,
        title: 'Egzersiz Eklenmedi',
        message: 'Antrenmanı kaydetmek için lütfen listenize en az bir egzersiz ekleyin.',
        actionLabel: '+ Egzersiz Ekle',
        showCancel: false,
        onAction: () => {
          setValidationModal((prev) => ({ ...prev, visible: false }));
          router.push('/(app)/workout/add-exercise');
        },
      });
      return;
    }

    const hasValidSets = draft.exercises.some((ex) =>
      ex.sets_data.some((s) => s.reps > 0)
    );
    if (!hasValidSets) {
      setValidationModal({
        visible: true,
        title: 'Eksik Set Bilgisi',
        message: 'Antrenmanı kaydedebilmek için en az bir sete geçerli bir tekrar (reps) sayısı girmelisiniz.',
        actionLabel: 'Tamam',
        showCancel: false,
        onAction: () => {
          setValidationModal((prev) => ({ ...prev, visible: false }));
        },
      });
      return;
    }

    setFinishDialogOpen(true);
  };

  // Onay Panosunda Onaylandığında DB'ye Kaydet / Güncelle
  const handleConfirmFinish = async () => {
    try {
      const payload = {
        ...draft,
        notes: draft.notes?.trim() || '',
        duration_seconds: effectiveDurationSeconds,
        rest_time_seconds: 90,
        entry_mode: entryMode,
      };

      const wasEditing = editingWorkoutId !== null;
      if (editingWorkoutId !== null) {
        await updateWorkout({ id: editingWorkoutId, data: payload });
      } else {
        await saveWorkout(payload);
      }
      setFinishDialogOpen(false);

      Alert.alert(
        'Tebrikler! 💪',
        wasEditing
          ? 'Antrenmanınız başarıyla güncellendi.'
          : 'Antrenmanınız başarıyla kaydedildi.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              workoutDraft.reset();
              setEditingWorkoutId(null);
              setManualDurationMinutes(45);
              setHasStarted(false);
              setIsTimerRunning(false);
              setDurationSeconds(0);
              startTimeRef.current = null;
              pausedSecondsRef.current = 0;
              router.push('/(app)/history');
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Kayıt Başarısız',
        err?.message || 'Antrenman kaydedilirken bir hata oluştu.'
      );
    }
  };

  // İstatistik Hesaplamaları (Onay Modalı İçin)
  const totalSetsCount = draft.exercises.reduce(
    (sum, ex) => sum + (ex.sets_data?.length || 0),
    0
  );
  const totalVolume = draft.exercises.reduce(
    (sum, ex) => sum + exerciseVolume(ex.sets_data, ex.is_bodyweight),
    0
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        {/* ─── ÜST BAR: Başlangıçta Sade, Aktifken Detaylı ─── */}
        {isLanding ? (
          <View style={styles.topBar}>
            <Text style={styles.screenTitle}>Antrenman Kaydı</Text>
            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => router.push('/(app)/history')}
                activeOpacity={0.7}
              >
                <Text style={styles.historyBtnText}>Geçmiş</Text>
              </TouchableOpacity>
            </View>
            {sessionDropdownOpen && (
              <Pressable
                style={styles.dropdownDismissOverlay}
                onPress={handleDismissDropdown}
              />
            )}
          </View>
        ) : (
          <View style={styles.topBar}>
            <View style={styles.activeHeaderLeft}>
              <View>
                <Text style={styles.screenTitle}>Antrenman Kaydı</Text>
                <View style={styles.activeHeaderSubRow}>
                  <TouchableOpacity
                    disabled={editingWorkoutId !== null}
                    onPress={() => {
                      if (editingWorkoutId !== null) return;
                      if (entryMode === 'live') {
                        setValidationModal({
                          visible: true,
                          title: 'Tarih Değiştirilemez',
                          message:
                            'Canlı antrenman seansları yalnızca bugünün tarihi için kaydedilebilir. Geçmişe dönük bir kayıt girmek istiyorsanız antrenmanı iptal edip "Geçmiş Kayıt" modunu seçebilirsiniz.',
                          actionLabel: 'Tamam',
                          showCancel: false,
                        });
                        return;
                      }
                      setDateSheetOpen(true);
                    }}
                    style={styles.dateSelector}
                    activeOpacity={editingWorkoutId !== null ? 1 : entryMode === 'live' ? 0.85 : 0.7}
                  >
                    <Text style={styles.dateSelectorText}>
                      {entryMode === 'live'
                        ? `Bugün ${formatDotDate(todayIso)}`
                        : editingWorkoutId !== null
                          ? formatDotDate(draft.date)
                          : `${formatDotDate(draft.date)} ▾`}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.activeHeaderSubDivider}>•</Text>

                  <TouchableOpacity
                    onPress={() => setGymModalOpen(true)}
                    style={styles.gymHeaderSelector}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.gymHeaderSelectorText} numberOfLines={1}>
                      📍 {draft.gym_name || 'Salon Seç'} ▾
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCancelDialogOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── İÇERİK: BAŞLANGIÇ GİRİŞ DURUMU VEYA AKTİF ANTRENMAN ─── */}
        {isLanding ? (
          <>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.landingScrollContent}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled={true}
            >
              {/* 1. EN ÜSTTE: ANTRENMAN SALONU */}
              <View
                style={[styles.landingSection, { zIndex: 1 }]}
                pointerEvents={sessionDropdownOpen ? 'none' : 'auto'}
              >
                <View style={styles.landingSectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Antrenman Salonu</Text>
                  <TouchableOpacity
                    onPress={() => router.push('/(app)/workout-preferences/gyms' as any)}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.landingManageGymsText}>Salonları Yönet ⚙️</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sessionTypeScroll}
                >
                  {gyms.map((gym) => {
                    const isSelected = draft.gym_id === gym.id;
                    return (
                      <TouchableOpacity
                        key={gym.id}
                        onPress={() => workoutDraft.setGym(gym.id, gym.name)}
                        style={[
                          styles.sessionChip,
                          styles.gymLandingChip,
                          isSelected && styles.selectedSessionChip,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.gymLandingChipIcon}>📍</Text>
                        <Text
                          style={[
                            styles.sessionChipText,
                            isSelected && styles.selectedSessionChipText,
                          ]}
                        >
                          {gym.name}
                        </Text>
                        {gym.is_default && (
                          <View style={styles.landingGymDefaultBadge}>
                            <Text style={styles.landingGymDefaultBadgeText}>Varsayılan</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}

                  <TouchableOpacity
                    onPress={() => workoutDraft.setGym(null, null)}
                    style={[
                      styles.sessionChip,
                      draft.gym_id === null && styles.selectedSessionChip,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sessionChipText,
                        draft.gym_id === null && styles.selectedSessionChipText,
                      ]}
                    >
                      🏢 Diğer / Belirtilmedi
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => router.push('/(app)/workout-preferences/gyms' as any)}
                    style={styles.landingAddGymBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.landingAddGymBtnText}>+ Salon Ekle</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* 2. SEANS TÜRÜ - WEB VERSİYONUYLA BİREBİR ŞIK SELECT GİRİŞ KUTUSU */}
              <View
                style={[
                  styles.landingSection,
                  styles.landingSessionSection,
                ]}
                pointerEvents="box-none"
              >
                <View style={styles.landingSectionHeaderRow} pointerEvents="box-none">
                  <View style={styles.sectionTitleWithIcon} pointerEvents="none">
                    <Text style={styles.sectionTitleIcon}>↔️</Text>
                    <Text style={styles.sectionTitle}>Seans Türü</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      if (sessionDropdownOpen && customSessionOpen) {
                        handleDismissDropdown();
                      } else {
                        setCustomSessionOpen(true);
                        if (!sessionDropdownOpen) {
                          openDropdownWithAnimation();
                        }
                      }
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.landingAddCustomSessionText}>+ Özel Seans</Text>
                  </TouchableOpacity>
                </View>

                {/* Web Tarzı Select Giriş Kutusu (Tetikleyici) */}
                <View
                  style={[
                    styles.selectContainer,
                    sessionDropdownOpen && styles.selectContainerActive,
                  ]}
                  pointerEvents="box-none"
                >
                  <TouchableOpacity
                    style={[
                      styles.selectTrigger,
                      sessionDropdownOpen && styles.selectTriggerOpen,
                    ]}
                    onPress={handleToggleDropdown}
                    activeOpacity={0.7}
                  >
                    {/* Boş Görsel Penceresi (Hedef kas görseli için) */}
                    <View style={styles.thumbnailWindow} />

                    {/* Seçili Seans Başlığı ve Hedef Kas Grubu */}
                    <View style={styles.selectTriggerMiddle}>
                      {hasSelectedSession ? (
                        <>
                          <View style={styles.selectTriggerTitleRow}>
                            <Text style={styles.selectTriggerTitle} numberOfLines={1}>
                              {selectedSessionInfo.name}
                            </Text>
                            {selectedSessionInfo.tag ? (
                              <View style={styles.selectTagBadge}>
                                <Text style={styles.selectTagBadgeText}>
                                  {selectedSessionInfo.tag}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.selectTriggerSubtitle} numberOfLines={1}>
                            {selectedSessionInfo.subtitle}
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.selectTriggerPlaceholder} numberOfLines={1}>
                          Seans Seç
                        </Text>
                      )}
                    </View>

                    {/* Sağ: 180 derece akıcı yaylanan chevron oku */}
                    <Reanimated.View style={chevronAnimatedStyle}>
                      <Text style={styles.selectChevron}>▼</Text>
                    </Reanimated.View>
                  </TouchableOpacity>

                  {/* ─── KARTIN TAM ALTINA YÜZEN & YUMUŞAK AÇILAN SEANS TÜRÜ LİSTESİ (GEÇMİŞ AKORDİYON ANİMASYONU İLE AYNI) ─── */}
                  <Reanimated.View
                    style={dropdownOuterStyle}
                    pointerEvents={sessionDropdownOpen ? 'auto' : 'none'}
                    accessibilityElementsHidden={!sessionDropdownOpen}
                    importantForAccessibility={sessionDropdownOpen ? 'yes' : 'no-hide-descendants'}
                  >
                    <Reanimated.View style={dropdownInnerStyle}>
                      <ScrollView
                        ref={dropdownScrollRef}
                        style={styles.dropdownScroll}
                        contentContainerStyle={styles.dropdownScrollContent}
                        scrollEnabled={sessionDropdownOpen}
                        showsVerticalScrollIndicator={true}
                        persistentScrollbar={true}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                        bounces={Platform.OS === 'ios'}
                        overScrollMode="always"
                      >
                          {customSessionOpen && (
                            <View style={[styles.dropdownCustomBox, styles.dropdownItemBorder]}>
                              <TextInput
                                style={styles.dropdownCustomInput}
                                placeholder="Özel seans adı (örn: Omuz)..."
                                placeholderTextColor="#64748B"
                                value={customSessionText}
                                onChangeText={setCustomSessionText}
                                returnKeyType="done"
                                onSubmitEditing={handleCustomSessionSubmit}
                                autoFocus
                              />
                              <TouchableOpacity
                                style={[
                                  styles.dropdownCustomBtn,
                                  !customSessionText.trim() && styles.dropdownCustomBtnDisabled,
                                ]}
                                onPress={handleCustomSessionSubmit}
                                disabled={!customSessionText.trim()}
                                activeOpacity={0.75}
                              >
                                <Text style={styles.dropdownCustomBtnText}>Ekle</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {filteredSessionTypes.map((type, index) => {
                            const info = getSessionInfo(type);
                            const isCustomType = customSessionTypeSet.has(
                              type.toLocaleLowerCase('tr-TR'),
                            );
                            const isLast = index === filteredSessionTypes.length - 1;

                            return (
                              <View
                                key={type}
                                style={[
                                  styles.dropdownItemRow,
                                  !isLast && styles.dropdownItemBorder,
                                ]}
                              >
                                <TouchableOpacity
                                  style={styles.dropdownItem}
                                  onPress={() => {
                                    handleSelectSessionType(type);
                                    if (type !== 'Diğer') {
                                      closeDropdownWithAnimation();
                                    }
                                  }}
                                  activeOpacity={0.65}
                                >
                                  {/* Boş Görsel Penceresi (Hedef kas görseli için) */}
                                  <View style={styles.thumbnailWindowSmall} />

                                  {/* Seans Adı ve Hedef Kas Grubu */}
                                  <View style={styles.dropdownItemTextCol}>
                                    <View style={styles.dropdownItemTitleRow}>
                                      <Text
                                        style={styles.dropdownItemTitle}
                                        numberOfLines={1}
                                      >
                                        {info.name}
                                      </Text>
                                      {info.tag ? (
                                        <View style={styles.dropdownItemTag}>
                                          <Text style={styles.dropdownItemTagText}>
                                            {info.tag}
                                          </Text>
                                        </View>
                                      ) : null}
                                    </View>
                                    <Text
                                      style={styles.dropdownItemSubtitle}
                                      numberOfLines={1}
                                    >
                                      {info.subtitle}
                                    </Text>
                                  </View>

                                  {/* Sağ: İnce modern seçim oku */}
                                  <Text style={styles.dropdownItemArrow}>›</Text>
                                </TouchableOpacity>

                                {isCustomType && (
                                  <TouchableOpacity
                                    style={styles.customSessionEditBtn}
                                    onPress={() => handleOpenEditCustomSession(type, false)}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                    accessibilityLabel={`${type} özel seansını düzenle`}
                                  >
                                    <PencilEditIcon size={14} color="#C084FC" />
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}
                      </ScrollView>
                    </Reanimated.View>
                  </Reanimated.View>
                </View>
              </View>

              {/* 3. ORTASINDA: 2 BUTON (CANLI MI / KAYIT MI) */}
              <Reanimated.View
                style={[styles.landingSection, { zIndex: 1, elevation: 0 }, belowDropdownStyle]}
                pointerEvents={sessionDropdownOpen ? 'none' : 'auto'}
              >
                <Text style={styles.sectionTitle}>Antrenmanı Nasıl Yapacaksınız?</Text>
                <View style={styles.landingModeRow}>
                  <Animated.View style={{ flex: 1, transform: [{ scale: liveBtnScale }] }}>
                    <TouchableOpacity
                      style={[
                        styles.landingModeBtn,
                        entryMode === 'live' && styles.landingModeBtnLiveActive,
                      ]}
                      onPress={handleSelectLiveMode}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.landingModeIcon}>⚡</Text>
                      <Text
                        style={[
                          styles.landingModeText,
                          entryMode === 'live' && styles.landingModeTextLiveActive,
                        ]}
                      >
                        Canlı Antrenman
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <Animated.View style={{ flex: 1, transform: [{ scale: manualBtnScale }] }}>
                    <TouchableOpacity
                      style={[
                        styles.landingModeBtn,
                        entryMode === 'manual' && styles.landingModeBtnManualActive,
                      ]}
                      onPress={handleSelectManualMode}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.landingModeIcon}>📝</Text>
                      <Text
                        style={[
                          styles.landingModeText,
                          entryMode === 'manual' && styles.landingModeTextManualActive,
                        ]}
                      >
                        Geçmiş Kayıt
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </Reanimated.View>

              {/* 4. TARİH ALANI: CANLI İSE O GÜNÜ GÖSTERİR, DEĞİLSE TARİH PANOSU EKRANDA BULUNUR */}
              {entryMode === 'live' ? (
                <Reanimated.View
                  key="live-content"
                  entering={FadeIn.duration(280)}
                  exiting={FadeOut.duration(180)}
                  style={styles.landingLiveArea}
                  pointerEvents={sessionDropdownOpen ? 'none' : 'auto'}
                >
                  <View style={styles.landingLiveDateCard}>
                    <View style={styles.landingLiveDateHeader}>
                      <Text style={styles.landingLiveDateLabel}>KAYIT TARİHİ</Text>
                      <View style={styles.landingLiveDateBadge}>
                        <Text style={styles.landingLiveDateBadgeText}>Canlı Tarih</Text>
                      </View>
                    </View>
                    <Text style={styles.landingLiveDateValue}>
                      Bugün · {formatTrDate(todayIso)}
                    </Text>
                  </View>

                  <Text style={styles.landingInfoText}>
                    Salondasınız; antrenmanı başlattığınızda süre sayacı aktif olur ve egzersizlerinizi canlı olarak girersiniz.
                  </Text>
                </Reanimated.View>
              ) : (
                <Reanimated.View
                  key="manual-content"
                  entering={FadeIn.duration(280)}
                  exiting={FadeOut.duration(180)}
                  style={styles.landingManualArea}
                  pointerEvents={sessionDropdownOpen ? 'none' : 'auto'}
                >
                  <WorkoutCalendarView
                    selectedDate={draft.date || todayIso}
                    workoutDatesSet={workoutDatesSet}
                    onSelect={(dateIso) => workoutDraft.setDate(dateIso)}
                    title="Hangi Günün Antrenmanı?"
                  />

                  <Text style={styles.landingInfoText}>
                    Geçmiş antrenman notlarınızı süre sayacı olmadan doğrudan girmek için yukarıdan tarihi seçin.
                  </Text>
                </Reanimated.View>
              )}

              {sessionDropdownOpen && (
                <Pressable
                  style={styles.dropdownBackdropOverlay}
                  onPress={handleDismissDropdown}
                />
              )}
            </ScrollView>

            {/* ─── EKRANIN ALTINA SABİTLENMİŞ AKSİYON BUTONU ─── */}
            <View style={styles.landingFixedBottomBar}>
              <View
                style={styles.landingActionBtnSlot}
                pointerEvents={sessionDropdownOpen ? 'none' : 'auto'}
              >
                {entryMode === 'live' ? (
                  <Reanimated.View
                    key="live-btn"
                    entering={FadeIn.duration(220)}
                    exiting={FadeOut.duration(140)}
                    style={styles.landingActionBtnAnimatedWrap}
                  >
                    <TouchableOpacity
                      style={styles.landingStartLiveBtn}
                      onPress={handleStartFromLanding}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.landingStartLiveBtnText}>
                        ⚡ Antrenmanı Başlat
                      </Text>
                    </TouchableOpacity>
                  </Reanimated.View>
                ) : isSelectedManualEditDay ? (
                  <Reanimated.View
                    key="manual-edit-btn"
                    entering={FadeIn.duration(220)}
                    exiting={FadeOut.duration(140)}
                    style={styles.landingActionBtnAnimatedWrap}
                  >
                    <TouchableOpacity
                      style={styles.landingEditManualBtn}
                      onPress={handleEditFromLanding}
                      activeOpacity={0.85}
                    >
                      <PencilEditIcon size={16} color="#FBBF24" />
                      <Text style={styles.landingEditManualBtnText}>
                        Egzersizi Düzenle
                      </Text>
                    </TouchableOpacity>
                  </Reanimated.View>
                ) : (
                  <Reanimated.View
                    key="manual-add-btn"
                    entering={FadeIn.duration(220)}
                    exiting={FadeOut.duration(140)}
                    style={styles.landingActionBtnAnimatedWrap}
                  >
                    <TouchableOpacity
                      style={styles.landingStartManualBtn}
                      onPress={handleStartFromLanding}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.landingStartManualBtnText}>
                        📝 Egzersiz Ekle & Kayda Başla
                      </Text>
                    </TouchableOpacity>
                  </Reanimated.View>
                )}
              </View>
              {sessionDropdownOpen && (
                <Pressable
                  style={styles.dropdownDismissOverlay}
                  onPress={handleDismissDropdown}
                />
              )}
            </View>
          </>
        ) : (
          /* AKTİF ANTRENMAN EKRANI */
          <>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Canlı İstatistik Çubuğu (Toplam Set, Toplam Hacim ve Seans Türü) */}
              <View style={styles.section}>
                <LiveStatsBar
                  exercises={draft.exercises}
                  sessionType={hasSelectedSession ? draft.session_type : 'Seans Seç'}
                  onPressSessionType={() => setSessionPickerOpen(true)}
                />
              </View>

              {/* Dinlenme Sayacı (Sadece Canlı Modda ve tetiklenince aktif) */}
              {entryMode === 'live' && showRestTimer ? (
                <RestTimer
                  initialSeconds={90}
                  onClose={() => setShowRestTimer(false)}
                />
              ) : null}

              {/* ─── EGZERSİZ KARTLARI LİSTESİ ─── */}
              <ExerciseList
                exercises={draft.exercises}
                onUpdateExercise={(idx, updated) =>
                  workoutDraft.updateExercise(idx, updated)
                }
                onRemoveExercise={(idx) => workoutDraft.removeExercise(idx)}
                onMoveUpExercise={(idx) => workoutDraft.moveExerciseUp(idx)}
                onMoveDownExercise={(idx) => workoutDraft.moveExerciseDown(idx)}
                onAddExercise={() => router.push('/(app)/workout/add-exercise')}
                onTriggerRestTimer={() => {
                  if (entryMode === 'live') {
                    setShowRestTimer(true);
                  }
                }}
              />

              {/* ─── NOT ALMA KISMI (Hareket kartlarının altında) ─── */}
              <WorkoutNote
                value={draft.notes ?? ''}
                onChange={(text) => workoutDraft.setNotes(text)}
              />
            </ScrollView>

            {/* ─── EN ALTTTAKİ YAPIŞKAN: SAYAÇ VEYA MANUEL KAYIT BARI (Moda Göre Değişir) ─── */}
            {entryMode === 'live' ? (
              <WorkoutTimerBar
                seconds={durationSeconds}
                hasStarted={hasStarted}
                isRunning={isTimerRunning}
                onStart={handleStartWorkout}
                onTogglePause={handleToggleTimer}
                onFinish={handleOpenFinishDialog}
                onReset={() => setResetDialogOpen(true)}
              />
            ) : (
              <View style={styles.manualBottomBar}>
                <View style={styles.manualDurationGroup}>
                  <Text style={styles.manualDurationLabel}>TAHMİNİ SÜRE</Text>
                  <View style={styles.durationPillsRow}>
                    {[30, 45, 60, 75, 90].map((mins) => {
                      const isSelected = manualDurationMinutes === mins;
                      return (
                        <TouchableOpacity
                          key={mins}
                          style={[
                            styles.durationPill,
                            isSelected && styles.durationPillActive,
                          ]}
                          onPress={() => setManualDurationMinutes(mins)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.durationPillText,
                              isSelected && styles.durationPillTextActive,
                            ]}
                          >
                            {mins} dk
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Temizle & Antrenmanı Kaydet Yan Yana */}
                <View style={styles.manualActionsGroup}>
                  <TouchableOpacity
                    style={[
                      styles.manualResetBtn,
                      !hasExercises && styles.manualResetBtnDisabled,
                    ]}
                    onPress={() => {
                      if (hasExercises) {
                        setResetDialogOpen(true);
                      }
                    }}
                    disabled={!hasExercises}
                    activeOpacity={hasExercises ? 0.7 : 1}
                  >
                    <Text
                      style={[
                        styles.manualResetBtnText,
                        !hasExercises && styles.manualResetBtnTextDisabled,
                      ]}
                    >
                      Temizle
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.manualSaveBtn}
                    onPress={handleOpenFinishDialog}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.manualSaveBtnText}>
                      {editingWorkoutId !== null ? 'Antrenmanı Güncelle' : 'Antrenmanı Kaydet'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}

        {/* ─── EKRANIN ORTASINDA AÇILAN ONAY PANOSU ─── */}
        <FinishWorkoutDialog
          visible={finishDialogOpen}
          durationSeconds={effectiveDurationSeconds}
          exerciseCount={draft.exercises.length}
          totalSetsCount={totalSetsCount}
          totalVolume={totalVolume}
          note={draft.notes}
          gymName={draft.gym_name}
          onPressGym={() => setGymModalOpen(true)}
          isSaving={isSaving || isUpdating}
          onConfirm={handleConfirmFinish}
          onCancel={() => setFinishDialogOpen(false)}
        />

        {/* ─── GEÇMİŞ VE BESLENME İLE BİREBİR TAKVİMLİ TARİH PANOSU (MODAL) ─── */}
        <WorkoutCalendarModal
          visible={dateSheetOpen}
          selectedDate={draft.date}
          workoutDatesSet={workoutDatesSet}
          onSelect={handleSelectDate}
          onClose={() => setDateSheetOpen(false)}
        />

        {/* ─── ANTRENMAN SALONU SEÇİM MODALI (MODAL) ─── */}
        <GymPickerModal
          visible={gymModalOpen}
          onClose={() => setGymModalOpen(false)}
          selectedGymId={draft.gym_id}
          gyms={gyms}
          onSelectGym={(gymId, gymName) => workoutDraft.setGym(gymId, gymName)}
          onManageGyms={hasStarted ? undefined : () => router.push('/(app)/workout-preferences/gyms' as any)}
        />

        {/* Antrenmanı Temizle Diyaloğu */}
        <ConfirmDialog
          visible={resetDialogOpen}
          title="Hareketleri Temizle"
          message="Seçili tüm hareketler listeden kaldırılacak ?"
          confirmText="Temizle"
          destructive
          onConfirm={() => {
            workoutDraft.clearExercises();
            setResetDialogOpen(false);
          }}
          onCancel={() => setResetDialogOpen(false)}
        />

        {/* Antrenmanı / Düzenlemeyi İptal Et Diyaloğu (Header'daki İptal Butonu İçin) */}
        <ConfirmDialog
          visible={cancelDialogOpen}
          title={editingWorkoutId !== null ? 'Düzenlemeyi İptal Et' : 'Antrenmanı İptal Et'}
          message={
            editingWorkoutId !== null
              ? 'Yaptığınız değişiklikler kaydedilmeden düzenleme iptal edilecektir. Onaylıyor musunuz?'
              : 'Mevcut antrenman kaydı iptal edilecek, tüm işlemler sıfırlanacaktır. Onaylıyor musunuz?'
          }
          confirmText="İptal Et"
          cancelText="Vazgeç"
          destructive
          onConfirm={handleCancelWorkout}
          onCancel={() => setCancelDialogOpen(false)}
        />

        {/* Gelecek Tarih Uyarı Panosu (Şık Neon Tasarım) */}
        <FutureDateModal
          visible={futureModalOpen}
          onClose={() => setFutureModalOpen(false)}
        />

        {/* Antrenman Doğrulama / Eksik Bilgi Uyarı Panosu */}
        <WorkoutValidationModal
          visible={validationModal.visible}
          title={validationModal.title}
          message={validationModal.message}
          actionLabel={validationModal.actionLabel}
          onAction={validationModal.onAction}
          showCancel={validationModal.showCancel}
          cancelLabel={validationModal.cancelLabel}
          onClose={() => setValidationModal((prev) => ({ ...prev, visible: false }))}
        />

        {/* Seans Türü Seçim Modalı (3'lü Göstergeden Tıklandığında - Ekranın Ortasında Liste Panosu) */}
        {sessionPickerOpen && (
          <Modal
            visible={sessionPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => {
              setCustomSessionOpen(false);
              setSessionPickerOpen(false);
            }}
            statusBarTranslucent
          >
            <Pressable
              style={styles.sessionPickerModalBackdrop}
              onPress={() => {
                setCustomSessionOpen(false);
                setSessionPickerOpen(false);
              }}
            >
              <Pressable
                style={styles.sessionPickerCard}
                onPress={(e) => e.stopPropagation()}
              >
                {/* Modal Başlık Satırı */}
                <View style={styles.sessionPickerHeader}>
                  <Text style={styles.sessionPickerTitle}>Seans Türünü Değiştir</Text>
                  <Text style={styles.sessionPickerSubtitle}>
                    Hedef kas grubunu güncellemek için listeden seçin
                  </Text>
                </View>

                {/* Seans Listesi (Bizim Liste Tasarımıyla Birebir) */}
                <ScrollView
                  style={styles.sessionPickerScroll}
                  contentContainerStyle={styles.dropdownScrollContent}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                  nestedScrollEnabled={true}
                  keyboardShouldPersistTaps="handled"
                  bounces={true}
                >
                  {customSessionOpen && (
                    <Reanimated.View
                      entering={FadeInUp.duration(180).easing(
                        ReanimatedEasing.out(ReanimatedEasing.cubic)
                      )}
                      style={[styles.dropdownCustomBox, styles.dropdownItemBorder]}
                    >
                      <TextInput
                        style={styles.dropdownCustomInput}
                        placeholder="Özel seans adı (örn: Omuz)..."
                        placeholderTextColor="#64748B"
                        value={customSessionText}
                        onChangeText={setCustomSessionText}
                        returnKeyType="done"
                        onSubmitEditing={() => {
                          handleCustomSessionSubmit();
                          setSessionPickerOpen(false);
                        }}
                        autoFocus
                      />
                      <TouchableOpacity
                        style={[
                          styles.dropdownCustomBtn,
                          !customSessionText.trim() && styles.dropdownCustomBtnDisabled,
                        ]}
                        onPress={() => {
                          handleCustomSessionSubmit();
                          setSessionPickerOpen(false);
                        }}
                        disabled={!customSessionText.trim()}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.dropdownCustomBtnText}>Ekle</Text>
                      </TouchableOpacity>
                    </Reanimated.View>
                  )}

                  {availableSessionTypes.map((type, index) => {
                    const info = getSessionInfo(type);
                    const isCustomType = customSessionTypeSet.has(
                      type.toLocaleLowerCase('tr-TR'),
                    );
                    const isSelected =
                      draft.session_type === type ||
                      draft.session_type?.toLocaleLowerCase('tr-TR') ===
                        type.toLocaleLowerCase('tr-TR') ||
                      (type === 'Upper' && draft.session_type === 'Üst Vücut') ||
                      (type === 'Üst Vücut' && draft.session_type === 'Upper') ||
                      (type === 'Lower' && draft.session_type === 'Alt Vücut') ||
                      (type === 'Alt Vücut' && draft.session_type === 'Lower') ||
                      (type === 'Full Body' && draft.session_type === 'Tam Vücut') ||
                      (type === 'Tam Vücut' && draft.session_type === 'Full Body');
                    const isLast = index === availableSessionTypes.length - 1;

                    return (
                      <Reanimated.View
                        key={`picker-${type}`}
                        entering={FadeInUp.delay(Math.min(index * 24, 200))
                          .duration(180)
                          .easing(ReanimatedEasing.out(ReanimatedEasing.cubic))}
                        exiting={FadeOutUp.duration(110)
                          .easing(ReanimatedEasing.in(ReanimatedEasing.cubic))}
                      >
                        <View
                          style={[
                            styles.dropdownItemRow,
                            isSelected && styles.sessionPickerItemSelected,
                            !isLast && styles.dropdownItemBorder,
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              if (type === 'Diğer') {
                                setCustomSessionOpen(true);
                                return;
                              }
                              handleSelectSessionType(type);
                              setSessionPickerOpen(false);
                            }}
                            activeOpacity={0.65}
                          >
                            {/* Boş Görsel Penceresi (Hedef kas görseli için) */}
                            <View
                              style={[
                                styles.thumbnailWindowSmall,
                                isSelected && styles.thumbnailWindowSmallSelected,
                              ]}
                            />

                            {/* Seans Adı ve Hedef Kas Grubu */}
                            <View style={styles.dropdownItemTextCol}>
                              <View style={styles.dropdownItemTitleRow}>
                                <Text
                                  style={[
                                    styles.dropdownItemTitle,
                                    isSelected && styles.sessionPickerItemTitleSelected,
                                  ]}
                                  numberOfLines={1}
                                >
                                  {info.name}
                                </Text>
                                {info.tag ? (
                                  <View style={styles.dropdownItemTag}>
                                    <Text style={styles.dropdownItemTagText}>
                                      {info.tag}
                                    </Text>
                                  </View>
                                ) : null}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemSubtitle,
                                  isSelected && styles.sessionPickerItemSubtitleSelected,
                                ]}
                                numberOfLines={1}
                              >
                                {info.subtitle}
                              </Text>
                            </View>

                            {/* Sağ: Seçili kartın yeşil tik işareti (GymPickerModal ile birebir) */}
                            <View
                              style={[
                                styles.sessionPickerCheckCircle,
                                isSelected && styles.sessionPickerCheckCircleSelected,
                              ]}
                            >
                              {isSelected && (
                                <Text style={styles.sessionPickerCheckMark}>✓</Text>
                              )}
                            </View>
                          </TouchableOpacity>

                          {isCustomType && (
                            <TouchableOpacity
                              style={styles.customSessionEditBtn}
                              onPress={() => handleOpenEditCustomSession(type, true)}
                              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                              accessibilityLabel={`${type} özel seansını düzenle`}
                            >
                              <PencilEditIcon size={14} color="#C084FC" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </Reanimated.View>
                    );
                  })}
                </ScrollView>

                {/* Alt Kapat Butonu (GymPickerModal ile birebir) */}
                <View style={styles.sessionPickerActions}>
                  <TouchableOpacity
                    style={styles.sessionPickerCloseBtn}
                    onPress={() => {
                      setCustomSessionOpen(false);
                      setSessionPickerOpen(false);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.sessionPickerCloseBtnText}>Kapat</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}

        {/* Özel Seans Türünü Düzenleme / Silme Panosu (Ekranın Ortasında) */}
        {editingCustomSession !== null && (
          <Modal
            visible={editingCustomSession !== null}
            transparent
            animationType="fade"
            onRequestClose={handleCloseEditCustomSession}
            statusBarTranslucent
          >
            <Pressable
              style={styles.sessionPickerModalBackdrop}
              onPress={handleCloseEditCustomSession}
            >
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.editModalKav}
              >
                <Pressable
                  style={styles.editModalCard}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View style={styles.sessionPickerHeader}>
                    <Text style={styles.sessionPickerTitle}>Özel Seansı Düzenle</Text>
                    <Text style={styles.sessionPickerSubtitle}>
                      Seans türünün adını güncelleyebilir veya listeden silebilirsiniz
                    </Text>
                  </View>

                  <View style={styles.editModalBody}>
                    <Text style={styles.editModalLabel}>SEANS TÜRÜ ADI</Text>
                    <TextInput
                      style={[
                        styles.editModalInput,
                        editCustomSessionError ? styles.editModalInputError : null,
                      ]}
                      placeholder="Özel seans adı..."
                      placeholderTextColor="#64748B"
                      value={editCustomSessionInput}
                      onChangeText={(text) => {
                        setEditCustomSessionInput(text);
                        if (editCustomSessionError) {
                          setEditCustomSessionError(null);
                        }
                      }}
                      maxLength={48}
                      returnKeyType="done"
                      onSubmitEditing={handleSaveCustomSessionEdit}
                      autoFocus
                      selectTextOnFocus
                    />
                    {editCustomSessionError ? (
                      <Text style={styles.editModalErrorText}>{editCustomSessionError}</Text>
                    ) : null}

                    <View style={styles.editModalActionRow}>
                      <TouchableOpacity
                        style={styles.editModalDeleteBtn}
                        onPress={handleDeleteFromEditModal}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.editModalDeleteText}>Sil</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.editModalSaveBtn,
                          !editCustomSessionInput.trim() && styles.dropdownCustomBtnDisabled,
                        ]}
                        onPress={handleSaveCustomSessionEdit}
                        disabled={!editCustomSessionInput.trim()}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.editModalSaveText}>Kaydet</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              </KeyboardAvoidingView>
            </Pressable>
          </Modal>
        )}

        {/* Aynı Günde Birden Fazla Antrenman Varsa Seçim Panosu */}
        {dayWorkoutPickerOpen && (
          <Modal
            visible={dayWorkoutPickerOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setDayWorkoutPickerOpen(false)}
            statusBarTranslucent
          >
            <Pressable
              style={styles.sessionPickerModalBackdrop}
              onPress={() => setDayWorkoutPickerOpen(false)}
            >
              <Pressable
                style={styles.sessionPickerCard}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={styles.sessionPickerHeader}>
                  <Text style={styles.sessionPickerTitle}>Düzenlenecek Antrenmanı Seç</Text>
                  <Text style={styles.sessionPickerSubtitle}>
                    {formatTrDate(selectedManualDate)} tarihinde birden fazla antrenman kaydı bulunuyor
                  </Text>
                </View>

                <ScrollView
                  style={styles.sessionPickerScroll}
                  contentContainerStyle={styles.dropdownScrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  {selectedDateWorkouts.map((w, index) => {
                    const info = getSessionInfo(w.session_type);
                    const totalSets = workoutSetCount(w.exercises || []);
                    const vol = workoutVolume(w.exercises || []);
                    const isLast = index === selectedDateWorkouts.length - 1;
                    const metaParts = [
                      `${w.exercises?.length || 0} Hareket`,
                      `${totalSets} Set`,
                    ];
                    if (vol > 0) metaParts.push(formatVolume(vol));
                    if (w.gym_name) metaParts.push(`📍 ${w.gym_name}`);

                    return (
                      <View
                        key={w.id}
                        style={[
                          styles.dropdownItemRow,
                          !isLast && styles.dropdownItemBorder,
                        ]}
                      >
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => loadExistingWorkoutIntoEditor(w)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.dropdownItemTextCol}>
                            <View style={styles.dropdownItemTitleRow}>
                              <Text style={styles.dropdownItemTitle} numberOfLines={1}>
                                {info.name}
                              </Text>
                              {info.tag ? (
                                <View style={styles.dropdownItemTag}>
                                  <Text style={styles.dropdownItemTagText}>{info.tag}</Text>
                                </View>
                              ) : null}
                            </View>
                            <Text style={styles.dropdownItemSubtitle} numberOfLines={1}>
                              {metaParts.join(' · ')}
                            </Text>
                          </View>
                          <Text style={styles.dropdownItemArrow}>›</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </ScrollView>

                <View style={styles.sessionPickerActions}>
                  <TouchableOpacity
                    style={styles.sessionPickerCloseBtn}
                    onPress={() => setDayWorkoutPickerOpen(false)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.sessionPickerCloseBtnText}>Vazgeç</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080B14',
  },
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0A0D18',
  },
  screenTitle: {
    fontSize: Typography.heading,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  dateSelector: {
    marginTop: 0,
  },
  dateSelectorText: {
    fontSize: Typography.small,
    color: '#C084FC',
    fontWeight: '700',
  },
  activeHeaderSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  activeHeaderSubDivider: {
    fontSize: 10,
    color: '#64748B',
  },
  gymHeaderSelector: {
    marginTop: 0,
  },
  gymHeaderSelectorText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: '#D8B4FE',
    maxWidth: 150,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activeHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginRight: Spacing.two,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.4,
    borderColor: '#EF4444',
  },
  cancelBtnText: {
    fontSize: Typography.small,
    fontWeight: '800',
    color: '#FCA5A5',
  },
  historyBtn: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#A855F7',
  },
  historyBtnText: {
    fontSize: Typography.small,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  section: {
    marginBottom: Spacing.two + 2,
  },
  // ─── Başlangıç Karşılama Ekranı Stilleri ───
  landingScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  landingSection: {
    gap: 8,
  },
  landingSectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  landingManageGymsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C084FC',
  },
  gymLandingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gymLandingChipIcon: {
    fontSize: 13,
  },
  landingGymDefaultBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 2,
  },
  landingGymDefaultBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#E9D5FF',
  },
  landingAddGymBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
    borderWidth: 1.2,
    borderColor: 'rgba(168, 85, 247, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  landingAddGymBtnText: {
    fontSize: Typography.small,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  // ─── Seans Türü: Web Tasarımıyla Birebir Select Açılır Menü Stilleri ───
  landingSessionSection: {
    position: 'relative',
    zIndex: 100,
    shadowColor: 'transparent',
    elevation: Platform.OS === 'android' ? 2 : undefined,
  },
  dropdownBackdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    backgroundColor: 'transparent',
  },
  dropdownDismissOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  sectionTitleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitleIcon: {
    fontSize: 13,
  },
  landingAddCustomSessionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A78BFA',
  },
  selectContainer: {
    position: 'relative',
    zIndex: 100,
  },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  selectTriggerOpen: {
    borderColor: '#8B5CF6',
    backgroundColor: '#0F172A',
  },
  thumbnailWindow: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
  },
  thumbnailWindowSmall: {
    width: 34,
    height: 34,
    borderRadius: 7,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  thumbnailWindowSmallSelected: {
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  selectTriggerMiddle: {
    flex: 1,
    gap: 2,
  },
  selectTriggerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectTriggerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  selectTriggerPlaceholder: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  selectTriggerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  selectTagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    borderWidth: 1.2,
    borderColor: '#C084FC',
  },
  selectTagBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F5EEFF',
    letterSpacing: 0.3,
  },
  selectChevron: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A78BFA',
  },
  selectContainerActive: {
    zIndex: 1000,
  },
  dropdownScroll: {
    height: SESSION_DROPDOWN_CARD_HEIGHT - 3,
    maxHeight: SESSION_DROPDOWN_CARD_HEIGHT - 3,
  },
  dropdownScrollContent: {
    paddingVertical: 4,
    flexGrow: 1,
  },
  dropdownItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  dropdownItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'transparent',
    gap: 10,
  },
  customSessionEditBtn: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  dropdownItemSelected: {
    backgroundColor: '#2563EB', // Web ekran görüntüsündeki gibi seçili mavi vurgu
  },
  dropdownItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemTextCol: {
    flex: 1,
    gap: 2,
  },
  dropdownItemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dropdownItemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  dropdownItemTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dropdownItemSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  dropdownItemSubtitleSelected: {
    color: '#DBEAFE',
  },
  dropdownItemTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    borderWidth: 1.2,
    borderColor: '#C084FC',
  },
  dropdownItemTagSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.35)',
    borderColor: '#E9D5FF',
  },
  dropdownItemTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#F5EEFF',
    letterSpacing: 0.3,
  },
  dropdownItemTagTextSelected: {
    color: '#FFFFFF',
  },
  dropdownItemCheck: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dropdownItemArrow: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 4,
  },
  dropdownCustomBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  dropdownCustomInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#0A0D18',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  dropdownCustomBtn: {
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownCustomBtnDisabled: {
    opacity: 0.5,
  },
  dropdownCustomBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  landingFixedBottomBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 14 : 12,
    backgroundColor: '#080B14',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  landingModeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  landingModeBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#0D111E',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  landingModeBtnLiveActive: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
  },
  landingModeBtnManualActive: {
    borderWidth: 2,
    borderColor: '#C084FC',
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
  },
  landingModeIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  landingModeText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#64748B',
  },
  landingModeTextLiveActive: {
    color: '#34D399',
  },
  landingModeTextManualActive: {
    color: '#D8B4FE',
  },
  landingLiveArea: {
    gap: 14,
  },
  landingLiveDateCard: {
    backgroundColor: '#0D111E',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    gap: 5,
  },
  landingLiveDateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  landingLiveDateLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  landingLiveDateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  landingLiveDateBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  landingLiveDateValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  landingManualArea: {
    gap: 12,
  },
  landingInfoText: {
    fontSize: 11.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 17,
    paddingHorizontal: 6,
  },
  landingStartLiveBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  landingStartLiveBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  landingActionBtnSlot: {
    height: 52,
    position: 'relative',
  },
  landingActionBtnAnimatedWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  landingStartManualBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  landingStartManualBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  landingEditManualBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.6,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  landingEditManualBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  // ─── Kayıt Modu Seçici Stilleri ───
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C101E',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: Spacing.three,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  modeTabActiveLive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  modeTabActiveManual: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.4)',
  },
  modeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#64748B',
  },
  modeDotLive: {
    backgroundColor: '#10B981',
  },
  modeDotManual: {
    backgroundColor: '#C084FC',
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: Typography.small,
    fontWeight: '800',
    color: AppColors.muted,
    marginBottom: Spacing.one,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionTypeScroll: {
    gap: Spacing.two,
    paddingVertical: 4,
  },
  sessionChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  selectedSessionChip: {
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    borderWidth: 1.6,
    borderColor: '#C084FC',
  },
  sessionChipText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: '#94A3B8',
  },
  selectedSessionChipText: {
    color: '#FFFFFF',
  },
  // ─── Manuel Giriş Modu Alt Barı ───
  manualBottomBar: {
    backgroundColor: '#0C101D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  manualDurationGroup: {
    gap: 6,
  },
  manualDurationLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  durationPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationPillActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: '#C084FC',
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  durationPillTextActive: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  manualActionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  manualResetBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.55)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualResetBtnDisabled: {
    borderColor: 'rgba(239, 68, 68, 0.15)',
    backgroundColor: 'rgba(239, 68, 68, 0.03)',
    opacity: 0.35,
  },
  manualResetBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FCA5A5',
  },
  manualResetBtnTextDisabled: {
    color: 'rgba(252, 165, 165, 0.45)',
  },
  manualSaveBtn: {
    flex: 2.2,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.6,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSaveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.2,
  },
  sessionPickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  sessionPickerCard: {
    width: '100%',
    maxWidth: 370,
    maxHeight: 520,
    backgroundColor: '#0F1527',
    borderRadius: 18,
    borderWidth: 1.6,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 35,
  },
  sessionPickerHeader: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.07)',
    gap: 3,
  },
  sessionPickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  sessionPickerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  sessionPickerScroll: {
    maxHeight: 390,
  },
  sessionPickerItemSelected: {
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
  },
  sessionPickerItemTitleSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sessionPickerItemSubtitleSelected: {
    color: '#C084FC',
  },
  sessionPickerCheckCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionPickerCheckCircleSelected: {
    borderColor: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  sessionPickerCheckMark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34D399',
  },
  sessionPickerActions: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.07)',
  },
  sessionPickerCloseBtn: {
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionPickerCloseBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  editModalKav: {
    width: '100%',
    alignItems: 'center',
  },
  editModalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F1527',
    borderRadius: 18,
    borderWidth: 1.6,
    borderColor: 'rgba(168, 85, 247, 0.45)',
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 35,
  },
  editModalBody: {
    padding: 18,
    gap: 12,
  },
  editModalLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  editModalInput: {
    height: 44,
    backgroundColor: '#0A0D18',
    borderWidth: 1.4,
    borderColor: 'rgba(139, 92, 246, 0.4)',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  editModalInputError: {
    borderColor: '#EF4444',
  },
  editModalErrorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FCA5A5',
    marginTop: -4,
  },
  editModalActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editModalSaveBtn: {
    flex: 1.3,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.6,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  editModalSaveText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.2,
  },
  editModalDeleteBtn: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editModalDeleteText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FCA5A5',
  },
});
