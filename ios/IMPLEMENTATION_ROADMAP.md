# Expo SDK 54 + New Architecture Implementation Roadmap

**Project**: Weather Sunscreen App  
**Objective**: Complete migration to Expo SDK 54.0.0 with React Native 0.81 New Architecture  
**Timeline**: 10 working days (September 10-23, 2025)  
**Review Authority**: John Carmack  
**Branch**: `feature/expo-sdk-54-new-architecture`  

## 🚨 Critical Path Overview

Based on comprehensive analysis, the project has **critical dependency issues** that must be resolved before proceeding with New Architecture migration. This roadmap prioritizes immediate fixes to prevent app crashes.

## Phase 0: Emergency Fixes (Day 1) 🔴 CRITICAL
**Objective**: Fix critical issues preventing app from running  
**Estimated Time**: 4-6 hours  

### Milestone 0.1: Dependency Crisis Resolution
**Criticality**: 🔴 **BLOCKER** - App crashes without these fixes

#### Tasks:
1. **Fix Missing Peer Dependencies** ⚡ IMMEDIATE
   ```bash
   npx expo install expo-constants expo-linking
   ```
   - **Impact**: App crashes outside Expo Go without these
   - **Validation**: `npx expo-doctor` shows no peer dependency errors

2. **Update React Native Version** ⚡ IMMEDIATE
   ```bash
   npx expo install react-native@0.81.4
   ```
   - **Current**: 0.81.1
   - **Required**: 0.81.4 (expo-doctor recommendation)
   - **Impact**: Version mismatches cause build failures

3. **Fix Version Mismatches** ⚡ IMMEDIATE
   ```bash
   npx expo install --check
   ```
   - **Updates**: expo-updates, react-navigation packages, worklets
   - **Impact**: 6 packages out of date causing compatibility issues

4. **Remove Invalid Dependencies**
   ```bash
   npm uninstall @types/react-native
   ```
   - **Issue**: Types included with react-native package
   - **Impact**: Conflicts with built-in types

#### Deliverables:
- [ ] All expo-doctor errors resolved
- [ ] App launches successfully
- [ ] No dependency conflicts
- [ ] Commit with fixes: "fix(deps): resolve critical dependency issues"

#### Success Criteria:
```bash
# These must all pass:
npx expo-doctor  # 0 errors
npm run typecheck  # 0 TypeScript errors
npm run lint  # 0 ESLint errors
npm test  # All tests pass
```

---

## Phase 1: Foundation Stabilization (Days 2-3)
**Objective**: Establish stable foundation for New Architecture migration  
**Estimated Time**: 16 hours  

### Milestone 1.1: Build System Optimization
**Duration**: 1 day

#### Tasks:
1. **Resolve Build Strategy Conflict** 🔥 HIGH PRIORITY
   - **Issue**: Podfile.properties.json has `"ios.buildReactNativeFromSource": "true"` 
   - **Conflict**: Contradicts precompiled approach promises
   - **Decision Required**: Choose between:
     - **Option A**: Precompiled (10-30s builds, limited customization)
     - **Option B**: Source builds (90-120s builds, full customization)

2. **iOS Configuration Cleanup**
   ```ruby
   # Update Podfile based on build strategy decision
   ENV['RCT_USE_PREBUILT_RNCORE'] = '1'  # If precompiled chosen
   ENV['RCT_USE_RN_DEP'] = '1'           # If precompiled chosen
   ```

3. **New Architecture Verification**
   ```json
   // Verify settings are consistent
   "newArchEnabled": "true"  // Podfile.properties.json
   "newArchEnabled": true    // app.json
   ```

#### Deliverables:
- [ ] Build strategy documented and implemented
- [ ] iOS builds successfully with chosen strategy
- [ ] Performance benchmarks recorded
- [ ] Commit: "feat(build): optimize iOS build configuration"

### Milestone 1.2: Dependency Alignment
**Duration**: 1 day

#### Tasks:
1. **Update to SDK 54 Final** (when available)
   ```bash
   npx expo install expo@54.0.0  # If final released
   ```

2. **Verify New Architecture Dependencies**
   ```json
   {
     "react-native-reanimated": "~4.1.0",    // ✅ New Architecture only
     "react-native-worklets": "^0.5.0",      // ✅ Required for Reanimated v4
     "react-native-screens": "~4.16.0",      // ✅ New Architecture compatible
     "react-native-gesture-handler": "^2.20.0" // ✅ Compatible
   }
   ```

3. **CNG Configuration Resolution**
   - **Issue**: Mixed prebuild and native folders detected
   - **Action**: Choose continuous native generation strategy

#### Deliverables:
- [ ] All dependencies New Architecture compatible
- [ ] No version conflicts remain
- [ ] CNG strategy documented
- [ ] Commit: "chore(deps): align all dependencies for SDK 54"

---

## Phase 2: New Architecture Migration (Days 4-6)
**Objective**: Migrate native modules to TurboModules and components to Fabric  
**Estimated Time**: 24 hours  

### Milestone 2.1: TurboModule Infrastructure (Day 4)
**Duration**: 8 hours

#### Tasks:
1. **Create Codegen Specifications**
   ```typescript
   // src/specs/WeatherNativeModule.ts
   export interface Spec extends TurboModule {
     isAvailable(): Promise<boolean>;
     getCurrentLocation(): Promise<LocationData>;
     getWeatherData(lat: number, lon: number): Promise<WeatherData>;
     getUVIndexData(lat: number, lon: number): Promise<UVData>;
   }
   ```

2. **Configure Codegen**
   ```json
   // package.json
   "codegenConfig": {
     "name": "WeatherAppSpecs",
     "type": "modules",
     "jsSrcsDir": "./src/specs"
   }
   ```

3. **Set Up Build Integration**
   ```bash
   # Generate specs
   npx react-native codegen
   ```

#### Deliverables:
- [ ] TypeScript specs created for all native modules
- [ ] Codegen configuration working
- [ ] Build system generates native code
- [ ] Commit: "feat(arch): add TurboModule specifications"

### Milestone 2.2: WeatherNativeModule Migration (Day 5)
**Duration**: 8 hours

#### Tasks:
1. **Migrate iOS Implementation**
   ```swift
   // Convert from @objc bridge to TurboModule
   class WeatherNativeTurboModule: NSObject, RCTTurboModule {
     static func moduleName() -> String! { "WeatherNativeModule" }
     // Implement TurboModule protocol
   }
   ```

2. **Update JavaScript Interface**
   ```typescript
   // Use generated TurboModule instead of NativeModules
   import WeatherNativeModule from './specs/WeatherNativeModule';
   ```

3. **Implement Error Handling**
   - Proper TurboModule error propagation
   - Type-safe error handling
   - Fallback mechanisms

#### Deliverables:
- [ ] WeatherNativeModule converted to TurboModule
- [ ] All existing functionality preserved
- [ ] Comprehensive error handling
- [ ] Performance improvement verified
- [ ] Commit: "feat(turbo): migrate WeatherNativeModule to TurboModule"

### Milestone 2.3: Fabric Components Migration (Day 6)
**Duration**: 8 hours

#### Tasks:
1. **Assess LiquidGlassNativeModule**
   ```bash
   # Examine existing implementation
   find modules/liquid-glass-native -name "*.swift" -o -name "*.kt"
   ```

2. **Create Fabric Component Specs**
   ```typescript
   // src/specs/LiquidGlassViewSpec.ts
   export interface NativeProps extends ViewProps {
     intensity?: Float;
     style?: 'light' | 'dark' | 'clear';
   }
   ```

3. **Implement Fabric Component**
   ```swift
   // LiquidGlassViewComponentView.swift
   class LiquidGlassViewComponentView: RCTViewComponentView {
     override func updateProps(_ props: Props, oldProps: Props) {
       // Fabric component lifecycle
     }
   }
   ```

#### Deliverables:
- [ ] All custom components migrated to Fabric
- [ ] Liquid Glass effects functional
- [ ] UI performance maintained or improved
- [ ] Commit: "feat(fabric): migrate custom components to Fabric"

---

## Phase 3: Testing & Optimization (Days 7-8)
**Objective**: Comprehensive testing and performance optimization  
**Estimated Time**: 16 hours  

### Milestone 3.1: Quality Assurance (Day 7)
**Duration**: 8 hours

#### Tasks:
1. **Comprehensive Test Suite**
   ```typescript
   // __tests__/NewArchitecture.test.ts
   describe('New Architecture Integration', () => {
     test('TurboModule functionality');
     test('Fabric component rendering');
     test('Performance benchmarks');
   });
   ```

2. **Cross-Platform Validation**
   - iOS device testing
   - Android device testing  
   - Web compatibility check
   - Expo Go compatibility (if needed)

3. **Performance Benchmarking**
   ```bash
   # Measure key metrics
   - App launch time: Target < 2s
   - TurboModule calls: Target < 50ms
   - Component render: Target 60fps
   - Memory usage: Target < 150MB
   ```

#### Deliverables:
- [ ] All tests pass
- [ ] Performance benchmarks met
- [ ] Cross-platform compatibility verified
- [ ] Memory leaks resolved
- [ ] Commit: "test: add comprehensive New Architecture test suite"

### Milestone 3.2: Performance Optimization (Day 8)
**Duration**: 8 hours

#### Tasks:
1. **Build Optimization**
   ```javascript
   // metro.config.js optimizations
   experimentalImportSupport: true,
   inlineRequires: true,
   // React Compiler integration
   ```

2. **Bundle Analysis**
   ```bash
   # Analyze bundle size
   npx expo export --dump-assetmap
   # Target: <15MB total bundle
   ```

3. **Memory Profiling**
   - Use Xcode Instruments
   - Android Studio Profiler
   - Identify and fix memory leaks
   - Optimize component lifecycle

#### Deliverables:
- [ ] Build times optimized
- [ ] Bundle size reduced
- [ ] Memory usage optimized
- [ ] Performance targets achieved
- [ ] Commit: "perf: optimize New Architecture performance"

---

## Phase 4: iOS 26 & Advanced Features (Days 9-10)
**Objective**: Implement iOS 26 features and advanced optimizations  
**Estimated Time**: 16 hours  

### Milestone 4.1: iOS 26 Integration (Day 9)
**Duration**: 8 hours

#### Tasks:
1. **Liquid Glass Implementation**
   ```swift
   // iOS 26 native glass effects
   import UIKit
   
   class LiquidGlassView: UIView {
     var glassEffect: UIVisualEffect
     // Implement iOS 26 glass effects
   }
   ```

2. **WeatherKit Enhancement**
   ```json
   // Proper entitlements configuration
   {
     "expo": {
       "plugins": [
         ["expo-build-properties", {
           "ios": {
             "entitlements": {
               "com.apple.developer.weatherkit": true
             }
           }
         }]
       ]
     }
   }
   ```

3. **Icon Composer Integration**
   - Configure .icon file support
   - Test iOS 26 app icon display
   - Verify fallback on older iOS versions

#### Deliverables:
- [ ] iOS 26 glass effects functional
- [ ] WeatherKit properly configured
- [ ] App icon optimized for iOS 26
- [ ] Fallback behavior verified
- [ ] Commit: "feat(ios26): implement iOS 26 advanced features"

### Milestone 4.2: Production Readiness (Day 10)
**Duration**: 8 hours

#### Tasks:
1. **Security Audit**
   - Review TurboModule implementations
   - Validate data sanitization
   - Check permission handling
   - Verify secure storage usage

2. **Performance Validation**
   ```bash
   # Final performance check
   - Cold start: < 2s ✓
   - Hot reload: < 3s ✓
   - Memory: < 150MB ✓
   - Battery usage: Optimized ✓
   ```

3. **Documentation Updates**
   - Update README.md
   - Document New Architecture changes
   - Update API documentation
   - Create deployment guide

#### Deliverables:
- [ ] Security audit passed
- [ ] All performance targets met
- [ ] Documentation complete
- [ ] Production deployment ready
- [ ] Commit: "feat(prod): finalize production-ready implementation"

---

## Risk Mitigation Strategies

### High Risk: TurboModule Breaking Changes
**Mitigation**: 
- Maintain Legacy Architecture fallback branch
- Comprehensive test coverage
- Gradual rollout strategy

### Medium Risk: iOS 26 Compatibility Issues
**Mitigation**:
- Thorough testing on iOS 26 simulators
- Fallback implementations for older iOS
- Beta testing on real devices

### Low Risk: Performance Regressions
**Mitigation**:
- Continuous performance monitoring
- Automated performance tests
- Rollback procedures documented

## Success Metrics

### Technical KPIs
- [ ] **0** expo-doctor errors
- [ ] **0** TypeScript errors
- [ ] **0** ESLint errors
- [ ] **100%** test pass rate
- [ ] **<2s** app launch time
- [ ] **<50ms** TurboModule call latency
- [ ] **60fps** consistent UI performance
- [ ] **<150MB** memory usage

### Functional KPIs
- [ ] Weather data fetching operational
- [ ] Location services working
- [ ] Sunscreen recommendations accurate
- [ ] Liquid Glass effects functional
- [ ] Cross-platform compatibility maintained
- [ ] Offline functionality preserved

### Quality KPIs
- [ ] John Carmack approval ✅
- [ ] Security audit passed
- [ ] Performance benchmarks exceeded
- [ ] Documentation complete
- [ ] Team knowledge transfer complete

## Rollback Procedures

### Immediate Rollback (< 1 hour)
```bash
# Quick rollback to working state
git checkout main
git reset --hard HEAD~1
```

### Configuration Rollback
```json
// Emergency Legacy Architecture fallback
{
  "newArchEnabled": false,  // app.json
  "newArchEnabled": "false" // Podfile.properties.json
}
```

### Dependency Rollback
```bash
# Rollback to known good dependency state
git checkout HEAD~1 package.json package-lock.json
npm install
```

## Team Coordination

### Daily Standups
- 9:00 AM PST - Progress review
- Blocker identification
- Next day planning

### Code Review Process
- All commits require review
- TurboModule changes require senior review
- Performance changes require benchmarking

### Testing Protocol
- Unit tests: Run on every commit
- Integration tests: Daily
- E2E tests: Before each phase completion
- Performance tests: Continuous monitoring

---

## Appendices

### A. Command Quick Reference
```bash
# Development
npx expo start --dev-client
npx expo run:ios
npx expo run:android

# Quality Checks
npx expo-doctor
npm run typecheck
npm run lint
npm test

# New Architecture
npx react-native codegen
npx expo install --check

# Performance
npx expo export --dump-assetmap
```

### B. Key File Locations
```
├── src/specs/                 # TurboModule specifications
├── ios/WeatherSunscreen/      # iOS native code
├── modules/                   # Native modules
├── __tests__/                 # Test files
└── docs/                      # Documentation
```

### C. Emergency Contacts
- **Tech Lead**: [Contact Info]
- **iOS Expert**: [Contact Info]  
- **Android Expert**: [Contact Info]
- **DevOps**: [Contact Info]

---

**Document Status**: ✅ Ready for Implementation  
**Last Updated**: September 10, 2025  
**Next Review**: After Phase 0 completion  
**Approval Status**: Pending John Carmack Review