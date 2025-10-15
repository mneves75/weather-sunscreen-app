/**
 * Error boundary component with recovery UI
 * Enhanced for React 19.1 with better error handling and recovery
 *
 * React 19 improvements:
 * - Enhanced error reporting with component stack
 * - Better fallback rendering
 * - Automatic error recovery on props change
 * - Integration with diagnostics system
 *
 * @see https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { logger } from '@/src/services/LoggerService';
import { diagnosticsSink } from '@/src/services/diagnosticsSink';

interface Props {
  children: ReactNode;
  /** Custom fallback UI - receives error and reset function */
  fallback?: (error: Error, errorInfo: ErrorInfo | null, reset: () => void) => ReactNode;
  /** Called when error is caught - useful for error reporting */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Automatically reset on children change (default: true) */
  resetOnPropsChange?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to diagnostics system
    logger.error('Error boundary caught error', error, 'ERROR_BOUNDARY', {
      componentStack: errorInfo.componentStack,
      digest: (errorInfo as any).digest, // React 19 error digest
    });

    diagnosticsSink.log('error', error.message, {
      componentStack: errorInfo.componentStack,
      digest: (errorInfo as any).digest,
    }, error);

    // Store errorInfo in state
    this.setState({ errorInfo });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // React 19 pattern: Auto-reset when children change (default behavior)
    const resetOnPropsChange = this.props.resetOnPropsChange ?? true;

    if (this.state.hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.handleReset();
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleReset);
      }

      // Default error UI (improved for React 19)
      // Wrapped in ErrorBoundaryUI to access theme safely
      return <ErrorBoundaryUI error={this.state.error} errorInfo={this.state.errorInfo} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * ErrorBoundaryUI - Separate component to safely use hooks for theme
 *
 * IMPORTANT: This component uses ONLY system color scheme (useColorScheme from React Native)
 * and does NOT attempt to access the app's theme preference. This is intentional because:
 *
 * 1. If the error boundary is showing, something has crashed (possibly the theme system)
 * 2. We cannot safely use useTheme() here - it might be what crashed in the first place
 * 3. React hooks cannot be called conditionally (violates rules of hooks)
 * 4. System color scheme is always available and never crashes
 *
 * Trade-off: If user has app theme set to dark but system is light (or vice versa),
 * they'll see the error screen in system theme instead of app theme. This is acceptable
 * because error states are rare and readability is more important than preference matching.
 */
function ErrorBoundaryUI({ error, errorInfo, onReset }: { error: Error; errorInfo: ErrorInfo | null; onReset: () => void }) {
  // Use system color scheme for fallback (works even if app theme system crashes)
  // This is the ONLY safe way to determine theme in an error boundary
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';

  // Use system color scheme to adapt colors even if theme provider is broken
  // These colors ensure the error UI is always readable
  const themeColors = {
    containerBg: isDark ? '#000000' : '#f5f5f5',
    contentBg: isDark ? '#1C1C1E' : '#FFFFFF',
    titleColor: '#FF453A', // Apple Red - consistent across themes
    messageColor: isDark ? 'rgba(235, 235, 245, 0.6)' : '#424242',
    stackBg: isDark ? '#2C2C2E' : '#f5f5f5',
    stackTextColor: isDark ? 'rgba(235, 235, 245, 0.6)' : '#757575',
    buttonBg: '#007AFF', // Apple Blue - consistent across themes
    buttonText: '#FFFFFF',
    shadowColor: '#000',
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.containerBg }]}>
      <View style={[styles.content, { backgroundColor: themeColors.contentBg, shadowColor: themeColors.shadowColor }]}>
        <Text style={[styles.title, { color: themeColors.titleColor }]}>Something went wrong</Text>
        <Text style={[styles.message, { color: themeColors.messageColor }]}>{error.message}</Text>

        {__DEV__ && errorInfo && (
          <View style={[styles.stackContainer, { backgroundColor: themeColors.stackBg }]}>
            <Text style={[styles.stackTitle, { color: themeColors.stackTextColor }]}>Component Stack:</Text>
            <Text style={[styles.stack, { color: themeColors.stackTextColor }]}>
              {errorInfo.componentStack}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeColors.buttonBg }]}
          onPress={onReset}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text style={[styles.buttonText, { color: themeColors.buttonText }]}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor set via inline style for theme awareness
    padding: 24,
  },
  content: {
    // backgroundColor and shadowColor set via inline style for theme awareness
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    width: '100%',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    // color set via inline style for theme awareness (Apple Red)
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    // color set via inline style for theme awareness
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 24,
  },
  stackContainer: {
    // backgroundColor set via inline style for theme awareness
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    maxHeight: 200,
  },
  stackTitle: {
    fontSize: 12,
    fontWeight: '600',
    // color set via inline style for theme awareness
    marginBottom: 8,
  },
  stack: {
    fontSize: 10,
    // color set via inline style for theme awareness
    fontFamily: 'monospace',
  },
  button: {
    // backgroundColor set via inline style for theme awareness (Apple Blue)
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    // color set via inline style for theme awareness
    fontSize: 16,
    fontWeight: '600',
  },
});
