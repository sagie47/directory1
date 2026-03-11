import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ShieldCheck, MapPin, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

import BusinessCard from '../components/BusinessCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { useDirectoryData } from '../directory-data';
import businessBg from '../photos/job-construction-scaled.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const PAGE_SIZE = 12;

export default function VerifiedPage() {
  const { businesses, categories, categoryGroups, cities } = useDirectoryData();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  const citiesById = useMemo(
    () => new Map(cities.map((city) => [city.id, city])),
    [cities],
  );

  const visibleCategories = useMemo(() => {
    if (groupFilter === 'all') {
      return categories;
    }

    return categories.filter((category) => category.groupId === groupFilter);
  }, [categories, groupFilter]);

  useEffect(() => {
    if (categoryFilter === 'all') {
      return;
    }

    const categoryStillVisible = visibleCategories.some((category) => category.id === categoryFilter);
    if (!categoryStillVisible) {
      setCategoryFilter('all');
    }
  }, [categoryFilter, visibleCategories]);

  const filteredBusinesses = useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

    return businesses
      .filter((business) => {
        if (cityFilter !== 'all' && business.cityId !== cityFilter) {
          return false;
        }

        const category = categoriesById.get(business.categoryId);
        if (groupFilter !== 'all' && category?.groupId !== groupFilter) {
          return false;
        }

        if (categoryFilter !== 'all' && business.categoryId !== categoryFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const city = citiesById.get(business.cityId);
        const searchFields = [
          business.name,
          business.description ?? '',
          city?.name ?? '',
          category?.name ?? '',
          ...(business.categoryTags ?? []),
          ...(business.serviceAreas ?? []),
        ];

        return searchFields.some((field) => field.toLowerCase().includes(normalizedSearch));
      })
      .sort((left, right) =>
        (right.rating ?? 0) - (left.rating ?? 0)
        || (right.reviewCount ?? 0) - (left.reviewCount ?? 0)
        || left.name.localeCompare(right.name)
      );
  }, [businesses, categoriesById, categoryFilter, citiesById, cityFilter, deferredSearchQuery, groupFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredBusinesses.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearchQuery, cityFilter, groupFilter, categoryFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedBusinesses = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredBusinesses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, filteredBusinesses]);

  const pageStart = filteredBusinesses.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredBusinesses.length);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900"
    >
      {/* Homepage-matched Hero Section */}
      <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 flex items-center bg-zinc-900 overflow-visible text-white">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={businessBg}
            alt="Business Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/50 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start text-left max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
              Verified Directory
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter mb-8 leading-[1.05] text-white text-balance drop-shadow-2xl"
            >
              Global <span className="font-serif italic font-light text-zinc-200">Index.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-300 mb-12 font-sans max-w-2xl leading-relaxed text-balance drop-shadow-md"
            >
              A complete index of trusted, verified operational assets across all regions. Precision, reliability, and regional excellence.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 -mt-24 lg:-mt-32 pb-24">
        {/* Filters Box */}
        <div className="mb-12 border-2 border-zinc-900 bg-white p-8 shadow-2xl rounded-xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <Search className="w-3 h-3" /> Search Index
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Company, trade, city..."
                  className="w-full border-b-2 border-zinc-100 bg-transparent py-3 font-sans text-lg font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900 placeholder:text-zinc-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <MapPin className="w-3 h-3" /> Region
              </label>
              <select
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                className="w-full border-b-2 border-zinc-100 bg-transparent py-3 font-sans text-lg font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900 cursor-pointer appearance-none"
              >
                <option value="all">All regions</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                <LayoutGrid className="w-3 h-3" /> Sector
              </label>
              <select
                value={groupFilter}
                onChange={(event) => setGroupFilter(event.target.value)}
                className="w-full border-b-2 border-zinc-100 bg-transparent py-3 font-sans text-lg font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900 cursor-pointer appearance-none"
              >
                <option value="all">All sectors</option>
                {categoryGroups.map((group) => (
                  <option key={group.id} value={group.id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-mono text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="w-full border-b-2 border-zinc-100 bg-transparent py-3 font-sans text-lg font-bold text-zinc-900 outline-none transition-all focus:border-zinc-900 cursor-pointer appearance-none"
              >
                <option value="all">All categories</option>
                {visibleCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-zinc-100 mt-8 pt-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCityFilter('all');
                  setGroupFilter('all');
                  setCategoryFilter('all');
                }}
                className="inline-flex items-center bg-zinc-100 px-4 py-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-900 rounded-sm"
              >
                Reset Index
              </button>
              {categoryGroups.slice(0, 4).map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setGroupFilter(group.id)}
                  className={`inline-flex items-center px-4 py-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] transition-all rounded-sm ${
                    groupFilter === group.id
                      ? 'bg-zinc-900 text-white shadow-lg'
                      : 'bg-white border-2 border-zinc-100 text-zinc-400 hover:border-zinc-900 hover:text-zinc-900'
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>

            <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Showing <span className="text-zinc-900">{pageStart}-{pageEnd}</span> of <span className="text-zinc-900">{filteredBusinesses.length}</span> verified units
            </div>
          </div>
        </div>

        {filteredBusinesses.length === 0 ? (
          <div className="border-2 border-zinc-900 bg-white px-6 py-24 text-center rounded-xl shadow-xl">
            <div className="w-16 h-16 bg-zinc-50 border-2 border-zinc-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-zinc-200" />
            </div>
            <div className="font-sans text-2xl font-bold text-zinc-900 uppercase tracking-tight">No Verified Units Found</div>
            <p className="mt-4 text-zinc-500 font-medium max-w-md mx-auto">
              Modify your parameters or expand your regional focus to locate the required trade assets.
            </p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {paginatedBusinesses.map((business) => (
              <motion.div key={business.id} variants={itemVariants} className="h-full">
                <BusinessCard business={business} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredBusinesses.length > PAGE_SIZE && (
          <div className="mt-16 flex flex-col gap-6 border-t-2 border-zinc-900 pt-12 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
              Page <span className="text-zinc-900">{currentPage}</span> of <span className="text-zinc-900">{totalPages}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-900 px-6 py-4 font-sans text-xs font-black uppercase tracking-widest transition-all hover:bg-zinc-50 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={3} />
                Prev
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-4 font-sans text-xs font-black uppercase tracking-widest transition-all hover:bg-orange-500 hover:text-zinc-900 active:scale-95 disabled:opacity-30 shadow-[4px_4px_0px_0px_rgba(249,115,22,0.3)]"
              >
                Next
                <ChevronRight className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
