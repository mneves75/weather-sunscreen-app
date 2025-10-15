# Weather Sunscreen App - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you get the Weather Sunscreen App running on your device in just a few minutes.

## Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Expo Go** app on your phone (iOS/Android) for testing
- Optional: **Xcode** (Mac only) for iOS Simulator
- Optional: **Android Studio** for Android Emulator

## Installation

### 1. Install Dependencies

```bash
cd weather-sunscreen-app
npm install
```

This will install all required packages including:
- Expo SDK 54
- React Native 0.81
- TypeScript 5.9
- i18next for internationalization
- expo-location for GPS services

### 2. Start the Development Server

```bash
npx expo start
```

You should see a QR code in your terminal and a web interface will open in your browser.

## Running the App

### Option A: Physical Device (Recommended)

1. Install **Expo Go** from your app store:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan the QR code:
   - **iOS**: Open Camera app and scan the QR code
   - **Android**: Open Expo Go app and tap "Scan QR Code"

3. The app will load on your device!

### Option B: iOS Simulator (Mac Only)

```bash
npx expo start --ios
```

This will automatically open the app in the iOS Simulator.

### Option C: Android Emulator

```bash
npx expo start --android
```

Make sure you have an Android emulator running first.

### Option D: Web Browser

```bash
npx expo start --web
```

Opens the app in your web browser (limited functionality on web).

## First Launch

When you first launch the app, you'll see:

1. **Location Permission Request**
   - Tap "Allow Location" to enable weather data
   - The app needs your location to provide accurate weather and UV information

2. **Home Dashboard**
   - Current weather summary
   - UV Index indicator
   - Quick action buttons

3. **Bottom Navigation Tabs**
   - **Home**: Dashboard with weather summary
   - **Messages**: Notification hub (placeholder)
   - **Settings**: Preferences and configuration

## Exploring the App

### 📍 Home Screen
- View current weather conditions
- Check UV Index
- Quick access to detailed views
- Pull to refresh data

### 🌤️ Weather Detail Screen
- Detailed current conditions
- Temperature, humidity, pressure
- Wind speed and direction
- Visibility and "feels like" temperature

### ☀️ UV Index Screen
- Current UV index with color coding
- Personalized SPF recommendation
- Sun protection advice
- Select your skin type for customized recommendations

### 📅 7-Day Forecast
- Daily weather forecast
- High/low temperatures
- Weather conditions
- UV index predictions

### ⚙️ Settings
Configure your preferences:
- **Skin Type**: I-VI for personalized UV recommendations
- **Units**: 
  - Temperature (Celsius/Fahrenheit)
  - Wind Speed (km/h, mph, m/s)
  - Pressure (hPa, inHg, mmHg)
- **Language**: English or Brazilian Portuguese
- **Theme**: Light, Dark, System, or High Contrast
- **Notifications**: UV alerts and weather warnings (future feature)

## Features to Try

### 1. Change Skin Type
1. Go to Settings
2. Select your skin type (I-VI)
3. Return to UV Index screen
4. See personalized SPF recommendations

### 2. Switch Language
1. Go to Settings
2. Tap language selector
3. Choose English or Português (Brasil)
4. UI updates immediately

### 3. Try Dark Mode
1. Go to Settings
2. Select "Dark" theme
3. App switches to dark mode with glass morphism effects

### 4. Pull to Refresh
1. On Home screen
2. Pull down from the top
3. Watch data refresh with animation

### 5. Explore Forecast
1. Tap "7-Day Forecast" button on Home
2. Scroll through daily forecasts
3. Tap on a day for more details (future feature)

## Current Data Source

⚠️ **Note**: The app currently uses **mock weather data** for demonstration purposes.

To integrate real weather data:
1. Sign up for a weather API (OpenWeatherMap, WeatherAPI, etc.)
2. Update `src/services/WeatherService.ts`
3. Add API key to environment configuration

Mock data includes:
- Current weather based on location
- 7-day forecast
- UV index values
- All features work with realistic data

## Troubleshooting

### Location Permission Issues

**iOS**: 
```
Settings → Privacy & Security → Location Services → Expo Go → While Using the App
```

**Android**:
```
Settings → Apps → Expo Go → Permissions → Location → Allow only while using the app
```

### App Won't Load

1. Make sure development server is running:
   ```bash
   npx expo start
   ```

2. Check network connection (device and computer on same network)

3. Try clearing cache:
   ```bash
   npx expo start --clear
   ```

### TypeScript Errors

Run type check:
```bash
npx tsc --noEmit
```

All checks should pass with zero errors.

### Module Not Found

Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

### Expo Go Connection Issues

1. Make sure firewall isn't blocking connections
2. Try connection via tunnel:
   ```bash
   npx expo start --tunnel
   ```

## Development Commands

```bash
# Start development server
npx expo start

# Clear cache and restart
npx expo start --clear

# Run type checking
npx tsc --noEmit

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web browser
npx expo start --web

# Tunnel mode (slower but works through firewalls)
npx expo start --tunnel
```

## Project Structure

```
app/                    # Expo Router screens
  (tabs)/              # Tab navigation
    (home)/            # Home stack (dashboard, weather, UV, forecast)
    (messages)/        # Messages screen
    (styles)/          # Settings screen
    
src/
  components/          # React components
    ui/               # Basic UI components
    weather/          # Weather-specific components
  context/            # State management
  hooks/              # Custom React hooks
  services/           # Business logic
  theme/              # Theme system
  types/              # TypeScript definitions
  utils/              # Helper functions
  i18n/               # Translations
```

## Key Technologies

- **Expo SDK 54**: React Native framework
- **TypeScript 5.9**: Type-safe JavaScript
- **Expo Router 6**: File-based navigation
- **i18next 25**: Internationalization
- **Expo Location**: GPS services
- **AsyncStorage**: Data persistence

## Next Steps

### For Development
1. Explore the codebase in `src/`
2. Check documentation in `docs/`
3. Read the full implementation plan
4. Review TypeScript interfaces in `src/types/`

### For Testing
1. Test on both iOS and Android
2. Try different screen sizes
3. Test with slow network
4. Test location permission scenarios
5. Test language switching
6. Test theme changes

### For Production
1. Integrate real weather API
2. Add error tracking (Sentry)
3. Set up analytics
4. Configure EAS Build
5. Prepare app store listings
6. Submit for review

## API Integration Guide

To connect real weather data:

1. **Choose a Weather API**:
   - OpenWeatherMap (Free tier available)
   - WeatherAPI.com
   - Weather.gov (US only)

2. **Get API Key**:
   - Sign up for free account
   - Generate API key
   - Note rate limits

3. **Update Service**:
   ```typescript
   // src/services/WeatherService.ts
   const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
   const BASE_URL = 'https://api.openweathermap.org/data/2.5';
   
   async getCurrentWeather(coords: Coordinates): Promise<WeatherData> {
     const response = await fetch(
       `${BASE_URL}/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${API_KEY}`
     );
     return response.json();
   }
   ```

4. **Add Environment Variable**:
   ```bash
   # .env
   EXPO_PUBLIC_WEATHER_API_KEY=your_api_key_here
   ```

## Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **i18next Docs**: https://www.i18next.com/

## Support

For issues or questions:
1. Check `docs/IMPLEMENTATION_COMPLETE.md`
2. Review `docs/FULL_IMPLEMENTATION_PLAN.md`
3. Check TypeScript errors: `npx tsc --noEmit`
4. Clear cache: `npx expo start --clear`

## Success! 🎉

You should now have the Weather Sunscreen App running on your device. Explore the features, try different settings, and enjoy the glass morphism UI!

**Pro Tip**: Enable dark mode and watch the beautiful glass effects come to life! ✨

---

**Version**: 1.1.0  
**Last Updated**: October 1, 2025  
**Status**: ✅ Ready for Development Testing
