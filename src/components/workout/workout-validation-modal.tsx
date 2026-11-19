import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export type WorkoutValidationModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  showCancel?: boolean;
  cancelLabel?: string;
  type?: 'warning' | 'info';
};

function AlertExclamationIcon({ size = 26, color = '#F59E0B' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" stroke={color} />
      <Line x1="12" y1="8" x2="12" y2="12.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="12" cy="16.2" r="1.1" fill={color} />
    </Svg>
  );
}

function DumbbellAlertIcon({ size = 26, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"
      />
      <Circle cx="12" cy="12" r="2.5" fill={color} />
    </Svg>
  );
}

export function WorkoutValidationModal({
  visible,
  onClose,
  title,
  message,
  actionLabel = 'Tamam',
  onAction,
  showCancel = false,
  cancelLabel = 'Vazgeç',
  type = 'warning',
}: WorkoutValidationModalProps) {
  const isDumbbell = title.toLowerCase().includes('egzersiz') || title.toLowerCase().includes('hareket');
  const accentColor = isDumbbell ? '#C084FC' : '#F59E0B';
  const circleBorder = isDumbbell ? '#A855F7' : '#F59E0B';
  const circleBg = isDumbbell ? 'rgba(168, 85, 247, 0.16)' : 'rgba(245, 158, 11, 0.16)';
  const cardBorder = isDumbbell ? 'rgba(168, 85, 247, 0.55)' : 'rgba(245, 158, 11, 0.55)';
  const btnBorder = isDumbbell ? '#A855F7' : '#F59E0B';
  const btnBg = isDumbbell ? 'rgba(168, 85, 247, 0.18)' : 'rgba(245, 158, 11, 0.18)';
  const btnText = isDumbbell ? '#E9D5FF' : '#FDE68A';

  const handlePressAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[styles.card, { borderColor: cardBorder }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Neon İkon Yuvarlağı */}
          <View style={[styles.iconCircle, { backgroundColor: circleBg, borderColor: circleBorder }]}>
            {isDumbbell ? (
              <DumbbellAlertIcon size={26} color={accentColor} />
            ) : (
              <AlertExclamationIcon size={26} color={accentColor} />
            )}
          </View>

          {/* Başlık ve Mesaj */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Şık Neon Buton Alanı */}
          <View style={styles.btnRow}>
            {showCancel && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>{cancelLabel}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.neonBtn,
                { borderColor: btnBorder, backgroundColor: btnBg },
                showCancel ? { flex: 1.6 } : { width: '100%' },
              ]}
              onPress={handlePressAction}
              activeOpacity={0.75}
            >
              <Text style={[styles.neonBtnText, { color: btnText }]}>
                {actionLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 330,
    backgroundColor: '#0D111E',
    borderRadius: 20,
    borderWidth: 1.8,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  neonBtn: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonBtnText: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
