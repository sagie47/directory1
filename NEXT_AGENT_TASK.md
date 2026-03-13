# Next Agent Task

Read [AGENT_HANDOFF.md](/workspaces/directory1/AGENT_HANDOFF.md) first.

## Immediate Tasks

1. Merge Vernon VPS scraper results into the live repo data.
2. Start Kelowna as the next VPS scraper job.
3. Continue scraper-first, city-by-city enrichment at low concurrency.

## Vernon Status

- VPS: See internal ops runbook
- Vernon files on VPS: See internal ops runbook
- The scraper process is no longer running.
- The Vernon results file is usable and had about `510` NDJSON rows when last checked.
- The Vernon log showed successful jobs and `0` failures in the tail checked, but no explicit final "all jobs finished" marker.

## Vernon Merge

Use the Vernon results file as a usable partial/completed dataset and merge it into [src/data.ts](/workspaces/directory1/src/data.ts).

Command:

```bash
node --import tsx/esm scripts/enrich-gmaps-scraper.ts --input generated/gmaps-scraper/vernon-results.json
```

Then validate:

```bash
npm run lint
npm run build
```

## Kelowna Next

Generate or use the Kelowna query file:

```bash
node --import tsx/esm scripts/export-gmaps-scraper-input.ts --city kelowna
```

Put the query file onto the VPS at: See internal ops runbook

Start the scraper on the VPS with low concurrency: See internal ops runbook

Prefer detached execution with `nohup` or similar.

## Operating Rules

- Prefer `google-maps-scraper` over Serper going forward.
- Keep jobs city-by-city.
- Use `-c 1` to reduce throttling risk.
- Treat scraper output as NDJSON, not a JSON array.
- After each meaningful merge, run `npm run lint` and `npm run build`.

## Important Note

- Credentials were rotated; refer to internal security log.
