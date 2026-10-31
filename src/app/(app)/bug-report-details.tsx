import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

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

  // Mor / Neon Violet (Ana Gönder Butonu ve Vurgular)
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.14)',
  purpleBorder: 'rgba(139, 92, 246, 0.45)',
  purpleGlow: '#A855F7',

  // Emerald / Yeşil
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.14)',
  emeraldBorder: 'rgba(16, 185, 129, 0.35)',

  // Rose / Kırmızı
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

function MediaPlusIcon({ color = colors.purpleLight, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth="2" strokeDasharray="3 3" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8M8 12h8" />
    </Svg>
  );
}

function SendPlaneIcon({ color = colors.purpleLight, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      />
    </Svg>
  );
}

function CheckmarkIcon({ color = '#10B981', size = 48 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12l3 3 5-6" />
    </Svg>
  );
}

function TrashIcon({ color = '#EF4444', size = 14 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </Svg>
  );
}

// ─── Özel Radio Seçenek Bileşeni ───
function RadioOptionItem({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.radioCard,
        selected && styles.radioCardSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
        {label}
      </Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── ANA BİLEŞEN: Hata Raporu Detayları (Adım 2) ───
export default function BugReportDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ description?: string }>();

  // Form State'leri (Görsellerdeki 5 Soru + Medya + Ek Bilgi)
  const [selectedMedia, setSelectedMedia] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [errorMessageSeen, setErrorMessageSeen] = useState<string | null>(null); // "Evet" | "Hayır"
  const [frequency, setFrequency] = useState<string | null>(null); // "Evet, her zaman oluyor" | "Evet, bazen oluyor" | "Hayır, ilk kez oluyor"
  const [connectionType, setConnectionType] = useState<string | null>(null); // "Wi-Fi" | "Mobil veri" | "Wi-Fi veya mobil veriye bağlı değildim" | "Emin Değilim"
  const [restartedApp, setRestartedApp] = useState<string | null>(null); // "Evet ve sorun çözüldü" | "Evet ve hâlâ bozuk" | "Hayır, denemedim"
  const [additionalNotes, setAdditionalNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  // ─── Klavye ve Scroll Yönetimi ───
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates ? e.endCoordinates.height : 0;
      setKeyboardHeight(h);
      // Klavye açıldığında text box ve butonun görünür kalması için scroll'u en alta kaydır
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Fotoğraf / Video Seçme
  const handlePickMedia = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'İzin Gerekli',
          'Ekran görüntüsü veya video ekleyebilmek için galeri erişim izni vermeniz gerekmektedir.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedMedia(result.assets[0]);
      }
    } catch {
      Alert.alert('Hata', 'Medya seçilirken bir sorun oluştu.');
    }
  };

  // Raporu Gönderme İşlemi
  const handleSubmit = async () => {
    Keyboard.dismiss();
    setSubmitting(true);

    try {
      // Gönderim simülasyonu
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitting(false);
      setSuccessModalVisible(true);
    } catch {
      setSubmitting(false);
      Alert.alert('Hata', 'Rapor gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleFinish = () => {
    setSuccessModalVisible(false);
    // Bize Ulaşın / İletişim ana ekranına dön
    router.replace('/(app)/contact' as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Üst Başlık Barı (Hevy tarzı: Geri ve Başlık) */}
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

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* İlerleme Çizgisi (Adım 2: %100 Tamamlandı) */}
      <View style={styles.progressBarTrack}>
        <View style={styles.progressBarFill} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollRef}
            style={styles.container}
            contentContainerStyle={[
              styles.contentContainer,
              keyboardHeight > 0 && {
                paddingBottom: Platform.OS === 'android' ? keyboardHeight + 36 : 140,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. BÖLÜM: Medya / Ekran Görüntüsü veya Kaydı Ekleme */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Sorunu gösteren bir ekran görüntüsü veya ekran kaydı ekleyin
              </Text>

              {selectedMedia ? (
                <View style={styles.mediaPreviewCard}>
                  <Image
                    source={{ uri: selectedMedia.uri }}
                    style={styles.mediaThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.mediaInfoBox}>
                    <Text style={styles.mediaFileName} numberOfLines={1}>
                      {selectedMedia.fileName || (selectedMedia.type === 'video' ? 'Ekran Kaydı (Video)' : 'Ekran Görüntüsü')}
                    </Text>
                    <Text style={styles.mediaFileSize}>
                      {selectedMedia.fileSize
                        ? `${(selectedMedia.fileSize / (1024 * 1024)).toFixed(1)} MB`
                        : 'Medya Eklendi'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.mediaRemoveBtn}
                    onPress={() => setSelectedMedia(null)}
                    activeOpacity={0.7}
                    hitSlop={8}
                  >
                    <TrashIcon size={14} color="#EF4444" />
                    <Text style={styles.mediaRemoveText}>Kaldır</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={handlePickMedia}
                  activeOpacity={0.75}
                >
                  <MediaPlusIcon size={26} color={colors.purpleLight} />
                  <Text style={styles.uploadText}>Bir fotoğraf / video ekle</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 2. BÖLÜM: Hata Mesajı Gördünüz mü? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bir hata mesajı gördünüz mü?</Text>
              <View style={styles.radioGroup}>
                <RadioOptionItem
                  label="Evet"
                  selected={errorMessageSeen === 'Evet'}
                  onPress={() => setErrorMessageSeen('Evet')}
                />
                <RadioOptionItem
                  label="Hayır"
                  selected={errorMessageSeen === 'Hayır'}
                  onPress={() => setErrorMessageSeen('Hayır')}
                />
              </View>
            </View>

            {/* 3. BÖLÜM: Bu daha önce birden fazla kez oldu mu? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bu daha önce birden fazla kez oldu mu?</Text>
              <View style={styles.radioGroup}>
                <RadioOptionItem
                  label="Evet, her zaman oluyor"
                  selected={frequency === 'Evet, her zaman oluyor'}
                  onPress={() => setFrequency('Evet, her zaman oluyor')}
                />
                <RadioOptionItem
                  label="Evet, bazen oluyor"
                  selected={frequency === 'Evet, bazen oluyor'}
                  onPress={() => setFrequency('Evet, bazen oluyor')}
                />
                <RadioOptionItem
                  label="Hayır, ilk kez oluyor"
                  selected={frequency === 'Hayır, ilk kez oluyor'}
                  onPress={() => setFrequency('Hayır, ilk kez oluyor')}
                />
              </View>
            </View>

            {/* 4. BÖLÜM: Wi-Fi ya da mobil veriye mi bağlıydınız? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {"Bu olduğunda Wi-Fi'ya mı yoksa mobil veriye mi bağlıydınız?"}
              </Text>
              <View style={styles.radioGroup}>
                <RadioOptionItem
                  label="Wi-Fi"
                  selected={connectionType === 'Wi-Fi'}
                  onPress={() => setConnectionType('Wi-Fi')}
                />
                <RadioOptionItem
                  label="Mobil veri"
                  selected={connectionType === 'Mobil veri'}
                  onPress={() => setConnectionType('Mobil veri')}
                />
                <RadioOptionItem
                  label="Wi-Fi veya mobil veriye bağlı değildim"
                  selected={connectionType === 'Wi-Fi veya mobil veriye bağlı değildim'}
                  onPress={() => setConnectionType('Wi-Fi veya mobil veriye bağlı değildim')}
                />
                <RadioOptionItem
                  label="Emin Değilim"
                  selected={connectionType === 'Emin Değilim'}
                  onPress={() => setConnectionType('Emin Değilim')}
                />
              </View>
            </View>

            {/* 5. BÖLÜM: Uygulamayı kapatıp açmayı denediniz mi? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uygulamayı kapatıp yeniden açmayı denediniz mi?</Text>
              <View style={styles.radioGroup}>
                <RadioOptionItem
                  label="Evet ve sorun çözüldü"
                  selected={restartedApp === 'Evet ve sorun çözüldü'}
                  onPress={() => setRestartedApp('Evet ve sorun çözüldü')}
                />
                <RadioOptionItem
                  label="Evet ve hâlâ bozuk"
                  selected={restartedApp === 'Evet ve hâlâ bozuk'}
                  onPress={() => setRestartedApp('Evet ve hâlâ bozuk')}
                />
                <RadioOptionItem
                  label="Hayır, denemedim"
                  selected={restartedApp === 'Hayır, denemedim'}
                  onPress={() => setRestartedApp('Hayır, denemedim')}
                />
              </View>
            </View>

            {/* 6. BÖLÜM: Bilmemiz gereken başka bir şey var mı? */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bilmemiz gereken başka bir şey var mı?</Text>
              <View style={styles.notesWrap}>
                <TextInput
                  style={styles.notesInput}
                  multiline
                  numberOfLines={4}
                  placeholder="Bize daha fazla bilgi verin..."
                  placeholderTextColor={colors.textDim}
                  value={additionalNotes}
                  onChangeText={setAdditionalNotes}
                  maxLength={500}
                  textAlignVertical="top"
                  selectionColor={colors.purple}
                  keyboardAppearance="dark"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 120);
                  }}
                />
              </View>
            </View>

            {/* 7. BÖLÜM: GÖNDERME BUTONU (NEON PURPLE TASARIM) */}
            <View style={styles.submitSection}>
              <TouchableOpacity
                style={[
                  styles.neonPurpleBtn,
                  submitting && styles.neonPurpleBtnDisabled,
                ]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={colors.purpleLight} />
                ) : (
                  <>
                    <SendPlaneIcon size={18} color={colors.purpleLight} />
                    <Text style={styles.neonPurpleBtnText}>Hata Raporunu Gönder</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Başarı Modalı */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleFinish}
        statusBarTranslucent
      >
        <View style={styles.successModalRoot}>
          <Pressable style={styles.successBackdrop} onPress={handleFinish} />
          <View style={styles.successCard}>
            <View style={styles.successIconBox}>
              <CheckmarkIcon size={52} color={colors.emeraldLight} />
            </View>
            <Text style={styles.successTitle}>Raporunuz Alındı 🎉</Text>
            <Text style={styles.successDesc}>
              {params.description
                ? 'Hata açıklamanız ve detaylarınız doğrudan geliştirici ekibimize iletildi.'
                : 'Detaylı hata raporunuz başarıyla iletildi.'}
              {'\n\n'}Geliştirme sürecine katkıda bulunduğunuz için teşekkür ederiz!
            </Text>
            <TouchableOpacity
              style={styles.successFinishBtn}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.successFinishBtnText}>Anladım, Kapat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  headerRightPlaceholder: {
    width: 40,
  },
  progressBarTrack: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    width: '100%',
    backgroundColor: colors.purple,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },

  // Medya Yükleme Kutusu
  uploadBox: {
    height: 96,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(16, 21, 36, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.purpleLight,
  },
  mediaPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 10,
    gap: 12,
  },
  mediaThumbnail: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: colors.cardBgInner,
  },
  mediaInfoBox: {
    flex: 1,
  },
  mediaFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  mediaFileSize: {
    fontSize: 12,
    color: colors.textDim,
  },
  mediaRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.roseBg,
    borderWidth: 1,
    borderColor: colors.roseBorder,
  },
  mediaRemoveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },

  // Radio Seçenek Kartları
  radioGroup: {
    gap: 8,
  },
  radioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  radioCardSelected: {
    backgroundColor: colors.purpleBg,
    borderColor: colors.purpleBorder,
  },
  radioLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#CBD5E1',
    flex: 1,
    paddingRight: 12,
  },
  radioLabelSelected: {
    color: colors.text,
    fontWeight: '600',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.purple,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.purpleLight,
  },

  // Ek Bilgiler Metin Kutusu
  notesWrap: {
    backgroundColor: colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    minHeight: 110,
  },
  notesInput: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    flex: 1,
  },

  // Neon Purple Gönderme Butonu
  submitSection: {
    marginTop: 12,
    marginBottom: 20,
  },
  neonPurpleBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  neonPurpleBtnDisabled: {
    opacity: 0.5,
  },
  neonPurpleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.purpleLight,
  },

  // Başarı Modalı
  successModalRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
  },
  successCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.cardBg,
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: colors.purpleBorder,
    padding: 24,
    alignItems: 'center',
  },
  successIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 10,
  },
  successDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  successFinishBtn: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.purpleBg,
    borderWidth: 1,
    borderColor: colors.purpleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successFinishBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.purpleLight,
  },
});
