import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  message: string;
  onRetry: () => void;
};

export function UnreachableScreen({ message, onRetry }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sunucuya ulaşılamıyor</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable style={styles.button} onPress={onRetry}>
        <Text style={styles.buttonText}>Tekrar dene</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, color: '#111' },
  message: { fontSize: 16, textAlign: 'center', marginBottom: 24, color: '#6b7280' },
  button: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: '600' },
});