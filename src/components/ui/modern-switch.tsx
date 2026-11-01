import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

export interface ModernSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
}

export function ModernSwitch({
  value,
  onValueChange,
  disabled = false,
  activeColor = '#10B981',
  inactiveColor = '#1A2235',
}: ModernSwitchProps) {
  const [anim] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      damping: 18,
      stiffness: 260,
      mass: 0.7,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.12)', 'rgba(52, 211, 153, 0.5)'],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 23],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onValueChange(!value)}
      disabled={disabled}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackBg,
            borderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.2,
    justifyContent: 'center',
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
});
