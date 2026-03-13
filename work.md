## Business Funnel Implementation Notes

This document reflects the current intended implementation for the business-owner funnel.

Use it as the route-level source of truth when changing this flow.

## Goal

Restructure the business-owner funnel so the product feels like:

`claim first -> trust -> diagnose -> prescribe next step`

and not:

`pick from four equal services before you trust us`

The directory claim flow is the wedge.
The service offers are supporting prescriptions, not top-level equal offers.

## Current Truth In The Codebase

These routes already exist:

- `/for-business`
- `/claim-business`
- `/claim`
- `/claim/status`
- `/owner/dashboard`
- `/never-miss-a-lead`
- `/book-demo`
- `/demo-requested`
- `/websites-for-trades`
- `/managed-growth`
- `/book-call`
- `/call-requested`

These are the current key files:

- [src/pages/ForBusinessPage.tsx](/workspaces/directory1/src/pages/ForBusinessPage.tsx)
- [src/pages/ClaimBusinessPage.tsx](/workspaces/directory1/src/pages/ClaimBusinessPage.tsx)
- [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)
- [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)
- [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)
- [src/pages/NeverMissLeadPage.tsx](/workspaces/directory1/src/pages/NeverMissLeadPage.tsx)
- [src/pages/WebsitesForTradesPage.tsx](/workspaces/directory1/src/pages/WebsitesForTradesPage.tsx)
- [src/pages/ManagedGrowthPage.tsx](/workspaces/directory1/src/pages/ManagedGrowthPage.tsx)
- [src/App.tsx](/workspaces/directory1/src/App.tsx)

Important: some future-state routes do **not** exist:

- `/owner/listing`
- `/owner/inquiries`
- `/owner/settings`

Do not build those in this handoff unless explicitly requested later.

## Product Decision

### Old model

Business owners land on `/for-business` and choose one of four equal lanes.

### New model

Business owners should mainly see one low-friction action:

`Claim your profile`

After they show intent, the app can recommend:

- lead capture
- website rebuild
- listing improvement

### Core rule

Before trust:
- one primary CTA only

After claim intent:
- show one recommended next step

After verification:
- show one prioritized upgrade or improvement

Do not show four equal primary offers above the fold.

## Scope

## In Scope

Phase 1 in this handoff includes:

1. Simplify `/for-business`
2. Tighten `/claim-business`
3. Improve `/claim/status`
4. Simplify `/owner/dashboard`
5. Add a lightweight recommendation model in frontend code only
6. Add event instrumentation stubs or wrapper calls where practical

## Out Of Scope

Do **not** do these in this task unless specifically asked:

- build a full admin panel
- build `/owner/listing`, `/owner/inquiries`, `/owner/settings`
- add fake analytics charts
- add pseudo-CRM widgets
- build ML scoring
- redesign service offer pages from scratch
- create complex billing flows
- add new Supabase schema unless absolutely required

## UX Rules

Follow these rules exactly:

1. Claim first, sell later.
2. One dominant CTA above the fold.
3. Recommendation copy must sound diagnostic, not salesy.
4. No vanity metrics.
5. No fake “AI tools” nav sections.
6. Use practical, local, direct language.
7. If the app does not have trustworthy data, do not imply that it does.

### Good examples

- `Claim your free profile`
- `We are reviewing your ownership request`
- `Here is the next thing most likely to help`
- `Your website may be making it harder for customers to contact you`

### Bad examples

- `All-in-one growth operating system`
- `AI-powered business acceleration`
- `30K reach` unless real data exists
- `Dashboard insights` when there are no insights

## Technical Guardrails

1. Keep changes minimal and targeted.
2. Preserve existing routes unless explicitly changing CTA destination.
3. Prefer modifying existing pages over creating new ones.
4. Do not invent backend data that does not exist.
5. If recommendation logic is needed, implement it as simple rule-based frontend logic first.
6. If an event tracker does not exist, create a small wrapper utility instead of scattering `console.log` calls everywhere.

## Recommendation Model For This Phase

Use a simple frontend-only recommendation enum:

- `complete_profile`
- `website_fix`
- `lead_capture`
- `listing_upgrade`
- `retry_claim`
- `none`

### Recommendation rules for v1

Keep it simple and deterministic.

Recommended order:

1. If `claimStatus === 'rejected'` -> no normal recommendation card. Show status plus retry/support guidance only.
2. Else if profile data is thin or incomplete -> `complete_profile`
3. Else if no website exists -> `website_fix`
4. Else if business is approved and has enough profile data -> `lead_capture`
5. Optional fallback -> `listing_upgrade`

Do not add a database-backed scoring system in this pass.
Do not return `managed_growth` anywhere in Phase 1 automatic recommendation logic.

### Fixed input contract

Use one shared utility for `/claim/status` and `/owner/dashboard`.

Inputs should be explicit and stable:

- `business`
- `claimStatus`

Do not pass vague booleans like `isFurtherAlong`.

Implement this logic in a small utility file, not inline in multiple pages.

Suggested new file:

- `src/lib/recommendations.ts`

## Required Changes By Page

## 1. `/for-business`

File:

- [src/pages/ForBusinessPage.tsx](/workspaces/directory1/src/pages/ForBusinessPage.tsx)

### Intended live behavior

This page keeps claim as the dominant entry point.

### Required change

Make claim the dominant path.

### Requirements

- Keep one primary CTA above the fold:
  - `Claim Your Profile`
- Secondary CTA can exist, but must be visually weaker:
  - likely `See how we help after you claim`
- The four lanes can still exist lower on the page, but they should read as:
  - what comes next
  - optional business improvements
  - not equal front-door choices

### Acceptance

- A user can understand in under 5 seconds that the first action is to claim their listing.
- There is only one obvious first action above the fold.

## 2. `/claim-business`

File:

- [src/pages/ClaimBusinessPage.tsx](/workspaces/directory1/src/pages/ClaimBusinessPage.tsx)

### Intended live behavior

This page should behave like a trust page for claiming a listing, not a services hub.

### Required change

Make it a trust-building page for the claim flow only.

### Requirements

- Keep CTA focus on:
  - find my business
  - add my business
- Remove or reduce language that makes it feel like a generic business services page
- Keep benefits tied to profile ownership and listing control
- Do not use growth-page language on this route

Examples to avoid on this page:

- `Scale your enterprise`
- `Visibility upgrades`
- `Lead & inquiry alerts`
- `Direct response`

### Acceptance

- The page clearly answers:
  - why claim?
  - what happens next?
  - what do I get access to?

## 3. `/claim`

File:

- [src/pages/ClaimPage.tsx](/workspaces/directory1/src/pages/ClaimPage.tsx)

### Current state

The claim flow exists and is functional.

### Required change

Mostly leave logic alone unless copy or progression feels unclear.

### Allowed improvements

- clarify copy
- reduce friction
- make step labels more obvious
- keep preselected business flow intact

### Do not

- rewrite the whole claim flow
- change DB shape

## 4. `/claim/status`

File:

- [src/pages/ClaimStatusPage.tsx](/workspaces/directory1/src/pages/ClaimStatusPage.tsx)

### Problem today

It is mostly a claim list. It does not yet function as the bridge between claim and next recommendation.

### Required change

Turn this into the main post-claim bridge page.

### Requirements

For pending claims:

- clearly show status
- explain what happens next
- show 2-4 profile completion tasks
- show one recommended next step card
- keep this page read-only in Phase 1
- do not turn this page into an edit surface
- if the recommendation is `complete_profile`, keep the card visible but remove the primary CTA
- helper copy should be plain and direct:
  - `You'll be able to complete this after approval.`

For approved claims:

- show `Go to Dashboard`
- optionally show a softer next-step recommendation

For rejected claims:

- keep rejection reason visible
- show retry/support guidance only
- allow a retry-style CTA only
- do not show normal recommendation cards

### Profile tasks

Use fields already available or easily inferable:

- description present
- phone present
- website present
- service areas present
- hours present

These must be simple frontend checks against the existing business record only.
Do not add override-data dependencies for pending claims.
Do not add inline editing before approval.

### Recommendation card

Single card only.

Examples:

- `Your profile is still missing core business details`
- `You do not have a website listed`
- `If you miss calls while on jobs, lead capture is the next best fit`

### Acceptance

- A pending claimant sees a useful next step, not just a waiting screen.
- The page has one recommendation card max.
- Rejected claimants are not left at a dead end.

## 5. `/owner/dashboard`

File:

- [src/pages/OwnerDashboardPage.tsx](/workspaces/directory1/src/pages/OwnerDashboardPage.tsx)

### Problem today

It is mainly a listing-edit form. That is useful, but it is not yet framed as a control center with one next step.

### Required change

Keep the listing-edit capability, but structure the page more clearly:

- listing status
- profile completeness
- edit form
- one recommended next step

### Requirements

- Add a simple profile completeness block
- Add one recommendation card using the same recommendation logic as `/claim/status`
- Keep the listing edit form as the main practical tool
- Completeness should include hours as well as:
  - description
  - phone
  - website
  - service areas

### Do not add

- fake lead metrics
- fake inquiry summaries
- placeholder charts

### Acceptance

- A verified owner sees one recommended improvement
- The dashboard still feels operational, not like a fake SaaS app

## Event Instrumentation

This phase should prepare analytics, even if the actual provider is basic.

If no analytics utility exists, add one small helper:

- `src/lib/analytics.ts`

It can start as a thin wrapper around:

- `window.dataLayer?.push(...)`
- or a no-op fallback

### Track these events

- `for_business_viewed`
- `for_business_claim_cta_clicked`
- `claim_business_viewed`
- `claim_started`
- `claim_submitted`
- `claim_status_viewed`
- `claim_status_recommendation_viewed`
- `claim_status_recommendation_clicked`
- `owner_dashboard_viewed`
- `owner_dashboard_recommendation_viewed`
- `owner_dashboard_recommendation_clicked`

### Properties to attach where easy

- `user_id`
- `business_id`
- `claim_status`
- `recommendation_type`
- `source_path`

For `claim_status_recommendation_viewed`, attach at least:

- `claimId`
- `businessId`
- `claimStatus`
- `recommendationType`
- `hasPrimaryCta`
- `ctaTarget`

For `claim_status_recommendation_clicked`, attach the same route-level claim context where practical.

Do not block the whole task on analytics provider wiring. A wrapper is enough for now.

## Suggested File Additions

These are acceptable additions:

- `src/lib/recommendations.ts`
- `src/lib/analytics.ts`

Keep them small and specific.

## Suggested Recommendation Utility Shape

Use something simple like:

```ts
export type RecommendationType =
  | 'complete_profile'
  | 'website_fix'
  | 'lead_capture'
  | 'listing_upgrade'
  | 'retry_claim'
  | 'none';

export interface RecommendationResult {
  type: RecommendationType;
  title: string;
  description: string;
  href?: string;
  ctaLabel?: string;
}
```

Then export one function:

```ts
getOwnerRecommendation(...)
```

Do not overengineer this.

## Definition Of Done

This implementation is successful when:

1. `/for-business` has one clearly dominant claim CTA
2. `/claim-business` feels like a claim trust page, not a broad services page
3. `/claim/status` helps pending users with tasks + one recommendation
4. `/owner/dashboard` includes profile completeness + one recommendation
5. No page shows four equal business-owner CTAs above the fold
6. No fake analytics are added
7. Recommendation logic is rule-based and lives in one place
8. `npm run lint` passes
9. `npm run build` passes

## What To Avoid

Do not do these common failure modes:

- turning `/for-business` into another pricing grid
- adding multiple competing “book call” buttons above the fold
- adding dashboard cards with invented data
- scattering recommendation rules across multiple pages
- creating new routes because the existing pages feel inconvenient
- over-designing admin systems that do not exist yet

## Implementation Order

Do the work in this order:

1. Add recommendation utility
2. Update `/for-business`
3. Update `/claim-business`
4. Update `/claim/status`
5. Update `/owner/dashboard`
6. Add analytics wrapper + event calls
7. Run `npm run lint`
8. Run `npm run build`

## Notes For Reviewer

When reviewing the PR, check for:

- one primary CTA above the fold
- recommendation consistency between status and dashboard
- no fake metrics
- no extra routes added without approval
- no backend/schema drift unless clearly justified

## Short Summary

This is not a “build more pages” task.

This is a “make the current funnel behave like a guided workflow” task.

Claim is the wedge.
Recommendations come after intent.
One next step at a time.
