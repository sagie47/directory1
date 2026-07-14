import { type ChangeEvent, type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Mail,
  Phone,
  Send,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useDirectoryData } from '@/src/directory-data';
import {
  type ClassifiedDurationType,
  type ClassifiedInput,
  type ClassifiedKind,
  submitClassified,
} from '@/src/lib/classifieds';

const durationOptions: Array<{ value: ClassifiedDurationType; label: string }> = [
  { value: 'on_demand', label: 'On-demand' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'full_time', label: 'Full-time' },
];

type ClassifiedFormState = {
  kind: ClassifiedKind;
  title: string;
  description: string;
  cityId: string;
  categoryId: string;
  durationType: ClassifiedDurationType;
  organizationName: string;
  compensationLabel: string;
  startDate: string;
  endDate: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

const initialFormState: ClassifiedFormState = {
  kind: 'job',
  title: '',
  description: '',
  cityId: '',
  categoryId: '',
  durationType: 'on_demand',
  organizationName: '',
  compensationLabel: '',
  startDate: '',
  endDate: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

function normalizeSubmission(formData: ClassifiedFormState): ClassifiedInput {
  return {
    kind: formData.kind,
    title: formData.title,
    description: formData.description,
    cityId: formData.cityId,
    categoryId: formData.categoryId || undefined,
    durationType: formData.durationType,
    organizationName: formData.organizationName || undefined,
    compensationLabel: formData.compensationLabel || undefined,
    startDate: formData.startDate || undefined,
    endDate: formData.endDate || undefined,
    contactName: formData.contactName,
    contactEmail: formData.contactEmail || undefined,
    contactPhone: formData.contactPhone || undefined,
  };
}

export default function ClassifiedsPostPage() {
  const navigate = useNavigate();
  const { cities, categories, isLoading: directoryLoading } = useDirectoryData();
  const [formData, setFormData] = useState<ClassifiedFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleKindChange(kind: ClassifiedKind) {
    setFormData((current) => ({
      ...current,
      kind,
      title: current.title,
      organizationName: kind === 'worker' ? '' : current.organizationName,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const hasContact = formData.contactEmail.trim().length > 0 || formData.contactPhone.trim().length > 0;

    if (!hasContact) {
      setError('Add an email or phone number so people can contact you.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await submitClassified(normalizeSubmission(formData));
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Unable to submit the listing right now.');
      return;
    }

    navigate('/classifieds/submitted');
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo
        title="Post a Trades Classified | Okanagan Trades"
        description="Submit a moderated Okanagan trades job post or labourer availability listing."
        path="/classifieds/post"
        robots="noindex,follow"
      />

      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:items-start">
          <div>
            <SectionEyebrow
              icon={Send}
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-orange-500"
            >
              Public submission
            </SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase leading-tight text-zinc-950 sm:text-5xl">
              Post a trades classified
            </h1>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              Submit a hiring post or a labourer availability listing. An admin reviews every listing before it appears publicly.
            </p>

            <div className="mt-8 space-y-4 border-t border-zinc-200 pt-6">
              {[
                'Jobs, on-demand shifts, short-term projects, and full-time roles are accepted.',
                'Approved listings show your direct phone or email contact info.',
                'Listings expire automatically after 45 days unless reviewed again.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-orange-500" />
                  <p className="text-sm leading-6 text-zinc-600">{item}</p>
                </div>
              ))}
            </div>

            <Link
              to="/classifieds"
              className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900"
            >
              <ArrowRight className="h-3.5 w-3.5 rotate-180" />
              Back to classifieds
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="mb-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleKindChange('job')}
                className={`flex min-h-14 items-center justify-center gap-2 border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  formData.kind === 'job'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-950'
                }`}
              >
                <BriefcaseBusiness className="h-4 w-4" />
                Job
              </button>
              <button
                type="button"
                onClick={() => handleKindChange('worker')}
                className={`flex min-h-14 items-center justify-center gap-2 border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] transition-colors ${
                  formData.kind === 'worker'
                    ? 'border-zinc-900 bg-zinc-900 text-white'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-950'
                }`}
              >
                <UserRound className="h-4 w-4" />
                Labourer
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  maxLength={120}
                  className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                  placeholder={formData.kind === 'job' ? 'Journeyman plumber needed next week' : 'Reliable general labourer available'}
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">City *</label>
                <select name="cityId" value={formData.cityId} onChange={handleChange} required disabled={directoryLoading} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white disabled:opacity-60">
                  <option value="">Select city</option>
                  {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Trade</label>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} disabled={directoryLoading} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white disabled:opacity-60">
                  <option value="">General labour</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Duration *</label>
                <select name="durationType" value={formData.durationType} onChange={handleChange} required className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                  {durationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                  {formData.kind === 'job' ? 'Company' : 'Current company'}
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                  placeholder={formData.kind === 'job' ? 'Company name' : 'Optional'}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"><CalendarDays className="h-3.5 w-3.5" />Start date</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"><CalendarDays className="h-3.5 w-3.5" />End date</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} min={formData.startDate || undefined} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Compensation or rate</label>
                <input
                  type="text"
                  name="compensationLabel"
                  value={formData.compensationLabel}
                  onChange={handleChange}
                  maxLength={120}
                  className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                  placeholder={formData.kind === 'job' ? '$30-$40/hr, project rate, or negotiable' : '$28/hr or day rate negotiable'}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={7}
                  minLength={20}
                  className="w-full resize-none border border-zinc-200 bg-zinc-50 px-4 py-4 text-base leading-7 text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                  placeholder={formData.kind === 'job' ? 'Describe the role, required experience, job site, schedule, and what to bring.' : 'Describe your experience, tools, tickets, availability, transport, and preferred work.'}
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Contact name *</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Name shown publicly" />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"><Phone className="h-3.5 w-3.5" />Phone</label>
                <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Shown publicly after approval" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500"><Mail className="h-3.5 w-3.5" />Email</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Shown publicly after approval" />
              </div>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading || directoryLoading}
              className="mt-8 inline-flex w-full min-h-14 items-center justify-center gap-3 border border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-60"
            >
              {loading ? 'Submitting' : 'Submit for review'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
