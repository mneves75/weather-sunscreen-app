# Cursor Rules Summary

## Overview
This document provides a comprehensive overview of all Cursor Rules created for the Weather Sunscreen App. These rules help AI assistants understand the codebase architecture, patterns, and best practices.

**Last Updated:** October 2, 2025

---

## All Available Rules (20 Total)

### Core Development Rules (4)

#### 1. **project-structure.mdc** (Always Applied)
- **Purpose**: Project architecture and file organization
- **Key Topics**:
  - Directory structure and organization
  - Import patterns and aliases
  - File naming conventions
  - Barrel exports

#### 2. **development-overview.mdc** (Always Applied)
- **Purpose**: Comprehensive development overview and rule index
- **Key Topics**:
  - Project summary and architecture
  - Complete rule index
  - Technology stack
  - Development workflow
  - Code quality standards

#### 3. **typescript-standards.mdc**
- **Purpose**: TypeScript coding standards and patterns
- **Key Topics**:
  - Type safety and strict mode
  - Naming conventions
  - Interface and type definitions
  - Generic types
  - Error handling types

#### 4. **expo-sdk-54-patterns.mdc** ⭐ NEW
- **Purpose**: Expo SDK 54 and React Native 0.81 specific patterns
- **Key Topics**:
  - New Architecture support
  - Precompiled XCFrameworks (iOS)
  - New File System API
  - SQLite with localStorage
  - React 19.1 features (Suspense, transitions)
  - Typed routes with Expo Router v6
  - Platform-specific optimizations

---

### UI & Styling Rules (4)

#### 5. **component-patterns.mdc**
- **Purpose**: Component development patterns and best practices
- **Key Topics**:
  - Component structure
  - Props interfaces
  - Composition patterns
  - Reusable components

#### 6. **theme-styling.mdc**
- **Purpose**: Theme system and styling patterns
- **Key Topics**:
  - Token-based design system
  - Light/dark/high-contrast modes
  - Color system usage
  - Typography and spacing
  - Theme context

#### 7. **glass-morphism-patterns.mdc** ⭐ NEW
- **Purpose**: Glass morphism UI and liquid glass implementation
- **Key Topics**:
  - iOS 26+ liquid glass support (`expo-glass-effect`)
  - GlassView, GlassCard, GlassContainer components
  - Availability checks and fallbacks
  - Accessibility (reduce transparency)
  - Performance optimization (limit 5-10 elements)
  - Platform-specific considerations
  - DynamicColorIOS for text legibility

#### 8. **accessibility-patterns.mdc**
- **Purpose**: Accessibility patterns and best practices
- **Key Topics**:
  - Screen reader support
  - Accessibility labels and hints
  - Color contrast requirements
  - Focus management
  - Interactive element sizing

---

### Navigation & Routing Rules (1)

#### 9. **routing-navigation.mdc** ⭐ NEW
- **Purpose**: Expo Router v6 routing and navigation patterns
- **Key Topics**:
  - File-based routing structure
  - Typed routes configuration
  - Navigation API (router.push, router.back, etc.)
  - Native tabs (unstable) with SF Symbols
  - Deep linking setup
  - Modal navigation
  - Dynamic routes with parameters
  - Navigation guards and protection
  - Platform-specific considerations (iOS/Android)

---

### State & Data Rules (5)

#### 10. **context-state-management.mdc**
- **Purpose**: Context and state management patterns
- **Key Topics**:
  - Context provider patterns
  - Hook creation
  - State updates
  - Performance optimization

#### 11. **service-layer.mdc**
- **Purpose**: Service layer patterns and API integration
- **Key Topics**:
  - Singleton pattern
  - Error handling
  - API integration
  - Caching strategies
  - Logging

#### 12. **data-persistence-patterns.mdc** ⭐ NEW
- **Purpose**: AsyncStorage and SQLite patterns
- **Key Topics**:
  - When to use AsyncStorage vs SQLite
  - Storage key conventions
  - Batch operations
  - Migration patterns
  - Cache with expiration
  - SQLite database setup and management
  - CRUD operations with typed interfaces
  - Transactions and rollbacks
  - Full-text search with FTS5
  - Performance optimization

#### 13. **messages-notifications.mdc** ⭐ NEW
- **Purpose**: Message and notification system patterns
- **Key Topics**:
  - MessageService architecture (singleton pattern)
  - Message CRUD operations
  - Filtering and sorting
  - Batch operations
  - MessagesContext usage
  - Message categories and severity levels
  - Automatic cleanup and retention
  - Statistics and unread counts
  - UI components (MessageList, MessageCard, etc.)
  - Configuration management

#### 14. **internationalization.mdc**
- **Purpose**: i18n patterns and best practices
- **Key Topics**:
  - i18next setup
  - Translation files
  - Language switching
  - Pluralization
  - Date/time formatting

---

### Quality & Performance Rules (4)

#### 15. **testing-patterns.mdc**
- **Purpose**: Testing patterns and best practices
- **Key Topics**:
  - Unit testing
  - Component testing
  - Service testing
  - Mocking patterns
  - Coverage requirements

#### 16. **performance-optimization.mdc**
- **Purpose**: Performance optimization patterns
- **Key Topics**:
  - React.memo usage
  - useCallback and useMemo
  - FlatList optimization
  - Image optimization
  - Bundle size reduction

#### 17. **error-handling-patterns.mdc**
- **Purpose**: Comprehensive error handling patterns
- **Key Topics**:
  - Custom error types
  - Error boundaries
  - Service error handling
  - User-friendly messages
  - Error logging

#### 18. **security-patterns.mdc**
- **Purpose**: Security patterns and best practices
- **Key Topics**:
  - Data protection
  - Secure storage
  - Input validation
  - API security
  - Error message security

---

### Platform-Specific Rules (2)

#### 19. **react-native-expo.mdc**
- **Purpose**: React Native and Expo specific patterns
- **Key Topics**:
  - Component structure
  - Navigation patterns
  - Platform-specific code
  - Performance considerations
  - Styling with StyleSheet

#### 20. **native-modules.mdc**
- **Purpose**: Native module development patterns
- **Key Topics**:
  - Native module creation
  - Platform bridges
  - Swift/Kotlin integration
  - Testing native modules

---

## New Rules Created (5)

### 1. **glass-morphism-patterns.mdc**
**Why Created**: The app heavily uses glass morphism UI with iOS 26+ liquid glass support. This rule provides comprehensive guidance on:
- Using `expo-glass-effect` package
- Implementing proper fallbacks for older iOS versions and Android
- Accessibility considerations (reduce transparency)
- Performance optimization
- Visual hierarchy and design patterns

**Key Features**:
- `isLiquidGlassAvailable()` checks
- `AccessibilityInfo.isReduceTransparencyEnabled()` support
- `isInteractive` remounting pattern
- Performance limits (5-10 glass elements)
- `DynamicColorIOS` for text legibility

### 2. **messages-notifications.mdc**
**Why Created**: The app has a sophisticated messaging system for weather alerts, UV warnings, and system notifications. This rule documents:
- MessageService singleton architecture
- CRUD operations and batch processing
- Filtering, sorting, and statistics
- MessagesContext integration
- UI component patterns

**Key Features**:
- Message categories: weather-alert, uv-alert, system, info
- Severity levels: info, warning, critical
- Automatic cleanup and retention policies
- Unread count tracking
- Full-text search support

### 3. **expo-sdk-54-patterns.mdc**
**Why Created**: The app uses the latest Expo SDK 54 with React Native 0.81 and React 19.1. This rule covers:
- New architecture enablement
- Precompiled XCFrameworks for faster iOS builds
- New File System API (default)
- SQLite with localStorage support
- React 19 features (Suspense, transitions)
- Typed routes with Expo Router v6

**Key Features**:
- Minimum requirements (Node 20.19+, Xcode 16.1+)
- Migration guides from older SDKs
- Platform-specific optimizations
- Performance tuning

### 4. **data-persistence-patterns.mdc**
**Why Created**: The app uses both AsyncStorage and SQLite for different data persistence needs. This rule provides:
- Decision matrix: when to use AsyncStorage vs SQLite
- Storage key conventions and namespacing
- Migration patterns for schema changes
- Cache with expiration patterns
- SQLite best practices with TypeScript
- Transaction management

**Key Features**:
- Typed storage operations
- Batch operations for performance
- Migration versioning
- Full-text search with FTS5
- Repository pattern for SQLite

### 5. **routing-navigation.mdc**
**Why Created**: The app uses Expo Router v6 with typed routes and native tabs. This rule documents:
- File-based routing structure
- Typed navigation for type safety
- Native tabs implementation (iOS/Android differences)
- Deep linking configuration
- Navigation guards and protection
- Modal navigation patterns

**Key Features**:
- Route groups with `(name)` syntax
- Dynamic routes `[param]`
- Native tabs with SF Symbols (iOS)
- Platform-specific constraints (max 5 tabs on Android)
- Navigation history tracking

---

## Rule Organization

### By Category
```
Core Development (4 rules)
├── project-structure
├── development-overview
├── typescript-standards
└── expo-sdk-54-patterns ⭐

UI & Styling (4 rules)
├── component-patterns
├── theme-styling
├── glass-morphism-patterns ⭐
└── accessibility-patterns

Navigation & Routing (1 rule)
└── routing-navigation ⭐

State & Data (5 rules)
├── context-state-management
├── service-layer
├── data-persistence-patterns ⭐
├── messages-notifications ⭐
└── internationalization

Quality & Performance (4 rules)
├── testing-patterns
├── performance-optimization
├── error-handling-patterns
└── security-patterns

Platform-Specific (2 rules)
├── react-native-expo
└── native-modules
```

### Always Applied Rules (2)
1. `project-structure.mdc` - Essential for understanding project organization
2. `development-overview.mdc` - Provides comprehensive overview and rule index

### Rules with Descriptions (18)
All other rules have descriptions that allow the AI to fetch them on-demand when relevant to the current task.

---

## Usage Guidelines

### For AI Assistants
1. **Start with `development-overview.mdc`** - Get the big picture
2. **Use semantic search** - Find relevant code using the patterns
3. **Reference specific rules** - Fetch rules based on task requirements
4. **Follow best practices** - Apply DO/DON'T patterns from rules
5. **Test implementations** - Use testing patterns from rules

### For Developers
1. **Reference rules in code reviews** - Cite specific rules when reviewing code
2. **Update rules when patterns change** - Keep rules current with codebase
3. **Create new rules for new patterns** - Document new architectural decisions
4. **Link to rules in documentation** - Use `mdc:` references in docs

---

## Key Patterns Summary

### Architecture
- **Singleton services** - WeatherService, MessageService, etc.
- **Context providers** - WeatherContext, ThemeContext, MessagesContext, etc.
- **Component composition** - Reusable UI components with proper TypeScript
- **Glass morphism UI** - iOS 26+ liquid glass with fallbacks

### Data Management
- **AsyncStorage** - Simple key-value storage with namespacing
- **SQLite** - Structured data with full-text search
- **Message system** - Comprehensive notification and alerting
- **Cache with TTL** - Time-based cache expiration

### Navigation
- **File-based routing** - Expo Router v6 with typed routes
- **Native tabs** - Platform-specific tab implementations
- **Deep linking** - URL scheme support
- **Navigation guards** - Route protection and authentication

### UI/UX
- **Theme system** - Token-based with light/dark/high-contrast
- **Glass effects** - Platform-aware with accessibility fallbacks
- **Responsive design** - Adaptive layouts for different devices
- **Accessibility** - Screen reader support, contrast, and focus management

---

## Related Documentation
- [Agent Playbook](mdc:AGENTS.md) - High-level agent guidelines
- [Implementation Summary](mdc:IMPLEMENTATION_SUMMARY.md) - Recent implementation details
- [Quickstart Guide](mdc:QUICKSTART.md) - Getting started guide
- [Apple Documentation](mdc:docs/apple/index.md) - Platform-specific docs

---

## Future Rule Opportunities
Potential rules to create as the codebase evolves:
- **animation-patterns.mdc** - React Native Reanimated patterns
- **api-integration-patterns.mdc** - Weather API and external service patterns
- **form-patterns.mdc** - Form handling and validation
- **background-tasks.mdc** - Background job and notification patterns
- **offline-first-patterns.mdc** - Offline data sync strategies
- **ai-integration-patterns.mdc** - AI SDK and Anthropic integration patterns

---

**Generated:** October 2, 2025
**Total Rules:** 20 (5 new)
**Coverage:** Complete development lifecycle from architecture to deployment








