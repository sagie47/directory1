import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Globe, Phone, TrendingUp, ShieldCheck, Sparkles, Workflow, Wrench, LayoutGrid, Zap, HelpCircle, ArrowUpRight, Check } from 'lucide-react';
import { motion } from 'motion/react';

import FeatureCard from '../components/FeatureCard';
import SectionEyebrow from '../components/SectionEyebrow';
import BusinessFAQ from '../components/BusinessFAQ';
import BusinessCTA from '../components/BusinessCTA';
import businessHero from '../photos/businessown/thumbnail_G74A6639.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';

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

const directoryPlans = [
  {
    name: 'Free Claim',
    price: '$0',
    description: 'Claim your business and clean up the essentials.',
    cta: 'Claim Free',
    href: '/claim',
    features: [
      'Claim your profile',
      'Update core business details',
      'Add photos and service areas',
      'Access the owner dashboard',
    ],
  },
  {
    name: 'Verified Profile',
    price: '$29/mo',
    description: 'Enhanced directory presence for businesses that want more polish and visibility.',
    cta: 'Claim and Upgrade',
    href: '/claim',
    features: [
      'Everything in Free Claim',
      'Verified profile treatment',
      'Priority placement',
      'Visibility and performance signals',
    ],
  },
];

const growthServices = [
  {
    name: 'Never Miss a Lead',
    description: 'Operational lead-response system for missed calls and after-hours inquiries.',
    cta: 'Book a Demo',
    href: '/never-miss-a-lead',
  },
  {
    name: 'Website Build',
    description: 'Modern trade websites designed to improve trust and make contact easier.',
    cta: 'Book a Website Call',
    href: '/websites-for-trades',
  },
  {
    name: 'Managed Growth',
    description: 'Done-for-you local growth support for businesses that want ongoing help.',
    cta: 'Book a Strategy Call',
    href: '/managed-growth',
  },
];

const faqs = [
  {
    question: 'How do I get started?',
    answer: 'The best first step is to claim your free business profile. This gives you immediate access to your dashboard where you can explore our other growth services.'
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
  const businessHeroSrc = preferSupabaseImage('thumbnail_G74A6639.jpg', businessHero);

  return (
    <div className="bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
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
              Claim your profile, stop missing leads, improve your online presence, and get help where you actually need it.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-6"
            >
              <Link
                to="/claim"
                className="group flex min-h-12 items-center justify-center gap-3 rounded-sm bg-white px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-2xl transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] sm:px-10 sm:py-5 lg:px-12 lg:py-6"
              >
                Claim Your Profile <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <a
                href="#business-options"
                className="flex min-h-12 items-center justify-center gap-3 rounded-sm border border-white/20 bg-white/10 px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98] sm:px-10 sm:py-5 lg:px-12 lg:py-6"
              >
                See Business Options
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="business-options" className="border-b border-zinc-200 bg-zinc-50 py-20 sm:py-24 lg:py-44">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center sm:mb-18 lg:mb-24">
            <SectionEyebrow
              icon={Workflow}
              className="mb-6 bg-zinc-900 text-white"
            >
              Four Clear Lanes
            </SectionEyebrow>
            <h2 className="mb-5 text-3xl font-bold uppercase tracking-tight text-zinc-900 sm:text-4xl md:text-6xl md:mb-6">
              Choose What You Need
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium leading-relaxed text-zinc-500 sm:text-xl">
              Pick the path that matches your current bottleneck. Do not start with a giant mixed service package if you only need one thing solved.
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 md:gap-10">
            {offerLanes.map((lane, index) => (
              <motion.div
                key={lane.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group flex flex-col rounded-sm border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-8 lg:p-16"
              >
                <div className="mb-8 flex items-center justify-between sm:mb-10">
                  <div className="inline-flex items-center gap-2 rounded-sm border border-zinc-100 bg-zinc-50 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 transition-all duration-500 group-hover:bg-zinc-900 group-hover:text-white sm:px-4 sm:tracking-[0.2em]">
                    <lane.icon className="h-3.5 w-3.5" strokeWidth={2} />
                    {lane.eyebrow}
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-zinc-100 bg-zinc-50 text-zinc-300 transition-all duration-500 group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white sm:h-12 sm:w-12">
                    <ArrowUpRight className="w-6 h-6" />
                  </div>
                </div>
                
                <h3 className="mb-4 text-2xl font-bold uppercase tracking-tight text-zinc-900 transition-colors group-hover:text-orange-600 sm:mb-6 sm:text-3xl lg:text-4xl">
                  {lane.title}
                </h3>
                
                <p className="mb-8 text-base font-medium leading-relaxed text-zinc-500 sm:mb-10 sm:text-lg lg:text-xl">
                  {lane.description}
                </p>
                
                <ul className="mb-10 flex-grow space-y-3 sm:mb-12 sm:space-y-4">
                  {lane.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-4">
                      <div className="mt-1.5 flex h-2 w-2 shrink-0 rounded-sm bg-orange-500"></div>
                      <span className="font-semibold text-zinc-700 leading-tight">{bullet}</span>
                    </li>
                  ))}
                </ul>
                
                <Link
                  to={lane.href}
                  className="group/btn inline-flex min-h-12 items-center justify-center gap-4 rounded-sm bg-zinc-900 px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.14em] text-white shadow-xl transition-all hover:-translate-y-1 hover:bg-zinc-800 active:scale-95 sm:px-8 sm:py-5 sm:tracking-widest"
                >
                  {lane.cta}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" strokeWidth={2.5} />
                </Link>
              </motion.div>
            ))}
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

      <section className="border-b border-zinc-200 bg-zinc-50 py-20 sm:py-24 lg:py-44">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionEyebrow
                icon={ShieldCheck}
                className="mb-8"
              >
                Directory Plans
              </SectionEyebrow>
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight leading-[1.1] text-zinc-900 sm:text-4xl md:text-5xl md:mb-8">
                Productized <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Entry Points.</span>
              </h2>
              <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-zinc-500 sm:mb-10 sm:text-xl md:mb-12">
                Keep the directory plans simple. This is where businesses claim and improve their presence inside the directory itself.
              </p>

              <div className="space-y-6 sm:space-y-8">
                {directoryPlans.map((plan) => (
                  <div key={plan.name} className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl sm:p-8 lg:p-10">
                    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-8">
                      <div>
                        <h3 className="text-2xl font-bold uppercase tracking-tight text-zinc-900 sm:text-3xl">{plan.name}</h3>
                        <p className="mt-2 text-base font-medium text-zinc-500 sm:text-lg">{plan.description}</p>
                      </div>
                      <div className="text-3xl font-black tracking-tighter leading-none text-zinc-900 sm:text-4xl">{plan.price}</div>
                    </div>
                    <ul className="mb-8 space-y-3 sm:mb-10 sm:space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-4">
                          <Check className="mt-1 h-5 w-5 text-orange-500" strokeWidth={3} />
                          <span className="font-bold text-zinc-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={plan.href}
                      className="inline-flex min-h-12 items-center gap-4 rounded-sm bg-zinc-900 px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.14em] text-white shadow-xl transition-all hover:bg-zinc-800 active:scale-95 sm:px-8 sm:tracking-widest"
                    >
                      {plan.cta}
                      <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionEyebrow
                icon={TrendingUp}
                className="mb-8"
              >
                Growth Services
              </SectionEyebrow>
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight leading-[1.1] text-zinc-900 sm:text-4xl md:text-5xl md:mb-8">
                High-Intent <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Service Offers.</span>
              </h2>
              <p className="mb-8 max-w-xl text-lg font-medium leading-relaxed text-zinc-500 sm:mb-10 sm:text-xl md:mb-12">
                Keep service offers separate from the directory plans. These are advisory or done-for-you lanes, not just profile upgrades.
              </p>

              <div className="space-y-6 sm:space-y-8">
                {growthServices.map((service) => (
                  <div key={service.name} className="group rounded-sm border border-zinc-900 bg-zinc-900 p-6 text-white shadow-2xl transition-all duration-500 hover:-translate-y-2 sm:p-8 lg:p-12">
                    <h3 className="mb-4 text-2xl font-bold uppercase tracking-tight transition-colors group-hover:text-orange-500 sm:text-3xl">{service.name}</h3>
                    <p className="mt-3 max-w-xl text-base font-medium leading-relaxed text-zinc-400 transition-colors group-hover:text-zinc-300 sm:text-lg">{service.description}</p>
                    <Link
                      to={service.href}
                      className="mt-8 inline-flex min-h-12 items-center gap-4 rounded-sm bg-white px-6 py-4 font-sans text-sm font-bold uppercase tracking-[0.14em] text-zinc-900 shadow-xl transition-all hover:bg-orange-500 hover:text-white active:scale-95 sm:mt-10 sm:px-8 sm:py-5 sm:tracking-widest"
                    >
                      {service.cta}
                      <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <BusinessFAQ faqs={faqs} />

      <BusinessCTA 
        title={<>Built for <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Operators.</span></>}
        description="Claim your profile if you need control. Book a demo if missed calls are costing you jobs. Move into websites or managed growth when the business actually needs it."
      />
    </div>
  );
}
