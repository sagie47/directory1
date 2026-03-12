import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface BusinessCTAProps {
  eyebrow?: string;
  title?: string | ReactNode;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
}

export default function BusinessCTA({
  eyebrow = "Join the Network",
  title,
  description,
  ctaText = "Initialize Listing",
  ctaHref = "/claim"
}: BusinessCTAProps) {
  const defaultTitle = (
    <>
      Scale your <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Enterprise.</span>
    </>
  );

  const defaultDescription = "Register your enterprise in the region's most precise operational directory. Connect with high-intent projects and clients across the Okanagan.";

  return (
    <section className="relative z-10 overflow-hidden border-t border-zinc-100 bg-white py-20 text-zinc-900 group/cta sm:py-24 lg:py-44">
      {/* Refined Grid Background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
      
      {/* Animated Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 shadow-sm sm:mb-10 sm:px-4 sm:tracking-[0.3em]">
            <Zap className="w-3.5 h-3.5 text-orange-500" fill="currentColor" />
            {eyebrow}
          </div>
          
          <h2 className="mb-6 text-4xl font-bold uppercase tracking-tighter leading-[0.95] text-zinc-900 drop-shadow-sm sm:mb-8 sm:text-5xl md:text-7xl lg:text-[6.5rem]">
            {title || defaultTitle}
          </h2>
          
          <p className="mx-auto mb-10 max-w-2xl text-balance font-sans text-lg font-medium leading-relaxed text-zinc-500 sm:mb-12 sm:text-xl">
            {description || defaultDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to={ctaHref} 
              className="inline-flex min-h-12 items-center justify-center gap-4 rounded-sm bg-zinc-900 px-8 py-4 font-sans text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg transition-all hover:bg-zinc-800 hover:-translate-y-1 active:translate-y-0 sm:px-10 sm:py-5 sm:tracking-[0.15em] group"
            >
              {ctaText} 
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
