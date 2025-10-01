/**
 * Loading spinner component
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewProps } from 'react-native';
import { useColors } from '@/src/theme';
import { Text } from './Text';

interface LoadingSpinnerProps extends ViewProps {
  message?: string;
  size?: 'small' | 'large';
}

export function LoadingSpinner({
  message,
  size = 'large',
  style,
  ...props
}: LoadingSpinnerProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, style]} {...props}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <Text variant="body" color="secondary" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: 16,
  },
});
