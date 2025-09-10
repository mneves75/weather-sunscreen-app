import type { ViewProps } from 'react-native';
import type { 
  Double, 
  DirectEventHandler, 
  Float,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export type GlassEffectStyle = 'light' | 'dark' | 'clear' | 'regular';

export interface EffectChangeEvent {
  intensity: Double;
  isAnimating: boolean;
}

export interface NativeProps extends ViewProps {
  // Glass effect intensity (0.0 to 1.0)
  intensity?: WithDefault<Float, 1.0>;
  
  // Glass effect style variant (renamed to avoid conflict with ViewProps.style)
  glassStyle?: WithDefault<GlassEffectStyle, 'regular'>;
  
  // Enable/disable motion effects
  motionEnabled?: WithDefault<boolean, true>;
  
  // Animation duration in milliseconds
  animationDuration?: WithDefault<Int32, 300>;
  
  // Event handlers
  onEffectChange?: DirectEventHandler<EffectChangeEvent>;
  onAnimationComplete?: DirectEventHandler<{}>;
}

export default codegenNativeComponent<NativeProps>('LiquidGlassView');