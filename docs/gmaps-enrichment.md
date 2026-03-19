# Google Maps Enrichment Pipeline

End-to-end workflow for scraping Google Maps data and importing it into Supabase without duplicates.

## Flow Overview

```text
export:gmaps -> docker scraper -> import:gmaps:supabase
  (queries)      (NDJSON output)     (upsert to Supabase)
```

## Step 1: Generate Scraper Queries

```bash
# All cities, all categories
npm run export:gmaps

# Single city
npm run export:gmaps -- --city kelowna

# Supplement mode: only fill categories with < 10 existing businesses
npm run export:gmaps -- --city kelowna --mode supplement --min-count 10
```

Output: `generated/gmaps-scraper/{city}-queries.txt`

## Step 2: Run `gosom/google-maps-scraper`

```bash
docker run --rm \
  -v "$(pwd)/generated/gmaps-scraper:/work" \
  gosom/google-maps-scraper \
  -input /work/kelowna-queries.txt \
  -results /work/kelowna-results.json \
  -json -lang en -c 1
```

## Step 3: Import into Supabase

```bash
# Dry run
npm run import:gmaps:supabase -- --input generated/gmaps-scraper/kelowna-results.json --dry-run

# Import all
npm run import:gmaps:supabase -- --input generated/gmaps-scraper/kelowna-results.json

# Only add new businesses
npm run import:gmaps:supabase -- --input generated/gmaps-scraper/kelowna-results.json --skip-existing

# Limit + custom batch
npm run import:gmaps:supabase -- --input generated/gmaps-scraper/kelowna-results.json --limit 100 --batch-size 100
```

## Duplicate Prevention

Matching priority:

1. `place:{place_id}` against `businesses.source.placeId`
2. `cid:{cid}` against `businesses.source.cid`
3. `fallback:{slug(name)}:{slug(address)}:{slug(city_id)}`

Additional safeguards:

1. Existing rows are prefetched once and indexed in memory (no per-row lookup queries).
2. Incoming scraped records are deduplicated first; for collisions, the richest record is selected.
3. New IDs are stable and collision-safe: `{cityId}-{categoryId}-{placeId|cid|slug}` with `-2`, `-3`, ... suffix if needed.

## Env Vars

Same as `sync:supabase`:

1. `SUPABASE_URL` (fallback: `VITE_SUPABASE_URL`)
2. `SUPABASE_SERVICE_ROLE_KEY` (fallbacks: `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_KEY`)

## Schema Mapping

`ScrapedPlace` fields are mapped to `businesses` columns:

1. `title` -> `name`
2. `review_rating` -> `rating`
3. `review_count` -> `review_count`
4. `description` -> `description`
5. `phone/web_site/address` -> `contact`
6. `latitude/longtitude` -> `coordinates`
7. `images[].image` -> `photos`
8. `user_reviews[]` -> `reviews`
9. `open_hours` -> `hours`
10. `about[].options[].enabled` -> `specialties`
11. `category/categories` -> `category_tags`
12. `cid/place_id/link` -> `source`
