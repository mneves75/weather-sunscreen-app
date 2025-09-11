import fs from 'fs';
import path from 'path';

const readJSON = (p: string) => JSON.parse(fs.readFileSync(p, 'utf8'));

describe('iOS 26 Icon Composer readiness', () => {
  test('AppIcon.appiconset Contents.json declares iOS 26 properties', () => {
    const p = path.join(
      process.cwd(),
      'ios',
      'WeatherSunscreen',
      'Images.xcassets',
      'AppIcon.appiconset',
      'Contents.json',
    );
    expect(fs.existsSync(p)).toBe(true);
    const json = readJSON(p);
    expect(json?.properties?.['supports-dark-appearance']).toBe(true);
    expect(json?.properties?.['supports-tinted-appearance']).toBe(true);
    expect(json?.properties?.['pre-rendered']).toBe(true);
  });

  test('App icon image exists and is 1024x1024', () => {
    const iconPath = path.join(
      process.cwd(),
      'ios',
      'WeatherSunscreen',
      'Images.xcassets',
      'AppIcon.appiconset',
      'App-Icon-1024x1024@1x.png',
    );
    expect(fs.existsSync(iconPath)).toBe(true);
  });
});

