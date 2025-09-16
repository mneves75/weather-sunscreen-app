import fs from 'fs';
import path from 'path';

describe('iOS Podfile baseline flags', () => {
  const podfile = fs.readFileSync(path.join(process.cwd(), 'ios', 'Podfile'), 'utf8');

  test('Hermes prebuilt disabled in ENV (HERMES_USE_PREBUILT_BINARY=0)', () => {
    expect(podfile).toMatch(/HERMES_USE_PREBUILT_BINARY'\] = '0'/);
  });

  test('CLANG_ENABLE_EXPLICIT_MODULES disabled to avoid warnings on Xcode 26', () => {
    expect(podfile).toMatch(/CLANG_ENABLE_EXPLICIT_MODULES'\] = 'NO'/);
  });

  test('SWIFT_ENABLE_EXPLICIT_MODULES disabled to avoid PCM generation flakiness', () => {
    expect(podfile).toMatch(/SWIFT_ENABLE_EXPLICIT_MODULES'\] = 'NO'/);
  });

  test('Swift 5.9 forced for pods to avoid Swift 6 breakages', () => {
    expect(podfile).toMatch(/SWIFT_VERSION'\] = '5\.9'/);
  });

  test('Pods iOS deployment target normalized to 16.0 baseline', () => {
    expect(podfile).toMatch(
      /IPHONEOS_DEPLOYMENT_TARGET'\] = podfile_properties\['ios\.deploymentTarget'\] \|\| '16\.0'/,
    );
  });

  test('Exclude x86_64 for iphonesimulator to prefer arm64 simulator on Apple Silicon', () => {
    expect(podfile).toMatch(/EXCLUDED_ARCHS\[sdk=iphonesimulator\*\]'\] = 'x86_64'/);
  });
});
