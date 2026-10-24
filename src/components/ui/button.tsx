import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

import { AppColors } from '@/constants/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

type Props = {
  title?: string;
  children?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}: Props) {
  const inactive = disabled || loading;
  const label = title ?? (typeof children === 'string' ? children : null);

  const variantStyle =
    variant === 'secondary'
      ? styles.secondary
      : variant === 'danger'
      ? styles.danger
      : variant === 'outline'
      ? styles.outline
      : styles.primary;

  const textColor =
    variant === 'outline'
      ? AppColors.primary
      : variant === 'secondary'
      ? '#111'
      : '#fff';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        inactive && styles.inactive,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : label ? (
        <Text style={[styles.text, { color: textColor }]}>{label}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#f1f5f9',
  },
  danger: {
    backgroundColor: '#dc2626',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#2563eb',
  },
  inactive: {
    backgroundColor: '#9ca3af',
    borderColor: '#9ca3af',
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
