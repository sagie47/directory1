import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';

import { businesses, categories, categoryGroups, cities } from '../src/data';

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase.from(table).upsert(rows, { onConflict: 'id' });
  if (error) {
    throw new Error(`${table}: ${error.message}`);
  }
}

async function main() {
  await upsert('cities', cities.map((city) => ({
    id: city.id,
    name: city.name,
    description: city.description,
  })));

  await upsert('category_groups', categoryGroups.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
  })));

  await upsert('categories', categories.map((category) => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    group_id: category.groupId,
  })));

  await upsert('businesses', businesses.map((business) => ({
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
  })));

  console.log(
    `Synced ${cities.length} cities, ${categoryGroups.length} category groups, ${categories.length} categories, and ${businesses.length} businesses to Supabase.`,
  );
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
