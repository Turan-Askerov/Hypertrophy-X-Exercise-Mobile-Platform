import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { authApi } from '@/api/auth';
import { createResetFlow, type ResetStep } from '@/auth/create-reset-flow';
import { CodeEntry } from '@/components/auth/code-entry';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { useCooldown } from '@/hooks/use-cooldown';
import { authFailureFrom, formatWait } from '@/lib/auth-error';
import {
  validateIdentifier,
  validatePassword,
  validatePasswordConfirm,
} from '@/lib/validators';

const resetFlow = createResetFlow({ authApi });

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>({ step: 'identify' });
  const [identifier, setIdentifier] = useState('');
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cooldown = useCooldown();

  // 1. adım: kimlik (kullanıcı adı ya da e-posta) → kod iste
  async function handleRequestCode() {
    if (busy || cooldown.seconds > 0) return;

    const problem = validateIdentifier(identifier);
    setIdentifierError(problem);
    setFormError(null);
    if (problem !== null) return;

    setBusy(true);
    try {
      setStep(await resetFlow.requestCode(identifier));
    } catch (err) {
      const failure = authFailureFrom(err);
      setFormError(failure.message);
      cooldown.start(failure.cooldownSeconds);
    } finally {
      setBusy(false);
    }
  }

  // 2. adım: kodu doğrula
  async function handleSubmitCode(code: string) {
    if (step.step !== 'code' || busy) return;

    setBusy(true);
    setFormError(null);
    try {
      setStep(await resetFlow.submitCode(step, code));
    } catch (err) {
      setFormError(authFailureFrom(err).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleResend() {
    if (step.step !== 'code' || busy) return;

    setBusy(true);
    setFormError(null);
    try {
      setStep(await resetFlow.resend(step));
    } catch (err) {
      setFormError(authFailureFrom(err).message);
    } finally {
      setBusy(false);
    }
  }

  // 3. adım: yeni şifre
  async function handleNewPassword() {
    if (step.step !== 'newPassword' || busy) return;

    const pError = validatePassword(newPassword);
    const cError = validatePasswordConfirm(newPassword, confirm);
    setPasswordError(pError);
    setConfirmError(cError);
    setFormError(null);
    if (pError !== null || cError !== null) return;

    setBusy(true);
    try {
      setStep(await resetFlow.submitNewPassword(step, newPassword));
    } catch (err) {
      setFormError(authFailureFrom(err).message);
    } finally {
      setBusy(false);
    }
  }

  const errorBox =
    formError !== null ? (
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{formError}</Text>
      </View>
    ) : null;

  if (step.step === 'code') {
    return (
      <FormScreen
        title="Kodu gir"
        subtitle={`Hesap bulunursa ${step.maskedEmail} adresine bir kod gönderdik. Kod ${step.expiresInMinutes} dakika geçerli.`}>
        <CodeEntry
          key={step.resetToken}
          busy={busy}
          error={formError}
          submitLabel="Kodu doğrula"
          onSubmit={handleSubmitCode}
          onResend={handleResend}
          onBack={() => {
            setStep({ step: 'identify' });
            setFormError(null);
          }}
          backLabel="Başka bir hesap dene"
        />
      </FormScreen>
    );
  }

  if (step.step === 'newPassword') {
    return (
      <FormScreen title="Yeni şifre belirle" subtitle="Kod doğrulandı. Şimdi yeni şifreni yaz.">
        <TextField
          label="Yeni şifre"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setPasswordError(null);
          }}
          error={passwordError}
          passwordToggle
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          returnKeyType="next"
        />
        <TextField
          label="Yeni şifre tekrarı"
          value={confirm}
          onChangeText={(text) => {
            setConfirm(text);
            setConfirmError(null);
          }}
          error={confirmError}
          passwordToggle
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          returnKeyType="done"
          onSubmitEditing={handleNewPassword}
        />
        {errorBox}
        <Button title="Şifreyi güncelle" onPress={handleNewPassword} loading={busy} />
      </FormScreen>
    );
  }

  if (step.step === 'done') {
    return (
      <FormScreen title="Şifren güncellendi" subtitle="Yeni şifrenle giriş yapabilirsin.">
        <Button title="Giriş yap" onPress={() => router.replace('/login')} />
      </FormScreen>
    );
  }

  return (
    <FormScreen
      title="Şifreni sıfırla"
      subtitle="Kullanıcı adını ya da e-posta adresini yaz, sana bir kod gönderelim.">
      <TextField
        label="Kullanıcı adı ya da e-posta"
        value={identifier}
        onChangeText={(text) => {
          setIdentifier(text);
          setIdentifierError(null);
        }}
        error={identifierError}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        onSubmitEditing={handleRequestCode}
      />
      {errorBox}
      <Button
        title={
          cooldown.seconds > 0
            ? `Tekrar denemek için ${formatWait(cooldown.seconds)}`
            : 'Kod gönder'
        }
        onPress={handleRequestCode}
        loading={busy}
        disabled={cooldown.seconds > 0}
      />
      <View style={styles.links}>
        <Link href="/login" replace style={styles.link}>
          Girişe dön
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