import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ExerciseOptionsSheet } from '@/components/workout/exercise-options-sheet';
import { SetRow } from '@/components/workout/set-row';
import { SupersetPickerSheet } from '@/components/workout/superset-picker-sheet';
import { getSupersetTheme } from '@/constants/superset';
import { AppColors, Radius, Spacing } from '@/constants/theme';
import { formatVolume, exerciseVolume } from '@/lib/volume';
import { workoutDraft } from '@/lib/workout-draft';
import type { ExerciseEntry, SetData } from '@/types/workout';

export type ExerciseCardProps = {
  entry: ExerciseEntry;
  index: number;
  totalExercises: number;
  allExercises?: ExerciseEntry[];
  onUpdate: (updated: ExerciseEntry) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onTriggerRestTimer?: () => void;
};

export const ExerciseCard = React.memo(function ExerciseCard({
  entry,
  index,
  totalExercises,
  allExercises,
  onUpdate,
  onRemove,
  onTriggerRestTimer,
}: ExerciseCardProps) {
  const router = useRouter();
  const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);
  const [supersetSheetVisible, setSupersetSheetVisible] = useState(false);

  const sets = entry.sets_data ?? [];

  const handleSetChange = (setIdx: number, updatedSet: SetData) => {
    const nextSets = [...sets];
    nextSets[setIdx] = updatedSet;
    onUpdate({ ...entry, sets_data: nextSets });
  };

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    const newSet: SetData = {
      weight_kg: lastSet?.weight_kg ?? 0,
      reps: lastSet?.reps ?? 0,
      rir: lastSet?.rir ?? null,
    };
    onUpdate({ ...entry, sets_data: [...sets, newSet] });
  };

  const handleDeleteSet = (setIdx: number) => {
    if (sets.length <= 1) {
      onUpdate({
        ...entry,
        sets_data: [{ weight_kg: 0, reps: 0, rir: null }],
      });
      return;
    }
    const nextSets = sets.filter((_, i) => i !== setIdx);
    onUpdate({ ...entry, sets_data: nextSets });
  };

  const totalVolume = exerciseVolume(sets, entry.is_bodyweight);
  const exerciseList = allExercises ?? workoutDraft.getSnapshot().exercises;
  const supersetTheme = getSupersetTheme(entry.superset_id);

  const handleReorder = () => {
    router.push('/workout/reorder');
  };

  const handleReplace = () => {
    router.push({
      pathname: '/workout/add-exercise',
      params: { mode: 'replace', replaceIndex: String(index) },
    });
  };

  const handleLinkSuperset = (targetIndex: number) => {
    workoutDraft.linkSuperset(index, targetIndex);
  };

  const handleUnlinkSuperset = () => {
    workoutDraft.unlinkSuperset(index);
  };

  return (
    <View style={styles.card}>
      {/* ─── KART BAŞLIĞI ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Animasyonlu GIF / Egzersiz Görsel Çerçevesi (Gelecek İçin Boş Çerçeve - En Solda) */}
          <View style={styles.thumbnailFrame} />

          {/* Egzersiz Adı & Kas Grubu & Süperset Etiketi */}
          <View style={styles.titleInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {entry.exercise_name}
              </Text>
              <View style={styles.muscleBadge}>
                <Text style={styles.muscleText}>{entry.muscle_group}</Text>
              </View>
            </View>

            {/* Süperset Etiketi (Hareket Adının Hemen Altında: SÜPERSET A, SÜPERSET B vb.) */}
            {supersetTheme && (
              <View style={styles.supersetTagRow}>
                <View
                  style={[
                    styles.supersetTag,
                    {
                      backgroundColor: supersetTheme.bg,
                      borderColor: supersetTheme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.supersetTagText,
                      { color: supersetTheme.text },
                    ]}
                  >
                    {supersetTheme.label}
                  </Text>
                </View>
              </View>
            )}

            {totalVolume > 0 && (
              <Text style={styles.volumeText}>
                Hacim: {formatVolume(totalVolume)}
              </Text>
            )}
          </View>
        </View>

        {/* Sağ: Dikey 3 Nokta Butonu (⋮) */}
        <TouchableOpacity
          onPress={() => setOptionsSheetVisible(true)}
          style={styles.moreBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.moreIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* ─── SÜTUN BAŞLIKLARI ŞERİDİ (SET | AĞIRLIK (KG) | TEKRAR | RIR | İŞLEM) ─── */}
      <View style={styles.tableHeaderStrip}>
        <Text style={[styles.headerLabel, styles.setCol]}>SET</Text>
        <Text style={[styles.headerLabel, styles.weightCol]}>AĞIRLIK (KG)</Text>
        <Text style={[styles.headerLabel, styles.repsCol]}>TEKRAR</Text>
        <Text style={[styles.headerLabel, styles.rirCol]}>RIR</Text>
        <Text style={[styles.headerLabel, styles.actionCol]}>İŞLEM</Text>
      </View>

      {/* ─── SET SATIRLARI ─── */}
      <View style={styles.setsList}>
        {sets.map((set, setIdx) => (
          <SetRow
            key={setIdx}
            index={setIdx}
            set={set}
            isBodyweight={entry.is_bodyweight}
            onChange={(updated) => handleSetChange(setIdx, updated)}
            onDelete={() => handleDeleteSet(setIdx)}
            onAddSet={handleAddSet}
            onComplete={onTriggerRestTimer}
          />
        ))}
      </View>

      {/* ─── 3 NOKTA ALTTAN AÇILAN SEÇENEK PANOSU ─── */}
      <ExerciseOptionsSheet
        visible={optionsSheetVisible}
        exerciseName={entry.exercise_name}
        muscleGroup={entry.muscle_group}
        isSuperset={Boolean(entry.superset_id)}
        supersetTheme={supersetTheme}
        onClose={() => setOptionsSheetVisible(false)}
        onReorder={handleReorder}
        onReplace={handleReplace}
        onAddSuperset={() => setSupersetSheetVisible(true)}
        onRemoveSuperset={handleUnlinkSuperset}
        onRemove={onRemove}
      />

      {/* ─── SÜPERSET SEÇİM PANOSU ─── */}
      <SupersetPickerSheet
        visible={supersetSheetVisible}
        currentExerciseIndex={index}
        currentExerciseName={entry.exercise_name}
        exercises={exerciseList}
        onClose={() => setSupersetSheetVisible(false)}
        onSelectTarget={handleLinkSuperset}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D101C',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    padding: Spacing.two + 4,
    marginBottom: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbnailFrame: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#101424',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    overflow: 'hidden',
  },
  titleInfo: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  muscleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  muscleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#C084FC',
  },
  supersetTagRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  supersetTag: {
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.45)',
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  supersetTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#F472B6',
    letterSpacing: 0.5,
  },
  volumeText: {
    fontSize: 11,
    fontWeight: '600',
    color: AppColors.muted,
  },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreIcon: {
    fontSize: 18,
    color: '#CBD5E1',
    fontWeight: '800',
    lineHeight: 20,
  },
  tableHeaderStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161B2E',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 4,
  },
  headerLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  setCol: {
    width: '12%',
    textAlign: 'left',
    paddingLeft: 4,
  },
  weightCol: {
    width: '26%',
  },
  repsCol: {
    width: '24%',
  },
  rirCol: {
    width: '18%',
  },
  actionCol: {
    width: '20%',
  },
  setsList: {
    marginTop: 2,
  },
});
