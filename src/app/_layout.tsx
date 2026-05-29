import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = isDark ? Colors.dark : Colors.light;

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
      primary: palette.tint,
    },
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerStyle: { backgroundColor: palette.background },
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: palette.background },
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="elections" options={{ title: 'Your Elections' }} />
          <Stack.Screen name="questionnaire" options={{ title: 'Find Your Match' }} />
          <Stack.Screen name="ballot" options={{ title: 'Your Ballot' }} />
          <Stack.Screen name="candidate/[id]" options={{ title: 'Candidate' }} />
          <Stack.Screen name="chat" options={{ title: 'Ask about candidate' }} />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
