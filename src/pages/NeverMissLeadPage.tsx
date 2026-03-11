import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MessageSquare, Clock, Check, Sparkles, Building2, Zap, Users, Shield, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

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
    description: 'Automatically follow up on estimates so opportunities don\'t go cold.'
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

const bestFit = [
  'Plumbers',
  'Electricians',
  'HVAC Technicians',
  'Roofers',
  'Restoration / Emergency Services',
  'Busy Small Crews',
  'Owner-Operators',
  'Companies without dedicated office staff'
];

const onboardingSteps = [
  'We learn how your business handles calls',
  'We configure your response flow',
  'We test everything with you',
  'You start catching missed leads fast'
];

const faqs = [
  { q: 'Do I need a new phone number?', a: 'No. Our system works with your existing number — no changes to your current setup.' },
  { q: 'Can this work with my current website?', a: 'Yes. We integrate seamlessly with your existing website and business tools.' },
  { q: 'What happens when I\'m already on a job?', a: 'That\'s exactly when this helps. The AI handles incoming calls so you never miss a lead.' },
  { q: 'Can I approve the messages?', a: 'Absolutely. You have full control over what the AI says and can preview or approve messages before they go out.' },
  { q: 'Will callers know it\'s automated?', a: 'The AI is designed to sound natural and helpful. Most callers have a positive experience.' },
  { q: 'Can this work after hours only?', a: 'Yes. You can set exact hours for when the AI should activate — evenings, weekends, or 24/7.' },
  { q: 'How long does setup take?', a: 'Most businesses are up and running within 1-2 business days.' },
  { q: 'Do you serve only Okanagan businesses?', a: 'We currently focus on the Okanagan Valley but can discuss other areas.' },
  { q: 'How much does it cost?', a: 'Pricing varies based on your needs. Book a demo and we\'ll give you a custom quote.' }
];

export default function NeverMissLeadPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#FAFAFA] min-h-screen text-zinc-900 font-sans selection:bg-orange-500/20"
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden bg-white border-b border-zinc-200">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #71717a 1px, transparent 1px), linear-gradient(to bottom, #71717a 1px, transparent 1px)', backgroundSize: '3rem 3rem' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="mb-8">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase bg-orange-50 px-4 py-2 rounded-full">
                <Phone className="w-3.5 h-3.5" /> AI-Powered Lead Capture
              </span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-zinc-900 mb-8 leading-[0.95]">
              Never Miss a Lead <br />
              <span className="text-zinc-500">While You're on the Job</span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-zinc-600 leading-relaxed mb-4 max-w-2xl mx-auto">
              We help Okanagan trades businesses capture missed calls, respond instantly by text, and qualify leads even when nobody can answer the phone.
            </motion.p>
            
            <motion.p variants={itemVariants} className="text-sm text-zinc-500 mb-12">
              Works for busy crews, solo operators, and shops without full-time office staff.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/book-demo" className="inline-flex items-center justify-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-xl font-sans text-sm font-semibold uppercase tracking-widest shadow-sm hover:bg-orange-500 hover:-translate-y-1 hover:shadow-md transition-all">
                Book a Demo <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 bg-white text-zinc-900 border border-zinc-200 px-8 py-4 rounded-xl font-sans text-sm font-semibold uppercase tracking-widest shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                See How It Works
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 lg:py-32 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight">
              Most Trades Businesses Don't Need More Leads First — <br />
              <span className="text-zinc-400">They Need to Stop Losing the Ones They Already Get</span>
            </h2>
            <div className="space-y-4 text-lg text-zinc-300 leading-relaxed">
              <p>Phone rings while they're on a job → lead goes to voicemail → customer calls the next company → quote doesn't get followed up → job slips through the cracks.</p>
              <p className="text-zinc-500">Sound familiar? You're not alone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-4">How It Works</h2>
            <p className="text-zinc-500">Three simple steps to never miss another lead.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {howItWorks.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="relative"
              >
                <div className="text-8xl font-black text-zinc-100 leading-none mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-zinc-900 uppercase tracking-tight mb-3">{item.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Stack */}
      <section className="py-24 lg:py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-4">Built for Busy Trade Businesses</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="bg-white border border-zinc-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 uppercase tracking-tight mb-3">{feature.title}</h3>
                <p className="text-zinc-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Outcomes/Benefits */}
      <section className="py-24 lg:py-32 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-4">What This Helps You Do</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {outcomes.map((outcome, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="flex items-center gap-3 p-4"
              >
                <div className="w-6 h-6 bg-zinc-900 rounded-full flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <span className="font-medium text-zinc-700">{outcome}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Fit For */}
      <section className="py-24 lg:py-32 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Best Fit For</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto mb-12">
            {bestFit.map((fit, idx) => (
              <span key={idx} className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-medium text-zinc-300">
                {fit}
              </span>
            ))}
          </div>
          
          <p className="text-center text-zinc-500 text-sm font-mono uppercase tracking-widest">
            Not ideal for businesses that already have a full-time dispatcher handling every inbound lead.
          </p>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-8">
              A Website Doesn't Answer the Phone
            </h2>
            <p className="text-xl text-zinc-600 leading-relaxed">
              A website is helpful. Directory placement is helpful. Ads are helpful. But none of it matters if nobody responds when the lead comes in.
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding */}
      <section className="py-24 lg:py-32 bg-[#FAFAFA] border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-4">Simple to Set Up</h2>
            <p className="text-zinc-500">No complicated software. No long onboarding.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {onboardingSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
                  <div className="w-8 h-8 bg-zinc-900 text-white font-mono text-sm font-bold flex items-center justify-center rounded-full mb-4">
                    {idx + 1}
                  </div>
                  <p className="text-zinc-700 font-medium">{step}</p>
                </div>
                {idx < onboardingSteps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-300" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Block */}
      <section className="py-24 lg:py-32 bg-zinc-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            See What This Could Look Like for Your Business
          </h2>
          <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
            We'll show you exactly how missed-call text back and AI lead handling could work for your trade business.
          </p>
          <Link to="/book-demo" className="inline-flex items-center justify-center gap-2 bg-orange-500 text-white px-10 py-5 rounded-xl font-sans text-sm font-semibold uppercase tracking-widest shadow-sm hover:bg-orange-600 hover:-translate-y-1 hover:shadow-md transition-all">
            Book a Demo <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-zinc-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="border-b border-zinc-200 pb-6"
              >
                <h3 className="font-bold text-zinc-900 mb-2">{faq.q}</h3>
                <p className="text-zinc-600 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
}
