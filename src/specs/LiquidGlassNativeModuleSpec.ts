import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { Float, Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';

export interface LiquidGlassConfig {
  variant?: WithDefault<'ultra' | 'prominent' | 'regular' | 'thin' | 'adaptive', 'regular'>;
  intensity?: WithDefault<Float, 80.0>;
  dynamicBlur?: WithDefault<boolean, true>;
  parallaxEnabled?: WithDefault<boolean, true>;
  hapticFeedback?: WithDefault<boolean, true>;
}

export interface DeviceMotionData {
  x: Float;
  y: Float;
  z: Float;
}

export interface LiquidGlassView {
  viewId: Int32;
  success: boolean;
}

export interface LiquidGlassConstants {
  isIOS26Available: boolean;
  supportedVariants: string[];
  hasHapticSupport: boolean;
}

// TurboModule specification for LiquidGlass Native Module
export interface Spec extends TurboModule {
  /**
   * Check if Liquid Glass is available on this platform
   * @returns Promise<boolean> - true if iOS 26+ and native module available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get module constants
   * @returns LiquidGlassConstants - Module capabilities and supported features
   */
  getConstants(): LiquidGlassConstants;

  /**
   * Create a liquid glass view with iOS 26 features
   * @param config - Configuration for glass effect
   * @returns Promise<LiquidGlassView> - Created view reference
   */
  createLiquidGlassView(config: LiquidGlassConfig): Promise<LiquidGlassView>;

  /**
   * Update glass intensity dynamically
   * @param viewId - View identifier
   * @param intensity - New intensity value (0-100)
   * @returns Promise<boolean> - Success status
   */
  updateGlassIntensity(viewId: Int32, intensity: Float): Promise<boolean>;

  /**
   * Trigger haptic feedback
   * @param type - Haptic feedback type
   */
  triggerHapticFeedback(type: WithDefault<'light' | 'medium' | 'heavy' | 'selection', 'light'>): void;

  /**
   * Start motion tracking for parallax effects
   */
  startMotionTracking(): void;

  /**
   * Stop motion tracking
   */
  stopMotionTracking(): void;

  /**
   * Add event listener (inherited from RCTEventEmitter)
   * @param eventName - Event name to listen to
   */
  addListener(eventName: string): void;

  /**
   * Remove event listeners (inherited from RCTEventEmitter)
   * @param count - Number of listeners to remove
   */
  removeListeners(count: Int32): void;
}

// Export TurboModule with error handling for test environments
let LiquidGlassNativeModuleTurbo: Spec | null = null;

try {
  LiquidGlassNativeModuleTurbo = TurboModuleRegistry.getEnforcing<Spec>('LiquidGlassNativeModule');
} catch {
  // TurboModule not available (likely in test environment)
  // This will be handled by the fallback in the service layer
  LiquidGlassNativeModuleTurbo = null;
}

export default LiquidGlassNativeModuleTurbo;