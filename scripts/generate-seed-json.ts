import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { businesses, categories, categoryGroups, cities } from '../src/data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outputPath = path.join(repoRoot, 'public', 'seed-data.json');

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    JSON.stringify({
      cities,
      categoryGroups,
      categories,
      businesses,
    }),
    'utf8',
  );
  console.log(`[generate:seed-json] wrote ${outputPath}`);
}

main().catch((error) => {
  console.error('[generate:seed-json] failed:', error);
  process.exitCode = 1;
});
