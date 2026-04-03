import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Bell, CheckCircle2, Clock3, RefreshCw, Search, ShieldCheck, XCircle } from 'lucide-react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { useAuth } from '@/src/contexts/AuthContext';
import { useDirectoryData } from '@/src/directory-data';
import { createEvidenceSignedUrlMap } from '@/src/lib/claimEvidence';
import { supabase } from '@/src/lib/supabase';

type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
type NotificationStatus = 'pending' | 'sending' | 'sent' | 'failed' | 'skipped';
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
  evidence_urls: string[] | null;
  rejection_reason: string | null;
  notification_status: NotificationStatus;
  notification_retry_count: number;
  notification_last_attempt_at: string | null;
  notification_last_success_at: string | null;
  notification_last_failure_at: string | null;
  notification_last_error_code: string | null;
  notification_last_error: string | null;
  notification_last_http_status: number | null;
  notification_last_response_body: string | null;
  notification_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

const MAX_NOTIFY_RETRIES = 3;
const FILTERS: Array<{ value: ClaimFilter; label: string }> = [
  { value: 'all', label: 'All claims' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'revoked', label: 'Revoked' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not recorded';
  }

  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function getBusinessListingPath(business?: { cityId: string; categoryId: string; id: string } | null) {
  if (!business) {
    return undefined;
  }
  return `/${business.cityId}/${business.categoryId}/${business.id}`;
}

function getNotificationIcon(status: NotificationStatus) {
  if (status === 'sent') return <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.2} />;
  if (status === 'failed') return <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.2} />;
  if (status === 'sending') return <RefreshCw className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />;
  return <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />;
}

function canRetryNotification(claim: Claim) {
  if (claim.status === 'pending') {
    return false;
  }
  if (claim.notification_status === 'sent' || claim.notification_sent_at) {
    return false;
  }
  if (claim.notification_retry_count >= MAX_NOTIFY_RETRIES) {
    return false;
  }
  return claim.notification_status === 'pending' || claim.notification_status === 'failed' || claim.notification_status === 'skipped' || claim.notification_status === 'sending';
}

function notificationLabel(status: NotificationStatus) {
  if (status === 'sent') return 'Delivered';
  if (status === 'failed') return 'Failed';
  if (status === 'sending') return 'Sending';
  if (status === 'skipped') return 'Skipped';
  return 'Pending send';
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
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ClaimFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceSignedUrls, setEvidenceSignedUrls] = useState<Record<string, string[]>>({});

  const businessDirectoryMap = useMemo(() => new Map(businesses.map((business) => [business.id, business])), [businesses]);

  async function fetchClaims(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;
    if (!supabase) {
      setLoading(false);
      setRefreshing(false);
      setError('Claim management requires a configured Supabase environment.');
      return;
    }

    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const claimsResult = await supabase.from('business_claims').select('*').order('created_at', { ascending: false });
      if (claimsResult.error) {
        setError(claimsResult.error.message);
        return;
      }

      const nextClaims = (claimsResult.data ?? []) as Claim[];
      setClaims(nextClaims);
      const ids = [...new Set(nextClaims.map((claim) => claim.business_id))];
      if (ids.length === 0) {
        setBusinessNames({});
        setError(null);
        return;
      }

      const namesResult = await supabase.from('businesses').select('id, name').in('id', ids);
      if (namesResult.error) {
        setError(namesResult.error.message);
        return;
      }

      const map: Record<string, string> = {};
      (namesResult.data ?? []).forEach((business) => {
        map[business.id] = business.name;
      });
      setBusinessNames(map);

      // Generate signed URLs for evidence files
      const evidenceUrlsMap = await createEvidenceSignedUrlMap(supabase, nextClaims);
      setEvidenceSignedUrls(evidenceUrlsMap);
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

  const summary = useMemo(() => claims.reduce((counts, claim) => {
    counts.total += 1;
    counts[claim.status] += 1;
    return counts;
  }, { total: 0, pending: 0, approved: 0, rejected: 0, revoked: 0 }), [claims]);

  const filteredClaims = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return claims
      .filter((claim) => statusFilter === 'all' || claim.status === statusFilter)
      .filter((claim) => {
        if (!query) return true;
        const businessName = businessNames[claim.business_id] ?? businessDirectoryMap.get(claim.business_id)?.name ?? claim.business_id;
        return [
          businessName,
          claim.claimant_name,
          claim.claimant_email,
          claim.claimant_phone ?? '',
          claim.message ?? '',
          claim.rejection_reason ?? '',
          claim.notification_status,
          claim.notification_last_error ?? '',
          claim.notification_last_error_code ?? '',
        ].some((value) => value.toLowerCase().includes(query));
      });
  }, [businessDirectoryMap, businessNames, claims, searchQuery, statusFilter]);

  const pendingClaims = useMemo(() => filteredClaims.filter((claim) => claim.status === 'pending'), [filteredClaims]);
  const reviewedClaims = useMemo(() => filteredClaims.filter((claim) => claim.status !== 'pending'), [filteredClaims]);
  const failedNotifications = useMemo(() => claims.filter((claim) => claim.status !== 'pending' && claim.notification_status === 'failed'), [claims]);

  async function handleAction(claimId: string, status: 'approved' | 'rejected') {
    if (!supabase || !user || processingId) return;
    const currentClaim = claims.find((claim) => claim.id === claimId);
    if (!currentClaim || currentClaim.status !== 'pending') return;
    const reason = status === 'rejected' ? rejectionReason[claimId]?.trim() ?? '' : null;
    if (status === 'rejected' && !reason) {
      setClaimErrors((current) => ({ ...current, [claimId]: 'Please provide a rejection reason.' }));
      return;
    }

    setClaimErrors((current) => ({ ...current, [claimId]: '' }));
    setProcessingId(claimId);
    setError(null);
    try {
      const review = await supabase.rpc('review_business_claim', { p_claim_id: claimId, p_status: status, p_rejection_reason: reason });
      if (review.error) {
        setError(review.error.message);
        return;
      }

      setRejectionReason((current) => ({ ...current, [claimId]: '' }));
      const notify = await supabase.functions.invoke('notify_claim_status', { body: { claim_id: claimId } });
      if (notify.error) {
        setError(`Claim ${status} but notification dispatch reported an error: ${notify.error.message}`);
      }
      await fetchClaims({ silent: true });
    } finally {
      setProcessingId(null);
    }
  }

  async function resendNotification(claimId: string) {
    if (!supabase || !user || retryingId) return;
    const claim = claims.find((candidate) => candidate.id === claimId);
    if (!claim || !canRetryNotification(claim)) return;

    setRetryingId(claimId);
    setError(null);
    try {
      const notify = await supabase.functions.invoke('notify_claim_status', { body: { claim_id: claimId, retry: true } });
      if (notify.error) setError(`Notification retry failed: ${notify.error.message}`);
      await fetchClaims({ silent: true });
    } finally {
      setRetryingId(null);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA]"><div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900">
      <Seo title="Admin Claims | Okanagan Trades" description="Centralized claim operations for reviewing and tracking business ownership claims." path="/admin/claims" />
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-b border-zinc-200 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionEyebrow icon={ShieldCheck} className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm" iconClassName="h-3.5 w-3.5 text-orange-500">Admin Operations</SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">Claims admin</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">Review pending ownership requests, search prior decisions, and manage full claim history with notification observability.</p>
          </div>
          <button type="button" onClick={() => void fetchClaims({ silent: true })} disabled={refreshing || Boolean(processingId) || Boolean(retryingId)} className="inline-flex items-center justify-center gap-3 border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2.2} />{refreshing ? 'Refreshing' : 'Refresh claims'}
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[{ label: 'Total claims', value: summary.total }, { label: 'Pending', value: summary.pending }, { label: 'Approved', value: summary.approved }, { label: 'Rejected', value: summary.rejected }, { label: 'Revoked', value: summary.revoked }].map((item) => (
            <div key={item.label} className="border border-zinc-200 bg-white px-5 py-5 shadow-sm"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{item.label}</p><p className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">{item.value}</p></div>
          ))}
        </div>

        <section className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Search claims</label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" strokeWidth={2.2} />
                <input type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Business, claimant, notes, or notification errors" className="w-full border border-zinc-200 bg-zinc-50 px-11 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">{FILTERS.map((filter) => <button key={filter.value} type="button" onClick={() => setStatusFilter(filter.value)} className={`inline-flex items-center gap-2 border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${statusFilter === filter.value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-950'}`}>{filter.label}</button>)}</div>
          </div>
        </section>

        {error ? (
          <div className="mt-8 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {failedNotifications.length > 0 ? (
          <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-amber-700">Notifications requiring attention</p>
            <ul className="mt-3 space-y-2">
              {failedNotifications.slice(0, 5).map((claim) => {
                const businessName = businessNames[claim.business_id] ?? businessDirectoryMap.get(claim.business_id)?.name ?? claim.business_id;
                return <li key={claim.id}>{businessName}: {claim.notification_last_error ?? 'Unknown notification error'} (attempt {claim.notification_retry_count})</li>;
              })}
            </ul>
          </div>
        ) : null}

        <section className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">{pendingClaims.length} pending claims</h2>
          {pendingClaims.length === 0 ? (
            <div className="mt-4 border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-500 shadow-sm">No pending claims in the current filter.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {pendingClaims.map((claim) => {
                const businessName = businessNames[claim.business_id] ?? businessDirectoryMap.get(claim.business_id)?.name ?? claim.business_id;
                const listingPath = getBusinessListingPath(businessDirectoryMap.get(claim.business_id));
                return (
                  <article key={claim.id} className="border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-950">{businessName}</h3>
                        <p className="text-sm text-zinc-500">Submitted {formatDate(claim.created_at)} by {claim.claimant_name}</p>
                        {listingPath ? <Link to={listingPath} className="text-sm font-medium text-zinc-900 underline underline-offset-4">View listing</Link> : null}
                      </div>
                      <div className="inline-flex items-center gap-2 border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-800">
                        <Clock3 className="h-3.5 w-3.5" strokeWidth={2.2} />Under review
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <p className="text-sm text-zinc-700">Email: <span className="font-semibold">{claim.claimant_email}</span></p>
                      <p className="text-sm text-zinc-700">Phone: <span className="font-semibold">{claim.claimant_phone ?? 'Not provided'}</span></p>
                      <p className="text-sm text-zinc-700">Role: <span className="font-semibold capitalize">{claim.relationship_to_business.replace(/_/g, ' ')}</span></p>
                      <p className="text-sm text-zinc-700">Business ID: <span className="font-semibold">{claim.business_id}</span></p>
                    </div>
                    {claim.message ? <p className="mt-3 border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700">{claim.message}</p> : null}
                    {claim.evidence_urls && claim.evidence_urls.length > 0 ? (
                      <div className="mt-3 border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Evidence</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {claim.evidence_urls.map((url, index) => (
                            <a
                              key={`${claim.id}-evidence-${index}`}
                              href={evidenceSignedUrls[claim.id]?.[index] ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
                            >
                              Evidence {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                      <textarea
                        value={rejectionReason[claim.id] ?? ''}
                        onChange={(event) => setRejectionReason((current) => ({ ...current, [claim.id]: event.target.value }))}
                        rows={3}
                        placeholder="Rejection reason (required if rejecting)"
                        className="w-full resize-none border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
                      />
                      <button
                        type="button"
                        onClick={() => void handleAction(claim.id, 'approved')}
                        disabled={processingId === claim.id}
                        className="inline-flex items-center justify-center gap-2 border border-emerald-500 bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} />Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleAction(claim.id, 'rejected')}
                        disabled={processingId === claim.id}
                        className="inline-flex items-center justify-center gap-2 border border-rose-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-rose-700 disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" strokeWidth={2.2} />Reject
                      </button>
                    </div>
                    {claimErrors[claim.id] ? <p className="mt-2 text-sm text-rose-600">{claimErrors[claim.id]}</p> : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950">{reviewedClaims.length} reviewed claims</h2>
          {reviewedClaims.length === 0 ? (
            <div className="mt-4 border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-500 shadow-sm">No reviewed claims in the current filter.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {reviewedClaims.map((claim) => {
                const businessName = businessNames[claim.business_id] ?? businessDirectoryMap.get(claim.business_id)?.name ?? claim.business_id;
                const listingPath = getBusinessListingPath(businessDirectoryMap.get(claim.business_id));
                const retryRemaining = Math.max(MAX_NOTIFY_RETRIES - claim.notification_retry_count, 0);
                const canRetry = canRetryNotification(claim);
                const noteStyle = claim.notification_status === 'failed' ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-zinc-200 bg-zinc-50 text-zinc-700';
                return (
                  <article key={claim.id} className="border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-zinc-950">{businessName}</h3>
                        <p className="text-sm text-zinc-500">Submitted {formatDate(claim.created_at)} · Updated {formatDate(claim.updated_at)}</p>
                        {listingPath ? <Link to={listingPath} className="text-sm font-medium text-zinc-900 underline underline-offset-4">View listing</Link> : null}
                      </div>
                      <div className="inline-flex items-center gap-2 border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-700">
                        {claim.status === 'approved' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.2} /> : <XCircle className="h-3.5 w-3.5 text-rose-600" strokeWidth={2.2} />}
                        {claim.status}
                      </div>
                    </div>

                    {claim.status === 'rejected' && claim.rejection_reason ? <p className="mt-3 border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">{claim.rejection_reason}</p> : null}
                    {claim.evidence_urls && claim.evidence_urls.length > 0 ? (
                      <div className="mt-3 border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-700">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Evidence</p>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {claim.evidence_urls.map((url, index) => (
                            <a
                              key={`${claim.id}-reviewed-evidence-${index}`}
                              href={evidenceSignedUrls[claim.id]?.[index] ?? '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
                            >
                              Evidence {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className={`mt-3 border px-3 py-3 text-sm ${noteStyle}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold">Notification: {notificationLabel(claim.notification_status)}</p>
                        <span className="inline-flex items-center gap-1 text-xs">{getNotificationIcon(claim.notification_status)}attempt {claim.notification_retry_count} of {MAX_NOTIFY_RETRIES}</span>
                      </div>
                      <p className="mt-2">Last attempt: {formatDateTime(claim.notification_last_attempt_at)}</p>
                      <p>Last success: {formatDateTime(claim.notification_last_success_at ?? claim.notification_sent_at)}</p>
                      <p>Last failure: {formatDateTime(claim.notification_last_failure_at)}</p>
                      {claim.notification_last_error ? <p className="mt-2">Error: {claim.notification_last_error}</p> : null}
                      {claim.notification_last_error_code ? <p>Code: {claim.notification_last_error_code}</p> : null}
                      {claim.notification_last_http_status ? <p>Provider HTTP: {claim.notification_last_http_status}</p> : null}
                      {claim.notification_last_response_body ? <p className="break-words">Provider response: {claim.notification_last_response_body}</p> : null}
                      {canRetry ? (
                        <button
                          type="button"
                          onClick={() => void resendNotification(claim.id)}
                          disabled={retryingId === claim.id}
                          className="mt-3 inline-flex items-center gap-2 border border-amber-300 bg-amber-100 px-3 py-2 text-xs font-bold uppercase tracking-wide text-amber-900 disabled:opacity-60"
                        >
                          <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />{retryingId === claim.id ? 'Retrying' : `Retry notification (${retryRemaining} left)`}
                        </button>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
