import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // Check availability
  isAvailable(): Promise<boolean>;
  
  // Get constants
  getConstants(): {
    isIOS26Available: boolean;
    supportedVariants: string[];
    hasHapticSupport: boolean;
  };
  
  // Create and manage glass views
  createLiquidGlassView(config: {
    variant?: string;
    intensity?: number;
    dynamicBlur?: boolean;
  }): Promise<{
    viewId: number;
    success: boolean;
  }>;
  
  updateGlassIntensity(
    viewId: number,
    intensity: number
  ): Promise<boolean>;
  
  // Haptic feedback
  triggerHapticFeedback(type: string): void;
  
  // Motion tracking
  startMotionTracking(): void;
  stopMotionTracking(): void;
  
  // Event listeners
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('LiquidGlassNativeModule');