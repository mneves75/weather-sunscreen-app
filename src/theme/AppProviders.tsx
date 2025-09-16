import React, { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './theme';
import { WeatherProvider } from '../context/WeatherContext';
import { SunscreenProvider } from '../context/SunscreenContext';
import { queryClient } from '../services/queryClient';
import '../i18n';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import PerfStats from '../components/ui/PerfStats';
import { useAppStore } from '../store/appStore';

export default function AppProviders({ children }: PropsWithChildren) {
  // Inline consumer to avoid context import loops
  const PerfGate = () => {
    const perf = useAppStore((s) => s.perfOverlay);
    return perf ? <PerfStats /> : null;
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <WeatherProvider>
              <SunscreenProvider>
                <ErrorBoundary>
                  {children}
                  <PerfGate />
                </ErrorBoundary>
              </SunscreenProvider>
            </WeatherProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
