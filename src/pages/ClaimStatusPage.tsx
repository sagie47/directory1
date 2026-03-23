import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Check,
  Circle,
  Clock3,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { trackEvent, trackPaidPlanIntentClicked, trackPaidPlanIntentViewed } from '@/src/lib/analytics';
import { getBusinessListingPath, getClaimStatusCopy, getOwnerProfileFields } from '@/src/lib/ownerProfile';
import { DIRECTORY_PLAN_TIERS, VERIFIED_LAUNCH_NOTE } from '@/src/lib/pricing';
import { getOwnerRecommendation } from '@/src/lib/recommendations';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

interface BusinessClaim {
  id: string;
  business_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'revoked';
  relationship_to_business: string;
  rejection_reason?: string;
  created_at: string;
}

interface ClaimWithRecommendation extends BusinessClaim {
  recommendation: ReturnType<typeof getOwnerRecommendation>;
  profileFields: ReturnType<typeof getOwnerProfileFields>;
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

export default function ClaimStatusPage() {
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { businesses, isLoading: directoryLoading } = useDirectoryData();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());
  const trackedRecommendationViews = useRef(new Set<string>());
  const showSubmittedBanner = searchParams.get('submitted') === '1';
  const pageSeo = (
    <Seo
      title="Claim Status | Okanagan Trades"
      description="Track the status of your Okanagan Trades business ownership claim."
      path="/claim/status"
      robots="noindex,nofollow"
    />
  );

  const businessesById = useMemo(() => new Map(businesses.map((business) => [business.id, business])), [businesses]);

  const claimsWithRecommendations = useMemo<ClaimWithRecommendation[]>(() => {
    return claims.map((claim) => {
      const business = businessesById.get(claim.business_id) ?? null;
      const recommendation = getOwnerRecommendation({ business, claimStatus: claim.status });
      const profileFields = claim.status === 'pending' && business
        ? getOwnerProfileFields(business).slice(0, 4)
        : [];
      return {
        ...claim,
        recommendation,
        profileFields,
      };
    });
  }, [claims, businessesById]);

  useEffect(() => {
    trackEvent('claim_status_viewed');
  }, []);

  useEffect(() => {
    const hasApprovedClaim = claimsWithRecommendations.some((claim) => claim.status === 'approved');
    if (!hasApprovedClaim) return;

    trackPaidPlanIntentViewed({
      plan_id: 'verified',
      plan_category: 'directory',
      source_page: '/claim/status',
    });
    trackPaidPlanIntentViewed({
      plan_id: 'verified-pro',
      plan_category: 'directory',
      source_page: '/claim/status',
    });
  }, [claimsWithRecommendations]);

  useEffect(() => {
    for (const claim of claimsWithRecommendations) {
      if (
        (claim.status === 'pending' || claim.status === 'approved') &&
        claim.recommendation.type !== 'none' &&
        !trackedRecommendationViews.current.has(claim.id)
      ) {
        const hasPrimaryCta = Boolean(
          claim.recommendation.href &&
          claim.recommendation.ctaLabel &&
          (claim.recommendation.type !== 'complete_profile' || claim.status === 'approved')
        );
        trackEvent('claim_status_recommendation_viewed', {
          claim_id: claim.id,
          business_id: claim.business_id,
          claim_status: claim.status,
          recommendation_type: claim.recommendation.type,
          has_primary_cta: hasPrimaryCta,
          cta_target: claim.recommendation.href,
        });
        trackedRecommendationViews.current.add(claim.id);
      }
    }
  }, [claimsWithRecommendations]);

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
        {pageSeo}
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
        {pageSeo}
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
      {pageSeo}
      <section className="border-b-2 border-zinc-900 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[96rem]">
          <SectionEyebrow
            icon={ShieldCheck}
            className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
            iconClassName="h-3.5 w-3.5 text-orange-400"
          >
            Claim Status
          </SectionEyebrow>
          <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            What happens next.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600 sm:text-xl">
            This page should answer one thing clearly: where your claim stands and what action, if any, you need to take next.
          </p>
        </div>
      </section>

      <main className="px-4 py-12 sm:px-6 sm:py-14 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-[96rem] space-y-8">
          {showSubmittedBanner ? (
            <div className="flex items-start gap-3 border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Your claim was submitted. We&apos;ll show the status here as soon as review is underway.</p>
            </div>
          ) : null}

          {claims.length === 0 ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="border-2 border-zinc-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] sm:p-10">
                <h2 className="text-3xl font-bold uppercase tracking-tight text-zinc-950">No claims yet.</h2>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
                  Start by searching for the listing you want to manage, then submit the owner details needed for review.
                </p>
                <Link
                  to="/claim"
                  className="mt-8 inline-flex items-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-6 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                >
                  Start a claim
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </Link>
              </div>

              <div className="border border-zinc-200 bg-zinc-50 p-6">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Claim flow</p>
                <div className="mt-4 space-y-4">
                  {[
                    'Find the listing first.',
                    'Submit the ownership request.',
                    'Wait for approval before editing anything.',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-900" />
                      <p className="text-sm leading-6 text-zinc-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            claimsWithRecommendations.map((claim) => {
              const business = businessesById.get(claim.business_id);
              const listingPath = getBusinessListingPath(business);
              const statusCopy = getClaimStatusCopy(claim.status);
              const { recommendation, profileFields } = claim;

              return (
                <section
                  key={claim.id}
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

                  <div className="grid gap-6 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
                    <div className="space-y-5">
                      <div className="border border-zinc-200 bg-zinc-50 px-5 py-5">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Status</p>
                        <h3 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">{statusCopy.title}</h3>
                        <p className="mt-3 text-sm leading-7 text-zinc-600">{statusCopy.description}</p>
                      </div>

                      {claim.status === 'rejected' && claim.rejection_reason ? (
                        <div className="border border-rose-200 bg-rose-50 px-5 py-5 text-sm leading-7 text-rose-700">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em]">Review note</p>
                          <p className="mt-3">{claim.rejection_reason}</p>
                        </div>
                      ) : null}

                      {claim.status === 'pending' && profileFields.length > 0 ? (
                        <div className="border border-zinc-200 bg-zinc-50 px-5 py-5">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Profile completeness</p>
                          <p className="mt-2 text-sm text-zinc-600">You&apos;ll be able to complete these after approval.</p>
                          <div className="mt-4 space-y-3">
                            {profileFields.map((field) => (
                              <div key={field.id} className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${field.complete ? 'border-emerald-300 bg-emerald-500 text-white' : 'border-zinc-300 bg-white text-zinc-300'}`}>
                                  {field.complete ? (
                                    <Check className="h-3 w-3" strokeWidth={3} />
                                  ) : (
                                    <Circle className="h-3 w-3" strokeWidth={2.2} />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-zinc-900">{field.label}</p>
                                  <p className="text-xs text-zinc-500">{field.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {(claim.status === 'pending' || claim.status === 'approved') && recommendation.type !== 'none' ? (
                        <div className="border border-zinc-200 bg-zinc-50 px-5 py-5">
                          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Next opportunity</p>
                          <h3 className="mt-3 text-xl font-bold tracking-tight text-zinc-950">{recommendation.title}</h3>
                          <p className="mt-2 text-sm leading-6 text-zinc-600">{recommendation.description}</p>
                          {recommendation.href && recommendation.ctaLabel && (recommendation.type !== 'complete_profile' || claim.status === 'approved') ? (
                            <Link
                              to={recommendation.href}
                              onClick={() => {
                                trackEvent('claim_status_recommendation_clicked', {
                                  claim_id: claim.id,
                                  business_id: claim.business_id,
                                  claim_status: claim.status,
                                  recommendation_type: recommendation.type,
                                  cta_target: recommendation.href,
                                });

                                const paidIntent = getPaidIntentFromHref(recommendation.href);
                                if (paidIntent) {
                                  trackPaidPlanIntentClicked({
                                    plan_id: paidIntent.planId,
                                    plan_category: paidIntent.planCategory,
                                    source_page: '/claim/status',
                                    cta_label: recommendation.ctaLabel,
                                    destination: recommendation.href,
                                    recommendation_type: recommendation.type,
                                  });
                                }
                              }}
                              className="mt-4 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600"
                            >
                              {recommendation.ctaLabel}
                              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                            </Link>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="border border-zinc-200 bg-zinc-50 p-5">
                      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Next action</p>
                      <div className="mt-4 space-y-3">
                        {claim.status === 'approved' ? (
                          <Link
                            to="/owner/dashboard"
                            className="inline-flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                          >
                            Open owner dashboard
                            <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                          </Link>
                        ) : null}

                        {claim.status === 'rejected' ? (
                          <Link
                            to={`/claim?businessId=${claim.business_id}`}
                            className="inline-flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                          >
                            Retry this claim
                            <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                          </Link>
                        ) : null}

                        {claim.status === 'revoked' ? (
                          <Link
                            to="/contact"
                            className="inline-flex w-full items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                          >
                            Contact support
                            <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                          </Link>
                        ) : null}

                        {listingPath ? (
                          <Link
                            to={listingPath}
                            className="inline-flex w-full items-center justify-center border border-zinc-200 bg-zinc-50 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:border-zinc-900 hover:bg-white hover:text-zinc-950"
                          >
                            View public listing
                          </Link>
                        ) : null}

                        {claim.status === 'approved' ? (
                          <div className="border border-zinc-200 bg-white px-4 py-4">
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Directory plans</p>
                            <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
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
                                plan_id: 'verified',
                                plan_category: 'directory',
                                source_page: '/claim/status',
                                cta_label: 'Compare Directory Plans',
                                destination: '/for-business',
                                claim_id: claim.id,
                                business_id: claim.business_id,
                              })}
                              className="mt-4 inline-flex items-center gap-2 font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600"
                            >
                              Compare directory plans
                              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
                            </Link>
                          </div>
                        ) : null}

                        {claim.status === 'pending' ? (
                          <p className="text-sm leading-6 text-zinc-600">
                            No action is needed while review is still pending.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
