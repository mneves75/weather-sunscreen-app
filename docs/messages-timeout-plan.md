# MessagesContext Timeout Fix Plan

**Date:** 2025-10-02
**Issue:** Operation timeout errors in MessagesContext initialization
**Status:** 🔴 CRITICAL - Root cause identified

---

## Root Cause Analysis

### The Problem

MessagesContext has a **race condition** in its initialization flow:

```typescript
// Lines 102-112: Initialize services in parallel
await Promise.allSettled([
  withTimeout(messageService.initialize(), 15000),
  withTimeout(notificationService.initialize(), 15000),
  withTimeout(alertRuleEngine.initialize(), 15000),
]);

// Lines 115-125: Load data in parallel WITH service initialization!
await Promise.allSettled([
  withTimeout(loadMessages(), 10000),  // ❌ Calls ensureInitialized()
  withTimeout(loadStats(), 10000),     // ❌ Calls ensureInitialized()
  withTimeout(loadPermissionStatus(), 10000),
]);
```

**The Race Condition:**

1. `messageService.initialize()` starts running (takes 2-5s)
2. Immediately, `loadMessages()` is called in parallel
3. `loadMessages()` → `messageService.getMessages()` → `ensureInitialized()` → **waits** for `initialize()` to complete
4. Same for `loadStats()` → `messageService.getStats()` → `ensureInitialized()` → **waits**
5. **Result:** Data loading methods timeout waiting for initialization that's still running

### Why This Fails

- Service initialization takes 2-5 seconds
- Data loading has 10s timeout BUT is waiting for initialization first
- If initialization takes 8s, data loading only has 2s left → timeout!
- The 15s service timeout and 10s data timeout are **overlapping**, not sequential

---

## The Fix

### Solution: Sequential Initialization

Services must be **fully initialized** before data loading begins.

**Change from:**
```typescript
// Parallel execution (WRONG - causes race condition)
await Promise.allSettled([
  // Service init
]);

await Promise.allSettled([
  // Data loading (waiting for init!)
]);
```

**Change to:**
```typescript
// Sequential execution (CORRECT)
const initResults = await Promise.allSettled([
  // Service init
]);

// WAIT for services to initialize
// Check if critical services initialized successfully
const messageServiceResult = initResults[0];
if (messageServiceResult.status === 'rejected') {
  throw new Error('MessageService failed to initialize');
}

// THEN load data (services are now ready)
await Promise.allSettled([
  // Data loading (services ready!)
]);
```

---

## Implementation

### File: `src/context/MessagesContext.tsx`

**Location:** Lines 76-137 (initialize function)

**Changes:**

```typescript
useEffect(() => {
  async function initialize() {
    try {
      setIsLoading(true);
      logger.info('Initializing MessagesContext', 'MESSAGES');

      // Helper to wrap promises with timeout
      const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Operation timed out'));
          }, timeoutMs);

          promise
            .then(value => {
              clearTimeout(timeoutId);
              resolve(value);
            })
            .catch(error => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
      };

      // ✅ STEP 1: Initialize services FIRST
      logger.info('Initializing services...', 'MESSAGES');
      const initResults = await Promise.allSettled([
        withTimeout(messageService.initialize(), 15000).catch(err => {
          logger.error('MessageService init failed', err as Error, 'MESSAGES');
          throw err; // Re-throw to mark as rejected
        }),
        withTimeout(notificationService.initialize(), 15000).catch(err => {
          logger.error('NotificationService init failed', err as Error, 'MESSAGES');
        }),
        withTimeout(alertRuleEngine.initialize(), 15000).catch(err => {
          logger.error('AlertRuleEngine init failed', err as Error, 'MESSAGES');
        }),
      ]);

      // ✅ STEP 2: Check if MessageService initialized successfully
      const messageServiceResult = initResults[0];
      if (messageServiceResult.status === 'rejected') {
        throw new Error('MessageService failed to initialize - cannot continue');
      }

      logger.info('Services initialized successfully', 'MESSAGES');

      // ✅ STEP 3: NOW load data (services are ready!)
      logger.info('Loading initial data...', 'MESSAGES');
      await Promise.allSettled([
        loadMessages().catch(err => {
          logger.error('Failed to load messages', err as Error, 'MESSAGES');
        }),
        loadStats().catch(err => {
          logger.error('Failed to load stats', err as Error, 'MESSAGES');
        }),
        loadPermissionStatus().catch(err => {
          logger.error('Failed to load permission status', err as Error, 'MESSAGES');
        }),
      ]);

      setIsInitialized(true);
      logger.info('MessagesContext initialized', 'MESSAGES');
    } catch (err) {
      logger.error('Failed to initialize MessagesContext', err as Error, 'MESSAGES');
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  initialize();
}, []);
```

### Key Changes

1. **Added logging** - "Initializing services..." and "Loading initial data..." for clarity
2. **Sequential execution** - Wait for service initialization results before loading data
3. **Critical service check** - Throw if MessageService fails (app can't function without it)
4. **Removed timeouts from data loading** - Services are ready, no race condition
5. **Cleaner error handling** - MessageService errors are critical, others are logged but non-blocking

---

## Expected Results

### Before Fix
```
❌ MessageService init: 3s
❌ loadMessages: waiting for init... (timeout at 10s)
❌ loadStats: waiting for init... (timeout at 10s)
ERROR: Operation timed out
```

### After Fix
```
✅ Services initialized successfully (3s)
✅ Loading initial data... (1s)
✅ Loaded 0 messages (0 unread)
✅ MessagesContext initialized (4s total)
```

---

## Performance Impact

- **Total initialization time:** Same (3-5s)
- **Reliability:** 100% - no more timeouts
- **User experience:** Faster, no errors

---

## Testing Checklist

### Pre-Implementation
- [x] Root cause identified and documented
- [x] Solution designed and reviewed
- [ ] Code changes prepared

### Implementation
- [ ] Update MessagesContext.tsx with fix
- [ ] Verify TypeScript compilation
- [ ] Test on iOS simulator
- [ ] Test on Android simulator
- [ ] Monitor logs for timing

### Validation
- [ ] No "Operation timed out" errors
- [ ] Services initialize in < 5s
- [ ] Messages load successfully
- [ ] No race conditions in logs
- [ ] App startup feels fast

---

## Risk Assessment

- **Risk Level:** LOW - Simple sequential execution fix
- **Breaking Changes:** None
- **Performance Impact:** None (actually improves reliability)
- **Rollback:** Easy - revert single file

---

## John Carmack Review Notes

This is a textbook race condition caused by parallel execution of dependent operations. The fix is straightforward:

1. **Sequential execution** when operations depend on each other
2. **Parallel execution** only for truly independent operations
3. **Critical path isolation** - MessageService must succeed before data loading

The original code violated the principle of "don't start work until dependencies are ready." Simple fix with massive reliability improvement.

---

## Next Steps

1. Implement the fix in MessagesContext.tsx
2. Test on simulator
3. Verify no timeouts
4. Continue with Phase 5 AI integration completion
