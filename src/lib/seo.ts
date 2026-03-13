export const SITE_NAME = 'Okanagan Trades';
export const DEFAULT_SEO_TITLE = 'Okanagan Trades | Verified Contractors Across the Okanagan';
export const DEFAULT_SEO_DESCRIPTION = 'Find verified contractors, trades, and service professionals across the Okanagan Valley by region, trade, and business.';
export const DEFAULT_SITE_URL = 'https://okanagantradesdirectory.com';

export function getSiteUrl() {
  const configuredSiteUrl = import.meta.env.VITE_SITE_URL;
  if (configuredSiteUrl) {
    return configuredSiteUrl.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  return DEFAULT_SITE_URL;
}

export function toAbsoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
