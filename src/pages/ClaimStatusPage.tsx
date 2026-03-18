import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

import OwnerProfileChecklist from '@/src/components/OwnerProfileChecklist';
import SectionEyebrow from '@/src/components/SectionEyebrow';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { trackEvent } from '@/src/lib/analytics';
import { getOwnerProfileProgress, getClaimStatusCopy } from '@/src/lib/ownerProfile';
import { getOwnerRecommendation } from '@/src/lib/recommendations';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';
import claimStatusPhotoA from '@/src/photos/businessown/AA_BCConstruction.jpg';
import claimStatusPhotoB from '@/src/photos/businessown/thumbnail_G74A6639.jpg';

interface BusinessClaim {
  id: string;
  business_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  relationship_to_business: string;
  rejection_reason?: string;
  created_at: string;
}

function getStatusIcon(status: BusinessClaim['status']) {
  switch (status) {
    case 'pending':
      return <Clock3 className="h-4 w-4" strokeWidth={2.2} />;
    case 'approved':
      return <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />;
    case 'rejected':
      return <XCircle className="h-4 w-4" strokeWidth={2.2} />;
    case 'revoked':
      return <AlertCircle className="h-4 w-4" strokeWidth={2.2} />;
  }
}

export default function ClaimStatusPage() {
  const { user, loading: authLoading } = useAuth();
  const { businesses, isLoading: directoryLoading } = useDirectoryData();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());
  const viewedRecommendationKeys = useRef<Set<string>>(new Set());

  const businessesById = useMemo(() => new Map(businesses.map((business) => [business.id, business])), [businesses]);
  const summary = useMemo(() => ({
    total: claims.length,
    approved: claims.filter((claim) => claim.status === 'approved').length,
    pending: claims.filter((claim) => claim.status === 'pending').length,
  }), [claims]);

  useEffect(() => {
    trackEvent('claim_status_viewed');
  }, []);

  useEffect(() => {
    async function fetchClaims() {
      if (!claimsAvailable || !supabase || !user) {
        setClaims([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('business_claims')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setClaims((data ?? []) as BusinessClaim[]);
        }
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Failed to load claims.');
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [claimsAvailable, user]);

  useEffect(() => {
    if (loading || directoryLoading) {
      return;
    }

    claims.forEach((claim) => {
      const business = businessesById.get(claim.business_id);
      const recommendation = getOwnerRecommendation({ business, claimStatus: claim.status });
      const key = `${claim.id}:${recommendation.type}`;

      if (viewedRecommendationKeys.current.has(key)) {
        return;
      }

      viewedRecommendationKeys.current.add(key);
      trackEvent('claim_status_recommendation_viewed', {
        claimId: claim.id,
        businessId: claim.business_id,
        claimStatus: claim.status,
        recommendationType: recommendation.type,
      });
    });
  }, [businessesById, claims, directoryLoading, loading]);

  if (authLoading || loading || directoryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24">
        <div className="mx-auto max-w-2xl border-2 border-rose-300 bg-white p-8 sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-rose-700">Claim status is unavailable.</h1>
          <p className="mt-3 text-base leading-7 text-zinc-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!claimsAvailable) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24">
        <div className="mx-auto max-w-2xl border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
          <SectionEyebrow
            icon={ShieldCheck}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            iconClassName="h-3.5 w-3.5 text-orange-400"
          >
            Claim Status
          </SectionEyebrow>
          <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950">Claim tracking is offline.</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">This environment does not have the owner claim backend configured yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 font-sans selection:bg-indigo-200 selection:text-indigo-900">
      <section className="border-b-2 border-zinc-900 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
        <div className="mx-auto grid max-w-[96rem] gap-10 lg:grid-cols-[minmax(0,1fr)_31rem] lg:items-end">
          <div>
            <SectionEyebrow
              icon={ShieldCheck}
              className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
              iconClassName="h-3.5 w-3.5 text-orange-400"
            >
              Claim Status
            </SectionEyebrow>
            <h1 className="mt-8 text-5xl font-bold uppercase tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">Track every claim.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">
              Review where each claim stands, see what will unlock next, and move straight into the owner dashboard when approval lands.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Total claims', value: summary.total },
                { label: 'Approved', value: summary.approved },
                { label: 'Under review', value: summary.pending },
              ].map((item) => (
                <div key={item.label} className="border border-zinc-200 bg-zinc-50 px-5 py-5">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
                  <p className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden border-2 border-zinc-900 bg-zinc-900 text-white shadow-[12px_12px_0px_0px_rgba(24,24,27,0.14)]">
            <div className="absolute inset-0">
              <img
                src={claimStatusPhotoA}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/54 to-zinc-900/18" />
            </div>
            <div className="relative z-10 flex min-h-[24rem] flex-col justify-between p-6 sm:p-7">
              <div className="max-w-sm">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-orange-300">Manual review lane</p>
                <p className="mt-4 text-2xl font-bold tracking-tight text-white">
                  Keep owners oriented while approval is still in motion.
                </p>
                <p className="mt-4 text-sm leading-7 text-zinc-200">
                  This view should make the status obvious, surface the next move immediately, and show what becomes editable once the claim clears review.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border border-white/12 bg-zinc-950/58 px-4 py-4 backdrop-blur-sm">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Review cadence</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-white">One place for every decision</p>
                </div>
                <div className="border border-white/12 bg-zinc-950/58 px-4 py-4 backdrop-blur-sm">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300">Owner unlock</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight text-white">Dashboard access after approval</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[96rem]">
          {claims.length === 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="max-w-3xl border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
                <h2 className="text-3xl font-bold uppercase tracking-tight text-zinc-950">No claims yet.</h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
                  Start by finding your listing and submitting the ownership details we need to review.
                </p>
                <Link
                  to="/claim"
                  className="mt-8 inline-flex items-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                >
                  Start a claim
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </Link>
              </div>

              <section className="overflow-hidden border border-zinc-200 bg-white shadow-sm">
                <div className="relative h-full min-h-[20rem]">
                  <img
                    src={claimStatusPhotoB}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/36 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Start clean</p>
                    <p className="mt-2 text-xl font-semibold tracking-tight">Pick the right listing first so status tracking stays simple later.</p>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              {claims.map((claim) => {
                const business = businessesById.get(claim.business_id);
                const statusCopy = getClaimStatusCopy(claim.status);
                const recommendation = getOwnerRecommendation({ business, claimStatus: claim.status });
                const progress = business ? getOwnerProfileProgress(business) : null;

                return (
                  <motion.section
                    key={claim.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-zinc-900 bg-white"
                  >
                    <div className="flex flex-col gap-5 border-b border-zinc-200 px-6 py-6 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">{business?.name ?? claim.business_id}</h2>
                        <p className="mt-2 text-sm text-zinc-500">
                          Submitted on {new Date(claim.created_at).toLocaleDateString()} as {claim.relationship_to_business}
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${statusCopy.accentClassName}`}>
                        <span className={statusCopy.iconClassName}>{getStatusIcon(claim.status)}</span>
                        {statusCopy.shortLabel}
                      </div>
                    </div>

                    <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                      <div className="space-y-4">
                        {claim.status === 'rejected' && claim.rejection_reason ? (
                          <div className="border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-6 text-rose-700">
                            Reason: {claim.rejection_reason}
                          </div>
                        ) : null}

                        <div className="border border-zinc-200 bg-zinc-50 px-5 py-5">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Next step</p>
                          <h3 className="mt-3 text-xl font-semibold tracking-tight text-zinc-950">{recommendation.title}</h3>
                          <p className="mt-3 text-sm leading-6 text-zinc-600">{recommendation.description}</p>
                          {recommendation.href && recommendation.ctaLabel ? (
                            <Link
                              to={recommendation.href}
                              onClick={() => trackEvent('claim_status_recommendation_clicked', {
                                claimId: claim.id,
                                businessId: claim.business_id,
                                claimStatus: claim.status,
                                recommendationType: recommendation.type,
                                ctaTarget: recommendation.href,
                              })}
                              className="mt-5 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600"
                            >
                              {recommendation.ctaLabel}
                              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                            </Link>
                          ) : null}
                        </div>

                        {progress ? (
                          <OwnerProfileChecklist
                            items={progress.fields}
                            title="Listing readiness"
                            description="This is the public information customers will rely on after approval."
                            compact
                          />
                        ) : null}
                      </div>

                      <div className="border border-zinc-200 bg-white p-5">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">What this status means</p>
                        <p className="mt-4 text-sm leading-7 text-zinc-600">
                          {claim.status === 'pending' && 'Your claim is in manual review. No listing edits are available until we confirm ownership.'}
                          {claim.status === 'approved' && 'Ownership is confirmed. You can now update the listing details that customers see.'}
                          {claim.status === 'rejected' && 'This claim was not approved. Use the feedback above, then submit a stronger claim.'}
                          {claim.status === 'revoked' && 'Access was removed for this listing. Contact support if you believe that was a mistake.'}
                        </p>
                        {claim.status === 'approved' ? (
                          <Link
                            to="/owner/dashboard"
                            className="mt-5 inline-flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                          >
                            Open owner dashboard
                            <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  </motion.section>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
