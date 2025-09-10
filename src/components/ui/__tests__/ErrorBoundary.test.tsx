import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { Text } from 'react-native';

function Thrower() {
  throw new Error('Boom');
}

describe('ErrorBoundary', () => {
  it('renders fallback UI when a child throws', () => {
    const { getByText } = render(
      <ErrorBoundary>
        {/* @ts-expect-error testing intentional throw */}
        <Thrower />
      </ErrorBoundary>,
    );
    expect(getByText(/Something went wrong/i)).toBeTruthy();
    expect(getByText(/Try Again/i)).toBeTruthy();
  });

  it('renders custom fallback when provided', () => {
    const Fallback = () => <Text testID="custom-fallback">Custom Fallback</Text>;
    const { getByTestId } = render(
      <ErrorBoundary fallback={<Fallback />}>
        {/* @ts-expect-error testing intentional throw */}
        <Thrower />
      </ErrorBoundary>,
    );
    expect(getByTestId('custom-fallback')).toBeTruthy();
  });
});
