import { ConnectionProvider } from '@/components/ConnectionProvider';
import { LanguageProvider } from '@/components/LanguageProvider';
import { ProjectProvider } from '@/components/ProjectProvider';
import { ThemeProvider as CustomThemeProvider } from '@/components/ThemeProvider';
import { VideoSplashScreen } from '@/components/VideoSplashScreen';
import '@/global.css';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ClerkProvider, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

function AppContent() {
  const { user, isLoaded } = useUser();
  const colorScheme = useColorScheme();
  const [showVideoSplash, setShowVideoSplash] = useState(true);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const handleVideoComplete = () => {
    console.log('Layout: Video complete callback triggered');
    setShowVideoSplash(false);
  };

  useEffect(() => {
    console.log('Layout: showVideoSplash state changed to:', showVideoSplash);
  }, [showVideoSplash]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (showVideoSplash) {
    console.log('Layout: Rendering video splash screen');
    return (
      <VideoSplashScreen 
        onVideoComplete={handleVideoComplete} 
      />
    );
  }

  console.log('Layout: Rendering main app content');
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
    <ClerkProvider tokenCache={tokenCache}>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ClerkProvider>
  );
}
