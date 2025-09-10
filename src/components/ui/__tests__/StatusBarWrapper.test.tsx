import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('StatusBarWrapper', () => {
  it('uses auto when themeMode is system', () => {
    jest.isolateModules(() => {
      jest.doMock('expo-status-bar', () => ({
        StatusBar: (props: any) => <Text testID="status" {...props} />,
      }));
      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: () => ({ isDark: false, themeMode: 'system' }),
      }));
      const { StatusBarWrapper } = require('../StatusBarWrapper');
      const { getByTestId } = render(<StatusBarWrapper />);
      expect(getByTestId('status').props.style).toBe('auto');
    });
  });

  it('uses light when themeMode is dark', () => {
    jest.isolateModules(() => {
      jest.doMock('expo-status-bar', () => ({
        StatusBar: (props: any) => <Text testID="status" {...props} />,
      }));
      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: () => ({ isDark: true, themeMode: 'dark' }),
      }));
      const { StatusBarWrapper } = require('../StatusBarWrapper');
      const { getByTestId } = render(<StatusBarWrapper />);
      expect(getByTestId('status').props.style).toBe('light');
    });
  });

  it('uses dark when themeMode is light', () => {
    jest.isolateModules(() => {
      jest.doMock('expo-status-bar', () => ({
        StatusBar: (props: any) => <Text testID="status" {...props} />,
      }));
      jest.doMock('../../../context/ThemeContext', () => ({
        useTheme: () => ({ isDark: false, themeMode: 'light' }),
      }));
      const { StatusBarWrapper } = require('../StatusBarWrapper');
      const { getByTestId } = render(<StatusBarWrapper />);
      expect(getByTestId('status').props.style).toBe('dark');
    });
  });
});
