import type { Business, BusinessHours } from '@/src/business';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface OwnerProfileSnapshot {
  name?: string;
  description?: string;
  contact?: {
    phone?: string;
    website?: string;
    address?: string;
    email?: string;
  };
  serviceAreas?: string[];
  hours?: BusinessHours;
  photos?: string[];
}

export interface OwnerProfileField {
  id: 'name' | 'description' | 'phone' | 'website' | 'address' | 'service-areas' | 'hours' | 'photos';
  label: string;
  description: string;
  complete: boolean;
  priority: 'required' | 'recommended';
}

const MIN_DESCRIPTION_LENGTH = 24;

export function hasBusinessHours(hours?: BusinessHours) {
  return Boolean(hours && Object.values(hours).some((value) => Boolean(value?.trim())));
}

export function getOwnerProfileFields(profile?: OwnerProfileSnapshot | null): OwnerProfileField[] {
  return [
    {
      id: 'name',
      label: 'Business name',
      description: 'Keep the public listing name accurate and recognizable.',
      complete: Boolean(profile?.name?.trim()),
      priority: 'required',
    },
    {
      id: 'description',
      label: 'Business description',
      description: 'Explain what you do in a way customers can understand quickly.',
      complete: Boolean(profile?.description && profile.description.trim().length >= MIN_DESCRIPTION_LENGTH),
      priority: 'required',
    },
    {
      id: 'phone',
      label: 'Phone number',
      description: 'Give customers the fastest way to reach your team.',
      complete: Boolean(profile?.contact?.phone?.trim()),
      priority: 'required',
    },
    {
      id: 'website',
      label: 'Website',
      description: 'Recommended if you want customers to learn more before calling.',
      complete: Boolean(profile?.contact?.website?.trim()),
      priority: 'recommended',
    },
    {
      id: 'address',
      label: 'Address',
      description: 'Useful when customers need a physical service location or mailing address.',
      complete: Boolean(profile?.contact?.address?.trim()),
      priority: 'recommended',
    },
    {
      id: 'service-areas',
      label: 'Service areas',
      description: 'Show where you actually work so the right customers find you.',
      complete: Boolean(profile?.serviceAreas?.filter((entry) => entry.trim().length > 0).length),
      priority: 'required',
    },
    {
      id: 'hours',
      label: 'Business hours',
      description: 'Set expectations for when customers can call or expect a reply.',
      complete: hasBusinessHours(profile?.hours),
      priority: 'required',
    },
    {
      id: 'photos',
      label: 'Photos',
      description: 'Show recent work, branding, or your team so the listing feels real.',
      complete: Boolean(profile?.photos?.filter((entry) => entry.trim().length > 0).length),
      priority: 'recommended',
    },
  ];
}

export function getOwnerProfileProgress(profile?: OwnerProfileSnapshot | null) {
  const fields = getOwnerProfileFields(profile);
  const completed = fields.filter((field) => field.complete).length;
  const required = fields.filter((field) => field.priority === 'required');
  const requiredCompleted = required.filter((field) => field.complete).length;

  return {
    fields,
    completed,
    total: fields.length,
    percent: Math.round((completed / fields.length) * 100),
    requiredCompleted,
    requiredTotal: required.length,
  };
}

export function getBusinessListingPath(
  business?: Pick<Business, 'cityId' | 'categoryId' | 'id'> | null,
) {
  if (!business) {
    return undefined;
  }

  return `/${business.cityId}/${business.categoryId}/${business.id}`;
}

export function getClaimStatusCopy(status: ClaimStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'Under review',
        shortLabel: 'Pending',
        title: 'Review in progress',
        description: 'Your claim is in manual review right now. You cannot edit the listing until ownership is approved.',
        accentClassName: 'border-amber-200 bg-amber-50 text-amber-700',
        iconClassName: 'text-amber-500',
      };
    case 'approved':
      return {
        label: 'Approved',
        shortLabel: 'Approved',
        title: 'Approved and ready',
        description: 'Ownership is confirmed. The next step is opening the owner dashboard and updating the fields customers rely on.',
        accentClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        iconClassName: 'text-emerald-500',
      };
    case 'rejected':
      return {
        label: 'Needs a new claim',
        shortLabel: 'Rejected',
        title: 'Rejected',
        description: 'This claim was not approved. Review the reason below, then submit a stronger claim if you still need access.',
        accentClassName: 'border-rose-200 bg-rose-50 text-rose-700',
        iconClassName: 'text-rose-500',
      };
    case 'revoked':
      return {
        label: 'Access removed',
        shortLabel: 'Revoked',
        title: 'Access removed',
        description: 'This listing is no longer attached to your account. Contact support if you believe that was a mistake.',
        accentClassName: 'border-rose-200 bg-rose-50 text-rose-700',
        iconClassName: 'text-rose-500',
      };
  }
}
