import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/index';

describe('HomeScreen', () => {
  it('renders header and list', () => {
    render(<HomeScreen />);
    expect(screen.getByRole('header')).toBeTruthy();
    expect(screen.getByLabelText('Lista de itens')).toBeTruthy();
  });
});
