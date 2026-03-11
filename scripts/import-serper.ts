import 'dotenv/config';

import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {categories, cities} from '../src/data';
import {matchCityFromAddress} from '../src/cityMatching';

type City = (typeof cities)[number];
type Category = (typeof categories)[number];

type SerperPlace = {
  position?: number;
  title?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  website?: string;
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

type NormalizedBusiness = {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  categoryId: string;
  categoryName: string;
  searchQuery: string;
  contact: {
    phone?: string;
    website?: string;
    address?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  source: {
    provider: 'serper';
    cid?: string;
    placeId?: string;
    position?: number;
    category?: string;
    mapsUrl?: string;
  };
  rating?: number;
  reviewCount?: number;
  description: string;
  categoryTags?: string[];
  serviceAreas: string[];
  validation: {
    queryCityId: string;
    matchedBy: 'exact' | 'alias';
  };
};

type ExcludedPlace = {
  queryCityId: string;
  categoryId: string;
  searchQuery: string;
  name?: string;
  address?: string;
  reason: 'out_of_target_city';
};

type QueryError = {
  cityId: string;
  categoryId: string;
  query: string;
  error: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const generatedDir = path.join(repoRoot, 'generated');
const cacheDir = path.join(generatedDir, 'cache');

const queryOverrides: Record<string, string[]> = {
  'general-contractors': ['general contractors', 'custom home builders'],
  'carpenters-framing': ['framing contractors', 'carpenters'],
  'concrete-contractors': ['concrete contractors'],
  'masonry-brick-stone': ['masonry contractors', 'brick stone masonry'],
  roofing: ['roofing contractors', 'roofers'],
  'excavation-site-prep': ['excavation contractors', 'site preparation contractors'],
  demolition: ['demolition contractors'],
  electricians: [
    'electricians',
    'electrical contractors',
    'electric companies',
    'commercial electricians',
    'residential electricians',
    'licensed electricians',
    'electric services',
  ],
  plumbers: [
    'plumbers',
    'plumbing contractors',
    'plumbing companies',
    'commercial plumbers',
    'residential plumbers',
    'emergency plumbers',
    'plumbing services',
  ],
  'hvac-contractors': ['HVAC contractors', 'heating cooling contractors'],
  'septic-drainage': ['septic contractors', 'drainage contractors'],
  'irrigation-systems': ['irrigation contractors'],
  'drywall-specialists': ['drywall contractors'],
  painters: ['painting contractors', 'painters'],
  'flooring-installers': ['flooring installers', 'flooring contractors'],
  'tile-installers': ['tile installers', 'tile contractors'],
  'cabinet-makers-millwork': ['cabinet makers', 'millwork contractors'],
  'insulation-contractors': ['insulation contractors'],
  landscapers: [
    'landscapers',
    'landscape contractors',
    'landscaping companies',
    'landscape designers',
    'lawn care services',
    'hardscape contractors',
    'yard maintenance',
  ],
  'fencing-contractors': ['fencing contractors', 'fence builders'],
  'deck-builders': ['deck builders', 'deck contractors'],
  'siding-contractors': ['siding contractors'],
  'window-door-installers': ['window installers', 'door installers'],
  'paving-asphalt': ['paving contractors', 'asphalt contractors'],
  'welding-metal-fabrication': ['welders', 'metal fabrication shops'],
  'glass-glaziers': ['glaziers', 'glass contractors'],
  'garage-door-services': ['garage door services', 'garage door installers'],
  'junk-removal': ['junk removal'],
  restoration: ['restoration contractors', 'water fire mold restoration'],
  'handyman-services': ['handyman services'],
};

function parseArgs(argv: string[]) {
  const options = {
    city: '',
    category: '',
    categorySet: '',
    delayMs: 250,
    maxQueries: Number.POSITIVE_INFINITY,
    maxResults: 10,
    refresh: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--city' && next) {
      options.city = next;
      index += 1;
      continue;
    }

    if (arg === '--category' && next) {
      options.category = next;
      index += 1;
      continue;
    }

    if (arg === '--category-set' && next) {
      options.categorySet = next;
      index += 1;
      continue;
    }

    if (arg === '--delay-ms' && next) {
      options.delayMs = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--max-queries' && next) {
      options.maxQueries = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--max-results' && next) {
      options.maxResults = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--refresh') {
      options.refresh = true;
    }
  }

  return options;
}

const categorySets: Record<string, string[]> = {
  heavy: [
    'electricians',
    'plumbers',
    'hvac-contractors',
    'roofing',
    'general-contractors',
    'painters',
    'landscapers',
    'concrete-contractors',
  ],
};

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

function buildLocation(city: City) {
  return `${city.name}, British Columbia, Canada`;
}

function getQueryTerms(category: Category) {
  return queryOverrides[category.id] ?? [category.name];
}

function selectCities(allCities: City[], cityFilter: string) {
  if (!cityFilter) {
    return allCities;
  }

  return allCities.filter((city) => city.id === cityFilter);
}

function selectCategories(allCategories: Category[], categoryFilter: string) {
  if (!categoryFilter) {
    return allCategories;
  }

  return allCategories.filter((category) => category.id === categoryFilter);
}

function selectCategoriesBySet(allCategories: Category[], categorySet: string) {
  if (!categorySet) {
    return null;
  }

  const ids = categorySets[categorySet];
  if (!ids) {
    return [];
  }

  return allCategories.filter((category) => ids.includes(category.id));
}

function ensureCoordinatePair(place: SerperPlace) {
  if (typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
    return undefined;
  }

  return {
    lat: place.latitude,
    lng: place.longitude,
  };
}

async function readCachedResponse(cacheFile: string) {
  try {
    const content = await readFile(cacheFile, 'utf8');
    return JSON.parse(content) as SerperResponse;
  } catch {
    return null;
  }
}

async function fetchSerperPlaces(query: string, location: string, refresh: boolean, page = 1) {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error('SERPER_API_KEY is not set in the environment.');
  }

  const cacheKey = slugify(`places-${query}-${location}-page-${page}`);
  const cacheFile = path.join(cacheDir, `${cacheKey}.json`);

  if (!refresh) {
    const cached = await readCachedResponse(cacheFile);
    if (cached) {
      return cached;
    }
  }

  const url = new URL('https://google.serper.dev/places');
  url.searchParams.set('q', query);
  url.searchParams.set('location', location);
  url.searchParams.set('gl', 'ca');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('page', String(page));
  url.searchParams.set('apiKey', apiKey);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Serper request failed for "${query}" in "${location}" with status ${response.status}.`);
  }

  const json = (await response.json()) as SerperResponse;
  await writeFile(cacheFile, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  return json;
}

async function fetchSerperPlacesUpTo(
  query: string,
  location: string,
  refresh: boolean,
  maxResults: number,
) {
  const results: SerperPlace[] = [];
  const seen = new Set<string>();
  const maxPages = Math.max(1, Math.ceil(maxResults / 10));

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchSerperPlaces(query, location, refresh, page);
    const places = response.places ?? [];

    if (places.length === 0) {
      break;
    }

    let newItems = 0;

    for (const place of places) {
      const key = place.cid ?? slugify(`${place.title ?? ''}-${place.address ?? ''}`);
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      results.push(place);
      newItems += 1;

      if (results.length >= maxResults) {
        return results;
      }
    }

    if (places.length < 10 || newItems === 0) {
      break;
    }
  }

  return results;
}

function normalizeBusiness(
  place: SerperPlace,
  queryCity: City,
  category: Category,
  searchQuery: string,
): {business: NormalizedBusiness | null; excluded: ExcludedPlace | null} {
  const name = place.title?.trim();
  if (!name) {
    return {business: null, excluded: null};
  }

  const cityMatch = matchCityFromAddress(place.address?.trim());
  if (!cityMatch.matchedCityId) {
    return {
      business: null,
      excluded: {
        queryCityId: queryCity.id,
        categoryId: category.id,
        searchQuery,
        name,
        address: place.address?.trim(),
        reason: 'out_of_target_city',
      },
    };
  }

  const matchedCity = cities.find((city) => city.id === cityMatch.matchedCityId);
  if (!matchedCity) {
    return {business: null, excluded: null};
  }

  const matchedBy = cityMatch.matchedBy === 'unknown' ? 'exact' : cityMatch.matchedBy;

  return {
    business: {
      id: place.cid ? `${matchedCity.id}-${category.id}-${place.cid}` : slugify(`${matchedCity.id}-${category.id}-${name}`),
      name,
      cityId: matchedCity.id,
      cityName: matchedCity.name,
      categoryId: category.id,
      categoryName: category.name,
      searchQuery,
      contact: {
        phone: place.phoneNumber?.trim(),
        website: place.website?.trim(),
        address: place.address?.trim(),
      },
      coordinates: ensureCoordinatePair(place),
      source: {
        provider: 'serper',
        cid: place.cid,
        placeId: place.placeId,
        position: place.position,
        category: place.type,
        mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, place.address].filter(Boolean).join(', '))}`,
      },
      rating: place.rating,
      reviewCount: place.ratingCount,
      description:
        place.description?.trim() ||
        `${name} is listed in ${matchedCity.name} as ${place.type ?? category.name}. Contact them directly to confirm current availability and scope of work.`,
      categoryTags: place.types?.map((entry) => entry.trim()).filter(Boolean),
      serviceAreas: [matchedCity.name],
      validation: {
        queryCityId: queryCity.id,
        matchedBy,
      },
    },
    excluded: null,
  };
}

function dedupeBusinesses(businesses: NormalizedBusiness[]) {
  const byKey = new Map<string, NormalizedBusiness>();

  for (const business of businesses) {
    const fallbackKey = `${slugify(business.name)}::${slugify(business.contact.address ?? '')}`;
    const key = business.source.cid ? `cid:${business.source.cid}` : fallbackKey;

    if (!byKey.has(key)) {
      byKey.set(key, business);
      continue;
    }

    const current = byKey.get(key)!;
    const currentScore = Number(Boolean(current.contact.website)) + Number(Boolean(current.contact.phone));
    const nextScore = Number(Boolean(business.contact.website)) + Number(Boolean(business.contact.phone));

    if (nextScore > currentScore) {
      byKey.set(key, business);
    }
  }

  return [...byKey.values()];
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  const selectedCities = selectCities(cities, options.city);
  const selectedCategories = options.categorySet
    ? selectCategoriesBySet(categories, options.categorySet)
    : selectCategories(categories, options.category);

  if (selectedCities.length === 0) {
    throw new Error(`No city matched filter "${options.city}".`);
  }

  if (!selectedCategories || selectedCategories.length === 0) {
    throw new Error(
      options.categorySet
        ? `No category matched set "${options.categorySet}".`
        : `No category matched filter "${options.category}".`,
    );
  }

  await mkdir(cacheDir, {recursive: true});

  const normalizedBusinesses: NormalizedBusiness[] = [];
  const excludedPlaces: ExcludedPlace[] = [];
  const querySummaries: Array<{cityId: string; categoryId: string; query: string; count: number}> = [];
  const queryErrors: QueryError[] = [];

  let executedQueries = 0;

  for (const city of selectedCities) {
    for (const category of selectedCategories) {
      for (const term of getQueryTerms(category)) {
        if (executedQueries >= options.maxQueries) {
          break;
        }

        const location = buildLocation(city);
        const query = `${term} in ${city.name} BC`;
        let places: SerperPlace[] = [];

        try {
          places = await fetchSerperPlacesUpTo(query, location, options.refresh, options.maxResults);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          queryErrors.push({
            cityId: city.id,
            categoryId: category.id,
            query,
            error: message,
          });
          console.warn(`Skipping query "${query}": ${message}`);
          executedQueries += 1;

          if (executedQueries < options.maxQueries) {
            await sleep(options.delayMs);
          }

          continue;
        }

        querySummaries.push({
          cityId: city.id,
          categoryId: category.id,
          query,
          count: places.length,
        });

        for (const place of places) {
          const {business, excluded} = normalizeBusiness(place, city, category, query);
          if (business) {
            normalizedBusinesses.push(business);
          }
          if (excluded) {
            excludedPlaces.push(excluded);
          }
        }

        executedQueries += 1;

        if (executedQueries < options.maxQueries) {
          await sleep(options.delayMs);
        }
      }
    }
  }

  const dedupedBusinesses = dedupeBusinesses(normalizedBusinesses).sort((left, right) =>
    left.cityId.localeCompare(right.cityId) ||
    left.categoryId.localeCompare(right.categoryId) ||
    left.name.localeCompare(right.name),
  );

  const output = {
    generatedAt: new Date().toISOString(),
    totalBusinesses: dedupedBusinesses.length,
    totalQueries: querySummaries.length,
    filters: {
      city: options.city || null,
      category: options.category || null,
      categorySet: options.categorySet || null,
      maxQueries: Number.isFinite(options.maxQueries) ? options.maxQueries : null,
      maxResults: options.maxResults,
      refresh: options.refresh,
    },
    queries: querySummaries,
    queryErrors,
    excludedPlaces,
    businesses: dedupedBusinesses,
  };

  await writeFile(
    path.join(generatedDir, 'businesses.json'),
    `${JSON.stringify(output, null, 2)}\n`,
    'utf8',
  );

  console.log(`Wrote ${dedupedBusinesses.length} deduplicated businesses from ${querySummaries.length} queries.`);
  if (queryErrors.length > 0) {
    console.log(`Skipped ${queryErrors.length} failed queries.`);
  }
  console.log(`Excluded ${excludedPlaces.length} results that did not map to a target city.`);
  console.log(`Review output at ${path.relative(repoRoot, path.join(generatedDir, 'businesses.json'))}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
