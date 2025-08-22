# Known Issues and Solutions - Weather Sunscreen App

This document captures critical issues encountered during development and their comprehensive solutions for future reference.

## 🆕 v1.0.1 - Resolved Issues (August 22, 2025)

### ✅ RESOLVED: Navigation Type Mismatch
**Previous Issue**: TypeScript navigation types included non-existent routes (`WeatherDetail`, `UVDetail`, `Settings`)  
**Solution Implemented**: Removed unused route definitions from `src/types/navigation.ts`  
**Status**: ✅ **RESOLVED**

### ✅ RESOLVED: Weather Icon Inconsistencies
**Previous Issue**: Different code paths had different icon logic causing UI inconsistencies  
**Solution Implemented**: Standardized weather icon handling using WMO weather code mapping  
**Status**: ✅ **RESOLVED**

### ✅ RESOLVED: Console Statements in Production
**Previous Issue**: 82+ console.log/warn/error statements exposed in production code  
**Solution Implemented**: Created comprehensive LoggerService with environment-aware logging  
**Status**: ✅ **RESOLVED**

### ✅ RESOLVED: Missing Error Boundaries
**Previous Issue**: No app-level error boundary causing white screen crashes  
**Solution Implemented**: Added ErrorBoundary component with user-friendly recovery  
**Status**: ✅ **RESOLVED**

### ✅ RESOLVED: Memory Leak Risks
**Previous Issue**: Timeout chains in SunscreenContext had potential memory leaks  
**Solution Implemented**: Enhanced cleanup with isMounted tracking and proper timeout management  
**Status**: ✅ **RESOLVED**

### ✅ RESOLVED: TypeScript Compilation Errors
**Previous Issue**: Missing weatherCode property in native module interface  
**Solution Implemented**: Added optional weatherCode property with proper type handling  
**Status**: ✅ **RESOLVED**

---

## iOS Build Issues with React Native 0.81.0 and Expo 54.0.0-preview.4

### Issue: ReactNativeDependencies Pod Installation Failure

**Problem**: CocoaPods installation fails with error:
```
cp: framework/packages/react-native/..: File exists
```

**Root Cause**: The ReactNativeDependencies.podspec preparation script attempts to copy to an existing directory, causing a conflict.

**Solution**: Patch the ReactNativeDependencies.podspec script:
```bash
# Location: node_modules/react-native/third-party-podspecs/ReactNativeDependencies.podspec
# Change line 67 from:
cp -R "$XCFRAMEWORK_PATH/.." framework/packages/react-native/
# To:
rm -rf framework/packages/react-native/*
cp -R "$XCFRAMEWORK_PATH/../"* framework/packages/react-native/
```

**Automation**: Use `scripts/patch-react-native-deps.sh` for automated patching.

---

### Issue: React Native Fabric Header Path Resolution

**Problem**: Build fails with multiple header not found errors:
```
'react/renderer/components/safeareacontext/Props.h' file not found
'react/renderer/components/rnscreens/EventEmitters.h' file not found
'react/renderer/components/image/conversions.h' file not found
```

**Root Cause**: React Native's New Architecture (Fabric) generates headers in `ios/build/generated/ios/react/renderer/components/`, but the compiler search paths don't include this location, and source files in node_modules expect headers in specific relative paths.

**Comprehensive Solution**: 
1. **Created symlink infrastructure** using `scripts/fix-fabric-headers.sh`:
   - Links generated headers to expected locations in node_modules
   - Creates standard Pods/Headers structure
   - Handles both safeareacontext and rnscreens components

2. **Fixed specific image conversions header**:
   - Created symlink from `React_FabricImage/conversions.h` to expected path
   - Modified generated Props.cpp files to use correct include path

**Files Modified/Created**:
- `scripts/fix-fabric-headers.sh` - Comprehensive header symlink creation
- `scripts/patch-react-native-deps.sh` - ReactNativeDependencies podspec patch
- Generated symlinks in node_modules for all Fabric headers

---

### Issue: Auto-Generated File Modifications

**Problem**: Build system regenerates files like `Props.cpp`, reverting manual fixes.

**Root Cause**: React Native's codegen system regenerates these files during build, overwriting manual changes.

**Solution Strategy**:
1. **Symlink approach**: Create symlinks so the original include paths work
2. **Post-build hooks**: Patch files after generation
3. **Build configuration**: Modify header search paths in Xcode project

**Current Implementation**: Combination of symlinks and strategic file modifications that persist across builds.

---

## Development Workflow Recommendations

### For Clean Builds
When performing clean builds or pod cache clears, always run:
```bash
cd ios && rm -rf Pods Podfile.lock && pod install
../scripts/fix-fabric-headers.sh
```

### For Header Issues
If encountering new header not found errors:
1. Check if headers are generated in `ios/build/generated/ios/`
2. Verify symlinks exist in node_modules
3. Run `scripts/fix-fabric-headers.sh` to recreate symlinks
4. For new components, extend the script with new header mappings

### Version Compatibility
- **React Native 0.81.0** + **Expo 54.0.0-preview.4**: Requires these specific patches
- **Future versions**: Monitor for resolution of these issues in stable releases
- **Alternative**: Consider upgrading to stable Expo version when available

---

## Architecture Insights

### New Architecture (Fabric) Considerations
- The New Architecture generates C++ headers that must be accessible to both native code and React Native modules
- Header search paths must be carefully managed to avoid conflicts
- Symlinks provide flexibility without modifying core build configurations

### CocoaPods Integration
- React Native's move away from CocoaPods creates transitional complexity
- Preview versions may have incomplete integration
- Automation scripts help maintain consistency across team environments

---

## Prevention Strategies

1. **Automated Setup**: Use setup scripts for consistent environment configuration
2. **Documentation**: Maintain clear upgrade paths and compatibility matrices
3. **Testing**: Validate builds across different clean states
4. **Monitoring**: Watch for upstream fixes to remove patches when possible

---

## Quick Reference Commands

```bash
# Complete iOS setup from scratch
npm install
cd ios && rm -rf Pods Podfile.lock && pod install
../scripts/fix-fabric-headers.sh
cd .. && npm run ios

# Fix header issues only
cd ios && ../scripts/fix-fabric-headers.sh

# Fix ReactNativeDependencies issues
cd ios && ../scripts/patch-react-native-deps.sh && pod install
```

---

*Last Updated: August 22, 2025*  
*Version: 1.0.1*  
*React Native: 0.81.0, Expo: 54.0.0-preview.4*