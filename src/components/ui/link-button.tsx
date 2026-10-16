import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
};

export function LinkButton({ title, onPress, disabled = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      hitSlop={8}
      style={styles.wrapper}>
      <Text style={[styles.text, disabled && styles.disabled]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: 10 },
  text: { color: '#2563eb', fontSize: 15, fontWeight: '500' },
  disabled: { color: '#9ca3af' },
});