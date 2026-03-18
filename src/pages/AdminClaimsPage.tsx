import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useDirectoryData } from '@/src/directory-data';
import { useAuth } from '@/src/contexts/AuthContext';
import { getBusinessListingPath } from '@/src/lib/ownerProfile';
import { supabase } from '@/src/lib/supabase';

type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
type ClaimFilter = 'all' | ClaimStatus;

interface Claim {
  id: string;
  business_id: string;
  status: ClaimStatus;
  claimant_name: string;
  claimant_email: string;
  claimant_phone: string | null;
  relationship_to_business: string;
  message: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

const FILTERS: Array<{ value: ClaimFilter; label: string }> = [
  { value: 'all', label: 'All claims' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revoked', label: 'Revoked' },
];

const STATUS_ORDER: Record<ClaimStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
  revoked: 3,
};

const STATUS_STYLES: Record<ClaimStatus, { label: string; className: string; iconClassName: string }> = {
  pending: {
    label: 'Under review',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClassName: 'text-amber-600',
  },
  approved: {
    label: 'Approved',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    iconClassName: 'text-emerald-600',
  },
  rejected: {
    label: 'Rejected',
    className: 'border-rose-200 bg-rose-50 text-rose-800',
    iconClassName: 'text-rose-600',
  },
  revoked: {
    label: 'Revoked',
    className: 'border-zinc-300 bg-zinc-100 text-zinc-700',
    iconClassName: 'text-zinc-500',
  },
};

function getStatusIcon(status: ClaimStatus) {
  switch (status) {
    case 'pending':
      return <Clock3 className="h-4 w-4" strokeWidth={2.2} />;
    case 'approved':
      return <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />;
    case 'rejected':
    case 'revoked':
      return <XCircle className="h-4 w-4" strokeWidth={2.2} />;
  }
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatRelationship(value: string) {
  return value.replace(/_/g, ' ');
}

export default function AdminClaimsPage() {
  const { user } = useAuth();
  const { businesses } = useDirectoryData();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [businessNames, setBusinessNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [claimErrors, setClaimErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClaimFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const businessDirectoryMap = useMemo(
    () => new Map(businesses.map((business) => [business.id, business])),
    [businesses]
  );

  async function fetchClaims(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;

    if (!supabase) {
      setLoading(false);
      setRefreshing(false);
      setError('Claim management requires a configured Supabase environment.');
      return;
    }

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const claimsResult = await supabase
        .from('business_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (claimsResult.error) {
        setError(claimsResult.error.message);
        return;
      }

      const nextClaims = (claimsResult.data ?? []) as Claim[];
      setClaims(nextClaims);

      const businessIds = [...new Set(nextClaims.map((claim) => claim.business_id))];
      if (businessIds.length === 0) {
        setBusinessNames({});
        setError(null);
        return;
      }

      const businessesResult = await supabase
        .from('businesses')
        .select('id, name')
        .in('id', businessIds);

      if (businessesResult.error) {
        setError(businessesResult.error.message);
        return;
      }

      const nameMap: Record<string, string> = {};
      (businessesResult.data ?? []).forEach((business) => {
        nameMap[business.id] = business.name;
      });

      setBusinessNames(nameMap);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchClaims();
  }, []);

  const summary = useMemo(() => {
    return claims.reduce(
      (counts, claim) => {
        counts.total += 1;
        counts[claim.status] += 1;
        return counts;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        revoked: 0,
      }
    );
  }, [claims]);

  const filteredClaims = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return claims
      .filter((claim) => statusFilter === 'all' || claim.status === statusFilter)
      .filter((claim) => {
        if (!normalizedQuery) {
          return true;
        }

        const businessName =
          businessNames[claim.business_id] ??
          businessDirectoryMap.get(claim.business_id)?.name ??
          claim.business_id;

        return [
          businessName,
          claim.business_id,
          claim.claimant_name,
          claim.claimant_email,
          claim.claimant_phone ?? '',
          claim.relationship_to_business,
          claim.message ?? '',
          claim.rejection_reason ?? '',
        ].some((value) => value.toLowerCase().includes(normalizedQuery));
      })
      .sort((left, right) => {
        const statusDifference = STATUS_ORDER[left.status] - STATUS_ORDER[right.status];
        if (statusDifference !== 0) {
          return statusDifference;
        }

        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      });
  }, [businessDirectoryMap, businessNames, claims, searchQuery, statusFilter]);

  const pendingClaims = useMemo(
    () => filteredClaims.filter((claim) => claim.status === 'pending'),
    [filteredClaims]
  );

  const reviewedClaims = useMemo(
    () => filteredClaims.filter((claim) => claim.status !== 'pending'),
    [filteredClaims]
  );

  async function handleAction(claimId: string, status: 'approved' | 'rejected') {
    if (!supabase || !user || processingId) {
      return;
    }

    const reason = status === 'rejected' ? rejectionReason[claimId]?.trim() ?? '' : null;
    if (status === 'rejected' && !reason) {
      setClaimErrors((current) => ({
        ...current,
        [claimId]: 'Please provide a rejection reason.',
      }));
      return;
    }

    setClaimErrors((current) => ({ ...current, [claimId]: '' }));
    setProcessingId(claimId);
    setError(null);

    try {
      const { error: reviewError } = await supabase.rpc('review_business_claim', {
        p_claim_id: claimId,
        p_status: status,
        p_rejection_reason: reason,
      });

      if (reviewError) {
        setError(reviewError.message);
        return;
      }

      setRejectionReason((current) => ({ ...current, [claimId]: '' }));
      await fetchClaims({ silent: true });
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900">
      <Seo
        title="Admin Claims | Okanagan Trades"
        description="Centralized claim operations for reviewing and tracking business ownership claims."
        path="/admin/claims"
      />

      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-b border-zinc-200 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionEyebrow
              icon={ShieldCheck}
              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
              iconClassName="h-3.5 w-3.5 text-orange-500"
            >
              Admin Operations
            </SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Claims admin
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">
              Review pending ownership requests, search prior decisions, and manage the full claim history from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchClaims({ silent: true })}
            disabled={refreshing || Boolean(processingId)}
            className="inline-flex items-center justify-center gap-3 border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2.2} />
            {refreshing ? 'Refreshing' : 'Refresh claims'}
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Total claims', value: summary.total },
            { label: 'Pending', value: summary.pending },
            { label: 'Approved', value: summary.approved },
            { label: 'Rejected', value: summary.rejected },
            { label: 'Revoked', value: summary.revoked },
          ].map((item) => (
            <div key={item.label} className="border border-zinc-200 bg-white px-5 py-5 shadow-sm">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
              <p className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Search claims
              </label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={2.2} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Business, claimant, email, phone, or claim notes"
                  className="w-full border border-zinc-200 bg-zinc-50 px-11 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;
                const count =
                  filter.value === 'all'
                    ? summary.total
                    : summary[filter.value];

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`inline-flex items-center gap-2 border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                      isActive
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-950'
                    }`}
                  >
                    {filter.label}
                    <span className={`rounded-full px-2 py-0.5 text-[9px] ${isActive ? 'bg-white/10 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-8 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {filteredClaims.length === 0 ? (
          <div className="mt-8 border border-zinc-200 bg-white px-6 py-16 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-10 w-10 text-zinc-300" strokeWidth={1.8} />
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950">No claims match this view.</h2>
            <p className="mt-3 text-zinc-500">
              Adjust the search or status filters to see more results.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Active queue</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
                    {pendingClaims.length} pending {pendingClaims.length === 1 ? 'claim' : 'claims'}
                  </h2>
                </div>
              </div>

              {pendingClaims.length === 0 ? (
                <div className="border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-500 shadow-sm">
                  There are no pending claims in the current filter.
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingClaims.map((claim) => {
                    const businessName =
                      businessNames[claim.business_id] ??
                      businessDirectoryMap.get(claim.business_id)?.name ??
                      claim.business_id;
                    const listingPath = getBusinessListingPath(businessDirectoryMap.get(claim.business_id));
                    const statusMeta = STATUS_STYLES[claim.status];

                    return (
                      <motion.article
                        key={claim.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-zinc-900 bg-white shadow-sm"
                      >
                        <div className="flex flex-col gap-5 border-b border-zinc-200 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-orange-500">Target business</p>
                            <h3 className="mt-3 text-2xl font-bold tracking-tight text-zinc-950">{businessName}</h3>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                              <span>ID: {claim.business_id}</span>
                              <span>Submitted {formatDate(claim.created_at)}</span>
                              {listingPath ? (
                                <Link to={listingPath} className="font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600">
                                  View listing
                                </Link>
                              ) : null}
                            </div>
                          </div>

                          <div className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${statusMeta.className}`}>
                            <span className={statusMeta.iconClassName}>{getStatusIcon(claim.status)}</span>
                            {statusMeta.label}
                          </div>
                        </div>

                        <div className="grid gap-8 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                          <div className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Claimant</p>
                                <p className="mt-2 text-base font-semibold text-zinc-950">{claim.claimant_name}</p>
                              </div>
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Role</p>
                                <p className="mt-2 text-base font-semibold capitalize text-zinc-950">{formatRelationship(claim.relationship_to_business)}</p>
                              </div>
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Email</p>
                                <p className="mt-2 text-base font-semibold text-zinc-950">{claim.claimant_email}</p>
                              </div>
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Phone</p>
                                <p className="mt-2 text-base font-semibold text-zinc-950">{claim.claimant_phone ?? 'Not provided'}</p>
                              </div>
                            </div>

                            {claim.message ? (
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Verification notes</p>
                                <p className="mt-3 text-sm leading-7 text-zinc-700">{claim.message}</p>
                              </div>
                            ) : null}
                          </div>

                          <div className="border border-zinc-200 bg-zinc-50 p-5">
                            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Review action</p>
                            <button
                              type="button"
                              onClick={() => void handleAction(claim.id, 'approved')}
                              disabled={processingId === claim.id}
                              className="mt-5 inline-flex w-full items-center justify-center gap-2 border-2 border-zinc-900 bg-zinc-900 px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-emerald-500 hover:bg-emerald-500 disabled:opacity-60"
                            >
                              <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />
                              {processingId === claim.id ? 'Processing' : 'Approve claim'}
                            </button>

                            <div className="mt-4">
                              <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                Rejection reason
                              </label>
                              <textarea
                                value={rejectionReason[claim.id] ?? ''}
                                onChange={(event) => {
                                  setRejectionReason((current) => ({
                                    ...current,
                                    [claim.id]: event.target.value,
                                  }));
                                }}
                                rows={4}
                                placeholder="Required when rejecting a claim."
                                className="mt-3 w-full resize-none border border-zinc-200 bg-white px-4 py-4 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900"
                              />
                              {claimErrors[claim.id] ? (
                                <p className="mt-2 text-sm text-rose-600">{claimErrors[claim.id]}</p>
                              ) : null}
                            </div>

                            <button
                              type="button"
                              onClick={() => void handleAction(claim.id, 'rejected')}
                              disabled={processingId === claim.id}
                              className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-rose-200 bg-white px-4 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60"
                            >
                              <XCircle className="h-4 w-4" strokeWidth={2.2} />
                              {processingId === claim.id ? 'Processing' : 'Reject claim'}
                            </button>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Claim history</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950">
                    {reviewedClaims.length} reviewed {reviewedClaims.length === 1 ? 'claim' : 'claims'}
                  </h2>
                </div>
              </div>

              {reviewedClaims.length === 0 ? (
                <div className="border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-500 shadow-sm">
                  No reviewed claims match the current filter.
                </div>
              ) : (
                <div className="space-y-4">
                  {reviewedClaims.map((claim) => {
                    const businessName =
                      businessNames[claim.business_id] ??
                      businessDirectoryMap.get(claim.business_id)?.name ??
                      claim.business_id;
                    const listingPath = getBusinessListingPath(businessDirectoryMap.get(claim.business_id));
                    const statusMeta = STATUS_STYLES[claim.status];

                    return (
                      <motion.article
                        key={claim.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-zinc-200 bg-white p-6 shadow-sm"
                      >
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-4">
                            <div>
                              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Business</p>
                              <h3 className="mt-2 text-xl font-bold tracking-tight text-zinc-950">{businessName}</h3>
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
                                <span>ID: {claim.business_id}</span>
                                <span>Submitted {formatDate(claim.created_at)}</span>
                                <span>Updated {formatDate(claim.updated_at)}</span>
                                {listingPath ? (
                                  <Link to={listingPath} className="font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-orange-600">
                                    View listing
                                  </Link>
                                ) : null}
                              </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Claimant</p>
                                <p className="mt-2 text-sm font-semibold text-zinc-950">{claim.claimant_name}</p>
                              </div>
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Email</p>
                                <p className="mt-2 text-sm font-semibold text-zinc-950">{claim.claimant_email}</p>
                              </div>
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Role</p>
                                <p className="mt-2 text-sm font-semibold capitalize text-zinc-950">{formatRelationship(claim.relationship_to_business)}</p>
                              </div>
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Phone</p>
                                <p className="mt-2 text-sm font-semibold text-zinc-950">{claim.claimant_phone ?? 'Not provided'}</p>
                              </div>
                            </div>

                            {claim.message ? (
                              <div className="border border-zinc-200 bg-zinc-50 px-4 py-4">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Submitted notes</p>
                                <p className="mt-3 text-sm leading-7 text-zinc-700">{claim.message}</p>
                              </div>
                            ) : null}

                            {claim.status === 'rejected' && claim.rejection_reason ? (
                              <div className="border border-rose-200 bg-rose-50 px-4 py-4 text-sm leading-7 text-rose-700">
                                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">Rejection reason</p>
                                <p className="mt-3">{claim.rejection_reason}</p>
                              </div>
                            ) : null}
                          </div>

                          <div className={`inline-flex items-center gap-2 border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] ${statusMeta.className}`}>
                            <span className={statusMeta.iconClassName}>{getStatusIcon(claim.status)}</span>
                            {statusMeta.label}
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
