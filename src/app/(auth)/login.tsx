import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextInputInstance,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { FormScreen } from '@/components/ui/form-screen';
import { TextField } from '@/components/ui/text-field';
import { formatWait, authFailureFrom } from '@/lib/auth-error';
import { validateLoginPassword, validateLoginUsername } from '@/lib/validators';

// ─── SVG Logo & İkonlar ───
function ShieldLogo() {
  return (
    <View style={styles.logoContainer}>
      <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
        {/* Dış Kalkan Çizgisi */}
        <Path
          d="M36 6L14 16v20c0 16 9.5 24 22 28 12.5-4 22-12 22-28V16L36 6z"
          stroke="#C084FC"
          strokeWidth={3}
          strokeLinejoin="round"
          fill="rgba(139, 92, 246, 0.14)"
        />
        {/* Kalkan İçi Kas / Halter Silüeti */}
        <Path
          d="M26 34h20M23 30v8M49 30v8M36 24v12"
          stroke="#C084FC"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={styles.brandTitle}>Hypertrophy-X</Text>
      <Text style={styles.brandTagline}>STRONGER EVERY DAY</Text>
    </View>
  );
}

function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
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
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="#FFFFFF">
      <Path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.58.66-1.09 1.73-.95 2.76.99.08 2.03-.53 2.68-1.26z" />
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

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const passwordRef = useRef<TextInputInstance>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // "Çok fazla deneme" geri sayımı
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleSubmit() {
    if (busy || cooldown > 0) return;

    const uError = validateLoginUsername(username);
    const pError = validateLoginPassword(password);
    setUsernameError(uError);
    setPasswordError(pError);
    setFormError(null);
    if (uError !== null || pError !== null) return;

    setBusy(true);
    try {
      await signIn(username, password);
    } catch (err) {
      const failure = authFailureFrom(err);
      setFormError(failure.message);
      setCooldown(failure.cooldownSeconds);
      setBusy(false);
    }
  }

  return (
    <FormScreen
      headerElement={
        <View style={styles.headerBox}>
          <ShieldLogo />
          <View style={styles.welcomeTextRow}>
            <Text style={styles.welcomeWhite}>Hoş Geldiniz, </Text>
            <Text style={styles.welcomeLime}>Welcome</Text>
          </View>
          <Text style={styles.welcomeDesc}>
            Antrenman, beslenme ve kişisel gelişim için hepsi bir arada yapay zeka rehberiniz.
          </Text>
        </View>
      }
    >
      {/* Sosyal Giriş Butonları (Google / Apple) */}
      <View style={styles.socialButtonsContainer}>
        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
          <GoogleIcon />
          <Text style={styles.socialBtnText}>Google ile Devam Et</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
          <AppleIcon />
          <Text style={styles.socialBtnText}>Apple ile Devam Et</Text>
        </TouchableOpacity>
      </View>

      {/* Ayrım Çizgisi */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>veya kullanıcı adı ile</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Giriş Formu */}
      <TextField
        label="Kullanıcı Adı"
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
        placeholder="Kullanıcı adınızı girin"
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
        placeholder="••••••••"
        onSubmitEditing={handleSubmit}
      />

      {formError !== null && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{formError}</Text>
        </View>
      )}

      {/* Ana Giriş Butonu (Neon Lime) */}
      <Button
        title={cooldown > 0 ? `Tekrar denemek için ${formatWait(cooldown)}` : 'Giriş Yap'}
        onPress={handleSubmit}
        loading={busy}
        disabled={cooldown > 0}
        rightIcon={<ArrowRightIcon />}
        style={styles.loginBtn}
      />

      {/* Alt Bağlantılar */}
      <View style={styles.linksRow}>
        <Link href="/forgot-password" style={styles.linkMuted}>
          Şifremi unuttum
        </Link>
        <Link href="/register" style={styles.linkLime}>
          Hesap oluştur →
        </Link>
      </View>

      {/* Misafir Olarak Devam Et */}
      <TouchableOpacity
        style={styles.guestRow}
        activeOpacity={0.8}
        onPress={() => router.replace('/(app)/(tabs)')}
      >
        <Text style={styles.guestTextMuted}>Denemek için </Text>
        <Text style={styles.guestTextLime}>misafir olarak devam et</Text>
      </TouchableOpacity>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
    marginTop: 8,
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C084FC',
    letterSpacing: 2,
    marginTop: 2,
  },
  welcomeTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  welcomeWhite: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeLime: {
    fontSize: 22,
    fontWeight: '800',
    color: '#C084FC',
  },
  welcomeDesc: {
    fontSize: 13,
    color: '#8E99AF',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  /* Sosyal Butonlar */
  socialButtonsContainer: {
    gap: 10,
    marginBottom: 20,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 12,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Ayrım */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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
  },

  loginBtn: {
    marginTop: 8,
  },

  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  linkMuted: {
    color: '#8E99AF',
    fontSize: 14,
    fontWeight: '500',
  },
  linkLime: {
    color: '#C084FC',
    fontSize: 14,
    fontWeight: '700',
  },

  guestRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  guestTextMuted: {
    fontSize: 13,
    color: '#8E99AF',
  },
  guestTextLime: {
    fontSize: 13,
    color: '#C084FC',
    fontWeight: '700',
  },
});
