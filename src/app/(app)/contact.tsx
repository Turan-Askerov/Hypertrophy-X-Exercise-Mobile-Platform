import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
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
  cardBorderHover: 'rgba(139, 92, 246, 0.35)',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  textDim: '#64748B',

  // Sarı / Neon Sarısı
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.3)',

  // Yeşil / Emerald
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',

  // Kırmızı / Rose
  rose: '#F43F5E',
  roseLight: '#FB7185',
  roseBg: 'rgba(244, 63, 94, 0.14)',
  roseBorder: 'rgba(244, 63, 94, 0.35)',
  danger: '#EF4444',

  // Cyan
  cyan: '#38BDF8',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
};

// ─── İkon Bileşenleri ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
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

function ChevronRightIcon({ color = colors.textDim, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function FeatureRequestIcon({ color = colors.amberLight, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    </Svg>
  );
}

function BugIcon({ color = colors.roseLight, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
      />
      <Circle cx="12" cy="7" r="1" fill={color} />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l-3 1m3-4L2 9m17 4l3 1m-3-4l3-1" />
    </Svg>
  );
}

function HelpIcon({ color = colors.emeraldLight, size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="9" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01" />
    </Svg>
  );
}

// ─── Otomatik Dinamik Klavye Kaydırma Hesaplama Fonksiyonu ───
function calculateAutoKeyboardShift(params: {
  keyboardScreenY?: number;
  keyboardHeight: number;
  containerLayoutY: number;
  containerHeight: number;
  sheetHeight: number;
  statusBarInset?: number;
}): number {
  const {
    keyboardScreenY = 0,
    keyboardHeight,
    containerLayoutY,
    containerHeight,
    sheetHeight,
    statusBarInset = 44,
  } = params;

  if (keyboardHeight <= 0) return 0;

  const screenH = Dimensions.get('screen').height;
  const windowH = Dimensions.get('window').height;
  const baseScreenHeight = Math.max(screenH, windowH);

  // 1. Android / Sistem Otomatik Boyutlandırma Kontrolü
  const isAlreadyResizedBySystem = containerHeight <= baseScreenHeight - (keyboardHeight * 0.7);
  if (isAlreadyResizedBySystem) {
    return 0;
  }

  // 2. Ekran Geometrisi
  const actualKeyboardTop =
    keyboardScreenY > 0 && keyboardScreenY < baseScreenHeight
      ? keyboardScreenY
      : baseScreenHeight - keyboardHeight;

  const containerScreenBottom = containerLayoutY + containerHeight;
  const overlap = Math.max(0, containerScreenBottom - actualKeyboardTop);
  if (overlap <= 0) return 0;

  // 3. Tavan Güvenliği
  const maxAllowedShift = Math.max(0, containerHeight - sheetHeight - statusBarInset);
  return Math.min(overlap, maxAllowedShift);
}

// ─── Sürüklenebilir Genel Geri Bildirim Alt Panosu ───
function FeedbackBottomSheetModal({
  visible,
  onClose,
  title,
  subtitle,
  icon,
  placeholder,
  accentColor = colors.amberLight,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  placeholder: string;
  accentColor?: string;
  onSubmit: (text: string) => Promise<void> | void;
}) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kapsayıcı render yüksekliği ve konumu
  const [containerHeight, setContainerHeight] = useState(() => Dimensions.get('window').height);
  const [containerLayoutY, setContainerLayoutY] = useState(0);

  const estimatedSheetHeight = 440;
  const [sheetHeight, setSheetHeight] = useState(estimatedSheetHeight);

  const [translateY] = useState(() => new Animated.Value(estimatedSheetHeight));
  const [backdropAnim] = useState(() => new Animated.Value(0));
  const [keyboardShiftAnim] = useState(() => new Animated.Value(0));

  const combinedTranslateY = useMemo(
    () => Animated.subtract(translateY, keyboardShiftAnim),
    [translateY, keyboardShiftAnim]
  );

  const openSheet = useCallback(() => {
    translateY.setValue(sheetHeight || estimatedSheetHeight);
    backdropAnim.setValue(0);
    keyboardShiftAnim.setValue(0);

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
  }, [backdropAnim, estimatedSheetHeight, keyboardShiftAnim, sheetHeight, translateY]);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();

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
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setText('');
        keyboardShiftAnim.setValue(0);
        onClose();
      }
    });
  }, [backdropAnim, estimatedSheetHeight, keyboardShiftAnim, onClose, sheetHeight, translateY]);

  useEffect(() => {
    if (visible) {
      openSheet();
    }
  }, [visible, openSheet]);

  // Klavye Dinamik Takipçi & Otomatik Hesaplama (Klavye Açıldığında Panoyu Klavyenin Üzerine Taşır)
  useEffect(() => {
    if (!visible) {
      keyboardShiftAnim.setValue(0);
      return;
    }

    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const kHeight = e?.endCoordinates?.height || 0;
      const kScreenY = e?.endCoordinates?.screenY;
      const duration = e?.duration || 220;

      const targetShift = calculateAutoKeyboardShift({
        keyboardScreenY: kScreenY,
        keyboardHeight: kHeight,
        containerLayoutY,
        containerHeight,
        sheetHeight,
        statusBarInset: 44,
      });

      Animated.timing(keyboardShiftAnim, {
        toValue: targetShift,
        duration: Platform.OS === 'ios' ? Math.max(160, duration) : 180,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    };

    const onHide = (e: any) => {
      const duration = e?.duration || 200;
      Animated.timing(keyboardShiftAnim, {
        toValue: 0,
        duration: Platform.OS === 'ios' ? Math.max(140, duration) : 180,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false,
      }).start();
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [containerHeight, containerLayoutY, keyboardShiftAnim, sheetHeight, visible]);

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
          Keyboard.dismiss();
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

  const handleSubmit = async () => {
    if (!text.trim()) {
      Alert.alert('Eksik Bilgi', 'Lütfen mesajınızı yazın.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(text.trim());
      setIsSubmitting(false);
      closeSheet();
    } catch {
      setIsSubmitting(false);
      Alert.alert('Hata', 'Gönderim sırasında bir sorun oluştu.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View
        style={styles.modalRootContainer}
        onLayout={(e) => {
          const h = e.nativeEvent.layout.height;
          const y = e.nativeEvent.layout.y;
          if (h > 0 && Math.abs(h - containerHeight) > 2) {
            setContainerHeight(h);
            setContainerLayoutY(y);
          }
        }}
      >
        {/* Karartılmış Arka Plan (Dokunulduğunda Kapatır) */}
        <Animated.View style={[styles.modalBackdrop, { opacity: backdropAnim }]}>
          <Pressable
            style={styles.modalBackdropTapInner}
            onPress={() => {
              Keyboard.dismiss();
              closeSheet();
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalSheet,
            {
              transform: [{ translateY: combinedTranslateY }],
            },
          ]}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && Math.abs(h - sheetHeight) > 2) {
              setSheetHeight(h);
            }
          }}
        >
          {/* Sürükleme Tutamaç Alanı */}
          <View {...panResponder.panHandlers} style={styles.modalDragHandleZone}>
            <View style={[styles.modalHandle, { backgroundColor: accentColor, shadowColor: accentColor }]} />
          </View>

          {/* Başlık Satırı */}
          <View style={styles.modalHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, paddingRight: 8 }}>
              <View style={[styles.modalHeaderIconWrap, { borderColor: `${accentColor}40`, backgroundColor: `${accentColor}18` }]}>
                {icon}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{title}</Text>
                <Text style={styles.modalDesc}>{subtitle}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.modalCloseButtonRed}
              onPress={() => {
                Keyboard.dismiss();
                closeSheet();
              }}
              hitSlop={10}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
            >
              <CloseIcon size={14} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Metin Giriş Alanı */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.feedbackInput}
              multiline
              numberOfLines={5}
              placeholder={placeholder}
              placeholderTextColor={colors.textDim}
              value={text}
              onChangeText={setText}
              maxLength={600}
              textAlignVertical="top"
              autoFocus
              keyboardAppearance="dark"
              selectionColor={accentColor}
            />
            <Text style={styles.charCounter}>{text.length} / 600</Text>
          </View>

          {/* Aksiyon Butonları */}
          <View style={styles.modalActionButtons}>
            <TouchableOpacity
              style={styles.neonCancelBtn}
              onPress={() => {
                Keyboard.dismiss();
                closeSheet();
              }}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <Text style={styles.neonCancelBtnText}>Vazgeç</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.neonSaveBtn,
                (!text.trim() || isSubmitting) && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.7}
              disabled={!text.trim() || isSubmitting}
            >
              <Text style={styles.neonSaveBtnText}>
                {isSubmitting ? 'Gönderiliyor...' : 'Gönder'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sonsuz Alt Uzantı Eteği */}
          <View style={styles.sheetBottomExtension} pointerEvents="none" />
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Bize Ulaşın Ana Ekranı ───
export default function ContactScreen() {
  const router = useRouter();

  // Aktif açılan alt pano durumu ('feature' | 'help' | null)
  const [activeModal, setActiveModal] = useState<'feature' | 'help' | null>(null);

  const handleFeatureSubmit = (text: string) => {
    Alert.alert(
      'Özellik İsteği Alındı',
      'Öneriniz geliştirici ekibimize iletildi. Katkınız için teşekkürler!',
      [{ text: 'Tamam' }]
    );
  };

  const handleHelpSubmit = (text: string) => {
    Alert.alert(
      'Mesajınız İletildi',
      'Destek talebiniz kaydedildi. En kısa sürede geri dönüş yapılacaktır.',
      [{ text: 'Tamam' }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Üst Başlık & Geri Dön Butonu */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={10}
        >
          <BackIcon size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bize Ulaşın</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Karşılama & Bilgilendirme Kartı */}
        <View style={styles.introCard}>
          <View style={styles.introGlow} />
          <Text style={styles.introTitle}>Hypertrophy-X Destek & Geri Bildirim</Text>
          <Text style={styles.introDesc}>
            Uygulamayı geliştirmemize yardımcı olmak, yeni bir özellik istemek veya yaşadığınız bir sorunu iletmek için aşağıdaki seçeneklerden birini belirleyin.
          </Text>
        </View>

        {/* 3 Seçenek Listesi */}
        <View style={styles.optionsWrap}>
          {/* 1. SEÇENEK: ÖZELLİK İSTEĞİ (Alt Panolu) */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.75}
            onPress={() => setActiveModal('feature')}
          >
            <View style={[styles.optionIconBox, { backgroundColor: colors.amberBg, borderColor: colors.amberBorder }]}>
              <FeatureRequestIcon size={22} color={colors.amberLight} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.optionTitle}>Özellik İsteği</Text>
                <View style={[styles.badge, { backgroundColor: colors.amberBg, borderColor: colors.amberBorder }]}>
                  <Text style={[styles.badgeText, { color: colors.amberLight }]}>Öneri</Text>
                </View>
              </View>
              <Text style={styles.optionDesc}>
                Uygulamada görmek istediğiniz yeni bir özellik veya egzersiz aracı önerin
              </Text>
            </View>
            <ChevronRightIcon color={colors.amberLight} size={18} />
          </TouchableOpacity>

          {/* 2. SEÇENEK: HATA RAPORU (Yeni Sayfaya Geçişli - Pano Yok) */}
          <TouchableOpacity
            style={[styles.optionCard, styles.optionCardBug]}
            activeOpacity={0.75}
            onPress={() => router.push('/(app)/bug-report' as any)}
          >
            <View style={[styles.optionIconBox, { backgroundColor: colors.roseBg, borderColor: colors.roseBorder }]}>
              <BugIcon size={22} color={colors.roseLight} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>Hata Raporu</Text>
                <View style={[styles.badge, { backgroundColor: colors.roseBg, borderColor: colors.roseBorder }]}>
                  <Text style={[styles.badgeText, { color: colors.roseLight }]}>Sorun Bildir</Text>
                </View>
              </View>
              <Text style={styles.optionDesc}>
                Karşılaştığınız teknik aksaklığı tarif edip adım adım hata bildirimi oluşturun
              </Text>
            </View>
            <ChevronRightIcon color={colors.roseLight} size={18} />
          </TouchableOpacity>

          {/* 3. SEÇENEK: YARDIM ALIN (Alt Panolu) */}
          <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.75}
            onPress={() => setActiveModal('help')}
          >
            <View style={[styles.optionIconBox, { backgroundColor: colors.emeraldBg, borderColor: colors.emeraldBorder }]}>
              <HelpIcon size={22} color={colors.emeraldLight} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.optionTitle}>Yardım Alın</Text>
                <View style={[styles.badge, { backgroundColor: colors.emeraldBg, borderColor: colors.emeraldBorder }]}>
                  <Text style={[styles.badgeText, { color: colors.emeraldLight }]}>Destek</Text>
                </View>
              </View>
              <Text style={styles.optionDesc}>
                Hesap, antrenman veya kullanım hakkında destek ekibimizle iletişime geçin
              </Text>
            </View>
            <ChevronRightIcon color={colors.emeraldLight} size={18} />
          </TouchableOpacity>
        </View>

        {/* Bilgilendirme Notu */}
        <View style={styles.footerNoteBox}>
          <Text style={styles.footerNoteTitle}>⏱️ Yanıt Süresi</Text>
          <Text style={styles.footerNoteDesc}>
            Geri bildirimler ve hata raporları incelenerek ortalama 24-48 saat içinde değerlendirilir.
          </Text>
        </View>
      </ScrollView>

      {/* ─── 1. ÖZELLİK İSTEĞİ ALT PANOSU ─── */}
      <FeedbackBottomSheetModal
        visible={activeModal === 'feature'}
        onClose={() => setActiveModal(null)}
        title="Özellik İsteği"
        subtitle="Fikrinizi veya önerinizi paylaşın"
        icon={<FeatureRequestIcon size={20} color={colors.amberLight} />}
        placeholder="Aklınızdaki özelliği veya iyileştirme fikrini detaylıca açıklayın... (Örn: Antrenman notlarına fotoğraf ekleme, özel RPE grafikleri...)"
        accentColor={colors.amberLight}
        onSubmit={handleFeatureSubmit}
      />

      {/* ─── 3. YARDIM ALIN ALT PANOSU ─── */}
      <FeedbackBottomSheetModal
        visible={activeModal === 'help'}
        onClose={() => setActiveModal(null)}
        title="Yardım Alın"
        subtitle="Destek ekibimize mesaj gönderin"
        icon={<HelpIcon size={20} color={colors.emeraldLight} />}
        placeholder="Hangi konuda yardıma ihtiyacınız var? Lütfen sorunuzu veya yaşadığınız durumu detaylıca anlatın..."
        accentColor={colors.emeraldLight}
        onSubmit={handleHelpSubmit}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 0.3,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  introCard: {
    backgroundColor: '#101524',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
    overflow: 'hidden',
    position: 'relative',
  },
  introGlow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  introTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  introDesc: {
    fontSize: 12.5,
    color: colors.textMuted,
    lineHeight: 18,
  },
  optionsWrap: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#101524',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
  },
  optionCardBug: {
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  optionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  optionDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  footerNoteBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textDim,
    marginBottom: 4,
  },
  footerNoteDesc: {
    fontSize: 12,
    color: colors.textDim,
    lineHeight: 16,
  },

  // ─── Modal Bottom Sheet Stilleri ───
  modalRootContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalBackdropTapInner: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: '#0C101C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopColor: colors.amberLight,
    shadowColor: colors.amberLight,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetBottomExtension: {
    position: 'absolute',
    bottom: -1000,
    left: -1.5,
    right: -1.5,
    height: 1000,
    backgroundColor: '#0C101C',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.35)',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  modalDragHandleZone: {
    width: '100%',
    paddingTop: 8,
    paddingBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.amberLight,
    shadowColor: colors.amberLight,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    alignSelf: 'center',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  modalHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  modalDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  modalCloseButtonRed: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
  },
  inputContainer: {
    marginTop: 4,
  },
  feedbackInput: {
    backgroundColor: '#121829',
    borderRadius: 16,
    padding: 14,
    color: colors.text,
    fontSize: 14,
    minHeight: 130,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.09)',
    lineHeight: 20,
  },
  charCounter: {
    fontSize: 11,
    color: colors.textDim,
    textAlign: 'right',
    marginTop: 6,
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  neonCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(244, 63, 94, 0.35)',
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonCancelBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FB7185',
    letterSpacing: 0.3,
  },
  neonSaveBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  neonSaveBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.3,
  },
});
