import type { Business } from '@/src/business';
import { getOwnerProfileProgress, type OwnerProfileSnapshot } from '@/src/lib/ownerProfile';
import { SERVICE_OFFER_PRICING } from '@/src/lib/pricing';

export type RecommendationType =
  | 'review_pending'
  | 'complete_profile'
  | 'website_fix'
  | 'lead_capture'
  | 'managed_growth'
  | 'listing_upgrade'
  | 'retry_claim'
  | 'none';

export interface RecommendationResult {
  type: RecommendationType;
  title: string;
  description: string;
  href?: string;
  ctaLabel?: string;
}

interface RecommendationContext {
  business?: Business | OwnerProfileSnapshot | null;
  claimStatus?: 'pending' | 'approved' | 'rejected' | 'revoked';
}

export function getOwnerRecommendation({
  business,
  claimStatus,
}: RecommendationContext): RecommendationResult {
  if (claimStatus === 'revoked') {
    return {
      type: 'none',
      title: 'Claim Revoked',
      description: 'Your claim for this business has been revoked. Please contact support if you believe this is an error.',
      href: '/contact',
      ctaLabel: 'Contact Support',
    };
  }

  if (claimStatus === 'rejected') {
    return {
      type: 'retry_claim',
      title: 'Claim Needs Another Attempt',
      description: 'This claim was not approved. Review the reason above and try again if you have updated ownership details.',
      href: '/claim',
      ctaLabel: 'Start A New Claim',
    };
  }

  if (!business) {
    return {
      type: claimStatus === 'pending' ? 'review_pending' : 'none',
      title: claimStatus === 'pending' ? 'Review In Progress' : 'Owner Tools Locked',
      description: claimStatus === 'pending'
        ? 'We are confirming ownership before any profile editing becomes available.'
        : 'Owner tools unlock after a verified business claim is approved.',
    };
  }

  if (claimStatus === 'pending') {
    return {
      type: 'review_pending',
      title: 'Review In Progress',
      description: 'We are checking your ownership details now. If approved, the dashboard unlocks immediately so you can update the listing.',
    };
  }

  const progress = getOwnerProfileProgress(business);
  const hasRequiredGaps = progress.requiredCompleted < progress.requiredTotal;
  const hasWebsite = Boolean(business.contact?.website?.trim());

  if (hasRequiredGaps) {
    return {
      type: 'complete_profile',
      title: 'Complete Your Profile',
      description: 'Your listing is still missing core details that help customers trust and contact your business.',
      href: '/owner/dashboard',
      ctaLabel: 'Update Profile',
    };
  }

  if (!hasWebsite) {
    return {
      type: 'website_fix',
      title: 'Add A Real Website Layer',
      description: `Your listing basics are in place. If the business still has no site, the highest-leverage paid move is a trade website that makes trust and contact easier. ${SERVICE_OFFER_PRICING.website.startingPrice}.`,
      href: '/websites-for-trades',
      ctaLabel: 'See Website Offer',
    };
  }

  if (progress.percent >= 100) {
    return {
      type: 'managed_growth',
      title: 'Move From Cleanup To Growth',
      description: `The listing basics and website layer are already in place. The next paid lane is tighter lead response, visibility support, and ongoing execution help. ${SERVICE_OFFER_PRICING['managed-growth'].startingPrice}.`,
      href: '/managed-growth',
      ctaLabel: 'See Managed Growth',
    };
  }

  if (claimStatus === 'approved') {
    return {
      type: 'lead_capture',
      title: 'Capture More Leads',
      description: `Your listing is in decent shape. If missed calls or slow follow-up still cost work, lead capture is the next paid gap to fix. ${SERVICE_OFFER_PRICING['never-miss-a-lead'].startingPrice}.`,
      href: '/never-miss-a-lead',
      ctaLabel: 'View Lead Capture',
    };
  }

  return {
    type: 'listing_upgrade',
    title: 'Keep Your Listing Working Harder',
    description: 'Your profile basics are in place. The next step is improving how customers discover and contact your business.',
    href: '/for-business',
    ctaLabel: 'See Business Options',
  };
}
