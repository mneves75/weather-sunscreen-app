# React 19.1 + React Compiler Patterns Guide

**Project:** Weather Sunscreen App
**React Version:** 19.1.0
**React Native:** 0.81.4
**Expo SDK:** 54
**Date:** 2025-10-02

---

## Overview

This project uses **React 19.1** with the **React Compiler** enabled by default in Expo SDK 54. The compiler automatically optimizes your React code by memoizing components and values, eliminating the need for manual `useMemo`, `useCallback`, and `React.memo` in most cases.

---

## React Compiler Benefits

### Automatic Optimization

The React Compiler analyzes your components and automatically:

1. **Memoizes expensive computations** - No more `useMemo`
2. **Memoizes callback functions** - No more `useCallback`
3. **Memoizes components** - No more `React.memo` (in most cases)
4. **Prevents unnecessary re-renders** - Automatic optimization

### Verification

Check if React Compiler is active:

```bash
# Start Expo dev server
npx expo start

# Press 'j' to open devtools
# Navigate to Components panel
# You should see: "Experimental React Compiler is enabled."
```

### Performance Monitoring

```bash
# Press 'j' in Expo CLI
# Go to Components panel
# See which components are memoized by the compiler
```

---

## Best Practices

### ✅ DO: Write Simple, Clean Code

The compiler works best with straightforward React patterns:

```typescript
// ✅ GOOD: Simple, clean code
function WeatherCard({ temperature, condition }: Props) {
  // Compiler auto-memoizes this calculation
  const tempInFahrenheit = (temperature * 9/5) + 32;

  // Compiler auto-memoizes this function
  const handlePress = () => {
    console.log(`Temp: ${tempInFahrenheit}°F`);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{tempInFahrenheit}°F - {condition}</Text>
    </TouchableOpacity>
  );
}
```

### ✅ DO: Keep Existing React.memo for List Items

List items can still benefit from explicit memoization:

```typescript
// ✅ GOOD: Explicit memo for list items
export const ForecastDayCard = React.memo<ForecastDayCardProps>(({ day }) => {
  // Component body
});
```

**Why?** Lists with many items benefit from explicit memoization to prevent re-rendering items that haven't changed.

### ❌ DON'T: Add Manual useMemo/useCallback

Let the compiler handle optimization:

```typescript
// ❌ BAD: Manual memoization (compiler does this automatically)
function WeatherCard({ temperature }: Props) {
  const tempInFahrenheit = useMemo(
    () => (temperature * 9/5) + 32,
    [temperature]
  );

  const handlePress = useCallback(() => {
    console.log(`Temp: ${tempInFahrenheit}°F`);
  }, [tempInFahrenheit]);

  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}

// ✅ GOOD: Let compiler optimize
function WeatherCard({ temperature }: Props) {
  const tempInFahrenheit = (temperature * 9/5) + 32;

  const handlePress = () => {
    console.log(`Temp: ${tempInFahrenheit}°F`);
  };

  return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
}
```

### ✅ DO: Use State Correctly

```typescript
// ✅ GOOD: Standard useState patterns
function UVTracker() {
  const [uvIndex, setUVIndex] = useState(0);
  const [isHigh, setIsHigh] = useState(false);

  useEffect(() => {
    setIsHigh(uvIndex >= 8);
  }, [uvIndex]);

  return <UVIndicator value={uvIndex} isHigh={isHigh} />;
}
```

### ✅ DO: Extract Complex Logic to Hooks

```typescript
// ✅ GOOD: Custom hooks for reusable logic
function useTemperatureConversion(celsius: number) {
  const fahrenheit = (celsius * 9/5) + 32;
  const kelvin = celsius + 273.15;

  return { fahrenheit, kelvin };
}

function WeatherDisplay({ temp }: Props) {
  const { fahrenheit, kelvin } = useTemperatureConversion(temp);
  return <Text>{fahrenheit}°F / {kelvin}K</Text>;
}
```

---

## React 19.1 New Features

### 1. Enhanced Error Boundaries

**Project Implementation:** `src/components/ErrorBoundary.tsx`

```typescript
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error reporting
    analytics.trackError(error, errorInfo);
  }}
  resetOnPropsChange={true}  // Auto-reset on navigation
  fallback={(error, errorInfo, reset) => (
    <CustomErrorView error={error} onRetry={reset} />
  )}
>
  <YourApp />
</ErrorBoundary>
```

**Features:**
- `onError` callback for custom error handling
- `resetOnPropsChange` for automatic recovery
- Enhanced error info with React 19 digest
- Component stack in development mode

### 2. Improved useEffect Timing

React 19 has improved `useEffect` timing for better performance:

```typescript
// Effects fire more consistently
useEffect(() => {
  // This runs at the right time
  loadWeatherData();
}, []);
```

### 3. Better Form Handling (Actions - Future)

React 19 introduces Actions for form handling. While not fully utilized in React Native yet:

```typescript
// Future pattern (when supported in React Native)
async function updateSettings(formData: FormData) {
  'use server';  // Server action (when supported)
  const theme = formData.get('theme');
  await saveSettings({ theme });
}
```

---

## Codebase Audit Results

### ✅ Compiler-Ready Status

**Audit Date:** 2025-10-02

**Findings:**
- ✅ **Zero manual useMemo usage** - Excellent!
- ✅ **Zero manual useCallback usage** - Perfect!
- ✅ **Minimal React.memo usage** - Only where needed (list items)
- ✅ **Clean component patterns** - Compiler-friendly
- ✅ **No anti-patterns found** - Ready for optimization

**Components Using React.memo:**
- `ForecastDayCard` - Appropriate for list rendering ✅

**Conclusion:** Codebase is **already optimized** for React Compiler. No changes needed!

---

## Migration Guide (For Reference)

If you had manual memoization, here's how to migrate:

### Before (Manual Optimization)

```typescript
const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(
    () => expensiveCalculation(data),
    [data]
  );

  const handleClick = useCallback(() => {
    console.log(processed);
  }, [processed]);

  return <View onPress={handleClick}>...</View>;
});
```

### After (Compiler Optimized)

```typescript
function ExpensiveComponent({ data }) {
  // Compiler auto-memoizes this
  const processed = expensiveCalculation(data);

  // Compiler auto-memoizes this
  const handleClick = () => {
    console.log(processed);
  };

  return <View onPress={handleClick}>...</View>;
}
```

**Exception:** Keep `React.memo` for list items:

```typescript
// Keep this for list rendering performance
export const ListItem = React.memo<Props>(({ item }) => {
  return <View>...</View>;
});
```

---

## Performance Monitoring

### Check Compiler Output

```bash
# Method 1: Expo DevTools
npx expo start
# Press 'j' -> Components panel

# Method 2: React DevTools
# Install React DevTools extension
# Look for memoization indicators
```

### Metrics to Track

1. **Component Re-renders** - Should decrease
2. **Memory Usage** - Should stay stable or decrease
3. **Frame Rate** - Should improve (target: 60 FPS)
4. **Time to Interactive** - Should improve

### Benchmarking

```typescript
// Performance measurement
const startTime = performance.now();
// ... operation
const endTime = performance.now();
console.log(`Operation took ${endTime - startTime}ms`);
```

---

## Common Patterns

### 1. Data Fetching

```typescript
// ✅ GOOD: Standard pattern with compiler
function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      const data = await weatherService.getCurrentWeather();
      setWeather(data);
      setLoading(false);
    }
    fetchWeather();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!weather) return <ErrorView />;

  return <WeatherCard data={weather} />;
}
```

### 2. Computed Values

```typescript
// ✅ GOOD: Direct computation (compiler memoizes)
function UVDisplay({ uvIndex }: Props) {
  const level = getUVLevel(uvIndex);  // Auto-memoized
  const color = getUVColor(level);     // Auto-memoized
  const warning = getWarning(level);   // Auto-memoized

  return (
    <View style={{ backgroundColor: color }}>
      <Text>{level}</Text>
      <Text>{warning}</Text>
    </View>
  );
}
```

### 3. Event Handlers

```typescript
// ✅ GOOD: Inline handlers (compiler memoizes)
function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <Switch
      value={darkMode}
      onValueChange={(value) => setDarkMode(value)}  // Auto-memoized
    />
  );
}
```

### 4. Conditional Rendering

```typescript
// ✅ GOOD: Standard patterns
function ConditionalWeather({ condition }: Props) {
  if (condition === 'rain') {
    return <RainView />;
  }

  if (condition === 'snow') {
    return <SnowView />;
  }

  return <SunnyView />;
}
```

---

## Anti-Patterns to Avoid

### ❌ 1. Premature Optimization

```typescript
// ❌ BAD: Unnecessary manual optimization
const MemoizedText = React.memo(({ text }) => <Text>{text}</Text>);

// ✅ GOOD: Just write normal components
const SimpleText = ({ text }) => <Text>{text}</Text>;
```

### ❌ 2. Over-abstraction

```typescript
// ❌ BAD: Too much abstraction
const useMemoizedValue = (value) => useMemo(() => value, [value]);
const useMemoizedCallback = (fn) => useCallback(fn, []);

// ✅ GOOD: Direct usage
const value = computeValue();
const handler = () => doSomething();
```

### ❌ 3. Breaking Compiler Rules

```typescript
// ❌ BAD: Dynamic hooks (doesn't work with compiler)
function Component({ condition }: Props) {
  if (condition) {
    const value = useState(0);  // ❌ Conditional hook
  }
}

// ✅ GOOD: Hooks at top level
function Component({ condition }: Props) {
  const [value, setValue] = useState(0);

  if (!condition) return null;
  return <View />;
}
```

---

## Testing with React Compiler

### Unit Tests

```typescript
import { render } from '@testing-library/react-native';

test('component renders correctly', () => {
  const { getByText } = render(<WeatherCard temp={25} />);
  expect(getByText('77°F')).toBeTruthy();
});
```

### Performance Tests

```typescript
test('component is optimized', () => {
  const { rerender } = render(<WeatherCard temp={25} />);

  // Should not re-render if props haven't changed
  const renderCount = getRenderCount();
  rerender(<WeatherCard temp={25} />);
  expect(getRenderCount()).toBe(renderCount);
});
```

---

## Resources

### Official Documentation
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React Compiler](https://react.dev/learn/react-compiler)
- [React 19 Upgrade Guide](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)

### Expo Documentation
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54)
- [React Compiler in Expo](https://docs.expo.dev/guides/react-compiler/)

### Project-Specific
- `CLAUDE.md` - Project guidelines
- `docs/MODERNIZATION_PLAN.md` - Full modernization roadmap
- `CHANGELOG.md` - Version history

---

## Summary

### ✅ Current Status

1. **React 19.1** - Installed and active
2. **React Compiler** - Enabled by default in SDK 54
3. **Codebase** - Already compiler-friendly, no manual memoization
4. **Components** - Clean patterns, optimal for compiler
5. **Error Boundaries** - Enhanced with React 19 features

### 🎯 Best Practices

1. Write simple, clean React code
2. Let the compiler handle optimization
3. Keep `React.memo` for list items
4. Use enhanced error boundaries
5. Monitor performance with DevTools

### 🚀 Next Steps

1. Verify compiler is active (check DevTools)
2. Monitor performance metrics
3. Continue writing clean React patterns
4. Trust the compiler to optimize

---

**The codebase is already optimized for React 19.1 + React Compiler. No migration needed!** 🎉
