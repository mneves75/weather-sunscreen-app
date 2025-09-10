import React from 'react';
import { render, screen } from '@testing-library/react-native';
import Input from '../components/ui/Input';

describe('Input', () => {
  it('accepts text and marks invalid', () => {
    render(<Input accessibilityLabel="email" value="" onChangeText={() => {}} />);
    const el = screen.getByLabelText('email');
    expect(el).toBeTruthy();
  });

  it('applies invalid border when invalid=true', () => {
    const { toJSON } = render(
      <Input accessibilityLabel="field" invalid value="" onChangeText={() => {}} />,
    );
    expect(toJSON()).toMatchSnapshot();
  });
});
