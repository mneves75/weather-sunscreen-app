describe('LocationService fallback behavior', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('uses SF fallback coordinates when expo-location is unavailable', async () => {
    // Simulate module import failure so the service sets Location = null
    jest.doMock(
      'expo-location',
      () => {
        throw new Error('Native module missing');
      },
      { virtual: true },
    );

    const { LocationService } = require('../locationService');
    const loc = await LocationService.getCurrentLocation();
    expect(loc.latitude).toBeCloseTo(37.7749, 3);
    expect(loc.longitude).toBeCloseTo(-122.4194, 3);
  });
});
