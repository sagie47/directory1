import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';

const contentMap = {
  website: {
    eyebrow: 'Website Call Requested',
    title: "Thanks. We've Got Your Website Request.",
    body: 'We will review what you shared and reach out with next steps for a practical website conversation.',
    backTo: '/websites-for-trades',
    backLabel: 'Back to Websites for Trades',
  },
  'managed-growth': {
    eyebrow: 'Strategy Call Requested',
    title: "Thanks. We've Got Your Strategy Request.",
    body: 'We will review your details and reach out with next steps for a managed growth conversation.',
    backTo: '/managed-growth',
    backLabel: 'Back to Managed Growth',
  },
} as const;

export default function CallRequestedPage() {
  const [searchParams] = useSearchParams();
  const offer = searchParams.get('offer') === 'managed-growth' ? 'managed-growth' : 'website';
  const content = contentMap[offer];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#FAFAFA] py-24 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900"
    >
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-sm border border-zinc-200 bg-white p-8 shadow-sm sm:p-12"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-sm border border-zinc-900 bg-zinc-900 text-white shadow-sm">
            <Check className="h-8 w-8 text-orange-400" strokeWidth={2.5} />
          </div>

          <div className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            {content.eyebrow}
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase tracking-tighter leading-tight text-zinc-900 md:text-5xl">
            {content.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-zinc-600">
            {content.body}
          </p>

          <div className="mt-10 grid gap-4 border-t-2 border-zinc-100 pt-8 sm:grid-cols-2">
            <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-xl">
              <div className="flex items-center gap-3 text-zinc-900">
                <Phone className="h-5 w-5 text-orange-500" strokeWidth={2} />
                <span className="font-sans font-bold">We will call to schedule</span>
              </div>
            </div>
            <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-xl">
              <div className="flex items-center gap-3 text-zinc-900">
                <Mail className="h-5 w-5 text-orange-500" strokeWidth={2} />
                <span className="font-sans font-bold">Watch for an email</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t-2 border-zinc-100 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to={content.backTo} className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95">
                {content.backLabel}
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </Link>
              <Link to="/for-business" className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-zinc-900 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95">
                Back to Business Options
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
