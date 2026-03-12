import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ChevronRight, Menu, SlidersHorizontal, X, Zap, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import FeatureCard from '../components/FeatureCard';
import { useLayoutChrome } from '../components/Layout';
import SectionEyebrow from '../components/SectionEyebrow';
import { AnimatePresence, motion } from 'motion/react';
import heroImage from '../photos/2024_active_transportation_construction_hintringer_63.jpg';
import businessBg from '../photos/job-construction-scaled.jpg';
import { useDirectoryData } from '../directory-data';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const heroVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const mobileSearchTransition = {
  duration: 0.22,
  ease: [0.16, 1, 0.3, 1] as const,
};

export default function Home() {
  const navigate = useNavigate();
  const { isMobileMenuOpen, openMobileMenu } = useLayoutChrome();
  const { cities, categories, businesses } = useDirectoryData();
  const [query, setQuery] = useState('');
  const [cityId, setCityId] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [showCompactSearch, setShowCompactSearch] = useState(false);
  const featuredBusinesses = useMemo(
    () => [...businesses].sort((left, right) => (right.rating ?? 0) - (left.rating ?? 0) || (right.reviewCount ?? 0) - (left.reviewCount ?? 0)).slice(0, 3),
    [businesses],
  );
  const popularCategoryIds = ['electricians', 'plumbers', 'hvac-contractors', 'roofing'];
  const popularCategories = categories.filter(c => popularCategoryIds.includes(c.id));
  const otherCategories = categories.filter(c => !popularCategoryIds.includes(c.id));

  function getCategoryLink(categoryId: string) {
    return cityId ? `/${cityId}/${categoryId}` : `/regions?category=${categoryId}`;
  }

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

  useEffect(() => {
    function handleScroll() {
      setShowCompactSearch(window.scrollY > 12);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const selectedCityName = cities.find((city) => city.id === cityId)?.name ?? 'All Okanagan';
  const compactSearchLabel = query.trim() ? query.trim() : 'Search contractors';
  const hasSelectedCity = Boolean(cityId);
  const heroImageSrc = preferSupabaseImage('2024_active_transportation_construction_hintringer_63.jpg', heroImage);
  const businessBgSrc = preferSupabaseImage('job-construction-scaled.jpg', businessBg);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900"
    >
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
                {hasSelectedCity ? (
                  <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                    {selectedCityName}
                  </span>
                ) : null}
              </div>
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950 active:scale-95"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Open search filters"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />
            </button>

            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-900/10 bg-zinc-900 text-white transition-colors hover:bg-orange-500 active:scale-95"
              onClick={openMobileMenu}
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" strokeWidth={2.2} />
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

                  <div className="rounded-[1.4rem] border border-zinc-900/10 bg-white p-4 shadow-[0_8px_20px_rgba(24,24,27,0.05)]">
                    <p className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Suggested searches</p>
                    <div className="grid grid-cols-1 gap-2">
                      {['Emergency plumber', 'HVAC repair', 'Roof inspection'].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="flex items-center justify-between rounded-[0.95rem] border border-zinc-200 px-3 py-2.5 text-left font-sans text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                          onClick={() => setQuery(suggestion)}
                        >
                          <span>{suggestion}</span>
                          <ArrowRight className="h-4 w-4" strokeWidth={2} />
                        </button>
                      ))}
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

      {/* Dramatic Hero Section */}
      <section className="relative flex min-h-[calc(100svh-var(--mobile-header-height,4.65rem))] items-end overflow-hidden bg-zinc-900 px-0 pb-6 pt-8 text-white sm:min-h-[82svh] sm:pb-14 sm:pt-24 lg:min-h-[100svh] lg:pb-24 lg:pt-44">
        {/* Full-width Background Image with subtle darkening for contrast */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.58 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            src={heroImageSrc}
            alt="Okanagan Valley Architecture" 
            className="w-full h-full object-cover"
            onError={createImageFallbackHandler(heroImage)}
          />
          {/* Gradient from left to right so text is readable but image is visible */}
          <div className="absolute inset-0 z-10 bg-gradient-to-r from-zinc-950/92 via-zinc-900/68 to-zinc-900/30"></div>
          {/* Subtle bottom gradient to blend with the overlapping grid */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-zinc-950/88 via-zinc-900/30 to-zinc-900/10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
        </div>
        
        <div className="relative z-20 mx-auto flex w-full max-w-[96rem] flex-1 px-5 sm:px-6 lg:px-10">
          <motion.div variants={heroVariants} initial="hidden" animate="show" className="flex max-w-md flex-col items-start text-left sm:max-w-2xl lg:max-w-4xl">
            <motion.h1 variants={heroItemVariants} className="mb-4 text-4xl font-medium leading-[0.96] tracking-tight text-balance text-white drop-shadow-2xl sm:mb-6 sm:text-5xl md:text-6xl lg:mb-8 lg:text-[7rem]">
              Build with <span className="font-serif italic font-light text-zinc-200">Confidence.</span>
            </motion.h1>
            
            <motion.p variants={heroItemVariants} className="mb-8 max-w-sm text-base leading-7 text-zinc-200 drop-shadow-md sm:mb-12 sm:max-w-xl sm:text-lg md:text-xl lg:mb-16">
              Find trusted contractors across the Okanagan for design, build, repair, and maintenance.
            </motion.p>
            
            {!showCompactSearch && !isMobileSearchOpen && !isMobileMenuOpen ? (
              <motion.div
                variants={heroItemVariants}
                className="group relative mt-auto flex w-full items-center gap-2 rounded-[1.6rem] border border-white/16 bg-[rgba(245,244,240,0.12)] p-2 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:hidden"
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 rounded-[1.1rem] border border-white/12 bg-white/10 px-3 py-2"
                  onClick={() => setIsMobileSearchOpen(true)}
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/12 text-white">
                    <Search className="h-3.5 w-3.5" strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0 flex flex-1 items-center gap-2 overflow-hidden">
                    <p className="truncate font-sans text-[14px] font-medium tracking-[-0.03em] text-white/95">{compactSearchLabel}</p>
                    {hasSelectedCity ? (
                      <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/70">
                        {selectedCityName}
                      </span>
                    ) : null}
                  </div>
                </button>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/72 transition-colors hover:bg-white/18 hover:text-white"
                  onClick={() => setIsMobileSearchOpen(true)}
                  aria-label="Open search filters"
                >
                  <SlidersHorizontal className="h-4 w-4" strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/18 bg-white/16 text-white/88 transition-colors hover:bg-white hover:text-zinc-900"
                  onClick={() => setIsMobileSearchOpen(true)}
                  aria-label="Open mobile search"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </button>
              </motion.div>
            ) : null}

            {/* Massive Search Bar */}
            <motion.form variants={heroItemVariants} onSubmit={handleSearch} className="group/search relative hidden w-full max-w-5xl flex-col gap-3 rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-[0_20px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:flex md:flex-row md:items-center">
              <div className="relative flex-1 rounded-full border border-white/10 bg-white/12 transition-all duration-300 hover:bg-white/20 focus-within:border-indigo-400/50 focus-within:bg-white/20">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-400 group-focus-within/search:text-indigo-400 transition-colors" strokeWidth={1.5} />
                </div>
                <input 
                  type="text" 
                  placeholder="Trade / Service" 
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="block w-full rounded-full border-none bg-transparent py-4 pl-14 pr-4 text-base text-white outline-none transition-all duration-300 placeholder:text-zinc-500 sm:py-5 sm:pr-6 sm:text-lg"
                />
              </div>
              
              <div className="relative flex-1 rounded-full border border-white/10 bg-white/12 transition-all duration-300 hover:bg-white/20 focus-within:border-indigo-400/50 focus-within:bg-white/20">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-zinc-400 group-focus-within/search:text-indigo-400 transition-colors" strokeWidth={1.5} />
                </div>
                <select 
                  value={cityId}
                  onChange={(event) => setCityId(event.target.value)}
                  className="block w-full appearance-none cursor-pointer rounded-full border-none bg-transparent py-4 pl-14 pr-12 text-base text-white outline-none transition-all duration-300 sm:py-5 sm:text-lg"
                >
                  <option value="" className="text-zinc-900">All Regions</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id} className="text-zinc-900">{city.name}</option>
                  ))}
                </select>
              </div>
              
              <button type="submit" className="group/btn flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-full bg-white px-6 py-4 font-sans text-base font-semibold text-zinc-950 shadow-lg transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98] sm:px-10 sm:text-lg md:px-12 md:py-5">
                <span className="relative z-10 flex items-center gap-2">Search <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300 ease-out" strokeWidth={2} /></span>
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Popular Categories Grid - Overlapping the Hero */}
      <section className="relative z-20 mb-8 px-0 pt-4 sm:mb-12 sm:px-6 sm:pt-6 lg:mb-16 lg:px-10 lg:pt-10">
        <div className="mx-auto w-full max-w-[96rem] overflow-hidden border-y-2 border-zinc-900 bg-white shadow-2xl sm:rounded-xl sm:border-2">
          <div className="flex flex-col md:flex-row">
            <div className="relative flex w-full flex-col justify-center overflow-hidden border-b-2 border-zinc-900 bg-zinc-50 p-10 lg:p-12 md:w-72 md:border-b-0 md:border-r-2 group/core">
              <div className="absolute left-0 top-0 hidden h-2 w-full bg-zinc-900 sm:block"></div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-zinc-200/50 rounded-full blur-3xl group-hover/core:bg-zinc-300/50 transition-colors duration-700"></div>
              <h2 className="mb-2 font-sans text-3xl font-bold uppercase tracking-tight text-zinc-900">Core Trades</h2>
              <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 font-bold uppercase">Primary Infrastructure</p>
            </div>
            
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 bg-white relative">
              {popularCategories.map((category, index) => {
                const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
                // Assign a unique vibrant color pair for each card's hover state
                const colorGradients = [
                  'from-amber-400 to-orange-500', 
                  'from-blue-500 to-indigo-600', 
                  'from-emerald-400 to-teal-500', 
                  'from-rose-400 to-pink-500'
                ];
                const gradient = colorGradients[index % colorGradients.length];

                return (
                  <Link 
                    key={category.id}
                    to={getCategoryLink(category.id)}
                    className={`group relative flex aspect-square flex-col justify-between overflow-hidden border-zinc-200 bg-white p-10 transition-all duration-500 ease-[0.16,1,0.3,1] hover:z-20 hover:shadow-2xl lg:p-12 ${index % 2 !== 0 ? 'border-l' : ''} ${index < 2 ? 'border-b lg:border-b-0' : ''} lg:border-l`}
                  >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0`}></div>
                    
                    <div className="relative z-10 flex items-start justify-between">
                      <div className="text-zinc-900 transition-all duration-500 ease-[0.16,1,0.3,1] origin-left group-hover:-rotate-3 group-hover:scale-110 group-hover:text-white">
                      <IconComponent className="h-10 w-10" strokeWidth={2} />
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-400 transition-colors duration-300 group-hover:text-white/80">[{businesses.filter((business) => business.categoryId === category.id).length}]</span>
                    </div>
                    
                    <div className="relative z-10 mt-8">
                      <h3 className="font-sans text-xl font-bold text-zinc-900 transition-colors duration-300 group-hover:text-white">{category.name}</h3>
                    </div>
                    
                    <div className="absolute right-10 top-10 z-10 opacity-0 transition-all duration-500 ease-out group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:opacity-100">
                      <ArrowRight className="h-6 w-6 text-white" strokeWidth={3} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Businesses Section */}
      <section className="relative z-10 border-b-2 border-zinc-900 bg-zinc-50 py-12 text-zinc-900 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-8 flex flex-col justify-between gap-6 sm:mb-12 sm:flex-row sm:items-end">
            <div>
              <SectionEyebrow
                icon={Star}
                className="mb-6 inline-flex items-center gap-2 bg-zinc-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
                iconClassName="h-4 w-4 fill-orange-500 text-orange-500"
              >
                Premium Selection
              </SectionEyebrow>
              <h2 className="text-4xl font-bold uppercase tracking-tight mb-3 text-zinc-900">Featured Operators</h2>
              <p className="font-mono text-sm text-zinc-600 uppercase tracking-wide">Top rated operational assets across the region.</p>
            </div>
            <Link to="/kelowna" className="group flex items-center gap-3 text-zinc-900 font-sans text-sm font-bold uppercase tracking-wider transition-all bg-white border border-zinc-200 px-6 py-3 rounded-sm shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
              View Directory <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {featuredBusinesses.map((business) => (
              <motion.div key={business.id} variants={itemVariants} className="h-full">
                <BusinessCard business={business} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Industry Standard Section */}
      <section className="relative z-10 overflow-hidden border-y-2 border-zinc-900 bg-zinc-900 text-white">
        <motion.img
          initial={{ scale: 1.04, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            src={businessBgSrc}
            alt="Construction site in the Okanagan"
            className="absolute inset-0 h-full w-full object-cover"
            onError={createImageFallbackHandler(businessBg)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/92 via-zinc-950/62 to-zinc-950/35"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-transparent to-transparent"></div>

        <div className="relative mx-auto flex min-h-[34rem] max-w-[96rem] items-end px-4 py-16 sm:px-6 lg:min-h-[42rem] lg:px-10 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-orange-300">
              <span className="w-8 h-px bg-orange-300/50"></span>
              Operational Excellence
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-white lg:text-6xl">
              Setting the <br /> <span className="font-serif font-light italic text-zinc-200">Industry Standard.</span>
            </h2>
            <p className="mt-8 max-w-2xl font-sans text-lg font-medium leading-relaxed text-zinc-200 lg:text-xl">
              The Okanagan building landscape is defined by precision and durability. Our directory connects you with the professionals who built the region&apos;s most critical infrastructure and residential milestones.
            </p>
            <div className="mt-10 grid max-w-lg grid-cols-2 gap-8 border-t border-white/15 pt-8">
              <div>
                <div className="mb-1 text-3xl font-black text-white">100%</div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-300">Verified Trades</div>
              </div>
              <div>
                <div className="mb-1 text-3xl font-black text-white">24/7</div>
                <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-zinc-300">Project Support</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All Trades Section */}
      <section className="relative z-10 py-24 bg-zinc-50 border-b-2 border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500">
                <span className="h-px w-8 bg-zinc-300"></span>
                Complete Trade Index
              </div>
              <h2 className="mt-4 text-4xl font-bold uppercase tracking-tight text-zinc-900">Explore Every Category</h2>
              <p className="mt-3 max-w-2xl font-sans text-base text-zinc-600">
                Browse the full directory by trade. Start with the service you need, then narrow by region.
              </p>
            </div>
            <Link
              to="/trades"
              className="group inline-flex items-center gap-3 self-start border-2 border-zinc-900 bg-white px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-900 transition-all hover:bg-zinc-900 hover:text-white"
            >
              View All Trades
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4 lg:grid-cols-3"
          >
            {otherCategories.map((category) => {
              const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
              const count = businesses.filter((business) => business.categoryId === category.id).length;

              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link
                    to={getCategoryLink(category.id)}
                    className="group flex items-center gap-4 border-x-0 border-y border-zinc-200 bg-white px-4 py-4 transition-all duration-300 ease-[0.16,1,0.3,1] hover:-translate-y-1 hover:border-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.12)] sm:border-2 sm:border-transparent"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border-2 border-zinc-200 bg-zinc-50 text-zinc-400 transition-colors duration-300 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                      <IconComponent
                        className="h-5 w-5 transition-all duration-300 ease-[0.16,1,0.3,1] group-hover:-rotate-6 group-hover:scale-110"
                        strokeWidth={2.4}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-sans text-base font-bold text-zinc-700 transition-colors duration-300 group-hover:text-zinc-950">
                        {category.name}
                      </h3>
                    </div>
                    <span className="shrink-0 font-mono text-xs font-bold text-zinc-400 transition-colors duration-300 group-hover:text-orange-500">
                      [{count}]
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Own a Trade Business Section */}
      <section className="relative z-10 overflow-hidden border-t-2 border-zinc-900 bg-white py-20 text-zinc-900 group/cta sm:py-24 lg:py-32">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
            <div>
              <SectionEyebrow
                icon={Zap}
                className="mb-8 inline-flex items-center gap-2 border-2 border-zinc-900 bg-zinc-50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-zinc-600"
                iconClassName="h-4 w-4 text-orange-500"
              >
                Contractor Portal
              </SectionEyebrow>
              <h2 className="mb-6 text-4xl font-bold uppercase tracking-tighter leading-[0.95] sm:text-5xl md:text-6xl lg:mb-8 lg:text-7xl">
                Own a Trade <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Business?</span>
              </h2>
              <p className="mb-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-600 sm:mb-10 sm:text-xl lg:mb-12">
                Claim your profile to control how you show up in the directory, or see the lead-capture system if missed calls and slow follow-up are costing you jobs.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/claim" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-zinc-900 px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:bg-orange-600 hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-500/20 active:translate-y-0 sm:px-8 sm:py-5 group">
                  Claim Your Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </Link>
                <Link to="/never-miss-a-lead" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-zinc-200 bg-white px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-zinc-900 shadow-md transition-all hover:bg-zinc-50 hover:-translate-y-1 hover:shadow-xl active:translate-y-0 sm:px-8 sm:py-5">
                  Stop Missing Leads
                </Link>
              </div>
              
              <p className="mt-10 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:mt-12 sm:tracking-[0.3em]">
                <span className="w-8 h-px bg-zinc-200"></span>
                Free claim or lead-capture demo for Okanagan trades.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:gap-8">
              {[
                { title: 'Update Details', desc: 'Control your presence in the local market.', icon: 'Info' },
                { title: 'Showcase Work', desc: 'Add service areas & high-res project photos.', icon: 'Camera' },
                { title: 'Lead Alerts', desc: 'Get notified of inquiries immediately.', icon: 'Bell' },
                { title: 'Scale Faster', desc: 'Upgrade for premium visibility & placement.', icon: 'TrendingUp' }
              ].map((item, i) => {
                const IconComponent = (Icons as any)[item.icon] || Icons.CheckCircle2;
                return (
                  <div key={i}>
                    <FeatureCard
                      title={item.title}
                      description={item.desc}
                      icon={IconComponent}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
