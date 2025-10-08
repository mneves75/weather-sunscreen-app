/**
 * Glass Effect Provider - Centralized Control for App-Wide Glass Effects
 *
 * This context provider manages glass effect state across the entire app,
 * providing fine-grained control based on performance, accessibility, and user preferences.
 *
 * KEY FEATURES:
 * - Automatic accessibility detection (reduce transparency)
 * - Performance mode for battery/resource conservation
 * - Background state management (disable when app is backgrounded)
 * - Manual control for performance-critical operations
 *
 * USAGE:
 * 1. Wrap your app with GlassEffectProvider in app/_layout.tsx
 * 2. Use useGlassEffect() hook in any component to access glass state
 * 3. Pass isEnabled to GlassView components: <GlassView disabled={!isEnabled} />
 *
 * EXAMPLE:
 * // app/_layout.tsx
 * <GlassEffectProvider>
 *   <ThemeProvider>
 *     <App />
 *   </ThemeProvider>
 * </GlassEffectProvider>
 *
 * // In any component
 * const { isEnabled, forceDisable, forceEnable } = useGlassEffect();
 * <ScrollView onScrollBeginDrag={forceDisable} onScrollEndDrag={forceEnable}>
 *   <GlassView disabled={!isEnabled} />
 * </ScrollView>
 *
 * @see docs/REF_DOC/liquid-glass-app-with-expo-ui-and-swiftui.md
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccessibilityInfo, AppState, AppStateStatus, Platform } from 'react-native';

/**
 * Glass Effect Context Type Definition
 */
interface GlassEffectContextType {
  /** Current glass effect enabled state (considers all factors) */
  isEnabled: boolean;

  /** Temporarily disable all glass effects (e.g., during video playback) */
  forceDisable: () => void;

  /** Re-enable glass effects after force disable */
  forceEnable: () => void;

  /** Enable/disable performance mode (auto-disables glass when app is backgrounded) */
  setPerformanceMode: (enabled: boolean) => void;

  /** Current performance mode state */
  performanceMode: boolean;

  /** Whether reduce transparency accessibility setting is enabled */
  reduceTransparency: boolean;
}

/**
 * Glass Effect Context
 * Use useGlassEffect() hook to access this context
 */
const GlassEffectContext = createContext<GlassEffectContextType | undefined>(undefined);

/**
 * Glass Effect Provider Props
 */
interface GlassEffectProviderProps {
  children: React.ReactNode;
  /** Initial performance mode state (default: false) */
  initialPerformanceMode?: boolean;
}

/**
 * Glass Effect Provider Component
 *
 * Manages app-wide glass effect state based on:
 * - Accessibility settings (reduce transparency)
 * - Performance mode (battery saving)
 * - App state (foreground/background)
 * - Manual overrides (forceDisable/forceEnable)
 */
export function GlassEffectProvider({
  children,
  initialPerformanceMode = false,
}: GlassEffectProviderProps) {
  // STATE: Manual control (forceDisable/forceEnable)
  const [isManuallyEnabled, setIsManuallyEnabled] = useState(true);

  // STATE: Performance mode (auto-disable when backgrounded)
  const [performanceMode, setPerformanceMode] = useState(initialPerformanceMode);

  // STATE: Reduce transparency accessibility setting
  const [reduceTransparency, setReduceTransparency] = useState(false);

  // STATE: Current app state (active, background, inactive)
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  /**
   * EFFECT: Check accessibility settings on mount
   * CRITICAL: Some users have reduced transparency enabled for medical/visual reasons
   * We must respect this setting for WCAG compliance
   */
  useEffect(() => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      // Initial check
      AccessibilityInfo.isReduceTransparencyEnabled()
        .then(setReduceTransparency)
        .catch((error) => {
          // Fail-safe: If we can't detect, assume transparency is OK
          console.warn('Failed to check reduce transparency setting:', error);
          setReduceTransparency(false);
        });

      // Listen for changes (user might toggle in Settings during app use)
      const subscription = AccessibilityInfo.addEventListener(
        'reduceTransparencyChanged',
        setReduceTransparency
      );

      return () => subscription.remove();
    }
  }, []);

  /**
   * EFFECT: Monitor app state changes
   * In performance mode, disable glass when app is backgrounded to save resources
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);

      // PERFORMANCE MODE: Disable glass when app goes to background
      // This reduces memory usage and prevents unnecessary rendering
      if (performanceMode) {
        if (nextAppState === 'background' || nextAppState === 'inactive') {
          setIsManuallyEnabled(false);
        } else if (nextAppState === 'active') {
          // Re-enable when app returns to foreground
          // But only if reduce transparency is not enabled
          if (!reduceTransparency) {
            setIsManuallyEnabled(true);
          }
        }
      }
    });

    return () => subscription.remove();
  }, [performanceMode, reduceTransparency]);

  /**
   * CALLBACK: Force disable glass effects
   * Use this during performance-critical operations like:
   * - Video playback
   * - Heavy animations
   * - Fast scrolling
   */
  const forceDisable = useCallback(() => {
    setIsManuallyEnabled(false);
  }, []);

  /**
   * CALLBACK: Force enable glass effects
   * Re-enable after performance-critical operation completes
   * Will not enable if reduce transparency is active (respects accessibility)
   */
  const forceEnable = useCallback(() => {
    if (!reduceTransparency) {
      setIsManuallyEnabled(true);
    }
  }, [reduceTransparency]);

  /**
   * COMPUTED: Final enabled state
   * Glass is enabled ONLY if ALL of these are true:
   * 1. Manually enabled (not force disabled)
   * 2. Reduce transparency is OFF (accessibility)
   * 3. App is in foreground (or performance mode is off)
   */
  const isEnabled =
    isManuallyEnabled &&
    !reduceTransparency &&
    (appState === 'active' || !performanceMode);

  // Context value
  const value: GlassEffectContextType = {
    isEnabled,
    forceDisable,
    forceEnable,
    setPerformanceMode,
    performanceMode,
    reduceTransparency,
  };

  return (
    <GlassEffectContext.Provider value={value}>
      {children}
    </GlassEffectContext.Provider>
  );
}

/**
 * useGlassEffect Hook
 *
 * Access glass effect state and controls from any component.
 * Must be used within a GlassEffectProvider.
 *
 * @returns GlassEffectContextType
 * @throws Error if used outside GlassEffectProvider
 *
 * @example
 * const { isEnabled, forceDisable, forceEnable } = useGlassEffect();
 *
 * // Disable during scroll
 * <ScrollView
 *   onScrollBeginDrag={forceDisable}
 *   onScrollEndDrag={forceEnable}
 * >
 *   <GlassView disabled={!isEnabled} />
 * </ScrollView>
 */
export function useGlassEffect(): GlassEffectContextType {
  const context = useContext(GlassEffectContext);

  if (context === undefined) {
    throw new Error(
      'useGlassEffect must be used within a GlassEffectProvider. ' +
      'Wrap your app with <GlassEffectProvider> in app/_layout.tsx'
    );
  }

  return context;
}

/**
 * Type exports for external use
 */
export type { GlassEffectContextType, GlassEffectProviderProps };
