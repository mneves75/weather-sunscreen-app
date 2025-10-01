/**
 * Error boundary component with recovery UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { logger } from '@/src/services/LoggerService';
import { diagnosticsSink } from '@/src/services/diagnosticsSink';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error boundary caught error', error, 'ERROR_BOUNDARY', {
      componentStack: errorInfo.componentStack,
    });

    diagnosticsSink.log('error', error.message, {
      componentStack: errorInfo.componentStack,
    }, error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }

      // Default error UI
      return (
        <View style={styles.container}>
          {/* This would use ErrorView component but we need to avoid circular dependencies */}
          <View style={styles.content}>
            {/* ErrorView would go here if imported dynamically */}
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
});
