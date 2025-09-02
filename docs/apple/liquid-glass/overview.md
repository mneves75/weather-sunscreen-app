# Liquid Glass Design Overview

## What is Liquid Glass?

A revolutionary design system introduced at WWDC25 that combines the optical properties of glass with a sense of fluidity:

- **Refracts** content from below it
- **Reflects** light and color from surroundings
- **Lensing effect** along edges for depth and motion
- **Dynamic adaptation** - changes color scheme based on content behind
- **Interactive responses** - scaling, bouncing, shimmering on touch
- **Morphs** between shapes during transitions

## Platform Availability

| Platform   | Framework | Primary Class/Modifier  | Min Version   | Full Support |
| ---------- | --------- | ----------------------- | ------------- | ------------ |
| iOS/iPadOS | SwiftUI   | `.glassEffect()`        | iOS 26.0+     | Xcode 26     |
| iOS/iPadOS | UIKit     | `UILiquidGlassMaterial` | iOS 26.0+     | Xcode 26     |
| macOS      | SwiftUI   | `.glassEffect()`        | macOS 15.0+   | Xcode 26     |
| macOS      | AppKit    | `NSGlassEffectView`     | macOS 15.0+   | Xcode 26     |
| visionOS   | SwiftUI   | `.glassEffect()`        | visionOS 2.0+ | Xcode 26     |

**Note**: Apps automatically adopt Liquid Glass when rebuilt with Xcode 26. No redesign needed.

## Core Concepts

### Glass Variants

- **Regular**: Standard glass effect
- **Prominent**: Enhanced visibility with tint
- **Interactive**: Responds to user input

### Container Optimization

Containers improve performance and enable effect merging:

- **AppKit**: `NSGlassEffectContainerView`
- **SwiftUI**: `GlassEffectContainer`

### Key Properties

- `cornerRadius` / `shape`: Visual appearance
- `tintColor` / `.tint()`: Color overlay
- `spacing`: Merge distance threshold

## Quick Start

### SwiftUI

```swift
Text("Hello").glassEffect()
Button("Click").buttonStyle(.glass)
```

### AppKit

```swift
let glass = NSGlassEffectView()
glass.cornerRadius = 12.0
glass.contentView = myView
```

## Performance Guidelines

1. Use containers for multiple glass views
2. Limit total glass effects on screen
3. Consider GPU impact on older devices
4. Batch similar effects together

## Next Steps

- [AppKit Implementation](appkit.md)
- [SwiftUI Implementation](swiftui.md)
- [Common Patterns](patterns.md)
