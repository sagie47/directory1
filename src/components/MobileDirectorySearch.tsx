import { FormEvent, useEffect, useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

import { useLayoutChrome } from './Layout';

interface CityOption {
  id: string;
  name: string;
}

interface MobileDirectorySearchProps {
  cities: CityOption[];
  initialQuery?: string;
  initialCityId?: string;
  inlineClassName?: string;
  inlineMode?: 'pill' | 'bar';
}

const mobileSearchTransition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function MobileDirectorySearch({
  cities,
  initialQuery = '',
  initialCityId = '',
  inlineClassName = '',
  inlineMode = 'pill',
}: MobileDirectorySearchProps) {
  const navigate = useNavigate();
  const { isMobileMenuOpen } = useLayoutChrome();
  const [query, setQuery] = useState(initialQuery);
  const [cityId, setCityId] = useState(initialCityId);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showCompactSearch, setShowCompactSearch] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCityId(initialCityId);
  }, [initialCityId]);

  useEffect(() => {
    function handleScroll() {
      setShowCompactSearch(window.scrollY > 28);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();
    if (query.trim()) {
      params.set('q', query.trim());
    }
    if (cityId) {
      params.set('city', cityId);
    }

    setIsMobileSearchOpen(false);
    navigate(`/search${params.size > 0 ? `?${params.toString()}` : ''}`);
  }

  const compactSearchLabel = query.trim() || 'Search contractors';
  const selectedCityName = cities.find((city) => city.id === cityId)?.name ?? 'All Okanagan';
  const inlineContainerClassName = inlineMode === 'bar'
    ? 'mx-auto w-full max-w-7xl bg-zinc-50 px-4 py-3 sm:px-6 md:hidden lg:px-8'
    : 'mx-auto w-full max-w-7xl px-4 pt-3 sm:px-6 md:hidden lg:px-8';
  const inlineButtonClassName = inlineMode === 'bar'
    ? 'flex w-full min-w-0 items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white px-3 py-2.5 text-left shadow-[0_2px_10px_rgba(24,24,27,0.05)]'
    : 'flex w-full min-w-0 items-center gap-3 rounded-[2rem] border border-zinc-200 bg-white px-4 py-3 text-left shadow-[0_8px_24px_rgba(24,24,27,0.08)]';

  return (
    <>
      <div className={`${inlineContainerClassName} ${inlineClassName}`}>
        <button
          type="button"
          className={inlineButtonClassName}
          onClick={() => setIsMobileSearchOpen(true)}
          aria-label="Open mobile search"
        >
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
            <Search className="h-4 w-4" strokeWidth={2.3} />
          </span>
          <div className="min-w-0 flex flex-1 items-center gap-2 overflow-hidden">
            <p className="truncate font-sans text-[14px] font-medium tracking-[-0.02em] text-zinc-900">{compactSearchLabel}</p>
            {cityId ? (
              <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                {selectedCityName}
              </span>
            ) : null}
          </div>
        </button>
      </div>

      <AnimatePresence>
        {(showCompactSearch || isMobileSearchOpen) && !isMobileMenuOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={mobileSearchTransition}
            className="fixed inset-x-4 z-40 flex items-center gap-2 rounded-full border border-zinc-900/8 bg-white/96 px-2.5 py-2 shadow-[0_18px_40px_rgba(24,24,27,0.18)] ring-1 ring-white/70 backdrop-blur-xl md:hidden"
            style={{ top: 'var(--mobile-search-offset, 4.85rem)' }}
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-full bg-white px-3 py-2 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Open compact mobile search"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white shadow-sm">
                <Search className="h-3.5 w-3.5" strokeWidth={2.3} />
              </span>
              <div className="min-w-0 flex flex-1 items-center gap-2 overflow-hidden">
                <p className="truncate font-sans text-[14px] font-medium tracking-[-0.03em] text-zinc-900">{compactSearchLabel}</p>
                {cityId ? (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    {selectedCityName}
                  </span>
                ) : null}
              </div>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileSearchOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={mobileSearchTransition}
            className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden"
            style={{ paddingTop: 'var(--mobile-search-offset, 4.85rem)' }}
          >
            <div className="mx-auto flex max-h-[calc(100svh-var(--mobile-search-offset,4.85rem)-0.75rem)] w-full max-w-xl flex-col overflow-hidden rounded-[2rem] border border-zinc-900/10 bg-[rgba(248,246,241,0.98)] shadow-[0_24px_52px_rgba(24,24,27,0.18)] ring-1 ring-white/80">
              <div className="flex items-center justify-between border-b border-zinc-900/8 bg-white/90 px-5 py-4">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-600">Search Directory</p>
                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-900/10 bg-white text-zinc-900 transition-colors hover:bg-zinc-900 hover:text-white"
                  aria-label="Close mobile search"
                >
                  <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
                </button>
              </div>

              <form onSubmit={handleSearch} className="flex h-full flex-col">
                <div className="space-y-3 overflow-y-auto px-4 py-4">
                  <div className="rounded-[1.4rem] border border-zinc-900/10 bg-white p-4 shadow-[0_8px_20px_rgba(24,24,27,0.05)]">
                    <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Trade / Service</label>
                    <div className="flex items-center gap-3 rounded-[1rem] border border-zinc-200 bg-zinc-50 px-3 py-3">
                      <Search className="h-[18px] w-[18px] text-zinc-500" strokeWidth={2} />
                      <input
                        type="text"
                        placeholder="Plumber, Roofer, Electrician"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className="w-full border-none bg-transparent font-sans text-base text-zinc-900 outline-none placeholder:text-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-zinc-900/10 bg-white p-4 shadow-[0_8px_20px_rgba(24,24,27,0.05)]">
                    <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Region</label>
                    <div className="flex items-center gap-3 rounded-[1rem] border border-zinc-200 bg-zinc-50 px-3 py-3">
                      <MapPin className="h-[18px] w-[18px] text-zinc-500" strokeWidth={2} />
                      <select
                        value={cityId}
                        onChange={(event) => setCityId(event.target.value)}
                        className="w-full appearance-none border-none bg-transparent font-sans text-base text-zinc-900 outline-none"
                      >
                        <option value="">All Okanagan</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-zinc-900/8 bg-white/92 px-4 py-4">
                  <button
                    type="button"
                    className="font-sans text-sm font-semibold text-zinc-700 underline underline-offset-2"
                    onClick={() => {
                      setQuery('');
                      setCityId('');
                    }}
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 px-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_24px_rgba(24,24,27,0.22)] transition-all hover:border-orange-500 hover:bg-orange-500"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
