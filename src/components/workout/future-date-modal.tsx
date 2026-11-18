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

export type FutureDateModalProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

function AlertCalendarIcon({ size = 26, color = '#C084FC' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
      <Line x1="12" y1="13" x2="12" y2="15.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      <Circle cx="12" cy="18" r="0.9" fill={color} />
    </Svg>
  );
}

export function FutureDateModal({
  visible,
  onClose,
  title = 'Geçersiz Tarih',
  message = 'Gelecek bir tarih için antrenman kaydı oluşturulamaz. Lütfen bugün veya geçmiş bir tarih seçin.',
}: FutureDateModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {/* Neon İkon Kutusu */}
          <View style={styles.iconCircle}>
            <AlertCalendarIcon size={26} color="#C084FC" />
          </View>

          {/* Başlık ve Açıklama */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {/* Şık Neon TAMAM Butonu */}
          <TouchableOpacity
            style={styles.neonBtn}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Text style={styles.neonBtnText}>TAMAM</Text>
          </TouchableOpacity>
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
    borderColor: 'rgba(168, 85, 247, 0.55)',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(168, 85, 247, 0.16)',
    borderWidth: 1.8,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    color: '#F8FAFC',
    textAlign: 'center',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  message: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
    paddingHorizontal: 8,
  },
  neonBtn: {
    width: '100%',
    height: 46,
    borderRadius: 13,
    backgroundColor: 'rgba(168, 85, 247, 0.22)',
    borderWidth: 2,
    borderColor: '#C084FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#E9D5FF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
