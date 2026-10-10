import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';

export default function Dashboard() {
  const { state } = useAuth();
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ana sayfa</Text>
      {state.status === 'signedIn' && <Text style={styles.text}>Merhaba {state.user.username}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#111' },
  text: { fontSize: 18, color: '#111' },
});