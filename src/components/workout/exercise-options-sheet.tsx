import React from 'react';
import {
  Modal,
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
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          {/* Üst Tutamaç */}
          <View style={styles.handle} />

          {/* Kart Başlığı */}
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

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Seçenekler Listesi */}
          <View style={styles.optionsList}>
            {/* 1. Egzersizleri Yeniden Sırala */}
            <TouchableOpacity
              style={styles.optionItem}
              onPress={() => {
                onClose();
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
                onClose();
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
                  onClose();
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
                  onClose();
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
                onClose();
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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(4, 7, 15, 0.75)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#0D111E',
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderBottomWidth: 0,
    paddingTop: 12,
    paddingBottom: 32,
    paddingHorizontal: Spacing.four,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleArea: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
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
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  optionsList: {
    gap: 6,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  removeOptionItem: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1.2,
  },
  reorderCircle: {
    backgroundColor: 'rgba(139, 92, 246, 0.14)',
    borderColor: 'rgba(139, 92, 246, 0.4)',
  },
  reorderIcon: {
    fontSize: 16,
    color: '#C084FC',
    fontWeight: '800',
  },
  replaceCircle: {
    backgroundColor: 'rgba(6, 182, 212, 0.14)',
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  replaceIcon: {
    fontSize: 14,
    color: '#22D3EE',
  },
  supersetCircle: {
    backgroundColor: 'rgba(236, 72, 153, 0.14)',
    borderColor: 'rgba(236, 72, 153, 0.4)',
  },
  supersetIcon: {
    fontSize: 16,
    color: '#F472B6',
    fontWeight: '800',
  },
  removeCircle: {
    backgroundColor: 'rgba(239, 68, 68, 0.14)',
    borderColor: 'rgba(239, 68, 68, 0.45)',
  },
  removeIcon: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '800',
  },
  optionTextCol: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  removeLabel: {
    color: '#F87171',
  },
  optionDesc: {
    fontSize: 11,
    color: '#94A3B8',
  },
  chevron: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '700',
    paddingLeft: 8,
  },
  removeChevron: {
    color: '#EF4444',
  },
});
