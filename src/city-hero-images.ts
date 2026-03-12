import kelownaHero from './photos/kelowna.jpg';
import vernonHero from './photos/vernon.jpg';
import pentictonHero from './photos/Penticton_Okanagan_Beach_Lakeshore.jpg';
import westKelownaHero from './photos/westkelowna.jpg';
import lakeCountryHero from './photos/lake-country-header-gillian-min.jpg';
import summerlandHero from './photos/summerland.jpg';
import oliverHero from './photos/Oliver_-_panoramio.jpg';

export const cityHeroImages: Record<string, string> = {
  kelowna: kelownaHero,
  vernon: vernonHero,
  penticton: pentictonHero,
  'west-kelowna': westKelownaHero,
  'lake-country': lakeCountryHero,
  summerland: summerlandHero,
  oliver: oliverHero,
};

export function getCityHeroImage(cityId?: string | null) {
  if (!cityId) {
    return undefined;
  }

  return cityHeroImages[cityId];
}
