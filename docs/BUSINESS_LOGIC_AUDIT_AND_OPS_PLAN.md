# Business Logic Audit And Ops Plan

## Context
This plan focuses on operationalizing the repository as a revenue system, not just a codebase.

Scope audited:
- Claim and ownership lifecycle.
- Business offer funnel and monetization plumbing.
- Directory data quality, ingestion, and freshness.

Inputs:
- Direct repo audit.
- 3 delegated sub-agent audits (claim lifecycle, funnel/monetization, data pipeline).

---

## Current State Snapshot

1. Core product lanes exist:
- Claim and owner dashboard.
- Offer lanes (`Never Miss a Lead`, `Websites`, `Managed Growth`).
- Intake forms for demo/call requests.

2. Revenue/ops critical logic is partially wired:
- Claim review RPC exists.
- Notification function exists and is invoked from admin UI.
- Call request table exists.

3. Business-system maturity is still early:
- No robust payment status lifecycle in DB.
- Inconsistent city/service-area semantics across ingestion and read paths.
- Analytics coverage is sparse for conversion diagnostics.

---

## Critical Business Logic Risks

## P0 (Immediate)

1. Claim notification target can be spoofed from payload.
- File: `/supabase/functions/notify_claim_status/index.ts`
- Impact: trust, compliance, and customer communication risk.

2. Claimant email is editable and persisted as provided.
- Files: `/src/pages/ClaimPage.tsx`, `/supabase/schema.sql`
- Impact: approval/rejection notifications may go to the wrong person.

3. Demo intake writes to `demo_requests`, but repo schema does not define `demo_requests`.
- Files: `/src/lib/submissions.ts`, `/supabase/schema.sql`
- Impact: form flow can fail after fresh environment setup.

4. Payment completion is not persisted/verified server-side.
- Files: `/src/pages/BookCallPage.tsx`, `/src/pages/CallRequestedPage.tsx`, `/supabase/schema.sql`
- Impact: paid funnel integrity is weak.

## P1 (Near-term)

1. Historical claims are deleted on resubmission.
- File: `/supabase/schema.sql`
- Impact: no audit trail for disputes and reviewer context.

2. City/search/service-area behavior is inconsistent by surface.
- Files: `/src/pages/CityPage.tsx`, `/src/pages/CategoryPage.tsx`, `/src/pages/SearchPage.tsx`, `/src/business.ts`
- Impact: user confusion and lower discovery conversion.

3. Ingestion paths apply different service-area logic.
- Files: `/scripts/import-gmaps-supabase.ts`, `/scripts/enrich-gmaps-scraper.ts`
- Impact: unstable business listing semantics.

---

## Target Operating Model

1. Claim lifecycle is event-driven and auditable.
2. Funnel stages are measurable end-to-end from page view to paid and booked.
3. Data model cleanly separates:
- `based_city_id`
- `service_area_city_ids`
4. Ingestion has one production write path.
5. City/category rollout is gated by data readiness and conversion metrics.

---

## Phased Execution Plan

## Phase 1: Revenue-Safety Hardening (Week 1-2)

Objective:
- Remove trust-breaking failures in claim and intake workflows.

Workstreams:
1. Claim integrity hardening.
- Force claimant email from authenticated user.
- Stop trusting payload email in notifier; re-read DB row by claim ID.
- Keep claim history (replace delete-on-resubmit with status transition).

2. Intake schema alignment.
- Add `demo_requests` table + RLS in `supabase/schema.sql`.
- Add migration-safe checks in submit helpers for clearer errors.

3. Payment lifecycle base fields.
- Extend `call_requests` with `payment_status`, `stripe_session_id`, `scheduled_at`, `lead_status`.

Exit criteria:
- Claim notifications cannot be redirected via payload manipulation.
- Demo submissions succeed in fresh environments created from repo schema.
- Call requests persist explicit payment state fields.

---

## Phase 2: Funnel Observability And Conversion Integrity (Week 2-4)

Objective:
- Make conversion leaks visible and replace UI-assumed states with server truth.

Workstreams:
1. Event taxonomy implementation.
- Add events: `offer_page_viewed`, `offer_cta_clicked`, `form_viewed`, `form_started`, `form_submitted`, `form_submit_failed`, `stripe_redirect_started`, `stripe_returned`, `call_booked`, `deal_won`.

2. Stripe return and webhook flow.
- Add success/cancel return URLs.
- Update `call_requests.payment_status` from webhook, not query params.

3. CTA instrumentation coverage.
- Instrument all business lane CTAs and offer-page CTA click points.

Exit criteria:
- Event completeness `>95%` from offer page view to form submit.
- Stripe-paid sessions reconcile to DB rows `>98%`.

---

## Phase 3: Data Semantics And Listing Quality (Week 3-6)

Objective:
- Make city and service-area behavior reliable for both UX and monetization.

Workstreams:
1. Canonical city model.
- Add canonical service area representation (`service_area_city_ids`).
- Preserve human-readable labels for display only.

2. Read-path consistency.
- Use one eligibility function for City, Category, Search surfaces.
- Apply based-city-first ranking, then serves-area matches.

3. Ingestion unification.
- Standardize production imports on `import-gmaps-supabase.ts`.
- Deprecate direct production writes from legacy enrich flow.

Exit criteria:
- Same city intent yields consistent results across City, Category, and Search.
- Service-area behavior matches documented pricing/ranking policy.

---

## Phase 4: Ops Cadence And Scale Controls (Week 6+)

Objective:
- Turn the system into a weekly operating rhythm with controlled rollout.

Workstreams:
1. Data freshness operations.
- Run schedule by city tier.
- Staleness and failed-run alerts.
- Soft-deactivation policy for businesses not re-seen after N cycles.

2. Sales and lifecycle operations.
- Weekly claim-to-paid funnel review.
- Owner activation playbooks after claim approval.

3. Pricing rollout controls.
- Use launch pricing windows as defined in `/docs/PRICING_STRATEGY.md`.
- Gate price increases on retention and conversion thresholds.

Exit criteria:
- Weekly dashboard reviews drive concrete pricing and funnel actions.
- No uncontrolled city/category expansion without readiness checks.

---

## Delegation Work Packets (Ready For Sub-Agents)

1. `WP-1 Claim Integrity`
- Ownership: `supabase/schema.sql`, `supabase/functions/notify_claim_status/index.ts`, `src/pages/ClaimPage.tsx`
- Deliver:
  - claimant email source-of-truth from auth.
  - safe notifier payload handling.
  - no delete-on-resubmit claim history loss.
- Verify:
  - unit/integration checks for claim transitions and notifier behavior.

2. `WP-2 Funnel Schema + Payment State`
- Ownership: `supabase/schema.sql`, `src/lib/submissions.ts`, `src/lib/submitCallRequest.ts`, `src/pages/BookCallPage.tsx`, `src/pages/CallRequestedPage.tsx`
- Deliver:
  - `demo_requests` schema.
  - call payment status persistence.
  - replace query-param “paid” assumptions with persisted state.
- Verify:
  - end-to-end submit and status transitions.

3. `WP-3 Analytics Coverage`
- Ownership: `src/lib/analytics.ts`, business offer and form pages.
- Deliver:
  - event taxonomy implementation.
  - CTA and form lifecycle tracking.
- Verify:
  - event fire matrix by page and funnel step.

4. `WP-4 City/Service-Area Consistency`
- Ownership: `src/business.ts`, `src/pages/CityPage.tsx`, `src/pages/CategoryPage.tsx`, `src/pages/SearchPage.tsx`, ingestion scripts.
- Deliver:
  - unified city eligibility function.
  - based-city vs serves-area ranking behavior.
  - ingestion alignment to canonical service area IDs.
- Verify:
  - deterministic fixture tests for city matching and routing.

---

## KPI Baseline To Start Tracking Now

1. Claim flow:
- claim starts
- claim approvals
- approval-to-owner-dashboard open rate
- approval-to-paid-upgrade rate

2. Offer funnel:
- offer page view to CTA click
- CTA click to form start
- form start to submit success
- submit to paid
- paid to booked call

3. Data quality:
- city mismatch rate
- duplicate merge error rate
- stale listing rate
- fallback-to-seed session rate

---

## Recommended Immediate Sequence (Next 7 Days)

1. Ship Phase 1 P0 fixes.
2. Add KPI events for CTA/form path.
3. Freeze risky sync paths until model consistency is in place.
4. Start first constrained outbound campaign only after claim and intake reliability checks pass.
