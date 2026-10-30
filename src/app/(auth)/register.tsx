import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextInputInstance,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { authApi } from '@/api/auth';
import { useAuth } from '@/auth/auth-provider';
import {
  createRegistrationFlow,
  type RegistrationCodeStep,
} from '@/auth/create-registration-flow';
import { CodeEntry } from '@/components/auth/code-entry';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { useCooldown } from '@/hooks/use-cooldown';
import { authFailureFrom } from '@/lib/auth-error';
import {
  validateRegisterForm,
  type RegisterErrors,
  type RegisterValues,
} from '@/lib/validators';

const registrationFlow = createRegistrationFlow({ authApi });

// ─── SVG İkonlar ───
function ShieldLogoSmall() {
  return (
    <View style={styles.logoContainer}>
      <Svg width={54} height={54} viewBox="0 0 72 72" fill="none">
        <Path
          d="M36 6L14 16v20c0 16 9.5 24 22 28 12.5-4 22-12 22-28V16L36 6z"
          stroke="#C084FC"
          strokeWidth={3}
          strokeLinejoin="round"
          fill="rgba(139, 92, 246, 0.14)"
        />
        <Path
          d="M26 34h20M23 30v8M49 30v8M36 24v12"
          stroke="#C084FC"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19l-7-7 7-7"
        stroke="#FFFFFF"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ArrowRightIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 12h14M13 5l7 7-7 7"
        stroke="#000000"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkboxBox, checked && styles.checkboxBoxChecked]}>
      {checked && (
        <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 6L9 17l-5-5"
            stroke="#000000"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      )}
    </View>
  );
}

function GoogleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function AppleIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.03-.53 2.68-1.26z" />
    </Svg>
  );
}

export default function RegisterScreen() {
  const router = useRouter();
  const { completeSignIn } = useAuth();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [codeStep, setCodeStep] = useState<RegistrationCodeStep | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cooldown = useCooldown();

  function clearError(field: keyof RegisterValues) {
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleStart() {
    if (busy || cooldown.seconds > 0) return;

    if (!termsAccepted) {
      setFormError('Lütfen Kullanım Koşulları ve Gizlilik Politikasını onaylayın.');
      return;
    }

    const found = validateRegisterForm({ username, email, password, confirm });
    setErrors(found);
    setFormError(null);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      setCodeStep(await registrationFlow.start({ username, password, email }));
    } catch (err) {
      const failure = authFailureFrom(err);
      setFormError(failure.message);
      cooldown.start(failure.cooldownSeconds);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm(code: string) {
    if (codeStep === null || busy) return;

    setBusy(true);
    setFormError(null);
    try {
      const result = await registrationFlow.confirm(codeStep, code);
      await completeSignIn(result.token, result.user);
    } catch (err) {
      setFormError(authFailureFrom(err).message);
      setBusy(false);
    }
  }

  async function handleResend() {
    if (codeStep === null || busy) return;

    setBusy(true);
    setFormError(null);
    try {
      setCodeStep(await registrationFlow.resend(codeStep));
    } catch (err) {
      setFormError(authFailureFrom(err).message);
    } finally {
      setBusy(false);
    }
  }

  // ─── 2. ADIM: E-POSTA DOĞRULAMA (VertificationCodeSent.png) ───
  if (codeStep !== null) {
    return (
      <FormScreen
        headerElement={
          <View style={styles.headerBox}>
            <TouchableOpacity
              style={styles.backButtonTop}
              onPress={() => {
                setCodeStep(null);
                setFormError(null);
              }}
              activeOpacity={0.7}
            >
              <BackIcon />
            </TouchableOpacity>
            <ShieldLogoSmall />
            <View style={styles.titleRow}>
              <Text style={styles.whiteTitle}>Hesap </Text>
              <Text style={styles.limeTitle}>Doğrulama</Text>
            </View>
            <Text style={styles.codeSubtitle}>
              <Text style={{ color: '#C084FC', fontWeight: '700' }}>{codeStep.maskedEmail}</Text> adresine 6 haneli güvenlik kodu gönderdik.
            </Text>
          </View>
        }
      >
        <CodeEntry
          key={codeStep.ticket}
          busy={busy}
          error={formError}
          submitLabel="Hesabı Doğrula & Başla"
          onSubmit={handleConfirm}
          onResend={handleResend}
          onBack={() => {
            setCodeStep(null);
            setFormError(null);
          }}
          backLabel="Bilgileri Güncelle"
        />
      </FormScreen>
    );
  }

  // ─── 1. ADIM: KAYIT FORMU (RegistrationPage.png) ───
  return (
    <FormScreen
      headerElement={
        <View style={styles.headerBox}>
          <TouchableOpacity
            style={styles.backButtonTop}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/login'))}
            activeOpacity={0.7}
          >
            <BackIcon />
          </TouchableOpacity>

          <ShieldLogoSmall />

          <View style={styles.titleRow}>
            <Text style={styles.limeTitle}>Hesap </Text>
            <Text style={styles.whiteTitle}>Oluştur</Text>
          </View>
          <Text style={styles.registerSubtitle}>
            Hypertrophy-X platformuna katıl ve bilimsel hipertrofi yolculuğuna bugün başla.
          </Text>
        </View>
      }
    >
      <TextField
        label="Kullanıcı Adı"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          clearError('username');
        }}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
        placeholder="Kullanıcı adınızı belirleyin"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <TextField
        label="E-posta Adresi"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearError('email');
        }}
        error={errors.email}
        inputRef={emailRef}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="next"
        placeholder="ornek@email.com"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />

      <TextField
        label="Şifre"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          clearError('password');
        }}
        error={errors.password}
        inputRef={passwordRef}
        passwordToggle
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        returnKeyType="next"
        placeholder="••••••••"
        hint="En az 8 karakter, harf ve rakam içermelidir."
        onSubmitEditing={() => confirmRef.current?.focus()}
      />

      <TextField
        label="Şifreyi Onayla"
        value={confirm}
        onChangeText={(text) => {
          setConfirm(text);
          clearError('confirm');
        }}
        error={errors.confirm}
        inputRef={confirmRef}
        passwordToggle
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="new-password"
        returnKeyType="done"
        placeholder="••••••••"
        onSubmitEditing={handleStart}
      />

      {/* Şartlar ve Koşullar Onay Kutusu */}
      <Pressable
        style={styles.termsRow}
        onPress={() => setTermsAccepted(!termsAccepted)}
      >
        <CheckboxIcon checked={termsAccepted} />
        <Text style={styles.termsText}>
          <Text style={styles.termsLime}>Kullanım Koşulları</Text> ve{' '}
          <Text style={styles.termsLime}>Gizlilik Politikasını</Text> okudum ve kabul ediyorum.
        </Text>
      </Pressable>

      {formError !== null && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      )}

      {/* Ana Buton */}
      <Button
        title={cooldown.seconds > 0 ? `Tekrar denemek için ${cooldown.seconds} sn` : 'Hesap Oluştur'}
        onPress={handleStart}
        loading={busy}
        disabled={cooldown.seconds > 0}
        rightIcon={<ArrowRightIcon />}
        style={styles.submitBtn}
      />

      {/* Sosyal Kayıt Seçenekleri */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>veya</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtonsRow}>
        <TouchableOpacity style={styles.socialHalfBtn} activeOpacity={0.8}>
          <GoogleIcon />
          <Text style={styles.socialHalfBtnText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialHalfBtn} activeOpacity={0.8}>
          <AppleIcon />
          <Text style={styles.socialHalfBtnText}>Apple</Text>
        </TouchableOpacity>
      </View>

      {/* Zaten Hesabınız Var mı? */}
      <View style={styles.loginLinkRow}>
        <Text style={styles.loginLinkMuted}>Zaten bir hesabınız var mı? </Text>
        <Link href="/login" style={styles.loginLinkLime}>
          Giriş Yap
        </Link>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    width: '100%',
  },
  backButtonTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  limeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C084FC',
  },
  whiteTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  registerSubtitle: {
    fontSize: 13,
    color: '#8E99AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
  },
  codeSubtitle: {
    fontSize: 13,
    color: '#8E99AF',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#101524',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#8E99AF',
    lineHeight: 16,
  },
  termsLime: {
    color: '#C084FC',
    fontWeight: '600',
  },

  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },

  submitBtn: {
    marginTop: 4,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 12,
    color: '#6B7280',
    marginHorizontal: 12,
  },

  socialButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialHalfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 10,
  },
  socialHalfBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  loginLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginLinkMuted: {
    fontSize: 13,
    color: '#8E99AF',
  },
  loginLinkLime: {
    fontSize: 13,
    color: '#C084FC',
    fontWeight: '700',
  },
});
