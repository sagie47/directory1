export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export type ClaimState =
  | 'claimable'
  | 'pending_by_me'
  | 'approved_by_me'
  | 'claimed_by_other'
  | 'verification_unknown';

export interface UserBusinessClaim {
  business_id: string;
  status: ClaimStatus;
}

interface ClaimStateOptions {
  businessId: string;
  userClaims?: UserBusinessClaim[];
  verifiedBusinessIds?: Set<string>;
  verifiedLookupDegraded?: boolean;
}

export function getClaimStateForBusiness({
  businessId,
  userClaims = [],
  verifiedBusinessIds = new Set<string>(),
  verifiedLookupDegraded = false,
}: ClaimStateOptions): ClaimState {
  const hasApprovedClaim = userClaims.some((claim) =>
    claim.business_id === businessId && claim.status === 'approved'
  );
  if (hasApprovedClaim) {
    return 'approved_by_me';
  }

  const hasPendingClaim = userClaims.some((claim) =>
    claim.business_id === businessId && claim.status === 'pending'
  );
  if (hasPendingClaim) {
    return 'pending_by_me';
  }

  if (verifiedLookupDegraded) {
    return 'verification_unknown';
  }

  if (verifiedBusinessIds.has(businessId)) {
    return 'claimed_by_other';
  }

  return 'claimable';
}

export function getClaimStateCopy(state: ClaimState) {
  switch (state) {
    case 'pending_by_me':
      return {
        badge: 'Your claim is pending',
        description: 'You already have a pending ownership request for this listing.',
      };
    case 'approved_by_me':
      return {
        badge: 'Already attached to you',
        description: 'This listing is already attached to your account.',
      };
    case 'claimed_by_other':
      return {
        badge: 'Already claimed',
        description: 'This listing already has an approved owner attached to it.',
      };
    case 'verification_unknown':
      return {
        badge: 'Status unavailable',
        description: 'Ownership status could not be confirmed right now.',
      };
    case 'claimable':
      return {
        badge: 'Claim available',
        description: 'No approved ownership block was found for this listing.',
      };
  }
}
