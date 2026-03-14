import {useDeferredValue, useMemo} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {ArrowRight, Search} from 'lucide-react';
import {motion} from 'motion/react';

import Breadcrumbs from '../components/Breadcrumbs';
import MobileDirectorySearch from '../components/MobileDirectorySearch';
import BusinessCard from '../components/BusinessCard';
import {Business} from '../business';
import {useDirectoryData} from '../directory-data';

function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

const searchAliases: Record<string, string[]> = {
  roofer: ['roofing', 'roofers', 'roofing contractors'],
  roofers: ['roofing', 'roofer', 'roofing contractors'],
  roofing: ['roofer', 'roofers'],
  plumber: ['plumbers', 'plumbing'],
  plumbers: ['plumber', 'plumbing'],
  electrician: ['electricians', 'electrical'],
  electricians: ['electrician', 'electrical'],
  hvac: ['heating', 'cooling', 'heating cooling contractors', 'hvac contractors'],
  painter: ['painters', 'painting', 'painting contractors'],
  painters: ['painter', 'painting', 'painting contractors'],
  landscaper: ['landscapers', 'landscape', 'landscape contractors'],
  landscapers: ['landscaper', 'landscape', 'landscape contractors'],
  contractor: ['contractors'],
  contractors: ['contractor'],
};

function tokenize(value: string) {
  return normalizeSearchValue(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function expandTokens(tokens: string[]) {
  const expanded = new Set(tokens);

  for (const token of tokens) {
    for (const alias of searchAliases[token] ?? []) {
      expanded.add(alias);
      for (const aliasToken of tokenize(alias)) {
        expanded.add(aliasToken);
      }
    }
  }

  return [...expanded];
}

function buildTokenGroups(tokens: string[]) {
  return tokens.map((token) => expandTokens([token]));
}

function getQueryCityId(query: string, cityOptions: { id: string; name: string }[]) {
  const normalized = normalizeSearchValue(query);
  return cityOptions.find((city) => normalized.includes(normalizeSearchValue(city.name)))?.id ?? '';
}

export default function SearchPage() {
  const {businesses, categories, cities} = useDirectoryData();
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') ?? '';
  const rawCityId = searchParams.get('city') ?? '';
  const query = normalizeSearchValue(rawQuery);
  const deferredQuery = useDeferredValue(query);
  const inferredCityId = rawCityId || getQueryCityId(rawQuery, cities);
  const tokenGroups = useMemo(() => buildTokenGroups(tokenize(deferredQuery)), [deferredQuery]);

  const city = cities.find((entry) => entry.id === inferredCityId);

  const results = useMemo(() => {
    const filteredByCity = inferredCityId ? businesses.filter((business) => business.cityId === inferredCityId) : businesses;

    if (!deferredQuery) {
      return [...filteredByCity]
        .sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0) || (right.reviewCount ?? 0) - (left.reviewCount ?? 0))
        .slice(0, 60) as Business[];
    }

    return filteredByCity
      .filter((business) => {
        const category = categories.find((entry) => entry.id === business.categoryId);
        const haystack = normalizeSearchValue([
          business.name,
          cities.find((entry) => entry.id === business.cityId)?.name,
          business.contact.address,
          business.contact.website,
          business.description,
          category?.name,
          ...(business.serviceAreas ?? []),
        ]
          .filter(Boolean)
          .join(' '));

        return tokenGroups.every((group) => group.some((token) => haystack.includes(token)));
      })
      .sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0) || (right.reviewCount ?? 0) - (left.reviewCount ?? 0)) as Business[];
  }, [deferredQuery, inferredCityId, tokenGroups]);

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -20}}
      transition={{duration: 0.4, ease: 'easeOut'}}
      className="bg-[#FAFAFA] min-h-screen pt-0 pb-16"
    >
      <MobileDirectorySearch
        cities={cities}
        initialQuery={rawQuery}
        initialCityId={inferredCityId}
        inlineMode="bar"
        inlineClassName="border-b border-zinc-200"
      />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 border-b border-zinc-200 pb-6">
          <div className="inline-flex items-center gap-2 border border-zinc-200 bg-white text-zinc-600 px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] mb-6 rounded-sm uppercase">
            <Search className="h-3 w-3 text-zinc-400" strokeWidth={1.5} /> Search Results
          </div>
          <h1 className="text-4xl font-medium text-zinc-900 tracking-tight mb-2">
            {rawQuery ? `Results for "${rawQuery}"` : 'Browse Businesses'}
          </h1>
          <p className="text-zinc-500 font-mono text-[10px] tracking-[0.15em] uppercase">
            {city ? `Filtered to ${city.name}` : 'All target regions'} / {results.length} results
          </p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white border border-zinc-200 p-16 text-center rounded-sm shadow-sm">
            <div className="w-12 h-12 border border-zinc-200 bg-[#FAFAFA] flex items-center justify-center mx-auto mb-6 rounded-sm">
              <Search className="h-5 w-5 text-zinc-400" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-medium tracking-tight text-zinc-900 mb-4">No matching assets found</h2>
            <p className="text-zinc-500 font-sans text-sm mb-8 max-w-md mx-auto leading-relaxed">
              Try a core trade like electrician, roofing, HVAC, painting, or search by business name.
            </p>
            <Link to="/" className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 font-sans text-sm font-medium hover:bg-zinc-800 transition-colors rounded-sm shadow-sm">
              <ArrowRight className="h-4 w-4 rotate-180" strokeWidth={1.5} /> Return Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {results.map((business) => (
              <div key={business.id} className="h-full">
                <BusinessCard business={business as Business} />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
