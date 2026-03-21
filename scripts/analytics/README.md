# Analytics SQL Assets

This folder contains canonical SAN-9 funnel KPI SQL for GA4 BigQuery exports.

Files:
- `funnel_kpi_daily_ga4.sql`: daily offer/city KPI rollup.
- `funnel_kpi_alerts_ga4.sql`: 7-day alert scorecard with threshold statuses.
- `generate-weekly-operating-report.ts`: SAN-13 markdown operating report generator.
- `weekly-operating-report.owners.example.json`: owner + cadence override template.
- `examples/weekly-operating-report-*.json`: runnable sample inputs for SAN-13 script.

Expected event taxonomy:
- `offer_page_viewed`
- `offer_cta_clicked`
- `form_started`
- `form_submitted`
- `stripe_redirect_started`

Usage notes:
1. Replace `YOUR_PROJECT.YOUR_DATASET.events_*` in both files.
2. Provide query parameters:
   - `@start_date` (`DATE`)
   - `@end_date` (`DATE`)
3. Runbook and report template:
   - `docs/FUNNEL_KPI_RUNBOOK.md`
   - `docs/FUNNEL_KPI_REPORT_TEMPLATE.md`
   - `docs/WEEKLY_OPERATING_REPORT_RUNBOOK.md`
   - `docs/WEEKLY_OPERATING_REPORT_TEMPLATE.md`
4. Generate SAN-13 report:
   - `npm run report:weekly-ops -- --alerts scripts/analytics/examples/weekly-operating-report-alerts-current.json --daily scripts/analytics/examples/weekly-operating-report-daily.json --previous-alerts scripts/analytics/examples/weekly-operating-report-alerts-previous.json --out generated/ops/weekly-operating-report-sample.md`
