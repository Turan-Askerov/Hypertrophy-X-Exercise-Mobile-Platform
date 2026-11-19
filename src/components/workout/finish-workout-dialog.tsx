import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { formatDurationHuman } from '@/components/workout/workout-timer-bar';
import { AppColors, Spacing } from '@/constants/theme';
import { formatVolume } from '@/lib/volume';

export type FinishWorkoutDialogProps = {
  visible: boolean;
  durationSeconds: number;
  exerciseCount: number;
  totalSetsCount: number;
  totalVolume: number;
  note?: string;
  gymName?: string | null;
  onPressGym?: () => void;
  isSaving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function FinishWorkoutDialog({
  visible,
  durationSeconds,
  exerciseCount,
  totalSetsCount,
  totalVolume,
  note,
  gymName,
  onPressGym,
  isSaving,
  onConfirm,
  onCancel,
}: FinishWorkoutDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isSaving ? undefined : onCancel}
    >
      <TouchableWithoutFeedback onPress={isSaving ? undefined : onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              {/* Başlık (İkonsuz) */}
              <View style={styles.header}>
                <Text style={styles.title}>Antrenmanı Bitir</Text>
                <Text style={styles.subtitle}>Veritabanına Kaydetme Onayı</Text>
              </View>

              <View style={styles.divider} />

              {/* Antrenman Özeti Kartı */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Antrenman Süresi:</Text>
                  <Text style={styles.summaryValueHighlight}>
                    {formatDurationHuman(durationSeconds)}
                  </Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Egzersiz & Set:</Text>
                  <Text style={styles.summaryValue}>
                    {exerciseCount} hareket, {totalSetsCount} set
                  </Text>
                </View>

                {totalVolume > 0 && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Toplam Hacim:</Text>
                    <Text style={styles.summaryValue}>
                      {formatVolume(totalVolume)}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Salon:</Text>
                  {onPressGym ? (
                    <TouchableOpacity onPress={onPressGym} activeOpacity={0.7}>
                      <Text style={styles.summaryValueGym}>
                        📍 {gymName || 'Belirtilmedi'} ▾
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.summaryValue}>
                      📍 {gymName || 'Belirtilmedi'}
                    </Text>
                  )}
                </View>

                {note ? (
                  <View style={styles.noteItem}>
                    <Text style={styles.summaryLabel}>Günün Notu:</Text>
                    <Text style={styles.noteText} numberOfLines={2}>
                      &ldquo;{note}&rdquo;
                    </Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.desc}>
                Antrenmanı tamamlayıp kaydettikten sonra geçmiş sayfanız ve grafikleriniz otomatik olarak güncellenecektir.
              </Text>

              {/* Aksiyon Butonları (Neon Çerçeveli, İkonsuz) */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelText}>Vazgeç</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.confirmButton]}
                  onPress={onConfirm}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#34D399" />
                  ) : (
                    <Text style={styles.confirmText}>Bitir ve Kaydet</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#0F1528',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    padding: 22,
  },
  header: {
    gap: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: AppColors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 14,
  },
  summaryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 12,
    gap: 8,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12.5,
    color: AppColors.muted,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  summaryValueGym: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C084FC',
  },
  summaryValueHighlight: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#34D399',
  },
  noteItem: {
    gap: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  noteText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },
  desc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Neon Çerçeveli İkonsuz Butonlar
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    minWidth: 85,
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  confirmButton: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1.6,
    borderColor: '#10B981', // Neon Yeşil Çerçeve
    flex: 1,
  },
  confirmText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: -0.1,
  },
});
