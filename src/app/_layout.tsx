import { useEffect } from 'react';
import { DarkTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

import { useAuth } from '@/auth/auth-provider';
import { AppProviders } from '@/providers/app-providers';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LoadingScreen } from '@/components/session/loading-screen';
import { UnreachableScreen } from '@/components/session/unreachable-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { state, retry } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Yükleme veya hata durumlarında yönlendirme yapmadan bekle
    if (state.status === 'loading' || state.status === 'unreachable') return;

    // Kullanıcının şu an (auth) klasöründe olup olmadığını kontrol et
    const inAuthGroup = segments[0] === '(auth)';

    if (state.status === 'signedIn' && inAuthGroup) {
      // Giriş yapılmış ama kullanıcı login ekranındaysa ana sekmelere yönlendir
      router.replace('/(app)/(tabs)');
    } else if (state.status === 'signedOut' && !inAuthGroup) {
      // Çıkış yapılmış ama kullanıcı uygulamanın içindeyse dışarı (login'e) at
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

export default function RootLayout() {
  return (
    <ThemeProvider value={DarkTheme}>
      <AppProviders>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AppProviders>
    </ThemeProvider>
  );
}