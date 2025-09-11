describe('Logger production diagnostics', () => {
  const OLD_DEV = (global as any).__DEV__;
  beforeEach(() => {
    jest.resetModules();
  });
  afterAll(() => {
    (global as any).__DEV__ = OLD_DEV;
  });

  it('routes error/warn to diagnostics sink when enabled, without console spam', () => {
    (global as any).__DEV__ = false;

    jest.doMock('../../config/featureFlags', () => ({
      featureFlags: { productionDiagnosticsEnabled: true, enableLiquidGlassPreIOS26: false },
    }));

    const logs: any[] = [];
    const { logger, setLogSink } = require('../loggerService');

    setLogSink((entry: any) => logs.push(entry));
    const err = new Error('boom');
    logger.error('prod error', err, { foo: 'bar' });
    logger.warn('prod warn', { baz: 1 });

    expect(logs.some((e) => e.level === 'error' && e.message === 'prod error')).toBe(true);
    expect(logs.some((e) => e.level === 'warn' && e.message === 'prod warn')).toBe(true);
  });
});

