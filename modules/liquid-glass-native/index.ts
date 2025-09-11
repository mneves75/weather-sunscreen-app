import { NativeEventEmitter, Platform } from 'react-native';
import { logger } from '../../src/services/loggerService';
import { featureFlags } from '../../src/config/featureFlags';
import { ErrorHandler, ErrorSeverity, InputValidator } from '../../src/utils/errorHandling';

// Import TurboModule specification
import LiquidGlassNativeModuleTurbo from '../../src/specs/LiquidGlassNativeModuleSpec';
import type { 
  LiquidGlassConfig as _TurboLiquidGlassConfig,
  LiquidGlassView as _TurboLiquidGlassView,
  LiquidGlassConstants as _LiquidGlassConstants
} from '../../src/specs/LiquidGlassNativeModuleSpec';

// Fallback to legacy NativeModules for backwards compatibility
import { NativeModules } from 'react-native';

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

// Cached module resolution for performance
let cachedModule: any = null;
let moduleResolutionAttempted = false;

function getNativeModule() {
  // Use cached result if available
  if (moduleResolutionAttempted) {
    return cachedModule;
  }

  try {
    // Try TurboModule first, fallback to legacy NativeModules
    if (LiquidGlassNativeModuleTurbo) {
      cachedModule = LiquidGlassNativeModuleTurbo;
    } else {
      // Fallback to legacy NativeModules
      cachedModule = (NativeModules as any)?.LiquidGlassNativeModule ?? null;
    }
  } catch (error) {
    logger.warn('Failed to resolve LiquidGlass native module', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    cachedModule = null;
  }

  moduleResolutionAttempted = true;
  return cachedModule;
}

class LiquidGlassNativeCore {
  private static readonly MODULE_NAME = 'LiquidGlassNativeModule';

  private get module(): any | null {
    // Support test injection
    if (__TEST_MODULE !== null) return __TEST_MODULE;
    
    return getNativeModule();
  }

  /**
   * Check if iOS 26 Liquid Glass is available
   * Non-critical check that returns false on failure
   */
  isAvailable(): boolean {
    try {
      const mod = this.module;
      if (!mod) {
        return false;
      }

      // Resolve Platform at call-time to honor Jest mocks
      const P = (__TEST_PLATFORM as any) ?? Platform;
      const platformOS = P?.OS || Platform.OS;
      
      if (platformOS !== 'ios') {
        return false;
      }

      // Check iOS version
      let version = 0;
      if (__TEST_PLATFORM) {
        version = parseFloat(String(__TEST_PLATFORM.Version));
      } else {
        // Use proper iOS version detection
        version = parseFloat(String(Platform.Version));
      }

      if (featureFlags.enableLiquidGlassPreIOS26) {
        return !!mod;
      }

      return version >= 26 && !!mod;
    } catch (error) {
      logger.info('LiquidGlass availability check failed', {
        module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
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
   * CRITICAL operation - will throw if module unavailable or operation fails
   */
  async createLiquidGlassView(config: LiquidGlassConfig): Promise<LiquidGlassView> {
    const context = {
      module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
      operation: 'createLiquidGlassView',
      platform: Platform.OS,
      parameters: config,
    };

    // Validate input configuration
    if (config.intensity !== undefined) {
      InputValidator.intensity(config.intensity, context);
    }

    // Check module availability first
    if (!this.isAvailable()) {
      ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.CRITICAL);
    }

    // Execute critical operation with proper error handling
    return ErrorHandler.handleCriticalOperation(async () => {
      const mod = this.module;
      if (!mod) {
        throw new Error('Native module resolved as null after availability check');
      }

      const result = await mod.createLiquidGlassView(config);
      
      // Validate result
      if (!result || typeof result.viewId !== 'number' || result.viewId <= 0) {
        throw new Error('Invalid view creation result');
      }

      return result;
    }, context);
  }

  /**
   * Update glass intensity dynamically
   * IMPORTANT operation - will throw on validation errors or module failures
   */
  async updateGlassIntensity(viewId: number, intensity: number): Promise<void> {
    const context = {
      module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
      operation: 'updateGlassIntensity',
      platform: Platform.OS,
      parameters: { viewId, intensity },
    };

    // Validate input parameters
    InputValidator.viewId(viewId, context);
    InputValidator.intensity(intensity, context);

    // Check module availability first
    if (!this.isAvailable()) {
      ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.IMPORTANT);
    }

    // Execute important operation with proper error handling
    return ErrorHandler.handleImportantOperation(async () => {
      const mod = this.module;
      if (!mod) {
        throw new Error('Native module resolved as null after availability check');
      }

      await mod.updateGlassIntensity(viewId, intensity);
    }, context);
  }

  /**
   * Trigger haptic feedback
   * OPTIONAL operation - will fail silently but log warnings
   */
  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection' = 'light'): void {
    const context = {
      module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
      operation: 'triggerHapticFeedback',
      platform: Platform.OS,
      parameters: { type },
    };

    // Validate haptic type
    InputValidator.hapticType(type, context);

    // Handle as optional operation
    ErrorHandler.handleOptionalOperation(() => {
      if (!this.isAvailable()) {
        ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.OPTIONAL);
        return;
      }

      const mod = this.module;
      if (!mod?.triggerHapticFeedback) {
        throw new Error('Haptic feedback method not available');
      }

      mod.triggerHapticFeedback(type);
    }, context);
  }

  /**
   * Start motion tracking for parallax effects
   * OPTIONAL operation - will fail silently but log warnings
   */
  startMotionTracking(): void {
    const context = {
      module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
      operation: 'startMotionTracking',
      platform: Platform.OS,
    };

    ErrorHandler.handleOptionalOperation(() => {
      if (!this.isAvailable()) {
        ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.OPTIONAL);
        return;
      }

      const mod = this.module;
      if (!mod?.startMotionTracking) {
        throw new Error('Motion tracking method not available');
      }

      mod.startMotionTracking();
    }, context);
  }

  /**
   * Stop motion tracking
   * OPTIONAL operation - will fail silently but log warnings
   */
  stopMotionTracking(): void {
    const context = {
      module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
      operation: 'stopMotionTracking',
      platform: Platform.OS,
    };

    ErrorHandler.handleOptionalOperation(() => {
      if (!this.isAvailable()) {
        ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.OPTIONAL);
        return;
      }

      const mod = this.module;
      if (!mod?.stopMotionTracking) {
        throw new Error('Motion tracking stop method not available');
      }

      mod.stopMotionTracking();
    }, context);
  }

  /**
   * Subscribe to device motion events
   * OPTIONAL operation - returns no-op function if module unavailable
   */
  onDeviceMotion(callback: (data: { x: number; y: number; z: number }) => void): () => void {
    const context = {
      module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
      operation: 'onDeviceMotion',
      platform: Platform.OS,
    };

    try {
      if (!this.isAvailable()) {
        logger.info('Device motion events unavailable', {
          module: LiquidGlassNativeCore['MODULE_NAME'] || 'LiquidGlassNativeModule',
          platform: Platform.OS,
        });
        return () => {}; // No-op cleanup function
      }

      const mod = this.module;
      if (!mod) {
        return () => {};
      }

      const emitter = new NativeEventEmitter(mod);
      const subscription = emitter.addListener('DeviceMotion', callback);
      return () => subscription.remove();
    } catch (error) {
      logger.warn('Failed to setup device motion listener', {
        error: error instanceof Error ? error.message : String(error),
        context,
      });
      return () => {}; // No-op cleanup function
    }
  }

  /**
   * Reset cached module for testing or troubleshooting
   * @internal
   */
  static _resetModuleCache(): void {
    cachedModule = null;
    moduleResolutionAttempted = false;
  }
}

export const LiquidGlassNative = new LiquidGlassNativeCore();

// Export a promise-based facade used by tests that expect async methods
export const LiquidGlassNativeService = {
  // Async availability used in unit tests; prefer native method when present
  async isAvailable(): Promise<boolean> {
    try {
      // Respect platform guard: don't touch native module on Android
      if (Platform.OS !== 'ios') return false;

      const mod = (NativeModules as any)?.LiquidGlassNativeModule;
      if (mod?.isAvailable) {
        return await mod.isAvailable();
      }
      // Fallback to sync check from core
      return LiquidGlassNative.isAvailable();
    } catch {
      return false;
    }
  },

  getConstants(): { isIOS26Available: boolean; supportedVariants: string[]; hasHapticSupport: boolean } {
    if (Platform.OS !== 'ios') {
      return { isIOS26Available: false, supportedVariants: [], hasHapticSupport: false };
    }
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    if (mod?.getConstants) {
      try {
        return mod.getConstants();
      } catch {
        // fall through to core
      }
    }
    return LiquidGlassNative.getConstants();
  },

  async createLiquidGlassView(config: LiquidGlassConfig) {
    if (Platform.OS !== 'ios') throw new Error('LiquidGlass not available on this platform');
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    if (mod?.createLiquidGlassView) {
      return await mod.createLiquidGlassView(config);
    }
    return await LiquidGlassNative.createLiquidGlassView(config);
  },

  async updateGlassIntensity(viewId: number, intensity: number) {
    if (Platform.OS !== 'ios') throw new Error('LiquidGlass not available on this platform');
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    if (mod?.updateGlassIntensity) {
      return await mod.updateGlassIntensity(viewId, intensity);
    }
    return await LiquidGlassNative.updateGlassIntensity(viewId, intensity);
  },

  triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' | 'selection') {
    if (Platform.OS !== 'ios') return;
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    if (mod?.triggerHapticFeedback) {
      try { mod.triggerHapticFeedback(type); } catch { /* noop */ }
      return;
    }
    LiquidGlassNative.triggerHapticFeedback(type);
  },

  startMotionTracking() {
    if (Platform.OS !== 'ios') return;
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    if (mod?.startMotionTracking) {
      try { mod.startMotionTracking(); } catch { /* noop */ }
      return;
    }
    LiquidGlassNative.startMotionTracking();
  },

  stopMotionTracking() {
    if (Platform.OS !== 'ios') return;
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    if (mod?.stopMotionTracking) {
      try { mod.stopMotionTracking(); } catch { /* noop */ }
      return;
    }
    LiquidGlassNative.stopMotionTracking();
  },

  // Simple pass-throughs to native add/remove listener APIs used in tests
  addListener(eventName: string) {
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    try { mod?.addListener?.(eventName); } catch { /* noop */ }
  },
  removeListeners(count: number) {
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    try { mod?.removeListeners?.(count); } catch { /* noop */ }
  },

  cleanupResourcesForView(viewId: number) {
    const mod = (NativeModules as any)?.LiquidGlassNativeModule;
    try { mod?.cleanupResourcesForView?.(viewId); } catch { /* noop */ }
  },

  _resetModuleCache: (LiquidGlassNativeCore as any)._resetModuleCache,
};

// Add static method to the exported instance for testing
(LiquidGlassNative as any)._resetModuleCache = (LiquidGlassNativeCore as any)._resetModuleCache;

// Export the enhanced component as well
export { LiquidGlassIOS26, LiquidGlassListItem } from '../../src/components/glass/LiquidGlassIOS26';
export { LiquidGlassWrapper } from '../../src/components/glass/LiquidGlassWrapper';
