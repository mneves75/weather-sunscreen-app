import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { WeatherProvider } from './src/context/WeatherContext';
import { SunscreenProvider } from './src/context/SunscreenContext';
// Initialize i18n system
import './src/i18n';

export default function App() {
  return (
    <SafeAreaProvider>
      <WeatherProvider>
        <SunscreenProvider>
          <Navigation />
          <StatusBar style="auto" />
        </SunscreenProvider>
      </WeatherProvider>
    </SafeAreaProvider>
  );
}
