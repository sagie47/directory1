import 'dotenv/config';

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

import { businesses, categories, cities } from '../src/data';

type DirectoryBusiness = (typeof businesses)[number];

type DescriptionSource =
  | 'directory-fallback'
  | 'directory-signals'
  | 'website-signals'
  | 'llm-rewrite';

type ConfidenceLevel = 'low' | 'medium' | 'high';

type WebsiteSignals = {
  fetchedAt: string;
  finalUrl: string;
  title?: string;
  metaDescription?: string;
  ogDescription?: string;
  headings: string[];
  paragraphs: string[];
  serviceHints: string[];
  locationHints: string[];
  snippets: string[];
};

type GeneratedDescription = {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
  categoryId: string;
  categoryName: string;
  website?: string;
  description: string;
  source: DescriptionSource;
  confidence: ConfidenceLevel;
  validationStatus?: 'accepted' | 'fallback';
  validationIssues?: string[];
  websiteSignals?: WebsiteSignals;
  evidence: {
    serviceHints: string[];
    locationHints: string[];
    rating?: number;
    reviewCount?: number;
  };
};

type GenerationRecord = {
  business: DirectoryBusiness;
  cityName: string;
  categoryName: string;
  websiteSignals?: WebsiteSignals;
  generated: GeneratedDescription;
};

type CliOptions = {
  limit: number;
  offset: number;
  concurrency: number;
  timeoutMs: number;
  output: string;
  useLlm: boolean;
  llmBatchSize: number;
  onlyWithWebsite: boolean;
  refreshCache: boolean;
  llmModel: string;
  chunkSize: number;
  checkpointFile?: string;
  mergeDataFile?: string;
  mergeSupabase: boolean;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'generated', 'description-enrichment');
const htmlCacheDir = path.join(outputDir, 'html-cache');
const signalCacheDir = path.join(outputDir, 'signal-cache');

const GENERIC_SERVICE_HINTS = new Set([
  'contractor',
  'construction company',
  'construction service',
  'service',
  'services',
  'business',
  'company',
  'local business',
  'home',
  'commercial',
  'residential',
]);

const NOISY_HINT_PATTERNS = [
  /\b(book now|contact us|call now|get a quote|learn more|read more)\b/i,
  /\bprivacy policy|terms of service|cookie policy\b/i,
  /\bwheelchair accessible|online estimates|on-site services|onsite services\b/i,
  /\bfree parking|street parking|parking lot|appointment required\b/i,
  /\bfacebook|instagram|linkedin|youtube|tiktok\b/i,
];

const SERVICE_KEYWORDS = [
  'repair',
  'repairs',
  'installation',
  'installations',
  'install',
  'replacement',
  'maintenance',
  'service',
  'services',
  'restoration',
  'renovation',
  'renovations',
  'fabrication',
  'excavation',
  'demolition',
  'drainage',
  'wiring',
  'plumbing',
  'roofing',
  'flooring',
  'painting',
  'electrical',
  'heating',
  'cooling',
  'hvac',
  'landscaping',
  'concrete',
  'asbestos',
  'hazmat',
  'mold',
  'fire damage',
  'water damage',
  'sprinkler',
  'security',
  'custom homes',
  'decks',
  'fencing',
  'septic',
  'drain cleaning',
];

const BLOCKED_PHRASES = [
  'request a quote',
  'call today',
  'contact us',
  'learn more',
  'book now',
  'get a quote',
  'i would recommend',
  'click here',
];

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    limit: 10,
    offset: 0,
    concurrency: 3,
    timeoutMs: 10000,
    output: path.join(outputDir, 'test-batch.json'),
    useLlm: false,
    llmBatchSize: 10,
    onlyWithWebsite: true,
    refreshCache: false,
    llmModel: 'stepfun/step-3.5-flash:free',
    chunkSize: 25,
    checkpointFile: undefined,
    mergeDataFile: undefined,
    mergeSupabase: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--limit' && next) {
      options.limit = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--offset' && next) {
      options.offset = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--concurrency' && next) {
      options.concurrency = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--timeout-ms' && next) {
      options.timeoutMs = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--output' && next) {
      options.output = path.isAbsolute(next) ? next : path.join(repoRoot, next);
      index += 1;
      continue;
    }

    if (arg === '--llm-batch-size' && next) {
      options.llmBatchSize = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--chunk-size' && next) {
      options.chunkSize = Number(next);
      index += 1;
      continue;
    }

    if (arg === '--use-llm' || arg === '--use-gemini') {
      options.useLlm = true;
      continue;
    }

    if (arg === '--include-no-website') {
      options.onlyWithWebsite = false;
      continue;
    }

    if (arg === '--refresh-cache') {
      options.refreshCache = true;
      continue;
    }

    if (arg === '--llm-model' && next) {
      options.llmModel = next;
      index += 1;
      continue;
    }

    if (arg === '--checkpoint-file' && next) {
      options.checkpointFile = path.isAbsolute(next) ? next : path.join(repoRoot, next);
      index += 1;
      continue;
    }

    if (arg === '--merge-data-file' && next) {
      options.mergeDataFile = path.isAbsolute(next) ? next : path.join(repoRoot, next);
      index += 1;
      continue;
    }

    if (arg === '--merge-supabase') {
      options.mergeSupabase = true;
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

function normalizeWhitespace(value: string) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(value: string) {
  return normalizeWhitespace(decodeHtmlEntities(value.replace(/<[^>]+>/g, ' ')));
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sentenceCase(value: string) {
  const normalized = normalizeWhitespace(value).replace(/[.;,:-]+$/g, '');
  if (!normalized) {
    return normalized;
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function withIndefiniteArticle(value: string) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) {
    return normalized;
  }

  return /^[aeiou]/i.test(normalized) ? `an ${normalized}` : `a ${normalized}`;
}

function uniqueValues(values: Array<string | undefined>, limit = 10) {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const normalized = normalizeWhitespace(value ?? '');
    if (!normalized) {
      continue;
    }

    const lookup = normalized.toLowerCase();
    if (seen.has(lookup)) {
      continue;
    }

    seen.add(lookup);
    deduped.push(normalized);

    if (deduped.length >= limit) {
      break;
    }
  }

  return deduped;
}

function joinList(values: string[]) {
  if (values.length <= 1) {
    return values[0] ?? '';
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function splitSentences(value: string) {
  return value
    .split(/(?<=[.!?])\s+/)
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);
}

function cleanServiceHint(value: string) {
  const normalized = sentenceCase(
    value
      .replace(/\b(home|page|welcome|our team)\b/gi, '')
      .replace(/\bcall toll free\b/gi, '')
      .replace(/\bcall today\b/gi, '')
      .replace(/\brequest a .*? quote\b/gi, '')
      .replace(/\bget emergency service\b/gi, '')
      .replace(/\+?1?[-.\s(]*\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}\b/g, '')
      .replace(/[|/]+/g, ' ')
      .replace(/\s{2,}/g, ' '),
  );

  if (!normalized) {
    return '';
  }

  const lookup = normalized.toLowerCase();
  if (lookup.length < 4) {
    return '';
  }

  if (GENERIC_SERVICE_HINTS.has(lookup)) {
    return '';
  }

  if (NOISY_HINT_PATTERNS.some((pattern) => pattern.test(lookup))) {
    return '';
  }

  if (normalized.length > 90) {
    return '';
  }

  return normalized;
}

function isServiceLike(value: string, categoryName: string) {
  const lookup = value.toLowerCase();
  const categoryLookup = categoryName.toLowerCase();

  return SERVICE_KEYWORDS.some((keyword) => lookup.includes(keyword)) || lookup.includes(categoryLookup);
}

function isLocationLike(value: string, cityName: string, serviceAreas: string[]) {
  const lookup = value.toLowerCase();
  if (lookup.includes(cityName.toLowerCase())) {
    return true;
  }

  return serviceAreas.some((area) => lookup.includes(area.toLowerCase()));
}

function extractServiceCandidates(snippet: string, categoryName: string) {
  const segments = snippet
    .split(/[.!?;:|]/)
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  const candidates: string[] = [];
  for (const segment of segments) {
    const lower = segment.toLowerCase();
    if (lower.length < 4 || lower.length > 90) {
      continue;
    }

    if (!isServiceLike(segment, categoryName)) {
      continue;
    }

    if (NOISY_HINT_PATTERNS.some((pattern) => pattern.test(lower))) {
      continue;
    }

    const cleaned = cleanServiceHint(segment);
    if (cleaned) {
      candidates.push(cleaned);
    }
  }

  return uniqueValues(candidates, 6);
}

function getCacheKey(website: string) {
  return slugify(website.replace(/^https?:\/\//i, ''));
}

function getMetaContent(html: string, key: string, attribute: 'name' | 'property') {
  const pattern = new RegExp(
    `<meta[^>]+${attribute}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i',
  );
  const reversedPattern = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+${attribute}=["']${key}["'][^>]*>`,
    'i',
  );

  return stripHtml(html.match(pattern)?.[1] ?? html.match(reversedPattern)?.[1] ?? '');
}

function getTagContents(html: string, tag: string, limit: number) {
  const pattern = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const matches: string[] = [];

  for (const match of html.matchAll(pattern)) {
    const cleaned = stripHtml(match[1] ?? '');
    if (cleaned) {
      matches.push(cleaned);
    }

    if (matches.length >= limit) {
      break;
    }
  }

  return matches;
}

function collectJsonLdStrings(value: unknown, keyWhitelist: Set<string>, results: string[]) {
  if (!value || results.length >= 20) {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonLdStrings(item, keyWhitelist, results);
      if (results.length >= 20) {
        return;
      }
    }

    return;
  }

  if (typeof value === 'object') {
    for (const [key, entryValue] of Object.entries(value)) {
      if (typeof entryValue === 'string' && keyWhitelist.has(key)) {
        const cleaned = stripHtml(entryValue);
        if (cleaned) {
          results.push(cleaned);
        }
      } else {
        collectJsonLdStrings(entryValue, keyWhitelist, results);
      }

      if (results.length >= 20) {
        return;
      }
    }
  }
}

function extractJsonLdSnippets(html: string) {
  const pattern = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const results: string[] = [];
  const whitelist = new Set(['description', 'serviceType', 'areaServed', 'name']);

  for (const match of html.matchAll(pattern)) {
    const raw = (match[1] ?? '').trim();
    if (!raw) {
      continue;
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      collectJsonLdStrings(parsed, whitelist, results);
    } catch {
      continue;
    }
  }

  return uniqueValues(results, 10);
}

function buildWebsiteSignals(html: string, finalUrl: string, cityName: string, categoryName: string, serviceAreas: string[]) {
  const title = stripHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '');
  const metaDescription = getMetaContent(html, 'description', 'name');
  const ogDescription = getMetaContent(html, 'og:description', 'property');
  const headings = uniqueValues(
    [
      ...getTagContents(html, 'h1', 3),
      ...getTagContents(html, 'h2', 6),
      ...getTagContents(html, 'h3', 6),
    ],
    10,
  );
  const paragraphs = uniqueValues(getTagContents(html, 'p', 8), 6);
  const jsonLdSnippets = extractJsonLdSnippets(html);

  const rawSnippets = uniqueValues(
    [
      title,
      metaDescription,
      ogDescription,
      ...headings,
      ...paragraphs,
      ...jsonLdSnippets,
    ],
    20,
  );

  const serviceHints = uniqueValues(
    rawSnippets.flatMap((snippet) => extractServiceCandidates(snippet, categoryName)),
    8,
  );

  const locationHints = uniqueValues(
    rawSnippets
      .filter((snippet) => isLocationLike(snippet, cityName, serviceAreas))
      .map(sentenceCase),
    6,
  );

  return {
    fetchedAt: new Date().toISOString(),
    finalUrl,
    title: title || undefined,
    metaDescription: metaDescription || undefined,
    ogDescription: ogDescription || undefined,
    headings,
    paragraphs,
    serviceHints,
    locationHints,
    snippets: rawSnippets,
  } satisfies WebsiteSignals;
}

function buildLocationPhrase(business: DirectoryBusiness, cityName: string) {
  const areas = uniqueValues([...(business.serviceAreas ?? []), cityName], 3);
  return joinList(areas);
}

function buildServiceHints(business: DirectoryBusiness, websiteSignals: WebsiteSignals | undefined, categoryName: string) {
  const sourceCategory = business.source?.category ? sentenceCase(business.source.category) : '';
  const cleanedSpecialties = (business.specialties ?? [])
    .map(cleanServiceHint)
    .filter(Boolean)
    .filter((value) => isServiceLike(value, categoryName));
  const cleanedTags = (business.categoryTags ?? [])
    .map(cleanServiceHint)
    .filter(Boolean)
    .filter((value) => isServiceLike(value, categoryName));

  return uniqueValues(
    [
      ...websiteSignals?.serviceHints ?? [],
      sourceCategory,
      ...cleanedSpecialties,
      ...cleanedTags,
    ],
    4,
  );
}

function buildBaseDescription(record: {
  business: DirectoryBusiness;
  cityName: string;
  categoryName: string;
  websiteSignals?: WebsiteSignals;
}) {
  const { business, cityName, categoryName, websiteSignals } = record;
  const serviceHints = buildServiceHints(business, websiteSignals, categoryName);
  const locationPhrase = buildLocationPhrase(business, cityName);
  const hasWebsiteEvidence = (websiteSignals?.serviceHints.length ?? 0) > 0;

  const sentences = [
    `${business.name} is ${withIndefiniteArticle(categoryName.toLowerCase())} business serving ${locationPhrase}.`,
  ];

  if (serviceHints.length > 0) {
    const services = joinList(serviceHints.slice(0, 3).map((value) => value.toLowerCase()));
    sentences.push(
      hasWebsiteEvidence
        ? `Its website highlights ${services}.`
        : `Directory signals mention ${services}.`,
    );
  } else if (business.source?.category) {
    sentences.push(`It is listed as a ${business.source.category.toLowerCase()}.`);
  }

  const confidence: ConfidenceLevel =
    (websiteSignals?.serviceHints.length ?? 0) >= 2
      ? 'high'
      : serviceHints.length > 0 || (business.reviewCount ?? 0) >= 5
        ? 'medium'
        : 'low';

  const source: DescriptionSource =
    hasWebsiteEvidence
      ? 'website-signals'
      : serviceHints.length > 0
        ? 'directory-signals'
        : 'directory-fallback';

  return {
    id: business.id,
    name: business.name,
    cityId: business.cityId,
    cityName,
    categoryId: business.categoryId,
    categoryName,
    website: business.contact.website || undefined,
    description: sentences.join(' '),
    source,
    confidence,
    validationStatus: 'accepted',
    validationIssues: [],
    websiteSignals,
    evidence: {
      serviceHints,
      locationHints: uniqueValues([...(websiteSignals?.locationHints ?? []), ...(business.serviceAreas ?? []), cityName], 4),
      rating: business.rating,
      reviewCount: business.reviewCount,
    },
  } satisfies GeneratedDescription;
}

function normalizeForCompare(value: string) {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildAllowedTerms(record: GenerationRecord) {
  const parts = [
    record.business.name,
    record.cityName,
    record.categoryName,
    record.business.source?.category ?? '',
    ...(record.business.serviceAreas ?? []),
    ...record.generated.evidence.serviceHints,
    ...record.generated.evidence.locationHints,
    record.websiteSignals?.title ?? '',
    record.websiteSignals?.metaDescription ?? '',
    ...(record.websiteSignals?.headings ?? []),
  ];

  const normalized = normalizeForCompare(parts.join(' '));
  return new Set(normalized.split(/\s+/).filter((value) => value.length >= 4));
}

function validateDescription(record: GenerationRecord, description: string) {
  const issues: string[] = [];
  const normalized = normalizeWhitespace(description);
  const lower = normalized.toLowerCase();
  const sentences = splitSentences(normalized);
  const allowedTerms = buildAllowedTerms(record);

  if (!normalized) {
    issues.push('empty');
  }

  if (normalized.length > 320) {
    issues.push('too-long');
  }

  if (sentences.length > 3) {
    issues.push('too-many-sentences');
  }

  if (/\+?1?[-.\s(]*\d{3}[-.\s)]*\d{3}[-.\s]*\d{4}\b/.test(normalized)) {
    issues.push('contains-phone');
  }

  if (BLOCKED_PHRASES.some((phrase) => lower.includes(phrase))) {
    issues.push('cta-language');
  }

  const suspiciousWords = normalizeForCompare(normalized)
    .split(/\s+/)
    .filter((word) => word.length >= 6)
    .filter((word) => !allowedTerms.has(word));

  if (suspiciousWords.length >= 12) {
    issues.push('too-many-unverified-terms');
  }

  return {
    accepted: issues.length === 0,
    issues,
  };
}

function applyValidation(records: GenerationRecord[], baselineById: Map<string, GeneratedDescription>): GenerationRecord[] {
  return records.map((record) => {
    const validation = validateDescription(record, record.generated.description);
    if (validation.accepted) {
      return {
        ...record,
        generated: {
          ...record.generated,
          validationStatus: 'accepted' as const,
          validationIssues: [],
        },
      };
    }

    const fallback = baselineById.get(record.business.id) ?? record.generated;
    return {
      ...record,
      generated: {
        ...fallback,
        validationStatus: 'fallback' as const,
        validationIssues: validation.issues,
      },
    };
  });
}

function createOutputSummary(records: GenerationRecord[]) {
  return {
    selected: records.length,
    withWebsiteSignals: records.filter((record) => record.generated.source === 'website-signals' || record.generated.source === 'llm-rewrite').length,
    lowConfidence: records.filter((record) => record.generated.confidence === 'low').length,
    mediumConfidence: records.filter((record) => record.generated.confidence === 'medium').length,
    highConfidence: records.filter((record) => record.generated.confidence === 'high').length,
    accepted: records.filter((record) => record.generated.validationStatus !== 'fallback').length,
    fallback: records.filter((record) => record.generated.validationStatus === 'fallback').length,
  };
}

async function writeOutputFile(outputPath: string, options: CliOptions, records: GenerationRecord[]) {
  const output = {
    generatedAt: new Date().toISOString(),
    options,
    summary: createOutputSummary(records),
    descriptions: records.map((record) => record.generated),
  };

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
}

async function writeCheckpoint(checkpointFile: string, completed: number, records: GenerationRecord[]) {
  const checkpoint = {
    updatedAt: new Date().toISOString(),
    completed,
    records: records.map((record) => record.generated),
  };

  await writeFile(checkpointFile, `${JSON.stringify(checkpoint, null, 2)}\n`, 'utf8');
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

async function writeMergedDescriptionsToData(dataFile: string, records: GenerationRecord[]) {
  const descriptionById = new Map(records.map((record) => [record.business.id, record.generated.description]));
  const mergedBusinesses = businesses.map((business) => ({
    ...business,
    description: descriptionById.get(business.id) ?? business.description,
  }));

  const currentData = await readFile(dataFile, 'utf8');
  const exportMatch = currentData.match(/export const businesses(?::\s*Business\[\])?\s*=\s*\[/);
  const exportStart = exportMatch?.index ?? -1;
  const exportEnd = currentData.lastIndexOf('];');

  if (exportStart === -1 || exportEnd === -1 || exportEnd < exportStart) {
    throw new Error('Unable to locate businesses export in src/data.ts.');
  }

  const serializedBusinesses = `export const businesses: Business[] = ${formatValue(mergedBusinesses, 0)};\n`;
  const updatedData = `${currentData.slice(0, exportStart)}${serializedBusinesses}${currentData.slice(exportEnd + 2)}`;
  await writeFile(dataFile, updatedData, 'utf8');
}

function createServiceRoleSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function writeMergedDescriptionsToSupabase(records: GenerationRecord[]) {
  const supabase = createServiceRoleSupabaseClient();
  if (records.length === 0) {
    return;
  }

  for (const record of records) {
    const { error } = await supabase
      .from('businesses')
      .update({ description: record.generated.description })
      .eq('id', record.business.id);

    if (error) {
      throw new Error(`businesses: ${error.message}`);
    }
  }
}

async function loadCheckpoint(
  checkpointFile: string,
  citiesById: Map<string, { id: string; name: string; description: string }>,
  categoriesById: Map<string, { id: string; name: string; icon: string; groupId: string }>,
) {
  try {
    const raw = JSON.parse(await readFile(checkpointFile, 'utf8')) as {
      completed?: number;
      records?: GeneratedDescription[];
    };

    const checkpointRecords = (raw.records ?? []).flatMap((generated) => {
      const business = businesses.find((entry) => entry.id === generated.id);
      if (!business) {
        return [];
      }

      return [{
        business,
        cityName: citiesById.get(business.cityId)?.name ?? generated.cityName,
        categoryName: categoriesById.get(business.categoryId)?.name ?? generated.categoryName,
        websiteSignals: generated.websiteSignals,
        generated,
      } satisfies GenerationRecord];
    });

    return {
      completed: raw.completed ?? checkpointRecords.length,
      records: checkpointRecords,
    };
  } catch {
    return {
      completed: 0,
      records: [] as GenerationRecord[],
    };
  }
}

function extractJsonArray(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    throw new Error('Gemini returned an empty response.');
  }

  const fenced = normalized.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? normalized;
  const arrayStart = candidate.indexOf('[');
  const arrayEnd = candidate.lastIndexOf(']');

  if (arrayStart === -1 || arrayEnd === -1 || arrayEnd <= arrayStart) {
    throw new Error('Gemini did not return a JSON array.');
  }

  return JSON.parse(candidate.slice(arrayStart, arrayEnd + 1)) as Array<{
    id: string;
    description: string;
  }>;
}

async function rewriteDescriptionsWithGemini(records: GenerationRecord[], batchSize: number): Promise<GenerationRecord[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return records;
  }

  const ai = new GoogleGenAI({ apiKey });
  const rewritten = new Map<string, string>();

  for (let index = 0; index < records.length; index += batchSize) {
    const batch = records.slice(index, index + batchSize);
    const payload = batch.map((record) => ({
      id: record.business.id,
      name: record.business.name,
      city: record.cityName,
      category: record.categoryName,
      website: record.business.contact.website ?? '',
      currentDescription: record.generated.description,
      serviceHints: record.generated.evidence.serviceHints,
      locationHints: record.generated.evidence.locationHints,
      metaDescription: record.websiteSignals?.metaDescription ?? '',
      headings: record.websiteSignals?.headings ?? [],
    }));

    const prompt = [
      'Rewrite each directory description into 1-2 factual sentences.',
      'Use only facts present in the JSON input.',
      'Do not invent services, certifications, or coverage areas.',
      'Do not mention ratings or review counts.',
      'Keep the business name exactly as provided.',
      'Return JSON only: [{ "id": string, "description": string }].',
      JSON.stringify(payload),
    ].join('\n\n');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const parsed = extractJsonArray(response.text ?? '');
    for (const item of parsed) {
      if (item.id && item.description) {
        rewritten.set(item.id, sentenceCase(normalizeWhitespace(item.description)));
      }
    }
  }

  return records.map((record) => {
    const rewrittenDescription = rewritten.get(record.business.id);
    if (!rewrittenDescription) {
      return record;
    }

    return {
      ...record,
      generated: {
        ...record.generated,
        description: rewrittenDescription,
        source: 'llm-rewrite',
      },
    };
  });
}

async function rewriteDescriptionsWithOpenRouter(
  records: GenerationRecord[],
  batchSize: number,
  model: string,
): Promise<GenerationRecord[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return records;
  }

  const rewritten = new Map<string, string>();

  async function requestBatch(batch: GenerationRecord[]): Promise<void> {
    const payload = batch.map((record) => ({
      id: record.business.id,
      name: record.business.name,
      city: record.cityName,
      category: record.categoryName,
      website: record.business.contact.website ?? '',
      currentDescription: record.generated.description,
      serviceHints: record.generated.evidence.serviceHints,
      locationHints: record.generated.evidence.locationHints,
      metaDescription: record.websiteSignals?.metaDescription ?? '',
      headings: record.websiteSignals?.headings ?? [],
    }));

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: AbortSignal.timeout(45000),
        headers: {
          authorization: `Bearer ${apiKey}`,
          'content-type': 'application/json',
          'http-referer': process.env.APP_URL ?? 'https://github.dev',
          'x-title': 'Directory1 Description Generator',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content:
                'You rewrite directory descriptions from structured business evidence. Use only facts in the provided JSON. Remove slogans, testimonials, and CTA language. Keep each description to one or two factual sentences. Return JSON only.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                instructions: [
                  'For each business, rewrite the description into clean directory prose.',
                  'Do not invent services, regions, certifications, or years of experience.',
                  'Do not mention ratings or review counts.',
                  'Prefer concrete service nouns over marketing slogans.',
                  'Return an object with a single "items" array.',
                  'Each item must have { "id": string, "description": string }.',
                ],
                items: payload,
              }),
            },
          ],
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        throw new Error(`OpenRouter request failed with HTTP ${response.status}: ${rawText.slice(0, 400)}`);
      }

      const data = JSON.parse(rawText) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      const text = data.choices?.[0]?.message?.content ?? '';
      const parsed = JSON.parse(text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text) as {
        items?: Array<{ id: string; description: string }>;
      };

      for (const item of parsed.items ?? []) {
        if (item.id && item.description) {
          rewritten.set(item.id, sentenceCase(normalizeWhitespace(item.description)));
        }
      }
    } catch (error) {
      if (batch.length > 1) {
        const midpoint = Math.ceil(batch.length / 2);
        await requestBatch(batch.slice(0, midpoint));
        await requestBatch(batch.slice(midpoint));
        return;
      }

      const message = error instanceof Error ? error.message : String(error);
      console.warn(`OpenRouter rewrite failed for ${batch[0].business.name}: ${message}`);
    }
  }

  for (let index = 0; index < records.length; index += batchSize) {
    await requestBatch(records.slice(index, index + batchSize));
  }

  return records.map((record) => {
    const rewrittenDescription = rewritten.get(record.business.id);
    if (!rewrittenDescription) {
      return record;
    }

    return {
      ...record,
      generated: {
        ...record.generated,
        description: rewrittenDescription,
        source: 'llm-rewrite',
      },
    };
  });
}

async function mapWithConcurrency<T, R>(items: T[], concurrency: number, mapper: (item: T, index: number) => Promise<R>) {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return results;
}

async function fetchWebsiteSignals(website: string, cityName: string, categoryName: string, serviceAreas: string[], timeoutMs: number, refreshCache: boolean) {
  const normalizedWebsite = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  const cacheKey = getCacheKey(normalizedWebsite);
  const htmlCacheFile = path.join(htmlCacheDir, `${cacheKey}.html`);
  const signalCacheFile = path.join(signalCacheDir, `${cacheKey}.json`);

  if (!refreshCache) {
    try {
      const cachedSignals = JSON.parse(await readFile(signalCacheFile, 'utf8')) as WebsiteSignals;
      return cachedSignals;
    } catch {
      // Cache miss.
    }
  }

  let html = '';
  let finalUrl = normalizedWebsite;

  if (!refreshCache) {
    try {
      html = await readFile(htmlCacheFile, 'utf8');
    } catch {
      // Cache miss.
    }
  }

  if (!html) {
    const response = await fetch(normalizedWebsite, {
      redirect: 'follow',
      headers: {
        'user-agent': 'Directory1 Description Bot/1.0 (+https://github.dev)',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    finalUrl = response.url || normalizedWebsite;
    html = await response.text();
    await writeFile(htmlCacheFile, html, 'utf8');
  }

  const signals = buildWebsiteSignals(html, finalUrl, cityName, categoryName, serviceAreas);
  await writeFile(signalCacheFile, JSON.stringify(signals, null, 2), 'utf8');
  return signals;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  await mkdir(outputDir, { recursive: true });
  await mkdir(htmlCacheDir, { recursive: true });
  await mkdir(signalCacheDir, { recursive: true });

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const citiesById = new Map(cities.map((city) => [city.id, city]));

  const allSelectedBusinesses = businesses
    .filter((business) => (options.onlyWithWebsite ? Boolean(business.contact.website) : true))
    .slice(options.offset, options.offset + options.limit);

  const checkpoint = options.checkpointFile
    ? await loadCheckpoint(options.checkpointFile, citiesById, categoriesById)
    : { completed: 0, records: [] as GenerationRecord[] };

  const finalizedRecords: GenerationRecord[] = [...checkpoint.records];
  if (options.mergeDataFile && finalizedRecords.length > 0) {
    await writeMergedDescriptionsToData(options.mergeDataFile, finalizedRecords);
  }
  if (options.mergeSupabase && finalizedRecords.length > 0) {
    await writeMergedDescriptionsToSupabase(finalizedRecords);
  }
  const selectedBusinesses = allSelectedBusinesses.slice(checkpoint.completed);
  const chunkSize = Math.max(1, options.chunkSize);

  for (let start = 0; start < selectedBusinesses.length; start += chunkSize) {
    const businessChunk = selectedBusinesses.slice(start, start + chunkSize);
    const records: GenerationRecord[] = await mapWithConcurrency(businessChunk, options.concurrency, async (business) => {
      const cityName = citiesById.get(business.cityId)?.name ?? titleCase(business.cityId.replace(/-/g, ' '));
      const categoryName = categoriesById.get(business.categoryId)?.name ?? titleCase(business.categoryId.replace(/-/g, ' '));

      let websiteSignals: WebsiteSignals | undefined;
      if (business.contact.website) {
        try {
          websiteSignals = await fetchWebsiteSignals(
            business.contact.website,
            cityName,
            categoryName,
            business.serviceAreas ?? [cityName],
            options.timeoutMs,
            options.refreshCache,
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.warn(`Skipping website fetch for ${business.name}: ${message}`);
        }
      }

      return {
        business,
        cityName,
        categoryName,
        websiteSignals,
        generated: buildBaseDescription({ business, cityName, categoryName, websiteSignals }),
      } satisfies GenerationRecord;
    });

    const baselineById = new Map<string, GeneratedDescription>(records.map((record) => [record.business.id, record.generated]));
    let chunkFinalized: GenerationRecord[] = records;

    if (options.useLlm && records.length > 0) {
      if (process.env.OPENROUTER_API_KEY) {
        chunkFinalized = await rewriteDescriptionsWithOpenRouter(records, options.llmBatchSize, options.llmModel);
      } else if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
        chunkFinalized = await rewriteDescriptionsWithGemini(records, options.llmBatchSize);
      }
    }

    chunkFinalized = applyValidation(chunkFinalized, baselineById);
    finalizedRecords.push(...chunkFinalized);

    await writeOutputFile(options.output, options, finalizedRecords);
    if (options.checkpointFile) {
      await writeCheckpoint(options.checkpointFile, finalizedRecords.length, finalizedRecords);
    }
    if (options.mergeDataFile) {
      await writeMergedDescriptionsToData(options.mergeDataFile, finalizedRecords);
    }
    if (options.mergeSupabase) {
      await writeMergedDescriptionsToSupabase(finalizedRecords);
    }

    console.log(`Processed ${finalizedRecords.length}/${allSelectedBusinesses.length} businesses.`);
  }

  if (selectedBusinesses.length === 0) {
    await writeOutputFile(options.output, options, finalizedRecords);
    if (options.mergeDataFile) {
      await writeMergedDescriptionsToData(options.mergeDataFile, finalizedRecords);
    }
    if (options.mergeSupabase) {
      await writeMergedDescriptionsToSupabase(finalizedRecords);
    }
  }

  console.log(`Generated ${finalizedRecords.length} descriptions.`);
  console.log(`Output written to ${path.relative(repoRoot, options.output)}.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
