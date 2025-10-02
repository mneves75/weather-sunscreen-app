# UI Design System

**Weather Sunscreen App**  
**Version:** 3.0 (Expo SDK 54)  
**Platforms:** iOS 16+, Android API 29+

---

## Design Philosophy

The Weather Sunscreen App employs a **platform-adaptive design system** that leverages native capabilities while maintaining brand consistency:

- **iOS 26+**: Liquid Glass effects with depth and translucency
- **iOS < 26**: Blur effects with similar visual language
- **Android**: Material Design 3 with elevation and color emphasis
- **Accessibility**: Solid backgrounds with proper contrast when needed

---

## Color System

### Theme Colors
Defined in `src/theme/tokens.ts` and consumed via `useColors()` hook.

```typescript
interface ColorTokens {
  // Primary colors
  primary: string;           // Main brand color
  onPrimary: string;         // Text on primary
  primaryContainer: string;  // Lighter primary shade
  onPrimaryContainer: string;

  // Surface colors
  surface: string;           // Card/panel backgrounds
  onSurface: string;         // Text on surface
  surfaceVariant: string;    // Secondary surfaces
  onSurfaceVariant: string;

  // Background
  background: string;        // Screen background
  onBackground: string;      // Text on background

  // Semantic colors
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;

  warning: string;
  onWarning: string;

  success: string;
  onSuccess: string;

  info: string;
  onInfo: string;
  infoContainer: string;
  onInfoContainer: string;

  // UI elements
  outline: string;           // Borders
  outlineVariant: string;    // Subtle borders
  surfaceTint: string;       // Glass tint overlay
}
```

### UV Index Colors
```typescript
const UV_COLORS = {
  low: '#4CAF50',        // 0-2: Green
  moderate: '#FFC107',   // 3-5: Yellow
  high: '#FF9800',       // 6-7: Orange
  veryHigh: '#F44336',   // 8-10: Red
  extreme: '#9C27B0',    // 11+: Purple
};
```

### Contrast Requirements
- **Normal text**: 4.5:1 minimum against background
- **Large text** (18pt+): 3:1 minimum
- **UI components**: 3:1 minimum
- **High contrast mode**: 7:1 for all text

---

## Typography

### Font Families
- **iOS**: System font (San Francisco)
- **Android**: System font (Roboto)
- **Fallback**: System default

### Type Scale
```typescript
const typography = {
  h1: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  body1: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  body2: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  button: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
};
```

### Usage
```typescript
import { Text } from '@/src/components/ui';

<Text variant="h1">Heading</Text>
<Text variant="body1">Body text</Text>
<Text variant="caption">Caption text</Text>
```

---

## Spacing System

### Base Unit: 4px
All spacing uses multiples of 4px for consistency.

```typescript
const spacing = {
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  xxl: 24,  // 24px
  xxxl: 32, // 32px
};
```

### Common Patterns
- **Component padding**: 16px (spacing.lg)
- **Card padding**: 20px (spacing.xl)
- **Section margins**: 8px (spacing.sm)
- **List item padding**: 12px vertical (spacing.md)
- **Screen padding**: 16px horizontal (spacing.lg)

---

## Component Library

### GlassView (iOS 26+)
Primary glass effect component with automatic fallbacks.

```typescript
import { GlassView } from 'expo-glass-effect';

<GlassView 
  style={styles.card}
  glassEffectStyle="regular" // 'regular' | 'clear'
  isInteractive={false}      // Set once on mount
  tintColor={colors.primary} // Optional tint overlay
>
  <Text>Content</Text>
</GlassView>
```

**Fallback Pattern:**
```typescript
import { useGlassAvailability } from '@/src/theme/glassHelpers';

function Card({ children }) {
  const { canUseGlass } = useGlassAvailability();
  const { colors } = useColors();

  if (canUseGlass) {
    return (
      <GlassView style={styles.card}>
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {children}
    </View>
  );
}
```

### GlassContainer
Groups multiple glass elements for performance and visual merging.

```typescript
import { GlassContainer, GlassView } from 'expo-glass-effect';

<GlassContainer spacing={10}>
  <GlassView style={styles.item1} />
  <GlassView style={styles.item2} />
  <GlassView style={styles.item3} />
</GlassContainer>
```

**Spacing Guide:**
- `spacing={8}`: Tight grouping, slight merge
- `spacing={16}`: Balanced spacing
- `spacing={24}`: Separate but related
- `spacing={40}`: Independent elements

### Button
Standard button with multiple variants.

```typescript
import { Button } from '@/src/components/ui';

<Button
  title="Primary Action"
  variant="filled"    // 'filled' | 'outline' | 'ghost'
  size="medium"       // 'small' | 'medium' | 'large'
  onPress={handlePress}
  disabled={false}
  style={styles.button}
/>
```

**Variants:**
- **filled**: Solid background, high emphasis
- **outline**: Transparent background, border only
- **ghost**: No background or border, low emphasis

### Card
Surface container for grouping content.

```typescript
import { Card } from '@/src/components/ui';

<Card
  title="Weather Details"
  useGlass={true}      // iOS 26+ glass effect
  style={styles.card}
>
  <Text>Content</Text>
</Card>
```

### MetricChip
Small indicator for numeric values.

```typescript
import { MetricChip } from '@/src/components/ui';

<MetricChip
  label="Feels Like"
  value="32°C"
  icon="thermometer"
  useGlass={canUseGlass}
/>
```

---

## Layout Patterns

### Screen Layout
```typescript
<ScrollView
  style={[styles.container, { backgroundColor: colors.background }]}
  contentContainerStyle={styles.contentContainer}
  contentInsetAdjustmentBehavior="automatic"
>
  {/* Screen content */}
</ScrollView>

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
});
```

### Card Grid
```typescript
<View style={styles.cardGrid}>
  <Card style={styles.gridItem}>Content 1</Card>
  <Card style={styles.gridItem}>Content 2</Card>
</View>

const styles = StyleSheet.create({
  cardGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  gridItem: {
    flex: 1,
    minWidth: 150,
  },
});
```

### List Layout (FlashList)
```typescript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ListItem item={item} />}
  estimatedItemSize={80}
  keyExtractor={(item) => item.id}
/>
```

---

## Accessibility Patterns

### Interactive Elements
```typescript
<TouchableOpacity
  onPress={handlePress}
  accessibilityRole="button"
  accessibilityLabel="Mark as read"
  accessibilityHint="Double tap to mark this message as read"
  accessibilityState={{ disabled: isDisabled }}
>
  <Text>Mark as Read</Text>
</TouchableOpacity>
```

### Dynamic Content
```typescript
<View
  accessibilityRole="alert"
  accessibilityLiveRegion="polite"
>
  <Text>UV index is {uvIndex} - {severity}</Text>
</View>
```

### Form Fields
```typescript
<TextInput
  value={value}
  onChangeText={setValue}
  accessibilityLabel="Search weather locations"
  accessibilityHint="Enter a city name or zip code"
/>
```

---

## Animation Guidelines

### Transitions
- **Screen transitions**: 300ms ease-in-out
- **Modal presentations**: 250ms ease-out
- **Toast notifications**: 200ms ease-in-out
- **Glass effects**: Avoid animating during heavy operations

### Performance
- Use `useNativeDriver: true` for transforms and opacity
- Avoid animating `width`, `height`, `top`, `left` (use `transform` instead)
- Disable glass effects during scroll/complex animations

---

## Platform-Specific Guidelines

### iOS
- Use SF Symbols for icons (`Icon sf="house.fill"`)
- Native tab bar with `minimizeBehavior="onScrollDown"`
- Liquid Glass on iOS 26+, blur fallback on older versions
- Follow Human Interface Guidelines for spacing/layout

### Android
- Use Material Design icons or `@expo/vector-icons`
- Material Design 3 elevation system
- Edge-to-edge layout (always enabled in SDK 54)
- Follow Material Design guidelines for motion/spacing

---

## Performance Best Practices

### StyleSheet Usage
```typescript
// ✅ Good: Define once, reuse
const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
  },
});

<View style={styles.card} />

// ❌ Bad: Creates new object every render
<View style={{ borderRadius: 16, padding: 20 }} />
```

### Glass Effect Limits
- **Static screens**: Max 5-10 glass elements
- **Scrollable lists**: Use glass sparingly (list items, headers only)
- **Animations**: Disable glass during transitions
- **Low-end devices**: Consider performance impact

### List Performance
```typescript
// ✅ Good: FlashList for 10+ items
<FlashList
  data={items}
  renderItem={renderItem}
  estimatedItemSize={100}
/>

// ❌ Bad: FlatList for large datasets
<FlatList data={items} renderItem={renderItem} />
```

---

## Theme Integration

### Using Theme Colors
```typescript
import { useColors } from '@/src/theme/theme';

function Component() {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.text, { color: colors.onSurface }]}>
        Content
      </Text>
    </View>
  );
}
```

### Theme Switching
```typescript
import { useTheme } from '@/src/theme/theme';

function Settings() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <Button
      title={`Theme: ${themeMode}`}
      onPress={() => {
        const modes = ['light', 'dark', 'system'];
        const next = modes[(modes.indexOf(themeMode) + 1) % modes.length];
        setThemeMode(next);
      }}
    />
  );
}
```

---

## Example Implementations

### Weather Card with Glass
```typescript
export function WeatherCard({ data }: WeatherCardProps) {
  const { colors } = useColors();
  const { canUseGlass } = useGlassAvailability();

  const Wrapper = canUseGlass ? GlassView : View;

  return (
    <Wrapper 
      style={[
        styles.card,
        !canUseGlass && { backgroundColor: colors.surface }
      ]}
    >
      <Text style={[styles.location, { color: colors.onSurface }]}>
        {data.location.city}
      </Text>
      <Text style={[styles.temperature, { color: colors.primary }]}>
        {data.current.temperature}°
      </Text>
      <Text style={[styles.condition, { color: colors.onSurfaceVariant }]}>
        {data.current.condition.description}
      </Text>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginVertical: 12,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 4,
  },
  condition: {
    fontSize: 14,
    fontWeight: '400',
  },
});
```

### UV Indicator with Color Coding
```typescript
export function UVIndicator({ uvIndex }: UVIndicatorProps) {
  const { colors } = useColors();
  const uvColor = getUVColor(uvIndex.value);
  const { canUseGlass } = useGlassAvailability();

  return (
    <GlassView
      style={styles.indicator}
      tintColor={uvColor}
    >
      <Text style={styles.label}>UV Index</Text>
      <Text style={[styles.value, { color: uvColor }]}>
        {uvIndex.value}
      </Text>
      <Text style={[styles.level, { color: colors.onSurface }]}>
        {uvIndex.level}
      </Text>
    </GlassView>
  );
}

function getUVColor(value: number): string {
  if (value <= 2) return UV_COLORS.low;
  if (value <= 5) return UV_COLORS.moderate;
  if (value <= 7) return UV_COLORS.high;
  if (value <= 10) return UV_COLORS.veryHigh;
  return UV_COLORS.extreme;
}
```

---

## Resources

### Design References
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)
- [Expo Glass Effect Docs](https://docs.expo.dev/versions/v54.0.0/sdk/glass-effect/)
- [React Native Accessibility](https://reactnative.dev/docs/accessibility)

### Code References
- `src/theme/theme.tsx` - Theme system implementation
- `src/theme/tokens.ts` - Design tokens
- `src/components/ui/` - Base UI components
- `src/components/glass/` - Glass-specific components

---

**Last Updated:** 2025-10-02  
**Design System Version:** 3.0

