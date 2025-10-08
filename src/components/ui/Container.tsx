/**
 * Container component with safe area support
 */

import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '@/src/theme';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
  safeArea?: boolean;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

export function Container({
  children,
  safeArea = true,
  edges = ['top', 'bottom', 'left', 'right'],
  style,
  ...props
}: ContainerProps) {
  const colors = useColors();

  const containerStyles = [
    styles.container,
    { backgroundColor: colors.background },
    style,
  ];

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyles} edges={edges} {...props}>
        {children}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyles} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
