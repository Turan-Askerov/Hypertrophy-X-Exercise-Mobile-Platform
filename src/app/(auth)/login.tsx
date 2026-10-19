import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { useCooldown } from '@/hooks/use-cooldown';
import { authFailureFrom, formatWait } from '@/lib/auth-error';
import { validateLoginPassword, validateLoginUsername } from '@/lib/validators';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInput>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const cooldown = useCooldown();

  async function handleSubmit() {
    if (busy || cooldown.seconds > 0) return;

    const uError = validateLoginUsername(username);
    const pError = validateLoginPassword(password);
    setUsernameError(uError);
    setPasswordError(pError);
    setFormError(null);
    if (uError !== null || pError !== null) return;

    setBusy(true);
    try {
      await signIn(username, password);
      // Başarılıysa oturum durumu değişir, bu ekran kendiliğinden kapanır.
    } catch (err) {
      const failure = authFailureFrom(err);
      setFormError(failure.message);
      cooldown.start(failure.cooldownSeconds);
      setBusy(false);
    }
  }

  return (
    <FormScreen title="Hypertrophy-X" subtitle="Hesabına giriş yap">
      <TextField
        label="Kullanıcı adı"
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setUsernameError(null);
        }}
        error={usernameError}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        label="Şifre"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setPasswordError(null);
        }}
        error={passwordError}
        inputRef={passwordRef}
        passwordToggle
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="current-password"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
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
            : 'Giriş yap'
        }
        onPress={handleSubmit}
        loading={busy}
        disabled={cooldown.seconds > 0}
      />

      <View style={styles.links}>
        <Link href="/forgot-password" style={styles.link}>
          Şifremi unuttum
        </Link>
        <Link href="/register" style={styles.link}>
          Hesap oluştur
        </Link>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  links: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  link: { color: '#2563eb', fontSize: 15, fontWeight: '500' },
});