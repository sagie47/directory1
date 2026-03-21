# Weekly Operating Report Template (SAN-13)

Period:
- Start date: `YYYY-MM-DD`
- End date: `YYYY-MM-DD`
- Snapshot date: `YYYY-MM-DD`

Cadence:
- Report owner: `<name>`
- Weekly review slot: `<day> <time> <timezone>`

## 1. Executive Summary

- Overall funnel health: `ok | warn | critical | insufficient_data`
- Highest-risk segment (offer + city): `<offer> / <city>`
- Primary issue stage: `<View->CTA | CTA->Start | Start->Submit | Submit->Stripe>`
- Actionable segments this cycle: `<count>`

## 2. Segment Scorecard (Offer x City)

Source query:
- `scripts/analytics/funnel_kpi_alerts_ga4.sql`

| Offer | City | Overall | View->CTA | CTA->Start | Start->Submit | Submit->Stripe | Views (7d) | Runbook Hint |
|---|---|---|---|---|---|---|---:|---|
| | | | | | | | | |
| | | | | | | | | |
| | | | | | | | | |

## 3. Trend Snapshot (Last 14 Days)

Source query:
- `scripts/analytics/funnel_kpi_daily_ga4.sql`

| Offer | View->CTA (last7) | Delta vs prev7 | Start->Submit (last7) | Delta vs prev7 | Submit->Stripe (last7) | Delta vs prev7 |
|---|---:|---:|---:|---:|---:|---:|
| | | | | | | |
| | | | | | | |
| | | | | | | |

Unknown city share:
- Latest: `<xx.x%>`
- Delta vs prior week: `<+/-x.xpp>`

## 4. Threshold-Driven Action Rules

| Trigger | Threshold | Action | Default Owner | SLA |
|---|---|---|---|---|
| Critical stage status | `status = critical` | Open remediation ticket and triage in weekly review | Stage owner | 1 day |
| Persistent warn | `status = warn` in current and prior weekly cycle | Open remediation ticket with fix ETA | Stage owner | 3 days |
| Unknown city share (warn) | `>= 20%` | Open data-quality task | Data Quality Lead | 5 days |
| Unknown city share (critical) | `>= 30%` | Escalate and patch attribution gaps | Data Quality Lead | 2 days |

Stage owners:
- View->CTA: `<owner>`
- CTA->Start: `<owner>`
- Start->Submit: `<owner>`
- Submit->Stripe: `<owner>`

## 5. Action Items

| Priority | Trigger | Segment | Stage | Owner | Due Date | Action |
|---|---|---|---|---|---|---|
| P1/P2 |  |  |  |  |  |  |
| P1/P2 |  |  |  |  |  |  |
| P1/P2 |  |  |  |  |  |  |

## 6. Decision Log

- Keep / change thresholds this week:
- Offers/cities requiring launch gating:
- Escalations required:
