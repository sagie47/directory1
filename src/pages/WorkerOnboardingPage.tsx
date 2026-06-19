import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  FileText,
  Sparkles,
  Upload,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';

import GoogleIcon from '@/src/components/GoogleIcon';
import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import {
  type OnboardingDraft,
  type ParsedResumeDraft,
  clearOnboardingDraft,
  clearResumeBlob,
  parseResume,
  saveOnboardingDraft,
  saveResumeBlob,
} from '@/src/lib/resumeParsing';
import type { WorkerAvailability } from '@/src/lib/workerProfiles';

type Step = 'source' | 'parsing' | 'wizard' | 'auth';

const availabilityOptions: Array<{ value: WorkerAvailability; label: string }> = [
  { value: 'on_demand', label: 'On-demand' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'full_time', label: 'Full-time' },
];

const PUBLISH_REDIRECT = '/worker/dashboard';

const inputClass =
  'w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white';
const labelClass = 'mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500';

export default function WorkerOnboardingPage() {
  const navigate = useNavigate();
  const { user, signInWithGoogle, signInWithMagicLink } = useAuth();
  const { cities, categories } = useDirectoryData();

  const [step, setStep] = useState<Step>('source');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [draft, setDraft] = useState<ParsedResumeDraft | null>(null);
  const [wizard, setWizard] = useState({
    displayName: '',
    headline: '',
    cityId: '',
    categoryId: '',
    availability: 'on_demand' as WorkerAvailability,
    rateLabel: '',
    contactEmail: '',
    contactPhone: '',
    openToWork: true,
  });

  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const skillsPreview = useMemo(() => (draft?.skills ?? []).slice(0, 8), [draft]);

  function applyDraftToWizard(parsed: ParsedResumeDraft) {
    setWizard((current) => ({
      ...current,
      displayName: parsed.display_name ?? '',
      headline: parsed.headline ?? '',
      cityId: parsed.city_id ?? '',
      categoryId: parsed.category_id ?? '',
      rateLabel: parsed.rate_label ?? '',
      contactEmail: parsed.contact_email ?? '',
      contactPhone: parsed.contact_phone ?? '',
    }));
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setError(null);
  }

  async function runParse(source: { file?: File; text?: string }) {
    setStep('parsing');
    setParseError(null);
    const { draft: parsed, error: parseErr } = await parseResume(source, categories, cities);
    setDraft(parsed);
    applyDraftToWizard(parsed);
    if (parseErr) setParseError(parseErr);
    setStep('wizard');
  }

  function handleSkip() {
    const empty: ParsedResumeDraft = {
      display_name: null,
      headline: null,
      category_id: null,
      city_id: null,
      skills: [],
      years_experience: null,
      bio: null,
      service_areas: [],
      rate_label: null,
      contact_email: null,
      contact_phone: null,
    };
    setDraft(empty);
    setFile(null);
    setStep('wizard');
  }

  function handleWizardChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = event.target as HTMLInputElement;
    setWizard((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function persistDraft(): Promise<OnboardingDraft> {
    const merged: OnboardingDraft = {
      display_name: wizard.displayName.trim() || draft?.display_name || null,
      headline: wizard.headline.trim() || draft?.headline || null,
      category_id: wizard.categoryId || null,
      city_id: wizard.cityId || null,
      skills: draft?.skills ?? [],
      years_experience: draft?.years_experience ?? null,
      bio: draft?.bio ?? null,
      service_areas: draft?.service_areas ?? [],
      rate_label: wizard.rateLabel.trim() || null,
      contact_email: wizard.contactEmail.trim() || null,
      contact_phone: wizard.contactPhone.trim() || null,
      availability: wizard.availability,
      open_to_work: wizard.openToWork,
      resume_file_name: file?.name ?? null,
    };

    saveOnboardingDraft(merged);
    if (file) {
      await saveResumeBlob(file);
    } else {
      await clearResumeBlob();
    }
    return merged;
  }

  async function handleWizardSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!wizard.displayName.trim() || !wizard.headline.trim()) {
      setError('Add your name and a short headline.');
      return;
    }
    if (!wizard.cityId) {
      setError('Select the city you work in.');
      return;
    }
    if (!wizard.contactEmail.trim() && !wizard.contactPhone.trim()) {
      setError('Add an email or phone number so people can reach you.');
      return;
    }

    await persistDraft();

    // Already signed in? Skip straight to the dashboard to review and publish.
    if (user) {
      navigate(PUBLISH_REDIRECT);
      return;
    }
    setStep('auth');
  }

  async function handleGoogle() {
    setAuthBusy(true);
    setError(null);
    const { error: googleError } = await signInWithGoogle(PUBLISH_REDIRECT);
    if (googleError) {
      setError(googleError.message);
      setAuthBusy(false);
    }
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!magicEmail.trim()) return;
    setAuthBusy(true);
    setError(null);
    const { error: magicError } = await signInWithMagicLink(magicEmail.trim(), PUBLISH_REDIRECT);
    setAuthBusy(false);
    if (magicError) {
      setError(magicError.message);
      return;
    }
    setMagicSent(true);
  }

  // If they were already signed in when landing here mid-flow, nothing else to do.
  useEffect(() => {
    if (step === 'auth' && user) {
      navigate(PUBLISH_REDIRECT);
    }
  }, [navigate, step, user]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo
        title="Get Hired Fast | Okanagan Trades Worker Profile"
        description="Upload your resume and we'll build your worker profile in seconds. Answer a few quick questions and get listed for local trades work."
        path="/worker/start"
        robots="noindex,follow"
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <SectionEyebrow
          icon={Sparkles}
          className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
          iconClassName="h-3.5 w-3.5 text-orange-500"
        >
          Resume to profile
        </SectionEyebrow>
        <h1 className="mt-6 text-4xl font-bold uppercase leading-tight text-zinc-950 sm:text-5xl">
          Get listed for work in minutes
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-600">
          Drop in your resume and we'll draft your profile automatically. Answer a few quick questions, then sign in
          once to publish.
        </p>

        {error ? (
          <div className="mt-6 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {step === 'source' ? (
          <div className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-3 border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-10 text-center transition-colors hover:border-zinc-900 hover:bg-white"
            >
              <Upload className="h-8 w-8 text-zinc-400" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700">
                {file ? file.name : 'Upload a PDF or DOCX resume'}
              </span>
              <span className="text-sm text-zinc-500">Click to browse</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="my-6 flex items-center gap-4 text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">or paste it</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <textarea
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              rows={6}
              className={`${inputClass} resize-none`}
              placeholder="Paste your resume text here..."
            />

            <button
              type="button"
              disabled={!file && !pastedText.trim()}
              onClick={() => void runParse(file ? { file } : { text: pastedText })}
              className="mt-6 inline-flex w-full min-h-14 items-center justify-center gap-3 border border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-60"
            >
              Build my profile
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleSkip}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Skip and fill the form manually
            </button>
          </div>
        ) : null}

        {step === 'parsing' ? (
          <div className="mt-8 flex min-h-64 flex-col items-center justify-center gap-4 border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Reading your resume</p>
          </div>
        ) : null}

        {step === 'wizard' ? (
          <form onSubmit={handleWizardSubmit} className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            {parseError ? (
              <div className="mb-6 flex items-start gap-3 border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{parseError} You can fill everything in below.</p>
              </div>
            ) : draft && (draft.display_name || draft.headline || draft.skills.length > 0) ? (
              <div className="mb-6 flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <p>We drafted your profile from your resume. Confirm the essentials below.</p>
              </div>
            ) : null}

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Your name *</label>
                <input name="displayName" value={wizard.displayName} onChange={handleWizardChange} required className={inputClass} placeholder="Jordan the carpenter" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Headline *</label>
                <input name="headline" value={wizard.headline} onChange={handleWizardChange} required maxLength={140} className={inputClass} placeholder="Red Seal carpenter, 8 yrs framing and finishing" />
              </div>
              <div>
                <label className={labelClass}>Primary trade</label>
                <select name="categoryId" value={wizard.categoryId} onChange={handleWizardChange} className={inputClass}>
                  <option value="">General labour</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <select name="cityId" value={wizard.cityId} onChange={handleWizardChange} required className={inputClass}>
                  <option value="">Select city</option>
                  {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Availability *</label>
                <select name="availability" value={wizard.availability} onChange={handleWizardChange} required className={inputClass}>
                  {availabilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Rate</label>
                <input name="rateLabel" value={wizard.rateLabel} onChange={handleWizardChange} className={inputClass} placeholder="$32/hr or negotiable" />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input name="contactPhone" type="tel" value={wizard.contactPhone} onChange={handleWizardChange} className={inputClass} placeholder="(250) 555-0000" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input name="contactEmail" type="email" value={wizard.contactEmail} onChange={handleWizardChange} className={inputClass} placeholder="you@email.com" />
              </div>
            </div>

            {skillsPreview.length > 0 ? (
              <div className="mt-6">
                <p className={labelClass}>Skills we found</p>
                <div className="flex flex-wrap gap-2">
                  {skillsPreview.map((skill) => (
                    <span key={skill} className="inline-flex items-center border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700">{skill}</span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-zinc-500">You can edit these and your full bio on the next screen.</p>
              </div>
            ) : null}

            <label className="mt-6 flex items-center gap-3 text-sm text-zinc-700">
              <input type="checkbox" name="openToWork" checked={wizard.openToWork} onChange={handleWizardChange} className="h-4 w-4" />
              I'm available for work now
            </label>

            <button
              type="submit"
              className="mt-8 inline-flex w-full min-h-14 items-center justify-center gap-3 border border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-zinc-800"
            >
              Continue to publish
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : null}

        {step === 'auth' ? (
          <div className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-orange-500" />
              <p className="text-sm text-zinc-600">Your profile is ready{file ? ` (with ${file.name})` : ''}. Sign in once to publish it.</p>
            </div>

            {magicSent ? (
              <div className="mt-6 flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Check your email for a sign-in link. Open it to finish publishing your profile.</p>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => void handleGoogle()}
                  disabled={authBusy}
                  className="mt-6 inline-flex w-full min-h-12 items-center justify-center gap-3 border border-zinc-900 bg-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>

                <div className="my-6 flex items-center gap-4 text-zinc-400">
                  <span className="h-px flex-1 bg-zinc-200" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]">or</span>
                  <span className="h-px flex-1 bg-zinc-200" />
                </div>

                <form onSubmit={handleMagicLink}>
                  <label className={labelClass}>Email me a sign-in link</label>
                  <input type="email" value={magicEmail} onChange={(event) => setMagicEmail(event.target.value)} required className={inputClass} placeholder="you@email.com" />
                  <button
                    type="submit"
                    disabled={authBusy}
                    className="mt-4 inline-flex w-full min-h-12 items-center justify-center gap-3 border border-zinc-900 bg-zinc-900 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
                  >
                    Send magic link
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-500">
                  Prefer a password?{' '}
                  <Link to={`/login?redirect=${encodeURIComponent(PUBLISH_REDIRECT)}`} className="font-medium text-zinc-900 underline underline-offset-4 hover:text-orange-600">
                    Sign in here
                  </Link>
                </p>
              </>
            )}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => {
            clearOnboardingDraft();
            void clearResumeBlob();
            navigate('/workers');
          }}
          className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to workers
        </button>
      </div>
    </motion.div>
  );
}
