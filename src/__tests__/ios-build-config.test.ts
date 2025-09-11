import fs from 'fs';
import path from 'path';

const readJSON = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));

describe('iOS build configuration for SDK 54', () => {
  test('Podfile.properties.json builds RN from source (disables prebuilt)', () => {
    const propsPath = path.join(process.cwd(), 'ios', 'Podfile.properties.json');
    const json = readJSON(propsPath);
    expect(json['ios.buildReactNativeFromSource']).toBe('true');
  });

  test('Podfile includes C++ header search path ordering and tweaks', () => {
    const podfile = fs.readFileSync(path.join(process.cwd(), 'ios', 'Podfile'), 'utf8');
    // Basic sentinel checks for header paths and glog defines
    expect(podfile).toMatch(/HEADER_SEARCH_PATHS/);
    expect(podfile).toContain('$(SDKROOT)/usr/include/c++/v1');
    expect(podfile).toContain('$(SDKROOT)/usr/include');
    expect(podfile).toMatch(/GLOG_NO_ABBREVIATED_SEVERITIES|NO_THREADS=1/);
  });

  test('EAS build images match project policy (Xcode 26.0)', () => {
    const eas = readJSON(path.join(process.cwd(), 'eas.json'));
    const imageDev = eas.build.development.image;
    const imagePrev = eas.build.preview.image;
    const imageProd = eas.build.production.image;
    // All lanes target Xcode 26.0 (17A321 baseline)
    expect(imageDev).toContain('xcode-26.0');
    expect(imagePrev).toContain('xcode-26.0');
    expect(imageProd).toContain('xcode-26.0');
  });

  test('Deployment target defined (>= 16.0)', () => {
    const props = readJSON(path.join(process.cwd(), 'ios', 'Podfile.properties.json'));
    const target = props['ios.deploymentTarget'];
    expect(parseFloat(target)).toBeGreaterThanOrEqual(16);
  });
});
