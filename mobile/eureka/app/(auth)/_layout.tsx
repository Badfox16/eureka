import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '~/lib/theme/useTheme';

export default function AuthLayout() {
  const { colors, isDark } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background }
      }}
    />
  );
}