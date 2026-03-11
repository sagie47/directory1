import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { businesses, categories, categoryGroups, cities } from '../src/data';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'generated', 'supabase-seed');

async function writeJson(filename: string, data: unknown) {
  await writeFile(path.join(outputDir, filename), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const cityRows = cities.map((city) => ({
    id: city.id,
    name: city.name,
    description: city.description,
  }));

  const groupRows = categoryGroups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
  }));

  const categoryRows = categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    group_id: category.groupId,
  }));

  const businessRows = businesses.map((business) => ({
    id: business.id,
    name: business.name,
    city_id: business.cityId,
    category_id: business.categoryId,
    rating: business.rating ?? null,
    review_count: business.reviewCount ?? null,
    description: business.description ?? null,
    service_areas: business.serviceAreas ?? [],
    category_tags: business.categoryTags ?? [],
    specialties: business.specialties ?? [],
    photos: business.photos ?? [],
    reviews: business.reviews ?? [],
    hours: business.hours ?? {},
    coordinates: business.coordinates ?? null,
    contact: business.contact,
    source: business.source ?? {},
  }));

  await writeJson('cities.json', cityRows);
  await writeJson('category-groups.json', groupRows);
  await writeJson('categories.json', categoryRows);
  await writeJson('businesses.json', businessRows);

  console.log(`Wrote Supabase seed files to ${path.relative(repoRoot, outputDir)}.`);
  console.log(`Cities: ${cityRows.length}, Category groups: ${groupRows.length}, Categories: ${categoryRows.length}, Businesses: ${businessRows.length}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
