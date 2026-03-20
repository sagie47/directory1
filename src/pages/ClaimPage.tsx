import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';

import GoogleIcon from '@/src/components/GoogleIcon';
import SectionEyebrow from '@/src/components/SectionEyebrow';
import type { Business } from '@/src/business';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { getBusinessListingPath } from '@/src/lib/ownerProfile';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import businessBg from '@/src/photos/businessown/thumbnail_G74A6639.jpg';
import { createImageFallbackHandler, preferSupabaseImage } from '@/src/supabase-images';

interface ClaimPageProps {
  onClaimComplete?: () => void;
}

const steps = [
  {
    number: '01',
    title: 'Find your listing',
    description: 'Search by name, city, trade, or address.',
  },
  {
    number: '02',
    title: 'Confirm ownership',
    description: 'Submit the details we need to review the claim.',
  },
  {
    number: '03',
    title: 'Update after approval',
    description: 'Your owner dashboard unlocks once approved.',
  },
];

const reviewPoints = [
  'Claims are manually reviewed before editing access is granted.',
  'Approved claims unlock dashboard access for the selected listing.',
  'Rejected claims can be retried with stronger ownership details.',
];

export default function ClaimPage({ onClaimComplete }: ClaimPageProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading, signInWithGoogle } = useAuth();
  const {
    businesses,
    categories,
    cities,
    isLoading: directoryLoading,
    error: directoryError,
  } = useDirectoryData();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [claimData, setClaimData] = useState({
    claimantName: '',
    claimantEmail: user?.email || '',
    claimantPhone: '',
    relationshipToBusiness: 'owner',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());
  const selectedBusinessId = searchParams.get('businessId');
  const businessBgSrc = preferSupabaseImage('thumbnail_G74A6639.jpg', businessBg);

  useEffect(() => {
    if (user?.email) {
      setClaimData((current) => ({
        ...current,
        claimantEmail: current.claimantEmail || user.email || '',
      }));
    }
  }, [user?.email]);

  const cityNames = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);
  const targetedBusiness = selectedBusiness ?? (
    selectedBusinessId
      ? businesses.find((business) => business.id === selectedBusinessId) ?? null
      : null
  );
  const targetedBusinessCityName = targetedBusiness ? cityNames.get(targetedBusiness.cityId) : undefined;
  const targetedBusinessCategoryName = targetedBusiness ? categoryNames.get(targetedBusiness.categoryId) : undefined;

  useEffect(() => {
    if (!user || directoryLoading || !selectedBusinessId) {
      return;
    }

    const matchedBusiness = businesses.find((business) => business.id === selectedBusinessId);
    if (!matchedBusiness) {
      setError('That listing could not be found. Search again to continue.');
      setSelectedBusiness(null);
      setStep(1);
      return;
    }

    setSelectedBusiness(matchedBusiness);
    setStep(2);
    setError(null);
  }, [businesses, directoryLoading, selectedBusinessId, user]);

  const filteredBusinesses = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.trim().toLowerCase();
    return businesses
      .filter((business) => {
        const cityName = cityNames.get(business.cityId)?.toLowerCase() ?? '';
        const categoryName = categoryNames.get(business.categoryId)?.toLowerCase() ?? '';

        return [business.name, cityName, categoryName, business.contact.address ?? '']
          .some((value) => value.toLowerCase().includes(query));
      })
      .slice(0, 10);
  }, [businesses, categoryNames, cityNames, searchQuery]);

  const listingPath = getBusinessListingPath(selectedBusiness);
  const selectedCityName = selectedBusiness ? cityNames.get(selectedBusiness.cityId) : undefined;
  const selectedCategoryName = selectedBusiness ? categoryNames.get(selectedBusiness.categoryId) : undefined;

  async function handleGoogleSignIn() {
    setError(null);
    setOauthLoading(true);

    const redirectPath = `${window.location.pathname}${window.location.search}`;
    const { error: signInError } = await signInWithGoogle(redirectPath);

    if (signInError) {
      setError(signInError.message);
      setOauthLoading(false);
    }
  }

  function handleSelectBusiness(business: Business) {
    setSelectedBusiness(business);
    setSearchQuery('');
    setError(null);
    setStep(2);
    setSearchParams({ businessId: business.id });
  }

  function handleBackToSearch() {
    setSelectedBusiness(null);
    setError(null);
    setStep(1);
    setSearchParams({});
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !selectedBusiness || !supabase || !claimsAvailable) {
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const { data: claimId, error: submitError } = await supabase.rpc('submit_business_claim', {
        p_business_id: selectedBusiness.id,
        p_claimant_name: claimData.claimantName,
        p_claimant_email: claimData.claimantEmail,
        p_claimant_phone: claimData.claimantPhone || null,
        p_relationship_to_business: claimData.relationshipToBusiness,
        p_message: claimData.message || null,
      });

      if (submitError) {
        const msg = submitError.message ?? '';
        const code = submitError.code ?? '';

        if (code === 'P1001' || msg.includes('pending claim')) {
          navigate('/claim/status');
          return;
        }

        if (code === 'P1002' || msg.includes('approved claim')) {
          navigate('/owner/dashboard');
          return;
        }

        if (
          code === 'P1003'
          || code === 'P1004'
          || code === '23505'
          || msg.includes('same time')
          || msg.includes('already been claimed')
        ) {
          setError('Another claim for this listing is already in review. Please check the status page.');
          return;
        }

        setError('Your claim could not be submitted. Please try again or contact support.');
        return;
      }

      if (!claimId) {
        setError('Your claim was submitted, but the confirmation id was not returned.');
        return;
      }

      onClaimComplete?.();
      navigate(`/claim/status?submitted=1&businessId=${selectedBusiness.id}`);
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || (user && directoryLoading) || (!user && Boolean(selectedBusinessId) && directoryLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (user && !claimsAvailable) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24">
        <div className="mx-auto max-w-2xl border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
          <SectionEyebrow
            icon={AlertCircle}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            iconClassName="h-3.5 w-3.5 text-orange-400"
          >
            Claim System
          </SectionEyebrow>
          <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950">Claim submission is offline.</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            This environment does not have the owner claim backend configured yet.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
        <section className="relative overflow-hidden bg-zinc-900 px-4 py-18 text-white sm:px-6 sm:py-22 lg:px-10 lg:py-26">
          <div className="absolute inset-0 z-0">
            <img
              src={businessBgSrc}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-55"
              onError={createImageFallbackHandler(businessBg)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/94 via-zinc-900/72 to-zinc-900/28" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/88 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[96rem] gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
            <div className="max-w-3xl space-y-8">
              <SectionEyebrow
                icon={Building2}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-md"
                iconClassName="h-3.5 w-3.5 text-orange-300"
              >
                Claim A Listing
              </SectionEyebrow>
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-[5.2rem] lg:leading-[0.95]">
                {targetedBusiness ? 'Claim this listing.' : 'Claim an existing listing.'}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl sm:leading-9">
                {targetedBusiness
                  ? `Sign in to verify ownership for ${targetedBusiness.name}. We will keep this exact listing selected after auth so you can submit the claim directly.`
                  : 'Sign in first, find the exact listing you want to manage, then submit the owner details we need for review.'}
              </p>
              <div className="grid gap-3 sm:grid-cols-4">
                {steps.map((stepItem) => (
                  <div key={stepItem.number} className="border border-white/12 bg-zinc-950/55 px-4 py-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Step {stepItem.number}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{stepItem.title}</p>
                  </div>
                ))}
              </div>
              {targetedBusiness ? (
                <div className="max-w-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Selected listing</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{targetedBusiness.name}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-200">
                    {targetedBusinessCityName ? <span>{targetedBusinessCityName}</span> : null}
                    {targetedBusinessCategoryName ? <span>{targetedBusinessCategoryName}</span> : null}
                    {targetedBusiness.contact.address ? <span>{targetedBusiness.contact.address}</span> : null}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border border-zinc-200 bg-white p-7 text-zinc-900 shadow-[0_28px_60px_rgba(0,0,0,0.28)] sm:p-9">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Start here</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Claiming is only for listings that already exist in the directory.
              </p>
              {reviewPoints.length ? (
                <div className="mt-5 space-y-3 border-b border-zinc-100 pb-6">
                  {reviewPoints.slice(0, 2).map((point) => (
                    <div key={point} className="flex items-start gap-3 text-sm leading-6 text-zinc-600">
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-900" />
                      <p>{point}</p>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-6">
                {error ? (
                  <div className="mb-5 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={oauthLoading}
                  className="inline-flex w-full items-center justify-center gap-3 border border-zinc-200 bg-white px-5 py-4 font-sans text-sm font-bold uppercase tracking-[0.14em] text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-60"
                >
                  <GoogleIcon />
                  {oauthLoading ? 'Connecting...' : targetedBusiness ? 'Continue to claim this listing' : 'Continue with Google'}
                </button>
                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-zinc-200" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Or</span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>
                <div className="grid gap-3">
                  <Link
                    to={`/login?redirect=${encodeURIComponent('/claim' + location.search)}`}
                    className="inline-flex items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                  >
                    {targetedBusiness ? 'Sign in for this listing' : 'Sign in'}
                    <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                  </Link>
                  <Link
                    to={`/register?redirect=${encodeURIComponent('/claim' + location.search)}`}
                    className="inline-flex items-center justify-center border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                  >
                    Create account
                  </Link>
                </div>
                <Link
                  to="/claim-business"
                  className="mt-5 inline-flex items-center gap-2 font-medium text-zinc-700 underline underline-offset-4 transition-colors hover:text-orange-600"
                >
                  Don&apos;t see your business in search?
                  <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      <section className="border-b-2 border-zinc-900 bg-white px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[96rem]">
          <SectionEyebrow
            icon={ShieldCheck}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            iconClassName="h-3.5 w-3.5 text-orange-400"
          >
            Ownership Claim
          </SectionEyebrow>
          <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            {step === 1 ? 'Select the listing to claim.' : 'Submit the owner details.'}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">
            {step === 1
              ? 'Choose the exact listing you want to manage. Claim review stays attached to that record only.'
              : 'Give us the owner details needed for manual review. After submit, the status page becomes the single place to track the decision.'}
          </p>
          {targetedBusiness ? (
            <div className="mt-6 inline-flex flex-wrap items-center gap-2 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
              <span className="font-semibold text-zinc-950">{targetedBusiness.name}</span>
              {targetedBusinessCityName ? <span>{targetedBusinessCityName}</span> : null}
              {targetedBusinessCategoryName ? <span>{targetedBusinessCategoryName}</span> : null}
            </div>
          ) : null}
          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {steps.map((stepItem, index) => {
              const isCurrent = step === 1 ? index === 0 : index === 1;
              const isComplete = step === 2 && index === 0;

              return (
                <div
                  key={stepItem.number}
                  className={`border px-4 py-4 ${
                    isCurrent
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : isComplete
                        ? 'border-emerald-200 bg-emerald-50 text-zinc-900'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                  }`}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Step {stepItem.number}</p>
                  <p className="mt-2 text-sm font-semibold tracking-tight">{stepItem.title}</p>
                  <p className="mt-2 text-sm leading-6">{stepItem.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <div className="mx-auto max-w-[96rem]">
          {error ? (
            <div className="mb-8 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="font-medium">{error}</p>
                <button type="button" onClick={() => setError(null)} className="mt-2 font-medium underline underline-offset-2">
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          {directoryError ? (
            <div className="mb-8 border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              Live directory data is unavailable. Search is using the fallback dataset right now.
            </div>
          ) : null}

          {step === 1 ? (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_22rem]">
              <section className="border-2 border-zinc-900 bg-white">
                <div className="border-b border-zinc-200 px-6 py-6 sm:px-8 sm:py-8">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Find your business</label>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
                        Search by business name, city, trade, or address. Pick the exact listing you want to claim.
                      </p>
                    </div>
                    <Link
                      to="/claim-business"
                      className="inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-white hover:text-zinc-950"
                    >
                      Don&apos;t see your business?
                      <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                    </Link>
                  </div>

                  <div className="relative mt-6">
                    <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" strokeWidth={1.8} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Business name, city, trade, or address"
                      className="w-full border border-zinc-200 bg-zinc-50 px-14 py-5 text-base font-medium text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white sm:text-lg"
                      autoFocus
                    />
                  </div>
                  <p className="mt-3 text-sm text-zinc-500">
                    {searchQuery.trim()
                      ? `${filteredBusinesses.length} matching ${filteredBusinesses.length === 1 ? 'listing' : 'listings'}`
                      : 'Start typing to see matching listings.'}
                  </p>
                </div>
                <div className="px-6 py-6 sm:px-8">
                  {filteredBusinesses.length > 0 ? (
                    <div className="space-y-3">
                      {filteredBusinesses.map((business) => (
                        <button
                          key={business.id}
                          type="button"
                          onClick={() => handleSelectBusiness(business)}
                          className="group flex w-full items-start justify-between gap-4 border border-zinc-200 bg-zinc-50 px-4 py-4 text-left transition-all hover:border-zinc-900 hover:bg-white"
                        >
                          <div>
                            <p className="text-lg font-semibold tracking-tight text-zinc-950">{business.name}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-zinc-400" strokeWidth={2} />
                                {cityNames.get(business.cityId) ?? business.cityId}
                              </span>
                              <span className="h-1 w-1 rounded-full bg-zinc-300" />
                              <span>{categoryNames.get(business.categoryId) ?? business.categoryId}</span>
                            </div>
                            {business.contact.address ? (
                              <p className="mt-2 text-sm text-zinc-500">{business.contact.address}</p>
                            ) : null}
                          </div>
                          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border border-zinc-200 bg-white text-zinc-500 transition-all group-hover:border-zinc-900 group-hover:bg-zinc-900 group-hover:text-white">
                            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.trim() ? (
                    <div className="border border-zinc-200 bg-zinc-50 px-5 py-10 text-center">
                      <h2 className="text-2xl font-semibold tracking-tight text-zinc-950">No matching listing found.</h2>
                      <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-zinc-600">
                        Double-check the search, or start a new listing request if your business is not in the directory yet.
                      </p>
                      <Link to="/claim-business" className="mt-6 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600">
                        Don&apos;t see your business? Add it here
                        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="border border-zinc-200 bg-zinc-50 p-5">
                        <p className="text-lg font-semibold tracking-tight text-zinc-950">Search by name or city</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">Use the business name, city, trade, or address to find the right listing faster.</p>
                      </div>
                      <div className="border border-zinc-200 bg-zinc-50 p-5">
                        <p className="text-lg font-semibold tracking-tight text-zinc-950">Pick the exact listing</p>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">Your claim is tied to the listing you choose here, so start with the closest match.</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              <aside className="space-y-5">
                <section className="border border-zinc-200 bg-white p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Before you submit</p>
                  <div className="mt-4 space-y-4">
                    {steps.map((stepItem) => (
                      <div key={stepItem.number} className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-zinc-900 bg-zinc-900 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                          {stepItem.number}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-900">{stepItem.title}</p>
                          <p className="mt-1 text-sm leading-6 text-zinc-600">{stepItem.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="border border-zinc-200 bg-zinc-50 p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Missing listing path</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">If the business is not in the directory yet, stop here and use the support page instead of claiming the wrong listing.</p>
                  <Link to="/claim-business" className="mt-4 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600">
                    Open missing listing help
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </Link>
                </section>
              </aside>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
              <form onSubmit={handleSubmit} className="space-y-8">
                <section className="border-2 border-zinc-900 bg-white">
                  <div className="border-b-2 border-zinc-900 bg-zinc-900 px-6 py-6 text-white sm:px-8">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Selected listing</p>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{selectedBusiness?.name}</h2>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                      {selectedCityName ? <span>{selectedCityName}</span> : null}
                      {selectedCategoryName ? <span>{selectedCategoryName}</span> : null}
                    </div>
                  </div>
                  <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
                    <div>
                      {selectedBusiness?.contact.address ? (
                        <p className="text-sm leading-6 text-zinc-600">{selectedBusiness.contact.address}</p>
                      ) : (
                        <p className="text-sm leading-6 text-zinc-500">No street address is published for this listing yet.</p>
                      )}
                    </div>
                    {listingPath ? (
                      <Link
                        to={listingPath}
                        className="inline-flex items-center justify-center gap-2 border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-white hover:text-zinc-950"
                      >
                        View public listing
                        <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
                      </Link>
                    ) : null}
                  </div>
                </section>

                <section className="border border-zinc-200 bg-white p-6 sm:p-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        <User className="h-3.5 w-3.5" />
                        Full name
                      </label>
                      <input
                        type="text"
                        value={claimData.claimantName}
                        onChange={(event) => setClaimData({ ...claimData, claimantName: event.target.value })}
                        required
                        className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        <Mail className="h-3.5 w-3.5" />
                        Email address
                      </label>
                      <input
                        type="email"
                        value={claimData.claimantEmail}
                        onChange={(event) => setClaimData({ ...claimData, claimantEmail: event.target.value })}
                        required
                        className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                        placeholder="name@business.com"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        <Phone className="h-3.5 w-3.5" />
                        Phone number
                      </label>
                      <input
                        type="tel"
                        value={claimData.claimantPhone}
                        onChange={(event) => setClaimData({ ...claimData, claimantPhone: event.target.value })}
                        className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                        placeholder="(250) 555-0000"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Your role
                      </label>
                      <select
                        value={claimData.relationshipToBusiness}
                        onChange={(event) => setClaimData({ ...claimData, relationshipToBusiness: event.target.value })}
                        className="mt-3 w-full border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors focus:border-zinc-900 focus:bg-white"
                      >
                        <option value="owner">Owner</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                        <option value="authorized">Authorized representative</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-8">
                    <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Verification notes</label>
                    <textarea
                      value={claimData.message}
                      onChange={(event) => setClaimData({ ...claimData, message: event.target.value })}
                      rows={5}
                      className="mt-3 w-full resize-none border border-zinc-200 bg-zinc-50 px-4 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                      placeholder="Add anything that helps us verify ownership faster."
                    />
                  </div>
                  <div className="mt-8 flex flex-col gap-4 border-t border-zinc-100 pt-6 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleBackToSearch}
                      className="inline-flex items-center justify-center gap-2 border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                    >
                      <ArrowLeft className="h-4 w-4" strokeWidth={2.4} />
                      Change listing
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex flex-1 items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? 'Submitting claim...' : 'Submit claim for review'}
                      {!submitting ? <ArrowRight className="h-4 w-4" strokeWidth={2.6} /> : null}
                    </button>
                  </div>
                </section>
              </form>

              <aside className="space-y-5">
                <section className="border border-zinc-200 bg-white p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">What we review</p>
                  <div className="mt-4 space-y-3">
                    {reviewPoints.map((point) => (
                      <div key={point} className="flex items-start gap-3">
                        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-900" />
                        <p className="text-sm leading-6 text-zinc-600">{point}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="border border-zinc-200 bg-zinc-50 p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">After submit</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">
                    We send you to the status page next. That page should only tell you the current review state and the next action.
                  </p>
                  <Link to="/claim/status" className="mt-4 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600">
                    Open status page
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </Link>
                </section>
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
