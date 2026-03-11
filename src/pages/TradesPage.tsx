import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { motion } from 'motion/react';
import { ArrowRight, LayoutGrid, ChevronRight } from 'lucide-react';
import { useDirectoryData } from '../directory-data';
import businessBg from '../photos/1746202255761.jpg';

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

export default function TradesPage() {
  const { categories } = useDirectoryData();
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden"
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
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-300" />
              Operational Sector Index
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl lg:text-[6.5rem] font-black uppercase tracking-tighter mb-8 leading-[0.95] text-white text-balance drop-shadow-2xl"
            >
              Complete <span className="font-serif italic font-light text-zinc-300">Trades.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-300 mb-12 font-sans max-w-2xl leading-relaxed text-balance drop-shadow-md"
            >
              Browse all verified operational categories and trade professionals. Precision-mapped directories for regional milestones.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 -mt-24 lg:-mt-32 pb-32">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {categories.map((c, i) => {
            const Icon = (Icons as any)[c.icon] || Icons.Wrench;
            
            return (
              <motion.div key={c.id} variants={itemVariants}>
                <Link 
                  to={`/regions?category=${encodeURIComponent(c.id)}`} 
                  className="group bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-zinc-300 flex flex-col h-full relative overflow-x-hidden"
                >
                  <div className="flex justify-between items-start mb-12 relative z-10">
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:bg-zinc-900 group-hover:border-zinc-900 shadow-sm">
                      <Icon className="h-6 w-6 text-zinc-400 transition-colors duration-500 group-hover:text-white" strokeWidth={1.5} />
                    </div>
                    <div className="font-mono text-[10px] font-black text-zinc-300 group-hover:text-orange-500 transition-colors duration-300 uppercase tracking-widest">
                      0{i + 1}
                    </div>
                  </div>
                  
                  <div className="mt-auto relative z-10">
                    <h3 className="font-black text-xl text-zinc-900 uppercase tracking-tighter leading-none mb-4 group-hover:text-orange-600 transition-colors">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 transition-colors">
                      Directory <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
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
      <section className="bg-white border-t border-zinc-200 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 md:order-1">
              <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden border border-zinc-200 shadow-xl relative z-10 bg-zinc-100 p-12">
                <div className="h-full border border-dashed border-zinc-300 rounded-xl flex items-center justify-center bg-white p-8 group transition-all">
                  <div className="text-center flex flex-col items-center">
                    <div className="w-16 h-16 bg-orange-50 border border-orange-100 rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:bg-orange-100 transition-colors">
                      <LayoutGrid className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">Network Expansion</h3>
                    <p className="font-serif italic text-xl text-zinc-600 max-w-[200px]">More categories are added quarterly.</p>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 right-1/2 w-64 h-64 bg-zinc-100 rounded-full blur-3xl opacity-50 z-0"></div>
            </div>
            
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-6 leading-none">
                Comprehensive. <br />
                <span className="text-zinc-400 font-serif italic font-light tracking-normal">Coverage.</span>
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed mb-8 max-w-lg">
                Whether you're developing a large commercial project or renovating a residential property, our exhaustive list of trade categories ensures you connect with the exact skillsets needed for the job.
              </p>
              
              <ul className="space-y-4 font-sans text-sm font-medium text-zinc-500">
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Verified Licensing</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Regional Expertise</li>
                <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div> Proven Track Records</li>
              </ul>
              
              <Link to="/for-business" className="mt-10 inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-4 rounded-xl font-mono text-sm font-semibold uppercase tracking-widest shadow-sm hover:bg-orange-500 hover:-translate-y-1 transition-all">
                List Your Trade <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </motion.div>

  );
}
