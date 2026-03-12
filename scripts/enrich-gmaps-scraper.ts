import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {businesses as existingBusinesses, categories, cities} from '../src/data';
import {matchCityFromAddress} from '../src/cityMatching';

type ExistingBusiness = (typeof existingBusinesses)[number] & {
  source?: {
    provider?: string;
    cid?: string;
    placeId?: string;
    category?: string;
    mapsUrl?: string;
    [key: string]: unknown;
  };
  contact?: {
    address?: string;
    website?: string;
    phone?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const dataFile = path.join(repoRoot, 'src', 'data.ts');

function parseArgs(argv: string[]) {
  const options = {
    input: path.join(repoRoot, 'generated', 'gmaps-scraper', 'results.json'),
    limit: Number.POSITIVE_INFINITY,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--input' && next) {
      options.input = path.resolve(repoRoot, next);
      index += 1;
      continue;
    }

    if (arg === '--limit' && next) {
      options.limit = Number(next);
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

function getFallbackKey(name?: string, address?: string) {
  return `fallback:${slugify(name ?? '')}:${slugify(address ?? '')}`;
}

function getMergeKey(business: {source?: {cid?: string; placeId?: string}; name?: string; contact?: {address?: string}}) {
  if (business.source?.placeId) {
    return `place:${business.source.placeId}`;
  }

  if (business.source?.cid) {
    return `cid:${business.source.cid}`;
  }

  return getFallbackKey(business.name ?? '', business.contact?.address ?? '');
}

function isGenericDescription(description: string | undefined) {
  if (!description) {
    return true;
  }

  return (
    description.includes('is listed in') ||
    description.includes('serving ') ||
    description.includes('Contact them directly to confirm current availability')
  );
}

function toTag(value: string) {
  return value
    .toLowerCase()
    .replace(/[|/(),]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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
    return undefined;
  }

  const entries = Object.entries(place.open_hours)
    .map(([day, values]) => [day, values.join(', ')])
    .filter(([, value]) => value.trim().length > 0);

  if (entries.length === 0) {
    return undefined;
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

  return reviews.length > 0 ? reviews : undefined;
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

function inferInputCityId(filename: string) {
  const basename = path.basename(filename).toLowerCase();
  const orderedCities = [...cities].sort((left, right) => right.id.length - left.id.length);

  for (const city of orderedCities) {
    if (basename.includes(city.id)) {
      return city.id;
    }
  }

  return null;
}

function mergeServiceAreas(...groups: Array<string[] | undefined>) {
  const values = groups
    .flatMap((group) => group ?? [])
    .map((entry) => entry.trim())
    .filter(Boolean);

  const deduped = [...new Set(values)];
  return deduped.length > 0 ? deduped : undefined;
}

function createBusinessFromPlace(place: ScrapedPlace, queryCityId: string | null) {
  const categoryId = inferCategoryId(place);
  const cityId = inferCityId(place);
  const address = buildAddress(place);

  if (!categoryId || !cityId || !place.title?.trim() || !address) {
    return null;
  }

  const city = cities.find((entry) => entry.id === cityId);
  const category = categories.find((entry) => entry.id === categoryId);
  const queryCity = queryCityId ? cities.find((entry) => entry.id === queryCityId) : undefined;

  if (!city || !category) {
    return null;
  }

  const categoryTags = buildCategoryTags(place, category.name);
  const specialties = buildSpecialties(place);
  const photos = buildPhotos(place);
  const reviews = buildReviews(place);
  const hours = buildHours(place);
  const stableId = `${cityId}-${categoryId}-${place.place_id ?? place.cid ?? slugify(`${place.title}-${address}`)}`;

  return {
    id: stableId,
    name: place.title.trim(),
    cityId,
    cityName: city.name,
    categoryId,
    categoryName: category.name,
    contact: {
      phone: place.phone ?? undefined,
      website: place.web_site ?? undefined,
      address,
    },
    coordinates:
      typeof place.latitude === 'number' && typeof place.longtitude === 'number'
        ? {lat: place.latitude, lng: place.longtitude}
        : undefined,
    source: {
      provider: 'google-maps-scraper',
      cid: place.cid ?? undefined,
      placeId: place.place_id ?? undefined,
      category: place.category ?? undefined,
      mapsUrl: place.link ?? undefined,
    },
    rating: place.review_rating ?? undefined,
    reviewCount: place.review_count ?? undefined,
    description:
      place.description?.trim()
      || `${place.title.trim()} is listed in ${city.name} under ${category.name}. Use the contact links below to confirm current availability, pricing, and service scope.`,
    serviceAreas: mergeServiceAreas([city.name], queryCity && queryCity.id !== city.id ? [queryCity.name] : undefined),
    categoryTags: categoryTags.length > 0 ? categoryTags : undefined,
    specialties: specialties.length > 0 ? specialties : undefined,
    photos: photos.length > 0 ? photos : undefined,
    reviews,
    hours,
  };
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

async function readNdjson(filename: string) {
  const content = await readFile(filename, 'utf8');
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => JSON.parse(line) as ScrapedPlace);
}

function chooseBestPlace(existing: ExistingBusiness, places: ScrapedPlace[]) {
  const byPlaceId = places.find((place) => place.place_id && existing.source?.placeId === place.place_id);
  if (byPlaceId) {
    return byPlaceId;
  }

  const byCid = places.find((place) => place.cid && existing.source?.cid === place.cid);
  if (byCid) {
    return byCid;
  }

  const existingFallback = getFallbackKey(existing.name, existing.contact?.address);
  const byFallback = places.find((place) => getFallbackKey(place.title, place.address) === existingFallback);
  if (byFallback) {
    return byFallback;
  }

  return undefined;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const scrapedPlaces = await readNdjson(options.input);
  const limitedPlaces = scrapedPlaces.slice(0, options.limit);
  const queryCityId = inferInputCityId(options.input);
  const queryCityName = queryCityId ? cities.find((city) => city.id === queryCityId)?.name : undefined;

  const placesByPlaceId = new Map<string, ScrapedPlace>();
  const placesByCid = new Map<string, ScrapedPlace>();
  const placesByFallback = new Map<string, ScrapedPlace[]>();

  for (const place of limitedPlaces) {
    if (place.place_id) {
      placesByPlaceId.set(place.place_id, place);
    }

    if (place.cid) {
      placesByCid.set(place.cid, place);
    }

    const fallbackKey = getFallbackKey(place.title, place.address);
    const existing = placesByFallback.get(fallbackKey);
    if (existing) {
      existing.push(place);
    } else {
      placesByFallback.set(fallbackKey, [place]);
    }
  }

  let updatedCount = 0;
  let createdCount = 0;
  const matchedKeys = new Set<string>();

  const mergedBusinesses = existingBusinesses.map((business) => {
    const existing = business as ExistingBusiness;
    const candidates: ScrapedPlace[] = [];

    if (existing.source?.placeId && placesByPlaceId.has(existing.source.placeId)) {
      candidates.push(placesByPlaceId.get(existing.source.placeId)!);
    }

    if (existing.source?.cid && placesByCid.has(existing.source.cid)) {
      candidates.push(placesByCid.get(existing.source.cid)!);
    }

    const fallbackKey = getFallbackKey(existing.name, existing.contact?.address);
    candidates.push(...(placesByFallback.get(fallbackKey) ?? []));

    const place = chooseBestPlace(existing, candidates);
    if (!place) {
      return existing;
    }

    matchedKeys.add(getFallbackKey(place.title, buildAddress(place)));
    if (place.place_id) {
      matchedKeys.add(`place:${place.place_id}`);
    }
    if (place.cid) {
      matchedKeys.add(`cid:${place.cid}`);
    }

    updatedCount += 1;

    const categoryTags = buildCategoryTags(
      place,
      typeof existing.categoryName === 'string' ? existing.categoryName : undefined,
    );
    const specialties = buildSpecialties(place);
    const photos = buildPhotos(place);
    const reviews = buildReviews(place);
    const hours = buildHours(place);

    return {
      ...existing,
      rating: place.review_rating ?? existing.rating,
      reviewCount: place.review_count ?? existing.reviewCount,
      description: isGenericDescription(existing.description)
        ? place.description?.trim() || existing.description
        : existing.description,
      categoryTags: categoryTags.length > 0 ? categoryTags : existing.categoryTags,
      specialties: specialties.length > 0 ? specialties : existing.specialties,
      photos: photos.length > 0 ? photos : existing.photos,
      reviews: reviews ?? existing.reviews,
      hours: hours ?? existing.hours,
      serviceAreas: mergeServiceAreas(
        existing.serviceAreas,
        queryCityName && queryCityName !== existing.cityName ? [queryCityName] : undefined,
      ),
      contact: {
        ...existing.contact,
        phone: place.phone ?? existing.contact?.phone,
        website: place.web_site ?? existing.contact?.website,
        address: place.address || existing.contact?.address,
      },
      source: {
        ...existing.source,
        cid: place.cid ?? existing.source?.cid,
        placeId: place.place_id ?? existing.source?.placeId,
        category: place.category ?? existing.source?.category,
      },
      coordinates:
        typeof place.latitude === 'number' && typeof place.longtitude === 'number'
          ? {
              lat: place.latitude,
              lng: place.longtitude,
            }
          : existing.coordinates,
    };
  });

  const createdBusinesses = limitedPlaces.flatMap((place) => {
    const keys = [
      place.place_id ? `place:${place.place_id}` : '',
      place.cid ? `cid:${place.cid}` : '',
      getFallbackKey(place.title, buildAddress(place)),
    ].filter(Boolean);

    if (keys.some((key) => matchedKeys.has(key))) {
      return [];
    }

    const created = createBusinessFromPlace(place, queryCityId);
    if (!created) {
      return [];
    }

    createdCount += 1;
    for (const key of keys) {
      matchedKeys.add(key);
    }
    return [created];
  });

  const allBusinesses = [...mergedBusinesses, ...createdBusinesses].sort((left, right) =>
    String(left.cityId).localeCompare(String(right.cityId))
    || String(left.categoryId).localeCompare(String(right.categoryId))
    || String(left.name).localeCompare(String(right.name)),
  );

  const serializedBusinesses = `export const businesses: Business[] = ${formatValue(allBusinesses, 0)};\n`;
  const currentData = await readFile(dataFile, 'utf8');
  const exportStart = currentData.indexOf('export const businesses');
  const exportEnd = currentData.lastIndexOf('];');

  if (exportStart === -1 || exportEnd === -1 || exportEnd < exportStart) {
    throw new Error('Unable to locate businesses export in src/data.ts.');
  }

  const updatedData = `${currentData.slice(0, exportStart)}${serializedBusinesses}${currentData.slice(exportEnd + 2)}`;
  await writeFile(dataFile, updatedData, 'utf8');

  console.log(`Updated ${updatedCount} businesses and created ${createdCount} businesses from ${path.relative(repoRoot, options.input)}.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
