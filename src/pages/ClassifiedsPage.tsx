import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Hammer,
  Mail,
  MapPin,
  Phone,
  Search,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useDirectoryData } from '@/src/directory-data';
import {
  type Classified,
  type ClassifiedDurationType,
  fetchApprovedClassifieds,
} from '@/src/lib/classifieds';

type QuickFilter = 'jobs' | 'on_demand' | 'short_term' | 'full_time';

const quickFilters: Array<{ value: QuickFilter; label: string }> = [
  { value: 'jobs', label: 'All jobs' },
  { value: 'on_demand', label: 'On-demand' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'full_time', label: 'Full-time' },
];

const durationOptions: Array<{ value: '' | ClassifiedDurationType; label: string }> = [
  { value: '', label: 'Any duration' },
  { value: 'on_demand', label: 'On-demand' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'full_time', label: 'Full-time' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

function durationLabel(value: ClassifiedDurationType) {
  if (value === 'on_demand') return 'On-demand';
  if (value === 'short_term') return 'Short-term';
  return 'Full-time';
}

function kindLabel(value: Classified['kind']) {
  return value === 'job' ? 'Hiring' : 'Available for work';
}

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function dateRangeLabel(listing: Classified) {
  const start = formatDate(listing.start_date);
  const end = formatDate(listing.end_date);

  if (start && end) return `${start} to ${end}`;
  if (start) return `Starts ${start}`;
  if (end) return `Until ${end}`;
  return null;
}

interface ClassifiedCardProps {
  listing: Classified;
  cityName: string;
  categoryName: string;
}

function ClassifiedCard({ listing, cityName, categoryName }: ClassifiedCardProps) {
  const range = dateRangeLabel(listing);

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35 }}
      className="border border-zinc-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              {listing.kind === 'job' ? <BriefcaseBusiness className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
              {kindLabel(listing.kind)}
            </span>
            <span className="inline-flex items-center border border-orange-200 bg-orange-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
              {durationLabel(listing.duration_type)}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold leading-tight text-zinc-950">{listing.title}</h2>
          {listing.organization_name ? (
            <p className="mt-2 text-sm font-semibold text-zinc-700">{listing.organization_name}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {listing.contact_phone ? (
            <a
              href={`tel:${listing.contact_phone}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800"
            >
              <Phone className="h-4 w-4" />
              Call
            </a>
          ) : null}
          {listing.contact_email ? (
            <a
              href={`mailto:${listing.contact_email}`}
              className="inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-200 bg-white px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
            >
              <Mail className="h-4 w-4" />
              Email
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-zinc-400" />
          <span>{cityName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hammer className="h-4 w-4 text-zinc-400" />
          <span>{categoryName}</span>
        </div>
        {listing.compensation_label ? (
          <div className="font-semibold text-zinc-900">{listing.compensation_label}</div>
        ) : (
          <div className="text-zinc-400">Rate not posted</div>
        )}
        {range ? (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-zinc-400" />
            <span>{range}</span>
          </div>
        ) : (
          <div className="text-zinc-400">Dates flexible</div>
        )}
      </div>

      <p className="mt-5 whitespace-pre-line text-base leading-7 text-zinc-700">{listing.description}</p>

      <div className="mt-5 border-t border-zinc-100 pt-4 text-sm text-zinc-500">
        Contact: <span className="font-semibold text-zinc-800">{listing.contact_name}</span>
      </div>
    </motion.article>
  );
}

export default function ClassifiedsPage() {
  const { cities, categories, isLoading: directoryLoading } = useDirectoryData();
  const [listings, setListings] = useState<Classified[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('jobs');
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState<'' | ClassifiedDurationType>('');
  const [searchQuery, setSearchQuery] = useState('');

  const cityNames = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  useEffect(() => {
    let isActive = true;

    async function loadListings() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApprovedClassifieds();
        if (isActive) {
          setListings(data);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load classifieds.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadListings();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredListings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return listings
      .filter((listing) => {
        if (quickFilter === 'jobs') return listing.kind === 'job';
        return listing.kind === 'job' && listing.duration_type === quickFilter;
      })
      .filter((listing) => !cityFilter || listing.city_id === cityFilter)
      .filter((listing) => !categoryFilter || listing.category_id === categoryFilter)
      .filter((listing) => !durationFilter || listing.duration_type === durationFilter)
      .filter((listing) => {
        if (!query) return true;
        return [
          listing.title,
          listing.description,
          listing.organization_name ?? '',
          listing.compensation_label ?? '',
          cityNames.get(listing.city_id) ?? listing.city_id,
          listing.category_id ? categoryNames.get(listing.category_id) ?? listing.category_id : '',
        ].some((value) => value.toLowerCase().includes(query));
      });
  }, [categoryFilter, categoryNames, cityFilter, cityNames, durationFilter, listings, quickFilter, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo
        title="Okanagan Trades Jobs | Hiring On-demand, Short-term and Full-time"
        description="Browse moderated Okanagan trades job posts for on-demand shifts, short-term projects, and full-time roles. Looking for work? Create a worker profile."
        path="/jobs"
        keywords={[
          'okanagan trades jobs',
          'okanagan construction jobs',
          'kelowna trades hiring',
          'okanagan trades work',
        ]}
      />

      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 border-b border-zinc-200 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <SectionEyebrow
              icon={BriefcaseBusiness}
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-orange-500"
            >
              Moderated job board
            </SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase leading-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Trades jobs across the Okanagan
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">
              Find approved local job posts for on-demand help, short-term projects, and full-time roles.
            </p>
          </div>
          <Link
            to="/jobs/post"
            className="inline-flex min-h-12 items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:border-orange-500 hover:bg-orange-500 hover:shadow-none"
          >
            Post a job
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Link
          to="/workers"
          className="mt-8 flex flex-wrap items-center justify-between gap-3 border border-zinc-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-zinc-900"
        >
          <span className="text-sm text-zinc-700">
            <span className="font-semibold text-zinc-950">Looking to hire someone directly?</span> Browse available workers and tradespeople.
          </span>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-900">
            View workers
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <section className="mt-8 border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setQuickFilter(filter.value)}
                className={`inline-flex min-h-11 items-center border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${
                  quickFilter === filter.value
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-950'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(10rem,14rem))]">
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Title, description, company, city, or trade"
                  className="w-full border border-zinc-200 bg-zinc-50 px-11 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">City</label>
              <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                <option value="">All cities</option>
                {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Trade</label>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                <option value="">All trades</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Duration</label>
              <select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value as '' | ClassifiedDurationType)} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                {durationOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-8 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {loading || directoryLoading ? (
          <div className="mt-10 flex min-h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
          </div>
        ) : (
          <section className="mt-8">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-zinc-950">{filteredListings.length} listings</h2>
              <p className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 sm:block">Approved posts only</p>
            </div>

            {filteredListings.length === 0 ? (
              <div className="border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-lg font-semibold text-zinc-950">No approved jobs match these filters.</p>
                <p className="mt-2 text-sm text-zinc-500">Post a new job and it will appear here after admin review.</p>
              </div>
            ) : (
              <div className="grid gap-5">
                {filteredListings.map((listing) => (
                  <div key={listing.id}>
                    <ClassifiedCard
                      listing={listing}
                      cityName={cityNames.get(listing.city_id) ?? listing.city_id}
                      categoryName={listing.category_id ? categoryNames.get(listing.category_id) ?? listing.category_id : 'General labour'}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </motion.div>
  );
}
