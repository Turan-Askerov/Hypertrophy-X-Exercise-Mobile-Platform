import { Stack } from 'expo-router';

// Giriş ekranı ilk açılsın (alfabetik sıra "forgot-password"u öne çıkarırdı)
export const unstable_settings = { initialRouteName: 'login', anchor: 'login' };

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}