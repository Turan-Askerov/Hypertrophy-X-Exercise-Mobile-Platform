import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';

export type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Evet',
  cancelText = 'Vazgeç',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={busy ? undefined : onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={busy}
                >
                  <Text style={styles.cancelText}>{cancelText}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    destructive ? styles.destructiveButton : styles.confirmButton,
                  ]}
                  onPress={onConfirm}
                  disabled={busy}
                >
                  {busy ? (
                    <ActivityIndicator
                      size="small"
                      color={destructive ? '#fff' : '#fff'}
                    />
                  ) : (
                    <Text style={styles.confirmText}>{confirmText}</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.light.background,
    borderRadius: Radius.lg,
    padding: Spacing.four,
    gap: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.light.text,
  },
  message: {
    fontSize: Typography.body,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
  button: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.sm,
    minWidth: 84,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.light.backgroundElement,
  },
  cancelText: {
    fontSize: Typography.label,
    fontWeight: '600',
    color: Colors.light.text,
  },
  confirmButton: {
    backgroundColor: AppColors.primary,
  },
  destructiveButton: {
    backgroundColor: AppColors.danger,
  },
  confirmText: {
    fontSize: Typography.label,
    fontWeight: '600',
    color: '#fff',
  },
});
