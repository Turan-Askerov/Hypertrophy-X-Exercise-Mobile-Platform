import { useState } from 'react';
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

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useProgram } from '@/hooks/use-program';
import { useUser } from '@/hooks/use-user';
import type { CustomDay } from '@/types/program';

const WEEKDAYS = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

const DEFAULT_DAYS: CustomDay[] = [
  { day: 'Pazartesi', type: 'Push', focus: 'Göğüs, Ön Omuz, Triceps', isRest: false },
  { day: 'Salı', type: 'Pull', focus: 'Sırt, Arka Omuz, Biceps', isRest: false },
  { day: 'Çarşamba', type: 'Dinlenme', focus: 'Toparlanma', isRest: true },
  { day: 'Perşembe', type: 'Legs', focus: 'Quadriceps, Hamstring, Calf', isRest: false },
  { day: 'Cuma', type: 'Üst Vücut', focus: 'Göğüs, Sırt, Kollar', isRest: false },
  { day: 'Cumartesi', type: 'Dinlenme', focus: 'Aktif Dinlenme', isRest: true },
  { day: 'Pazar', type: 'Dinlenme', focus: 'Toparlanma', isRest: true },
];

export default function CustomProgramScreen() {
  const { user } = useUser();
  const { saveCustomProgram, isSaving } = useProgram();

  // Kullanıcının kayıtlı custom_split'i varsa parse et
  const parseInitialWeeks = (): CustomDay[][] => {
    if (!user?.custom_split) return [DEFAULT_DAYS];
    try {
      const parsed = JSON.parse(user.custom_split);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch {
      // Hata olursa varsayılan
    }
    return [DEFAULT_DAYS];
  };

  const [weeks, setWeeks] = useState<CustomDay[][]>(parseInitialWeeks);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  const currentWeek = weeks[activeWeekIndex] ?? DEFAULT_DAYS;

  const handleUpdateDay = (dayIndex: number, updated: Partial<CustomDay>) => {
    const nextWeeks = [...weeks];
    const nextWeek = [...(nextWeeks[activeWeekIndex] ?? DEFAULT_DAYS)];
    nextWeek[dayIndex] = { ...nextWeek[dayIndex], ...updated };
    nextWeeks[activeWeekIndex] = nextWeek;
    setWeeks(nextWeeks);
  };

  const handleAddWeek = () => {
    // Önceki haftanın kopyasını yeni hafta olarak ekle
    const copy = currentWeek.map((d, i) => ({ ...d, day: WEEKDAYS[i] }));
    setWeeks([...weeks, copy]);
    setActiveWeekIndex(weeks.length);
  };

  const handleRemoveWeek = (weekIdx: number) => {
    if (weeks.length <= 1) {
      Alert.alert('Uyarı', 'En az 1 haftalık program bulunmalıdır.');
      return;
    }
    const nextWeeks = weeks.filter((_, i) => i !== weekIdx);
    setWeeks(nextWeeks);
    setActiveWeekIndex(Math.max(0, weekIdx - 1));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await saveCustomProgram({
        username: user.username,
        program: weeks,
      });
      Alert.alert('Başarılı! 🎉', 'Özel programınız başarıyla kaydedildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Program kaydedilemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Üst Başlık */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Özel Programım</Text>
          <Button onPress={handleSave} loading={isSaving} disabled={isSaving}>
            Kaydet
          </Button>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hafta Sekmeleri */}
          <View style={styles.weeksBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weeks.map((_, idx) => {
                const isSelected = activeWeekIndex === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.weekPill,
                      isSelected && styles.selectedWeekPill,
                    ]}
                    onPress={() => setActiveWeekIndex(idx)}
                  >
                    <Text
                      style={[
                        styles.weekPillText,
                        isSelected && styles.selectedWeekPillText,
                      ]}
                    >
                      {idx + 1}. Hafta
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.addWeekPill}
                onPress={handleAddWeek}
              >
                <Text style={styles.addWeekPillText}>+ Hafta Ekle</Text>
              </TouchableOpacity>
            </ScrollView>

            {weeks.length > 1 && (
              <TouchableOpacity
                style={styles.removeWeekBtn}
                onPress={() => handleRemoveWeek(activeWeekIndex)}
              >
                <Text style={styles.removeWeekText}>Bu Haftayı Sil</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gün Kartları */}
          <View style={styles.daysList}>
            {WEEKDAYS.map((dayName, idx) => {
              const dayData = currentWeek[idx] ?? {
                day: dayName,
                type: 'Dinlenme',
                focus: 'Toparlanma',
                isRest: true,
              };

              return (
                <Card
                  key={dayName}
                  style={[
                    styles.dayCard,
                    dayData.isRest && styles.restDayCard,
                  ]}
                >
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayTitle}>{dayName}</Text>
                    <TouchableOpacity
                      style={[
                        styles.restToggle,
                        dayData.isRest && styles.restToggleActive,
                      ]}
                      onPress={() =>
                        handleUpdateDay(idx, {
                          isRest: !dayData.isRest,
                          type: !dayData.isRest ? 'Dinlenme' : 'Antrenman',
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.restToggleText,
                          dayData.isRest && styles.restToggleTextActive,
                        ]}
                      >
                        {dayData.isRest ? '💤 Dinlenme' : '🔥 Antrenman'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {!dayData.isRest ? (
                    <View style={styles.dayInputs}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Oturum Tipi</Text>
                        <TextInput
                          style={styles.input}
                          value={dayData.type}
                          onChangeText={(text) =>
                            handleUpdateDay(idx, { type: text })
                          }
                          placeholder="Örn: Push, Göğüs-Biceps"
                          placeholderTextColor={Colors.dark.textSecondary}
                        />
                      </View>

                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Odak Kaslar / Not</Text>
                        <TextInput
                          style={styles.input}
                          value={dayData.focus}
                          onChangeText={(text) =>
                            handleUpdateDay(idx, { focus: text })
                          }
                          placeholder="Örn: Göğüs, Ön Omuz, Triceps"
                          placeholderTextColor={Colors.dark.textSecondary}
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.restText}>
                      Kas toparlanması ve dinlenme günü
                    </Text>
                  )}
                </Card>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  screenTitle: {
    fontSize: Typography.heading,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six * 2,
  },
  weeksBar: {
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  weekPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 1,
    borderColor: AppColors.border,
    marginRight: Spacing.two,
  },
  selectedWeekPill: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  weekPillText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: Colors.dark.textSecondary,
  },
  selectedWeekPillText: {
    color: '#fff',
  },
  addWeekPill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 1,
    borderColor: AppColors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addWeekPillText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: AppColors.primary,
  },
  removeWeekBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  removeWeekText: {
    fontSize: Typography.small,
    color: AppColors.danger,
    fontWeight: '600',
  },
  daysList: {
    gap: Spacing.two,
  },
  dayCard: {
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  restDayCard: {
    opacity: 0.8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  restToggle: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  restToggleActive: {
    backgroundColor: AppColors.primaryMuted,
    borderColor: AppColors.primary,
  },
  restToggleText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  restToggleTextActive: {
    color: AppColors.primary,
  },
  dayInputs: {
    gap: Spacing.two,
  },
  inputGroup: {
    gap: 2,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    fontSize: Typography.label,
    color: Colors.dark.text,
  },
  restText: {
    fontSize: Typography.small,
    color: Colors.dark.textSecondary,
    fontStyle: 'italic',
  },
});
