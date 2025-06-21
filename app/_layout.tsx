import { ConnectionProvider } from '@/components/ConnectionProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageProvider } from '@/components/LanguageProvider';
import { ProjectProvider } from '@/components/ProjectProvider';
import { ThemeProvider as CustomThemeProvider } from '@/components/ThemeProvider';
import '@/global.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

function AppContent() {
  const { user, isLoaded } = useUser();
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <CustomThemeProvider>
      <ProjectProvider userId={user?.id} isUserLoaded={isLoaded}>
        <ConnectionProvider userId={user?.id} isUserLoaded={isLoaded}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar
              style={colorScheme === 'dark' ? 'light' : 'dark'}
              backgroundColor="transparent"
              translucent={true}
            />
          </ThemeProvider>
        </ConnectionProvider>
      </ProjectProvider>
    </CustomThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ClerkProvider
        publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
        tokenCache={tokenCache}
      >
          <LanguageProvider>
            <AppContent />
          </LanguageProvider>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
