import fs from 'fs';
import path from 'path';

const readJSON = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));
const readText = (p: string) => fs.readFileSync(p, 'utf8');

describe('iOS deployment target configuration', () => {
  test('expo-build-properties sets production deployment target to 16.0', () => {
    const appJson = readJSON(path.join(process.cwd(), 'app.json'));
    const plugins = appJson.expo?.plugins || [];
    const buildProps = plugins.find(
      (p: any) => Array.isArray(p) && p[0] === 'expo-build-properties',
    );
    expect(buildProps).toBeTruthy();
    const ios = buildProps?.[1]?.ios;
    expect(ios?.deploymentTarget).toBe('16.0');
  });

  test('Podfile.properties.json uses production deployment target 16.0', () => {
    const props = readJSON(path.join(process.cwd(), 'ios', 'Podfile.properties.json'));
    expect(props['ios.deploymentTarget']).toBe('16.0');
  });

  test('ios26-config.xcconfig exists with iOS 26 settings', () => {
    const xcconfigPath = path.join(process.cwd(), 'ios', 'ios26-config.xcconfig');
    expect(fs.existsSync(xcconfigPath)).toBe(true);
    const xc = readText(xcconfigPath);
    expect(xc).toContain('IPHONEOS_DEPLOYMENT_TARGET = 26.0');
    expect(xc).toContain('SWIFT_VERSION = 6.0');
  });

  test('Xcode project sets IPHONEOS_DEPLOYMENT_TARGET = 26.0', () => {
    const pbxproj = readText(
      path.join(process.cwd(), 'ios', 'WeatherSunscreen.xcodeproj', 'project.pbxproj'),
    );
    expect(pbxproj).toContain('IPHONEOS_DEPLOYMENT_TARGET = 26.0');
  });
});
