import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Radius, Spacing, Typography } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';

// ─── SVG İkonları (React Native SVG ile kesintisiz ve yüksek performanslı) ───

function BackIcon({ color = '#ffffff', size = 22 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M15 19l-7-7 7-7" />
    </Svg>
  );
}

function ChevronRightIcon({ color = '#6b7280', size = 18 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
    </Svg>
  );
}

function UserIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </Svg>
  );
}

function BellIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </Svg>
  );
}

function DumbbellIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12" />
    </Svg>
  );
}

function GlobeIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </Svg>
  );
}

function MoonIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </Svg>
  );
}

function IntegrationIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </Svg>
  );
}

function ScaleIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l9-4 9 4M12 2v20M5 18h14M6 18l-3-7h6l-3 7zm12 0l-3-7h6l-3 7z" />
    </Svg>
  );
}

function MailIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7l9 6 9-6" />
    </Svg>
  );
}

function InfoIcon({ color = '#3b82f6', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Circle cx="12" cy="12" r="10" strokeWidth="2" />
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
    </Svg>
  );
}

function LogoutIcon({ color = '#ef4444', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </Svg>
  );
}

function TrashIcon({ color = '#ef4444', size = 20 }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}>
      <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Svg>
  );
}

// ─── Ayar Satırı Bileşeni ───

type SettingItemProps = {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  valueBadge?: string;
  onPress: () => void;
  isLast?: boolean;
  destructive?: boolean;
};

function SettingItem({
  icon,
  title,
  subtitle,
  valueBadge,
  onPress,
  isLast = false,
  destructive = false,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={[styles.itemContainer, !isLast && styles.itemBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconWrapper, destructive && styles.destructiveIconWrapper]}>
          {icon}
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.itemTitle, destructive && styles.destructiveTitle]}>{title}</Text>
          {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <View style={styles.itemRight}>
        {valueBadge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{valueBadge}</Text>
          </View>
        ) : null}
        <ChevronRightIcon color="#4b5563" size={18} />
      </View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const {
    user,
    refetch,
    deleteAccount,
    isDeletingAccount,
    requestEmailUpdate,
    isRequestingEmail,
    confirmEmailUpdate,
    isConfirmingEmail,
    requestChangePassword,
    isRequestingPassword,
    confirmChangePassword,
    isConfirmingPassword,
  } = useUser();

  // Tercih Durumları (State)
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mil'>('km');
  const [themeMode, setThemeMode] = useState<'Koyu' | 'Açık' | 'Sistem'>('Koyu');
  const [language, setLanguage] = useState<'Türkçe' | 'English'>('Türkçe');

  // Antrenman Tercihleri
  const [defaultRestSec, setDefaultRestSec] = useState<number>(90);
  const [restTimerSound, setRestTimerSound] = useState<boolean>(true);
  const [autoStartTimer, setAutoStartTimer] = useState<boolean>(true);

  // Bildirimler
  const [workoutReminders, setWorkoutReminders] = useState<boolean>(true);
  const [restDayAlerts, setRestDayAlerts] = useState<boolean>(false);
  const [prCelebrations, setPrCelebrations] = useState<boolean>(true);

  // Hesap & Güvenlik Alt Görünümleri ve Form Durumları
  const [accountSubView, setAccountSubView] = useState<'info' | 'changeEmail' | 'changePassword'>('info');

  // E-posta Güncelleme State
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailStep, setEmailStep] = useState<'request' | 'confirm'>('request');

  // Şifre Değiştirme State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordOtpToken, setPasswordOtpToken] = useState('');
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [passwordStep, setPasswordStep] = useState<'request' | 'confirm'>('request');

  // Hesap Silme (Tehlikeli Bölge)
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Modal Durumları
  const [activeModal, setActiveModal] = useState<
    'account' | 'notifications' | 'workout' | 'language' | 'theme' | 'integrations' | 'units' | 'contact' | 'about' | 'deleteAccount' | null
  >(null);

  // Geri Bildirim Formu
  const [feedbackText, setFeedbackText] = useState('');

  // Güvenli Geri Dönüş Fonksiyonu
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/(tabs)/profile');
    }
  };

  // E-posta Güncelleme Adım 1
  const handleRequestEmail = async () => {
    if (!newEmail.trim() || !newEmail.includes('@')) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir e-posta adresi girin.');
      return;
    }
    try {
      const res = await requestEmailUpdate({ new_email: newEmail.trim() });
      setEmailOtpToken(res.token);
      setEmailStep('confirm');
      Alert.alert('Doğrulama Kodu Gönderildi', res.message);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'E-posta kodu gönderilemedi.');
    }
  };

  // E-posta Güncelleme Adım 2
  const handleConfirmEmail = async () => {
    if (emailOtpCode.trim().length !== 6) {
      Alert.alert('Uyarı', 'Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    try {
      const res = await confirmEmailUpdate({
        token: emailOtpToken,
        code: emailOtpCode.trim(),
      });
      Alert.alert('Başarılı', res.message);
      setAccountSubView('info');
      setEmailStep('request');
      setNewEmail('');
      setEmailOtpCode('');
      refetch();
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Kod doğrulanamadı.');
    }
  };

  // Şifre Değiştirme Adım 1
  const handleRequestPassword = async () => {
    if (!oldPassword || newPassword.length < 6) {
      Alert.alert('Uyarı', 'Mevcut şifrenizi ve en az 6 karakterli yeni şifrenizi girin.');
      return;
    }
    try {
      const res = await requestChangePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      setPasswordOtpToken(res.token);
      setPasswordStep('confirm');
      Alert.alert('Doğrulama Kodu Gönderildi', res.message);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre değiştirme talebi başarısız.');
    }
  };

  // Şifre Değiştirme Adım 2
  const handleConfirmPassword = async () => {
    if (passwordOtpCode.trim().length !== 6) {
      Alert.alert('Uyarı', 'Lütfen 6 haneli onay kodunu girin.');
      return;
    }
    try {
      const res = await confirmChangePassword({
        token: passwordOtpToken,
        code: passwordOtpCode.trim(),
      });
      Alert.alert('Başarılı', res.message);
      setAccountSubView('info');
      setPasswordStep('request');
      setOldPassword('');
      setNewPassword('');
      setPasswordOtpCode('');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre güncellenemedi.');
    }
  };

  // Çıkış Onayı State
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Çıkış Yap İşlemi
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      setLogoutConfirmVisible(false);
      router.replace('/(auth)/login');
    } catch (err) {
      console.error('Çıkış hatası:', err);
      Alert.alert('Hata', 'Çıkış yapılırken bir sorun oluştu.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Hesabı Kalıcı Olarak Silme İşlemi
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Uyarı', 'Hesabı silmek için mevcut şifrenizi girmelisiniz.');
      return;
    }
    if (deleteConfirmationText.trim() !== 'HESABIMI KALICI OLARAK SİL') {
      Alert.alert(
        'Uyarı',
        "Lütfen onaylamak için tam olarak 'HESABIMI KALICI OLARAK SİL' yazın."
      );
      return;
    }

    try {
      const res = await deleteAccount({
        password: deletePassword,
        confirmation: deleteConfirmationText.trim(),
      });
      Alert.alert('Hesap Silindi', res.message, [
        {
          text: 'Tamam',
          onPress: () => {
            setActiveModal(null);
            signOut();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Hesap silinemedi.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Üst Bar (Header) ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={10}
        >
          <BackIcon size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayarlar</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Sporcu Özet Banner'ı ─── */}
        <View style={styles.userBanner}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {(user?.username || 'HX').slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userBannerInfo}>
            <Text style={styles.userBannerName}>{user?.username || 'Sporcu'}</Text>
            <Text style={styles.userBannerEmail}>{user?.email || 'E-posta eklenmedi'}</Text>
          </View>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>PRO</Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 1: HESAP VE GÜVENLİK
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>HESAP VE GÜVENLİK</Text>
        <Card style={styles.groupCard} padding="none">
          <SettingItem
            icon={<UserIcon color="#3b82f6" />}
            title="Hesap ve Güvenlik"
            subtitle="Kullanıcı adı, e-posta, şifre ve güvenlik"
            onPress={() => {
              setAccountSubView('info');
              setActiveModal('account');
            }}
          />
          <SettingItem
            icon={<BellIcon color="#3b82f6" />}
            title="Bildirimler"
            subtitle="Antrenman saatleri, dinlenme ve başarılar"
            valueBadge={workoutReminders ? 'Açık' : 'Kapalı'}
            onPress={() => setActiveModal('notifications')}
            isLast
          />
        </Card>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 2: TERCİHLER / ANTRENMAN
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>TERCİHLER / ANTRENMAN</Text>
        <Card style={styles.groupCard} padding="none">
          <SettingItem
            icon={<DumbbellIcon color="#10b981" />}
            title="Antrenman"
            subtitle="Dinlenme sayacı, sesler ve otomatik başlatma"
            valueBadge={`${defaultRestSec} sn`}
            onPress={() => setActiveModal('workout')}
          />
          <SettingItem
            icon={<GlobeIcon color="#8b5cf6" />}
            title="Dil"
            subtitle="Uygulama arayüz dili"
            valueBadge={language}
            onPress={() => setActiveModal('language')}
          />
          <SettingItem
            icon={<MoonIcon color="#f59e0b" />}
            title="Tema"
            subtitle="Arayüz renk teması"
            valueBadge={themeMode}
            onPress={() => setActiveModal('theme')}
          />
          <SettingItem
            icon={<IntegrationIcon color="#06b6d4" />}
            title="Entegrasyonlar"
            subtitle="Apple Health, Health Connect, Strava"
            valueBadge="Bağlantı Yok"
            onPress={() => setActiveModal('integrations')}
          />
          <SettingItem
            icon={<ScaleIcon color="#ec4899" />}
            title="Birimler"
            subtitle="Ağırlık ve mesafe ölçüleri"
            valueBadge={`${weightUnit} / ${distanceUnit}`}
            onPress={() => setActiveModal('units')}
            isLast
          />
        </Card>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 3: YARDIM & DESTEK
           ═══════════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>YARDIM</Text>
        <Card style={styles.groupCard} padding="none">
          <SettingItem
            icon={<MailIcon color="#6366f1" />}
            title="Bize Ulaşın"
            subtitle="Destek ekibi ve geri bildirim"
            onPress={() => setActiveModal('contact')}
          />
          <SettingItem
            icon={<InfoIcon color="#64748b" />}
            title="Hakkında"
            subtitle="Hypertrophy-X v4.0.0 · Gizlilik & Şartlar"
            onPress={() => setActiveModal('about')}
            isLast
          />
        </Card>

        {/* ═══════════════════════════════════════════════
            BÖLÜM 4: TEHLİKELİ BÖLGE
           ═══════════════════════════════════════════════ */}
        <Text style={[styles.sectionTitle, { color: '#ef4444' }]}>TEHLİKELİ BÖLGE</Text>
        <Card style={[styles.groupCard, styles.dangerCard]} padding="none">
          <SettingItem
            icon={<LogoutIcon color="#f59e0b" />}
            title="Oturumu Kapat (Çıkış Yap)"
            subtitle="Bu cihazdaki sporcu oturumunu güvenle sonlandır"
            destructive
            onPress={() => setLogoutConfirmVisible(true)}
          />
          <SettingItem
            icon={<TrashIcon color="#ef4444" />}
            title="Hesabı Kalıcı Olarak Sil"
            subtitle="Tüm verilerinizi, geçmişinizi ve programlarınızı siler"
            destructive
            onPress={() => {
              setDeletePassword('');
              setDeleteConfirmationText('');
              setActiveModal('deleteAccount');
            }}
            isLast
          />
        </Card>

        <Text style={styles.footerText}>Hypertrophy-X Pro Athlete Platform · v4.0 (Build 58)</Text>
      </ScrollView>

      {/* ═══════════════════════════════════════════════
          ETKİLEŞİMLİ MODAL PENCERELER (SHEETS)
         ═══════════════════════════════════════════════ */}

      {/* 1. BİRİMLER MODALI */}
      <Modal visible={activeModal === 'units'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Birim Tercihleri</Text>
            <Text style={styles.modalDesc}>Antrenman ağırlıklarını ve mesafeleri hangi birimde takip etmek istersiniz?</Text>

            <Text style={styles.modalSubheading}>AĞIRLIK BİRİMİ</Text>
            <View style={styles.optionsRow}>
              {(['kg', 'lbs'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.optionBtn, weightUnit === unit && styles.optionBtnActive]}
                  onPress={() => setWeightUnit(unit)}
                >
                  <Text style={[styles.optionBtnText, weightUnit === unit && styles.optionBtnTextActive]}>
                    {unit.toUpperCase()} ({unit === 'kg' ? 'Kilogram' : 'Pound'})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSubheading}>MESAFE BİRİMİ</Text>
            <View style={styles.optionsRow}>
              {(['km', 'mil'] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  style={[styles.optionBtn, distanceUnit === unit && styles.optionBtnActive]}
                  onPress={() => setDistanceUnit(unit)}
                >
                  <Text style={[styles.optionBtnText, distanceUnit === unit && styles.optionBtnTextActive]}>
                    {unit === 'km' ? 'Kilometre (km)' : 'Mil (mi)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Tamam
            </Button>
          </View>
        </View>
      </Modal>

      {/* 2. DİL MODALI */}
      <Modal visible={activeModal === 'language'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Dil Seçimi</Text>
            <Text style={styles.modalDesc}>Uygulama arayüzünün dilini seçin.</Text>

            {(['Türkçe', 'English'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.modalRadioItem, language === lang && styles.modalRadioItemActive]}
                onPress={() => {
                  setLanguage(lang);
                  setActiveModal(null);
                }}
              >
                <Text style={[styles.modalRadioText, language === lang && styles.modalRadioTextActive]}>
                  {lang}
                </Text>
                {language === lang ? <Text style={styles.checkmarkText}>✓</Text> : null}
              </TouchableOpacity>
            ))}

            <Button variant="secondary" onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.three }}>
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 3. TEMA MODALI */}
      <Modal visible={activeModal === 'theme'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Tema Tercihi</Text>
            <Text style={styles.modalDesc}>Hypertrophy-X antrenman ve odaklanma için optimize edilmiş Koyu Modu önerir.</Text>

            {(['Koyu', 'Açık', 'Sistem'] as const).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.modalRadioItem, themeMode === item && styles.modalRadioItemActive]}
                onPress={() => {
                  setThemeMode(item);
                  setActiveModal(null);
                }}
              >
                <Text style={[styles.modalRadioText, themeMode === item && styles.modalRadioTextActive]}>
                  {item === 'Koyu' ? '🌙 Koyu Mod (Tavsiye Edilen)' : item === 'Açık' ? '☀️ Açık Mod' : '📱 Sistem Teması'}
                </Text>
                {themeMode === item ? <Text style={styles.checkmarkText}>✓</Text> : null}
              </TouchableOpacity>
            ))}

            <Button variant="secondary" onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.three }}>
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 4. ANTRENMAN AYARLARI MODALI */}
      <Modal visible={activeModal === 'workout'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Antrenman Tercihleri</Text>

            <Text style={styles.modalSubheading}>VARSAYILAN DİNLENME SÜRESİ</Text>
            <View style={styles.timerPillsRow}>
              {[60, 90, 120, 180].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.timerPill, defaultRestSec === sec && styles.timerPillActive]}
                  onPress={() => setDefaultRestSec(sec)}
                >
                  <Text style={[styles.timerPillText, defaultRestSec === sec && styles.timerPillTextActive]}>
                    {sec < 60 ? `${sec}sn` : `${sec / 60}dk`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Dinlenme Sayacı Sesi</Text>
                <Text style={styles.switchSubtitle}>Süre bittiğinde bip sesi çal</Text>
              </View>
              <Switch
                value={restTimerSound}
                onValueChange={setRestTimerSound}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Otomatik Sayacı Başlat</Text>
                <Text style={styles.switchSubtitle}>Set onaylandığında sayacı otomatik başlat</Text>
              </View>
              <Switch
                value={autoStartTimer}
                onValueChange={setAutoStartTimer}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
              />
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Kaydet
            </Button>
          </View>
        </View>
      </Modal>

      {/* 5. BİLDİRİMLER MODALI */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bildirim Ayarları</Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Antrenman Hatırlatıcıları</Text>
                <Text style={styles.switchSubtitle}>Planlanan günlerde hazırlık bildirimi gönder</Text>
              </View>
              <Switch
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Dinlenme Günü Uyarıları</Text>
                <Text style={styles.switchSubtitle}>Toparlanma günlerinde hatırlatma yap</Text>
              </View>
              <Switch
                value={restDayAlerts}
                onValueChange={setRestDayAlerts}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchTitle}>Kişisel Rekor Tebrikleri</Text>
                <Text style={styles.switchSubtitle}>Yeni PR kırdığında motivasyon bildirimi al</Text>
              </View>
              <Switch
                value={prCelebrations}
                onValueChange={setPrCelebrations}
                trackColor={{ false: '#374151', true: '#3b82f6' }}
              />
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Tamam
            </Button>
          </View>
        </View>
      </Modal>

      {/* 6. ENTEGRASYONLAR MODALI */}
      <Modal visible={activeModal === 'integrations'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sağlık & Antrenman Entegrasyonları</Text>
            <Text style={styles.modalDesc}>Antrenman ve kalori verilerinizi popüler platformlarla eşitleyin.</Text>

            <View style={styles.integrationItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.integrationName}>Apple Health / Health Connect</Text>
                <Text style={styles.integrationDesc}>Antrenman süresi ve yakılan kalori senkronizasyonu</Text>
              </View>
              <Button variant="secondary" style={styles.connectBtn} onPress={() => Alert.alert('Bilgi', 'Sağlık entegrasyonu yakında aktif olacaktır.')}>
                Bağla
              </Button>
            </View>

            <View style={styles.integrationItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.integrationName}>Strava</Text>
                <Text style={styles.integrationDesc}>Kardiyo ve kuvvet seanslarını Strava profilinizde paylaşın</Text>
              </View>
              <Button variant="secondary" style={styles.connectBtn} onPress={() => Alert.alert('Bilgi', 'Strava entegrasyonu yakında eklenecektir.')}>
                Bağla
              </Button>
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 7. BİZE ULAŞIN MODALI */}
      <Modal visible={activeModal === 'contact'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Bize Ulaşın</Text>
            <Text style={styles.modalDesc}>Öneri, istek veya yaşadığınız bir problemi bize iletin.</Text>

            <TextInput
              style={styles.feedbackInput}
              placeholder="Mesajınızı veya geri bildiriminizi buraya yazın..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={4}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />

            <Button
              onPress={() => {
                if (!feedbackText.trim()) {
                  Alert.alert('Uyarı', 'Lütfen bir mesaj yazın.');
                  return;
                }
                Alert.alert('Teşekkürler', 'Geri bildiriminiz geliştirici ekibine iletildi.');
                setFeedbackText('');
                setActiveModal(null);
              }}
              style={{ marginTop: Spacing.three }}
            >
              Gönder
            </Button>
            <Button variant="secondary" onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.two }}>
              Vazgeç
            </Button>
          </View>
        </View>
      </Modal>

      {/* 8. HAKKINDA MODALI */}
      <Modal visible={activeModal === 'about'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Hypertrophy-X Hakkında</Text>
            <Text style={styles.modalDesc}>
              Hipertrofi odaklı bilimsel antrenman, RIR/RPE takibi, progresif yükleme (progressive overload) ve hacim optimizasyon platformu.
            </Text>

            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Sürüm</Text>
              <Text style={styles.aboutVal}>v4.0.0 (Production)</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Framework</Text>
              <Text style={styles.aboutVal}>Expo SDK 58 / React Native</Text>
            </View>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Geliştirici</Text>
              <Text style={styles.aboutVal}>Hypertrophy-X Core Team</Text>
            </View>

            <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.four }}>
              Kapat
            </Button>
          </View>
        </View>
      </Modal>

      {/* 9. HESAP VE GÜVENLİK MODALI */}
      <Modal visible={activeModal === 'account'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />

            {accountSubView === 'info' && (
              <>
                <Text style={styles.modalTitle}>Hesap ve Güvenlik</Text>
                <Text style={styles.modalDesc}>
                  Profil güvenliği, e-posta ve şifre yönetimi ayarlarınız.
                </Text>

                <View style={styles.accountDetailBox}>
                  <Text style={styles.accountDetailLabel}>Kullanıcı Adı</Text>
                  <Text style={styles.accountDetailVal}>{user?.username || '-'}</Text>
                </View>

                <View style={styles.accountDetailBox}>
                  <Text style={styles.accountDetailLabel}>Kayıtlı E-posta</Text>
                  <Text style={styles.accountDetailVal}>{user?.email || 'Tanımlanmamış'}</Text>
                </View>

                <View style={styles.accountDetailBox}>
                  <Text style={styles.accountDetailLabel}>Hesap Rolü</Text>
                  <Text style={styles.accountDetailVal}>{user?.is_admin ? 'Yönetici' : 'Sporcu'}</Text>
                </View>

                <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
                  <Button
                    variant="secondary"
                    onPress={() => {
                      setEmailStep('request');
                      setNewEmail('');
                      setEmailOtpCode('');
                      setAccountSubView('changeEmail');
                    }}
                  >
                    E-posta Adresini Değiştir
                  </Button>

                  <Button
                    variant="secondary"
                    onPress={() => {
                      setPasswordStep('request');
                      setOldPassword('');
                      setNewPassword('');
                      setPasswordOtpCode('');
                      setAccountSubView('changePassword');
                    }}
                  >
                    Şifre Değiştir
                  </Button>
                </View>

                <Button onPress={() => setActiveModal(null)} style={{ marginTop: Spacing.three }}>
                  Kapat
                </Button>
              </>
            )}

            {accountSubView === 'changeEmail' && (
              <>
                <Text style={styles.modalTitle}>E-posta Güncelleme</Text>
                {emailStep === 'request' ? (
                  <>
                    <Text style={styles.modalDesc}>
                      Yeni e-posta adresinizi girin. Bu adrese 6 haneli doğrulama kodu gönderilecektir.
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="yeni.eposta@ornek.com"
                      placeholderTextColor="#6b7280"
                      value={newEmail}
                      onChangeText={setNewEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                    <View style={styles.dangerModalActions}>
                      <Button variant="secondary" onPress={() => setAccountSubView('info')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleRequestEmail} loading={isRequestingEmail} style={{ flex: 1.2 }}>
                        Kod Gönder
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalDesc}>
                      {newEmail} adresine gönderilen 6 haneli doğrulama kodunu girin:
                    </Text>
                    <TextInput
                      style={[styles.modalInput, { textAlign: 'center', fontSize: 20, letterSpacing: 4 }]}
                      placeholder="123456"
                      placeholderTextColor="#6b7280"
                      value={emailOtpCode}
                      onChangeText={setEmailOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <View style={styles.dangerModalActions}>
                      <Button variant="secondary" onPress={() => setEmailStep('request')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleConfirmEmail} loading={isConfirmingEmail} style={{ flex: 1.2 }}>
                        Onayla
                      </Button>
                    </View>
                  </>
                )}
              </>
            )}

            {accountSubView === 'changePassword' && (
              <>
                <Text style={styles.modalTitle}>Şifre Değiştirme</Text>
                {passwordStep === 'request' ? (
                  <>
                    <Text style={styles.modalDesc}>
                      Mevcut şifrenizi ve en az 6 haneli yeni şifrenizi girin.
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Mevcut Şifre"
                      placeholderTextColor="#6b7280"
                      value={oldPassword}
                      onChangeText={setOldPassword}
                      secureTextEntry
                    />
                    <TextInput
                      style={[styles.modalInput, { marginTop: Spacing.two }]}
                      placeholder="Yeni Şifre (en az 6 karakter)"
                      placeholderTextColor="#6b7280"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                    <View style={styles.dangerModalActions}>
                      <Button variant="secondary" onPress={() => setAccountSubView('info')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleRequestPassword} loading={isRequestingPassword} style={{ flex: 1.2 }}>
                        Kod Gönder
                      </Button>
                    </View>
                  </>
                ) : (
                  <>
                    <Text style={styles.modalDesc}>
                      Kayıtlı e-posta adresinize gönderilen 6 haneli onay kodunu girin:
                    </Text>
                    <TextInput
                      style={[styles.modalInput, { textAlign: 'center', fontSize: 20, letterSpacing: 4 }]}
                      placeholder="123456"
                      placeholderTextColor="#6b7280"
                      value={passwordOtpCode}
                      onChangeText={setPasswordOtpCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <View style={styles.dangerModalActions}>
                      <Button variant="secondary" onPress={() => setPasswordStep('request')} style={{ flex: 1 }}>
                        Geri
                      </Button>
                      <Button onPress={handleConfirmPassword} loading={isConfirmingPassword} style={{ flex: 1.2 }}>
                        Şifreyi Güncelle
                      </Button>
                    </View>
                  </>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 10. HESAP SİLME MODALI (TEHLİKELİ BÖLGE) */}
      <Modal visible={activeModal === 'deleteAccount'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { borderColor: '#ef4444', borderWidth: 1.5 }]}>
            <View style={[styles.modalHandle, { backgroundColor: '#ef4444' }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.two }}>
              <TrashIcon size={22} color="#ef4444" />
              <Text style={[styles.modalTitle, { color: '#ef4444', marginBottom: 0 }]}>
                Hesabı Kalıcı Olarak Sil
              </Text>
            </View>
            <Text style={styles.modalDesc}>
              Bu işlem kesinlikle geri alınamaz. Antrenman geçmişiniz, programlarınız ve tüm
              verileriniz sistemden tamamen silinecektir. Devam etmek için şifrenizi girin ve
              onay kutusuna büyük harflerle{' '}
              <Text style={{ fontWeight: '800', color: '#ffffff' }}>
                HESABIMI KALICI OLARAK SİL
              </Text>{' '}
              yazın.
            </Text>

            <Text style={[styles.modalSubheading, { marginTop: Spacing.two }]}>MEVCUT ŞİFRENİZ</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Şifrenizi girin"
              placeholderTextColor="#6b7280"
              value={deletePassword}
              onChangeText={setDeletePassword}
              secureTextEntry
            />

            <Text style={[styles.modalSubheading, { marginTop: Spacing.two }]}>ONAY METNİ</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="HESABIMI KALICI OLARAK SİL"
              placeholderTextColor="#6b7280"
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
              autoCapitalize="characters"
            />

            <View style={styles.dangerModalActions}>
              <Button
                variant="secondary"
                onPress={() => setActiveModal(null)}
                style={{ flex: 1 }}
              >
                Vazgeç
              </Button>
              <Button
                variant="danger"
                onPress={handleDeleteAccount}
                loading={isDeletingAccount}
                disabled={
                  deleteConfirmationText.trim() !== 'HESABIMI KALICI OLARAK SİL' ||
                  !deletePassword
                }
                style={{ flex: 1.2 }}
              >
                Hesabı Sil
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* 11. ÇIKIŞ YAP ONAY DİYALOĞU */}
      <ConfirmDialog
        visible={logoutConfirmVisible}
        title="Oturumu Kapat"
        message="Hesabınızdan çıkış yapmak istediğinize emin misiniz? Oturumunuz bu cihazda güvenle sonlandırılacaktır."
        confirmText="Çıkış Yap"
        cancelText="Vazgeç"
        destructive
        busy={isLoggingOut}
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirmVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121214',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2227',
    backgroundColor: '#121214',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a1b1e',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2d3139',
  },
  headerTitle: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerRightPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1b1e',
    borderRadius: Radius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#2d3139',
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  userBannerInfo: {
    flex: 1,
  },
  userBannerName: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  userBannerEmail: {
    fontSize: Typography.small,
    color: '#909296',
  },
  planBadge: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  planBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#60a5fa',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
    paddingLeft: Spacing.one,
  },
  groupCard: {
    backgroundColor: '#1a1b1e',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#2d3139',
    marginBottom: Spacing.four,
    overflow: 'hidden',
  },
  logoutCard: {
    borderColor: '#450a0a',
    backgroundColor: '#181214',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#252830',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.two,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#24272f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  destructiveIconWrapper: {
    backgroundColor: '#3b1219',
  },
  textWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  destructiveTitle: {
    color: '#ef4444',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#909296',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#262933',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: Spacing.two,
    borderWidth: 1,
    borderColor: '#343845',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#93c5fd',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#4b5563',
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
  },

  // Modal Sheet Stilleri
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#1a1b1e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.four,
    borderTopWidth: 1,
    borderTopColor: '#2d3139',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4b5563',
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: Spacing.one,
  },
  modalDesc: {
    fontSize: 13,
    color: '#909296',
    marginBottom: Spacing.three,
    lineHeight: 18,
  },
  modalSubheading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: 0.5,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radius.md,
    backgroundColor: '#252830',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#343845',
  },
  optionBtnActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  optionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9ca3af',
  },
  optionBtnTextActive: {
    color: '#ffffff',
  },
  modalRadioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: '#252830',
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: '#343845',
  },
  modalRadioItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#172554',
  },
  modalRadioText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d1d5db',
  },
  modalRadioTextActive: {
    color: '#ffffff',
  },
  checkmarkText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '800',
  },
  timerPillsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  timerPill: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#252830',
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#343845',
  },
  timerPillActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  timerPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9ca3af',
  },
  timerPillTextActive: {
    color: '#ffffff',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#262933',
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#909296',
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#262933',
  },
  integrationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  integrationDesc: {
    fontSize: 12,
    color: '#909296',
  },
  feedbackInput: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#2d3139',
    borderRadius: Radius.md,
    padding: Spacing.three,
    color: '#ffffff',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262933',
  },
  aboutLabel: {
    fontSize: 13,
    color: '#909296',
  },
  aboutVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  accountDetailBox: {
    backgroundColor: '#252830',
    padding: Spacing.three,
    borderRadius: Radius.md,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: '#343845',
  },
  accountDetailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  accountDetailVal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  connectBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    minHeight: 36,
  },
  dangerCard: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
  },
  modalInput: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#2d3139',
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: 10,
    fontSize: 14,
    color: '#ffffff',
  },
  dangerModalActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
});
