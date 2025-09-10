import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../context/ThemeContext';

export function StatusBarWrapper() {
  const { isDark, themeMode } = useTheme();

  // If system mode, use 'auto' to let the system decide
  // Otherwise, use the theme's dark mode state
  const statusBarStyle = themeMode === 'system' ? 'auto' : isDark ? 'light' : 'dark';

  return <StatusBar style={statusBarStyle} />;
}
