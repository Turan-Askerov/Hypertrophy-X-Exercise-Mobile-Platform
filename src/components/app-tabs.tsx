import { useEffect, useRef, useState } from 'react';
import { Easing, Keyboard, type LayoutChangeEvent, Platform, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DashboardIcon,
  NutritionIcon,
  ProfileIcon,
  ProgramIcon,
  ProgressIcon,
  WorkoutIcon,
} from '@/components/tab-icons';
import { AppColors, Colors } from '@/constants/theme';

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = insets.bottom;
  // Mobil tasarım kılavuzu: 56px sekme çubuğu içeriği + 34px alt safe area (home indicator) = 90px
  const tabHeight = 56 + (bottomInset > 0 ? bottomInset : 8);
  const paddingBottom = bottomInset > 0 ? bottomInset : 8;

  const [restSize, setRestSize] = useState<{ width: number; height: number } | null>(null);
  const [currentHeight, setCurrentHeight] = useState<number | null>(null);
  const latestLayoutRef = useRef<{ width: number; height: number } | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      const latest = latestLayoutRef.current;
      if (latest && latest.height > 200) {
        setRestSize({ width: latest.width, height: latest.height });
        setCurrentHeight(latest.height);
      }
    });
    return () => sub.remove();
  }, []);

  const handleContainerLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width <= 0 || height <= 0) return;
    latestLayoutRef.current = { width, height };
    setCurrentHeight(height);
    setRestSize((prev) => {
      if (!prev || Math.abs(prev.width - width) > 2 || height > prev.height) {
        return { width, height };
      }
      return prev;
    });
  };

  const shrinkDelta =
    Platform.OS === 'android' &&
    restSize !== null &&
    currentHeight !== null &&
    restSize.height > currentHeight
      ? restSize.height - currentHeight
      : 0;
  const isKeyboardViewportShrunk = shrinkDelta > 80;
  const isPinnedFromTop = Platform.OS === 'android' && restSize !== null;

  const baseTabBarStyle = {
    backgroundColor: Colors.dark.background,
    borderTopColor: AppColors.border,
    borderTopWidth: 1,
    height: tabHeight,
    paddingBottom: paddingBottom,
    paddingTop: 6,
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: Colors.dark.background, overflow: 'hidden' }}
      onLayout={handleContainerLayout}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          transitionSpec: {
            animation: 'timing',
            config: {
              duration: 200,
              easing: Easing.out(Easing.cubic),
            },
          },
          sceneStyle: isPinnedFromTop
            ? {
                paddingBottom: isKeyboardViewportShrunk ? 0 : tabHeight,
              }
            : undefined,
          tabBarActiveTintColor: AppColors.primary,
          tabBarInactiveTintColor: Colors.dark.textSecondary,
          tabBarStyle: isPinnedFromTop
            ? {
                ...baseTabBarStyle,
                position: 'absolute',
                left: 0,
                right: 0,
                top: restSize.height - tabHeight,
                bottom: 'auto',
                ...(isKeyboardViewportShrunk ? { pointerEvents: 'none' as const } : {}),
              }
            : baseTabBarStyle,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Genel Bakış',
          tabBarIcon: ({ color }) => <DashboardIcon color={color} size={20} />,
        }}
      />

      <Tabs.Screen
        name="workout"
        options={{
          title: 'Antrenman',
          tabBarIcon: ({ color }) => <WorkoutIcon color={color} size={20} />,
        }}
      />

      <Tabs.Screen
        name="program"
        options={{
          title: 'Özel Program',
          tabBarIcon: ({ color }) => <ProgramIcon color={color} size={20} />,
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'İlerleme',
          tabBarIcon: ({ color }) => <ProgressIcon color={color} size={20} />,
        }}
      />

      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Beslenme',
          tabBarIcon: ({ color }) => <NutritionIcon color={color} size={20} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} size={20} />,
        }}
      />
      </Tabs>
    </View>
  );
}
