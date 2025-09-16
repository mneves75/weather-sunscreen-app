import React from 'react';
import { render } from '@testing-library/react-native';
import ForecastDetails from '../../app/forecast/[day]';
jest.mock('expo-router', () => {
  const actual = jest.requireActual('expo-router');
  return {
    ...actual,
    useLocalSearchParams: () => ({ day: 'Hoje', temp: '26' }),
    Stack: { Screen: ({ children }: any) => children ?? null },
  };
});

jest.mock('../../src/theme/theme', () => ({
  useTheme: () => ({
    colors: {
      background: '#fff',
      card: '#f8f8f8',
      cardBorder: '#e5e7eb',
      primary: '#0F172A',
      secondary: '#475569',
      border: '#cbd5f5',
    },
  }),
}));

describe('ForecastDetails', () => {
  it('renderiza resumo e dados horários', () => {
    const { getByText } = render(<ForecastDetails />);
    expect(getByText(/Calor com poucas nuvens/i)).toBeTruthy();
    expect(getByText('Umidade: 60%')).toBeTruthy();
    expect(getByText('08:00')).toBeTruthy();
  });
});
