import React, { forwardRef } from 'react';
import { TextInput, TextInputProps } from 'react-native';

export type InputProps = TextInputProps & { invalid?: boolean };

const Input = forwardRef<TextInput, InputProps>(({ style, invalid, ...rest }, ref) => (
  <TextInput
    ref={ref}
    style={[
      {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        minHeight: 44,
        borderColor: invalid ? '#B00020' : '#CBD5E1',
        backgroundColor: '#fff',
      },
      style,
    ]}
    {...rest}
  />
));

Input.displayName = 'Input';

export default Input;
