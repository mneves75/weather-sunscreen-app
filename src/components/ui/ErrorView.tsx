/**
 * Error view component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from './Text';
import { Button } from './Button';
import { useThemeTokens } from '@/src/theme';

interface ErrorViewProps {
  error?: Error | string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorView({ error, message, onRetry, retryLabel }: ErrorViewProps) {
  const { t } = useTranslation();
  const { spacing } = useThemeTokens();
  const errorMessage = message || (error ? (typeof error === 'string' ? error : error.message) : t('common.error'));

  return (
    <View style={[styles.container, { padding: spacing.lg }]}>
      <Text variant="h4" weight="semibold" style={styles.title}>
        {t('common.error')}
      </Text>
      <Text variant="body" color="secondary" style={styles.message}>
        {errorMessage}
      </Text>
      {onRetry && (
        <Button
          title={retryLabel || t('common.retry')}
          onPress={onRetry}
          style={styles.button}
        />
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
  title: {
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 120,
  },
});
