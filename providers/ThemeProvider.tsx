import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentLight: string;
  accentBorder: string;
  success: string;
  successLight: string;
  danger: string;
  statusBar: 'light' | 'dark';
  isDark: boolean;
}

const LIGHT_COLORS: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F0F0',
  border: '#F0F0F0',
  text: '#1A1A1A',
  textSecondary: '#555555',
  textMuted: '#888888',
  accent: '#FF6B35',
  accentLight: '#FFF4F0',
  accentBorder: '#FFD9C7',
  success: '#28A745',
  successLight: '#E8F5E8',
  danger: '#DC3545',
  statusBar: 'dark',
  isDark: false,
};

const DARK_COLORS: ThemeColors = {
  background: '#0F0F0F',
  surface: '#1C1C1E',
  surfaceAlt: '#2C2C2E',
  border: '#2C2C2E',
  text: '#F2F2F7',
  textSecondary: '#EBEBF0',
  textMuted: '#8E8E93',
  accent: '#FF6B35',
  accentLight: '#2A1A12',
  accentBorder: '#5A2E1A',
  success: '#30D158',
  successLight: '#0D2B17',
  danger: '#FF453A',
  statusBar: 'light',
  isDark: true,
};

const STORAGE_KEY = '@milita_theme';

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  colors: ThemeColors;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  setTheme: () => {},
  colors: LIGHT_COLORS,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeState(saved);
      }
    });
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode);
  };

  const colors = useMemo<ThemeColors>(() => {
    const resolved =
      theme === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : theme;
    return resolved === 'dark' ? DARK_COLORS : LIGHT_COLORS;
  }, [theme, systemScheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}
