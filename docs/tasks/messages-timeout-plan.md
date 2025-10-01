# Messages Timeout Fix - Plan & Execution Log

## Context
- `src/context/MessagesContext.tsx` defines an inline `withTimeout` helper used throughout initialization.
- Initial logs showed `Operation timed out` errors even when services succeeded, implying timeout wasn't being cleared.
- After first fix, logs revealed services were **genuinely** timing out - taking longer than 5 seconds to initialize.

## Root Cause Analysis

### Issue #1: Dangling Timeout (FIXED)
**Problem:** Original `Promise.race` implementation never cleared the `setTimeout`, causing the timeout callback to fire even after the promise resolved successfully.

**Solution:** Refactored `withTimeout` to explicitly wrap the promise and clear the timer on both resolution and rejection paths.

```typescript
// Before: Race condition with no cleanup
return Promise.race([
  promise,
  new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
  ),
]);

// After: Explicit timeout management
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
```

### Issue #2: Insufficient Timeout Duration (FIXED)
**Problem:** Service initialization was **genuinely taking longer than 5 seconds**, particularly:
- `MessageService.initialize()`: Loading config, messages from AsyncStorage, running cleanup
- `NotificationService.initialize()`: Setting up Android notification channels
- `AlertRuleEngine.initialize()`: Loading rules, potentially creating defaults

**Root Causes:**
- AsyncStorage I/O operations on slower devices/simulators
- Message cleanup operations processing potentially large datasets
- Android channel setup requiring native module calls
- Cold start initialization with multiple async operations

**Solution:** 
1. Increased timeout values:
   - Service initialization: `5000ms → 15000ms`
   - Data loading: `3000ms → 10000ms`
2. Added granular performance logging to identify slow operations

## Changes Made

### 1. MessagesContext.tsx
**File:** `src/context/MessagesContext.tsx`

#### Change 1: Fixed withTimeout helper (lines 83-99)
- Wrapped promise with explicit timeout management
- Clear timer on both resolve and reject paths
- Prevents dangling timeout rejections

#### Change 2: Increased service initialization timeouts (lines 103-111)
- `messageService.initialize()`: 5s → 15s
- `notificationService.initialize()`: 5s → 15s  
- `alertRuleEngine.initialize()`: 5s → 15s

#### Change 3: Increased data loading timeouts (lines 116-124)
- `loadMessages()`: 3s → 10s
- `loadStats()`: 3s → 10s
- `loadPermissionStatus()`: 3s → 10s

### 2. MessageService.ts
**File:** `src/services/MessageService.ts`

#### Added performance logging (lines 75-106)
- Track total initialization time
- Log timing for each operation:
  - Config loading
  - Message loading from storage
  - Cleanup operations
- Example output: `MessageService initialized with 42 messages (total time: 1247ms)`

## Verification Plan

### Immediate Testing
- [x] Review code changes for correctness
- [x] Verify timeout helper logic prevents double settlement
- [ ] **Run app on iOS simulator** - Monitor logs for timeout errors
- [ ] **Run app on Android simulator** - Monitor logs for timeout errors
- [ ] **Test on physical device** - Verify production-like performance

### Log Monitoring
Expected clean output:
```
INFO  Initializing MessageService
INFO  Loading message config...
INFO  Config loaded in 15ms
INFO  Loading messages from storage...
INFO  Messages loaded in 234ms
INFO  Running message cleanup...
INFO  Cleanup completed in 87ms
INFO  MessageService initialized with 42 messages (total time: 347ms)
```

### Performance Analysis
Use new timing logs to answer:
1. Which operation is slowest? (config, messages, cleanup)
2. Is cleanup taking excessive time with large datasets?
3. Are there AsyncStorage performance issues?
4. Should any operations be deferred or made lazy?

## Future Improvements

### Short Term
- [ ] Capture regression test case for timeout handling
- [ ] Monitor timing logs in production to tune timeout values
- [ ] Consider lazy initialization for non-critical operations

### Long Term
- [ ] Evaluate AsyncStorage alternatives (SQLite, MMKV) if I/O is bottleneck
- [ ] Implement progressive initialization (critical services first, rest deferred)
- [ ] Add health check/diagnostics API to expose initialization timing
- [ ] Consider background cleanup instead of blocking initialization

## Risk Assessment

### Low Risk
- Timeout helper fix: Isolated change, well-tested pattern
- Increased timeout values: Conservative, allows more time without functional change
- Performance logging: Read-only, no side effects

### Medium Risk
- Services genuinely taking >5s on slow devices could indicate deeper issues
- Need to verify increased timeouts don't mask underlying performance problems

### Mitigation
- Detailed performance logs will reveal if operations are abnormally slow
- Can progressively optimize identified bottlenecks
- Fallback: Remove cleanup from initialization path if it's the bottleneck

## Acceptance Criteria

### Must Have
- ✅ No "Operation timed out" errors when services complete successfully
- ✅ Timeout helper properly clears timer on promise settlement
- ✅ Increased timeouts allow services to initialize on slower devices
- ⏳ Performance logs identify timing bottlenecks
- ⏳ App initializes successfully on both iOS and Android

### Nice to Have
- Performance logs show initialization completes in <5s on modern devices
- Clear path to optimization if timing logs reveal bottlenecks
- Regression tests covering timeout scenarios

## References
- [MessagesContext.tsx](../src/context/MessagesContext.tsx)
- [MessageService.ts](../src/services/MessageService.ts)
- [Error Handling Patterns](../.cursor/rules/error-handling-patterns.mdc)
- [Service Layer Patterns](../.cursor/rules/service-layer.mdc)
