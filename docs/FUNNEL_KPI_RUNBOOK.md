# Funnel KPI Runbook (SAN-9)

This runbook defines the canonical business-offer funnel KPI workflow using existing analytics events:

1. `offer_page_viewed`
2. `offer_cta_clicked`
3. `form_started`
4. `form_submitted`
5. `stripe_redirect_started`

Primary segmentation:
- `offer`
- `city`

Data source expectation:
- GA4 BigQuery export (`events_*`) populated from `window.dataLayer` events in `src/lib/analytics.ts`.

## Canonical Query Assets

- Daily KPI rollup:
  - `scripts/analytics/funnel_kpi_daily_ga4.sql`
- 7-day alert scorecard:
  - `scripts/analytics/funnel_kpi_alerts_ga4.sql`

Both queries use:
- `session`-level counting (`user_pseudo_id + ga_session_id`)
- `offer` from event params
- `city` from event params when present, then inferred across the same session/offer
- fallback city bucket: `unknown`

## Thresholds

Thresholds are encoded in `scripts/analytics/funnel_kpi_alerts_ga4.sql`:

| KPI | Warn | Critical | Notes |
|---|---:|---:|---|
| Offer view -> CTA | `< 0.18` | `< 0.12` | Top-of-funnel intent or CTA discoverability risk |
| CTA -> Form started | `< 0.45` | `< 0.30` | Routing, page relevance, or form-load risk |
| Form started -> Submitted | `< 0.55` | `< 0.40` | Form friction or submit reliability risk |
| Submitted -> Stripe redirect | `< 0.80` | `< 0.65` | Stripe handoff risk (only offers with Stripe) |

Minimum volume gate:
- `offer_view_sessions_7d >= 40` before alert status is actionable.

Stripe applicability:
- `never-miss-a-lead`: `not_applicable`
- `website`, `managed-growth`: required

## Operational Cadence

Weekly:
1. Run daily query for the last 14 days.
2. Run alert query for the last 35 days with `@end_date = current_date`.
3. Post scorecard in weekly ops review.
4. Open remediation tickets for every `critical`, and for `warn` that repeats 2+ weeks.

SAN-13 handoff:
- Generate the weekly operating report using `scripts/analytics/generate-weekly-operating-report.ts`.
- See `docs/WEEKLY_OPERATING_REPORT_RUNBOOK.md` for owner, cadence, and action-rule policy.

## Triage Playbook

If `offer_view_to_cta` drops:
1. Check traffic source mix and campaign changes.
2. Validate CTA visibility and scroll position on offer pages.
3. Compare by `source_page` and device in GA4 explore.

If `cta_to_form_start` drops:
1. Validate CTA links and query params (offer routing).
2. Confirm form page render timing and JS errors.
3. Check if sessions land on an unexpected page variant.

If `form_start_to_submit` drops:
1. Review field-level friction (especially required fields).
2. Review `form_submit_failed` and backend insert failures.
3. Check for browser-specific validation or autocomplete regressions.

If `submit_to_stripe_redirect` drops (Stripe offers):
1. Validate `VITE_STRIPE_*` URLs and environment drift.
2. Confirm no redirect blockers/ad-block issues were introduced.
3. Verify no branch logic bypasses `trackStripeRedirectStarted`.

## Known Caveats

1. Early funnel events usually do not include `city`; city is inferred from downstream events in the same session+offer.
2. Historical data collected before city payload enrichment will have higher `unknown` share.
3. Duplicate sessions across multiple offers are expected and intentionally counted per offer lane.
