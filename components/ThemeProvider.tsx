import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    primary: string;
    accent: string;
    shadow: string;
  };
}

const lightColors = {
  background: '#ffffff',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#f3f4f6',
  primary: '#3b82f6',
  accent: '#10b981',
  shadow: '#000',
};

const darkColors = {
  background: '#111827',
  surface: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  primary: '#60a5fa',
  accent: '#34d399',
  shadow: '#000',
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Load theme preference on app start
  React.useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const colors = isDarkMode ? darkColors : lightColors;

  const value: ThemeContextType = {
    isDarkMode,
    toggleDarkMode,
    colors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 