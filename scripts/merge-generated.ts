import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {businesses as existingBusinesses} from '../src/data';

type ExistingBusiness = (typeof existingBusinesses)[number] & {
  coordinates?: {
    lat: number;
    lng: number;
  };
  source?: {
    cid?: string;
    [key: string]: unknown;
  };
  contact?: {
    address?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type GeneratedBusiness = {
  id: string;
  name: string;
  cityId: string;
  cityName?: string;
  categoryId: string;
  categoryName?: string;
  searchQuery?: string;
  contact?: {
    phone?: string;
    website?: string;
    address?: string;
    email?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  source?: {
    provider?: string;
    cid?: string;
    position?: number;
    category?: string;
    mapsUrl?: string;
  };
  rating?: number;
  reviewCount?: number;
  description?: string;
  serviceAreas?: string[];
  specialties?: string[];
  photos?: string[];
  reviews?: Array<{author: string; rating: number; text: string}>;
  hours?: Record<string, string>;
  [key: string]: unknown;
};

type GeneratedFile = {
  businesses?: GeneratedBusiness[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const dataFile = path.join(repoRoot, 'src', 'data.ts');
const generatedFile = path.join(repoRoot, 'generated', 'businesses.json');

function getMergeKey(business: {source?: {cid?: string}; name?: string; contact?: {address?: string}}) {
  if (business.source?.cid) {
    return `cid:${business.source.cid}`;
  }

  return `fallback:${slugify(business.name ?? '')}:${slugify(business.contact?.address ?? '')}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function mergeBusiness(existingBusiness: ExistingBusiness | undefined, generatedBusiness: GeneratedBusiness) {
  if (!existingBusiness) {
    return generatedBusiness;
  }

  return {
    ...generatedBusiness,
    ...existingBusiness,
    rating: generatedBusiness.rating ?? existingBusiness.rating,
    reviewCount: generatedBusiness.reviewCount ?? existingBusiness.reviewCount,
    description: existingBusiness.description ?? generatedBusiness.description,
    serviceAreas:
      existingBusiness.serviceAreas && existingBusiness.serviceAreas.length > 0
        ? existingBusiness.serviceAreas
        : generatedBusiness.serviceAreas,
    specialties:
      existingBusiness.specialties && existingBusiness.specialties.length > 0
        ? existingBusiness.specialties
        : generatedBusiness.specialties,
    photos:
      existingBusiness.photos && existingBusiness.photos.length > 0
        ? existingBusiness.photos
        : generatedBusiness.photos,
    reviews:
      existingBusiness.reviews && existingBusiness.reviews.length > 0
        ? existingBusiness.reviews
        : generatedBusiness.reviews,
    hours:
      existingBusiness.hours && Object.keys(existingBusiness.hours).length > 0
        ? existingBusiness.hours
        : generatedBusiness.hours,
    contact: {
      ...generatedBusiness.contact,
      ...existingBusiness.contact,
      phone: generatedBusiness.contact?.phone ?? existingBusiness.contact?.phone,
      website: generatedBusiness.contact?.website ?? existingBusiness.contact?.website,
      address: generatedBusiness.contact?.address ?? existingBusiness.contact?.address,
      email: existingBusiness.contact?.email ?? generatedBusiness.contact?.email,
    },
    source: {
      ...generatedBusiness.source,
      ...existingBusiness.source,
      cid: generatedBusiness.source?.cid ?? existingBusiness.source?.cid,
    },
    coordinates: generatedBusiness.coordinates ?? existingBusiness.coordinates,
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

async function main() {
  const generatedContent = await readFile(generatedFile, 'utf8');
  const parsedGenerated = JSON.parse(generatedContent) as GeneratedFile;
  const generatedBusinesses = parsedGenerated.businesses ?? [];

  if (generatedBusinesses.length === 0) {
    throw new Error('No generated businesses found in generated/businesses.json.');
  }

  const existingImportedByKey = new Map<string, ExistingBusiness>(
    existingBusinesses
      .filter((business) => business.source?.provider === 'serper')
      .map((business) => [getMergeKey(business), business as ExistingBusiness]),
  );

  const mergedByKey = new Map<string, ExistingBusiness | GeneratedBusiness>();

  for (const business of existingBusinesses) {
    mergedByKey.set(getMergeKey(business), business as ExistingBusiness);
  }

  for (const generatedBusiness of generatedBusinesses) {
    const key = getMergeKey(generatedBusiness);
    const existingBusiness = existingImportedByKey.get(key);
    mergedByKey.set(key, mergeBusiness(existingBusiness, generatedBusiness));
  }

  const mergedBusinesses = [...mergedByKey.values()].sort((left, right) =>
    String(left.cityId).localeCompare(String(right.cityId)) ||
    String(left.categoryId).localeCompare(String(right.categoryId)) ||
    String(left.name).localeCompare(String(right.name)),
  );

  const serializedBusinesses = `export const businesses: Business[] = ${formatValue(mergedBusinesses, 0)};\n`;
  const currentData = await readFile(dataFile, 'utf8');
  const exportMatch = currentData.match(/export const businesses(?::\s*Business\[\])?\s*=\s*\[/);
  const exportStart = exportMatch ? exportMatch.index : -1;
  const exportEnd = currentData.lastIndexOf('];');

  if (exportStart === -1 || exportEnd === -1 || exportEnd < exportStart) {
    throw new Error('Unable to locate businesses export in src/data.ts.');
  }

  const updatedData = `${currentData.slice(0, exportStart)}${serializedBusinesses}${currentData.slice(exportEnd + 2)}`;

  await writeFile(dataFile, updatedData, 'utf8');
  console.log(`Merged ${generatedBusinesses.length} generated businesses into src/data.ts (${mergedBusinesses.length} total).`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
