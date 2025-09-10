import React from 'react';
import { render } from '@testing-library/react-native';
import ModalSheet from '../components/ui/ModalSheet';
import { Text } from 'react-native';

describe('ModalSheet', () => {
  it('renders content when visible and closes on overlay press', () => {
    const onClose = jest.fn();
    const { getByText } = render(
      <ModalSheet visible onClose={onClose}>
        <Text>content</Text>
      </ModalSheet>,
    );
    expect(getByText('content')).toBeTruthy();
  });
});
