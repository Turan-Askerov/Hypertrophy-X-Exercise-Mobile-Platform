import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/theme';

export type WorkoutTimerBarProps = {
  seconds: number;
  hasStarted: boolean;
  isRunning: boolean;
  onStart: () => void;
  onTogglePause: () => void;
  onFinish: () => void;
  onReset?: () => void;
};

export function formatDuration(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatDurationHuman(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  const parts = [];
  if (hrs > 0) parts.push(`${hrs} sa`);
  if (mins > 0 || hrs > 0) parts.push(`${mins} dk`);
  parts.push(`${secs} sn`);
  return parts.join(' ');
}

export const WorkoutTimerBar = React.memo(function WorkoutTimerBar({
  seconds,
  hasStarted,
  isRunning,
  onStart,
  onTogglePause,
  onFinish,
  onReset,
}: WorkoutTimerBarProps) {
  const timeFormatted = formatDuration(seconds);

  return (
    <View style={styles.container}>
      {/* Sol: Toplam Süre & Durum Göstergesi */}
      <View style={styles.leftGroup}>
        <View style={styles.timeInfo}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Antrenman Süresi</Text>
            {hasStarted && (
              <View
                style={[
                  styles.statusDot,
                  isRunning ? styles.dotRunning : styles.dotPaused,
                ]}
              />
            )}
          </View>
          <Text style={styles.timeText}>{timeFormatted}</Text>
        </View>
      </View>

      {/* Sağ: Başlat / (Durdur/Devam + Temizle + Bitir) Neon Çerçeveli Butonlar */}
      <View style={styles.actionsGroup}>
        {!hasStarted ? (
          /* Başlamadan Önce: Neon Yeşil Çerçeveli "Başlat" Butonu */
          <TouchableOpacity
            style={styles.startBtn}
            onPress={onStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startBtnText}>Başlat</Text>
          </TouchableOpacity>
        ) : (
          /* Başladıktan Sonra: "Durdur / Devam" + "Temizle" + "Bitir" */
          <>
            <TouchableOpacity
              style={[
                styles.pauseBtn,
                isRunning ? styles.pauseBtnRunning : styles.pauseBtnPaused,
              ]}
              onPress={onTogglePause}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pauseBtnText,
                  isRunning ? styles.pauseTextRunning : styles.pauseTextPaused,
                ]}
              >
                {isRunning ? 'Durdur' : 'Devam'}
              </Text>
            </TouchableOpacity>

            {onReset && (
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={onReset}
                activeOpacity={0.7}
              >
                <Text style={styles.resetBtnText}>Temizle</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.finishBtn}
              onPress={onFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.finishBtnText}>Bitir</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0C101D',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInfo: {
    gap: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: AppColors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotRunning: {
    backgroundColor: '#34D399',
  },
  dotPaused: {
    backgroundColor: '#FBBF24',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.4,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  // ─── NEON ÇERÇEVELİ BUTON TASARIMLARI (GÖLGESİZ & İKONSUZ) ───

  // Başlat Butonu (Neon Yeşil Çerçeve)
  startBtn: {
    height: 35,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.2,
  },

  // Durdur / Devam Butonu (Neon Sarı/Amber Çerçeve)
  pauseBtn: {
    height: 33,
    paddingHorizontal: 11,
    borderRadius: 9,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseBtnRunning: {
    borderColor: '#FBBF24',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  pauseBtnPaused: {
    borderColor: '#FDE047',
    backgroundColor: 'rgba(253, 224, 71, 0.18)',
  },
  pauseBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  pauseTextRunning: {
    color: '#FBBF24',
  },
  pauseTextPaused: {
    color: '#FEF08A',
  },

  // Temizle Butonu (Neon Kırmızı / Rose Çerçeve)
  resetBtn: {
    height: 33,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1.4,
    borderColor: 'rgba(239, 68, 68, 0.55)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FCA5A5',
  },

  // Bitir Butonu (Neon Yeşil / Emerald Çerçeve)
  finishBtn: {
    height: 33,
    paddingHorizontal: 14,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.2,
  },
});
