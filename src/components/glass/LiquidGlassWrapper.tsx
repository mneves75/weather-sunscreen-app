import React, { ReactNode } from 'react';
import { View, ViewStyle, Platform, NativeModules } from 'react-native';

interface LiquidGlassWrapperProps {
  children: ReactNode;
  variant?: 'regular' | 'prominent' | 'thin' | 'glassProminent' | 'glass';
  sensorAware?: boolean;
  style?: ViewStyle;
}

const { LiquidGlassNative } = NativeModules;

export function LiquidGlassWrapper({
  children,
  variant = 'regular',
  sensorAware = true,
  style,
}: LiquidGlassWrapperProps) {
  
  // iOS 26+ native Liquid Glass implementation
  if (Platform.OS === 'ios' && parseFloat(Platform.Version) >= 26) {
    return (
      <LiquidGlassNative
        variant={variant}
        sensorAware={sensorAware}
        style={style}
      >
        {children}
      </LiquidGlassNative>
    );
  }
  
  // iOS 16-25 fallback with material backgrounds
  if (Platform.OS === 'ios' && parseFloat(Platform.Version) >= 16) {
    return (
      <View
        style={[
          {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)', // Requires react-native-blur for full effect
            borderRadius: 12,
            borderWidth: 0.5,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }
  
  // Android and Web fallback
  return (
    <View
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.2)',
          elevation: 8, // Android shadow
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Expo UI Glass Effects (for Expo SDK 54+)
export function ExpoGlassContainer({ 
  children, 
  variant = 'regular' 
}: { 
  children: ReactNode; 
  variant?: 'regular' | 'glassProminent' | 'glass';
}) {
  // This would use Expo's built-in glass effects
  // Example based on Expo SDK 54 beta documentation
  return (
    <View
      style={{
        // Expo's glass effect implementation
        // This is applied automatically when using Expo UI components
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.25)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      }}
    >
      {children}
    </View>
  );
}