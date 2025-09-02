# Apple UI Documentation Index

## Quick Navigation

### Liquid Glass Design

- [Overview](liquid-glass/overview.md) - Core concepts, platform availability
- [AppKit Implementation](liquid-glass/appkit.md) - NSGlassEffectView usage
- [SwiftUI Implementation](liquid-glass/swiftui.md) - glassEffect() modifier
- [Common Patterns](liquid-glass/patterns.md) - Reusable components & techniques

### Toolbar Features

- [SwiftUI Toolbar Features](toolbar/swiftui-features.md) - Customization, search, transitions

## API Quick Lookup

### Liquid Glass APIs

Important:

- Availability: Liquid Glass APIs are iOS 26+ only. Always gate code via `@available(iOS 26.0, *)` (Swift) and runtime checks on JS/React Native. For RN, use `Platform.OS === 'ios'` and compare `Platform.Version` numerically.
- Expo builds: Expo Go does not include custom native modules. To use any native Liquid Glass view manager or Haptic integrations, run a Development Build (`expo run:ios`) or use EAS Build. Our RN components fall back to styles that emulate glass on iOS 16+ using blur and shadows, and to Material 3/elevated cards on Android/Web.
- Progressive enhancement: Keep a “good enough” experience on older platforms. Our `LiquidGlassWrapper` does this automatically.

| Task             | SwiftUI                                     | AppKit                           |
| ---------------- | ------------------------------------------- | -------------------------------- |
| Apply glass      | `.glassEffect()`                            | `NSGlassEffectView()`            |
| Set shape        | `.glassEffect(in: .rect(cornerRadius: 16))` | `glass.cornerRadius = 16`        |
| Add tint         | `.glassEffect(.regular.tint(.blue))`        | `glass.tintColor = NSColor.blue` |
| Make interactive | `.glassEffect(.regular.interactive())`      | Custom mouse tracking            |
| Container        | `GlassEffectContainer { }`                  | `NSGlassEffectContainerView()`   |
| Button style     | `.buttonStyle(.glass)`                      | Custom GlassButton class         |
| Morphing         | `.glassEffectID("id", in: namespace)`       | Manual animation                 |

### Toolbar APIs

| Task                   | SwiftUI Code                                               |
| ---------------------- | ---------------------------------------------------------- |
| Customizable toolbar   | `.toolbar(id: "main") { }`                                 |
| Add item               | `ToolbarItem(id: "save") { }`                              |
| Add spacer             | `ToolbarSpacer(.flexible)`                                 |
| Minimize search        | `.searchToolbarBehavior(.minimize)`                        |
| Reposition system item | `DefaultToolbarItem(kind: .search, placement: .bottomBar)` |
| Transition source      | `.matchedTransitionSource(id: "btn", in: namespace)`       |

## Decision Trees

### When to Use Liquid Glass

```
Need glass effect?
├─ Single view → .glassEffect() / NSGlassEffectView
└─ Multiple views
   ├─ Need merging → Use Container
   └─ Independent → Individual glass effects
```

### Choosing Framework

```
Platform target?
├─ iOS only → SwiftUI
├─ macOS only
│  ├─ Need AppKit integration → NSGlassEffectView
│  └─ Pure SwiftUI app → .glassEffect()
└─ Cross-platform → SwiftUI with platform checks
```

## Performance Guidelines

| Scenario      | Recommendation               | Max Count |
| ------------- | ---------------------------- | --------- |
| Static UI     | Individual glass effects     | 5-10      |
| Dynamic lists | Container + lazy loading     | 20-30     |
| Animations    | Disable during transitions   | N/A       |
| Scrolling     | Disable glass when scrolling | N/A       |

## Common Tasks

### Create Glass Button

- **SwiftUI**: `Button("Click").buttonStyle(.glass)`
- **AppKit**: See [Glass Button Pattern](liquid-glass/patterns.md#glass-button)

### Animate Glass Tint

- **SwiftUI**: `.glassEffect(.regular.tint(condition ? .blue : .clear))`
- **AppKit**: `NSAnimationContext` with `animator().tintColor`

### Merge Glass Effects

- **SwiftUI**: Wrap in `GlassEffectContainer(spacing: 40)`
- **AppKit**: Use `NSGlassEffectContainerView` with spacing

### Custom Toolbar

- **SwiftUI**: `.toolbar(id: "main")` with `ToolbarItem(id: "item")`

## Platform Requirements

| Feature               | iOS/iPadOS | macOS | visionOS |
| --------------------- | ---------- | ----- | -------- |
| Liquid Glass          | 17.0+      | 14.0+ | 1.0+     |
| Customizable Toolbars | 17.0+      | 14.0+ | N/A      |
| Glass Button Style    | 17.0+      | 14.0+ | 1.0+     |
| Matched Transitions   | 17.0+      | 14.0+ | 1.0+     |

## Migration Guide

### AppKit → SwiftUI

```swift
// AppKit
let glass = NSGlassEffectView()
glass.cornerRadius = 16
glass.tintColor = NSColor.blue

// SwiftUI equivalent
View()
    .glassEffect(.regular.tint(.blue), in: .rect(cornerRadius: 16))
```

### Old Toolbar → New Toolbar

```swift
// Old
.toolbar {
    Button("Save") { }
}

// New (customizable)
.toolbar(id: "main") {
    ToolbarItem(id: "save") {
        Button("Save") { }
    }
}
```

## Resources

### Apple Documentation

- [NSGlassEffectView](https://developer.apple.com/documentation/AppKit/NSGlassEffectView)
- [View.glassEffect](https://developer.apple.com/documentation/SwiftUI/View/glassEffect)
- [CustomizableToolbarContent](https://developer.apple.com/documentation/SwiftUI/CustomizableToolbarContent)

### Sample Projects

- [Landmarks: Liquid Glass](https://developer.apple.com/documentation/SwiftUI/Landmarks-Building-an-app-with-Liquid-Glass)

### WWDC Sessions

- Liquid Glass design principles
- Toolbar customization in SwiftUI

### WeatherKit Capability

- WeatherKit requires enabling the capability for your bundle identifier in the Apple Developer portal. Ensure the capability is enabled for Development and Distribution profiles.
- In development or when the capability is missing, the app falls back to service-based weather (Open‑Meteo) and safe mock data.
- For Expo: use a Dev Client or EAS Build when testing the native WeatherKit bridge; Expo Go won’t load the native module.
