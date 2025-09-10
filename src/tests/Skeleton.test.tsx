import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Skeleton from '../components/ui/Skeleton';

describe('Skeleton', () => {
  it('renders with accessibility label', () => {
    render(<Skeleton />);
    expect(screen.getByLabelText('skeleton')).toBeTruthy();
  });
});
