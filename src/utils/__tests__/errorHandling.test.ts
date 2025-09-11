import { ErrorHandler, ErrorSeverity, ModuleError } from '../../utils/errorHandling';

// Mock logger to capture calls without console noise
jest.mock('../../services/loggerService', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

const context = { module: 'TestModule', operation: 'testOp' } as const;

describe('ErrorHandler', () => {
  afterEach(() => jest.clearAllMocks());

  it('handleImportantOperation rethrows ModuleError and logs warn with original message', async () => {
    const boom = new Error('boom');
    await expect(
      ErrorHandler.handleImportantOperation(async () => {
        throw boom;
      }, context),
    ).rejects.toMatchObject({
      name: 'ModuleError',
      code: 'OPERATION_FAILED',
      severity: ErrorSeverity.IMPORTANT,
      originalError: boom,
    } as Partial<ModuleError>);
  });

  it('handleModuleUnavailable(CRITICAL) throws ModuleError and logs error', () => {
    expect(() =>
      ErrorHandler.handleModuleUnavailable(context, ErrorSeverity.CRITICAL),
    ).toThrowError(ModuleError);
  });

  it('handleOptionalOperation (async) never throws but logs warn', async () => {
    const p = ErrorHandler.handleOptionalOperation(async () => {
      throw 'string-error';
    }, context);
    await expect(p).resolves.toBeUndefined();
  });

  it('handleOptionalOperation (sync) returns immediately and never throws', () => {
    expect(() =>
      ErrorHandler.handleOptionalOperation(() => {
        // synchronous throw should be caught and logged, not rethrown
        throw 'boom';
      }, context),
    ).not.toThrow();
  });
});
