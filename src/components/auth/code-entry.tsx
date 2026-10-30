import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputInstance,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Button } from '@/components/ui/button';
import { useCooldown } from '@/hooks/use-cooldown';
import { validateResetCode } from '@/lib/validators';

const RESEND_WAIT_SECONDS = 45;

function LockShieldIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="#C084FC"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 11a3 3 0 016 0v2H9v-2z"
        stroke="#C084FC"
        strokeWidth={1.8}
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

type Props = {
  busy: boolean;
  error: string | null;
  submitLabel: string;
  onSubmit: (code: string) => void;
  onResend: () => void;
  onBack: () => void;
  backLabel: string;
};

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
  const inputRef = useRef<TextInputInstance>(null);
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

  // 6 kutucuğun değerlerini diziye ayır
  const digits = Array.from({ length: 6 }, (_, i) => code[i] || '');

  return (
    <View style={styles.container}>
      {/* 6 Haneli Şık Kutu Gösterimi */}
      <Pressable
        style={styles.boxesRow}
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="button"
        accessibilityLabel="Doğrulama kodu kutuları"
      >
        {digits.map((digit, index) => {
          const isCurrent = index === code.length;
          const isFilled = Boolean(digit);
          return (
            <View
              key={index}
              style={[
                styles.codeBox,
                isFilled && styles.codeBoxFilled,
                isCurrent && styles.codeBoxCurrent,
                Boolean(codeError) && styles.codeBoxError,
              ]}
            >
              <Text style={styles.digitText}>{digit}</Text>
            </View>
          );
        })}
      </Pressable>

      {/* Gizli Gerçek TextInput */}
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={(text) => {
          setCode(text.replace(/\D/g, '').slice(0, 6));
          setCodeError(null);
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        style={styles.hiddenInput}
        autoFocus
      />

      {codeError !== null && <Text style={styles.validationError}>{codeError}</Text>}

      {error !== null && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Kodu Almadınız mı? & Tekrar Gönder */}
      <View style={styles.resendSection}>
        <View style={styles.resendTextRow}>
          <Text style={styles.resendMuted}>Kodu almadınız mı? </Text>
          <TouchableOpacity
            disabled={seconds > 0 || busy}
            onPress={onResend}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.resendAction,
                seconds > 0 && { color: '#6B7280' },
              ]}
            >
              Tekrar Gönder
            </Text>
          </TouchableOpacity>
        </View>

        {seconds > 0 ? (
          <Text style={styles.countdownText}>
            Yeniden gönderim için kalan süre: 00:{seconds < 10 ? `0${seconds}` : seconds}
          </Text>
        ) : null}
      </View>

      {/* Onay Butonu */}
      <Button
        title={submitLabel}
        onPress={handleSubmit}
        loading={busy}
        rightIcon={<ArrowRightIcon />}
        style={styles.submitBtn}
      />

      {/* Geri Dön Butonu */}
      <TouchableOpacity
        onPress={onBack}
        disabled={busy}
        style={styles.backBtnWrap}
        activeOpacity={0.7}
      >
        <Text style={styles.backBtnText}>← {backLabel}</Text>
      </TouchableOpacity>

      {/* Güvenlik Notu */}
      <View style={styles.securityBox}>
        <LockShieldIcon />
        <Text style={styles.securityText}>
          Doğrulama kodunuz uçtan uca şifrelidir ve 10 dakika boyunca geçerlidir.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  boxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: 18,
  },
  codeBox: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#13161F',
    borderWidth: 1.5,
    borderColor: '#232A3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxFilled: {
    borderColor: '#C084FC',
    backgroundColor: '#161E33',
  },
  codeBoxCurrent: {
    borderColor: '#C084FC',
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  codeBoxError: {
    borderColor: '#EF4444',
  },
  digitText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  validationError: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  resendSection: {
    alignItems: 'center',
    marginVertical: 14,
  },
  resendTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendMuted: {
    fontSize: 13,
    color: '#8E99AF',
  },
  resendAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C084FC',
  },
  countdownText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  submitBtn: {
    marginTop: 8,
  },
  backBtnWrap: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E99AF',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13161F',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#232A3B',
    marginTop: 18,
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 11,
    color: '#8E99AF',
    lineHeight: 16,
  },
});
