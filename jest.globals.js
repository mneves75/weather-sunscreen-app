// Set up global variables before any modules load
global.__DEV__ = true;

// Mock expo import.meta before modules load
global.__ExpoImportMetaRegistry = {};

// Mock structuredClone if not available
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}
