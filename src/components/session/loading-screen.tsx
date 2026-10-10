import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View style={styles.screen}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});