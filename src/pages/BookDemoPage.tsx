import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Building2, Phone, Mail, MapPin, Globe, Clock, AlertCircle, BarChart3, Shield } from 'lucide-react';
import { motion } from 'motion/react';

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
  { value: '', label: 'What\'s your biggest challenge?' },
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
    
    // TODO: Connect to backend/CRM for actual submission
    // For now, validate and navigate to thank you page
    setTimeout(() => {
      setLoading(false);
      navigate('/demo-requested');
    }, 1000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
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
      className="bg-[#FAFAFA] min-h-screen py-24 text-zinc-900 font-sans selection:bg-orange-500/20 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #71717a 1px, transparent 1px), linear-gradient(to bottom, #71717a 1px, transparent 1px)', backgroundSize: '3rem 3rem' }}></div>

      <div className="relative z-10 max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] font-bold tracking-widest text-orange-600 uppercase bg-orange-50 px-4 py-2 rounded-full mb-8">
            <Clock className="w-3.5 h-3.5" /> Free Consultation
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-zinc-900 mb-6">
            Book a Demo
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Tell us a bit about your business and we'll show you how the system could help you stop missing leads.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white border border-zinc-200 p-8 sm:p-12 rounded-3xl shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Name *</label>
                <input 
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Business Name *</label>
                <input 
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-z-none focus:borderinc-900 outline-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Trade *</label>
              <div className="relative">
                <select 
                  name="trade"
                  value={formData.trade}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm appearance-none"
                >
                  {trades.map(trade => (
                    <option key={trade.value} value={trade.value}>{trade.label}</option>
                  ))}
                </select>
                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Phone *</label>
                <input 
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="(250) 555-0123"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Email *</label>
                <input 
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">City *</label>
                <input 
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="Kelowna"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Website <span className="text-zinc-400">(optional)</span></label>
                <input 
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm"
                  placeholder="yourwebsite.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Leads Per Week *</label>
                <div className="relative">
                  <select 
                    name="leadsPerWeek"
                    value={formData.leadsPerWeek}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm appearance-none"
                  >
                    {leadsPerWeek.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <BarChart3 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Biggest Challenge *</label>
                <div className="relative">
                  <select 
                    name="biggestIssue"
                    value={formData.biggestIssue}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-4 text-base font-medium text-zinc-900 outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 focus:bg-white transition-all shadow-sm appearance-none"
                  >
                    {biggestIssues.map(item => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Reassurance Block */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-2 gap-3">
                {reassuranceItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-zinc-900 text-white rounded-xl px-8 py-5 font-sans text-sm font-semibold uppercase tracking-widest transition-all shadow-sm hover:bg-orange-500 hover:-translate-y-1 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Submitting...' : <>Request My Demo <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>

            <p className="text-center text-xs text-zinc-500 font-mono">
              No commitment required. We respect your time.
            </p>
          </form>
        </motion.div>

        <div className="mt-12 text-center">
          <Link to="/never-miss-a-lead" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
            ← Back to main page
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
