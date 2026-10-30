import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline';

type Props = {
  title?: string;
  children?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
  rightIcon?: ReactNode;
};

export function Button({
  title,
  children,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
  rightIcon,
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
    variant === 'primary'
      ? '#FFFFFF'
      : variant === 'outline'
      ? '#C084FC'
      : variant === 'secondary'
      ? '#F8FAFC'
      : variant === 'danger'
      ? '#FF7898'
      : '#FFFFFF';

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
        <Text style={[styles.text, { color: inactive ? '#6B7280' : textColor }]}>
          {label}
        </Text>
      ) : (
        children
      )}
      {!loading && rightIcon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    gap: 8,
  },
  primary: {
    backgroundColor: '#8B5CF6',
  },
  secondary: {
    backgroundColor: '#101524',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#C084FC',
  },
  inactive: {
    backgroundColor: '#161E33',
    borderColor: '#161E33',
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
  },
});
