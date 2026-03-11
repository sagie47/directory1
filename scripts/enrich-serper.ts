import 'dotenv/config';

import {mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {businesses, categories, cities} from '../src/data';

type Business = (typeof businesses)[number] & {
  source?: {
    provider?: string;
    cid?: string;
    placeId?: string;
    category?: string;
    [key: string]: unknown;
  };
  categoryTags?: string[];
  [key: string]: unknown;
};

type City = (typeof cities)[number];
type Category = (typeof categories)[number];

type SerperPlace = {
  title?: string;
  address?: string;
  cid?: string;
  placeId?: string;
  rating?: number;
  ratingCount?: number;
  type?: string;
  types?: string[];
  description?: string;
};

type SerperResponse = {
  places?: SerperPlace[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const mapsCacheDir = path.join(repoRoot, 'generated', 'maps-cache');
const dataFile = path.join(repoRoot, 'src', 'data.ts');

const queryOverrides: Record<string, string[]> = {
  'general-contractors': ['general contractors', 'custom home builders'],
  'concrete-contractors': ['concrete contractors'],
  roofing: ['roofing contractors', 'roofers'],
  electricians: ['electricians'],
  plumbers: ['plumbers'],
  'hvac-contractors': ['HVAC contractors', 'heating cooling contractors'],
  painters: ['painting contractors', 'painters'],
  landscapers: ['landscapers', 'landscape contractors'],
};

function parseArgs(argv: string[]) {
  const options = {
    refresh: false,
    delayMs: 150,
    limitQueries: Number.POSITIVE_INFINITY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--refresh') {
      options.refresh = true;
      continue;
    }

    if (arg === '--delay-ms' && next) {
      options.delayMs = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--limit-queries' && next) {
      options.limitQueries = Number(next);
      index += 1;
    }
  }

  return options;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getLookupKey(name?: string, address?: string) {
  return `${slugify(name ?? '')}::${slugify(address ?? '')}`;
}

function toTitleTag(value: string) {
  return value
    .toLowerCase()
    .replace(/[|/(),]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCategoryTags(placeCategory: string | undefined, categoryName: string | undefined, placeTypes?: string[]) {
  const tags = new Set<string>();

  for (const type of placeTypes ?? []) {
    const normalized = toTitleTag(type);
    if (normalized) {
      tags.add(normalized);
    }
  }

  for (const value of [placeCategory, categoryName]) {
    const normalized = toTitleTag(value ?? '');
    if (!normalized) {
      continue;
    }

    tags.add(normalized);

    for (const part of normalized.split(' ')) {
      if (part.length >= 4 && !['services', 'service'].includes(part)) {
        tags.add(part);
      }
    }
  }

  return [...tags].slice(0, 8);
}

function extractStreetAddress(address: string | undefined) {
  if (!address) {
    return '';
  }

  return address.split(',').slice(0, 2).join(',').trim();
}

function buildDescription(business: Business, cityName: string, sourceCategory: string, categoryName?: string) {
  const streetAddress = extractStreetAddress(business.contact?.address);
  const ratingText =
    typeof business.rating === 'number' && typeof business.reviewCount === 'number'
      ? ` It currently shows a ${business.rating.toFixed(1)} rating across ${business.reviewCount} Google reviews.`
      : '';
  const locationText = streetAddress ? ` Based at ${streetAddress},` : '';
  const secondaryCategory = categoryName && categoryName.toLowerCase() !== sourceCategory.toLowerCase() ? ` and is grouped under ${categoryName.toLowerCase()}` : '';

  return `${business.name} is a ${sourceCategory.toLowerCase()} serving ${cityName}.${locationText} this listing is categorized as ${sourceCategory.toLowerCase()}${secondaryCategory}.${ratingText}`.replace(
    /\s+/g,
    ' ',
  );
}

function formatValue(value: unknown, indent = 0): string {
  const spacing = '  '.repeat(indent);
  const nextSpacing = '  '.repeat(indent + 1);

  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }

    const items = value.map((item) => `${nextSpacing}${formatValue(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${spacing}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined);
    if (entries.length === 0) {
      return '{}';
    }

    const lines = entries.map(([key, entryValue]) => {
      const safeKey = /^[$A-Z_a-z][$\w]*$/.test(key) ? key : JSON.stringify(key);
      return `${nextSpacing}${safeKey}: ${formatValue(entryValue, indent + 1)}`;
    });

    return `{\n${lines.join(',\n')}\n${spacing}}`;
  }

  return 'undefined';
}

function getQueryTerms(category: Category) {
  return queryOverrides[category.id] ?? [category.name];
}

function getBusinessPairs() {
  const pairs = new Map<string, {city: City; category: Category; records: Business[]}>();

  for (const business of businesses) {
    if (business.source?.provider !== 'serper') {
      continue;
    }

    const city = cities.find((entry) => entry.id === business.cityId);
    const category = categories.find((entry) => entry.id === business.categoryId);
    if (!city || !category) {
      continue;
    }

    const key = `${city.id}::${category.id}`;
    const existing = pairs.get(key);
    if (existing) {
      existing.records.push(business as Business);
      continue;
    }

    pairs.set(key, {city, category, records: [business as Business]});
  }

  return [...pairs.values()];
}

async function readJsonFile<T>(filename: string) {
  try {
    const content = await readFile(filename, 'utf8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

async function fetchMapsByQuery(query: string, location: string, refresh: boolean) {
  const cacheFile = path.join(mapsCacheDir, `${slugify(`${query}-${location}`)}.json`);

  if (!refresh) {
    const cached = await readJsonFile<SerperResponse>(cacheFile);
    if (cached) {
      return cached;
    }
  }

  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY is not set in the environment.');
  }

  const url = new URL('https://google.serper.dev/maps');
  url.searchParams.set('q', query);
  url.searchParams.set('location', location);
  url.searchParams.set('gl', 'ca');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('apiKey', apiKey);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Serper maps request failed for "${query}" with status ${response.status}.`);
  }

  const json = (await response.json()) as SerperResponse;
  await writeFile(cacheFile, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  return json;
}

function buildPlacesIndex(responses: SerperResponse[]) {
  const byCid = new Map<string, SerperPlace>();
  const byNameAddress = new Map<string, SerperPlace>();

  for (const response of responses) {
    for (const place of response.places ?? []) {
      if (place.cid) {
        byCid.set(place.cid, place);
      }

      byNameAddress.set(getLookupKey(place.title, place.address), place);
    }
  }

  return {byCid, byNameAddress};
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(mapsCacheDir, {recursive: true});

  const pairs = getBusinessPairs();
  const queryResponses = new Map<string, SerperResponse[]>();
  let executedQueries = 0;

  for (const pair of pairs) {
    if (executedQueries >= options.limitQueries) {
      break;
    }

    const location = `${pair.city.name}, British Columbia, Canada`;
    const responses: SerperResponse[] = [];

    for (const term of getQueryTerms(pair.category)) {
      if (executedQueries >= options.limitQueries) {
        break;
      }

      const query = `${term} in ${pair.city.name} BC Canada`;
      const response = await fetchMapsByQuery(query, location, options.refresh);
      responses.push(response);
      executedQueries += 1;
      await sleep(options.delayMs);
    }

    queryResponses.set(`${pair.city.id}::${pair.category.id}`, responses);
  }

  let enrichedCount = 0;

  const nextBusinesses = businesses.map((business) => {
    if (business.source?.provider !== 'serper') {
      return business;
    }

    const city = cities.find((entry) => entry.id === business.cityId);
    const category = categories.find((entry) => entry.id === business.categoryId);
    if (!city || !category) {
      return business;
    }

    const responses = queryResponses.get(`${city.id}::${category.id}`) ?? [];
    const {byCid, byNameAddress} = buildPlacesIndex(responses);
    const matchedPlace =
      (business.source?.cid ? byCid.get(business.source.cid) : undefined) ??
      byNameAddress.get(getLookupKey(business.name, business.contact?.address));

    const sourceCategory = matchedPlace?.type ?? business.source?.category ?? category.name;
    const categoryTags = buildCategoryTags(sourceCategory, category.name, matchedPlace?.types);
    const description =
      matchedPlace?.description?.trim() ||
      buildDescription(business as Business, city.name, sourceCategory, category.name);

    enrichedCount += 1;

    return {
      ...business,
      source: {
        ...business.source,
        placeId: matchedPlace?.placeId ?? (business.source as {placeId?: string} | undefined)?.placeId,
        category: sourceCategory,
      },
      categoryTags,
      description,
    };
  });

  const serializedBusinesses = `export const businesses = ${formatValue(nextBusinesses, 0)};\n`;
  const currentData = await readFile(dataFile, 'utf8');
  const businessesPattern = /export const businesses = \[[\s\S]*?\n\];\n?$/;

  if (!businessesPattern.test(currentData)) {
    throw new Error('Unable to locate businesses export in src/data.ts.');
  }

  const updatedData = currentData.replace(businessesPattern, serializedBusinesses);
  if (updatedData !== currentData) {
    await writeFile(dataFile, updatedData, 'utf8');
  }

  console.log(`Enriched ${enrichedCount} Serper listings with query-based Maps descriptions and tags.`);
  console.log(`Fetched ${executedQueries} city/service Maps queries.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
