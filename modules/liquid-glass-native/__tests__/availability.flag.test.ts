describe('LiquidGlass feature flag allows pre‑iOS26 availability', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns true on iOS 18 when flag enabled and module present', () => {
    jest.doMock('../../../src/config/featureFlags', () => ({
      featureFlags: { enableLiquidGlassPreIOS26: true, productionDiagnosticsEnabled: false },
    }));

    const {
      LiquidGlassNative,
      __setLGTestModule,
      __setLGTestPlatform,
      __resetLGTestSeams,
    } = require('../index');

    __resetLGTestSeams();
    __setLGTestModule({});
    __setLGTestPlatform({ OS: 'ios', Version: 18 });

    const available = LiquidGlassNative.isAvailable();
    expect(available).toBe(true);
  });
});
