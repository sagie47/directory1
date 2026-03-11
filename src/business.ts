export type BusinessReview = {
  author: string;
  rating: number;
  text: string;
};

export type BusinessHours = Record<string, string>;

export type BusinessSource = {
  provider?: string;
  cid?: string;
  placeId?: string;
  category?: string;
  mapsUrl?: string;
};

export type Business = {
  id: string;
  name: string;
  categoryId: string;
  cityId: string;
  rating?: number;
  reviewCount?: number;
  serviceAreas?: string[];
  contact: {
    phone?: string;
    website?: string;
    address?: string;
    email?: string;
  };
  description?: string;
  categoryTags?: string[];
  specialties?: string[];
  photos?: string[];
  reviews?: BusinessReview[];
  hours?: BusinessHours;
  source?: BusinessSource;
  coordinates?: {
    lat: number;
    lng: number;
  };
};

export function getPhoneHref(phone?: string) {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/[^0-9+]/g, '');
  return digits ? `tel:${digits}` : undefined;
}

export function getWebsiteHref(website?: string) {
  if (!website) {
    return undefined;
  }

  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export function getMapsHref(business: Pick<Business, 'name' | 'contact' | 'source'>) {
  if (business.source?.mapsUrl) {
    return business.source.mapsUrl;
  }

  const query = [business.name, business.contact.address].filter(Boolean).join(', ');
  if (!query) {
    return undefined;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function getMapEmbedUrl(business: Pick<Business, 'contact' | 'coordinates'>) {
  if (business.contact.address) {
    return `https://www.google.com/maps?q=${encodeURIComponent(business.contact.address)}&z=15&output=embed`;
  }

  if (business.coordinates) {
    return `https://www.google.com/maps?q=${business.coordinates.lat},${business.coordinates.lng}&z=15&output=embed`;
  }

  return undefined;
}

export function getBusinessDescription(business: Business, cityName: string, categoryName: string) {
  if (business.description) {
    return business.description;
  }

  return `${business.name} is listed in ${cityName} under ${categoryName}. Use the contact links below to confirm current availability, pricing, and service scope.`;
}

export function getBusinessServiceAreas(business: Business, cityName: string) {
  return business.serviceAreas && business.serviceAreas.length > 0 ? business.serviceAreas : [cityName];
}

export function getBusinessReviews(business: Business) {
  return business.reviews ?? [];
}

export function getBusinessPhotos(business: Business) {
  return business.photos ?? [];
}

export function getBusinessSpecialties(business: Business) {
  return business.specialties ?? [];
}

export function getBusinessHours(business: Business) {
  return business.hours ? Object.entries(business.hours) : [];
}

export function getBusinessCategoryTags(business: Business, limit = 6) {
  const tags = (business.categoryTags ?? [])
    .map((tag) => tag.trim())
    .filter(Boolean);

  const deduped = [...new Set(tags)];
  return deduped.slice(0, limit);
}

export function getBusinessCapabilities(business: Business, limit = 8) {
  const specialties = getBusinessSpecialties(business);
  if (specialties.length > 0) {
    return specialties.slice(0, limit);
  }

  return getBusinessCategoryTags(business, limit);
}
