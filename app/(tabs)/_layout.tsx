import { HapticTab } from '@/components/HapticTab';
import { useTheme } from '@/components/ThemeProvider';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SignedIn, SignedOut } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const { isDarkMode, colors } = useTheme();

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
              height: 88,
              paddingBottom: Platform.OS === 'ios' ? 20 : 16,
              paddingTop: 8,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
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
              title: 'Home',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
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