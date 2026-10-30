import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  DashboardIcon,
  HistoryIcon,
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

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: Colors.dark.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.dark.background,
          borderTopColor: AppColors.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: paddingBottom,
          paddingTop: 6,
        },
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
        name="history"
        options={{
          title: 'Geçmiş',
          tabBarIcon: ({ color }) => <HistoryIcon color={color} size={20} />,
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
  );
}
