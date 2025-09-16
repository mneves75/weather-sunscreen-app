# Weather Sunscreen App - Claude Code Project Rules

## Development Guidelines

### Code Organization

- All source code goes in `src/` directory
- Components are organized by type: `ui/`, `glass/`, `icons/`, `native/`
- Business logic stays in `services/` directory
- Type definitions in `types/` directory
- Context providers in `context/` directory; global theme lives in `src/theme/theme.tsx`

### Native Module Development

- Native modules live in `modules/` directory
- Always provide fallbacks for web platform
- Implement error handling and timeout logic
- Use TypeScript interfaces for all native bridges

### Weather Service Integration

- Use `WeatherService` class for all weather data operations
- Implement proper caching mechanisms (10-minute cache)
- Provide graceful fallbacks when native services fail
- Handle location permissions properly

### UI/UX Standards

- Follow iOS and Android platform guidelines
- Use consistent color scheme: Primary #4A90E2, Secondary #7F8C8D
- Implement loading states and error handling in all screens
- Support both light and dark themes (userInterfaceStyle: automatic)

### Testing and Quality

- Run `npm run sync-versions` before releases
- Use `npm run fix-pods` for iOS build issues
- Test on both iOS and Android before deployment
- Verify location permissions work correctly

### Performance Guidelines

- Use React.memo for expensive components
- Implement proper dependency arrays in useCallback/useMemo
- Cache weather data to reduce API calls
- Use background refresh for better user experience

## File Naming Conventions

### Components

- Use PascalCase: `WeatherScreen.tsx`, `LoadingSpinner.tsx`
- End with descriptive suffix: `Screen`, `Icon`, `Button`, etc.

### Services and Utilities

- Use camelCase: `weatherService.ts`, `storageService.ts`
- Export classes with PascalCase: `WeatherService`, `StorageService`

### Types

- Use PascalCase for interfaces: `WeatherData`, `UVIndexData`
- Group related types in same file: `weather.ts`, `navigation.ts`

## Common Commands

```bash
# Development
npm start              # Start development server
npm run ios            # Run on iOS simulator/device
npm run android        # Run on Android emulator/device
npm run web            # Run in web browser

# Build and Deploy
npm run sync-versions  # Sync versions across files
npm run fix-pods      # Fix iOS CocoaPods issues
npm run clean-ios     # Clean iOS build artifacts

# Testing
npx expo install      # Install dependencies
npx eas build --platform ios --profile preview  # Build iOS preview
```

## Troubleshooting Checklist

### iOS Build Issues

1. Run `npm run fix-pods`
2. Check Xcode version compatibility
3. Verify iOS deployment target (16.0+)
4. Clean derived data if needed

### Android Build Issues

1. Ensure Java 17 is installed and configured
2. Check Android SDK and build tools versions
3. Verify package names match in all configs
4. Clean gradle cache if needed

### Location Services

1. Check permissions in app.json
2. Verify native module implementations
3. Test fallback to Expo Location
4. Handle permission denied scenarios

### Weather Data Issues

1. Check internet connectivity
2. Verify API endpoints in app.json extra config
3. Test native module fallbacks
4. Review caching logic

## Architecture Decisions

### State Management

- Use React Context for global weather state
- Implement proper loading and error states
- Cache data to improve performance
- Use AsyncStorage for persistence (when implemented)

### Navigation

- Static navigation configuration
- Bottom tabs for main sections
- Stack navigation for detailed views
- Proper TypeScript typing for navigation

### Native Integration

- Custom native modules for better performance
- Graceful degradation to Expo services
- Platform-specific implementations
- Proper error handling and timeouts

This project follows modern React Native best practices and is designed for production deployment with comprehensive error handling and platform-specific optimizations.
