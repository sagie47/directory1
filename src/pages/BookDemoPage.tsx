import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Building2, Clock, AlertCircle, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import SectionEyebrow from '../components/SectionEyebrow';

const trades = [
  { value: '', label: 'Select your trade' },
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'hvac', label: 'HVAC Technician' },
  { value: 'roofer', label: 'Roofer' },
  { value: 'general-contractor', label: 'General Contractor' },
  { value: 'restoration', label: 'Restoration / Emergency' },
  { value: 'other', label: 'Other' }
];

const leadsPerWeek = [
  { value: '', label: 'How many leads per week?' },
  { value: '1-10', label: '1-10 leads' },
  { value: '11-25', label: '11-25 leads' },
  { value: '25-50', label: '25-50 leads' },
  { value: '50+', label: '50+ leads' }
];

const biggestIssues = [
  { value: '', label: 'What is your biggest challenge?' },
  { value: 'missed-calls', label: 'Missed calls' },
  { value: 'slow-follow-up', label: 'Slow follow-up' },
  { value: 'no-receptionist', label: 'No receptionist' },
  { value: 'estimate-follow-up', label: 'Estimate follow-up' },
  { value: 'after-hours', label: 'After-hours calls' }
];

const reassuranceItems = [
  'Built for local trades',
  'Simple setup',
  'No bloated software',
  'Tailored to your call flow'
];

export default function BookDemoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    trade: '',
    phone: '',
    email: '',
    city: '',
    website: '',
    leadsPerWeek: '',
    biggestIssue: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Replace this with backend or CRM submission.
    setTimeout(() => {
      setLoading(false);
      navigate('/demo-requested');
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden bg-[#FAFAFA] py-16 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900 sm:py-20 lg:py-24"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
          <div className="max-w-xl">
            <SectionEyebrow
              icon={Clock}
              className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-zinc-900"
            >
              Demo Intake
            </SectionEyebrow>

            <h1 className="mt-6 text-4xl font-bold uppercase tracking-tighter leading-[0.95] text-zinc-900 sm:mt-8 sm:text-5xl md:text-6xl lg:text-7xl">
              Book a Demo
            </h1>
            <p className="mt-5 text-lg font-medium leading-relaxed text-zinc-600 sm:mt-6 sm:text-xl">
              Tell us how your business handles inbound leads today. We will show you what a tighter missed-call and follow-up system could look like for your trade.
            </p>

            <div className="mt-10 border-t-2 border-zinc-200 pt-6 sm:mt-12 sm:pt-8">
              <SectionEyebrow
                className="mb-6 inline-flex items-center gap-2 rounded-sm border border-zinc-200 bg-zinc-50 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              >
                What to Expect
              </SectionEyebrow>
              <div className="grid gap-3 sm:gap-4">
                {reassuranceItems.map((item) => (
                  <div key={item} className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-zinc-200 bg-white">
                      <Check className="w-4 h-4 text-zinc-900" strokeWidth={3} />
                    </div>
                    <span className="font-sans text-[15px] font-semibold text-zinc-900 sm:text-base">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="rounded-sm border border-zinc-200 bg-white p-5 shadow-sm sm:p-8 lg:p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4" placeholder="Your name" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Business Name *</label>
                  <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4" placeholder="Company name" />
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Trade *</label>
                <div className="relative">
                  <select name="trade" value={formData.trade} onChange={handleChange} required className="w-full appearance-none cursor-pointer rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 pr-12 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4">
                    {trades.map((trade) => (
                      <option key={trade.value} value={trade.value}>{trade.label}</option>
                    ))}
                  </select>
                  <Building2 className="pointer-events-none absolute right-4 top-1/2 w-5 h-5 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Phone *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4" placeholder="(250) 555-0123" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4" placeholder="you@company.com" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4" placeholder="Kelowna" />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Website</label>
                  <input type="url" name="website" value={formData.website} onChange={handleChange} className="w-full rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4" placeholder="yourwebsite.com" />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Leads Per Week *</label>
                  <div className="relative">
                    <select name="leadsPerWeek" value={formData.leadsPerWeek} onChange={handleChange} required className="w-full appearance-none cursor-pointer rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 pr-12 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4">
                      {leadsPerWeek.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                    <BarChart3 className="pointer-events-none absolute right-4 top-1/2 w-5 h-5 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Biggest Challenge *</label>
                  <div className="relative">
                    <select name="biggestIssue" value={formData.biggestIssue} onChange={handleChange} required className="w-full appearance-none cursor-pointer rounded-xl border-2 border-zinc-200 bg-zinc-50 px-4 py-3.5 pr-12 text-base font-medium text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900 focus:bg-white sm:py-4">
                      {biggestIssues.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                    <AlertCircle className="pointer-events-none absolute right-4 top-1/2 w-5 h-5 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={loading} className="group inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-4 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-xl active:scale-95 disabled:pointer-events-none disabled:opacity-50 sm:py-5">
                  {loading ? 'Submitting...' : <>Request My Demo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} /></>}
                </button>
              </div>

              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 text-center mt-4">
                No commitment required. We respect your time.
              </p>
            </form>
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto mt-12 max-w-[96rem] px-4 text-left sm:mt-16 sm:px-6 lg:px-10">
          <Link to="/never-miss-a-lead" className="group inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900">
            <ArrowRight className="h-3 w-3 rotate-180 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
            Back to main page
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
