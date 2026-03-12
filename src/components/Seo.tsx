import { useEffect } from 'react';

import {
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SITE_NAME,
  toAbsoluteUrl,
} from '../lib/seo';

interface SeoProps {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: 'website' | 'article';
  robots?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

function upsertLink(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement('link');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
}

export default function Seo({
  title = DEFAULT_SEO_TITLE,
  description = DEFAULT_SEO_DESCRIPTION,
  path = '/',
  image,
  type = 'website',
  robots = 'index,follow',
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const absoluteUrl = toAbsoluteUrl(path);
    const socialImage = image ? toAbsoluteUrl(image) : undefined;
    const jsonLdScriptId = 'route-jsonld';

    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: 'description',
      content: description,
    });

    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: robots,
    });

    upsertMeta('meta[property="og:site_name"]', {
      property: 'og:site_name',
      content: SITE_NAME,
    });

    upsertMeta('meta[property="og:title"]', {
      property: 'og:title',
      content: title,
    });

    upsertMeta('meta[property="og:description"]', {
      property: 'og:description',
      content: description,
    });

    upsertMeta('meta[property="og:type"]', {
      property: 'og:type',
      content: type,
    });

    upsertMeta('meta[property="og:url"]', {
      property: 'og:url',
      content: absoluteUrl,
    });

    upsertMeta('meta[name="twitter:card"]', {
      name: 'twitter:card',
      content: socialImage ? 'summary_large_image' : 'summary',
    });

    upsertMeta('meta[name="twitter:title"]', {
      name: 'twitter:title',
      content: title,
    });

    upsertMeta('meta[name="twitter:description"]', {
      name: 'twitter:description',
      content: description,
    });

    if (socialImage) {
      upsertMeta('meta[property="og:image"]', {
        property: 'og:image',
        content: socialImage,
      });
      upsertMeta('meta[name="twitter:image"]', {
        name: 'twitter:image',
        content: socialImage,
      });
    } else {
      document.head.querySelector('meta[property="og:image"]')?.remove();
      document.head.querySelector('meta[name="twitter:image"]')?.remove();
    }

    upsertLink('link[rel="canonical"]', {
      rel: 'canonical',
      href: absoluteUrl,
    });

    const existingJsonLd = document.getElementById(jsonLdScriptId);
    if (existingJsonLd) {
      existingJsonLd.remove();
    }

    if (jsonLd) {
      const script = document.createElement('script');
      script.id = jsonLdScriptId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById(jsonLdScriptId);
      if (script) {
        script.remove();
      }
    };
  }, [description, image, jsonLd, path, robots, title, type]);

  return null;
}
