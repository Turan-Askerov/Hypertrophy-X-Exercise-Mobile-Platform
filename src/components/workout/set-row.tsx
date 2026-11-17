import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { AppColors, Colors, Radius, Typography } from '@/constants/theme';
import type { SetData } from '@/types/workout';

export type SetRowProps = {
  index: number;
  set: SetData;
  isBodyweight: boolean;
  onChange: (updated: SetData) => void;
  onDelete: () => void;
  onAddSet?: () => void;
  onComplete?: () => void;
};

const RIR_OPTIONS = [
  { label: '—', desc: 'Belirtilmedi', value: null },
  { label: '0', desc: '0 RIR (Tam Tükeniş)', value: 0 },
  { label: '1', desc: '1 RIR (1 tekrar kala)', value: 1 },
  { label: '2', desc: '2 RIR (2 tekrar kala)', value: 2 },
  { label: '3', desc: '3+ RIR (3 veya daha fazla)', value: 3 },
];

export const SetRow = React.memo(function SetRow({
  index,
  set,
  isBodyweight: _isBodyweight,
  onChange,
  onDelete,
  onAddSet,
  onComplete,
}: SetRowProps) {
  const [rirModalOpen, setRirModalOpen] = useState(false);

  const handleWeightChange = (text: string) => {
    const clean = text.replace(',', '.');
    const val = parseFloat(clean);
    onChange({
      ...set,
      weight_kg: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  const handleRepsChange = (text: string) => {
    const val = parseInt(text, 10);
    onChange({
      ...set,
      reps: isNaN(val) ? 0 : Math.max(0, val),
    });
  };

  const handleSelectRir = (val: number | null) => {
    onChange({ ...set, rir: val });
    setRirModalOpen(false);
    if (onComplete) onComplete();
  };

  const isFirstRow = index === 0;

  return (
    <>
      <View style={styles.row}>
        {/* Sütun 1: SET (Pill Rozeti) */}
        <View style={styles.setCol}>
          <View style={styles.setBadge}>
            <Text style={styles.setBadgeText}>{index + 1}</Text>
          </View>
        </View>

        {/* Sütun 2: AĞIRLIK (KG) */}
        <View style={styles.weightCol}>
          <TextInput
            style={styles.cellInput}
            keyboardType="decimal-pad"
            value={set.weight_kg > 0 ? String(set.weight_kg) : ''}
            placeholder="0"
            placeholderTextColor={Colors.light.textSecondary}
            onChangeText={handleWeightChange}
          />
        </View>

        {/* Sütun 3: TEKRAR */}
        <View style={styles.repsCol}>
          <TextInput
            style={styles.cellInput}
            keyboardType="number-pad"
            value={set.reps > 0 ? String(set.reps) : ''}
            placeholder="0"
            placeholderTextColor={Colors.light.textSecondary}
            onChangeText={handleRepsChange}
          />
        </View>

        {/* Sütun 4: RIR Dropdown Seçici */}
        <View style={styles.rirCol}>
          <TouchableOpacity
            style={styles.rirSelectBox}
            onPress={() => setRirModalOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.rirText}>
              {set.rir !== null && set.rir !== undefined ? String(set.rir) : '—'}
            </Text>
            <Text style={styles.rirArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Sütun 5: İŞLEM (İlk satırda [+ Set], sonraki satırlarda [✕] Sil) */}
        <View style={styles.actionCol}>
          {isFirstRow ? (
            <TouchableOpacity
              style={styles.addSetRowBtn}
              onPress={onAddSet}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.addSetRowText}>+ Set</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.deleteSetRowBtn}
              onPress={onDelete}
              activeOpacity={0.7}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.deleteSetRowText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* RIR Seçim Modalı */}
      <Modal
        visible={rirModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setRirModalOpen(false)}
      >
        <TouchableWithoutFeedback onPress={() => setRirModalOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>RIR Seçimi</Text>
                  <Text style={styles.modalSubtitle}>Kalan Tekrar Sayısı</Text>
                </View>

                <View style={styles.modalOptions}>
                  {RIR_OPTIONS.map((opt) => {
                    const isSelected = set.rir === opt.value;
                    return (
                      <TouchableOpacity
                        key={String(opt.value)}
                        style={[
                          styles.modalOptionItem,
                          isSelected && styles.modalOptionSelected,
                        ]}
                        onPress={() => handleSelectRir(opt.value)}
                      >
                        <View style={styles.modalOptionBadge}>
                          <Text
                            style={[
                              styles.modalOptionBadgeText,
                              isSelected && styles.modalOptionBadgeTextSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.modalOptionDesc,
                            isSelected && styles.modalOptionDescSelected,
                          ]}
                        >
                          {opt.desc}
                        </Text>
                        {isSelected && (
                          <Text style={styles.modalOptionCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setRirModalOpen(false)}
                >
                  <Text style={styles.modalCloseText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  setCol: {
    width: '12%',
    alignItems: 'flex-start',
  },
  setBadge: {
    width: 24,
    height: 24,
    borderRadius: 7,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  weightCol: {
    width: '26%',
    paddingHorizontal: 3,
  },
  repsCol: {
    width: '24%',
    paddingHorizontal: 3,
  },
  rirCol: {
    width: '18%',
    paddingHorizontal: 3,
  },
  actionCol: {
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInput: {
    backgroundColor: '#0F1528',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderRadius: Radius.md,
    height: 38,
    paddingHorizontal: 6,
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.label,
    textAlign: 'center',
  },
  rirSelectBox: {
    backgroundColor: '#0F1528',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    borderRadius: Radius.md,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  rirText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  rirArrow: {
    fontSize: 10,
    color: AppColors.muted,
  },
  addSetRowBtn: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderWidth: 1.6,
    borderColor: '#06B6D4', // Neon Cyan Çerçeve
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetRowText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.2,
  },
  deleteSetRowBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.6,
    borderColor: '#EF4444', // Neon Kırmızı Çerçeve
    borderRadius: 10,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteSetRowText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F87171',
  },

  // Modal Stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#0F1528',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    padding: 20,
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 12,
    color: AppColors.muted,
    marginTop: 2,
  },
  modalOptions: {
    gap: 8,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.16)',
    borderColor: 'rgba(139, 92, 246, 0.45)',
  },
  modalOptionBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D8B4FE',
  },
  modalOptionBadgeTextSelected: {
    color: '#FFFFFF',
  },
  modalOptionDesc: {
    flex: 1,
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalOptionDescSelected: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  modalOptionCheck: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '800',
  },
  modalCloseBtn: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
