import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, Search, UserRound } from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import WorkerCard from '@/src/components/WorkerCard';
import { useDirectoryData } from '@/src/directory-data';
import {
  type WorkerAvailability,
  type WorkerProfile,
  fetchApprovedWorkerProfiles,
} from '@/src/lib/workerProfiles';

const availabilityOptions: Array<{ value: '' | WorkerAvailability; label: string }> = [
  { value: '', label: 'Any availability' },
  { value: 'on_demand', label: 'On-demand' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'full_time', label: 'Full-time' },
];

export default function WorkersPage() {
  const { cities, categories, isLoading: directoryLoading } = useDirectoryData();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'' | WorkerAvailability>('');
  const [searchQuery, setSearchQuery] = useState('');

  const cityNames = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  useEffect(() => {
    let isActive = true;

    async function loadWorkers() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchApprovedWorkerProfiles();
        if (isActive) {
          setWorkers(data);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load worker profiles.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadWorkers();

    return () => {
      isActive = false;
    };
  }, []);

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return workers
      .filter((worker) => !cityFilter || worker.city_id === cityFilter)
      .filter((worker) => !categoryFilter || worker.category_id === categoryFilter)
      .filter((worker) => !availabilityFilter || worker.availability === availabilityFilter)
      .filter((worker) => {
        if (!query) return true;
        return [
          worker.display_name,
          worker.headline,
          worker.bio,
          worker.rate_label ?? '',
          worker.skills.join(' '),
          cityNames.get(worker.city_id) ?? worker.city_id,
          worker.category_id ? categoryNames.get(worker.category_id) ?? worker.category_id : '',
        ].some((value) => value.toLowerCase().includes(query));
      });
  }, [availabilityFilter, categoryFilter, categoryNames, cityFilter, cityNames, searchQuery, workers]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo
        title="Okanagan Trades Workers | Hire Local Tradespeople"
        description="Browse verified Okanagan tradespeople and labourers available for work. Filter by trade, city, and availability, then contact them directly."
        path="/workers"
        keywords={[
          'okanagan tradespeople',
          'kelowna labourers for hire',
          'okanagan workers available',
          'hire local trades okanagan',
        ]}
      />

      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-8 border-b border-zinc-200 pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <SectionEyebrow
              icon={UserRound}
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-orange-500"
            >
              Worker profiles
            </SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase leading-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Hire local tradespeople
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">
              Browse verified profiles of Okanagan tradespeople and labourers available for work, then reach out
              to them directly.
            </p>
          </div>
          <Link
            to="/worker/start"
            className="inline-flex min-h-12 items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:border-orange-500 hover:bg-orange-500 hover:shadow-none"
          >
            Create your profile
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-8 border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_repeat(3,minmax(10rem,14rem))]">
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Search</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Name, skills, trade, or city"
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
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Availability</label>
              <select value={availabilityFilter} onChange={(event) => setAvailabilityFilter(event.target.value as '' | WorkerAvailability)} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                {availabilityOptions.map((option) => <option key={option.value || 'all'} value={option.value}>{option.label}</option>)}
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
              <h2 className="text-2xl font-bold text-zinc-950">{filteredWorkers.length} available</h2>
              <p className="hidden font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400 sm:block">Approved profiles only</p>
            </div>

            {filteredWorkers.length === 0 ? (
              <div className="border border-zinc-200 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-lg font-semibold text-zinc-950">No worker profiles match these filters.</p>
                <p className="mt-2 text-sm text-zinc-500">Create a profile and it will appear here after admin review.</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredWorkers.map((worker) => (
                  <div key={worker.id} className="h-full">
                    <WorkerCard
                      worker={worker}
                      cityName={cityNames.get(worker.city_id) ?? worker.city_id}
                      categoryName={worker.category_id ? categoryNames.get(worker.category_id) ?? worker.category_id : 'General labour'}
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
