import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ChevronRight, LayoutGrid, Zap, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import FeatureCard from '../components/FeatureCard';
import SectionEyebrow from '../components/SectionEyebrow';
import { motion } from 'motion/react';
import heroImage from '../photos/2024_active_transportation_construction_hintringer_63.jpg';
import businessBg from '../photos/job-construction-scaled.jpg';
import { useDirectoryData } from '../directory-data';

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

export default function Home() {
  const navigate = useNavigate();
  const { cities, categories, businesses } = useDirectoryData();
  const [query, setQuery] = useState('');
  const [cityId, setCityId] = useState('');
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

    navigate(`/search${params.size > 0 ? `?${params.toString()}` : ''}`);
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900"
    >
      {/* Dramatic Hero Section */}
      <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 flex items-center bg-zinc-900 overflow-visible text-white">
        {/* Full-width Background Image with subtle darkening for contrast */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={heroImage}
            alt="Okanagan Valley Architecture" 
            className="w-full h-full object-cover"
          />
          {/* Gradient from left to right so text is readable but image is visible */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/50 to-transparent z-10"></div>
          {/* Subtle bottom gradient to blend with the overlapping grid */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div variants={heroVariants} initial="hidden" animate="show" className="flex flex-col items-start text-left max-w-4xl">
            <motion.div variants={heroItemVariants}>
              <SectionEyebrow
                icon={LayoutGrid}
                className="mb-8 inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-100 shadow-sm backdrop-blur-md"
                iconClassName="h-3.5 w-3.5 text-zinc-300"
              >
                Verified Contractor Database
              </SectionEyebrow>
            </motion.div>
            
            <motion.h1 variants={heroItemVariants} className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter mb-8 leading-[1.05] text-white text-balance drop-shadow-2xl">
              Build with <span className="font-serif italic font-light text-zinc-200">Confidence.</span>
            </motion.h1>
            
            <motion.p variants={heroItemVariants} className="text-xl md:text-2xl text-zinc-300 mb-16 font-sans max-w-2xl leading-relaxed text-balance drop-shadow-md">
              A refined network of top-rated trades and contractors across the Okanagan Valley. Precision, reliability, and scale.
            </motion.p>
            
            {/* Massive Search Bar */}
            <motion.form variants={heroItemVariants} onSubmit={handleSearch} className="bg-white/10 backdrop-blur-2xl p-2 flex flex-col md:flex-row gap-2 border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-lg relative w-full max-w-5xl group/search">
              <div className="flex-1 relative bg-white/10 border border-white/5 hover:bg-white/20 focus-within:bg-white/20 focus-within:border-indigo-400/50 transition-all duration-300 rounded-md">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-zinc-400 group-focus-within/search:text-indigo-400 transition-colors" strokeWidth={1.5} />
                </div>
                <input 
                  type="text" 
                  placeholder="Trade / Service" 
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="block w-full pl-14 pr-6 py-6 bg-transparent border-none text-white font-sans text-lg placeholder:text-zinc-500 outline-none rounded-md transition-all duration-300"
                />
              </div>
              
              <div className="flex-1 relative bg-white/10 border border-white/5 hover:bg-white/20 focus-within:bg-white/20 focus-within:border-indigo-400/50 transition-all duration-300 rounded-md">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-zinc-400 group-focus-within/search:text-indigo-400 transition-colors" strokeWidth={1.5} />
                </div>
                <select 
                  value={cityId}
                  onChange={(event) => setCityId(event.target.value)}
                  className="block w-full pl-14 pr-12 py-6 bg-transparent border-none text-white font-sans text-lg outline-none appearance-none cursor-pointer rounded-md transition-all duration-300"
                >
                  <option value="" className="text-zinc-900">All Regions</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id} className="text-zinc-900">{city.name}</option>
                  ))}
                </select>
              </div>
              
              <button type="submit" className="bg-white text-zinc-950 px-12 py-6 font-sans text-lg font-semibold hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 shrink-0 rounded-md shadow-lg group/btn">
                <span className="relative z-10 flex items-center gap-2">Search <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform duration-300 ease-out" strokeWidth={2} /></span>
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Popular Categories Grid - Overlapping the Hero */}
      <section className="relative z-30 -mt-24 lg:-mt-32 px-4 sm:px-6 lg:px-8 mb-24">
        <div className="max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden bg-white border-2 border-zinc-900">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-72 p-10 lg:p-12 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 flex flex-col justify-center bg-zinc-50 relative overflow-hidden group/core">
              <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900"></div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-zinc-200/50 rounded-full blur-3xl group-hover/core:bg-zinc-300/50 transition-colors duration-700"></div>
              <h2 className="font-sans text-3xl font-bold uppercase text-zinc-900 mb-2 tracking-tight">Core Trades</h2>
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
                    className={`group relative p-10 lg:p-12 border-zinc-200 hover:shadow-2xl hover:z-20 transition-all duration-500 ease-[0.16,1,0.3,1] flex flex-col justify-between aspect-square overflow-hidden ${index % 2 !== 0 ? 'border-l' : ''} ${index < 2 ? 'border-b lg:border-b-0' : ''} lg:border-l bg-white`}
                  >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0`}></div>
                    
                    <div className="relative z-10 text-zinc-900 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ease-[0.16,1,0.3,1] origin-left">
                      <IconComponent className="h-10 w-10" strokeWidth={2} />
                    </div>
                    
                    <div className="relative z-10">
                      <div className="font-mono text-xs font-bold text-zinc-400 mb-3 group-hover:text-white/80 transition-colors duration-300">0{index + 1}</div>
                      <h3 className="font-sans text-xl font-bold text-zinc-900 group-hover:text-white transition-colors duration-300">{category.name}</h3>
                    </div>
                    
                    <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-500 ease-out z-10">
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
      <section className="relative z-10 py-24 bg-zinc-50 text-zinc-900 border-b-2 border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
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
            <Link to="/kelowna" className="group flex items-center gap-3 text-zinc-900 font-sans text-sm font-bold uppercase tracking-wider transition-all bg-white border-2 border-zinc-900 px-6 py-3 hover:bg-zinc-900 hover:text-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95">
              View Directory <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
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
      <section className="relative z-10 py-24 bg-white border-y-2 border-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 relative">
              <div className="absolute -inset-4 bg-orange-500/10 blur-3xl rounded-full"></div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative border-2 border-zinc-900 shadow-[20px_20px_0px_0px_rgba(24,24,27,1)] overflow-hidden aspect-[4/3]"
              >
                <img 
                  src={businessBg} 
                  alt="Job Construction" 
                  className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
                />
              </motion.div>
            </div>
            
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-[0.3em] text-orange-600 mb-6 uppercase">
                <span className="w-8 h-px bg-orange-600/30"></span>
                Operational Excellence
              </div>
              <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-8 leading-none text-zinc-900">
                Setting the <br /> <span className="text-zinc-400 italic font-serif font-light">Industry Standard.</span>
              </h2>
              <p className="text-zinc-600 font-sans text-lg font-medium leading-relaxed mb-8 max-w-xl">
                The Okanagan building landscape is defined by precision and durability. Our directory connects you with the professionals who built the region's most critical infrastructure and residential milestones.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-black text-zinc-900 mb-1">100%</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Verified Trades</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-zinc-900 mb-1">24/7</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Project Support</div>
                </div>
              </div>
            </div>
          </div>
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
            className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {otherCategories.map((category) => {
              const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
              const count = businesses.filter((business) => business.categoryId === category.id).length;

              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link
                    to={getCategoryLink(category.id)}
                    className="group flex items-center gap-4 border-2 border-transparent bg-white px-4 py-4 transition-all duration-300 ease-[0.16,1,0.3,1] hover:-translate-y-1 hover:border-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.12)]"
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
      <section className="relative z-10 py-32 bg-white border-t-2 border-zinc-900 overflow-hidden text-zinc-900 group/cta">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <SectionEyebrow
                icon={Zap}
                className="mb-8 inline-flex items-center gap-2 border-2 border-zinc-900 bg-zinc-50 px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.15em] text-zinc-600"
                iconClassName="h-4 w-4 text-orange-500"
              >
                Contractor Portal
              </SectionEyebrow>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter mb-8 leading-[0.95]">
                Own a Trade <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Business?</span>
              </h2>
              <p className="text-zinc-600 mb-12 max-w-xl font-sans text-xl font-medium leading-relaxed">
                Claim your profile, keep your info accurate, and make it easier for local customers to find and contact you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/claim-business" className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-orange-500 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.2)] active:scale-95 group shadow-[8px_8px_0px_0px_rgba(24,24,27,1)]">
                  Claim Your Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </Link>
                <Link to="/for-business" className="inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-50 active:scale-95 shadow-[8px_8px_0px_0px_rgba(24,24,27,0.1)]">
                  For Business Owners
                </Link>
              </div>
              
              <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold flex items-center gap-3">
                <span className="w-8 h-px bg-zinc-200"></span>
                Free to claim. Built for Okanagan trades.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
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
                      className="bg-white border-2 border-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] transition-all duration-300"
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
