import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { availabilityLabel } from '@/src/components/WorkerCard';
import { useDirectoryData } from '@/src/directory-data';
import {
  type WorkerProfile,
  type WorkerProfileStatus,
  createResumeSignedUrl,
  fetchAdminWorkerProfiles,
  reviewWorkerProfile,
} from '@/src/lib/workerProfiles';

type StatusFilter = 'all' | WorkerProfileStatus;

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All profiles' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'archived', label: 'Archived' },
];

function formatDateTime(value: string | null) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function statusStyles(status: WorkerProfileStatus) {
  if (status === 'approved') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'rejected') return 'border-rose-200 bg-rose-50 text-rose-800';
  if (status === 'archived') return 'border-zinc-200 bg-zinc-100 text-zinc-600';
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

interface AdminWorkerCardProps {
  worker: WorkerProfile;
  cityName: string;
  categoryName: string;
  reason: string;
  error?: string;
  processing: boolean;
  onReasonChange: (value: string) => void;
  onReview: (status: Exclude<WorkerProfileStatus, 'pending'>) => void;
}

function AdminWorkerCard({
  worker,
  cityName,
  categoryName,
  reason,
  error,
  processing,
  onReasonChange,
  onReview,
}: AdminWorkerCardProps) {
  return (
    <article className="border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden border border-zinc-200 bg-zinc-100">
            {worker.photo_url ? (
              <img src={worker.photo_url} alt={worker.display_name} className="h-full w-full object-cover" />
            ) : null}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${statusStyles(worker.status)}`}>
                {worker.status === 'pending' ? <Clock3 className="h-3.5 w-3.5" /> : null}
                {worker.status === 'approved' ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
                {worker.status === 'rejected' ? <XCircle className="h-3.5 w-3.5" /> : null}
                {worker.status === 'archived' ? <Archive className="h-3.5 w-3.5" /> : null}
                {worker.status}
              </span>
              <span className="inline-flex items-center border border-orange-200 bg-orange-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
                {availabilityLabel(worker.availability)}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-bold text-zinc-950">{worker.display_name}</h3>
            <p className="text-sm font-semibold text-zinc-600">{worker.headline}</p>
            <p className="mt-1 text-sm text-zinc-500">Submitted {formatDateTime(worker.created_at)}</p>
          </div>
        </div>
        <div className="text-sm text-zinc-600 lg:text-right">
          <p className="font-semibold text-zinc-950">{worker.contact_name}</p>
          {worker.contact_phone ? <p className="mt-1 inline-flex items-center gap-1 lg:justify-end"><Phone className="h-3.5 w-3.5" />{worker.contact_phone}</p> : null}
          {worker.contact_email ? <p className="mt-1 inline-flex items-center gap-1 lg:justify-end"><Mail className="h-3.5 w-3.5" />{worker.contact_email}</p> : null}
          {worker.resume_path ? (
            <button
              type="button"
              onClick={async () => {
                try {
                  const url = await createResumeSignedUrl(worker.resume_path as string, 120);
                  window.open(url, '_blank', 'noopener,noreferrer');
                } catch (caughtError) {
                  window.alert(caughtError instanceof Error ? caughtError.message : 'Could not open the resume.');
                }
              }}
              className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-700 underline underline-offset-4 transition-colors hover:text-orange-600 lg:justify-end"
            >
              <FileText className="h-3.5 w-3.5" />
              View resume
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-zinc-600 md:grid-cols-2 xl:grid-cols-4">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-400" />{cityName}</p>
        <p>{categoryName}</p>
        <p>{worker.years_experience !== null ? `${worker.years_experience} yrs experience` : 'Experience not given'}</p>
        <p>{worker.rate_label ?? 'Rate not posted'}</p>
      </div>

      {worker.skills.length > 0 ? <p className="mt-3 text-sm text-zinc-600"><span className="font-semibold text-zinc-700">Skills:</span> {worker.skills.join(', ')}</p> : null}
      {worker.service_areas.length > 0 ? <p className="mt-1 text-sm text-zinc-600"><span className="font-semibold text-zinc-700">Areas:</span> {worker.service_areas.join(', ')}</p> : null}
      <p className="mt-3 whitespace-pre-line border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm leading-6 text-zinc-700">{worker.bio}</p>

      {worker.rejection_reason ? (
        <p className="mt-3 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{worker.rejection_reason}</p>
      ) : null}

      {worker.status !== 'archived' ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto]">
          <textarea
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
            rows={3}
            placeholder="Rejection reason (required if rejecting)"
            className="w-full resize-none border border-zinc-200 bg-white px-3 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-900"
          />
          {worker.status === 'pending' ? (
            <button type="button" onClick={() => onReview('approved')} disabled={processing} className="inline-flex items-center justify-center gap-2 border border-emerald-500 bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" />Approve
            </button>
          ) : null}
          {worker.status === 'pending' ? (
            <button type="button" onClick={() => onReview('rejected')} disabled={processing} className="inline-flex items-center justify-center gap-2 border border-rose-200 bg-white px-4 py-3 text-xs font-bold uppercase tracking-wide text-rose-700 disabled:opacity-60">
              <XCircle className="h-4 w-4" />Reject
            </button>
          ) : null}
          <button type="button" onClick={() => onReview('archived')} disabled={processing} className="inline-flex items-center justify-center gap-2 border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-zinc-700 disabled:opacity-60">
            <Archive className="h-4 w-4" />Archive
          </button>
        </div>
      ) : null}
      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </article>
  );
}

export default function AdminWorkerProfilesPage() {
  const { cities, categories } = useDirectoryData();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [workerErrors, setWorkerErrors] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const cityNames = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);
  const categoryNames = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories]);

  async function loadWorkers(options?: { silent?: boolean }) {
    const silent = options?.silent ?? false;
    if (silent) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminWorkerProfiles();
      setWorkers(data);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to load worker profiles.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadWorkers();
  }, []);

  const summary = useMemo(() => workers.reduce((counts, worker) => {
    counts.total += 1;
    counts[worker.status] += 1;
    return counts;
  }, { total: 0, pending: 0, approved: 0, rejected: 0, archived: 0 }), [workers]);

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return workers
      .filter((worker) => statusFilter === 'all' || worker.status === statusFilter)
      .filter((worker) => {
        if (!query) return true;
        return [
          worker.display_name,
          worker.headline,
          worker.bio,
          worker.contact_name,
          worker.contact_email ?? '',
          worker.contact_phone ?? '',
          worker.skills.join(' '),
          worker.rejection_reason ?? '',
          cityNames.get(worker.city_id) ?? worker.city_id,
          worker.category_id ? categoryNames.get(worker.category_id) ?? worker.category_id : '',
        ].some((value) => value.toLowerCase().includes(query));
      });
  }, [categoryNames, cityNames, searchQuery, statusFilter, workers]);

  const pendingWorkers = useMemo(() => filteredWorkers.filter((worker) => worker.status === 'pending'), [filteredWorkers]);
  const reviewedWorkers = useMemo(() => filteredWorkers.filter((worker) => worker.status !== 'pending'), [filteredWorkers]);

  async function handleReview(profileId: string, status: Exclude<WorkerProfileStatus, 'pending'>) {
    if (processingId) return;
    const reason = rejectionReason[profileId]?.trim() ?? '';

    if (status === 'rejected' && !reason) {
      setWorkerErrors((current) => ({ ...current, [profileId]: 'Please provide a rejection reason.' }));
      return;
    }

    setProcessingId(profileId);
    setWorkerErrors((current) => ({ ...current, [profileId]: '' }));
    setError(null);

    try {
      await reviewWorkerProfile(profileId, status, reason);
      setRejectionReason((current) => ({ ...current, [profileId]: '' }));
      await loadWorkers({ silent: true });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to update the profile.');
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center bg-[#FAFAFA]"><div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900">
      <Seo title="Admin Worker Profiles | Okanagan Trades" description="Review and moderate Okanagan Trades worker profiles." path="/admin/workers" robots="noindex,nofollow" />
      <div className="mx-auto max-w-[96rem] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-b border-zinc-200 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionEyebrow icon={ShieldCheck} className="inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm" iconClassName="h-3.5 w-3.5 text-orange-500">Admin Operations</SectionEyebrow>
            <h1 className="mt-6 text-4xl font-bold uppercase text-zinc-950 sm:text-5xl lg:text-6xl">Worker profiles admin</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">Review submitted worker profiles, approve them, reject with a reason, or archive older ones.</p>
          </div>
          <button type="button" onClick={() => void loadWorkers({ silent: true })} disabled={refreshing || Boolean(processingId)} className="inline-flex items-center justify-center gap-3 border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950 disabled:opacity-60">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? 'Refreshing' : 'Refresh queue'}
          </button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            { label: 'Total', value: summary.total },
            { label: 'Pending', value: summary.pending },
            { label: 'Approved', value: summary.approved },
            { label: 'Rejected', value: summary.rejected },
            { label: 'Archived', value: summary.archived },
          ].map((item) => (
            <div key={item.label} className="border border-zinc-200 bg-white px-5 py-5 shadow-sm">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
              <p className="mt-3 text-4xl font-bold text-zinc-950">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-8 border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <label htmlFor="admin-workers-search" className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Search profiles</label>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input id="admin-workers-search" type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Name, headline, contact, skills, city, trade" className="w-full border border-zinc-200 bg-zinc-50 px-11 py-4 text-base text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <button key={filter.value} type="button" onClick={() => setStatusFilter(filter.value)} className={`inline-flex items-center gap-2 border px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${statusFilter === filter.value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-900 hover:bg-white hover:text-zinc-950'}`}>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {error ? (
          <div className="mt-8 flex items-start gap-3 border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <section className="mt-8">
          <h2 className="text-2xl font-bold text-zinc-950">{pendingWorkers.length} pending profiles</h2>
          {pendingWorkers.length === 0 ? (
            <div className="mt-4 border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-500 shadow-sm">No pending profiles in the current filter.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {pendingWorkers.map((worker) => (
                <div key={worker.id}>
                  <AdminWorkerCard
                    worker={worker}
                    cityName={cityNames.get(worker.city_id) ?? worker.city_id}
                    categoryName={worker.category_id ? categoryNames.get(worker.category_id) ?? worker.category_id : 'General labour'}
                    reason={rejectionReason[worker.id] ?? ''}
                    error={workerErrors[worker.id]}
                    processing={processingId === worker.id}
                    onReasonChange={(value) => setRejectionReason((current) => ({ ...current, [worker.id]: value }))}
                    onReview={(status) => void handleReview(worker.id, status)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-zinc-950">{reviewedWorkers.length} reviewed profiles</h2>
          {reviewedWorkers.length === 0 ? (
            <div className="mt-4 border border-zinc-200 bg-white px-6 py-10 text-sm text-zinc-500 shadow-sm">No reviewed profiles in the current filter.</div>
          ) : (
            <div className="mt-4 space-y-4">
              {reviewedWorkers.map((worker) => (
                <div key={worker.id}>
                  <AdminWorkerCard
                    worker={worker}
                    cityName={cityNames.get(worker.city_id) ?? worker.city_id}
                    categoryName={worker.category_id ? categoryNames.get(worker.category_id) ?? worker.category_id : 'General labour'}
                    reason={rejectionReason[worker.id] ?? ''}
                    error={workerErrors[worker.id]}
                    processing={processingId === worker.id}
                    onReasonChange={(value) => setRejectionReason((current) => ({ ...current, [worker.id]: value }))}
                    onReview={(status) => void handleReview(worker.id, status)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
