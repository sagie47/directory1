import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CreditCard,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import { getCallOffer, getCallOfferConfig } from '@/src/lib/callOffers';
import {
  trackFormStarted,
  trackFormSubmitFailed,
  trackFormSubmitted,
  trackFormViewed,
  trackStripeRedirectStarted,
} from '@/src/lib/analytics';
import { submitCallRequest } from '@/src/lib/submitCallRequest';

export default function BookCallPage() {
  const formId = 'book_call';
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const offer = getCallOffer(searchParams.get('offer'));
  const content = getCallOfferConfig(offer);
  const formStartedSessionKey = `form_started:${formId}:${offer}`;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTrackedFormStart, setHasTrackedFormStart] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(formStartedSessionKey) === '1';
  });
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

  const hasStripePayment = Boolean(content.stripePaymentUrl);
  const hasSchedulingLink = Boolean(content.scheduleUrl);

  useEffect(() => {
    trackFormViewed({
      form_id: formId,
      offer,
      page: '/book-call',
    });
  }, [offer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setHasTrackedFormStart(window.sessionStorage.getItem(formStartedSessionKey) === '1');
  }, [formStartedSessionKey]);

  const reassurance = useMemo(
    () => [
      'Built around local trade businesses',
      offer === 'website' ? 'Website-first conversation' : 'Operational strategy conversation',
      hasStripePayment ? 'Stripe checkout supported' : 'No payment step configured yet',
      hasSchedulingLink ? 'Scheduling link ready after payment' : 'We can still follow up manually',
    ],
    [hasSchedulingLink, hasStripePayment, offer],
  );

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    if (!hasTrackedFormStart) {
      trackFormStarted({
        form_id: formId,
        offer,
        page: '/book-call',
        field_name: event.target.name,
      });
      setHasTrackedFormStart(true);
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(formStartedSessionKey, '1');
      }
    }

    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackFormSubmitted({
      form_id: formId,
      offer,
      page: '/book-call',
    });
    setLoading(true);
    setError(null);

    const result = await submitCallRequest({
      offer,
      name: formData.name,
      businessName: formData.businessName,
      trade: formData.trade,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      website: formData.website || undefined,
      teamSize: formData.teamSize || undefined,
      primaryNeed: formData.primaryNeed,
      stripePaymentUrl: content.stripePaymentUrl,
      scheduleUrl: content.scheduleUrl,
    });

    setLoading(false);

    if (!result.success) {
      trackFormSubmitFailed({
        form_id: formId,
        offer,
        page: '/book-call',
        error: result.error ?? 'Submission failed. Please try again.',
      });
      setError(result.error ?? 'Submission failed. Please try again.');
      return;
    }

    if (content.stripePaymentUrl) {
      trackStripeRedirectStarted({
        form_id: formId,
        offer,
        page: '/book-call',
        destination: content.stripePaymentUrl,
      });
      window.location.assign(content.stripePaymentUrl);
      return;
    }

    navigate(`/call-requested?offer=${offer}`);
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
            <h1 className="text-5xl font-bold uppercase leading-[0.95] tracking-tighter text-zinc-900 md:text-6xl lg:text-7xl">
              {content.title}
            </h1>
            <p className="mt-6 text-xl font-medium leading-relaxed text-zinc-600">
              {content.intro}
            </p>

            <div className="mt-8 border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <CreditCard className="mt-0.5 h-5 w-5 text-orange-500" strokeWidth={2} />
                <div>
                  <p className="font-semibold text-zinc-900">
                    {hasStripePayment ? 'This flow continues to Stripe after submit.' : 'This flow currently ends as a request form.'}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    {hasStripePayment
                      ? 'Submit your intake, then you will be redirected to Stripe to handle payment before scheduling.'
                      : 'If you want paid scheduling, add the Stripe payment URL env vars and this page will redirect automatically.'}
                  </p>
                </div>
              </div>
            </div>

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
                    {content.serviceNeeds.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
                  </select>
                  <content.primaryNeedIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95 disabled:pointer-events-none disabled:opacity-50">
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Submitting...
                  </>
                ) : hasStripePayment ? content.cta : 'Request Call'}
                {!loading && <ArrowRight className="h-5 w-5" strokeWidth={2.5} />}
              </button>

              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}

              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                {hasStripePayment
                  ? 'Simple intake first, then Stripe checkout.'
                  : 'No Stripe payment link configured yet.'}
              </p>
            </form>

            <div className="mt-8 border-t-2 border-zinc-100 pt-6">
              <Link to={content.backTo} className="group inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900">
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
