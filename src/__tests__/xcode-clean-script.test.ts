import fs from 'fs';
import path from 'path';

describe('xcode-clean script robustness', () => {
  const script = fs.readFileSync(path.join(process.cwd(), 'scripts', 'xcode-clean.sh'), 'utf8');

  test('resolves SPM with scheme to avoid workspace error', () => {
    expect(script).toMatch(
      /-resolvePackageDependencies[\s\S]*-workspace[\s\S]*WeatherSunscreen\.xcworkspace[\s\S]*-scheme[\s\S]*WeatherSunscreen/,
    );
  });

  test('uses hardened removal for ModuleCache.noindex (find + rm -rf)', () => {
    expect(script).toMatch(/find "\$DERIVED\/ModuleCache\.noindex" -mindepth 1/);
  });
});
