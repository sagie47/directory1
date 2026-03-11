import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {businesses, categories, cities} from '../src/data';

type Business = (typeof businesses)[number];
type City = (typeof cities)[number];
type Category = (typeof categories)[number];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'generated', 'gmaps-scraper');

const queryOverrides: Record<string, string[]> = {
  'general-contractors': ['general contractors', 'custom home builders'],
  'carpenters-framing': ['framing contractors', 'carpenters'],
  'concrete-contractors': ['concrete contractors'],
  'masonry-brick-stone': ['masonry contractors', 'brick stone masonry'],
  roofing: ['roofing contractors', 'roofers'],
  'excavation-site-prep': ['excavation contractors', 'site preparation contractors'],
  demolition: ['demolition contractors'],
  'civil-construction-pipelayers': ['civil construction companies', 'utility contractors', 'pipelayers', 'water sewer contractors'],
  'structural-steel-erectors': ['structural steel fabricators', 'steel erectors', 'steel contractors'],
  'scaffolding-shoring': ['scaffolding rental', 'shoring contractors', 'scaffolding services'],
  'marine-construction-dock-builders': ['dock builders', 'marine construction', 'boat lift installers', 'retaining wall contractors'],
  'waterproofing-foundation-repair': ['foundation repair', 'basement waterproofing', 'crawl space repair', 'concrete waterproofing'],
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
  'solar-panel-installers': ['solar installers', 'solar panel installers', 'solar energy contractors'],
  'fire-protection-sprinkler-systems': ['fire protection systems', 'sprinkler system installers', 'fire sprinkler contractors'],
  'security-av-low-voltage': ['security system installers', 'home automation', 'low voltage contractors', 'commercial security systems'],
  'elevator-escalator-installers': ['elevator installers', 'elevator maintenance', 'elevator service companies'],
  'drywall-specialists': ['drywall contractors'],
  painters: ['painting contractors', 'painters'],
  'flooring-installers': ['flooring installers', 'flooring contractors'],
  'tile-installers': ['tile installers', 'tile contractors'],
  'cabinet-makers-millwork': ['cabinet makers', 'millwork contractors'],
  'insulation-contractors': ['insulation contractors'],
  'log-home-timber-frame-builders': ['log home builders', 'timber frame builders', 'custom timber homes'],
  'stucco-plastering-eifs': ['stucco contractors', 'plastering contractors', 'EIFS contractors'],
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
  'pool-spa-installers': ['pool builders', 'spa installers', 'hot tub installers', 'swimming pool contractors'],
  'gutters-eavestroughing': ['gutter installers', 'eavestrough contractors', 'gutter cleaning services'],
  'snow-removal': ['snow removal', 'snow plowing services'],
  'welding-metal-fabrication': ['welders', 'metal fabrication shops'],
  'glass-glaziers': ['glaziers', 'glass contractors'],
  'garage-door-services': ['garage door services', 'garage door installers'],
  'sheet-metal-fabrication': ['sheet metal contractors', 'custom sheet metal fabrication', 'architectural sheet metal'],
  'asbestos-hazmat-abatement': ['asbestos abatement', 'hazmat removal', 'mold asbestos remediation'],
  'junk-removal': ['junk removal'],
  restoration: ['restoration contractors', 'water fire mold restoration'],
  'handyman-services': ['handyman services'],
};

function parseArgs(argv: string[]) {
  const options = {
    city: '',
    includeBusinessQueries: false,
    mode: 'full',
    minCount: 10,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--city' && next) {
      options.city = next;
      index += 1;
      continue;
    }

    if (arg === '--include-business-queries') {
      options.includeBusinessQueries = true;
      continue;
    }

    if (arg === '--mode' && next) {
      options.mode = next;
      index += 1;
      continue;
    }

    if (arg === '--min-count' && next) {
      options.minCount = Number(next);
      index += 1;
    }
  }

  return options;
}

function getQueryTerms(category: Category) {
  return queryOverrides[category.id] ?? [category.name];
}

function selectCities(cityFilter: string) {
  if (!cityFilter) {
    return cities;
  }

  return cities.filter((city) => city.id === cityFilter);
}

function getSelectedPairs(selectedCities: City[], mode: string, minCount: number) {
  const cityIds = new Set(selectedCities.map((city) => city.id));
  const cityCategoryCounts = new Map<string, number>();

  for (const business of businesses) {
    if (!cityIds.has(business.cityId)) {
      continue;
    }

    const key = `${business.cityId}::${business.categoryId}`;
    cityCategoryCounts.set(key, (cityCategoryCounts.get(key) ?? 0) + 1);
  }

  const includeAll = mode !== 'supplement';

  return selectedCities.flatMap((city) =>
    categories
      .filter((category) => includeAll || (cityCategoryCounts.get(`${city.id}::${category.id}`) ?? 0) < minCount)
      .map((category) => ({
        city,
        category,
        existingCount: cityCategoryCounts.get(`${city.id}::${category.id}`) ?? 0,
      })),
  );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const selectedCities = selectCities(options.city);

  if (selectedCities.length === 0) {
    throw new Error(`No city matched filter "${options.city}".`);
  }

  await mkdir(outputDir, {recursive: true});

  const queryLines = new Set<string>();
  const businessLines = new Set<string>();
  const selectedPairs = getSelectedPairs(selectedCities, options.mode, options.minCount);

  for (const {city, category} of selectedPairs) {
    for (const term of getQueryTerms(category)) {
      queryLines.add(`${term} in ${city.name} BC`);
    }
  }

  if (options.includeBusinessQueries) {
    for (const business of businesses) {
      if (business.source?.provider !== 'serper') {
        continue;
      }

      if (!selectedCities.some((city) => city.id === business.cityId)) {
        continue;
      }

      const parts = [business.name, business.contact.address].filter(Boolean);
      if (parts.length > 0) {
        businessLines.add(parts.join(', '));
      }
    }
  }

  const queryFile = path.join(outputDir, options.city ? `${options.city}-queries.txt` : 'queries.txt');
  const businessFile = path.join(outputDir, options.city ? `${options.city}-businesses.txt` : 'businesses.txt');

  await writeFile(queryFile, `${[...queryLines].sort().join('\n')}\n`, 'utf8');

  if (options.includeBusinessQueries) {
    await writeFile(businessFile, `${[...businessLines].sort().join('\n')}\n`, 'utf8');
  }

  console.log(`Wrote ${queryLines.size} query prompts to ${path.relative(repoRoot, queryFile)}.`);
  console.log(
    `Selected ${selectedPairs.length} city/category pairs in ${options.mode} mode${options.mode === 'supplement' ? ` (minCount=${options.minCount})` : ''}.`,
  );
  if (options.includeBusinessQueries) {
    console.log(`Wrote ${businessLines.size} business prompts to ${path.relative(repoRoot, businessFile)}.`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
