import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';

import GoogleIcon from '@/src/components/GoogleIcon';
import SectionEyebrow from '@/src/components/SectionEyebrow';
import type { Business } from '@/src/business';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { getBusinessListingPath } from '@/src/lib/ownerProfile';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import businessBg from '@/src/photos/businessown/thumbnail_G74A6639.jpg';
import claimFlowPhotoA from '@/src/photos/phoyo/pexels-tima-miroshnichenko-5845968.jpg';
import claimFlowPhotoB from '@/src/photos/phoyo/pexels-zeoxs-12366518.jpg';
import {
  createImageFallbackHandler,
  preferSupabaseImage,
} from '@/src/supabase-images';

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
  const [success, setSuccess] = useState(false);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());
  const selectedBusinessId = searchParams.get('businessId');
  const businessBgSrc = preferSupabaseImage('thumbnail_G74A6639.jpg', businessBg);
  const claimFlowPhotoPrimary = claimFlowPhotoA;
  const claimFlowPhotoSecondary = claimFlowPhotoB;

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
      const { data: existingClaim } = await supabase
        .from('business_claims')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('business_id', selectedBusiness.id)
        .in('status', ['pending', 'approved'])
        .maybeSingle();

      if (existingClaim?.status === 'pending') {
        setError('You already have a pending claim for this business.');
        return;
      }

      if (existingClaim?.status === 'approved') {
        setError('You have already claimed this business.');
        return;
      }

      const { data: otherApprovedClaim } = await supabase
        .from('business_claims')
        .select('id')
        .eq('business_id', selectedBusiness.id)
        .eq('status', 'approved')
        .neq('user_id', user.id)
        .maybeSingle();

      if (otherApprovedClaim) {
        setError('This business has already been claimed by another user.');
        return;
      }

      const { data: rejectedClaim } = await supabase
        .from('business_claims')
        .select('id')
        .eq('user_id', user.id)
        .eq('business_id', selectedBusiness.id)
        .eq('status', 'rejected')
        .maybeSingle();

      if (rejectedClaim) {
        await supabase.from('business_claims').delete().eq('id', rejectedClaim.id);
      }

      const { error: insertError } = await supabase.from('business_claims').insert({
        user_id: user.id,
        business_id: selectedBusiness.id,
        claimant_name: claimData.claimantName,
        claimant_email: claimData.claimantEmail,
        claimant_phone: claimData.claimantPhone || null,
        relationship_to_business: claimData.relationshipToBusiness,
        message: claimData.message || null,
      });

      if (insertError) {
        setError(insertError.code === '23505'
          ? 'You have already submitted a claim for this business.'
          : insertError.message);
        return;
      }

      setSuccess(true);
      onClaimComplete?.();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading || (user && directoryLoading)) {
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

  if (success) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl border-2 border-zinc-900 bg-white shadow-[10px_10px_0px_0px_rgba(24,24,27,1)]">
          <div className="border-b-2 border-zinc-900 bg-zinc-900 px-6 py-6 text-white sm:px-10">
            <SectionEyebrow
              icon={Check}
              className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
              iconClassName="h-3.5 w-3.5 text-orange-300"
            >
              Claim Submitted
            </SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight sm:text-5xl">We have your claim.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
              We will review ownership for <span className="font-semibold text-white">{selectedBusiness?.name}</span> and
              notify you when the decision is made.
            </p>
          </div>
          <div className="grid gap-6 px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-3">
              {reviewPoints.map((point) => (
                <div key={point} className="flex items-start gap-3 border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-500 text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                  <p className="text-sm leading-6 text-zinc-700">{point}</p>
                </div>
              ))}
            </div>
            <div className="border border-zinc-200 bg-zinc-50 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Next action</p>
              <Link
                to="/claim/status"
                className="mt-5 inline-flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
              >
                Track claim status
                <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
        <section className="relative overflow-hidden bg-zinc-900 px-4 pb-18 pt-26 text-white sm:px-6 sm:pb-24 sm:pt-34 lg:px-10 lg:pb-28 lg:pt-42">
          <div className="absolute inset-0 z-0">
            <motion.img
              initial={{ scale: 1.08, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.58 }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              src={businessBgSrc}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              onError={createImageFallbackHandler(businessBg)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/94 via-zinc-900/72 to-zinc-900/28" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/88 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />
          </div>

          <div className="relative z-10 mx-auto grid max-w-[96rem] gap-12 lg:grid-cols-[minmax(0,1.1fr)_28rem] lg:items-end">
            <div className="max-w-3xl">
              <SectionEyebrow
                icon={Building2}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-100 backdrop-blur-md"
                iconClassName="h-3.5 w-3.5 text-orange-300"
              >
                Owner Flow
              </SectionEyebrow>
              <h1 className="mt-8 text-5xl font-medium tracking-tight text-white sm:text-6xl lg:text-[6rem] lg:leading-[0.96]">
                Claim your
                <br />
                <span className="font-serif italic font-light text-zinc-200">business listing.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-9 text-zinc-300">
                Sign in first, then search for your listing, submit ownership details, and unlock the owner dashboard after approval.
              </p>
            </div>

            <div className="border border-zinc-200 bg-white p-7 text-zinc-900 shadow-[0_28px_60px_rgba(0,0,0,0.28)] sm:p-9">
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
                {oauthLoading ? 'Connecting...' : 'Continue with Google'}
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
                  Sign in
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </Link>
                <Link
                  to={`/register?redirect=${encodeURIComponent('/claim' + location.search)}`}
                  className="inline-flex items-center justify-center border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  Create account
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
      <section className="border-b-2 border-zinc-900 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto max-w-[96rem]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-end">
            <div>
              <SectionEyebrow
                icon={ShieldCheck}
                className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                iconClassName="h-3.5 w-3.5 text-orange-400"
              >
                Ownership Verification
              </SectionEyebrow>
              <h1 className="mt-8 text-5xl font-bold uppercase tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
                {step === 1 ? 'Claim your listing.' : 'Confirm the owner details.'}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">
                {step === 1
                  ? 'Start by finding the listing you want to manage. We will use that exact listing when we review your claim.'
                  : 'Give us the details needed to verify ownership cleanly and unlock the dashboard once approved.'}
              </p>
            </div>
            <div className="relative overflow-hidden border-2 border-zinc-900 bg-zinc-900 text-white shadow-[12px_12px_0px_0px_rgba(24,24,27,0.14)]">
              <div className="absolute inset-0">
                <img
                  src={step === 1 ? claimFlowPhotoPrimary : claimFlowPhotoSecondary}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover opacity-55"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/58 to-zinc-900/22" />
              </div>
              <div className="relative z-10 flex min-h-[24rem] flex-col justify-between p-6 sm:p-7">
                <div className="max-w-sm">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">
                    Claim workflow
                  </p>
                  <p className="mt-4 text-2xl font-bold tracking-tight text-white">
                    {step === 1 ? 'Match the exact listing before you submit.' : 'Show enough proof that review can move fast.'}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-zinc-200">
                    {step === 1
                      ? 'Use the public directory record you actually want to manage. The review is tied to that listing only.'
                      : 'Your role, contact details, and notes are what the team uses to verify ownership without back-and-forth.'}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {steps.map((stepItem, index) => {
                    const isCurrent = step === 1 ? index === 0 : index === 1;
                    const isComplete = step === 2 && index === 0;

                    return (
                      <div
                        key={stepItem.number}
                        className={`border px-4 py-4 backdrop-blur-sm ${
                          isCurrent
                            ? 'border-white/20 bg-white/12 text-white'
                            : isComplete
                              ? 'border-emerald-300/70 bg-emerald-50 text-zinc-900'
                              : 'border-white/12 bg-zinc-950/55 text-zinc-300'
                        }`}
                      >
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Step {stepItem.number}</p>
                        <p className="mt-3 text-base font-semibold tracking-tight">{stepItem.title}</p>
                        <p className={`mt-2 text-sm leading-6 ${isCurrent ? 'text-zinc-100' : 'text-inherit'}`}>
                          {stepItem.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
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
              <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="border-2 border-zinc-900 bg-white"
              >
                <div className="border-b border-zinc-200 bg-zinc-900 px-6 py-6 text-white sm:px-8 sm:py-8">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Find your business</label>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
                          Search the directory the same way a customer would. Pick the exact listing you want to claim.
                        </p>
                      </div>
                      <Link
                        to="/claim-business"
                        className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-orange-400 hover:bg-orange-500 hover:text-zinc-950"
                      >
                        Don&apos;t see your business?
                        <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                      </Link>
                    </div>

                    <div className="group/search relative flex flex-col gap-3 rounded-[1.75rem] border border-white/15 bg-white/10 p-3 shadow-[0_20px_40px_rgba(0,0,0,0.2)] backdrop-blur-xl md:flex-row md:items-center">
                      <div className="relative flex-1 rounded-full border border-white/10 bg-white/12 transition-all duration-300 hover:bg-white/16 focus-within:border-orange-300/60 focus-within:bg-white/18">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-6">
                          <Search className="h-5 w-5 text-zinc-400 transition-colors group-focus-within/search:text-orange-300" strokeWidth={1.7} />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(event) => setSearchQuery(event.target.value)}
                          placeholder="Business name, city, trade, or address"
                          className="block w-full rounded-full border-none bg-transparent py-4 pl-14 pr-5 text-base text-white outline-none placeholder:text-zinc-400 sm:py-5 sm:text-lg"
                          autoFocus
                        />
                      </div>
                      <div className="flex min-h-14 shrink-0 items-center justify-center rounded-full bg-white px-6 py-4 text-center font-sans text-sm font-semibold text-zinc-950 sm:px-8 sm:text-base">
                        {searchQuery.trim()
                          ? `${filteredBusinesses.length} matching ${filteredBusinesses.length === 1 ? 'listing' : 'listings'}`
                          : 'Start typing to see matching listings'}
                      </div>
                    </div>
                  </div>
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
              </motion.section>

              <aside className="space-y-5">
                <section className="overflow-hidden border border-zinc-200 bg-white">
                  <div className="relative h-52">
                    <img
                      src={claimFlowPhotoPrimary}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/42 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Review standard</p>
                      <p className="mt-2 text-lg font-semibold tracking-tight">The cleaner the match, the faster the review.</p>
                    </div>
                  </div>
                </section>
                <section className="border border-zinc-200 bg-white p-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">How this works</p>
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
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Need a new listing?</p>
                  <p className="mt-3 text-sm leading-6 text-zinc-600">If your business is not in the directory yet, use the business landing page before trying to claim.</p>
                  <Link to="/claim-business" className="mt-4 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600">
                    Go to claim overview
                    <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                  </Link>
                </section>
              </aside>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_24rem]">
              <motion.form
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                onSubmit={handleSubmit}
                className="space-y-8"
              >
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
                      Back
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
              </motion.form>

              <aside className="space-y-5">
                <section className="overflow-hidden border border-zinc-200 bg-white">
                  <div className="relative h-56">
                    <img
                      src={claimFlowPhotoSecondary}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/38 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Owner access</p>
                      <p className="mt-2 text-lg font-semibold tracking-tight">Approved claims unlock listing control, not just an account badge.</p>
                    </div>
                  </div>
                </section>
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
              </aside>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
