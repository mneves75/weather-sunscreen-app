# System Patterns — Weather Sunscreen App

## Architecture Overview
- React Native with Expo SDK 54 and file-based routing via Expo Router
- Context-based state management (Weather, Settings, Theme)
- Service layer singleton pattern for business logic and API integration
- Component-first architecture with TypeScript interfaces and reusable UI components

## Key Technical Decisions
- **Expo Router v6** for file-based navigation with typed routes
- **React Context** over Redux for simplicity in this scale
- **AsyncStorage** for user preferences persistence
- **i18next** for internationalization with JSON translation files
- **Glass morphism UI** with Material Design 3 tokens
- **Custom hooks** for encapsulating business logic (useLocation, useWeatherData, useUVIndex, useForecast)

## Code Organization Patterns
- Barrel exports (index.ts) for clean imports
- Feature-based grouping in src/components/, src/context/, src/services/
- Strict TypeScript with explicit interfaces
- Consistent error handling with custom error types
- Theme-aware components via useTheme() hook

## State Management Patterns
- Separate contexts by domain (Weather, Settings, Theme)
- Custom hooks for context consumption with error boundaries
- Optimized re-renders using useMemo and useCallback
- Persistent settings via AsyncStorage with schema migration support

## Service Layer Patterns
- Singleton classes with static getInstance()
- Centralized logging with structured categories
- Async/await with proper error handling
- Mock data fallbacks for development
- Type-safe API interfaces

## UI Component Patterns
- Functional components with TypeScript interfaces extending base props
- StyleSheet.create for performance with theme token integration
- Accessibility-first with proper ARIA roles and labels
- React.memo optimization for expensive components
- Support for style prop overrides

## Data Persistence Patterns
- AsyncStorage for simple preferences (theme, language, units, skin type)
- JSON serialization with error handling
- Namespace-prefixed keys (@WeatherApp:*)
- Migration pattern for schema changes
- Default values for missing keys

## Internationalization Patterns
- JSON-based translation files under src/i18n/
- Namespace organization (common, weather, uv, settings)
- Dot notation access for nested keys
- Locale-aware date/number formatting
- Type-safe translation keys via TypeScript

## Testing Patterns
- Jest with React Native Testing Library
- Mock external dependencies and services
- Test component rendering, interactions, and accessibility
- Test custom hooks with renderHook
- Test error scenarios and edge cases

## Performance Patterns
- React.memo for expensive components
- useCallback/useMemo for stable references and calculations
- FlatList with proper key extraction for long lists
- Debounced location updates and API calls
- Image optimization and caching strategies

## Security Patterns
- Input validation for coordinates and user data
- Secure storage considerations for API keys
- Error message sanitization to avoid info leakage
- Network security with HTTPS only
- Environment variable usage for secrets
