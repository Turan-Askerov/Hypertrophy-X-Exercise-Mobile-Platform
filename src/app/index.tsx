import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';

export default function Index() {
  const { state } = useAuth();

  if (state.status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: '#121214' }} />;
  }

  if (state.status === 'signedIn') {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}