// Setup file for module tests
global.Platform = {
  OS: 'ios',
  Version: '26.0',
  select: jest.fn((obj) => obj.ios || obj.default),
};

// Mock NativeModules if not already mocked
if (!global.NativeModules) {
  global.NativeModules = {};
}
