# Business Ops Implementation Board

## Use
Operational backlog derived from `BUSINESS_LOGIC_AUDIT_AND_OPS_PLAN.md`.

Status legend:
- `todo`
- `in_progress`
- `blocked`
- `done`

---

## Phase 1: Revenue-Safety Hardening

1. `todo` Claim notifier payload hardening
- Files: `supabase/functions/notify_claim_status/index.ts`
- Acceptance:
  - notifier loads claim from DB by claim ID.
  - destination email no longer trusted from request payload.

2. `todo` Claimant email source-of-truth
- Files: `supabase/schema.sql`, `src/pages/ClaimPage.tsx`
- Acceptance:
  - claimant email derived from authenticated user.
  - user-editable claimant email path removed.

3. `todo` Preserve claim history
- Files: `supabase/schema.sql`
- Acceptance:
  - rejected/revoked claims are not hard-deleted on resubmit.
  - audit trail remains queryable.

4. `todo` Add `demo_requests` schema
- Files: `supabase/schema.sql`
- Acceptance:
  - table + indexes + RLS policies exist.
  - `/book-demo` submit works in clean environment.

5. `todo` Add payment state fields to `call_requests`
- Files: `supabase/schema.sql`
- Acceptance:
  - `payment_status`, `stripe_session_id`, `scheduled_at`, `lead_status` available.

---

## Phase 2: Funnel Observability And Integrity

1. `todo` Implement event taxonomy in business lanes
- Files: `src/lib/analytics.ts`, `src/pages/ForBusinessPage.tsx`, offer pages
- Acceptance:
  - CTA events fire on all lane cards and main offer CTAs.

2. `todo` Instrument form lifecycle
- Files: `src/pages/BookDemoPage.tsx`, `src/pages/BookCallPage.tsx`, submit helpers
- Acceptance:
  - `form_viewed`, `form_started`, `form_submitted`, `form_submit_failed` tracked.

3. `todo` Stripe return truth from backend state
- Files: `src/pages/CallRequestedPage.tsx`, `src/pages/BookCallPage.tsx`, backend webhook handler location
- Acceptance:
  - no query-param-only paid confirmation.
  - UI paid state matches persisted DB state.

---

## Phase 3: Data Semantics And Listing Quality

1. `todo` Canonical service area model
- Files: schema + ingest + read path
- Acceptance:
  - canonical `service_area_city_ids` model in place.
  - human-readable areas mapped from canonical IDs.

2. `todo` Unify city eligibility logic
- Files: `src/pages/CityPage.tsx`, `src/pages/CategoryPage.tsx`, `src/pages/SearchPage.tsx`, `src/business.ts`
- Acceptance:
  - same city intent returns consistent inclusion behavior across surfaces.

3. `todo` Standardize production importer
- Files: `scripts/import-gmaps-supabase.ts`, `scripts/enrich-gmaps-scraper.ts`
- Acceptance:
  - one production write path.
  - old path flagged/deprecated for non-prod only.

---

## Phase 4: Ops Cadence

1. `todo` Weekly KPI dashboard definition
- Acceptance:
  - claim and funnel KPI queries documented and runnable.

2. `todo` Scrape cadence policy by city tier
- Acceptance:
  - run schedule documented and tied to freshness targets.

3. `todo` Listing deactivation policy
- Acceptance:
  - soft-deactivation lifecycle documented and implemented with quarantine.

---

## Blockers To Clear Before Paid Scale

1. Claim race/concurrency handling verified.
2. Notification delivery reliability verified.
3. Demo and call submission schemas verified in fresh deploy.
4. Payment-state persistence and reconciliation in place.
5. Based-city and service-area semantics stable across ingestion and UI.
