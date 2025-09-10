import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ViewStyle,
  Animated,
  Platform,
  NativeModules,
  DeviceEventEmitter,
  PanResponder,
  StyleProp,
  AccessibilityInfo,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, useTheme } from '../../context/ThemeContext';
import { ColorScheme } from '../../types/theme';
import { appendAlpha } from '../../utils/color';
import { logger } from '../../services/loggerService';

interface LiquidGlassIOS26Props {
  children: ReactNode;
  variant?: 'ultra' | 'prominent' | 'regular' | 'thin' | 'adaptive';
  intensity?: number; // 0-100
  dynamicBlur?: boolean;
  parallaxEnabled?: boolean;
  hapticFeedback?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Native iOS bridge (optional, may not exist on all platforms/runtimes)
const nativeModules = NativeModules as unknown as {
  LiquidGlassNativeModule?: { triggerHapticFeedback?: (type: string) => void };
};
const { LiquidGlassNativeModule } = nativeModules;

export function LiquidGlassIOS26({
  children,
  variant = 'regular',
  intensity = 80,
  dynamicBlur = true,
  parallaxEnabled = true,
  hapticFeedback = true,
  style,
}: LiquidGlassIOS26Props) {
  const colors = useColors();
  const { isDark } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const parallaxX = useRef(new Animated.Value(0)).current;
  const parallaxY = useRef(new Animated.Value(0)).current;

  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    // Query reduce motion preference and subscribe to changes when available
    try {
      const AI = AccessibilityInfo as unknown as {
        isReduceMotionEnabled?: () => Promise<boolean>;
        addEventListener?: (
          event: string,
          handler: (v: boolean) => void,
        ) => { remove?: () => void };
      };
      if (AI?.isReduceMotionEnabled) {
        AI.isReduceMotionEnabled()
          .then((v) => setReduceMotion(Boolean(v)))
          .catch(() => {});
        const sub = AI.addEventListener?.('reduceMotionChanged', (v) =>
          setReduceMotion(Boolean(v)),
        );
        return () => sub?.remove?.();
      }
    } catch {
      /* noop */
    }
  }, []);

  // Liquid animation (enabled on iOS; version-gated behavior handled by native module when present)
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  // Parallax effect (listens to native DeviceMotion if the bridge is available)
  const allowParallax = parallaxEnabled && !reduceMotion;
  useEffect(() => {
    if (!allowParallax || Platform.OS !== 'ios') {
      return;
    }

    const subscription = DeviceEventEmitter.addListener('DeviceMotion', (data) => {
      Animated.parallel([
        Animated.spring(parallaxX, {
          toValue: data.x * 10,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
        Animated.spring(parallaxY, {
          toValue: data.y * 10,
          useNativeDriver: true,
          tension: 40,
          friction: 8,
        }),
      ]).start();
    });

    return () => subscription.remove();
  }, [allowParallax, parallaxX, parallaxY]);

  // Pan responder for interactive glass effect
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => hapticFeedback && !reduceMotion,
      onPanResponderGrant: () => {
        if (!hapticFeedback || reduceMotion) return;
        // Prefer native haptics if available; otherwise try Expo Haptics (optional dep)
        try {
          if (LiquidGlassNativeModule?.triggerHapticFeedback) {
            LiquidGlassNativeModule.triggerHapticFeedback('light');
            return;
          }
        } catch {
          // no-op: native haptics unavailable
        }
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const Haptics = require('expo-haptics');
          if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Light) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        } catch {
          // no-op: expo-haptics not installed
        }
      },
      onPanResponderMove: (_, gestureState) => {
        if (dynamicBlur) {
          const velocity = Math.sqrt(
            gestureState.vx * gestureState.vx + gestureState.vy * gestureState.vy,
          );
          // Adjust blur based on interaction velocity
          logger.info('Glass interaction velocity', { velocity });
        }
      },
    }),
  ).current;

  // Get iOS 26 specific glass styles
  const glassStyles = getIOS26AdvancedGlassStyle(variant, intensity, colors, isDark);

  // Transform animations for liquid effect
  const liquidTransform = {
    transform: [
      {
        translateX: allowParallax
          ? parallaxX
          : animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 2],
            }),
      },
      {
        translateY: allowParallax
          ? parallaxY
          : animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -2],
            }),
      },
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.02, 1],
        }),
      },
    ],
  };

  // Fallback implementation with Expo Blur
  return (
    <Animated.View style={[glassStyles, liquidTransform, style]} {...panResponder.panHandlers}>
      <BlurView
        intensity={getBlurIntensity(variant, intensity)}
        tint={isDark ? 'dark' : 'light'}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={getGradientColors(variant, isDark)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: 0.1,
          }}
        />
        <Animated.View
          style={{
            flex: 1,
            opacity: animatedValue.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.95, 1, 0.95],
            }),
          }}
        >
          {children}
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
}

// iOS 26 Advanced Glass Style Generator
function getIOS26AdvancedGlassStyle(
  variant: string,
  intensity: number,
  colors: ColorScheme,
  isDark: boolean,
): ViewStyle {
  const baseStyle: ViewStyle = {
    borderRadius: 24, // iOS 26 larger radius
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
  };

  const opacityFactor = intensity / 100;

  switch (variant) {
    case 'ultra':
      return {
        ...baseStyle,
        backgroundColor: `rgba(255, 255, 255, ${0.05 * opacityFactor})`,
        borderWidth: 1.5,
        borderColor: `rgba(255, 255, 255, ${0.3 * opacityFactor})`,
        shadowOpacity: 0.3,
        shadowRadius: 48,
        shadowOffset: { width: 0, height: 20 },
      };
    case 'prominent':
      return {
        ...baseStyle,
        backgroundColor: appendAlpha(colors.card, (240 / 255) * opacityFactor),
        borderWidth: 1,
        borderColor: appendAlpha(colors.cardBorder, (200 / 255) * opacityFactor),
        shadowOpacity: 0.25,
        shadowRadius: 40,
      };
    case 'thin':
      return {
        ...baseStyle,
        backgroundColor: appendAlpha(colors.card, (128 / 255) * opacityFactor),
        borderWidth: 0.5,
        borderColor: appendAlpha(colors.cardBorder, (100 / 255) * opacityFactor),
        shadowOpacity: 0.1,
        shadowRadius: 20,
        borderRadius: 20,
      };
    case 'adaptive':
      return {
        ...baseStyle,
        backgroundColor: isDark
          ? `rgba(0, 0, 0, ${0.3 * opacityFactor})`
          : `rgba(255, 255, 255, ${0.5 * opacityFactor})`,
        borderWidth: 0.75,
        borderColor: isDark
          ? `rgba(255, 255, 255, ${0.1 * opacityFactor})`
          : `rgba(0, 0, 0, ${0.05 * opacityFactor})`,
      };
    default:
      return {
        ...baseStyle,
        backgroundColor: appendAlpha(colors.card, (200 / 255) * opacityFactor),
        borderWidth: 0.75,
        borderColor: appendAlpha(colors.cardBorder, (150 / 255) * opacityFactor),
      };
  }
}

// Get blur intensity based on variant
function getBlurIntensity(variant: string, intensity: number): number {
  const baseIntensity = intensity * 0.8;
  switch (variant) {
    case 'ultra':
      return Math.min(100, baseIntensity * 1.5);
    case 'prominent':
      return Math.min(100, baseIntensity * 1.2);
    case 'thin':
      return Math.min(100, baseIntensity * 0.6);
    case 'adaptive':
      return Math.min(100, baseIntensity);
    default:
      return Math.min(100, baseIntensity * 0.9);
  }
}

// Get gradient colors for glass effect
function getGradientColors(variant: string, isDark: boolean): [string, string, string] {
  if (isDark) {
    switch (variant) {
      case 'ultra':
        return ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0)'];
      case 'prominent':
        return ['rgba(100,150,255,0.2)', 'rgba(150,100,255,0.1)', 'rgba(255,255,255,0.05)'];
      default:
        return ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0)'];
    }
  } else {
    switch (variant) {
      case 'ultra':
        return ['rgba(0,50,150,0.1)', 'rgba(0,100,200,0.05)', 'rgba(0,150,255,0.02)'];
      case 'prominent':
        return ['rgba(50,100,200,0.15)', 'rgba(100,150,255,0.1)', 'rgba(150,200,255,0.05)'];
      default:
        return ['rgba(0,0,0,0.02)', 'rgba(0,0,0,0.01)', 'rgba(0,0,0,0)'];
    }
  }
}

// Performance optimized variant for lists
export function LiquidGlassListItem({
  children,
  onPress,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    try {
      if (LiquidGlassNativeModule?.triggerHapticFeedback) {
        LiquidGlassNativeModule.triggerHapticFeedback('light');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Haptics = require('expo-haptics');
        if (Haptics?.impactAsync && Haptics?.ImpactFeedbackStyle?.Light) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    } catch {
      // no-op: haptics unavailable
    }
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
    if (onPress) {
      onPress();
    }
  };

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          backgroundColor: appendAlpha(colors.card, 230 / 255),
          borderRadius: 16,
          borderWidth: 0.5,
          borderColor: appendAlpha(colors.cardBorder, 204 / 255),
          padding: 16,
          marginVertical: 4,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      {children}
    </Animated.View>
  );
}
