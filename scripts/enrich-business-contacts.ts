import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolveMx } from 'node:dns/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { businesses, categories, cities } from '../src/data';

type InputRecord = {
  businessId?: string;
  businessName?: string;
  cityId?: string;
  categoryId?: string;
  website: string;
};

type DomainCandidate = {
  originalWebsite: string;
  homepageUrl: string;
  domain: string;
  host: string;
  businesses: Array<{
    id: string;
    name: string;
    cityId: string;
    cityName: string;
    categoryId: string;
    categoryName: string;
    phone?: string;
    existingEmail?: string;
    existingWebsite?: string;
  }>;
};

type FetchResult = {
  url: string;
  ok: boolean;
  status?: number;
  contentType?: string;
  html?: string;
  error?: string;
};

type DomainEnrichment = {
  domain: string;
  host: string;
  homepageUrl: string;
  finalUrl?: string;
  status: 'success' | 'partial' | 'failed' | 'skipped';
  pagesVisited: string[];
  visibleEmails: string[];
  guessedEmails: string[];
  phoneNumbers: string[];
  contactPages: string[];
  contactForms: string[];
  socialLinks: string[];
  mxHosts: string[];
  notes: string[];
  fetchedAt: string;
};

type BusinessContactRow = {
  businessId: string;
  businessName: string;
  cityId: string;
  cityName: string;
  categoryId: string;
  categoryName: string;
  directoryPath: string;
  directoryUrl: string;
  domain: string;
  homepageUrl: string;
  bestContactMethod: 'email' | 'guessed_email' | 'contact_form' | 'phone_only' | 'website_only';
  preferredContact: string;
  visibleEmails: string[];
  guessedEmails: string[];
  existingEmail?: string;
  phoneNumbers: string[];
  contactPages: string[];
  contactForms: string[];
  socialLinks: string[];
  mxHosts: string[];
  notes: string[];
};

type PersistedState = {
  updatedAt: string;
  domains: Record<string, DomainEnrichment>;
};

type ScriptOptions = {
  inputPath?: string;
  outputDir: string;
  concurrency: number;
  limit?: number;
  timeoutMs: number;
  maxPagesPerDomain: number;
  guessRoles: boolean;
  exportOnly: boolean;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const defaultOutputDir = path.join(repoRoot, 'generated', 'business-contact-enrichment');
const defaultStateFile = 'domain-results.json';
const DIRECTORY_BASE_URL = 'https://okanagantradesdirectory.com';
const USER_AGENT = 'OkanaganTradesContactCrawler/1.0 (+https://okanagantrades.com)';
const CONTACT_PAGE_HINTS = [
  '/contact',
  '/contact-us',
  '/about',
  '/about-us',
  '/team',
  '/get-in-touch',
];
const ROLE_EMAIL_PREFIXES = ['info', 'hello', 'office', 'admin', 'contact'];

function parseArgs(argv: string[]): ScriptOptions {
  const options: ScriptOptions = {
    outputDir: defaultOutputDir,
    concurrency: 4,
    timeoutMs: 15000,
    maxPagesPerDomain: 6,
    guessRoles: true,
    exportOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];

    switch (value) {
      case '--input':
        options.inputPath = argv[index + 1];
        index += 1;
        break;
      case '--output-dir':
        options.outputDir = path.resolve(repoRoot, argv[index + 1]);
        index += 1;
        break;
      case '--concurrency':
        options.concurrency = Number(argv[index + 1]) || options.concurrency;
        index += 1;
        break;
      case '--limit':
        options.limit = Number(argv[index + 1]) || undefined;
        index += 1;
        break;
      case '--timeout-ms':
        options.timeoutMs = Number(argv[index + 1]) || options.timeoutMs;
        index += 1;
        break;
      case '--max-pages':
        options.maxPagesPerDomain = Number(argv[index + 1]) || options.maxPagesPerDomain;
        index += 1;
        break;
      case '--no-role-guesses':
        options.guessRoles = false;
        break;
      case '--export-only':
        options.exportOnly = true;
        break;
      default:
        break;
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

function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(withProtocol);
    url.hash = '';
    url.search = '';
    return url.toString();
  } catch {
    return undefined;
  }
}

function getDomainKeyFromUrl(value: string) {
  const url = new URL(value);
  return url.hostname.replace(/^www\./i, '').toLowerCase();
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#64;|&#x40;|&commat;/gi, '@')
    .replace(/&#46;|&#x2e;/gi, '.')
    .replace(/&amp;/gi, '&')
    .replace(/\s+\[at\]\s+|\s+\(at\)\s+|\sat\s/gi, '@')
    .replace(/\s+\[dot\]\s+|\s+\(dot\)\s+|\sdot\s/gi, '.');
}

function stripNonVisibleContent(value: string) {
  return decodeHtmlEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupe(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function extractEmails(value: string) {
  const decoded = decodeHtmlEntities(value);
  const matches = decoded.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) ?? [];

  return dedupe(matches.map((match) => match.toLowerCase()))
    .filter((email) => !email.endsWith('.png'))
    .filter((email) => !email.endsWith('.jpg'))
    .filter((email) => !email.endsWith('.jpeg'))
    .filter((email) => !email.endsWith('.webp'))
    .filter((email) => !email.includes('example.com'));
}

function extractPhoneNumbers(value: string) {
  const matches = value.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/g) ?? [];
  return dedupe(matches.map((match) => match.trim()));
}

function extractHrefAttributes(html: string) {
  const hrefMatches = html.matchAll(/href\s*=\s*["']([^"']+)["']/gi);
  return [...hrefMatches].map((match) => match[1]).filter(Boolean);
}

function extractFormActions(html: string) {
  const actionMatches = html.matchAll(/<form[^>]*action\s*=\s*["']([^"']+)["']/gi);
  return [...actionMatches].map((match) => match[1]).filter(Boolean);
}

function normalizeUrl(value: string, baseUrl: string) {
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return undefined;
  }
}

function getSocialLinks(hrefs: string[]) {
  return dedupe(hrefs.filter((href) =>
    /(facebook|instagram|linkedin|x\.com|twitter|youtube|tiktok)/i.test(href)
  ));
}

function choosePreferredEmail(visibleEmails: string[], guessedEmails: string[]) {
  if (visibleEmails.length > 0) {
    return {
      method: 'email' as const,
      value: visibleEmails[0],
    };
  }

  if (guessedEmails.length > 0) {
    return {
      method: 'guessed_email' as const,
      value: guessedEmails[0],
    };
  }

  return undefined;
}

async function fetchHtml(url: string, timeoutMs: number): Promise<FetchResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
    });

    const contentType = response.headers.get('content-type') ?? undefined;
    if (!response.ok) {
      return {
        url,
        ok: false,
        status: response.status,
        contentType,
        error: `HTTP ${response.status}`,
      };
    }

    if (!contentType || !contentType.includes('text/html')) {
      return {
        url,
        ok: false,
        status: response.status,
        contentType,
        error: `Unsupported content type: ${contentType ?? 'unknown'}`,
      };
    }

    const html = await response.text();
    return {
      url: response.url,
      ok: true,
      status: response.status,
      contentType,
      html,
    };
  } catch (error: unknown) {
    return {
      url,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function resolveMxHosts(domain: string) {
  try {
    const records = await resolveMx(domain);
    return dedupe(records.map((record) => record.exchange.toLowerCase())).sort();
  } catch {
    return [];
  }
}

async function loadInputRecords(inputPath?: string): Promise<InputRecord[]> {
  if (!inputPath) {
    const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
    const citiesById = new Map(cities.map((city) => [city.id, city.name]));

    return businesses
      .filter((business) => business.contact.website?.trim())
      .map((business) => ({
        businessId: business.id,
        businessName: business.name,
        cityId: business.cityId,
        categoryId: business.categoryId,
        website: business.contact.website ?? '',
      }));
  }

  const resolvedInputPath = path.resolve(repoRoot, inputPath);
  const raw = await readFile(resolvedInputPath, 'utf8');

  if (resolvedInputPath.endsWith('.json')) {
    const parsed = JSON.parse(raw) as InputRecord[];
    return parsed;
  }

  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((website) => ({ website }));
}

function buildDomainCandidates(records: InputRecord[]) {
  const categoriesById = new Map(categories.map((category) => [category.id, category.name]));
  const citiesById = new Map(cities.map((city) => [city.id, city.name]));
  const domains = new Map<string, DomainCandidate>();

  for (const record of records) {
    const normalizedWebsite = normalizeWebsite(record.website);
    if (!normalizedWebsite) {
      continue;
    }

    const domain = getDomainKeyFromUrl(normalizedWebsite);
    const homepageUrl = (() => {
      const url = new URL(normalizedWebsite);
      return `${url.protocol}//${url.host}/`;
    })();

    const existing = domains.get(domain) ?? {
      originalWebsite: normalizedWebsite,
      homepageUrl,
      domain,
      host: domain,
      businesses: [],
    };

    existing.businesses.push({
      id: record.businessId ?? slugify(`${domain}-${existing.businesses.length + 1}`),
      name: record.businessName ?? domain,
      cityId: record.cityId ?? '',
      cityName: citiesById.get(record.cityId ?? '') ?? '',
      categoryId: record.categoryId ?? '',
      categoryName: categoriesById.get(record.categoryId ?? '') ?? '',
      phone: businesses.find((business) => business.id === record.businessId)?.contact.phone,
      existingEmail: businesses.find((business) => business.id === record.businessId)?.contact.email,
      existingWebsite: record.website,
    });

    domains.set(domain, existing);
  }

  return [...domains.values()].sort((left, right) => left.domain.localeCompare(right.domain));
}

function getContactCandidateUrls(homepageUrl: string, html: string, maxPagesPerDomain: number) {
  const hrefs = extractHrefAttributes(html);
  const normalizedHrefs = hrefs
    .map((href) => normalizeUrl(href, homepageUrl))
    .filter((href): href is string => Boolean(href));

  const internalCandidates = normalizedHrefs
    .filter((href) => new URL(href).hostname === new URL(homepageUrl).hostname)
    .filter((href) => /(contact|about|team|quote|get-in-touch|reach-us)/i.test(href));

  const defaultCandidates = CONTACT_PAGE_HINTS
    .map((hint) => normalizeUrl(hint, homepageUrl))
    .filter((href): href is string => Boolean(href));

  return dedupe([homepageUrl, ...internalCandidates, ...defaultCandidates]).slice(0, maxPagesPerDomain);
}

async function enrichDomain(candidate: DomainCandidate, options: ScriptOptions): Promise<DomainEnrichment> {
  const notes: string[] = [];
  const visibleEmails: string[] = [];
  const phoneNumbers: string[] = [];
  const contactPages: string[] = [];
  const contactForms: string[] = [];
  const socialLinks: string[] = [];
  const pagesVisited: string[] = [];

  const homepageResult = await fetchHtml(candidate.homepageUrl, options.timeoutMs);
  if (!homepageResult.ok || !homepageResult.html) {
    notes.push(homepageResult.error ?? 'Homepage fetch failed');

    const mxHosts = options.guessRoles ? await resolveMxHosts(candidate.domain) : [];
    const guessedEmails = options.guessRoles && mxHosts.length > 0
      ? ROLE_EMAIL_PREFIXES.map((prefix) => `${prefix}@${candidate.domain}`)
      : [];

    return {
      domain: candidate.domain,
      host: candidate.host,
      homepageUrl: candidate.homepageUrl,
      status: guessedEmails.length > 0 ? 'partial' : 'failed',
      pagesVisited,
      visibleEmails,
      guessedEmails,
      phoneNumbers,
      contactPages,
      contactForms,
      socialLinks,
      mxHosts,
      notes,
      fetchedAt: new Date().toISOString(),
    };
  }

  const candidateUrls = getContactCandidateUrls(candidate.homepageUrl, homepageResult.html, options.maxPagesPerDomain);

  for (const url of candidateUrls) {
    const result = url === candidate.homepageUrl ? homepageResult : await fetchHtml(url, options.timeoutMs);
    pagesVisited.push(url);

    if (!result.ok || !result.html) {
      if (result.error) {
        notes.push(`${url}: ${result.error}`);
      }
      continue;
    }

    const hrefs = extractHrefAttributes(result.html);
    const visibleText = stripNonVisibleContent(result.html);
    const formActions = extractFormActions(result.html)
      .map((action) => normalizeUrl(action, result.url))
      .filter((action): action is string => Boolean(action));

    visibleEmails.push(...extractEmails(visibleText));
    visibleEmails.push(...hrefs.filter((href) => href.startsWith('mailto:')).flatMap((href) => extractEmails(href)));
    phoneNumbers.push(...extractPhoneNumbers(visibleText));
    socialLinks.push(...getSocialLinks(hrefs));

    if (/(contact|about|team|get-in-touch)/i.test(url)) {
      contactPages.push(result.url);
    }

    contactForms.push(...formActions);
  }

  const dedupedVisibleEmails = dedupe(visibleEmails);
  const dedupedPhoneNumbers = dedupe(phoneNumbers);
  const dedupedContactPages = dedupe(contactPages);
  const dedupedContactForms = dedupe(contactForms);
  const dedupedSocialLinks = dedupe(socialLinks);
  const mxHosts = options.guessRoles ? await resolveMxHosts(candidate.domain) : [];
  const guessedEmails = dedupedVisibleEmails.length === 0 && options.guessRoles && mxHosts.length > 0
    ? ROLE_EMAIL_PREFIXES.map((prefix) => `${prefix}@${candidate.domain}`)
    : [];

  const status = dedupedVisibleEmails.length > 0 || dedupedContactForms.length > 0 || dedupedPhoneNumbers.length > 0
    ? 'success'
    : guessedEmails.length > 0
      ? 'partial'
      : 'failed';

  if (dedupedVisibleEmails.length === 0 && dedupedContactForms.length === 0) {
    notes.push('No visible email or contact form found');
  }

  return {
    domain: candidate.domain,
    host: candidate.host,
    homepageUrl: candidate.homepageUrl,
    finalUrl: homepageResult.url,
    status,
    pagesVisited: dedupe(pagesVisited),
    visibleEmails: dedupedVisibleEmails,
    guessedEmails,
    phoneNumbers: dedupedPhoneNumbers,
    contactPages: dedupedContactPages,
    contactForms: dedupedContactForms,
    socialLinks: dedupedSocialLinks,
    mxHosts,
    notes: dedupe(notes),
    fetchedAt: new Date().toISOString(),
  };
}

function businessRowFromDomainResult(candidate: DomainCandidate, enrichment: DomainEnrichment) {
  return candidate.businesses.map<BusinessContactRow>((business) => {
    const preferredEmail = choosePreferredEmail(enrichment.visibleEmails, enrichment.guessedEmails);
    const existingEmail = business.existingEmail?.trim() || undefined;
    const directoryPath = `/${business.cityId}/${business.categoryId}/${business.id}`;

    let bestContactMethod: BusinessContactRow['bestContactMethod'] = 'website_only';
    let preferredContact = enrichment.homepageUrl;

    if (existingEmail) {
      bestContactMethod = 'email';
      preferredContact = existingEmail;
    } else if (preferredEmail) {
      bestContactMethod = preferredEmail.method;
      preferredContact = preferredEmail.value;
    } else if (enrichment.contactForms.length > 0) {
      bestContactMethod = 'contact_form';
      preferredContact = enrichment.contactForms[0];
    } else if (enrichment.phoneNumbers.length > 0 || business.phone) {
      bestContactMethod = 'phone_only';
      preferredContact = business.phone ?? enrichment.phoneNumbers[0];
    }

    return {
      businessId: business.id,
      businessName: business.name,
      cityId: business.cityId,
      cityName: business.cityName,
      categoryId: business.categoryId,
      categoryName: business.categoryName,
      directoryPath,
      directoryUrl: `${DIRECTORY_BASE_URL}${directoryPath}`,
      domain: candidate.domain,
      homepageUrl: enrichment.homepageUrl,
      bestContactMethod,
      preferredContact,
      visibleEmails: enrichment.visibleEmails,
      guessedEmails: enrichment.guessedEmails,
      existingEmail,
      phoneNumbers: dedupe([...(business.phone ? [business.phone] : []), ...enrichment.phoneNumbers]),
      contactPages: enrichment.contactPages,
      contactForms: enrichment.contactForms,
      socialLinks: enrichment.socialLinks,
      mxHosts: enrichment.mxHosts,
      notes: enrichment.notes,
    };
  });
}

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function toCsv(rows: BusinessContactRow[]) {
  const headers = [
    'business_id',
    'business_name',
    'city_id',
    'city_name',
    'category_id',
    'category_name',
    'directory_path',
    'directory_url',
    'domain',
    'homepage_url',
    'best_contact_method',
    'preferred_contact',
    'existing_email',
    'visible_emails',
    'guessed_emails',
    'phone_numbers',
    'contact_pages',
    'contact_forms',
    'social_links',
    'mx_hosts',
    'notes',
  ];

  const lines = rows.map((row) => [
    row.businessId,
    row.businessName,
    row.cityId,
    row.cityName,
    row.categoryId,
    row.categoryName,
    row.directoryPath,
    row.directoryUrl,
    row.domain,
    row.homepageUrl,
    row.bestContactMethod,
    row.preferredContact,
    row.existingEmail ?? '',
    row.visibleEmails.join(' | '),
    row.guessedEmails.join(' | '),
    row.phoneNumbers.join(' | '),
    row.contactPages.join(' | '),
    row.contactForms.join(' | '),
    row.socialLinks.join(' | '),
    row.mxHosts.join(' | '),
    row.notes.join(' | '),
  ].map(csvEscape).join(','));

  return `${headers.join(',')}\n${lines.join('\n')}\n`;
}

async function loadState(outputDir: string): Promise<PersistedState> {
  try {
    const raw = await readFile(path.join(outputDir, defaultStateFile), 'utf8');
    return JSON.parse(raw) as PersistedState;
  } catch {
    return {
      updatedAt: new Date(0).toISOString(),
      domains: {},
    };
  }
}

async function saveState(outputDir: string, state: PersistedState) {
  state.updatedAt = new Date().toISOString();
  await writeFile(
    path.join(outputDir, defaultStateFile),
    `${JSON.stringify(state, null, 2)}\n`,
    'utf8',
  );
}

async function writeOutputs(outputDir: string, domainCandidates: DomainCandidate[], state: PersistedState) {
  const domainResults = domainCandidates
    .map((candidate) => state.domains[candidate.domain])
    .filter((result): result is DomainEnrichment => Boolean(result));
  const businessRows = domainCandidates.flatMap((candidate) => {
    const result = state.domains[candidate.domain];
    return result ? businessRowFromDomainResult(candidate, result) : [];
  });

  await writeFile(
    path.join(outputDir, 'domain-enrichment.json'),
    `${JSON.stringify(domainResults, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    path.join(outputDir, 'business-contact-enrichment.json'),
    `${JSON.stringify(businessRows, null, 2)}\n`,
    'utf8',
  );
  await writeFile(
    path.join(outputDir, 'business-contact-enrichment.csv'),
    toCsv(businessRows),
    'utf8',
  );
}

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
) {
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      await worker(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker())
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  await mkdir(options.outputDir, { recursive: true });

  const records = await loadInputRecords(options.inputPath);
  const domainCandidates = buildDomainCandidates(records);
  const limitedCandidates = options.limit ? domainCandidates.slice(0, options.limit) : domainCandidates;
  const state = await loadState(options.outputDir);
  const pendingCandidates = limitedCandidates.filter((candidate) => !state.domains[candidate.domain]);

  console.log(`Loaded ${records.length} website records.`);
  console.log(`Unique domains: ${domainCandidates.length}. Pending domains: ${pendingCandidates.length}.`);

  if (options.exportOnly) {
    await writeOutputs(options.outputDir, limitedCandidates, state);
    console.log(`Exported ${limitedCandidates.length} domain candidates from saved state.`);
    return;
  }

  await runWithConcurrency(pendingCandidates, options.concurrency, async (candidate, index) => {
    const result = await enrichDomain(candidate, options);
    state.domains[candidate.domain] = result;
    await saveState(options.outputDir, state);

    const completed = index + 1;
    console.log(
      `[${completed}/${pendingCandidates.length}] ${candidate.domain} -> ${result.status} (${result.visibleEmails.length} visible emails, ${result.contactForms.length} forms, ${result.phoneNumbers.length} phones)`
    );
  });

  await writeOutputs(options.outputDir, limitedCandidates, state);

  console.log(`Wrote outputs to ${path.relative(repoRoot, options.outputDir)}.`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
