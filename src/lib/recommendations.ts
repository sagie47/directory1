import { Business } from '../business';

export type RecommendationType =
  | 'complete_profile'
  | 'website_fix'
  | 'lead_capture'
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
  business?: Business | null;
  claimStatus?: 'pending' | 'approved' | 'rejected' | 'revoked';
}

export function getOwnerRecommendation({ business, claimStatus }: RecommendationContext): RecommendationResult {
  if (claimStatus === 'rejected') {
    return {
      type: 'retry_claim',
      title: 'Claim Needs Another Attempt',
      description: 'This claim was not approved. Review the reason above and try again if you have updated ownership details.',
      href: '/claim',
      ctaLabel: 'Start a New Claim'
    };
  }

  if (!business) {
    return {
      type: 'none',
      title: 'We Are Reviewing Your Claim',
      description: 'We will confirm your ownership request before any profile updates are available.'
    };
  }

  const hasDescription = Boolean(business.description && business.description.length > 10);
  const hasPhone = Boolean(business.contact?.phone);
  const hasWebsite = Boolean(business.contact?.website);
  const hasServiceAreas = Boolean(business.serviceAreas && business.serviceAreas.length > 0);
  const hasHours = Boolean(
    business.hours && Object.values(business.hours).some((value) => Boolean(value?.trim()))
  );
  
  if (!hasDescription || !hasPhone || !hasServiceAreas || !hasHours) {
    if (claimStatus === 'pending') {
      return {
        type: 'complete_profile',
        title: 'Complete Your Profile',
        description: 'You will be able to complete this after approval. Make sure your claim is approved to unlock profile management.'
      };
    }

    return {
      type: 'complete_profile',
      title: 'Complete Your Profile',
      description: 'Your profile is still missing core business details. Complete these to improve customer trust.',
      href: business ? `/owner/dashboard/${business.id}` : '/owner/dashboard',
      ctaLabel: 'Update Profile'
    };
  }

  if (!hasWebsite) {
    return {
      type: 'website_fix',
      title: 'Add a Website',
      description: 'You do not have a website listed. A professional website builds credibility and makes it easier for customers to contact you.',
      href: '/websites-for-trades',
      ctaLabel: 'Explore Websites'
    };
  }

  if (claimStatus === 'approved') {
    return {
      type: 'lead_capture',
      title: 'Never Miss a Lead',
      description: 'If you miss calls while on jobs, our AI receptionist can help you capture every opportunity.',
      href: '/never-miss-a-lead',
      ctaLabel: 'View Lead Capture'
    };
  }

  return {
    type: 'listing_upgrade',
    title: 'Grow Your Business',
    description: 'Your profile basics are in place. Explore additional services to help you grow.',
    href: '/for-business',
    ctaLabel: 'See Business Options'
  };
}
