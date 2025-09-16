import { buildNavigationStyles } from '../navigationStyles';
import { tokens } from '../tokens';

describe('buildNavigationStyles', () => {
  const colors = tokens.light.colors;

  it('returns glass configuration for iOS', () => {
    const styles = buildNavigationStyles(colors, 'ios');
    expect(styles.useGlassBackground).toBe(true);
    expect(styles.tabBarStyle.backgroundColor).toBe('transparent');
    expect(styles.activeTintColor).toBe(colors.primary);
    expect(styles.inactiveTintColor).toBe(colors.secondary);
  });

  it('returns material configuration for Android', () => {
    const styles = buildNavigationStyles(colors, 'android');
    expect(styles.useGlassBackground).toBe(false);
    expect(styles.activeTintColor).toBe(colors.accent);
    expect(styles.activeBackgroundColor).toBeDefined();
    expect(styles.tabBarStyle.height).toBe(56);
  });

  it('falls back to neutral configuration for other platforms', () => {
    const styles = buildNavigationStyles(colors, 'web');
    expect(styles.useGlassBackground).toBe(false);
    expect(styles.tabBarStyle.backgroundColor).toBe(colors.surface);
  });
});
