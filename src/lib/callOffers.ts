import { BriefcaseBusiness, Globe, LineChart, type LucideIcon } from 'lucide-react';

export type CallOffer = 'website' | 'managed-growth';
export type CallOfferFlow =
  | 'request-only'
  | 'request-and-schedule'
  | 'payment-only'
  | 'payment-and-schedule';

type ServiceNeed = {
  value: string;
  label: string;
};

interface CallOfferDefinition {
  eyebrow: string;
  icon: LucideIcon;
  title: string;
  intro: string;
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

export interface CallOfferConfig extends CallOfferDefinition {
  flow: CallOfferFlow;
  hasStripePayment: boolean;
  hasSchedulingLink: boolean;
  isFullyConfigured: boolean;
  submitCta: string;
  configurationTitle: string;
  configurationBody: string;
}

function normalizeOptionalUrl(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function resolveFlow(stripePaymentUrl?: string, scheduleUrl?: string): CallOfferFlow {
  if (stripePaymentUrl && scheduleUrl) {
    return 'payment-and-schedule';
  }

  if (stripePaymentUrl) {
    return 'payment-only';
  }

  if (scheduleUrl) {
    return 'request-and-schedule';
  }

  return 'request-only';
}

function getFlowCopy(flow: CallOfferFlow) {
  switch (flow) {
    case 'payment-and-schedule':
      return {
        submitCta: 'Continue to Payment',
        configurationTitle: 'Payment and scheduling are live.',
        configurationBody: 'Submit your intake, complete Stripe checkout, then use the scheduling link to book a time immediately.',
      };
    case 'payment-only':
      return {
        submitCta: 'Continue to Payment',
        configurationTitle: 'Payment is live. Scheduling is still manual.',
        configurationBody: 'Submit your intake and complete Stripe checkout. We will follow up manually to confirm the meeting time.',
      };
    case 'request-and-schedule':
      return {
        submitCta: 'Submit and Continue',
        configurationTitle: 'Scheduling is live after submission.',
        configurationBody: 'This flow saves the intake first, then sends the buyer to the scheduling link from the confirmation page.',
      };
    case 'request-only':
    default:
      return {
        submitCta: 'Submit Request',
        configurationTitle: 'This flow is request-only right now.',
        configurationBody: 'Payment and scheduling are not configured yet. We will receive the intake and follow up manually.',
      };
  }
}

const callOffers: Record<CallOffer, CallOfferDefinition> = {
  website: {
    eyebrow: 'Website Intake',
    icon: Globe,
    title: 'Schedule a Website Call',
    intro: 'Tell us a bit about your business and current site situation. We will use this to shape a practical website conversation, not a generic agency pitch.',
    successEyebrow: 'Website Call Requested',
    successTitle: 'Thanks. Your Website Request Is In.',
    successBody: 'We have your details. The next step depends on the live configuration for this offer: payment, scheduling, or manual follow-up.',
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
    successEyebrow: 'Strategy Call Requested',
    successTitle: 'Thanks. Your Strategy Request Is In.',
    successBody: 'We have your details. The next step depends on the live configuration for this offer: payment, scheduling, or manual follow-up.',
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

export function getCallOfferConfig(value: string | null | undefined): CallOfferConfig {
  const base = callOffers[getCallOffer(value)];
  const stripePaymentUrl = normalizeOptionalUrl(base.stripePaymentUrl);
  const scheduleUrl = normalizeOptionalUrl(base.scheduleUrl);
  const flow = resolveFlow(stripePaymentUrl, scheduleUrl);
  const flowCopy = getFlowCopy(flow);

  return {
    ...base,
    stripePaymentUrl,
    scheduleUrl,
    flow,
    hasStripePayment: Boolean(stripePaymentUrl),
    hasSchedulingLink: Boolean(scheduleUrl),
    isFullyConfigured: flow === 'payment-and-schedule',
    submitCta: flowCopy.submitCta,
    configurationTitle: flowCopy.configurationTitle,
    configurationBody: flowCopy.configurationBody,
  };
}
