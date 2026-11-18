import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
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
import { ExerciseList } from '@/components/workout/exercise-list';
import { FinishWorkoutDialog } from '@/components/workout/finish-workout-dialog';
import { FutureDateModal } from '@/components/workout/future-date-modal';
import { LiveStatsBar } from '@/components/workout/live-stats-bar';
import { RestTimer } from '@/components/workout/rest-timer';
import { WorkoutCalendarModal } from '@/components/workout/workout-calendar-modal';
import { WorkoutCalendarView } from '@/components/workout/workout-calendar-view';
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

  const { workouts, saveWorkout, isSaving } = useWorkouts();

  const todayIso = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const yesterdayIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const workoutDatesSet = useMemo(() => {
    return new Set((workouts || []).map((w) => w.date));
  }, [workouts]);

  // ─── Kayıt Modu: 'live' (Salonda Canlı) veya 'manual' (Not Defterinden / Geçmişten Giriş) ───
  const [entryMode, setEntryMode] = useState<'live' | 'manual'>(() =>
    draft.date < todayIso ? 'manual' : 'live'
  );
  const [manualDurationMinutes, setManualDurationMinutes] = useState<number>(45);

  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [customSessionOpen, setCustomSessionOpen] = useState(false);
  const [customSessionText, setCustomSessionText] = useState('');

  // ─── Canlı Antrenman Süresi Sayacı (Yalnızca Canlı Modda Çalışır) ───
  const [hasStarted, setHasStarted] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const pausedSecondsRef = useRef<number>(0);
  const [futureModalOpen, setFutureModalOpen] = useState(false);

  // Antrenman Kaydı Ana Sayfası: Egzersiz seçilene kadar daima bu başlangıç ekranı gösterilir
  const isLanding = draft.exercises.length === 0;

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
    workoutDraft.setDate(newDate);
    if (newDate < todayIso) {
      setEntryMode('manual');
    }
  };

  const handleSelectLiveMode = () => {
    setEntryMode('live');
    workoutDraft.setDate(todayIso);
  };

  const handleSelectManualMode = () => {
    setEntryMode('manual');
    if (draft.date >= todayIso) {
      workoutDraft.setDate(yesterdayIso);
    }
  };

  const handleStartFromLanding = () => {
    if (entryMode === 'live') {
      workoutDraft.setDate(todayIso);
      setHasStarted(true);
      setIsTimerRunning(true);
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }
      router.push('/(app)/workout/add-exercise');
    } else {
      if (draft.date > todayIso) {
        setFutureModalOpen(true);
        return;
      }
      setHasStarted(true);
      router.push('/(app)/workout/add-exercise');
    }
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

  // Etkin Antrenman Süresi (Canlıysa saniyeler, Manuel ise seçilen dakika)
  const effectiveDurationSeconds =
    entryMode === 'manual' ? manualDurationMinutes * 60 : durationSeconds;

  // Bitir / Kaydet Butonuna Basıldığında Onay Diyaloğunu Aç
  const handleOpenFinishDialog = () => {
    if (draft.exercises.length === 0) {
      Alert.alert('Uyarı', 'Lütfen antrenmanı kaydetmeden önce en az bir egzersiz ekleyin.');
      return;
    }

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

  // Onay Panosunda Onaylandığında DB'ye Kaydet
  const handleConfirmFinish = async () => {
    try {
      const durationHuman = formatDurationHuman(effectiveDurationSeconds);
      const modeLabel = entryMode === 'manual' ? '📝 Not Girişi' : '🟢 Canlı Seans';
      const finalNotes = draft.notes?.trim()
        ? `${draft.notes.trim()}\n\n⏱️ Antrenman Süresi: ${durationHuman} (${modeLabel})`
        : `⏱️ Antrenman Süresi: ${durationHuman} (${modeLabel})`;

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
          </View>
        ) : (
          <View style={styles.topBar}>
            <View style={styles.activeHeaderLeft}>
              <View>
                <View style={styles.activeTitleRow}>
                  <Text style={styles.screenTitle}>Antrenman Kaydı</Text>
                  <View style={styles.sessionBadge}>
                    <Text style={styles.sessionBadgeText}>
                      {draft.session_type || 'Üst Vücut'}
                    </Text>
                  </View>
                </View>
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
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => router.push('/(app)/history')}
                activeOpacity={0.7}
              >
                <Text style={styles.historyBtnText}>Geçmiş</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => setResetDialogOpen(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.resetBtnText}>Temizle</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ─── İÇERİK: BAŞLANGIÇ GİRİŞ DURUMU VEYA AKTİF ANTRENMAN ─── */}
        {isLanding ? (
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.landingScrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. EN ÜSTTE: OTURUM TİPİ */}
            <View style={styles.landingSection}>
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

            {/* 2. ORTASINDA: 2 BUTON (CANLI MI / KAYIT MI) */}
            <View style={styles.landingSection}>
              <Text style={styles.sectionTitle}>Antrenmanı Nasıl Yapacaksınız?</Text>
              <View style={styles.landingModeRow}>
                <TouchableOpacity
                  style={[
                    styles.landingModeBtn,
                    entryMode === 'live' && styles.landingModeBtnLiveActive,
                  ]}
                  onPress={handleSelectLiveMode}
                  activeOpacity={0.8}
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

                <TouchableOpacity
                  style={[
                    styles.landingModeBtn,
                    entryMode === 'manual' && styles.landingModeBtnManualActive,
                  ]}
                  onPress={handleSelectManualMode}
                  activeOpacity={0.8}
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
              </View>
            </View>

            {/* 3. TARİH ALANI: CANLI İSE O GÜNÜ GÖSTERİR, DEĞİLSE TARİH PANOSU EKRANDA BULUNUR */}
            {entryMode === 'live' ? (
              <View style={styles.landingLiveArea}>
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

                <TouchableOpacity
                  style={styles.landingStartLiveBtn}
                  onPress={handleStartFromLanding}
                  activeOpacity={0.8}
                >
                  <Text style={styles.landingStartLiveBtnText}>
                    Antrenmanı Başlat
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.landingManualArea}>
                {/* Scroll / Swipe özellikli Tarih Panomuz (Dün, 2 gün önce kaldırıldı) */}
                <WorkoutCalendarView
                  selectedDate={draft.date}
                  workoutDatesSet={workoutDatesSet}
                  onSelect={(dateIso) => workoutDraft.setDate(dateIso)}
                  title="Hangi Günün Antrenmanı?"
                />

                <Text style={styles.landingInfoText}>
                  Geçmiş antrenman notlarınızı süre sayacı olmadan doğrudan girmek için yukarıdan tarihi seçin.
                </Text>

                <TouchableOpacity
                  style={styles.landingStartManualBtn}
                  onPress={handleStartFromLanding}
                  activeOpacity={0.8}
                >
                  <Text style={styles.landingStartManualBtnText}>
                    Egzersiz Ekle & Kayda Başla
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          /* AKTİF ANTRENMAN EKRANI */
          <>
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* 1. Canlı İstatistik Çubuğu (Toplam Set, Toplam Hacim ve Kayıt Tarihi) */}
              <View style={styles.section}>
                <LiveStatsBar
                  exercises={draft.exercises}
                  date={draft.date}
                  onPressDate={() => setDateSheetOpen(true)}
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

                <TouchableOpacity
                  style={styles.manualSaveBtn}
                  onPress={handleOpenFinishDialog}
                  activeOpacity={0.8}
                >
                  <Text style={styles.manualSaveBtnText}>Antrenmanı Kaydet</Text>
                </TouchableOpacity>
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
          isSaving={isSaving}
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
        {/* Gelecek Tarih Uyarı Panosu (Şık Neon Tasarım) */}
        <FutureDateModal
          visible={futureModalOpen}
          onClose={() => setFutureModalOpen(false)}
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
  activeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  activeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 7,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderWidth: 1.2,
    borderColor: '#C084FC',
  },
  sessionBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#E9D5FF',
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
    paddingTop: 14,
    paddingBottom: 24,
  },
  section: {
    marginBottom: Spacing.two + 2,
  },
  // ─── Başlangıç Karşılama Ekranı Stilleri ───
  landingScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  landingSection: {
    gap: 8,
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
    borderRadius: 16,
    borderWidth: 1.8,
    borderColor: 'rgba(16, 185, 129, 0.4)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1.5,
    borderColor: '#10B981',
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
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landingStartLiveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  landingStartManualBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C084FC',
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  landingStartManualBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E9D5FF',
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
  // ─── Manuel Giriş Modu Alt Barı ───
  manualBottomBar: {
    backgroundColor: '#0C101D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  manualDurationGroup: {
    flex: 1,
    gap: 3,
  },
  manualDurationLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.3,
  },
  durationPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  durationPill: {
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  durationPillActive: {
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderColor: '#C084FC',
  },
  durationPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  durationPillTextActive: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  manualSaveBtn: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1.6,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualSaveBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.2,
  },
});
