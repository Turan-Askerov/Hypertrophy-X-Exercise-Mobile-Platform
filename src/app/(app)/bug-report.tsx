import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path } from 'react-native-svg';

// ─── Renk Sabitleri (Cyber Dark Tasarım Dili) ───
const colors = {
  background: '#080B14',
  cardBg: '#101524',
  cardBgInner: '#0C101C',
  itemBg: '#121829',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Mor / Neon Violet
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.35)',

  // Cyan
  cyan: '#38BDF8',
  cyanLight: '#7DD3FC',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
  cyanBorder: 'rgba(56, 189, 248, 0.35)',

  // Emerald
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',

  // Kırmızı / Rose
  danger: '#EF4444',
  roseBg: 'rgba(239, 68, 68, 0.14)',
  roseBorder: 'rgba(239, 68, 68, 0.35)',
};

// ─── İkon Bileşenleri ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function ChevronRightIcon({ color = colors.cyan, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function CloseIcon({ size = 14, color = '#EF4444' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M6 18L18 6M6 6l12 12" />
    </Svg>
  );
}

function HelpQuestionIcon({ size = 20, color = colors.cyan }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01"
      />
    </Svg>
  );
}

// ─── Sıkça Sorulan Sorular Verisi ───
const FAQ_ITEMS = [
  {
    q: 'Egzersizlerim ve antrenmanlarım senkronize olmuyor ne yapmalıyım?',
    a: 'Profil sayfasından çıkış yapmadan önce internet bağlantınızı kontrol edin. Ayarlar > Eşitleme sekmesinden manuel eşitlemeyi tetikleyebilir veya uygulamayı tamamen kapatıp yeniden açabilirsiniz.',
  },
  {
    q: 'Ağırlık ve tekrar geçmişim yanlış görünüyor?',
    a: 'Önbellek uyumsuzluklarında son yaptığınız setler yerel depolamada saklanır. Çevrimdışı kayıtlar internete bağlandığınız ilk anda sunucuyla birleştirilir.',
  },
  {
    q: 'Canlı antrenman sayacı arka plandayken duruyor mu?',
    a: 'Uygulamamız arka planda sayaç takibini destekler. Pil tasarrufu kısıtlamalarının "Hypertrophy-X" için kısıtlamasız olarak ayarlandığından emin olun.',
  },
  {
    q: 'Fotoğraf veya video yüklerken hata alıyorum?',
    a: 'Yüklemek istediğiniz medyanın 25MB boyut sınırını aşmadığından ve galerinizin izinlerinin açık olduğundan emin olun.',
  },
];

// ─── Sürüklenebilir SSS Alt Panosu ───
function FAQBottomSheetModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const estimatedSheetHeight = 520;
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
      Animated.timing(translateY, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [backdropAnim, estimatedSheetHeight, sheetHeight, translateY]);

  const closeSheet = useCallback(
    (onFinished?: () => void) => {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: sheetHeight || estimatedSheetHeight,
          duration: 240,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start(() => {
        onClose();
        if (onFinished) onFinished();
      });
    },
    [backdropAnim, estimatedSheetHeight, onClose, sheetHeight, translateY]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 4,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dy > 0) {
            translateY.setValue(gestureState.dy);
            const progress = Math.max(0, 1 - gestureState.dy / 280);
            backdropAnim.setValue(progress);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dy > 70 || gestureState.vy > 0.4) {
            closeSheet();
          } else {
            Animated.parallel([
              Animated.spring(translateY, {
                toValue: 0,
                damping: 24,
                stiffness: 280,
                useNativeDriver: false,
              }),
              Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false,
              }),
            ]).start();
          }
        },
      }),
    [backdropAnim, closeSheet, translateY]
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => closeSheet()}
      onShow={openSheet}
      statusBarTranslucent
    >
      <View style={modalStyles.modalRootContainer}>
        <Animated.View
          style={[
            modalStyles.modalBackdropTap,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
              }),
            },
          ]}
        >
          <Pressable style={modalStyles.modalBackdropTapInner} onPress={() => closeSheet()} />
        </Animated.View>

        <Animated.View
          style={[
            modalStyles.modalContent,
            {
              transform: [{ translateY }],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 10) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükleme Tutamacı & Başlık */}
          <View {...panResponder.panHandlers} style={modalStyles.dragZone}>
            <View style={modalStyles.handleBar} />
            <View style={modalStyles.modalHeaderRow}>
              <View style={modalStyles.titleWithIcon}>
                <HelpQuestionIcon size={18} color={colors.cyan} />
                <Text style={modalStyles.modalTitle}>Sıkça Sorulan Sorular</Text>
              </View>
              <TouchableOpacity
                style={modalStyles.closeBtnRed}
                onPress={() => closeSheet()}
                activeOpacity={0.7}
                hitSlop={10}
              >
                <CloseIcon size={14} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
            {FAQ_ITEMS.map((item, index) => (
              <View key={index} style={modalStyles.faqItemCard}>
                <Text style={modalStyles.faqQuestion}>{item.q}</Text>
                <Text style={modalStyles.faqAnswer}>{item.a}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={modalStyles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── ANA BİLEŞEN: Hata Raporu (Adım 1) ───
export default function BugReportScreen() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [faqModalVisible, setFaqModalVisible] = useState(false);

  const handleNext = () => {
    if (!description.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen karşılaştığınız hatayı kısaca tarif edin.');
      return;
    }

    Keyboard.dismiss();
    router.push({
      pathname: '/(app)/bug-report-details' as any,
      params: { description: description.trim() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Üst Başlık Barı (Hevy tarzı: Geri - Başlık - Sonraki Butonu) */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={12}
        >
          <BackIcon size={22} color="#F8FAFC" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Hata Raporu</Text>

        <TouchableOpacity
          style={[
            styles.headerNextBtn,
            !description.trim() && styles.headerNextBtnDisabled,
          ]}
          onPress={handleNext}
          activeOpacity={0.7}
          disabled={!description.trim()}
          hitSlop={8}
        >
          <Text
            style={[
              styles.headerNextText,
              !description.trim() && styles.headerNextTextDisabled,
            ]}
          >
            Sonraki
          </Text>
        </TouchableOpacity>
      </View>

      {/* Adım İlerleme Çizgisi (Adım 1: %50 İlerleme) */}
      <View style={styles.progressBarTrack}>
        <View style={styles.progressBarFill} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.body}>
            {/* Geniş Metin Giriş Alanı */}
            <View style={styles.inputCard}>
              <TextInput
                style={styles.textArea}
                multiline
                placeholder="Bulduğunuz hataları bildirin..."
                placeholderTextColor={colors.textDim}
                value={description}
                onChangeText={setDescription}
                maxLength={1200}
                textAlignVertical="top"
                selectionColor={colors.purple}
                autoFocus
              />
              <View style={styles.charCounterRow}>
                <Text style={styles.charCounterText}>
                  {description.length} / 1200
                </Text>
              </View>
            </View>

            {/* Alt Kısım: Sıkça Sorulan Sorular Bağlantı Çubuğu (Hevy Görselindeki gibi) */}
            <TouchableOpacity
              style={styles.faqLinkRow}
              activeOpacity={0.75}
              onPress={() => setFaqModalVisible(true)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.faqLinkTitle}>Sıkça Sorulan Sorular</Text>
                <Text style={styles.faqLinkSubtitle}>Sorunuza hemen yanıt alın.</Text>
              </View>
              <ChevronRightIcon size={18} color={colors.cyan} />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* SSS Alt Panosu */}
      <FAQBottomSheetModal
        visible={faqModalVisible}
        onClose={() => setFaqModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerRow: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerBackBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  headerNextBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
  },
  headerNextBtnDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    opacity: 0.4,
  },
  headerNextText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.purpleLight,
  },
  headerNextTextDisabled: {
    color: colors.textDim,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    width: '50%',
    backgroundColor: colors.purple,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  inputCard: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  charCounterRow: {
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.04)',
  },
  charCounterText: {
    fontSize: 12,
    color: colors.textDim,
    fontWeight: '600',
  },
  faqLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  faqLinkTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.cyanLight,
    marginBottom: 2,
  },
  faqLinkSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

const modalStyles = StyleSheet.create({
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
  },
  modalBackdropTapInner: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '80%',
  },
  dragZone: {
    paddingTop: 12,
    paddingBottom: 14,
    alignItems: 'center',
  },
  handleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginBottom: 14,
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  closeBtnRed: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.roseBg,
    borderWidth: 1,
    borderColor: colors.roseBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faqItemCard: {
    backgroundColor: colors.cardBgInner,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.cyanLight,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  sheetBottomExtension: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -1000,
    height: 1000,
    backgroundColor: colors.cardBg,
  },
});
