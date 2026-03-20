# Phase 1 Execution (Weeks 1-2)

## Objective
Stabilize trust-critical behavior in production by preventing silent data degradation and hardening claim notification reliability.

## Scope
1. Directory trust mode:
   - Disable silent seed fallback in production for directory-wide data load failures.
   - Surface explicit degraded-state errors instead of silently swapping data source.
2. Listing trust mode:
   - Disable silent seed fallback in production for single business page lookup failures.
   - Keep local/dev fallback behavior for developer resilience.
3. Claim notification reliability:
   - Prevent permanent "sent" state when email delivery fails.
   - Ensure failed notifications remain retryable.

## Workstreams
1. `WS1` Data trust hardening
   - Files: `src/directory-data.tsx`, `src/pages/BusinessPage.tsx`
   - Owner: delegated worker
   - Acceptance:
     - In production mode, failed Supabase reads do not silently switch to seed payloads.
     - UI clearly indicates load failure/degraded state.
2. `WS2` Claim notification reliability
   - Files: `supabase/functions/notify_claim_status/index.ts`
   - Owner: delegated worker
   - Acceptance:
     - Failed email send does not leave `notification_sent_at` stuck in sent state.
     - Function response makes retry outcome clear.

## Validation
1. `npm run lint` passes.
2. `npm run build` passes.
3. Manual checks:
   - Simulated Supabase read failure in production mode shows explicit failure, not seed fallback.
   - Notification failure path keeps claim retryable.

## Status
1. Created plan file.
2. Delegating implementation tasks.
