import { NativeEventEmitter, Platform } from 'react-native';
import { logger } from '../../src/services/loggerService';

export interface LiquidGlassConfig {
  variant?: 'ultra' | 'prominent' | 'regular' | 'thin' | 'adaptive';
  intensity?: number;
  dynamicBlur?: boolean;
  parallaxEnabled?: boolean;
  hapticFeedback?: boolean;
}

export interface LiquidGlassView {
  viewId: number;
  success: boolean;
}

let __TEST_MODULE: any | null = null;
let __TEST_PLATFORM: { OS: string; Version: any } | null = null;

export function __setLGTestModule(mod: any | null) {
  if (!__DEV__) return; // no-op in production bundles
  __TEST_MODULE = mod;
}
export function __setLGTestPlatform(p: { OS: string; Version: any } | null) {
  if (!__DEV__) return; // no-op in production bundles
  __TEST_PLATFORM = p;
}
export function __resetLGTestSeams() {
  if (!__DEV__) return; // no-op in production bundles
  __TEST_MODULE = null;
  __TEST_PLATFORM = null;
}

class LiquidGlassNativeService {
  private get module(): any | null {
    if (__TEST_MODULE !== null) return __TEST_MODULE;
    try {
      // Resolve the current RN module instance at call time to respect test-time mocks
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RN = require('react-native');
      return RN?.NativeModules?.LiquidGlassNativeModule ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Check if iOS 26 Liquid Glass is available
   */
  isAvailable(): boolean {
    const mod = this.module;
    try {
      // Resolve Platform at call-time to honor Jest mocks
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const RN = require('react-native');
      const P = (__TEST_PLATFORM as any) ?? RN?.Platform ?? Platform;
      const ver = parseFloat(String(P?.Version));
      return P?.OS === 'ios' && ver >= 26 && !!mod;
    } catch {
      const P = (__TEST_PLATFORM as any) ?? Platform;
      const ver = parseFloat(String(P.Version));
      return P.OS === 'ios' && ver >= 26 && !!mod;
    }
  }

  /**
   * Get module constants
   */
  getConstants(): {
    isIOS26Available: boolean;
    supportedVariants: string[];
    hasHapticSupport: boolean;
  } {
    const mod = this.module;
    if (!mod) {
      return {
        isIOS26Available: false,
        supportedVariants: [],
        hasHapticSupport: false,
      };
    }
    return mod.getConstants();
  }

  /**
   * Create a liquid glass view with iOS 26 features
   */
  async createLiquidGlassView(config: LiquidGlassConfig): Promise<LiquidGlassView> {
    if (!this.isAvailable()) {
      throw new Error('Liquid Glass is only available on iOS 26+');
    }

    try {
      const mod = this.module;
      const result = await mod.createLiquidGlassView(config);
      return result;
    } catch (error) {
      logger.error(
        'Failed to create liquid glass view',
        error instanceof Error ? error : new Error(String(error)),
      );
      throw error;
    }
  }

  /**
   * Update glass intensity dynamically
   */
  async updateGlassIntensity(viewId: number, intensity: number): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      const mod = this.module;
      await mod.updateGlassIntensity(viewId, intensity);
    } catch (error) {
      logger.error(
        'Failed to update glass intensity',
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Trigger haptic feedback
   */
  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light'): void {
    const mod = this.module;
    if (!this.isAvailable() || !mod?.triggerHapticFeedback) {
      return;
    }

    mod.triggerHapticFeedback(type);
  }

  /**
   * Start motion tracking for parallax effects
   */
  startMotionTracking(): void {
    const mod = this.module;
    if (!this.isAvailable() || !mod?.startMotionTracking) {
      return;
    }

    mod.startMotionTracking();
  }

  /**
   * Stop motion tracking
   */
  stopMotionTracking(): void {
    const mod = this.module;
    if (!this.isAvailable() || !mod?.stopMotionTracking) {
      return;
    }

    mod.stopMotionTracking();
  }

  /**
   * Subscribe to device motion events
   */
  onDeviceMotion(callback: (data: { x: number; y: number; z: number }) => void): () => void {
    const mod = this.module;
    if (!mod) return () => {};
    const emitter = new NativeEventEmitter(mod);
    const subscription = emitter.addListener('DeviceMotion', callback);
    return () => subscription.remove();
  }
}

export const LiquidGlassNative = new LiquidGlassNativeService();

// Export the enhanced component as well
export { LiquidGlassIOS26, LiquidGlassListItem } from '../../src/components/glass/LiquidGlassIOS26';
export { LiquidGlassWrapper } from '../../src/components/glass/LiquidGlassWrapper';
