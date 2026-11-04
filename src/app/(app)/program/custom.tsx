import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

import { useProgram } from '@/hooks/use-program';
import { useUser } from '@/hooks/use-user';
import type { CustomDay } from '@/types/program';

// ─── Renk Token'ları ───
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

  // Mor / Neon Violet
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleDark: '#7C3AED',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.35)',

  // Yeşil / Emerald
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.4)',

  // Cyan / Bilgi
  cyan: '#06B6D4',
  cyanBg: 'rgba(6, 182, 212, 0.12)',
  cyanBorder: 'rgba(6, 182, 212, 0.35)',

  // Danger
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerBorder: 'rgba(239, 68, 68, 0.35)',
};

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

const QUICK_SESSION_TYPES = [
  'Push',
  'Pull',
  'Legs',
  'Üst Vücut',
  'Alt Vücut',
  'Full Body',
  'Göğüs & Kol',
  'Sırt & Omuz',
  'Kardiyo',
];

function BackIcon({ color = colors.text, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function SaveIcon({ color = colors.emeraldLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"
      />
    </Svg>
  );
}

export default function CustomProgramBuilderScreen() {
  const router = useRouter();
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
      // Parse hatasında varsayılan
    }
    return [DEFAULT_DAYS];
  };

  const [weeks, setWeeks] = useState<CustomDay[][]>(parseInitialWeeks);
  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const daysListY = useRef<number>(0);
  const dayCardY = useRef<{ [key: number]: number }>({});
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToInput = (dayIndex: number, field: 'type' | 'focus') => {
    setTimeout(
      () => {
        const cardTop = daysListY.current + (dayCardY.current[dayIndex] ?? 0);
        const fieldOffset = field === 'type' ? 50 : 160;
        const targetY = Math.max(0, cardTop + fieldOffset - 80);
        scrollRef.current?.scrollTo({ y: targetY, animated: true });
      },
      Platform.OS === 'ios' ? 80 : 120
    );
  };

  const currentWeek = weeks[activeWeekIndex] ?? DEFAULT_DAYS;

  const handleUpdateDay = (dayIndex: number, updated: Partial<CustomDay>) => {
    const nextWeeks = [...weeks];
    const nextWeek = [...(nextWeeks[activeWeekIndex] ?? DEFAULT_DAYS)];
    nextWeek[dayIndex] = { ...nextWeek[dayIndex], ...updated };
    nextWeeks[activeWeekIndex] = nextWeek;
    setWeeks(nextWeeks);
  };

  const handleToggleRest = (dayIndex: number) => {
    const dayData = currentWeek[dayIndex];
    const isCurrentlyRest = dayData?.isRest ?? true;
    handleUpdateDay(dayIndex, {
      isRest: !isCurrentlyRest,
      type: !isCurrentlyRest
        ? 'Dinlenme'
        : dayData?.type && dayData.type !== 'Dinlenme'
        ? dayData.type
        : 'Push',
      focus: !isCurrentlyRest
        ? 'Toparlanma'
        : dayData?.focus && dayData.focus !== 'Toparlanma'
        ? dayData.focus
        : 'Göğüs, Ön Omuz',
    });
  };

  const handleAddWeek = () => {
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
      Alert.alert('Başarılı! 🎉', 'Özel programınız başarıyla kaydedildi.', [
        {
          text: 'Tamam',
          onPress: () => router.back(),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Program kaydedilemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Üst Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backCircleBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={10}
            accessibilityLabel="Geri Dön"
          >
            <BackIcon size={20} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.titleGroup}>
            <Text style={styles.screenTitle}>Kendi Programını Yaz</Text>
            <Text style={styles.screenSubtitle}>Kişisel Split & Kas Dağılımı</Text>
          </View>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            keyboardHeight > 0 && { paddingBottom: keyboardHeight + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Açıklama Kartı */}
          <View style={styles.infoBanner}>
            <View style={styles.infoBannerDot} />
            <Text style={styles.infoBannerText}>
              Haftanın her günü için antrenman tipinizi ve hedef kaslarınızı dilediğiniz gibi
              özelleştirin. Dinlenmek istediğiniz günlerde anahtarı kapalı tutun.
            </Text>
          </View>

          {/* Hafta Sekmeleri */}
          <View style={styles.weeksBarWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weeksScrollView}>
              {weeks.map((_, idx) => {
                const isSelected = activeWeekIndex === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.weekPill, isSelected && styles.selectedWeekPill]}
                    onPress={() => setActiveWeekIndex(idx)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.weekPillText, isSelected && styles.selectedWeekPillText]}>
                      {idx + 1}. Hafta
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={styles.addWeekPill}
                onPress={handleAddWeek}
                activeOpacity={0.75}
              >
                <Text style={styles.addWeekPillText}>+ Hafta Ekle</Text>
              </TouchableOpacity>
            </ScrollView>

            {weeks.length > 1 && (
              <TouchableOpacity
                style={styles.removeWeekBtn}
                onPress={() => handleRemoveWeek(activeWeekIndex)}
                activeOpacity={0.7}
              >
                <Text style={styles.removeWeekText}>Bu Haftayı Sil</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gün Kartları Listesi */}
          <View
            style={styles.daysList}
            onLayout={(e) => {
              daysListY.current = e.nativeEvent.layout.y;
            }}
          >
            {WEEKDAYS.map((dayName, idx) => {
              const dayData = currentWeek[idx] ?? {
                day: dayName,
                type: 'Dinlenme',
                focus: 'Toparlanma',
                isRest: true,
              };

              return (
                <Animated.View
                  key={dayName}
                  layout={LinearTransition.duration(280).easing(Easing.bezier(0.25, 1, 0.5, 1))}
                  onLayout={(e) => {
                    dayCardY.current[idx] = e.nativeEvent.layout.y;
                  }}
                  style={[
                    styles.dayCard,
                    dayData.isRest ? styles.restDayCard : styles.activeDayCard,
                  ]}
                >
                  {/* Gün Başlığı ve Durum */}
                  <View style={styles.dayHeader}>
                    <View style={styles.dayTitleRow}>
                      <View
                        style={[
                          styles.dayDot,
                          { backgroundColor: dayData.isRest ? colors.textDim : colors.emeraldLight },
                        ]}
                      />
                      <Text style={styles.dayTitle}>{dayName}</Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.restToggle,
                        dayData.isRest ? styles.restToggleActive : styles.workoutToggleActive,
                      ]}
                      onPress={() => handleToggleRest(idx)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.restToggleText,
                          dayData.isRest
                            ? styles.restToggleTextDim
                            : styles.restToggleTextGreen,
                        ]}
                      >
                        {dayData.isRest ? '💤 Dinlenme' : '🔥 Antrenman'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {!dayData.isRest ? (
                    <Animated.View
                      entering={FadeIn.duration(220).easing(Easing.bezier(0.25, 1, 0.5, 1))}
                      exiting={FadeOut.duration(160).easing(Easing.bezier(0.25, 1, 0.5, 1))}
                      style={styles.dayInputsContainer}
                    >
                      {/* Oturum Tipi */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>OTURUM TİPİ</Text>
                        <TextInput
                          style={styles.input}
                          value={dayData.type}
                          onChangeText={(text) => handleUpdateDay(idx, { type: text })}
                          onFocus={() => scrollToInput(idx, 'type')}
                          placeholder="Örn: Push, Pull, Göğüs-Biceps"
                          placeholderTextColor={colors.textDim}
                        />

                        {/* Hızlı Seçim Çipleri */}
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          style={styles.chipsScroll}
                          contentContainerStyle={styles.chipsContainer}
                        >
                          {QUICK_SESSION_TYPES.map((qType) => (
                            <TouchableOpacity
                              key={qType}
                              style={[
                                styles.chip,
                                dayData.type === qType && styles.chipActive,
                              ]}
                              onPress={() => handleUpdateDay(idx, { type: qType })}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.chipText,
                                  dayData.type === qType && styles.chipTextActive,
                                ]}
                              >
                                {qType}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>

                      {/* Odak Kaslar */}
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>ODAK KASLAR / NOTLAR</Text>
                        <TextInput
                          style={styles.input}
                          value={dayData.focus}
                          onChangeText={(text) => handleUpdateDay(idx, { focus: text })}
                          onFocus={() => scrollToInput(idx, 'focus')}
                          placeholder="Örn: Göğüs, Ön Omuz, Triceps"
                          placeholderTextColor={colors.textDim}
                        />
                      </View>
                    </Animated.View>
                  ) : (
                    <Animated.View
                      entering={FadeIn.duration(220).easing(Easing.bezier(0.25, 1, 0.5, 1))}
                      exiting={FadeOut.duration(160).easing(Easing.bezier(0.25, 1, 0.5, 1))}
                      style={styles.restDayInfoBox}
                    >
                      <Text style={styles.restText}>
                        Toparlanma ve kas onarımı için ayrılmış dinlenme günü.
                      </Text>
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>

          {/* En Altta Büyük Kaydet Butonu (Yeşil Neon Çerçeveli) */}
          <TouchableOpacity
            style={[styles.bottomSaveBtn, isSaving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <SaveIcon size={20} color={colors.emeraldLight} />
            <Text style={styles.bottomSaveBtnText}>
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  backCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleGroup: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  screenTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  screenSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textMuted,
    marginTop: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    marginBottom: 16,
  },
  infoBannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purpleLight,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  weeksBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  weeksScrollView: {
    flex: 1,
  },
  weekPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8,
  },
  selectedWeekPill: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleLight,
  },
  weekPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  selectedWeekPillText: {
    color: colors.purpleLight,
    fontWeight: '700',
  },
  addWeekPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  addWeekPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDim,
  },
  removeWeekBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.dangerBg,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  removeWeekText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
  },
  daysList: {
    gap: 12,
    marginBottom: 20,
  },
  dayCard: {
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  activeDayCard: {
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  restDayCard: {
    backgroundColor: colors.cardBgInner,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    opacity: 0.85,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dayTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  restToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  restToggleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  workoutToggleActive: {
    backgroundColor: colors.emeraldBg,
    borderColor: colors.emeraldBorder,
  },
  restToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  restToggleTextDim: {
    color: colors.textMuted,
  },
  restToggleTextGreen: {
    color: colors.emeraldLight,
  },
  dayInputsContainer: {
    marginTop: 12,
    gap: 10,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: colors.cardBgInner,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: colors.text,
  },
  chipsScroll: {
    marginTop: 4,
  },
  chipsContainer: {
    gap: 6,
  },
  chip: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  chipActive: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleLight,
  },
  chipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.purpleLight,
    fontWeight: '700',
  },
  restDayInfoBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  restText: {
    fontSize: 12,
    color: colors.textDim,
    fontStyle: 'italic',
  },
  bottomSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1.5,
    borderColor: colors.emeraldBorder,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: colors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 0,
  },
  bottomSaveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.emeraldLight,
    letterSpacing: 0.3,
  },
});
