import { BriefcaseBusiness, Globe, LineChart, type LucideIcon } from 'lucide-react';

export type CallOffer = 'website' | 'managed-growth';

type ServiceNeed = {
  value: string;
  label: string;
};

export interface CallOfferConfig {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  intro: string;
  cta: string;
  successEyebrow: string;
  successTitle: string;
  successBody: string;
  backTo: string;
  backLabel: string;
  serviceNeeds: ServiceNeed[];
  primaryNeedIcon: LucideIcon;
  stripePaymentUrl?: string;
  scheduleUrl?: string;
}

const callOffers: Record<CallOffer, CallOfferConfig> = {
  website: {
    eyebrow: 'Website Intake',
    icon: Globe,
    title: 'Schedule a Website Call',
    intro: 'Tell us a bit about your business and current site situation. We will use this to shape a practical website conversation, not a generic agency pitch.',
    cta: 'Continue to Payment',
    successEyebrow: 'Website Call Requested',
    successTitle: 'Thanks. Your Website Request Is In.',
    successBody: 'We have your details. If payment is complete, use the scheduling link below when it is available. Otherwise we will review the request and reach out with next steps.',
    backTo: '/websites-for-trades',
    backLabel: 'Back to Websites for Trades',
    primaryNeedIcon: BriefcaseBusiness,
    serviceNeeds: [
      { value: '', label: 'What do you need most?' },
      { value: 'new-site', label: 'A new website' },
      { value: 'redesign', label: 'A redesign of an existing site' },
      { value: 'service-pages', label: 'Stronger service pages and structure' },
      { value: 'credibility', label: 'A more credible first impression' },
    ],
    stripePaymentUrl: import.meta.env.VITE_STRIPE_WEBSITE_CALL_PAYMENT_URL,
    scheduleUrl: import.meta.env.VITE_WEBSITE_CALL_SCHEDULING_URL,
  },
  'managed-growth': {
    eyebrow: 'Strategy Intake',
    icon: LineChart,
    title: 'Schedule a Strategy Call',
    intro: 'Tell us where the current bottlenecks are. We will use this to understand whether managed growth support makes sense for your business.',
    cta: 'Continue to Payment',
    successEyebrow: 'Strategy Call Requested',
    successTitle: 'Thanks. Your Strategy Request Is In.',
    successBody: 'We have your details. If payment is complete, use the scheduling link below when it is available. Otherwise we will review the request and reach out with next steps.',
    backTo: '/managed-growth',
    backLabel: 'Back to Managed Growth',
    primaryNeedIcon: BriefcaseBusiness,
    serviceNeeds: [
      { value: '', label: 'What is the biggest current need?' },
      { value: 'visibility', label: 'Visibility and presence management' },
      { value: 'lead-response', label: 'Lead response and follow-up support' },
      { value: 'reviews', label: 'Reputation and review support' },
      { value: 'execution', label: 'Ongoing execution help' },
    ],
    stripePaymentUrl: import.meta.env.VITE_STRIPE_MANAGED_GROWTH_CALL_PAYMENT_URL,
    scheduleUrl: import.meta.env.VITE_MANAGED_GROWTH_CALL_SCHEDULING_URL,
  },
};

export function getCallOffer(value: string | null | undefined): CallOffer {
  return value === 'managed-growth' ? 'managed-growth' : 'website';
}

export function getCallOfferConfig(value: string | null | undefined) {
  return callOffers[getCallOffer(value)];
}
