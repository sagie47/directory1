import kelownaHero from './photos/kelowna.jpg';
import vernonHero from './photos/1746202255761.jpg';
import pentictonHero from './photos/lake-country-header-gillian-min.jpg';
import westKelownaHero from './photos/2024_active_transportation_construction_hintringer_63.jpg';
import lakeCountryHero from './photos/lake-country-header-gillian-min.jpg';
import summerlandHero from './photos/summerland.jpg';
import oliverHero from './photos/millwright-quesnel-2-2024.tmb-1000px.jpg';
import kamloopsHero from './photos/26716-PowerPoint-2400px.webp';

const cityHeroAssets: Record<string, string> = {
  kelowna: kelownaHero,
  vernon: vernonHero,
  penticton: pentictonHero,
  'west-kelowna': westKelownaHero,
  'lake-country': lakeCountryHero,
  summerland: summerlandHero,
  oliver: oliverHero,
  kamloops: kamloopsHero,
};

export function getCityHeroImage(cityId?: string | null) {
  if (!cityId) {
    return undefined;
  }

  return cityHeroAssets[cityId];
}

export function getCityHeroFallbackImage(cityId?: string | null) {
  if (!cityId) {
    return undefined;
  }

  return cityHeroAssets[cityId];
}
