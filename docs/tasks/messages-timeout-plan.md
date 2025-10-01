# Messages Timeout Fix - Plan

## Context
- `src/context/MessagesContext.tsx` defines an inline `withTimeout` helper used throughout initialization.
- Logs show `Operation timed out` errors coming from the timeout rejection even when services succeed, implying the timer is not cleared.

## Findings
- `Promise.race` never clears the `setTimeout`, so the timeout callback still fires after the awaited promise resolves.
- Downstream `.catch` handlers log the error, leading to repeated noisy logs and false failure states.
- No other services currently handle these spurious errors, so resolving the helper should stop the failures without broader refactors.

## Plan
1. Refactor `withTimeout` to wrap the supplied promise, explicitly clearing the timer once the promise settles (resolve or reject).
2. Preserve the existing API (default `timeoutMs = 5000`) so callers stay untouched.
3. Re-run through initialization logic mentally to ensure no additional side effects arise from the change.

## TODO
- [x] Update `withTimeout` to clear the timeout and avoid double settlement.
- [x] Re-read `MessagesContext` initialization flow to confirm consistent error handling.
- [x] Skim `messageService`, `notificationService`, and `AlertRuleEngine` for assumptions about initialization timing.
