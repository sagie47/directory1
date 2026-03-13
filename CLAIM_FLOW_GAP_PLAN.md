# Claim Verification Plan

## Goal

Finish the remaining verification-path work now that the schema and claim insert path are no longer broken.

## Phase 1: Align Verified-State UX

### Outcome

The product uses one coherent set of UI rules for verified vs unverified businesses.

### Tasks

1. Audit the verified state in:
   - [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx)
   - [src/components/BusinessCard.tsx](/workspaces/directory1/src/components/BusinessCard.tsx)
2. Change the business detail sidebar so verified listings do not show the same generic claim CTA block.
3. Replace that block with verified-state messaging that matches the badge and claim model.

### Recommended Rule

- Unverified listing:
  - show claim CTA
- Verified listing:
  - show verified state
  - do not show “Claim this business” as the default CTA in the same way

### Success Criteria

- business detail page no longer sends mixed signals
- verified badge and surrounding CTA state agree

## Phase 2: Tighten Approval Handoff

### Outcome

When a claim is approved, the user gets a clean next step into ownership tooling.

### Tasks

1. Review the approved state in [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx).
2. Make sure the primary approved-state CTA is the owner dashboard.
3. Reduce any copy that competes with that core next step.
4. Verify the dashboard loads correctly after approval.

### Success Criteria

- approved user can go from claim status to owner dashboard cleanly
- copy emphasizes ownership access first

## Phase 3: Validate Admin Review To Verified Badge Pipeline

### Outcome

Admin approval reliably drives the public verified state.

### Tasks

1. Submit a fresh test claim.
2. Approve it through [src/pages/AdminClaimsPage.tsx](/workspaces/directory1/src/pages/AdminClaimsPage.tsx).
3. Confirm the row is now approved in `public.business_claims`.
4. Confirm the business appears in `verified_businesses`.
5. Confirm [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx) loads that ID.
6. Confirm badge rendering on:
   - [src/components/BusinessCard.tsx](/workspaces/directory1/src/components/BusinessCard.tsx)
   - [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx)

### Success Criteria

- admin approval changes the public verified state without manual intervention

## Phase 4: Wire Real Notification Delivery

### Outcome

Users get one real email when their claim is approved or rejected.

### Tasks

1. Deploy [notify_claim_status](/workspaces/directory1/supabase/functions/notify_claim_status/index.ts).
2. Set function secrets:
   - `RESEND_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Create the database webhook or equivalent trigger from `business_claims` updates.
4. Test one approval.
5. Test one rejection.
6. Confirm `notification_sent_at` prevents duplicates.

### Success Criteria

- exactly one email per terminal claim-status transition

## Phase 5: Final Polish

### Outcome

The verification journey feels intentional rather than stitched together.

### Tasks

1. Review copy across:
   - claim submit
   - claim status
   - admin review
   - verified business page
2. Remove contradictory wording.
3. Keep “approved claim” as the single verification source of truth.

### Success Criteria

- no conflicting CTA or messaging between verified and claimable states

## Recommended Order

1. Phase 1
2. Phase 2
3. Phase 3
4. Phase 4
5. Phase 5

## Test Flow

Use this exact flow after each meaningful verification change:

1. Submit claim as non-admin user.
2. Confirm pending state in `/claim/status`.
3. Approve from `/admin/claims`.
4. Refresh the target business list/detail view.
5. Confirm verified badge appears.
6. Confirm business detail page now shows the correct verified-state CTA/content.
7. Confirm approved user can access `/owner/dashboard`.
8. If notification wiring is active, confirm one email arrives.

## Implementation Notes

- Do not add a second verification source of truth.
- Do not add per-card verification fetches.
- Keep verified-state loading centralized in [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx).
- Prefer small UI edits that make the flow coherent over introducing new feature surface area.

## Verification Commands

After code changes:

```bash
npm run lint
npm run build
```
