# Weekly Operating Report Runbook (SAN-13)

This runbook operationalizes the weekly funnel operating review using SAN-9 query outputs.

Inputs:
- `scripts/analytics/funnel_kpi_alerts_ga4.sql`
- `scripts/analytics/funnel_kpi_daily_ga4.sql`

Report generator:
- `scripts/analytics/generate-weekly-operating-report.ts`

## Owner And Cadence

- Report owner: `Revenue Operations Lead` (override via owner config JSON)
- Meeting cadence: weekly on `Monday 09:00 America/Vancouver`
- Inputs freeze: same-day report generation before meeting start

Owner override file:
- `scripts/analytics/weekly-operating-report.owners.example.json`

## Threshold-Driven Action Rules

1. Critical KPI breach:
- Trigger: any segment with `overall_status = critical`
- Action: open remediation ticket and triage in next ops review
- Owner: stage owner (`View->CTA`, `CTA->Start`, `Start->Submit`, `Submit->Stripe`)
- SLA: `1 day`

2. Persistent warn:
- Trigger: segment is `warn` this week and was `warn`/`critical` in prior weekly cycle
- Action: open remediation ticket with fix ETA
- Owner: stage owner
- SLA: `3 days`

3. Unknown city attribution risk:
- Warn trigger: latest unknown city share `>= 20%`
- Critical trigger: latest unknown city share `>= 30%`
- Action: data quality task (warn) or escalation (critical)
- Owner: `Data Quality Lead`
- SLA: `5 days` warn / `2 days` critical

## Weekly Process

1. Export SAN-9 query outputs for the snapshot date.
2. Generate SAN-13 operating report markdown.
3. Share report in weekly ops review.
4. Open tickets for all generated action items.
5. Track completion in next cycle.

## Runnable Commands

Example local run (using included sample JSON):

```bash
npm run report:weekly-ops -- --alerts scripts/analytics/examples/weekly-operating-report-alerts-current.json --daily scripts/analytics/examples/weekly-operating-report-daily.json --previous-alerts scripts/analytics/examples/weekly-operating-report-alerts-previous.json --out generated/ops/weekly-operating-report-sample.md
```

Example production flow with BigQuery JSON exports:

```bash
bq query --use_legacy_sql=false --parameter=start_date:DATE:2026-02-14 --parameter=end_date:DATE:2026-03-20 --format=prettyjson < scripts/analytics/funnel_kpi_alerts_ga4.sql > generated/analytics/alerts-2026-03-20.json
bq query --use_legacy_sql=false --parameter=start_date:DATE:2026-03-07 --parameter=end_date:DATE:2026-03-20 --format=prettyjson < scripts/analytics/funnel_kpi_daily_ga4.sql > generated/analytics/daily-2026-03-20.json
npm run report:weekly-ops -- --alerts generated/analytics/alerts-2026-03-20.json --daily generated/analytics/daily-2026-03-20.json --previous-alerts generated/analytics/alerts-2026-03-13.json --owner-config scripts/analytics/weekly-operating-report.owners.example.json --out generated/ops/weekly-operating-report-2026-03-20.md
```

## Output

The script writes a markdown report that includes:
- Executive summary and top-risk segment
- Segment scorecard table
- 14-day offer trends from SAN-9 daily rows
- Threshold-driven action items with owners and due dates
- Decision log placeholders for meeting notes
