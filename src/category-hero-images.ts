import type { Business } from './business';

import constructionHero from './photos/job-construction-scaled.jpg';
import transitHero from './photos/2024_active_transportation_construction_hintringer_63.jpg';
import lakeCountryHero from './photos/lake-country-header-gillian-min.jpg';

const categoryFallbackImages: Record<string, string> = {
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

  return constructionHero;
}
