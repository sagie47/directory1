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
- SSH target: `root@187.124.76.197`
- Docker is installed on the VPS
- VPS scraper workspace: `/root/gmaps-scraper`
- Files on VPS:
  - `/root/gmaps-scraper/vernon-queries.txt`
  - `/root/gmaps-scraper/vernon.log`
  - expected output: `/root/gmaps-scraper/vernon-results.json`
- A detached Vernon scraper job was started with:
  - `docker run --rm -v /root/gmaps-scraper:/work gosom/google-maps-scraper -input /work/vernon-queries.txt -results /work/vernon-results.json -json -lang en -c 1`

## Operational Notes
- Prefer city-by-city scraper jobs.
- Prefer separate jobs at `-c 1` instead of higher concurrency.
- Scraper output is NDJSON, not a JSON array.
- The GitHub repo clone on the VPS did not contain the real working tree; use this local workspace as source of truth.
- Root password was shared in chat and should be rotated.
