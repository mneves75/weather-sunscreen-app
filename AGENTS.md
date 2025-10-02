# Agent Playbook

## Expo SDK 54 Baselines
- Project runs on Expo SDK 54 / React Native 0.81 with React 19.1; take advantage of iOS precompiled XCFrameworks and avoid `use_frameworks!` until Expo adds support.
- Tooling minimums: Node 20.19.4+ and Xcode 16.1+ (26 recommended to unlock iOS 26 features).
- Update imports: the new `expo-file-system` API is now the default (former `/next`); legacy API lives under `expo-file-system/legacy` and will be removed in SDK 55.
- `expo-sqlite` ships a drop-in `localStorage` implementation plus `loadExtensionAsync|Sync` (bundled `sqlite-vec`)—useful for RAG/AI features and parity with web storage.
- Integrate the optional `expo-app-integrity` package when you need DeviceCheck/App Attest or Play Integrity verification for store-only builds.
- Consider enabling `experiments.autolinkingModuleResolution` in `app.json` to keep Metro resolution aligned with native autolinking while resolving single `react` / `react-dom` versions.

## Liquid Glass Implementation
- Install native Liquid Glass support with `npx expo install expo-glass-effect`; `GlassView` and `GlassContainer` render iOS `UIVisualEffectView` instances.
- `GlassView` only activates on iOS 26+; it falls back to a regular `View` elsewhere. Respect availability by checking `isLiquidGlassAvailable()` before enabling glass-specific UI.
- The `isInteractive` prop is set-once—if you need to toggle interactivity, remount the component with a different `key`.
- Pair `GlassContainer` spacing with Apple’s guidance: merge related surfaces, but keep static screens to 5–10 glass elements and disable the effect during heavy scrolling or animations for performance.
- Honor accessibility: query `AccessibilityInfo.isReduceTransparencyEnabled()` and supply non-glass fallbacks when transparency is reduced.
- For native assets, produce `.icon` bundles with Apple’s Icon Composer and reference them via `app.json > ios.icon`; older iOS versions auto-fallback.

## Native Tabs (Expo Router v6)
- Tabs live under `app/_layout.tsx` using `NativeTabs` from `expo-router/unstable-native-tabs`; declare each route with `NativeTabs.Trigger` (tabs are not auto-registered).
- Compose tab items with `Label`, `Icon`, and `Badge` components. Use `DynamicColorIOS` for text and icon colors so Liquid Glass tabs stay legible in light/dark blending contexts.
- Apply `minimizeBehavior="onScrollDown"` for iOS 26-style collapsing bars and `disableTransparentOnScrollEdge` when FlatList edge detection causes unwanted transparency.
- Platform constraints: Android supports max 5 tabs and drawable-only icons today; no nested native tabs; wrap pushing flows with a nested `Stack` layout inside each tab.
- When mixing icon sets, prefer SF Symbols on iOS (`Icon sf="house.fill"`) and fall back to `VectorIcon` + `@expo/vector-icons` for Android.

## Apple UI References
- Use SwiftUI’s `.glassEffect()` / `GlassEffectContainer` patterns from `docs/apple/liquid-glass/` when adding platform-native Swift code (extensions, widgets, tooling). Containers improve performance and allow tint merges.
- Follow the design decision tree: prefer SwiftUI for iOS-only features, switch to AppKit’s `NSGlassEffectView` for macOS-specific work, and keep cross-platform code in SwiftUI guarded by availability checks.
- Toolkit snippets: glass cards, badges, and hover interactions rely on state-driven tint updates; reuse these when mirroring native designs in React Native or exposing platform modules.
- Toolbar guidance: `.toolbar(id:)` enables customizable groups, `ToolbarSpacer(.flexible)` manages layout, `.searchToolbarBehavior(.minimize)` matches compact search affordances, and `DefaultToolbarItem(kind: .search, placement: .bottomBar)` repositions system search controls.

## Native Platform Development Notes
- Swift 6 strict concurrency is now baseline—enable `-strict-concurrency=complete` / `.enableUpcomingFeature("StrictConcurrency")` for modules, isolate UI code with `@MainActor`, and audit shared state for `Sendable` conformance.
- When bridging to native, prefer async APIs that maintain actor isolation and document any `@preconcurrency` escapes for review.

## QA & Diagnostics
- Gate Liquid Glass UI behind both `isLiquidGlassAvailable()` and accessibility checks; fall back to elevated blur/shadow styles elsewhere.
- After upgrading native modules, run `npm run lint`, `npm run type-check`, and targeted Jest specs; add coverage for new storage paths when adopting the `expo-sqlite` localStorage API.
- Capture before/after build timings when enabling precompiled React Native; if improvements do not materialize, confirm Pods are not forced through `use_frameworks!`.
