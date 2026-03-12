import kelownaHero from './photos/kelowna.jpg';
import vernonHero from './photos/vernon.jpg';
import pentictonHero from './photos/Penticton_Okanagan_Beach_Lakeshore.jpg';
import westKelownaHero from './photos/westkelowna.jpg';
import lakeCountryHero from './photos/lake-country-header-gillian-min.jpg';
import summerlandHero from './photos/summerland.jpg';
import oliverHero from './photos/Oliver_-_panoramio.jpg';
import kamloopsHero from './photos/26716-PowerPoint-2400px.webp';
import { preferSupabaseImage } from './supabase-images';

const cityHeroAssets: Record<string, { fallback: string; storagePath: string }> = {
  kelowna: { fallback: kelownaHero, storagePath: 'kelowna.jpg' },
  vernon: { fallback: vernonHero, storagePath: 'vernon.jpg' },
  penticton: { fallback: pentictonHero, storagePath: 'Penticton_Okanagan_Beach_Lakeshore.jpg' },
  'west-kelowna': { fallback: westKelownaHero, storagePath: 'westkelowna.jpg' },
  'lake-country': { fallback: lakeCountryHero, storagePath: 'lake-country-header-gillian-min.jpg' },
  summerland: { fallback: summerlandHero, storagePath: 'summerland.jpg' },
  oliver: { fallback: oliverHero, storagePath: 'Oliver_-_panoramio.jpg' },
  kamloops: { fallback: kamloopsHero, storagePath: '26716-PowerPoint-2400px.webp' },
};

export function getCityHeroImage(cityId?: string | null) {
  if (!cityId) {
    return undefined;
  }

  const asset = cityHeroAssets[cityId];
  return asset ? preferSupabaseImage(asset.storagePath, asset.fallback) : undefined;
}

export function getCityHeroFallbackImage(cityId?: string | null) {
  if (!cityId) {
    return undefined;
  }

  return cityHeroAssets[cityId]?.fallback;
}
