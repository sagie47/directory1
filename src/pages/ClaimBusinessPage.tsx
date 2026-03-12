import { Link } from 'react-router-dom';
import { ArrowRight, Check, Building2, MapPin, Image, Bell, TrendingUp, Clock, DollarSign, Edit3, Plus, HelpCircle, Zap, LayoutGrid, Workflow } from 'lucide-react';
import { motion } from 'motion/react';
import businessBg from '../photos/job-construction-scaled.jpg';
import BusinessFAQ from '../components/BusinessFAQ';
import BusinessCTA from '../components/BusinessCTA';
import FeatureCard from '../components/FeatureCard';
import SectionEyebrow from '../components/SectionEyebrow';

const whyClaimItems = [
  {
    icon: Edit3,
    title: 'Correct Your Info',
    description: 'Update phone numbers, addresses, and hours instantly to ensure customers can reach you.'
  },
  {
    icon: Image,
    title: 'Add Photos & Service Areas',
    description: 'Showcase your best work and define exactly which neighborhoods your team serves.'
  },
  {
    icon: Building2,
    title: 'Build Market Trust',
    description: 'A verified, complete profile builds immediate credibility with high-intent regional clients.'
  },
  {
    icon: Bell,
    title: 'Lead & Inquiry Alerts',
    description: 'Receive immediate notifications when customers reach out through your directory profile.'
  },
  {
    icon: TrendingUp,
    title: 'Visibility Upgrades',
    description: 'Stand out from the competition with optional enhanced placement and premium features.'
  },
  {
    icon: Zap,
    title: 'Direct Response',
    description: 'Enable direct messaging and click-to-call features to reduce the distance between lead and job.'
  }
];

const processSteps = [
  { number: '01', title: 'Find Your Listing', description: 'Search our directory to see if your business is already listed.' },
  { number: '02', title: 'Claim & Verify', description: 'Complete a simple verification process to prove ownership.' },
  { number: '03', title: 'Optimize Profile', description: 'Enhance your listing with photos, services, and accurate details.' }
];

const faqs = [
  {
    question: 'Is claiming my business profile free?',
    answer: 'Yes. Claiming and managing your standard business profile is completely free. We offer optional paid upgrades for businesses looking for maximum visibility.'
  },
  {
    question: 'How long does the verification take?',
    answer: 'Our team typically reviews and approves claims within 24-48 business hours to ensure data integrity across the directory.'
  },
  {
    question: 'Can I manage multiple locations?',
    answer: 'Absolutely. From your owner dashboard, you can manage multiple listings if your trade business operates across different cities.'
  }
];

export default function ClaimBusinessPage() {
  return (
    <div className="bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
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
              Verified Contractor Portal
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter mb-8 leading-[0.95] text-white text-balance drop-shadow-2xl uppercase"
            >
              Own your <span className="font-serif italic font-light text-zinc-200 normal-case">Identity.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-zinc-300 mb-16 font-sans max-w-2xl leading-relaxed text-balance drop-shadow-md"
            >
              Take control of your directory profile, keep your info accurate, and make it easier for local customers to find and contact you.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
            >
              <Link to="/claim" className="bg-white text-zinc-950 px-12 py-6 font-sans text-sm font-bold uppercase tracking-wider hover:bg-zinc-100 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 rounded-sm shadow-2xl group">
                Find My Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <Link to="/claim" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-6 font-sans text-sm font-bold uppercase tracking-wider hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 rounded-sm">
                <Plus className="h-5 w-5 text-zinc-300" strokeWidth={2.5} /> Add My Business
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-24 text-center">
            <SectionEyebrow icon={Zap} className="mb-6 bg-zinc-900 text-white">Platform Tools</SectionEyebrow>
            <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-zinc-900 mb-6">Why Claim Your Listing?</h2>
            <p className="text-xl text-zinc-500 max-w-2xl mx-auto font-medium">Unlock the full power of the Okanagan's most precise operational directory.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {whyClaimItems.map((item, index) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section - Elevated */}
      <section className="py-32 bg-white border-b border-zinc-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">
            <div className="lg:w-1/2">
              <SectionEyebrow icon={Workflow} className="mb-8">Simple Process</SectionEyebrow>
              <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight text-zinc-900 mb-8 leading-[1.1]">
                Three Steps to <br /> <span className="font-serif italic font-light text-zinc-400 normal-case">Verification.</span>
              </h2>
              <p className="text-xl text-zinc-500 font-medium leading-relaxed max-w-xl">
                Establishing administrative control over your regional assets is straightforward and built around data integrity.
              </p>
            </div>
            
            <div className="lg:w-1/2 space-y-6 w-full">
              {processSteps.map((step, index) => (
                <motion.div 
                  key={step.number}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group flex gap-8 p-10 bg-zinc-50 border border-zinc-100 rounded-sm transition-all duration-500 hover:bg-white hover:border-zinc-200 hover:shadow-2xl"
                >
                  <div className="text-5xl font-black text-zinc-200 group-hover:text-orange-500 transition-colors duration-500 leading-none">{step.number}</div>
                  <div>
                    <h4 className="text-2xl font-bold text-zinc-900 mb-3 uppercase tracking-tight">{step.title}</h4>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <BusinessFAQ faqs={faqs} />

      <BusinessCTA 
        title={<>Scale your <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Enterprise.</span></>}
        description="Register your enterprise in the region's most precise operational directory. Connect with high-intent projects and clients across the Okanagan."
      />
    </div>
  );
}
