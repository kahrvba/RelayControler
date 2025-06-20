import { HapticTab } from '@/components/HapticTab';
import { useLanguage } from '@/components/LanguageProvider';
import { useTheme } from '@/components/ThemeProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <>
      <SignedIn>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textSecondary,
            headerShown: false,
            tabBarButton: HapticTab,
            tabBarStyle: {
              position: 'absolute',
              height: 72 + insets.bottom,
              paddingBottom: Platform.OS === 'ios' ? 10 : insets.bottom,
              paddingTop: 4,
              backgroundColor: colors.surface,
              borderTopWidth: 0,
              shadowColor: colors.shadow,
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: -2 },
              elevation: 8,
            },
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: t('navigation.home'),
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: t('navigation.settings'),
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
            }}
          />
        </Tabs>
      </SignedIn>
      <SignedOut>
        <Redirect href="/sign-up" />
      </SignedOut>
    </>
  );
}