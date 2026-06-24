import { Link } from 'react-router-dom';
import { type MouseEvent, useEffect } from 'react';
import { ArrowRight, CalendarClock, ClipboardCheck, HardHat, ShieldCheck, Truck, Users, Wrench, Zap } from 'lucide-react';
import { motion } from 'motion/react';

import Seo from '../components/Seo';
import SectionEyebrow from '../components/SectionEyebrow';
import laborHero from '../photos/job-construction-scaled.jpg';
import { trackOfferCtaClicked, trackOfferPageViewed, trackPaidPlanIntentClicked, trackPaidPlanIntentViewed } from '../lib/analytics';
import { SERVICE_OFFER_PRICING } from '../lib/pricing';

const laborUseCases = [
  {
    icon: Truck,
    title: 'Material moves',
    description: 'Extra hands for loading, staging, hauling to the work area, and keeping supplies moving when your core crew is busy.',
  },
  {
    icon: Wrench,
    title: 'Site cleanup',
    description: 'End-of-day resets, debris sorting, sweeping, disposal prep, and punch-list cleanup support before the next trade arrives.',
  },
  {
    icon: Users,
    title: 'Crew gaps',
    description: 'Short-notice general labor for days when the schedule is still moving but your available crew count is not enough.',
  },
];

const processSteps = [
  {
    title: 'Send the request',
    description: 'Share location, date, worker count, work type, timing, and any safety notes through the intake flow.',
  },
  {
    title: 'Confirm fit',
    description: 'We review scope, supervision, site access, physical requirements, and whether the request is general labor or trade work.',
  },
  {
    title: 'Coordinate next steps',
    description: 'If the request fits, we help move it toward dispatch confirmation or a recurring labor support conversation.',
  },
];

const guardrails = [
  'General labor support, not a replacement for licensed trades.',
  'Best for supervised job sites with clear work direction.',
  'Safety requirements, PPE expectations, and lifting needs should be included up front.',
  'Recurring labor needs can be scoped separately from one-off day requests.',
];

export default function OnDemandDayLaborPage() {
  useEffect(() => {
    trackOfferPageViewed({
      offer: 'day-labor',
      page: '/on-demand-day-labor',
    });
    trackPaidPlanIntentViewed({
      plan_id: 'day-labor',
      plan_category: 'service',
      source_page: '/on-demand-day-labor',
    });
  }, []);

  const handleOfferCtaClick = (event: MouseEvent<HTMLElement>) => {
    if (typeof window === 'undefined') return;

    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const destination = new URL(anchor.href, window.location.origin);
    if (destination.pathname !== '/book-call') return;
    if (destination.searchParams.get('offer') !== 'day-labor') return;

    const destinationPath = `${destination.pathname}${destination.search}`;
    const ctaLabel = anchor.textContent?.trim() ?? 'Request Labor Support';

    trackOfferCtaClicked({
      offer: 'day-labor',
      source_page: 'on-demand-day-labor',
      cta_label: ctaLabel,
      destination: destinationPath,
      cta_location: 'offer_page',
    });
    trackPaidPlanIntentClicked({
      plan_id: 'day-labor',
      plan_category: 'service',
      source_page: '/on-demand-day-labor',
      cta_label: ctaLabel,
      destination: destinationPath,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAFAFA] font-sans text-zinc-900 selection:bg-orange-200 selection:text-zinc-950"
      onClickCapture={handleOfferCtaClick}
    >
      <Seo
        title="On-Demand Day Labor | Okanagan Trades"
        description="Request short-notice general labor support for Okanagan job sites, cleanup days, material moves, and recurring crew gaps."
        path="/on-demand-day-labor"
      />

      <section className="relative isolate overflow-hidden border-b border-zinc-800 bg-zinc-950 text-white">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.08, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.38 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            src={laborHero}
            alt="Construction labor crew on an active job site"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(9,9,11,0.96)_0%,rgba(9,9,11,0.82)_42%,rgba(9,9,11,0.36)_100%)]"></div>
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-zinc-950 to-transparent"></div>
        </div>

        <div className="relative z-10 mx-auto grid min-h-[46rem] max-w-7xl items-center gap-12 px-4 py-28 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8 lg:py-36">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="mb-8 inline-flex items-center gap-2 border border-orange-300/30 bg-orange-300/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-orange-100"
            >
              <HardHat className="h-3.5 w-3.5 text-orange-300" />
              Job-site labor requests
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-white sm:text-6xl md:text-7xl lg:text-[7.5rem]"
            >
              Extra hands when the schedule will not wait.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="mt-8 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl"
            >
              Request on-demand general labor for cleanup days, material movement, site resets, and short-term crew gaps across the Okanagan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                to="/book-call?offer=day-labor"
                className="group inline-flex min-h-14 items-center justify-center gap-3 bg-orange-500 px-7 py-4 font-sans text-sm font-black uppercase tracking-[0.16em] text-white shadow-[8px_8px_0_rgba(251,146,60,0.18)] transition-all hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-[10px_10px_0_rgba(251,146,60,0.14)] active:scale-[0.98]"
              >
                Request Labor Support
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </Link>
              <a
                href="#labor-fit"
                className="inline-flex min-h-14 items-center justify-center border border-white/15 bg-white/5 px-7 py-4 font-sans text-sm font-black uppercase tracking-[0.16em] text-zinc-200 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                See where it fits
              </a>
            </motion.div>
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.28 }}
            className="border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-md"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-orange-200">Starting point</p>
            <p className="mt-4 text-3xl font-black uppercase tracking-tight text-white">{SERVICE_OFFER_PRICING['day-labor'].startingPrice}</p>
            <div className="mt-8 space-y-5 border-t border-white/10 pt-6">
              {['One-off day requests', 'Short-notice crew gaps', 'Recurring labor scoping'].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-200">
                  <Zap className="h-4 w-4 text-orange-300" strokeWidth={2.2} />
                  {item}
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </section>

      <section id="labor-fit" className="border-b border-zinc-200 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
            <div>
              <SectionEyebrow icon={Users} className="mb-6">
                Where it fits
              </SectionEyebrow>
              <h2 className="text-4xl font-black uppercase leading-none tracking-[-0.04em] text-zinc-950 sm:text-5xl md:text-6xl">
                Labor for the messy middle of real jobs.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-zinc-600">
              This lane is built for owners and supervisors who have a clear scope, a job site that needs extra hands, and work that should not pull skilled trades away from higher-value tasks.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {laborUseCases.map((item) => (
              <article key={item.title} className="group border border-zinc-200 bg-zinc-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(24,24,27,0.08)]">
                <div className="flex h-12 w-12 items-center justify-center bg-zinc-900 text-white transition-colors group-hover:bg-orange-500">
                  <item.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="mt-8 text-2xl font-black uppercase tracking-tight text-zinc-950">{item.title}</h3>
                <p className="mt-4 text-base leading-7 text-zinc-600">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-b border-zinc-200 bg-zinc-100 py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div className="bg-zinc-950 p-8 text-white sm:p-12 lg:p-14">
            <SectionEyebrow
              icon={ClipboardCheck}
              className="mb-8 border-white/10 bg-white/5 text-zinc-300"
              iconClassName="h-3.5 w-3.5 text-orange-300"
            >
              Request path
            </SectionEyebrow>
            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <div key={step.title} className="grid gap-5 border-t border-white/10 pt-8 sm:grid-cols-[5rem_1fr]">
                  <div className="font-mono text-4xl font-black tracking-[-0.08em] text-orange-300">0{index + 1}</div>
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-white">{step.title}</h3>
                    <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between border border-zinc-200 bg-white p-8 sm:p-10">
            <div>
              <div className="flex h-14 w-14 items-center justify-center bg-orange-500 text-white">
                <ShieldCheck className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <h2 className="mt-8 text-3xl font-black uppercase leading-tight tracking-tight text-zinc-950 sm:text-4xl">
                Clear boundaries protect the job and the crew.
              </h2>
              <ul className="mt-8 space-y-4">
                {guardrails.map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-medium leading-6 text-zinc-700">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 border-t border-zinc-200 pt-8">
              <div className="flex items-center gap-3 text-sm font-bold text-zinc-700">
                <CalendarClock className="h-5 w-5 text-orange-500" strokeWidth={2.2} />
                Include timing and urgency so the request can be triaged properly.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-orange-600">Ready to scope a request?</p>
          <h2 className="mt-5 text-4xl font-black uppercase leading-none tracking-[-0.04em] text-zinc-950 sm:text-5xl md:text-6xl">
            Tell us where the crew gap is.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            Submit the labor intake with the work type, number of workers, site timing, and safety notes. We will use that to confirm whether this lane is the right fit.
          </p>
          <div className="mt-10">
            <Link
              to="/book-call?offer=day-labor"
              className="group inline-flex min-h-14 items-center justify-center gap-3 bg-zinc-950 px-8 py-4 font-sans text-sm font-black uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-500 active:scale-[0.98]"
            >
              Start Labor Intake
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
