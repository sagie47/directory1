import { Link } from 'react-router-dom';
import { ArrowRight, Check, Building2, MapPin, Image, Bell, TrendingUp, Phone, Mail, Calendar, BarChart3, Shield, Users, Sparkles, Rocket, Handshake, Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

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

const managedFeatures = [
  {
    icon: Edit3,
    title: 'Profile Updates',
    description: 'We keep your business details accurate across the directory.'
  },
  {
    icon: MapPin,
    title: 'Service Area Optimization',
    description: 'Maximize visibility in the neighborhoods you actually serve.'
  },
  {
    icon: TrendingUp,
    title: 'Stronger Directory Placement',
    description: 'Enhanced positioning helps you get found first.'
  },
  {
    icon: Bell,
    title: 'Inquiry Notifications',
    description: 'Instant alerts when customers reach out.'
  },
  {
    icon: Handshake,
    title: 'Optional Done-For-You Help',
    description: 'Get expert support when you need it.'
  }
];

const features = [
  { title: 'Claim your listing', description: 'Take ownership of your business profile.' },
  { title: 'Update business details', description: 'Keep info accurate and current.' },
  { title: 'Add trust-building information', description: 'Photos, credentials, and more.' },
  { title: 'Receive customer inquiries', description: 'Get notified when customers contact you.' },
  { title: 'Monitor key visibility signals', description: 'See how your profile performs.' },
  { title: 'Request help when you want it', description: 'Support is just a message away.' }
];

const plans = [
  {
    name: 'Free Claim',
    price: '$0',
    description: 'Basic listing management',
    features: [
      'Claim your business profile',
      'Update core information',
      'Add photos and service areas',
      'Receive customer inquiries',
      'Access owner dashboard'
    ],
    cta: 'Claim Free',
    popular: false
  },
  {
    name: 'Verified Profile',
    price: '$29',
    period: '/month',
    description: 'Enhanced visibility and credibility',
    features: [
      'Everything in Free',
      'Verified badge display',
      'Priority directory placement',
      'Enhanced profile design',
      'Performance analytics',
      'Priority support'
    ],
    cta: 'Get Verified',
    popular: true
  },
  {
    name: 'Managed Growth',
    price: 'Custom',
    description: 'We handle the busywork for you',
    features: [
      'Everything in Verified',
      'Profile management team',
      'Content creation',
      'Lead response service',
      'Monthly strategy calls',
      'Custom reporting'
    ],
    cta: 'Talk to Us',
    popular: false
  }
];

export default function ForBusinessPage() {
  return (
    <div className="bg-white text-zinc-900 font-sans">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-zinc-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '4rem 4rem' }}></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-[0.15em] text-orange-400 mb-6 border border-orange-400/30 px-4 py-2">
              <Building2 className="w-4 h-4" />
              FOR BUSINESS OWNERS
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight mb-6">
              Built for Okanagan<br className="hidden sm:block" /> Trade Businesses
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Claim your profile, improve how your business shows up, and get optional managed help to strengthen your local presence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/claim" 
                className="inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-white px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-100 shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                Claim Your Profile <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center gap-3 bg-transparent text-white border-2 border-zinc-600 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:border-white"
              >
                <Calendar className="w-5 h-5" strokeWidth={2.5} /> Book a Strategy Call
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Managed Services Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Managed for You. Visible to You.
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-zinc-600 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              You run the jobs. We help keep your local presence accurate, credible, and working for you.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {managedFeatures.map((item, i) => (
              <motion.div 
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-zinc-50 border border-zinc-200 p-6 hover:border-orange-400 transition-colors group"
              >
                <div className="w-12 h-12 bg-white border-2 border-zinc-200 flex items-center justify-center mb-4 group-hover:border-orange-400 transition-colors">
                  <item.icon className="w-6 h-6 text-zinc-700 group-hover:text-orange-500" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-lg uppercase tracking-tight mb-2">{item.title}</h3>
                <p className="text-zinc-600 font-medium text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="py-20 lg:py-28 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              What You Can Do
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-zinc-600 text-lg font-medium">
              Full control over your business presence.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 bg-white border border-zinc-200 p-5"
              >
                <div className="w-6 h-6 bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900">{feature.title}</h3>
                  <p className="text-zinc-600 text-sm font-medium">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Paths Section */}
      <section className="py-20 lg:py-28 border-t border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Choose Your Plan
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-zinc-600 text-lg font-medium">
              Flexible options to match your growth stage.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan, i) => (
              <motion.div 
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`relative border-2 p-6 lg:p-8 flex flex-col ${
                  plan.popular 
                    ? 'border-zinc-900 bg-zinc-900 text-white' 
                    : 'border-zinc-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className={`font-bold text-xl uppercase tracking-tight mb-2 ${plan.popular ? 'text-white' : 'text-zinc-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-zinc-900'}`}>
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className={`text-sm font-medium ${plan.popular ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm font-medium ${plan.popular ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.popular ? 'text-orange-400' : 'text-zinc-900'}`} strokeWidth={3} />
                      <span className={plan.popular ? 'text-zinc-300' : 'text-zinc-600'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link 
                  to="/contact" 
                  className={`w-full inline-flex items-center justify-center gap-3 px-6 py-3 font-sans text-sm font-bold uppercase tracking-wider transition-all ${
                    plan.popular
                      ? 'bg-white text-zinc-900 hover:bg-zinc-100'
                      : 'bg-zinc-900 text-white hover:bg-zinc-800'
                  }`}
                >
                  {plan.cta} <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-28 bg-zinc-50 border-t border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">
              Ready to Grow Your Local Presence?
            </h2>
            <p className="text-zinc-600 text-lg mb-8 font-medium">
              Start with a free claim or reach out to discuss managed options.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/claim" 
                className="inline-flex items-center justify-center gap-3 bg-zinc-900 text-white border-2 border-zinc-900 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:bg-zinc-800"
              >
                Claim Your Profile <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center gap-3 bg-white text-zinc-900 border-2 border-zinc-200 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider transition-all hover:border-zinc-900"
              >
                <Handshake className="w-5 h-5" strokeWidth={2.5} /> Talk to Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
