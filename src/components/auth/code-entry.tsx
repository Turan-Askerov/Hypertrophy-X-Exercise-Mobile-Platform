import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LinkButton } from '@/components/ui/link-button';
import { TextField } from '@/components/ui/text-field';
import { useCooldown } from '@/hooks/use-cooldown';
import { validateResetCode } from '@/lib/validators';

const RESEND_WAIT_SECONDS = 30;

type Props = {
  busy: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  backLabel: string;
};

// 6 haneli e-posta kodunu alır. Üst ekran her yeni kod isteğinde bu bileşene yeni bir
// `key` verirse bileşen yeniden oluşur: kod kutusu temizlenir, bekleme süresi baştan başlar.
export function CodeEntry({
  busy,
  error,
  submitLabel,
  onSubmit,
  onResend,
  onBack,
  backLabel,
}: Props) {
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const { seconds, start } = useCooldown();

  useEffect(() => {
    start(RESEND_WAIT_SECONDS);
  }, [start]);

  function handleSubmit() {
    if (busy) return;
    const problem = validateResetCode(code);
    setCodeError(problem);
    if (problem === null) onSubmit(code.trim());
  }

  return (
    <View>
      <TextField
        label="Doğrulama kodu"
        value={code}
        onChangeText={(text) => {
          setCode(text.replace(/\D/g, '').slice(0, 6));
          setCodeError(null);
        }}
        error={codeError}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {error !== null && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <Button title={submitLabel} onPress={handleSubmit} loading={busy} />

      <View style={styles.links}>
        <LinkButton
          title={seconds > 0 ? `Kodu tekrar gönder (${seconds} sn)` : 'Kodu tekrar gönder'}
          onPress={onResend}
          disabled={seconds > 0 || busy}
        />
        <LinkButton title={backLabel} onPress={onBack} disabled={busy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  links: { marginTop: 12 },
});