import { Link } from 'react-router-dom';
import { ArrowRight, Check, Phone, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import SectionEyebrow from '../components/SectionEyebrow';

export default function DemoRequestedPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#FAFAFA] py-24 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>

      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-sm border border-zinc-200 bg-white p-8 shadow-sm sm:p-12"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-900 text-white shadow-sm">
            <Check className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>

          <div className="mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-zinc-500">
            Demo Requested
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase tracking-tighter text-zinc-900 md:text-5xl leading-tight">
            Thanks. We've Got Your Request.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-zinc-600">
            We'll review your business details and reach out with the next steps. The goal is to show you a practical lead-response workflow, not pitch generic software.
          </p>

          <div className="mt-10 grid gap-4 border-t-2 border-zinc-100 pt-8 sm:grid-cols-2">
            <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:bg-white hover:shadow-xl">
              <div className="flex items-center gap-3 text-zinc-900">
                <Phone className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                <span className="font-sans font-bold">We'll call to schedule</span>
              </div>
            </div>
            <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:bg-white hover:shadow-xl">
              <div className="flex items-center gap-3 text-zinc-900">
                <Mail className="h-5 w-5 text-zinc-500" strokeWidth={2} />
                <span className="font-sans font-bold">Watch for an email</span>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t-2 border-zinc-100 pt-8">
            <p className="mb-6 font-sans text-base font-medium text-zinc-600">
              While you wait, you can still claim and clean up your directory profile.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link to="/claim" className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:-translate-y-1 hover:bg-zinc-800 hover:shadow-xl active:scale-95 group">
                Claim Your Business <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </Link>
              <Link to="/" className="inline-flex items-center justify-center gap-3 border-2 border-zinc-200 bg-white px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-zinc-900 rounded-xl transition-all hover:border-zinc-900 hover:bg-zinc-50 active:scale-95">
                Back to Directory
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
