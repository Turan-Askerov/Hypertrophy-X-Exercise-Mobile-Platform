import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/auth-provider';

export default function Profile() {
  const { state, signOut } = useAuth();
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Profil</Text>
      {state.status === 'signedIn' && <Text style={styles.text}>{state.user.username}</Text>}
      <Pressable style={styles.button} onPress={signOut}>
        <Text style={styles.buttonText}>Çıkış yap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 64 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#111' },
  text: { fontSize: 18, marginBottom: 24, color: '#111' },
  button: { backgroundColor: '#2563eb', padding: 14, borderRadius: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});