import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import Button from '../components/ui/Button';

describe('Button', () => {
  it('renders label and calls onPress', () => {
    const onPress = jest.fn();
    render(<Button label="Tap" onPress={onPress} />);
    const btn = screen.getByRole('button');
    expect(screen.getByText('Tap')).toBeTruthy();
    fireEvent.press(btn);
    expect(onPress).toHaveBeenCalled();
  });
});
