import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, MapPin, ChevronRight, LayoutGrid } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import Seo from '../components/Seo';
import { useDirectoryData } from '../directory-data';
import businessBg from '../photos/millwright-quesnel-2-2024.tmb-1000px.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';

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

export default function RegionsPage() {
  const [searchParams] = useSearchParams();
  const { categories, cities } = useDirectoryData();
  const categoryId = searchParams.get('category') ?? '';
  const category = categories.find((entry) => entry.id === categoryId);
  const businessBgSrc = preferSupabaseImage('millwright-quesnel-2-2024.tmb-1000px.jpg', businessBg);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden"
    >
      <Seo
        title={category ? `${category.name} by Region | Okanagan Trades` : 'Regions Directory | Okanagan Trades'}
        description={category ? `Browse verified ${category.name.toLowerCase()} businesses by region across the Okanagan.` : 'Browse verified contractors and trade businesses by region across the Okanagan Valley.'}
        path={category ? `/regions?category=${category.id}` : '/regions'}
      />

      {/* Homepage-matched Hero Section */}
      <section className="relative flex items-center overflow-visible bg-zinc-900 pt-24 pb-24 text-white sm:pt-28 sm:pb-32 lg:pt-48 lg:pb-64">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={businessBgSrc}
            alt="Business Background" 
            className="w-full h-full object-cover"
            onError={createImageFallbackHandler(businessBg)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/50 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
        </div>
        
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex max-w-4xl flex-col items-start text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-zinc-300" />
              Regional Operational Sectors
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-4xl font-black uppercase tracking-tighter leading-[0.95] text-white text-balance drop-shadow-2xl sm:text-5xl md:text-7xl lg:mb-8 lg:text-[6.5rem]"
            >
              {category ? (
                <>
                  {category.name} <br /> <span className="font-serif italic font-light text-zinc-300">by Region.</span>
                </>
              ) : (
                <>
                  Operational <br /> <span className="font-serif italic font-light text-zinc-300">Regions.</span>
                </>
              )}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 max-w-2xl text-lg leading-relaxed text-balance text-zinc-300 drop-shadow-md sm:mb-12 sm:text-xl md:text-2xl"
            >
              {category 
                ? `Select a specific geographic sector to access the ${category.name.toLowerCase()} directory.` 
                : 'Select an operational zone to view verified contractors and regional milestone professionals.'}
            </motion.p>
          </div>
        </div>
      </section>

      <div className="relative z-30 pb-20 sm:pb-24 lg:-mt-32 lg:pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-zinc-200"
        >
          {cities.map((c, i) => {
            return (
              <motion.div key={c.id} variants={itemVariants} className="border-r border-b border-zinc-200 overflow-hidden group">
                <Link 
                  to={category ? `/${c.id}/${category.id}` : `/${c.id}`} 
                  className="relative flex h-full flex-col bg-white p-6 transition-colors duration-300 hover:bg-zinc-50/50 sm:p-8"
                >
                  <div className="relative z-10 mb-8 flex items-start justify-between sm:mb-12">
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 shadow-sm transition-all duration-500 group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:shadow-lg"
                    >
                      <MapPin className="h-6 w-6 text-zinc-400 group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                    </motion.div>
                    <div className="font-mono text-[10px] font-black text-zinc-300 group-hover:text-orange-500 transition-colors duration-300 uppercase tracking-widest">
                      Region 0{i + 1}
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex-grow mb-8">
                    <h3 className="mb-3 text-xl font-black uppercase tracking-tighter leading-tight text-zinc-900 transition-colors group-hover:text-orange-600 sm:mb-4 sm:text-2xl">
                      {c.name}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                      {c.description}
                    </p>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      {category ? `Access ${category.name}` : 'Access Directory'} <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>

                  {/* High-tech subtle grid background on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)', backgroundSize: '1rem 1rem' }}></div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>

      </div>
      
      {/* Bottom Info Section */}
      <section className="border-t border-zinc-200 bg-white py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="mb-5 text-3xl font-black uppercase tracking-tighter leading-none text-zinc-900 md:mb-6 md:text-5xl">
                Local Expertise. <br />
                <span className="text-zinc-400 font-serif italic font-light tracking-normal">Valley Wide.</span>
              </h2>
              <p className="mb-8 max-w-lg text-base leading-relaxed text-zinc-600 sm:text-lg">
                Our directory maps out the top-tier professionals across the Okanagan. From the growing developments in Kelowna to the residential expansions in Penticton, finding verified contractors has never been more straightforward.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-3xl font-black uppercase tracking-tighter text-zinc-900">14+</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Service Areas</span>
                </div>
                <div className="mx-2 h-12 w-px bg-zinc-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-black uppercase tracking-tighter text-zinc-900">100%</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-semibold">Verified Pros</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 aspect-square overflow-hidden rounded-sm border border-zinc-200 shadow-xl md:aspect-[4/3]">
                <img src={businessBgSrc} alt="Millwright Facility" className="w-full h-full object-cover saturate-50 hover:saturate-100 transition-all duration-700" onError={createImageFallbackHandler(businessBg)} />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 z-0"></div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>

  )
}
