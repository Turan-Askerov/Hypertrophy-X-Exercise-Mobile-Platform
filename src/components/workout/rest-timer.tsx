import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors, Colors, Radius, Spacing, Typography } from '@/constants/theme';

export type RestTimerProps = {
  initialSeconds?: number;
  onClose: () => void;
};

export function RestTimer({
  initialSeconds = 90,
  onClose,
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const addTime = (secs: number) => {
    setSecondsLeft((prev) => prev + secs);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <View style={styles.banner}>
      <View style={styles.info}>
        <Text style={styles.title}>Dinlenme Sayacı</Text>
        <Text
          style={[
            styles.timeText,
            secondsLeft === 0 && styles.finishedText,
          ]}
        >
          {secondsLeft > 0 ? formatTime(secondsLeft) : 'Süre Doldu! 🔥'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.pillBtn}
          onPress={() => addTime(30)}
        >
          <Text style={styles.pillText}>+30s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pillBtn, styles.closeBtn]}
          onPress={onClose}
        >
          <Text style={styles.closeText}>Kapat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: Radius.md,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: AppColors.primary,
    marginBottom: Spacing.two,
  },
  info: {
    gap: 2,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  timeText: {
    fontSize: Typography.heading,
    fontWeight: '800',
    color: AppColors.primary,
  },
  finishedText: {
    color: AppColors.success,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pillBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: AppColors.border,
  },
  pillText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeBtn: {
    backgroundColor: AppColors.dangerMuted,
    borderColor: AppColors.danger,
  },
  closeText: {
    fontSize: Typography.small,
    fontWeight: '600',
    color: AppColors.danger,
  },
});
