import type { Business, BusinessHours } from '@/src/business';

export type ClaimStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface OwnerProfileSnapshot {
  description?: string;
  contact?: {
    phone?: string;
    website?: string;
    email?: string;
  };
  serviceAreas?: string[];
  hours?: BusinessHours;
}

export interface OwnerProfileField {
  id: 'description' | 'phone' | 'website' | 'service-areas' | 'hours';
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
        accentClassName: 'border-amber-200 bg-amber-50 text-amber-700',
        iconClassName: 'text-amber-500',
      };
    case 'approved':
      return {
        label: 'Approved',
        shortLabel: 'Approved',
        accentClassName: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        iconClassName: 'text-emerald-500',
      };
    case 'rejected':
      return {
        label: 'Needs a new claim',
        shortLabel: 'Rejected',
        accentClassName: 'border-rose-200 bg-rose-50 text-rose-700',
        iconClassName: 'text-rose-500',
      };
    case 'revoked':
      return {
        label: 'Access removed',
        shortLabel: 'Revoked',
        accentClassName: 'border-rose-200 bg-rose-50 text-rose-700',
        iconClassName: 'text-rose-500',
      };
  }
}
