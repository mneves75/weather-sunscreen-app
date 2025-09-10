import React from 'react';
import { render } from '@testing-library/react-native';

// Ensure dev-mode for this test case
beforeAll(() => {
  // @ts-expect-error allow global test override
  global.__DEV__ = true;
});

afterAll(() => {
  // Restore jest.setup default
  // @ts-expect-error allow global test override
  global.__DEV__ = false;
});

describe('PerfStats overlay', () => {
  it('renders FPS label in dev mode without crashing', () => {
    const PerfStats = require('../PerfStats').default;
    const { getByText } = render(<PerfStats />);
    expect(getByText(/FPS/)).toBeTruthy();
  });

  it('renders nothing when not in dev mode', () => {
    // Switch to non-dev and render again
    // @ts-expect-error allow global test override
    global.__DEV__ = false;
    const Comp = require('../PerfStats').default;
    const { queryByText } = render(<Comp />);
    expect(queryByText(/FPS/)).toBeNull();
  });
});
