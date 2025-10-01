/**
 * Central app providers wrapper
 * Combines all global providers (Theme, i18n, etc.)
 */

import { MessagesProvider } from '@/src/context/MessagesContext';
import { SettingsProvider } from '@/src/context/SettingsContext';
import { SunscreenProvider } from '@/src/context/SunscreenContext';
import { WeatherProvider } from '@/src/context/WeatherContext';
import { initializeBackgroundTasks } from '@/src/services';
import i18n from '@/src/i18n';
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ThemeProvider } from './theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    // Wait for i18n to initialize
    if (i18n.isInitialized) {
      setI18nReady(true);
    } else {
      i18n.on('initialized', () => {
        setI18nReady(true);
      });
    }

    // Initialize background tasks (non-blocking)
    initializeBackgroundTasks().catch(error => {
      console.warn('Failed to initialize background tasks:', error);
    });
  }, []);

  if (!i18nReady) {
    return null; // Or a loading screen
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <SettingsProvider>
          <WeatherProvider>
            <MessagesProvider>
              <SunscreenProvider>
                {/* Future providers:
                  - QueryClientProvider (React Query) for caching
                */}
                {children}
              </SunscreenProvider>
            </MessagesProvider>
          </WeatherProvider>
        </SettingsProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
