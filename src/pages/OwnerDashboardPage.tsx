import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  Phone,
  Save,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import type { Business, BusinessHours } from '@/src/business';
import OwnerProfileChecklist from '@/src/components/OwnerProfileChecklist';
import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { trackEvent, trackPaidPlanIntentClicked, trackPaidPlanIntentViewed } from '@/src/lib/analytics';
import { getBusinessListingPath, getOwnerProfileProgress } from '@/src/lib/ownerProfile';
import { DIRECTORY_PLAN_TIERS, VERIFIED_LAUNCH_NOTE } from '@/src/lib/pricing';
import { getOwnerRecommendation } from '@/src/lib/recommendations';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

interface BusinessClaim {
  id: string;
  business_id: string;
  status: 'approved';
}

interface BusinessOverride {
  business_id: string;
  name?: string | null;
  description?: string | null;
  contact?: {
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    email?: string | null;
  };
  service_areas?: string[];
  hours?: BusinessHours;
  photos?: string[];
}

const defaultHours: BusinessHours = {
  monday: '',
  tuesday: '',
  wednesday: '',
  thursday: '',
  friday: '',
  saturday: '',
  sunday: '',
};
const OWNER_SELECTED_CLAIM_STORAGE_KEY = 'owner-dashboard:selected-claim-id';
const paidDirectoryPlans = DIRECTORY_PLAN_TIERS.filter(
  (tier) => tier.id === 'verified' || tier.id === 'verified-pro',
);

function getPaidIntentFromHref(href?: string) {
  if (!href) return null;
  if (href === '/never-miss-a-lead') {
    return { planId: 'never-miss-a-lead', planCategory: 'service' as const };
  }
  if (href === '/websites-for-trades') {
    return { planId: 'website', planCategory: 'service' as const };
  }
  if (href === '/managed-growth') {
    return { planId: 'managed-growth', planCategory: 'service' as const };
  }
  if (href === '/for-business') {
    return { planId: 'verified', planCategory: 'directory' as const };
  }
  return null;
}

function normalizeHours(hours?: BusinessHours) {
  return {
    ...defaultHours,
    ...(hours ?? {}),
  };
}

function parseListValues(value: string) {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveOverrideValue(overrideValue: string | null | undefined, fallbackValue?: string) {
  if (overrideValue === undefined) {
    return fallbackValue ?? '';
  }

  return overrideValue ?? '';
}

export default function OwnerDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { businesses, cities, isLoading: directoryLoading, refresh } = useDirectoryData();
  const [approvedClaims, setApprovedClaims] = useState<BusinessClaim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>('');
  const [approvedClaim, setApprovedClaim] = useState<BusinessClaim | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ownerToolsAvailable = Boolean(supabase && isSupabaseConfigured());

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    website: '',
    address: '',
    email: '',
    serviceAreas: '',
    photos: '',
    hours: { ...defaultHours },
  });

  useEffect(() => {
    trackEvent('owner_dashboard_viewed');
  }, []);

  async function hydrateClaim(claim: BusinessClaim) {
    if (!supabase) {
      return;
    }

    const matchedBusiness = businesses.find((entry) => entry.id === claim.business_id) ?? null;
    setApprovedClaim(claim);
    setSelectedClaimId(claim.id);
    setBusiness(matchedBusiness);

    const { data: overrideData } = await supabase
      .from('business_overrides')
      .select('*')
      .eq('business_id', claim.business_id)
      .maybeSingle();

    const override = (overrideData ?? null) as BusinessOverride | null;
    const overrideContact = override?.contact;

    setFormData({
      name: resolveOverrideValue(override?.name, matchedBusiness?.name),
      description: resolveOverrideValue(override?.description, matchedBusiness?.description),
      phone: resolveOverrideValue(overrideContact?.phone, matchedBusiness?.contact?.phone),
      website: resolveOverrideValue(overrideContact?.website, matchedBusiness?.contact?.website),
      address: resolveOverrideValue(overrideContact?.address, matchedBusiness?.contact?.address),
      email: resolveOverrideValue(overrideContact?.email, matchedBusiness?.contact?.email),
      serviceAreas: override?.service_areas !== undefined
        ? override.service_areas.join(', ')
        : (matchedBusiness?.serviceAreas?.join(', ') ?? ''),
      photos: override?.photos !== undefined
        ? override.photos.join('\n')
        : (matchedBusiness?.photos?.join('\n') ?? ''),
      hours: normalizeHours(override?.hours !== undefined ? override.hours : matchedBusiness?.hours),
    });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(OWNER_SELECTED_CLAIM_STORAGE_KEY, claim.id);
    }
  }

  useEffect(() => {
    async function fetchClaims() {
      if (directoryLoading) {
        return;
      }

      if (!ownerToolsAvailable || !supabase || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('business_claims')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'approved')
          .order('updated_at', { ascending: false });

        const claimList = (data ?? []) as BusinessClaim[];
        setApprovedClaims(claimList);

        if (claimList.length > 0) {
          const preferredClaimId = typeof window !== 'undefined'
            ? window.localStorage.getItem(OWNER_SELECTED_CLAIM_STORAGE_KEY)
            : null;
          const preferredClaim = preferredClaimId
            ? claimList.find((claim) => claim.id === preferredClaimId) ?? null
            : null;

          await hydrateClaim(preferredClaim ?? claimList[0]);
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load the owner dashboard.');
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [businesses, directoryLoading, ownerToolsAvailable, user]);

  const city = cities.find((entry) => entry.id === business?.cityId);
  const listingPath = getBusinessListingPath(business);
  const formSnapshot = useMemo(() => ({
    name: formData.name,
    description: formData.description,
    contact: {
      phone: formData.phone,
      website: formData.website,
      address: formData.address,
      email: formData.email,
    },
    serviceAreas: formData.serviceAreas.split(',').map((value) => value.trim()).filter(Boolean),
    photos: parseListValues(formData.photos),
    hours: formData.hours,
  }), [formData]);
  const progress = useMemo(() => getOwnerProfileProgress(formSnapshot), [formSnapshot]);
  const photoUrls = useMemo(() => parseListValues(formData.photos), [formData.photos]);
  const recommendation = getOwnerRecommendation({ business: formSnapshot, claimStatus: 'approved' });
  const serviceLanes = useMemo(() => ([
    {
      title: 'Website Offer',
      description: formData.website.trim()
        ? 'Use this when the site needs stronger mobile trust, clearer calls to action, or a sharper first impression.'
        : 'No website is live yet. This is the fastest paid lane for turning a basic listing into a stronger trust layer.',
      href: '/websites-for-trades',
      cta: 'See Website Offer',
      icon: Globe,
    },
    {
      title: 'Lead Capture',
      description: 'Use this when missed calls, slow follow-up, or weak intake are costing real jobs.',
      href: '/never-miss-a-lead',
      cta: 'View Lead Capture',
      icon: Phone,
    },
    {
      title: 'Managed Growth',
      description: 'Use this when the basics are covered and you want ongoing help with visibility, follow-up, and execution.',
      href: '/managed-growth',
      cta: 'See Managed Growth',
      icon: TrendingUp,
    },
  ]), [formData.website]);
  const pageSeo = (
    <Seo
      title="Owner Dashboard | Okanagan Trades"
      description="Manage your approved Okanagan Trades listing and update the public details customers rely on."
      path="/owner/dashboard"
      robots="noindex,nofollow"
    />
  );

  useEffect(() => {
    if (business) {
      trackEvent('owner_dashboard_recommendation_viewed', { type: recommendation.type });
    }
  }, [business, recommendation.type]);

  useEffect(() => {
    if (!business) return;
    trackPaidPlanIntentViewed({
      plan_id: 'verified',
      plan_category: 'directory',
      source_page: '/owner/dashboard',
      business_id: business.id,
    });
    trackPaidPlanIntentViewed({
      plan_id: 'verified-pro',
      plan_category: 'directory',
      source_page: '/owner/dashboard',
      business_id: business.id,
    });
  }, [business]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !approvedClaim || !supabase || !ownerToolsAvailable) {
      return;
    }

    setError(null);
    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error: upsertError } = await supabase
        .from('business_overrides')
        .upsert({
          business_id: approvedClaim.business_id,
          name: formData.name.trim() || null,
          description: formData.description || null,
          contact: {
            phone: formData.phone || null,
            website: formData.website || null,
            address: formData.address || null,
            email: formData.email || null,
          },
          service_areas: formData.serviceAreas.split(',').map((value) => value.trim()).filter(Boolean),
          photos: parseListValues(formData.photos),
          hours: formData.hours,
          updated_by: user.id,
        }, { onConflict: 'business_id' });

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      await refresh();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Failed to save your changes.');
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || directoryLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (!ownerToolsAvailable) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24">
        {pageSeo}
        <div className="mx-auto max-w-2xl border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
          <h1 className="text-4xl font-bold uppercase tracking-tight text-zinc-950">Owner dashboard is offline.</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">This environment does not have the owner backend configured yet.</p>
        </div>
      </div>
    );
  }

  if (!approvedClaim || !business) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24">
        {pageSeo}
        <div className="mx-auto max-w-3xl border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
          <SectionEyebrow
            icon={ShieldCheck}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            iconClassName="h-3.5 w-3.5 text-orange-400"
          >
            Owner Dashboard
          </SectionEyebrow>
          <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950">No approved claims yet.</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">Claim a listing first. Once ownership is approved, the dashboard opens automatically for that business.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/claim"
              className="inline-flex items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
            >
              Start a claim
              <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
            </Link>
            <Link
              to="/claim/status"
              className="inline-flex items-center justify-center border border-zinc-200 bg-white px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
            >
              View claim status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      {pageSeo}
      <section className="border-b-2 border-zinc-900 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[96rem]">
          <SectionEyebrow
            icon={ShieldCheck}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            iconClassName="h-3.5 w-3.5 text-orange-400"
          >
            Owner Dashboard
          </SectionEyebrow>
          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-bold uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl">{business.name}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">
                Update the public details customers depend on first: your description, contact info, service area, and hours.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                {city ? <span>{city.name}</span> : null}
                <span>{business.categoryId}</span>
                {listingPath ? (
                  <Link to={listingPath} className="inline-flex items-center gap-1.5 font-medium text-zinc-900 underline underline-offset-4 hover:text-orange-600">
                    View public listing
                    <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
                  </Link>
                ) : null}
              </div>
            </div>
            <div className="border border-zinc-200 bg-zinc-50 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Editing scope</p>
              <div className="mt-4 space-y-3 text-sm text-zinc-600">
                <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-3">
                  <span>Listing health</span>
                  <span className="text-3xl font-bold tracking-tight text-zinc-950">{progress.completed}/{progress.total}</span>
                </div>
                <div className="flex items-end justify-between gap-4 border-b border-zinc-200 pb-3">
                  <span>Complete</span>
                  <span className="text-xl font-semibold tracking-tight text-zinc-950">{progress.percent}%</span>
                </div>
                <p className="leading-6">Tighten the customer-facing basics first, then move to the next recommended improvement.</p>
              </div>
              {approvedClaims.length > 1 ? (
                <div className="mt-5 border-t border-zinc-200 pt-5">
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Manage another listing</label>
                  <select
                    value={selectedClaimId}
                    onChange={async (event) => {
                      const nextClaim = approvedClaims.find((claim) => claim.id === event.target.value);
                      if (nextClaim) {
                        setLoading(true);
                        try {
                          await hydrateClaim(nextClaim);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="mt-3 w-full border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                  >
                    {approvedClaims.map((claim) => {
                      const optionBusiness = businesses.find((entry) => entry.id === claim.business_id);
                      return (
                        <option key={claim.id} value={claim.id}>
                          {optionBusiness?.name ?? claim.business_id}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div className="mx-auto grid max-w-[96rem] gap-8 xl:grid-cols-[minmax(0,1.2fr)_22rem]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error ? (
              <div className="flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}
            {saveSuccess ? (
              <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Your listing changes were saved.</p>
              </div>
            ) : null}

            <section className="border-2 border-zinc-900 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Public profile</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Business name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                    placeholder="Business name"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Business description</label>
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    rows={5}
                    className="mt-3 w-full resize-none border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                    placeholder="Explain what your business does and who it helps."
                  />
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                      className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                      placeholder="(250) 555-0000"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(event) => setFormData({ ...formData, website: event.target.value })}
                      className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                      className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                      placeholder="name@business.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                      className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                      placeholder="123 Main St, Kelowna, BC"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Service areas</label>
                  <input
                    type="text"
                    value={formData.serviceAreas}
                    onChange={(event) => setFormData({ ...formData, serviceAreas: event.target.value })}
                    className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                    placeholder="Kelowna, West Kelowna, Lake Country"
                  />
                </div>
              </div>
            </section>

            <section className="border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Listing images</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Add one public image URL per line. These will replace the photo set shown on the listing.
              </p>
              <div className="mt-6">
                <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Photo URLs</label>
                <textarea
                  value={formData.photos}
                  onChange={(event) => setFormData({ ...formData, photos: event.target.value })}
                  rows={6}
                  className="mt-3 w-full resize-none border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                  placeholder={'https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg'}
                />
              </div>
              {photoUrls.length > 0 ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {photoUrls.slice(0, 4).map((photoUrl) => (
                    <div key={photoUrl} className="overflow-hidden border border-zinc-200 bg-zinc-50">
                      <img src={photoUrl} alt="" className="h-40 w-full object-cover" loading="lazy" decoding="async" />
                      <div className="border-t border-zinc-200 px-3 py-2">
                        <p className="truncate text-xs text-zinc-500">{photoUrl}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="border border-zinc-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950">Business hours</h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
                  <div key={day}>
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{day}</label>
                    <input
                      type="text"
                      value={formData.hours[day]}
                      onChange={(event) => setFormData({
                        ...formData,
                        hours: {
                          ...formData.hours,
                          [day]: event.target.value,
                        },
                      })}
                      className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                      placeholder="9:00 AM - 5:00 PM"
                    />
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-3 border-t border-zinc-100 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save listing changes'}
                {!saving ? <Save className="h-4 w-4" strokeWidth={2.2} /> : null}
              </button>
              {listingPath ? (
                <Link
                  to={listingPath}
                  className="inline-flex items-center justify-center gap-2 border border-zinc-200 bg-white px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  View live listing
                  <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              ) : null}
            </div>
          </form>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <OwnerProfileChecklist
              items={progress.fields}
              title="Listing health"
              description="These are the fields customers see first. Tighten these before anything else."
              compact
            />

            <section className="border border-zinc-200 bg-zinc-50 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Next opportunity</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">{recommendation.title}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">{recommendation.description}</p>
              <p className="mt-3 text-xs leading-5 text-zinc-500">
                Claim approval already gave you owner access. You can use any paid lane below whenever the bottleneck is bigger than basic listing cleanup.
              </p>
              {recommendation.href && recommendation.ctaLabel ? (
                <Link
                  to={recommendation.href}
                  onClick={() => {
                    trackEvent('owner_dashboard_recommendation_clicked', {
                      type: recommendation.type,
                      cta_target: recommendation.href,
                    });

                    const paidIntent = getPaidIntentFromHref(recommendation.href);
                    if (paidIntent) {
                      trackPaidPlanIntentClicked({
                        plan_id: paidIntent.planId,
                        plan_category: paidIntent.planCategory,
                        source_page: '/owner/dashboard',
                        cta_label: recommendation.ctaLabel,
                        destination: recommendation.href,
                        recommendation_type: recommendation.type,
                      });
                    }
                  }}
                  className="mt-5 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600"
                >
                  {recommendation.ctaLabel}
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              ) : null}
            </section>

            <section className="border border-zinc-200 bg-white p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Direct service lanes</p>
              <div className="mt-4 space-y-4">
                {serviceLanes.map((lane) => {
                  const isRecommended = recommendation.href === lane.href;

                  return (
                    <div
                      key={lane.title}
                      className={`border p-4 transition-colors ${
                        isRecommended
                          ? 'border-orange-200 bg-orange-50'
                          : 'border-zinc-200 bg-zinc-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-9 w-9 items-center justify-center border ${
                          isRecommended
                            ? 'border-orange-200 bg-white text-orange-600'
                            : 'border-zinc-200 bg-white text-zinc-600'
                        }`}>
                          <lane.icon className="h-4 w-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-950">{lane.title}</h3>
                            {isRecommended ? (
                              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">Recommended</span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">{lane.description}</p>
                          <Link
                            to={lane.href}
                            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600"
                          >
                            {lane.cta}
                            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="border border-zinc-200 bg-zinc-50 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Directory pricing</p>
              <div className="mt-3 space-y-3 text-sm leading-6 text-zinc-600">
                {paidDirectoryPlans.map((tier) => (
                  <p key={tier.id}>
                    <span className="font-semibold text-zinc-900">{tier.name}:</span> {tier.price}
                  </p>
                ))}
                <p>{VERIFIED_LAUNCH_NOTE}</p>
              </div>
              <Link
                to="/for-business"
                onClick={() => trackPaidPlanIntentClicked({
                  plan_id: 'verified-pro',
                  plan_category: 'directory',
                  source_page: '/owner/dashboard',
                  cta_label: 'Review Directory Pricing',
                  destination: '/for-business',
                })}
                className="mt-4 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600"
              >
                Review directory pricing
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
