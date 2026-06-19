import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  Hammer,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { availabilityLabel } from '@/src/components/WorkerCard';
import { useDirectoryData } from '@/src/directory-data';
import { type WorkerProfile, fetchWorkerProfileById } from '@/src/lib/workerProfiles';

export default function WorkerProfilePage() {
  const { workerId } = useParams<{ workerId: string }>();
  const { cities, categories, isLoading: directoryLoading } = useDirectoryData();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cityNames = useMemo(() => new Map(cities.map((city) => [city.id, city.name])), [cities]);
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  useEffect(() => {
    let isActive = true;

    async function loadWorker() {
      if (!workerId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWorkerProfileById(workerId);
        if (isActive) {
          setWorker(data);
        }
      } catch (caughtError) {
        if (isActive) {
          setError(caughtError instanceof Error ? caughtError.message : 'Unable to load this profile.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadWorker();

    return () => {
      isActive = false;
    };
  }, [workerId]);

  if (loading || directoryLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900"></div>
      </div>
    );
  }

  if (error || !worker || worker.status !== 'approved') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-24 font-sans text-zinc-900">
        <Seo title="Worker not found | Okanagan Trades" description="This worker profile is unavailable." path="/workers" robots="noindex,follow" />
        <div className="mx-auto max-w-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-8 w-8 text-zinc-400" />
          <h1 className="mt-4 text-2xl font-bold text-zinc-950">This profile isn't available</h1>
          <p className="mt-2 text-sm text-zinc-500">{error ?? 'It may have been removed or is awaiting review.'}</p>
          <Link
            to="/workers"
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800"
          >
            Browse workers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const cityName = cityNames.get(worker.city_id) ?? worker.city_id;
  const categoryName = worker.category_id ? categoryNames.get(worker.category_id) ?? worker.category_id : 'General labour';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo
        title={`${worker.display_name} - ${worker.headline} | Okanagan Trades`}
        description={worker.bio.slice(0, 155)}
        path={`/workers/${worker.id}`}
        image={worker.photo_url ?? undefined}
      />

      <div className="mx-auto max-w-[86rem] px-4 sm:px-6 lg:px-10">
        <Link
          to="/workers"
          className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Back to workers
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
          <div>
            <div className="overflow-hidden border border-zinc-200 bg-white shadow-sm">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100">
                {worker.photo_url ? (
                  <img src={worker.photo_url} alt={worker.display_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-300">
                    <UserRound className="h-24 w-24" strokeWidth={1.2} />
                  </div>
                )}
              </div>
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 border border-orange-200 bg-orange-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
                    <CalendarClock className="h-3.5 w-3.5" />
                    {availabilityLabel(worker.availability)}
                  </span>
                  {worker.years_experience !== null ? (
                    <span className="inline-flex items-center border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                      {worker.years_experience} yr{worker.years_experience === 1 ? '' : 's'} experience
                    </span>
                  ) : null}
                </div>

                <h1 className="mt-5 text-4xl font-bold leading-tight text-zinc-950">{worker.display_name}</h1>
                <p className="mt-2 text-lg font-semibold text-zinc-700">{worker.headline}</p>

                <div className="mt-5 grid gap-3 text-sm text-zinc-600 sm:grid-cols-2">
                  <div className="flex items-center gap-2"><Hammer className="h-4 w-4 text-zinc-400" />{categoryName}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-zinc-400" />{cityName}</div>
                </div>

                <p className="mt-6 whitespace-pre-line text-base leading-7 text-zinc-700">{worker.bio}</p>

                {worker.skills.length > 0 ? (
                  <div className="mt-6">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Skills</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {worker.skills.map((skill) => (
                        <span key={skill} className="inline-flex items-center border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {worker.service_areas.length > 0 ? (
                  <div className="mt-6">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Service areas</p>
                    <p className="mt-2 text-sm text-zinc-700">{worker.service_areas.join(', ')}</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="border border-zinc-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Rate</p>
            <p className="mt-2 text-2xl font-bold text-zinc-950">{worker.rate_label ?? 'Negotiable'}</p>

            <div className="mt-6 border-t border-zinc-100 pt-6">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Contact</p>
              <p className="mt-2 font-semibold text-zinc-900">{worker.contact_name}</p>
              <div className="mt-4 flex flex-col gap-2">
                {worker.contact_phone ? (
                  <a
                    href={`tel:${worker.contact_phone}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                ) : null}
                {worker.contact_email ? (
                  <a
                    href={`mailto:${worker.contact_email}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-200 bg-white px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}
