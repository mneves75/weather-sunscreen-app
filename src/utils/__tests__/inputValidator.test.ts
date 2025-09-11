import { InputValidator, ModuleError } from '../../utils/errorHandling';

// Minimal logger mock to avoid noisy console; we only care about thrown errors
jest.mock('../../services/loggerService', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), debug: jest.fn() },
}));

const ctx = { module: 'Test', operation: 'validate' } as const;

describe('InputValidator.coordinates', () => {
  test('throws for non-number latitude', () => {
    expect(() => InputValidator.coordinates(NaN as any, 0, ctx)).toThrow(ModuleError);
  });

  test('throws for non-number longitude', () => {
    expect(() => InputValidator.coordinates(0, NaN as any, ctx)).toThrow(ModuleError);
  });

  test('throws for latitude out of bounds', () => {
    expect(() => InputValidator.coordinates(123, 0, ctx)).toThrow(ModuleError);
  });

  test('throws for longitude out of bounds', () => {
    expect(() => InputValidator.coordinates(0, 181, ctx)).toThrow(ModuleError);
  });

  test('accepts valid coordinates', () => {
    expect(() => InputValidator.coordinates(37.7749, -122.4194, ctx)).not.toThrow();
  });
});

describe('InputValidator.intensity', () => {
  test('throws for non-number intensity', () => {
    expect(() => InputValidator.intensity(NaN as any, ctx)).toThrow(ModuleError);
  });

  test('throws for out-of-range intensity', () => {
    expect(() => InputValidator.intensity(200, ctx)).toThrow(ModuleError);
  });

  test('accepts valid intensity', () => {
    expect(() => InputValidator.intensity(80, ctx)).not.toThrow();
  });
});

describe('InputValidator.viewId', () => {
  test('throws for non-number viewId', () => {
    expect(() => InputValidator.viewId(NaN as any, ctx)).toThrow(ModuleError);
  });

  test('throws for invalid viewId <= 0', () => {
    expect(() => InputValidator.viewId(0, ctx)).toThrow(ModuleError);
  });

  test('accepts valid viewId', () => {
    expect(() => InputValidator.viewId(1, ctx)).not.toThrow();
  });
});
