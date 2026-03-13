import fs from 'node:fs';
import path from 'node:path';

import { businesses, cities } from '../src/data';

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'http://okanagantradesdirectory.com').replace(/\/$/, '');

const ROOT_ROUTES = [
  '/',
  '/trades',
  '/regions',
  '/verified',
  '/search',
  '/for-business',
  '/claim',
  '/claim-business',
  '/never-miss-a-lead',
  '/book-demo',
  '/websites-for-trades',
  '/managed-growth',
  '/book-call',
  '/terms',
  '/privacy',
  '/contact',
];

function toUrl(pathname: string) {
  return `${SITE_URL}${pathname}`;
}

function xmlEscape(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function createUrlEntry(pathname: string) {
  return [
    '  <url>',
    `    <loc>${xmlEscape(toUrl(pathname))}</loc>`,
    '  </url>',
  ].join('\n');
}

function main() {
  const outputDir = path.resolve('public');
  fs.mkdirSync(outputDir, { recursive: true });

  const cityRoutes = cities.map((city) => `/${city.id}`);

  const categoryRoutes = new Set<string>();
  const businessRoutes = new Set<string>();

  for (const business of businesses) {
    categoryRoutes.add(`/${business.cityId}/${business.categoryId}`);
    businessRoutes.add(`/${business.cityId}/${business.categoryId}/${business.id}`);
  }

  const allRoutes = [
    ...ROOT_ROUTES,
    ...cityRoutes,
    ...Array.from(categoryRoutes).sort(),
    ...Array.from(businessRoutes).sort(),
  ];

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...allRoutes.map(createUrlEntry),
    '</urlset>',
    '',
  ].join('\n');

  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${toUrl('/sitemap.xml')}`,
    '',
  ].join('\n');

  fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemap, 'utf8');
  fs.writeFileSync(path.join(outputDir, 'robots.txt'), robots, 'utf8');

  console.log(`Generated sitemap for ${allRoutes.length} routes at ${path.join(outputDir, 'sitemap.xml')}`);
}

main();
