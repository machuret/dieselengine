import site from '../../site.config.json' with { type: 'json' };
import { indexablePages, sectionOf } from '../lib/content.js';

// Pillars and hubs deserve a higher crawl priority than deep leaf pages.
const PRIORITY = {
  pillar: '1.0',
  'city-hub': '0.9',
  'service-national': '0.9',
  'brand-hub': '0.8',
  symptom: '0.8',
  'engine-model': '0.8',
  'cost-service': '0.7',
  decision: '0.7',
  'city-service': '0.6',
  'brand-symptom': '0.6',
  'brand-city': '0.5',
  'cost-city': '0.5',
};

export function getStaticPaths() {
  return site.sections.map((s) => ({ params: { section: s.id } }));
}

export function GET({ params }) {
  const pages = indexablePages.filter((p) => sectionOf(p.url) === params.section);
  const urls = pages.map((p) => {
    const loc = `${site.domain}${p.url}`;
    const lastmod = p.updated ? `\n    <lastmod>${p.updated}</lastmod>` : '';
    return `  <url>
    <loc>${loc}</loc>${lastmod}
    <priority>${PRIORITY[p.pageType] ?? '0.5'}</priority>
  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
