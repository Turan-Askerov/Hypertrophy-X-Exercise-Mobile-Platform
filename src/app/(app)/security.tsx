import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/use-user';
import { formatTrDate } from '@/lib/rpe';

// ─── Renk Token'ları (Cyber Dark Paleti) ───
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

  // Mor / Violet
  purple: '#8B5CF6',
  purpleLight: '#C084FC',
  purpleBg: 'rgba(139, 92, 246, 0.12)',
  purpleBorder: 'rgba(139, 92, 246, 0.28)',

  // Zümrüt Yeşili (Güvenlik / Başarı)
  emerald: '#10B981',
  emeraldLight: '#34D399',
  emeraldBg: 'rgba(16, 185, 129, 0.12)',
  emeraldBorder: 'rgba(16, 185, 129, 0.28)',

  // Cyan (E-posta)
  cyan: '#38BDF8',
  cyanLight: '#7DD3FC',
  cyanBg: 'rgba(56, 189, 248, 0.12)',
  cyanBorder: 'rgba(56, 189, 248, 0.28)',

  // Amber (Şifre)
  amber: '#F59E0B',
  amberLight: '#FBBF24',
  amberBg: 'rgba(245, 158, 11, 0.12)',
  amberBorder: 'rgba(245, 158, 11, 0.28)',

  // Rose / Kırmızı
  rose: '#FB7185',
  roseBg: 'rgba(251, 113, 133, 0.12)',
  roseBorder: 'rgba(251, 113, 133, 0.28)',
};

// ─── SVG İkonları ───
function BackIcon({ color = '#F8FAFC', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function ShieldCheckIcon({ color = colors.emeraldLight, size = 24 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </Svg>
  );
}

function MailIcon({ color = colors.cyan, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </Svg>
  );
}

function KeyIcon({ color = colors.amber, size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </Svg>
  );
}

function EyeIcon({ color = colors.textDim, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </Svg>
  );
}

function EyeOffIcon({ color = colors.textDim, size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
      />
    </Svg>
  );
}

function CheckBadgeIcon({ color = colors.emeraldLight, size = 16 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </Svg>
  );
}

function MedalIcon({ color = '#FBBF24', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M6 3h12l-3 8H9L6 3z"
      />
      <Circle cx="12" cy="15" r="4.5" strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.5 18.5L7 22l5-2.5 5 2.5-1.5-3.5"
      />
    </Svg>
  );
}

function PadlockIcon({ color = '#34D399', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="5" y="10" width="14" height="11" rx="3" strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 10V7a4 4 0 018 0v3"
      />
      <Circle cx="12" cy="15.5" r="1.5" fill={color} />
    </Svg>
  );
}

function CalendarStatIcon({ color = '#94A3B8', size = 21 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="5" width="18" height="16" rx="3" strokeWidth="2" />
      <Path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 3v4M8 3v4M3 10h18"
      />
    </Svg>
  );
}

export default function SecurityScreen() {
  const router = useRouter();
  const {
    user,
    refetch,
    requestEmailUpdate,
    isRequestingEmail,
    confirmEmailUpdate,
    isConfirmingEmail,
    requestChangePassword,
    isRequestingPassword,
    confirmChangePassword,
    isConfirmingPassword,
  } = useUser();

  // ─── E-posta State'leri ───
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailStep, setEmailStep] = useState<'request' | 'confirm'>('request');
  const [maskedEmailNotice, setMaskedEmailNotice] = useState('');

  // ─── Şifre State'leri ───
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordOtpToken, setPasswordOtpToken] = useState('');
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [passwordStep, setPasswordStep] = useState<'request' | 'confirm'>('request');
  const [maskedPasswordNotice, setMaskedPasswordNotice] = useState('');

  const [localPasswordChangedDate, setLocalPasswordChangedDate] = useState<string | null>(null);

  const lastPasswordDate =
    localPasswordChangedDate ||
    (user?.updated_at ? formatTrDate(user.updated_at) : null) ||
    (user?.created_at ? formatTrDate(user.created_at) : null) ||
    'Bilinmiyor';

  // ─── Klavye ve Scroll Yönetimi ───
  const scrollRef = useRef<React.ElementRef<typeof ScrollView>>(null);
  const emailCardY = useRef(0);
  const passwordCardY = useRef(0);
  const [keyboardPadding, setKeyboardPadding] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const h = e.endCoordinates ? e.endCoordinates.height : 0;
      setKeyboardPadding(h);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardPadding(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const scrollToEmail = () => {
    setTimeout(() => {
      const targetY = Math.max(0, emailCardY.current - 12);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 80);
  };

  const scrollToPassword = () => {
    setTimeout(() => {
      const targetY = Math.max(0, passwordCardY.current - 12);
      scrollRef.current?.scrollTo({ y: targetY, animated: true });
    }, 80);
  };

  // ─── E-posta Güncelleme İşlemleri ───
  const handleRequestEmail = async () => {
    Keyboard.dismiss();
    const trimmed = newEmail.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi yazın.');
      return;
    }
    if (user?.email && trimmed.toLowerCase() === user.email.toLowerCase()) {
      Alert.alert('Uyarı', 'Girdiğiniz e-posta adresi mevcut adresinizle aynıdır.');
      return;
    }

    try {
      const res = await requestEmailUpdate({ new_email: trimmed });
      setEmailOtpToken(res.token);
      setMaskedEmailNotice(res.masked_email || trimmed);
      setEmailStep('confirm');
      Alert.alert('Doğrulama Kodu Gönderildi', res.message || 'Lütfen gelen 6 haneli kodu girin.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'E-posta doğrulama kodu gönderilemedi.');
    }
  };

  const handleConfirmEmail = async () => {
    Keyboard.dismiss();
    const trimmedCode = emailOtpCode.trim();
    if (trimmedCode.length !== 6) {
      Alert.alert('Geçersiz Kod', 'Lütfen 6 haneli doğrulama kodunu eksiksiz girin.');
      return;
    }

    try {
      const res = await confirmEmailUpdate({
        token: emailOtpToken,
        code: trimmedCode,
      });
      Alert.alert('Başarılı', res.message || 'E-posta adresiniz başarıyla güncellendi.');
      setEmailStep('request');
      setNewEmail('');
      setEmailOtpCode('');
      setEmailOtpToken('');
      setMaskedEmailNotice('');
      refetch();
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Kod doğrulanamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleCancelEmail = () => {
    Keyboard.dismiss();
    setEmailStep('request');
    setEmailOtpCode('');
    setEmailOtpToken('');
    setMaskedEmailNotice('');
  };

  // ─── Şifre Yenileme İşlemleri ───
  const handleRequestPassword = async () => {
    Keyboard.dismiss();
    if (!oldPassword) {
      Alert.alert('Eksik Bilgi', 'Lütfen mevcut şifrenizi girin.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Şifre Zayıf', 'Yeni şifreniz en az 6 karakterden oluşmalıdır.');
      return;
    }
    if (oldPassword === newPassword) {
      Alert.alert('Uyarı', 'Yeni şifreniz mevcut şifrenizle aynı olamaz.');
      return;
    }

    try {
      const res = await requestChangePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordOtpToken(res.token);
      setMaskedPasswordNotice(res.masked_email || user?.email || 'kayıtlı e-posta adresinize');
      setPasswordStep('confirm');
      Alert.alert('Güvenlik Kodu Gönderildi', res.message || 'Kayıtlı e-posta adresinize 6 haneli onay kodu gönderildi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre değiştirme talebi gerçekleştirilemedi.');
    }
  };

  const handleConfirmPassword = async () => {
    Keyboard.dismiss();
    const trimmedCode = passwordOtpCode.trim();
    if (trimmedCode.length !== 6) {
      Alert.alert('Geçersiz Kod', 'Lütfen e-postanıza gelen 6 haneli güvenlik kodunu girin.');
      return;
    }

    try {
      const res = await confirmChangePassword({
        token: passwordOtpToken,
        code: trimmedCode,
      });
      Alert.alert('Başarılı', res.message || 'Şifreniz başarıyla güncellendi.');
      setLocalPasswordChangedDate(formatTrDate(new Date().toISOString()));
      setPasswordStep('request');
      setOldPassword('');
      setNewPassword('');
      setPasswordOtpCode('');
      setPasswordOtpToken('');
      setMaskedPasswordNotice('');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre onaylanamadı. Kod geçersiz veya süresi dolmuş.');
    }
  };

  const handleCancelPassword = () => {
    Keyboard.dismiss();
    setPasswordStep('request');
    setPasswordOtpCode('');
    setPasswordOtpToken('');
    setMaskedPasswordNotice('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* ─── Üst Başlık ─── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={10}
        >
          <BackIcon size={20} color="#F8FAFC" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hesap ve Güvenlik</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            keyboardPadding > 0 && { paddingBottom: Math.min(keyboardPadding, 220) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {/* ─── 1. HESAP GÜVENLİK DURUMU HERO KARTI ─── */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.shieldIconWrap}>
              <ShieldCheckIcon size={28} color={colors.emeraldLight} />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.heroUsername}>{user?.username || 'Sporcu'}</Text>
              </View>

              <Text style={styles.heroEmailText}>
                {user?.email || 'E-posta tanımlanmamış'}
              </Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStatsRow}>
            {/* 1. HESAP ROLÜ */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>HESAP ROLÜ</Text>
              <View style={styles.statContentRow}>
                <MedalIcon size={22} color="#FBBF24" />
                <Text style={styles.statValueText}>
                  {user?.is_admin ? 'Yönetici' : 'Sporcu'}
                </Text>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 2. GÜVENLİK KATMANI */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>GÜVENLİK</Text>
              <View style={styles.statContentRow}>
                <PadlockIcon size={22} color="#34D399" />
                <View style={styles.stat2FaCol}>
                  <Text style={styles.stat2FaTitle}>2FA OTP</Text>
                </View>
              </View>
            </View>

            <View style={styles.heroStatDivider} />

            {/* 3. SON ŞİFRE */}
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatLabel}>SON ŞİFRE</Text>
              <View style={styles.statContentRow}>
                <CalendarStatIcon size={19} color={colors.cyan} />
                <Text style={styles.statValueText}>{lastPasswordDate}</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* ─── 2. E-POSTA DOĞRULAMA & GÜNCELLEME PANOSU ─── */}
        <View
          onLayout={(e) => {
            emailCardY.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={styles.sectionHeading}>E-POSTA YÖNETİMİ</Text>

          <Card style={[styles.panelCard, emailStep === 'confirm' && styles.panelCardActiveCyan]}>
            <View style={styles.panelHeaderRow}>
              <View style={[styles.panelIconWrap, { backgroundColor: colors.cyanBg }]}>
                <MailIcon size={20} color={colors.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.panelTitleRow}>
                  <Text style={styles.panelTitle}>E-posta Adresi Değiştir</Text>
                  {emailStep === 'request' ? (
                    <View style={styles.statusPillGreen}>
                      <Text style={styles.statusPillGreenText}>ONAYLANDI</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusPill, { backgroundColor: colors.cyanBg }]}>
                      <Text style={[styles.statusPillText, { color: colors.cyan }]}>
                        ONAY BEKLENİYOR
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.panelSubtitle}>
                  {emailStep === 'request'
                    ? 'Giriş ve şifre sıfırlama kodları bu adrese iletilir'
                    : 'Yeni adresinizi onaylayarak güncellemeyi tamamlayın'}
                </Text>
              </View>
            </View>

            {emailStep === 'request' ? (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>GÜNCEL E-POSTA</Text>
                  <View style={styles.readOnlyInput}>
                    <Text style={styles.readOnlyText}>{user?.email || 'Tanımlanmamış'}</Text>
                    <CheckBadgeIcon size={16} color={colors.emeraldLight} />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>YENİ E-POSTA ADRESİ</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="yeni.adres@domain.com"
                    placeholderTextColor={colors.textDim}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onFocus={scrollToEmail}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                <TouchableOpacity
                  onPress={handleRequestEmail}
                  disabled={isRequestingEmail || !newEmail.trim()}
                  activeOpacity={0.7}
                  style={[
                    styles.neonCyanBtn,
                    (isRequestingEmail || !newEmail.trim()) && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.neonCyanBtnText}>
                    {isRequestingEmail ? 'Kod Gönderiliyor...' : 'Doğrulama Kodu Gönder'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formContainer}>
                <View style={styles.otpNoticeBox}>
                  <Text style={styles.otpNoticeTitle}>📩 Doğrulama Kodu Gönderildi</Text>
                  <Text style={styles.otpNoticeDesc}>
                    <Text style={{ color: colors.cyan, fontWeight: '700' }}>{maskedEmailNotice || newEmail}</Text>{' '}
                    adresinize 6 haneli güvenlik kodu iletildi. Lütfen kodu aşağıya girin.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>6 HANELİ DOĞRULAMA KODU</Text>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="• • • • • •"
                    placeholderTextColor={colors.textDim}
                    value={emailOtpCode}
                    onChangeText={setEmailOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                    onFocus={scrollToEmail}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>

                <View style={styles.dualActionRow}>
                  <Button
                    variant="secondary"
                    onPress={handleCancelEmail}
                    style={{ flex: 1 }}
                    disabled={isConfirmingEmail}
                  >
                    Vazgeç
                  </Button>
                  <Button
                    onPress={handleConfirmEmail}
                    loading={isConfirmingEmail}
                    disabled={isConfirmingEmail || emailOtpCode.trim().length !== 6}
                    style={{ flex: 1.5 }}
                  >
                    E-postayı Onayla
                  </Button>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* ─── 3. ŞİFRE YENİLEME PANOSU ─── */}
        <View
          onLayout={(e) => {
            passwordCardY.current = e.nativeEvent.layout.y;
          }}
        >
          <Text style={[styles.sectionHeading, { marginTop: 24 }]}>ŞİFRE VE ERİŞİM GÜVENLİĞİ</Text>

        <Card style={[styles.panelCard, passwordStep === 'confirm' && styles.panelCardActiveAmber]}>
          <View style={styles.panelHeaderRow}>
            <View style={[styles.panelIconWrap, { backgroundColor: colors.amberBg }]}>
              <KeyIcon size={20} color={colors.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.panelTitleRow}>
                <Text style={styles.panelTitle}>Hesap Şifresini Yenile</Text>
                <View style={[styles.statusPill, { backgroundColor: colors.amberBg }]}>
                  <Text style={[styles.statusPillText, { color: colors.amber }]}>
                    {passwordStep === 'request' ? 'ŞİFRE' : 'OTP KORUMALI'}
                  </Text>
                </View>
              </View>
              <Text style={styles.panelSubtitle}>
                {passwordStep === 'request'
                  ? 'Mevcut şifreniz ve e-posta OTP ile güvenli yenileme'
                  : 'Kayıtlı e-postanıza gönderilen onay kodunu girin'}
              </Text>
            </View>
          </View>

          {passwordStep === 'request' ? (
            <View style={styles.formContainer}>
              {/* Mevcut Şifre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>MEVCUT ŞİFRE</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordField}
                    placeholder="Mevcut şifrenizi girin"
                    placeholderTextColor={colors.textDim}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry={!showOldPass}
                    autoCapitalize="none"
                    onFocus={scrollToPassword}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowOldPass(!showOldPass)}
                    hitSlop={10}
                  >
                    {showOldPass ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Yeni Şifre */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>YENİ ŞİFRE (EN AZ 6 KARAKTER)</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    style={styles.passwordField}
                    placeholder="Yeni güçlü şifre belirleyin"
                    placeholderTextColor={colors.textDim}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPass}
                    autoCapitalize="none"
                    onFocus={scrollToPassword}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPass(!showNewPass)}
                    hitSlop={10}
                  >
                    {showNewPass ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleRequestPassword}
                disabled={isRequestingPassword || !oldPassword || !newPassword}
                activeOpacity={0.7}
                style={[
                  styles.neonAmberBtn,
                  (isRequestingPassword || !oldPassword || !newPassword) && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.neonAmberBtnText}>
                  {isRequestingPassword ? 'Kod Gönderiliyor...' : 'Şifre Güncelleme Kodu Gönder'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formContainer}>
              <View style={styles.otpNoticeBox}>
                <Text style={styles.otpNoticeTitle}>🔐 Şifre Değiştirme Kodu</Text>
                <Text style={styles.otpNoticeDesc}>
                  İşlem güvenliği için{' '}
                  <Text style={{ color: colors.amberLight, fontWeight: '700' }}>
                    {maskedPasswordNotice}
                  </Text>{' '}
                  adresine 6 haneli onay kodu gönderildi.
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>6 HANELİ ONAY KODU</Text>
                <TextInput
                  style={[styles.otpInput, { borderColor: colors.amberBorder }]}
                  placeholder="• • • • • •"
                  placeholderTextColor={colors.textDim}
                  value={passwordOtpCode}
                  onChangeText={setPasswordOtpCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                  onFocus={scrollToPassword}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              <View style={styles.dualActionRow}>
                <Button
                  variant="secondary"
                  onPress={handleCancelPassword}
                  style={{ flex: 1 }}
                  disabled={isConfirmingPassword}
                >
                  Vazgeç
                </Button>
                <Button
                  onPress={handleConfirmPassword}
                  loading={isConfirmingPassword}
                  disabled={isConfirmingPassword || passwordOtpCode.trim().length !== 6}
                  style={{ flex: 1.5 }}
                >
                  Şifreyi Güncelle
                </Button>
              </View>
            </View>
          )}
          </Card>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  headerPlaceholder: {
    width: 40,
    height: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  shieldIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.emeraldBg,
    borderWidth: 1.5,
    borderColor: colors.emeraldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroUsername: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.emeraldBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.emeraldBorder,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.emeraldLight,
  },
  heroEmailText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  statValueText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.text,
  },
  stat2FaCol: {
    gap: 1,
  },
  stat2FaTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#34D399',
    lineHeight: 14,
  },
  stat2FaSub: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34D399',
    lineHeight: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDim,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  panelCard: {
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  panelCardActiveCyan: {
    borderColor: colors.cyanBorder,
  },
  panelCardActiveAmber: {
    borderColor: colors.amberBorder,
  },
  panelHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  panelIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  panelSubtitle: {
    fontSize: 12,
    color: colors.textDim,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPillGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillGreenText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.5,
  },
  neonCyanBtn: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: 'rgba(56, 189, 248, 0.45)',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  neonCyanBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.3,
  },
  neonAmberBtn: {
    height: 46,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  neonAmberBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.3,
  },
  formContainer: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textDim,
    letterSpacing: 0.6,
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  readOnlyText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  passwordField: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionBtn: {
    marginTop: 4,
  },
  otpNoticeBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  otpNoticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  otpNoticeDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  otpInput: {
    backgroundColor: colors.itemBg,
    borderRadius: 14,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 6,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.cyanBorder,
  },
  dualActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  securityStandardsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 16,
    marginTop: 24,
  },
  standardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  standardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  standardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  standardDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginTop: 3,
  },
});
