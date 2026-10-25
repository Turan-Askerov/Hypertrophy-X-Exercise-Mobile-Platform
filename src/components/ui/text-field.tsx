import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type TextInputInstance } from 'react-native';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | null;
  hint?: string;
  inputRef?: Ref<TextInputInstance>;
  passwordToggle?: boolean;
};

export function TextField({
  label,
  error,
  hint,
  inputRef,
  passwordToggle = false,
  ...inputProps
}: Props) {
  const [hidden, setHidden] = useState(true);
  const hasError = typeof error === 'string' && error !== '';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, hasError && styles.fieldError]}>
        <TextInput
          {...inputProps}
          ref={inputRef}
          style={styles.input}
          placeholderTextColor="#9ca3af"
          accessibilityLabel={label}
          secureTextEntry={passwordToggle ? hidden : inputProps.secureTextEntry}
        />
        {passwordToggle && (
          <Pressable onPress={() => setHidden((h) => !h)} accessibilityRole="button" hitSlop={8}>
            <Text style={styles.toggle}>{hidden ? 'Göster' : 'Gizle'}</Text>
          </Pressable>
        )}
      </View>
      {hasError && <Text style={styles.error}>{error}</Text>}
      {!hasError && hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  fieldError: { borderColor: '#dc2626' },
  input: { flex: 1, paddingVertical: 12, fontSize: 16, color: '#111' },
  toggle: { color: '#2563eb', fontWeight: '600', marginLeft: 8 },
  error: { color: '#dc2626', fontSize: 13, marginTop: 6 },
  hint: { color: '#6b7280', fontSize: 13, marginTop: 6 },
});