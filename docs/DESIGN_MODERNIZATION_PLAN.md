# Weather Sunscreen App - Design Modernization Plan
**Version:** 1.0
**Date:** 2025-10-07
**Target SDK:** Expo SDK 54, React Native 0.81, iOS 26, Android 16

---

## Executive Summary

This comprehensive modernization plan transforms the Weather Sunscreen App into an award-winning experience following the latest iOS 26 Liquid Glass guidelines, Material Design 3 for Android, and React Native best practices. The app currently has strong foundations (Liquid Glass implementation, theme system, accessibility) but needs refinement in **visual hierarchy, microinteractions, Material Design 3 compliance, and component polish**.

### Key Modernization Goals
1. **iOS 26 Excellence** - Leverage Liquid Glass, SF Symbols 7, Dynamic Type, and iOS 26 patterns
2. **Material Design 3 Parity** - Implement Material You, dynamic colors, and M3 components for Android
3. **Award-Winning Polish** - Apple Design Award-level microinteractions, animations, and attention to detail
4. **Performance & Accessibility** - Maintain 60fps, support all accessibility features, optimize for battery

### Success Metrics
- **Visual Consistency:** 100% adherence to HIG (iOS) and Material Design 3 (Android)
- **Performance:** 60fps sustained during all interactions, < 200ms interaction response
- **Accessibility:** WCAG 2.2 AAA compliance, 4.5:1 contrast minimum
- **User Delight:** Fluid animations (300ms max), spring-based physics, delightful microinteractions

---

## 1. Current State Assessment

### ✅ Strengths
| Feature | Implementation | Quality |
|---------|----------------|---------|
| **Liquid Glass** | `GlassView`, `GlassCard`, `GlassContainer`, `GlassEffectProvider` | 🟢 Excellent - iOS 26+ native with accessibility fallbacks |
| **Theme System** | `theme.tsx`, `tokens.ts` with Apple-inspired colors | 🟢 Excellent - Dark mode, high contrast, AsyncStorage persistence |
| **Typography** | SF Pro Text/Display (iOS), Inter (Android) | 🟢 Good - Proper font stacks, scale defined |
| **Spacing System** | 8px base grid with semantic tokens | 🟢 Excellent - Consistent spacing scale (xxs to xxxl) |
| **Accessibility** | Reduce transparency, reduce motion, roles/labels | 🟢 Excellent - VoiceOver/TalkBack ready |
| **Navigation** | Expo Router v6 with NativeTabs, SF Symbols | 🟢 Excellent - Badge support, minimize behavior |
| **Architecture** | Service layer, Context providers, typed routes | 🟢 Excellent - Clean separation of concerns |

### ⚠️ Areas for Improvement
| Category | Issues | Priority |
|----------|--------|----------|
| **Visual Hierarchy** | Cards feel flat, inconsistent shadows, uniform corners | 🔴 High |
| **Microinteractions** | Missing button press states, static cards, no spring animations | 🔴 High |
| **Material Design 3** | No Material You, missing M3 components (chips, FABs), elevation not M3-compliant | 🔴 High |
| **Typography Dynamics** | No Dynamic Type support, temperature display not dramatic enough | 🟡 Medium |
| **Loading States** | Basic spinners, no skeleton loaders, missing pull-to-refresh polish | 🟡 Medium |
| **Data Visualization** | UV indicator static, no hourly charts, forecast too list-like | 🟡 Medium |
| **Component Library** | Missing: Bottom sheets, FABs, Search bars, M3 Chips, Segmented controls | 🟢 Low |

---

## 2. iOS 26 Liquid Glass Modernization Strategy

### Design Philosophy: **"Content Through Glass"**
Apple's iOS 26 Liquid Glass creates depth by layering UI elements over blurred content. The Weather Sunscreen App should embrace this by:
1. **Hero glass containers** for primary data (temperature, UV index)
2. **Contextual content** visible through glass (weather conditions, location details)
3. **Dynamic tinting** based on weather conditions (blue for sunny, gray for rainy)

### 2.1 Screen-by-Screen Liquid Glass Enhancements

#### **Home Screen (index.tsx)**
Current: Glass cards for weather/UV, solid background
**Modernized:**
```typescript
// Hero Temperature Display with Large Glass Container
<GlassContainer spacing={0} direction="column">
  {/* Background: Animated weather gradient */}
  <LinearGradient colors={weatherGradient}>
    <GlassView
      glassEffectStyle="clear"  // Clearer for dramatic effect
      elevation={5}  // Maximum depth
      tintColor={weatherTint}  // Dynamic based on conditions
    >
      <Text variant="display" fontSize={76} fontWeight="200">
        {temperature}°
      </Text>
      <Text variant="h3" fontWeight="300">{condition}</Text>
    </GlassView>
  </LinearGradient>
</GlassContainer>

// UV Index Circular Progress with Glass
<GlassView glassEffectStyle="regular" elevation={3}>
  <CircularProgress
    value={uvIndex}
    max={11}
    color={uvLevelColor}
    trackWidth={12}
    strokeLinecap="round"
  >
    <Text variant="3xl" fontWeight="600">{uvIndex}</Text>
    <Text variant="caption" color={textSecondary}>{uvLevel}</Text>
  </CircularProgress>
</GlassView>
```

**Changes:**
- ✨ Temperature display 48px → 76px (dramatic hero size)
- ✨ Glass tinting based on weather conditions (blue sunny, gray rainy)
- ✨ UV index → Circular progress indicator with glass background
- ✨ Animated weather gradients behind glass
- ✨ Elevation varies by importance (5 for hero, 3 for secondary, 1 for tertiary)

#### **Forecast Screen (forecast.tsx)**
Current: Glass header with date range, FlatList of forecast items
**Modernized:**
```typescript
// Sticky Glass Header with Blur (scrolls with content, blurs background)
<Animated.View style={headerAnimStyle}>
  <GlassView
    glassEffectStyle="regular"
    elevation={2}
    style={styles.stickyHeader}
  >
    <Text variant="h2">7-Day Forecast</Text>
    <Text variant="body2" color={textSecondary}>{dateRange}</Text>
  </GlassView>
</Animated.View>

// Forecast Cards with Staggered Animation + Glass
{days.map((day, index) => (
  <Animated.View
    entering={FadeInDown.delay(index * 50).springify()}
    key={day.date}
  >
    <GlassCard
      elevation={1 + (index === 0 ? 1 : 0)}  // Today elevated
      onPress={() => navigateToDetail(day)}
    >
      {/* Forecast content with better visual hierarchy */}
    </GlassCard>
  </Animated.View>
))}
```

**Changes:**
- ✨ Sticky header with parallax blur effect (blurs as you scroll)
- ✨ Staggered entrance animations (50ms delay per card)
- ✨ Today's forecast elevated (elevation 2) vs others (elevation 1)
- ✨ Swipe gesture to view hourly details

#### **UV Index Screen (uv.tsx)**
Current: Hero UV indicator, skin type selector, recommendations
**Modernized:**
```typescript
// Hero UV Indicator with Animated Gradient Ring
<GlassView glassEffectStyle="clear" elevation={5}>
  <AnimatedCircularProgress
    value={uvIndex}
    max={11}
    gradient={uvGradient}  // Green → Yellow → Orange → Red → Purple
    trackWidth={16}
    strokeLinecap="round"
    animateOnMount
    duration={1000}
    easing={Easing.bezier(0.4, 0.0, 0.2, 1)}  // Material motion
  >
    <Text variant="5xl" fontWeight="700">{uvIndex}</Text>
    <Text variant="body1" color={textSecondary}>{uvLevel}</Text>
  </AnimatedCircularProgress>
</GlassView>

// SPF Recommendation with Glass Chip
<GlassChip
  icon="shield.checkmark"
  label={`SPF ${spfRecommendation}+`}
  color={primary}
  size="large"
/>
```

**Changes:**
- ✨ Animated gradient ring for UV index (smooth color transitions)
- ✨ Spring animation on mount (bouncy, playful entrance)
- ✨ SPF recommendation as prominent glass chip
- ✨ Skin type selector with visual feedback (checkmarks, haptics)

#### **Weather Detail Screen (weather.tsx)**
Current: Sticky glass header, hero weather card, metric chips, details section
**Modernized:**
```typescript
// Parallax Header with Animated Weather Background
<Animated.View style={parallaxStyle}>
  <LinearGradient colors={weatherGradient} style={styles.parallaxHeader}>
    <GlassView glassEffectStyle="clear" elevation={3}>
      <LocationDisplay location={location} showCoordinates />
    </GlassView>
  </LinearGradient>
</Animated.View>

// Metric Chips with Subtle Animations
<View style={styles.chipRow}>
  {metricChips.map((chip, index) => (
    <Pressable
      key={chip.label}
      onPress={() => showMetricDetail(chip)}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.chipPressed,  // Scale down 0.95
      ]}
    >
      <GlassCard elevation={1}>
        <Animated.View entering={FadeIn.delay(index * 30)}>
          <Icon name={chip.icon} size={24} color={primary} />
          <Text variant="caption">{chip.label}</Text>
          <Text variant="body2" fontWeight="600">{chip.value}</Text>
        </Animated.View>
      </GlassCard>
    </Pressable>
  ))}
</View>
```

**Changes:**
- ✨ Parallax header with animated weather gradient (scrolls slower than content)
- ✨ Pressable metric chips with press feedback (scale 0.95, haptic)
- ✨ Staggered chip animations (30ms delay)
- ✨ Glass details section with grouped metrics

#### **Settings Screen (settings.tsx)**
Current: Categorized glass sections with switches, selectors
**Modernized:**
```typescript
// Section Headers with Subtle Animations
{sections.map((section, index) => (
  <Animated.View
    entering={FadeInDown.delay(index * 50)}
    key={section.title}
  >
    <GlassSection title={section.title}>
      {section.items.map((item, itemIndex) => (
        <SettingItem
          key={item.key}
          {...item}
          onPress={() => handleSettingPress(item)}
          style={({ pressed }) => [
            pressed && styles.itemPressed,  // Highlight on press
          ]}
        />
      ))}
    </GlassSection>
  </Animated.View>
))}

// Animated Switches with Haptic Feedback
<Switch
  value={enabled}
  onValueChange={(value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateSetting(value);
  }}
  trackColor={{
    false: colors.surfaceVariant,
    true: colors.primary
  }}
  thumbColor={enabled ? colors.onPrimary : colors.onSurfaceVariant}
/>
```

**Changes:**
- ✨ Staggered section entrance animations
- ✨ Press feedback on setting items (highlight + scale)
- ✨ Haptic feedback on switch toggles
- ✨ Animated reset button with confirmation

### 2.2 Liquid Glass Best Practices

#### **Performance Optimization**
```typescript
// Disable glass during scroll for 60fps
const [isScrolling, setIsScrolling] = useState(false);

<ScrollView
  onScrollBeginDrag={() => setIsScrolling(true)}
  onScrollEndDrag={() => setIsScrolling(false)}
  onMomentumScrollEnd={() => setIsScrolling(false)}
>
  <GlassView disabled={isScrolling}>
    {content}
  </GlassView>
</ScrollView>
```

#### **Accessibility Fallbacks**
```typescript
// Always check reduce transparency + provide solid alternatives
const { canUseGlass } = useGlassAvailability();

{canUseGlass ? (
  <GlassView>{content}</GlassView>
) : (
  <View style={[styles.solidCard, { backgroundColor: colors.surface }]}>
    {content}
  </View>
)}
```

#### **Glass Hierarchy**
- **Elevation 5:** Hero elements (temperature display, primary actions)
- **Elevation 3:** Secondary cards (UV indicator, weather details)
- **Elevation 2:** List items, forecast cards
- **Elevation 1:** Chips, tags, tertiary elements

---

## 3. Material Design 3 (Android) Strategy

### Design Philosophy: **"Material You + Personal Expression"**
Material Design 3 emphasizes dynamic colors, tonal surfaces, and personalized experiences. The Weather Sunscreen App should:
1. **Dynamic color extraction** from user wallpaper (Material You)
2. **Tonal elevation system** instead of shadows
3. **Emphasized easing** for motion (0.4, 0.0, 0.2, 1.0 bezier)

### 3.1 Material You Dynamic Colors

```typescript
// Android: Extract dynamic colors from wallpaper
import { DynamicColorAndroid } from 'react-native';

const androidColors = Platform.OS === 'android'
  ? await DynamicColorAndroid.getPalette()
  : null;

const materialYouColors: ThemeColors = {
  primary: androidColors?.primary ?? '#007AFF',
  primaryContainer: androidColors?.primaryContainer ?? '#E5F2FF',
  secondary: androidColors?.secondary ?? '#30D158',
  // ... dynamic color mapping
};
```

### 3.2 Material Design 3 Component Updates

#### **Buttons**
Current: Basic button with variant support
**Modernized:**
```typescript
// M3 Button Variants
<Button variant="filled">    {/* Primary, filled background */}
<Button variant="filledTonal"> {/* Tinted, tonal background */}
<Button variant="outlined">  {/* Outlined, no background */}
<Button variant="text">      {/* Text only, no background */}

// Implementation with Material Motion
const ButtonComponent = ({ variant, ...props }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = 0.95; }}
      onPressOut={() => { scale.value = 1.0; }}
      style={[styles[variant], animatedStyle]}
    >
      {/* Button content */}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  filled: {
    backgroundColor: colors.primary,
    // No shadow, uses elevation tones
  },
  filledTonal: {
    backgroundColor: colors.secondaryContainer,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
  },
  text: {
    backgroundColor: 'transparent',
  },
});
```

#### **Cards**
Current: Glass cards (iOS), solid cards (Android)
**Modernized:**
```typescript
// Android: Tonal elevation system (no shadows)
const Card = ({ elevation = 1, children }) => {
  const elevationColor = useMemo(() => {
    // Material 3 tonal elevation: blend primary with surface
    const elevationMap = {
      1: blend(colors.surface, colors.primary, 0.05),
      2: blend(colors.surface, colors.primary, 0.08),
      3: blend(colors.surface, colors.primary, 0.11),
      4: blend(colors.surface, colors.primary, 0.12),
      5: blend(colors.surface, colors.primary, 0.14),
    };
    return elevationMap[elevation];
  }, [elevation, colors]);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: Platform.OS === 'android' ? elevationColor : colors.surface },
      ]}
    >
      {children}
    </View>
  );
};
```

#### **Chips (NEW Component)**
```typescript
// Material 3 Chips (Assist, Filter, Input, Suggestion)
interface ChipProps {
  type: 'assist' | 'filter' | 'input' | 'suggestion';
  label: string;
  icon?: string;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
}

export const Chip = ({ type, label, icon, selected, onPress, onDelete }: ChipProps) => {
  const styles = getChipStyles(type, selected);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        pressed && styles.pressed,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={styles.iconColor} />}
      <Text variant="body2" fontWeight="500">{label}</Text>
      {onDelete && type === 'input' && (
        <Pressable onPress={onDelete}>
          <Icon name="close" size={18} />
        </Pressable>
      )}
    </Pressable>
  );
};
```

#### **Floating Action Button (NEW Component)**
```typescript
// Material 3 FAB with Extended variant
interface FABProps {
  icon: string;
  label?: string;  // Extended FAB shows label
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
}

export const FAB = ({ icon, label, onPress, size = 'medium' }: FABProps) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(scale.value) },
      { rotate: `${withSpring(rotation.value)}deg` },
    ],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = 0.9;
        rotation.value = 15;
      }}
      onPressOut={() => {
        scale.value = 1.0;
        rotation.value = 0;
      }}
      style={[styles.fab, styles[size], animatedStyle]}
    >
      <Icon name={icon} size={24} color={colors.onPrimary} />
      {label && <Text variant="body2" fontWeight="600">{label}</Text>}
    </Pressable>
  );
};
```

### 3.3 Material Motion (Emphasized Easing)

```typescript
// Material Design 3 emphasized easing
const emphasizedEasing = Easing.bezier(0.4, 0.0, 0.2, 1.0);

// Apply to all transitions
const fadeIn = {
  animation: 'timing',
  duration: 300,
  easing: emphasizedEasing,
};

// Spring animations for playful interactions
const springConfig = {
  damping: 15,
  mass: 1,
  stiffness: 150,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};
```

---

## 4. Cross-Platform Improvements

### 4.1 Typography Enhancements

#### **Dynamic Type Support (iOS)**
```typescript
import { useWindowDimensions } from 'react-native';

// Scale fonts based on device + accessibility settings
export const useDynamicFontSize = (baseSize: number) => {
  const { fontScale } = useWindowDimensions();
  return Math.round(baseSize * fontScale);
};

// Usage
<Text style={{ fontSize: useDynamicFontSize(17) }}>
  Scales with iOS Settings → Display & Brightness → Text Size
</Text>
```

#### **Temperature Display Refinement**
```typescript
// Current: 48px, weight 600
// Modernized: 76px, weight 200 (ultralight), tighter letter-spacing

<Text
  style={{
    fontSize: 76,
    fontWeight: '200',  // Ultralight for elegance
    letterSpacing: -1.5,  // Tighter for large sizes
    lineHeight: 84,  // 1.1 ratio
  }}
>
  {temperature}°
</Text>
```

### 4.2 Loading States & Skeletons

#### **Skeleton Loaders**
```typescript
// Replace basic LoadingSpinner with content-aware skeletons
import { Skeleton } from '@/components/ui';

// Weather Card Skeleton
<Skeleton variant="card">
  <Skeleton.Rect width="100%" height={200} borderRadius={20} />
  <Skeleton.Text width="60%" height={24} />
  <Skeleton.Text width="40%" height={16} />
</Skeleton>

// Implementation with shimmer animation
const SkeletonRect = ({ width, height, borderRadius }) => {
  const shimmerAnim = useSharedValue(-1);

  useEffect(() => {
    shimmerAnim.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,  // Infinite
      false
    );
  }, []);

  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.surfaceVariant,
        overflow: 'hidden',
      }}
    >
      <Animated.View style={shimmerStyle} />
    </View>
  );
};
```

#### **Pull-to-Refresh Enhancement**
```typescript
// Custom pull-to-refresh with spring animation
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const pullGesture = Gesture.Pan()
  .onUpdate((e) => {
    if (e.translationY > 0) {
      translateY.value = e.translationY * 0.5;  // Resistance factor
      rotation.value = e.translationY * 0.1;    // Rotate icon
    }
  })
  .onEnd(() => {
    if (translateY.value > threshold) {
      // Trigger refresh
      runOnJS(onRefresh)();
    }
    translateY.value = withSpring(0);
    rotation.value = withSpring(0);
  });
```

### 4.3 Microinteractions Checklist

| Interaction | Current | Modernized | Implementation |
|-------------|---------|------------|----------------|
| **Button Press** | Static | Scale 0.95 + haptic | `Pressable` with `useSharedValue` |
| **Card Tap** | Static | Scale 0.98 + opacity 0.8 | Animated press state |
| **Switch Toggle** | Basic | Haptic + animated thumb | `Haptics.impactAsync()` |
| **Tab Change** | Instant | Fade 200ms | Expo Router animation |
| **Modal Present** | Slide up | Spring bounce | `presentationStyle="pageSheet"` |
| **List Scroll** | Basic | Momentum + rubber band | Native iOS/Android behavior |
| **Pull Refresh** | Spinner | Custom spring + rotation | Gesture handler |
| **Toast/Snackbar** | Alert | Slide up from bottom | Animated notification |

---

## 5. File Tree: Modernization Changes

```
weather-sunscreen-app/
├── app/                                    # Expo Router screens
│   ├── (tabs)/
│   │   ├── (home)/
│   │   │   ├── index.tsx                  🔧 REFACTOR - Hero glass temperature, UV circular progress
│   │   │   ├── weather.tsx                🔧 REFACTOR - Parallax header, animated chips
│   │   │   ├── uv.tsx                     🔧 REFACTOR - Animated circular UV indicator
│   │   │   └── forecast.tsx               🔧 REFACTOR - Staggered animations, sticky glass header
│   │   ├── (messages)/
│   │   │   └── index.tsx                  🔧 REFACTOR - M3 chips for filters, FAB for compose
│   │   ├── (styles)/
│   │   │   └── settings.tsx               🔧 REFACTOR - Animated sections, haptic switches
│   │   └── _layout.tsx                    ✅ KEEP - Native tabs already excellent
│   └── modal.tsx                          🔧 REFACTOR - Glass modal background, spring transition
│
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx                 🔧 REFACTOR - M3 variants (filled, tonal, outlined, text)
│   │   │   ├── Card.tsx                   🔧 REFACTOR - M3 tonal elevation system
│   │   │   ├── Chip.tsx                   ➕ NEW - M3 chip variants (assist, filter, input, suggestion)
│   │   │   ├── FAB.tsx                    ➕ NEW - Material 3 floating action button
│   │   │   ├── BottomSheet.tsx            ➕ NEW - Modal bottom sheet with glass/M3 variants
│   │   │   ├── SearchBar.tsx              ➕ NEW - Glass search bar (iOS) + M3 search (Android)
│   │   │   ├── SegmentedControl.tsx       ➕ NEW - iOS segmented control with glass
│   │   │   ├── Skeleton.tsx               ➕ NEW - Skeleton loaders with shimmer animation
│   │   │   ├── CircularProgress.tsx       ➕ NEW - Animated circular progress for UV index
│   │   │   ├── Text.tsx                   🔧 REFACTOR - Add Dynamic Type support
│   │   │   └── GlassCard.tsx              🔧 REFACTOR - Enhanced with elevation prop
│   │   │
│   │   └── weather/
│   │       ├── TemperatureDisplay.tsx     ➕ NEW - Dramatic hero temperature component
│   │       ├── UVCircularIndicator.tsx    ➕ NEW - Animated UV circular progress
│   │       ├── WeatherGradient.tsx        ➕ NEW - Animated weather condition gradients
│   │       └── ForecastCard.tsx           🔧 REFACTOR - Better visual hierarchy, swipe actions
│   │
│   ├── theme/
│   │   ├── tokens.ts                      🔧 REFACTOR - Add M3 tonal elevation system
│   │   ├── animations.ts                  ➕ NEW - Centralized animation configs
│   │   ├── motion.ts                      ➕ NEW - Material motion utilities
│   │   └── materialYou.ts                 ➕ NEW - Dynamic color extraction (Android)
│   │
│   ├── hooks/
│   │   ├── useDynamicFontSize.ts          ➕ NEW - iOS Dynamic Type support
│   │   ├── useHaptics.ts                  ➕ NEW - Centralized haptic feedback
│   │   └── useMaterialYou.ts              ➕ NEW - Material You color hook (Android)
│   │
│   └── utils/
│       ├── colorBlend.ts                  ➕ NEW - M3 tonal elevation color blending
│       └── animations.ts                  ➕ NEW - Reusable animation presets
│
└── docs/
    └── DESIGN_MODERNIZATION_PLAN.md       ➕ NEW - This document

Legend:
➕ NEW       - New file to create
🔧 REFACTOR  - Existing file to update
✅ KEEP      - No changes needed
```

---

## 6. Implementation Roadmap (4 Phases)

### Phase 1: Foundation (Week 1) 🏗️
**Goal:** Core component library modernization

**Tasks:**
1. ✅ Create M3 button variants (filled, tonal, outlined, text)
2. ✅ Implement M3 tonal elevation system for cards
3. ✅ Build skeleton loader components
4. ✅ Add Dynamic Type support to Text component
5. ✅ Create animation presets (theme/animations.ts)
6. ✅ Implement M3 Chip component
7. ✅ Build CircularProgress component for UV index

**Deliverables:**
- 7 new/updated components in `src/components/ui/`
- Animation configuration system
- Tonal elevation utility functions
- Unit tests for new components

**Success Metrics:**
- All components render correctly on iOS + Android
- 60fps animations maintained
- Accessibility labels present

---

### Phase 2: Hero Experiences (Week 2) ⭐
**Goal:** Transform primary screens with dramatic hero elements

**Tasks:**
1. ✅ Home Screen
   - Hero temperature display (76px, ultralight font)
   - Animated UV circular progress indicator
   - Weather gradient backgrounds
   - Staggered card entrance animations

2. ✅ UV Index Screen
   - Large animated circular progress
   - Gradient ring animation (green → red → purple)
   - Spring entrance animation
   - Glass SPF chip

3. ✅ Weather Detail Screen
   - Parallax header with weather gradient
   - Animated metric chips with press feedback
   - Glass details section

4. ✅ Forecast Screen
   - Sticky glass header with blur
   - Staggered forecast card animations
   - Swipe-to-reveal hourly details

**Deliverables:**
- 4 modernized screens with hero elements
- Weather gradient component
- Circular progress component
- Before/after screenshots for portfolio

**Success Metrics:**
- Temperature display visually striking (76px)
- Smooth 60fps animations throughout
- All interactions have haptic feedback
- Glass effects degrade gracefully

---

### Phase 3: Material Design 3 Parity (Week 3) 🤖
**Goal:** Achieve M3 excellence on Android

**Tasks:**
1. ✅ Implement Material You dynamic colors
   - Extract wallpaper palette
   - Generate tonal palette
   - Apply to all components

2. ✅ Build M3-specific components
   - FAB (small, medium, large, extended)
   - Bottom navigation bar (M3 style)
   - Chips (assist, filter, input, suggestion)
   - Search bar (M3 spec)

3. ✅ Update motion system
   - Emphasized easing (0.4, 0.0, 0.2, 1.0)
   - Duration guidelines (100ms, 200ms, 300ms)
   - Spring physics configs

4. ✅ Android-specific polish
   - Tonal elevation instead of shadows
   - State layers (pressed, focused, hovered)
   - Ripple effects on interactive elements

**Deliverables:**
- Material You color system
- 4 new M3 components
- Motion configuration system
- Android-specific component variants

**Success Metrics:**
- Dynamic colors match wallpaper
- All interactions use emphasized easing
- Ripple effects on all pressable elements
- Material 3 compliance 100%

---

### Phase 4: Microinteractions & Polish (Week 4) ✨
**Goal:** Apple Design Award-level attention to detail

**Tasks:**
1. ✅ Add haptic feedback to all interactions
   - Button presses: Light impact
   - Switch toggles: Medium impact
   - Errors: Notification feedback
   - Success actions: Success feedback

2. ✅ Enhance loading states
   - Skeleton loaders for all screens
   - Custom pull-to-refresh indicator
   - Animated progress indicators
   - Shimmer effects

3. ✅ Polish transitions
   - Screen transitions: Spring animations
   - Modal presentations: Page sheet with bounce
   - Tab changes: Crossfade 200ms
   - List items: Staggered entrance

4. ✅ Add edge cases & empty states
   - No data: Illustrated empty states
   - Errors: Friendly error messages
   - Offline: Cached data with indicator
   - Loading: Context-aware skeletons

5. ✅ Performance optimization
   - Disable glass during scroll
   - Memoize expensive computations
   - Optimize images (WebP, lazy loading)
   - Reduce overdraw (GPU profiling)

**Deliverables:**
- Haptic feedback system
- Enhanced loading states
- Polished transitions
- Performance audit report

**Success Metrics:**
- 100% of interactions have haptic feedback
- Loading states context-aware (skeletons, not spinners)
- 60fps maintained during all animations
- Battery usage < 5% per hour

---

## 7. Detailed Component Specifications

### 7.1 Hero Temperature Display

**File:** `src/components/weather/TemperatureDisplay.tsx`

```typescript
/**
 * Hero Temperature Display
 * Dramatic large-format temperature with glass effect
 *
 * Design principles:
 * - Ultralight font weight (200) for elegance
 * - Large size (76px) for hero prominence
 * - Tight letter-spacing (-1.5) for refinement
 * - Dynamic glass tinting based on weather
 */

import React, { useEffect } from 'react';
import { GlassView } from '@/components/glass';
import { Text } from '@/components/ui';
import { useColors } from '@/theme';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle
} from 'react-native-reanimated';

interface TemperatureDisplayProps {
  temperature: number;
  unit: 'C' | 'F';
  condition: string;
  weatherType: 'sunny' | 'rainy' | 'cloudy' | 'snowy';
}

export const TemperatureDisplay = ({
  temperature,
  unit,
  condition,
  weatherType,
}: TemperatureDisplayProps) => {
  const colors = useColors();
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withSpring(1, { damping: 15 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Dynamic glass tinting based on weather
  const glassTint = {
    sunny: 'rgba(0, 122, 255, 0.08)',    // Blue tint
    rainy: 'rgba(84, 84, 88, 0.12)',     // Gray tint
    cloudy: 'rgba(142, 142, 147, 0.10)', // Light gray
    snowy: 'rgba(10, 132, 255, 0.06)',   // Light blue
  }[weatherType];

  return (
    <GlassView
      glassEffectStyle="clear"
      elevation={5}
      tintColor={glassTint}
      style={styles.container}
    >
      <Animated.View style={animatedStyle}>
        <Text
          style={styles.temperature}
          accessibilityLabel={`Temperature ${temperature} degrees ${unit === 'C' ? 'Celsius' : 'Fahrenheit'}`}
        >
          {temperature}°
        </Text>
        <Text
          style={styles.condition}
          accessibilityLabel={`Condition: ${condition}`}
        >
          {condition}
        </Text>
      </Animated.View>
    </GlassView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  temperature: {
    fontSize: 76,
    fontWeight: '200',  // Ultralight
    letterSpacing: -1.5,
    lineHeight: 84,
    textAlign: 'center',
  },
  condition: {
    fontSize: 22,
    fontWeight: '300',  // Light
    marginTop: 8,
    opacity: 0.8,
    textAlign: 'center',
  },
});
```

**Usage:**
```typescript
<TemperatureDisplay
  temperature={24}
  unit="C"
  condition="Partly Cloudy"
  weatherType="cloudy"
/>
```

**Features:**
- ✨ Dramatic 76px temperature display
- ✨ Spring entrance animation (bouncy, playful)
- ✨ Dynamic glass tinting per weather condition
- ✨ Accessibility labels for VoiceOver/TalkBack
- ✨ Ultralight font weight (200) for elegance

---

### 7.2 Circular UV Progress Indicator

**File:** `src/components/ui/CircularProgress.tsx`

```typescript
/**
 * Animated Circular Progress Indicator
 * Used for UV index with gradient color support
 *
 * Design principles:
 * - Smooth animated ring (Reanimated)
 * - Gradient support (green → yellow → red → purple)
 * - Stroke linecap "round" for premium look
 * - Spring animation on mount
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Text';
import { useColors } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  value: number;           // Current value (e.g., 8 for UV index)
  max: number;             // Maximum value (e.g., 11 for UV)
  size?: number;           // Diameter in pixels
  trackWidth?: number;     // Ring thickness
  gradient?: string[];     // Array of colors for gradient
  children?: React.ReactNode;
}

export const CircularProgress = ({
  value,
  max,
  size = 200,
  trackWidth = 12,
  gradient = ['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2'],
  children,
}: CircularProgressProps) => {
  const colors = useColors();
  const progress = useSharedValue(0);

  const radius = (size - trackWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animate to target value with emphasized easing
    progress.value = withTiming(value / max, {
      duration: 1000,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1.0),  // Material motion
    });
  }, [value, max]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference * (1 - progress.value);
    return { strokeDashoffset };
  });

  // Calculate gradient color based on progress
  const getGradientColor = (progress: number) => {
    const colorIndex = Math.min(
      Math.floor(progress * (gradient.length - 1)),
      gradient.length - 1
    );
    return gradient[colorIndex];
  };

  const strokeColor = getGradientColor(value / max);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background track */}
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceVariant}
          strokeWidth={trackWidth}
          fill="transparent"
        />
        {/* Animated progress */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={trackWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          fill="transparent"
          animatedProps={animatedProps}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Usage:**
```typescript
<CircularProgress
  value={8}
  max={11}
  size={200}
  trackWidth={12}
  gradient={['#30D158', '#FFD60A', '#FF9F0A', '#FF453A', '#BF5AF2']}
>
  <Text variant="5xl" fontWeight="700">8</Text>
  <Text variant="body1" color={textSecondary}>Very High</Text>
</CircularProgress>
```

**Features:**
- ✨ Smooth animated ring (1000ms emphasized easing)
- ✨ Gradient color transitions (green → red → purple)
- ✨ Customizable size, track width, colors
- ✨ Center content slot for value display
- ✨ Round stroke linecaps for premium look

---

### 7.3 Material 3 Chip Component

**File:** `src/components/ui/Chip.tsx`

```typescript
/**
 * Material 3 Chip Component
 * Supports all M3 chip variants: assist, filter, input, suggestion
 *
 * Design principles:
 * - Tonal elevation for depth (no shadows)
 * - State layers for interaction feedback
 * - Emphasized easing for motion
 * - Accessibility-first (labels, roles)
 */

import React from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import { Text } from './Text';
import { Icon } from './Icon';
import { useColors } from '@/theme';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

type ChipType = 'assist' | 'filter' | 'input' | 'suggestion';
type ChipSize = 'small' | 'medium';

interface ChipProps {
  type: ChipType;
  label: string;
  icon?: string;
  selected?: boolean;
  size?: ChipSize;
  onPress?: () => void;
  onDelete?: () => void;  // For 'input' type only
  disabled?: boolean;
}

export const Chip = ({
  type,
  label,
  icon,
  selected = false,
  size = 'medium',
  onPress,
  onDelete,
  disabled = false,
}: ChipProps) => {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value) }],
  }));

  const handlePressIn = () => {
    scale.value = 0.95;
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value = 1.0;
  };

  const chipStyles = getChipStyles(type, selected, size, colors);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={({ pressed }) => [
          chipStyles.container,
          pressed && chipStyles.pressed,
          disabled && chipStyles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${type} chip: ${label}${selected ? ', selected' : ''}`}
        accessibilityState={{ selected, disabled }}
      >
        {icon && (
          <Icon
            name={icon}
            size={size === 'small' ? 16 : 18}
            color={chipStyles.iconColor}
          />
        )}
        <Text
          variant={size === 'small' ? 'caption' : 'body2'}
          fontWeight="500"
          style={{ color: chipStyles.textColor }}
        >
          {label}
        </Text>
        {type === 'input' && onDelete && (
          <Pressable
            onPress={onDelete}
            hitSlop={8}
            accessibilityLabel={`Remove ${label} chip`}
            accessibilityRole="button"
          >
            <Icon
              name="close"
              size={size === 'small' ? 16 : 18}
              color={chipStyles.iconColor}
            />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Helper function for chip styling based on type and state
function getChipStyles(
  type: ChipType,
  selected: boolean,
  size: ChipSize,
  colors: any
) {
  const baseStyles = {
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingHorizontal: size === 'small' ? 12 : 16,
      paddingVertical: size === 'small' ? 6 : 8,
      borderRadius: size === 'small' ? 8 : 12,
      gap: size === 'small' ? 4 : 6,
    },
    pressed: {
      opacity: 0.8,
    },
    disabled: {
      opacity: 0.38,
    },
  };

  // Type-specific styles
  const typeStyles = {
    assist: {
      backgroundColor: selected ? colors.secondaryContainer : colors.surface,
      borderWidth: selected ? 0 : 1,
      borderColor: colors.outline,
      textColor: selected ? colors.onSecondaryContainer : colors.onSurface,
      iconColor: selected ? colors.secondary : colors.onSurfaceVariant,
    },
    filter: {
      backgroundColor: selected ? colors.secondaryContainer : 'transparent',
      borderWidth: 1,
      borderColor: selected ? 'transparent' : colors.outline,
      textColor: selected ? colors.onSecondaryContainer : colors.onSurface,
      iconColor: selected ? colors.secondary : colors.onSurfaceVariant,
    },
    input: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 0,
      textColor: colors.onSurfaceVariant,
      iconColor: colors.onSurfaceVariant,
    },
    suggestion: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.outline,
      textColor: colors.onSurface,
      iconColor: colors.onSurfaceVariant,
    },
  };

  return {
    container: {
      ...baseStyles.container,
      backgroundColor: typeStyles[type].backgroundColor,
      borderWidth: typeStyles[type].borderWidth,
      borderColor: typeStyles[type].borderColor,
    },
    pressed: baseStyles.pressed,
    disabled: baseStyles.disabled,
    textColor: typeStyles[type].textColor,
    iconColor: typeStyles[type].iconColor,
  };
}

const styles = StyleSheet.create({
  // Styles managed by getChipStyles function
});
```

**Usage:**
```typescript
// Filter chips for weather conditions
<Chip
  type="filter"
  label="Sunny"
  icon="sun"
  selected={filter === 'sunny'}
  onPress={() => setFilter('sunny')}
/>

// Input chips for tags
<Chip
  type="input"
  label="High UV"
  onDelete={() => removeTag('high-uv')}
/>

// Assist chips for quick actions
<Chip
  type="assist"
  label="Share Weather"
  icon="share"
  onPress={handleShare}
/>
```

**Features:**
- ✨ 4 Material 3 chip variants (assist, filter, input, suggestion)
- ✨ State-based styling (selected, pressed, disabled)
- ✨ Haptic feedback on press
- ✨ Spring scale animation
- ✨ Accessibility labels and states
- ✨ Size variants (small, medium)

---

## 8. Animation Configuration

**File:** `src/theme/animations.ts`

```typescript
/**
 * Centralized Animation Configuration
 *
 * Defines all animation timings, easings, and spring configs
 * following iOS 26 and Material Design 3 motion guidelines
 */

import { Easing } from 'react-native-reanimated';

// Duration guidelines (Material Design 3)
export const durations = {
  instant: 100,       // Instant feedback (ripples, touches)
  quick: 200,         // Quick transitions (tabs, simple fades)
  moderate: 300,      // Moderate transitions (modals, cards)
  slow: 500,          // Slow transitions (page changes, complex)
  extraSlow: 1000,    // Extra slow (progress, loaders)
};

// Easing curves
export const easings = {
  // Material Design 3 emphasized easing
  emphasized: Easing.bezier(0.4, 0.0, 0.2, 1.0),

  // Standard curves
  linear: Easing.linear,
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),

  // Apple-style curves (smooth, natural)
  appleEaseOut: Easing.bezier(0.25, 0.1, 0.25, 1.0),
  appleEaseInOut: Easing.bezier(0.42, 0.0, 0.58, 1.0),
};

// Spring configurations (physics-based)
export const springs = {
  // Gentle springs (smooth, subtle)
  gentle: {
    damping: 20,
    mass: 1,
    stiffness: 100,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Bouncy springs (playful, energetic)
  bouncy: {
    damping: 12,
    mass: 1,
    stiffness: 150,
    overshootClamping: false,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },

  // Snappy springs (quick, responsive)
  snappy: {
    damping: 15,
    mass: 0.8,
    stiffness: 200,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

// Pre-configured animations
export const animations = {
  // Fade animations
  fadeIn: {
    duration: durations.quick,
    easing: easings.emphasized,
  },
  fadeOut: {
    duration: durations.quick,
    easing: easings.emphasized,
  },

  // Scale animations
  scaleIn: {
    duration: durations.moderate,
    easing: easings.emphasized,
    from: 0.8,
    to: 1.0,
  },
  scaleOut: {
    duration: durations.quick,
    easing: easings.emphasized,
    from: 1.0,
    to: 0.8,
  },

  // Slide animations
  slideInLeft: {
    duration: durations.moderate,
    easing: easings.emphasized,
    from: -50,
    to: 0,
  },
  slideInRight: {
    duration: durations.moderate,
    easing: easings.emphasized,
    from: 50,
    to: 0,
  },
  slideInUp: {
    duration: durations.moderate,
    easing: easings.emphasized,
    from: 50,
    to: 0,
  },
  slideInDown: {
    duration: durations.moderate,
    easing: easings.emphasized,
    from: -50,
    to: 0,
  },
};
```

**Usage:**
```typescript
import { animations, easings, durations } from '@/theme/animations';

// Use pre-configured animation
const opacity = useSharedValue(0);
opacity.value = withTiming(1, animations.fadeIn);

// Custom animation with standard timing
const scale = useSharedValue(0.8);
scale.value = withTiming(1, {
  duration: durations.moderate,
  easing: easings.emphasized,
});

// Spring animation
const translateY = useSharedValue(50);
translateY.value = withSpring(0, springs.bouncy);
```

---

## 9. Performance Checklist

### Before Release
- [ ] **60fps Sustained** - Profile with React Native Hermes Profiler
- [ ] **Glass Disabled During Scroll** - Verify `disabled={isScrolling}` on all GlassView components
- [ ] **Memoization** - React.memo on list items, useMemo for expensive computations
- [ ] **Image Optimization** - WebP format, lazy loading, proper cache headers
- [ ] **Bundle Size** - < 10MB for JS bundle (use `npx expo-updates --platform ios --show-stats`)
- [ ] **Memory Leaks** - Profile with Xcode Instruments (iOS) and Android Studio Profiler
- [ ] **Battery Usage** - < 5% per hour on OLED devices (dark mode)
- [ ] **Accessibility Audit** - VoiceOver (iOS), TalkBack (Android), contrast ratios
- [ ] **Haptic Feedback** - All buttons, switches, interactions
- [ ] **Loading States** - Skeleton loaders, no spinners for known layouts

### Optimization Techniques

#### Disable Glass During Scroll
```typescript
const [isScrolling, setIsScrolling] = useState(false);

<ScrollView
  onScrollBeginDrag={() => setIsScrolling(true)}
  onScrollEndDrag={() => setIsScrolling(false)}
  onMomentumScrollEnd={() => setIsScrolling(false)}
>
  <GlassView disabled={isScrolling}>
    {content}
  </GlassView>
</ScrollView>
```

#### Memoize List Items
```typescript
const ForecastItem = React.memo(({ day }: { day: ForecastDay }) => (
  <GlassCard elevation={1}>
    <Text>{day.date}</Text>
    <Text>{day.temperature.max}° / {day.temperature.min}°</Text>
  </GlassCard>
));
```

#### Image Optimization
```typescript
<Image
  source={{ uri: iconUrl }}
  style={styles.icon}
  resizeMode="contain"
  fadeDuration={200}
  // WebP format with cache
  cachePolicy="memory-disk"
/>
```

---

## 10. Success Metrics & KPIs

### Design Excellence
- **Platform Consistency:** 100% HIG compliance (iOS), 100% M3 compliance (Android)
- **Visual Polish:** All screens use proper elevation hierarchy, consistent shadows
- **Typography:** Dynamic Type support, proper font scales, accessible sizes

### Performance
- **Frame Rate:** 60fps sustained during all interactions
- **Interaction Response:** < 200ms for all button presses, switches, taps
- **Animation Duration:** 100-500ms range (no long animations)
- **Battery Usage:** < 5% per hour on OLED devices

### Accessibility
- **WCAG 2.2:** AAA compliance for all text (7:1 contrast)
- **VoiceOver/TalkBack:** 100% of UI navigable with screen readers
- **Dynamic Type:** All text scales with iOS accessibility settings
- **Reduce Motion:** All animations respect reduce motion preference

### User Delight
- **Haptic Feedback:** 100% of interactive elements provide tactile feedback
- **Loading States:** Context-aware skeletons, no generic spinners
- **Error Handling:** Friendly, illustrated error states
- **Empty States:** Helpful guidance, not just "No data"

---

## 11. Conclusion

This modernization plan transforms the Weather Sunscreen App from a functional weather app into an **award-winning experience** that exemplifies the best of iOS 26 Liquid Glass and Material Design 3. By following this plan, the app will:

1. **Delight users** with fluid animations, haptic feedback, and stunning visual hierarchy
2. **Respect platform guidelines** (100% HIG and M3 compliance)
3. **Maintain accessibility** (WCAG 2.2 AAA, reduce transparency/motion support)
4. **Deliver performance** (60fps, < 200ms interactions, battery-efficient)

### Next Steps
1. **Review & Approve Plan** - Stakeholder sign-off on design direction
2. **Phase 1 Implementation** - Core component library (Week 1)
3. **Phase 2 Implementation** - Hero experiences (Week 2)
4. **Phase 3 Implementation** - Material Design 3 parity (Week 3)
5. **Phase 4 Implementation** - Microinteractions & polish (Week 4)
6. **QA & Testing** - Performance audit, accessibility testing
7. **Launch** - Submit to App Store + Google Play

---

**Prepared by:** Senior Design Architect
**Review Required:** Product Lead, Engineering Lead
**Estimated Effort:** 4 weeks (1 developer + 1 designer)
**Target Launch:** Q1 2026
