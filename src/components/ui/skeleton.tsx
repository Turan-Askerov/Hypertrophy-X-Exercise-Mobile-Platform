import { useEffect, useState } from 'react';
import {
  Animated,
  DimensionValue,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { AppColors, Radius } from '@/constants/theme';

export type SkeletonProps = {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  radius?: number; // Geriye dönük uyumluluk alias'ı
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius,
  radius,
  style,
}: SkeletonProps) {
  const [opacity] = useState(() => new Animated.Value(0.4));
  const effectiveRadius = borderRadius ?? radius ?? Radius.sm;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: effectiveRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: AppColors.muted,
  },
});
