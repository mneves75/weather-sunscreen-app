import React from 'react';
import { render } from '@testing-library/react-native';

const stackScreens: Array<{ name: string; options?: Record<string, unknown> }> = [];
const tabScreens: Array<{ name: string; options?: Record<string, unknown> }> = [];

jest.mock('../../src/theme/AppProviders', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../src/theme/theme', () => ({
  __esModule: true,
  useTheme: () => ({
    colors: {
      background: '#fff',
      surface: '#fff',
      primary: '#111827',
      secondary: '#334155',
      border: '#e5e7eb',
      cardBorder: '#e5e7eb',
      accent: '#2563EB',
    },
    tabBarStyle: {},
  }),
  useColors: () => ({
    background: '#fff',
    surface: '#fff',
    primary: '#111827',
    secondary: '#334155',
    border: '#e5e7eb',
    cardBorder: '#e5e7eb',
    accent: '#2563EB',
  }),
}));

jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = Object.assign(
    ({ children }: { children: React.ReactNode }) => {
      React.Children.forEach(children, (child: any) => {
        if (child?.props?.name) {
          stackScreens.push({ name: child.props.name, options: child.props.options });
        }
      });
      return <>{children}</>;
    },
    {
      Screen: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    },
  );
  const Tabs = Object.assign(
    ({ children, screenOptions }: { children: React.ReactNode; screenOptions?: any }) => {
      React.Children.forEach(children, (child: any) => {
        if (child?.props?.name) {
          tabScreens.push({
            name: child.props.name,
            options: { ...child.props.options, screenOptions },
          });
        }
      });
      return <>{children}</>;
    },
    {
      Screen: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    },
  );
  return {
    Stack,
    Tabs,
    Link: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    useRouter: () => ({ back: jest.fn() }),
  };
});

import RootLayout from '../../app/_layout';
import TabsLayout from '../../app/(tabs)/_layout';
import NotFound from '../../app/+not-found';

describe('Expo Router v6 configuration', () => {
  beforeEach(() => {
    stackScreens.length = 0;
    tabScreens.length = 0;
  });

  it('define o stack root com telas essenciais', () => {
    render(<RootLayout />);
    const names = stackScreens.map((s) => s.name);
    expect(names).toEqual(
      expect.arrayContaining(['(tabs)', 'modal', '(auth)', '(dev)', 'forecast/[day]']),
    );
    const modal = stackScreens.find((s) => s.name === 'modal');
    expect(modal?.options).toMatchObject({ presentation: 'modal', title: 'Modal' });
  });

  it('configura as abas principais com opções de estilo', () => {
    render(<TabsLayout />);
    const names = tabScreens.map((s) => s.name);
    expect(names).toEqual(['index', 'weather', 'uv', 'forecast', 'settings']);
    const first = tabScreens[0];
    expect(first?.options?.screenOptions?.tabBarStyle).toBeDefined();
  });

  it('renderiza fallback de rota inexistente', () => {
    const { getByText } = render(<NotFound />);
    expect(getByText(/Página não encontrada/i)).toBeTruthy();
    expect(getByText(/Voltar para início/i)).toBeTruthy();
  });
});
