import { useParams, Link, Navigate } from 'react-router-dom';
import { MapPin, ArrowRight, Star } from 'lucide-react';
import * as Icons from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import Breadcrumbs from '../components/Breadcrumbs';
import { motion } from 'motion/react';
import { useDirectoryData } from '../directory-data';
import { getCityHeroFallbackImage, getCityHeroImage } from '../city-hero-images';
import { businessServesCity } from '../business';
import { createImageFallbackHandler } from '../supabase-images';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function CityPage() {
  const { cityId } = useParams<{ cityId: string }>();
  const { cities, categories, businesses } = useDirectoryData();
  const city = cities.find(c => c.id === cityId);

  if (!city) {
    return <Navigate to="/" replace />;
  }

  const cityBusinesses = businesses.filter((business) => businessServesCity(business, city.id, city.name));
  const featuredBusinesses = cityBusinesses.slice(0, 3);
  
  const popularCategoryIds = ['electricians', 'plumbers', 'hvac-contractors', 'roofing'];
  const popularCategories = categories.filter(c => popularCategoryIds.includes(c.id));
  const otherCategories = categories.filter(c => !popularCategoryIds.includes(c.id));

  // Same vibrant color cycle used on Home page for core trades
  const colorGradients = [
    'from-amber-400 to-orange-500', 
    'from-blue-500 to-indigo-600', 
    'from-emerald-400 to-teal-500', 
    'from-rose-400 to-pink-500'
  ];

  const heroImage = getCityHeroImage(cityId);
  const heroImageFallback = getCityHeroFallbackImage(cityId);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-50 min-h-screen text-zinc-900 font-sans"
    >
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: city.name }]} />

      {/* City Hero */}
      <section className={`relative border-b-2 border-zinc-900 overflow-hidden py-24 md:py-32 flex items-center bg-zinc-900 text-white`}>
        {heroImage && (
          <div className="absolute inset-0 z-0">
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src={heroImage}
              alt={city.name}
              className="w-full h-full object-cover"
              onError={heroImageFallback ? createImageFallbackHandler(heroImageFallback) : undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          </div>
        )}
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col md:flex-row gap-12 items-start md:items-end justify-between">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-4xl text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm">
                <MapPin className="w-3.5 h-3.5 text-zinc-300" strokeWidth={1.5} /> Regional Directory
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter mb-8 leading-[1.05] drop-shadow-2xl uppercase">
                {city.name} <span className="font-serif italic font-light text-zinc-200 normal-case block md:inline">Directory.</span>
              </h1>

              <p className="text-xl md:text-2xl text-zinc-300 font-sans max-w-2xl leading-relaxed drop-shadow-md">
                {city.description}
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="shrink-0 flex flex-col items-start md:items-end gap-6">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 backdrop-blur-md text-orange-500 border border-orange-500/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 shadow-sm rounded-sm">
                Active Listings: {cityBusinesses.length}
              </div>
              <Link to="/claim" className="inline-flex items-center justify-center gap-3 bg-white text-zinc-950 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-100 hover:-translate-y-1 active:scale-95 rounded-md shadow-xl group">
                List Your Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section - Matches Homepage "Core Trades" exactly */}
      <section className="relative z-30 -mt-8 px-4 sm:px-6 lg:px-8 mb-24">
        <div className="max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden bg-white border-2 border-zinc-900">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-72 p-10 lg:p-12 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 flex flex-col justify-center bg-zinc-50 relative overflow-hidden group/core">
              <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900"></div>
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-zinc-200/50 rounded-full blur-3xl group-hover/core:bg-zinc-300/50 transition-colors duration-700"></div>
              <h2 className="font-sans text-3xl font-bold uppercase text-zinc-900 mb-2 tracking-tight">Core Trades</h2>
              <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 font-bold uppercase">In {city.name}</p>
            </div>
            
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 bg-white relative">
              {popularCategories.map((category, index) => {
                const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
                const count = businesses.filter(
                  (business) => business.categoryId === category.id && businessServesCity(business, city.id, city.name)
                ).length;
                const gradient = colorGradients[index % colorGradients.length];

                return (
                  <Link 
                    key={category.id}
                    to={`/${city.id}/${category.id}`}
                    className={`group relative p-10 lg:p-12 border-zinc-200 hover:shadow-2xl hover:z-20 transition-all duration-500 ease-[0.16,1,0.3,1] flex flex-col justify-between aspect-square overflow-hidden ${index % 2 !== 0 ? 'border-l' : ''} ${index < 2 ? 'border-b lg:border-b-0' : ''} lg:border-l bg-white`}
                  >
                    {/* Hover Gradient Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0`}></div>
                    
                    <div className="relative z-10 flex justify-between items-start">
                      <div className="text-zinc-900 group-hover:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 ease-[0.16,1,0.3,1] origin-left">
                        <IconComponent className="h-10 w-10" strokeWidth={2} />
                      </div>
                      <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-white/80 transition-colors duration-300">[{count}]</span>
                    </div>
                    
                    <div className="relative z-10 mt-8">
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

      {/* All Trades Section - Matches Homepage "Complete Index" exactly */}
      <section className="relative z-10 py-16 bg-zinc-50 border-b-2 border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center gap-6">
            <h3 className="font-sans text-xl tracking-tight text-zinc-900 font-bold uppercase">Complete Index</h3>
            <div className="h-1 bg-zinc-200 flex-1"></div>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {otherCategories.map((category) => {
              const IconComponent = (Icons as any)[category.icon] || Icons.Wrench;
              const count = businesses.filter(
                (business) => business.categoryId === category.id && businessServesCity(business, city.id, city.name)
              ).length;
              return (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link 
                    to={`/${city.id}/${category.id}`}
                    className="group flex items-center gap-4 border-x-0 border-y border-zinc-200 bg-white px-4 py-3 transition-all duration-300 ease-[0.16,1,0.3,1] hover:border-zinc-900 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none sm:border-2 sm:border-transparent"
                  >
                    <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-zinc-50 border-2 border-zinc-200 group-hover:bg-zinc-900 group-hover:border-zinc-900 transition-colors duration-300 text-zinc-400 group-hover:text-white">
                      <IconComponent className="h-5 w-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 ease-[0.16,1,0.3,1]" strokeWidth={2.5} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-sans text-base font-bold text-zinc-600 group-hover:text-zinc-900 transition-colors duration-300 truncate">
                        {category.name}
                      </h3>
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-orange-500 shrink-0 transition-colors duration-300">[{count}]</span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Featured Businesses Section - Matches Homepage exactly */}
      {featuredBusinesses.length > 0 && (
        <section className="relative z-10 py-24 bg-white border-b-2 border-zinc-900 text-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest mb-6">
                  <Star className="w-4 h-4 fill-orange-500 text-orange-500" /> Premium Selection
                </div>
                <h2 className="text-4xl font-bold uppercase tracking-tight mb-3 text-zinc-900">Featured Operators</h2>
                <p className="font-mono text-sm text-zinc-600 uppercase tracking-wide">Top rated operational assets in {city.name}.</p>
              </div>
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
                  <BusinessCard business={business} contextCityName={city.name} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
