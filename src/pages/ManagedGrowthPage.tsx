import { Link } from 'react-router-dom';
import { ArrowRight, Bell, LineChart, MessageSquare, ShieldCheck, TrendingUp, Wrench, LayoutGrid, Zap, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

import FeatureCard from '../components/FeatureCard';
import SectionEyebrow from '../components/SectionEyebrow';
import BusinessFAQ from '../components/BusinessFAQ';
import growthHero from '../photos/businessown/pr-roofer-1200x700.jpg';

const handledItems = [
  {
    icon: ShieldCheck,
    title: 'Profile management',
    description: 'Keep listings, positioning, and trust signals cleaner without chasing updates yourself.',
  },
  {
    icon: MessageSquare,
    title: 'Lead-response support',
    description: 'Improve the gap between the lead arriving and someone actually handling it properly.',
  },
  {
    icon: Bell,
    title: 'Reputation and upkeep',
    description: 'Support ongoing presence management instead of letting the whole online layer drift.',
  },
  {
    icon: LineChart,
    title: 'Visibility reporting',
    description: 'See what is being worked on and where the current bottlenecks are.',
  },
];

const fitItems = [
  'Businesses stretched thin on admin',
  'Teams with inconsistent online upkeep',
  'Contractors who need more than a directory listing',
  'Operators who want execution help, not just advice',
];

const outcomeItems = [
  'Cleaner online presence',
  'Less drift across profile and service information',
  'Better follow-through on real inquiries',
  'A more consistent growth layer without more admin burden',
];

const faqs = [
  {
    question: 'How much time does this save me?',
    answer: 'Most owners save 5-10 hours a month on admin, lead follow-up, and profile management by having us handle the execution.'
  },
  {
    question: 'Do I still own my listings and website?',
    answer: 'Yes. You maintain full ownership of all your digital assets. We simply act as your operational team to manage them.'
  },
  {
    question: 'How do you track results?',
    answer: 'We provide monthly visibility reports showing profile performance, lead volume, and the status of ongoing optimizations.'
  },
  {
    question: 'Is there a long-term contract?',
    answer: 'Our managed services are month-to-month. We want to earn your business every month through clear results and proactive support.'
  }
];

export default function ManagedGrowthPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900"
    >
      {/* Homepage-matched Hero Section */}
      <section className="relative pt-32 pb-48 lg:pt-48 lg:pb-64 flex items-center bg-zinc-900 overflow-visible text-white">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.5 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={growthHero}
            alt="Roofer Working" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-900/40 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent z-10"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
        </div>
        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex flex-col items-start text-left max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-zinc-100 border border-white/20 font-mono text-[10px] tracking-[0.3em] uppercase px-4 py-2 mb-8 shadow-sm rounded-sm"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-zinc-300" />
              Managed Service
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter mb-8 leading-[1.05] text-white text-balance drop-shadow-2xl uppercase"
            >
              Managed <span className="font-serif italic font-light text-zinc-200 normal-case text-balance">Growth.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-300 mb-12 font-sans max-w-2xl leading-relaxed text-balance drop-shadow-md"
            >
              We help Okanagan contractors improve their online presence, respond faster to leads, and stay visible without adding more admin to the week.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link
                to="/book-call?offer=managed-growth"
                className="bg-white text-zinc-950 px-12 py-6 font-sans text-lg font-semibold hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 rounded-sm shadow-lg group"
              >
                Book a Strategy Call
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <Link
                to="/for-business"
                className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-6 font-sans text-lg font-semibold hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 rounded-sm shadow-lg"
              >
                Back to Business Options
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-b-2 border-zinc-900 bg-zinc-50 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-4xl">
            <SectionEyebrow
              icon={Wrench}
              className="mb-6 inline-flex items-center gap-2 bg-zinc-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
              iconClassName="h-4 w-4 text-orange-400"
            >
              What We Handle
            </SectionEyebrow>
            <h2 className="mb-4 text-4xl font-bold uppercase tracking-tight text-zinc-900 md:text-5xl">
              Ongoing Support Without
              <br />
              Another Internal Job
            </h2>
            <p className="text-lg font-medium leading-relaxed text-zinc-600">
              This is for businesses that need more than a listing and more than a one-off build. It is the lane for ongoing help with the growth layer.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {handledItems.map((item) => (
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

      <section className="border-b-2 border-zinc-900 bg-white py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionEyebrow
              icon={ShieldCheck}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-zinc-900"
            >
              Best Fit
            </SectionEyebrow>
            <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-zinc-900 md:text-4xl">
              Who This Is Actually For
            </h2>
            <div className="flex flex-wrap gap-3">
              {fitItems.map((item) => (
                <span key={item} className="rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <SectionEyebrow
              icon={LineChart}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-zinc-900"
            >
              What You See
            </SectionEyebrow>
            <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight text-zinc-900 md:text-4xl">
              Expected Outcomes
            </h2>
            <div className="space-y-4">
              {outcomeItems.map((item) => (
                <div key={item} className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl">
                  <div className="font-bold uppercase tracking-tight text-zinc-900">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BusinessFAQ faqs={faqs} />

      <section className="border-t border-zinc-200 bg-zinc-100 py-24 text-zinc-900 lg:py-32">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold uppercase tracking-tighter leading-[1.05] md:text-5xl lg:text-6xl">
            If the Whole Growth Layer
            <br />
            Needs Help, Start Here
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl font-medium leading-relaxed text-zinc-900/80">
            This is the lane for businesses that want ongoing help, not just a one-off fix.
          </p>
          <Link
            to="/book-call?offer=managed-growth"
            className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95"
          >
            Book a Strategy Call
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </section>
    </motion.div>
  );
}
