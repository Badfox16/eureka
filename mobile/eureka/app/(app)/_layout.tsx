import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '~/lib/theme/useTheme';
import { system } from '~/lib/theme/colors';

export default function AppLayout() {
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
        name="index"
        options={{
          title: '',
        }}
      />
      <Stack.Screen name="avaliacoes" />
      <Stack.Screen name="avaliacao/[id]" />
      <Stack.Screen name="quiz/[id]" />
      <Stack.Screen name="quizzes" />
      <Stack.Screen name="estatisticas" />
      <Stack.Screen name="perfil" />
    </Stack>
  );
}