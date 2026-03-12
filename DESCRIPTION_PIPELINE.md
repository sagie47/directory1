# Business Description Pipeline

## Goal

Generate safer business descriptions at scale for the directory without requiring expensive per-record manual review.

## Constraints

- The dataset contains 3,625 businesses.
- Roughly 2,732 businesses currently include a website.
- Trade websites often have weak metadata, so the pipeline cannot rely on `<meta name="description">` alone.
- The existing frontend already reads `description` from each business record, so the enrichment path should produce inspectable output before any write-back into `src/data.ts`.

## Recommended Pipeline

### 1. Fetch and cache website HTML

- Fetch the homepage once per domain.
- Cache raw HTML under `generated/description-enrichment/html-cache/`.
- Reuse cached HTML unless `--refresh-cache` is passed.

### 2. Extract website signals

Pull compact factual signals from each homepage:

- `<title>`
- meta description and Open Graph description
- H1/H2/H3 text
- first paragraphs
- JSON-LD descriptions / service types / areas served

Store extracted signals under `generated/description-enrichment/signal-cache/`.

### 3. Generate heuristic descriptions

Build a description using only directory facts and extracted website signals:

- business name
- category
- city / service area
- source category
- category tags / specialties
- rating / review count

This gives full coverage with low hallucination risk and no model cost.

### 4. Optional LLM rewrite pass

If `OPENROUTER_API_KEY` is configured, send compact JSON batches through OpenRouter. If not, the script can fall back to Gemini when `GEMINI_API_KEY` is configured:

- batch size: 10-25 businesses
- default model: `stepfun/step-3.5-flash:free`
- purpose: rewrite for clarity only
- instruction: no invention, no new services, no new regions

This keeps model calls cheap and limits rate pressure.

### 5. Quality gating

Each generated description should include:

- `source`
- `confidence`
- `validationStatus`
- `validationIssues`
- evidence fields used to produce it

The generator now validates rewritten copy and automatically falls back to the heuristic description when the model output contains:

- marketing language
- phone numbers
- too many sentences
- excessive unverified terms

Low-confidence descriptions can stay generic until richer source data exists.

### 6. Chunking and resume

Large runs should not process everything in one request chain. The generator now supports:

- `--chunk-size` to process businesses in smaller groups
- `--checkpoint-file` to persist completed progress
- incremental writes to the output JSON after each chunk

This allows long runs to resume without restarting from zero.

## Rollout

1. Run small inspection batches into JSON output.
2. Tune validation rules until accepted/fallback rates look reasonable.
3. Run larger chunked batches with a checkpoint file.
4. Review quality by category.
5. Add a second script later to merge approved descriptions back into `src/data.ts` or the Supabase sync path.

## Test Command

```bash
tsx scripts/generate-business-descriptions.ts \
  --limit 5 \
  --chunk-size 2 \
  --concurrency 2 \
  --checkpoint-file generated/description-enrichment/test-batch.checkpoint.json \
  --output generated/description-enrichment/test-batch.json
```

## Notes

- The first script is intentionally non-destructive.
- Weak trade sites will still produce usable generic descriptions.
- The cost control comes from caching, batching, and only using Gemini as a rewrite step rather than as the primary source of truth.
