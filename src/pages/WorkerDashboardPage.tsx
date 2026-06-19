import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Save,
  Sparkles,
  UserRound,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import {
  type WorkerAvailability,
  type WorkerProfile,
  fetchMyWorkerProfile,
  upsertWorkerProfile,
  uploadResume,
  uploadWorkerPhoto,
} from '@/src/lib/workerProfiles';
import {
  type OnboardingDraft,
  clearOnboardingDraft,
  clearResumeBlob,
  loadOnboardingDraft,
  loadResumeBlob,
} from '@/src/lib/resumeParsing';

const availabilityOptions: Array<{ value: WorkerAvailability; label: string }> = [
  { value: 'on_demand', label: 'On-demand' },
  { value: 'short_term', label: 'Short-term' },
  { value: 'full_time', label: 'Full-time' },
];

type WorkerFormState = {
  displayName: string;
  headline: string;
  cityId: string;
  categoryId: string;
  availability: WorkerAvailability;
  serviceAreas: string;
  skills: string;
  rateLabel: string;
  yearsExperience: string;
  bio: string;
  photoUrl: string;
  resumePath: string;
  openToWork: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

const initialFormState: WorkerFormState = {
  displayName: '',
  headline: '',
  cityId: '',
  categoryId: '',
  availability: 'on_demand',
  serviceAreas: '',
  skills: '',
  rateLabel: '',
  yearsExperience: '',
  bio: '',
  photoUrl: '',
  resumePath: '',
  openToWork: true,
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

function profileToForm(profile: WorkerProfile): WorkerFormState {
  return {
    displayName: profile.display_name,
    headline: profile.headline,
    cityId: profile.city_id,
    categoryId: profile.category_id ?? '',
    availability: profile.availability,
    serviceAreas: profile.service_areas.join(', '),
    skills: profile.skills.join(', '),
    rateLabel: profile.rate_label ?? '',
    yearsExperience: profile.years_experience !== null ? String(profile.years_experience) : '',
    bio: profile.bio,
    photoUrl: profile.photo_url ?? '',
    resumePath: profile.resume_path ?? '',
    openToWork: profile.open_to_work,
    contactName: profile.contact_name,
    contactEmail: profile.contact_email ?? '',
    contactPhone: profile.contact_phone ?? '',
  };
}

function draftToForm(draft: OnboardingDraft): WorkerFormState {
  return {
    displayName: draft.display_name ?? '',
    headline: draft.headline ?? '',
    cityId: draft.city_id ?? '',
    categoryId: draft.category_id ?? '',
    availability: draft.availability,
    serviceAreas: draft.service_areas.join(', '),
    skills: draft.skills.join(', '),
    rateLabel: draft.rate_label ?? '',
    yearsExperience: draft.years_experience !== null ? String(draft.years_experience) : '',
    bio: draft.bio ?? '',
    photoUrl: '',
    resumePath: '',
    openToWork: draft.open_to_work,
    contactName: draft.display_name ?? '',
    contactEmail: draft.contact_email ?? '',
    contactPhone: draft.contact_phone ?? '',
  };
}

function parseList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function statusBadge(status: WorkerProfile['status']) {
  if (status === 'approved') {
    return { icon: CheckCircle2, label: 'Approved and live', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' };
  }
  if (status === 'rejected') {
    return { icon: XCircle, label: 'Needs changes', className: 'border-rose-200 bg-rose-50 text-rose-800' };
  }
  if (status === 'archived') {
    return { icon: XCircle, label: 'Archived', className: 'border-zinc-200 bg-zinc-100 text-zinc-600' };
  }
  return { icon: Clock3, label: 'Pending review', className: 'border-amber-200 bg-amber-50 text-amber-800' };
}

export default function WorkerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { cities, categories, isLoading: directoryLoading } = useDirectoryData();
  const toolsAvailable = Boolean(supabase && isSupabaseConfigured());

  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [formData, setFormData] = useState<WorkerFormState>(initialFormState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingResume, setPendingResume] = useState<File | null>(null);
  const [importedFromResume, setImportedFromResume] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      if (!toolsAvailable || !user) {
        setLoading(false);
        return;
      }

      try {
        const existing = await fetchMyWorkerProfile(user.id);
        if (!isActive) return;
        setProfile(existing);
        if (existing) {
          setFormData(profileToForm(existing));
        } else {
          // No profile yet — adopt an onboarding draft if the user just came
          // through /worker/start and signed in.
          const draft = loadOnboardingDraft();
          if (draft) {
            setFormData(draftToForm(draft));
            setImportedFromResume(true);
            const resumeFile = await loadResumeBlob();
            if (isActive && resumeFile) {
              setPendingResume(resumeFile);
            }
          }
        }
      } catch (caughtError) {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Failed to load your profile.');
        }
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, [toolsAvailable, user]);

  const badge = useMemo(() => (profile ? statusBadge(profile.status) : null), [profile]);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);
    try {
      const url = await uploadWorkerPhoto(user.id, file);
      setFormData((current) => ({ ...current, photoUrl: url }));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to upload the photo.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !toolsAvailable) return;

    const hasContact = formData.contactEmail.trim().length > 0 || formData.contactPhone.trim().length > 0;
    if (!hasContact) {
      setError('Add an email or phone number so people can contact you.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      // Upload the resume carried over from onboarding (best-effort).
      let resumePath = formData.resumePath || null;
      if (pendingResume) {
        try {
          resumePath = await uploadResume(user.id, pendingResume);
        } catch {
          // Don't block publishing the profile if the resume upload fails.
          resumePath = formData.resumePath || null;
        }
      }

      const yearsValue = formData.yearsExperience.trim();
      const saved = await upsertWorkerProfile(user.id, {
        displayName: formData.displayName,
        headline: formData.headline,
        cityId: formData.cityId,
        categoryId: formData.categoryId || undefined,
        availability: formData.availability,
        serviceAreas: parseList(formData.serviceAreas),
        skills: parseList(formData.skills),
        rateLabel: formData.rateLabel || undefined,
        yearsExperience: yearsValue ? Number(yearsValue) : null,
        bio: formData.bio,
        photoUrl: formData.photoUrl || null,
        resumePath,
        openToWork: formData.openToWork,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail || undefined,
        contactPhone: formData.contactPhone || undefined,
      });
      setProfile(saved);
      setFormData(profileToForm(saved));
      setPendingResume(null);
      setImportedFromResume(false);
      clearOnboardingDraft();
      void clearResumeBlob();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || directoryLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (!toolsAvailable) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24">
        <Seo title="Worker Dashboard | Okanagan Trades" description="Manage your worker profile." path="/worker/dashboard" robots="noindex,nofollow" />
        <div className="mx-auto max-w-2xl border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-zinc-950">Worker dashboard is offline.</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">This environment does not have the backend configured yet.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo title="Worker Dashboard | Okanagan Trades" description="Create and manage your worker profile." path="/worker/dashboard" robots="noindex,nofollow" />

      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <div className="border-b border-zinc-200 pb-8">
          <SectionEyebrow
            icon={UserRound}
            className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
            iconClassName="h-3.5 w-3.5 text-orange-500"
          >
            Worker profile
          </SectionEyebrow>
          <h1 className="mt-6 text-4xl font-bold uppercase leading-tight text-zinc-950 sm:text-5xl">
            {profile ? 'Manage your profile' : 'Create your worker profile'}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">
            Tell homeowners and contractors what you do. An admin reviews every profile before it appears publicly,
            and any edits re-enter review.
          </p>

          {badge ? (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${badge.className}`}>
                <badge.icon className="h-3.5 w-3.5" />
                {badge.label}
              </span>
              {profile?.status === 'approved' ? (
                <Link to={`/workers/${profile.id}`} className="inline-flex items-center gap-1.5 font-medium text-zinc-900 underline underline-offset-4 hover:text-orange-600">
                  View public profile
                  <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              ) : null}
            </div>
          ) : null}

          {profile?.status === 'rejected' && profile.rejection_reason ? (
            <div className="mt-4 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p><span className="font-semibold">Reviewer note:</span> {profile.rejection_reason}</p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          {error ? (
            <div className="mb-6 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}
          {saveSuccess ? (
            <div className="mb-6 flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Saved. Your profile is pending admin review.</p>
            </div>
          ) : null}
          {importedFromResume ? (
            <div className="mb-6 flex items-start gap-3 border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-800">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Imported from your resume{pendingResume ? ` (${pendingResume.name})` : ''}. Review the details below, then publish to send it for review.
              </p>
            </div>
          ) : null}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Display name *</label>
              <input type="text" name="displayName" value={formData.displayName} onChange={handleChange} required maxLength={120} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base font-medium text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Jordan the carpenter" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Headline *</label>
              <input type="text" name="headline" value={formData.headline} onChange={handleChange} required maxLength={140} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Red Seal carpenter, 8 yrs framing and finishing" />
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">City *</label>
              <select name="cityId" value={formData.cityId} onChange={handleChange} required className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                <option value="">Select city</option>
                {cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Trade</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                <option value="">General labour</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Availability *</label>
              <select name="availability" value={formData.availability} onChange={handleChange} required className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none focus:border-zinc-900 focus:bg-white">
                {availabilityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Years of experience</label>
              <input type="number" name="yearsExperience" value={formData.yearsExperience} onChange={handleChange} min={0} max={70} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="8" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Rate</label>
              <input type="text" name="rateLabel" value={formData.rateLabel} onChange={handleChange} maxLength={120} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="$32/hr or day rate negotiable" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Skills (comma separated)</label>
              <input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Framing, finishing, decks, tickets: WHMIS, fall protection" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Service areas (comma separated)</label>
              <input type="text" name="serviceAreas" value={formData.serviceAreas} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Kelowna, West Kelowna, Lake Country" />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">About you *</label>
              <textarea name="bio" value={formData.bio} onChange={handleChange} required rows={7} minLength={20} className="w-full resize-none border border-zinc-200 bg-zinc-50 px-4 py-4 text-base leading-7 text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Describe your experience, the work you take on, tools and transport, and what makes you reliable." />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Profile photo</label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden border border-zinc-200 bg-zinc-100">
                  {formData.photoUrl ? (
                    <img src={formData.photoUrl} alt="Profile preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-300"><UserRound className="h-10 w-10" strokeWidth={1.2} /></div>
                  )}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 border border-zinc-200 bg-white px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950">
                  {uploading ? 'Uploading...' : formData.photoUrl ? 'Replace photo' : 'Upload photo'}
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} disabled={uploading} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Contact name *</label>
              <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} required className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Name shown publicly" />
            </div>
            <div>
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Phone</label>
              <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Shown publicly after approval" />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white" placeholder="Shown publicly after approval" />
            </div>
          </div>

          <label className="mt-8 flex items-center gap-3 border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={formData.openToWork}
              onChange={(event) => setFormData((current) => ({ ...current, openToWork: event.target.checked }))}
              className="h-4 w-4"
            />
            I'm available for work now (uncheck to hide your profile without deleting it)
          </label>

          <button
            type="submit"
            disabled={saving || uploading}
            className="mt-6 inline-flex w-full min-h-14 items-center justify-center gap-3 border border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:bg-zinc-800 disabled:pointer-events-none disabled:opacity-60"
          >
            {saving ? 'Saving...' : profile ? 'Save and resubmit for review' : 'Submit for review'}
            {saving ? null : <Save className="h-4 w-4" strokeWidth={2.2} />}
          </button>
        </form>

        <Link
          to="/workers"
          className="mt-8 inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Browse all workers
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}
