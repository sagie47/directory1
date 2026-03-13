import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, Building2, Check, Clock3, Edit3, HelpCircle, Image, MapPin, Phone, ShieldCheck, Workflow } from 'lucide-react';
import { motion } from 'motion/react';
import businessBg from '../photos/job-construction-scaled.jpg';
import BusinessFAQ from '../components/BusinessFAQ';
import Seo from '../components/Seo';
import SectionEyebrow from '../components/SectionEyebrow';
import { createImageFallbackHandler, preferSupabaseImage } from '../supabase-images';
import { trackEvent } from '../lib/analytics';

const ownerControls = [
  {
    icon: Edit3,
    title: 'Description',
    description: 'Explain what your business does in your own words instead of relying on scraped filler.'
  },
  {
    icon: Phone,
    title: 'Contact details',
    description: 'Fix the phone number, website, and email customers actually need.'
  },
  {
    icon: MapPin,
    title: 'Service areas',
    description: 'Show where you actually work instead of forcing people to guess.'
  },
  {
    icon: Clock3,
    title: 'Hours and availability',
    description: 'Make it clear when someone can call, visit, or expect a response.'
  }
];

const processSteps = [
  {
    number: '01',
    title: 'Find your listing',
    description: 'Search the directory and select the business you want to manage.'
  },
  {
    number: '02',
    title: 'Submit ownership details',
    description: 'Tell us your role and provide the contact details we need to review the request.'
  },
  {
    number: '03',
    title: 'Update the profile after approval',
    description: 'Once approved, the owner dashboard unlocks your editable business details.'
  }
];

const trustSignals = [
  'Free to claim',
  'Manual ownership review',
  'Dashboard access only after approval'
];

const comparisonRows = [
  {
    label: 'Before you claim',
    text: 'Customers may see outdated hours, the wrong phone number, or a thin description that does not reflect your business.'
  },
  {
    label: 'After approval',
    text: 'You can manage the public details that matter most so the listing matches how you actually operate.'
  }
];

const faqs = [
  {
    question: 'Is claiming my business profile free?',
    answer: 'Yes. Claiming and managing your standard business profile is completely free.'
  },
  {
    question: 'How long does the verification take?',
    answer: 'Our team typically reviews and approves claims within 24-48 business hours to ensure data integrity across the directory.'
  },
  {
    question: 'Can I manage multiple locations?',
    answer: 'Yes. If your business operates in multiple locations, submit a claim for each listing you need to manage.'
  }
];

export default function ClaimBusinessPage() {
  useEffect(() => {
    trackEvent('claim_business_viewed');
  }, []);

  const businessBgSrc = preferSupabaseImage('job-construction-scaled.jpg', businessBg);

  return (
    <main className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      <Seo
        title="Claim Your Business Profile | Okanagan Trades"
        description="Claim your trade business profile, verify ownership, and manage how your business appears in the Okanagan directory."
        path="/claim-business"
      />

      <section className="relative overflow-hidden bg-zinc-950 pt-28 pb-24 sm:pt-36 sm:pb-32 lg:pt-48 lg:pb-44">
        {/* Sleek Background Image with Sophisticated Overlays */}
        <div className="absolute inset-0 z-0">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.55 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            src={businessBgSrc}
            alt="Business Context" 
            className="w-full h-full object-cover grayscale brightness-50"
            onError={createImageFallbackHandler(businessBg)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-10"></div>
          {/* Subtle tech grid pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay z-10"></div>
          
          {/* Soft Glow Elements */}
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] z-10"></div>
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-300 backdrop-blur-md shadow-sm"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-orange-400" strokeWidth={2.5} />
                Verification Protocol
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="text-[clamp(3rem,8vw,6.5rem)] font-bold uppercase tracking-tighter leading-[0.9] text-white"
              >
                Claim the listing.
                <br />
                <span className="font-serif text-[0.8em] italic font-light normal-case text-zinc-400">Keep it accurate.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="mt-10 max-w-xl text-xl font-medium leading-relaxed text-zinc-300 sm:text-2xl"
              >
                Verification is a trust step, not a sales funnel. Claiming your listing allows us to validate ownership before unlocking the tools customers depend on.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="mt-12 flex flex-col gap-6 sm:flex-row sm:items-center"
              >
                <Link
                  to="/claim"
                  className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-base font-bold uppercase tracking-wider text-zinc-950 shadow-2xl transition-all duration-300 hover:bg-orange-500 hover:text-white hover:-translate-y-1 active:scale-[0.98]"
                >
                  Find My Business
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
                <a
                  href="#claim-steps"
                  className="group inline-flex min-h-14 items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-white"
                >
                  See the process
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:bg-white/10 group-hover:border-white/20">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                  </div>
                </a>
              </motion.div>

              <motion.ul
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.32 }}
                className="mt-16 flex flex-wrap gap-4"
              >
                {trustSignals.map((signal) => (
                  <li
                    key={signal}
                    className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-300 backdrop-blur-sm"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                      <Check className="h-3 w-3" strokeWidth={4} />
                    </div>
                    {signal}
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.18 }}
              className="relative"
            >
              {/* Glowing Background for the Card */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-orange-500/20 to-indigo-500/20 rounded-[2.5rem] blur-2xl opacity-50 z-0"></div>
              
              <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-900/60 p-1 backdrop-blur-2xl shadow-2xl">
                <div className="bg-zinc-950/40 rounded-[1.8rem] overflow-hidden">
                  <div className="border-b border-white/5 bg-zinc-900/80 p-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-4 border border-orange-500/20">
                      Premium Control
                    </div>
                    <p className="text-2xl font-bold uppercase tracking-tight leading-tight text-white">
                      You control the fields that shape first contact.
                    </p>
                  </div>
                  <div className="grid gap-px bg-white/5">
                    {ownerControls.map((item) => (
                      <div
                        key={item.title}
                        className="group flex gap-5 bg-zinc-900/40 p-6 transition-colors hover:bg-zinc-800/60"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-800 border border-white/5 text-orange-400 transition-all group-hover:border-orange-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)]">
                          <item.icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div className="space-y-1">
                          <p className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-white">{item.title}</p>
                          <p className="text-sm leading-relaxed text-zinc-400">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-zinc-100 bg-white py-24 sm:py-32 lg:py-44 overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-zinc-50/50 -z-10 skew-x-[-12deg] translate-x-32 border-l border-zinc-100"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[100px] -z-10"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-24">
            <div className="relative">
              <SectionEyebrow 
                icon={Building2} 
                className="mb-8 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white shadow-lg shadow-zinc-900/10"
                iconClassName="h-4 w-4 text-orange-400"
              >
                Strategic Context
              </SectionEyebrow>
              <h2 className="text-4xl font-bold uppercase tracking-tighter leading-[0.95] text-zinc-950 sm:text-5xl md:text-6xl lg:text-7xl">
                This page <br /> exists to <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">remove doubt.</span>
              </h2>
              <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-zinc-500">
                A verified profile is the foundation of digital credibility. We ensure the connection between owner and listing is absolute.
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid gap-6">
                {comparisonRows.map((row, index) => (
                  <div 
                    key={row.label} 
                    className="group relative overflow-hidden rounded-3xl border border-zinc-100 bg-[#FAFAFA] p-8 transition-all duration-300 hover:border-zinc-200 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-bl-full opacity-0 transition-opacity group-hover:opacity-100"></div>
                    <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-zinc-100 text-zinc-400 shadow-sm group-hover:text-orange-500 transition-colors">
                        <span className="font-mono text-xs font-bold">0{index + 1}</span>
                      </div>
                      <div className="space-y-3">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">{row.label}</p>
                        <p className="text-xl font-semibold leading-relaxed text-zinc-700 tracking-tight">{row.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="claim-steps" className="relative border-b border-zinc-100 bg-[#FAFAFA] py-24 sm:py-32 lg:py-44 overflow-hidden">
        {/* Subtle grid pattern for that tech feel */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxwYXRoIGQ9Ik0gNjAgMCBMIDAgMCBMIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDIiIHN0cm9rZS13aWR0aD0iMSIvPgo8L3N2Zz4=')] opacity-100"></div>
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="mb-20 flex flex-col items-center text-center">
            <SectionEyebrow 
              icon={Workflow} 
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-600 shadow-sm backdrop-blur-sm"
              iconClassName="h-4 w-4 text-orange-500"
            >
              Operational Flow
            </SectionEyebrow>
            <h2 className="text-4xl font-bold uppercase tracking-tighter leading-none text-zinc-950 sm:text-5xl md:text-7xl">
              Three clean <span className="font-serif italic font-light text-zinc-400 normal-case">steps.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-medium text-zinc-500">
              A streamlined verification process designed to respect your time while maintaining the integrity of the directory.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
            {processSteps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative flex flex-col rounded-[2.5rem] border border-zinc-200/60 bg-white p-10 shadow-xl shadow-zinc-200/30 transition-all duration-500 hover:-translate-y-2 hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/60"
              >
                <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-50 border border-zinc-100 text-zinc-400 group-hover:bg-zinc-950 group-hover:border-zinc-950 group-hover:text-white transition-all duration-500">
                  <span className="font-mono text-xl font-bold">{step.number}</span>
                </div>
                
                <h3 className="mb-4 text-2xl font-bold uppercase tracking-tight leading-tight text-zinc-950 group-hover:text-orange-600 transition-colors">{step.title}</h3>
                <p className="text-base font-medium leading-relaxed text-zinc-500">{step.description}</p>
                
                <div className="mt-10 h-1.5 w-12 rounded-full bg-zinc-100 group-hover:w-full group-hover:bg-orange-500 transition-all duration-700"></div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <BusinessFAQ
        faqs={faqs}
        eyebrow="Claim Questions"
      />

      <section className="relative bg-zinc-950 py-24 sm:py-32 lg:py-44 overflow-hidden">
        {/* Sleek CTA background with glows */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-orange-500/10 via-zinc-950 to-indigo-500/10 opacity-50"></div>
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-orange-500/5 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-indigo-500/5 rounded-full blur-[150px]"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-white/5 p-12 sm:p-20 text-center backdrop-blur-xl shadow-2xl">
            {/* Inner glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl opacity-50"></div>
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-400">
                Final Step
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tighter leading-tight text-white sm:text-5xl md:text-6xl">
                If the listing is yours, <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">claim it.</span>
              </h2>
              <p className="mt-8 max-w-2xl text-lg font-medium leading-relaxed text-zinc-400 sm:text-xl">
                We review the ownership request first, then unlock the profile tools that actually matter for your business operations.
              </p>
              
              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <Link
                  to="/claim"
                  className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-base font-bold uppercase tracking-wider text-zinc-950 shadow-2xl transition-all duration-300 hover:bg-orange-500 hover:text-white hover:-translate-y-1 active:scale-[0.98]"
                >
                  Find My Business
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
