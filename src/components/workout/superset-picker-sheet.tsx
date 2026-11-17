import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getNextAvailableSupersetLetter,
  getSupersetTheme,
} from '@/constants/superset';
import { Radius, Spacing } from '@/constants/theme';
import type { ExerciseEntry } from '@/types/workout';

export type SupersetPickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  currentExerciseIndex: number;
  currentExerciseName: string;
  exercises: ExerciseEntry[];
  onSelectTarget: (targetIndex: number) => void;
};

export function SupersetPickerSheet({
  visible,
  onClose,
  currentExerciseIndex,
  currentExerciseName,
  exercises,
  onSelectTarget,
}: SupersetPickerSheetProps) {
  const currentExercise = exercises[currentExerciseIndex];
  const currentTheme = getSupersetTheme(currentExercise?.superset_id);
  const nextLetter = getNextAvailableSupersetLetter(exercises);

  const eligibleExercises = exercises
    .map((entry, index) => ({ entry, index }))
    .filter(({ index }) => index !== currentExerciseIndex);

  // ─── Profil sayfasındaki sürükle-bırak animasyon yapısı ───
  const estimatedSheetHeight = 460;
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
        {/* Yarı saydam arka plan (tıklayınca akıcı kapanır) */}
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable style={styles.modalBackdropTapInner} onPress={closeSheet} />
        </Animated.View>

        {/* Sürüklenebilir Alt Pano */}
        <Animated.View
          style={[
            styles.sheet,
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
          {/* Sürükleme esnasında alt boşluğu gizleyen uzantı */}
          <View style={styles.sheetBottomExtension} />

          {/* Sürükleme Tutamaç Alanı */}
          <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
            <View
              style={[
                styles.handle,
                currentTheme ? { backgroundColor: currentTheme.primary } : null,
              ]}
            />
          </View>

          {/* Başlık ve Hedef Bilgisi (Sürüklenebilir Alan - X Butonu Kaldırıldı) */}
          <View {...panResponder.panHandlers} style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Süperset Ekle</Text>
              <Text style={styles.dragHint}>Kapatmak için aşağı kaydırın</Text>
            </View>

            {/* Seçili Hareket Bilgi Kartı (Yazıların üst üste binmesini önleyen özel kutu) */}
            <View style={styles.targetCard}>
              <Text style={styles.targetLabel}>Eşleştirilecek Hareket</Text>
              <View style={styles.targetContentRow}>
                <Text style={styles.targetName} numberOfLines={1} ellipsizeMode="tail">
                  {currentExerciseName}
                </Text>
                {currentTheme && (
                  <View
                    style={[
                      styles.targetThemeBadge,
                      {
                        borderColor: currentTheme.border,
                        backgroundColor: currentTheme.bg,
                      },
                    ]}
                  >
                    <Text style={[styles.targetThemeText, { color: currentTheme.text }]}>
                      {currentTheme.label}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Egzersiz Listesi (Asla taşma yapmayacak esnek ve kısıtlı flexbox yapısı) */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {eligibleExercises.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Başka egzersiz bulunamadı</Text>
                <Text style={styles.emptyDesc}>
                  Süperset oluşturmak için antrenmanınıza en az bir hareket daha eklemelisiniz.
                </Text>
              </View>
            ) : (
              eligibleExercises.map(({ entry, index }) => {
                const entryTheme = getSupersetTheme(entry.superset_id);

                // Buton metni ve rengi (Kısa, net ve taşmayan metinler)
                let buttonText = `+ Süperset ${nextLetter}`;
                let buttonBorderColor = '#EC4899';
                let buttonBg = 'rgba(236, 72, 153, 0.16)';
                let buttonTextColor = '#F472B6';

                if (entryTheme) {
                  // Hedef hareket zaten bir süperset grubundaysa (örn. A)
                  buttonText = `+ Grup ${entryTheme.letter}'ya Kat`;
                  buttonBorderColor = entryTheme.primary;
                  buttonBg = entryTheme.bg;
                  buttonTextColor = entryTheme.text;
                } else if (currentTheme) {
                  // Seçen hareket zaten süperset grubundaysa (örn. A)
                  buttonText = `+ Grup ${currentTheme.letter}'ya Ekle`;
                  buttonBorderColor = currentTheme.primary;
                  buttonBg = currentTheme.bg;
                  buttonTextColor = currentTheme.text;
                }

                return (
                  <TouchableOpacity
                    key={`${entry.exercise_id}-${index}`}
                    style={styles.exerciseItem}
                    onPress={() => {
                      onSelectTarget(index);
                      closeSheet();
                    }}
                    activeOpacity={0.75}
                  >
                    {/* Sol Kısım: GIF Çerçevesi + Hareket Adı + Rozetler */}
                    <View style={styles.itemLeft}>
                      {/* Boş Görsel/GIF Çerçevesi */}
                      <View
                        style={[
                          styles.thumbnailFrame,
                          entryTheme && { borderColor: entryTheme.border },
                        ]}
                      />

                      <View style={styles.infoCol}>
                        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
                          {entry.exercise_name}
                        </Text>
                        <View style={styles.metaRow}>
                          <View style={styles.muscleBadge}>
                            <Text style={styles.muscleText} numberOfLines={1}>
                              {entry.muscle_group}
                            </Text>
                          </View>
                          {entryTheme && (
                            <View
                              style={[
                                styles.alreadyBadge,
                                {
                                  borderColor: entryTheme.border,
                                  backgroundColor: entryTheme.bg,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.alreadyBadgeText,
                                  { color: entryTheme.text },
                                ]}
                                numberOfLines={1}
                              >
                                {entryTheme.label}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    {/* Sağ Kısım: Neon Çerçeveli Aksiyon Butonu (Asla ezilmeyen flexShrink: 0) */}
                    <View
                      style={[
                        styles.selectBtn,
                        {
                          borderColor: buttonBorderColor,
                          backgroundColor: buttonBg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectBtnText,
                          { color: buttonTextColor },
                        ]}
                        numberOfLines={1}
                      >
                        {buttonText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 7, 15, 0.78)',
  },
  modalBackdropTapInner: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    maxHeight: '82%',
    backgroundColor: '#0D111E',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.35)',
    borderBottomWidth: 0,
    paddingTop: 4,
    paddingBottom: 32,
    paddingHorizontal: Spacing.four,
  },
  sheetBottomExtension: {
    position: 'absolute',
    bottom: -1000,
    left: -1.5,
    right: -1.5,
    height: 1000,
    backgroundColor: '#0D111E',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(236, 72, 153, 0.35)',
  },
  modalDragHandleZone: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EC4899',
    alignSelf: 'center',
  },
  header: {
    paddingBottom: 10,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  dragHint: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  targetCard: {
    backgroundColor: '#101524',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 3,
  },
  targetLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  targetName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#F472B6',
  },
  targetThemeBadge: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    flexShrink: 0,
  },
  targetThemeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: 8,
    paddingBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 62,
  },
  itemLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginRight: 8,
  },
  thumbnailFrame: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#141829',
    borderWidth: 1.2,
    borderColor: 'rgba(236, 72, 153, 0.35)',
    flexShrink: 0,
  },
  infoCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    gap: 3,
  },
  name: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  muscleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  muscleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C084FC',
  },
  alreadyBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    flexShrink: 0,
  },
  alreadyBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  selectBtn: {
    flexShrink: 0,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  emptyBox: {
    paddingVertical: 28,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
