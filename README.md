<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/e0668b24-38b3-4264-a2b3-c4e8136c3e3f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build Budgets

The build enforces performance budgets to prevent bundle bloat. Builds will fail if thresholds are exceeded.

### Thresholds

| Budget | Limit | Description |
|--------|-------|-------------|
| `maxChunkSizeKB` | 500 KB | Maximum size for any single JS chunk |
| `maxGzipSizeKB` | 250 KB | Maximum gzip size for any single JS chunk |
| `maxInitialLoadKB` | 800 KB | Maximum combined size for initial load (index + dependencies) |

### When a Build Fails Due to Budget Exceeded

1. The build output lists which chunks exceeded which budgets
2. Check the specific files mentioned in the error
3. Common remediation steps:
   - **Split large chunks**: Use dynamic `import()` for code that isn't needed on initial load
   - **Separate vendor code**: Use `manualChunks` in vite.config.ts to isolate large dependencies
   - **Tree-shake imports**: Ensure libraries are imported selectively (e.g., `import { Foo }` not `import * as Lib`)
   - **Move static data**: Offload large JSON/data files to separate chunks loaded on demand

### Manual Override (Not Recommended)

Set `SKIP_BUDGET_CHECK=true` environment variable to bypass checks during development:

```bash
SKIP_BUDGET_CHECK=true npm run build
```
