import { clsx, type ClassValue } from 'clsx';
import { Check, Circle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import type { OwnerProfileField } from '@/src/lib/ownerProfile';

interface OwnerProfileChecklistProps {
  items: OwnerProfileField[];
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function OwnerProfileChecklist({
  items,
  title,
  description,
  className,
  compact = false,
}: OwnerProfileChecklistProps) {
  const completed = items.filter((item) => item.complete).length;
  const percent = Math.round((completed / items.length) * 100);

  return (
    <section className={cn('border border-zinc-200 bg-white', compact ? 'p-5' : 'p-6 sm:p-7', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-5">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Progress
          </p>
          <h2 className={cn('mt-2 font-sans font-bold tracking-tight text-zinc-950', compact ? 'text-xl' : 'text-2xl')}>
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-600">
              {description}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <div className="font-sans text-3xl font-bold tracking-tight text-zinc-950">
            {percent}%
          </div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {completed}/{items.length} complete
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
              className={cn(
                'flex items-start gap-3 border px-4 py-3 transition-colors',
                item.complete ? 'border-emerald-200 bg-emerald-50/70' : 'border-zinc-200 bg-zinc-50',
              )}
          >
            <div
              className={cn(
                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                item.complete ? 'border-emerald-300 bg-emerald-500 text-white' : 'border-zinc-300 bg-white text-zinc-300',
              )}
            >
              {item.complete ? (
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              ) : (
                <Circle className="h-3.5 w-3.5" strokeWidth={2.2} />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-sans text-sm font-semibold text-zinc-900">
                  {item.label}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em]',
                    item.priority === 'required'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-zinc-200 text-zinc-600',
                  )}
                >
                  {item.priority}
                </span>
              </div>
              <p className="mt-1 text-sm leading-5 text-zinc-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
