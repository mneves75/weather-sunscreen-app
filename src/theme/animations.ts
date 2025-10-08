/**
 * Animation configurations and utilities
 * Based on Material Motion and iOS Human Interface Guidelines
 */

import { Animated, Easing } from 'react-native';

// Timing constants (based on Material Motion)
export const duration = {
  fastest: 100,   // Icon transitions, instant feedback
  fast: 200,      // Button taps, toggles
  moderate: 300,  // Card movements, list items
  slow: 400,      // Screen transitions, modals
  slowest: 500,   // Hero animations, large movements
} as const;

// Easing curves
export const easing = {
  // Standard easing (most common)
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),

  // Entrance animations (elements coming into view)
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),

  // Exit animations (elements leaving view)
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),

  // Playful bounce
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
} as const;

// Spring physics configurations - Apple-style fluid motion
export const springs = {
  // Gentle spring (cards, modals) - Softer, more fluid
  gentle: {
    stiffness: 200,      // Softer spring
    damping: 24,         // More damping for smoothness
    mass: 1,             // Standard mass
    useNativeDriver: true,
  },

  // Bouncy spring (playful interactions like buttons)
  bouncy: {
    stiffness: 300,
    damping: 15,
    mass: 0.8,           // Lighter for quicker response
    useNativeDriver: true,
  },

  // Snappy spring (precise, quick movements) - Apple-like
  snappy: {
    stiffness: 400,
    damping: 28,
    mass: 0.6,           // Light for snappiness
    useNativeDriver: true,
  },
} as const;

// Common animation patterns
export const animations = {
  // Fade in entrance
  fadeIn: (animValue: Animated.Value, delay = 0) => {
    return Animated.timing(animValue, {
      toValue: 1,
      duration: duration.moderate,
      delay,
      easing: easing.decelerate,
      useNativeDriver: true,
    });
  },

  // Fade out exit
  fadeOut: (animValue: Animated.Value, delay = 0) => {
    return Animated.timing(animValue, {
      toValue: 0,
      duration: duration.fast,
      delay,
      easing: easing.accelerate,
      useNativeDriver: true,
    });
  },

  // Slide up entrance - Fluid spring
  slideUp: (animValue: Animated.Value, distance = 50, delay = 0) => {
    return Animated.spring(animValue, {
      toValue: 0,
      delay,
      stiffness: 200,      // Softer
      damping: 24,         // Smooth
      mass: 1,
      useNativeDriver: true,
    });
  },

  // Slide down exit
  slideDown: (animValue: Animated.Value, distance = 50, delay = 0) => {
    return Animated.timing(animValue, {
      toValue: distance,
      duration: duration.fast,
      delay,
      easing: easing.accelerate,
      useNativeDriver: true,
    });
  },

  // Scale press feedback - Snappy Apple-like response
  pressFeedback: (animValue: Animated.Value, scaleTarget = 0.96) => {
    return {
      in: () => Animated.spring(animValue, {
        toValue: scaleTarget,
        stiffness: 400,      // Quick response
        damping: 28,
        mass: 0.6,
        useNativeDriver: true,
      }).start(),

      out: () => Animated.spring(animValue, {
        toValue: 1,
        stiffness: 300,      // Smooth return
        damping: 24,
        mass: 0.8,
        useNativeDriver: true,
      }).start(),
    };
  },

  // Stagger list entrance (children appear one by one)
  stagger: (animations: Animated.CompositeAnimation[], staggerDelay = 80) => {
    return Animated.stagger(staggerDelay, animations);
  },

  // Pulse animation (for notifications, alerts)
  pulse: (animValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  },
} as const;

// Animation hooks and utilities
export const createAnimatedValue = (initialValue = 0) => new Animated.Value(initialValue);

export const createAnimatedValueXY = (x = 0, y = 0) => new Animated.ValueXY({ x, y });

/**
 * Calculate stagger delay for sequential animations
 * Used for entrance animations where items appear one after another
 *
 * @param index - The index of the item in the sequence (0-based)
 * @param baseDelay - The delay increment between items (in milliseconds)
 * @returns The calculated delay for this item
 *
 * @example
 * // First item appears immediately (0ms), second after 80ms, third after 160ms
 * getStaggerDelay(0, 80) // 0
 * getStaggerDelay(1, 80) // 80
 * getStaggerDelay(2, 80) // 160
 */
export const getStaggerDelay = (index: number, baseDelay: number = 80): number => {
  return index * baseDelay;
};

// Interpolation helper
export const interpolate = (
  animValue: Animated.Value,
  inputRange: number[],
  outputRange: number[] | string[]
) => {
  return animValue.interpolate({
    inputRange,
    outputRange,
  });
};

// Animated component creators
export const createFadeInComponent = (delay = 0) => {
  const opacity = createAnimatedValue(0);

  const animate = () => {
    animations.fadeIn(opacity, delay).start();
  };

  return { opacity, animate };
};

export const createSlideUpComponent = (distance = 50, delay = 0) => {
  const translateY = createAnimatedValue(distance);
  const opacity = createAnimatedValue(0);

  const animate = () => {
    Animated.parallel([
      animations.slideUp(translateY, distance, delay),
      animations.fadeIn(opacity, delay),
    ]).start();
  };

  return { translateY, opacity, animate };
};

export const createPressAnimation = (scaleTarget = 0.96) => {
  const scale = createAnimatedValue(1);

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: scaleTarget,
      stiffness: 400,      // Snappy
      damping: 28,
      mass: 0.6,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      stiffness: 300,      // Smooth
      damping: 24,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  };

  return { scale, pressIn, pressOut };
};
