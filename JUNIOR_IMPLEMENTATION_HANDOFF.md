# Junior Implementation Handoff

## Goal

Convert the product notes below into an execution plan a junior engineer can implement safely in this repo.

Do not treat the original list as all net-new work. Several pieces already exist and should not be rebuilt.

## Read This First

- App routes: [src/App.tsx](/workspaces/directory1/src/App.tsx)
- Auth state and profile loading: [src/contexts/AuthContext.tsx](/workspaces/directory1/src/contexts/AuthContext.tsx)
- Account page: [src/pages/AccountPage.tsx](/workspaces/directory1/src/pages/AccountPage.tsx)
- Claim submission flow: [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)
- Claim status page: [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
- Owner dashboard: [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
- Business page: [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx)
- Business card: [src/components/BusinessCard.tsx](/workspaces/directory1/src/components/BusinessCard.tsx)
- Directory data loading and overrides merge: [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx)
- Supabase schema: [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql)

## Current State Summary

These items are already implemented in some form:

- `profiles` table exists.
- New auth users are already synced into `profiles` via `handle_new_user()` trigger in [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql).
- `business_overrides` table already exists.
- Owner edits are already saved to `business_overrides` in [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx).
- The frontend already prefers overrides over base business data in [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx).
- `BusinessPage` already has an “Is this your business?” claim CTA in [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx).
- `BusinessPage` already outputs `LocalBusiness` JSON-LD through `Seo` in [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx).

These items are still missing or incomplete:

- Password reset route and flow.
- Account deletion flow.
- Admin review interface for claims.
- Claim approval notification system.
- Verified badge based on actual approved claims.
- Owner inbox and inquiry data model.
- Sitemap automation.
- Image optimization strategy.

## Delivery Rules

- Do not try to ship this whole document in one PR.
- Implement in small vertical slices.
- Each slice must include schema changes, UI changes, and verification notes if needed.
- After every meaningful change, run:

```bash
npm run lint
npm run build
```

- If you touch Supabase schema or auth behavior, document the migration steps in your PR description.
- Do not add placeholder backend behavior that pretends to work. If a feature needs a secure server-side function, build that function or explicitly leave the feature out.

## Recommended Work Order

1. Auth flows.
2. Admin claim review.
3. Claim approval notifications.
4. Verified badge logic.
5. Owner inbox.
6. Sitemap automation.
7. Image optimization.

## Workstream 1: Auth Flows

### Scope

Implement password reset and account deletion. Do not rebuild profile sync because it already exists.

### Tasks

1. Mount the existing login page if needed.
2. Add a reset-password request page and route.
3. Add an update-password page for the recovery session.
4. Extend `AuthContext` with password reset helpers.
5. Add delete-account UI to the account page.
6. Implement secure account deletion on the backend.

### Files Likely Touched

- [src/App.tsx](/workspaces/directory1/src/App.tsx)
- [src/contexts/AuthContext.tsx](/workspaces/directory1/src/contexts/AuthContext.tsx)
- [src/pages/LoginPage.tsx](/workspaces/directory1/src/pages/LoginPage.tsx)
- [src/pages/AccountPage.tsx](/workspaces/directory1/src/pages/AccountPage.tsx)
- new route page such as `src/pages/ResetPasswordPage.tsx`
- new route page such as `src/pages/UpdatePasswordPage.tsx`
- Supabase Edge Function for account deletion if you choose that path

### Implementation Notes

- Use `supabase.auth.resetPasswordForEmail()` for the request flow.
- The recovery redirect should land on a dedicated page that lets the user set a new password.
- Do not try to delete `auth.users` directly from the browser. Use a secure server-side path.
- Account deletion must remove user-owned rows safely. The schema already has cascading deletes from `profiles` to `business_claims`, but you still need a secure way to delete the auth user record itself.
- Confirm the user intent before deletion with an explicit confirmation step.

### Acceptance Criteria

- A signed-out user can request a password reset email.
- A recovery link lands on a page where the user can set a new password.
- A signed-in user can delete their account after confirmation.
- After deletion, the user session is terminated and they cannot access protected routes.

### Best Practices

- Show clear success and error states.
- Avoid exposing whether an email exists in the system beyond Supabase’s standard behavior.
- Keep auth helpers in `AuthContext`; do not duplicate auth calls in page components unless truly page-specific.

## Workstream 2: Admin Claim Review

### Scope

Build an internal admin page to review, approve, and reject claim submissions.

### Tasks

1. Add an admin-only route.
2. Create an admin claim queue page.
3. Fetch pending claims plus enough business and claimant context to review them.
4. Allow approve and reject actions, including rejection reason capture.
5. Restrict access using profile role.

### Files Likely Touched

- [src/App.tsx](/workspaces/directory1/src/App.tsx)
- [src/contexts/AuthContext.tsx](/workspaces/directory1/src/contexts/AuthContext.tsx)
- [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
- new page such as `src/pages/AdminClaimsPage.tsx`
- maybe a new admin guard component
- [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql) if new policies or RPCs are needed

### Implementation Notes

- Do not grant broad client-side update access to `business_claims`.
- Prefer an RPC or Edge Function for approve/reject if RLS becomes awkward.
- Capture `reviewed_by`, `reviewed_at`, and optional `rejection_reason`.
- Approval should be idempotent. Repeated clicks should not create inconsistent states.

### Acceptance Criteria

- Admin users can see pending claims.
- Admin users can approve or reject a claim.
- Non-admin users cannot access the page or mutate claim status.
- Claim status changes are visible in the existing user-facing claim status page.

### Best Practices

- Build the simplest useful review UI first.
- Include loading, empty, and error states.
- Do not mix admin logic into consumer-facing pages unless the UI is shared intentionally.

## Workstream 3: Claim Approval Notifications

### Scope

Send an email when claim status changes from `pending` to `approved` or `rejected`.

### Tasks

1. Pick one provider: Resend or Postmark.
2. Add an Edge Function or other secure server-side notification handler.
3. Trigger notification only on real status transitions.
4. Store enough metadata to prevent duplicate sends if needed.

### Files Likely Touched

- Supabase Edge Function files
- [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql) if you add notification tracking columns or tables
- possibly admin review code from Workstream 2

### Implementation Notes

- Do not send email from the browser.
- Do not trigger email just because a page reloaded.
- If possible, keep this close to the mutation point so approve/reject and notification are part of one trusted backend flow.
- Decide whether rejected claims should also notify. Recommended: yes.

### Acceptance Criteria

- Approval sends one email to the claimant.
- Rejection sends one email with the rejection reason when available.
- Re-saving the same status does not resend the email.

### Best Practices

- Use idempotent backend logic.
- Log failures so admins can retry if email delivery fails.
- Keep provider secrets out of the client.

## Workstream 4: Verified Badge Logic

### Scope

Show “Verified” only when the business has an approved claim in Supabase.

### Tasks

1. Decide where the verification state should live in the frontend data model.
2. Extend the directory data layer to load verification state efficiently.
3. Update business list cards and business detail pages to use that state.

### Files Likely Touched

- [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx)
- [src/components/BusinessCard.tsx](/workspaces/directory1/src/components/BusinessCard.tsx)
- [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx)
- [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql) if you add a view or RPC

### Implementation Notes

- Do not fetch claim status per card. That creates an N+1 problem.
- Prefer one of these patterns:
  - a Supabase view that exposes verified business IDs
  - a single aggregate query in `DirectoryDataProvider`
  - a denormalized boolean if you can maintain it safely
- The badge logic must use approved claims, not copy, not static page assumptions.

### Acceptance Criteria

- Verified badge appears only for businesses with an approved claim.
- Badge renders correctly in both list and detail contexts.
- No per-card network fetches are introduced.

### Best Practices

- Keep verification state centralized.
- Make the UI tolerant of missing or delayed verification data.

## Workstream 5: Owner Inbox

### Scope

Design and implement a real inbox for business inquiries. This is the largest feature here and should not start until the data model is clear.

### Tasks

1. Define what counts as an inquiry.
2. Create a persistent table for inquiries.
3. Decide where inquiries are created from.
4. Add owner dashboard inbox UI.
5. Add status handling such as `new`, `read`, `archived`.

### Files Likely Touched

- [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
- [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx) if inquiries start there
- new components for inbox list/detail
- [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql)

### Implementation Notes

- Do not build inbox UI first and invent storage later.
- First define a table shape. Example fields:
  - `id`
  - `business_id`
  - `submitted_by_email`
  - `submitted_by_name`
  - `message`
  - `phone`
  - `status`
  - `created_at`
- Decide whether inquiries come from:
  - a contact form on `BusinessPage`
  - a lead capture modal
  - existing “Book Call” / “Book Demo” flows
- The source of truth must be one system, not multiple disconnected forms.

### Acceptance Criteria

- An inquiry can be created and stored.
- Approved owners can view inquiries for their claimed business.
- Owners cannot view inquiries for businesses they do not own.

### Best Practices

- Start with a simple list and detail view.
- Enforce ownership with RLS.
- Add empty-state copy and basic filtering later, not in version one.

## Workstream 6: Sitemap Automation

### Scope

Automate sitemap generation instead of relying on manual runs.

### Tasks

1. Find the current sitemap generator command.
2. Decide where automation should live:
   - build step, or
   - GitHub Action
3. Add documentation for when it runs and where output lands.

### Recommendation

Prefer a GitHub Action on a schedule or on content-merge changes instead of coupling sitemap generation to every local build.

### Acceptance Criteria

- Sitemap generation runs automatically without a manual engineer step.
- The output matches current directory content.

## Workstream 7: Image Optimization

### Scope

Improve image delivery for performance-sensitive pages.

### Tasks

1. Audit the heaviest images.
2. Decide whether to use:
   - Supabase Storage transformations, or
   - Cloudinary, or
   - a local pre-processing pipeline
3. Update the image-loading strategy for hero/gallery assets first.

### Implementation Notes

- This is not just “compress a few files by hand”.
- Pick one strategy and apply it consistently.
- Start with the most expensive business and hero images.

### Acceptance Criteria

- Large assets are delivered in smaller, appropriately sized variants.
- Existing pages still render correctly on mobile and desktop.

## Items From the Original List That Are Already Done

Do not spend time rebuilding these unless you discover a real bug:

- Persistent profile sync:
  already handled in [supabase/schema.sql](/workspaces/directory1/supabase/schema.sql) by `handle_new_user()`.
- Business owner profile editor with overrides:
  already handled by [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx) and [src/directory-data.tsx](/workspaces/directory1/src/directory-data.tsx).
- Structured data / JSON-LD:
  already present in [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx).
- “Claim this Listing” CTA on business page:
  already present in [src/pages/BusinessPage.tsx](/workspaces/directory1/src/pages/BusinessPage.tsx).

## Suggested PR Breakdown

Use this PR order unless blocked:

1. `auth-reset-and-account-delete`
2. `admin-claim-review`
3. `claim-status-email-notifications`
4. `verified-badge-from-approved-claims`
5. `owner-inbox-foundation`
6. `sitemap-automation`
7. `image-optimization-phase-1`

## Minimum QA Checklist For Every PR

- Happy path works.
- Loading state exists.
- Error state exists.
- Empty state exists if the screen can be empty.
- Unauthorized users cannot access protected actions.
- `npm run lint` passes.
- `npm run build` passes.

## Notes for the Junior Engineer

- Ask for clarification before inventing product behavior for the inbox or admin flows.
- If a feature requires secrets or elevated privileges, move that logic server-side.
- Reuse the existing patterns in this repo instead of introducing a new state library or auth abstraction.
- Keep UI changes intentional and consistent with the current design language.
