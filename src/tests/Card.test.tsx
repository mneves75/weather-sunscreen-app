import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Card from '../components/ui/Card';
import { Text } from 'react-native';

describe('Card', () => {
  it('renders children', () => {
    render(
      <Card>
        <Text>inside</Text>
      </Card>,
    );
    expect(screen.getByText('inside')).toBeTruthy();
  });
});
