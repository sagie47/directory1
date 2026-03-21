import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Mail, Search, ShieldCheck } from 'lucide-react';

import SectionEyebrow from '@/src/components/SectionEyebrow';
import Seo from '@/src/components/Seo';
import { trackEvent } from '@/src/lib/analytics';

const supportSteps = [
  {
    icon: Search,
    title: 'Search one more time',
    description: 'Use the business name, city, trade, and address on the claim page before assuming the listing is missing.',
  },
  {
    icon: Building2,
    title: 'Gather the basics',
    description: 'Send the business name, service area, phone number, website, and anything else that helps us add the right listing.',
  },
  {
    icon: Mail,
    title: 'Contact the team',
    description: 'If the listing is not in the directory yet, contact us first. Once it exists, you can come back and claim it.',
  },
];

export default function ClaimBusinessPage() {
  useEffect(() => {
    trackEvent('claim_business_viewed');
  }, []);

  return (
    <main className="min-h-screen bg-[#FAFAFA] px-4 py-16 text-zinc-900 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <Seo
        title="Not In The Directory Yet? | Okanagan Trades"
        description="If your business is not listed in the directory yet, contact the team first. Claiming only works for listings that already exist."
        path="/claim-business"
      />

      <div className="mx-auto max-w-[96rem] space-y-8">
        <section className="border-2 border-zinc-900 bg-white">
          <div className="grid gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
            <div className="max-w-3xl">
              <SectionEyebrow
                icon={ShieldCheck}
                className="inline-flex items-center gap-2 bg-zinc-900 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white"
                iconClassName="h-3.5 w-3.5 text-orange-400"
              >
                Missing Listing Help
              </SectionEyebrow>
              <h1 className="mt-6 text-4xl font-bold uppercase tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
                Don&apos;t see your business?
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 sm:text-xl">
                Claiming only works for listings that already exist in the directory. If your business is not listed yet, contact us first so we can point you to the right next step.
              </p>
            </div>

            <div className="border border-zinc-200 bg-zinc-50 p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Best next move</p>
              <div className="mt-4 grid gap-3">
                <Link
                  to="/claim"
                  className="inline-flex items-center justify-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-all hover:border-orange-500 hover:bg-orange-500"
                >
                  Search again
                  <ArrowRight className="h-4 w-4" strokeWidth={2.6} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center border border-zinc-200 bg-white px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {supportSteps.map((step) => (
            <article key={step.title} className="border border-zinc-200 bg-white p-6 sm:p-7">
              <div className="flex h-11 w-11 items-center justify-center border border-zinc-900 bg-zinc-900 text-white">
                <step.icon className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <h2 className="mt-5 text-2xl font-bold tracking-tight text-zinc-950">{step.title}</h2>
              <p className="mt-3 text-base leading-7 text-zinc-600">{step.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="border border-zinc-200 bg-white p-6 sm:p-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">What to send us</p>
            <div className="mt-5 space-y-3">
              {[
                'Business name',
                'Primary city or service area',
                'Phone number or email',
                'Website if you have one',
                'Anything that helps identify the business cleanly',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 border border-zinc-200 bg-zinc-50 px-4 py-4">
                  <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-zinc-900" />
                  <p className="text-sm leading-6 text-zinc-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-zinc-200 bg-zinc-50 p-6 sm:p-8">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Important</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950">Claim only works for an existing listing.</h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              If a business is missing from the directory, sending people into the claim flow creates a dead end. This page exists to stop that and route them cleanly.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex items-center gap-3 border-2 border-zinc-900 bg-zinc-900 px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-orange-500 hover:bg-orange-500"
            >
              Contact us about a listing
              <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
