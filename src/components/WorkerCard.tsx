import { Link } from 'react-router-dom';
import { ArrowRight, Hammer, MapPin, UserRound } from 'lucide-react';
import { motion } from 'motion/react';

import type { WorkerAvailability, WorkerProfile } from '@/src/lib/workerProfiles';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function availabilityLabel(value: WorkerAvailability) {
  if (value === 'on_demand') return 'On-demand';
  if (value === 'short_term') return 'Short-term';
  return 'Full-time';
}

interface WorkerCardProps {
  worker: WorkerProfile;
  cityName: string;
  categoryName: string;
}

export default function WorkerCard({ worker, cityName, categoryName }: WorkerCardProps) {
  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100">
        {worker.photo_url ? (
          <img
            src={worker.photo_url}
            alt={worker.display_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-300">
            <UserRound className="h-16 w-16" strokeWidth={1.2} />
          </div>
        )}
        <span className="absolute left-3 top-3 inline-flex items-center border border-orange-200 bg-orange-50 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-orange-700">
          {availabilityLabel(worker.availability)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h2 className="text-xl font-bold leading-tight text-zinc-950">{worker.display_name}</h2>
        <p className="mt-1 text-sm font-semibold text-zinc-600">{worker.headline}</p>

        <div className="mt-4 grid gap-2 text-sm text-zinc-600">
          <div className="flex items-center gap-2">
            <Hammer className="h-4 w-4 text-zinc-400" />
            <span>{categoryName}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-zinc-400" />
            <span>{cityName}</span>
          </div>
        </div>

        <div className="mt-3">
          {worker.rate_label ? (
            <span className="font-semibold text-zinc-900">{worker.rate_label}</span>
          ) : (
            <span className="text-zinc-400">Rate negotiable</span>
          )}
        </div>

        <Link
          to={`/workers/${worker.id}`}
          className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-zinc-900 bg-zinc-900 px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-zinc-800"
        >
          View profile
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </motion.article>
  );
}
