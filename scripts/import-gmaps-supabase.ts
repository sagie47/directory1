import 'dotenv/config';

import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {createClient, type SupabaseClient} from '@supabase/supabase-js';

import {categories, cities} from '../src/data';
import {matchCityFromAddress} from '../src/cityMatching';

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

type ScrapedReview = {
  Name?: string;
  Rating?: number;
  Description?: string;
};

type ScrapedAboutSection = {
  name?: string;
  options?: Array<{
    name?: string;
    enabled?: boolean;
  }>;
};

type ScrapedImage = {
  image?: string;
};

type ScrapedPlace = {
  cid?: string;
  place_id?: string;
  title?: string;
  category?: string;
  categories?: string[];
  address?: string;
  web_site?: string;
  phone?: string;
  review_count?: number;
  review_rating?: number;
  latitude?: number;
  longtitude?: number;
  open_hours?: Record<string, string[]>;
  images?: ScrapedImage[];
  user_reviews?: ScrapedReview[];
  about?: ScrapedAboutSection[] | null;
  description?: string;
  link?: string;
  complete_address?: {
    city?: string;
    state?: string;
    country?: string;
    street?: string;
    postal_code?: string;
  };
};

type ExistingBusinessRow = {
  id: string;
  name: string;
  city_id: string;
  category_id: string;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  service_areas: string[];
  category_tags: string[];
  specialties: string[];
  photos: string[];
  reviews: unknown[];
  hours: Record<string, unknown>;
  coordinates: {lat: number; lng: number} | null;
  contact: {phone?: string; website?: string; address?: string; [key: string]: unknown};
  source: {placeId?: string; cid?: string; [key: string]: unknown};
};

type NormalizedBusiness = {
  id: string;
  name: string;
  city_id: string;
  category_id: string;
  rating: number | null;
  review_count: number | null;
  description: string | null;
  service_areas: string[];
  category_tags: string[];
  specialties: string[];
  photos: string[];
  reviews: unknown[];
  hours: Record<string, unknown>;
  coordinates: {lat: number; lng: number} | null;
  contact: Record<string, unknown>;
  source: Record<string, unknown>;
};

type Counters = {
  total: number;
  deduped: number;
  staged: number;
  normalized: number;
  skipped: number;
  matched: number;
  updated: number;
  created: number;
  errors: number;
};

type ImportOptions = {
  input: string;
  dryRun: boolean;
  skipExisting: boolean;
  batchSize: number;
  limit: number;
  cityId: string | null;
  queriesFile: string | null;
  forceRun: boolean;
  disableRunTracking: boolean;
  scraperVersion: string;
};

type RunContext = {
  runId: string;
  queryHash: string;
  queryCount: number;
};

type RunCreationResult = RunContext | null | {skipImport: true; existingRunId: string};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const PAGE_SIZE = 1000;

function parseArgs(argv: string[]) {
  const options: ImportOptions = {
    input: '',
    dryRun: false,
    skipExisting: false,
    batchSize: 50,
    limit: Number.POSITIVE_INFINITY,
    cityId: null,
    queriesFile: null,
    forceRun: false,
    disableRunTracking: false,
    scraperVersion: 'gosom/google-maps-scraper',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--input' && next) {
      options.input = path.resolve(repoRoot, next);
      index += 1;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--skip-existing') {
      options.skipExisting = true;
      continue;
    }

    if (arg === '--batch-size' && next) {
      options.batchSize = Math.max(1, Number(next));
      index += 1;
      continue;
    }

    if (arg === '--limit' && next) {
      options.limit = Math.max(1, Number(next));
      index += 1;
      continue;
    }

    if (arg === '--city' && next) {
      options.cityId = next.trim() || null;
      index += 1;
      continue;
    }

    if (arg === '--queries-file' && next) {
      options.queriesFile = path.resolve(repoRoot, next);
      index += 1;
      continue;
    }

    if (arg === '--force-run') {
      options.forceRun = true;
      continue;
    }

    if (arg === '--disable-run-tracking') {
      options.disableRunTracking = true;
      continue;
    }

    if (arg === '--scraper-version' && next) {
      options.scraperVersion = next.trim() || options.scraperVersion;
      index += 1;
    }
  }

  if (!options.input) {
    throw new Error('Missing required --input flag.');
  }

  return options;
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function countNonEmptyLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .length;
}

function isMissingTableError(error: {code?: string; message?: string} | null | undefined) {
  if (!error) {
    return false;
  }

  return error.code === '42P01'
    || error.code === 'PGRST205'
    || error.message?.includes("Could not find the table 'public.gmaps_scrape_runs'") === true
    || error.message?.includes("Could not find the table 'public.gmaps_raw_places'") === true;
}

async function readQueryFile(queryFile: string | null) {
  if (!queryFile) {
    return {queryFile: null, queryCount: 0, queryHashSource: ''};
  }

  const content = await readFile(queryFile, 'utf8');
  return {
    queryFile,
    queryCount: countNonEmptyLines(content),
    queryHashSource: content,
  };
}

async function createRunContext(options: ImportOptions, inputRaw: string): Promise<RunCreationResult> {
  if (options.disableRunTracking || options.dryRun) {
    return null;
  }

  const queryData = await readQueryFile(options.queriesFile);
  const queryHash = sha256(
    queryData.queryHashSource.length > 0
      ? queryData.queryHashSource
      : `${path.basename(options.input)}::${inputRaw}`,
  );

  const existingRunQuery = supabase
    .from('gmaps_scrape_runs')
    .select('id, status, created_at')
    .eq('query_hash', queryHash)
    .order('created_at', {ascending: false})
    .limit(1);

  const existingRunResult = options.cityId
    ? await existingRunQuery.eq('city_id', options.cityId).maybeSingle()
    : await existingRunQuery.is('city_id', null).maybeSingle();

  if (existingRunResult.error) {
    if (isMissingTableError(existingRunResult.error)) {
      console.warn('[import:gmaps] run tracking tables are missing. Continuing without run tracking.');
      return null;
    }
    throw new Error(`Failed to check existing gmaps run: ${existingRunResult.error.message}`);
  }

  if (existingRunResult.data && !options.forceRun && ['running', 'staged', 'imported'].includes(existingRunResult.data.status)) {
    console.log(
      `[import:gmaps] Skipping run. query_hash ${queryHash} already processed in run ${existingRunResult.data.id} (${existingRunResult.data.status}). Use --force-run to override.`,
    );
    return {skipImport: true, existingRunId: existingRunResult.data.id} as const;
  }

  const insertPayload = {
    city_id: options.cityId,
    query_hash: queryHash,
    query_file: queryData.queryFile ? path.relative(repoRoot, queryData.queryFile) : null,
    result_file: path.relative(repoRoot, options.input),
    scraper_version: options.scraperVersion,
    status: 'running',
    query_count: queryData.queryCount,
    started_at: new Date().toISOString(),
  };

  const runInsert = await supabase
    .from('gmaps_scrape_runs')
    .insert(insertPayload)
    .select('id')
    .single();

  if (runInsert.error) {
    if (isMissingTableError(runInsert.error)) {
      console.warn('[import:gmaps] run tracking tables are missing. Continuing without run tracking.');
      return null;
    }
    throw new Error(`Failed to create gmaps run: ${runInsert.error.message}`);
  }

  return {
    runId: runInsert.data.id,
    queryHash,
    queryCount: queryData.queryCount,
  } satisfies RunContext;
}

async function stageRawPlaces(runContext: RunContext, sourceFile: string, dedupedPlaces: Array<{dedupeKey: string; place: ScrapedPlace}>) {
  if (dedupedPlaces.length === 0) {
    return {stagedCount: 0, stagingDisabled: false};
  }

  const payload = dedupedPlaces.map(({dedupeKey, place}) => ({
    run_id: runContext.runId,
    dedupe_key: dedupeKey,
    query_hash: runContext.queryHash,
    source_file: sourceFile,
    place_id: place.place_id ?? null,
    cid: place.cid ?? null,
    city_id: inferCityId(place),
    inferred_category_id: inferCategoryId(place),
    title: place.title ?? null,
    address: buildAddress(place) ?? null,
    web_site: place.web_site ?? null,
    phone: place.phone ?? null,
    review_count: place.review_count ?? null,
    review_rating: place.review_rating ?? null,
    latitude: place.latitude ?? null,
    longitude: place.longtitude ?? null,
    payload: place,
  }));

  const batchSize = 500;
  let stagedCount = 0;

  for (let offset = 0; offset < payload.length; offset += batchSize) {
    const batch = payload.slice(offset, offset + batchSize);
    const result = await supabase
      .from('gmaps_raw_places')
      .upsert(batch, {onConflict: 'run_id,dedupe_key', ignoreDuplicates: false});

    if (result.error) {
      if (isMissingTableError(result.error)) {
        console.warn('[import:gmaps] gmaps_raw_places is missing. Continuing without staging raw places.');
        return {stagedCount: 0, stagingDisabled: true};
      }
      throw new Error(`Failed to stage raw places: ${result.error.message}`);
    }

    stagedCount += batch.length;
  }

  return {stagedCount, stagingDisabled: false};
}

async function updateRun(runId: string, payload: Record<string, unknown>) {
  const result = await supabase
    .from('gmaps_scrape_runs')
    .update(payload)
    .eq('id', runId);

  if (result.error && !isMissingTableError(result.error)) {
    throw new Error(`Failed to update gmaps run ${runId}: ${result.error.message}`);
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function getFallbackKey(name?: string, address?: string, cityId?: string) {
  return `fallback:${slugify(name ?? '')}:${slugify(address ?? '')}:${slugify(cityId ?? '')}`;
}

function getPlaceKey(place: ScrapedPlace) {
  if (place.place_id) {
    return `place:${place.place_id}`;
  }

  if (place.cid) {
    return `cid:${place.cid}`;
  }

  return null;
}

function getExistingFallbackKey(row: ExistingBusinessRow) {
  return getFallbackKey(row.name, row.contact?.address, row.city_id);
}

function getPlaceFallbackKey(place: ScrapedPlace, cityId: string | null) {
  return getFallbackKey(place.title, buildAddress(place), cityId ?? '');
}

function toTag(value: string) {
  return value
    .toLowerCase()
    .replace(/[|/(),]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAddress(place: ScrapedPlace) {
  if (place.address?.trim()) {
    return place.address.trim();
  }

  if (place.complete_address) {
    const address = [
      place.complete_address.street,
      place.complete_address.city,
      place.complete_address.state,
      place.complete_address.postal_code,
      place.complete_address.country === 'CA' ? 'Canada' : place.complete_address.country,
    ]
      .filter(Boolean)
      .join(', ')
      .trim();

    return address || undefined;
  }

  return undefined;
}

function buildCategoryTags(place: ScrapedPlace, existingCategoryName?: string) {
  const tags = new Set<string>();

  for (const category of place.categories ?? []) {
    const normalized = toTag(category);
    if (normalized) {
      tags.add(normalized);
    }
  }

  for (const value of [place.category, existingCategoryName]) {
    const normalized = toTag(typeof value === 'string' ? value : '');
    if (normalized) {
      tags.add(normalized);
    }
  }

  return [...tags].slice(0, 10);
}

function buildSpecialties(place: ScrapedPlace) {
  const specialties = new Set<string>();

  for (const section of place.about ?? []) {
    for (const option of section.options ?? []) {
      if (option.enabled && option.name?.trim()) {
        specialties.add(option.name.trim());
      }
    }
  }

  return [...specialties].slice(0, 12);
}

function buildHours(place: ScrapedPlace) {
  if (!place.open_hours) {
    return {};
  }

  const entries = Object.entries(place.open_hours)
    .map(([day, values]) => [day, values.join(', ')])
    .filter(([, value]) => value.trim().length > 0);

  if (entries.length === 0) {
    return {};
  }

  return Object.fromEntries(entries);
}

function buildPhotos(place: ScrapedPlace) {
  const photos = (place.images ?? [])
    .map((entry) => entry.image?.trim())
    .filter((entry): entry is string => Boolean(entry));

  return [...new Set(photos)].slice(0, 8);
}

function buildReviews(place: ScrapedPlace) {
  const reviews = (place.user_reviews ?? [])
    .map((review) => ({
      author: review.Name?.trim() ?? '',
      rating: review.Rating ?? 0,
      text: review.Description?.trim() ?? '',
    }))
    .filter((review) => review.author && review.rating > 0 && review.text)
    .slice(0, 5);

  return reviews.length > 0 ? reviews : [];
}

const categoryInferenceRules: Array<{categoryId: string; keywords: string[]}> = [
  {categoryId: 'marine-construction-dock-builders', keywords: ['dock builder', 'dock builders', 'marine construction', 'boat lift', 'dock', 'retaining wall contractor']},
  {categoryId: 'pool-spa-installers', keywords: ['pool contractor', 'swimming pool', 'hot tub', 'spa installer', 'pool cleaning service']},
  {categoryId: 'solar-panel-installers', keywords: ['solar energy contractor', 'solar installer', 'solar panel', 'solar energy company']},
  {categoryId: 'log-home-timber-frame-builders', keywords: ['log home builder', 'timber frame', 'timber framing', 'log homes']},
  {categoryId: 'asbestos-hazmat-abatement', keywords: ['asbestos', 'hazmat', 'hazardous material', 'demolition contractor asbestos']},
  {categoryId: 'civil-construction-pipelayers', keywords: ['civil engineering company', 'utility contractor', 'pipelayer', 'water works', 'sewer contractor', 'excavation contractor municipal']},
  {categoryId: 'fire-protection-sprinkler-systems', keywords: ['fire protection system supplier', 'fire sprinkler', 'fire alarm supplier', 'sprinkler system']},
  {categoryId: 'security-av-low-voltage', keywords: ['security system installer', 'security service', 'home automation', 'low voltage', 'audio visual consultant', 'home theater store']},
  {categoryId: 'structural-steel-erectors', keywords: ['steel fabricator', 'steel erector', 'structural steel', 'metal construction company']},
  {categoryId: 'elevator-escalator-installers', keywords: ['elevator service', 'elevator company', 'elevator', 'escalator']},
  {categoryId: 'stucco-plastering-eifs', keywords: ['stucco contractor', 'plasterer', 'plastering', 'eifs', 'exterior insulation finish system']},
  {categoryId: 'waterproofing-foundation-repair', keywords: ['foundation repair', 'waterproofing', 'basement waterproofing', 'concrete waterproofing', 'crawl space']},
  {categoryId: 'gutters-eavestroughing', keywords: ['gutter', 'eavestrough', 'gutter cleaning service']},
  {categoryId: 'sheet-metal-fabrication', keywords: ['sheet metal', 'custom metal fabrication', 'architectural metal', 'metal fabricator']},
  {categoryId: 'scaffolding-shoring', keywords: ['scaffolding', 'shoring', 'formwork supplier']},
  {categoryId: 'snow-removal', keywords: ['snow removal', 'snow plowing', 'snow clearing service']},
  {categoryId: 'garage-door-services', keywords: ['garage door', 'garage doors']},
  {
    categoryId: 'window-door-installers',
    keywords: ['window installer', 'window installation', 'window supplier', 'door supplier', 'door installer', 'door installation', 'window and door'],
  },
  {categoryId: 'glass-glaziers', keywords: ['glazier', 'glass contractor', 'glass service', 'window glass', 'glass repair']},
  {categoryId: 'welding-metal-fabrication', keywords: ['welder', 'welding', 'metal fabrication', 'fabrication', 'steel fabricator', 'metal workshop']},
  {categoryId: 'restoration', keywords: ['restoration', 'water damage', 'fire damage', 'mold']},
  {categoryId: 'junk-removal', keywords: ['junk removal', 'waste management', 'garbage collection']},
  {categoryId: 'handyman-services', keywords: ['handyman']},
  {categoryId: 'irrigation-systems', keywords: ['irrigation', 'sprinkler', 'sprinklers']},
  {categoryId: 'septic-drainage', keywords: ['septic', 'drainage', 'drain', 'drains', 'sewer']},
  {categoryId: 'hvac-contractors', keywords: ['hvac', 'heating', 'air conditioning', 'furnace', 'ventilation', 'heat pump', 'air duct cleaning']},
  {categoryId: 'electricians', keywords: ['electrician', 'electrical installation', 'electric service', 'electric company', 'electrical', 'lighting contractor']},
  {categoryId: 'plumbers', keywords: ['plumber', 'plumbing', 'hot water system supplier']},
  {categoryId: 'roofing', keywords: ['roofing', 'roofer']},
  {categoryId: 'concrete-contractors', keywords: ['concrete contractor', 'ready mix concrete supplier', 'concrete product supplier']},
  {categoryId: 'masonry-brick-stone', keywords: ['masonry', 'brick', 'stone contractor', 'stone supplier']},
  {categoryId: 'excavation-site-prep', keywords: ['excavating', 'excavation', 'site preparation', 'earthworks', 'earth moving']},
  {categoryId: 'demolition', keywords: ['demolition']},
  {categoryId: 'painters', keywords: ['painter', 'painting', 'paint store']},
  {categoryId: 'drywall-specialists', keywords: ['drywall']},
  {categoryId: 'flooring-installers', keywords: ['flooring', 'floor refinishing', 'floor sanding and polishing service', 'wood floor installation service', 'carpet installer']},
  {categoryId: 'tile-installers', keywords: ['tile contractor', 'tile installer', 'tile store', 'tile cleaning service']},
  {categoryId: 'insulation-contractors', keywords: ['insulation']},
  {categoryId: 'fencing-contractors', keywords: ['fence', 'fencing', 'gate supplier']},
  {categoryId: 'deck-builders', keywords: ['deck builder', 'deck contractor', 'decking contractor']},
  {categoryId: 'siding-contractors', keywords: ['siding']},
  {categoryId: 'paving-asphalt', keywords: ['paving', 'asphalt']},
  {categoryId: 'landscapers', keywords: ['landscaper', 'landscape', 'landscape designer', 'garden', 'gardener', 'lawn care', 'property maintenance', 'yard maintenance', 'hardscape', 'tree service']},
  {categoryId: 'cabinet-makers-millwork', keywords: ['cabinet maker', 'millwork', 'woodworker', 'cabinet store', 'kitchen remodeler']},
  {categoryId: 'carpenters-framing', keywords: ['framing', 'carpenter', 'finish carpenter']},
  {categoryId: 'general-contractors', keywords: ['general contractor', 'construction company', 'custom home builder', 'home builder', 'contractor']},
];

function inferCategoryId(place: ScrapedPlace) {
  const aboutTerms = (place.about ?? []).flatMap((section) => [
    section.name ?? '',
    ...(section.options ?? []).map((option) => option.name ?? ''),
  ]);
  const haystack = [place.category ?? '', ...(place.categories ?? []), place.description ?? '', place.title ?? '', ...aboutTerms]
    .join(' | ')
    .toLowerCase();

  for (const rule of categoryInferenceRules) {
    if (rule.keywords.some((keyword) => haystack.includes(keyword))) {
      return rule.categoryId;
    }
  }

  return null;
}

function inferCityId(place: ScrapedPlace) {
  const address = buildAddress(place);
  const directMatch = matchCityFromAddress(address);
  if (directMatch.matchedCityId) {
    return directMatch.matchedCityId;
  }

  const completeAddressCity = place.complete_address?.city?.trim();
  if (completeAddressCity) {
    const fallbackMatch = matchCityFromAddress(completeAddressCity);
    if (fallbackMatch.matchedCityId) {
      return fallbackMatch.matchedCityId;
    }
  }

  return null;
}

function mergeServiceAreas(...groups: Array<string[] | undefined>) {
  const values = groups
    .flatMap((group) => group ?? [])
    .map((entry) => entry.trim())
    .filter(Boolean);

  return [...new Set(values)];
}

function computeRichnessScore(place: ScrapedPlace) {
  let score = 0;

  if (place.review_rating != null) score += 1;
  if (place.review_count != null) score += 1;
  if (place.description?.trim()) score += 2;
  if ((place.images ?? []).length > 0) score += (place.images?.length ?? 0);
  if ((place.user_reviews ?? []).length > 0) score += (place.user_reviews?.length ?? 0);
  if (place.open_hours) score += 2;
  if (place.phone?.trim()) score += 1;
  if (place.web_site?.trim()) score += 1;
  if ((place.about ?? []).length > 0) score += 2;
  if (place.latitude != null && place.longtitude != null) score += 1;

  return score;
}

function chooseBestPlace(places: ScrapedPlace[]) {
  if (places.length === 0) return undefined;
  if (places.length === 1) return places[0];

  let best = places[0];
  let bestScore = computeRichnessScore(best);

  for (let index = 1; index < places.length; index += 1) {
    const score = computeRichnessScore(places[index]);
    if (score > bestScore) {
      best = places[index];
      bestScore = score;
    }
  }

  return best;
}

function parseInputContent(content: string): ScrapedPlace[] {
  const trimmed = content.trim();

  if (trimmed.startsWith('[')) {
    return JSON.parse(trimmed) as ScrapedPlace[];
  }

  return trimmed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as ScrapedPlace);
}

async function fetchAllBusinesses(client: SupabaseClient) {
  const allRows: ExistingBusinessRow[] = [];
  let offset = 0;

  for (;;) {
    const {data, error} = await client
      .from('businesses')
      .select('id, name, city_id, category_id, rating, review_count, description, service_areas, category_tags, specialties, photos, reviews, hours, coordinates, contact, source')
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch businesses: ${error.message}`);
    }

    if (!data || data.length === 0) {
      break;
    }

    allRows.push(...(data as ExistingBusinessRow[]));
    offset += data.length;
  }

  return allRows;
}

function normalizePlaceToRow(place: ScrapedPlace, cityId: string, categoryId: string, id: string): NormalizedBusiness {
  const city = cities.find((entry) => entry.id === cityId);
  const category = categories.find((entry) => entry.id === categoryId);
  const address = buildAddress(place);
  const categoryTags = buildCategoryTags(place, category?.name);

  return {
    id,
    name: place.title?.trim() ?? '',
    city_id: cityId,
    category_id: categoryId,
    rating: place.review_rating ?? null,
    review_count: place.review_count ?? null,
    description: place.description?.trim() ?? null,
    service_areas: mergeServiceAreas(city ? [city.name] : undefined),
    category_tags: categoryTags,
    specialties: buildSpecialties(place),
    photos: buildPhotos(place),
    reviews: buildReviews(place),
    hours: buildHours(place),
    coordinates:
      typeof place.latitude === 'number' && typeof place.longtitude === 'number'
        ? {lat: place.latitude, lng: place.longtitude}
        : null,
    contact: {
      phone: place.phone ?? undefined,
      website: place.web_site ?? undefined,
      address,
    },
    source: {
      provider: 'google-maps-scraper',
      cid: place.cid ?? undefined,
      placeId: place.place_id ?? undefined,
      category: place.category ?? undefined,
      mapsUrl: place.link ?? undefined,
    },
  };
}

function mergePlaceIntoRow(row: ExistingBusinessRow, place: ScrapedPlace): NormalizedBusiness {
  const address = buildAddress(place);
  const categoryTags = buildCategoryTags(
    place,
    categories.find((entry) => entry.id === row.category_id)?.name,
  );
  const specialties = buildSpecialties(place);
  const photos = buildPhotos(place);
  const reviews = buildReviews(place);
  const hours = buildHours(place);

  return {
    id: row.id,
    name: row.name,
    city_id: row.city_id,
    category_id: row.category_id,
    rating: place.review_rating ?? row.rating,
    review_count: place.review_count ?? row.review_count,
    description: row.description ?? place.description?.trim() ?? null,
    service_areas: row.service_areas,
    category_tags: categoryTags.length > 0 ? categoryTags : row.category_tags,
    specialties: specialties.length > 0 ? specialties : row.specialties,
    photos: photos.length > 0 ? photos : row.photos,
    reviews: reviews.length > 0 ? reviews : (row.reviews as unknown[]),
    hours: Object.keys(hours).length > 0 ? hours : (row.hours as Record<string, unknown>),
    coordinates:
      typeof place.latitude === 'number' && typeof place.longtitude === 'number'
        ? {lat: place.latitude, lng: place.longtitude}
        : row.coordinates,
    contact: {
      ...row.contact,
      phone: place.phone ?? row.contact?.phone,
      website: place.web_site ?? row.contact?.website,
      address: address || row.contact?.address,
    },
    source: {
      ...row.source,
      provider: row.source?.provider ?? 'google-maps-scraper',
      cid: place.cid ?? row.source?.cid,
      placeId: place.place_id ?? row.source?.placeId,
      category: place.category ?? row.source?.category,
      mapsUrl: place.link ?? row.source?.mapsUrl,
    },
  };
}

function toExistingBusinessRow(row: NormalizedBusiness): ExistingBusinessRow {
  return {
    id: row.id,
    name: row.name,
    city_id: row.city_id,
    category_id: row.category_id,
    rating: row.rating,
    review_count: row.review_count,
    description: row.description,
    service_areas: row.service_areas,
    category_tags: row.category_tags,
    specialties: row.specialties,
    photos: row.photos,
    reviews: row.reviews,
    hours: row.hours,
    coordinates: row.coordinates,
    contact: row.contact,
    source: row.source,
  };
}

function generateStableId(cityId: string, categoryId: string, place: ScrapedPlace, usedIds: Set<string>) {
  const base = place.place_id ?? place.cid ?? slugify(`${place.title ?? 'unknown'}-${buildAddress(place) ?? 'unknown'}`);
  let candidate = `${cityId}-${categoryId}-${base}`;

  if (!usedIds.has(candidate)) {
    return candidate;
  }

  let suffix = 2;
  while (usedIds.has(`${candidate}-${suffix}`)) {
    suffix += 1;
  }

  return `${candidate}-${suffix}`;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const counters: Counters = {
    total: 0,
    deduped: 0,
    staged: 0,
    normalized: 0,
    skipped: 0,
    matched: 0,
    updated: 0,
    created: 0,
    errors: 0,
  };
  let runContext: RunContext | null = null;

  console.log(`Reading input from ${path.relative(repoRoot, options.input)}...`);
  const inputRaw = await readFile(options.input, 'utf8');
  const runCreationResult = await createRunContext(options, inputRaw);
  if (runCreationResult && 'skipImport' in runCreationResult) {
    return;
  }
  runContext = runCreationResult && 'runId' in runCreationResult ? runCreationResult : null;

  const allPlaces = parseInputContent(inputRaw);
  counters.total = allPlaces.length;
  console.log(`Found ${counters.total} scraped records.`);

  try {
    const limitedPlaces = allPlaces.slice(0, options.limit);

    console.log('Fetching existing businesses from Supabase...');
    const existingRows = await fetchAllBusinesses(supabase);
    console.log(`Fetched ${existingRows.length} existing businesses.`);

    const byPlaceId = new Map<string, ExistingBusinessRow>();
    const byCid = new Map<string, ExistingBusinessRow>();
    const byFallback = new Map<string, ExistingBusinessRow>();

    for (const row of existingRows) {
      if (row.source?.placeId) {
        byPlaceId.set(row.source.placeId, row);
      }

      if (row.source?.cid) {
        byCid.set(row.source.cid, row);
      }

      byFallback.set(getExistingFallbackKey(row), row);
    }

    const usedIds = new Set(existingRows.map((row) => row.id));

    const incomingByKey = new Map<string, ScrapedPlace[]>();
    for (const place of limitedPlaces) {
      const key = getPlaceKey(place) ?? getPlaceFallbackKey(place, inferCityId(place));
      const existing = incomingByKey.get(key);
      if (existing) {
        existing.push(place);
      } else {
        incomingByKey.set(key, [place]);
      }
    }
    counters.deduped = incomingByKey.size;

    const dedupedPlacesForStage: Array<{dedupeKey: string; place: ScrapedPlace}> = [];
    for (const [dedupeKey, duplicates] of incomingByKey.entries()) {
      const best = chooseBestPlace(duplicates);
      if (best) {
        dedupedPlacesForStage.push({dedupeKey, place: best});
      }
    }

    if (runContext) {
      const {stagedCount, stagingDisabled} = await stageRawPlaces(
        runContext,
        path.relative(repoRoot, options.input),
        dedupedPlacesForStage,
      );
      counters.staged = stagedCount;
      if (!stagingDisabled) {
        await updateRun(runContext.runId, {
          status: 'staged',
          raw_count: limitedPlaces.length,
          deduped_count: counters.deduped,
        });
      }
    }

    const rowsToUpsert: NormalizedBusiness[] = [];
    const processedExistingIds = new Set<string>();

    for (const duplicates of incomingByKey.values()) {
      const best = chooseBestPlace(duplicates);
      if (!best) {
        counters.skipped += 1;
        continue;
      }

      const placeId = best.place_id;
      const cid = best.cid;

      let matchedRow: ExistingBusinessRow | undefined;

      if (placeId && byPlaceId.has(placeId)) {
        matchedRow = byPlaceId.get(placeId);
      } else if (cid && byCid.has(cid)) {
        matchedRow = byCid.get(cid);
      } else {
        const cityId = inferCityId(best);
        const fallbackKey = getPlaceFallbackKey(best, cityId);
        matchedRow = byFallback.get(fallbackKey);
      }

      if (matchedRow) {
        if (options.skipExisting) {
          counters.skipped += 1;
          continue;
        }

        if (processedExistingIds.has(matchedRow.id)) {
          counters.skipped += 1;
          continue;
        }

        counters.matched += 1;
        counters.updated += 1;
        processedExistingIds.add(matchedRow.id);
        const mergedRow = mergePlaceIntoRow(matchedRow, best);
        rowsToUpsert.push(mergedRow);
        if (best.place_id) {
          byPlaceId.set(best.place_id, matchedRow);
        }
        if (best.cid) {
          byCid.set(best.cid, matchedRow);
        }
        const mergedAddress = typeof mergedRow.contact.address === 'string' ? mergedRow.contact.address : undefined;
        byFallback.set(getFallbackKey(mergedRow.name, mergedAddress, mergedRow.city_id), matchedRow);
        counters.normalized += 1;
      } else {
        const categoryId = inferCategoryId(best);
        const cityId = inferCityId(best);
        const address = buildAddress(best);

        if (!categoryId || !cityId || !best.title?.trim() || !address) {
          counters.skipped += 1;
          continue;
        }

        const city = cities.find((entry) => entry.id === cityId);
        const category = categories.find((entry) => entry.id === categoryId);

        if (!city || !category) {
          counters.skipped += 1;
          continue;
        }

        const id = generateStableId(cityId, categoryId, best, usedIds);
        usedIds.add(id);
        counters.created += 1;
        counters.normalized += 1;
        const createdRow = normalizePlaceToRow(best, cityId, categoryId, id);
        rowsToUpsert.push(createdRow);
        const createdExistingRow = toExistingBusinessRow(createdRow);
        if (best.place_id) {
          byPlaceId.set(best.place_id, createdExistingRow);
        }
        if (best.cid) {
          byCid.set(best.cid, createdExistingRow);
        }
        const createdAddress = typeof createdRow.contact.address === 'string' ? createdRow.contact.address : undefined;
        byFallback.set(getFallbackKey(createdRow.name, createdAddress, createdRow.city_id), createdExistingRow);
      }
    }

    console.log(`\nNormalized: ${counters.normalized}`);
    console.log(`  Matched (existing): ${counters.matched}`);
    console.log(`  Created (new): ${counters.created}`);
    console.log(`  Skipped: ${counters.skipped}`);

    if (rowsToUpsert.length === 0) {
      console.log('Nothing to upsert.');
      if (runContext) {
        await updateRun(runContext.runId, {
          status: 'imported',
          raw_count: limitedPlaces.length,
          deduped_count: counters.deduped,
          normalized_count: counters.normalized,
          matched_count: counters.matched,
          created_count: counters.created,
          updated_count: counters.updated,
          skipped_count: counters.skipped,
          error_count: counters.errors,
          completed_at: new Date().toISOString(),
        });
      }
      printSummary(counters);
      return;
    }

    if (options.dryRun) {
      console.log(`\n[dry-run] Would upsert ${rowsToUpsert.length} rows.`);
      printSummary(counters);
      return;
    }

    console.log(`\nUpserting ${rowsToUpsert.length} rows (batch size ${options.batchSize})...`);

    for (let offset = 0; offset < rowsToUpsert.length; offset += options.batchSize) {
      const batch = rowsToUpsert.slice(offset, offset + options.batchSize);
      const {error} = await supabase
        .from('businesses')
        .upsert(batch, {onConflict: 'id', ignoreDuplicates: false});

      if (error) {
        counters.errors += 1;
        console.error(`Batch error at offset ${offset}: ${error.message}`);
      }
    }

    if (runContext) {
      const status = counters.errors > 0 ? 'failed' : 'imported';
      await updateRun(runContext.runId, {
        status,
        raw_count: limitedPlaces.length,
        deduped_count: counters.deduped,
        normalized_count: counters.normalized,
        matched_count: counters.matched,
        created_count: counters.created,
        updated_count: counters.updated,
        skipped_count: counters.skipped,
        error_count: counters.errors,
        completed_at: new Date().toISOString(),
      });
    }

    printSummary(counters);
  } catch (error) {
    if (runContext) {
      const message = error instanceof Error ? error.message : String(error);
      await updateRun(runContext.runId, {
        status: 'failed',
        raw_count: Math.min(counters.total, options.limit),
        deduped_count: counters.deduped,
        normalized_count: counters.normalized,
        matched_count: counters.matched,
        created_count: counters.created,
        updated_count: counters.updated,
        skipped_count: counters.skipped,
        error_count: counters.errors + 1,
        error_text: message,
        completed_at: new Date().toISOString(),
      });
    }
    throw error;
  }
}

function printSummary(counters: Counters) {
  console.log('');
  console.log('--- Import Summary ---');
  console.log(`Total scraped:   ${counters.total}`);
  console.log(`Deduped:         ${counters.deduped}`);
  console.log(`Raw staged:      ${counters.staged}`);
  console.log(`Normalized:      ${counters.normalized}`);
  console.log(`Skipped:         ${counters.skipped}`);
  console.log(`Matched:         ${counters.matched}`);
  console.log(`Updated:         ${counters.updated}`);
  console.log(`Created:         ${counters.created}`);
  console.log(`Errors:          ${counters.errors}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
