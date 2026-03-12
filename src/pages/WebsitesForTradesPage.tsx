import { Link } from 'react-router-dom';
import { ArrowRight, Globe, LayoutTemplate, Smartphone, ShieldCheck, Wrench, LayoutGrid, Zap, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

import FeatureCard from '../components/FeatureCard';
import SectionEyebrow from '../components/SectionEyebrow';
import BusinessFAQ from '../components/BusinessFAQ';
import websiteHero from '../photos/businessown/AA_BCConstruction.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';

const whatItDoes = [
  {
    icon: LayoutTemplate,
    title: 'Stronger first impression',
    description: 'Replace outdated trade websites that make good businesses look smaller or less trustworthy than they are.',
  },
  {
    icon: Smartphone,
    title: 'Cleaner mobile contact flow',
    description: 'Make it easier for customers to call, request service, and understand what you actually do from their phone.',
  },
  {
    icon: ShieldCheck,
    title: 'Local credibility',
    description: 'Show service areas, proof, and trust signals in a way that supports real buying decisions.',
  },
  {
    icon: Wrench,
    title: 'Built around services',
    description: 'Structure the site around the trades and jobs you actually want more of, not generic brochure copy.',
  },
];

const includedItems = [
  'Homepage and positioning',
  'Service pages and location relevance',
  'Clear call / contact paths',
  'Trust-building content and proof blocks',
  'Mobile-first layout and speed basics',
  'Launch support and handoff',
];

const processSteps = [
  'We review your current site and positioning',
  'We map the pages and service structure',
  'We build and refine the site around your real work',
  'We launch with a cleaner contact flow and stronger local credibility',
];

const faqs = [
  {
    question: 'How long does a website build take?',
    answer: 'Most trade websites are completed and launched within 2 to 4 weeks, depending on how quickly we can gather your project photos and service details.'
  },
  {
    question: 'Do I need to provide all the writing?',
    answer: 'No. We handle the heavy lifting on the copy based on a brief interview about your services and how you operate.'
  },
  {
    question: 'Will it work on mobile phones?',
    answer: 'Yes. Every site we build is mobile-first, ensuring that customers can easily find your contact info and call you while they are on the go.'
  },
  {
    question: 'Do you handle the hosting?',
    answer: 'We provide high-performance hosting and ongoing maintenance so you never have to worry about security updates or technical drift.'
  }
];

export default function WebsitesForTradesPage() {
  const websiteHeroSrc = preferSupabaseImage('AA_BCConstruction.jpg', websiteHero);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900"
    >
      {/* Homepage-matched Hero Section */}
      <section className="relative flex items-center overflow-visible bg-zinc-900 pt-24 pb-24 text-white sm:pt-28 sm:pb-32 lg:pt-48 lg:pb-64">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={websiteHeroSrc}
            alt="Trade Construction" 
            className="w-full h-full object-cover"
            onError={createImageFallbackHandler(websiteHero)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
        </div>
        <div className="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start text-left max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-300" />
              Website Offer
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-4xl font-medium uppercase tracking-tighter leading-[1.02] text-white text-balance drop-shadow-2xl sm:text-5xl md:text-7xl lg:mb-8 lg:text-[7rem]"
            >
              Trade <span className="font-serif italic font-light text-zinc-200 normal-case text-balance">Websites.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 max-w-2xl text-lg leading-relaxed text-balance text-zinc-300 drop-shadow-md sm:mb-12 sm:text-xl md:text-2xl"
            >
              Modern, fast, mobile-first websites for Okanagan contractors who need to look credible and make it easier for customers to reach out.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
            >
              <Link
                to="/book-call?offer=website"
                className="group flex min-h-12 items-center justify-center gap-3 rounded-md bg-white px-6 py-4 font-sans text-base font-semibold text-zinc-950 shadow-lg transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98] sm:px-10 sm:py-5 sm:text-lg lg:px-12 lg:py-6"
              >
                Book a Website Call
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <Link
                to="/for-business"
                className="flex min-h-12 items-center justify-center gap-3 rounded-md border border-white/20 bg-white/10 px-6 py-4 font-sans text-base font-semibold text-white shadow-lg backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98] sm:px-10 sm:py-5 sm:text-lg lg:px-12 lg:py-6"
              >
                Back to Business Options
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-zinc-900 bg-zinc-50 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-4xl">
            <SectionEyebrow
              icon={ShieldCheck}
              className="mb-6 inline-flex items-center gap-2 bg-zinc-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
              iconClassName="h-4 w-4 text-orange-400"
            >
              Why This Exists
            </SectionEyebrow>
            <h2 className="mb-4 text-3xl font-bold uppercase tracking-tight text-zinc-900 sm:text-4xl md:text-5xl">
              A Better Website Is About Trust,
              <br />
              Clarity, and Easier Contact
            </h2>
            <p className="text-base font-medium leading-relaxed text-zinc-600 sm:text-lg">
              This is not about “pretty design.” It is about looking credible, making services easier to understand, and giving customers a clearer path to contact you.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
            {whatItDoes.map((item) => (
              <div key={item.title}>
                <FeatureCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  tone="soft"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b-2 border-zinc-900 bg-white py-20 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div>
            <SectionEyebrow
              icon={LayoutTemplate}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-zinc-900"
            >
              What Is Included
            </SectionEyebrow>
            <h2 className="mb-5 text-2xl font-bold uppercase tracking-tight text-zinc-900 sm:text-3xl md:text-4xl md:mb-6">
              Built Around the Site You Actually Need
            </h2>
            <ul className="space-y-3 sm:space-y-4">
              {includedItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div className="mt-1.5 h-2.5 w-2.5 bg-orange-500"></div>
                  <span className="font-medium text-zinc-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionEyebrow
              icon={Wrench}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-zinc-900"
            >
              Simple Process
            </SectionEyebrow>
            <h2 className="mb-5 text-2xl font-bold uppercase tracking-tight text-zinc-900 sm:text-3xl md:text-4xl md:mb-6">
              Straightforward Build Flow
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {processSteps.map((step, index) => (
                <div key={step} className="rounded-sm border border-zinc-200 bg-zinc-50 p-5 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl sm:p-6">
                  <div className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                    Step {index + 1}
                  </div>
                  <div className="font-bold uppercase tracking-tight text-zinc-900">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BusinessFAQ faqs={faqs} />

      <section className="border-t border-zinc-200 bg-zinc-100 py-20 text-zinc-900 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-5 text-3xl font-bold uppercase tracking-tighter leading-[1.05] sm:text-4xl md:text-5xl lg:text-6xl md:mb-6">
            If the Site Is Weak,
            <br />
            Fix the Base Layer
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-900/80 sm:text-xl md:mb-10">
            Get a clearer, more credible online presence before you throw more traffic at a weak website.
          </p>
          <Link
            to="/book-call?offer=website"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95 sm:py-5"
          >
            Book a Website Call
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
