# Agent Handoff

## Repo
- Working repo: `/workspaces/directory1`
- Live business data: [src/data.ts](/workspaces/directory1/src/data.ts)

## Current Data Pipeline
- Legacy discovery/import path:
  - [scripts/import-serper.ts](/workspaces/directory1/scripts/import-serper.ts)
  - [scripts/merge-generated.ts](/workspaces/directory1/scripts/merge-generated.ts)
- Preferred enrichment path now:
  - [scripts/export-gmaps-scraper-input.ts](/workspaces/directory1/scripts/export-gmaps-scraper-input.ts)
  - [scripts/enrich-gmaps-scraper.ts](/workspaces/directory1/scripts/enrich-gmaps-scraper.ts)

## NPM Scripts
- `npm run export:gmaps`
- `npm run enrich:gmaps`
- `npm run import:serper`
- `npm run merge:generated`
- `npm run lint`
- `npm run build`

## Scraper Workflow
1. Generate query file:
   - `node --import tsx/esm scripts/export-gmaps-scraper-input.ts --city vernon`
2. Run scraper:
   - `docker run --rm -v "$PWD/generated/gmaps-scraper:/work" gosom/google-maps-scraper -input /work/vernon-queries.txt -results /work/vernon-results.json -json -lang en -c 1`
3. Merge NDJSON results:
   - `node --import tsx/esm scripts/enrich-gmaps-scraper.ts --input generated/gmaps-scraper/vernon-results.json`

## What `enrich-gmaps-scraper` Updates
- `source.placeId`
- `source.category`
- `hours`
- `photos`
- `reviews`
- `specialties`
- `categoryTags`
- `contact.phone`
- `contact.website`
- `contact.address`
- `coordinates`
- `rating`
- `reviewCount`
- Replaces only generic descriptions when better data exists

## Known Results
- Real test output exists:
  - [generated/gmaps-scraper/test-results.json](/workspaces/directory1/generated/gmaps-scraper/test-results.json)
  - [generated/gmaps-scraper/vernon-enrich-test.json](/workspaces/directory1/generated/gmaps-scraper/vernon-enrich-test.json)
- Partial Vernon scraper merges already updated live records.
- Current live total after recent Serper fills: `1452` businesses in [src/data.ts](/workspaces/directory1/src/data.ts)

## VPS
- SSH target: See internal ops runbook
- Docker is installed on the VPS
- VPS scraper workspace: See internal ops runbook
- Files on VPS: See internal ops runbook
- Operational details: See internal ops runbook

## Operational Notes
- See internal ops runbook for privileged access details
- Credentials were rotated; refer to internal security log.
