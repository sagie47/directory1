import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, Globe, LineChart, Wrench } from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '../components/SectionEyebrow';

const offerContent = {
  website: {
    eyebrow: 'Website Intake',
    icon: Globe,
    title: 'Book a Website Call',
    intro: 'Tell us a bit about your business and current site situation. We will use this to shape a practical website conversation, not a generic agency pitch.',
    cta: 'Request Website Call',
  },
  'managed-growth': {
    eyebrow: 'Strategy Intake',
    icon: LineChart,
    title: 'Book a Strategy Call',
    intro: 'Tell us where the current bottlenecks are. We will use this to understand whether managed growth support makes sense for your business.',
    cta: 'Request Strategy Call',
  },
} as const;

const serviceNeeds = {
  website: [
    { value: '', label: 'What do you need most?' },
    { value: 'new-site', label: 'A new website' },
    { value: 'redesign', label: 'A redesign of an existing site' },
    { value: 'service-pages', label: 'Stronger service pages and structure' },
    { value: 'credibility', label: 'A more credible first impression' },
  ],
  'managed-growth': [
    { value: '', label: 'What is the biggest current need?' },
    { value: 'visibility', label: 'Visibility and presence management' },
    { value: 'lead-response', label: 'Lead response and follow-up support' },
    { value: 'reviews', label: 'Reputation and review support' },
    { value: 'execution', label: 'Ongoing execution help' },
  ],
} as const;

export default function BookCallPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const offer = searchParams.get('offer') === 'managed-growth' ? 'managed-growth' : 'website';
  const content = offerContent[offer];
  const offerOptions = serviceNeeds[offer];
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    trade: '',
    phone: '',
    email: '',
    city: '',
    website: '',
    teamSize: '',
    primaryNeed: '',
  });

  const reassurance = useMemo(
    () => [
      'Built around local trade businesses',
      offer === 'website' ? 'Website-first conversation' : 'Operational strategy conversation',
      'No bloated proposal process',
      'Clear next-step recommendation',
    ],
    [offer],
  );

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    // TODO: Replace with CRM or backend submission.
    setTimeout(() => {
      setLoading(false);
      navigate(`/call-requested?offer=${offer}`);
    }, 700);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900"
    >
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="max-w-xl">
            <SectionEyebrow
              icon={content.icon}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-zinc-900"
            >
              {content.eyebrow}
            </SectionEyebrow>
            <h1 className="text-5xl font-bold uppercase tracking-tighter leading-[0.95] text-zinc-900 md:text-6xl lg:text-7xl">
              {content.title}
            </h1>
            <p className="mt-6 text-xl font-medium leading-relaxed text-zinc-600">
              {content.intro}
            </p>

            <div className="mt-12 border-t-2 border-zinc-200 pt-8">
              <div className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">What to Expect</div>
              <div className="space-y-4">
                {reassurance.map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm">
                      <ArrowRight className="h-4 w-4 text-orange-500" strokeWidth={2.5} />
                    </div>
                    <span className="font-semibold text-zinc-900">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-sm border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Business Name *</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Company name" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Trade *</label>
                  <div className="relative">
                    <select name="trade" value={formData.trade} onChange={handleChange} required className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 pr-12 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white">
                      <option value="">Select your trade</option>
                      <option value="plumber">Plumber</option>
                      <option value="electrician">Electrician</option>
                      <option value="hvac">HVAC</option>
                      <option value="roofing">Roofing</option>
                      <option value="general-contractor">General Contractor</option>
                      <option value="other">Other</option>
                    </select>
                    <Wrench className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Kelowna" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="(250) 555-0123" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="you@company.com" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Current Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="https://yourwebsite.com" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Team Size</label>
                  <div className="relative">
                    <select name="teamSize" value={formData.teamSize} onChange={handleChange} className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 pr-12 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white">
                      <option value="">Choose team size</option>
                      <option value="solo">Solo operator</option>
                      <option value="2-5">2-5 people</option>
                      <option value="6-15">6-15 people</option>
                      <option value="15+">15+ people</option>
                    </select>
                    <Building2 className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Primary Need *</label>
                <div className="relative">
                  <select name="primaryNeed" value={formData.primaryNeed} onChange={handleChange} required className="w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 pr-12 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white">
                    {offerOptions.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <BriefcaseBusiness className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95 disabled:pointer-events-none disabled:opacity-50">
                {loading ? 'Submitting...' : content.cta}
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </button>

              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                No bloated proposal process. Just a practical first conversation.
              </p>
            </form>

            <div className="mt-8 border-t-2 border-zinc-100 pt-6">
              <Link to={offer === 'website' ? '/websites-for-trades' : '/managed-growth'} className="group inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900">
                <ArrowRight className="h-3 w-3 rotate-180 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                Back to offer page
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
