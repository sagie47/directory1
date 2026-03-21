# Weekly Funnel KPI Report Template (SAN-9)

Period:
- Start date: `YYYY-MM-DD`
- End date: `YYYY-MM-DD`
- Snapshot date: `YYYY-MM-DD`

## 1. Executive Summary

- Overall funnel health: `ok | warn | critical`
- Highest-risk segment (offer + city): `<offer> / <city>`
- Primary issue stage: `<stage>`
- Owner for remediation: `<name>`

## 2. Segment Scorecard (Offer x City)

Source query:
- `scripts/analytics/funnel_kpi_alerts_ga4.sql`

Paste top priority rows:

| Offer | City | Overall | View->CTA | CTA->Start | Start->Submit | Submit->Stripe | Views (7d) | Runbook Hint |
|---|---|---|---|---|---|---|---:|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

## 3. Trend Snapshot (Last 14 Days)

Source query:
- `scripts/analytics/funnel_kpi_daily_ga4.sql`

Required charts:
1. `offer_view_to_cta_rate` by day, split by offer
2. `form_start_to_submit_rate` by day, split by offer
3. `submit_to_stripe_redirect_rate` by day for Stripe offers only
4. `unknown city share` by day

## 4. Alert Analysis

For each `critical` or persistent `warn`:

1. Segment: `<offer> / <city>`
2. Stage impacted: `<stage>`
3. First seen: `YYYY-MM-DD`
4. Suspected causes:
   - `<cause 1>`
   - `<cause 2>`
5. Evidence:
   - `<query/chart/log link>`
6. Mitigation owner + ETA:
   - `<owner>`, `<date>`

## 5. Action Items

| Priority | Action | Owner | Due Date | Status |
|---|---|---|---|---|
| P1 |  |  |  |  |
| P2 |  |  |  |  |
| P2 |  |  |  |  |

## 6. Decision Log

- Keep / change thresholds this week: `<decision>`
- Offers/cities requiring launch gating: `<list>`
- Escalations required: `<yes/no + notes>`
