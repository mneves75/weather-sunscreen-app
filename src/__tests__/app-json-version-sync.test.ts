import fs from 'fs';
import path from 'path';

const readJSON = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));

describe('App metadata stays in sync', () => {
  test('app.json version matches package.json and runtime policy is appVersion', () => {
    const app = readJSON(path.join(process.cwd(), 'app.json'));
    const pkg = readJSON(path.join(process.cwd(), 'package.json'));

    expect(app.expo.version).toBe(pkg.version);
    expect(app.expo.runtimeVersion.policy).toBe('appVersion');
    expect(app.expo.updates.enabled).toBe(true);
  });
});
