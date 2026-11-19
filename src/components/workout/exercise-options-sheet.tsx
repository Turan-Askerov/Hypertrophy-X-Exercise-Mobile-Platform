import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import type { SupersetTheme } from '@/constants/superset';

export type ExerciseOptionsSheetProps = {
  visible: boolean;
  exerciseName: string;
  muscleGroup: string;
  isSuperset?: boolean;
  supersetTheme?: SupersetTheme | null;
  onClose: () => void;
  onReorder: () => void;
  onReplace: () => void;
  onAddSuperset: () => void;
  onRemoveSuperset?: () => void;
  onRemove: () => void;
};

export function ExerciseOptionsSheet({
  visible,
  exerciseName,
  muscleGroup,
  isSuperset = false,
  supersetTheme,
  onClose,
  onReorder,
  onReplace,
  onAddSuperset,
  onRemoveSuperset,
  onRemove,
}: ExerciseOptionsSheetProps) {
  const estimatedSheetHeight = 420;
  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));

  const openSheet = useCallback(() => {
    translateY.setValue(estimatedSheetHeight);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 24,
        mass: 0.8,
        stiffness: 260,
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, translateY]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: estimatedSheetHeight,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(() => {
      onClose();
    });
  }, [backdropAnim, estimatedSheetHeight, onClose, translateY]);

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
            const fade = Math.max(0.2, 1 - gestureState.dy / (estimatedSheetHeight * 1.1));
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
    [backdropAnim, closeSheet, estimatedSheetHeight, translateY]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Sürüklenebilir Tutamaç ve Başlık Alanı (PanResponder) */}
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />

            {/* Kart Başlığı (Kapatma X Butonu Kaldırıldı) */}
            <View style={styles.header}>
              <View style={styles.titleArea}>
                <Text style={styles.exerciseName} numberOfLines={1}>
                  {exerciseName}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={styles.muscleBadge}>
                    <Text style={styles.muscleText}>{muscleGroup}</Text>
                  </View>
                  {isSuperset && (
                    <View
                      style={[
                        styles.supersetBadge,
                        supersetTheme && {
                          borderColor: supersetTheme.border,
                          backgroundColor: supersetTheme.bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.supersetText,
                          supersetTheme && { color: supersetTheme.text },
                        ]}
                      >
                        {supersetTheme?.label ?? 'SÜPERSET'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Seçenekler Listesi */}
          <View style={styles.optionsList}>
            {/* 1. Egzersizleri Yeniden Sırala */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                closeSheet();
                onReorder();
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, styles.reorderCircle]}>
                <Text style={styles.reorderIcon}>⇅</Text>
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionLabel}>Egzersizleri yeniden sırala</Text>
                <Text style={styles.optionDesc}>Antrenmandaki hareket sırasını düzenle</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* 2. Egzersizi Değiştir */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                closeSheet();
                onReplace();
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, styles.replaceCircle]}>
                <Text style={styles.replaceIcon}>🔄</Text>
              </View>
              <View style={styles.optionTextCol}>
                <Text style={styles.optionLabel}>Egzersizi değiştir</Text>
                <Text style={styles.optionDesc}>Farklı bir hareketle yer değiştir (setler sıfırlanır)</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>

            {/* 3. Süperset Ekle / Kaldır */}
            {isSuperset ? (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  closeSheet();
                  onRemoveSuperset?.();
                }}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.iconCircle,
                    styles.supersetCircle,
                    supersetTheme && {
                      borderColor: supersetTheme.border,
                      backgroundColor: supersetTheme.bg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.supersetIcon,
                      supersetTheme && { color: supersetTheme.text },
                    ]}
                  >
                    ✕
                  </Text>
                </View>
                <View style={styles.optionTextCol}>
                  <Text
                    style={[
                      styles.optionLabel,
                      supersetTheme && { color: supersetTheme.text },
                    ]}
                  >
                    {supersetTheme?.label ?? 'Süperseti'} kaldır
                  </Text>
                  <Text style={styles.optionDesc}>Bu hareketin süperset bağını çöz</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  closeSheet();
                  onAddSuperset();
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.iconCircle, styles.supersetCircle]}>
                  <Text style={styles.supersetIcon}>＋</Text>
                </View>
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionLabel}>Süperset ekle</Text>
                  <Text style={styles.optionDesc}>Başka bir hareketle süperset olarak bağla</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}

            {/* 4. Egzersizi Kaldır */}
            <TouchableOpacity
              style={[styles.optionItem, styles.removeOptionItem]}
              onPress={() => {
                closeSheet();
                onRemove();
              }}
              activeOpacity={0.75}
            >
              <View style={[styles.iconCircle, styles.removeCircle]}>
                <Text style={styles.removeIcon}>✕</Text>
              </View>
              <View style={styles.optionTextCol}>
                <Text style={[styles.optionLabel, styles.removeLabel]}>Egzersizi kaldır</Text>
                <Text style={styles.optionDesc}>Bu hareketi antrenmandan sil</Text>
              </View>
              <Text style={[styles.chevron, styles.removeChevron]}>›</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(4, 7, 15, 0.75)',
  },
  sheet: {
    backgroundColor: '#0D111E',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderBottomWidth: 0,
    paddingTop: 8,
    paddingBottom: 72,
    marginBottom: -40,
    paddingHorizontal: Spacing.four,
  },
  dragArea: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleArea: {
    flex: 1,
    gap: 4,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  muscleBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  muscleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#C084FC',
  },
  supersetBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  supersetText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F472B6',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#101524',
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  removeOptionItem: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  reorderCircle: {
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  reorderIcon: {
    fontSize: 18,
    color: '#C084FC',
    fontWeight: '800',
  },
  replaceCircle: {
    backgroundColor: 'rgba(14, 165, 233, 0.18)',
    borderColor: 'rgba(14, 165, 233, 0.4)',
  },
  replaceIcon: {
    fontSize: 16,
  },
  supersetCircle: {
    backgroundColor: 'rgba(236, 72, 153, 0.18)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  supersetIcon: {
    fontSize: 16,
    color: '#F472B6',
    fontWeight: '800',
  },
  removeCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  removeIcon: {
    fontSize: 14,
    color: '#F87171',
    fontWeight: '900',
  },
  optionTextCol: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  removeLabel: {
    color: '#F87171',
    fontWeight: '800',
  },
  optionDesc: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chevron: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  removeChevron: {
    color: '#EF4444',
  },
});
