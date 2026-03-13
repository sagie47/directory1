# Claim Verification Handoff

## Objective

The SQL repair work is already done in production. Claim submission is no longer the blocker.

The remaining work is to make the verification path feel complete and internally consistent from:

1. claim submission
2. pending status
3. admin review
4. approval or rejection
5. verified badge rendering
6. owner next-step experience
7. optional approval email

This handoff is about making that path harmonious, not about redoing the schema rescue.

## What Is Already Working

- claim submission flow exists in [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)
- claim status page exists in [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
- admin review page exists in [src/pages/AdminClaimsPage.tsx](/workspaces/directory1/src/pages/AdminClaimsPage.tsx)
- review RPC exists in [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql)
- `verified_businesses` view exists in [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql)
- verified badges already render in:
  - [src/components/BusinessCard.tsx](/workspaces/directory1/src/components/BusinessCard.tsx)
  - [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx)
- verified business IDs are already loaded centrally in [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx)
- owner dashboard exists in [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
- notification function source exists at [supabase/functions/notify_claim_status/index.ts](/workspaces/directory1/supabase/functions/notify_claim_status/index.ts)

## Main Remaining Gaps

### 1. Verified-state UX is not fully aligned

The app already knows when a business is verified, but the surrounding CTA behavior is still rough.

Current inconsistency:

- [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx) shows a verified badge
- the same page still shows the generic “Is this your business?” claim box even when the listing is already verified

That creates mixed signals:

- “this listing is verified”
- “claim this listing now”

The UI needs one coherent rule set for:

- unverified listing
- verified listing
- approved owner viewing their own claimed listing

### 2. Approval path needs a stronger owner handoff

After approval, the user should have a clean next step.

The current pieces exist:

- claim status page can show approved status
- owner dashboard exists

But the journey still needs to be intentionally connected so that approval leads to the right place with the right copy.

### 3. Notification wiring still needs confirmation

The function exists in code, but real email delivery still depends on:

- function deployment
- secrets
- webhook or equivalent invocation path

Without that, approval works in the database but not in the user experience.

### 4. Admin review should remain the single source of truth for verification

The approved claim is the source of truth. Do not introduce separate “verified” state elsewhere unless there is a very strong reason.

The whole path should continue to rely on:

- `business_claims.status = 'approved'`
- `verified_businesses` view
- centralized loading in `DirectoryDataProvider`

## Files That Matter

- [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)
- [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
- [src/pages/AdminClaimsPage.tsx](/workspaces/directory1/src/pages/AdminClaimsPage.tsx)
- [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx)
- [src/components/BusinessCard.tsx](/workspaces/directory1/src/components/BusinessCard.tsx)
- [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
- [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx)
- [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql)
- [supabase/functions/notify_claim_status/index.ts](/workspaces/directory1/supabase/functions/notify_claim_status/index.ts)

## Recommended UX Rules

### Business page

Use these rules consistently:

- If business is not verified:
  - show claim CTA
  - show normal “Is this your business?” copy
- If business is verified:
  - do not show the same generic claim CTA block
  - replace it with verified-state messaging
  - optional: show a softer ownership-problem path later if needed, but do not mix that into this rollout unless required

### Claim status page

- Pending:
  - explain review is in progress
  - keep next-step expectations clear
- Approved:
  - primary next step should be owner dashboard
  - recommendation copy should not distract from owner access
- Rejected:
  - rejection reason should be obvious
  - retry path should be clear

### Admin review

- Approve/reject should remain simple and fast
- Business name should be visible, not just business ID
- Review actions should clearly feed the public verified state

## Acceptance Criteria

The verification path is considered “harmonious” when all of the following are true:

1. User submits a claim successfully.
2. User sees pending state clearly in `/claim/status`.
3. Admin can approve in `/admin/claims`.
4. Approved claim updates the verified source of truth.
5. Verified badge appears on cards and business detail page.
6. Verified business detail page no longer pushes the same generic claim CTA.
7. Approved user has a clean path into `/owner/dashboard`.
8. If notification infra is live, one approval email is sent once.

## Out Of Scope For This Pass

- broader auth cleanup
- account deletion polish
- owner inbox
- SEO changes unrelated to verification
- alternate verification models outside `business_claims`

## Suggested Next Engineer Task

Focus on these in order:

1. business page verified-state CTA logic
2. claim status approved-state polish
3. admin review validation against verified badge behavior
4. notification deployment and webhook confirmation

## Notes

- Production SQL was already applied.
- Do not reopen the schema-repair track unless a new environment shows drift.
