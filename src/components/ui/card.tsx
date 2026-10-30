import type { ReactNode } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { AppColors, Colors, Radius, Spacing } from '@/constants/theme';

export type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'outlined';
};

export function Card({
  children,
  style,
  onPress,
  padding = 'md',
  variant = 'default',
}: CardProps) {
  const paddingStyle =
    padding === 'none'
      ? styles.paddingNone
      : padding === 'sm'
      ? styles.paddingSm
      : padding === 'lg'
      ? styles.paddingLg
      : styles.paddingMd;

  const variantStyle =
    variant === 'elevated'
      ? styles.elevated
      : variant === 'outlined'
      ? styles.outlined
      : styles.default;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          variantStyle,
          paddingStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.base, variantStyle, paddingStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    backgroundColor: Colors.dark.backgroundElement,
  },
  default: {
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: AppColors.border,
    backgroundColor: 'transparent',
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Spacing.two,
  },
  paddingMd: {
    padding: Spacing.three,
  },
  paddingLg: {
    padding: Spacing.four,
  },
  pressed: {
    opacity: 0.85,
  },
});
