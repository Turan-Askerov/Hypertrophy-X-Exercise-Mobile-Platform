import { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { useUser } from '@/hooks/use-user';
import { formatTrDate } from '@/lib/rpe';
import type { User } from '@/types/user';

function ProfileForm({
  user,
  onSave,
  saving,
}: {
  user: User;
  onSave: (data: {
    age: number | null;
    gender: string;
    height: number | null;
    weight: number | null;
    fitness_level: string;
    goal: string;
    days_per_week: number;
    session_time_mins: number;
  }) => Promise<void>;
  saving: boolean;
}) {
  const [age, setAge] = useState(user.age ? String(user.age) : '');
  const [gender, setGender] = useState(user.gender || 'Erkek');
  const [height, setHeight] = useState(user.height ? String(user.height) : '');
  const [weight, setWeight] = useState(user.weight ? String(user.weight) : '');
  const [fitnessLevel, setFitnessLevel] = useState(user.fitness_level || 'Orta');
  const [goal, setGoal] = useState(user.goal || 'hypertrophy');
  const [daysPerWeek, setDaysPerWeek] = useState(
    user.days_per_week ? String(user.days_per_week) : '4'
  );
  const [sessionTimeMins, setSessionTimeMins] = useState(
    user.session_time_mins ? String(user.session_time_mins) : '60'
  );

  const handleSubmit = () => {
    onSave({
      age: age ? parseInt(age, 10) : null,
      gender,
      height: height ? parseFloat(height) : null,
      weight: weight ? parseFloat(weight) : null,
      fitness_level: fitnessLevel,
      goal,
      days_per_week: daysPerWeek ? parseInt(daysPerWeek, 10) : 4,
      session_time_mins: sessionTimeMins ? parseInt(sessionTimeMins, 10) : 60,
    });
  };

  return (
    <Card style={styles.formCard}>
      <Text style={styles.sectionHeader}>Atletik Profil</Text>

      <View style={styles.formRow}>
        <View style={styles.formCol}>
          <Text style={styles.label}>Yaş</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            placeholder="Örn: 24"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        <View style={styles.formCol}>
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.segmentedRow}>
            {['Erkek', 'Kadın'].map((g) => (
              <TouchableOpacity
                key={g}
                style={[
                  styles.segmentBtn,
                  gender === g && styles.segmentBtnActive,
                ]}
                onPress={() => setGender(g)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    gender === g && styles.segmentTextActive,
                  ]}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formCol}>
          <Text style={styles.label}>Boy (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="decimal-pad"
            placeholder="Örn: 178"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        <View style={styles.formCol}>
          <Text style={styles.label}>Kilo (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="Örn: 76.5"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Fitness Seviyesi</Text>
        <View style={styles.segmentedRow}>
          {['Başlangıç', 'Orta', 'İleri'].map((lvl) => (
            <TouchableOpacity
              key={lvl}
              style={[
                styles.segmentBtn,
                fitnessLevel === lvl && styles.segmentBtnActive,
              ]}
              onPress={() => setFitnessLevel(lvl)}
            >
              <Text
                style={[
                  styles.segmentText,
                  fitnessLevel === lvl && styles.segmentTextActive,
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Hedef</Text>
        <View style={styles.segmentedRow}>
          {[
            { key: 'hypertrophy', label: 'Kas (Hipertrofi)' },
            { key: 'bulk', label: 'Kilo Alma' },
            { key: 'cut', label: 'Yağ Yakımı' },
            { key: 'strength', label: 'Güç' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.segmentBtn,
                goal === item.key && styles.segmentBtnActive,
              ]}
              onPress={() => setGoal(item.key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  goal === item.key && styles.segmentTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formRow}>
        <View style={styles.formCol}>
          <Text style={styles.label}>Haftalık Gün</Text>
          <TextInput
            style={styles.input}
            value={daysPerWeek}
            onChangeText={setDaysPerWeek}
            keyboardType="number-pad"
            placeholder="Örn: 4"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>

        <View style={styles.formCol}>
          <Text style={styles.label}>Seans (dk)</Text>
          <TextInput
            style={styles.input}
            value={sessionTimeMins}
            onChangeText={setSessionTimeMins}
            keyboardType="number-pad"
            placeholder="Örn: 60"
            placeholderTextColor={Colors.dark.textSecondary}
          />
        </View>
      </View>

      <Button onPress={handleSubmit} loading={saving} disabled={saving}>
        Profili Güncelle
      </Button>
    </Card>
  );
}

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const {
    user,
    loading,
    error,
    refetch,
    updateProfile,
    isUpdatingProfile,
    requestEmailUpdate,
    isRequestingEmail,
    confirmEmailUpdate,
    isConfirmingEmail,
    requestChangePassword,
    isRequestingPassword,
    confirmChangePassword,
    isConfirmingPassword,
    deleteAccount,
    isDeletingAccount,
  } = useUser();

  // E-posta Güncelleme State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailOtpToken, setEmailOtpToken] = useState('');
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailStep, setEmailStep] = useState<'request' | 'confirm'>('request');

  // Şifre Değiştirme State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordOtpToken, setPasswordOtpToken] = useState('');
  const [passwordOtpCode, setPasswordOtpCode] = useState('');
  const [passwordStep, setPasswordStep] = useState<'request' | 'confirm'>('request');

  // Hesap Silme State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Çıkış Diyaloğu
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  // Profil Güncelleme
  const handleSaveProfile = async (formData: {
    age: number | null;
    gender: string;
    height: number | null;
    weight: number | null;
    fitness_level: string;
    goal: string;
    days_per_week: number;
    session_time_mins: number;
  }) => {
    if (!user) return;
    try {
      await updateProfile({
        username: user.username,
        ...formData,
      });
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Profil güncellenemedi.');
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
      setEmailModalOpen(false);
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
      Alert.alert(
        'Uyarı',
        'Mevcut şifrenizi ve en az 6 karakterli yeni şifrenizi girin.'
      );
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
      Alert.alert('Uyarı', 'Lütfen 6 haneli doğrulama kodunu girin.');
      return;
    }
    try {
      const res = await confirmChangePassword({
        token: passwordOtpToken,
        code: passwordOtpCode.trim(),
      });
      Alert.alert('Başarılı', res.message);
      setPasswordModalOpen(false);
      setPasswordStep('request');
      setOldPassword('');
      setNewPassword('');
      setPasswordOtpCode('');
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Şifre güncellenemedi.');
    }
  };

  // Hesabı Silme
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
            setDeleteModalOpen(false);
            signOut();
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert('Hata', err?.message || 'Hesap silinemedi.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Skeleton height={80} style={{ marginBottom: Spacing.three }} />
          <Skeleton height={200} style={{ marginBottom: Spacing.three }} />
          <Skeleton height={150} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            {error?.message || 'Kullanıcı bilgileri yüklenemedi.'}
          </Text>
          <Button onPress={() => refetch()}>Tekrar Dene</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Profil & Ayarlar</Text>

        {/* 1. Kullanıcı Başlık Kartı */}
        <Card style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.emailText}>{user.email || 'E-posta eklenmedi'}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {user.is_admin ? 'Yönetici' : 'Sporcu'}
              </Text>
            </View>
            {user.created_at ? (
              <Text style={styles.dateSubtext}>
                Kayıt: {formatTrDate(user.created_at)}
              </Text>
            ) : null}
          </View>
        </Card>

        {/* 2. Atletik Profil Formu */}
        <ProfileForm
          key={user.id}
          user={user}
          onSave={handleSaveProfile}
          saving={isUpdatingProfile}
        />

        {/* 3. Güvenlik ve Hesap Yönetimi */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionHeader}>Güvenlik & Hesap</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              setEmailStep('request');
              setEmailOtpCode('');
              setEmailModalOpen(true);
            }}
          >
            <View>
              <Text style={styles.actionTitle}>E-posta Değiştir</Text>
              <Text style={styles.actionSubtext}>
                Mevcut: {user.email || 'Tanımlı değil'}
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              setPasswordStep('request');
              setOldPassword('');
              setNewPassword('');
              setPasswordOtpCode('');
              setPasswordModalOpen(true);
            }}
          >
            <View>
              <Text style={styles.actionTitle}>Şifre Değiştir</Text>
              <Text style={styles.actionSubtext}>
                E-posta onay koduyla güvenli şifre yenileme
              </Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => setSignOutDialogOpen(true)}
          >
            <Text style={[styles.actionTitle, { color: AppColors.warning }]}>
              Oturumu Kapat (Çıkış)
            </Text>
            <Text style={[styles.actionArrow, { color: AppColors.warning }]}>
              ›
            </Text>
          </TouchableOpacity>
        </Card>

        {/* 4. Tehlikeli Bölge: Hesabı Sil */}
        <Card style={[styles.formCard, styles.dangerCard]}>
          <Text style={[styles.sectionHeader, { color: AppColors.danger }]}>
            Tehlikeli Bölge
          </Text>
          <Text style={styles.dangerDesc}>
            Hesabınızı sildiğinizde antrenman geçmişiniz, programlarınız ve tüm
            verileriniz geri döndürülemez biçimde silinir.
          </Text>
          <Button
            variant="danger"
            onPress={() => {
              setDeletePassword('');
              setDeleteConfirmationText('');
              setDeleteModalOpen(true);
            }}
          >
            Hesabımı Kalıcı Olarak Sil
          </Button>
        </Card>

        {/* E-posta Güncelleme Modal'ı */}
        <Modal
          visible={emailModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setEmailModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>E-posta Güncelleme</Text>

              {emailStep === 'request' ? (
                <>
                  <Text style={styles.modalSubtext}>
                    Yeni e-posta adresinizi girin. Bu adrese 6 haneli doğrulama
                    kodu gönderilecektir.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="yeni.eposta@ornek.com"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <View style={styles.modalActions}>
                    <Button
                      variant="secondary"
                      onPress={() => setEmailModalOpen(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      onPress={handleRequestEmail}
                      loading={isRequestingEmail}
                    >
                      Kod Gönder
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalSubtext}>
                    {newEmail} adresine gönderilen 6 haneli kodu girin:
                  </Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={emailOtpCode}
                    onChangeText={setEmailOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <View style={styles.modalActions}>
                    <Button
                      variant="secondary"
                      onPress={() => setEmailStep('request')}
                    >
                      Geri
                    </Button>
                    <Button
                      onPress={handleConfirmEmail}
                      loading={isConfirmingEmail}
                    >
                      Onayla ve Güncelle
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Şifre Değiştirme Modal'ı */}
        <Modal
          visible={passwordModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setPasswordModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Şifre Değiştirme</Text>

              {passwordStep === 'request' ? (
                <>
                  <Text style={styles.modalSubtext}>
                    Mevcut şifrenizi ve yeni şifrenizi girin. Kayıtlı e-postanıza
                    onay kodu gönderilecektir.
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mevcut Şifre"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                  />
                  <TextInput
                    style={[styles.input, { marginTop: Spacing.two }]}
                    placeholder="Yeni Şifre (en az 6 karakter)"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                  <View style={styles.modalActions}>
                    <Button
                      variant="secondary"
                      onPress={() => setPasswordModalOpen(false)}
                    >
                      İptal
                    </Button>
                    <Button
                      onPress={handleRequestPassword}
                      loading={isRequestingPassword}
                    >
                      Kod Gönder
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.modalSubtext}>
                    E-posta adresinize gönderilen 6 haneli onay kodunu girin:
                  </Text>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="123456"
                    placeholderTextColor={Colors.dark.textSecondary}
                    value={passwordOtpCode}
                    onChangeText={setPasswordOtpCode}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <View style={styles.modalActions}>
                    <Button
                      variant="secondary"
                      onPress={() => setPasswordStep('request')}
                    >
                      Geri
                    </Button>
                    <Button
                      onPress={handleConfirmPassword}
                      loading={isConfirmingPassword}
                    >
                      Şifreyi Güncelle
                    </Button>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Hesap Silme Modal'ı */}
        <Modal
          visible={deleteModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDeleteModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { borderColor: AppColors.danger }]}>
              <Text style={[styles.modalTitle, { color: AppColors.danger }]}>
                Hesabı Kalıcı Olarak Sil
              </Text>
              <Text style={styles.modalSubtext}>
                Bu işlem kesinlikle geri alınamaz. Devam etmek için şifrenizi
                girin ve aşağıdaki alana büyük harflerle{' '}
                <Text style={{ fontWeight: '800', color: '#fff' }}>
                  HESABIMI KALICI OLARAK SİL
                </Text>{' '}
                yazın.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Mevcut Şifreniz"
                placeholderTextColor={Colors.dark.textSecondary}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
              />

              <TextInput
                style={[styles.input, { marginTop: Spacing.two }]}
                placeholder="HESABIMI KALICI OLARAK SİL"
                placeholderTextColor={Colors.dark.textSecondary}
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                autoCapitalize="characters"
              />

              <View style={styles.modalActions}>
                <Button
                  variant="secondary"
                  onPress={() => setDeleteModalOpen(false)}
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
                >
                  Hesabı Sil
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Çıkış Yap Diyaloğu */}
        <ConfirmDialog
          visible={signOutDialogOpen}
          title="Çıkış Yap"
          message="Oturumunuz kapatılacak. Emin misiniz?"
          confirmText="Çıkış Yap"
          onConfirm={() => {
            setSignOutDialogOpen(false);
            signOut();
          }}
          onCancel={() => setSignOutDialogOpen(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six * 2,
    gap: Spacing.three,
  },
  screenTitle: {
    fontSize: Typography.title,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: Spacing.one,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  errorText: {
    fontSize: Typography.body,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.three,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: AppColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  username: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  emailText: {
    fontSize: Typography.label,
    color: Colors.dark.textSecondary,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: AppColors.primaryMuted,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  roleBadgeText: {
    fontSize: Typography.small,
    fontWeight: '700',
    color: AppColors.primary,
  },
  dateSubtext: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  formCard: {
    backgroundColor: Colors.dark.backgroundElement,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  sectionHeader: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: Colors.dark.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  formCol: {
    flex: 1,
    gap: 4,
  },
  formGroup: {
    gap: 4,
  },
  label: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  input: {
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    fontSize: Typography.body,
    color: Colors.dark.text,
  },
  segmentedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  segmentBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  segmentBtnActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  segmentText: {
    fontSize: Typography.small,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  actionTitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  actionSubtext: {
    fontSize: Typography.small,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
  actionArrow: {
    fontSize: 22,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  rowDivider: {
    height: 1,
    backgroundColor: AppColors.border,
  },
  dangerCard: {
    borderColor: AppColors.dangerMuted,
  },
  dangerDesc: {
    fontSize: Typography.small,
    color: Colors.dark.textSecondary,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: AppColors.border,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  modalTitle: {
    fontSize: Typography.heading,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  modalSubtext: {
    fontSize: Typography.label,
    color: Colors.dark.textSecondary,
    lineHeight: 20,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 8,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
