import { Link } from 'react-router-dom';
import { ArrowRight, Check, Building2, MapPin, Image, Bell, TrendingUp, Clock, DollarSign, Edit3, Plus, HelpCircle, Zap, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';
import businessBg from '../photos/job-construction-scaled.jpg';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

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
              className="text-6xl md:text-8xl lg:text-[7rem] font-medium tracking-tighter mb-8 leading-[1.05] text-white text-balance drop-shadow-2xl"
            >
              Own your <span className="font-serif italic font-light text-zinc-200">Identity.</span>
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
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link to="/claim" className="bg-white text-zinc-950 px-12 py-6 font-sans text-lg font-semibold hover:bg-indigo-50 hover:text-indigo-600 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 rounded-md shadow-lg group">
                Find My Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
              </Link>
              <Link to="/claim" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-12 py-6 font-sans text-lg font-semibold hover:bg-white/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 rounded-md shadow-lg">
                <Plus className="h-5 w-5 text-zinc-300" strokeWidth={2} /> Add My Business
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="relative z-30 -mt-24 lg:-mt-32 px-4 sm:px-6 lg:px-8 mb-24">
        <div className="max-w-7xl mx-auto shadow-2xl rounded-xl overflow-hidden bg-white border-2 border-zinc-900">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-72 p-10 lg:p-12 border-b-2 md:border-b-0 md:border-r-2 border-zinc-900 flex flex-col justify-center bg-zinc-50 relative overflow-hidden group/core">
              <div className="absolute top-0 left-0 w-full h-2 bg-zinc-900"></div>
              <h2 className="font-sans text-3xl font-bold uppercase text-zinc-900 mb-2 tracking-tight">Benefits</h2>
              <p className="font-mono text-xs tracking-[0.2em] text-zinc-500 font-bold uppercase">Platform Tools</p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 bg-white relative">
              {whyClaimItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={item.title}
                    className={`group relative p-10 lg:p-12 border-zinc-200 transition-all duration-500 flex flex-col ${index !== 0 ? 'lg:border-l' : ''} ${index > 2 ? 'lg:border-t' : ''} border-b sm:border-b-0 border-l sm:border-l-0 border-t sm:border-t-0`}
                  >
                    <div className="relative z-10 text-zinc-900 mb-6 origin-left">
                      <IconComponent className="h-8 w-8 text-orange-600" strokeWidth={2} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="font-sans text-xl font-bold text-zinc-900 mb-3 uppercase tracking-tight">{item.title}</h3>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-white border-b-2 border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 flex items-center gap-6">
            <h3 className="font-sans text-xl tracking-tight text-zinc-900 font-bold uppercase shrink-0">Onboarding Process</h3>
            <div className="h-px bg-zinc-200 flex-1"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {processSteps.map((step) => (
              <div key={step.number} className="relative group">
                <div className="font-mono text-xs font-bold text-orange-600 mb-4 tracking-widest uppercase">Step {step.number}</div>
                <h4 className="text-2xl font-bold text-zinc-900 mb-4 uppercase tracking-tight">{step.title}</h4>
                <p className="text-zinc-500 font-medium leading-relaxed">{step.description}</p>
                <div className="mt-8 h-1 w-12 bg-zinc-900 group-hover:w-full transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-24 bg-zinc-50 border-b-2 border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest mb-6">
              <HelpCircle className="w-4 h-4 text-orange-500" /> Support
            </div>
            <h2 className="text-4xl font-bold uppercase tracking-tight text-zinc-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-white border-2 border-zinc-900 p-8 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                <h3 className="font-bold text-lg mb-4 flex items-start gap-4 uppercase tracking-tight">
                  <span className="w-2 h-2 bg-orange-500 shrink-0 mt-2"></span>
                  {faq.question}
                </h3>
                <p className="text-zinc-600 font-medium pl-6 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA matching homepage section */}
      <section className="relative z-10 py-32 bg-white overflow-hidden text-zinc-900 group/cta">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #000000 1px, transparent 1px), linear-gradient(to bottom, #000000 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.15em] text-zinc-600 mb-8 border-2 border-zinc-900 px-4 py-2 uppercase bg-zinc-50">
            <Zap className="w-4 h-4 text-orange-500" fill="currentColor" />
            Join the Network
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter mb-6 leading-none">
            Scale your <br /> <span className="text-zinc-400 italic font-serif font-light text-balance">Enterprise.</span>
          </h2>
          <p className="text-zinc-600 mb-10 max-w-xl mx-auto font-sans text-lg font-medium leading-relaxed">
            Register your enterprise in the region's most precise operational directory. Connect with high-intent projects and clients across the Okanagan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/claim" className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-orange-500 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,0.2)] active:scale-95 group shadow-[8px_8px_0px_0px_rgba(24,24,27,1)]">
              Initialize Listing <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
