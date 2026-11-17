import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePickerSheet } from '@/components/ui/date-picker-sheet';
import { ExerciseList } from '@/components/workout/exercise-list';
import { FinishWorkoutDialog } from '@/components/workout/finish-workout-dialog';
import { LiveStatsBar } from '@/components/workout/live-stats-bar';
import { RestTimer } from '@/components/workout/rest-timer';
import {
  formatDurationHuman,
  WorkoutTimerBar,
} from '@/components/workout/workout-timer-bar';
import { WorkoutNote } from '@/components/workout/workout-note';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useWorkouts } from '@/hooks/use-workouts';
import { formatTrDate } from '@/lib/rpe';
import { exerciseVolume } from '@/lib/volume';
import { workoutDraft } from '@/lib/workout-draft';
import { DEFAULT_SESSION_TYPES } from '@/types/workout';

export default function WorkoutScreen() {
  const router = useRouter();
  const draft = useSyncExternalStore(
    workoutDraft.subscribe,
    workoutDraft.getSnapshot
  );

  const { saveWorkout, isSaving } = useWorkouts();

  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [customSessionOpen, setCustomSessionOpen] = useState(false);
  const [customSessionText, setCustomSessionText] = useState('');

  // ─── Genel Antrenman Süresi Sayacı (Başlatılınca Çalışır) ───
  const [hasStarted, setHasStarted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedSecondsRef = useRef<number>(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (hasStarted && isTimerRunning) {
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
  }, [hasStarted, isTimerRunning]);

  const handleStartWorkout = () => {
    setHasStarted(true);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
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
    if (customSessionText.trim()) {
      workoutDraft.setSessionType(customSessionText.trim());
      setCustomSessionOpen(false);
    }
  };

  // Bitir Butonuna Basıldığında Onay Diyaloğunu Aç
  const handleOpenFinishDialog = () => {
    if (draft.exercises.length === 0) {
      Alert.alert('Uyarı', 'Lütfen antrenmanı bitirmeden önce en az bir egzersiz ekleyin.');
      return;
    }

    // Geçersiz set kontrolü
    const hasValidSets = draft.exercises.some((ex) =>
      ex.sets_data.some((s) => s.reps > 0)
    );
    if (!hasValidSets) {
      Alert.alert(
        'Uyarı',
        'Kaydetmek için en az bir sette tekrar (reps) sayısı girilmelidir.'
      );
      return;
    }

    setFinishDialogOpen(true);
  };

  // Onay Panosunda "Bitir ve Kaydet"e Basıldığında DB'ye Kaydet
  const handleConfirmFinish = async () => {
    try {
      const durationHuman = formatDurationHuman(durationSeconds);
      const finalNotes = draft.notes?.trim()
        ? `${draft.notes.trim()}\n\n⏱️ Antrenman Süresi: ${durationHuman}`
        : `⏱️ Antrenman Süresi: ${durationHuman}`;

      const payload = {
        ...draft,
        notes: finalNotes,
      };

      await saveWorkout(payload);
      setFinishDialogOpen(false);

      Alert.alert('Tebrikler! 💪', 'Antrenmanınız başarıyla kaydedildi.', [
        {
          text: 'Tamam',
          onPress: () => {
            workoutDraft.reset();
            setHasStarted(false);
            setIsTimerRunning(false);
            setDurationSeconds(0);
            startTimeRef.current = null;
            pausedSecondsRef.current = 0;
            router.push('/(app)/history');
          },
        },
      ]);
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
        {/* ─── ÜST BAR: Başlık, Tarih & Geçmişe Git (İkonsuz, Neon Çerçeveli) ─── */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenTitle}>Antrenman Kaydı</Text>
            <TouchableOpacity
              onPress={() => setDateSheetOpen(true)}
              style={styles.dateSelector}
              activeOpacity={0.7}
            >
              <Text style={styles.dateSelectorText}>
                {formatTrDate(draft.date)} ▾
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => router.push('/(app)/history')}
              activeOpacity={0.7}
            >
              <Text style={styles.historyBtnText}>Geçmiş</Text>
            </TouchableOpacity>

            {draft.exercises.length > 0 && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => setResetDialogOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.resetBtnText}>Temizle</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ─── KAYDIRILABİLİR İÇERİK ─── */}
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Canlı İstatistik Çubuğu */}
          <View style={styles.section}>
            <LiveStatsBar exercises={draft.exercises} />
          </View>

          {/* Dinlenme Sayacı (varsa) */}
          {showRestTimer ? (
            <RestTimer
              initialSeconds={90}
              onClose={() => setShowRestTimer(false)}
            />
          ) : null}

          {/* Oturum Tipi Seçimi (Chip Sırası) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oturum Tipi</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sessionTypeScroll}
            >
              {DEFAULT_SESSION_TYPES.map((type) => {
                const isSelected = draft.session_type === type;
                return (
                  <TouchableOpacity
                    key={type}
                    onPress={() => handleSelectSessionType(type)}
                    style={[
                      styles.sessionChip,
                      isSelected && styles.selectedSessionChip,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.sessionChipText,
                        isSelected && styles.selectedSessionChipText,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {customSessionOpen ? (
              <View style={styles.customSessionRow}>
                <TextInput
                  style={styles.customSessionInput}
                  placeholder="Özel oturum adı (örn: Kol Günü)..."
                  placeholderTextColor={Colors.light.textSecondary}
                  value={customSessionText}
                  onChangeText={setCustomSessionText}
                />
                <Button
                  onPress={handleCustomSessionSubmit}
                  disabled={!customSessionText.trim()}
                >
                  Belirle
                </Button>
              </View>
            ) : null}
          </View>

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
            onTriggerRestTimer={() => setShowRestTimer(true)}
          />

          {/* ─── NOT ALMA KISMI (Hareket kartlarının altında, süre sayacının hemen üstünde) ─── */}
          <WorkoutNote
            value={draft.notes ?? ''}
            onChange={(text) => workoutDraft.setNotes(text)}
          />
        </ScrollView>

        {/* ─── EN ALTTTAKİ YAPIŞKAN: SAYAÇ + BAŞLAT / BİTİR (Neon Çerçeveli) ─── */}
        <WorkoutTimerBar
          seconds={durationSeconds}
          hasStarted={hasStarted}
          isRunning={isTimerRunning}
          onStart={handleStartWorkout}
          onTogglePause={handleToggleTimer}
          onFinish={handleOpenFinishDialog}
        />

        {/* ─── EKRANIN ORTASINDA AÇILAN ONAY PANOSU ─── */}
        <FinishWorkoutDialog
          visible={finishDialogOpen}
          durationSeconds={durationSeconds}
          exerciseCount={draft.exercises.length}
          totalSetsCount={totalSetsCount}
          totalVolume={totalVolume}
          note={draft.notes}
          isSaving={isSaving}
          onConfirm={handleConfirmFinish}
          onCancel={() => setFinishDialogOpen(false)}
        />

        {/* Tarih Seçici Bottom Sheet */}
        <DatePickerSheet
          visible={dateSheetOpen}
          value={draft.date}
          onChange={(newDate) => workoutDraft.setDate(newDate)}
          onClose={() => setDateSheetOpen(false)}
        />

        {/* Taslağı Temizle Diyaloğu */}
        <ConfirmDialog
          visible={resetDialogOpen}
          title="Antrenmanı Temizle"
          message="Girilen tüm egzersiz ve setler silinecek. Emin misiniz?"
          confirmText="Evet, Temizle"
          destructive
          onConfirm={() => {
            workoutDraft.reset();
            setHasStarted(false);
            setIsTimerRunning(false);
            setDurationSeconds(0);
            startTimeRef.current = null;
            pausedSecondsRef.current = 0;
            setResetDialogOpen(false);
          }}
          onCancel={() => setResetDialogOpen(false)}
        />
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
    marginTop: 2,
  },
  dateSelectorText: {
    fontSize: Typography.small,
    color: '#C084FC',
    fontWeight: '700',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
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
  resetBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.10)',
    paddingHorizontal: Spacing.two + 4,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  resetBtnText: {
    fontSize: Typography.small,
    color: '#F87171',
    fontWeight: '800',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: Spacing.three,
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
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
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
  customSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  customSessionInput: {
    flex: 1,
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: Typography.label,
    color: Colors.light.text,
  },
});
