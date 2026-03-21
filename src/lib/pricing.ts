export type DirectoryPlanId =
  | 'free-claim'
  | 'verified'
  | 'verified-pro'
  | 'performance-add-on';

export type ServiceOfferId = 'never-miss-a-lead' | 'website' | 'managed-growth';

export interface DirectoryPlanTier {
  id: DirectoryPlanId;
  name: string;
  price: string;
  annualPrice?: string;
  summary: string;
}

export interface ServiceOfferPricing {
  id: ServiceOfferId;
  name: string;
  startingPrice: string;
}

export const DIRECTORY_PLAN_TIERS: DirectoryPlanTier[] = [
  {
    id: 'free-claim',
    name: 'Free Claim',
    price: '$0',
    summary: 'Claim listing, edit core info, and access owner dashboard basics.',
  },
  {
    id: 'verified',
    name: 'Verified Profile',
    price: '$29/mo launch, then $39/mo',
    annualPrice: '$290/yr launch, then $390/yr',
    summary: 'Verified badge, trust block, profile enhancements, base analytics, and priority support.',
  },
  {
    id: 'verified-pro',
    name: 'Verified Pro',
    price: '$99/mo',
    annualPrice: '$990/yr',
    summary: 'Everything in Verified plus priority category placement, richer analytics, and advanced modules.',
  },
  {
    id: 'performance-add-on',
    name: 'Performance Add-on',
    price: '$18-$45 per qualified lead',
    summary: 'Optional qualified-lead routing and reporting for approved, quality-baseline listings.',
  },
];

export const SERVICE_OFFER_PRICING: Record<ServiceOfferId, ServiceOfferPricing> = {
  'never-miss-a-lead': {
    id: 'never-miss-a-lead',
    name: 'Never Miss a Lead',
    startingPrice: 'From $297/mo (+ usage if needed)',
  },
  website: {
    id: 'website',
    name: 'Websites for Trades',
    startingPrice: 'From $2,500 setup + $99/mo care',
  },
  'managed-growth': {
    id: 'managed-growth',
    name: 'Managed Growth',
    startingPrice: 'From $1,250/mo',
  },
};

export const VERIFIED_LAUNCH_NOTE =
  'Verified launch pricing is $29/mo ($290/yr) before moving to $39/mo ($390/yr) for new signups.';

export const VERIFIED_ANNUAL_DISCOUNT_NOTE = 'Verified annual launch option reflects roughly a 17% discount.';
