import { useState, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextInputInstance,
} from 'react-native';

type Props = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string | null;
  hint?: string;
  inputRef?: Ref<TextInputInstance>;
  passwordToggle?: boolean;
  leftIcon?: React.ReactNode;
};

export function TextField({
  label,
  error,
  hint,
  inputRef,
  passwordToggle = false,
  leftIcon,
  ...inputProps
}: Props) {
  const [hidden, setHidden] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const hasError = typeof error === 'string' && error !== '';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          hasError && styles.fieldError,
        ]}
      >
        {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}
        <TextInput
          {...inputProps}
          ref={inputRef}
          style={styles.input}
          placeholderTextColor="#6B7280"
          accessibilityLabel={label}
          secureTextEntry={passwordToggle ? hidden : inputProps.secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {passwordToggle && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            hitSlop={8}
            style={styles.toggleBtn}
          >
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
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E99AF',
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232A3B',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#13161F',
  },
  fieldFocused: {
    borderColor: '#C6F432',
  },
  fieldError: {
    borderColor: '#EF4444',
  },
  leftIconContainer: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#FFFFFF',
  },
  toggleBtn: {
    paddingVertical: 4,
  },
  toggle: {
    color: '#C6F432',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 8,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  hint: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 6,
  },
});
