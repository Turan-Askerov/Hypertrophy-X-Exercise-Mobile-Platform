import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

export interface ModernSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  activeTrackBg?: string;
  inactiveTrackBg?: string;
  activeBorderColor?: string;
  inactiveBorderColor?: string;
  activeThumbColor?: string;
  inactiveThumbColor?: string;
}

export function ModernSwitch({
  value,
  onValueChange,
  disabled = false,
  activeColor = '#10B981',
  inactiveColor = '#64748B',
  activeTrackBg = 'rgba(16, 185, 129, 0.10)',
  inactiveTrackBg = 'rgba(255, 255, 255, 0.03)',
  activeBorderColor,
  inactiveBorderColor = 'rgba(255, 255, 255, 0.12)',
  activeThumbColor,
  inactiveThumbColor,
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

  const resolvedActiveBorder = activeBorderColor ?? activeColor;
  const resolvedActiveThumb = activeThumbColor ?? activeColor;
  const resolvedInactiveThumb = inactiveThumbColor ?? inactiveColor;

  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveTrackBg, activeTrackBg],
  });

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveBorderColor, resolvedActiveBorder],
  });

  const thumbBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [resolvedInactiveThumb, resolvedActiveThumb],
  });

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2.5, 22.5],
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
              backgroundColor: thumbBg,
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
    borderWidth: 1.4,
    justifyContent: 'center',
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
    elevation: 3,
  },
});
