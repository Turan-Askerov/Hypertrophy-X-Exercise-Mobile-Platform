import { Tabs } from 'expo-router';

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
          height: 62,
          paddingBottom: 8,
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
