#!/bin/bash
# Test suite for iOS build fixes
# Run this BEFORE applying fixes to ensure they work

set -e

echo "🧪 Testing iOS Build Fix Prerequisites..."

# Test 1: Check Node/Bun version
test_node_version() {
    local required_version="20.0.0"
    local current_version=$(node -v | sed 's/v//')
    
    if [ "$(printf '%s\n' "$required_version" "$current_version" | sort -V | head -n1)" = "$required_version" ]; then
        echo "✅ Node version OK: $current_version"
        return 0
    else
        echo "❌ Node version too old: $current_version (need >= $required_version)"
        return 1
    fi
}

# Test 2: Check Xcode version
test_xcode_version() {
    if ! command -v xcodebuild &> /dev/null; then
        echo "❌ Xcode not installed"
        return 1
    fi
    
    local xcode_version=$(xcodebuild -version | head -1 | sed 's/Xcode //')
    echo "✅ Xcode version: $xcode_version"
    
    # Check for minimum version (16.0 for RN 0.81)
    if [[ "${xcode_version%%.*}" -lt 16 ]]; then
        echo "⚠️  Warning: Xcode 16+ recommended for React Native 0.81"
    fi
    return 0
}

# Test 3: Verify CocoaPods
test_cocoapods() {
    if ! command -v pod &> /dev/null; then
        echo "❌ CocoaPods not installed"
        return 1
    fi
    
    local pod_version=$(pod --version)
    echo "✅ CocoaPods version: $pod_version"
    return 0
}

# Test 4: Check React Native version compatibility
test_rn_compatibility() {
    local package_json="package.json"
    if [ ! -f "$package_json" ]; then
        echo "❌ package.json not found"
        return 1
    fi
    
    local rn_version=$(grep '"react-native"' "$package_json" | sed 's/.*"react-native": "\(.*\)".*/\1/')
    if [[ "$rn_version" == "0.81.0" ]]; then
        echo "✅ React Native version compatible: $rn_version"
        return 0
    else
        echo "❌ Unexpected React Native version: $rn_version"
        return 1
    fi
}

# Test 5: Validate app.json configuration
test_app_config() {
    local app_json="app.json"
    if [ ! -f "$app_json" ]; then
        echo "❌ app.json not found"
        return 1
    fi
    
    # Check for expo-build-properties plugin
    if grep -q "expo-build-properties" "$app_json"; then
        echo "✅ expo-build-properties plugin configured"
        
        # Check for iOS deployment target
        if grep -q '"deploymentTarget"' "$app_json"; then
            echo "✅ iOS deployment target set"
        else
            echo "⚠️  Warning: iOS deployment target not set"
        fi
        
        return 0
    else
        echo "❌ expo-build-properties plugin not configured"
        return 1
    fi
}

# Test 6: Check for problematic dependencies
test_dependencies() {
    echo "🔍 Checking for known problematic dependencies..."
    
    # Check for duplicate dependencies
    if [ -f "bun.lock" ] && [ -f "package-lock.json" ]; then
        echo "⚠️  Warning: Multiple lock files detected"
    fi
    
    # Check for @expo/config-plugins direct dependency
    if grep -q '"@expo/config-plugins"' package.json; then
        echo "⚠️  Warning: @expo/config-plugins should not be a direct dependency"
    fi
    
    return 0
}

# Test 7: Verify iOS directory structure
test_ios_structure() {
    if [ ! -d "ios" ]; then
        echo "❌ iOS directory not found"
        return 1
    fi
    
    if [ -f "ios/Podfile" ]; then
        echo "✅ Podfile exists"
    else
        echo "❌ Podfile missing"
        return 1
    fi
    
    return 0
}

# Run all tests
echo "================================"
echo "iOS Build Fix Test Suite"
echo "================================"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

run_test() {
    local test_name=$1
    echo "Running: $test_name"
    if $test_name; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
    fi
    echo ""
}

run_test test_node_version
run_test test_xcode_version
run_test test_cocoapods
run_test test_rn_compatibility
run_test test_app_config
run_test test_dependencies
run_test test_ios_structure

echo "================================"
echo "Test Results:"
echo "✅ Passed: $TESTS_PASSED"
echo "❌ Failed: $TESTS_FAILED"
echo "================================"

if [ $TESTS_FAILED -gt 0 ]; then
    echo "⚠️  Some tests failed. Fix these issues before proceeding."
    exit 1
else
    echo "✅ All tests passed! Ready to apply iOS build fixes."
    exit 0
fi