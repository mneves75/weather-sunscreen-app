# Reference Documentation Index

This directory contains comprehensive, version-specific reference documentation for all major technologies used in the Weather Sunscreen App. **ALWAYS consult these docs FIRST** before implementing features or answering questions.

## Directory Structure

### `docs_apple/` - iOS 26 / iPadOS 26 / macOS 26
**Size:** 350+ files
**Updated:** iOS 26, macOS 26, Swift 6

**Key Resources:**
- `liquid-glass.md` - Complete Liquid Glass implementation guide
- `adopting-liquid-glass.md` - Migration guide with code examples
- `swift-concurrency.md` - Swift 6 strict concurrency, MainActor, Sendable
- `modern-swift.md` - Latest Swift features and patterns
- `SWIFT-IOS-ADDITIONAL-DOCS.md` - Comprehensive iOS development guide
- `apple_documentation_swiftui/` - Full SwiftUI API reference
- `apple_design_human-interface-guidelines/` - Complete HIG (all platforms)
- `apple_com_full_documentation/` - Apple Developer documentation archive

**Use For:**
- Implementing GlassView, GlassContainer, UIVisualEffectView
- SwiftUI views, modifiers, state management
- Native modules, widgets, app extensions
- Platform-specific UI patterns and accessibility
- App Store submission requirements

### `docs_ai-sdk_dev/` - Vercel AI SDK
**Size:** 200+ files
**Updated:** Latest AI SDK with GPT-5, Gemini support

**Key Resources:**
- `docs/ai-sdk-core/` - Core API reference (generateText, streamText, generateObject)
- `docs/ai-sdk-ui/` - React hooks (useChat, useCompletion, useObject)
- `docs/ai-sdk-rsc/` - React Server Components integration
- `cookbook/guides/gpt-5.md` - GPT-5 model specifics
- `cookbook/guides/gemini-2_5.md` - Gemini integration patterns
- `cookbook/guides/multi-modal-chatbot.md` - Image/audio processing
- `cookbook/guides/rag-chatbot.md` - RAG implementation examples

**Use For:**
- AI-powered sunscreen recommendations
- Conversational interfaces and chatbots
- Streaming responses with tool calling
- Multi-modal AI (images, location, weather data)
- Token optimization and caching strategies

### `docs_expo_dev/` - Expo SDK 54
**Size:** 400+ files
**Updated:** Expo SDK 54, React Native 0.81

**Key Resources:**
- `core-concepts.md` - Expo fundamentals and architecture
- `build/eas-build/` - EAS Build configuration and profiles
- `develop/development-builds/` - Custom dev clients
- `eas-update/` - OTA updates and runtime versions
- `deploy/` - App store submission and distribution
- `additional-resources.md` - Community resources and tools

**Use For:**
- Configuring app.json, eas.json
- Build troubleshooting and native dependencies
- EAS Update rollout strategies
- Development build vs Expo Go
- CI/CD pipeline setup

### `docs_reactnative_getting-started/` - React Native
**Size:** 150+ files
**Updated:** React Native 0.81, New Architecture (Fabric)

**Key Resources:**
- `architecture/` - Fabric renderer, TurboModules, JSI
- `performance/` - Optimization and profiling guides
- `platform-specific/` - iOS/Android native modules
- `troubleshooting/` - Common errors and solutions

**Use For:**
- Custom native modules and bridges
- Performance optimization and debugging
- New Architecture migration
- Platform-specific implementations
- Metro bundler configuration

## Quick Search Examples

### Find Liquid Glass Performance Guidance
```bash
grep -r "performance" docs/REF_DOC/docs_apple/liquid-glass.md
grep -r "GlassContainer" docs/REF_DOC/docs_apple/adopting-liquid-glass.md
```

### Check AI Model Capabilities
```bash
grep -r "context window" docs/REF_DOC/docs_ai-sdk_dev/cookbook/guides/gpt-5.md
grep -r "multimodal" docs/REF_DOC/docs_ai-sdk_dev/cookbook/guides/gemini-2_5.md
```

### Verify Expo Build Configuration
```bash
grep -r "runtimeVersion" docs/REF_DOC/docs_expo_dev/eas-update/
grep -r "android.package" docs/REF_DOC/docs_expo_dev/build/
```

### React Native Performance Patterns
```bash
grep -r "FlashList" docs/REF_DOC/docs_reactnative_getting-started/performance/
grep -r "useMemo" docs/REF_DOC/docs_reactnative_getting-started/
```

## Documentation Best Practices

1. **Search Before Implementing**: Always grep/read relevant docs before writing code
2. **Verify API Availability**: Check version compatibility (SDK 54, iOS 26, React Native 0.81)
3. **Follow Official Patterns**: Use documented examples and best practices
4. **Cross-Platform Consistency**: Reference both iOS and Android sections for parity
5. **Security First**: Check privacy manifests, entitlements, and App Store requirements

## File Count by Category

```bash
# Total documentation files
find docs/REF_DOC -name "*.md" -type f | wc -l
# Output: 1096+ files

# By subdirectory
find docs/REF_DOC/docs_apple -name "*.md" | wc -l        # ~350 files
find docs/REF_DOC/docs_ai-sdk_dev -name "*.md" | wc -l    # ~200 files
find docs/REF_DOC/docs_expo_dev -name "*.md" | wc -l      # ~400 files
find docs/REF_DOC/docs_reactnative_getting-started -name "*.md" | wc -l  # ~150 files
```

## Integration with Project

This documentation is referenced in:
- `CLAUDE.md` - "Reference Documentation - CRITICAL" section
- `AGENTS.md` - "Reference Documentation Protocol" section
- `.cursor/rules/` - Cursor AI project-specific rules

## Version History

- **2025-10-04**: Documentation consolidated into `docs/REF_DOC/`
- **2025-10-03**: Initial documentation import (AI SDK, Apple, Expo)
- Coverage: Expo SDK 54, iOS 26, React Native 0.81, Swift 6, AI SDK latest

## External Documentation (Secondary)

Only consult external sources when local docs don't cover a topic:
- https://docs.expo.dev/versions/v54.0.0/
- https://reactnative.dev/docs/the-new-architecture/landing-page
- https://sdk.vercel.ai/docs
- https://developer.apple.com/documentation/

---

**CRITICAL REMINDER**: These local docs are the **PRIMARY SOURCE OF TRUTH** for this project. They are version-specific, comprehensive, and guaranteed authoritative. External links are secondary references only.
