# Glass UI QA Checklist

Use this checklist to verify Glass UI behavior across platforms.

- Visual
  - Contrast: Text is legible on glass backgrounds in light/dark themes
  - Elevation/shadow: Cards do not obscure critical content and look consistent
  - Motion: Parallax animations feel subtle; no jitter or tearing

- Accessibility
  - Reduce Motion: When system “Reduce Motion” is enabled, parallax and haptic feedback are disabled
  - Screen Reader: Labels for headers, values, and buttons are descriptive
  - Touch Targets: Tap areas meet minimum size (44x44 pt)

- Haptics
  - iOS native: Haptics fire on interactions; not overwhelming
  - Fallback: With no native module, `expo-haptics` triggers; no crashes

- Performance
  - Animation frame time: Smooth scrolling and animations (no stutters)
  - Battery: No excessive CPU usage from motion listeners; verify idle behavior

- Platform
  - iOS: `GlassContainer` used when available; fallback to Blur/Gradients otherwise
  - Android/Web: Material-like fallbacks render with good contrast

- Error Boundaries
  - UI remains functional if motion/haptics modules are unavailable
