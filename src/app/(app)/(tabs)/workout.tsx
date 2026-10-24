import { useSyncExternalStore, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DatePickerSheet } from '@/components/ui/date-picker-sheet';
import { ExerciseList } from '@/components/workout/exercise-list';
import { LiveStatsBar } from '@/components/workout/live-stats-bar';
import { RestTimer } from '@/components/workout/rest-timer';
import { WorkoutNote } from '@/components/workout/workout-note';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useWorkouts } from '@/hooks/use-workouts';
import { formatTrDate } from '@/lib/rpe';
import { workoutDraft } from '@/lib/workout-draft';
import { DEFAULT_SESSION_TYPES } from '@/types/workout';

export default function WorkoutScreen() {
  const router = useRouter();
  const draft = useSyncExternalStore(
    workoutDraft.subscribe,
    workoutDraft.getSnapshot
  );

  const { workouts, saveWorkout, isSaving } = useWorkouts();

  // En son kaydedilen antrenman (önceki ağırlık/tekrar referansları için)
  const lastWorkout = workouts[0] ?? null;

  const [dateSheetOpen, setDateSheetOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [customSessionOpen, setCustomSessionOpen] = useState(false);
  const [customSessionText, setCustomSessionText] = useState('');

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

  const handleSave = async () => {
    if (draft.exercises.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir egzersiz ekleyin.');
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

    try {
      await saveWorkout(draft);
      Alert.alert('Tebrikler! 💪', 'Antrenmanınız başarıyla kaydedildi.', [
        {
          text: 'Tamam',
          onPress: () => {
            workoutDraft.reset();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Üst Bar: Başlık, Tarih ve Geçmişe Git */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.screenTitle}>Antrenman Kaydı</Text>
            <TouchableOpacity
              onPress={() => setDateSheetOpen(true)}
              style={styles.dateSelector}
            >
              <Text style={styles.dateSelectorText}>
                📅 {formatTrDate(draft.date)} ▾
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.historyBtn}
              onPress={() => router.push('/(app)/history')}
            >
              <Text style={styles.historyBtnText}>Geçmiş 📜</Text>
            </TouchableOpacity>

            {draft.exercises.length > 0 && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={() => setResetDialogOpen(true)}
              >
                <Text style={styles.resetBtnText}>Temizle</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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

          {/* Not Alanı */}
          <WorkoutNote
            value={draft.notes ?? ''}
            onChange={(text) => workoutDraft.setNotes(text)}
          />

          {/* Egzersiz Listesi */}
          <ExerciseList
            exercises={draft.exercises}
            previousExercises={lastWorkout?.exercises}
            onUpdateExercise={(idx, updated) =>
              workoutDraft.updateExercise(idx, updated)
            }
            onRemoveExercise={(idx) => workoutDraft.removeExercise(idx)}
            onAddExercise={() => router.push('/(app)/workout/add-exercise')}
            onTriggerRestTimer={() => setShowRestTimer(true)}
          />

          {/* Kaydet Butonu */}
          {draft.exercises.length > 0 && (
            <View style={styles.saveContainer}>
              <Button
                variant="primary"
                onPress={handleSave}
                loading={isSaving}
                disabled={isSaving}
              >
                Antrenmanı Kaydet
              </Button>
            </View>
          )}
        </ScrollView>

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
    backgroundColor: Colors.light.background,
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
    borderBottomColor: AppColors.border,
  },
  screenTitle: {
    fontSize: Typography.heading,
    fontWeight: '800',
    color: Colors.light.text,
  },
  dateSelector: {
    marginTop: 2,
  },
  dateSelectorText: {
    fontSize: Typography.small,
    color: AppColors.primary,
    fontWeight: '600',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  historyBtn: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  historyBtnText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.light.text,
  },
  resetBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
  },
  resetBtnText: {
    fontSize: Typography.small,
    color: AppColors.danger,
    fontWeight: '600',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six * 2,
  },
  section: {
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: Colors.light.textSecondary,
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
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  selectedSessionChip: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  sessionChipText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.light.text,
  },
  selectedSessionChipText: {
    color: '#fff',
  },
  customSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  customSessionInput: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: Typography.label,
    color: Colors.light.text,
  },
  saveContainer: {
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },
});
