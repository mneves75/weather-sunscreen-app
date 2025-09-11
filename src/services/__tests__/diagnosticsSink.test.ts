describe('diagnostics sink ring buffer', () => {
  const OLD_DEV = (global as any).__DEV__;
  beforeEach(() => {
    jest.resetModules();
  });
  afterAll(() => {
    (global as any).__DEV__ = OLD_DEV;
  });

  it('buffers warn/error in production when attached', () => {
    (global as any).__DEV__ = false;

    jest.doMock('../../config/featureFlags', () => ({
      featureFlags: { productionDiagnosticsEnabled: true, enableLiquidGlassPreIOS26: false },
    }));

    const { attachDiagnosticsSink, getBufferedLogs, clearBufferedLogs } = require('../diagnosticsSink');
    const { logger } = require('../loggerService');

    clearBufferedLogs();
    attachDiagnosticsSink();
    logger.warn('warned');
    logger.error('errored', new Error('boom'));

    const logs = getBufferedLogs();
    expect(logs.find((l: any) => l.level === 'warn' && l.message === 'warned')).toBeTruthy();
    expect(logs.find((l: any) => l.level === 'error' && l.message === 'errored')).toBeTruthy();
  });
});

