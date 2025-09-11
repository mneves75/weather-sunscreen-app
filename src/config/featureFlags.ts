// Feature flags for development and diagnostics
// These may be overridden at runtime by environment or test seams.

type Flags = {
  // Allow exercising Liquid Glass native paths on iOS < 26 in dev/testing.
  enableLiquidGlassPreIOS26: boolean;

  // When true, route warn/error logs to a diagnostics sink even in production.
  productionDiagnosticsEnabled: boolean;
};

// Environment overrides (for packagers or native envs that inject globals)
const envEnableLG =
  (typeof process !== 'undefined' && process.env?.LIQUID_GLASS_PRE_IOS26 === '1') ||
  (global as any).__DEV_LIQUID_GLASS_PRE_IOS26__ === true;

const envProdDiag =
  (typeof process !== 'undefined' && process.env?.PROD_DIAGNOSTICS === '1') ||
  (global as any).__PROD_DIAGNOSTICS__ === true;

export const featureFlags: Flags = {
  enableLiquidGlassPreIOS26: Boolean(envEnableLG),
  productionDiagnosticsEnabled: Boolean(envProdDiag),
};

