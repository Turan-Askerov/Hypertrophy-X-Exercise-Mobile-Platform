import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { useAuth } from '@/auth/auth-provider';
import { AppProviders } from '@/providers/app-providers';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { LoadingScreen } from '@/components/session/loading-screen';
import { UnreachableScreen } from '@/components/session/unreachable-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { state, retry } = useAuth();

  if (state.status === 'loading') {
    return <LoadingScreen />;
  }
  if (state.status === 'unreachable') {
    return <UnreachableScreen message={state.message} onRetry={retry} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={state.status === 'signedIn'}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={state.status === 'signedOut'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AppProviders>
        <AnimatedSplashOverlay />
        <RootNavigator />
      </AppProviders>
    </ThemeProvider>
  );
}