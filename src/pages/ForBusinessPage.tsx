import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Globe, Phone, TrendingUp, ShieldCheck, Sparkles, Workflow, Wrench, LayoutGrid, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect } from 'react';

import FeatureCard from '../components/FeatureCard';
import Seo from '../components/Seo';
import SectionEyebrow from '../components/SectionEyebrow';
import BusinessFAQ from '../components/BusinessFAQ';
import BusinessCTA from '../components/BusinessCTA';
import businessHero from '../photos/businessown/thumbnail_G74A6639.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';
import { trackEvent } from '../lib/analytics';

const offerLanes = [
  {
    icon: Building2,
    eyebrow: 'Directory',
    title: 'Claim & Manage Profile',
    description: 'Take control of your listing, keep your details accurate, and make sure customers see the right service areas, hours, and contact information.',
    bullets: [
      'Claim your listing and owner access',
      'Update services, hours, and contact details',
      'Keep your directory presence accurate',
    ],
    cta: 'Claim Your Profile',
    href: '/claim',
  },
  {
    icon: Phone,
    eyebrow: 'Lead Capture',
    title: 'Never Miss a Lead',
    description: 'Fix the missed-call and slow-follow-up gap that costs busy crews real jobs.',
    bullets: [
      'Missed-call text back',
      'AI receptionist and lead screening',
      'Faster handoff on real opportunities',
    ],
    cta: 'Book a Demo',
    href: '/never-miss-a-lead',
  },
  {
    icon: Globe,
    eyebrow: 'Website',
    title: 'Websites for Trades',
    description: 'Get a modern, credible site that makes it easier for customers to trust you and reach out.',
    bullets: [
      'Cleaner service pages and calls to action',
      'Mobile-first layout and stronger first impression',
      'Built around local trade credibility',
    ],
    cta: 'Book a Website Call',
    href: '/websites-for-trades',
  },
  {
    icon: TrendingUp,
    eyebrow: 'Managed Service',
    title: 'Managed Growth',
    description: 'Ongoing help with visibility, lead response, and online presence for trade businesses that want support without more admin.',
    bullets: [
      'Profile and presence upkeep',
      'Visibility and lead-response support',
      'Strategy, reporting, and execution help',
    ],
    cta: 'Book a Strategy Call',
    href: '/managed-growth',
  },
];

const operatingPrinciples = [
  {
    icon: ShieldCheck,
    title: 'Built for local trades',
    description: 'The language, positioning, and workflows are built around Okanagan trade businesses, not generic agency fluff.',
  },
  {
    icon: Workflow,
    title: 'Clear next steps',
    description: 'Each offer has its own lane, CTA, and intake path so businesses know exactly what they are signing up for.',
  },
  {
    icon: Wrench,
    title: 'Operational first',
    description: 'The focus is practical: missed calls, credibility, lead handling, and local visibility.',
  },
  {
    icon: Sparkles,
    title: 'No bloated stack',
    description: 'The offers are structured to solve one problem at a time instead of bundling every service into one vague page.',
  },
];

const faqs = [
  {
    question: 'How do I get started?',
    answer: 'The best first step is to claim your free business profile. Once your ownership request is approved, you can access the dashboard and the next recommended step.'
  },
  {
    question: 'Are there long-term contracts?',
    answer: 'No. All our paid services and directory upgrades are flexible. We focus on providing ongoing value to earn your business every month.'
  },
  {
    question: 'Is this only for Okanagan businesses?',
    answer: 'Yes. Our platform and services are specifically built and optimized for trade businesses operating within the Okanagan region.'
  },
  {
    question: 'What if I need multiple services?',
    answer: 'We recommend starting with the one that solves your biggest bottleneck. You can always add or upgrade services as your business needs evolve.'
  }
];

export default function ForBusinessPage() {
  useEffect(() => {
    trackEvent('for_business_viewed');
  }, []);

  const businessHeroSrc = preferSupabaseImage('thumbnail_G74A6639.jpg', businessHero);

  return (
    <div className="bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      <Seo
        title="For Business Owners | Okanagan Trades"
        description="Explore claim, lead-capture, website, and managed growth options built for Okanagan trade businesses."
        path="/for-business"
      />

      {/* Homepage-matched Hero Section */}
      <section className="relative flex items-center overflow-visible bg-zinc-900 pt-24 pb-24 text-white sm:pt-28 sm:pb-32 lg:pt-48 lg:pb-64">
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={businessHeroSrc}
            alt="Business Owner" 
            className="w-full h-full object-cover"
            onError={createImageFallbackHandler(businessHero)}
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
              For Business Owners
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-4xl font-bold uppercase tracking-tighter leading-[0.95] text-white text-balance drop-shadow-2xl sm:text-5xl md:text-7xl lg:mb-8 lg:text-[7.5rem]"
            >
              Built for <span className="font-serif italic font-light text-zinc-200 normal-case">Okanagan Trades.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 max-w-2xl text-lg leading-relaxed text-balance text-zinc-300 drop-shadow-md sm:mb-12 sm:text-xl md:text-2xl lg:mb-16"
            >
              Claim your profile first. After approval, we can point you to the next practical improvement instead of sending you into a generic services menu.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-6"
            >
              <Link
                to="/claim"
                onClick={() => trackEvent('for_business_claim_cta_clicked')}
                className="group flex min-h-12 items-center justify-center gap-3 rounded-sm bg-white px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-2xl transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] sm:px-10 sm:py-5 lg:px-12 lg:py-6"
              >
                Claim Your Profile <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <a
                href="#business-options"
                className="flex min-h-12 items-center justify-center gap-3 rounded-sm border border-transparent px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-zinc-300 transition-all duration-200 hover:text-white active:scale-[0.98] sm:px-10 sm:py-5 lg:px-12 lg:py-6"
              >
                See how we help after you claim
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="business-options" className="border-b border-zinc-200 bg-zinc-50 py-24 sm:py-32 lg:py-44 relative">
        <div className="absolute inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPC9zdmc+')] opacity-50 mix-blend-overlay"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 items-center">
            
            {/* Soft Modern Light Panel */}
            <div className="rounded-sm border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/40 sm:p-10 lg:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50/50 rounded-full blur-3xl opacity-50 -z-10 transition-transform duration-1000 group-hover:scale-110"></div>
              
              <SectionEyebrow
                icon={Workflow}
                className="mb-8 bg-zinc-50 border border-zinc-200 text-zinc-600 shadow-sm"
              >
                What Happens After Claim
              </SectionEyebrow>
              
              <h2 className="mb-6 text-4xl font-bold uppercase tracking-tighter text-zinc-900 sm:text-5xl md:text-6xl leading-[1.05]">
                Approval first. <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Then one clear next step.</span>
              </h2>
              
              <div className="space-y-6 text-zinc-500 mb-12">
                <p className="text-lg font-medium leading-relaxed text-zinc-600">
                  We do not want this page to feel like a pricing menu. The first useful action is claiming the listing.
                </p>
                <p className="text-lg leading-relaxed">
                  After approval, the app can point a business toward the next practical improvement based on what is already missing: profile basics, a missing website, or lead capture.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { step: '1', title: 'Submit claim' },
                  { step: '2', title: 'Get verified' },
                  { step: '3', title: 'See next step' }
                ].map((item) => (
                  <div key={item.step} className="group/step rounded-sm border border-zinc-100 bg-zinc-50 p-5 transition-all duration-300 hover:border-orange-200 hover:bg-white hover:shadow-md relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-zinc-100 transition-colors duration-300 group-hover/step:bg-orange-500"></div>
                    <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-sm bg-white border border-zinc-200 text-sm font-bold text-zinc-400 shadow-sm group-hover/step:border-orange-200 group-hover/step:text-orange-500 transition-colors">
                      {item.step}
                    </div>
                    <p className="font-bold text-zinc-900 tracking-tight">{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Elevated Recommendations Panel */}
            <div className="rounded-sm border border-zinc-800 bg-zinc-950 p-8 shadow-2xl sm:p-10 lg:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="mb-8 inline-flex items-center gap-2 rounded-sm border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 shadow-sm">
                  <Zap className="h-3.5 w-3.5 text-orange-500" /> Recommendations
                </div>
                
                <div className="space-y-4">
                  {offerLanes.map((lane) => (
                    <div key={lane.title} className="group relative overflow-hidden rounded-sm border border-zinc-800 bg-zinc-900/50 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900">
                      <div className="absolute left-0 top-0 h-full w-1 bg-zinc-800 transition-colors duration-300 group-hover:bg-orange-500"></div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:border-orange-500/30 group-hover:text-orange-400 transition-colors">
                          <lane.icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <p className="font-bold uppercase tracking-wide text-white">{lane.title}</p>
                      </div>
                      <p className="mb-5 text-sm leading-relaxed text-zinc-400">{lane.description}</p>
                      <Link
                        to={lane.href}
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-zinc-300 transition-colors group-hover:text-orange-400"
                      >
                        Learn more <ArrowRight className="h-4 w-4" strokeWidth={2} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-white py-20 sm:py-24 lg:py-44">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center sm:mb-18 lg:mb-24">
            <SectionEyebrow
              icon={Sparkles}
              className="mb-6"
            >
              The Foundation
            </SectionEyebrow>
            <h2 className="mb-5 text-3xl font-bold uppercase tracking-tight text-zinc-900 sm:text-4xl md:text-6xl md:mb-6">
              Our Operating Principles
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-zinc-500 sm:text-xl">
              The goal is to give trade businesses a clearer next step and a better local operating system.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
            {operatingPrinciples.map((item, index) => (
              <div key={item.title}>
                <FeatureCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  index={index}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-zinc-200 bg-zinc-50 py-20 sm:py-24 lg:py-36">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-sm border border-zinc-200 bg-white p-8 shadow-sm sm:p-10 lg:p-14">
            <SectionEyebrow
              icon={ShieldCheck}
              className="mb-8"
            >
              Start Here
            </SectionEyebrow>
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
              <div>
                <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight leading-[1.05] text-zinc-900 sm:text-4xl md:text-5xl">
                  Claim First. <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Then improve what matters.</span>
                </h2>
                <p className="max-w-2xl text-lg font-medium leading-relaxed text-zinc-500 sm:text-xl">
                  The directory claim is the first step. Once your ownership request is approved, we can point you to the next practical improvement based on what your business is missing.
                </p>
              </div>

              <div className="rounded-sm border border-zinc-100 bg-zinc-50 p-6 sm:p-8">
                <h3 className="mb-4 text-lg font-bold uppercase tracking-wide text-zinc-900">
                  What you get after approval
                </h3>
                <ul className="space-y-3 text-sm text-zinc-700 sm:text-base">
                  <li>Control over description, phone, website, service areas, and hours</li>
                  <li>A cleaner post-claim next step instead of a generic business services menu</li>
                  <li>One recommended improvement based on the listing basics already in place</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BusinessFAQ faqs={faqs} />

      <BusinessCTA 
        eyebrow="Claim First"
        title={<>Ready to take control <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">of your listing?</span></>}
        description="Start with the claim. We’ll verify ownership first, then point you to the next practical step after approval."
        ctaText="Claim Your Profile"
        ctaHref="/claim"
      />
    </div>
  );
}
