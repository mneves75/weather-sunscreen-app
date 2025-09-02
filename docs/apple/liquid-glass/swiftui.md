# Liquid Glass in SwiftUI (iOS 26+)

## Quick Reference

| Modifier/View          | Purpose                 | Parameters                        | Availability |
| ---------------------- | ----------------------- | --------------------------------- | ------------ |
| `.glassEffect()`       | Apply glass to view     | `style`, `in: Shape`, `isEnabled` | iOS 26.0+    |
| `GlassEffectContainer` | Optimize multiple glass | `spacing`, `content`              | iOS 26.0+    |
| `.buttonStyle(.glass)` | Glass button style      | N/A                               | iOS 26.0+    |
| `.glassEffectID()`     | Morphing transitions    | `id`, `namespace`                 | iOS 26.0+    |

**Important**: Liquid Glass requires Xcode 26 and iOS 26+. Apps automatically adopt the new design when rebuilt with Xcode 26.

## Basic Implementation

### Simple Glass Effect

```swift
Text("Hello")
    .padding()
    .glassEffect()  // Default: regular glass, capsule shape
```

### Custom Shape & Tint

```swift
Image(systemName: "star")
    .glassEffect(
        .regular.tint(.blue).interactive(),
        in: .rect(cornerRadius: 12)
    )
```

## Glass Variants

### Configuration Options

```swift
// Regular glass - default material
.glassEffect(.regular)

// With tint - blends color into glass
.glassEffect(.regular.tint(.orange))

// Interactive - enables scaling, bouncing, shimmering on touch
.glassEffect(.regular.interactive())

// Combined - tint with interactive responses
.glassEffect(.regular.tint(.blue).interactive())

// Note: The glass adapts its appearance based on content behind it,
// even changing color scheme from light to dark dynamically
```

## Container Usage

### Multiple Glass Views

```swift
GlassEffectContainer(spacing: 40) {
    HStack(spacing: 40) {
        ForEach(items) { item in
            ItemView(item)
                .glassEffect()
        }
    }
}
```

### Union Effect

```swift
@Namespace private var namespace

GlassEffectContainer {
    HStack {
        ForEach(items.indices, id: \.self) { index in
            ItemView(items[index])
                .glassEffect()
                .glassEffectUnion(
                    id: index < 2 ? "group1" : "group2",
                    namespace: namespace
                )
        }
    }
}
```

## Morphing Transitions

### Animated Morphing

```swift
@State private var expanded = false
@Namespace private var namespace

GlassEffectContainer {
    if expanded {
        LargeView()
            .glassEffect()
            .glassEffectID("item", in: namespace)
    } else {
        SmallView()
            .glassEffect()
            .glassEffectID("item", in: namespace)
    }
}
.animation(.spring(), value: expanded)
```

## Button Styles

### Glass Buttons

```swift
// Standard glass button
Button("Action") { }
    .buttonStyle(.glass)

// Prominent glass button
Button("Important") { }
    .buttonStyle(.glassProminent)
```

## Toolbar Integration

### Glass in Toolbar

```swift
.toolbar {
    ToolbarItem(placement: .primaryAction) {
        Button("Save") { }
            .buttonStyle(.glass)
    }
}
```

### Custom Toolbar Background

```swift
.toolbar {
    ToolbarItem(placement: .principal) {
        Text("Title")
            .sharedBackgroundVisibility(.hidden)
    }
}
```

## Advanced Techniques

### Conditional Glass

```swift
@State private var glassEnabled = true

Text("Dynamic")
    .glassEffect(isEnabled: glassEnabled)
```

### Navigation Transitions

```swift
@Namespace private var namespace

NavigationStack {
    Content()
        .toolbar {
            ToolbarItem {
                Button("Open") { }
                    .matchedTransitionSource(id: "btn", in: namespace)
            }
        }
        .sheet(isPresented: $show) {
            DetailView()
                .navigationTransition(.zoom(sourceID: "btn", in: namespace))
        }
}
```

## Performance Tips

1. **Container Usage**: Always wrap multiple glass views
2. **Spacing**: Smaller = merge closer, larger = merge farther
3. **Limit Count**: 5-10 glass effects maximum
4. **Disable When Hidden**: Use `isEnabled` parameter

## Common Patterns

| Pattern          | Implementation                              |
| ---------------- | ------------------------------------------- |
| Toggle glass     | `.glassEffect(isEnabled: condition)`        |
| Group merge      | `.glassEffectUnion(id:namespace:)`          |
| Custom shape     | `.glassEffect(in: .rect(cornerRadius: 20))` |
| State indication | `.tint(isActive ? .blue : .clear)`          |

## Platform Notes

- **iOS**: Bottom bar placement works well
- **iPadOS**: Consider larger touch targets
- **macOS**: Toolbar customization expected

## See Also

- [Overview](overview.md)
- [AppKit Implementation](appkit.md)
- [Common Patterns](patterns.md)
- [Apple Docs: glassEffect](https://developer.apple.com/documentation/SwiftUI/View/glassEffect)
