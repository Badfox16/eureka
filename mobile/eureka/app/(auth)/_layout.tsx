import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '~/lib/theme/useTheme';
import { system } from '~/lib/theme/colors';

export default function AuthLayout() {
  const { colors, isDark } = useTheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: isDark ? system.background.dark : system.background.light
        },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="cadastro"
        options={{
          title: '',
        }}
      />
    </Stack>
  );
}