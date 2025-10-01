# TypeScript Fixes Required

## Color Property Mapping

**Existing Theme Colors** → **What I Used (Wrong)**
- `text` → `onSurface` ❌
- `textSecondary` → `onSurfaceVariant` ❌  
- `textTertiary` → (not used)
- `background` → `onBackground` ❌
- `primary` → stays same ✅
- `surface` → stays same ✅
- `surfaceVariant` → stays same ✅
- `error` → stays same ✅

**Missing Colors I Used:**
- `primaryContainer` ❌
- `onPrimaryContainer` ❌  
- `tertiary` ❌
- `outlineVariant` ❌
- `errorContainer` ❌
- `onErrorContainer` ❌
- `onPrimary` ❌

## Text Variant Mapping  

**Valid Variants:**
- 'h1', 'h2', 'h3', 'h4' ✅
- 'body' ✅
- 'caption' ✅  
- 'overline' ✅

**Invalid (Used by mistake):**
- 'body1' → should be 'body' ❌
- 'body2' → should be 'caption' or 'body' ❌

## ErrorView Props

**Correct:**
```typescript
{
  error: Error | string,  // Not "message"
  onRetry?: () => void
}
```

## Accessibility Roles

**Invalid:**
- "listitem" → use "none" or remove
- "region" → use "none" or remove

## Quick Fix Strategy

1. Replace all `body1` → `body`
2. Replace all `body2` → `caption` 
3. Replace `onSurface` → `text`
4. Replace `onSurfaceVariant` → `textSecondary`
5. Replace `onBackground` → `text`
6. Replace `message=` in ErrorView → `error=`
7. Add missing Material 3 colors to theme OR use existing colors
8. Fix accessibility roles


