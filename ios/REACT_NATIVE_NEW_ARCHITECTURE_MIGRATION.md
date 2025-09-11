# React Native 0.81 New Architecture Migration Guide

**Project**: Weather Sunscreen App  
**Target Architecture**: New Architecture (Fabric + TurboModules)  
**React Native Version**: 0.81.4  
**Review Authority**: John Carmack  
**Status**: 🔄 Migration Required  

> Note: As of v3.0.0 the app no longer ships a custom LiquidGlass native module or Fabric view. All glass UI uses the official Expo `expo-glass-effect` (`GlassView`). Sections in this document that describe `LiquidGlassNativeModule` or `LiquidGlassView` are kept for historical context and do not reflect the current implementation.

## Overview

React Native 0.81 with Expo SDK 54 marks the **final release supporting Legacy Architecture**. SDK 55 will **mandate** New Architecture. This document outlines the complete migration strategy for the Weather Sunscreen App.

## Current Architecture Analysis

### ✅ Configuration Status
```json
// app.json
"newArchEnabled": true

// Podfile.properties.json  
"newArchEnabled": "true"
```

### ⚠️ Native Modules Assessment

#### WeatherNativeModule (Legacy → TurboModule Migration Required)
**Current Implementation**: `modules/weather-native-module/ios/WeatherNativeModule.swift`
```swift
// LEGACY ARCHITECTURE (Current)
@objc(WeatherNativeModule)
final class WeatherNativeModule: NSObject {
    @objc func getCurrentLocation(resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
    @objc func getWeatherData(latitude: Double, longitude: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
    @objc func getUVIndexData(latitude: Double, longitude: Double, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)
}
```

**Migration Required**: Convert to TurboModule with Codegen specs

#### LiquidGlassNativeModule (Status: Unknown)
**Location**: `modules/liquid-glass-native/`
**Assessment**: Requires New Architecture compatibility verification

### Component Assessment

#### UI Components (Fabric Migration Required)
- All custom native components must implement Fabric specs
- Glass effects need Fabric-compatible view managers
- Weather display components require proper view hierarchies

## Migration Requirements

### 1. TurboModule Migration

#### 1.1 JavaScript Spec Definitions
Create TypeScript specification files for Codegen:

```typescript
// src/specs/WeatherNativeModule.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  isAvailable(): Promise<boolean>;
  getCurrentLocation(): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  }>;
  getWeatherData(latitude: number, longitude: number): Promise<{
    temperature: number;
    description: string;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    visibility: number;
    feelsLike: number;
  }>;
  getUVIndexData(latitude: number, longitude: number): Promise<{
    uvIndex: number;
    maxUVToday: number;
    peakTime: string;
  }>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('WeatherNativeModule');
```

#### 1.2 iOS TurboModule Implementation
Transform existing module to TurboModule:

```swift
// WeatherNativeModule+TurboModule.swift
import Foundation
import React

class WeatherNativeTurboModule: NSObject, RCTTurboModule {
    
    static func moduleName() -> String! {
        return "WeatherNativeModule"
    }
    
    // Implement TurboModule protocol
    func isAvailable(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        resolve(WeatherNativeModule.isAvailable())
    }
    
    func getCurrentLocation(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        // Implementation with proper TurboModule error handling
    }
    
    // ... additional methods
}
```

#### 1.3 Codegen Configuration
```json
// package.json
{
  "codegenConfig": {
    "name": "WeatherAppSpecs",
    "type": "modules",
    "jsSrcsDir": "./src/specs",
    "android": {
      "javaPackageName": "com.weatherapp.specs"
    }
  }
}
```

### 2. Fabric Components Migration

#### 2.1 Liquid Glass Component Spec
```typescript
// src/specs/LiquidGlassViewSpec.ts
import type { ViewProps } from 'react-native';
import type { 
  Double, 
  DirectEventHandler, 
  Float,
  Int32 
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  intensity?: Float;
  style?: 'light' | 'dark' | 'clear' | 'regular';
  onEffectChange?: DirectEventHandler<{
    intensity: Double;
  }>;
}

export default codegenNativeComponent<NativeProps>('LiquidGlassView');
```

#### 2.2 iOS Fabric Component Implementation
```swift
// LiquidGlassViewComponentView.swift
import UIKit
import React
import RCTRequired

@objc(LiquidGlassViewComponentView)
class LiquidGlassViewComponentView: RCTViewComponentView {
    
    private var contentView: LiquidGlassView!
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }
    
    override func updateProps(_ props: Props, oldProps: Props) {
        super.updateProps(props, oldProps: oldProps)
        
        guard let props = props as? LiquidGlassViewProps else { return }
        
        if props.intensity != oldProps.intensity {
            contentView.intensity = CGFloat(props.intensity)
        }
        
        if props.style != oldProps.style {
            contentView.effectStyle = props.style
        }
    }
    
    // Fabric lifecycle methods
    override class func componentDescriptorProvider() -> RCTComponentDescriptorProvider {
        return RCTConcreteComponentDescriptorProvider(
            componentDescriptorWithView: self
        )
    }
}
```

### 3. Build System Updates

#### 3.1 iOS Build Configuration
```ruby
# ios/Podfile - New Architecture enforcement
ENV['RCT_NEW_ARCH_ENABLED'] = '1'  # Force enable New Architecture

# React Native configuration
use_react_native!(
  :path => config[:reactNativePath],
  :fabric_enabled => true,           # Enable Fabric renderer
  :new_arch_enabled => true,         # Enable New Architecture
  :hermes_enabled => true,           # Hermes required for optimal performance
  :flipper_configuration => FlipperConfiguration.disabled, # Flipper not compatible
  :app_path => "#{Pod::Config.instance.installation_root}/.."
)
```

#### 3.2 Android Configuration
```kotlin
// android/app/src/main/java/MainApplication.kt
class MainApplication : Application(), ReactApplication {
    
    override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
        override fun getUseDeveloperSupport() = BuildConfig.DEBUG
        
        override fun getJSMainModuleName() = "index"
        
        // NEW ARCHITECTURE CONFIGURATION
        override val isNewArchEnabled: Boolean = true
        override val isHermesEnabled: Boolean = true
        
        // TurboModule configuration
        override fun getReactPackageTurboModuleManagerDelegateBuilder(): 
            ReactPackageTurboModuleManagerDelegate.Builder? {
            return ReactPackageTurboModuleManagerDelegate.Builder()
        }
    }
}
```

### 4. Performance Optimizations

#### 4.1 Hermes Configuration
```javascript
// metro.config.js - New Architecture optimizations
module.exports = {
  transformer: {
    // Enable inline requires for better performance
    inlineRequires: true,
    // Enable experimental import support
    experimentalImportSupport: true,
  },
  resolver: {
    // Enable Hermes optimizations
    alias: {
      'react-native/Libraries/Core/InitializeCore': 
        'react-native/Libraries/Core/InitializeCore.native',
    },
  },
};
```

#### 4.2 Bundle Optimization
```json
// babel.config.js - New Architecture babel config
{
  "presets": [
    ["babel-preset-expo", {
      "react-compiler": true,  // Enable React Compiler
      "newArchEnabled": true   // New Architecture optimizations
    }]
  ],
  "plugins": [
    "react-native-worklets/plugin"  // Required for Reanimated v4
  ]
}
```

### 5. Testing Strategy

#### 5.1 New Architecture Testing
```typescript
// __tests__/NewArchitectureCompatibility.test.ts
import { TurboModuleRegistry } from 'react-native';
import WeatherNativeModule from '../src/specs/WeatherNativeModule';

describe('New Architecture Compatibility', () => {
  test('TurboModule registration', () => {
    expect(WeatherNativeModule).toBeDefined();
    expect(typeof WeatherNativeModule.isAvailable).toBe('function');
  });

  test('Fabric components render', async () => {
    // Test Fabric component integration
  });
});
```

#### 5.2 Performance Testing
```typescript
// __tests__/Performance.test.ts
describe('New Architecture Performance', () => {
  test('TurboModule call performance', async () => {
    const startTime = performance.now();
    await WeatherNativeModule.getCurrentLocation();
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // < 100ms
  });
});
```

### 6. Migration Timeline

#### Phase 1: Foundation (Days 1-2) 
- ✅ Enable New Architecture in configuration
- ✅ Update build configurations  
- 🔄 Create TypeScript specs for existing modules
- 🔄 Set up Codegen infrastructure

#### Phase 2: TurboModule Migration (Days 3-4)
- 🔄 Convert WeatherNativeModule to TurboModule
- 🔄 Implement proper error handling
- 🔄 Add comprehensive TypeScript interfaces
- 🔄 Test TurboModule functionality

#### Phase 3: Fabric Components (Days 5-6)
- 🔄 Create Fabric specs for custom components
- 🔄 Implement Fabric component views
- 🔄 Migrate LiquidGlassNativeModule
- 🔄 Test component rendering and interactions

#### Phase 4: Optimization & Testing (Days 7-8)
- 🔄 Performance optimization
- 🔄 Comprehensive testing suite
- 🔄 Memory leak detection
- 🔄 Cross-platform validation

### 7. Breaking Changes & Risks

#### 7.1 High Risk Areas
- **TurboModule Interface Changes**: Method signatures may need updates
- **Fabric Component Lifecycle**: Different from Legacy Architecture
- **Build System**: Potential Xcode/Android Studio compatibility issues
- **Third-party Dependencies**: Not all libraries support New Architecture

#### 7.2 Compatibility Matrix
| Dependency | New Architecture Status | Action Required |
|------------|------------------------|-----------------|
| react-native-reanimated v4 | ✅ New Architecture only | Already updated |
| expo-glass-effect | ⚠️ Needs verification | Verify compatibility |
| react-native-screens | ✅ Compatible | No action needed |
| react-native-gesture-handler | ✅ Compatible | No action needed |
| Custom Weather Module | ❌ Legacy only | **MIGRATION REQUIRED** |
| Custom Glass Module | ❌ Unknown status | **ASSESSMENT REQUIRED** |

### 8. Validation Checklist

#### 8.1 Technical Validation
- [ ] All TurboModules registered and functional
- [ ] Fabric components render correctly
- [ ] No Legacy Architecture dependencies remain
- [ ] Performance benchmarks met
- [ ] Memory usage within targets
- [ ] Cross-platform compatibility verified

#### 8.2 Functional Validation
- [ ] Weather data fetching works with TurboModule
- [ ] Location services functional
- [ ] Liquid Glass effects operational
- [ ] Sunscreen calculations accurate
- [ ] UI interactions responsive
- [ ] Navigation smooth and performant

### 9. Rollback Strategy

#### 9.1 Configuration Rollback
```json
// Emergency rollback to Legacy Architecture
{
  "newArchEnabled": false,  // app.json
  "newArchEnabled": "false"  // Podfile.properties.json
}
```

#### 9.2 Code Rollback Points
- Git tags at each migration phase
- Separate branches for each component migration
- Automated rollback scripts for build configuration

### 10. Performance Targets

#### 10.1 New Architecture Benchmarks
| Metric | Legacy Target | New Architecture Target | Improvement |
|--------|---------------|-------------------------|-------------|
| App Launch | 2.5s | 1.8s | 28% faster |
| TurboModule Calls | 50ms | 20ms | 60% faster |
| Component Renders | 16ms | 12ms | 25% faster |
| Memory Usage | 180MB | 150MB | 17% reduction |
| Bundle Size | 15MB | 12MB | 20% reduction |

#### 10.2 Success Criteria
- ✅ All performance targets met
- ✅ Zero Legacy Architecture code remaining
- ✅ Full functional parity maintained
- ✅ No performance regressions
- ✅ Comprehensive test coverage

## Implementation Priority

### Immediate (This Week)
1. **TurboModule Specs Creation** - Foundation for all other work
2. **WeatherNativeModule Migration** - Core functionality
3. **Build System Updates** - Infrastructure requirements

### Next Sprint
1. **Fabric Component Migration** - UI components
2. **Performance Optimization** - Benchmarking and tuning
3. **Comprehensive Testing** - Quality assurance

### Future
1. **Advanced Optimizations** - React Compiler integration
2. **Platform-specific Features** - iOS 26 optimizations
3. **Monitoring Setup** - Performance tracking

---

**Document Owner**: Development Team  
**Review Required**: John Carmack  
**Last Updated**: September 10, 2025  
**Next Review**: Post-TurboModule migration
