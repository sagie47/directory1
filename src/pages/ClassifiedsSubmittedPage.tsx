import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';

export default function ClassifiedsSubmittedPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#FAFAFA] py-24 font-sans text-zinc-900"
    >
      <Seo
        title="Classified Submitted | Okanagan Trades"
        description="Your Okanagan Trades classified listing was submitted for review."
        path="/classifieds/submitted"
        robots="noindex,nofollow"
      />

      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="flex h-16 w-16 items-center justify-center border-2 border-zinc-900 bg-white shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]">
          <CheckCircle2 className="h-7 w-7 text-emerald-600" strokeWidth={2.2} />
        </div>
        <SectionEyebrow
          icon={CheckCircle2}
          className="mt-8 inline-flex items-center gap-2 border border-zinc-200 bg-white px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 shadow-sm"
          iconClassName="h-3.5 w-3.5 text-emerald-600"
        >
          Submitted for review
        </SectionEyebrow>
        <h1 className="mt-6 text-4xl font-bold uppercase leading-tight text-zinc-950 sm:text-5xl">
          Your listing is pending approval
        </h1>
        <p className="mt-5 text-lg leading-8 text-zinc-600">
          An admin will review it before it appears on the public classifieds page. Approved listings show your direct contact info for local trades hiring and labour coordination.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/classifieds"
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-zinc-800"
          >
            Browse classifieds
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/classifieds/post"
            className="inline-flex min-h-12 items-center justify-center gap-3 border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
          >
            Post another
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
