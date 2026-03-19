import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { trackEvent } from '@/src/lib/analytics';
import { getBusinessListingPath, getClaimStatusCopy } from '@/src/lib/ownerProfile';
import { isSupabaseConfigured, supabase } from '@/src/lib/supabase';

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
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { businesses, isLoading: directoryLoading } = useDirectoryData();
  const [claims, setClaims] = useState<BusinessClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const claimsAvailable = Boolean(supabase && isSupabaseConfigured());
  const showSubmittedBanner = searchParams.get('submitted') === '1';

  const businessesById = useMemo(() => new Map(businesses.map((business) => [business.id, business])), [businesses]);

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
            claims.map((claim) => {
              const business = businessesById.get(claim.business_id);
              const listingPath = getBusinessListingPath(business);
              const statusCopy = getClaimStatusCopy(claim.status);

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
