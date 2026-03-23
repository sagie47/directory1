import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CalendarClock, Check, CreditCard, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';

import Seo from '@/src/components/Seo';
import { getCallOffer, getCallOfferConfig } from '@/src/lib/callOffers';

export default function CallRequestedPage() {
  const [searchParams] = useSearchParams();
  const offer = getCallOffer(searchParams.get('offer'));
  const content = getCallOfferConfig(offer);
  const paymentStatus = searchParams.get('payment');
  const paymentReceived = paymentStatus === 'paid';
  const canShowSchedulingLink = content.hasSchedulingLink && (!content.hasStripePayment || paymentReceived);

  let headline = content.successTitle;
  let body = content.successBody;
  let primaryStatus = 'We will follow up on scheduling';
  let secondaryStatus = 'Watch for an email';

  if (paymentReceived) {
    headline = 'Payment received.';
    body = canShowSchedulingLink
      ? 'Your payment is in. Use the scheduling link below to book a time now.'
      : 'Your payment is in. Scheduling is still being handled manually, so we will follow up with the next step.';
    primaryStatus = 'Stripe payment confirmed';
    secondaryStatus = canShowSchedulingLink ? 'Scheduling is ready below' : 'Manual scheduling follow-up required';
  } else if (canShowSchedulingLink) {
    body = 'Your request is saved. Use the scheduling link below to choose a time now.';
    primaryStatus = 'Request saved successfully';
    secondaryStatus = 'Scheduling link is ready below';
  } else if (content.hasStripePayment) {
    body = 'Your request is saved, but payment has not been confirmed yet. Complete checkout before expecting the scheduling step.';
    primaryStatus = 'Request saved successfully';
    secondaryStatus = 'Payment is still required';
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#FAFAFA] py-24 font-sans text-zinc-900 selection:bg-indigo-200 selection:text-indigo-900"
    >
      <Seo
        title={`${content.successEyebrow} | Okanagan Trades`}
        description={content.successBody}
        path="/call-requested"
        robots="noindex,nofollow"
      />

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
            {content.successEyebrow}
          </div>
          <h1 className="mt-4 text-4xl font-bold uppercase tracking-tighter leading-tight text-zinc-900 md:text-5xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-zinc-600">
            {body}
          </p>

          <div className="mt-10 grid gap-4 border-t-2 border-zinc-100 pt-8 sm:grid-cols-2">
            <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-xl">
              <div className="flex items-center gap-3 text-zinc-900">
                {paymentReceived ? (
                  <CreditCard className="h-5 w-5 text-orange-500" strokeWidth={2} />
                ) : (
                  <Phone className="h-5 w-5 text-orange-500" strokeWidth={2} />
                )}
                <span className="font-sans font-bold">{primaryStatus}</span>
              </div>
            </div>
            <div className="rounded-sm border border-zinc-200 bg-zinc-50 p-6 transition-all duration-300 hover:border-zinc-300 hover:shadow-xl">
              <div className="flex items-center gap-3 text-zinc-900">
                {canShowSchedulingLink ? (
                  <CalendarClock className="h-5 w-5 text-orange-500" strokeWidth={2} />
                ) : (
                  <Mail className="h-5 w-5 text-orange-500" strokeWidth={2} />
                )}
                <span className="font-sans font-bold">{secondaryStatus}</span>
              </div>
            </div>
          </div>

          {!content.isFullyConfigured ? (
            <div className="mt-8 border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-900">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Configuration note</p>
              <p className="mt-2">{content.configurationBody}</p>
            </div>
          ) : null}

          <div className="mt-10 border-t-2 border-zinc-100 pt-8">
            <div className="flex flex-col gap-4 sm:flex-row">
              {canShowSchedulingLink ? (
                <a
                  href={content.scheduleUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95"
                >
                  {paymentReceived ? 'Schedule Call' : 'Continue to Scheduling'}
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </a>
              ) : (
                <Link to={content.backTo} className="inline-flex items-center justify-center gap-3 rounded-xl border border-zinc-900 bg-zinc-900 px-8 py-5 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-zinc-800 hover:-translate-y-1 active:scale-95">
                  {content.backLabel}
                  <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                </Link>
              )}
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
