import fs from 'fs';
import path from 'path';

describe('Xcode env configuration', () => {
  test('ios/.xcode.env defines NODE_BINARY', () => {
    const p = path.join(process.cwd(), 'ios', '.xcode.env');
    const content = fs.readFileSync(p, 'utf8');
    expect(content).toMatch(/export\s+NODE_BINARY=/);
  });

  test('repo root .xcode.env defines NODE_BINARY (optional)', () => {
    const p = path.join(process.cwd(), '.xcode.env');
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      expect(content).toMatch(/export\s+NODE_BINARY=/);
    }
  });
});
