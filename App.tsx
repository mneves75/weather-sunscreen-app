import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { ThemeProvider } from './src/context/ThemeContext';
import { WeatherProvider } from './src/context/WeatherContext';
import { SunscreenProvider } from './src/context/SunscreenContext';
import { StatusBarWrapper } from './src/components/ui/StatusBarWrapper';
import { ErrorBoundary } from './src/components/ui/ErrorBoundary';
// Initialize i18n system
import './src/i18n';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <WeatherProvider>
            <SunscreenProvider>
              <Navigation />
              <StatusBarWrapper />
            </SunscreenProvider>
          </WeatherProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
