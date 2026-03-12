import type { Business } from './business';
import { getCityHeroFallbackImage, getCityHeroImage } from './city-hero-images';
import { preferSupabaseImage } from './supabase-images';

import constructionHero from './photos/job-construction-scaled.jpg';
import transitHero from './photos/2024_active_transportation_construction_hintringer_63.jpg';
import lakeCountryHero from './photos/lake-country-header-gillian-min.jpg';

const categoryFallbackImages: Record<string, string> = {
  structural: preferSupabaseImage('job-construction-scaled.jpg', constructionHero),
  mechanical: preferSupabaseImage('2024_active_transportation_construction_hintringer_63.jpg', transitHero),
  interior: preferSupabaseImage('job-construction-scaled.jpg', constructionHero),
  exterior: preferSupabaseImage('lake-country-header-gillian-min.jpg', lakeCountryHero),
  specialty: preferSupabaseImage('2024_active_transportation_construction_hintringer_63.jpg', transitHero),
  services: preferSupabaseImage('job-construction-scaled.jpg', constructionHero),
};

const categoryFallbackLocalImages: Record<string, string> = {
  structural: constructionHero,
  mechanical: transitHero,
  interior: constructionHero,
  exterior: lakeCountryHero,
  specialty: transitHero,
  services: constructionHero,
};

type CategoryHeroContext = {
  categoryId: string;
  groupId?: string | null;
  cityId: string;
  businesses: Business[];
};

function getBusinessHeroPhoto(businesses: Business[]) {
  const candidates = businesses
    .filter((business) => Array.isArray(business.photos) && business.photos.length > 0)
    .sort((left, right) =>
      (right.rating ?? 0) - (left.rating ?? 0)
      || (right.reviewCount ?? 0) - (left.reviewCount ?? 0)
    );

  return candidates[0]?.photos?.[0];
}

export function getCategoryHeroImage({ categoryId, groupId, cityId, businesses }: CategoryHeroContext) {
  const exactCityPhoto = getBusinessHeroPhoto(
    businesses.filter((business) => business.categoryId === categoryId && business.cityId === cityId)
  );

  if (exactCityPhoto) {
    return exactCityPhoto;
  }

  const categoryPhoto = getBusinessHeroPhoto(
    businesses.filter((business) => business.categoryId === categoryId)
  );

  if (categoryPhoto) {
    return categoryPhoto;
  }

  if (groupId && categoryFallbackImages[groupId]) {
    return categoryFallbackImages[groupId];
  }
  
  // Use city hero image as a final contextual fallback before the generic one
  const cityHero = getCityHeroImage(cityId);
  if (cityHero) {
    return cityHero;
  }

  return constructionHero;
}

export function getCategoryHeroFallbackImage({ groupId, cityId }: Pick<CategoryHeroContext, 'groupId' | 'cityId'>) {
  if (groupId && categoryFallbackLocalImages[groupId]) {
    return categoryFallbackLocalImages[groupId];
  }

  const cityHeroFallback = getCityHeroFallbackImage(cityId);
  if (cityHeroFallback) {
    return cityHeroFallback;
  }

  return constructionHero;
}
