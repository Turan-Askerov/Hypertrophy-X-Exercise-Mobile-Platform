import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native';

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
import { authFailureFrom, formatWait } from '@/lib/auth-error';
import {
  validateRegisterForm,
  type RegisterErrors,
  type RegisterValues,
} from '@/lib/validators';

const registrationFlow = createRegistrationFlow({ authApi });

export default function RegisterScreen() {
  const { completeSignIn } = useAuth();
  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const [codeStep, setCodeStep] = useState<RegistrationCodeStep | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cooldown = useCooldown();

  // Yazmaya başlayınca o alanın hatasını sil (durumu değiştirmeden, kopya üzerinden)
  function clearError(field: keyof RegisterValues) {
    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  // 1. adım: bilgileri gönder, e-postaya kod gelsin
  async function handleStart() {
    if (busy || cooldown.seconds > 0) return;

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

  // 2. adım: kodu onayla, başarılıysa oturum açılır ve bu ekran kendiliğinden kapanır
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

  // Sunucuda "tekrar gönder" ucu yok: kayıt aynı bilgilerle yeniden başlatılır
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

  if (codeStep !== null) {
    return (
      <FormScreen
        title="E-postanı doğrula"
        subtitle={`${codeStep.maskedEmail} adresine 6 haneli bir kod gönderdik. Kod 15 dakika geçerli.`}>
        <CodeEntry
          key={codeStep.ticket}
          busy={busy}
          error={formError}
          submitLabel="Hesabı oluştur"
          onSubmit={handleConfirm}
          onResend={handleResend}
          onBack={() => {
            setCodeStep(null);
            setFormError(null);
          }}
          backLabel="Bilgileri düzenle"
        />
      </FormScreen>
    );
  }

  return (
    <FormScreen title="Hesap oluştur" subtitle="Antrenmanlarını takip etmeye başla">
      <TextField
        label="Kullanıcı adı"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          clearError('username');
        }}
        error={errors.username}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username-new"
        returnKeyType="next"
        onSubmitEditing={() => emailRef.current?.focus()}
      />
      <TextField
        label="E-posta"
        hint="Doğrulama kodunu bu adrese göndereceğiz."
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
        onSubmitEditing={() => confirmRef.current?.focus()}
      />
      <TextField
        label="Şifre tekrarı"
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
        onSubmitEditing={handleStart}
      />

      {formError !== null && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      )}

      <Button
        title={
          cooldown.seconds > 0
            ? `Tekrar denemek için ${formatWait(cooldown.seconds)}`
            : 'Doğrulama kodu gönder'
        }
        onPress={handleStart}
        loading={busy}
        disabled={cooldown.seconds > 0}
      />

      <View style={styles.links}>
        <Link href="/login" replace style={styles.link}>
          Zaten hesabın var mı? Giriş yap
        </Link>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  links: { alignItems: 'center', marginTop: 20 },
  link: { color: '#2563eb', fontSize: 15, fontWeight: '500' },
});