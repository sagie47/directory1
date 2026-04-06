export const SITE_NAME = 'Okanagan Trades';
export const DEFAULT_SEO_TITLE = 'Okanagan Trades | Verified Contractors Across the Okanagan';
export const DEFAULT_SEO_DESCRIPTION = 'Find verified contractors, trades, and service professionals across the Okanagan Valley by region, trade, and business.';
export const DEFAULT_SITE_URL = 'https://okanagantradesdirectory.com';
export const DEFAULT_OG_IMAGE = '/og-default.svg';
export const SITE_EMAIL = 'info@okanagantradesdirectory.com';
export const DEFAULT_SEO_KEYWORDS = [
  'okanagan trades directory',
  'okanagan contractors',
  'kelowna contractors',
  'west kelowna contractors',
  'vernon contractors',
  'penticton contractors',
  'verified trades directory',
  'local trades businesses',
];

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

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
      };

      if (item.path) {
        listItem.item = toAbsoluteUrl(item.path);
      }

      return listItem;
    }),
  };
}

export function buildItemListJsonLd(
  items: Array<{ name: string; path: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: toAbsoluteUrl(item.path),
      name: item.name,
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: toAbsoluteUrl(DEFAULT_OG_IMAGE),
    email: SITE_EMAIL,
    areaServed: 'Okanagan Valley, British Columbia, Canada',
  };
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getSiteUrl(),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${getSiteUrl()}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
