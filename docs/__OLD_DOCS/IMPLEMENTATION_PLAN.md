# Implementation Plan: PROMPT_README.md Full Stack

> **Goal**: Implement the complete architecture described in PROMPT_README.md
> **Standard**: John Carmack review-ready code
> **Status**: Planning → Implementation → Validation

## 📋 Analysis Summary

The PROMPT_README.md describes a production-ready weather/sunscreen app with:
- Modern src/ architecture (currently missing)
- Theme system with tokens and persistence
- i18n support (en, pt-BR)
- Services layer (Logger, Diagnostics, Weather)
- Context providers for state management
- Nested routing with multiple tab groups
- Performance optimizations (FlashList, React.memo)
- Glass UI effects and icon system

## 🎯 Implementation Phases

### Phase 1: Foundation & Core Infrastructure
**Priority**: Critical | **Dependencies**: None

#### 1.1 Directory Structure Setup
- [ ] Create `src/` root directory
- [ ] Create `src/types/` for TypeScript definitions
- [ ] Create `src/theme/` for theming system
- [ ] Create `src/services/` for business logic
- [ ] Create `src/context/` for React Context
- [ ] Create `src/components/` with subdirectories (ui, icons, glass)
- [ ] Create `src/i18n/` for translations
- [ ] Create `src/data/` for mock data
- [ ] Create `src/hooks/` for custom hooks
- [ ] Create `src/utils/` for utilities

#### 1.2 TypeScript Type System
- [ ] Define core weather types (WeatherData, UVIndex, Forecast)
- [ ] Define theme types (ThemeMode, ColorScheme, ThemeColors)
- [ ] Define i18n types (Locale, TranslationKeys)
- [ ] Define service types (LogLevel, DiagnosticLog, etc.)
- [ ] Export all types from src/types/index.ts

### Phase 2: Theme System
**Priority**: Critical | **Dependencies**: Phase 1.1, 1.2

#### 2.1 Design Tokens
- [ ] Create `src/theme/tokens.ts` with color system
- [ ] Define spacing scale (4px base grid)
- [ ] Define typography scale (font sizes, weights, families)
- [ ] Define shadow/elevation tokens
- [ ] Define border radius tokens
- [ ] Define animation/timing tokens

#### 2.2 Theme Provider
- [ ] Implement `src/theme/theme.tsx` with ThemeProvider
- [ ] Create useTheme() hook returning full theme context
- [ ] Create useColors() convenience hook
- [ ] Implement AsyncStorage persistence (@WeatherSunscreen:themeMode)
- [ ] Add high contrast mode support
- [ ] Add system theme detection and sync
- [ ] Support 'light' | 'dark' | 'system' modes

### Phase 3: Services Layer
**Priority**: High | **Dependencies**: Phase 1.2

#### 3.1 Logger Service
- [ ] Create `src/services/LoggerService.ts`
- [ ] Implement structured logging (debug, info, warn, error)
- [ ] Add environment-aware log levels (__DEV__ vs production)
- [ ] Add log formatting and timestamps
- [ ] Add category/tag support for filtering

#### 3.2 Diagnostics Service
- [ ] Create `src/services/diagnosticsSink.ts`
- [ ] Implement buffered logging for production
- [ ] Create attachDiagnosticsSink() function
- [ ] Create getBufferedLogs() function
- [ ] Create clearBufferedLogs() function
- [ ] Add PROD_DIAGNOSTICS flag support
- [ ] Implement circular buffer (max 100 logs)

#### 3.3 Weather Service
- [ ] Create `src/services/WeatherService.ts`
- [ ] Implement weather data fetching with error handling
- [ ] Add timeout handling (10s default)
- [ ] Create fallback to mock data
- [ ] Implement UV index calculations
- [ ] Add sunscreen SPF recommendations
- [ ] Create location-based weather queries

### Phase 4: Internationalization (i18n)
**Priority**: High | **Dependencies**: Phase 1.1, 1.2

#### 4.1 Translation System
- [ ] Install `i18next` and `react-i18next`
- [ ] Create `src/i18n/index.ts` setup
- [ ] Create `src/i18n/en.json` (English translations)
- [ ] Create `src/i18n/pt-BR.json` (Portuguese translations)
- [ ] Create useTranslation() hook wrapper
- [ ] Implement locale switching in Settings
- [ ] Persist locale to AsyncStorage
- [ ] Add language detector for system locale

#### 4.2 Translation Keys
- [ ] Weather screen translations
- [ ] UV index screen translations
- [ ] Forecast screen translations
- [ ] Settings screen translations
- [ ] Error messages translations
- [ ] Common UI elements translations

### Phase 5: State Management & Context
**Priority**: High | **Dependencies**: Phase 2, 3, 4

#### 5.1 App Providers
- [ ] Create `src/theme/AppProviders.tsx`
- [ ] Wrap ThemeProvider
- [ ] Wrap i18n provider
- [ ] Add ErrorBoundary wrapper
- [ ] Add any other global providers
- [ ] Integrate into app/_layout.tsx

#### 5.2 Weather Context
- [ ] Create `src/context/WeatherContext.tsx`
- [ ] Implement weather state management
- [ ] Add location state
- [ ] Add loading/error states
- [ ] Create useWeather() hook
- [ ] Implement refresh functionality

#### 5.3 Settings Context
- [ ] Create `src/context/SettingsContext.tsx`
- [ ] Manage user preferences
- [ ] Integrate with AsyncStorage
- [ ] Create useSettings() hook
- [ ] Handle skin type, units, notifications

### Phase 6: UI Components Library
**Priority**: High | **Dependencies**: Phase 2

#### 6.1 Common UI Components
- [ ] Create `src/components/ui/Button.tsx`
- [ ] Create `src/components/ui/Card.tsx`
- [ ] Create `src/components/ui/Text.tsx` (themed)
- [ ] Create `src/components/ui/Container.tsx`
- [ ] Create `src/components/ui/Divider.tsx`
- [ ] Create `src/components/ui/LoadingSpinner.tsx`
- [ ] Create `src/components/ui/ErrorView.tsx`

#### 6.2 Glass Components
- [ ] Install `expo-glass-effect` if not present
- [ ] Create `src/components/glass/GlassView.tsx`
- [ ] Create `src/components/glass/GlassCard.tsx`
- [ ] Implement iOS 26+ native glass with fallbacks
- [ ] Add LIQUID_GLASS_PRE_IOS26 flag support

#### 6.3 Weather Icons
- [ ] Create `src/components/icons/WeatherIcon.tsx`
- [ ] Implement WMO weather code mapping
- [ ] Create SVG icons for all weather conditions
- [ ] Add UV index icons
- [ ] Add animated weather icons (optional)
- [ ] Create icon gallery for testing

### Phase 7: Routing & Navigation
**Priority**: Critical | **Dependencies**: Phase 2, 6

#### 7.1 Tab Structure Implementation
- [ ] Verify `app/(tabs)/_layout.tsx` supports NativeTabs
- [ ] Create `app/(tabs)/(home)/_layout.tsx`
- [ ] Create `app/(tabs)/(home)/index.tsx` (Dashboard/Home)
- [ ] Create `app/(tabs)/(home)/weather.tsx`
- [ ] Create `app/(tabs)/(home)/uv.tsx`
- [ ] Create `app/(tabs)/(home)/forecast.tsx`
- [ ] Create `app/(tabs)/(messages)/_layout.tsx`
- [ ] Create `app/(tabs)/(messages)/index.tsx` (placeholder)
- [ ] Create `app/(tabs)/(styles)/settings.tsx`

#### 7.2 Developer Routes
- [ ] Create `app/(dev)/icon-gallery.tsx`
- [ ] Create `app/(dev)/glass-gallery.tsx`
- [ ] Add navigation to dev routes (dev mode only)

### Phase 8: Screen Implementations
**Priority**: High | **Dependencies**: Phase 3, 5, 6, 7

#### 8.1 Home/Dashboard Screen
- [ ] Implement current weather display
- [ ] Show location info
- [ ] Display quick UV index
- [ ] Add refresh functionality
- [ ] Show loading/error states
- [ ] Implement FlashList for weather cards

#### 8.2 Weather Screen
- [ ] Display detailed weather conditions
- [ ] Show temperature, humidity, wind, pressure
- [ ] Add hourly forecast
- [ ] Implement weather alerts
- [ ] Add weather maps (optional)

#### 8.3 UV Index Screen
- [ ] Show current UV index with color coding
- [ ] Display safety level indicators
- [ ] Show peak time predictions
- [ ] Add sunscreen recommendations based on skin type
- [ ] Show UV forecast for the day
- [ ] Implement UV protection tips

#### 8.4 Forecast Screen
- [ ] Implement 7-day forecast view
- [ ] Use FlashList for performance
- [ ] Create memoized forecast items with React.memo
- [ ] Show daily UV index predictions
- [ ] Add precipitation chances
- [ ] Implement detailed day view on tap
- [ ] Use mock data from `src/data/mockForecast.ts`

#### 8.5 Messages Screen
- [ ] Create placeholder UI
- [ ] Add localized "Coming Soon" message
- [ ] Show target decision date (Sept 26, 2025)
- [ ] Add notification preferences toggle

#### 8.6 Settings Screen
- [ ] Theme selector (light/dark/system)
- [ ] High contrast toggle
- [ ] Language selector (en/pt-BR)
- [ ] Units selection (metric/imperial)
- [ ] Skin type selector
- [ ] Notification preferences
- [ ] Material 3 toggle (dev builds only)
- [ ] Performance overlay toggle
- [ ] About section with version info

### Phase 9: Data & Performance
**Priority**: High | **Dependencies**: Phase 1.2

#### 9.1 Mock Data
- [ ] Create `src/data/mockForecast.ts`
- [ ] Create `src/data/mockWeather.ts`
- [ ] Create `src/data/mockUV.ts`
- [ ] Implement realistic data structures
- [ ] Add data generation utilities

#### 9.2 Performance Optimizations
- [ ] Install `@shopify/flash-list`
- [ ] Replace FlatList with FlashList in Home
- [ ] Replace FlatList with FlashList in Forecast
- [ ] Memoize forecast list items
- [ ] Implement useMemo for expensive calculations
- [ ] Add useCallback for event handlers
- [ ] Optimize re-renders with React.memo

#### 9.3 React Query Integration
- [ ] Install `@tanstack/react-query`
- [ ] Create QueryClient setup
- [ ] Implement weather query hooks
- [ ] Implement forecast query hooks
- [ ] Add cache invalidation strategies
- [ ] Configure stale time and cache time

### Phase 10: Error Handling & Resilience
**Priority**: Critical | **Dependencies**: Phase 3, 5

#### 10.1 Error Boundaries
- [ ] Create `src/components/ErrorBoundary.tsx`
- [ ] Implement error recovery UI
- [ ] Add "Try Again" functionality
- [ ] Log errors to diagnostics
- [ ] Add error reporting (optional)

#### 10.2 Network Resilience
- [ ] Implement offline detection
- [ ] Add retry logic for failed requests
- [ ] Show offline indicator
- [ ] Cache last successful data
- [ ] Graceful degradation to mock data

### Phase 11: Testing & Validation
**Priority**: High | **Dependencies**: All previous phases

#### 11.1 Unit Tests
- [ ] Test theme system (theme.test.tsx)
- [ ] Test LoggerService
- [ ] Test WeatherService
- [ ] Test i18n setup
- [ ] Test utility functions

#### 11.2 Component Tests
- [ ] Test GlassWrapper components
- [ ] Test WeatherIcon mapping
- [ ] Test navigation flows
- [ ] Test error boundaries
- [ ] Test theme switching

#### 11.3 Integration Tests
- [ ] Test weather data flow
- [ ] Test forecast rendering
- [ ] Test settings persistence
- [ ] Test language switching
- [ ] Test offline behavior

### Phase 12: Documentation & Polish
**Priority**: Medium | **Dependencies**: Phase 11

#### 12.1 Code Documentation
- [ ] Add JSDoc comments to all services
- [ ] Document all React hooks
- [ ] Add component prop documentation
- [ ] Create inline code examples
- [ ] Document feature flags

#### 12.2 Update Project Docs
- [ ] Update README.md with new structure
- [ ] Update CLAUDE.md with implementation notes
- [ ] Create API documentation
- [ ] Add troubleshooting guide
- [ ] Update CHANGELOG.md

## 🔍 Validation Checklist

### Functionality
- [ ] All screens render without errors
- [ ] Theme switching works (light/dark/system)
- [ ] Language switching works (en/pt-BR)
- [ ] Weather data loads correctly
- [ ] UV index calculations are accurate
- [ ] Forecast displays 7 days
- [ ] Settings persist across app restarts
- [ ] Error boundaries catch and recover from errors
- [ ] Offline mode works with cached data

### Performance
- [ ] FlashList renders smoothly (60fps)
- [ ] No unnecessary re-renders
- [ ] App starts in < 3 seconds
- [ ] Memory usage is stable
- [ ] No memory leaks detected

### Code Quality
- [ ] TypeScript strict mode passes
- [ ] No console errors or warnings
- [ ] All imports resolve correctly
- [ ] Code follows project conventions
- [ ] All functions are properly typed
- [ ] Error handling is comprehensive

### Testing
- [ ] All unit tests pass
- [ ] All component tests pass
- [ ] Integration tests pass
- [ ] Manual testing on iOS completed
- [ ] Manual testing on Android completed
- [ ] Manual testing on Web completed

### Documentation
- [ ] All code is documented
- [ ] README is up to date
- [ ] CLAUDE.md reflects new structure
- [ ] CHANGELOG is updated
- [ ] No TODOs left in code

## 📊 Progress Tracking

- **Phase 1**: ⏳ Not Started
- **Phase 2**: ⏳ Not Started
- **Phase 3**: ⏳ Not Started
- **Phase 4**: ⏳ Not Started
- **Phase 5**: ⏳ Not Started
- **Phase 6**: ⏳ Not Started
- **Phase 7**: ⏳ Not Started
- **Phase 8**: ⏳ Not Started
- **Phase 9**: ⏳ Not Started
- **Phase 10**: ⏳ Not Started
- **Phase 11**: ⏳ Not Started
- **Phase 12**: ⏳ Not Started

## 🎯 Success Criteria

1. **Complete Architecture**: All src/ directories exist with proper structure
2. **Theme System**: Full theme support with tokens, persistence, high contrast
3. **i18n**: Complete translations for en and pt-BR
4. **Services**: Logger, Diagnostics, Weather services fully functional
5. **Screens**: All screens implemented with proper data flow
6. **Performance**: FlashList, memoization, React Query working
7. **Error Handling**: Boundaries, resilience, graceful degradation
8. **Tests**: Comprehensive test coverage passing
9. **Documentation**: Complete and accurate docs
10. **John Carmack Ready**: Clean, efficient, well-documented code

## 🚀 Execution Strategy

1. **Sequential Implementation**: Follow phases in order
2. **Iterative Validation**: Test after each phase
3. **Continuous Integration**: Keep app runnable throughout
4. **Documentation First**: Document as we build
5. **Performance Focus**: Optimize from the start
6. **Type Safety**: Strict TypeScript throughout
7. **Error Resilience**: Handle edge cases immediately

---

**Next Action**: Begin Phase 1.1 - Directory Structure Setup
