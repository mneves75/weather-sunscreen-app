# Liquid Glass Implementation Guide

## Overview

The Weather Sunscreen App uses the official `expo-glass-effect` module to implement iOS 26's Liquid Glass visual effects. This provides a native glass blur effect that gracefully falls back on unsupported platforms.

## Current Implementation

### Module Used

- **Package**: `expo-glass-effect` v0.1.0
- **Component**: `GlassView`
- **Platform Support**: iOS 26+ (automatic fallback to regular View on other platforms)

### Architecture

```
src/components/glass/
├── LiquidGlassWrapper.tsx    # Main wrapper component
├── __tests__/
│   └── LiquidGlassWrapper.test.tsx
└── __dev__/
    └── GlassGallery.tsx      # Visual testing gallery
```

## Usage

### Basic Example

```tsx
import { LiquidGlassWrapper } from '@/components/glass/LiquidGlassWrapper';

<LiquidGlassWrapper variant="regular" style={styles.container}>
  <Text>Content with glass effect</Text>
</LiquidGlassWrapper>;
```

### Available Variants

The `LiquidGlassWrapper` component supports the following variants:

- `regular` - Standard glass effect (maps to GlassView's 'regular' style)
- `prominent` - Prominent glass effect (maps to GlassView's 'regular' style)
- `thin` - Thin/clear glass effect (maps to GlassView's 'clear' style)
- `glassProminent` - Glass prominent effect (maps to GlassView's 'regular' style)
- `glass` - Clear glass effect (maps to GlassView's 'clear' style)

### Component Props

```typescript
interface LiquidGlassWrapperProps {
  children: ReactNode;
  variant?: 'regular' | 'prominent' | 'thin' | 'glassProminent' | 'glass';
  style?: StyleProp<ViewStyle>;
}
```

## Implementation Details

### LiquidGlassWrapper Component

The wrapper component provides a simplified interface that:

1. Maps historical variant names to the official GlassView styles
2. Provides type safety with TypeScript
3. Gracefully handles platform fallbacks

```tsx
export function LiquidGlassWrapper({
  children,
  variant = 'regular',
  style,
}: LiquidGlassWrapperProps) {
  // Map variants to GlassView styles
  const glassStyle: 'regular' | 'clear' =
    variant === 'thin' || variant === 'glass' ? 'clear' : 'regular';

  return (
    <GlassView glassEffectStyle={glassStyle} style={style}>
      {children}
    </GlassView>
  );
}
```

### Platform Behavior

- **iOS 26+**: Renders native glass blur effect using UIVisualEffectView
- **iOS < 26**: Falls back to regular View without blur
- **Android**: Falls back to regular View
- **Web**: Falls back to regular View

## Testing

### Unit Tests

Located in `src/components/glass/__tests__/LiquidGlassWrapper.test.tsx`

Run tests:

```bash
npm test -- LiquidGlassWrapper
```

### Visual Testing

Use the Glass Gallery for visual testing (Expo Router dev route):

```bash
# Start the dev server
bun start

# Navigate to the Glass Gallery
# Go to: /(dev)/glass-gallery
```

### E2E Testing with Maestro

```bash
npx maestro test maestro/flows/liquid-glass-and-theme.yaml
```

> Theme diagnostics in Maestro now rely on the unified `ThemeProvider`. If you flip modes or high-contrast during a flow, remember the setters are synchronous (fire-and-forget) and will persist via AsyncStorage for subsequent runs.

## Performance Considerations

1. **Rendering Cost**: Glass effects use GPU-accelerated compositing but still have a performance cost
2. **Battery Impact**: Minimal impact when static, increases with animations
3. **Memory Usage**: Each GlassView creates a backing store for the blur effect
4. **Best Practices**:
   - Use sparingly on screens with many elements
   - Avoid nesting multiple glass effects
   - Consider disabling on low-end devices

## Migration from Custom Module

The app previously used a custom native Liquid Glass module. The migration to `expo-glass-effect` involved:

1. **Removed**: Custom native module at `modules/liquid-glass/`
2. **Removed**: TypeScript specs in `src/specs/`
3. **Simplified**: LiquidGlassWrapper to use GlassView directly
4. **Updated**: All imports to use the new wrapper

## Known Issues

1. **Interactive Property**: The `isInteractive` property is only honored on mount. To change interactivity, remount the component by changing its `key` prop.

2. **Android Support**: Glass effects are iOS-only. Android shows a regular View without blur.

3. **Simulator Rendering**: Glass effects may not render correctly in iOS Simulator. Test on real devices for accurate results.

## Future Enhancements

1. **Dynamic Blur Intensity**: When expo-glass-effect supports it, add blur intensity control
2. **Android Implementation**: Consider custom Android implementation using platform-appropriate APIs if needed (not planned)
3. **Performance Monitoring**: Add metrics to track glass effect impact on frame rates

## References

- https://docs.expo.dev/versions/latest/sdk/glass-effect/
- https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
