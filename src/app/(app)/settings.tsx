import React from 'react';
import { Redirect } from 'expo-router';

export default function SettingsScreen() {
  return <Redirect href="/(app)/(tabs)/profile" />;
}
