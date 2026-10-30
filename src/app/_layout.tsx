import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/auth-provider';
import { AppProviders } from '@/providers/app-providers';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LoadingScreen } from '@/components/session/loading-screen';
import { UnreachableScreen } from '@/components/session/unreachable-screen';

if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}

function RootNavigator() {
  const { state, retry } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Yükleme veya hata durumlarında yönlendirme yapmadan bekle
    if (state.status === 'loading' || state.status === 'unreachable') return;

    // Kullanıcının şu an nerede olduğunu kontrol et
    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (state.status === 'signedIn' && !inAppGroup) {
      // Giriş yapılmış ama kullanıcı (app) dışında bir yerdeyse ana sekmelere yönlendir
      router.replace('/(app)/(tabs)');
    } else if (state.status === 'signedOut' && !inAuthGroup) {
      // Çıkış yapılmış ama kullanıcı uygulamanın içindeyse login'e at
      router.replace('/(auth)/login');
    }
  }, [state.status, segments, router]);

  if (state.status === 'loading') {
    return <LoadingScreen />;
  }
  if (state.status === 'unreachable') {
    return <UnreachableScreen message={state.message} onRetry={retry} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Protected sarmalları yerine doğrudan ekranları tanımlıyoruz */}
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
    </Stack>
  );
}

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#080B14',
    card: '#101524',
    border: 'rgba(255, 255, 255, 0.08)',
    primary: '#C084FC',
    text: '#F8FAFC',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider value={CustomDarkTheme}>
        <AppProviders>
          <StatusBar style="light" />
          <AnimatedSplashOverlay />
          <RootNavigator />
        </AppProviders>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}