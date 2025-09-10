import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import ListItem from '../components/ui/ListItem';

describe('ListItem', () => {
  it('renders title and subtitle', () => {
    render(<ListItem title="Title" subtitle="Sub" />);
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('Sub')).toBeTruthy();
  });

  it('handles press when onPress is provided', () => {
    const onPress = jest.fn();
    render(<ListItem title="T" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
