import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MessageSquare, Check, Sparkles, LayoutGrid, HelpCircle, Zap, ShieldAlert, Clock, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import SectionEyebrow from '../components/SectionEyebrow';
import leadHero from '../photos/businessown/plumbing_career_social jpg.jpg';
import BusinessFAQ from '../components/BusinessFAQ';
import BusinessCTA from '../components/BusinessCTA';
import FeatureCard from '../components/FeatureCard';

const howItWorks = [
  {
    step: '01',
    title: 'Missed call detected',
    description: 'When someone calls and nobody answers, the system responds instantly.'
  },
  {
    step: '02',
    title: 'Lead gets engaged',
    description: 'An automatic text or phone assistant asks what they need, where the job is, and how urgent it is.'
  },
  {
    step: '03',
    title: 'You get the lead routed properly',
    description: 'You get the details by text, email, or dashboard, so you can follow up fast.'
  }
];

const features = [
  {
    icon: Phone,
    title: 'Missed-Call Text Back',
    description: 'Instantly text back leads when you miss a call.'
  },
  {
    icon: Sparkles,
    title: 'AI Receptionist',
    description: 'Answer calls, collect job details, and screen leads 24/7.'
  },
  {
    icon: MessageSquare,
    title: 'Quote Follow-Up',
    description: 'Automatically follow up on estimates so opportunities do not go cold.'
  }
];

const outcomes = [
  'Respond faster without stopping work',
  'Avoid losing leads to voicemail',
  'Look more professional',
  'Capture more job details up front',
  'Follow up consistently',
  'Give customers a better first impression'
];

const faqs = [
  { question: 'Do I need a new phone number?', answer: 'No. The system can work with your existing number and current process.' },
  { question: 'Can this work with my current website?', answer: 'Yes. The lead-response system can complement your current website and directory presence.' },
  { question: 'What happens when I am already on a job?', answer: 'That is the main use case. Incoming calls get engaged immediately instead of sitting in voicemail.' },
  { question: 'Can I approve the messages?', answer: 'Yes. Message flows can be configured around your preferred tone and process.' },
  { question: 'Will callers know it is automated?', answer: 'The system is designed to feel operational and helpful, not robotic or spammy.' },
  { question: 'Can this work after hours only?', answer: 'Yes. It can be used after hours, during overflow periods, or full-time.' },
  { question: 'How long does setup take?', answer: 'Most setups can be configured quickly once we know how your business handles inbound calls.' }
];

export default function NeverMissLeadPage() {
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
            src={leadHero}
            alt="Plumbing Trade" 
            className="w-full h-full object-cover"
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
              Lead Capture System
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 text-4xl font-bold uppercase tracking-tighter leading-[0.95] text-white text-balance drop-shadow-2xl sm:text-5xl md:text-7xl lg:mb-8 lg:text-[7.5rem]"
            >
              Never Miss a <span className="font-serif italic font-light text-zinc-200 normal-case">Lead.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-10 max-w-2xl text-lg leading-relaxed text-balance text-zinc-300 drop-shadow-md sm:mb-12 sm:text-xl md:text-2xl"
            >
              We help Okanagan trades businesses capture missed calls, respond instantly by text, and qualify leads even when nobody can answer the phone.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:gap-6"
            >
              <Link to="/book-demo" className="group flex min-h-12 items-center justify-center gap-3 rounded-sm bg-white px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-2xl transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] sm:px-10 sm:py-5 lg:px-12 lg:py-6">
                Book a Demo <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <a href="#how-it-works" className="flex min-h-12 items-center justify-center gap-3 rounded-sm border border-white/20 bg-white/10 px-6 py-4 font-sans text-sm font-bold uppercase tracking-wider text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-[0.98] sm:px-10 sm:py-5 lg:px-12 lg:py-6">
                See How It Works
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Problem Section - Elevated */}
      <section className="relative border-b border-zinc-200 bg-zinc-50 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-20">
            <div className="lg:w-1/2">
              <SectionEyebrow icon={ShieldAlert} className="mb-8">The Problem</SectionEyebrow>
              <h2 className="mb-6 text-3xl font-bold uppercase tracking-tight leading-[1.1] text-zinc-900 sm:text-4xl md:text-6xl md:mb-8">
                Most Trades Do Not Need <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">More Leads.</span>
              </h2>
              <p className="max-w-xl text-lg font-medium leading-relaxed text-zinc-500 sm:text-xl">
                They need to stop losing the ones they already get. Every missed call is a missed opportunity that goes directly to your competitor.
              </p>
            </div>
            
            <div className="grid w-full gap-4 sm:grid-cols-2 sm:gap-6 lg:w-1/2">
              {[
                { icon: Phone, title: 'Missed Calls', desc: 'Phone rings while you are on site.' },
                { icon: Clock, title: 'Slow Response', desc: 'Leads cool down in minutes.' },
                { icon: Smartphone, title: 'Text-Back Gap', desc: 'No instant engagement by SMS.' },
                { icon: Zap, title: 'Lost Revenue', desc: 'The job goes to the next crew.' }
              ].map((item, index) => (
                <div key={index} className="rounded-sm border border-zinc-100 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-xl sm:p-8">
                  <item.icon className="h-8 w-8 text-orange-500 mb-4" />
                  <h4 className="text-lg font-bold uppercase tracking-tight mb-2">{item.title}</h4>
                  <p className="text-zinc-500 font-medium leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Interactive Cards */}
      <section id="how-it-works" className="border-b border-zinc-200 bg-white py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center sm:mb-18 lg:mb-24">
            <SectionEyebrow icon={Zap} className="mb-6 bg-zinc-900 text-white">Mechanism</SectionEyebrow>
            <h2 className="mb-5 text-3xl font-bold uppercase tracking-tight text-zinc-900 sm:text-4xl md:text-6xl md:mb-6">How It Works</h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-zinc-500 sm:text-xl">A seamless, automated response layer for your busy crew.</p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group rounded-sm border border-zinc-100 bg-zinc-50 p-6 text-center transition-all duration-500 hover:border-zinc-200 hover:bg-white hover:shadow-2xl sm:p-8 lg:p-12"
              >
                <div className="mb-6 text-5xl font-black leading-none text-zinc-200 transition-colors duration-500 group-hover:text-orange-500/20 sm:mb-8 sm:text-7xl">{item.step}</div>
                <h3 className="mb-3 text-xl font-bold uppercase tracking-tight text-zinc-900 sm:mb-4 sm:text-2xl">{item.title}</h3>
                <p className="text-base font-medium leading-relaxed text-zinc-500 sm:text-lg">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Offer Stack */}
      <section className="border-b border-zinc-200 bg-zinc-50 py-20 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center sm:mb-18 lg:mb-24">
            <SectionEyebrow icon={Sparkles} className="mb-6">Offer Stack</SectionEyebrow>
            <h2 className="mb-5 text-3xl font-bold uppercase tracking-tight text-zinc-900 sm:text-4xl md:text-6xl md:mb-6">Built for Operations</h2>
          </div>

          <div className="grid gap-4 sm:gap-6 md:grid-cols-3 md:gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <BusinessFAQ faqs={faqs} />

      <BusinessCTA 
        eyebrow="Catch Every Call"
        title={<>Recover your <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Revenue.</span></>}
        description="We will show you exactly how missed-call text back and AI lead handling could work for your trade business."
        ctaText="Book a Demo"
        ctaHref="/book-demo"
      />
    </motion.div>
  );
}
